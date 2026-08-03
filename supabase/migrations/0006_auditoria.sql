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
  v_registro_id uuid;
begin
  -- Em trigger de linha, NEW não existe em DELETE (record "new" is not
  -- assigned yet) — acessar new.tenant_id ali derrubava todo DELETE em
  -- produtos/vendas/compras com erro (achado da auditoria de segurança).
  -- Ramifica por tg_op em vez de usar coalesce(new, old).
  if tg_op = 'DELETE' then
    v_tenant_id := old.tenant_id;
    v_registro_id := old.id;
  else
    v_tenant_id := new.tenant_id;
    v_registro_id := new.id;
  end if;

  insert into public.auditoria_logs (tenant_id, usuario_id, acao, tabela_afetada, registro_id, dados_antes, dados_depois)
  values (
    v_tenant_id,
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    v_registro_id,
    -- tg_op vem sempre em maiúsculas ('UPDATE'/'DELETE') — comparar contra
    -- 'update'/'delete' minúsculos nunca batia, então dados_antes nunca
    -- era gravado em nenhuma auditoria até agora (bug adicional encontrado
    -- ao corrigir o crash de DELETE acima).
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op = 'UPDATE' then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_auditoria_produtos on public.produtos;
create trigger trg_auditoria_produtos
  after update or delete on public.produtos
  for each row execute function public.trg_auditoria_generica();

-- estoque_movimentos não tem (e não deve ter) policy de update/delete — é
-- um log só-inserção escrito exclusivamente por registrar_movimento_estoque()
-- (0003). Uma trigger de auditoria "after update or delete" nela nunca
-- dispararia na prática e sugeria uma proteção que não existe de verdade
-- (achado da auditoria de qualidade de código) — removida por não ter efeito.
drop trigger if exists trg_auditoria_estoque_movimentos on public.estoque_movimentos;

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
