-- ═══════════════════════════════════════════════
-- AP-LAUNCH-READY-2026-05 · Lane 6 · Backend Hardening
-- Move the faceless filter from app code into RLS
-- ═══════════════════════════════════════════════
-- Before this migration: 20260505200100_create_progress.sql created a public
-- read policy on module_completions with USING (true) and a comment saying
-- "filter faceless in the client." That meant a curl/SQL snooper could
-- SELECT every faceless completion directly, exposing user_id <-> module_id
-- pairs that the UI takes pains to hide.
--
-- After this migration: the policy filters at the DB. The completion ticker
-- never receives faceless rows owned by other users. Only the owner of a
-- faceless row sees it.
--
-- Faceless flag lives on public.profiles.faceless (created in
-- 20260505300000_extend_profiles_engagement.sql) — we join through profile
-- by user_id to read it.
-- ═══════════════════════════════════════════════

-- Drop the too-broad public-read policy.
DROP POLICY IF EXISTS "Public read completions" ON public.module_completions;

-- Replace with a DB-level filter:
--   * Owner always sees their own (faceless or not).
--   * Everyone else only sees rows whose owner.faceless = false.
CREATE POLICY "Public read non-faceless completions"
  ON public.module_completions
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
        FROM public.profiles p
       WHERE p.id = public.module_completions.user_id
         AND COALESCE(p.faceless, false) = false
    )
  );

-- ── Supporting index on profiles.faceless ──
-- The above EXISTS subquery filters by faceless = false. A partial index on
-- profiles(id) WHERE faceless = false lets the planner satisfy the JOIN cheap.
CREATE INDEX IF NOT EXISTS idx_profiles_non_faceless
  ON public.profiles (id)
  WHERE faceless = false;

-- Note: the existing "Users read own completions" + "Admin read all completions"
-- policies from 20260505200100_create_progress.sql remain in place. RLS is
-- OR-evaluated across SELECT policies, so this new policy widens (not narrows)
-- non-owner access exactly to the non-faceless slice — which is what the UI
-- ticker needs.
