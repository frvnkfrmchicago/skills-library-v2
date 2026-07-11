-- ═══════════════════════════════════════════════
-- AP-COMMUNITY-2026-05 · Profile Customization Agent 1
-- Storage buckets for avatars + covers + post media
-- ═══════════════════════════════════════════════
-- Per supabase-building skill: each user can only write to their own folder
-- via storage.foldername(name)[1] = auth.uid()::text. Reads stay public so
-- the avatar / cover render anywhere without signed URLs.
-- ═══════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('covers', 'covers', true),
  ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- ── avatars ──
DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
CREATE POLICY "Avatar public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar user write" ON storage.objects;
CREATE POLICY "Avatar user write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Avatar user update" ON storage.objects;
CREATE POLICY "Avatar user update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Avatar user delete" ON storage.objects;
CREATE POLICY "Avatar user delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── covers (same shape) ──
DROP POLICY IF EXISTS "Cover public read" ON storage.objects;
CREATE POLICY "Cover public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Cover user write" ON storage.objects;
CREATE POLICY "Cover user write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'covers'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Cover user update" ON storage.objects;
CREATE POLICY "Cover user update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Cover user delete" ON storage.objects;
CREATE POLICY "Cover user delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── post-media (Rich Content Agent 5 uses this) ──
DROP POLICY IF EXISTS "Post media public read" ON storage.objects;
CREATE POLICY "Post media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

DROP POLICY IF EXISTS "Post media user write" ON storage.objects;
CREATE POLICY "Post media user write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Post media user delete" ON storage.objects;
CREATE POLICY "Post media user delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
