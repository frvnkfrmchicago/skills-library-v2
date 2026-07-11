---
name: app-scanner-librarian
description: Complete application architecture discovery — screens, flows, systems, databases, content, integrations, interaction states, and multi-agent orchestration. Scans any web/mobile app to produce an interactive developer dashboard with journey maps, systems inventory, flow diagrams, and agent orchestration views.
last_updated: 2026-05-27
version: v8.1
protocol: anti-skimming-v3
---

# App Scanner Librarian

**Role**: You discover and map the COMPLETE architecture of an application — not just screens, but every system, database, content source, API integration, interaction state, and navigation flow.

**Context**: A 50-page app has ~200 navigation links, ~30 loading states, ~15 error boundaries, ~20 database tables, ~10 external integrations, and ~5 content pipelines. No developer has the full picture. Screen inventories miss 30-40% of routes. Systems inventories don't exist at all. The result: broken flows ship, dead systems persist, orphaned databases go unnoticed, and nobody knows what content actually powers the platform. This librarian produces a complete X-ray of the application.

**Goal**: Produce a developer dashboard at `/screens` and any product-facing alias such as `/aistudyhall/screens` with:
0. **Command Center (DEFAULT VIEW)** — a content-rich landing surface, NOT an empty "select a screen" rail. A left rail of self-populating panels (each with a live count badge) over a content pane: Overview metrics, Sections, Flow pressure, Orchestration tree, indexed Assets, and Labs (the interactive dev surfaces). This is the FIRST thing the user sees.
1. **Overview** — route coverage, activation health, cross-group flow pressure
2. **Screens** — every page, loading state, error boundary, interaction state
3. **Systems** — every system, database, API, integration, auth path, and content source
4. **Assets** — image and media inventory tied to the route model

> **DEFAULT-VIEW RULE** — The console opens on the **Screen gallery + live iframe preview**, NOT on the Command Center and NOT on an empty preview pane. The highest-value, most recognizable thing about Swiggy's reference console is the gallery of REAL screen thumbnails beside a live iframe preview of the actual app ("the one-to-one design"). That is the first thing the owner must see on first paint. The Command Center is a SECONDARY tab. An empty "pick a screen" zero-state as the landing surface is a failure mode — but so is burying the iframe preview behind a metric dashboard. Land on the gallery; populate every thumbnail from real screens; show one screen live in the iframe.

## Asset Persona adaptation

For Asset Persona specifically:

- Treat **Vite + React Router** as the routing source of truth.
- Treat **`/aistudyhall/screens`** as the preferred scanner entry and **`/screens`** as the alias.
- Treat the scanner as a **command-center workspace**, not a dark gallery.
- Treat **inline auth surfaces** such as `AuthModal` as first-class states that belong in the activation map.
- Prioritize **marketing -> auth -> classroom** continuity over exhaustive visual decoration.

---

## TL;DR

| Phase | What you do | Output |
|-------|-------------|--------|
| Discover | Scan file system for page files | Route inventory |
| Extract | Parse source for navigation targets | Link map |
| Detect | Find loading, error, and interaction states | State annotations |
| Categorize | Group routes by domain | Organized groups |
| Visualize | Generate overview + flow viewer + route detail | `/screens` or `/aistudyhall/screens` |
| Inventory | Discover databases, APIs, integrations, content, auth | Systems tab / inventory panels |
| Verify | Confirm completeness and accuracy | Quality report |

---

## Context Questions

> **STOP** — Before scanning, you MUST understand:
> 1. **What framework?** — Next.js App Router, Pages Router, Vite, Expo, or other?
> 2. **Where are the pages?** — `app/`, `src/app/`, `pages/`, `src/pages/`?
> 3. **Is there auth protection?** — Middleware, route guards, role checks?
> 4. **What's the goal?** — Audit, documentation, onboarding new devs, QA, or flow redesign?
> 5. **How many routes (estimated)?** — Under 20 (small), 20-80 (medium), 80+ (large)?
>
> If you cannot answer #1 and #2, scan the project structure first before proceeding.

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Depth | Routes only ←→ Full interaction state detection |
| Scope | Single module ←→ Entire application |
| Framework | Next.js App Router / Expo Router (file-based, easiest) ←→ Vite + React Router (config-based, hardest) |
| Platform | Web (iframe previews work) ←→ Native (need screenshots or Expo web fallback) |
| Auth complexity | No auth ←→ Multi-role RBAC with middleware + layout guards |
| Output | Static manifest (JSON) ←→ Interactive viewer with live previews |
| Accuracy | Regex heuristic (fast, ~85%) ←→ AST parse (slow, ~98%) |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Small app (< 20 routes) | Skip auto-grouping, flat list is fine |
| Large app (80+ routes) | Auto-group by route prefix, merge orphans into "Standalone" |
| No auth guards | Skip auth bypass setup entirely |
| Multi-role auth (business, admin, etc.) | Must find and bypass ALL guard layers — ProtectedRoute, RoleGuard, layout redirects |
| Monorepo | Ask which package to scan, don't scan root |
| **Next.js App Router** | Scan `app/**/page.tsx`. Route groups are transparent. Most common in 2026. |
| **Expo Router (React Native)** | Scan `app/**/*.tsx` — every file is a route (no `page.tsx` convention). Read `_layout.tsx` for tab/stack structure. Iframe preview won't work for native screens — use screenshots or Expo web mode instead. |
| **Remix v2** | Scan `app/routes/`. Flat route convention with dot separators. `$param` for dynamic segments. |
| **SvelteKit** | Scan `src/routes/**/+page.svelte`. Different file extension, same concept. |
| **Nuxt 3** | Scan `pages/**/*.vue`. Similar to Next.js Pages Router. |
| **Vite + React Router** | No file convention — parse router config first, then use page folders as evidence. Hardest to auto-scan. |
| **API-heavy app** | Many routes are API endpoints — filter to page/screen files only |
| **React Native (no Expo Router)** | No file-based routing — screens are declared in React Navigation config. Parse `NavigationContainer` and `Stack.Screen` declarations. Cannot iframe — use Expo web or screenshots. |

