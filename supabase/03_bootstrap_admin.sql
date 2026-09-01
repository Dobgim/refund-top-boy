-- ============================================================================
-- Bootstrap the first administrator.
--
-- Normally you would create an admin with `npm run seed`, which calls the
-- Supabase Admin API. This file exists for the case where you only have SQL
-- access (the Management API or the dashboard SQL editor).
--
-- Edit the two values below, then run the whole file once.
--
-- NOTE: creating an auth user in raw SQL has two traps, both handled here:
--   1. GoTrue needs a matching row in auth.identities or password login fails.
--   2. GoTrue reads the *_token columns into non-nullable strings, so they must
--      be '' and not NULL, otherwise sign-in returns
--      "Database error querying schema".
-- ============================================================================

\set admin_email 'admin@getroyalrefund.com'
\set admin_password 'change-me-before-running'

-- 1. the auth user -----------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
       'authenticated', 'authenticated',
       :'admin_email',
       extensions.crypt(:'admin_password', extensions.gen_salt('bf')),
       now(), now(), now(),
       '{"provider":"email","providers":["email"]}'::jsonb,
       '{"full_name":"Case Administrator"}'::jsonb,
       false, false,
       '', '', '', '', '', '', '', ''
where not exists (select 1 from auth.users where email = :'admin_email');

-- 2. the identity GoTrue needs for password sign-in --------------------------
insert into auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
select gen_random_uuid(), u.id::text, u.id,
       jsonb_build_object('sub', u.id::text, 'email', u.email,
                          'email_verified', true, 'phone_verified', false),
       'email', now(), now(), now()
from auth.users u
where u.email = :'admin_email'
  and not exists (select 1 from auth.identities i where i.user_id = u.id);

-- 3. promote the mirrored profile -------------------------------------------
-- `handle_new_user` created the profile row; `guard_profile_privileges` allows
-- this because auth.uid() is null in a trusted server-side context.
update public.profiles
   set role = 'admin', account_status = 'active'
 where email = :'admin_email';

select email, role::text, account_status::text from public.profiles where email = :'admin_email';
