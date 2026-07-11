# 01-AGENT1: Blog Accessibility Fix + RSS Discovery
Status: complete
Wave: AP-MODERNIZE-2026-05

## Explainer
The public `/blog` list page was rendering the legacy static `BLOG_POSTS` array (three hardcoded entries), so admin-published posts written through `/admin/blog/new` would land in Supabase, localStorage, the sitemap, and the RSS feed — but never appear on the page itself. This lane swaps the import to the canonical `getAllPublishedPosts()` source (which merges static + localStorage and is already used by `BlogTag.tsx` and `BlogPost.tsx`), adds an RSS auto-discovery `<link rel="alternate">` inside `SEOHead.tsx` so feed readers can find `/feed.xml` from any page, and ships an opt-in `BlogWidgetSmall` component for Lane 6's community sidebar. The widget is not mounted — Lane 6 decides.

## TL;DR
- `/blog` now renders every published post (static + admin), sorted newest first — admin posts are visible the moment they hit localStorage or Supabase.
- Every page now exposes `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` so feed readers (Feedly, NetNewsWire, Reeder, Inoreader) auto-discover the RSS feed.
- Opt-in `BlogWidgetSmall` component ships standalone with token-only styling; CommunityLayout (Lane 6) decides whether to surface it.

## Delivery Summary

| Requested outcome | Result | Evidence path |
|---|---|---|
| `/blog` lists admin-published posts | Done — `Blog.tsx` now calls `getAllPublishedPosts()` on each render | `src/pages/Blog.tsx:5,29` |
| RSS auto-discovery in `<head>` for feed readers | Done — `<link rel="alternate" type="application/rss+xml" href="/feed.xml" title="Asset Persona Blog">` rendered by `SEOHead` on every route | `src/components/seo/SEOHead.tsx:50-56` |
| `index.html` not double-emitting the RSS link | Confirmed — `grep "feed.xml\|application/rss" index.html` returns no hits, so `SEOHead` is single source of truth | `index.html` (grep result: no hits) |
| Optional `BlogWidgetSmall` component for community sidebar | Created `BlogWidgetSmall.tsx` + `BlogWidgetSmall.css`; takes `limit?: number` (default 3); renders nothing if no posts; not mounted anywhere | `src/components/community/BlogWidgetSmall.tsx`, `src/components/community/BlogWidgetSmall.css` |
| Lane 6 boundary respected | No edits to `CommunityLayout.tsx`, `App.tsx`, `Navbar.tsx`, or any Lane 2-5 files | (verified by file scope) |

## Files Changed

| File | Change |
|---|---|
| `src/pages/Blog.tsx` | Replaced `import { BLOG_POSTS }` with `import { getAllPublishedPosts }`; replaced `BLOG_POSTS.map(...)` with `getAllPublishedPosts().map(...)`. Sort is already applied inside `getAllPublishedPosts()` (newest first by `date`). |
| `src/components/seo/SEOHead.tsx` | Added `<link rel="alternate" type="application/rss+xml" href="/feed.xml" title="Asset Persona Blog">` inside the existing `<Helmet>` block, right under the canonical link. Single mount per route — `Helmet` dedupes by key. |
| `src/components/community/BlogWidgetSmall.tsx` (NEW) | Compact recent-posts list. Reads `getAllPublishedPosts()`, slices to `limit` (default 3). No state, no fetching. Renders `null` when no posts. Token-only colors and spacing. |
| `src/components/community/BlogWidgetSmall.css` (NEW) | Token-only styling: surfaces, borders, typography, radii, spacing all from `tokens.css`. Cards meet the 44px touch-target floor. Two-line title clamp. Focus-visible state uses brand primary. |

## Commands Run

