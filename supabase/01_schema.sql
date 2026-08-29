-- ============================================================================
-- RoyalRefund — schema
-- Run this first in the Supabase SQL editor, then 02_policies.sql.
-- Safe to re-run: every object is created with IF NOT EXISTS or OR REPLACE.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- enum types

do $$ begin
  create type public.user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_status as enum ('active', 'pending', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.claim_status as enum (
    'submitted', 'under_review', 'documents_required', 'approved', 'resolved', 'closed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.claim_type as enum (
    'card_dispute', 'duplicate_charge', 'service_not_rendered',
    'unauthorised_transaction', 'subscription_refund', 'merchant_refund', 'other'
  );
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------------ profiles

create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text not null default '',
  email          text not null,
  country        text,
  role           public.user_role not null default 'user',
  account_status public.account_status not null default 'active',
  avatar_url     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- This project already contained a `profiles` table before RoyalRefund was
-- installed, so bring it up to the shape the application expects. Additive
-- only: existing columns and rows are left exactly as they are.
alter table public.profiles add column if not exists full_name      text not null default '';
alter table public.profiles add column if not exists email          text;
alter table public.profiles add column if not exists country        text;
alter table public.profiles add column if not exists role           public.user_role not null default 'user';
alter table public.profiles add column if not exists account_status public.account_status not null default 'active';
alter table public.profiles add column if not exists avatar_url     text;
alter table public.profiles add column if not exists created_at     timestamptz not null default now();
alter table public.profiles add column if not exists updated_at     timestamptz not null default now();

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- -------------------------------------------------------------------- claims

create sequence if not exists public.claim_reference_seq;

create or replace function public.next_claim_reference()
returns text
language sql
volatile
as $$
  select 'RR-' || to_char(now(), 'YYYY') || '-'
         || lpad(nextval('public.claim_reference_seq')::text, 4, '0');
$$;

create table if not exists public.claims (
  id                    uuid primary key default gen_random_uuid(),
  reference             text not null unique default public.next_claim_reference(),
  user_id               uuid not null references public.profiles (id) on delete cascade,
  claim_type            public.claim_type not null,
  status                public.claim_status not null default 'submitted',
  amount                numeric(14, 2) not null check (amount > 0),
  currency              char(3) not null default 'USD',
  transaction_date      date,
  transaction_type      text,
  transaction_reference text,
  reason                text not null check (char_length(reason) between 4 and 140),
  description           text not null check (char_length(description) between 40 and 4000),
  supporting_details    text,
  contact_name          text not null,
  contact_email         text not null,
  country               text,
  last_update           timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists claims_user_id_idx     on public.claims (user_id);
create index if not exists claims_status_idx      on public.claims (status);
create index if not exists claims_created_at_idx  on public.claims (created_at desc);
create index if not exists claims_reference_idx   on public.claims (reference);

-- ------------------------------------------------------- claim status history

create table if not exists public.claim_status_history (
  id         uuid primary key default gen_random_uuid(),
  claim_id   uuid not null references public.claims (id) on delete cascade,
  status     public.claim_status not null,
  note       text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists claim_status_history_claim_idx
  on public.claim_status_history (claim_id, created_at);

-- ----------------------------------------------------------- claim documents

create table if not exists public.claim_documents (
  id           uuid primary key default gen_random_uuid(),
  claim_id     uuid not null references public.claims (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  file_name    text not null,
  storage_path text not null unique,
  mime_type    text not null,
  size_bytes   bigint not null check (size_bytes > 0 and size_bytes <= 8388608),
  created_at   timestamptz not null default now()
);

create index if not exists claim_documents_claim_idx on public.claim_documents (claim_id);
create index if not exists claim_documents_user_idx  on public.claim_documents (user_id);

-- ------------------------------------------------------------ claim messages

create table if not exists public.claim_messages (
  id          uuid primary key default gen_random_uuid(),
  claim_id    uuid not null references public.claims (id) on delete cascade,
  sender_id   uuid references public.profiles (id) on delete set null,
  sender_role public.user_role not null default 'user',
  body        text not null check (char_length(body) between 2 and 2000),
  created_at  timestamptz not null default now()
);

create index if not exists claim_messages_claim_idx on public.claim_messages (claim_id, created_at);

-- ------------------------------------------------------------- notifications

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  title      text not null,
  body       text,
  read       boolean not null default false,
  claim_id   uuid references public.claims (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Same treatment for a pre-existing `notifications` table.
alter table public.notifications add column if not exists user_id    uuid;
alter table public.notifications add column if not exists title      text;
alter table public.notifications add column if not exists body       text;
alter table public.notifications add column if not exists read       boolean not null default false;
alter table public.notifications add column if not exists claim_id   uuid references public.claims (id) on delete cascade;
alter table public.notifications add column if not exists created_at timestamptz not null default now();

create index if not exists notifications_user_idx on public.notifications (user_id, read, created_at desc);

-- ------------------------------------------------------ newsletter subscribers

-- Addresses are lowercased by the application before insert; the unique index
-- is built on lower(email) so a differently-cased duplicate still collides.
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

create unique index if not exists newsletter_subscribers_email_lower_idx
  on public.newsletter_subscribers (lower(email));

-- ------------------------------------------------------------ admin activity

create table if not exists public.admin_activity (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  target_type text,
  target_id   uuid,
  detail      jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists admin_activity_created_idx on public.admin_activity (created_at desc);

-- ============================================================================
-- Functions and triggers
-- ============================================================================

-- Keeps updated_at honest without trusting the client.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists claims_touch on public.claims;
create trigger claims_touch before update on public.claims
  for each row execute function public.touch_updated_at();

-- Mirrors a new auth user into `profiles`, taking the name and country from the
-- sign-up metadata. The role is always 'user'; promotion is a separate action.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'country', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- A non-admin can edit their own profile but never their own role or status.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role public.user_role;
begin
  select role into caller_role from public.profiles where id = auth.uid();

  -- Only clamp when a real end user is driving the update. When auth.uid() is
  -- null the caller is a trusted server-side context (service role, migration,
  -- seed script) -- an anonymous request can never reach here, because the RLS
  -- update policy already requires `id = auth.uid() or is_admin()`.
  if auth.uid() is not null and coalesce(caller_role, 'user') <> 'admin' then
    new.role := old.role;
    new.account_status := old.account_status;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_privileges on public.profiles;
create trigger profiles_guard_privileges before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- Opens the case history with the submitted event.
create or replace function public.open_claim_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.claim_status_history (claim_id, status, note, created_by)
  values (new.id, new.status, 'Case received and queued for triage.', new.user_id);
  return new;
end;
$$;

drop trigger if exists claims_open_history on public.claims;
create trigger claims_open_history after insert on public.claims
  for each row execute function public.open_claim_history();

-- Every history entry bumps the case and notifies its owner.
create or replace function public.on_status_history_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  claim_ref text;
begin
  select user_id, reference into owner_id, claim_ref
  from public.claims where id = new.claim_id;

  update public.claims
     set status = new.status, last_update = new.created_at
   where id = new.claim_id and status is distinct from new.status;

  insert into public.notifications (user_id, title, body, claim_id)
  values (
    owner_id,
    'Case ' || claim_ref || ' is now ' || replace(new.status::text, '_', ' '),
    new.note,
    new.claim_id
  );

  return new;
end;
$$;

drop trigger if exists claim_status_history_fanout on public.claim_status_history;
create trigger claim_status_history_fanout after insert on public.claim_status_history
  for each row execute function public.on_status_history_insert();

-- A new message also bumps the case so the dashboard ordering stays useful.
create or replace function public.touch_claim_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.claims set last_update = new.created_at where id = new.claim_id;
  return new;
end;
$$;

drop trigger if exists claim_messages_touch_claim on public.claim_messages;
create trigger claim_messages_touch_claim after insert on public.claim_messages
  for each row execute function public.touch_claim_on_message();

-- ============================================================================
-- Public tracking views
-- Deliberately narrow: reference, type, stage and dates only. No amounts, no
-- contact details, no documents. These run with the owner's rights so the
-- anonymous tracker can read them without opening up `claims` itself.
-- ============================================================================

create or replace view public.claim_public_status
with (security_invoker = false) as
  select reference, status, claim_type, created_at, last_update
  from public.claims;

create or replace view public.claim_public_history
with (security_invoker = false) as
  select c.reference, h.status, h.note, h.created_at
  from public.claim_status_history h
  join public.claims c on c.id = h.claim_id;

grant select on public.claim_public_status to anon, authenticated;
grant select on public.claim_public_history to anon, authenticated;
