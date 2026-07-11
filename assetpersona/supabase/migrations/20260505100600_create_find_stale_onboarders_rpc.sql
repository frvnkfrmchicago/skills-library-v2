-- ═══════════════════════════════════════════════
-- AP-LAUNCH-2026-05 · Wave 5 · Final Polish
-- RPC: find_stale_onboarders — powers the engagement-nudges n8n workflow
-- ═══════════════════════════════════════════════
-- Lookup function called daily by n8n. Returns users who have:
--   - signed up at least N days ago,
--   - onboarding_step below the threshold,
--   - opted into email,
--   - NOT received a nudge in the last 7 days.
--
-- SECURITY DEFINER so n8n can call it via service-role key without granting
-- direct table-read on auth.users to the anon role.
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.find_stale_onboarders(
  min_age_days int DEFAULT 3,
  max_step int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  display_name text,
  email text,
  onboarding_step int,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.display_name,
    u.email,
    p.onboarding_step,
    u.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.onboarding_step < max_step
    AND u.created_at < (now() - make_interval(days => min_age_days))
    AND COALESCE(p.email_opt_in, false) = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_events e
      WHERE e.user_id = p.id
        AND e.event_type = 'nudge_sent'
        AND e.created_at > (now() - interval '7 days')
    )
  LIMIT 100;
$$;

-- Restrict execution to the service role + authenticated admins
REVOKE ALL ON FUNCTION public.find_stale_onboarders(int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_stale_onboarders(int, int) TO service_role;
