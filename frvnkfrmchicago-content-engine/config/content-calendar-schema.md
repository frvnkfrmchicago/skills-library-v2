# Asset Persona — Content Calendar Schema

> Google Sheet structure for Frank's content engine.

---

## Sheet Setup

**Sheet Name:** Asset Persona Content Calendar
**Tab:** `Content Calendar`
**Sheet ID:** (set in environment variables as `CONTENT_CALENDAR_SHEET_ID`)

---

## Column Definitions

| Col | Header | Type | Values | Example |
|-----|--------|------|--------|---------|
| A | `Date` | Date (YYYY-MM-DD) | Any date | `2026-05-26` |
| B | `Category` | Enum | `AI_TECH`, `PERSONAL_BRAND`, `COMMUNITY`, `CREATIVE`, `INDUSTRY`, `REPOST_MEME` | `AI_TECH` |
| C | `Platform` | Enum | `linkedin`, `threads`, `instagram`, `tiktok`, `facebook` | `linkedin` |
| D | `Headline` | Text | Source headline or topic | `Anthropic drops Claude 4 Sonnet` |
| E | `Caption` | Text | AI-generated post text | `[full post text]` |
| F | `ImageURL` | URL | Google Drive public link | `https://drive.google.com/...` |
| G | `Source` | URL | Original article/post URL | `https://techcrunch.com/...` |
| H | `Status` | Enum | `pending`, `draft`, `approved`, `published`, `archived` | `draft` |
| I | `Agent` | Text | Which pipeline created this | `ai-autoposter` |
| J | `PostURL` | URL | Live post URL (after publishing) | `https://linkedin.com/posts/...` |
| K | `PostType` | Text | 7-day rotation type | `HOT_TAKE` |

---

## Status Flow

```
pending ──→ draft ──→ approved ──→ published
  │                                    │
  └──────── archived ←─────────────────┘
```

| Status | Set By | Meaning |
|--------|--------|---------|
| `pending` | Manual or RSS import | Topic added, needs caption |
| `draft` | AI generation pipeline | Caption ready for review |
| `approved` | Frank (manual review) | Ready to publish |
| `published` | Publisher pipeline | Live on platform |
| `archived` | Frank (manual) | Removed from rotation |

---

## Category Definitions

| Value | Description | Source Pipeline |
|-------|-------------|---------------|
| `AI_TECH` | AI/dev news, tool reviews, engineering insights | Pipeline 1 + 2 |
| `PERSONAL_BRAND` | Consulting wins, portfolio, career milestones | Manual |
| `COMMUNITY` | Morehouse, Chicago culture, social commentary | Manual + Pipeline 2 |
| `CREATIVE` | Music, video, 3D, design showcases | Manual |
| `INDUSTRY` | Tech trends, PM insights, startup ecosystem | Pipeline 2 |
| `REPOST_MEME` | Trending content reactions | Pipeline 3 |

---

## Agent Values

| Value | Pipeline | Description |
|-------|----------|-------------|
| `ai-autoposter` | Pipeline 1 | Daily AI/tech post |
| `news-router` | Pipeline 2 | Multi-source news content |
| `repost-meme` | Pipeline 3 | Reddit trending reactions |
| `manual` | None | Frank created manually |
| `broadcast` | Pipeline 5 | Supabase-triggered broadcast |

---

## Conditional Formatting

| Status | Background | Text |
|--------|-----------|------|
| `pending` | `#F3F4F6` (gray-100) | Normal |
| `draft` | `#FEF3C7` (amber-100) | Normal |
| `approved` | `#DBEAFE` (blue-100) | Normal |
| `published` | `#D1FAE5` (green-100) | Normal |
| `archived` | `#F9FAFB` | Strikethrough |
