-- ═══════════════════════════════════════════════
-- AP-CONTENT-HUB-2026-05 · Lane 5 · Persistence Migration
-- Create blog_drafts table (admin-scoped, RLS-first)
-- ═══════════════════════════════════════════════
-- BlogWrite currently autosaves to localStorage only — drafts vanish
-- on a different device, a different browser, or after a deploy.
-- This migration provides the backing table so src/data/blogDrafts.ts
-- can prefer Supabase and fall back to localStorage when bypass is
-- active or env is unconfigured. Column shape mirrors blog_posts
-- (migration 20260505100400) so a draft can later be promoted into
-- a post without a translation layer.
--
-- Project trigger function: public.update_updated_at() (defined in
-- 20260414180447_create_events_system.sql). Reuse it here.
-- ═══════════════════════════════════════════════

-- ── Table ──
CREATE TABLE IF NOT EXISTS public.blog_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Identity
  slug text NOT NULL,
  title text,

  -- Body
  body_md text DEFAULT '',
  excerpt text,

  -- Cover
  cover_image_url text,
  cover_image_alt text,

  -- Taxonomy
  tags text[] DEFAULT '{}',

  -- SEO / EEAT (mirrors blog_posts so promotion is a straight copy)
  seo_title text,
  seo_description text,
  keywords text[] DEFAULT '{}',
  faq_jsonld jsonb DEFAULT '[]'::jsonb,

  -- Authorship snapshot (mirrors blog_posts.author_name shape)
  author_name text,

  -- Free-form blob for forward-compat fields
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Lifecycle
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_saved_at timestamptz NOT NULL DEFAULT now(),

  -- One draft per (author, slug). Allows different admins to scratch
  -- under the same slug without colliding.
  UNIQUE (author_id, slug)
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_blog_drafts_author_updated
  ON public.blog_drafts (author_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_drafts_slug
  ON public.blog_drafts (slug);

-- ── RLS ──
ALTER TABLE public.blog_drafts ENABLE ROW LEVEL SECURITY;

-- Authors can read their own drafts. Admins can read all drafts
-- (so a Frank-owned admin surface can pick up where another admin
-- left off when collaborating).
DROP POLICY IF EXISTS "Drafts own or admin read" ON public.blog_drafts;
CREATE POLICY "Drafts own or admin read"
  ON public.blog_drafts
  FOR SELECT
  USING (
    auth.uid() = author_id
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Authors create their own drafts; anonymous inserts blocked.
DROP POLICY IF EXISTS "Drafts own insert" ON public.blog_drafts;
CREATE POLICY "Drafts own insert"
  ON public.blog_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors update their own drafts; admins can update any (for moderation
-- and for collaborative editing of someone else's draft).
DROP POLICY IF EXISTS "Drafts own or admin update" ON public.blog_drafts;
CREATE POLICY "Drafts own or admin update"
  ON public.blog_drafts
  FOR UPDATE
  USING (
    auth.uid() = author_id
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Authors delete their own; admins delete any.
DROP POLICY IF EXISTS "Drafts own or admin delete" ON public.blog_drafts;
CREATE POLICY "Drafts own or admin delete"
  ON public.blog_drafts
  FOR DELETE
  USING (
    auth.uid() = author_id
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- ── updated_at trigger ──
DROP TRIGGER IF EXISTS blog_drafts_updated_at ON public.blog_drafts;
CREATE TRIGGER blog_drafts_updated_at
  BEFORE UPDATE ON public.blog_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
