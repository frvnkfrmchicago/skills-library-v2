-- ═══════════════════════════════════════════════
-- AP-ENGAGEMENT-LOOP-2026-05 · Lane 4 · Portfolio / Pinned Projects
-- member_projects — Uxcel/Read.cv-style pinned project showcase rows
-- ═══════════════════════════════════════════════
-- Members want to pin 3-8 projects on their public profile to show off
-- the things they're proud of. Each row is owned by exactly one profile;
-- ordering is controlled by `position` (lower first within each pin
-- group). `is_pinned` separates the curated public set from the draft
-- backlog so members can keep work-in-progress projects in the data
-- layer without showing them publicly yet.
--
-- RLS contract:
--   - Owner does anything to their own rows (private drafts included).
--   - Anyone can SELECT pinned rows whose owning profile is non-private.
--     The cross-table check uses an EXISTS subquery against `profiles`
--     because that's the column Lane 3 adds in the same wave
--     (20260520100300_public_profile.sql) — Lane 3's `visibility` column
--     gates the public-read policy here. Until Lane 3's migration lands
--     this policy still evaluates safely (no `visibility != 'private'`
--     row will match if the column doesn't exist YET — Postgres will
--     surface the column-missing error on first attempted read, which is
--     the dependency signal we want).
--
-- Index: composite (profile_id, is_pinned DESC, position ASC, created_at
-- DESC) is the exact shape Portfolio.tsx + PortfolioGrid.tsx scan, so
-- the planner uses a single index lookup for both surfaces.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.member_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 80),
  description text CHECK (length(coalesce(description, '')) <= 400),
  image_url text,
  project_url text,
  demo_url text,
  tags text[] NOT NULL DEFAULT '{}',
  is_pinned boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──
-- Primary scan shape for both the owner page (all rows for a profile)
-- and the public PortfolioGrid (pinned rows only, position-ordered).
CREATE INDEX IF NOT EXISTS idx_member_projects_profile_position
  ON public.member_projects (profile_id, is_pinned DESC, position ASC, created_at DESC);

-- ── RLS ──
ALTER TABLE public.member_projects ENABLE ROW LEVEL SECURITY;

-- Owner can do anything with their own projects (read drafts, write,
-- delete, reorder). This policy is independent of profile visibility
-- so the member can edit their portfolio even while their profile is
-- still set to private.
DROP POLICY IF EXISTS "Member projects own all" ON public.member_projects;
CREATE POLICY "Member projects own all"
  ON public.member_projects FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Public-read policy for pinned projects whose owner is non-private.
-- Cross-table EXISTS check against `profiles.visibility` — the column
-- Lane 3 adds in 20260520100300_public_profile.sql. Anonymous viewers
-- and other authenticated members only see PINNED rows; draft rows
-- (is_pinned = false) stay owner-only via the policy above.
DROP POLICY IF EXISTS "Member projects public read pinned" ON public.member_projects;
CREATE POLICY "Member projects public read pinned"
  ON public.member_projects FOR SELECT
  USING (
    is_pinned AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_id AND p.visibility != 'private'
    )
  );

-- ── updated_at trigger ──
-- Keep updated_at honest so the owner page can show a "last edited"
-- meta and so future cache-invalidation strategies have a key to use.
CREATE OR REPLACE FUNCTION public.touch_member_projects_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_member_projects_updated_at ON public.member_projects;
CREATE TRIGGER trg_member_projects_updated_at
  BEFORE UPDATE ON public.member_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_member_projects_updated_at();
