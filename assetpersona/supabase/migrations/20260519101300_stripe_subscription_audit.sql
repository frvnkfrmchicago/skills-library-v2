-- ═══ AP-MODERNIZE-2026-05 · Wave 5 · Stripe subscription audit ═══
--
-- Why this migration exists:
--   The `profiles.tier` column is set manually in Supabase today. Visitors
--   pay via a Stripe Payment Link, return to the site, and nothing happens.
--   This migration backs the new `stripe-webhook` Edge Function with:
--     1. Stripe identifiers stored on profile rows so we can match incoming
--        webhook events to the right user.
--     2. An append-only audit table so every Stripe event we accept has a
--        durable record (idempotency + auditability + ops debugging).
--
-- Plain meaning:
--   - profiles gains four extra fields about a user's paid plan.
--   - subscription_events stores every Stripe event we've already processed,
--     so we never run the same checkout twice if Stripe retries.

-- 1. Profile-level subscription state -----------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- One Stripe customer maps to one profile.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription
  ON public.profiles (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.stripe_customer_id IS
  'Stripe Customer ID set by stripe-webhook on checkout.session.completed.';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS
  'Stripe Subscription ID. Cleared on customer.subscription.deleted.';
COMMENT ON COLUMN public.profiles.subscription_status IS
  'Last subscription status from Stripe (active, past_due, canceled, etc).';
COMMENT ON COLUMN public.profiles.current_period_end IS
  'When the current paid period ends. Used by UI to show renewal info.';

-- 2. Append-only audit of every Stripe event ----------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  stripe_event_type text NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- Only admins can read subscription_events from the client. The Edge Function
-- writes with service_role and bypasses RLS.
DROP POLICY IF EXISTS "Sub events admin read" ON public.subscription_events;
CREATE POLICY "Sub events admin read"
  ON public.subscription_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_subscription_events_user_processed
  ON public.subscription_events (user_id, processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_events_type_processed
  ON public.subscription_events (stripe_event_type, processed_at DESC);

COMMENT ON TABLE public.subscription_events IS
  'Append-only audit of every Stripe webhook event the stripe-webhook function has accepted. stripe_event_id is unique so retries are idempotent.';
