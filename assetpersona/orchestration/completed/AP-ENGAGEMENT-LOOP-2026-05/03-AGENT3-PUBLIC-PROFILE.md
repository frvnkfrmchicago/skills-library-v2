# 03-AGENT3: Public Profile (3-state, Read.cv pattern)
Status: complete
Wave: AP-ENGAGEMENT-LOOP-2026-05

## Explainer

Before this lane the only profile route was `/community/profile/:memberId` behind AuthGuard, and `profile.faceless` was a single narrow flag that hid completion-ticker rows but did nothing for public discoverability. Frank wanted Uxcel-style public profiles so members can flip their page on, share `assetpersona.com/u/<handle>` with employers, and mint share cards from each credential. Uxcel's privacy-toggle UX is not publicly documented, so the lane adopted Read.cv's documented **3-state visibility model** — private / unlisted / public — because it's the only model where the source-of-truth behavior is published. The default for new rows is `private` so nothing leaks on rollout; members opt in from the new Privacy tab in UserSettings.

The work split into five artifacts: a migration that adds the `handle` column + `profile_visibility` ENUM + a `profile_credentials` table with database-level access rules gated on visibility; a `publicProfile.ts` data layer with debounced handle availability + visibility writes; a Privacy tab in UserSettings with a handle picker, 3-state radio, and copy-share-link button; the public `/u/:handle` page that 404s on private rows and surfaces credentials + a signup CTA for unauthenticated visitors; and a public `/c/:shareId` credential page with OG metadata so the link renders as a rich card on LinkedIn / X / Bluesky. Lane 7 handles the actual route wire-up in `App.tsx`; this lane stayed inside its owned scope.

## TL;DR

- Migration: `handle text UNIQUE` (case-insensitive index + format CHECK) + `visibility ENUM(private, unlisted, public)` + `profile_credentials` table with database-level access rules tied to profile visibility
- Data layer: `getByHandle`, `getCredentialByShareId`, `checkHandleAvailable` (debounced + case-insensitive), `setHandleAndVisibility`, `getOwnHandleAndVisibility`, `validateHandle`
- Privacy tab: handle picker with live availability tick/cross, 3-state radio, copy-share-link button, all wired to the data layer
- Public profile: 404 on `private`, full render on `public`/`unlisted` (unlisted gets `noindex,nofollow`), credentials grid, sticky signup CTA for visitors
- Credential share: branded card view, OG metadata pointing at `og-image` Edge Function, contextual footer CTA (signup for guests, "more modules" for members)
- Default `visibility = 'private'` — nothing leaks until the member flips it

## Delivery Summary

| Requested outcome | Result | Evidence path |
|---|---|---|
| Migration adds handle + visibility ENUM + credentials table with RLS | Done | `supabase/migrations/20260520100300_public_profile.sql` |
| `publicProfile.ts` exports all four reads/writes from the brief | Done | `src/data/publicProfile.ts` |
| Privacy tab with handle picker + 3-state radio + share-link copy | Done | `src/pages/community/UserSettings.tsx` (lines 78-95, 252-323, 579-720) |
| `PublicProfile.tsx` renders by `:handle`, 404s on private | Done | `src/pages/PublicProfile.tsx` |
| `CredentialShare.tsx` renders share card with OG metadata | Done | `src/pages/CredentialShare.tsx` |
| Token-only CSS, mobile-first, 44px touch targets | Done | `src/pages/PublicProfile.css`, `src/pages/CredentialShare.css`, `src/pages/community/UserSettings.css` additions |
| Default visibility = `'private'` on new profiles | Done | Migration line 31 |
| Handle availability check debounced + case-insensitive | Done | `UserSettings.tsx` lines 252-282 (300ms debounce); `publicProfile.ts` `checkHandleAvailable` uses `ilike` |

## Files Changed

