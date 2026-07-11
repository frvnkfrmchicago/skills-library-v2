---
name: content-hub-engine
description: >
  Builds and operates a brand content hub with AI-powered generation pipelines,
  multi-platform publishing, and a visual curation UI. Coordinates Supabase
  persistence, n8n automation workflows, AI text and image generation, and
  platform-specific language compliance. Use when building a content operations
  system, adding AI content generation, setting up social media publishing
  pipelines, or when the user mentions content hub, content engine, social
  publishing, batch generation, or content calendar.
---

# Content Hub Engine

Instruction-only skill. Does not ship CLI scripts. Coordinates existing skills
to stand up and operate a three-layer content hub for any brand.

## Architecture (3 Layers)

```
Layer 1 — Curation UI
  Admin dashboard: post grid, detail modal, visual creator (canvas),
  AI chat sidebar, batch generator, calendar view, team management.

Layer 2 — AI Generation Pipelines
  Single-post generator (GLM / Gemini / MiniMax via proxy).
  Batch generator (N posts from topic pool, sequential with progress).
  Per-field regeneration (headline, caption, hashtags, image prompt).
  JSON-strict mode with multi-pass repair for malformed LLM output.

Layer 3 — Multi-Platform Publishing
  n8n webhook-triggered workflows per content segment.
  Platform adapters: Threads, Instagram, Facebook, LinkedIn, TikTok.
  Language compliance layer (platform-specific banned/coded word lists).
  Supabase Edge Function proxies for API keys (browser never sees secrets).
```

## GrazzHopper Implementation

For the concrete GrazzHopper cannabis platform implementation (Content Center
tabs, data pipeline, Supabase edge functions, source files), see
`references/grazzhopper-content-center.md`.

The scraper-to-hub pipeline is documented in the `threads-scraping` skill at
`references/content-center-pipeline.md`.

For how to add new tabs/sections to the Content Hub UI (the standalone HTML
dashboard), see `references/hub-section-architecture.md`.

For the GrazzHopper experience rooms research — room catalog, niche mapping,
legal landscape for cannabis live streaming, virtual gifting legality, state
rules, and competitive intel — see
`references/grazzhopper-experience-rooms-research.md`.

For the content calendar architecture (src/calendar.js — drag-and-drop
scheduling, team task integration, view system, responsive layout), see
`references/content-calendar-architecture.md`.

For N8N operational debugging, deploy script usage, webhook registration
issues, API scope limitations, and the full webhook URL map, see
`references/n8n-operations.md`.

For the post lifecycle (4-state status flow, role-based button matrix,
publish feedback pattern, ghState normalization logic), see
`references/post-lifecycle.md`.

### ⚠ CRITICAL — UI State Preservation (Back Button, Navigation)

**Fixed 2026-06-08.** Key changes applied:

1. **Caption erasure bug (savePost race condition).** The `savePost()` function
   used to clear `cs.cap`, `cs.tags`, `capInput.value`, etc. synchronously
   BEFORE the async `html2canvas().then()` callback built the draft object
   (`cap: cs.cap`). Now the form reset happens inside `_resetCreatorForm()`,
   called AFTER the draft is fully built and saved in every code path (edit
   update, Supabase create, local fallback). The caption is never cleared
   until the data is safely persisted.

2. **Post lifecycle is four states, role-separated.** Frank's correction (2026-06-08):
   "It's only I'll publish" — team members do NOT push to publish queue.
   Reiterated (2026-06-09): "There shouldn't be publishing. They are all saying
   that they're cute" — the previous session wrongly collapsed approved→scheduled,
   renamed tabs to "Publishing" and "Ready", and removed the Approved tab. Frank
   requires four DISTINCT states with matching tab labels: Drafts | Approved |
   Scheduled | Published. NEVER rename tabs to cutesy synonyms. NEVER collapse
   states to "simplify."

   ```
   Draft → Approved → Scheduled → Published
     ↑        ↑           ↑
     |        |           └── ONLY admin (Frank) sets this
     |        └── Team "Approve for publishing" button
     └── "Save for later" or "Move back to drafts"
   ```

   - `ghState()` returns four distinct values: `draft`, `approved`, `scheduled`,
     `published`. Legacy normalization: `pending` → `draft`, `failed` → `scheduled`,
     bare `"published"` without `platformPostIds` → `scheduled`.
   - `ghStateLabel()` returns: "Draft" / "Approved" / "Queued" (scheduled,
     no date) / "Scheduled" (scheduled, has date) / "Published".
   - CSS: `.st-approved` is green (`#22c55e`), `.st-scheduled` is blue (`#8ab0ff`).
   - Tab labels MUST match state names exactly: Drafts, Approved, Scheduled, Published.

