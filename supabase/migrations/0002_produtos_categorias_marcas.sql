-- ============================================================
-- VENDEFLEX — PRODUTOS, CATEGORIAS, MARCAS (Cap. 7.2/7.3, Cap. 11.3 do PRD)
--
-- estoque_atual/estoque_minimo ficam direto em produtos nesta fase (sem
-- tabela estoque_saldo/filiais separada — o frontend não tem conceito de
-- múltiplas filiais ainda, isso é V2 do Cap. 4.2). Mapeia 1:1 o que
-- lib/produtosStore.ts já faz em localStorage.
-- ============================================================

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  nome text not null,
  categoria_pai_id uuid references public.categorias(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.marcas (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  nome text not null,
  sku text not null,
  categoria_id uuid references public.categorias(id) on delete set null,
  marca_id uuid references public.marcas(id) on delete set null,
  codigo_barras text,
  preco_custo numeric(10,2) not null default 0 check (preco_custo >= 0),
  preco_venda numeric(10,2) not null default 0 check (preco_venda >= 0),
  estoque_atual numeric(10,2) not null default 0 check (estoque_atual >= 0),
  estoque_minimo numeric(10,2) not null default 0 check (estoque_minimo >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Cap. 11.10: índice único (tenant_id, sku) pra leitura rápida no PDV, e
-- índice composto (tenant_id, ativo) pras listagens filtradas.
create unique index if not exists produtos_tenant_sku_idx on public.produtos (tenant_id, sku);
create index if not exists produtos_tenant_ativo_idx on public.produtos (tenant_id, ativo);

drop trigger if exists set_updated_at_categorias on public.categorias;
create trigger set_updated_at_categorias before update on public.categorias for each row execute function public.set_atualizado_em();
drop trigger if exists set_updated_at_marcas on public.marcas;
create trigger set_updated_at_marcas before update on public.marcas for each row execute function public.set_atualizado_em();
drop trigger if exists set_updated_at_produtos on public.produtos;
create trigger set_updated_at_produtos before update on public.produtos for each row execute function public.set_atualizado_em();

-- ------------------------------------------------------------
-- View pro papel "vendedor" (Cap. 15.7: "sem acesso a custos de produto").
-- RLS é por linha, não por coluna — a coluna sensível (preco_custo) só fica
-- de fora desta view, que o PDV usa pra listar produtos à venda.
-- ------------------------------------------------------------
create or replace view public.vw_produtos_venda as
  select id, tenant_id, nome, sku, categoria_id, marca_id, codigo_barras, preco_venda, estoque_atual, ativo
  from public.produtos
  where public.is_tenant_member(tenant_id) and ativo = true;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table public.categorias enable row level security;
alter table public.marcas enable row level security;
alter table public.produtos enable row level security;

create policy categorias_select_membro on public.categorias
  for select using (public.is_tenant_member(tenant_id));
create policy categorias_escrever_dono_estoquista on public.categorias
  for all using (public.is_tenant_role_in(tenant_id, array['dono','estoquista']))
  with check (public.is_tenant_role_in(tenant_id, array['dono','estoquista']));

create policy marcas_select_membro on public.marcas
  for select using (public.is_tenant_member(tenant_id));
create policy marcas_escrever_dono_estoquista on public.marcas
  for all using (public.is_tenant_role_in(tenant_id, array['dono','estoquista']))
  with check (public.is_tenant_role_in(tenant_id, array['dono','estoquista']));

-- Select geral (com preco_custo) restrito a dono/financeiro/estoquista —
-- vendedor usa vw_produtos_venda, que não expõe custo. Escrita restrita a
-- dono/estoquista (RF-PRD-01/05).
create policy produtos_select_sem_vendedor on public.produtos
  for select using (public.is_tenant_role_in(tenant_id, array['dono','financeiro','estoquista']));

-- RF-PRD-05 (Cap. 7.2): "editar e inativar produto sem excluir histórico de
-- vendas associado" — o caminho é inativar (update ativo=false), não
-- apagar. Por isso só insert/update têm policy; sem policy de delete, o
-- Postgres nega DELETE por padrão pra authenticated (dono/estoquista
-- desativam o produto via update comum, coberto pela policy abaixo).
create policy produtos_inserir_dono_estoquista on public.produtos
  for insert with check (public.is_tenant_role_in(tenant_id, array['dono','estoquista']));
create policy produtos_atualizar_dono_estoquista on public.produtos
  for update using (public.is_tenant_role_in(tenant_id, array['dono','estoquista']))
  with check (public.is_tenant_role_in(tenant_id, array['dono','estoquista']));

-- View roda como owner (security definer implícito de view) mas agora tem
-- WHERE is_tenant_member(tenant_id) — cada membro só vê os produtos do
-- próprio tenant, nunca de outro negócio da plataforma.
grant select on public.vw_produtos_venda to authenticated;
