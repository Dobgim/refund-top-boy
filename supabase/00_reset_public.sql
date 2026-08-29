-- ============================================================================
-- DESTRUCTIVE — clean-slate step, run once BEFORE run-all.sql
--
-- Removes an unrelated refund application that occupied the public schema of
-- this project, so RoyalRefund can install cleanly.
--
-- Verified immediately before it was first run: 0 rows across all 11 tables
-- and 0 auth users. RE-VERIFY before running this against any other project.
-- This cannot be undone.
-- ============================================================================

drop table if exists public.audit_logs            cascade;
drop table if exists public.refund_evidence       cascade;
drop table if exists public.refund_messages       cascade;
drop table if exists public.refund_status_history cascade;
drop table if exists public.refund_requests       cascade;
drop table if exists public.support_messages      cascade;
drop table if exists public.support_tickets       cascade;
drop table if exists public.tracking_lookups      cascade;
drop table if exists public.transactions          cascade;
drop table if exists public.notifications         cascade;
drop table if exists public.profiles              cascade;

drop type if exists public.audit_action        cascade;
drop type if exists public.notification_type   cascade;
drop type if exists public.payment_method_type cascade;
drop type if exists public.refund_reason       cascade;
drop type if exists public.refund_status       cascade;
drop type if exists public.ticket_category     cascade;
drop type if exists public.ticket_status       cascade;
drop type if exists public.transaction_status  cascade;
drop type if exists public.user_role           cascade;
drop type if exists public.account_status      cascade;
