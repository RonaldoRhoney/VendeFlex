-- ============================================================
-- VENDEFLEX — VENDAS E CAIXA (Cap. 7.7/7.8, Cap. 11.5 do PRD)
--
-- registrar_venda() nunca confia no preço mandado pelo client — sempre lê
-- produtos.preco_venda no momento da venda (mesmo princípio de
-- mp-checkout.js no MenuFlex: valor sempre vem do servidor). Vendas nunca
-- são apagadas (status='cancelada'), mesma filosofia de
-- lib/vendasStore.ts — histórico sempre preservado.
-- ============================================================

create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  vendedor_id uuid not null references auth.users(id),
  status text not null default 'confirmada' check (status in ('confirmada', 'cancelada')),
  forma_pagamento text not null check (forma_pagamento in ('dinheiro', 'cartao', 'pix')),
  desconto numeric(10,2) not null default 0 check (desconto >= 0),
  total numeric(10,2) not null default 0 check (total >= 0),
  criado_em timestamptz not null default now()
);

create table if not exists public.venda_itens (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references public.vendas(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  quantidade numeric(10,2) not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null check (preco_unitario >= 0)
);

create index if not exists vendas_tenant_criado_idx on public.vendas (tenant_id, criado_em);
create index if not exists venda_itens_venda_idx on public.venda_itens (venda_id);

create table if not exists public.caixa_turnos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  operador_id uuid not null references auth.users(id),
  valor_abertura numeric(10,2) not null default 0,
  valor_fechamento numeric(10,2),
  status text not null default 'aberto' check (status in ('aberto', 'fechado')),
  aberto_em timestamptz not null default now(),
  fechado_em timestamptz
);