---

## 1. Route Discovery

Scan the project's page directory recursively for page files.

**BECAUSE** routes are the atomic unit of screen architecture — you can't map what you haven't found.

### Next.js App Router
```
Scan: app/**/page.tsx|jsx|ts|js
Skip: node_modules, .next, .git, dist, build, __tests__
Strip: Route groups (auth), (business) → transparent
Extract: Dynamic params [id], [...slug], [[...catchAll]]
```

### Expo Router (React Native)
```
Scan: app/**/*.tsx|jsx|ts|js
Skip: Files starting with _ (_layout.tsx, _error.tsx are convention files, not screens)
Strip: Route groups (auth), (tabs) → transparent (same as Next.js)
Extract: Dynamic params [id], [...slug], +not-found
Note: _layout files define navigation structure (tabs, stacks, drawers) —
      read them to understand navigation hierarchy, but don't list them as screens
```

Expo Router uses the SAME file-based convention as Next.js App Router. Key differences:
- `_layout.tsx` instead of `layout.tsx` (underscore prefix)
- `+not-found.tsx` instead of `not-found.tsx` (plus prefix)
- `+html.tsx` for web-only HTML wrapper
- Guarded groups: `(auth)` can have redirect logic in its layout
- Tab routes: `(tabs)` group with `_layout.tsx` defining tab bar
- No `page.tsx` convention — the file itself IS the page (`app/home.tsx` = `/home`)

**BECAUSE** Expo Router was designed to mirror Next.js, scanning is nearly identical. The main difference is file naming — every `.tsx` in `app/` is a route (not just `page.tsx` files).

### Next.js Pages Router
```
Scan: pages/**/*.tsx|jsx|ts|js
Skip: Files starting with _ (convention files: _app, _document, _error)
Convert: File path → URL route (pages/about.tsx → /about)
Note: index.tsx = directory root route
```

### Remix v2
```
Scan: app/routes/**/*.tsx|jsx|ts|js
Convention: Flat routes with dot notation (about.contact.tsx → /about/contact)
Skip: Files starting with _ (pathless layouts)
Dynamic: $param syntax ($userId.tsx → /users/:userId)
Also check: route.tsx inside route folders (app/routes/about/route.tsx)
```

### SvelteKit
```
Scan: src/routes/**/+page.svelte
Layout: +layout.svelte (read for nav structure)
Error: +error.svelte
Server: +page.server.ts (data loading)
Dynamic: [param] bracket syntax (same as Next.js)
```

### Nuxt 3
```
Scan: pages/**/*.vue
Dynamic: [id].vue bracket syntax
Catch-all: [...slug].vue
Layouts: layouts/ directory (separate from pages)
```

### Vite + React Router
```
No file convention — routes declared in router config
Scan (in order): src/pages/, src/views/, src/routes/ for component files
Parse: router config (createBrowserRouter, createRoutesFromElements) for route declarations
This is the hardest to scan — route declarations are code, not file structure
```

**Asset Persona note**:
- Start with `src/App.tsx`
- Record route aliases explicitly (`/aistudyhall/screens` and `/screens`)
- Detect shell wrappers such as `MarketingShell`, `CommunityLayout`, auth guards, and mobile tab bars
- Mark modal-first auth surfaces as activation states even when they do not have their own route

### Path Normalization (all frameworks)
```
file: app/(auth)/login/page.tsx → route: /login          (Next.js App Router)
file: app/(auth)/login.tsx      → route: /login          (Expo Router)
file: app/routes/auth.login.tsx → route: /auth/login      (Remix v2)
file: src/routes/login/+page.svelte → route: /login       (SvelteKit)
file: pages/login.vue           → route: /login           (Nuxt 3)
```

> **GATE** — After discovery, verify:
> - Does the count match your expectation?
> - Are there page files the scanner missed? (Check for non-standard naming)
> - Are there routes that shouldn't be in the scan? (Test pages, storybook, etc.)

---

## 2. Link Extraction

Parse each page's source code to find where its buttons and links navigate.

**BECAUSE** a screen map without navigation edges is a phone book — it tells you what exists but not how things connect.

### Regex Patterns (fast, ~85% accuracy)

**Web frameworks (Next.js, Remix, SvelteKit, Nuxt):**
```
href="..." or to="..."
href={"..."} or to={"..."}
router.push("...") / router.replace("...") / redirect("...")
Template literals: href={`...`}, router.push(`...`)
```

**Expo Router / React Navigation:**
```
router.push("...") / router.replace("...") / router.navigate("...")
<Link href="..." />
navigation.navigate("...") / navigation.push("...")
```

**BECAUSE** Expo Router uses the same `router.push` API as Next.js, but React Navigation (non-Expo) uses `navigation.navigate("ScreenName")` with screen names, not URL paths. The scanner must detect which navigation library is in use.

### What Regex Misses
- Computed paths: `router.push(getNextRoute(role))` — the function call is opaque
- Conditional navigation: `if (x) push("/a") else push("/b")` — only catches literal strings
- External navigation components: Custom `<NavLink>` wrappers with indirect hrefs

### What To Do About Misses
1. Run regex scan first (automated, fast)
2. Spot-check 5-10 pages manually — compare regex results to actual links in the source
3. Add missed links to the manifest manually
4. Estimate completeness: if regex caught 85%+ of manually-verified links, proceed. Below 80%, investigate why.

### Quality Benchmark
| Metric | Target | Red Flag |
|--------|--------|----------|
| Links found per page (average) | 2-5 | 0 (page is likely a dead end or regex missed links) |
| Pages with 0 links | < 30% | > 50% (regex is failing or many dead-end pages) |
| Cross-group links | Present | None (groups are isolated, which is suspicious) |

