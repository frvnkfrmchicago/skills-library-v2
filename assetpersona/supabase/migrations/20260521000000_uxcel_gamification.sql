-- ═══════════════════════════════════════════════
-- AP-GAMIFICATION · Wave 1 · Leagues & Streaks
-- ═══════════════════════════════════════════════

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.streak_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, completed_date)
);

CREATE TABLE IF NOT EXISTS public.user_leagues (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  league_tier text NOT NULL DEFAULT 'Quartz', -- Quartz, Sapphire, Emerald, Diamond
  weekly_px integer NOT NULL DEFAULT 0,
  league_bracket_id text NOT NULL DEFAULT 'default-bracket',
  current_rank integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_streak_logs_user ON public.streak_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_user_leagues_bracket ON public.user_leagues (league_bracket_id);
CREATE INDEX IF NOT EXISTS idx_user_leagues_tier ON public.user_leagues (league_tier);

-- 3. Row Level Security
ALTER TABLE public.streak_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_leagues ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users read own streak_logs" ON public.streak_logs;
CREATE POLICY "Users read own streak_logs" ON public.streak_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own streak_logs" ON public.streak_logs;
CREATE POLICY "Users insert own streak_logs" ON public.streak_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin read all streak_logs" ON public.streak_logs;
CREATE POLICY "Admin read all streak_logs" ON public.streak_logs FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Anyone can read user_leagues" ON public.user_leagues;
CREATE POLICY "Anyone can read user_leagues" ON public.user_leagues FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own user_league" ON public.user_leagues;
CREATE POLICY "Users insert own user_league" ON public.user_leagues FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own user_league" ON public.user_leagues;
CREATE POLICY "Users update own user_league" ON public.user_leagues FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin write all user_leagues" ON public.user_leagues;
CREATE POLICY "Admin write all user_leagues" ON public.user_leagues FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 5. Triggers and Functions

-- Recalculate ranks trigger
CREATE OR REPLACE FUNCTION public.recalculate_league_ranks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_leagues ul
  SET current_rank = sub.new_rank
  FROM (
    SELECT user_id, row_number() OVER (ORDER BY weekly_px DESC) as new_rank
    FROM public.user_leagues
    WHERE league_bracket_id = NEW.league_bracket_id AND league_tier = NEW.league_tier
  ) sub
  WHERE ul.user_id = sub.user_id AND ul.current_rank IS DISTINCT FROM sub.new_rank;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_leagues_recalculate_ranks ON public.user_leagues;
CREATE TRIGGER user_leagues_recalculate_ranks
  AFTER INSERT OR UPDATE OF weekly_px ON public.user_leagues
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_league_ranks();

-- Trigger function on insert of module_completions
CREATE OR REPLACE FUNCTION public.handle_module_completion_gamification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (NEW.completed_at AT TIME ZONE 'UTC')::date;
  v_bracket_id text;
  v_tier text := 'Quartz';
  v_daily_px integer;
BEGIN
  -- 1. Log completion date
  INSERT INTO public.streak_logs (user_id, completed_date)
  VALUES (NEW.user_id, v_today)
  ON CONFLICT (user_id, completed_date) DO NOTHING;

  -- 2. Determine bracket (e.g. bracket-Quartz-2026-21)
  -- First check if user already has a league tier, else default to 'Quartz'
  SELECT league_tier INTO v_tier FROM public.user_leagues WHERE user_id = NEW.user_id;
  IF v_tier IS NULL THEN
    v_tier := 'Quartz';
  END IF;

  v_bracket_id := 'bracket-' || v_tier || '-' || to_char(NEW.completed_at, 'IYYY-IW');

  -- 3. Upsert user league points
  INSERT INTO public.user_leagues (user_id, league_tier, weekly_px, league_bracket_id, current_rank)
  VALUES (NEW.user_id, v_tier, NEW.xp_earned, v_bracket_id, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    weekly_px = CASE
      WHEN public.user_leagues.league_bracket_id = v_bracket_id
      THEN public.user_leagues.weekly_px + EXCLUDED.weekly_px
      ELSE EXCLUDED.weekly_px
    END,
    league_bracket_id = v_bracket_id,
    updated_at = now();

  -- 4. Check daily goal (100 PX)
  SELECT COALESCE(SUM(xp_earned), 0) INTO v_daily_px
  FROM public.module_completions
  WHERE user_id = NEW.user_id AND (completed_at AT TIME ZONE 'UTC')::date = v_today;

  -- Daily goal reached could optionally trigger achievements or other actions.
  -- For now we just log/verify it.
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS module_completions_gamification ON public.module_completions;
CREATE TRIGGER module_completions_gamification
  AFTER INSERT ON public.module_completions
  FOR EACH ROW EXECUTE FUNCTION public.handle_module_completion_gamification();
