-- ═══════════════════════════════════════════════
-- AP-LAUNCH-READY-2026-05 · Lane 6 · Backend Hardening
-- post_comments + post_likes — threaded discussion + reactions
-- ═══════════════════════════════════════════════
-- post_comments allows one level of nesting via parent_id (a flat list with
-- optional reply pointer is enough for v1 — no recursive CTE required for the
-- common "10 top-level comments, 3 replies each" feed page).
--
-- post_likes is keyed by (post_id, author_id, kind) so the same user can
-- leave a 'like' and a 'celebrate' on the same post without violating the
-- primary key, but cannot stack two of the same reaction.
-- ═══════════════════════════════════════════════

-- ── post_comments ──
CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Comments-by-post (the dominant read pattern).
CREATE INDEX IF NOT EXISTS idx_post_comments_post_created
  ON public.post_comments (post_id, created_at ASC);

-- Replies-to-parent (fetching a thread).
CREATE INDEX IF NOT EXISTS idx_post_comments_parent
  ON public.post_comments (parent_id)
  WHERE parent_id IS NOT NULL;

-- Author's own comments (profile page).
CREATE INDEX IF NOT EXISTS idx_post_comments_author_created
  ON public.post_comments (author_id, created_at DESC);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Authenticated members read all comments (mirrors posts policy).
CREATE POLICY "Authed read post_comments"
  ON public.post_comments FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authors create their own comments.
CREATE POLICY "Authors insert own post_comments"
  ON public.post_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors edit their own (rare, but allowed for fixups).
CREATE POLICY "Authors update own post_comments"
  ON public.post_comments FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Authors delete their own; admins + moderators also delete.
CREATE POLICY "Authors delete own post_comments"
  ON public.post_comments FOR DELETE
  USING (
    auth.uid() = author_id
    OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')
    )
  );

-- ── post_likes ──
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'like',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, author_id, kind)
);

-- Likes-by-post (count + render reaction summary).
CREATE INDEX IF NOT EXISTS idx_post_likes_post
  ON public.post_likes (post_id);

-- Author's own likes (e.g. "posts you liked" page).
CREATE INDEX IF NOT EXISTS idx_post_likes_author_created
  ON public.post_likes (author_id, created_at DESC);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Authenticated members read all reactions.
CREATE POLICY "Authed read post_likes"
  ON public.post_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Author adds their own reaction.
CREATE POLICY "Authors insert own post_likes"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Author removes their own reaction (no UPDATE — reactions are insert/delete only).
CREATE POLICY "Authors delete own post_likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = author_id);