| File | Change |
|---|---|
| `supabase/migrations/20260520100300_public_profile.sql` | NEW — ENUM + ALTER + index + RLS + credentials table |
| `src/data/publicProfile.ts` | NEW — data layer with 6 exported functions + types |
| `src/pages/community/UserSettings.tsx` | EDIT — added 4 imports, 7 state hooks, 3 handlers, and the Privacy tab content block (Privacy tab only — Lane 3 scope) |
| `src/pages/community/UserSettings.css` | EDIT — appended Privacy-tab styles (handle picker, visibility radio group, share-link block) |
| `src/pages/PublicProfile.tsx` | NEW — public `/u/:handle` page |
| `src/pages/PublicProfile.css` | NEW — token-only styles, mobile-first |
| `src/pages/CredentialShare.tsx` | NEW — public `/c/:shareId` page |
| `src/pages/CredentialShare.css` | NEW — token-only styles, mobile-first |

## Commands Run

| Command | Result | Plain meaning |
|---|---|---|
| `grep -n "ALTER TABLE.*profiles.*ADD COLUMN.*handle\|visibility" supabase/migrations/20260520100300*` | 6 matches (well above the `≥2` floor) | The migration touches both new columns as required |
| `ls src/pages/PublicProfile.tsx src/pages/CredentialShare.tsx` | Both files exist | Required new pages were created |
| `grep -n "Privacy" src/pages/community/UserSettings.tsx` | 10 matches across state, handlers, and JSX | New Privacy tab content lives where the brief said it should |
| `ls src/pages/PublicProfile.css src/pages/CredentialShare.css src/data/publicProfile.ts` | All present | Supporting CSS + data layer artifacts are in place |

No build / typecheck / test was run — operational rule for this packet says agents stay on Read + Edit + Write plus read-only Bash. Frank verifies builds after the wave settles.

## Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| Migration | `supabase/migrations/20260520100300_public_profile.sql` | Adds `handle` + `visibility` ENUM + `profile_credentials` table + visibility-gated public read |
| Data layer | `src/data/publicProfile.ts` | Reads (`getByHandle`, `getCredentialByShareId`), writes (`setHandleAndVisibility`), availability check (`checkHandleAvailable`), seed loader (`getOwnHandleAndVisibility`), shape guard (`validateHandle`) |
| UserSettings (Privacy tab) | `src/pages/community/UserSettings.tsx` | Adds the Privacy tab content block — handle picker, 3-state radio, copy-share-link |
| UserSettings CSS additions | `src/pages/community/UserSettings.css` | Styles for the handle picker, visibility radio group, and share-link card |
| Public profile page | `src/pages/PublicProfile.tsx` | Public `/u/:handle` route, RLS-aware, 404 on private |
| Public profile CSS | `src/pages/PublicProfile.css` | Cover + avatar + stats + credentials grid + sticky signup CTA |
| Credential share page | `src/pages/CredentialShare.tsx` | Public `/c/:shareId` route, OG metadata via `og-image` Edge Function |
| Credential share CSS | `src/pages/CredentialShare.css` | Centered card layout with brand shimmer + footer CTA |

## Remaining Gaps

| Gap | Owner | Next action |
|---|---|---|
| Routes for `/u/:handle` and `/c/:shareId` not yet mounted in `App.tsx` | Lane 7 | Lane 7 adds both routes in the single shell-coordinator pass per the dispatch plan |
| `PortfolioGrid` mount on the public profile (slot id="portfolio" is reserved) | Lane 7 + Lane 4 | Lane 7 imports Lane 4's `PortfolioGrid` and renders it inside `<section id="portfolio">` when Lane 4's table is present |
| `og-image` Edge Function consumer of `?credentialId=` | Lane 2 | Lane 2 owns the Edge Function and is adding `credentialId` handling in this packet |
| Sample credential rows seeded for QA | Frank credential | After migration runs, Frank can manually `INSERT INTO profile_credentials` or wait for the Lane 6 trigger that auto-issues on module completion |
| Production posting of handle changes to analytics warehouse | Future wave | Current code emits `track('profile_completed', { surface: 'privacy', visibility })`; downstream warehouse mapping is out of scope here |