3. **Role-based buttons — team vs admin.** Button labels and ACTIONS differ:
   - **Admin on a Draft**: "Publish now" (→ scheduled) + Schedule + Edit + Actions
   - **Team on a Draft**: "Approve for publishing" (→ approved) + Edit + Actions
   - **Admin on Approved**: "Approved — waiting for admin to publish" banner +
     "Publish now" + Schedule + "Move back to drafts"
   - **Team on Approved**: sees "Approved — waiting for admin to publish" banner,
     "Move back to drafts", NO publish button
   - **Scheduled**: "Queued — goes out within ~5 min" or "Scheduled for [date]" banner +
     feedback line + "Cancel — move back to drafts". No Edit on scheduled posts
     (prevents pulling a live-queued post into edit).
   - **Published**: "✓ Published — [timestamp]" + Unpublish (admin only) + Download
   - Published posts hide Share/Assign/Edit — only Download + Delete remain

   Creator footer button text updates on login via `_cpb` query selector.
   Hint text (`#creatorFooterHint`) also updates per role.
   `savePost()` sets `status:"approved"` for non-admin publish-now,
   `status:"scheduled"` for admin publish-now — both in new-post and edit paths.

4. **Publish feedback shows webhook response.** When admin hits "Publish now"
   from the detail modal (`btnPublish`):
   - Sets `status:"scheduled"`, saves, renders immediately.
   - Shows "Sending to publisher..." (blue) in a `#publishFeedback` span.
   - Fires N8N webhook. On success: "✓ Sent to publisher — goes out within ~5 min."
     (green). On failure: "⚠ Publisher unreachable — queued locally, will retry."
     (orange).
   - Detail modal stays open 1.8 seconds so Frank sees the feedback, THEN closes.
   - Same webhook firing pattern applies in `savePost()` creator path (all four
     code paths: Supabase update, local update fallback, Supabase create, local
     create fallback) when `publishNow && isAdmin`.

5. **Sidebar and tabs.** Sidebar items: "Approved" (filter: `approved`, all roles),
   "Scheduled" (filter: `scheduled`, all roles), "Published" (filter: `published`).
   Status sub-tabs: Drafts | Approved | Scheduled | Published. `ghStateLabel()`
   returns "Queued" for scheduled posts without a date, "Scheduled" for those with one.
   Tab labels MUST use the exact state names — never "Publishing", "Ready", or
   other renamed variants.

6. **Back = return to post detail.** The Back button always returns to the post
   detail modal the user came from. Never cycles to another platform.

**Rules for Content Hub navigation state:**

1. **Auto-save before any navigation.** When the user clicks Back, Edit, or
   switches tabs, persist ALL form fields (headline, caption, hashtags, image
   prompt) to Supabase or localStorage FIRST. Never rely on DOM state surviving
   a view transition.
2. **Back = return to post detail, not to another platform.** The Back button
   must always return to the post detail modal the user came from.
3. **Status must reflect reality.** A post should only show "published" if a
   platform API returned success with a real post ID. If the N8N webhook
   returned 404 or was never called, the status stays at "scheduled" ("Queued").
4. **Caption restoration.** When returning to a post (via Back or re-click),
   the caption textarea must be repopulated from the saved data — never start
   empty if the user previously typed content.

---

### ⚠ CRITICAL — Content Hub ≠ Platform App

The **GrazzHopper Content Hub** is a **standalone HTML dashboard** at
`~/Documents/Automation Centre/grazzhopper-content-hub/` (single HTML + JS).
It is NOT part of the Next.js platform app at
`~/Documents/GrazzHopper Dev/grazzhopper-v2/grazzhopper-landing/`.

When Frank says "put it on the Content Hub," he means the standalone dashboard.
Never add research, strategy, or operational content as Next.js routes on the
platform app unless explicitly told to. The Content Hub is the operational
workspace; the platform is the public-facing product.

### ⚠ CRITICAL — Cannabis Influencer Ops Framing

