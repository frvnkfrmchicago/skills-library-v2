# Asset Persona — Workflows

> n8n workflow inventory for the content engine.

---

## Workflow Files

| # | Filename | Trigger | Pipeline | Description |
|---|----------|---------|----------|-------------|
| 1 | `ai-tech-autoposter.json` | Schedule (daily 9AM CT) | Pipeline 1 | Fetches AI/tech RSS → picks best story → generates LinkedIn + Threads posts |
| 2 | `news-router.json` | Manual / Schedule | Pipeline 2 | Fetches industry + creative RSS → categorizes → generates 5-platform posts |
| 3 | `repost-meme-engine.json` | Manual | Pipeline 3 | Fetches Reddit trending → scores → generates reaction posts + meme cards |
| 4 | `content-publisher.json` | Manual | Pipeline 4 | Reads approved rows → routes by platform → posts → marks published |
| 5 | `threads-broadcast.json` | Webhook (from Supabase) | Broadcast | Receives content from Edge Function → posts to Threads (exists in assetpersona) |

---

## File Naming Convention

```
{action}-{target}.json

Examples:
  ai-tech-autoposter.json
  news-router.json
  repost-meme-engine.json
  content-publisher.json
  threads-broadcast.json
```

---

## Trigger Types

| Workflow | Trigger Type | Schedule | Notes |
|----------|-------------|----------|-------|
| AI/Tech Auto-Poster | **Schedule** | Daily 9:00 AM CT | Runs automatically |
| News Router | **Manual** | On demand | Press "Execute Workflow" |
| Repost/Meme Engine | **Manual** | On demand | Press when looking for trending content |
| Content Publisher | **Manual** | On demand | Run after reviewing/approving drafts |
| Threads Broadcast | **Webhook** | Event-driven | Triggered by Supabase Edge Function |

---

## Inter-Workflow Dependencies

```
Pipeline 1 (Auto-Poster)     ──→ Google Sheet ──→ Pipeline 4 (Publisher)
Pipeline 2 (News Router)     ──→ Google Sheet ──→ Pipeline 4 (Publisher)
Pipeline 3 (Repost/Meme)     ──→ Google Sheet ──→ Pipeline 4 (Publisher)
Supabase Edge Function        ──→ Webhook      ──→ Pipeline 5 (Broadcast)
```

All generation pipelines (1-3) write **drafts** to the Content Calendar.
The publisher pipeline (4) reads **approved** rows and posts them.

---

## Build Order

Build workflows in this order (dependencies flow downward):

```
1. Content Publisher (Pipeline 4)        ← build first, test with manual rows
2. AI/Tech Auto-Poster (Pipeline 1)     ← simplest generation pipeline
3. News Router (Pipeline 2)             ← multi-source, multi-platform
4. Repost/Meme Engine (Pipeline 3)      ← Reddit API + scoring
5. Threads Broadcast (Pipeline 5)       ← webhook-triggered, HMAC verification
```

---

## Testing Strategy

For each workflow:

1. **Pin test data** in the first node during development
2. Run once with pinned data → verify each node output
3. Check the Content Calendar for correct row format
4. Verify error branches catch failures
5. Unpin and run with live data
6. Verify rate limiting (Wait nodes in place)
7. Activate schedule trigger (Pipeline 1 only)
