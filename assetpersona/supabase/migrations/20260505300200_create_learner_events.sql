-- ═══════════════════════════════════════════════
-- AP-PLATFORM-2026-05 · Analytics Spine Agent 4
-- learner_events — server-side append-only event log
-- ═══════════════════════════════════════════════
-- Mirrors what analytics.ts already pushes to localStorage in dev/bypass,
-- but persists across browsers + powers the admin LearnerExplorer page +
-- feeds the drift-score function used by Engagement Agent 5.
--
-- Distinct from `user_events` (AP-LEARN Wave 1) which captures domain
-- events tied to module behavior. `learner_events` is the broad analytics
-- timeline including page_views, signups, inquiry submissions, etc.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.learner_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Anon visitors get a session_id from localStorage
  session_id text,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  path text,
  ip inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_learner_events_user_created
  ON public.learner_events (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_learner_events_type_created
  ON public.learner_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_learner_events_session
  ON public.learner_events (session_id, created_at DESC)
  WHERE session_id IS NOT NULL;

-- ── RLS ──
ALTER TABLE public.learner_events ENABLE ROW LEVEL SECURITY;

-- Users see their own
CREATE POLICY "Users read own learner events"
  ON public.learner_events FOR SELECT
  USING (auth.uid() = user_id);

-- Admin reads all
CREATE POLICY "Admin read all learner events"
  ON public.learner_events FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Authenticated users insert their own
CREATE POLICY "Users insert own learner events"
  ON public.learner_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR (auth.uid() IS NULL AND user_id IS NULL));

-- ── Drift score function ──
-- Returns 0-100. Higher = more likely to churn. Engagement Agent 5 reads this.
-- Math: hours_since_last_event × (1 + (10 - completion_count_30d) / 10) /
--       max(1, freeze_days_used_30d + 1) — clamped 0..100.
CREATE OR REPLACE FUNCTION public.compute_drift_score(p_user_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hours_idle numeric;
  completions_30d int;
  freezes_30d int;
  raw numeric;
BEGIN
  SELECT GREATEST(0, EXTRACT(EPOCH FROM (now() - COALESCE(MAX(created_at), now() - interval '60 days'))) / 3600.0)
    INTO hours_idle
    FROM public.learner_events
   WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO completions_30d
    FROM public.module_completions
   WHERE user_id = p_user_id
     AND completed_at >= now() - interval '30 days';

  SELECT COALESCE(MAX(freeze_days_used), 0) INTO freezes_30d
    FROM public.streaks
   WHERE user_id = p_user_id;

  raw := hours_idle * (1 + GREATEST(0, (10 - completions_30d)) / 10.0)
         / GREATEST(1, freezes_30d + 1);

  RETURN GREATEST(0, LEAST(100, ROUND(raw)));
END;
$$;

REVOKE ALL ON FUNCTION public.compute_drift_score(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.compute_drift_score(uuid) TO authenticated;

-- ── Admin RPC: timeline + drift in one call ──
CREATE OR REPLACE FUNCTION public.admin_learner_timeline(
  search_email text,
  event_limit int DEFAULT 100
)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  email text,
  drift_score int,
  events jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid;
BEGIN
  -- admin only
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
     WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT u.id INTO target
    FROM auth.users u
   WHERE u.email = search_email
   LIMIT 1;

  IF target IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT
      target,
      p.display_name,
      search_email,
      public.compute_drift_score(target),
      COALESCE(
        (
          SELECT jsonb_agg(jsonb_build_object(
            'event_type', e.event_type,
            'payload', e.payload,
            'path', e.path,
            'created_at', e.created_at
          ) ORDER BY e.created_at DESC)
          FROM (
            SELECT * FROM public.learner_events
             WHERE user_id = target
             ORDER BY created_at DESC
             LIMIT event_limit
          ) e
        ),
        '[]'::jsonb
      )
    FROM public.profiles p
   WHERE p.id = target;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_learner_timeline(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_learner_timeline(text, int) TO authenticated;
