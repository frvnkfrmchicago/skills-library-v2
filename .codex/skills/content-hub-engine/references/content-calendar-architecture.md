# Content Calendar — Architecture

The GrazzHopper Content Hub includes a production calendar at
`src/calendar.js` (~1,130 lines). It is NOT a simple date grid — it's a
full content pipeline scheduler with drag-and-drop, team task integration,
and responsive design.

## File Location

`~/Documents/Automation Centre/grazzhopper-content-hub/src/calendar.js`

Loaded via `<script src="./src/calendar.js?v=2">` in `gh-content-hub.html`.

## Architecture

The calendar is wrapped in an IIFE (`(function(){ "use strict"; ... })()`)
and exposes a public API on `window`:

```js
window.GHCalendar = {
  open, close, shift, jumpToday, switchView, render, refreshTasks
};
window.openCalendar = openCalendar;
window.closeCalendar = closeCalendar;
```

### Dependencies

| Dependency | Source | Purpose |
|-----------|--------|---------|
| interact.js | CDN (`cdnjs.cloudflare.com/.../interact.min.js`) | Drag-and-drop for post chips |
| Supabase `team-api` edge function | `SUPABASE_URL/functions/v1/team-api` | Team tasks with `due_date` |

### State

```js
var state = {
  view: "month",            // "month" | "week"
  anchor: startOfDay(Date), // month anchor / week basis
  rendered: false,
  interactReady: false,
  dragState: null,          // { id, ghost }
  tasks: [],                // team tasks from team-api
  tasksLoading: false,
  tasksReqId: 0             // guards against out-of-order fetches
};
```

### Views

**Month view** — 6x7 grid. Each cell is a drop zone. Max 3 chips shown per
cell before "+N more". Team tasks render in a separate lane below post chips
(dashed separator). Dimmed cells for days outside the current month.

**Week view** — 7 columns x hourly rows (6am–11pm). Posts placed by
scheduled time with vertical positioning. Team tasks stack at the top of
each day column (no time — they have a due day only).

### Key Features

- **Drag-and-drop scheduling**: Post chips are draggable via interact.js.
  Drop on a day cell → schedules to that day at 9am (or preserves existing
  time). Drop on a week slot → schedules to exact half-hour. Drop on
  "Unscheduled" rail → clears scheduled date.
- **Unscheduled rail**: Left sidebar shows posts with no `scheduledFor`.
  Collapses to horizontal strip on mobile (<=640px).
- **Team task integration**: Pulls tasks from `team-api?due=any`. Renders
  as cream-accented chips with checklist glyph + assignee initial. Click
  routes to Team view (read-only — tasks aren't rescheduled from calendar).
- **Optimistic updates**: On drop, the post's `scheduledFor` updates locally
  immediately, then persists via `postsApi.update()`. On failure, re-fetches
  from Supabase to reconcile.
- **Responsive**: Full layout at >900px. Tablet: narrower rail. Phone:
  horizontal rail strip. Very narrow (<=420px): chips collapse to colored
  dots.
- **Realtime sync**: Hooks into `window.render` to re-render whenever the
  hub's main render fires (triggered by Supabase realtime subscriptions).

### Post Placement Logic

```js
function placementTs(post):
  if post.scheduledFor → use scheduledFor
  if post.status === "published" && post.publishedAt → use publishedAt
  else → null (post doesn't appear on calendar)
```

Unscheduled posts = no `scheduledFor` AND not published.

### Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| pending | Purple | `#cc99ff` |
| approved | Mint | `#33fecc` |
| rejected | Soft red | `#ff6464` |
| published | Calm green | `#6ee7b7` |

### Brand Palette (calendar-specific)

| Element | Color |
|---------|-------|
| Background | `#0f0818` / `#25012e` / `#0a0412` |
| Mint accent | `#33fecc` |
| Purple accent | `#cc99ff` |
| Cream text | `#fde9c3` |
| Published green | `#6ee7b7` |
| Task chips | `#fde9c3` (cream) |

### CSS Injection

All calendar styles are injected at runtime via `injectStyles()` which
creates a `<style id="ghCalStyles">` element. This keeps the calendar
self-contained without requiring changes to the main HTML file.

## Triggering the Calendar

From sidebar: `setFilter('calendar', navCalendar)` — called by clicking
the Calendar sidebar item.

From JS: `window.openCalendar()` or `window.GHCalendar.open()`.

The calendar replaces the main content area inline. `ghShowSection` in
`gh-hub.js` detects `f === "calendar"` and calls `window.openCalendar()`.

## Known Issues (as of June 2026)

- **Empty calendar feels useless.** All 19 posts are unscheduled. The
  calendar needs utility features: content-type color coding, platform
  badges, smart scheduling suggestions, and quick-schedule buttons to
  be operationally valuable.
- **No Cloudflare deployment path.** The hub is static HTML with no
  `package.json`. `wrangler` is not installed. Deployment requires either
  `npm install -g wrangler && wrangler pages deploy .` or manual upload
  via Cloudflare dashboard.

## Potential Improvements

1. **Color-coded chips by content type** — News=purple, Regulation=red,
   Studies=green, Facts=gold, Saturday Flex=mint
2. **Platform badges** — Threads/Instagram/LinkedIn icons on chips
3. **Smart scheduling** — Best time hints for cannabis content per platform
4. **Week view as default** — Month is too zoomed out for daily ops
5. **Quick-schedule** — "Schedule all drafts" with staggered times
