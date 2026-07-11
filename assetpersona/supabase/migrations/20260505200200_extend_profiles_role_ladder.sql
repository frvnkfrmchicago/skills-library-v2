-- ═══════════════════════════════════════════════
-- AP-LEARN-2026-05 · Wave 1 · Foundation
-- Extend profiles with learner role ladder + xp + faceless mode
-- ═══════════════════════════════════════════════
-- Note: `role` is admin-vs-member auth role (existing).
-- `tier` is Study Hall membership tier (from launch packet).
-- `learner_role` is the LADDER position (what kind of learner are you?).
-- All three coexist.
-- ═══════════════════════════════════════════════

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learner_role public.learner_role DEFAULT 'curious';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS faceless boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learner_label text;  -- custom display ("AI Crafter")

-- XP thresholds drive learner_role automatically (advisory; admins can override)
CREATE OR REPLACE FUNCTION public.bump_xp_and_role(p_user_id uuid, p_delta integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_xp integer;
  new_role public.learner_role;
BEGIN
  UPDATE public.profiles
     SET xp = COALESCE(xp, 0) + p_delta
   WHERE id = p_user_id
   RETURNING xp INTO new_xp;

  -- Derive role from xp (don't downgrade — only advance)
  new_role := CASE
    WHEN new_xp >= 1500 THEN 'producer'
    WHEN new_xp >= 700  THEN 'architect'
    WHEN new_xp >= 250  THEN 'crafter'
    WHEN new_xp >= 50   THEN 'operator'
    ELSE 'curious'
  END::public.learner_role;

  UPDATE public.profiles
     SET learner_role = new_role
   WHERE id = p_user_id
     AND (learner_role IS NULL OR
          CASE learner_role
            WHEN 'curious' THEN 0
            WHEN 'operator' THEN 1
            WHEN 'crafter' THEN 2
            WHEN 'architect' THEN 3
            WHEN 'producer' THEN 4
          END
          <
          CASE new_role
            WHEN 'curious' THEN 0
            WHEN 'operator' THEN 1
            WHEN 'crafter' THEN 2
            WHEN 'architect' THEN 3
            WHEN 'producer' THEN 4
          END);
END;
$$;

REVOKE ALL ON FUNCTION public.bump_xp_and_role(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bump_xp_and_role(uuid, integer) TO authenticated, service_role;

-- Trigger on completion: award xp_reward to user (default 10)
CREATE OR REPLACE FUNCTION public.award_xp_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reward integer;
BEGIN
  SELECT xp_reward INTO reward FROM public.modules WHERE id = NEW.module_id;
  PERFORM public.bump_xp_and_role(NEW.user_id, COALESCE(NEW.xp_earned, reward, 10));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS completions_award_xp ON public.module_completions;
CREATE TRIGGER completions_award_xp
  AFTER INSERT ON public.module_completions
  FOR EACH ROW EXECUTE FUNCTION public.award_xp_on_completion();

-- Index for the leaderboard / role-aware suggested-next-module query
CREATE INDEX IF NOT EXISTS idx_profiles_learner_role ON public.profiles (learner_role);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles (xp DESC);
