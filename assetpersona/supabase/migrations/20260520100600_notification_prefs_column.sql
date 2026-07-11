-- ═══════════════════════════════════════════════
-- AP-ENGAGEMENT-LOOP-2026-05 · Lane 6 · Step 1 of 3
-- profiles.notification_prefs (silent-fail repair)
-- ═══════════════════════════════════════════════
-- UserSettings.tsx (src/pages/community/UserSettings.tsx, lines 63 + 197)
-- has been writing to a `notification_prefs` jsonb column on `profiles` that
-- never existed in the schema. The PostgREST update returned 204 No Content
-- because Postgres silently dropped the unknown column when SDK_INFER_RESPONSE
-- was off, and the UI's "Saved" toast fired anyway. This migration gives that
-- write a real column to land in. No source change is required — the existing
-- update statement (`{ email_opt_in, notification_prefs }`) now persists.
--
-- Default is `'{}'::jsonb` (not NULL) so that downstream consumers can
-- treat the absence of a key as default-true without a NULL guard. See the
-- trigger functions in 20260520100602_notification_triggers.sql for the
-- `(p.notification_prefs->>'new_modules')::boolean IS NOT FALSE` semantic.
-- ═══════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.notification_prefs IS
  'Per-channel notification toggles. Shape: { community_posts: bool, new_modules: bool, completion_followup: bool, weekly_digest: bool, live_reminders: bool, mention_email: bool, dm_email: bool }. Absent keys default to TRUE downstream.';
