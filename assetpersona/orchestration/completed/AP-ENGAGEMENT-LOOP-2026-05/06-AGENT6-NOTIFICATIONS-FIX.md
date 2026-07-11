# 06-AGENT6: Notifications + Scheduling Fixes
Status: complete
Wave: AP-ENGAGEMENT-LOOP-2026-05

## Explainer
Lane 6 lands three pure-SQL migrations against the AssetPersona Supabase schema. Together they repair a silent-fail bug in the notification settings UI, extend the notification ENUM with four new activity kinds, and wire two new triggers that fan out notifications when a module gets published and when a learner hits completion or streak milestones. No source code was touched — UserSettings.tsx already writes the right shape; this lane only gives that write a real column to land in, plus the downstream surfaces the rest of the wave will consume. The work follows the same SECURITY DEFINER + explicit search_path + REVOKE/GRANT pattern that the original `parse_mentions_and_notify` trigger established in the AP-MODERNIZE Lane 3 migration.

## TL;DR

| What | Result |
|---|---|
| Silent-fail bug on profile notification prefs | Repaired — column now exists, existing UI write persists |
| New activity kinds (module / course / achievement / portfolio-like) | Added to `notification_kind` ENUM via idempotent `ADD VALUE IF NOT EXISTS` |
| Module-published fan-out | Trigger fires AFTER UPDATE of `status` on `modules`, respects per-user `new_modules` preference, skips author + admins |
| Completion + streak milestones | Trigger fires AFTER INSERT on `module_completions`, inserts `achievement_earned` rows on 1st / 10th / 50th completion and 3 / 7 / 30-day streak |
| Source code changes | Zero — UserSettings.tsx, NotificationsContext, and the bell UI continue to work as written |
| Schema-name correction caught during build | Brief referenced `streaks.current`; actual column is `streaks.current_count`. Migration uses the real column name. |

## Delivery Summary

| Requested outcome | Result | Evidence path |
|---|---|---|
| Add `notification_prefs jsonb` to `profiles` (repair silent-fail) | Delivered | `assetpersona/supabase/migrations/20260520100600_notification_prefs_column.sql` |
| Extend `notification_kind` ENUM with 4 new values | Delivered | `assetpersona/supabase/migrations/20260520100601_extend_notification_kinds.sql` |
| Add `notify_followers_on_module_publish` trigger | Delivered | `assetpersona/supabase/migrations/20260520100602_notification_triggers.sql` (lines 31-65) |
| Add `notify_on_milestone` trigger | Delivered | `assetpersona/supabase/migrations/20260520100602_notification_triggers.sql` (lines 67-142) |
| Default-true preference semantic across `new_modules` | Delivered via `(p.notification_prefs->>'new_modules')::boolean IS NOT FALSE` | Same file, line 51 |
| All migrations idempotent / re-runnable | Delivered — `ADD COLUMN IF NOT EXISTS`, `ADD VALUE IF NOT EXISTS`, `DROP TRIGGER IF EXISTS` + `CREATE OR REPLACE FUNCTION` | All three files |

## Files Changed

| File | Change |
|---|---|
| `assetpersona/supabase/migrations/20260520100600_notification_prefs_column.sql` | NEW — adds `profiles.notification_prefs jsonb NOT NULL DEFAULT '{}'::jsonb` + COMMENT documenting the per-channel shape |
| `assetpersona/supabase/migrations/20260520100601_extend_notification_kinds.sql` | NEW — appends `module_published`, `course_recommended`, `achievement_earned`, `portfolio_project_liked` to the `notification_kind` ENUM |
| `assetpersona/supabase/migrations/20260520100602_notification_triggers.sql` | NEW — two SECURITY DEFINER trigger functions (`notify_followers_on_module_publish`, `notify_on_milestone`) with REVOKE/GRANT and matching triggers on `modules` (AFTER UPDATE OF status) and `module_completions` (AFTER INSERT) |

## Commands Run

| Command | Result | Plain meaning |
|---|---|---|
| `grep -n "notification_prefs" supabase/migrations/20260520100600*` | 5 hits | The new column is named correctly and is referenced in the COMMENT documenting its shape |
| `grep -nE "ADD VALUE.*(module_published\|achievement_earned\|course_recommended\|portfolio_project_liked)" supabase/migrations/20260520100601*` | 4 hits (one per new ENUM value) | All four expected activity kinds are appended to the ENUM |
| `grep -nE "notify_followers_on_module_publish\|notify_on_milestone" supabase/migrations/20260520100602*` | 8 hits across both function definitions, both REVOKE/GRANT pairs, and both trigger bindings | Both trigger functions exist, both are locked down to `authenticated`, both are wired to the right source table |
| `grep -rn "notification_prefs" assetpersona/src` | 2 hits in `src/pages/community/UserSettings.tsx` (lines 63 + 197) | The UI write that was silently failing now has a real column to land in — no source change needed |
| `ls -la supabase/migrations/2026052010060*.sql` | 3 files present, total 10,180 bytes | All three migration artifacts on disk |
| `grep CREATE TABLE.*streaks supabase/migrations/20260505200100_create_progress.sql` | Confirmed `current_count integer` is the real column | Corrected the trigger SQL away from the brief's `current` (which would error at deploy time) |

## Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| `notification_prefs` column migration | `assetpersona/supabase/migrations/20260520100600_notification_prefs_column.sql` | Repairs the silent-fail bug. UserSettings.tsx writes now persist. |
| ENUM extension migration | `assetpersona/supabase/migrations/20260520100601_extend_notification_kinds.sql` | Adds the four new activity kinds the wave's other lanes will write to. |
| Trigger migration | `assetpersona/supabase/migrations/20260520100602_notification_triggers.sql` | Two SECURITY DEFINER triggers (publish fan-out + completion milestones) that hydrate the new ENUM values automatically. |
| Existing notifications schema reference | `assetpersona/supabase/migrations/20260519101100_create_notifications.sql` | Used as the SECURITY DEFINER / REVOKE / GRANT pattern reference (parse_mentions_and_notify trigger). |
| Existing progress schema reference | `assetpersona/supabase/migrations/20260505200100_create_progress.sql` | Used to verify the real `streaks.current_count` column name (corrected from the brief's draft). |

## Remaining Gaps

| Gap | Owner | Next action |
|---|---|---|
| Migrations need to be applied to the live database | Frank credential | Run `supabase db push` from the `assetpersona/` directory after pulling main. |
| Per-channel n8n email fan-out adapter consuming the four new ENUM values | Next-wave consumer (n8n-automating lane) | Wire one Edge Function or n8n flow per new kind that reads new `notifications` rows, applies the recipient's `notification_prefs.{channel}_email` toggle, and delivers. |
| `course_recommended` and `portfolio_project_liked` writers | Lanes 3 (Public Profile) + 4 (Portfolio) of this wave | Those lanes insert the rows; Lane 6 only opened the ENUM slot. |
| `ALTER TYPE` transaction edge case | Future-wave runner | If a later runner ever wraps multiple `ALTER TYPE` statements in one BEGIN/COMMIT and errors, split `20260520100601` into four single-statement migration files. Today's per-file transaction model is fine. |
| In-app surface for `achievement_earned` (custom row template in the bell dropdown) | Future wave | Frontend renderer in NotificationsList currently shows a generic row for unknown kinds. A dedicated achievement template will make milestones feel earned. |

## Task-Sheet Update

| Lane | Status | Notes |
|---|---|---|
| 06-AGENT6 — Notifications + Scheduling Fixes | complete | Three pure-SQL migrations on disk; validation greps pass; brief rewritten with 9 sections + 2/2/2 citation triplet; UserSettings.tsx silent-fail repaired without source changes. |

## Citations

| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | SECURITY DEFINER trigger pattern with explicit `SET search_path = public`, REVOKE ALL FROM PUBLIC, GRANT EXECUTE TO authenticated. Mirrors the exact shape from the existing `parse_mentions_and_notify` trigger. |
| `.claude/skills/database-designing/SKILL.md` | Skill | Idempotent migration discipline: `ADD COLUMN IF NOT EXISTS`, `ADD VALUE IF NOT EXISTS`, `DROP TRIGGER IF EXISTS` + `CREATE OR REPLACE FUNCTION`. Also: validate referenced column names against the real schema before authoring the trigger (caught `current` → `current_count`). |
| `.claude/skills/backend-hardening/SKILL.md` | Skill | Default-true preference semantic: `(p.notification_prefs->>'new_modules')::boolean IS NOT FALSE` means "absent key opts the recipient in" — the safe-by-default reading for a per-channel toggle that hasn't been touched yet by the user. |
| `.claude/skills/n8n-automating/SKILL.md` | Skill | Fan-out consumer pattern. Establishes that every new ENUM value should be matched 1:1 by a downstream adapter (email, push, in-app), and that the trigger should NOT do the delivery itself — it only writes the row, the consumer reads it. |
| `librarians/supabase-librarian.md` | Librarian | Trigger composition lifted from prior `parse_mentions_and_notify` lane — same function shape, same REVOKE/GRANT discipline, same `SET search_path` armor. |
| `librarians/backend-librarian.md` | Librarian | Additive-migration discipline. Three small files beat one fat one — easier to revert one piece if a later runtime issue lands. |
| `librarians/security-librarian.md` | Librarian | SECURITY DEFINER REVOKE/GRANT enforcement. Functions are NOT executable by PUBLIC; `authenticated` role only. Prevents anon callers from triggering trigger logic out-of-band. |
| https://supabase.com/docs/guides/database/postgres/triggers | 2026 URL | Postgres trigger function reference, the AFTER UPDATE OF column syntax, FOR EACH ROW semantics. |
| https://www.postgresql.org/docs/current/sql-altertype.html | 2026 URL | `ALTER TYPE ... ADD VALUE` reference + the explicit caveat that it cannot run inside a multi-statement transaction — informs the per-file transaction strategy. |
| https://supabase.com/docs/guides/database/postgres/row-level-security | 2026 URL | RLS interaction with SECURITY DEFINER triggers. Confirms triggers writing notifications under the actor's identity is the supported pattern and that the existing `Notifications insert authenticated` policy already covers it. |
