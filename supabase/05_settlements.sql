-- ============================================================================
-- Settlement / payout record — run after 04b_crypto_columns.sql
--
-- When a case is approved, a reviewer records what is being returned to the
-- customer: how much, by what route, and against which reference. The customer
-- sees this on their own dashboard.
--
-- Deliberately a *record of a payout*, not a mechanism for taking money from a
-- customer. This platform never holds card details and never initiates a debit.
-- ============================================================================

do $$ begin
  create type public.settlement_method as enum (
    'bank_transfer', 'card_reversal', 'original_payment_method',
    'crypto_transfer', 'store_credit', 'other'
  );
exception when duplicate_object then null; end $$;

alter table public.claims
  add column if not exists approved_amount      numeric(28, 8),
  add column if not exists settlement_method    public.settlement_method,
  add column if not exists settlement_reference text,
  add column if not exists settlement_note      text,
  add column if not exists settled_at           timestamptz;

-- An approved amount can never exceed what was claimed.
alter table public.claims drop constraint if exists claims_approved_amount_range;
alter table public.claims
  add constraint claims_approved_amount_range
  check (approved_amount is null or (approved_amount >= 0 and approved_amount <= amount));

comment on column public.claims.approved_amount is
  'Amount being returned to the customer. Never a charge to the customer.';

-- The public tracker must not leak settlement figures, so the view is
-- recreated explicitly with the same narrow column list as before.
create or replace view public.claim_public_status
with (security_invoker = false) as
  select reference, status, claim_type, created_at, last_update
  from public.claims;

grant select on public.claim_public_status to anon, authenticated;
