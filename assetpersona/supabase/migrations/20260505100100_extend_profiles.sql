-- ═══════════════════════════════════════════════
-- AP-LAUNCH-2026-05 · Wave 1 · Foundation
-- Extend profiles for consultant-grade profiling + onboarding state
-- ═══════════════════════════════════════════════
-- Adds the columns Wave 2 (capture) and Wave 3 (engagement) need:
--   - industry / company / marketing_role: consultant context
--   - goals: structured jsonb so we can render specific nudges
--   - services_interest: array of pathway intent set by the WelcomeModal
--   - onboarding_step: integer 0..3, drives the OnboardingChecklist
--   - email_opt_in: explicit consent for marketing email
--   - last_seen_at: powers MemberCRM enrichment + nudge eligibility
-- All columns use IF NOT EXISTS so this migration is safe to re-run.
-- ═══════════════════════════════════════════════

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marketing_role text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goals jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS services_interest jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_opt_in boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Constrain onboarding_step to a sensible range
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_onboarding_step_range'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_onboarding_step_range
      CHECK (onboarding_step >= 0 AND onboarding_step <= 10);
  END IF;
END $$;

-- Index for nudge query: "users behind on onboarding"
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_step
  ON public.profiles (onboarding_step)
  WHERE onboarding_step < 3;

-- Index for "recently active" / "stale" queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at
  ON public.profiles (last_seen_at);