## Task-Sheet Update

| Lane | Owner | Status | % | Notes |
|---|---|---|---|---|
| Lane 3 — Public Profile (3-state, Read.cv pattern) | Agent 3 | complete | 100% | All Build Tasks shipped within owned scope. Default `visibility='private'`. Handle check debounced + case-insensitive. Brief rewritten per evidence contract. |

## Citations

| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | 3-state visibility ENUM pattern; database-level access rule shape gated on visibility; credentials table inheriting profile visibility through a sub-select policy |
| `.claude/skills/database-designing/SKILL.md` | Skill | Unique `handle` with lowercase functional index; CHECK constraint matching the documented Read.cv handle rules; conditional indexes (`WHERE visibility <> 'private'`) to keep the public-members list query cheap |
| `.claude/skills/ux-designing/SKILL.md` | Skill | 3-state privacy radio with icon + label + plain-language help row per option; default to safest state; reveal share-link block only after the member earns it by going non-private |
| `.claude/skills/pattern-referencing/SKILL.md` | Skill | IAAA pass: identified Read.cv's documented 3-state model over guessed Uxcel internals; adapted Read.cv handle shape + Uxcel credential-share URL style into Asset Persona's brand voice |
| `.claude/skills/component-building/SKILL.md` | Skill | Handle-picker control: debounced availability check (300ms), inline tick/cross indicator, prefix span + flex input row, status-state union type to drive UI without effect loops |
| `.claude/skills/mobile-first-enforcing/SKILL.md` | Skill | 44px minimum interactive targets across the Privacy tab inputs, visibility radios, share button, and both public pages; `dvh` viewport on credential card; safe-area-inset padding on bottom CTAs |
| `.claude/skills/copywriting-enforcing/SKILL.md` | Skill | Plain-language radio help copy ("Only you can see it", "Only people you give the link to", "Anyone can find you") and signup CTA framing without AI-tells |
| `.claude/skills/frontend-architecting/SKILL.md` | Skill | Public-route pattern with `useEffect` cancel guard, discriminated-union loading state, and `NotFound` re-render on private/missing — keeps the page sealed against partial renders |
| `librarians/supabase-librarian.md` | Librarian | Database-level access rule migration shape: `DROP POLICY IF EXISTS` + `CREATE POLICY` pairs, ENUM creation guarded by `pg_type` lookup so re-runs don't error |
| `librarians/frontend-librarian.md` | Librarian | Public-route + 404-on-private pattern; React Router `useParams` typing; client-side gating that still trusts the server's RLS |
| `librarians/facilitator-librarian.md` | Librarian | Privacy-toggle UX with progressive disclosure (share-link block only appears when warranted) and the founder-voice tone for the signup CTA |
| `librarians/code-audit-librarian.md` | Librarian | Audit lens: ensured all writes flow through the data-layer module so future RLS changes have a single chokepoint; no inline `supabase.from()` calls in the page components |
| `https://read.cv/about/profiles` | 2026 URL | The documented 3-state visibility model (private / unlisted / public) adopted here — primary 2026 source |
| `https://help.uxcel.com/articles/4990319-certificates-at-uxcel-earning-accessing-and-sharing` | 2026 URL | Uxcel credential-share URL pattern reference informing the `/c/:shareId` shape |
| `https://help.uxcel.com/en/articles/4248828-how-can-i-add-my-certificate-to-linkedin` | 2026 URL | Why portable credential share URLs matter — LinkedIn certificate-add flow expects a clean canonical URL |
| `https://schema.org/EducationalOccupationalCredential` | 2026 URL | Credential schema shape used to inform the `kind` + `label` + `earned_at` + `metadata` design on `profile_credentials` |
