-- ============================================================================
-- Banking layer — run after 08_username_gender.sql
--
-- Accounts, a transaction ledger, transfers, withdrawals, bill payments,
-- recurring savings (DPS), fixed deposits (FDR) and loans.
--
-- The balance is never writable from the client. RLS grants SELECT only, and
-- every movement of money goes through a SECURITY DEFINER function that writes
-- the ledger row and the new balance together, inside one transaction.
-- ============================================================================

create sequence if not exists public.bank_account_number_seq start 4000100001;

do $$ begin
  create type public.txn_type as enum (
    'deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'bill_payment',
    'refund_credit', 'fee', 'interest', 'loan_disbursement', 'loan_repayment',
    'dps_deposit', 'fdr_open', 'fdr_maturity'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.request_status as enum (
    'pending', 'approved', 'rejected', 'completed', 'cancelled', 'active', 'matured'
  );
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------------ accounts

create table if not exists public.bank_accounts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null unique references public.profiles (id) on delete cascade,
  account_number text not null unique
                 default ('RR' || nextval('public.bank_account_number_seq')::text),
  currency       char(3) not null default 'USD',
  balance        numeric(20, 2) not null default 0 check (balance >= 0),
  status         text not null default 'active',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists bank_accounts_touch on public.bank_accounts;
create trigger bank_accounts_touch before update on public.bank_accounts
  for each row execute function public.touch_updated_at();

-- Everyone gets an account the moment their profile exists.
create or replace function public.open_bank_account()
returns trigger language plpgsql security definer set search_path = public as $fn$
begin
  insert into public.bank_accounts (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$fn$;

drop trigger if exists profiles_open_account on public.profiles;
create trigger profiles_open_account after insert on public.profiles
  for each row execute function public.open_bank_account();

insert into public.bank_accounts (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- -------------------------------------------------------------- transactions

create table if not exists public.bank_transactions (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.bank_accounts (id) on delete cascade,
  type          public.txn_type not null,
  amount        numeric(20, 2) not null check (amount > 0),
  balance_after numeric(20, 2) not null,
  counterparty  text,
  reference     text not null unique default ('TXN' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  description   text,
  created_at    timestamptz not null default now()
);

create index if not exists bank_transactions_account_idx
  on public.bank_transactions (account_id, created_at desc);

-- ------------------------------------------------------------- money movement

/**
 * The only way a balance ever changes. Locks the row, refuses to go negative,
 * writes the ledger entry and returns the new balance.
 */
create or replace function public.post_transaction(
  target_account uuid,
  txn_type       public.txn_type,
  delta          numeric,
  counterparty   text default null,
  description    text default null
)
returns numeric
language plpgsql
security definer
set search_path = public
as $fn$
declare
  new_balance numeric(20, 2);
begin
  if delta = 0 then raise exception 'Amount must not be zero'; end if;

  update public.bank_accounts
     set balance = balance + delta
   where id = target_account
  returning balance into new_balance;

  if new_balance is null then raise exception 'Account not found'; end if;

  insert into public.bank_transactions
    (account_id, type, amount, balance_after, counterparty, description)
  values (target_account, txn_type, abs(delta), new_balance, counterparty, description);

  return new_balance;
end;
$fn$;

/** Internal transfer between two RoyalRefund accounts. Atomic by definition. */
create or replace function public.transfer_funds(
  destination_number text,
  transfer_amount    numeric,
  note               text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $fn$
declare
  from_account public.bank_accounts;
  to_account   public.bank_accounts;
begin
  if transfer_amount is null or transfer_amount <= 0 then
    raise exception 'Enter an amount greater than zero';
  end if;

  select * into from_account from public.bank_accounts where user_id = auth.uid();
  if from_account.id is null then raise exception 'You do not have an account'; end if;

  select * into to_account from public.bank_accounts
   where account_number = upper(trim(destination_number));
  if to_account.id is null then raise exception 'No account with that number'; end if;

  if to_account.id = from_account.id then
    raise exception 'You cannot transfer to your own account';
  end if;

  if from_account.balance < transfer_amount then
    raise exception 'Insufficient balance';
  end if;

  perform public.post_transaction(
    from_account.id, 'transfer_out', -transfer_amount,
    to_account.account_number, coalesce(note, 'Transfer out'));

  perform public.post_transaction(
    to_account.id, 'transfer_in', transfer_amount,
    from_account.account_number, coalesce(note, 'Transfer in'));

  return json_build_object('ok', true, 'to', to_account.account_number);
end;
$fn$;

-- ------------------------------------------------------------ bill payments

create table if not exists public.bill_payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  biller       text not null,
  bill_number  text not null,
  amount       numeric(20, 2) not null check (amount > 0),
  status       public.request_status not null default 'completed',
  created_at   timestamptz not null default now()
);

create or replace function public.pay_bill(
  biller_name text, bill_ref text, bill_amount numeric
)
returns json language plpgsql security definer set search_path = public as $fn$
declare acct public.bank_accounts;
begin
  if bill_amount is null or bill_amount <= 0 then raise exception 'Enter an amount'; end if;

  select * into acct from public.bank_accounts where user_id = auth.uid();
  if acct.id is null then raise exception 'You do not have an account'; end if;
  if acct.balance < bill_amount then raise exception 'Insufficient balance'; end if;

  perform public.post_transaction(
    acct.id, 'bill_payment', -bill_amount, biller_name,
    'Bill payment to ' || biller_name || ' (' || bill_ref || ')');

  insert into public.bill_payments (user_id, biller, bill_number, amount)
  values (auth.uid(), biller_name, bill_ref, bill_amount);

  return json_build_object('ok', true);
end;
$fn$;

-- -------------------------------------------------------------- withdrawals

create table if not exists public.withdrawal_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  amount      numeric(20, 2) not null check (amount > 0),
  method      text not null,
  destination text not null,
  status      public.request_status not null default 'pending',
  note        text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);

/** Funds are held at request time, so a balance cannot be spent twice. */
create or replace function public.request_withdrawal(
  withdraw_amount numeric, withdraw_method text, withdraw_destination text
)
returns json language plpgsql security definer set search_path = public as $fn$
declare acct public.bank_accounts;
begin
  if withdraw_amount is null or withdraw_amount <= 0 then raise exception 'Enter an amount'; end if;

  select * into acct from public.bank_accounts where user_id = auth.uid();
  if acct.id is null then raise exception 'You do not have an account'; end if;
  if acct.balance < withdraw_amount then raise exception 'Insufficient balance'; end if;

  perform public.post_transaction(
    acct.id, 'withdrawal', -withdraw_amount, withdraw_destination,
    'Withdrawal to ' || withdraw_method);

  insert into public.withdrawal_requests (user_id, amount, method, destination)
  values (auth.uid(), withdraw_amount, withdraw_method, withdraw_destination);

  return json_build_object('ok', true);
end;
$fn$;

-- ------------------------------------------------------- DPS (recurring save)

create table if not exists public.savings_schemes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  monthly_amount numeric(20, 2) not null check (monthly_amount > 0),
  tenure_months  int not null check (tenure_months between 6 and 120),
  rate_percent   numeric(5, 2) not null default 6.5,
  deposited      numeric(20, 2) not null default 0,
  status         public.request_status not null default 'active',
  matures_on     date not null,
  created_at     timestamptz not null default now()
);

create or replace function public.open_savings_scheme(
  monthly numeric, months int
)
returns json language plpgsql security definer set search_path = public as $fn$
declare acct public.bank_accounts;
begin
  select * into acct from public.bank_accounts where user_id = auth.uid();
  if acct.id is null then raise exception 'You do not have an account'; end if;
  if acct.balance < monthly then raise exception 'Insufficient balance for the first deposit'; end if;

  perform public.post_transaction(acct.id, 'dps_deposit', -monthly, 'DPS', 'First DPS deposit');

  insert into public.savings_schemes (user_id, monthly_amount, tenure_months, deposited, matures_on)
  values (auth.uid(), monthly, months, monthly, (current_date + (months || ' months')::interval)::date);

  return json_build_object('ok', true);
end;
$fn$;

-- --------------------------------------------------------- FDR (fixed term)

create table if not exists public.fixed_deposits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  principal     numeric(20, 2) not null check (principal > 0),
  tenure_months int not null check (tenure_months between 3 and 120),
  rate_percent  numeric(5, 2) not null default 8.0,
  status        public.request_status not null default 'active',
  matures_on    date not null,
  created_at    timestamptz not null default now()
);

create or replace function public.open_fixed_deposit(
  amount numeric, months int
)
returns json language plpgsql security definer set search_path = public as $fn$
declare acct public.bank_accounts;
begin
  select * into acct from public.bank_accounts where user_id = auth.uid();
  if acct.id is null then raise exception 'You do not have an account'; end if;
  if acct.balance < amount then raise exception 'Insufficient balance'; end if;

  perform public.post_transaction(acct.id, 'fdr_open', -amount, 'FDR', 'Fixed deposit opened');

  insert into public.fixed_deposits (user_id, principal, tenure_months, matures_on)
  values (auth.uid(), amount, months, (current_date + (months || ' months')::interval)::date);

  return json_build_object('ok', true);
end;
$fn$;

-- --------------------------------------------------------------------- loans

create table if not exists public.loans (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  amount        numeric(20, 2) not null check (amount > 0),
  purpose       text not null,
  tenure_months int not null check (tenure_months between 3 and 120),
  rate_percent  numeric(5, 2) not null default 12.0,
  status        public.request_status not null default 'pending',
  decision_note text,
  reviewed_by   uuid references public.profiles (id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

/** Reviewer approval disburses into the borrower's account in one step. */
create or replace function public.approve_loan(loan_id uuid, decision text, note text default null)
returns json language plpgsql security definer set search_path = public as $fn$
declare
  target public.loans;
  acct   public.bank_accounts;
begin
  if not public.is_admin() then raise exception 'Only a reviewer can decide a loan'; end if;

  select * into target from public.loans where id = loan_id;
  if target.id is null then raise exception 'Loan not found'; end if;
  if target.status <> 'pending' then raise exception 'That loan has already been decided'; end if;

  if decision = 'approved' then
    select * into acct from public.bank_accounts where user_id = target.user_id;
    perform public.post_transaction(
      acct.id, 'loan_disbursement', target.amount, 'RoyalRefund', 'Loan disbursed');
  end if;

  update public.loans
     set status = decision::public.request_status,
         decision_note = note, reviewed_by = auth.uid(), reviewed_at = now()
   where id = loan_id;

  insert into public.notifications (user_id, title, body)
  values (target.user_id,
          'Your loan application was ' || decision,
          coalesce(note, 'Open your dashboard for the details.'));

  return json_build_object('ok', true);
end;
$fn$;

-- ----------------------------------------------------------------------- RLS

alter table public.bank_accounts       enable row level security;
alter table public.bank_transactions   enable row level security;
alter table public.bill_payments       enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.savings_schemes     enable row level security;
alter table public.fixed_deposits      enable row level security;
alter table public.loans               enable row level security;

-- Read-only to the owner: balances move only through the functions above.
drop policy if exists accounts_select_own on public.bank_accounts;
create policy accounts_select_own on public.bank_accounts
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists txns_select_own on public.bank_transactions;
create policy txns_select_own on public.bank_transactions
  for select to authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.bank_accounts a
                where a.id = account_id and a.user_id = auth.uid())
  );

drop policy if exists bills_select_own on public.bill_payments;
create policy bills_select_own on public.bill_payments
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists withdrawals_select_own on public.withdrawal_requests;
create policy withdrawals_select_own on public.withdrawal_requests
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists withdrawals_update_admin on public.withdrawal_requests;
create policy withdrawals_update_admin on public.withdrawal_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists dps_select_own on public.savings_schemes;
create policy dps_select_own on public.savings_schemes
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists fdr_select_own on public.fixed_deposits;
create policy fdr_select_own on public.fixed_deposits
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists loans_select_own on public.loans;
create policy loans_select_own on public.loans
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists loans_insert_own on public.loans;
create policy loans_insert_own on public.loans
  for insert to authenticated with check (user_id = auth.uid() and status = 'pending');

drop policy if exists loans_update_admin on public.loans;
create policy loans_update_admin on public.loans
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- The money-moving functions are the only write path, and each checks auth.uid().
revoke execute on function public.post_transaction(uuid, public.txn_type, numeric, text, text) from public, anon, authenticated;
grant execute on function public.transfer_funds(text, numeric, text)        to authenticated;
grant execute on function public.pay_bill(text, text, numeric)              to authenticated;
grant execute on function public.request_withdrawal(numeric, text, text)    to authenticated;
grant execute on function public.open_savings_scheme(numeric, int)          to authenticated;
grant execute on function public.open_fixed_deposit(numeric, int)           to authenticated;
grant execute on function public.approve_loan(uuid, text, text)             to authenticated;

-- A refund payout credits the customer's account, tying the two halves together.
create or replace function public.credit_settlement()
returns trigger language plpgsql security definer set search_path = public as $fn$
declare acct public.bank_accounts;
begin
  if new.settled_at is not null and old.settled_at is null and new.settlement_amount > 0 then
    select * into acct from public.bank_accounts where user_id = new.user_id;
    if acct.id is not null then
      perform public.post_transaction(
        acct.id, 'refund_credit', new.settlement_amount, 'RoyalRefund',
        'Recovered funds for case ' || new.reference);
    end if;
  end if;
  return new;
end;
$fn$;

drop trigger if exists claims_credit_settlement on public.claims;
create trigger claims_credit_settlement after update on public.claims
  for each row execute function public.credit_settlement();

-- ============================================================================
-- Also: record what the customer's document is called where it was issued,
-- so "Ghana Card" or "Emirates ID" survives into the reviewer's queue rather
-- than being flattened to the generic enum value.
-- ============================================================================

alter table public.identity_verifications
  add column if not exists document_label text;

-- ============================================================================
-- Withdrawal decisions.
--
-- Funds are held when the request is made, so rejecting one must put the money
-- back. Doing that in the same call as the status change keeps the two from
-- ever disagreeing.
-- ============================================================================

create or replace function public.decide_withdrawal(
  request_id uuid, decision text, note text default null
)
returns json language plpgsql security definer set search_path = public as $fn$
declare
  req  public.withdrawal_requests;
  acct public.bank_accounts;
begin
  if not public.is_admin() then raise exception 'Only a reviewer can decide a withdrawal'; end if;

  select * into req from public.withdrawal_requests where id = request_id;
  if req.id is null then raise exception 'Request not found'; end if;
  if req.status <> 'pending' then raise exception 'That request has already been decided'; end if;

  if decision = 'rejected' then
    select * into acct from public.bank_accounts where user_id = req.user_id;
    perform public.post_transaction(
      acct.id, 'deposit', req.amount, 'RoyalRefund',
      'Withdrawal declined, funds returned');
  end if;

  update public.withdrawal_requests
     set status = decision::public.request_status,
         note = decide_withdrawal.note,
         reviewed_by = auth.uid(),
         reviewed_at = now()
   where id = request_id;

  insert into public.notifications (user_id, title, body)
  values (req.user_id,
          'Your withdrawal was ' || decision,
          coalesce(decide_withdrawal.note,
                   case decision
                     when 'completed' then 'The money is on its way to your destination account.'
                     else 'The held amount has been returned to your balance.'
                   end));

  return json_build_object('ok', true);
end;
$fn$;

grant execute on function public.decide_withdrawal(uuid, text, text) to authenticated;
