# GrazzHopper Content Center — Implementation Reference

Concrete implementation of the content-hub-engine architecture for the
GrazzHopper cannabis platform. Located at:
`/Users/franklawrencejr./Documents/Automation Centre/grazzhopper-content-hub/`

## Content Center — 4 Tabs

### Discover & Reply (`src/cc-conversations.js`, 1193 lines)

Research-to-draft loop. Browses real cannabis conversations from ingest
sources, turns any into a GrazzHopper draft via the voice engine.

**Data flow:**
- `GET convo-ingest?action=feed&topic=cannabis&q=<kw>&limit=30` → conversation cards
- `GET convo-ingest?action=keywords&topic=cannabis` → keyword chips
- `POST minimax-generate` → draft generation (voice engine builds prompt)
- `POST /rest/v1/gh_content_queue` → save draft

**UI elements:** Search bar, keyword chips, Refresh sources button, conversation
cards with engagement metrics, "Turn into post" button per card, content-type
picker grouped by audience (Community, Community+Industry, Industry, Platform,
Creatives), draft preview with compliance issues, "Save to queue" button.

**State management:** Module-scoped `state` object survives re-renders. One
picker/draft open at a time. Feed reload resets picker state.

### Feed Intel (`src/cc-feed-intel.js`, ~800 lines)

Browse For You feed posts filtered by topic verticals with engagement metrics.

**Data flow:** Same `convo-ingest` endpoint as Discover & Reply.

**Verticals (built-in):**
| Vertical | Keywords |
|----------|----------|
| Cannabis | cannabis, weed, marijuana, thc, cbd, hemp, strain, dispensary, 420, stoner, edibles, dabs, blunt, smoke, joint, sativa, indica, kush, terpene |

Other verticals (Tech, Business, Music, Sneakers, Chicago, Fitness) were removed
per Frank's instruction — GrazzHopper is cannabis-only in the Feed Intel UI.

**Sort modes:** Newest (default), Most Engaged (total engagement desc), Opportunity (likes/replies ratio — high likes, low replies = engagement opportunity)

**Date filters:** All time (default), Today, This week, This month. Implemented via
`allPosts` unfiltered copy — `sortPosts()` starts from `allPosts` each time so
switching date filters never loses data.

**Per-card actions:**
- **"Turn into post"** — Saves directly to `gh_content_queue` table via REST API
  with the real scraped post data (author, text, engagement, source URL). No
  MiniMax or voice engine dependency. The draft includes source metadata so it
  can be reviewed and edited later.
- **"Open on Threads"** — External link to the original post.

**Implementation detail:** The `sortPosts()` function works from `state.allPosts`
(unfiltered copy) rather than mutating `state.posts` directly. This prevents
data loss when switching between date filters or sort modes.

### Voice & Types (`src/cc-voice.js`)

Content type library and voice compliance engine. Types are grouped by audience.
The voice engine provides:
- `buildPrompt(typeId, { context, source })` → system + user prompt for MiniMax
- `scrub(text)` → remove AI artifacts
- `check(text)` → compliance issues array
- `TYPES` → array of content type definitions

### Schedule (`src/cc-schedule.js`)

Queue management. Reads from `gh_content_queue` Supabase table.

## Other Key Components

| File | Purpose |
|------|---------|
| `src/threads-conversations.js` | Direct Threads reply/post client. Calls `threads-engage` edge function. Never sees the Threads token (server-side only). |
| `src/inbox-view.js` | Unified social inbox. Reads `social_mentions` table (populated by n8n cron every 15 min). Filter by platform (Threads, IG, FB, LinkedIn), unread status. Mark-as-read on click. |
| `src/social-pages.js` | Social account connection status display. |
| `src/hub-reports.js` | Analytics: follower counts, reach metrics. Pulls from `metrics-pull` edge function. |
| `src/cc-center.js` | Content Center shell — tab navigation, loads the 4 tab modules. |
| `src/gh-voice-engine.js` | Voice engine core — prompt building, scrubbing, compliance checking. |
| `src/ai-assistant.js` | Hub AI chat sidebar — answers questions about feed, content, data. |
| `src/team-notify.js` | Team notification system. |
| `src/download-post.js` | Post image download. |

## Hub Entry Points

- **Login:** Team member selection (Frank, Patricia, Tyler, Brianna, Damon, Rahzel, Ryan, Malinda)
- **Main nav:** Posts, Content Center, Ideas, Discover, Past Posts
- **Sidebar:** Dashboard (All Posts, All Drafts, Scheduled, Calendar, Social Pages, Published, Conversations), Content Type filters, Generate Posts, n8n Workflows

## Supabase Edge Functions

| Function | Purpose |
|----------|---------|
| `threads-scrape-ingest` | Accept scraped posts, write to `gh_threads_scraped` |
| `convo-ingest` | Serve scraped conversations to Content Center UI |
| `threads-engage` | Post/reply on Threads (token server-side only) |
| `minimax-generate` | AI draft generation via MiniMax |
| `metrics-pull` | Analytics data (followers, reach) |
| `news-autopop` | Auto-populate from news sources |

## n8n Integration

46 workflow files in `n8n-workflows/` directory. Cron-driven publishing via
`deploy-scheduled-publisher.js`. Content sync via `deploy-content-sync.js`.
Approval gate via `deploy-approval-gate.js`.

## Brand Tokens

- Dark base: `#0a0412` / `#100817`
- Cream text: `#fde9c3`
- Mint accent: `#33fecc`
- Purple: `#cc99ff`
- NO EMOJIS — Lucide-style stroke SVG icons only
- Responsive down to 360px
