-- ═══════════════════════════════════════════════
-- AP-LAUNCH-READY-2026-05 · Lane 6 · Backend Hardening
-- video_assets — durable metadata for user-uploaded video clips
-- ═══════════════════════════════════════════════
-- The bytes live in the `videos` storage bucket (created in
-- 20260518100500_storage_videos_bucket.sql). This table holds the playable
-- metadata: storage path, optional poster frame, duration, mime type, size,
-- and a lightweight status enum-ish text column so Lane 5 can show
-- 'processing' vs 'ready' states.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.video_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  poster_path text,
  duration_seconds int,
  mime_type text,
  size_bytes bigint,
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_assets_status_values CHECK (
    status IN ('processing', 'ready', 'failed', 'deleted')
  ),
  CONSTRAINT video_assets_size_nonneg CHECK (size_bytes IS NULL OR size_bytes >= 0),
  CONSTRAINT video_assets_duration_nonneg CHECK (duration_seconds IS NULL OR duration_seconds >= 0)
);

-- ── Indexes ──
-- Owner timeline + dashboard.
CREATE INDEX IF NOT EXISTS idx_video_assets_owner_created
  ON public.video_assets (owner_id, created_at DESC);

-- Recent uploads (admin view, public showcase).
CREATE INDEX IF NOT EXISTS idx_video_assets_created
  ON public.video_assets (created_at DESC)
  WHERE status = 'ready';

-- Lookup by storage path (when a webhook reports processed bytes).
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_assets_storage_path
  ON public.video_assets (storage_path);

-- ── RLS ──
ALTER TABLE public.video_assets ENABLE ROW LEVEL SECURITY;

-- Authenticated members read every ready clip (public feed / module embeds).
-- Anonymous viewers don't get DB access; they fetch signed URLs from edge fns.
CREATE POLICY "Authed read video_assets"
  ON public.video_assets FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'ready');

-- Owner reads their own at every status (e.g. 'processing' on dashboard).
CREATE POLICY "Owners read own video_assets"
  ON public.video_assets FOR SELECT
  USING (auth.uid() = owner_id);

-- Owner uploads (the row is created by the client right after the storage put).
CREATE POLICY "Owners insert own video_assets"
  ON public.video_assets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owner updates metadata (e.g. caption, poster) and status flips.
CREATE POLICY "Owners update own video_assets"
  ON public.video_assets FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Owner deletes their own; admins + moderators can also remove abusive content.
CREATE POLICY "Owners delete own video_assets"
  ON public.video_assets FOR DELETE
  USING (
    auth.uid() = owner_id
    OR auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')
    )
  );

-- Admin + moderator read everything for moderation review.
CREATE POLICY "Admin + mod read all video_assets"
  ON public.video_assets FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')
    )
  );

-- ── updated_at trigger ──
CREATE TRIGGER video_assets_updated_at
  BEFORE UPDATE ON public.video_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