When planning GrazzHopper cannabis influencer, creator, or host work, do **not**
frame it as "consumer vs creative" as if these are two separate public products.
The correct model is:

```
Public consumer app = everyone participates
Creator tools = approved creators / influencers get extra capabilities
Internal influencer ops = GrazzHopper staff manages cannabis creators behind the scenes
```

A cannabis influencer is still a consumer in the public app. The difference is
an elevated account state plus tool entitlement, usually under `/host/*`, and
an internal operations record for approvals, campaigns, compliance review,
sponsored disclosure checks, payouts, analytics, and content calendar work.
Keep internal influencer ops protected or in the standalone Content Hub. Do not
expose staff-only campaign, payout, risk, approval, or compliance data in public
consumer navigation.

Before delivering a SAD or orchestration plan for influencers, **do not lead
with disclosure/compliance as if that is the product**. Frank's correction:
GrazzHopper is trying to serve creators, brands/platforms, public users, and
internal ops with decision tools, deal orchestration, feedback loops, and
revenue capture. Compliance/disclosure is only a guardrail and routing input.

For influencer planning, first capture needs and pain points:

- creator needs: deal discovery, audience proof, rate/deal guidance, content
  tools, analytics, feedback, payouts;
- brand/platform needs: creator discovery, vetting, audience fit, campaign ops,
  measurement, quality control, repeat-match decisions;
- public-user needs: trusted creator-led cannabis discovery tied to local
  products, strains, stores, rooms, and next actions;
- internal GrazzHopper needs: influencer registry, campaign board, deal CRM,
  feedback history, payout/platform-fee ledger, and reuse/avoid signals.

Then cite creator-marketplace and consumer-decision sources before compliance
sources: YouTube Creator Partnerships, Meta Creator Marketplace, TikTok One,
Shopify Collabs, Instagram Creators, Influencer Marketing Hub, IZEA, Leafly,
and Jane. Use FTC/FDA/state cannabis sources only where they affect routing,
risk, or safe decision support.

Tie each recommendation to code evidence and source citations. See
`references/grazzhopper-influencer-ops-framing.md` and
`references/grazzhopper-influencer-needs-deal-ops.md`.

### Scraper-to-Hub Pipeline

The CDP scraper (`threads_scrape_cdp.py`) writes to local cache AND POSTs to
the `threads-scrape-ingest` edge function. The Supabase ingest key is read
from `.env.local` at runtime. If Feed Intel or Discover & Reply tabs show empty
after a scrape, check that `.env.local` has a valid `SUPABASE_ANON_KEY`.

**Frank's data rule:** No mock, fake, placeholder, or zeroed-out data. The
scraper must send real engagement metrics and timestamps in the ingest payload.
If the local cache has real likes/replies, those same numbers must appear in
the Supabase POST body. See the `threads-scraping` skill for the full POST shape.

**GrazzHopper scope:** Cannabis vertical only. The Feed Intel UI strips all
other verticals (Tech, Business, Music, Sneakers, Chicago, Fitness). Date
filtering (Today, This Week, This Month, All Time) and sort modes (Newest,
Most Engaged, Opportunity) are built into the Feed Intel tab.

The full pipeline architecture is documented in the `threads-scraping` skill at
`references/content-center-pipeline.md`.

---

## Dependencies

This skill coordinates the following existing skills. Activate each as needed.

| Skill | Role in Content Hub |
|---|---|
| `n8n-automating` | Workflow design, node selection, error handling, webhook triggers |
| `api-integrating` | REST client patterns, retry logic, webhook signature verification |
| `supabase-building` | Row Level Security, auth, realtime subscriptions, storage policies |
| `component-building` | Post cards, modals, canvas elements, micro-interactions |
| `copywriting-enforcing` | AI language ban list, voice calibration, microcopy standards |
| `prompt-engineering` | System prompts, JSON-strict output, few-shot patterns |
| `google-ai-integrating` | Gemini model selection, rate limit strategy, credit management |
| `experience-designing` | Design tokens, color/typography/spacing system, dark mode |
| `animation-designing` | Card hover states, modal transitions, progress animations |
| `deploying` | GitHub Pages / Vercel / Cloudflare deployment pipelines |

## Workflow

Follow these steps in order to build a content hub for any brand.

### Step 1 — Define Brand Configuration

