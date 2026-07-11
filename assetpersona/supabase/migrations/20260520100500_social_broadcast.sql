-- ═══════════════════════════════════════════════
-- AP-ENGAGEMENT-LOOP-2026-05 · Lane 5 · Multi-Social Broadcast
-- Adapter-behind-dispatcher pattern (Postiz-style). One Edge
-- Function (`social-dispatcher`) picks up due rows from
-- `scheduled_posts` and fans out to N platform adapters.
-- Per-platform OAuth tokens live in `social_accounts`.
-- Every attempt — sent, failed, manual_required, rate_limited —
-- writes a row to `post_results` so the admin monitor can show
-- per-platform status + permalink + error.
-- ═══════════════════════════════════════════════
-- RLS: admins read+write everything via the profiles.role gate.
-- The dispatcher runs with the service_role key, which bypasses
-- RLS — that is the intended write path. Admin reads are RLS-gated
-- so the BroadcastsMonitor UI can use the anon key with a session.
-- ═══════════════════════════════════════════════

-- ── Platform enum (all seven targets the dispatcher knows about) ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'social_platform') THEN
    CREATE TYPE public.social_platform AS ENUM (
      'threads',
      'linkedin',
      'x',
      'bluesky',
      'instagram',
      'mastodon',
      'youtube'
    );
  END IF;
END $$;

-- ── Result status enum ──
-- 'sent'             → adapter posted and returned a platform_post_id
-- 'failed'           → adapter raised a non-retryable error
-- 'manual_required'  → platform has no publishing API (YouTube Community)
-- 'rate_limited'     → platform refused with 429/403-quota; lead retries later
-- 'queued'           → row reserved by dispatcher, attempt not yet made
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_result_status') THEN
    CREATE TYPE public.post_result_status AS ENUM (
      'queued',
      'sent',
      'failed',
      'manual_required',
      'rate_limited'
    );
  END IF;
END $$;

-- ── social_accounts: per-platform OAuth credentials ──
-- One row per (owner, platform). Bluesky uses oauth_access_token as
-- the app password (no refresh). LinkedIn / Threads / Instagram /
-- Mastodon / X carry full OAuth pairs with `expires_at`. YouTube
-- rows are accepted for completeness but unused (manual-assist only).
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform public.social_platform NOT NULL,
  handle text,
  oauth_access_token text,
  oauth_refresh_token text,
  expires_at timestamptz,
  scopes text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, platform)
);

-- ── scheduled_posts: the dispatcher's work queue ──
-- `source_kind` ties back to the originating record (bulletin / module
-- / blog / custom). `payload` is the canonical content blob the
-- adapters receive (text + optional mediaUrls + optional sourceUrl).
-- `dispatched_at IS NULL` means "still due"; the partial index below
-- makes the cron pickup query O(due-row-count).
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_kind text NOT NULL CHECK (source_kind IN ('bulletin', 'module', 'blog', 'custom')),
  source_id uuid,
  payload jsonb NOT NULL,
  target_platforms public.social_platform[] NOT NULL DEFAULT '{}'::public.social_platform[],
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  dispatched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── post_results: per-attempt audit log ──
-- One row per (scheduled_post, platform) attempt. The dispatcher
-- INSERTs here AFTER each adapter returns — never UPSERT, so reruns
-- leave a history. `permalink` lets the BroadcastsMonitor link out
-- to the live post; `error_message` is the human-readable adapter
-- error (kept free of secrets — see security-auditing skill notes).
CREATE TABLE IF NOT EXISTS public.post_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_post_id uuid NOT NULL REFERENCES public.scheduled_posts(id) ON DELETE CASCADE,
  platform public.social_platform NOT NULL,
  status public.post_result_status NOT NULL,
  platform_post_id text,
  permalink text,
  error_message text,
  response_payload jsonb,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──
-- Partial index on (scheduled_for) WHERE dispatched_at IS NULL keeps
-- the dispatcher's "due rows" query fast even at high backlog (the
-- index ONLY holds undelivered rows). Pattern from the
-- database-designing skill.
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_due
  ON public.scheduled_posts (scheduled_for)
  WHERE dispatched_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_post_results_scheduled
  ON public.post_results (scheduled_post_id, platform);

CREATE INDEX IF NOT EXISTS idx_post_results_status_attempted
  ON public.post_results (status, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_accounts_owner_platform
  ON public.social_accounts (owner_id, platform);

-- ── RLS ──
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_results ENABLE ROW LEVEL SECURITY;

-- social_accounts: admin-only read + write.
-- Tokens never leave the row → no broader read scope.
DROP POLICY IF EXISTS "Social accounts admin read" ON public.social_accounts;
CREATE POLICY "Social accounts admin read"
  ON public.social_accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Social accounts admin write" ON public.social_accounts;
CREATE POLICY "Social accounts admin write"
  ON public.social_accounts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'admin'
    )
  );

-- scheduled_posts: admin-only read + write.
DROP POLICY IF EXISTS "Scheduled posts admin read" ON public.scheduled_posts;
CREATE POLICY "Scheduled posts admin read"
  ON public.scheduled_posts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Scheduled posts admin write" ON public.scheduled_posts;
CREATE POLICY "Scheduled posts admin write"
  ON public.scheduled_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'admin'
    )
  );

-- post_results: admin-only read (writes are dispatcher-only via service_role).
DROP POLICY IF EXISTS "Post results admin read" ON public.post_results;
CREATE POLICY "Post results admin read"
  ON public.post_results
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.role = 'admin'
    )
  );
