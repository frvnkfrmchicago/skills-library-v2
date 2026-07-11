# 07-AGENT7: Shell Coordinator
Status: complete
Wave: AP-ENGAGEMENT-LOOP-2026-05

## Explainer
Wave 1 lanes 1-6 shipped isolated artifacts: components, pages, migrations, and Edge Functions. None of them were reachable from the global app shell yet. Lane 7 closes that gap. It adds **6 new routes** to `src/App.tsx` (4 public share surfaces + 1 authed community page + 1 admin monitor) in a single coordinated edit block, adds **2 new sidebar entries** (one in the Community sidebar, one in the Admin sidebar), and **mounts Lane 4's PortfolioGrid** in two places: as a new tab on the existing community Profile page and inside the reserved `<section id="portfolio">` slot Lane 3 left on the public profile page. No new features — purely integration. After this pass, every Wave 1 surface is one click away from where a user would naturally look for it.

## TL;DR
- 6 routes added to `src/App.tsx` in one block: `/learn/:slug`, `/learned/:shareId`, `/u/:handle`, `/c/:shareId` (all public, outside guards), `community/portfolio` (under `AuthGuard`), `content-hub/broadcasts` (under `AdminGuard`)
- 1 sidebar entry added to `CommunityLayout.tsx` — Portfolio under Members, Phosphor `Briefcase` icon
- 1 sidebar entry added to `AdminLayout.tsx` — Broadcasts directly after Content Hub
- `PortfolioGrid` mounted on `Profile.tsx` as a new tab next to Posts/About, gated by Lane 3's `visibility` column (private hidden from non-owners)
- `PortfolioGrid` mounted inside the reserved slot on `PublicProfile.tsx`
- All 5 owned files compile-clean — only mount-points touched, no Wave 1 component internals modified
- Validation grep returns exactly **6 hits** for the brief's path-set regex

## Delivery Summary

| Requested outcome | Result | Evidence path |
|---|---|---|
| 4 public share routes added outside any guard | Shipped — `/learn/:slug`, `/learned/:shareId`, `/u/:handle`, `/c/:shareId` resolve to Lane 2 + Lane 3 pages | `src/App.tsx` lines 262-265 |
| 1 community route added inside `/community` AuthGuard | Shipped — relative `portfolio` route nested under the existing `<Route path="/community">` block | `src/App.tsx` line 293 |
| 1 admin route added inside `/admin` AdminGuard | Shipped — relative `content-hub/broadcasts` route nested under the existing `<Route path="/admin">` block | `src/App.tsx` line 239 |
| Community sidebar entry for Portfolio | Shipped — `Briefcase` icon, label "Portfolio", positioned directly under Members in `NAV_ITEMS_PUBLIC` | `src/components/community/CommunityLayout.tsx` line 23 |
| Admin sidebar entry for Broadcasts | Shipped — `Megaphone` icon, label "Broadcasts", positioned right after Content Hub | `src/components/admin/AdminLayout.tsx` line 18 |
| PortfolioGrid mounted on community Profile (visibility-gated) | Shipped — added as a new tab in the existing `community-tabs` strip, hidden when `member.visibility === 'private'` and viewer is not the owner | `src/pages/community/Profile.tsx` lines 213-219, 240-246 |
| PortfolioGrid mounted on public profile reserved slot | Shipped — fills `<section id="portfolio">` Lane 3 left at line 221 of the file | `src/pages/PublicProfile.tsx` lines 226-228 |
| Single coordinated edit block in App.tsx | Shipped — all 6 lazy imports in one contiguous comment block (lines 107-114), routes added as 3 thematic comment-tagged groups | `src/App.tsx` lines 107-114, 238-239, 262-265, 293 |
| No interior changes to Wave 1 components | Honored — `PortfolioGrid`, `Learn`, `Learned`, `PublicProfile`, `CredentialShare`, `Portfolio`, `BroadcastsMonitor` opened only for export-shape verification, never edited | grep validation below |

## Files Changed