---

## 3. State Detection

Find every loading screen, error boundary, inline spinner, skeleton, and interaction state.

**BECAUSE** loading and error states are screens too — they are what users see 10-30% of the time. An app with beautiful pages and broken loading states feels broken.

### File-Level Detection
| File | What it means |
|------|---------------|
| Sibling `loading.tsx` | Route has a loading screen (Next.js convention) |
| Sibling `error.tsx` | Route has an error boundary |
| Parent directory `loading.tsx` | Inherited loading screen (covers child routes) |
| `not-found.tsx` | Custom 404 page |
| `global-error.tsx` | Root error boundary |

### Source-Level Detection
| Pattern in source | What it means |
|-------------------|---------------|
| `useSearchParams` + `.get("param")` | Page reads query params → alternate views |
| `Loader2` + `animate-spin` | Inline Lucide spinner |
| `animate-spin` + `border-` + `rounded-full` | CSS border spinner |
| `animate-pulse` | Pulse skeleton placeholder |
| `Suspense` + `fallback` | Suspense boundary with loading fallback |
| Multiple `useState` branches rendering different UI | Multi-state page (e.g., verifying/success/error) |

### Coverage Benchmark
| Metric | Target | Red Flag |
|--------|--------|----------|
| Routes with loading.tsx | > 60% | < 30% (most routes have no loading state) |
| Routes with error.tsx | > 40% | < 20% (errors will show raw Next.js error page) |
| Inline loading patterns detected | Matches manual inspection | Fewer than expected (regex missed patterns) |

---

## 4. Route Categorization

Group routes into logical categories BECAUSE a flat list of 100+ routes is unusable. Grouping reveals the application's information architecture.

### Auto-Grouping Strategy
1. **Prefix matching**: Routes sharing a common first segment belong together (`/admin/*` → Admin)
2. **Convention matching**: Known patterns map to known categories (auth routes, settings, etc.)
3. **Orphan merging**: Groups with 1-2 routes merge into "Standalone" — BECAUSE single-screen groups clutter the view without adding structure

### Customization Required
The grouping patterns MUST be adjusted per project. Scan the routes first, then write patterns that match what's actually there. A cannabis platform has different route structures than a SaaS dashboard or an e-commerce app.

### Label Generation
- Generic names (`settings`, `analytics`, `content`) → prefix with parent context: "Host Settings", "Host Analytics"
- Index routes for sections → append "Home" or "Dashboard": "Settings Home"
- Dynamic segments → include parent: "Product Detail (dynamic)"

**BECAUSE** "Settings" appearing in 4 different groups is confusing. Context in the label prevents ambiguity.

---

## 5. Visualization

Generate an interactive viewer at `/screens` in the current project.

### Platform Considerations

**Web apps (Next.js, Remix, SvelteKit, Nuxt, Vite):** Live iframe previews work — the viewer loads each screen in an iframe from the running dev server.

**Expo Router with web support:** If `expo start --web` works, iframe previews work on web routes. Native-only screens need a fallback (screenshot capture or placeholder card).

**React Native without web support:** Iframes won't work at all. The viewer becomes a flow diagram + route manifest only — no live previews. Consider adding screenshot capture (Detox, Maestro, or manual) and displaying images instead of iframes.

**BECAUSE** the interactive preview is the highest-value feature of the viewer. If iframes aren't possible, the flow diagram and navigation mapping still provide 80% of the value.

### Viewer Architecture
The viewer needs a **Command Center (default)** plus three drill-in views:

**Command Center** (the landing view — built first, shown first)
- A left rail of self-populating PANELS, each with a live count badge, over a content pane (the Swiggy command-center pattern).
- Every panel is backed by REAL data — never a mock/placeholder panel. If a panel has no data source yet, populate it from real files (the screen manifest, the orchestration tree, `public/` assets) rather than faking it.
- Recommended panels for a scanned app: **Overview** (headline metrics + a section grid that opens a screen live), **Sections** (count-ranked **monochrome** dark shelves — no hue wash), **Flow** (link pressure + a jump into the full map), **Orchestration** (the real `orchestration/` tree read via the scan adapter), **Assets** (real indexed `public/` files with live thumbnails), **Labs** (the interactive dev surfaces — see below).
- The Command Center is a **secondary** tab — the gallery + iframe preview is the default landing view (see the DEFAULT-VIEW RULE). All shelves/cells/panel-rails here are **monochrome dark glass**; mint is the selected-row signal only.
- Cross-panel transitions use Framer Motion `<AnimatePresence mode="wait">` with an opacity/translate fade; entrance is a staggered fade-up. Never fade-up every element — sequence it.
- **DUPLICATE-KEY FREEZE (a real failure that shipped):** every `.map()` that renders a Framer `initial → animate` entrance MUST have a UNIQUE React `key`. If the list can contain duplicate ids (e.g. a flattened group/screen set, a manifest with repeated state ids), a duplicate `key` makes React skip committing those nodes — the Framer mount animation never fires and the cards **freeze at `opacity:0` / `translateY(...)` forever** (often with ~30+ "duplicate key" console warnings). Fix: dedupe the source list so ids are unique, OR suffix the key with the index (`` `${item.id}-${i}` ``) at every collision site. After any entrance-animated list, confirm ZERO "Encountered two children with the same key" warnings in the console.

**Group Flow Overview** (no filter active)
- Every group as a node
- SVG bezier edges between groups where cross-group navigation exists
- Hover highlights connected edges
- Click a group to drill in

**Screen Flow View** (one group filtered)
- Every screen in the group as a node, laid out in layers by navigation depth
- Real edges from source to target based on extracted links
- Exit port labels for links to other groups
- Click a screen to preview it

**Screen Preview** (screen selected)
- Live iframe of the selected page
- "Buttons navigate to" row showing every destination
- State badges showing alternate views
- Loading/error/states tags

### Sidebar — the gallery (default view, the centerpiece)
- Full screen list organized by group, each row showing a **REAL screen thumbnail** — a small live iframe of the actual route (`?_preview=1`), scaled down (Swiggy `ScreenThumbnail`). Lazy-load each thumbnail (IntersectionObserver / one-at-a-time); NEVER mount all iframes at once.
- **Monochrome** ledger: sticky muted all-caps section headers + a hairline divider carry the grouping. No per-section hue dots/glyph tints. Mint fills the SELECTED row only.
- Tags: `loading`, `error`, `N states` — spelled out, no acronyms
- Legend explaining each tag
- Thumbnail components to port from the reference: `ScreenThumbnail` (sidebar), `FlowNodeThumbnail` (flow nodes), `CanvasPreview` (Figma-style zoom/pan around the device frame). Adapt the iframe `src` to the target app's preview convention (same-origin `?_preview=1` vs the reference's `localhost:8080`).

### Auth Bypass for Iframes

> **GATE** — Before building the viewer, identify ALL auth protection in the project:
> - Route-level guards (ProtectedRoute, AuthGuard, etc.)
> - Role-level guards (RoleGuard, AdminOnly, etc.)
> - Layout-level redirects (useEffect + router.replace in layouts)
> - Middleware (middleware.ts with route matchers)
>
> List every one. Do NOT modify them until you understand the full redirect chain.

The viewer appends `?_preview=1` to all iframe URLs. Each auth guard must check for this param and skip protection when present.

**IMPORTANT**: Gate the bypass to development only:
```tsx
const isPreview = process.env.NODE_ENV !== "production"
  && searchParams?.get("_preview") === "1";
if (isPreview) return <>{children}</>;
```

**BECAUSE** ungated auth bypass is a security vulnerability. The `_preview=1` param should NEVER work in production.

---

## 5b. Command-Center Console Patterns

These are the patterns that make the console **clean, inviting, highly interactive, and content-rich** rather than a dark, jerky gallery. Apply all five.

### App Scanner adapter (registry + envelope + path allowlist)

The Assets/Orchestration panels must show **real indexed files**, not a hardcoded list. Build a server-side FS adapter:

- **Registry** — a JSON manifest of the indexable surfaces (`{ id, name, description, appUrl, framework, allowlistRoots }`). Drives both what the scanner indexes and the Labs panel.
- **Envelope** — every response is a discriminated union: `{ success: true, data, meta: { timestamp } }` or `{ success: false, error: { code, message } }`. The client switches on `success`.
- **Path allowlist** — the adapter confines all FS access to an allowlisted set of roots (e.g. `public/`, `orchestration/`). Resolve the candidate path and reject anything that escapes a root (`path.relative(root, candidate)` must not start with `..` and must not be absolute). This is OWASP A01 (path traversal) — the allowlist IS the control.
- **Framework binding** — Vite projects use a `configureServer` middleware plugin; **Next.js App Router uses a co-located Route Handler** (e.g. `app/screens/api/scan/route.ts`, `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`). Same registry, same envelope, same allowlist.
- The adapter lives UNDER the dev-only `/screens` tree so it inherits the production access gate. It's a read-only directory indexer (names + sizes); it does not stream arbitrary file bodies.

### Wire orphan routes — never leave URL-only surfaces

Any route reachable only by typing its URL (an interactive sandbox, a states gallery, a systems inventory) is an orphan. **Wire it into the console** as a Labs panel entry (read from the registry) with a launch link, OR remove it. Do not leave orphans. Confirm each is a real working surface (reads real data) before wiring — a placeholder shell is not worth wiring; build it real or delete the entry point.

### Monochrome chrome — color comes from the previewed content, NOT from tinting the chrome

This is the single most important correction in this skill. A prior build sprayed a per-section rainbow hue across the sidebar header dots, shelf washes, overview cells, and flow-node rails. The owner rejected it: "these colors don't match the platform." **DO NOT color-code the chrome.**

The reference (Swiggy) sidebar is a **MONOCHROME dark ledger**: sticky all-caps muted section headers + a single hairline divider carry the grouping via **proximity + the shared common region** (NN/G Common Region), NOT hue. The shape of a section's glyph differentiates it, not a color. There are **no section-hue dots, no tinted glyphs, no count dots, no shelf washes** anywhere in the chrome.

> **The brand accent (e.g. mint `#33fecc`) is the ONE color in the chrome, reserved EXCLUSIVELY for the SELECTED/active row.** Everything else in the rail/shelves/overview-cells/panel-rails reads in the canonical text roles (headline / primary / secondary / muted) on dark glass.

**Where does color and life come from, then?** From the **REAL screen thumbnails** (small live iframes of the actual colorful app screens) in the gallery, and from the **live iframe preview** of the selected screen. The previewed app IS the color. That is the whole point — the chrome is a quiet dark frame around vibrant real content, exactly like a Figma/Mobbin gallery.

The ONLY legitimate place for a per-section categorical hue is the **flow-graph nodes** (data viz, where distinguishing 27 node families by hue is a real readability need). Keep a `sectionColor(groupId)` resolver from ONE source of record (`colors.section` map) for the flow graph alone — never apply it to a chrome surface.

### Dark vibrant glass — neon-on-near-black, NOT a light wash

A prior build "lightened" the glass to a bright lavender wash (`rgba(214,192,255,0.10)` fill, white light-catching borders, a `#2a1342` lifted mesh base) to make it "clean and inviting." The owner rejected it as "too bright." **The platform aesthetic is VIBRANT-NEON-ON-NEAR-BLACK** — match the landing-page hero, not a soft card.

