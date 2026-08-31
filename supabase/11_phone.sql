-- ============================================================================
-- Phone number on the profile — run after 10_delete_user.sql
--
-- Collected on the second step of registration, stored in E.164 form
-- (+237670000000) so it is callable from anywhere without further guessing.
-- ============================================================================

alter table public.profiles
  add column if not exists phone text;

-- Loose on purpose: national number lengths vary from 7 to 15 digits and a
-- stricter pattern would reject valid numbers from countries not anticipated
-- here. The application normalises before it ever reaches this column.
alter table public.profiles drop constraint if exists profiles_phone_format;
alter table public.profiles
  add constraint profiles_phone_format
  check (phone is null or phone ~ '^\+[1-9][0-9]{6,17}$');

-- Carry it through from sign-up metadata alongside the other profile fields.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profiles (id, email, full_name, country, username, gender, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'country', ''),
    nullif(new.raw_user_meta_data ->> 'username', ''),
    nullif(new.raw_user_meta_data ->> 'gender', '')::public.gender_identity,
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;
