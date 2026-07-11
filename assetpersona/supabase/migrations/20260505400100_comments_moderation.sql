-- ═══════════════════════════════════════════════
-- AP-COMMUNITY-2026-05 · Comments + Moderation Agent 3
-- comment_status enum + moderation column + comment_reports table + ModeratorGuard backing
-- ═══════════════════════════════════════════════
-- Default: every new comment is `pending` until an admin or moderator approves.
-- Admins can opt categories OUT of moderation by setting category-level rules.
-- ═══════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_status') THEN
    CREATE TYPE public.comment_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
  END IF;
END $$;

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS status public.comment_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reject_reason text;

CREATE INDEX IF NOT EXISTS idx_comments_status_created
  ON public.comments (status, created_at DESC);

-- ── Refresh RLS so only approved comments are publicly readable ──
DROP POLICY IF EXISTS "Public read approved comments" ON public.comments;
CREATE POLICY "Public read approved comments"
  ON public.comments FOR SELECT
  USING (status = 'approved' OR auth.uid() = author_id OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')
  ));

DROP POLICY IF EXISTS "Authors insert comments" ON public.comments;
CREATE POLICY "Authors insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Mods + admins update comments" ON public.comments;
CREATE POLICY "Mods + admins update comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')));

DROP POLICY IF EXISTS "Authors delete own comments" ON public.comments;
CREATE POLICY "Authors delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')
  ));

-- ── comment_reports: any authenticated user can flag a comment ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_report_reason') THEN
    CREATE TYPE public.comment_report_reason AS ENUM ('spam', 'harassment', 'off_topic', 'other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comment_report_status') THEN
    CREATE TYPE public.comment_report_status AS ENUM ('open', 'resolved', 'dismissed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.comment_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason public.comment_report_reason NOT NULL,
  detail text,
  status public.comment_report_status NOT NULL DEFAULT 'open',
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comment_reports_open
  ON public.comment_reports (status, created_at DESC)
  WHERE status = 'open';

ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed insert reports"
  ON public.comment_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Mods + admins read reports"
  ON public.comment_reports FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')));

CREATE POLICY "Mods + admins update reports"
  ON public.comment_reports FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')));

-- ── Convenience RPC: bulk approve / reject ──
CREATE OR REPLACE FUNCTION public.moderate_comment(
  comment_id uuid,
  new_status public.comment_status,
  reason text DEFAULT NULL
)
RETURNS public.comments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.comments;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
     WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.comments
     SET status = new_status,
         reviewed_by = auth.uid(),
         reviewed_at = now(),
         reject_reason = CASE WHEN new_status = 'rejected' THEN reason ELSE NULL END
   WHERE id = comment_id
  RETURNING * INTO result;

  -- If rejecting, resolve any open reports
  IF new_status = 'rejected' THEN
    UPDATE public.comment_reports
       SET status = 'resolved',
           reviewed_by = auth.uid(),
           reviewed_at = now()
     WHERE comment_id = moderate_comment.comment_id
       AND status = 'open';
  END IF;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.moderate_comment(uuid, public.comment_status, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.moderate_comment(uuid, public.comment_status, text) TO authenticated;