- Glass fill = the brand **dark** base hue at moderate alpha (e.g. `rgba(24,0,34,0.55)` over the mesh), so the colorful mesh + the iframe content read through the panel. NOT a light lavender wash.
- Borders = a **faint cool hairline** (e.g. `rgba(204,153,255,0.16)`), not a bright white light-catcher.
- Mesh **base color = the platform near-black void** (e.g. `#02020a`); keep the colorful drifting mesh radials (mint/cyan/magenta/violet) ON that dark base so the neon glow reads vibrant. The drift is good — keep it.
- Elevation ramps = the **dark platform void** (e.g. `#02020a`) at real strength, so panels float on the mesh like the hero. NOT a softened light shadow.
- Keep `screens-theme.ts` (the inline-style token mirror) in lockstep with the CSS `:root` — one source of record.

### Framer Motion menus — height:auto, not hand-estimated max-height

The #1 "ugly menu" complaint comes from collapsing a section with a hand-computed `maxHeight: count * rowPx + pad` — it clips and jerks. Replace it with Framer Motion `<AnimatePresence initial={false}>` wrapping a `motion.div` that animates `height: 0 → 'auto'` (it measures the real content height) with `overflow: hidden` and an ease-out transition. Animate the mobile drawer enter/exit with `<AnimatePresence>` too (slide + scrim fade) instead of a bare conditional that pops. Honor `useReducedMotion()` (duration 0). Ref: motion.dev/docs/react-animate-presence (height:auto).

Also: give any `ResizeObserver` effect a proper dependency array (usually `[]` for a mount-once observer on a stable ref) so it stops tearing down + rebuilding on every render.

### Dedup discipline — one graph engine, no dead manifests

Scanner code accretes duplicates: two manifests (one stale, zero importers), two graph-layout engines doing the same job, orphaned view components. Before adding anything: `grep` for importers of each `screen-data`/`flow-utils`/view-component file. **Delete the dead manifest** (confirm zero importers). **Consolidate to ONE graph engine** — update the consumers, delete the loser. Orphaned components that only import each other are a dead cluster — delete the whole cluster, not just the leaf.

---

## 6. Systems Inventory

Discover every system, database, content source, and integration — not just pages.

**BECAUSE** screens are the tip of the iceberg. Behind every page are database tables, API routes, third-party services, content pipelines, and background systems. A developer who only sees screens misses 80% of the architecture.

### What to Discover

| Category | How to Find | What to Report |
|----------|-------------|----------------|
| **Database tables** | Scan migration files (`supabase/migrations/`, Prisma schema, etc.) | Table name, purpose, relationships |
| **API routes** | Scan `app/api/` or `pages/api/` recursively | Group by system, count, note auth requirements |
| **Third-party integrations** | Grep for API keys, SDK imports, service URLs | Service name, what it does, status (live/configured/placeholder) |
| **Content sources** | Find JSON data files, CSV imports, seed scripts, scraper pipelines | Source, data size, freshness |
| **Background systems** | Find cron jobs, webhooks, automation workflows, queue processors | System name, trigger, frequency |
| **Static assets** | Scan `public/` for images, videos, fonts, icons | Category, count, total size |

### Systems Status Classification

| Status | Meaning |
|--------|---------|
| **live** | Functional, wired to real data, actively used |
| **scaffold** | API routes and types exist but data is mock/placeholder |
| **configured** | Integration configured but not fully wired to UI |
| **broken** | Was functional, currently failing |

### Output: `/screens/systems` page

Create a page at `/screens/systems` that renders every discovered system as an expandable card showing:
- System name, status badge (live/scaffold/configured), description
- Database tables (with names)
- API routes (with paths)
- Pages (with routes)
- Core lib modules
- External integrations
- Data pipeline scripts
- Data size where applicable

Include a filter bar (all / live / scaffold / configured) and a platform summary with aggregate stats (total routes, tables, endpoints, integrations).

### Journey Map

Create a journey map view that shows screens cascading vertically — parent above child — based on actual `linksTo` navigation data:

- **Full Journey**: Start from landing page, trace every reachable screen
- **By Group**: Each group shows its internal flow tree with branching
- SVG arrow connectors between parent and child
- Branch connectors fan out for multiple children
- Orphan screens (no inbound links) listed separately
- Click any card to preview the screen

---

## 7. Verification

> **STOP** — Before delivering the screen map, verify:

### Completeness Check
```
□ Route count in manifest matches actual page.tsx count (minus /screens itself)
□ Every group has a meaningful name (no "undefined" or single-character groups)
□ No giant "Standalone" catch-all (> 10 screens means grouping patterns need work)
□ Cross-group navigation edges exist (groups aren't isolated)
□ Loading/error detection count is plausible (not 0, not 100%)
```

### Accuracy Check
```
□ Spot-check 5 screens: do the linksTo arrays match actual buttons on the page?
□ Click 3 screens in the viewer: do they render (not redirect to login)?
□ Check 1 screen with known query params: does the states annotation match?
□ Open the flow diagram: do edges make logical sense?
```

### Deliverable
Report to the developer:
```markdown
## Screen Architecture Report: [Project Name]

**Scanned**: [date]
**Routes found**: [N] across [N] groups
**Navigation links extracted**: [N]
**Loading coverage**: [N]% of routes have loading.tsx
**Error coverage**: [N]% of routes have error.tsx

### Groups
[Table of groups with screen counts]

### Gaps Found
- [Routes with no loading state]
- [Routes with no outbound navigation (dead ends)]
- [Links pointing to routes that don't exist (broken links)]

### Recommended Actions
- [Specific fixes based on gaps]
```

---

## 8. Screens-Catalog Audit Protocol

Apply this protocol to any screen/route catalog that auto-discovers a route list and then augments it by hand — a `/screens` console, a Mobbin-style app gallery, an internal "every-page-in-one-place" directory, a Storybook-like route index, or any surface that pairs `screen-manifest.json` (auto-scan) with handwritten rows the scanner couldn't reach (interaction-state previews, error pages, query-param surfaces, modal-first auth, dev tools). The protocol exists BECAUSE every catalog that combines auto-discovery with manual augmentation drifts: the auto-scan flags routes that no longer exist, the manual rows declare a categorical palette no chrome ever consumes, generic `Button` and `Link` labels flood the manifest, and selectable controls morph or teleport inconsistently inside one console. None of those bugs are caught by the route discovery in Section 1 or the link extraction in Section 2 — they live one layer up, in the catalog itself.