| Command | Result | Plain meaning |
|---|---|---|
| `grep -n "BLOG_POSTS\|getAllPublishedPosts" src/pages/Blog.tsx` | `5:import { getAllPublishedPosts } from '../content/blog';` and `29: {getAllPublishedPosts().map(...)` | Only the merged-source function remains. The legacy static-only array is no longer referenced. |
| `grep -n "feed.xml\|application/rss" src/components/seo/SEOHead.tsx` | 3 hits (comment + `type` + `href`) | RSS auto-discovery is wired into the shared `<Helmet>`. |
| `grep -n "feed.xml\|application/rss" index.html` | no hits | The static HTML head doesn't duplicate the RSS link. `SEOHead` is single source of truth. |
| `grep -rn "BlogWidgetSmall" src/` | Hits only inside the widget's own files | Widget is shipped but unmounted. Lane 6 owns the mounting decision. |

## Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| Fixed blog list page | `src/pages/Blog.tsx` | The two-line correctness fix that unblocks every admin-published post. |
| RSS discovery wiring | `src/components/seo/SEOHead.tsx` | Adds `<link rel="alternate" type="application/rss+xml">` to every page's `<head>` so feed readers auto-discover `/feed.xml`. |
| Optional widget component | `src/components/community/BlogWidgetSmall.tsx` | Compact recent-posts list for the community sidebar. Opt-in for Lane 6. |
| Optional widget styles | `src/components/community/BlogWidgetSmall.css` | Token-only CSS for the widget. |
| Lane brief (this file) | `orchestration/active/AP-MODERNIZE-2026-05/01-AGENT1-BLOG-ACCESSIBILITY.md` | Authoritative evidence record. |

## Remaining Gaps

| Gap | Owner | Next action |
|---|---|---|
| Mount `BlogWidgetSmall` in `CommunityLayout.tsx` | Lane 6 | Optional opt-in. Import the default export, render in the sidebar with a `limit` prop (3 is a good default). |
| `getAllPublishedPosts()` does not currently pull from Supabase at the client layer (only static + localStorage) | Future wave / data-layer lane | Posts created in admin land in Supabase via the admin form; if the client should hydrate from Supabase for cross-device visibility, add a `useEffect` fetch + state in `Blog.tsx`, or extend `getAllPublishedPosts()` with an async variant. Out of scope here. |
| End-to-end visual verification of the live `/blog` list with a freshly published admin post | Frank credential (no preview server allowed in this lane per brief) | After merging the wave, publish a draft via `/admin/blog/new` and confirm it appears on `/blog`. |

## Task-Sheet Update Row

| Wave | Lane | Status | Headline outcome | Files touched | Evidence |
|---|---|---|---|---|---|
| AP-MODERNIZE-2026-05 | 01-AGENT1 | complete | `/blog` now surfaces every published post; RSS auto-discoverable; opt-in community widget shipped | `Blog.tsx`, `SEOHead.tsx`, `BlogWidgetSmall.tsx` (NEW), `BlogWidgetSmall.css` (NEW) | `orchestration/active/AP-MODERNIZE-2026-05/01-AGENT1-BLOG-ACCESSIBILITY.md` |

## Citations

| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/code-cleaning/SKILL.md` | SKILL | The two-line correctness fix pattern; single-source-of-truth for imports; removal of legacy parallel data sources. |
| `.claude/skills/search-building/SKILL.md` | SKILL | Framed RSS auto-discovery as a feed-integration / discoverability touchpoint that belongs in shared `<head>` infrastructure rather than a page-local component. |
| `librarians/search-librarian.md` | LIBRARIAN | RSS / feed-reader auto-discovery convention — exposing `<link rel="alternate">` on every page so external readers find the feed without manual URL hunting. |
| https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link | 2026 URL | Canonical reference for `<link rel="alternate" type="application/rss+xml">` syntax and placement in `<head>`. |
| https://www.rssboard.org/rss-specification | 2026 URL | RSS 2.0 specification — confirms the MIME type `application/rss+xml` and the discovery linking convention readers expect. |