create table if not exists public.caixa_movimentos (
  id uuid primary key default gen_random_uuid(),
  turno_id uuid not null references public.caixa_turnos(id) on delete cascade,
  tipo text not null check (tipo in ('sangria', 'suprimento')),
  valor numeric(10,2) not null check (valor > 0),
  descricao text,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------
-- RPC: registrar_venda — RF-PDV-04/05, RF-EST-04 (decremento automático)
-- ------------------------------------------------------------
create or replace function public.registrar_venda(
  p_tenant_id uuid,
  p_itens jsonb, -- [{"produto_id": "...", "quantidade": 2}, ...]
  p_forma_pagamento text,
  p_desconto numeric default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_venda_id uuid;
  v_item jsonb;
  v_produto_id uuid;
  v_quantidade numeric;
  v_preco numeric(10,2);
  v_subtotal numeric(10,2) := 0;
  v_total numeric(10,2);
begin
  if not public.is_tenant_member(p_tenant_id) then
    raise exception 'Você não faz parte deste negócio.';
  end if;
  if p_itens is null or jsonb_array_length(p_itens) = 0 then
    raise exception 'Venda precisa ter ao menos um item.';
  end if;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_produto_id := (v_item->>'produto_id')::uuid;
    v_quantidade := (v_item->>'quantidade')::numeric;
    select preco_venda into v_preco from public.produtos
      where id = v_produto_id and tenant_id = p_tenant_id;
    if v_preco is null then
      raise exception 'Produto % não encontrado neste negócio.', v_produto_id;
    end if;
    v_subtotal := v_subtotal + v_preco * v_quantidade;
  end loop;

  v_total := greatest(v_subtotal - coalesce(p_desconto, 0), 0);

  insert into public.vendas (tenant_id, vendedor_id, forma_pagamento, desconto, total)
  values (p_tenant_id, auth.uid(), p_forma_pagamento, coalesce(p_desconto, 0), v_total)
  returning id into v_venda_id;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_produto_id := (v_item->>'produto_id')::uuid;
    v_quantidade := (v_item->>'quantidade')::numeric;
    select preco_venda into v_preco from public.produtos where id = v_produto_id;

    insert into public.venda_itens (venda_id, produto_id, quantidade, preco_unitario)
    values (v_venda_id, v_produto_id, v_quantidade, v_preco);

    perform public.registrar_movimento_estoque(v_produto_id, 'saida', v_quantidade, 'Venda PDV');
  end loop;

  return v_venda_id;
end;
$$;

-- ------------------------------------------------------------
-- RPC: cancelar_venda — RF-PDV-06, Cap. 15.1 ("apenas dono e financeiro
-- podem excluir vendas") — nunca deleta, só marca cancelada + estorna.
-- ------------------------------------------------------------
create or replace function public.cancelar_venda(p_venda_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_venda record;
  v_item record;
begin
  select * into v_venda from public.vendas where id = p_venda_id;
  if v_venda is null then
    raise exception 'Venda não encontrada.';
  end if;
  if not public.is_tenant_role_in(v_venda.tenant_id, array['dono', 'financeiro']) then
    raise exception 'Só dono ou financeiro podem cancelar uma venda.';
  end if;
  if v_venda.status = 'cancelada' then
    return;
  end if;

  update public.vendas set status = 'cancelada' where id = p_venda_id;

  for v_item in select produto_id, quantidade from public.venda_itens where venda_id = p_venda_id loop
    perform public.registrar_movimento_estoque(v_item.produto_id, 'entrada', v_item.quantidade, 'Estorno — venda cancelada');
  end loop;
end;
$$;

-- ------------------------------------------------------------
-- RPC: fechar_turno_caixa — RF-CAI-03/04, conciliação real (vendas em
-- dinheiro do turno vs. valor informado pelo operador).
-- ------------------------------------------------------------
create or replace function public.fechar_turno_caixa(p_turno_id uuid, p_valor_informado numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_turno record;
  v_total_dinheiro numeric(10,2);
  v_total_sangrias numeric(10,2);
  v_total_suprimentos numeric(10,2);
  v_saldo_estimado numeric(10,2);
  v_diferenca numeric(10,2);
begin
  select * into v_turno from public.caixa_turnos where id = p_turno_id;
  if v_turno is null then
    raise exception 'Turno de caixa não encontrado.';
  end if;
  if not public.is_tenant_member(v_turno.tenant_id) then
    raise exception 'Você não faz parte deste negócio.';
  end if;
  if v_turno.status = 'fechado' then
    raise exception 'Turno já está fechado.';
  end if;

  select coalesce(sum(total), 0) into v_total_dinheiro
    from public.vendas
    where tenant_id = v_turno.tenant_id and forma_pagamento = 'dinheiro'
      and status = 'confirmada' and criado_em >= v_turno.aberto_em;

  select coalesce(sum(valor) filter (where tipo = 'sangria'), 0),
         coalesce(sum(valor) filter (where tipo = 'suprimento'), 0)
    into v_total_sangrias, v_total_suprimentos
    from public.caixa_movimentos where turno_id = p_turno_id;

  v_saldo_estimado := v_turno.valor_abertura + v_total_suprimentos - v_total_sangrias + v_total_dinheiro;
  v_diferenca := p_valor_informado - v_saldo_estimado;

  update public.caixa_turnos
    set status = 'fechado', valor_fechamento = p_valor_informado, fechado_em = now()
    where id = p_turno_id;

  return v_diferenca;
end;
$$;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.vendas enable row level security;
alter table public.venda_itens enable row level security;
alter table public.caixa_turnos enable row level security;
alter table public.caixa_movimentos enable row level security;

-- Dono/financeiro veem todas as vendas do tenant; vendedor só as próprias
-- (Cap. 15.7). Sem policy de insert/update/delete direta — só via
-- registrar_venda()/cancelar_venda() (RPC-gated, mesmo padrão de
-- alterar_disponibilidade_produto no MenuFlex).
create policy vendas_select_regras on public.vendas
  for select using (
    public.is_tenant_role_in(tenant_id, array['dono','financeiro'])
    or (public.is_tenant_member(tenant_id) and vendedor_id = auth.uid())
  );

create policy venda_itens_select_via_venda on public.venda_itens
  for select using (
    exists (
      select 1 from public.vendas v
      where v.id = venda_id and (
        public.is_tenant_role_in(v.tenant_id, array['dono','financeiro'])
        or (public.is_tenant_member(v.tenant_id) and v.vendedor_id = auth.uid())
      )
    )
  );

create policy caixa_turnos_select_membro on public.caixa_turnos
  for select using (public.is_tenant_member(tenant_id));
create policy caixa_turnos_abrir_membro on public.caixa_turnos
  for insert with check (public.is_tenant_member(tenant_id) and operador_id = auth.uid());

create policy caixa_movimentos_select_membro on public.caixa_movimentos
  for select using (
    exists (select 1 from public.caixa_turnos t where t.id = turno_id and public.is_tenant_member(t.tenant_id))
  );
create policy caixa_movimentos_inserir_membro on public.caixa_movimentos
  for insert with check (
    exists (select 1 from public.caixa_turnos t where t.id = turno_id and public.is_tenant_member(t.tenant_id))
  );
