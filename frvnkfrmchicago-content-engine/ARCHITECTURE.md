# Asset Persona Content Engine — Architecture

> Multi-pipeline content engine for the @assetpersona personal brand.
> Adapted from the Asset Persona N8N Content Engine (3-pipeline, 5-platform).

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Asset Persona Content Engine                     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐              │
│  │ Pipeline 1:  │  │ Pipeline 2:  │  │ Pipeline 3:   │              │
│  │ AI/Tech      │  │ Industry +   │  │ Repost + Meme │              │
│  │ Auto-Poster  │  │ Creative     │  │ Engine        │              │
│  │ (LinkedIn +  │  │ News Router  │  │ (Reddit +     │              │
│  │  Threads)    │  │ (5 Platforms)│  │  Threads)     │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘              │
│         │                 │                  │                        │
│         ▼                 ▼                  ▼                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              Google Sheet: Content Calendar                  │    │
│  │   Date | Category | Platform | Caption | Status | PostURL   │    │
│  └────────────────────────────┬─────────────────────────────────┘    │
│                               │                                      │
│                               ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              Pipeline 4: Content Publisher                   │    │
│  │   Read approved → Route by platform → Post → Mark published │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                               │                                      │
│         ┌─────────┬──────────┼──────────┬───────────┐               │
│         ▼         ▼          ▼          ▼           ▼               │
│    LinkedIn   Threads   Instagram   TikTok     Facebook             │
└──────────────────────────────────────────────────────────────────────┘
```

---

## AI Stack

| Model | Purpose | Cost Tier | When to Use |
|-------|---------|-----------|-------------|
| **Gemini 2.0 Flash** | Caption generation, categorization | Low | Default for all text generation |
| **Gemini 2.0 Flash** | Content scoring, JSON output | Low | Repost/Meme scoring, categorization |
| **Gemini Flash Image Preview** | Social media image generation | Medium | News cards, meme cards |
| **MiniMax M2.5** (optional) | Alternative text generation | Low | A/B testing voice variety |

---

## Content Categories

| Category | Description | Source | Frequency |
|----------|-------------|--------|-----------|
| `AI_TECH` | AI/dev news, tool reviews, engineering insights | RSS feeds, Hacker News | 3-4/week |
| `PERSONAL_BRAND` | Consulting wins, portfolio pieces, career milestones | Manual | 1-2/week |
| `COMMUNITY` | Morehouse alumni, Chicago events, cultural commentary | Manual + RSS | 1/week |
| `CREATIVE` | Music, video, 3D work, design showcases | Manual | 1-2/week |
| `INDUSTRY` | Tech trends, product management, startup ecosystem | RSS feeds | 2-3/week |
| `REPOST_MEME` | Trending content reactions | Reddit, Threads | 2-3/week |

### Content Mix Target

```
AI_TECH:        35%  ████████████████░░░░  (primary voice)
INDUSTRY:       20%  ██████████░░░░░░░░░░
PERSONAL_BRAND: 15%  ████████░░░░░░░░░░░░
REPOST_MEME:    15%  ████████░░░░░░░░░░░░
CREATIVE:       10%  █████░░░░░░░░░░░░░░░
COMMUNITY:       5%  ███░░░░░░░░░░░░░░░░░
```

---

## Pipeline 1: AI/Tech Auto-Poster

**Trigger:** Daily at 9:00 AM CT (Schedule)
**Output:** 1 LinkedIn post + 1 Threads post

### Flow
```
[Schedule: 9AM CT]
    │
    ├── [RSS: Hacker News top stories]
    ├── [RSS: TechCrunch AI]
    ├── [RSS: The Verge AI]
    └── [RSS: Ars Technica]
         │
    [Merge + Deduplicate by URL]
         │
    [Function: Build Summary]
    Concatenate top 10 headlines
         │
    [Gemini 2.0 Flash: Pick Best + Categorize]
    "Pick the single most interesting AI/tech story.
     Return: {headline, url, source, category, summary, angle}"
         │
    [Function: Determine Post Type]
    Check day of week → 7-day rotation
         │
    ┌────┴────┐
    │         │
    [Gemini: LinkedIn Post]    [Gemini: Threads Post]
    Full brand voice prompt     Short-form brand voice
    1300-2000 chars             < 500 chars
    │         │
    [Function: Clean Output]
    Strip tags, enforce length
    │         │
    [Google Sheets: Write 2 Draft Rows]
    Category: AI_TECH
    Status: draft
    Agent: ai-autoposter
```

---

## Pipeline 2: Industry + Creative News Router

**Trigger:** Manual or Daily (configurable)
**Output:** Up to 5 posts across all platforms per topic

### Flow
```
[Manual/Schedule Trigger]
    │
    ├── [RSS: Product Hunt]
    ├── [RSS: Forbes Tech]
    ├── [RSS: Wired]
    ├── [RSS: MIT Tech Review]
    ├── [RSS: Creative Bloq]
    └── [RSS: Mind the Product]
         │
    [Merge All + Normalize]
    {source, title, url, published_date}
         │
    [Gemini 2.0 Flash: Categorize All]
    "Categorize these headlines into:
     AI_TECH, INDUSTRY, CREATIVE, COMMUNITY.
     Pick the SINGLE BEST headline per category.
     Return JSON array with category and 1-sentence summary."
         │
    [Function: Extract by Category]
    Split into individual items
         │
    [Loop: For Each Selected Story]
         │
         [Function: Build 5 Platform Prompts]
         LinkedIn (long), Threads (short), IG (visual),
         TikTok (trend), Facebook (community)
         │
         [Split In Batches: 5]
         │
         [Gemini 2.0 Flash: Generate Caption]
         │
         [Function: Clean Output]
         │
         [Wait: 1 second]  ← rate limiting
         │
    [End Loop]
         │
    [Gemini Flash Image: Generate Card]
    One activism-style card per story
         │
    [Google Drive: Upload Image]
         │
    [Google Sheets: Write Draft Rows]
    5 rows per story (one per platform)
    Status: draft, Agent: news-router