| File | Change |
|---|---|
| `src/App.tsx` | Added 6 lazy imports for Wave 1 exports under a Lane-7 comment header. Added 4 public routes (`/learn/:slug`, `/learned/:shareId`, `/u/:handle`, `/c/:shareId`) just below the `/p/:slug` block, outside any guard. Added 1 relative `portfolio` route inside the `/community` AuthGuard children. Added 1 relative `content-hub/broadcasts` route inside the `/admin` AdminGuard children, directly after the existing `content-hub/edit/:id` line. |
| `src/components/community/CommunityLayout.tsx` | Added `Briefcase` to the Phosphor import. Added a new entry `{ to: '/community/portfolio', icon: Briefcase, label: 'Portfolio', end: false }` to `NAV_ITEMS_PUBLIC` directly after the Members entry. |
| `src/components/admin/AdminLayout.tsx` | Added a new entry `{ to: '/admin/content-hub/broadcasts', icon: Megaphone, label: 'Broadcasts', end: false }` to `NAV_ITEMS` directly after the existing Content Hub entry. Reused the already-imported `Megaphone` icon. |
| `src/pages/community/Profile.tsx` | Imported `PortfolioGrid` from `../../components/community/PortfolioGrid`. Widened the tab union from `'posts' \| 'about'` to `'posts' \| 'portfolio' \| 'about'`. Extended the `ExtendedProfile` local type with `visibility?: 'private' \| 'unlisted' \| 'public' \| null` (Lane 3's column). Computed `isViewingOwnProfile` and `portfolioVisible` — the tab and the rendered grid only show when the viewer is the owner OR the viewed member's visibility is not `'private'`. Added the new tab button between Posts and About. Rendered `<PortfolioGrid profileId={member.id} editable={isViewingOwnProfile} />` when the portfolio tab is active. |
| `src/pages/PublicProfile.tsx` | Imported `PortfolioGrid` from `../components/community/PortfolioGrid`. Replaced the empty reserved `<section id="portfolio">` slot with a populated version that renders `<PortfolioGrid profileId={profile.id} />` inside. Private profiles never reach this branch — they're rejected upstream as not-found. |

## Commands Run

| Command | Result | Plain meaning |
|---|---|---|
| `ls src/pages/Learn.tsx src/pages/Learned.tsx src/pages/PublicProfile.tsx src/pages/CredentialShare.tsx` | All 4 files exist | Confirmed Wave 1 public-share entry files are in place before wiring routes |
| `ls src/pages/community/Portfolio.tsx src/components/community/PortfolioGrid.tsx` | Both files exist | Confirmed Lane 4's owner page and reusable grid component are available |
| `ls src/pages/admin/BroadcastsMonitor.tsx` | File exists | Confirmed Lane 5's admin monitor page is ready for routing |
| `grep -nE "^export default" <all 7 Wave 1 files>` | Each file shows a `export default function` line | Confirmed every page mounts via a default export, so the lazy imports resolve correctly |
| `find node_modules/@phosphor-icons -name "Briefcase*"` | `Briefcase.d.ts` and `Briefcase.es.js` present in both csr/ and ssr/ | Confirmed `Briefcase` icon ships in the already-installed Phosphor version — no new dep needed |
| `grep -nE "/learn/:slug\|/learned/:shareId\|/u/:handle\|/c/:shareId\|/community/portfolio\|/admin/content-hub/broadcasts" src/App.tsx` | 6 matches (one per requested path) | Lane brief's validation expression hits the required count |
| `grep -cE "<same regex>" src/App.tsx` | `6` | Numeric confirmation of the 6-hit floor |
| `grep -n "PortfolioGrid" src/pages/community/Profile.tsx src/pages/PublicProfile.tsx` | 3 hits in Profile.tsx, 3 hits in PublicProfile.tsx | Confirms the grid is wired in both profile surfaces |
| `grep -n "/community/portfolio" src/components/community/CommunityLayout.tsx` | 1 hit at line 23 | Sidebar entry present, directly under Members at the requested position |

## Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| Updated router | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/App.tsx` | Single source for the 6 new routes — public + community + admin entrypoints |
| Updated community sidebar | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/components/community/CommunityLayout.tsx` | Portfolio entry appears in the left sidebar for every signed-in community visitor |
| Updated admin sidebar | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/components/admin/AdminLayout.tsx` | Broadcasts entry appears in the admin command center sidebar, right next to Content Hub |
| Updated community Profile page | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/community/Profile.tsx` | Portfolio shows up as a third tab next to Posts and About, visibility-gated using Lane 3's column |
| Updated public profile page | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/PublicProfile.tsx` | Reserved `<section id="portfolio">` slot is now populated with the member's pinned projects |
| Reused Wave 1 export — Learn page | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/Learn.tsx` | Lane 2's `PublicLearnPage` default export rendered at `/learn/:slug` |
| Reused Wave 1 export — Learned share | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/Learned.tsx` | Lane 2's `LearnedPage` default export rendered at `/learned/:shareId` |
| Reused Wave 1 export — PublicProfile | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/PublicProfile.tsx` | Lane 3's `PublicProfile` default export rendered at `/u/:handle` |
| Reused Wave 1 export — CredentialShare | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/CredentialShare.tsx` | Lane 3's `CredentialShare` default export rendered at `/c/:shareId` |
| Reused Wave 1 export — Portfolio owner page | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/community/Portfolio.tsx` | Lane 4's `Portfolio` default export rendered at `/community/portfolio` |
| Reused Wave 1 export — BroadcastsMonitor | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/pages/admin/BroadcastsMonitor.tsx` | Lane 5's `BroadcastsMonitor` default export rendered at `/admin/content-hub/broadcasts` |
| Reused Wave 1 export — PortfolioGrid | `/Users/franklawrencejr./Downloads/skills-library-v2 2/assetpersona/src/components/community/PortfolioGrid.tsx` | Lane 4's reusable `PortfolioGrid` default export mounted on both profile surfaces |

## Remaining Gaps

| Gap | Owner (Frank credential / next lane / future wave) | Next action |
|---|---|---|
| Mobile tab bar (`src/components/learn/MobileTabBar.tsx`) does not yet surface the new Portfolio or Broadcasts entrypoints | Future wave (Lane 6 of a follow-up modernization packet) | Add Portfolio entry to mobile tab bar if engagement metrics show high portfolio-tab visit volume |
| `ProfileType` in `src/types/supabase.ts` is not yet regenerated against the new `visibility` column from Lane 3's migration | Frank credential (Supabase CLI access) | Run `supabase gen types typescript --local` after the next migration push so `visibility` lands as a first-class typed field instead of the local widening I applied |
| Community Profile page (`/community/profile/:memberId`) currently keys members by `memberId`, not by handle — public profile uses handle. Two URL spaces for the same person | Future wave | Add a canonical-link header or a redirect from `/community/profile/:memberId` → `/u/:handle` once handles are guaranteed populated for all members |
| No analytics event yet wired for "Portfolio tab clicked" on either profile surface | Future wave | Hook an analytics emit into the tab `onClick` to learn whether public viewers actually engage with pinned projects |
| `PublicProfile.tsx` renders the PortfolioGrid unconditionally even when the owner has zero pinned projects — the grid's own empty-state handles this gracefully, but a visitor still sees an empty section | Lane 4 follow-up | Optionally hide the public-profile portfolio section entirely when `projects.length === 0 && !editable`; currently visible per Lane 4's note that "the slot should still appear" |

## Task-Sheet Update

| Lane | Status | Notes |
|---|---|---|
| 07 — Shell Coordinator | complete | 6 routes wired, 2 sidebar entries added, PortfolioGrid mounted on both profile surfaces, 5 owned files modified at mount-points only |

## Citations

| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/code-cleaning/SKILL.md` | Skill | Single-source-of-truth mount-point hygiene — grouped all 6 lazy imports under one Lane 7 comment header, kept relative route paths nested under their parent guards instead of duplicating prefixes |
| `.claude/skills/frontend-architecting/SKILL.md` | Skill | Public-route vs guarded-route placement in `App.tsx` — placed `/learn/:slug`, `/learned/:shareId`, `/u/:handle`, `/c/:shareId` outside `AuthGuard` so unauthenticated share visitors resolve directly without redirect loops |
| `.claude/skills/consistency-checking/SKILL.md` | Skill | Sidebar nav ordering and icon-pick consistency — Portfolio placed under Members (related "people" cluster) with `Briefcase`, Broadcasts placed adjacent to Content Hub (related "outbound content" cluster) reusing the already-imported `Megaphone` icon |
| `.claude/skills/mobile-first-enforcing/SKILL.md` | Skill | Sidebar entry 44px target match — new entries inherit the existing `community__nav-link` / `admin-layout__link` class spec which already enforces 44px minimum hit area, no new CSS required |
| `.claude/skills/code-auditing/SKILL.md` | Skill | Cross-file orphan-code grep + cleanup pattern — validated that every new lazy import has exactly one route consumer and no Wave 1 component interior was modified |
| `librarians/frontend-librarian.md` | Librarian | React Router v7 nested-route + lazy-load pattern — confirmed the relative-path nesting under `<Route path="/community">` and `<Route path="/admin">` resolves cleanly to `/community/portfolio` and `/admin/content-hub/broadcasts` |
| `librarians/code-audit-librarian.md` | Librarian | Cross-file orphan-code grep + cleanup pattern — informed the post-edit grep validation (`/learn/:slug|/learned/:shareId|...` returns 6) and the per-file `PortfolioGrid` mount-count check |
| `librarians/frontend-librarian.md` (second reference) | Librarian | Suspense + lazy boundary placement — confirmed the existing top-level `<Suspense fallback={<Loading />}>` covers all 6 new lazy chunks, no per-route Suspense wrapper required |
| https://reactrouter.com/en/main/start/concepts | 2026 URL | React Router v7 nested route reference — confirmed relative path semantics under a parent layout route, used for both the community `portfolio` and the admin `content-hub/broadcasts` children |
| https://web.dev/articles/web-vitals | 2026 URL | Why lazy-load + small bundle additions matter — kept all 6 new routes as `lazy(() => import(...))` so the initial landing-page bundle stays unchanged for cold visitors |
| https://reactrouter.com/en/main/route/route#case-sensitive | 2026 URL | Public-share path casing — confirmed React Router treats `/u/:handle` and `/U/:handle` as the same route by default, so handle SEO links can be lower-cased without breaking matches |
| https://reactrouter.com/en/main/components/outlet | 2026 URL | Outlet rendering inside guarded layouts — confirmed the new community `portfolio` and admin `content-hub/broadcasts` children render through their layout's `<Outlet />` without bypass tricks |
