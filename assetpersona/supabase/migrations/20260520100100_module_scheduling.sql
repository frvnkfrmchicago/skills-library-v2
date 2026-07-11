-- ═══════════════════════════════════════════════
-- AP-ENGAGEMENT-LOOP-2026-05 · Lane 1 · Scheduling
-- Adds scheduled_publish_at to modules + partial index
-- ═══════════════════════════════════════════════
-- When admin saves a module with status='queued' and a
-- scheduled_publish_at timestamp, an n8n hourly cron flips the
-- row to 'published' once now() >= scheduled_publish_at.
--
-- Idempotent: re-runs safe. Migration depends on
-- 20260505200000_create_modules.sql (module_status enum
-- already includes 'queued').
-- ═══════════════════════════════════════════════

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS scheduled_publish_at timestamptz;

-- Partial index — only the rows the n8n worker will scan.
-- Keeps the index tiny no matter how many drafts/published rows exist.
CREATE INDEX IF NOT EXISTS idx_modules_scheduled
  ON public.modules (scheduled_publish_at)
  WHERE scheduled_publish_at IS NOT NULL AND status = 'queued';

COMMENT ON COLUMN public.modules.scheduled_publish_at IS
  'When status=queued, an n8n cron flips this row to published at this time.';
