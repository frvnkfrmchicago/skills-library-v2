-- ═══════════════════════════════════════════════
-- AP-MODERNIZE-2026-05 · Lane 4 · Bookmarks
-- bookmarks — owner-scoped saves for posts, comments, modules,
-- bulletins, and blog posts
-- ═══════════════════════════════════════════════
-- Power users want to save posts/modules/bulletins/blog entries for later.
-- One row per (owner_id, target_type, target_id) — composite UNIQUE keeps
-- the toggle UX honest (no dup rows when a click races itself).
--
-- target_id is `text` rather than `uuid` because three of the five target
-- types currently live as `uuid` (`posts`, `modules`, `content_hub_bulletins`,
-- `blog_posts`) but `comments` uses `text` in some seed paths and future
-- bookmark targets may include non-uuid keys (e.g. blog slug). Text keeps
-- the door open without forcing a follow-up migration.
--
-- RLS is owner-only ALL — read, write, update, delete. No admin override:
-- bookmarks are private by definition. Composite UNIQUE doubles as the
-- de-dup contract for the `addBookmark` upsert flow.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (
    target_type IN ('post', 'comment', 'module', 'bulletin', 'blog_post')
  ),
  target_id text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, target_type, target_id)
);

-- ── Indexes ──
-- Saved page: list a single owner's bookmarks newest-first.
CREATE INDEX IF NOT EXISTS idx_bookmarks_owner_created
  ON public.bookmarks (owner_id, created_at DESC);

-- "Who saved this thing?" / cross-user aggregation surface (admin only).
CREATE INDEX IF NOT EXISTS idx_bookmarks_target
  ON public.bookmarks (target_type, target_id);

-- ── RLS ──
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Owners do everything to their own rows.
CREATE POLICY "Bookmarks own all"
  ON public.bookmarks FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
