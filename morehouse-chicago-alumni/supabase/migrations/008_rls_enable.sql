-- ============================================================================
-- 008_rls_enable.sql
-- Lane 1 — enable Row Level Security on ALL 11 tables.
-- Implements docs/data-contract.md §6 + §9 #9 (RLS on EVERY table).
--
-- With RLS enabled and no policy granting access, a table is locked to
-- everyone except the service role (which bypasses RLS). payments,
-- stripe_webhook_events, content_sources, and audit_log (writes) rely on this
-- default-deny posture; their read paths are opened selectively in 009.
-- ============================================================================

alter table public.profiles               enable row level security;
alter table public.members                enable row level security;
alter table public.membership_plans       enable row level security;
alter table public.dues_invoices          enable row level security;
alter table public.payments               enable row level security;
alter table public.events                 enable row level security;
alter table public.event_registrations    enable row level security;
alter table public.content_sources        enable row level security;
alter table public.content_items          enable row level security;
alter table public.audit_log              enable row level security;
alter table public.stripe_webhook_events  enable row level security;

-- Note: stripe_webhook_events intentionally receives NO policies (service role
-- only). The custom_access_token_hook read policy on profiles is defined in
-- 007 alongside the function it serves.
