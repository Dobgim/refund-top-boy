-- ============================================================================
-- Deleting an account — run after 09_banking.sql
--
-- Removes the auth user, which cascades to the profile and from there to every
-- claim, document row, verification, notification, bank account and ledger
-- entry belonging to them.
--
-- Stored files are NOT covered by that cascade: they live in object storage,
-- not in these tables. The application deletes those first, through the admin's
-- own session, before calling this. The paths are returned here so the caller
-- knows exactly what to remove.
-- ============================================================================

/** Everything the caller must delete from storage before removing the account. */
create or replace function public.account_storage_paths(target uuid)
returns table (bucket text, path text)
language sql
stable
security definer
set search_path = public
as $fn$
  select 'claim-documents'::text, d.storage_path
    from public.claim_documents d
   where d.user_id = target and d.storage_path <> ''
  union all
  select 'identity-documents'::text, v.front_path
    from public.identity_verifications v
   where v.user_id = target and v.front_path is not null
  union all
  select 'identity-documents'::text, v.back_path
    from public.identity_verifications v
   where v.user_id = target and v.back_path is not null;
$fn$;

/**
 * Permanently deletes an account.
 *
 * Refuses three things outright, because each is a way to lock yourself out or
 * destroy an audit trail by accident:
 *   - deleting yourself
 *   - deleting another administrator
 *   - deleting the last remaining administrator
 */
create or replace function public.delete_user_account(target uuid)
returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  target_role  public.user_role;
  target_email text;
  admin_count  int;
begin
  if not public.is_admin() then
    raise exception 'Only a reviewer can delete an account';
  end if;

  if target = auth.uid() then
    raise exception 'You cannot delete your own account from here';
  end if;

  select role, email into target_role, target_email
    from public.profiles where id = target;

  if target_email is null then
    raise exception 'That account no longer exists';
  end if;

  if target_role = 'admin' then
    select count(*)::int into admin_count from public.profiles where role = 'admin';
    if admin_count <= 1 then
      raise exception 'That is the only administrator left';
    end if;
    raise exception 'Administrator accounts must be demoted before they can be deleted';
  end if;

  -- Recorded before the row disappears, so the log survives the deletion.
  insert into public.admin_activity (admin_id, action, target_type, target_id, detail)
  values (auth.uid(), 'user.deleted', 'user', target,
          json_build_object('email', target_email)::jsonb);

  -- Cascades through profiles to claims, documents, verifications,
  -- notifications, bank accounts and the ledger.
  delete from auth.users where id = target;

  return json_build_object('ok', true, 'email', target_email);
end;
$fn$;

revoke execute on function public.delete_user_account(uuid) from public, anon;
grant execute on function public.delete_user_account(uuid) to authenticated;
grant execute on function public.account_storage_paths(uuid) to authenticated;