Create a brand config file that drives every downstream decision.

```json
{
  "brand": {
    "name": "BrandName",
    "handle": "@brandhandle",
    "tagline": "Short tagline",
    "colors": {
      "primary": "#hexvalue",
      "accent": "#hexvalue",
      "surface": "#hexvalue",
      "text": "#hexvalue"
    },
    "fonts": {
      "display": "Font Name",
      "body": "Font Name"
    },
    "logo": "./logo.png"
  },
  "platforms": ["threads", "instagram", "facebook", "linkedin", "tiktok"],
  "segments": [
    { "id": "news", "label": "General News", "cronDay": "tue,thu" },
    { "id": "engage", "label": "Community Engage", "cronDay": "sat" },
    { "id": "facts", "label": "History / Facts", "cronDay": "wed" },
    { "id": "regulation", "label": "Compliance / State", "cronDay": "mon,fri" }
  ],
  "team": [
    { "id": "user1", "name": "Name", "role": "admin", "avatar": "url" }
  ],
  "aiModel": "glm-5.1",
  "aiProxy": "https://project.supabase.co/functions/v1/llm-proxy"
}
```

### Step 2 — Set Up Supabase Backend

Activate `supabase-building`. Create these tables:

**posts table**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, default `gen_random_uuid()` |
| `system` | text | Content segment ID (news, engage, facts, etc.) |
| `headline` | text | Uppercase, max 10 words |
| `hl_words` | jsonb | Array of highlighted word strings |
| `cap` | text | Caption body |
| `tags` | jsonb | Array of hashtag strings |
| `img` | text | Baked post image (data URL or storage URL) |
| `bg_url` | text | Original background image URL (pre-bake) |
| `img_prompt` | text | Image generation prompt |
| `status` | text | `draft`, `approved`, `scheduled`, `published`, `failed` |
| `assignee` | uuid | FK to team member |
| `created_by` | uuid | FK to auth.users |
| `source` | text | Origin: `manual`, `ai-single`, `ai-batch`, `n8n-cron` |
| `published_at` | timestamptz | When published to social |
| `publish_result` | jsonb | Per-platform response/error log |
| `created_at` | timestamptz | Default `now()` |

**comments table**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `post_id` | uuid | FK to posts |
| `author` | text | Team member name |
| `text` | text | Comment body |
| `created_at` | timestamptz | Default `now()` |

**Storage buckets**: `post-backgrounds` (public read, authenticated write).

**RLS policies**: Authenticated users can CRUD their own posts. All
authenticated users can read all posts. Only admins can delete others' posts.

**Realtime**: Enable realtime on the `posts` table so multi-user dashboards
stay in sync without polling.

### Step 3 — Build the Curation UI

Activate `component-building` and `experience-designing`.

The UI has four major sections. See `references/ui-patterns.md` for layout
specifications.

1. **Post Grid** — Filterable card grid with status tabs (Drafts, Approved, Scheduled, Published). Each card shows the baked image, headline preview, segment
   badge, assignee avatar, and timestamp. Long-press or checkbox for bulk
   select. Bulk actions: delete, change status, reassign.

2. **Detail Modal** — Split layout: left panel shows the full post image,
   right panel shows editable fields (headline, caption, tags, image prompt),
   status controls (Approve, Reject, Publish), comment thread, and social
   preview. Edit-in-Creator button opens the visual canvas with the post's
   data pre-loaded.

3. **Visual Creator (Canvas)** — Full-screen modal with a live preview frame.
   Draggable elements: background image, logo, headline text. Controls panel
   with two tabs:
   - Design tab: segment selector, dimension presets (1:1, 4:5, 16:9, 9:16),
     background upload/URL/paste/drop, image scale slider, gradient overlay
     controls (color, opacity, height), headline input with word-highlight
     picker, caption textarea, hashtag search with curated chip pool, font
     size slider.
   - AI tab: one-click full post generator, per-field regeneration buttons,
     conversational AI chat with approval detection ("use that", "approved",
     "lock it in" auto-apply responses to fields).

4. **Batch Generator Modal** — Topic input (free text or tap-to-select from
   curated topic categories), count picker (1/5/10/20/custom), assignee
   selector, progress bar with per-post status, generated post tray with
   accept/reject/regenerate per card.

### Step 4 — Build AI Generation Pipelines

