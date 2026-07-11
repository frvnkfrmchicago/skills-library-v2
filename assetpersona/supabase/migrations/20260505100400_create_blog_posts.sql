-- ═══════════════════════════════════════════════
-- AP-LAUNCH-2026-05 · Wave 1 · Foundation
-- Create blog_posts table + storage bucket for cover images
-- ═══════════════════════════════════════════════
-- Audit finding: BlogAdmin saves to localStorage only — posts vanish on
-- browser clear, invisible across devices. This migration provides the
-- backing table with the same SEO/EEAT shape used by BlogPost.tsx and
-- BlogAdmin.tsx, so Wave 4 can swap the storage layer with minimal UI
-- changes. RLS: anyone reads published, admin reads/writes all.
-- ═══════════════════════════════════════════════

-- Status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blog_post_status') THEN
    CREATE TYPE public.blog_post_status AS ENUM (
      'draft',
      'published',
      'archived'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  body_md text NOT NULL DEFAULT '',
  cover_image text,                    -- storage path or full URL
  cover_image_alt text,
  status public.blog_post_status NOT NULL DEFAULT 'draft',

  -- Taxonomy
  category text,
  tags text[] DEFAULT '{}',

  -- SEO / AEO / EEAT
  seo_title text,
  seo_description text,
  keywords text[] DEFAULT '{}',
  faq_schema jsonb DEFAULT '[]'::jsonb,
  og_image text,
  canonical_url text,

  -- Authorship (matches BlogPost interface in src/content/blog/index.ts)
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text DEFAULT 'Frank Lawrence Jr.',
  author_credentials text DEFAULT 'AI Educator & Digital Product Builder',

  -- Lifecycle
  published_at timestamptz,
  reading_minutes integer,             -- snapshot at publish time, optional
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT blog_posts_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published
  ON public.blog_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON public.blog_posts USING GIN (tags);

-- Full-text search (Wave 3 Agent 6 uses this)
CREATE INDEX IF NOT EXISTS idx_blog_posts_fts
  ON public.blog_posts
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(body_md, '')));

-- ── RLS ──
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read (published only)
CREATE POLICY "Public read published posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Admin read all (including drafts/archived)
CREATE POLICY "Admin read all blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Admin INSERT
CREATE POLICY "Admin create blog posts"
  ON public.blog_posts
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Admin UPDATE
CREATE POLICY "Admin update blog posts"
  ON public.blog_posts
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Admin DELETE (soft via status='archived' is preferred, but allow hard delete)
CREATE POLICY "Admin delete blog posts"
  ON public.blog_posts
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- ── updated_at trigger ──
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── Storage bucket for cover images ──
-- Bucket creation + policies live in storage.* — guard for re-runs.
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read blog images (they're embedded in published posts)
DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
CREATE POLICY "Public read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog');

-- Admin-only upload to blog/
DROP POLICY IF EXISTS "Admin upload blog images" ON storage.objects;
CREATE POLICY "Admin upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog'
    AND auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Admin-only delete blog images
DROP POLICY IF EXISTS "Admin delete blog images" ON storage.objects;
CREATE POLICY "Admin delete blog images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'blog'
    AND auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );
