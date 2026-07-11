-- ═══════════════════════════════════════════════
-- Wave 11: Profiles customization & Resumes storage bucket
-- ═══════════════════════════════════════════════

-- ── Extend profiles table ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS resume_url text,
  ADD COLUMN IF NOT EXISTS currently_studying text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS stickers jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_references jsonb DEFAULT '[]'::jsonb;

-- ── Create resumes storage bucket ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- ── public read resumes ──
DROP POLICY IF EXISTS "Public read resumes" ON storage.objects;
CREATE POLICY "Public read resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes');

-- ── owner insert resumes (path prefix must match owner uid) ──
DROP POLICY IF EXISTS "Owner insert resumes" ON storage.objects;
CREATE POLICY "Owner insert resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes'
    AND (auth.uid())::text = split_part(name, '/', 1)
  );

-- ── owner update resumes ──
DROP POLICY IF EXISTS "Owner update resumes" ON storage.objects;
CREATE POLICY "Owner update resumes"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'resumes'
    AND (auth.uid())::text = split_part(name, '/', 1)
  )
  WITH CHECK (
    bucket_id = 'resumes'
    AND (auth.uid())::text = split_part(name, '/', 1)
  );

-- ── owner delete resumes ──
DROP POLICY IF EXISTS "Owner delete resumes" ON storage.objects;
CREATE POLICY "Owner delete resumes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resumes'
    AND (auth.uid())::text = split_part(name, '/', 1)
  );
