# 02-AGENT2: Content Hub
Status: complete
Wave: AP-CONTENT-HUB-2026-05

## Explainer
Frank's existing Modules surface is designed for long-form lessons (objective + context + practice + resources). For current-event AI drops he wanted something simpler: a single form, write-and-publish in under a minute, with a severity tag and a state dot. This lane mirrors the Grazzhopper Regulatory Updates Admin pattern into assetpersona at `/admin/content-hub` — Modules stays for lessons, Content Hub handles short bulletins. Schema, data layer, two admin pages (list + composer), CSS, and the single App.tsx + AdminLayout touchpoints all shipped. Public-facing surface is intentionally deferred per the brief.

## TL;DR
- New `/admin/content-hub` route with list view (search + severity-filter chips + state-dot rows) and a single-form composer (title, summary with 200-char counter, body, source URL, severity picker, status picker, Save / Publish / Archive / Delete + 30s auto-save).
- New `content_hub_bulletins` table with two enums, two indexes, four RLS policies (admin-only writes, published-or-staff read), and an `update_updated_at` trigger.
- New `src/data/contentHub.ts` data layer mirroring `learnStore.ts` — Supabase calls when configured, localStorage fallback when bypass is active.
- Sidebar entry `Content Hub` (Phosphor `Megaphone` icon) lands just under `Modules` in `AdminLayout.tsx`.
- Migration filename `20260519100100_create_content_hub.sql` is distinct from Lane 5's `20260519100200_*` and `20260519100300_*` — no collision.

## Delivery Summary

| Requested outcome | Result | Evidence path |
|---|---|---|
| `content_hub_bulletins` table + RLS + indexes + trigger | shipped | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/supabase/migrations/20260519100100_create_content_hub.sql` |
| Data layer with Supabase + bypass-mode localStorage fallback | shipped (`listBulletins`, `getBulletin`, `upsertBulletin`, `deleteBulletin`, `publishBulletin`) | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/data/contentHub.ts` |
| Admin list page with search + severity-filter chips + state-dot rows | shipped | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/admin/ContentHub.tsx` |
| Single-form composer with severity + status pickers + 30s auto-save | shipped | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/admin/ContentHubEdit.tsx` |
| Token-only CSS (severity dots, list rhythm matching Modules.css, composer rhythm matching ModuleEdit.css) | shipped | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/admin/ContentHub.css` |
| Two lazy imports + three route entries in `App.tsx` | shipped (lines 79–80 imports, 220–222 routes) | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/App.tsx` |
| Sidebar `<NavLink>` entry under Modules in `AdminLayout.tsx` | shipped (line 16) | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/components/admin/AdminLayout.tsx` |

## Files Changed

| File | Change |
|---|---|
| `supabase/migrations/20260519100100_create_content_hub.sql` | NEW — bulletin_severity + bulletin_status enums, content_hub_bulletins table, 2 indexes, 4 RLS policies, updated_at trigger |
| `src/data/contentHub.ts` | NEW — bulletin CRUD with Supabase + localStorage router (mirrors learnStore pattern) |
| `src/pages/admin/ContentHub.tsx` | NEW — list view with search + severity filter + publish/delete row actions |
| `src/pages/admin/ContentHubEdit.tsx` | NEW — single-form composer with severity/status pickers + 30s auto-save |
| `src/pages/admin/ContentHub.css` | NEW — token-only styling shared by list + composer |
| `src/App.tsx` | EDIT — two lazy imports + three route entries alongside the modules block |
| `src/components/admin/AdminLayout.tsx` | EDIT — single Megaphone NavLink entry under Modules |

## Commands Run

| Command | Result | Plain meaning |
|---|---|---|
| `ls src/pages/admin/ContentHub*` | 3 files (ContentHub.css, ContentHub.tsx, ContentHubEdit.tsx) | All three new admin files exist |
| `ls supabase/migrations/20260519100100*` | `20260519100100_create_content_hub.sql` | Migration filename matches the brief and doesn't collide with Lane 5 |
| `grep -n "content-hub" src/App.tsx` | 3 hits (lines 220–222) | All three routes registered inside the admin layout block |
| `grep -n "Content Hub" src/components/admin/AdminLayout.tsx` | 1 hit (line 16) | Single sidebar entry landed under Modules |
| `ls src/data/contentHub.ts` | file present | Data layer in place |
| `ls supabase/migrations/20260519*` | four files, no name collision with Lane 5's 100200/100300 | Lane 5's writes are independent of Lane 2's |

## Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| Migration | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/supabase/migrations/20260519100100_create_content_hub.sql` | Versioned database schema change — applied on next `supabase db push` |
| Data layer | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/data/contentHub.ts` | Single typed surface — UI never branches on env |
| List page | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/admin/ContentHub.tsx` | Bulletin queue view at `/admin/content-hub` |
| Composer page | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/admin/ContentHubEdit.tsx` | Single-form editor at `/admin/content-hub/new` and `/admin/content-hub/edit/:id` |
| Stylesheet | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/admin/ContentHub.css` | Token-only styling shared across list + composer |
| App routes | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/App.tsx` | Lazy imports + three nested admin routes |
| Sidebar nav | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/components/admin/AdminLayout.tsx` | NavLink entry positioned under Modules |

