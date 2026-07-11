-- ═══════════════════════════════════════════════
-- AP-LEARN-2026-05 · Wave 1 · Foundation
-- Progress + streaks + achievements
-- ═══════════════════════════════════════════════

-- Per-section progress within a module
CREATE TABLE IF NOT EXISTS public.user_module_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  step text NOT NULL,                -- 'hook' | 'context' | 'practice' | 'reflect' | 'complete'
  payload jsonb DEFAULT '{}'::jsonb, -- e.g. { practice_input: '...' }
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id, step)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON public.user_module_progress (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_module ON public.user_module_progress (module_id);

-- Module completions (rollup of progress when 'complete' step reached)
CREATE TABLE IF NOT EXISTS public.module_completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  xp_earned integer NOT NULL DEFAULT 0,
  reflect_text text,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_completions_user ON public.module_completions (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_completions_module ON public.module_completions (module_id);

-- Streaks (one row per user)
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_count integer NOT NULL DEFAULT 0,
  longest_count integer NOT NULL DEFAULT 0,
  last_completed_on date,
  freeze_days_used integer NOT NULL DEFAULT 0,
  freeze_days_available integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Achievements (badges)
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge text NOT NULL,               -- 'first_drill' | 'week_streak' | 'first_crafter' | etc.
  payload jsonb DEFAULT '{}'::jsonb,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge)            -- one earn per badge per user
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements (user_id, earned_at DESC);

-- ── RLS ──
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Users read own progress + completions + streak + achievements
CREATE POLICY "Users read own progress" ON public.user_module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.user_module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.user_module_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own completions" ON public.module_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own completions" ON public.module_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own streak" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own streak" ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own streak" ON public.streaks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins read all (for analytics + leaderboards)
CREATE POLICY "Admin read all progress" ON public.user_module_progress FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Admin read all completions" ON public.module_completions FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Admin read all streaks" ON public.streaks FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Admin read all achievements" ON public.achievements FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Public read of module_completions (for leaderboard / completion feed) — only when faceless=false
-- Faceless filter is applied in client via profiles.faceless flag (Wave 1 ext below).
-- We allow SELECT all here and filter in app. Acceptable: usernames + module slugs are public anyway.
CREATE POLICY "Public read completions" ON public.module_completions FOR SELECT USING (true);

-- ── Streak update trigger ──
CREATE OR REPLACE FUNCTION public.bump_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.streaks%ROWTYPE;
  today date := (NEW.completed_at AT TIME ZONE 'UTC')::date;
BEGIN
  SELECT * INTO s FROM public.streaks WHERE user_id = NEW.user_id;

  IF s IS NULL THEN
    INSERT INTO public.streaks (user_id, current_count, longest_count, last_completed_on)
    VALUES (NEW.user_id, 1, 1, today);
    RETURN NEW;
  END IF;

  IF s.last_completed_on = today THEN
    -- already counted today
    RETURN NEW;
  END IF;

  IF s.last_completed_on = today - 1 OR
     (s.last_completed_on = today - 2 AND s.freeze_days_available > 0) THEN
    -- continue streak (consume 1 freeze day if needed)
    UPDATE public.streaks
       SET current_count = s.current_count + 1,
           longest_count = GREATEST(s.longest_count, s.current_count + 1),
           last_completed_on = today,
           freeze_days_used = s.freeze_days_used + CASE WHEN s.last_completed_on = today - 2 THEN 1 ELSE 0 END,
           freeze_days_available = s.freeze_days_available - CASE WHEN s.last_completed_on = today - 2 THEN 1 ELSE 0 END,
           updated_at = now()
     WHERE user_id = NEW.user_id;
  ELSE
    -- streak broken — restart at 1
    UPDATE public.streaks
       SET current_count = 1,
           last_completed_on = today,
           updated_at = now()
     WHERE user_id = NEW.user_id;
  END IF;

  -- Earn 1 freeze day for every 4 days streaked (cap at 3 available)
  UPDATE public.streaks
     SET freeze_days_available = LEAST(3, freeze_days_available + CASE WHEN current_count > 0 AND current_count % 4 = 0 THEN 1 ELSE 0 END)
   WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS module_completions_bump_streak ON public.module_completions;
CREATE TRIGGER module_completions_bump_streak
  AFTER INSERT ON public.module_completions
  FOR EACH ROW EXECUTE FUNCTION public.bump_streak();

-- ── Streak updated_at ──
CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
