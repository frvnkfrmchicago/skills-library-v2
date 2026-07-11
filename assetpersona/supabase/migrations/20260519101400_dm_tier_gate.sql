-- ═══════════════════════════════════════════════
-- AP — DM tier gate
-- Adds `can_open_dm(a, b)` PG function + tightens dm_threads INSERT policy.
--
-- Rules:
--   1. Both participants must be Cohort+ (paid). Free tier (assetClass) cannot
--      open a DM thread.
--   2. If one participant is an admin (Frank), the other participant must be
--      on the Private Lessons tier. So Cohort and Insiders members CANNOT DM
--      Frank directly — they use the public Ask Frank form at /faq. This
--      honors the existing "Direct message access" perk listed in
--      studyhallTiers.ts on the Private Lessons tier.
--   3. Existing threads (rows created under the old open policy) are
--      grandfathered. SELECT/UPDATE/DELETE policies stay scoped to
--      participants. The gate only fires on INSERT.
-- ═══════════════════════════════════════════════

-- ── Helper function ──

CREATE OR REPLACE FUNCTION public.can_open_dm(a uuid, b uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  a_tier text;
  b_tier text;
  a_admin boolean;
  b_admin boolean;
  paid_tiers text[] := ARRAY['cohort', 'cohortYearly', 'insiders', 'insidersYearly', 'privateLessons'];
BEGIN
  IF a IS NULL OR b IS NULL OR a = b THEN
    RETURN false;
  END IF;

  SELECT tier, role = 'admin'
    INTO a_tier, a_admin
    FROM public.profiles WHERE id = a;
  SELECT tier, role = 'admin'
    INTO b_tier, b_admin
    FROM public.profiles WHERE id = b;

  -- Either profile missing → not allowed.
  IF a_tier IS NULL OR b_tier IS NULL THEN
    RETURN false;
  END IF;

  -- Both must be on a paid tier.
  IF NOT (a_tier = ANY(paid_tiers)) OR NOT (b_tier = ANY(paid_tiers)) THEN
    RETURN false;
  END IF;

  -- If one side is admin, the other must be Private Lessons.
  IF a_admin AND b_tier <> 'privateLessons' THEN
    RETURN false;
  END IF;
  IF b_admin AND a_tier <> 'privateLessons' THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.can_open_dm(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_open_dm(uuid, uuid) TO authenticated;

-- ── Tighten dm_threads INSERT policy ──

DROP POLICY IF EXISTS "Threads participant insert" ON public.dm_threads;

CREATE POLICY "Threads tier-gated insert" ON public.dm_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = participant_a OR auth.uid() = participant_b)
    AND public.can_open_dm(participant_a, participant_b)
  );

-- SELECT/UPDATE/DELETE policies are unchanged (see 20260519101000_create_messages.sql).
-- Existing thread rows remain readable + writable by their participants — only NEW threads carry the tier gate.
