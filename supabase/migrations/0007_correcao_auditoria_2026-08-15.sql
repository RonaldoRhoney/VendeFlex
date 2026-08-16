-- VendeFlex — correção de achados da auditoria de segurança 2026-08-15
--
-- MÉDIO: handle_new_user() promovia rhoneyinc@gmail.com a is_platform_admin
-- já no INSERT em auth.users, antes de qualquer confirmação de e-mail. A
-- única coisa que impedia um atacante de criar conta com esse e-mail e
-- herdar o privilégio era a confirmação de e-mail estar ligada no projeto
-- — um toggle de dashboard, não versionado, não testado. Corrigido pra só
-- promover se o e-mail já chegou confirmado no momento do insert (sempre
-- verdadeiro pra login social Google, que é o método real usado pra essa
-- conta — ver lib/auth.ts). Cadastro por e-mail/senha não confirmado nunca
-- promove automaticamente; se um dia for necessário, promoção manual via
-- SQL Editor, mesmo fallback já usado nos produtos irmãos.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, is_platform_admin)
  values (
    new.id,
    new.email,
    new.email = 'rhoneyinc@gmail.com' and new.email_confirmed_at is not null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
