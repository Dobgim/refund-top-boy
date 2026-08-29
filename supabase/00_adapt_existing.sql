-- ============================================================================
-- Coexistence prep, step 1 of 2 — run BEFORE run-all.sql
--
-- This project already contains an unrelated refund application. This file
-- makes room for RoyalRefund WITHOUT touching a single existing row, column or
-- table. It only ADDS things.
--
-- Must be sent as its own statement batch: Postgres will not let a newly added
-- enum value be used in the same transaction that adds it.
-- ============================================================================

-- RoyalRefund calls a normal account 'user'; the existing enum calls it
-- 'customer'. Adding the label leaves the other app's values untouched.
alter type public.user_role add value if not exists 'user';

-- RoyalRefund has a 'pending' account state the existing enum lacks.
alter type public.account_status add value if not exists 'pending';
