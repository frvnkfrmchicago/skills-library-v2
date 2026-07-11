-- ═══════════════════════════════════════════════
-- AP-LAUNCH-READY-2026-05 · Lane 6 · Backend Hardening
-- follows — member-follows-member graph
-- ═══════════════════════════════════════════════
-- Composite primary key (follower_id, followee_id) prevents duplicate
-- follow rows by construction — no UNIQUE-constraint workaround needed.
-- A self-follow is rejected by CHECK so the feed query doesn't have to
-- filter it out everywhere.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CONSTRAINT follows_no_self CHECK (follower_id <> followee_id)
);

-- ── Indexes ──
-- "Who am I following?" (feed assembly).
CREATE INDEX IF NOT EXISTS idx_follows_follower_created
  ON public.follows (follower_id, created_at DESC);

-- "Who follows me?" (notification fan-out, profile counter).
CREATE INDEX IF NOT EXISTS idx_follows_followee_created
  ON public.follows (followee_id, created_at DESC);

-- ── RLS ──
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Authenticated members read the graph (needed to render follow buttons).
CREATE POLICY "Authed read follows"
  ON public.follows FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only the follower can create a follow edge (you can't be forced to follow).
CREATE POLICY "Followers insert own follow"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Only the follower can unfollow themselves out of the edge.
-- (We don't let the followee remove their own followers — that's a block, which is a separate table.)
CREATE POLICY "Followers delete own follow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);
