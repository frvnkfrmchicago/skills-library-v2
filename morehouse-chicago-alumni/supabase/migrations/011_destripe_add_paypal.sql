-- ============================================================================
-- 011_destripe_add_paypal.sql
-- Lane B (mcaa-wave-002) — remove Stripe from the schema and add the PayPal +
-- Chase (Zelle/check) + admin mark-paid money layer.
--
-- This migration ALTERS the tables created in 002 (members, membership_plans),
-- 003 (dues_invoices, payments, stripe_webhook_events), and 004. It is additive
-- where possible and idempotent (guards on every statement) so it is safe to
-- re-run during board provisioning.
--
-- WHAT CHANGES
--   members          : drop stripe_customer_id / stripe_subscription_id;
--                      add paypal_payer_id / paypal_subscription_id.
--   membership_plans : drop stripe_product_id / stripe_price_id;
--                      add paypal_plan_id (auto-renew billing plan, opt-in).
--   dues_invoices    : drop stripe_invoice_id / stripe_subscription_id /
--                      stripe_checkout_session_id;
--                      add paypal_order_id + payment_method + payment_reference.
--   payments         : drop stripe_payment_intent_id / stripe_charge_id;
--                      add paypal_order_id + paypal_capture_id + payment_method.
--   stripe_webhook_events -> RENAME to paypal_webhook_events (RLS stays on;
--                      service-role only — no policies, like the original).
--   payments RLS     : ADD admin/board INSERT + UPDATE so the mark-paid flow can
--                      record an offline (check/zelle/cash) payment. Online
--                      writes still come from the service-role webhook.
--
-- KEPT INTACT: the uq_dues_open_period partial unique index (double-charge guard)
-- is untouched — it references member_id/period_start/status, none of which move.
--
-- payment_method values: 'paypal' (online) | 'check' | 'zelle' | 'cash' (offline,
-- admin-recorded). data-contract.md §7 / dossier Dimension 4.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. members — Stripe out, PayPal in.
-- ---------------------------------------------------------------------------
drop index if exists public.idx_members_stripe_customer;
drop index if exists public.idx_members_stripe_subscription;

alter table public.members drop column if exists stripe_customer_id;
alter table public.members drop column if exists stripe_subscription_id;

alter table public.members add column if not exists paypal_payer_id text;
alter table public.members add column if not exists paypal_subscription_id text;

create index if not exists idx_members_paypal_payer
  on public.members(paypal_payer_id);
create index if not exists idx_members_paypal_subscription
  on public.members(paypal_subscription_id);

-- ---------------------------------------------------------------------------
-- 2. membership_plans — Stripe product/price out, PayPal billing-plan in.
-- ---------------------------------------------------------------------------
drop index if exists public.idx_membership_plans_stripe_price;

alter table public.membership_plans drop column if exists stripe_product_id;
alter table public.membership_plans drop column if exists stripe_price_id;

-- paypal_plan_id backs the OPTIONAL auto-renew path (PayPal Subscriptions v1).
-- One-time annual dues do not need it; it stays null until the board provisions
-- a billing plan for members who opt into auto-renew.
alter table public.membership_plans add column if not exists paypal_plan_id text;

create index if not exists idx_membership_plans_paypal_plan
  on public.membership_plans(paypal_plan_id);

-- ---------------------------------------------------------------------------
-- 3. dues_invoices — Stripe ids out; PayPal order + payment method/reference in.
-- ---------------------------------------------------------------------------
alter table public.dues_invoices drop column if exists stripe_invoice_id;
alter table public.dues_invoices drop column if exists stripe_subscription_id;
alter table public.dues_invoices drop column if exists stripe_checkout_session_id;

alter table public.dues_invoices add column if not exists paypal_order_id text;
-- How this invoice was settled. NULL while open; set on payment (online or
-- admin mark-paid). 'paypal' | 'check' | 'zelle' | 'cash'.
alter table public.dues_invoices add column if not exists payment_method text;
-- Free-text reference for offline payments (check number, Zelle confirmation,
-- etc.) captured by the admin at mark-paid time.
alter table public.dues_invoices add column if not exists payment_reference text;

alter table public.dues_invoices drop constraint if exists dues_invoices_payment_method_check;
alter table public.dues_invoices add constraint dues_invoices_payment_method_check
  check (payment_method is null or payment_method in ('paypal','check','zelle','cash'));

create index if not exists idx_dues_paypal_order
  on public.dues_invoices(paypal_order_id);

-- ---------------------------------------------------------------------------
-- 4. payments — Stripe ids out; PayPal order/capture + payment method in.
-- ---------------------------------------------------------------------------
drop index if exists public.idx_payments_pi;

alter table public.payments drop column if exists stripe_payment_intent_id;
alter table public.payments drop column if exists stripe_charge_id;

alter table public.payments add column if not exists paypal_order_id text;
-- The PayPal capture id is the unique money event we key the ledger on (the
-- analogue of the old stripe_payment_intent_id uniqueness).
alter table public.payments add column if not exists paypal_capture_id text;
-- 'paypal' for online captures; 'check' | 'zelle' | 'cash' for admin mark-paid.
alter table public.payments add column if not exists payment_method text not null default 'paypal';

alter table public.payments drop constraint if exists payments_payment_method_check;
alter table public.payments add constraint payments_payment_method_check
  check (payment_method in ('paypal','check','zelle','cash'));

-- Unique capture id (race backstop for webhook upserts). Partial so multiple
-- offline rows (paypal_capture_id IS NULL) do not collide.
create unique index if not exists uq_payments_paypal_capture
  on public.payments(paypal_capture_id)
  where paypal_capture_id is not null;
create index if not exists idx_payments_paypal_order
  on public.payments(paypal_order_id);
create index if not exists idx_payments_method
  on public.payments(payment_method);

-- ---------------------------------------------------------------------------
-- 5. Rename the webhook idempotency table (RLS stays enabled; no policies →
--    service-role only, exactly as the Stripe table was).
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'stripe_webhook_events'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'paypal_webhook_events'
  ) then
    alter table public.stripe_webhook_events rename to paypal_webhook_events;
  end if;
end$$;

-- If neither table exists (fresh DB applied out of order), create the PayPal one.
create table if not exists public.paypal_webhook_events (
  id text primary key,                                   -- PayPal event id
  type text not null,
  processed_at timestamptz not null default now()
);

-- Ensure RLS is enabled on the (possibly freshly created) table. No policies
-- are defined → only the service role can read/write it.
alter table public.paypal_webhook_events enable row level security;

-- ---------------------------------------------------------------------------
-- 6. payments RLS — add admin/board INSERT + UPDATE for the mark-paid flow.
--    (The original 009 only granted SELECT; online writes go through the
--    service-role webhook, which bypasses RLS. Mark-paid runs as the admin's
--    own JWT, so it needs explicit INSERT/UPDATE.)
-- ---------------------------------------------------------------------------
drop policy if exists "payments_admin_insert" on public.payments;
create policy "payments_admin_insert"
  on public.payments for insert to authenticated
  with check (public.get_my_role() in ('admin','board'));

drop policy if exists "payments_admin_update" on public.payments;
create policy "payments_admin_update"
  on public.payments for update to authenticated
  using (public.get_my_role() in ('admin','board'))
  with check (public.get_my_role() in ('admin','board'));

-- ============================================================================
-- End 011. Stripe columns/indexes/table removed; PayPal columns + mark-paid
-- path added; uq_dues_open_period intact.
-- ============================================================================
