-- ═══════════════════════════════════════════════
-- AP-LAUNCH-2026-05 · Wave 1 · Foundation
-- Patch RLS holes found in audit
-- ═══════════════════════════════════════════════
-- Two holes:
--   1. studio_pages had policy "Authenticated users manage pages" letting
--      ANY logged-in user edit/delete every page. Replaced with admin-only.
--   2. product_downloads had policy "Authenticated insert downloads" with
--      WITH CHECK (true) — users could insert with anyone's email/user_id.
--      Replaced with auth.uid() = user_id enforcement.
-- ═══════════════════════════════════════════════

-- ── studio_pages: admin-only writes ──
DROP POLICY IF EXISTS "Authenticated users manage pages" ON public.studio_pages;
DROP POLICY IF EXISTS "Public can read published pages" ON public.studio_pages;

-- Public read (only published)
CREATE POLICY "Public can read published pages"
  ON public.studio_pages
  FOR SELECT
  USING (status = 'published');

-- Admin read all (including drafts)
CREATE POLICY "Admin read all studio pages"
  ON public.studio_pages
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Admin INSERT
CREATE POLICY "Admin create studio pages"
  ON public.studio_pages
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Admin UPDATE
CREATE POLICY "Admin update studio pages"
  ON public.studio_pages
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Admin DELETE
CREATE POLICY "Admin delete studio pages"
  ON public.studio_pages
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- ── product_downloads: enforce ownership on insert ──
DROP POLICY IF EXISTS "Authenticated insert downloads" ON public.product_downloads;

CREATE POLICY "Users insert own download record"
  ON public.product_downloads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Keep existing SELECT policies (Users read own + Admin read all) — unchanged.
