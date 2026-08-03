-- ============================================================
-- VENDEFLEX — AUDITORIA (Cap. 11.8/11.11, Cap. 15.4 do PRD)
--
-- Sem IP bruto (regra permanente da família RhoneyInc — mesmo motivo já
-- documentado em track.js do MenuFlex). Imutável: nem o "dono" do tenant
-- pode editar/apagar uma linha de auditoria (Cap. 15.4 do PRD, explícito).
-- ============================================================

create table if not exists public.auditoria_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  usuario_id uuid references auth.users(id),
  acao text not null,
  tabela_afetada text not null,
  registro_id uuid not null,
  dados_antes jsonb,
  dados_depois jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists auditoria_logs_tenant_criado_idx on public.auditoria_logs (tenant_id, criado_em);

-- Trigger genérica (Cap. 11.11) — registra qualquer UPDATE/DELETE nas
-- tabelas sensíveis abaixo. security definer pra poder escrever em
-- auditoria_logs mesmo sem policy de insert liberada pro usuário comum.
create or replace function public.trg_auditoria_generica()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  v_tenant_id := coalesce(new.tenant_id, old.tenant_id);
  insert into public.auditoria_logs (tenant_id, usuario_id, acao, tabela_afetada, registro_id, dados_antes, dados_depois)
  values (
    v_tenant_id,
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    coalesce(new.id, old.id),
    case when tg_op in ('update', 'delete') then to_jsonb(old) else null end,
    case when tg_op = 'update' then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_auditoria_produtos on public.produtos;
create trigger trg_auditoria_produtos
  after update or delete on public.produtos
  for each row execute function public.trg_auditoria_generica();

drop trigger if exists trg_auditoria_estoque_movimentos on public.estoque_movimentos;
create trigger trg_auditoria_estoque_movimentos
  after update or delete on public.estoque_movimentos
  for each row execute function public.trg_auditoria_generica();

drop trigger if exists trg_auditoria_vendas on public.vendas;
create trigger trg_auditoria_vendas
  after update or delete on public.vendas
  for each row execute function public.trg_auditoria_generica();

drop trigger if exists trg_auditoria_compras on public.compras;
create trigger trg_auditoria_compras
  after update or delete on public.compras
  for each row execute function public.trg_auditoria_generica();

-- ------------------------------------------------------------
-- RLS — só leitura (dono do tenant ou admin de plataforma), nunca escrita
-- direta: só a trigger (security definer) grava aqui.
-- ------------------------------------------------------------
alter table public.auditoria_logs enable row level security;

create policy auditoria_logs_select_dono_admin on public.auditoria_logs
  for select using (public.is_tenant_owner(tenant_id) or public.is_platform_admin());
