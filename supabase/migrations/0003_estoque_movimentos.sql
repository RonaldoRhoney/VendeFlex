-- ============================================================
-- VENDEFLEX — ESTOQUE: MOVIMENTOS (Cap. 7.6, Cap. 11.3/11.11 do PRD)
--
-- registrar_movimento_estoque() é o ÚNICO ponto de entrada pra mudar
-- produtos.estoque_atual — nunca fazer update direto na coluna em outra
-- migration/RPC. Mesma lógica de lib/estoqueStore.ts: quantidade é sempre o
-- delta assinado (entrada positivo, saída/perda negativo, ajuste como veio),
-- nunca deixa o saldo ir abaixo de zero.
-- ============================================================

create table if not exists public.estoque_movimentos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete cascade,
  tipo text not null check (tipo in ('entrada', 'saida', 'perda', 'ajuste')),
  quantidade numeric(10,2) not null,
  motivo text,
  criado_por uuid references auth.users(id),
  criado_em timestamptz not null default now()
);

create index if not exists estoque_movimentos_tenant_criado_idx on public.estoque_movimentos (tenant_id, criado_em);

create or replace function public.registrar_movimento_estoque(
  p_produto_id uuid,
  p_tipo text,
  p_quantidade numeric,
  p_motivo text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_estoque_atual numeric(10,2);
  v_delta numeric(10,2);
  v_novo_estoque numeric(10,2);
begin
  select tenant_id, estoque_atual into v_tenant_id, v_estoque_atual
  from public.produtos where id = p_produto_id;

  if v_tenant_id is null then
    raise exception 'Produto não encontrado.';
  end if;

  v_delta := case
    when p_tipo = 'entrada' then abs(p_quantidade)
    when p_tipo in ('saida', 'perda') then -abs(p_quantidade)
    else p_quantidade -- ajuste: já vem com o sinal desejado
  end;

  v_novo_estoque := greatest(v_estoque_atual + v_delta, 0);

  update public.produtos set estoque_atual = v_novo_estoque where id = p_produto_id;

  insert into public.estoque_movimentos (tenant_id, produto_id, tipo, quantidade, motivo, criado_por)
  values (v_tenant_id, p_produto_id, p_tipo, v_delta, p_motivo, auth.uid());
end;
$$;

-- RPC-gated privileged mutation (mesmo padrão de alterar_disponibilidade_produto
-- no MenuFlex): ajuste manual só dono/estoquista (Cap. 15.1). O decremento
-- automático de venda e a entrada automática de compra chamam
-- registrar_movimento_estoque() diretamente (dentro de outra função
-- security definer já autorizada), nunca passam por aqui.
create or replace function public.ajustar_estoque_manual(
  p_produto_id uuid,
  p_quantidade numeric,
  p_motivo text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  select tenant_id into v_tenant_id from public.produtos where id = p_produto_id;
  if v_tenant_id is null then
    raise exception 'Produto não encontrado.';
  end if;
  if not public.is_tenant_role_in(v_tenant_id, array['dono', 'estoquista']) then
    raise exception 'Só dono ou estoquista podem ajustar estoque manualmente.';
  end if;

  perform public.registrar_movimento_estoque(p_produto_id, 'ajuste', p_quantidade, p_motivo);
end;
$$;

-- registrar_movimento_estoque() é interna por design (chamada só de dentro
-- de outra função security definer já autorizada: ajustar_estoque_manual,
-- avancar_status_compra, registrar_venda, cancelar_venda). Sem este revoke,
-- o Postgres concede EXECUTE a PUBLIC por padrão e o PostgREST expõe toda
-- função do schema public como RPC — qualquer usuário autenticado poderia
-- chamar a função direto e zerar o estoque de outro tenant (achado crítico
-- da auditoria de segurança). Funções security definer continuam podendo
-- chamá-la entre si mesmo sem grant de execute pro role do caller.
revoke execute on function public.registrar_movimento_estoque(uuid, text, numeric, text) from public, anon, authenticated;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.estoque_movimentos enable row level security;

create policy estoque_movimentos_select_sem_vendedor on public.estoque_movimentos
  for select using (public.is_tenant_role_in(tenant_id, array['dono','financeiro','estoquista']));

-- Sem policy de insert/update/delete direta — só as funções security
-- definer acima escrevem aqui (mesmo padrão de disponibilidade_historico
-- no MenuFlex: histórico não é editável por ninguém via API crua).