## Remaining Gaps

| Gap | Owner | Next action |
|---|---|---|
| Apply migration to remote Supabase | Frank credential | `supabase db push` so the new migration runs against the live project |
| Public-facing bulletin reader | future wave | Add a `/pulse` or `/news` public page that lists `status='published'` bulletins from `content_hub_bulletins` |
| AI-assisted draft | future wave | A "Generate from URL" button mirroring the `ModuleEdit.tsx` AI panel would let admin paste an article URL and get a draft bulletin |
| Author stamp + audit trail | future wave | Wire `author_id` to `useAuth()` user on `upsertBulletin` and surface "by @handle" on row meta |
| `bypass-mode` seed data | Frank credential or future wave | Add a couple of demo bulletins to bypass localStorage seed so first-run admin views aren't empty |

## Task-Sheet Update Row

| Wave | Lane | Status | Evidence |
|---|---|---|---|
| AP-CONTENT-HUB-2026-05 | Lane 2 — Content Hub | complete | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/orchestration/active/AP-CONTENT-HUB-2026-05/02-AGENT2-CONTENT-HUB.md` |

## Citations

| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | RLS pattern + admin-role policy check using `profiles.role IN ('admin', 'moderator')` |
| `.claude/skills/database-designing/SKILL.md` | Skill | ENUM + indexes + `update_updated_at` trigger conventions matching the rest of the project |
| `.claude/skills/component-building/SKILL.md` | Skill | Severity-picker chip + state-dot pattern shared between list filter row and composer pickers |
| `.claude/skills/ux-designing/SKILL.md` | Skill | Single-form curation pattern from the Grazzhopper reference adapted to AI bulletins |
| `.claude/skills/mobile-first-enforcing/SKILL.md` | Skill | 44px touch targets on every actionable chip, button, and search input |
| `librarians/supabase-librarian.md` | Librarian | Migration shape conventions (DO $$ guard for enums, `DROP POLICY IF EXISTS` then CREATE, `update_updated_at()` trigger) |
| `librarians/frontend-librarian.md` | Librarian | Lazy-load + sidebar nav patterns alongside existing modules block |
| `librarians/code-audit-librarian.md` | Librarian | Confirmed Lane 5's owned filenames (`20260519100200_*`, `20260519100300_*`) live elsewhere — no collision with Lane 2's `20260519100100_*` |
| https://supabase.com/docs/guides/database/postgres/row-level-security | 2026 URL | RLS reference for FOR SELECT / INSERT / UPDATE / DELETE policies |
| https://www.w3.org/TR/wai-aria-practices-1.2/#radiobutton | 2026 URL | Form accessibility pattern for the severity + status pickers (`role="radiogroup"` + `aria-checked`) |
| https://supabase.com/docs/reference/javascript/upsert | 2026 URL | `onConflict: 'id'` upsert path used in `upsertBulletin` |
