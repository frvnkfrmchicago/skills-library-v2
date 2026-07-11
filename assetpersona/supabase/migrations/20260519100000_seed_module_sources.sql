-- ═══════════════════════════════════════════════
-- AP-CONTENT-HUB-2026-05 · Wave 1 · Lane 1
-- RSS source seed for the news-to-module pipeline
-- ═══════════════════════════════════════════════
--
-- Why this exists:
--   Frank's admin is fully wired but dormant. The `generate-module` Edge
--   Function, the `news-to-module` n8n workflow, and the `news_sources`
--   table all exist on disk, but the seed rows never make it to the
--   production database without an explicit migration. This migration
--   guarantees that the moment `supabase db push` succeeds, the first
--   cron cycle of the news-to-module workflow has feeds to pull from.
--
-- Schema reconciliation note (lane brief vs. reality):
--   The Lane 1 brief refers to a `module_sources` table with column `name`.
--   The actual table created in 20260505200300_create_module_sources.sql
--   is `public.news_sources` with columns `(label, rss_url, active)`.
--   The n8n workflow `news-to-module.json` reads from `news_sources` and
--   keys on `label` + `rss_url`, so this seed targets reality, not the
--   brief's placeholder names. The migration filename keeps the
--   brief-mandated stem `20260519100000_seed_module_sources.sql` so the
--   master log and citations stay aligned.
--
-- Idempotency:
--   `news_sources.rss_url` has a UNIQUE constraint (per the create
--   migration). `ON CONFLICT (rss_url) DO NOTHING` makes re-runs and
--   overlap with the earlier seed (which already inserts 4 of these 5
--   rows) safe. This migration adds Simon Willison's atom feed as the
--   5th feed and re-asserts the prior 4 in case the earlier migration
--   was rolled back or run against a fresh database.

INSERT INTO public.news_sources (label, rss_url, active) VALUES
  ('Anthropic News',            'https://www.anthropic.com/news/rss.xml',    true),
  ('OpenAI Blog',               'https://openai.com/blog/rss.xml',           true),
  ('Google AI Blog',            'https://blog.google/technology/ai/rss/',    true),
  ('Hugging Face Daily Papers', 'https://huggingface.co/papers/rss',         true),
  ('Simon Willison',            'https://simonwillison.net/atom/everything/', true)
ON CONFLICT (rss_url) DO NOTHING;