Run this protocol AFTER Section 7 (Verification) passes. Verification proves the manifest is internally complete; this protocol proves the catalog that surfaces the manifest is honest.

### 8.1 Duplicate-detection protocol

Run `uniq -d` (or `sort | uniq -c | sort -rn | head`) over the manifest's `path`, `label`, and `displayLabel` columns. A healthy catalog has zero duplicate `path` rows and a long tail of distinct labels. **Fail the audit when any single generic label (`Button`, `Link`, `Item`, `Div`, `Section`, `Container`, `Card`) accounts for more than 5% of rows** — that is a sign the auto-scanner is emitting tag names instead of resolved labels. Surface specific `file:line` examples (every offending row, not just a count) so the lead can fix the label extractor, not just suppress the symptom.

Recipe (jq + sort):

```sh
# duplicate paths — should be empty
jq -r '.[].path' manifest.json | sort | uniq -d

# label floods — top 20, with percentages
jq -r '.[].label' manifest.json | sort | uniq -c | sort -rn | head -20
jq -r '.[].label' manifest.json | wc -l   # divide top count by total for %

# show file:line for every row labeled "Button" so the lead can fix the extractor
jq -r '.[] | select(.label == "Button") | "\(.file):\(.line)\t\(.path)"' manifest.json
```

If `Button` alone exceeds 5% of rows, the manifest is lying about the catalog — the lead either reruns the scanner with a smarter label resolver (read the nearest heading/title/aria-label, not the tag name) or hand-corrects the offending rows. Do not "tolerate" a label flood; the catalog becomes unusable at scale.

### 8.2 Dead-entry sweep

Diff every manifest `path` against the actual filesystem. Any manifest path with no matching real route file is a **dead entry** — the route was deleted, renamed, or never existed; the manifest still claims it does. List them; the lead either removes the row or revives the page (build it real or delete the entry-point — see the broader scanner principle).

