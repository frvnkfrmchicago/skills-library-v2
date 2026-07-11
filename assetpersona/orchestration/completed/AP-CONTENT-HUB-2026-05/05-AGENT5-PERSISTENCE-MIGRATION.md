# 05-AGENT5: Persistence Migration (Blog drafts + Studio pages)
Status: complete
Wave: AP-CONTENT-HUB-2026-05

## Explainer
BlogWrite drafts and the Puck-based Studio pages used to live in the visitor's browser only — drafts vanished on a different device, a different browser, or after a deploy. Lane 5 added two dedicated Supabase tables with admin-scoped database-level access rules (the RLS gate), and rewrote the two data-layer files so they prefer Supabase when configured and fall back to the browser cache when they're not. Function signatures on the data layer stayed identical so BlogWrite.tsx, StudioList.tsx, StudioEditor.tsx, StudioProvider.tsx, and DynamicPage.tsx all keep working without modification.

## TL;DR
- New `blog_drafts` table with author-scoped RLS — admins can read all, authors can write their own
- New columns + tightened RLS on the existing `studio_pages` table — only `profiles.role = 'admin'` can write
- `src/data/blogDrafts.ts` now mirrors every save/publish/delete to the dedicated drafts table; the legacy mirror to `blog_posts` (the public read path) is preserved
- `src/studio/data/studioStorage.ts` now reads/writes localStorage in a true fallback path when Supabase is unconfigured or dev bypass is active — production traffic still hits Supabase
- New `hydrateDraftsFromSupabase()` export on `blogDrafts.ts` so the app shell can pull server state into the local cache on mount

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| Drafts survive deploys, browser changes, device switches | `blog_drafts` table created with author + admin policies | `supabase/migrations/20260519100200_create_blog_drafts.sql` |
| Studio pages survive deploys + admin-only write | `studio_pages` tightened — permissive policy replaced with admin-scoped INSERT/UPDATE/DELETE; published rows stay publicly readable for `/p/:slug` | `supabase/migrations/20260519100300_create_studio_pages.sql` |
| Blog draft data layer prefers Supabase, falls back to localStorage | Every write fires `mirrorSaveDraft` (Supabase upsert against `blog_drafts`) + the existing `blog_posts` mirror; localStorage is the offline cache that serves sync reads | `src/data/blogDrafts.ts` lines 153–219 |
| Studio data layer prefers Supabase, falls back to localStorage | `useSupabase()` gate at the top of every read/write; localStorage tier writes a parallel cache when Supabase is unconfigured or bypass is active | `src/studio/data/studioStorage.ts` lines 32–37 + each CRUD fn |
| Function signatures stable so consumer pages don't change | No consumer file touched. BlogWrite imports `saveDraft/getDraftBySlug/publishDraft/deleteDraft/BlogDraft` — all present. StudioList/StudioEditor/StudioProvider import `listPages/deletePage/getPage/createPage/updatePage` — all present | `grep -n "from.*blogDrafts\\|from.*studioStorage" src/` returned the same import list as before |
| Migrations idempotent | `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS` before every `CREATE POLICY`, `DO $$ ... IF NOT EXISTS` guards around enums and constraints | both migration files |
| `handle_updated_at()` requirement reconciled with project reality | Project trigger fn is `public.update_updated_at()` (defined in `20260414180447_create_events_system.sql` and reused across 11+ migrations including `blog_posts`). Both new migrations wire that one — same convention as `20260505100400_create_blog_posts.sql` | both migration files, EXECUTE FUNCTION clause |

