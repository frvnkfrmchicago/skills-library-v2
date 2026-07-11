-- ═══════════════════════════════════════════════
-- AP-STUDYHALL-REBUILD-2026-06 · Lane 1 · Events agenda + project channels
-- ═══════════════════════════════════════════════
-- Pre-plan research found the `events` table already carries cover_image,
-- capacity, host_name, host_title, host_avatar, full_description and
-- location fields (20260414180447_create_events_system.sql) — richer than
-- the member calendar ever read. So the Luma-grade rebuild needs only ONE
-- new event column: a structured agenda (list of { time, label }).
--
-- For the forum, the `posts` table already has a `category` column that
-- powers topic channels. The genuinely missing capability is per-project
-- discussion — "let users chat about a specific project." We add a
-- nullable `project_id` so a post can attach to a member_project; topic
-- channels keep using `category`.
-- ═══════════════════════════════════════════════

-- ── Event agenda (Luma-style schedule) ─────────────────────────────────
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS agenda jsonb NOT NULL DEFAULT '[]';

COMMENT ON COLUMN public.events.agenda IS
  'Ordered agenda items for the Luma-style event page. Shape: [{ "time": "6:00 PM", "label": "Doors + intros" }].';

-- ── Per-project discussion threads ─────────────────────────────────────
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.member_projects(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.posts.project_id IS
  'When set, this post is part of the discussion thread for a specific member project. NULL = a normal topic-channel post.';

CREATE INDEX IF NOT EXISTS idx_posts_project
  ON public.posts (project_id, created_at DESC)
  WHERE project_id IS NOT NULL;
