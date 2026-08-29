-- ============================================================================
-- RoyalRefund — row level security and storage policies
-- Run after 01_schema.sql. Safe to re-run.
-- ============================================================================

-- Role lookup used by every admin policy. SECURITY DEFINER so that reading the
-- caller's own profile row does not re-enter the policies on `profiles`.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- True when the signed-in account owns the given case.
create or replace function public.owns_claim(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.claims
    where id = target and user_id = auth.uid()
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.owns_claim(uuid) from public;
grant execute on function public.owns_claim(uuid) to authenticated;

-- ---------------------------------------------------------------- enable RLS

alter table public.profiles              enable row level security;
alter table public.claims                enable row level security;
alter table public.claim_status_history  enable row level security;
alter table public.claim_documents       enable row level security;
alter table public.claim_messages        enable row level security;
alter table public.notifications         enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.admin_activity        enable row level security;

-- ------------------------------------------------------------------ profiles

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- Role and account_status are reverted by the guard trigger for non-admins.
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- -------------------------------------------------------------------- claims

drop policy if exists claims_select_own on public.claims;
create policy claims_select_own on public.claims
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists claims_insert_own on public.claims;
create policy claims_insert_own on public.claims
  for insert to authenticated
  with check (user_id = auth.uid());

-- Only a reviewer moves a case. Case owners communicate through messages.
drop policy if exists claims_update_admin on public.claims;
create policy claims_update_admin on public.claims
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists claims_delete_admin on public.claims;
create policy claims_delete_admin on public.claims
  for delete to authenticated
  using (public.is_admin());

-- ------------------------------------------------------- claim status history

drop policy if exists history_select_related on public.claim_status_history;
create policy history_select_related on public.claim_status_history
  for select to authenticated
  using (public.owns_claim(claim_id) or public.is_admin());

-- The opening 'submitted' row is written by a SECURITY DEFINER trigger, so only
-- reviewers need direct insert rights here.
drop policy if exists history_insert_admin on public.claim_status_history;
create policy history_insert_admin on public.claim_status_history
  for insert to authenticated
  with check (public.is_admin() and created_by = auth.uid());

-- ----------------------------------------------------------- claim documents

drop policy if exists documents_select_related on public.claim_documents;
create policy documents_select_related on public.claim_documents
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists documents_insert_own on public.claim_documents;
create policy documents_insert_own on public.claim_documents
  for insert to authenticated
  with check (user_id = auth.uid() and public.owns_claim(claim_id));

drop policy if exists documents_delete_related on public.claim_documents;
create policy documents_delete_related on public.claim_documents
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------ claim messages

drop policy if exists messages_select_related on public.claim_messages;
create policy messages_select_related on public.claim_messages
  for select to authenticated
  using (public.owns_claim(claim_id) or public.is_admin());

drop policy if exists messages_insert_related on public.claim_messages;
create policy messages_insert_related on public.claim_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (public.owns_claim(claim_id) or public.is_admin())
    -- A sender cannot label themselves a reviewer.
    and (sender_role = 'user' or public.is_admin())
  );

-- ------------------------------------------------------------- notifications

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ------------------------------------------------------ newsletter subscribers

-- Anyone may subscribe; nobody but a reviewer may read the list back.
drop policy if exists newsletter_insert_anyone on public.newsletter_subscribers;
create policy newsletter_insert_anyone on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (true);

drop policy if exists newsletter_select_admin on public.newsletter_subscribers;
create policy newsletter_select_admin on public.newsletter_subscribers
  for select to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------ admin activity

drop policy if exists admin_activity_select_admin on public.admin_activity;
create policy admin_activity_select_admin on public.admin_activity
  for select to authenticated
  using (public.is_admin());

drop policy if exists admin_activity_insert_admin on public.admin_activity;
create policy admin_activity_insert_admin on public.admin_activity
  for insert to authenticated
  with check (public.is_admin() and admin_id = auth.uid());

-- ============================================================================
-- Storage: private evidence bucket
-- Object keys are `<user-id>/<claim-id>/<uid>-<file-name>`, so the first path
-- segment is the owner and can be matched directly in policy.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'claim-documents',
  'claim-documents',
  false,
  8388608,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/csv']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists claim_docs_insert_own on storage.objects;
create policy claim_docs_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'claim-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists claim_docs_select_related on storage.objects;
create policy claim_docs_select_related on storage.objects
  for select to authenticated
  using (
    bucket_id = 'claim-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists claim_docs_delete_related on storage.objects;
create policy claim_docs_delete_related on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'claim-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
