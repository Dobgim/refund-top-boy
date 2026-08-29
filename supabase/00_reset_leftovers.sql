-- ============================================================================
-- Clean-slate step 2 — removes what `drop table ... cascade` left behind.
--
-- Standalone functions and the storage bucket belonging to the previous
-- application are not attached to any table, so cascading drops missed them.
-- The bucket was verified empty (0 objects) before this was first run.
-- ============================================================================

drop policy if exists evidence_insert_own_folder on storage.objects;
drop policy if exists evidence_select_own_folder on storage.objects;
-- The empty refund-evidence bucket must be removed via the Storage API or the
-- dashboard: Supabase blocks direct deletes from storage.buckets.

drop function if exists public.assign_reference()            cascade;
drop function if exists public.current_user_is_active()      cascade;
drop function if exists public.enforce_refund_update_rules() cascade;
drop function if exists public.generate_reference()          cascade;
drop function if exists public.is_staff()                    cascade;
drop function if exists public.prevent_privilege_escalation() cascade;
drop function if exists public.record_refund_status_change() cascade;
drop function if exists public.set_updated_at()              cascade;
drop function if exists public.stamp_refund_status()         cascade;

-- Start claim references at RR-YYYY-0001 for the first real submission.
select setval('public.claim_reference_seq', 1, false);
