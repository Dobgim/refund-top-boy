-- ============================================================================
-- Crypto support, part 2 — run after 04_crypto_support.sql
--
-- `currency` was char(3), which cannot hold USDT/USDC.
-- `amount` was numeric(14,2), which silently rounded 0.00042 BTC to 0.00.
-- ============================================================================

alter table public.claims
  alter column currency type varchar(10),
  alter column currency set default 'USD';

alter table public.claims
  alter column amount type numeric(28, 8);

-- Guard against a ticker being stored lowercase or padded.
alter table public.claims
  drop constraint if exists claims_currency_format;
alter table public.claims
  add constraint claims_currency_format
  check (currency = upper(trim(currency)) and char_length(currency) between 3 and 10);
