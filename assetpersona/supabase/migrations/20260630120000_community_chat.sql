-- ═══════════════════════════════════════════════
-- AP-STUDYHALL-CHAT-2026-06 · Lane 1 · Community Chat
-- chat_messages — real-time GROUP chat in shared channels
-- ═══════════════════════════════════════════════
-- This is group chat: every authenticated member sees the same messages in a
-- channel, the way a Discord/Slack channel works. It is NOT direct messaging
-- (1:1 DMs were deliberately removed from this product). channel_id is a plain
-- text slug from a small fixed taxonomy held in the client (lobby, wins, help,
-- showcase) — no separate channels table is needed because the set never grows
-- at runtime.
--
-- author_id references auth.users so a message is owned by the authenticated
-- account directly. Reads + inserts are open to any signed-in member; only the
-- author can delete their own message.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id text NOT NULL,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Index ──
-- The dominant read pattern: one channel's messages, oldest first.
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_created
  ON public.chat_messages (channel_id, created_at);

-- ── RLS ──
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Any authenticated member can read every channel (no anonymous browsing).
CREATE POLICY "Authed read chat_messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- A member can post only as themselves.
CREATE POLICY "Authors insert own chat_messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- A member can delete only their own message.
CREATE POLICY "Authors delete own chat_messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = author_id);

-- ── Realtime ──
-- Delivery rides Supabase Realtime postgres_changes, so the table must be in
-- the supabase_realtime publication. REPLICA IDENTITY FULL ensures DELETE
-- payloads carry the row's columns (the client needs the id to drop it).
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END
$$;
