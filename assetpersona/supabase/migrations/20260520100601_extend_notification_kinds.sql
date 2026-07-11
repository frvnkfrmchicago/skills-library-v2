-- ═══════════════════════════════════════════════
-- AP-ENGAGEMENT-LOOP-2026-05 · Lane 6 · Step 2 of 3
-- Extend notification_kind ENUM with 4 new activity kinds
-- ═══════════════════════════════════════════════
-- The base ENUM from 20260519101100_create_notifications.sql ships with six
-- kinds (mention, comment_reply, post_reaction, dm_received, tier_change,
-- system). This wave introduces four more surfaces that need their own
-- bell-icon entry and their own n8n email-fan-out adapter downstream:
--
--   * module_published        — fired by the publish-fan-out trigger below.
--                               Tells members "a new module dropped."
--   * course_recommended      — written by the role-pathway recommender
--                               (next-wave consumer). Tells a learner that
--                               their current ladder rung unlocked a new
--                               sequence.
--   * achievement_earned      — fired by the completion-milestone trigger
--                               below. Tells the user they hit 1st / 10th /
--                               50th completion or 3/7/30-day streak.
--   * portfolio_project_liked — written by the public-portfolio like-bell
--                               (Lane 4 consumer). Tells a portfolio owner
--                               their work just got engagement.
--
-- ALTER TYPE ... ADD VALUE cannot run inside a multi-statement transaction
-- in older Postgres. Supabase's migration runner executes each .sql file in
-- its own transaction, which is the supported pattern. If the runner ever
-- wraps multiple ALTER TYPE statements in one BEGIN/COMMIT and errors with
-- "ALTER TYPE ... ADD cannot run inside a transaction block", split this
-- file into four single-statement migrations (one ALTER TYPE per file).
-- ═══════════════════════════════════════════════

ALTER TYPE public.notification_kind ADD VALUE IF NOT EXISTS 'module_published';
ALTER TYPE public.notification_kind ADD VALUE IF NOT EXISTS 'course_recommended';
ALTER TYPE public.notification_kind ADD VALUE IF NOT EXISTS 'achievement_earned';
ALTER TYPE public.notification_kind ADD VALUE IF NOT EXISTS 'portfolio_project_liked';
