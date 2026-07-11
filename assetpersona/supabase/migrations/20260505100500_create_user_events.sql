-- ═══════════════════════════════════════════════
-- AP-LAUNCH-2026-05 · Wave 1 · Foundation
-- Create user_events table — append-only event log
-- ═══════════════════════════════════════════════
-- Powers behavior-triggered everboarding (Wave 3 Agent 6 writes here,
-- Wave 2 Agent 4's nudge workflow reads from it). Append-only. Light
-- enough to write on every tracked event, indexed for the nudge query
-- "users who haven't done X in N days."
--
-- Tracked event types (extensible — kept as text not enum so we don't
-- need a migration to add new ones):
--   signup, profile_started, profile_completed, inquiry_submitted,
--   event_registered, post_view, feed_post, tier_upgrade, nudge_sent
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  session_id text,
  ip inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes for the nudge workflow ──
-- "Users who did X recently / haven't done X in N days"
CREATE INDEX IF NOT EXISTS idx_user_events_user_type_created
  ON public.user_events (user_id, event_type, created_at DESC);

-- "All recent events of type X" (for analytics roll-ups)
CREATE INDEX IF NOT EXISTS idx_user_events_type_created
  ON public.user_events (event_type, created_at DESC);

-- ── RLS ──
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- Users read their own events
CREATE POLICY "Users read own events"
  ON public.user_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins read all events
CREATE POLICY "Admin read all events"
  ON public.user_events
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Authenticated users insert their own events (for client analytics tracking)
CREATE POLICY "Users insert own events"
  ON public.user_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service-role (Edge Functions, n8n via secret) can also insert via bypass.
-- nudge_sent rows specifically come from server-side, not client.

-- No UPDATE / DELETE policies — events are append-only.

-- ── Helper: bump profiles.last_seen_at on every event ──
CREATE OR REPLACE FUNCTION public.bump_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles
       SET last_seen_at = NEW.created_at
     WHERE id = NEW.user_id
       AND (last_seen_at IS NULL OR last_seen_at < NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_events_bump_last_seen ON public.user_events;
CREATE TRIGGER user_events_bump_last_seen
  AFTER INSERT ON public.user_events
  FOR EACH ROW EXECUTE FUNCTION public.bump_last_seen();