Activate `prompt-engineering` and `google-ai-integrating`.

#### Single-Post Generator (One-Click)

The generator takes a topic string and returns a structured JSON object with
all post fields in a single LLM call.

**Request shape:**
```json
{
  "model": "glm-5.1",
  "thinking": { "type": "disabled" },
  "response_format": { "type": "json_object" },
  "messages": [
    { "role": "system", "content": "<FULL_POST_SYSTEM_PROMPT>" },
    { "role": "user", "content": "Topic: <user_topic>" }
  ],
  "temperature": 0.7,
  "max_tokens": 1200
}
```

**Response schema:**
```json
{
  "headline": "UPPERCASE STRING, MAX 10 WORDS",
  "highlight_words": ["WORD1", "WORD2"],
  "caption": "Min 4 sentences, cites a source by name, SEO keywords",
  "hashtags": "#Tag1 #Tag2 #Tag3 ... (8-11 tags)",
  "image_prompt": "One paragraph, 50-75 words, coded language"
}
```

**JSON repair pipeline** (models sometimes emit malformed JSON):

1. Try strict `JSON.parse()`.
2. Extract the outermost `{...}` block and retry.
3. Targeted repair: replace apostrophes used as string terminators before
   known key names (`headline`, `caption`, `hashtags`, `image_prompt`).
4. Replace trailing apostrophe before closing brace.
5. Regex fallback: extract each field individually with pattern matching.

**Timeout handling**: Wrap every LLM fetch in an `AbortController` with a
60-second hard timeout. Wrap every Supabase save in a generic promise timeout.
Both throw descriptive errors so the UI always recovers.

#### Batch Generator

Sequential loop over N posts. For each iteration:

1. Build a topic string from user input + selected topic category.
2. Call the single-post generator.
3. Parse and validate the response.
4. Save to Supabase via `postsApi.create()`.
5. Update the progress bar (`Generating post X of N`).
6. On failure, log the error, skip to the next post, and continue.
7. After all posts complete, show the generated post tray.

Anti-duplicate: include previously generated headlines in the prompt context
so the model avoids repetition within a batch.

#### Per-Field Regeneration

Each field (headline, caption, hashtags, image prompt) has a "suggest a
different option" button that calls the conversational AI with a field-specific
request. The AI chat uses approval detection to auto-apply responses:

**Approval phrases**: "use that", "yes", "approved", "that works", "go with
that", "perfect", "let's go", "lock it in", "do it", "love it", "bet",
"say less", "fire", "send it", "solid", "run it".

When the user approves, the system detects which field type the last AI
response was for (headline, caption, hashtags, imagePrompt) and calls
`applyToField()` to populate the corresponding input.

### Step 5 — Configure Platform Language Compliance

See `references/platform-language-rules.md` for the complete rule set.

Every piece of content must pass through a platform-specific language filter
before publishing. The system maintains separate vocabularies per platform.

**Decision tree — which language mode to use:**

```
Is the target platform TikTok?
  YES -> Use fully coded language (flower, green, the leaf)
         Never write: cannabis, marijuana, weed, THC, CBD, dispensary
  NO  -> Is this an image generation prompt?
           YES -> Use coded botanical language
                  (lifestyle leaf garden, amber glass apothecary jar)
                  Never write: cannabis, marijuana, weed, joint, smoking
           NO  -> Use the word "cannabis" directly
                  Vary with: the plant, the industry, the market, the sector
                  Avoid slang: weed, pot (keep professional)
```

### Step 6 — Build n8n Publishing Workflows

Activate `n8n-automating`. See `references/n8n-workflow-templates.md`.

**Architecture**: One master workflow per content segment. Each workflow:

1. **Trigger**: Cron schedule (segment-specific days/times) OR webhook from
   the Content Hub UI (manual publish).
2. **Fetch**: Query Supabase for the next approved post in this segment.
3. **Generate** (cron path only): If no approved post exists, call the AI
   pipeline to generate one on the fly.
4. **Adapt**: Transform the post content for each target platform (character
   limits, hashtag counts, language compliance).
5. **Publish**: POST to each platform's API (Threads, IG, FB, LinkedIn).
6. **Record**: Update the post's status to `published`, store per-platform
   response in `publish_result`, set `published_at`.

**Platform adapter rules:**