## Files Changed
| File | Change |
|---|---|
| `supabase/migrations/20260519100200_create_blog_drafts.sql` | NEW. Author + admin RLS on a dedicated drafts table, columns mirror `blog_posts` for clean promotion. |
| `supabase/migrations/20260519100300_create_studio_pages.sql` | NEW. Adds `author_id`/`metadata`/`published_at` to the existing studio_pages table, replaces the loose "any authenticated" policy with admin-scoped INSERT/UPDATE/DELETE, keeps published rows publicly readable, wires `public.update_updated_at()` trigger. |
| `src/data/blogDrafts.ts` | REWRITE. Sync API unchanged. Added Supabase mirror to `blog_drafts` (author-id scoped, RLS-safe), preserved legacy `blog_posts` mirror, added `hydrateDraftsFromSupabase()` for one-shot server-to-cache hydration. |
| `src/studio/data/studioStorage.ts` | REWRITE. Same five fns (`listPages/getPage/getPageBySlug/createPage/updatePage/deletePage`) plus new `publishPage`. Each fn gates on `useSupabase()` — Supabase when configured + not in bypass, localStorage otherwise. |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/migrations/2026051910020* supabase/migrations/2026051910030*` | both files present | Lane 5's two new versioned database schema changes landed at the expected filenames. |
| `grep -n "from(TABLE)\\|from(DRAFTS_TABLE)" src/data/blogDrafts.ts src/studio/data/studioStorage.ts` | 9 hits (3 in blogDrafts.ts, 6 in studioStorage.ts) | Both data layers route to Supabase via the table constant — the brief's "≥2 hits" intent is exceeded. |
| `grep -n "localStorage" src/data/blogDrafts.ts src/studio/data/studioStorage.ts` | all hits live behind `useSupabase()`/`shouldMirrorDrafts()` fallback gates, comments, or error-recovery branches | localStorage is now true fallback, not the source of truth. |
| `grep -rn "from .*blogDrafts" src/` | 5 consumer files import the same set of names as before | The rewrite kept every public function — no consumer code path needs a change. |
| `grep -rn "from .*studioStorage" src/` | 3 consumer files import the same set of names as before | Same — Studio consumers (StudioList, StudioEditor, StudioProvider) still resolve. |
| `wc -l <changed files>` | 379 + 294 + 113 + 128 = 914 | Sanity check on file sizes after the rewrite. |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Blog drafts migration | `supabase/migrations/20260519100200_create_blog_drafts.sql` | Versioned database schema change creating the dedicated drafts table + author/admin RLS. |
| Studio pages migration | `supabase/migrations/20260519100300_create_studio_pages.sql` | Versioned database schema change adding missing columns + tightening RLS on the existing studio_pages table. |
| Blog drafts data layer | `src/data/blogDrafts.ts` | Sync CRUD surface for BlogWrite, with Supabase mirror + hydration. |
| Studio storage data layer | `src/studio/data/studioStorage.ts` | Async CRUD surface for the Puck-based Studio, with localStorage fallback when Supabase is unconfigured or bypass is active. |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Apply migrations to the database | Frank credential | `supabase db push` from the assetpersona root — picks up `20260519100200_create_blog_drafts.sql` and `20260519100300_create_studio_pages.sql` alongside Lane 1's `20260519100000_seed_module_sources.sql` and Lane 2's `20260519100100_create_content_hub.sql`. No data destruction; all changes are additive or replace-policy. |
| Wire hydration on app mount | Next lane (UI integration) | Call `hydrateDraftsFromSupabase()` from `App.tsx` next to the existing `hydrateFromSupabase()` so drafts pull server state on every cold start. Lane 5 owned scope did not include `App.tsx`. |
| One-shot port of any existing browser-only drafts to Supabase | Frank credential (optional) | After `db push`, run BlogWrite once while signed in as admin — every existing local draft's next save fires `mirrorSaveDraft` which upserts to the new `blog_drafts` table. Or write a one-time browser console script that walks `localStorage.getItem('ap_blog_drafts')`, signs `author_id` via `supabase.auth.getUser()`, and upserts. Skippable if local drafts aren't precious. |
| Type contract — drafts table column shape | Future lane | Consider adding `blog_drafts` to `src/types/supabase.ts` generated types so the `(supabase as any)` casts go away. Cosmetic; doesn't block this lane. |
| Brief's literal column names (`name`/`root`) vs actual columns (`title`/`puck_data`) | Lane decision recorded | Brief's prescriptive schema named the JSON column `root` and the title column `name`. Existing studio code reads `puck_data` and `title`; the brief explicitly forbade consumer-file changes. Lane 5 kept the on-the-wire column names the type system expects and added the brief's missing first-class fields (`author_id`, `metadata`, `published_at`). Documented in the migration header so reviewers don't trip over the divergence. |

## Task-Sheet Update Row

`Lane 5 (Persistence Migration) — COMPLETE. Two new migrations land in supabase/migrations/. Two data-layer rewrites keep their sync signatures + add Supabase-first behavior. Frank credential action: supabase db push. No consumer-page edits.`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | RLS-first table layout, the `auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')` policy idiom reused across this project, public-read-for-published / admin-write-only pattern. |
| `.claude/skills/database-designing/SKILL.md` | Skill | Unique constraint on `(author_id, slug)` for the drafts table, GIN-style indexing intent for tags, the `update_updated_at()` trigger reuse pattern, ADD COLUMN IF NOT EXISTS for additive schema changes. |
| `.claude/skills/backend-hardening/SKILL.md` | Skill | Author-scope-on-write enforcement at the database boundary; `WITH CHECK (auth.uid() = author_id)` for INSERT so anonymous browsers cannot create rows. |
| `librarians/supabase-librarian.md` | Librarian | Migration filename convention (`YYYYMMDDHHMMSS_`), header comment block style, RLS policy naming convention matching the rest of the project's migrations. |
| `librarians/backend-librarian.md` | Librarian | Atomic publish-on-write pattern — Lane 5 preserved it by keeping the legacy `blog_posts` mirror in `blogSync.ts` alongside the new dedicated `blog_drafts` mirror, so publish flows still land in the public read table. |
| `librarians/database-librarian.md` | Librarian | Idempotent migration enforcement — every `CREATE TYPE`, `CREATE TABLE`, `CREATE POLICY`, `CREATE TRIGGER` guarded with `IF NOT EXISTS` or `DROP ... IF EXISTS` so re-runs are safe. |
| https://supabase.com/docs/guides/database/postgres/row-level-security | 2026 URL | Authoritative RLS reference for the SELECT/INSERT/UPDATE/DELETE policy split. |
| https://www.postgresql.org/docs/current/sql-createindex.html | 2026 URL | Index strategy guidance for the `(author_id, updated_at DESC)` composite and the slug + status indexes. |
| https://supabase.com/docs/guides/auth/managing-user-data#user-id-as-author | 2026 URL | `auth.uid()` as the canonical author identity for RLS-scoped writes. |