Recipe (Next.js App Router shown; adapt the `find` pattern to your framework's convention from Section 1):

```sh
# manifest paths (URL-normalized, sorted, deduped)
jq -r '.[].path' manifest.json | sort -u > /tmp/manifest-paths.txt

# real route paths (file -> URL: strip /page.tsx suffix, strip the leading app prefix)
find app -name page.tsx \
  | sed 's:/page.tsx$::; s:^app::' \
  | sort -u > /tmp/real-paths.txt

# manifest rows with no matching file (dead entries)
comm -23 /tmp/manifest-paths.txt /tmp/real-paths.txt

# real routes the scanner missed (the inverse — equally interesting)
comm -13 /tmp/manifest-paths.txt /tmp/real-paths.txt
```

Both columns matter. Dead entries lie about what exists; missed routes lie about what doesn't. Fix both before declaring the catalog audit-clean.

### 8.3 Categorical palette audit

When the design tokens declare a categorical palette for the catalog (for example, twelve `colors.section.*` slots — one hue per group), **the audit confirms every declared hue is consumed somewhere in the chrome** — a section-header glyph, an overview-shelf border, an index-dot rail, a flow-graph node fill — not just declared. A palette declared and zero chromes consume is `palette-declared-but-dead`. Flag it.

Recipe:

```sh
# every key declared in the section palette
grep -E "section\.[a-z]+" lib/design-tokens.ts | sed 's/.*section\.\([a-z]*\).*/\1/' | sort -u > /tmp/declared.txt

# every key actually consumed in the chrome (rough — refine per project)
grep -rE "colors\.section\.[a-z]+|sectionColor\(" app components | grep -oE "section\.[a-z]+" | sed 's/.*section\.//' | sort -u > /tmp/consumed.txt

# declared but never consumed
comm -23 /tmp/declared.txt /tmp/consumed.txt
```

**BECAUSE** a dead categorical palette is the loudest signal that the catalog's chrome design and its tokens drifted — the designer added the slots, the engineer kept the chrome monochrome (correctly, per Section 5b), and nobody deleted the dead slots. The fix is one of two things, not both: **consume the hue** in a legitimate categorical surface (the flow-graph node fill is the canonical one; see Section 5b on the chrome-monochrome rule), OR **delete the dead slot** from the token file. Half-declared palettes rot — pick one direction.

### 8.4 Motion-consistency audit

Every selectable-group control with three or more options inside the catalog (a section rail, an underline-tab strip, a segmented control, a filter switcher, an orchestration-lane picker) must either **(a)** morph its active indicator with a shared `layoutId` Framer Motion pattern, or **(b)** explicitly opt out of motion (no indicator animation at all — a static border or text-weight change). Inconsistency within a single console — one rail morphs while a sibling teleports — is the single most common source of the "menu moves very ugly" complaint. The eye reads the morph as the intended motion language; a teleporting sibling reads as broken.

Recipe:

```sh
# every <motion. + layoutId in the catalog tree
grep -rn "layoutId=" app/screens components | grep -E "<motion\." > /tmp/morph.txt

# every selectable-group component file in the same tree
grep -rln -E "<(UnderlineTabs|SegmentedControl|TabsList|NavRail|SectionRail)\b" app/screens components > /tmp/selectables.txt

# cross-reference — every selectable file should appear in /tmp/morph.txt OR be on an explicit opt-out list
comm -23 <(sort -u /tmp/selectables.txt) <(awk -F: '{print $1}' /tmp/morph.txt | sort -u)
```

Fail the audit when one selectable control morphs (`layoutId`) and a sibling in the same console teleports (no `layoutId`, no opt-out comment). The fix is to add `layoutId` to the teleporting sibling, NOT to remove the morph from the working one — morph is the default; opt-out is the exception.

### 8.5 Manual-group reconciliation

If the catalog combines an auto-scanned manifest with hand-authored "manual groups" — rows the auto-scanner couldn't reach, such as interaction-state previews, error pages, query-param surfaces, modal-first auth, the dev tools group itself — both must live in a **SINGLE source of record (the manifest)**, with a `manual: true` flag on hand-authored rows. **Parallel hand-maintained `MANUAL_GROUPS` arrays inside `page.tsx`** (or any other co-located file, or a sibling `manual-groups.ts`) are a guaranteed drift source: the auto-scan grows, the design-tokens domain map shifts, the hand-maintained array stays frozen at its commit-day state.

Recipe:

```sh
# scan for parallel manual-group declarations
grep -rn -E "MANUAL_GROUPS|MANUAL_SCREENS|HAND_AUTHORED_ROWS|EXTRA_SCREENS" app components lib

# every match in a file other than the manifest is a fail
```

Fail the audit when any `MANUAL_GROUPS`-shape array lives outside the manifest. The fix is to move every hand-authored row INTO the manifest with `manual: true`, then delete the parallel array. The catalog then reads from one source; the auto-scan re-runs without clobbering the manual rows (it merges by `path`, preserving the `manual` flag); the design-tokens domain map stays the single owner of group identity.

### Failure modes the protocol catches

| # | Failure mode | Caught by |
|---|--------------|-----------|
| i | `/flow/age-gate`-style dead manifest entries (route deleted, manifest still claims it) | 8.2 Dead-entry sweep |
| ii | 215-row generic `Button` label flood (auto-scanner emitting tag names) | 8.1 Duplicate-detection |
| iii | Categorical palette declared in tokens but zero chromes consume it | 8.3 Categorical palette audit |
| iv | One rail morphs with `layoutId` while a sibling teleports | 8.4 Motion-consistency |
| v | Parallel `MANUAL_GROUPS` array in `page.tsx` drifting from `screen-manifest.json` | 8.5 Manual-group reconciliation |

> **GATE** — Before declaring the catalog audit-clean, all five sub-checks above MUST pass. A single fail blocks the audit — none of these are warnings or "later-wave" items. Re-run the recipes after every fix to confirm the table is empty.

---

## NEVER

- **NEVER** trust regex-only link extraction as complete — always spot-check against actual page source
- **NEVER** commit auth bypass code without environment gating (`process.env.NODE_ENV !== "production"`)
- **NEVER** assume the manifest is the truth — it is a heuristic starting point, not documentation
- **NEVER** skip the verification phase — an inaccurate screen map is worse than none (false confidence)
- **NEVER** hardcode group patterns from one project into another — scan first, pattern-match second
- **NEVER** show acronyms or codes in the viewer without a visible legend explaining them
- **NEVER** load all screens as iframes simultaneously — lazy-load one at a time or the browser will crash
- **NEVER** land the console on an empty "select a screen" zero-state OR on the Command Center — the DEFAULT view is the **screen gallery + live iframe preview** (real thumbnails on first paint); the Command Center is a secondary tab
- **NEVER** ship a gallery of text cards instead of REAL screen thumbnails — the thumbnails (small live iframes with `?_preview=1`, lazy-loaded) are the centerpiece; that's where color/life comes from
- **NEVER** color-code the chrome with per-section hues — the sidebar/shelves/overview-cells/panel-rails are a **monochrome dark ledger**; the brand accent (mint) is the SELECTED-row signal ONLY. Color comes from the previewed content, never from tinting the chrome. (A per-section categorical hue is allowed ONLY on flow-graph nodes — data viz.)
- **NEVER** lighten the glass to a bright lavender/white wash — the platform is **vibrant-neon-on-near-black**; dark translucent glass over a colorful drifting mesh on a near-black base
- **NEVER** give a Framer-entrance `.map()` a non-unique React `key` — a duplicate key freezes the cards at `opacity:0`/`translateY` (React skips the commit, the mount animation never fires). Dedupe ids or suffix `` `${id}-${i}` ``; confirm zero "duplicate key" console warnings
- **NEVER** ship a mock/placeholder panel — back every panel with real files (manifest, orchestration tree, `public/` assets); if there's no data source yet, populate from real files, don't fake it
- **NEVER** leave an orphan route reachable only by typed URL — wire it into the console (Labs panel) or remove it
- **NEVER** collapse a menu with a hand-estimated `max-height` — use Framer Motion `height: auto` (it clips/jerks otherwise)
- **NEVER** expose the FS adapter without a path allowlist + the `{success,data}`/`{success,error}` envelope — and keep it under the dev-only gated tree
- **NEVER** keep a parallel `MANUAL_GROUPS` (or `MANUAL_SCREENS`, `EXTRA_SCREENS`, etc.) array outside the manifest — hand-authored rows live IN the manifest with `manual: true`; parallel arrays drift the moment the auto-scan re-runs (see Section 8.5)
- **NEVER** tolerate a generic-label flood — if `Button` / `Link` / `Item` / `Div` accounts for more than 5% of manifest rows, fix the label extractor (resolve to nearest heading/title/aria-label); do not ship a catalog that lies about what every row is (see Section 8.1)
- **NEVER** declare a categorical palette (e.g. twelve `colors.section.*` hues) without confirming each slot is consumed somewhere — palette-declared-but-dead is a guaranteed drift signal; either consume the hue on a legitimate categorical surface (flow-graph nodes) or delete the dead slot (see Section 8.3)
- **NEVER** mix morphing and teleporting selectable controls in one console — if one rail morphs with `layoutId`, every sibling selectable-group of 3+ options morphs too (or opts out explicitly); inconsistency is the single most common "menu moves very ugly" source (see Section 8.4)

---

## Pre-Scan Checklist

```
□ Project framework identified
□ Page directory located (app/, pages/, src/)
□ Auth protection patterns cataloged
□ Dev server is running (required for iframe previews)
□ Package.json scripts section is writable
```

## Post-Scan Checklist

```
□ Manifest generated with correct route count
□ Groups make sense for this project's domain
□ Viewer loads without errors
□ Console opens on the Command Center (default), populated from real data — not an empty zero-state
□ Every panel is backed by real files (manifest / orchestration tree / public assets), zero mock panels
□ FS adapter uses the registry + envelope + path allowlist, under the gated tree
□ Section hue is color-coded from ONE source; brand accent reserved for "selected"
□ Glass surface is clean/inviting (lit base, softened shadows), not a dark slab
□ Menus animate with Framer Motion height:auto (no jerky max-height); ResizeObserver has a dep array
□ No dead duplicates (stale manifest / second graph engine / orphan view components) remain
□ No orphan routes — every URL-only surface is wired (Labs) or removed
□ Auth bypass works (protected pages render in iframes)
□ Flow diagram edges match actual navigation
□ Loading/error badges are accurate
□ Manifest has zero duplicate `path` rows; no generic label exceeds 5% of total rows (Section 8.1)
□ Manifest paths diffed against the filesystem — zero dead entries; zero missed real routes (Section 8.2)
□ Every declared `colors.section.*` slot is consumed somewhere; zero `palette-declared-but-dead` (Section 8.3)
□ Every selectable-group control (3+ options) in the catalog either uses `layoutId` or has an explicit opt-out comment — no mixed morph/teleport siblings (Section 8.4)
□ Zero parallel `MANUAL_GROUPS` / `MANUAL_SCREENS` arrays outside the manifest — manual rows carry `manual: true` IN the manifest (Section 8.5)
□ Report delivered to developer
```

---

## Orchestrator Integration

`/screens` shows **what exists** in the app. `/orchestrator` shows **how it got built** — waves, agents, evidence, visual logs. Together they give a complete development picture.

### Discovery Pattern

The scanner should auto-detect whether the project has an orchestration tree:

```
IF orchestration/ directory exists at project root:
  → Auto-create "Dev Tools" group in screen manifest
  → Add /screens and /orchestrator as entries
  → Set flowOrder to last position (highest number)
```

### Multi-Project Discovery

The orchestrator dashboard can scan multiple projects. It discovers orchestration trees by:

1. **Default**: Scan all sibling directories of the current project for `orchestration/` trees
2. **Override**: Set `ORCHESTRATOR_WORKSPACE_ROOTS` env var to comma-separated paths
3. **Project name**: Read from `orchestration/.project-name` file if present, else use directory name

```typescript
// Example: env var override
ORCHESTRATOR_WORKSPACE_ROOTS="/Users/dev/project-a,/Users/dev/project-b"
```

### Visual Log as Data Source

The scanner should index `orchestration/visual-log/` entries alongside route data:

```
orchestration/visual-log/
├── 2026-05-06-wave1-ui-fixes.md   ← Agent writes after visual changes
├── 2026-05-05-color-migration.md
└── ...
```

Each entry follows YAML frontmatter format:

```yaml
---
timestamp: 2026-05-06T14:30:00Z
wave: wave-1
agent: Agent 3
tldr: Fixed sparkline colors and removed mock data
---
```

### Production Gating

Both `/screens` and `/orchestrator` are dev-only surfaces. They MUST be gated from production:

```typescript
// middleware.ts — block in production
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEV_ROUTES = ['/screens', '/orchestrator'];

export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    if (DEV_ROUTES.some((r) => req.nextUrl.pathname.startsWith(r))) {
      return NextResponse.rewrite(new URL('/not-found', req.url), { status: 404 });
    }
  }
}
```

Defense-in-depth: Also add `notFound()` calls in page-level components:

```typescript
// app/screens/page.tsx
import { notFound } from 'next/navigation';

export default function ScreensPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  // ...
}
```

### Dev Tools Group Structure

When the scanner auto-creates the Dev Tools group:

```typescript
{
  id: 'dev',
  label: 'Dev Tools',
  color: '#f97316', // orange
  icon: 'terminal',
  flowOrder: 99, // always last
  screens: [
    { path: '/screens', label: 'Screen Gallery' },
    { path: '/orchestrator', label: 'Agent Orchestrator' },
    // Add any other dev surfaces found
  ],
}
```

---

## Related Skills

| Skill | When to use |
|-------|-------------|
| `librarians/orchestration-librarian.md` | Manage multi-agent wave packets alongside the scanner output |
| `librarians/flow-librarian.md` | Audit the flows the scanner reveals — walk happy paths AND chaos paths |
| `librarians/visual-audit-librarian.md` | Audit visual consistency across the discovered screens |
| `librarians/ux-design-librarian.md` | Redesign flows where the scanner reveals drop-off risks |
| `librarians/frontend-librarian.md` | Fix component architecture issues found during scan |
| `librarians/code-audit-librarian.md` | Deep-dive code quality on flagged screens |
| `librarians/supabase-librarian.md` | Fix auth issues blocking iframe previews |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Scanner finds 0 routes | Verify page directory. Check for non-standard naming (index.tsx vs page.tsx). |
| Links not detected | Regex misses computed paths. Spot-check source, add manually. |
| Groups don't match project | Edit group patterns to match actual route structure. Scan first, then pattern. |
| Screens redirect to login | Auth bypass missing. Find ALL guard layers, add `_preview=1` check to each. |
| Screens show skeleton forever | Auth guard stuck in loading state. Add bypass before the loading check. |
| Wrong screen shows | Role guard redirecting. Bypass RoleGuard in preview mode. |
| Too many orphan groups | Lower the orphan threshold or add more group patterns. |
| Labels are wrong | Adjust `routeToLabel()` logic. Generic names need parent context. |
| Browser crashes on load | All iframes loading at once. Ensure lazy loading — one iframe at a time. |
