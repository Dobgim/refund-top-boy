-- ============================================================================
-- Identity verification — run after 06_owner_edit.sql
--
-- A customer must have an approved identity document before they can file a
-- claim. One verification row per account; resubmitting after a rejection
-- replaces the documents and returns the row to 'pending'.
--
-- Documents live in a private bucket keyed by user id, exactly like case
-- evidence, and are only ever served through short-lived signed URLs.
-- ============================================================================

do $$ begin
  create type public.id_document_type as enum (
    'national_id', 'passport', 'drivers_licence', 'residence_permit'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.verification_status as enum (
    'unverified', 'pending', 'verified', 'rejected'
  );
exception when duplicate_object then null; end $$;

-- Denormalised onto the profile so the claim gate is a single cheap read.
-- Kept in step with identity_verifications by a trigger, never by the client.
alter table public.profiles
  add column if not exists verification_status public.verification_status
    not null default 'unverified';

create table if not exists public.identity_verifications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references public.profiles (id) on delete cascade,
  document_type    public.id_document_type not null,
  full_name        text not null,
  document_number  text,
  front_path       text not null,
  -- Null for a passport, where the photo page carries everything.
  back_path        text,
  status           public.verification_status not null default 'pending',
  rejection_reason text,
  reviewed_by      uuid references public.profiles (id) on delete set null,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists identity_verifications_status_idx
  on public.identity_verifications (status, created_at desc);

drop trigger if exists identity_verifications_touch on public.identity_verifications;
create trigger identity_verifications_touch before update on public.identity_verifications
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- sync + guard

create or replace function public.sync_verification_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  update public.profiles set verification_status = new.status where id = new.user_id;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.notifications (user_id, title, body)
    values (
      new.user_id,
      case new.status
        when 'verified' then 'Your identity has been verified'
        when 'rejected' then 'Your identity document needs attention'
        else 'Your identity document is being reviewed'
      end,
      case new.status
        when 'verified' then 'You can now submit a refund claim.'
        when 'rejected' then coalesce(new.rejection_reason, 'Please upload a clearer document.')
        else 'We will let you know as soon as the review is complete.'
      end
    );
  end if;

  return new;
end;
$fn$;

drop trigger if exists identity_verifications_sync on public.identity_verifications;
create trigger identity_verifications_sync after insert or update on public.identity_verifications
  for each row execute function public.sync_verification_status();

-- Only a reviewer decides a verification outcome. A customer may replace their
-- own documents, which returns the row to 'pending'.
create or replace function public.guard_verification_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  caller_role public.user_role;
begin
  select role into caller_role from public.profiles where id = auth.uid();

  if auth.uid() is not null and coalesce(caller_role, 'user') <> 'admin' then
    new.status           := 'pending';
    new.rejection_reason := null;
    new.reviewed_by      := null;
    new.reviewed_at      := null;
    new.user_id          := old.user_id;
  end if;

  return new;
end;
$fn$;

drop trigger if exists identity_verifications_guard on public.identity_verifications;
create trigger identity_verifications_guard before update on public.identity_verifications
  for each row execute function public.guard_verification_status();

-- A claim cannot be filed by an unverified account. Enforced here as well as in
-- the application, so it holds even if a request bypasses the UI entirely.
create or replace function public.require_verified_claimant()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  status public.verification_status;
begin
  -- auth.uid() is null for trusted server-side contexts (seed, migrations).
  if auth.uid() is null then return new; end if;

  select verification_status into status from public.profiles where id = new.user_id;

  if coalesce(status, 'unverified') <> 'verified' then
    raise exception 'Identity verification is required before submitting a claim'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$fn$;

drop trigger if exists claims_require_verified on public.claims;
create trigger claims_require_verified before insert on public.claims
  for each row execute function public.require_verified_claimant();

-- --------------------------------------------------------------------- RLS

alter table public.identity_verifications enable row level security;

drop policy if exists verifications_select_own on public.identity_verifications;
create policy verifications_select_own on public.identity_verifications
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists verifications_insert_own on public.identity_verifications;
create policy verifications_insert_own on public.identity_verifications
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');

-- The guard trigger clamps everything a customer must not set.
drop policy if exists verifications_update_own_or_admin on public.identity_verifications;
create policy verifications_update_own_or_admin on public.identity_verifications
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------- storage

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'identity-documents',
  'identity-documents',
  false,
  8388608,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists identity_docs_insert_own on storage.objects;
create policy identity_docs_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'identity-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists identity_docs_select_related on storage.objects;
create policy identity_docs_select_related on storage.objects
  for select to authenticated
  using (
    bucket_id = 'identity-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists identity_docs_delete_related on storage.objects;
create policy identity_docs_delete_related on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'identity-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
