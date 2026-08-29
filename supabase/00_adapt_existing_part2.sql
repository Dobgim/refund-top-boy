-- ============================================================================
-- Coexistence prep, step 2 of 2 — run after 00_adapt_existing.sql,
-- before run-all.sql. Still additive only: nothing is dropped or rewritten.
-- ============================================================================

-- The existing `profiles` table has no country column; RoyalRefund collects one.
alter table public.profiles add column if not exists country text;

-- RoyalRefund reads `account_status`; the existing table calls the same idea
-- `status`. Adding our column leaves theirs alone.
alter table public.profiles
  add column if not exists account_status public.account_status not null default 'active';

-- `notifications.type` is NOT NULL with no default, so RoyalRefund's trigger
-- could not insert into it. Default it to a value the other app already defines.
alter table public.notifications
  alter column type set default 'system'::public.notification_type;

-- RoyalRefund links a notification to a claim; the existing table links to a
-- refund. Both can live side by side.
alter table public.notifications add column if not exists claim_id uuid;
alter table public.notifications add column if not exists read boolean not null default false;
