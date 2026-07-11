-- ═══════════════════════════════════════════════
-- AP-ENGAGEMENT-LOOP-2026-05 · Lane 5 · Content Hub scheduling
-- Extends `content_hub_bulletins` so admins can:
--   1. Pick a `scheduled_for` timestamp at draft time (instead of
--      hitting publish immediately).
--   2. Choose which `platforms` the bulletin should fan out to.
--
-- Default platform array stays `{threads}` so existing behavior
-- (the frvnkfrmchicago Threads pipeline) is preserved for any
-- bulletin written before this migration runs.
-- ═══════════════════════════════════════════════

ALTER TABLE public.content_hub_bulletins
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz,
  ADD COLUMN IF NOT EXISTS platforms text[] DEFAULT '{"threads"}'::text[];

-- Partial index on (scheduled_for) WHERE status='draft' AND scheduled_for
-- IS NOT NULL. Lets the dispatcher (or a future bulletin-auto-publisher)
-- find due drafts in O(due-count) instead of full-table scan.
CREATE INDEX IF NOT EXISTS idx_content_hub_scheduled
  ON public.content_hub_bulletins (scheduled_for)
  WHERE scheduled_for IS NOT NULL AND status = 'draft';
