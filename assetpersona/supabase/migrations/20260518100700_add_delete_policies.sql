-- ═══════════════════════════════════════════════
-- AP-LAUNCH-READY-2026-05 · Lane 6 · Backend Hardening
-- GDPR DELETE coverage on learner-owned tables
-- ═══════════════════════════════════════════════
-- Audit found six learner-owned tables with RLS-enabled SELECT/INSERT but
-- no DELETE policy at all — meaning a user could neither delete their own
-- rows via the API nor honor a "right to be forgotten" request without
-- service_role tooling. This migration adds scoped DELETE policies on:
--
--   * public.user_module_progress     (per-step progress trail)
--   * public.module_completions       (completed-module rollup)
--   * public.streaks                  (one row per user)
--   * public.achievements             (badges)
--   * public.user_events              (domain event log; previously append-only)
--   * public.learner_events           (broad analytics timeline)
--
-- ON DELETE CASCADE on the parent profiles row already wipes these when the
-- entire account is deleted by admin. These policies cover the everyday case:
-- a user removing their own data from inside the app, without admin escalation.
-- ═══════════════════════════════════════════════

-- ── user_module_progress ──
DROP POLICY IF EXISTS "Users delete own progress" ON public.user_module_progress;
CREATE POLICY "Users delete own progress"
  ON public.user_module_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ── module_completions ──
DROP POLICY IF EXISTS "Users delete own completions" ON public.module_completions;
CREATE POLICY "Users delete own completions"
  ON public.module_completions FOR DELETE
  USING (auth.uid() = user_id);

-- ── streaks ──
DROP POLICY IF EXISTS "Users delete own streak" ON public.streaks;
CREATE POLICY "Users delete own streak"
  ON public.streaks FOR DELETE
  USING (auth.uid() = user_id);

-- ── achievements ──
DROP POLICY IF EXISTS "Users delete own achievements" ON public.achievements;
CREATE POLICY "Users delete own achievements"
  ON public.achievements FOR DELETE
  USING (auth.uid() = user_id);

-- ── user_events ──
-- The original migration noted "append-only — no DELETE." For GDPR this is
-- relaxed: users may erase their own event trail. Admin read-all stays via
-- the existing "Admin read all events" SELECT policy.
DROP POLICY IF EXISTS "Users delete own events" ON public.user_events;
CREATE POLICY "Users delete own events"
  ON public.user_events FOR DELETE
  USING (auth.uid() = user_id);

-- ── learner_events ──
DROP POLICY IF EXISTS "Users delete own learner events" ON public.learner_events;
CREATE POLICY "Users delete own learner events"
  ON public.learner_events FOR DELETE
  USING (auth.uid() = user_id);

-- ── Admin escalation: admins can DELETE any of these (right-to-be-forgotten support) ──
DROP POLICY IF EXISTS "Admin delete progress" ON public.user_module_progress;
CREATE POLICY "Admin delete progress"
  ON public.user_module_progress FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admin delete completions" ON public.module_completions;
CREATE POLICY "Admin delete completions"
  ON public.module_completions FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admin delete streaks" ON public.streaks;
CREATE POLICY "Admin delete streaks"
  ON public.streaks FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admin delete achievements" ON public.achievements;
CREATE POLICY "Admin delete achievements"
  ON public.achievements FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admin delete user_events" ON public.user_events;
CREATE POLICY "Admin delete user_events"
  ON public.user_events FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admin delete learner_events" ON public.learner_events;
CREATE POLICY "Admin delete learner_events"
  ON public.learner_events FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
