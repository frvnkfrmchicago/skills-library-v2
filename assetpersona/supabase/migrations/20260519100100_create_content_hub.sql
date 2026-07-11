-- ═══════════════════════════════════════════════
-- AP-CONTENT-HUB-2026-05 · Lane 2 · Content Hub bulletins
-- Single-form bulletin surface adapted from the Grazzhopper
-- Regulatory Updates Admin pattern. Modules stay for long-form
-- lessons; Content Hub handles short, severity-tagged drops.
-- ═══════════════════════════════════════════════
-- Severity tiers: info / advisory / important / breaking
-- Status pipeline: draft / published / archived
-- RLS: anyone authed reads published; admin/moderator read all;
--      admin-only writes (same role-check pattern as blog_posts +
--      comments_moderation migrations).
-- ═══════════════════════════════════════════════

-- ── Severity enum ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bulletin_severity') THEN
    CREATE TYPE public.bulletin_severity AS ENUM (
      'info',
      'advisory',
      'important',
      'breaking'
    );
  END IF;
END $$;

-- ── Status enum ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bulletin_status') THEN
    CREATE TYPE public.bulletin_status AS ENUM (
      'draft',
      'published',
      'archived'
    );
  END IF;
END $$;

-- ── Table ──
CREATE TABLE IF NOT EXISTS public.content_hub_bulletins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  summary text NOT NULL,
  body text,
  source_url text,
  severity public.bulletin_severity NOT NULL DEFAULT 'info',
  status public.bulletin_status NOT NULL DEFAULT 'draft',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_content_hub_bulletins_status_published_at
  ON public.content_hub_bulletins (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_hub_bulletins_severity
  ON public.content_hub_bulletins (severity);

-- ── RLS ──
ALTER TABLE public.content_hub_bulletins ENABLE ROW LEVEL SECURITY;

-- SELECT: published bulletins readable by anyone authenticated; admins + moderators read all
DROP POLICY IF EXISTS "Bulletins read published" ON public.content_hub_bulletins;
CREATE POLICY "Bulletins read published"
  ON public.content_hub_bulletins
  FOR SELECT
  USING (
    status = 'published'
    OR EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role IN ('admin', 'moderator')
    )
  );

-- INSERT: admin only
DROP POLICY IF EXISTS "Bulletins admin write" ON public.content_hub_bulletins;
CREATE POLICY "Bulletins admin write"
  ON public.content_hub_bulletins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'admin'
    )
  );

-- UPDATE: admin only
DROP POLICY IF EXISTS "Bulletins admin update" ON public.content_hub_bulletins;
CREATE POLICY "Bulletins admin update"
  ON public.content_hub_bulletins
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'admin'
    )
  );

-- DELETE: admin only
DROP POLICY IF EXISTS "Bulletins admin delete" ON public.content_hub_bulletins;
CREATE POLICY "Bulletins admin delete"
  ON public.content_hub_bulletins
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'admin'
    )
  );

-- ── updated_at trigger ──
DROP TRIGGER IF EXISTS content_hub_bulletins_updated_at ON public.content_hub_bulletins;
CREATE TRIGGER content_hub_bulletins_updated_at
  BEFORE UPDATE ON public.content_hub_bulletins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
