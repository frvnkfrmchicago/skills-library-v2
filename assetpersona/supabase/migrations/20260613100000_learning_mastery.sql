-- ═══════════════════════════════════════════════
-- AP-STUDYHALL-REBUILD-2026-06 · Lane 1 · Learning tracking + mastery + SRS
-- ═══════════════════════════════════════════════
-- The learn experience previously persisted only `module_completions`,
-- `user_module_progress` (per-step), and streaks. Quiz performance was
-- thrown away — `quizScore` lived in React state and vanished on unmount,
-- so the system could never tell a learner what they actually knew, nor
-- pace a review. These three tables close that gap:
--
--   quiz_attempts   — one row per answered question (correctness + choice).
--                     This is the raw signal mastery + analytics read from.
--   user_mastery    — rolled-up per-module mastery score (0-100) + state.
--                     Drives the "ready to assess" gate and the role ladder.
--   review_schedule — spaced-repetition due dates. Intervals follow the
--                     2026 retention curve (1 day → 1 week → 1 month), the
--                     pattern documented at 7taps + 5mins.ai. A pass
--                     advances the box; a miss resets it to box 0.
--
-- RLS contract (mirrors module_completions): a learner reads + writes only
-- their own rows; admins read all for the LearnerExplorer analytics view.
-- ═══════════════════════════════════════════════

-- ── QUIZ ATTEMPTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL,
  question_id text NOT NULL,
  selected_index integer NOT NULL,
  is_correct boolean NOT NULL,
  attempt_no integer NOT NULL DEFAULT 1,
  answered_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learner reads own quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin reads all quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Learner writes own quiz attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_module
  ON public.quiz_attempts (user_id, module_id, answered_at DESC);

-- ── USER MASTERY ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL,
  -- 0-100. Last-quiz percent, smoothed toward the running best so a single
  -- bad run doesn't wipe demonstrated mastery.
  score integer NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  best_score integer NOT NULL DEFAULT 0 CHECK (best_score BETWEEN 0 AND 100),
  attempts integer NOT NULL DEFAULT 0,
  -- 'learning' until the learner clears the mastery threshold, then 'mastered'.
  state text NOT NULL DEFAULT 'learning' CHECK (state IN ('learning', 'mastered')),
  last_assessed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

ALTER TABLE public.user_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learner reads own mastery" ON public.user_mastery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin reads all mastery" ON public.user_mastery
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Learner upserts own mastery" ON public.user_mastery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Learner updates own mastery" ON public.user_mastery
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_mastery_user ON public.user_mastery (user_id, state);

-- ── REVIEW SCHEDULE (spaced repetition) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.review_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL,
  -- Leitner box. 0 = just learned. Higher box = longer interval.
  box integer NOT NULL DEFAULT 0 CHECK (box BETWEEN 0 AND 5),
  due_on date NOT NULL,
  last_reviewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

ALTER TABLE public.review_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learner reads own review schedule" ON public.review_schedule
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Learner upserts own review schedule" ON public.review_schedule
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Learner updates own review schedule" ON public.review_schedule
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_review_schedule_due
  ON public.review_schedule (user_id, due_on);
