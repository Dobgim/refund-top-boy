-- ============================================================================
-- Crypto support — RoyalRefund handles both bank/card and on-chain refunds.
--
-- Run 04a first on its own (Postgres will not let a new enum value be used in
-- the same transaction that adds it), then 04b.
-- ============================================================================

-- ---- 04a: new claim types --------------------------------------------------
alter type public.claim_type add value if not exists 'crypto_wrong_address';
alter type public.claim_type add value if not exists 'crypto_failed_transfer';
alter type public.claim_type add value if not exists 'crypto_exchange_dispute';
