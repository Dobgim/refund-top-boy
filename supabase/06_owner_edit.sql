-- ============================================================================
-- Let a customer correct their own claim and resubmit it.
-- Run after 05_settlements.sql.
--
-- Until now UPDATE on `claims` was granted to reviewers only, so a customer
-- editing their own case would have silently affected zero rows.
-- ============================================================================

-- Editable only while the case is still genuinely open to change. Once a
-- decision has been recorded the record freezes, so the decision keeps
-- referring to the evidence it was actually made on.
drop policy if exists claims_update_own_open on public.claims;
create policy claims_update_own_open on public.claims
  for update to authenticated
  using (
    user_id = auth.uid()
    and status in ('submitted', 'documents_required', 'under_review')
  )
  with check (user_id = auth.uid());

-- A permissive UPDATE policy alone would let an owner rewrite their own status
-- or settlement figures. This clamps every field that is a reviewer's to set.
create or replace function public.guard_claim_owner_edits()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  caller_role public.user_role;
begin
  select role into caller_role from public.profiles where id = auth.uid();

  -- auth.uid() is null for trusted server-side contexts (service role,
  -- migrations, the seed script), which are allowed through unchanged.
  if auth.uid() is not null and coalesce(caller_role, 'user') <> 'admin' then
    new.status               := old.status;
    new.reference            := old.reference;
    new.user_id              := old.user_id;
    new.approved_amount      := old.approved_amount;
    new.settlement_method    := old.settlement_method;
    new.settlement_reference := old.settlement_reference;
    new.settlement_note      := old.settlement_note;
    new.settled_at           := old.settled_at;
    new.settlement_currency  := old.settlement_currency;
    new.settlement_amount    := old.settlement_amount;
    new.settlement_rate      := old.settlement_rate;
    new.created_at           := old.created_at;
  end if;

  return new;
end;
$fn$;

drop trigger if exists claims_guard_owner_edits on public.claims;
create trigger claims_guard_owner_edits before update on public.claims
  for each row execute function public.guard_claim_owner_edits();
