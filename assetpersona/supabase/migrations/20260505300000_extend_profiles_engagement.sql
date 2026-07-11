-- ═══════════════════════════════════════════════
-- AP-PLATFORM-2026-05 · Profile Schema Agent 1
-- Engagement-related profile columns + bump_onboarding_step RPC
-- ═══════════════════════════════════════════════
-- The existing AP-LEARN packet's WelcomeModal already writes to
-- profiles.services_interest + profiles.onboarding_step, but those columns
-- never existed — every write fails silently. This migration creates them.
--
-- Also adds: email opt-in + faceless toggle (controls whether the user shows
-- up in the public completion ticker built by Engagement Layer Agent 5).
-- ═══════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS services_interest text NULL,
  ADD COLUMN IF NOT EXISTS onboarding_step int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS email_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_subscribed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS faceless boolean NOT NULL DEFAULT false;

-- Onboarding step CHECK: keep it sane (0..10)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_onboarding_step_range;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_onboarding_step_range
  CHECK (onboarding_step >= 0 AND onboarding_step <= 10);

-- services_interest enum-ish CHECK (keep it text so admin can extend later)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_services_interest_values;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_services_interest_values
  CHECK (
    services_interest IS NULL
    OR services_interest IN ('hire', 'speaking', 'training', 'learn', 'marketing', 'other')
  );

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_profiles_email_opt_in
  ON public.profiles (email_opt_in)
  WHERE email_opt_in = true;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_step
  ON public.profiles (onboarding_step)
  WHERE onboarding_step < 3;

-- ── RPC: bump_onboarding_step ──
CREATE OR REPLACE FUNCTION public.bump_onboarding_step(min_step int DEFAULT 0)
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
     SET onboarding_step = GREATEST(onboarding_step + 1, min_step + 1)
   WHERE id = auth.uid()
  RETURNING onboarding_step;
$$;

REVOKE ALL ON FUNCTION public.bump_onboarding_step(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bump_onboarding_step(int) TO authenticated;

-- ── Helper RPC: set_services_interest ──
-- Used by WelcomeModal so the chip pick is one round-trip, not two.
CREATE OR REPLACE FUNCTION public.set_services_interest(
  interest text,
  opt_in_email boolean DEFAULT false
)
RETURNS public.profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
     SET services_interest = interest,
         onboarding_step = GREATEST(onboarding_step, 1),
         email_opt_in = COALESCE(opt_in_email, email_opt_in),
         email_subscribed_at = CASE
           WHEN opt_in_email = true AND email_subscribed_at IS NULL
             THEN now()
           ELSE email_subscribed_at
         END
   WHERE id = auth.uid()
  RETURNING *;
$$;

REVOKE ALL ON FUNCTION public.set_services_interest(text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_services_interest(text, boolean) TO authenticated;
