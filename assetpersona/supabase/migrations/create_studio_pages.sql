-- ══════════════════════════════════════════
-- STUDIO PAGES TABLE
-- Stores visual page editor layouts as JSON.
-- Run this migration in your Supabase SQL editor.
-- ══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS studio_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT 'Untitled Page',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  puck_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast slug lookups (public page rendering)
CREATE INDEX IF NOT EXISTS idx_studio_pages_slug ON studio_pages (slug);

-- Index for listing published pages
CREATE INDEX IF NOT EXISTS idx_studio_pages_status ON studio_pages (status);

-- Row Level Security
ALTER TABLE studio_pages ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Public can read published pages"
  ON studio_pages
  FOR SELECT
  USING (status = 'published');

-- Authenticated users can do everything (admin)
CREATE POLICY "Authenticated users manage pages"
  ON studio_pages
  FOR ALL
  USING (auth.role() = 'authenticated');