| Platform | Character Limit | Hashtag Behavior | Image | Special Rules |
|---|---|---|---|---|
| Threads | 500 chars | Inline at end | Attach via URL | No link previews in API |
| Instagram | 2200 chars | Up to 30, end of caption | Required, attach via URL | Alt text required |
| Facebook | 63206 chars | Minimal (3-5) | Attach via URL | Link preview supported |
| LinkedIn | 3000 chars | 3-5 professional tags | Attach via URL | No casual language |
| TikTok | 2200 chars | Coded language only | Video required | Full code word substitution |

### Step 7 — Set Up the AI Proxy

Never expose AI API keys to the browser. Use a Supabase Edge Function (or
equivalent serverless function) as a proxy.

**Proxy pattern:**
```
Browser -> fetch(PROXY_URL, { body: LLM_REQUEST })
Proxy   -> read API_KEY from environment secret
Proxy   -> fetch(LLM_API, { headers: { Authorization: Bearer KEY }, body })
Proxy   -> return LLM response to browser
```

The proxy:
- Reads the API key from `Deno.env.get("LLM_API_KEY")` (Supabase Edge
  Function) or `process.env.LLM_API_KEY` (Node).
- Validates the request shape before forwarding.
- Strips any client-sent Authorization header.
- Returns the raw LLM response.

### Step 8 — Build the Content Calendar

See `references/content-calendar-architecture.md` for the full GrazzHopper
calendar implementation (1,130 lines, interact.js drag-and-drop, Supabase
team tasks, month + week views, responsive layout).

See `references/content-calendar-schema.md` for the generic calendar data
model.

The calendar view shows scheduled and published posts on a month grid. Each
cell shows post thumbnails grouped by segment. Clicking a cell opens the
day's posts. Drag-and-drop to reschedule. Color-coded by segment.

### Step 9 — Wire Team Collaboration

- **Comments**: Each post has a comment thread. Comments trigger n8n webhook
  notifications to the assignee.
- **Assignments**: Posts can be assigned to team members. Assignment changes
  trigger notifications.
- **Status changes**: Moving a post from Pending to Approved or Published
  triggers notifications to the creator and assignee.
- **Realtime sync**: Supabase realtime subscriptions keep all connected
  dashboards in sync. When one user approves a post, all other users see
  the status change immediately.

### Step 10 — Deploy and Monitor

Activate `deploying`. The Content Hub is a static site (HTML/CSS/JS) that
connects to Supabase and n8n via API calls. Deploy to any static host.

For Cloudflare Pages deployment (wrangler CLI, OAuth token handling from the
Hermes sandbox, first-run project creation), see
`references/cloudflare-pages-deploy.md`.

**Environment variables** (set in hosting platform, never in code):

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (public, RLS provides security) |
| `GLM_PROXY_URL` | AI proxy Edge Function URL |
| `N8N_CHAT_WEBHOOK` | n8n AI chat workflow webhook |
| `N8N_NOTIFY_WEBHOOK` | n8n team notification webhook |
| `N8N_SOCIAL_WEBHOOK` | n8n social publishing webhook |
| `POSTIZ_API_URL` | Self-hosted Postiz publishing API (optional) |
| `POSTIZ_API_KEY` | Postiz API key (optional) |

## Decision Trees

### Platform Selection

```
What platforms does the brand publish to?
  Threads + Instagram + Facebook + LinkedIn (standard suite)
    -> Build one n8n workflow per segment, each posts to all four.
  TikTok (additional)
    -> Build a SEPARATE TikTok workflow with coded language.
       TikTok posts are generated with a different system prompt.
       Keep TikTok content OUT of the main cron.
  YouTube / Blog / Newsletter
    -> Extend the adapter layer. Same pipeline, different output format.
```

### Content Type Categorization

```
What is the content about?
  Breaking news, legislation, market data
    -> Segment: news
    -> Cron: Tuesday, Thursday
    -> Tone: authoritative, sourced, specific numbers
  Community, lifestyle, culture
    -> Segment: engage
    -> Cron: Saturday
    -> Tone: conversational, inclusive, celebration
  Historical facts, milestones, education
    -> Segment: facts
    -> Cron: Wednesday
    -> Tone: informative, surprising, "did you know" framing
  State regulations, compliance updates
    -> Segment: regulation
    -> Cron: Monday, Friday
    -> Tone: precise, actionable, jurisdiction-specific
```

