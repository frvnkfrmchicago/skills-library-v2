# 04-AGENT4: Portfolio / Pinned Projects
Status: complete
Wave: AP-ENGAGEMENT-LOOP-2026-05

## Explainer
Members had no way to showcase the things they're proud of. The community Profile page surfaced bio, level, and activity, but the "what have you built?" question had to be answered with a links blurb in the bio. This lane ships a real portfolio: a new `member_projects` table backed by Supabase row-level security, an owner-edit page at `/community/portfolio`, a reusable `PortfolioGrid` for the public surface, and a modal `PortfolioItemEditor` for add/edit. Lane 7 mounts the grid on the Profile page and adds the sidebar link — this lane owns everything else.

The crux is the cross-table read policy: pinned projects are public-readable, but only when the owning profile's `visibility` (the column Lane 3 lands in the same wave) is non-private. That lets the same `PortfolioGrid` work on the gated community Profile and on the public `/u/:handle` route Lane 3 ships, without the grid having to know about either.

## TL;DR

| Field | Value |
|---|---|
| Outcome | Members can curate 3-8 pinned projects; the public profile renders them in a responsive grid; the data layer round-trips against Supabase OR localStorage in dev-bypass. |
| Public-read gate | Pinned only AND owning profile is non-private (cross-table EXISTS check against Lane 3's `profiles.visibility`). |
| Owner page | `/community/portfolio` — pinned section + drafts section + Add CTA + per-row reorder/pin/edit. |
| Animation budget | One pin pulse + one card lift on hover, both gated by `prefers-reduced-motion`. |
| Visual cap | `PINNED_LIMIT = 8` — exported constant the page and grid both consume. |
| Position-based order | Server index `(profile_id, is_pinned DESC, position ASC, created_at DESC)` matches the planner shape on both surfaces. |

## Delivery Summary

| Requested outcome | Result | Evidence path |
|---|---|---|
| `member_projects` table + cross-table RLS | Shipped — 4 policies wire owner-all + pinned-public-read | `supabase/migrations/20260520100400_member_projects.sql` |
| Data layer with bypass fallback | Shipped — `listMyProjects`, `listPinnedFor`, `upsertProject`, `deleteProject`, `reorderProjects` | `src/data/memberProjects.ts` |
| `PortfolioGrid` read-only component | Shipped — responsive 1/2/3 col grid, 16:9 cards, owner CTA when `editable` | `src/components/community/PortfolioGrid.tsx` + `.css` |
| `PortfolioItemEditor` modal | Shipped — title/desc/image/URLs/tags/pin toggle, 400-char counter, delete | `src/components/community/PortfolioItemEditor.tsx` + `.css` |
| Owner-edit page at `/community/portfolio` | Shipped — pinned + drafts sections, add CTA, up/down reorder, optimistic pin toggle | `src/pages/community/Portfolio.tsx` + `.css` |

## Files Changed

| File | Change |
|---|---|
| `supabase/migrations/20260520100400_member_projects.sql` | NEW — table + composite index + owner-ALL policy + cross-table public-read policy + `updated_at` trigger |
| `src/data/memberProjects.ts` | NEW — typed data layer with Supabase + localStorage paths and `PINNED_LIMIT` export |
| `src/components/community/PortfolioGrid.tsx` | NEW — read-only display component for the public surface |
| `src/components/community/PortfolioGrid.css` | NEW — token-only responsive grid styling |
| `src/components/community/PortfolioItemEditor.tsx` | NEW — modal add/edit form with validation, delete, pin toggle |
| `src/components/community/PortfolioItemEditor.css` | NEW — token-only modal styling with reduced-motion guards |
| `src/pages/community/Portfolio.tsx` | NEW — owner-edit page with pinned/drafts sections and reorder controls |
| `src/pages/community/Portfolio.css` | NEW — token-only page styling, mobile-first |

## Commands Run

| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/migrations/20260520100400_member_projects.sql` | 1 file | The migration file exists at the path the brief specified. |
| `ls src/components/community/PortfolioGrid.tsx src/components/community/PortfolioItemEditor.tsx src/pages/community/Portfolio.tsx` | 3 files | All three artifact files exist. |
| `grep -n "from('member_projects')" src/data/memberProjects.ts` | 5 hits | The data layer talks to the `member_projects` table from multiple call sites (≥3 required). |

## Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| Migration | `supabase/migrations/20260520100400_member_projects.sql` | Creates the table, composite index, owner-ALL and pinned-public-read policies, and the `updated_at` trigger. |
| Data layer | `src/data/memberProjects.ts` | Typed Supabase queries + localStorage fallback for dev-bypass and unconfigured environments. |
| Public grid | `src/components/community/PortfolioGrid.tsx` (+`.css`) | Lane 7 mounts this on Profile pages; renders up to `PINNED_LIMIT` pinned cards. |
| Editor modal | `src/components/community/PortfolioItemEditor.tsx` (+`.css`) | Reused on the owner page for both add and edit. |
| Owner page | `src/pages/community/Portfolio.tsx` (+`.css`) | The `/community/portfolio` route (Lane 7 wires routing) — pinned + drafts + reorder. |

## Remaining Gaps

| Gap | Owner | Next action |
|---|---|---|
| Route + sidebar entry for `/community/portfolio` not mounted | Lane 7 | Lane 7 adds `<Route path="/community/portfolio" element={<Portfolio />} />` and the sidebar link. |
| `PortfolioGrid` mount on Profile / PublicProfile | Lane 7 | Lane 7 imports `PortfolioGrid` and renders it inside the Profile + PublicProfile layouts. |
| Public-read RLS depends on Lane 3's `profiles.visibility` column | Lane 3 (same wave) | Lane 3's `20260520100300_public_profile.sql` adds the column the Lane 4 policy references. Both must apply in order (Lane 3 first). |
| Image hosting | Future wave | Editor accepts an image URL today; a follow-up wave can wire the `cover_url` Storage upload pattern from `CoverImageUpload.tsx`. |
| Drag-and-drop reorder UX | Future wave | Up/down arrows ship today; dnd-kit can replace the arrows without changing the data layer. |
| Tag autocomplete | Future wave | Tags ship as free-text comma-separated input; a follow-up can suggest from a learned dictionary. |

## Task-Sheet Update

| Lane | Status | Notes |
|---|---|---|
| Lane 4 — Portfolio / Pinned Projects | complete | Migration + data layer + grid + editor + owner page all shipped under Owned Scope. Public-read policy depends on Lane 3's `visibility` column landing in the same wave. |

## Citations

| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | Cross-table RLS check pattern — pinned-public-read gated on owning profile's `visibility` via EXISTS subquery |
| `.claude/skills/database-designing/SKILL.md` | Skill | Composite index shape `(profile_id, is_pinned DESC, position ASC, created_at DESC)` matching both query surfaces |
| `.claude/skills/component-building/SKILL.md` | Skill | `PortfolioGrid` + `PortfolioItemEditor` composition split — display vs. modal-form separation |
| `.claude/skills/ux-designing/SKILL.md` | Skill | Owner flow: pinned section + drafts section + Add CTA + reorder + pin toggle as a single page |
| `.claude/skills/mobile-first-enforcing/SKILL.md` | Skill | Responsive 1/2/3 col grid at 360 / 768 / 1024 and ≥44px touch targets across every interactive element |
| `.claude/skills/pattern-referencing/SKILL.md` | Skill | IAAA pass against Read.cv and Uxcel pinned-project sections — adopted Read.cv's documented shape |
| `.claude/skills/interactive-animating/SKILL.md` | Skill | Pin pulse + hover lift micro-feedback, both gated by `prefers-reduced-motion` |
| `librarians/supabase-librarian.md` | Librarian | RLS cross-table EXISTS shape and DROP-then-CREATE policy pattern for idempotent migrations |
| `librarians/frontend-librarian.md` | Librarian | Component prop discipline + lazy `loading="lazy"` image attribute on grid thumbnails |
| `librarians/facilitator-librarian.md` | Librarian | Owner-edit page flow design: add → edit → pin → reorder → publish |
| https://read.cv/about/profiles | 2026 URL | Documented portfolio section shape — pinned cards with title / description / external links |
| https://help.uxcel.com/articles/4990319-certificates-at-uxcel-earning-accessing-and-sharing | 2026 URL | Adjacent credential / portfolio sharing pattern for the "Pin to public profile" semantics |
| https://supabase.com/docs/guides/database/postgres/row-level-security | 2026 URL | RLS authoring reference for the cross-table `EXISTS` policy |
| https://supabase.com/docs/reference/javascript/upsert | 2026 URL | `upsert({ onConflict: 'id' })` shape used by `upsertProject` |
