-- ═══════════════════════════════════════════════
-- AP-LAUNCH-READY-2026-05 · Lane 6 · Backend Hardening
-- posts table — Supabase-backed community feed
-- ═══════════════════════════════════════════════
-- Replaces the localStorage-only feed Lane 5 has been simulating. Every
-- authenticated member can read; only the author can write/edit/delete
-- their own post. media_urls is a jsonb array of storage paths so a single
-- post can carry mixed attachments (image, video, link preview).
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  media_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──
-- Feed page: newest first.
CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON public.posts (created_at DESC);

-- Author timeline: "posts by user X."
CREATE INDEX IF NOT EXISTS idx_posts_author_created
  ON public.posts (author_id, created_at DESC);

-- Category filter (optional surface).
CREATE INDEX IF NOT EXISTS idx_posts_category_created
  ON public.posts (category, created_at DESC)
  WHERE category IS NOT NULL;

-- ── RLS ──
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Authenticated members read every post (no anonymous browsing of feed).
CREATE POLICY "Authed read posts"
  ON public.posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Authors create their own posts only.
CREATE POLICY "Authors insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors update their own posts.
CREATE POLICY "Authors update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Authors delete their own; admins + moderators also delete (cleanup).
CREATE POLICY "Authors delete own posts"
  ON public.posts FOR DELETE
  USING (
    auth.uid() = author_id
    OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')
    )
  );

-- Admin read-all (for analytics / moderation tools).
CREATE POLICY "Admin + mod read all posts"
  ON public.posts FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')
    )
  );

-- ── updated_at trigger ──
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
