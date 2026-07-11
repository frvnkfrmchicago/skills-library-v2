-- ============================================================================
-- 003_financial_invoices_payments_webhookevents.sql
-- Lane 1 — financial ledger. Implements docs/data-contract.md §4 tables
-- 4 (dues_invoices), 5 (payments), 11 (stripe_webhook_events).
-- payments.event_registration_id FK is added in 004 after event_registrations
-- exists (forward-reference resolved there).
-- ============================================================================

-- 4. dues_invoices -----------------------------------------------------------
create table public.dues_invoices (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.members(id) on delete restrict,
  plan_id uuid references public.membership_plans(id) on delete set null,
  invoice_type public.dues_invoice_type not null default 'annual_dues',
  period_start date not null,
  period_end date not null,
  amount_cents integer not null check (amount_cents >= 0),
  status public.dues_status not null default 'pending',
  due_date date not null,
  stripe_invoice_id text unique,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  notes text,                                            -- admin-only
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end > period_start)
);
create index idx_dues_member on public.dues_invoices(member_id);
create index idx_dues_status on public.dues_invoices(status);
create index idx_dues_due_date on public.dues_invoices(due_date);
-- Double-charge guard: at most one open invoice per member per period.
create unique index uq_dues_open_period on public.dues_invoices(member_id, period_start)
  where status in ('pending','payment_failed','action_required');

-- 5. payments (immutable ledger; service-role writes only via RLS) -----------
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid references public.members(id) on delete set null,
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  amount_cents integer not null check (amount_cents >= 0),
  currency char(3) not null default 'usd',
  purpose_type public.payment_purpose not null,
  designation text,                                      -- e.g. 'scholarship' | 'chapter'
  status public.payment_status not null default 'pending',
  dues_invoice_id uuid references public.dues_invoices(id) on delete set null,
  event_registration_id uuid,                            -- FK added in 004
  metadata jsonb not null default '{}',
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_payments_member on public.payments(member_id);
create index idx_payments_pi on public.payments(stripe_payment_intent_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_purpose on public.payments(purpose_type);

-- 11. stripe_webhook_events (idempotency; service-role only via RLS) ----------
create table public.stripe_webhook_events (
  id text primary key,                                   -- Stripe event.id
  type text not null,
  processed_at timestamptz not null default now()
);
