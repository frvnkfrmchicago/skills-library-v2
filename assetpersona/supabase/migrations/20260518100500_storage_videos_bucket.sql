-- ═══════════════════════════════════════════════
-- AP-LAUNCH-READY-2026-05 · Lane 6 · Backend Hardening
-- videos storage bucket + per-user folder policies
-- ═══════════════════════════════════════════════
-- Mirrors the avatars/covers pattern from 20260505400000_storage_avatars_covers.sql
-- but with one important difference: this bucket is NOT public. Reads go
-- through signed URLs issued by the app (or an edge function), so a leaked
-- storage path on its own can't be replayed.
--
-- Path convention enforced by RLS:
--   videos/<auth.uid()>/<asset-id>.<ext>
-- The (storage.foldername(name))[1] check guarantees a user can only write
-- under their own uuid prefix.
-- ═══════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', false)
ON CONFLICT (id) DO NOTHING;

-- ── SELECT: any authenticated user can read (signed-URL gating still applies for anon) ──
DROP POLICY IF EXISTS "Video authed read" ON storage.objects;
CREATE POLICY "Video authed read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'videos'
    AND auth.uid() IS NOT NULL
  );

-- ── INSERT: only into your own folder ──
DROP POLICY IF EXISTS "Video user write" ON storage.objects;
CREATE POLICY "Video user write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── UPDATE: only within your own folder ──
DROP POLICY IF EXISTS "Video user update" ON storage.objects;
CREATE POLICY "Video user update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── DELETE: only your own folder; admins + moderators can remove abusive ──
DROP POLICY IF EXISTS "Video user delete" ON storage.objects;
CREATE POLICY "Video user delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'videos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.uid() IN (
        SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')
      )
    )
  );
