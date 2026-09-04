-- ============================================================================
-- Let reviewers delete a support enquiry — run after 12_support_enquiries.sql
--
-- The inbox could be read and re-labelled but never emptied, so test messages
-- and spam stayed on the page permanently. Deletion is reviewers-only, matching
-- the select and update policies on the same table.
--
-- Idempotent: safe to re-run.
-- ============================================================================

drop policy if exists enquiries_delete_admin on public.support_enquiries;
create policy enquiries_delete_admin on public.support_enquiries
  for delete to authenticated
  using (public.is_admin());
