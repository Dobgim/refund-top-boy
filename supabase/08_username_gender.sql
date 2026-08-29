-- ============================================================================
-- Username and gender on the profile — run after 07_identity_verification.sql
--
-- Collected on the second step of registration. Username is unique, compared
-- case-insensitively, so "Alex" and "alex" cannot both exist.
-- ============================================================================

do $$ begin
  create type public.gender_identity as enum (
    'female', 'male', 'non_binary', 'prefer_not_to_say'
  );
exception when duplicate_object then null; end $$;

alter table public.profiles
  add column if not exists username text,
  add column if not exists gender   public.gender_identity;

-- Case-insensitive uniqueness. Existing rows have NULL, which a unique index
-- permits any number of.
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format
  check (
    username is null
    or (username ~ '^[a-zA-Z][a-zA-Z0-9_]{2,19}$')
  );

-- Carry the two new fields through from sign-up metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profiles (id, email, full_name, country, username, gender)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'country', ''),
    nullif(new.raw_user_meta_data ->> 'username', ''),
    nullif(new.raw_user_meta_data ->> 'gender', '')::public.gender_identity
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

-- Lets the sign-up form check a username before submitting, without exposing
-- the profiles table to anonymous readers.
create or replace function public.username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(trim(candidate))
  );
$fn$;

revoke execute on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