### AI Model Selection

```
What is the generation task?
  Full post (headline + caption + hashtags + image prompt)
    -> Use JSON-strict mode with response_format: { type: "json_object" }
    -> Model: GLM-5.1, Gemini 2.5 Flash, or equivalent
    -> Temperature: 0.7
    -> Max tokens: 1200
  Single field (headline only, caption only, etc.)
    -> Use conversational mode (plain text response)
    -> Model: same as above
    -> Temperature: 0.7-0.85 (higher for creative fields)
  Image generation prompt
    -> Generate the PROMPT text via LLM, then send to a separate
       image model (Gemini Imagen, ChatGPT Images 2.0, Midjourney)
    -> Use coded botanical language in the prompt
  Content categorization / moderation
    -> Use Gemini with lower temperature (0.3)
    -> Structured output for category classification
```

### Trigger Type Decision

```
How should content be published?
  Scheduled (hands-off)
    -> n8n cron trigger on segment-specific days
    -> Auto-fetch approved posts OR auto-generate if queue empty
  Manual (editor-controlled)
    -> Publish button in the Detail Modal
    -> Calls n8n social webhook with post data
  Hybrid (recommended)
    -> Cron checks for approved posts first
    -> If none available, generates a draft and holds it as pending
    -> Editor reviews and approves before next cron window
```

## System Prompt Template

The system prompt is the most critical piece. It controls the quality,
accuracy, and brand voice of every generated post. Below is the template
structure. Replace brand-specific values with your config.

```
You are a [BRAND] content assistant for [BRAND_DESCRIPTION].

HEADLINE RULES:
- Use [PRIMARY_TERM] directly. Vary with: [SYNONYMS].
- UPPERCASE, [MAX_WORDS] words max, no ending period.
- Lead with the most surprising real fact.
- One strong active verb.
- Rotate shapes: news-lead, number/stakes, tension, why/how, what-it-means.
- WEAK: "[INDUSTRY] SEES CHANGES IN 2026". STRONG: "[SPECIFIC THING HAPPENED]".

CAPTION RULES:
- ACCURACY FIRST. Never fabricate statistics.
- Must cite a source by name.
- Minimum [MIN_SENTENCES] sentences.
- SEO keywords: [KEYWORD_LIST].
- No em dashes. No semicolons. No AI filler words.
- Banned words: [AI_FILLER_BAN_LIST].

HASHTAG RULES:
- [MIN_TAGS] to [MAX_TAGS] hashtags. Rotate each post.
- Mix broad searchable with niche topic-specific.
- Always include [BRAND_HASHTAG].

IMAGE PROMPT RULES:
- ONE paragraph, 50-75 words.
- Tie the scene to the post topic.
- Coded language for moderation compliance.
- Brand color binding: [COLOR_1] and [COLOR_2] on two specific objects.
- Real specific locations.
- Named lighting (time of day, direction, quality).
- End with: "[CAMERA_STYLE_CLOSER]".
- Forbidden: stock photo, corporate, polished, plastic, 4k, masterpiece.
```

## Pre-Work Assessment (Mandatory)

**Before changing any Content Hub code or configuration, assess live infrastructure state first.** Do not patch code without verifying what is actually running. Frank's correction: "Did you look at the state of everything before you started to build?"

Required checks before any Content Hub change:

1. **N8N webhooks** — curl each webhook URL from the HTML config block. A workflow showing `active: true` in the N8N API does NOT guarantee the webhook is registered. Test with `curl -X POST <webhook_url>`.
2. **Supabase connection** — Verify the anon key in the HTML file works with a REST query. `read_file` may truncate long JWT keys in its display — do not assume a key is a placeholder just because it looks short in the output.
3. **Edge functions** — Test each edge function URL. The existence of `unpublish-post` does not imply `publish-post` exists.
4. **N8N workflow inventory** — Use `load-env.js` + N8N API to list all workflows and their actual active state.
5. **Postiz server** — If configured, test connectivity.

If any of these fail, fix the infrastructure before touching frontend code. Broken infrastructure will make UI fixes appear ineffective.

See `references/n8n-operations.md` for the full N8N debugging and deploy reference.

---

## Product / Feature / Segment Naming

When the user asks to name a product, app, content segment, brand, or feature,
do NOT brainstorm from your training data alone. Always verify names against
live search results before presenting them.

