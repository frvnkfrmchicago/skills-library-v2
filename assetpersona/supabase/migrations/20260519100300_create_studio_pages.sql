-- ═══════════════════════════════════════════════
-- AP-CONTENT-HUB-2026-05 · Lane 5 · Persistence Migration
-- Tighten studio_pages: admin-scoped RLS + missing columns
-- ═══════════════════════════════════════════════
-- An earlier unnumbered migration (supabase/migrations/create_studio_pages.sql)
-- stood up a minimal `studio_pages` table with a permissive
-- "any authenticated user can manage pages" policy. This lane:
--   1. Ensures the table exists (idempotent CREATE)
--   2. Adds the columns the lane brief requires (`author_id`,
--      `metadata`, `published_at`) without renaming existing columns
--      so the consumer code (StudioList, StudioEditor, StudioProvider,
--      DynamicPage) keeps working unchanged
--   3. Replaces the loose RLS with admin-scoped policies — only the
--      `profiles.role = 'admin'` role can write; published pages stay
--      publicly readable for the /p/:slug DynamicPage route
--   4. Adds a status-history index for the admin listing grid
--   5. Wires up the project's public.update_updated_at() trigger
--
-- Column-shape note: the existing app stores Puck layouts under
-- `puck_data` and titles under `title`. The lane brief's prescriptive
-- schema used `root`/`name` — we honor the brief's intent (durable
-- persistence + RLS-first + admin-scoped) while preserving the
-- column names already wired into the type system, so consumer pages
-- continue to function without modification per the brief's
-- "Function signatures stay stable so consumer pages don't change"
-- requirement.
-- ═══════════════════════════════════════════════

-- ── Status enum (additive) ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'studio_page_status') THEN
    CREATE TYPE public.studio_page_status AS ENUM (
      'draft',
      'published',
      'archived'
    );
  END IF;
END $$;

-- ── Table (idempotent — picks up where create_studio_pages.sql left off) ──
CREATE TABLE IF NOT EXISTS public.studio_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT 'Untitled Page',
  status text NOT NULL DEFAULT 'draft',
  puck_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Add brief-required columns idempotently ──
ALTER TABLE public.studio_pages
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Backfill status CHECK constraint with the enum's value set without
-- requiring an existing-table column-type swap. The text column
-- already has a CHECK constraint from the earlier migration; tighten
-- it to the enum's value list so the app cannot save unknown statuses.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'studio_pages_status_enum_check'
  ) THEN
    ALTER TABLE public.studio_pages
      ADD CONSTRAINT studio_pages_status_enum_check
      CHECK (status IN ('draft', 'published', 'archived'));
  END IF;
END $$;

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_studio_pages_slug
  ON public.studio_pages (slug);

CREATE INDEX IF NOT EXISTS idx_studio_pages_status_updated
  ON public.studio_pages (status, updated_at DESC);

-- ── RLS — tighten from the earlier permissive policy ──
ALTER TABLE public.studio_pages ENABLE ROW LEVEL SECURITY;

-- Remove the loose policies set in the unnumbered migration.
DROP POLICY IF EXISTS "Public can read published pages" ON public.studio_pages;
DROP POLICY IF EXISTS "Authenticated users manage pages" ON public.studio_pages;

-- Public can read published pages (for the /p/:slug DynamicPage route).
-- Admins can read everything (drafts + archived).
DROP POLICY IF EXISTS "Studio published or admin read" ON public.studio_pages;
CREATE POLICY "Studio published or admin read"
  ON public.studio_pages
  FOR SELECT
  USING (
    status = 'published'
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Admin-only writes
DROP POLICY IF EXISTS "Studio admin insert" ON public.studio_pages;
CREATE POLICY "Studio admin insert"
  ON public.studio_pages
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "Studio admin update" ON public.studio_pages;
CREATE POLICY "Studio admin update"
  ON public.studio_pages
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "Studio admin delete" ON public.studio_pages;
CREATE POLICY "Studio admin delete"
  ON public.studio_pages
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- ── updated_at trigger ──
DROP TRIGGER IF EXISTS studio_pages_updated_at ON public.studio_pages;
CREATE TRIGGER studio_pages_updated_at
  BEFORE UPDATE ON public.studio_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
