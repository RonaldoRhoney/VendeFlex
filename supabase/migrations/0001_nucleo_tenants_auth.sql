-- ============================================================
-- VENDEFLEX — NÚCLEO: TENANTS, USUÁRIOS, AUTENTICAÇÃO (Cap. 11.2 do PRD)
--
-- Mesmo padrão já validado em produção no MenuFlex (is_business_admin) e
-- no RhoneyInc hub (profiles/is_admin/handle_new_user) — só renomeado pro
-- vocabulário exigido pelo Cap. 11.16 do PRD (português, snake_case:
-- tenants/usuarios_tenant em vez de businesses/business_admins).
-- ============================================================

-- ------------------------------------------------------------
-- TABELAS
-- ------------------------------------------------------------

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  nome_negocio text not null,
  cnpj_cpf text,
  segmento text,
  plano text not null default 'free',
  criado_por uuid not null references auth.users(id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Papéis exatamente os 4 do Capítulo 15.7 do PRD — primeira vez que papel
-- passa a ter efeito real (o frontend hoje só mostra "Você = Dono" sem
-- checagem nenhuma, ver Configuracoes.tsx).
create table if not exists public.usuarios_tenant (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel text not null default 'dono' check (papel in ('dono', 'financeiro', 'estoquista', 'vendedor')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

-- Dados do negócio (Configuracoes.tsx) — chave/valor pra não precisar de
-- migration nova a cada campo de configuração adicionado depois.
create table if not exists public.configuracoes_tenant (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  chave text not null,
  valor jsonb,
  atualizado_em timestamptz not null default now(),
  primary key (tenant_id, chave)
);

-- Admin de plataforma (RhoneyInc interno) — usado pela "Central
-- Administrativa RhoneyInc" (Cap. 4.2, MVP interna), não pelo lojista.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_platform_admin boolean not null default false,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------
-- FUNÇÕES (security definer — mesmo padrão do is_admin()/is_business_admin()
-- já validado no RhoneyInc hub e no MenuFlex)
-- ------------------------------------------------------------

create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_platform_admin = true
  );
$$;

create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.usuarios_tenant
    where tenant_id = p_tenant_id and user_id = auth.uid() and ativo = true
  );
$$;

create or replace function public.is_tenant_owner(p_tenant_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.usuarios_tenant
    where tenant_id = p_tenant_id and user_id = auth.uid() and papel = 'dono' and ativo = true
  );
$$;

-- Base pras restrições por papel do Cap. 15.1/15.7 (ex: só dono+estoquista
-- ajustam estoque manualmente; só dono+financeiro cancelam venda).
create or replace function public.is_tenant_role_in(p_tenant_id uuid, p_papeis text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.usuarios_tenant
    where tenant_id = p_tenant_id and user_id = auth.uid() and ativo = true and papel = any(p_papeis)
  );
$$;

-- ------------------------------------------------------------
-- TRIGGERS
-- ------------------------------------------------------------

-- admin-padrao (skill da família): rhoneyinc@gmail.com sempre promovido a
-- admin automaticamente, não importa o método de login — mesmo padrão
-- literal do RhoneyInc hub (schema.sql, handle_new_user()).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, is_platform_admin)
  values (new.id, new.email, new.email = 'rhoneyinc@gmail.com')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ao criar um tenant, quem criou vira "dono" automaticamente — mesmo
-- padrão de handle_new_business() do MenuFlex.
create or replace function public.handle_new_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios_tenant (tenant_id, user_id, papel)
  values (new.id, new.criado_por, 'dono');
  return new;
end;
$$;

drop trigger if exists on_tenant_created on public.tenants;
create trigger on_tenant_created
  after insert on public.tenants
  for each row execute function public.handle_new_tenant();

-- Genérica, reaproveitada em toda tabela com atualizado_em daqui pra frente
-- (Cap. 11.1: "toda tabela possui criado_em e atualizado_em").
create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_tenants on public.tenants;
create trigger set_updated_at_tenants
  before update on public.tenants
  for each row execute function public.set_atualizado_em();

-- ------------------------------------------------------------
-- RLS — habilitado desde a criação em toda tabela (Cap. 15.1), nunca
-- adicionado depois.
-- ------------------------------------------------------------

alter table public.tenants enable row level security;
alter table public.usuarios_tenant enable row level security;
alter table public.configuracoes_tenant enable row level security;
alter table public.profiles enable row level security;

create policy tenants_select_membro on public.tenants
  for select using (public.is_tenant_member(id) or public.is_platform_admin());
create policy tenants_insert_proprio on public.tenants
  for insert with check (auth.uid() = criado_por);
create policy tenants_update_dono on public.tenants
  for update using (public.is_tenant_owner(id)) with check (public.is_tenant_owner(id));

create policy usuarios_tenant_select_membro on public.usuarios_tenant
  for select using (public.is_tenant_member(tenant_id) or public.is_platform_admin());
create policy usuarios_tenant_gerenciar_dono on public.usuarios_tenant
  for all using (public.is_tenant_owner(tenant_id)) with check (public.is_tenant_owner(tenant_id));

create policy configuracoes_tenant_select_membro on public.configuracoes_tenant
  for select using (public.is_tenant_member(tenant_id));
create policy configuracoes_tenant_gerenciar_dono on public.configuracoes_tenant
  for all using (public.is_tenant_owner(tenant_id)) with check (public.is_tenant_owner(tenant_id));

-- profiles: cada usuário só enxerga/edita o próprio; platform admin enxerga todos
-- (mesmo padrão do RhoneyInc hub — evita recursão de RLS via security definer).
create policy profiles_select_proprio on public.profiles
  for select using (auth.uid() = id or public.is_platform_admin());
create policy profiles_update_proprio on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- RLS não restringe coluna — sem isto, o usuário autenticado poderia fazer
-- PATCH profiles?id=eq.<próprio id> com {"is_platform_admin": true} e virar
-- admin de plataforma sozinho (achado crítico da auditoria de segurança).
-- Restrição em nível de GRANT: só a coluna email é editável pelo próprio
-- usuário; is_platform_admin só muda via trigger/console (service_role).
revoke update on public.profiles from authenticated;
grant update (email) on public.profiles to authenticated;

-- Mesmo raciocínio pra tenants: sem isto, o dono poderia fazer
-- PATCH tenants?id=eq.<meu tenant> com {"plano":"enterprise"} e liberar um
-- plano pago de graça. Só os campos de cadastro do negócio ficam editáveis
-- pelo dono; plano/criado_por/id só via service_role (billing futuro).
revoke update on public.tenants from authenticated;
grant update (nome_negocio, cnpj_cpf, segmento) on public.tenants to authenticated;
