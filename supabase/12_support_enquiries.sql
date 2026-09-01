-- ============================================================================
-- Customer service inbox — run after 11_phone.sql
--
-- Messages sent from the contact form. Stored so they appear in the admin
-- dashboard, and emailed so support@getroyalrefund.com sees them immediately.
-- Distinct from claim_messages, which are threaded onto a specific case.
-- ============================================================================

do $$ begin
  create type public.enquiry_status as enum ('new', 'in_progress', 'resolved');
exception when duplicate_object then null; end $$;

create table if not exists public.support_enquiries (
  id         uuid primary key default gen_random_uuid(),
  -- Set when the sender was signed in; null for a visitor.
  user_id    uuid references public.profiles (id) on delete set null,
  name       text not null check (char_length(name) between 2 and 80),
  email      text not null,
  subject    text not null check (char_length(subject) between 3 and 120),
  message    text not null check (char_length(message) between 20 and 2000),
  status     public.enquiry_status not null default 'new',
  handled_by uuid references public.profiles (id) on delete set null,
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_enquiries_status_idx
  on public.support_enquiries (status, created_at desc);
create index if not exists support_enquiries_created_idx
  on public.support_enquiries (created_at desc);

drop trigger if exists support_enquiries_touch on public.support_enquiries;
create trigger support_enquiries_touch before update on public.support_enquiries
  for each row execute function public.touch_updated_at();

alter table public.support_enquiries enable row level security;

-- Anyone may write in, signed in or not: this is the public contact form.
drop policy if exists enquiries_insert_anyone on public.support_enquiries;
create policy enquiries_insert_anyone on public.support_enquiries
  for insert to anon, authenticated
  with check (true);

-- Only reviewers may read the inbox. A sender cannot read anyone's messages,
-- including their own, so the table can never be used to enumerate customers.
drop policy if exists enquiries_select_admin on public.support_enquiries;
create policy enquiries_select_admin on public.support_enquiries
  for select to authenticated
  using (public.is_admin());

drop policy if exists enquiries_update_admin on public.support_enquiries;
create policy enquiries_update_admin on public.support_enquiries
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
