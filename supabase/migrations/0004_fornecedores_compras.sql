-- ============================================================
-- VENDEFLEX — FORNECEDORES E COMPRAS (Cap. 7.4/7.5, Cap. 11.4 do PRD)
--
-- avancar_status_compra() é a mesma máquina de estados de
-- lib/comprasStore.ts: pendente → parcial → recebido; ao chegar em
-- "recebido", gera entrada real de estoque (RF-COM-02) via
-- registrar_movimento_estoque() (0003), nunca update direto.
-- ============================================================

create table if not exists public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  nome text not null,
  contato text,
  condicoes_pagamento text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.compras (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  fornecedor_id uuid not null references public.fornecedores(id) on delete restrict,
  status text not null default 'pendente' check (status in ('pendente', 'parcial', 'recebido')),
  data_pedido date not null default current_date,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.compra_itens (
  id uuid primary key default gen_random_uuid(),
  compra_id uuid not null references public.compras(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete restrict,
  quantidade numeric(10,2) not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null check (preco_unitario >= 0)
);

create index if not exists compras_tenant_idx on public.compras (tenant_id, criado_em);
create index if not exists compra_itens_compra_idx on public.compra_itens (compra_id);

drop trigger if exists set_updated_at_fornecedores on public.fornecedores;
create trigger set_updated_at_fornecedores before update on public.fornecedores for each row execute function public.set_atualizado_em();
drop trigger if exists set_updated_at_compras on public.compras;
create trigger set_updated_at_compras before update on public.compras for each row execute function public.set_atualizado_em();

create or replace function public.avancar_status_compra(p_compra_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_compra record;
  v_novo_status text;
  v_item record;
begin
  select * into v_compra from public.compras where id = p_compra_id;
  if v_compra is null then
    raise exception 'Pedido de compra não encontrado.';
  end if;
  if not public.is_tenant_role_in(v_compra.tenant_id, array['dono', 'estoquista']) then
    raise exception 'Só dono ou estoquista podem avançar o status da compra.';
  end if;
  if v_compra.status = 'recebido' then
    return;
  end if;

  v_novo_status := case v_compra.status when 'pendente' then 'parcial' else 'recebido' end;
  update public.compras set status = v_novo_status where id = p_compra_id;

  if v_novo_status = 'recebido' then
    for v_item in select produto_id, quantidade from public.compra_itens where compra_id = p_compra_id loop
      perform public.registrar_movimento_estoque(
        v_item.produto_id, 'entrada', v_item.quantidade,
        'Recebimento — pedido de compra ' || p_compra_id::text
      );
    end loop;
  end if;
end;
$$;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.fornecedores enable row level security;
alter table public.compras enable row level security;
alter table public.compra_itens enable row level security;

create policy fornecedores_select_dono_estoquista on public.fornecedores
  for select using (public.is_tenant_role_in(tenant_id, array['dono','estoquista']));
create policy fornecedores_escrever_dono_estoquista on public.fornecedores
  for all using (public.is_tenant_role_in(tenant_id, array['dono','estoquista']))
  with check (public.is_tenant_role_in(tenant_id, array['dono','estoquista']));

create policy compras_select_dono_estoquista on public.compras
  for select using (public.is_tenant_role_in(tenant_id, array['dono','estoquista']));
create policy compras_escrever_dono_estoquista on public.compras
  for all using (public.is_tenant_role_in(tenant_id, array['dono','estoquista']))
  with check (public.is_tenant_role_in(tenant_id, array['dono','estoquista']));

-- compra_itens não tem tenant_id direto — autoriza via join até compras,
-- mesmo padrão já usado em order_items no MenuFlex.
create policy compra_itens_via_compra on public.compra_itens
  for all using (
    exists (
      select 1 from public.compras c
      where c.id = compra_id and public.is_tenant_role_in(c.tenant_id, array['dono','estoquista'])
    )
  )
  with check (
    exists (
      select 1 from public.compras c
      where c.id = compra_id and public.is_tenant_role_in(c.tenant_id, array['dono','estoquista'])
    )
  );