```

---

## Pipeline 3: Repost + Meme Engine

**Trigger:** Manual ("Find Trending Content")
**Output:** Up to 15 posts (3 trending items × 5 platforms)

### Flow
```
[Manual Trigger]
    │
    ├── [HTTP: Reddit r/artificial top/week]
    │   Authorization: Bearer REDDIT_TOKEN
    │   limit=25
    │
    ├── [HTTP: Reddit r/programming top/week]
    │   limit=25
    │
    ├── [HTTP: Reddit r/MachineLearning top/week]
    │   limit=25
    │
    └── [HTTP: Reddit r/ProductManagement top/week]
         limit=25
         │
    [Merge All + Normalize]
    {title, url, source, score, num_comments, subreddit}
         │
    [Gemini 2.0 Flash: Score & Rank]
    "Score each post for @assetpersona repost potential:
     humor (0-10), relatability (0-10),
     viral_potential (0-10), brand_fit (0-10).
     Return top 3 with reaction_angle and copy_hint."
         │
    [Function: Extract Top 3]
         │
    [Loop: For Each Top Post]
         │
         [Function: Build 5 Platform Reaction Prompts]
         Include reaction_angle from scoring step
         │
         [Split In Batches: 5]
         │
         [Gemini 2.0 Flash: Generate Reaction]
         │
         [Function: Clean Output]
         │
    [End Loop]
         │
    [Gemini Flash Image: Generate Meme Cards]
    Dark branded card with accent line
         │
    [Google Drive: Upload]
         │
    [Google Sheets: Write Draft Rows]
    Category: REPOST_MEME, Status: draft
    Agent: repost-meme
```

---

## Pipeline 4: Content Publisher

**Trigger:** Manual ("Publish Approved Content")
**Output:** Live posts on target platforms

### Flow
```
[Manual Trigger]
    │
    [Google Sheets: Read All Rows]
    Filter: Status = "approved"
         │
    [Switch: Route by Platform Column]
         │
    ├── "linkedin" → [LinkedIn API: Create Post]
    │                  method: POST
    │                  url: api.linkedin.com/v2/ugcPosts
    │                  body: {author, lifecycleState, specificContent}
    │
    ├── "threads" → [HTTP: Create Container]
    │                 POST graph.threads.net/v1.0/{user_id}/threads
    │                 body: {media_type: "TEXT", text: caption}
    │                      │
    │                 [Wait: 30 seconds]  ← MANDATORY for Threads
    │                      │
    │                 [HTTP: Publish]
    │                 POST graph.threads.net/v1.0/{user_id}/threads_publish
    │                 body: {creation_id: container_id}
    │
    ├── "instagram" → [HTTP: Create Media Container]
    │                   POST graph.instagram.com/v19.0/{user_id}/media
    │                   body: {image_url, caption}
    │                        │
    │                   [HTTP: Publish Media]
    │                   POST graph.instagram.com/v19.0/{user_id}/media_publish
    │
    ├── "tiktok" → [HTTP: Initiate Upload]
    │                POST open.tiktokapis.com/v2/post/publish/...
    │
    └── "facebook" → [HTTP: Create Post]
                      POST graph.facebook.com/v19.0/{page_id}/feed
                      body: {message: caption}
         │
    [Google Sheets: Update Row]
    Status = "published"
    PostURL = [response URL/ID]
```

---

## Daily Post-Type Rotation

| Day | Post Type | Frank's Spin |
|-----|-----------|-------------|
| Sunday | HOT TAKE | Bold opinion on an AI tool or industry move |
| Monday | STORY | Something Frank built this week, or a consulting insight |
| Tuesday | QUESTION | "What's your stack for...?" — engagement driver |
| Wednesday | LISTICLE | "3 tools I replaced this month" |
| Thursday | CONTRARIAN | Against-the-grain take on a popular tech opinion |
| Friday | PRACTICAL TIP | One specific workflow, tool, or technique |
| Saturday | BREAKDOWN | Deep analysis of a trending story or product launch |

---

## n8n Setup Requirements

1. **n8n instance** — self-hosted at `localhost:5678` or n8n Cloud
2. **Credentials configured** (see `config/credential-setup.md`)
3. **Variables set** in n8n Settings → Variables:
   - `BRAND_HANDLE`: `assetpersona`
   - `CONTENT_CALENDAR_SHEET_ID`: Google Sheet ID
   - `THREADS_USER_ID`: Threads numeric user ID
   - `LINKEDIN_URN`: `urn:li:person:XXXXXXX`
   - `IG_USER_ID`: Instagram business account ID
   - `FB_PAGE_ID`: Facebook page ID
4. **Workflows imported** from `workflows/` directory
5. **Schedule triggers** activated for Pipeline 1

---

## Credential Requirements

| Credential | n8n Type | Required By |
|------------|----------|------------|
| Google AI API Key | Header Auth | All pipelines |
| Google Sheets OAuth2 | OAuth2 | All pipelines |
| Google Drive OAuth2 | OAuth2 | Pipelines 1, 2, 3 |
| LinkedIn OAuth2 | OAuth2 | Pipeline 4 |
| Meta (Threads + IG) | Header Auth (Bearer) | Pipeline 4 |
| Reddit OAuth | Header Auth (Bearer) | Pipeline 3 |
| Facebook Page Token | Header Auth | Pipeline 4 |

See `config/credential-setup.md` for step-by-step setup instructions.
See `config/api-requirements.md` for rate limits and endpoints.
