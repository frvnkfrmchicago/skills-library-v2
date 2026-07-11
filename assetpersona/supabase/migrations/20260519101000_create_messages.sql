-- ═══════════════════════════════════════════════
-- AP-MODERNIZE-2026-05 · Lane 2 · Direct Messages
-- dm_threads + dm_messages + dm_thread_reads tables (RLS-first)
-- ═══════════════════════════════════════════════
-- Frank's earlier product decision was: "Asset Persona does not run direct
-- messaging." That note still lives in UserSettings.tsx and in
-- src/data/communityData.ts as a long-form rationale. This lane reverses
-- the decision with proper plumbing: participant-only RLS, per-thread
-- Realtime, read-state tracking, and a canonical ordered participant pair
-- so the same two members can never have two parallel threads.
--
-- Schema notes:
--   - dm_threads canonicalizes participants via CHECK (participant_a <
--     participant_b) + UNIQUE (participant_a, participant_b). Application
--     code MUST sort the two uuids before insert so a single pair maps to
--     a single row.
--   - dm_threads.last_message_at + last_message_preview are denormalized
--     for cheap inbox rendering; they are kept in sync by a trigger.
--   - dm_thread_reads carries one row per (thread, participant) and gets
--     touched whenever a participant opens a thread. The inbox derives
--     the unread badge by comparing last_read_at against last_message_at.
--   - All three tables are RLS-enabled. Only the two participants can
--     read or write their thread + messages + their own read row.
--
-- Project trigger function: public.update_updated_at() exists already
-- (see 20260414180447_create_events_system.sql). We do NOT need it here
-- because dm_messages is append-only and dm_threads.updated_at is implied
-- by last_message_at. We DO define a dedicated trigger that bumps the
-- thread row on each new message.
-- ═══════════════════════════════════════════════

-- ── Tables ──

CREATE TABLE IF NOT EXISTS public.dm_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_b uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dm_threads_canonical_order CHECK (participant_a < participant_b),
  CONSTRAINT dm_threads_unique_pair UNIQUE (participant_a, participant_b)
);

CREATE TABLE IF NOT EXISTS public.dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dm_thread_reads (
  thread_id uuid NOT NULL REFERENCES public.dm_threads(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, participant_id)
);

-- ── Indexes ──

-- Inbox query: pull every thread for participant X ordered by recency.
CREATE INDEX IF NOT EXISTS idx_dm_threads_participant_a_last_msg
  ON public.dm_threads (participant_a, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_threads_participant_b_last_msg
  ON public.dm_threads (participant_b, last_message_at DESC);

-- Thread page query: pull every message in a thread in chronological order.
CREATE INDEX IF NOT EXISTS idx_dm_messages_thread_created
  ON public.dm_messages (thread_id, created_at);

-- ── RLS ──

ALTER TABLE public.dm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_thread_reads ENABLE ROW LEVEL SECURITY;

-- dm_threads: only the two participants can read or insert.
CREATE POLICY "Threads participant read"
  ON public.dm_threads FOR SELECT
  USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Threads participant insert"
  ON public.dm_threads FOR INSERT
  WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

-- dm_threads update is necessary for the trigger to bump last_message_at /
-- last_message_preview. The trigger runs as SECURITY DEFINER so it bypasses
-- RLS, but we also allow participants to update their own thread metadata
-- in case the client ever needs to (e.g. archive flag in a future lane).
CREATE POLICY "Threads participant update"
  ON public.dm_threads FOR UPDATE
  USING (auth.uid() = participant_a OR auth.uid() = participant_b)
  WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

-- dm_messages: read + insert gated by membership in the parent thread.
CREATE POLICY "Messages participant read"
  ON public.dm_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dm_threads t
      WHERE t.id = thread_id
        AND (auth.uid() = t.participant_a OR auth.uid() = t.participant_b)
    )
  );

CREATE POLICY "Messages participant insert"
  ON public.dm_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.dm_threads t
      WHERE t.id = thread_id
        AND (auth.uid() = t.participant_a OR auth.uid() = t.participant_b)
    )
  );

-- dm_thread_reads: a participant only manages their own read row.
CREATE POLICY "Reads own select"
  ON public.dm_thread_reads FOR SELECT
  USING (auth.uid() = participant_id);

CREATE POLICY "Reads own insert"
  ON public.dm_thread_reads FOR INSERT
  WITH CHECK (auth.uid() = participant_id);

CREATE POLICY "Reads own update"
  ON public.dm_thread_reads FOR UPDATE
  USING (auth.uid() = participant_id)
  WITH CHECK (auth.uid() = participant_id);

-- ── Trigger: bump dm_threads.last_message_at / preview on new message ──

CREATE OR REPLACE FUNCTION public.update_dm_thread_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.dm_threads
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.body, 140)
  WHERE id = NEW.thread_id;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_dm_message_updates_thread ON public.dm_messages;
CREATE TRIGGER trg_dm_message_updates_thread
  AFTER INSERT ON public.dm_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dm_thread_on_message();
