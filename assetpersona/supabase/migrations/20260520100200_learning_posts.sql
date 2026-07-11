-- ═══════════════════════════════════════════════
-- AP-ENGAGEMENT-LOOP-2026-05 · Lane 2 · Public Share-Card Loop
-- learning_posts — one row per "I learned today" share
-- ═══════════════════════════════════════════════
-- Backs the /learned/:shareId public page + the dynamic OG card. Each row
-- pairs (profile, module, takeaway) and gets a short 8-char share_id slug
-- that renders the card without exposing a uuid. RLS opens SELECT to
-- anonymous traffic on purpose — the table IS the public share surface.
-- Write/delete remain scoped to the owning profile.
-- ═══════════════════════════════════════════════

-- ── Short share_id generator ──
-- 8-char URL-safe slug from a 32-char alphabet that drops easily-confused
-- glyphs (no 0/O/1/I/l). Collision odds at 8 chars are ~1 in 1.1 trillion,
-- so a single insert with a UNIQUE constraint is enough for v1. A future
-- wave can add a retry loop if traffic outgrows that headroom.
CREATE OR REPLACE FUNCTION public.gen_share_id()
RETURNS text AS $$
DECLARE
  alphabet text := 'abcdefghjkmnpqrstuvwxyz23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ── Table ──
CREATE TABLE IF NOT EXISTS public.learning_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id text NOT NULL UNIQUE DEFAULT public.gen_share_id(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  takeaway text NOT NULL CHECK (length(takeaway) BETWEEN 1 AND 280),
  feed_post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_learning_posts_profile_created
  ON public.learning_posts (profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_learning_posts_share_id
  ON public.learning_posts (share_id);

CREATE INDEX IF NOT EXISTS idx_learning_posts_module_created
  ON public.learning_posts (module_id, created_at DESC);

-- ── RLS ──
ALTER TABLE public.learning_posts ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous traffic that hits /learned/:shareId) can read.
-- This is the public share surface — that's the point of the table.
CREATE POLICY "Learning posts public read"
  ON public.learning_posts FOR SELECT
  USING (true);

-- Authors create their own rows only.
CREATE POLICY "Learning posts own insert"
  ON public.learning_posts FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Authors delete their own rows.
CREATE POLICY "Learning posts own delete"
  ON public.learning_posts FOR DELETE
  USING (auth.uid() = profile_id);

-- Admin + moderator can delete (cleanup).
CREATE POLICY "Admins delete learning posts"
  ON public.learning_posts FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')
    )
  );

-- ── RPC for the public teaser page ──
-- get_module_teaser returns ONLY the hook + outcome surface (no body, no
-- practice) so anonymous traffic at /learn/:slug sees the marketing teaser
-- without consuming the full module. Member sign-in still required for the
-- complete reader at /community/learn/:slug.
CREATE OR REPLACE FUNCTION public.get_module_teaser(p_slug text)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  hook text,
  objective text,
  cover_image text,
  estimated_minutes integer,
  xp_reward integer,
  tags text[],
  required_role public.learner_role,
  type public.module_type,
  published_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.slug,
    m.title,
    m.hook,
    m.objective,
    m.cover_image,
    m.estimated_minutes,
    m.xp_reward,
    m.tags,
    m.required_role,
    m.type,
    m.published_at
  FROM public.modules m
  WHERE m.slug = p_slug
    AND m.status = 'published'
  LIMIT 1;
$$;

-- Allow anonymous + authenticated traffic to call the teaser RPC. The
-- function body restricts to published modules, so this is safe.
GRANT EXECUTE ON FUNCTION public.get_module_teaser(text) TO anon, authenticated;

-- ── share_card_view ──
-- One query for the /learned/:shareId page and the og-image Edge Function.
-- Returns the learning post + the profile + the module fields the card
-- renders. Joined view keeps the client/edge code single-roundtrip.
CREATE OR REPLACE VIEW public.share_card_view AS
SELECT
  lp.id              AS learning_post_id,
  lp.share_id,
  lp.takeaway,
  lp.created_at      AS shared_at,
  lp.feed_post_id,
  p.id               AS profile_id,
  p.display_name,
  p.avatar_url,
  m.id               AS module_id,
  m.slug             AS module_slug,
  m.title            AS module_title,
  m.hook             AS module_hook,
  m.type             AS module_type,
  m.cover_image      AS module_cover_image,
  m.published_at     AS module_published_at
FROM public.learning_posts lp
JOIN public.profiles p ON p.id = lp.profile_id
JOIN public.modules m  ON m.id = lp.module_id;

GRANT SELECT ON public.share_card_view TO anon, authenticated;