**Frank's correction:** "Did you do an SEO search or anything?" — presenting
unverified name ideas wastes the user's time when conflicts surface later.

**Required verification before recommending any name:**

1. **Google search** the exact phrase in quotes (e.g., `"Double Down" dating app`).
2. **App Store** search via Google (`site:apps.apple.com "name"`) and Google Play
   (`site:play.google.com "name"`).
3. **Trademark adjacency check** — search for the name + the product category
   (e.g., `"social stakes" crypto` to discover Stake.com's "social casino").
4. **SEO competition** — Google the bare phrase. If page 1 is dominated by an
   unrelated major brand, the name will never rank.

**Common conflict patterns:**
- Crypto/gambling platforms squat on common words (Stake, Bet, Ante)
- Mobile games exist for nearly every casual phrase
- Dating/social apps are a crowded category — assume taken until proven clear

Present findings as: name, conflict status (CLEAR / TAKEN / CROWDED), evidence
URLs. Never present more than 5 options without search backing.

---

## Anti-Patterns

| Do Not | Instead |
|---|---|
| Expose API keys in client-side code | Use a serverless proxy (Edge Function) |
| Use `data:` URLs for published images | Upload to Supabase Storage, use public URLs |
| Rely solely on `localStorage` | Use Supabase as source of truth, localStorage as offline cache |
| Skip JSON repair for LLM responses | Always implement multi-pass parse with regex fallback |
| Use the same hashtag set every post | Rotate: 3-4 broad + 4-6 niche, never the same set twice |
| Fabricate statistics in AI prompts | Instruct model to omit numbers it cannot verify |
| Use identical language across all platforms | Apply platform-specific adapters (see language rules) |
| Poll for updates across browser tabs | Use Supabase realtime subscriptions |
| Let a stalled LLM request hang forever | Always wrap in AbortController with hard timeout |
| Trust LLM output without validation | Validate required fields, run language compliance checks |
| Assume a JWT in `read_file` output is a placeholder | `read_file` truncates long strings; test the key against the actual API before concluding it's redacted |
| Clear form state before async save completes | Defer form resets (e.g. `_resetCreatorForm()`) to AFTER the draft object is built and persisted in the `.then()` callback — never synchronously before |
| Let team members push to Publishing Queue | Only admin can set `status:"scheduled"`. Team "Approve" sets `status:"approved"`. Check `isAdmin` in both creator footer and detail modal handlers |
| Collapse or rename states for "simplicity" | Frank explicitly requires 4 DISTINCT states with matching labels. Never merge approved→scheduled or rename tabs to "Publishing" / "Ready" / "Publishing Queue" |
| Leave dangling JS references after removing nav items | When removing or renaming sidebar nav elements, grep for ALL JS variable references (e.g. `nApp`, `navApproved`) — an undefined variable crashes `login()` |
| Allow editing scheduled posts | Scheduled posts are in the live publish queue. Editing mid-queue causes data loss. Guard with `_st!=="scheduled"` on the Edit button |
| Close detail modal immediately on publish | Keep modal open ~1.8s after publish so user sees webhook response feedback ("Sent to publisher" / "Publisher unreachable"). Use `setTimeout(closeDetail, 1800)` |

## Quality Checklist

Before considering the content hub complete, verify:

- [ ] Every API key is stored server-side (Edge Function secrets or env vars)
- [ ] RLS policies are active on all Supabase tables
- [ ] Realtime subscriptions sync across multiple browser tabs
- [ ] Batch generator handles failures gracefully (skip and continue)
- [ ] JSON repair pipeline handles at least 4 malformation patterns
- [ ] Platform language compliance is enforced before every publish
- [ ] TikTok content uses a separate system prompt with coded language
- [ ] Image prompts never contain banned substance terms
- [ ] Comments and status changes trigger team notifications
- [ ] Calendar view accurately reflects scheduled and published posts
- [ ] Offline cache (localStorage) syncs with Supabase on reconnect
- [ ] All post images are uploaded to Storage (no data: URLs in production)
- [ ] Team "Approve for publishing" sets status=approved, NOT scheduled — only admin reaches Publishing Queue
- [ ] Publish feedback shows webhook response in detail modal before closing (1.8s delay)
- [ ] Form resets happen AFTER async save, not before (no caption erasure on race condition)
