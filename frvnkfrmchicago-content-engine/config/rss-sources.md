# RSS and API Sources

Feed sources for the Asset Persona content engine, organized by category. Used by n8n workflows to fetch and categorize content.

---

## Category Reference (11 valid categories)

`ai_ml` | `dev_tools` | `career` | `culture` | `creative` | `industry` | `ai_education` | `ai_finance` | `ai_health` | `ai_public_health` | `ai_dentistry`

---

## AI_ML Sources (`ai_ml`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| TechCrunch AI | RSS | `https://techcrunch.com/category/artificial-intelligence/feed/` | ai_ml | Multiple daily posts on AI industry |
| VentureBeat AI | RSS | `https://venturebeat.com/category/ai/feed/` | ai_ml | Enterprise AI focus |
| MIT Technology Review | RSS | `https://www.technologyreview.com/feed/` | ai_ml | Deep analysis, research |
| Ars Technica AI | RSS | `https://feeds.arstechnica.com/arstechnica/technology-lab` | ai_ml | Broad tech, filter for AI |
| Google News AI | RSS | `https://news.google.com/rss/search?q=artificial+intelligence+OR+machine+learning+OR+LLM&hl=en-US&gl=US&ceid=US:en` | ai_ml | Continuous, broad coverage |
| HackerNews Top Stories | API | `https://hacker-news.firebaseio.com/v0/topstories.json` | ai_ml | Filter for AI keywords: ai, gpt, llm, machine learning, openai, anthropic, claude, llama, transformer, neural, diffusion, rag, agentic |

## DEV_TOOLS Sources (`dev_tools`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| Dev.to AI Tag | API | `https://dev.to/api/articles?tag=ai&top=1&per_page=10` | dev_tools | Developer-written AI tutorials |
| Dev.to Productivity Tag | API | `https://dev.to/api/articles?tag=productivity&top=1&per_page=5` | dev_tools | Dev workflow and tooling |
| GitHub Blog | RSS | `https://github.blog/feed/` | dev_tools | Product updates, engineering |
| Changelog | RSS | `https://changelog.com/feed` | dev_tools | OSS and dev ecosystem |
| InfoQ | RSS | `https://feed.infoq.com/` | dev_tools | Architecture and practices |

## CAREER Sources (`career`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| Google News Tech Careers | RSS | `https://news.google.com/rss/search?q=software+engineer+hiring+OR+tech+layoffs+OR+developer+salary&hl=en-US` | career | Continuous hiring/layoff news |
| Google News HBCU Tech | RSS | `https://news.google.com/rss/search?q=HBCU+technology+OR+Morehouse+engineering+OR+Black+engineers&hl=en-US` | career | HBCU and Black tech pipeline |

## CULTURE Sources (`culture`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| Reddit r/programming | API (OAuth) | `https://oauth.reddit.com/r/programming/top?t=week&limit=25` | culture | Weekly batch, score threshold 50+ |
| Reddit r/experienceddevs | API (OAuth) | `https://oauth.reddit.com/r/ExperiencedDevs/top?t=week&limit=25` | culture | Weekly batch, senior dev culture |
| Threads Search | API (Graph) | Keyword search "AI developer" or "software engineering", TOP, limit 25 | culture | On-demand, TOP ranking only |

## CREATIVE Sources (`creative`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| Creative Bloq | RSS | `https://www.creativebloq.com/feed` | creative | Design and creative tech |
| Codrops | RSS | `https://tympanus.net/codrops/feed/` | creative | Front-end creative coding |
| Three.js Discourse | RSS | `https://discourse.threejs.org/latest.rss` | creative | 3D web and WebGL |

## INDUSTRY Sources (`industry`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| Google News AI Business | RSS | `https://news.google.com/rss/search?q=AI+startup+funding+OR+AI+acquisition+OR+tech+IPO&hl=en-US` | industry | Continuous business coverage |
| Product Hunt | API | `https://api.producthunt.com/v2/api/graphql` (requires auth) | industry | Daily product launches |

## AI_EDUCATION Sources (`ai_education`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| Google News AI Education | RSS | `https://news.google.com/rss/search?q=artificial+intelligence+education+OR+ai+tutoring+OR+edtech+ai&hl=en-US&gl=US&ceid=US:en` | ai_education | Continuous, AI in classrooms and edtech |
| EdSurge | RSS | `https://www.edsurge.com/rss` | ai_education | Edtech industry coverage |
| Google News AI Literacy | RSS | `https://news.google.com/rss/search?q=AI+literacy+OR+teaching+AI+OR+AI+curriculum&hl=en-US&gl=US&ceid=US:en` | ai_education | AI curriculum and pedagogy |

## AI_FINANCE Sources (`ai_finance`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| Google News AI Finance | RSS | `https://news.google.com/rss/search?q=ai+finance+OR+fraud+detection+OR+algorithmic+trading&hl=en-US&gl=US&ceid=US:en` | ai_finance | Continuous, fintech AI |
| Google News AI Insurance | RSS | `https://news.google.com/rss/search?q=AI+insurance+OR+insurtech+OR+risk+AI&hl=en-US&gl=US&ceid=US:en` | ai_finance | AI in insurance and risk |

## AI_HEALTH Sources (`ai_health`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| Google News AI Health | RSS | `https://news.google.com/rss/search?q=ai+healthcare+OR+medical+imaging+ai+OR+drug+discovery+ai&hl=en-US&gl=US&ceid=US:en` | ai_health | Continuous, clinical AI |
| Google News AI Diagnostics | RSS | `https://news.google.com/rss/search?q=AI+diagnostics+OR+AI+clinical+trials+OR+precision+medicine+AI&hl=en-US&gl=US&ceid=US:en` | ai_health | Diagnostics and precision medicine |

## AI_PUBLIC_HEALTH Sources (`ai_public_health`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| Google News AI Public Health | RSS | `https://news.google.com/rss/search?q=ai+public+health+OR+epidemiology+ai+OR+disease+surveillance+ai&hl=en-US&gl=US&ceid=US:en` | ai_public_health | Continuous, population health AI |
| Google News AI Health Equity | RSS | `https://news.google.com/rss/search?q=AI+health+equity+OR+AI+social+determinants+health+OR+AI+community+health&hl=en-US&gl=US&ceid=US:en` | ai_public_health | Health equity and community |

## AI_DENTISTRY Sources (`ai_dentistry`)

| Source | Type | URL | category_hint | Notes |
|--------|------|-----|---------------|-------|
| Google News AI Dentistry | RSS | `https://news.google.com/rss/search?q=ai+dentistry+OR+dental+imaging+ai+OR+caries+detection+ai&hl=en-US&gl=US&ceid=US:en` | ai_dentistry | Continuous, dental AI |
| Google News AI Oral Health | RSS | `https://news.google.com/rss/search?q=AI+oral+health+OR+digital+dentistry+OR+orthodontic+AI&hl=en-US&gl=US&ceid=US:en` | ai_dentistry | Oral health and digital dentistry |

---

## API Authentication Requirements

| Source | Auth Type | Credential |
|--------|-----------|-----------|
| HackerNews | None | Public API |
| Dev.to | API Key (optional) | Header: api-key |
| Reddit | OAuth2 | Client ID + Secret + Refresh Token |
| Threads | Graph API Token | Long-lived access token |
| Product Hunt | OAuth2 | Client credentials |
| All RSS feeds | None | Public feeds |
| News API (configurable) | API Key | NEWS_API_KEY env var |

---

## Filtering Rules

When fetching from broad sources (HackerNews, Google News), filter by relevance:

1. HackerNews: Only include items where title contains AI-related keywords (see list above)
2. Google News: Query already scoped by search terms
3. Reddit: Score threshold of 50+ upvotes to filter noise
4. Threads: TOP ranking only, no RECENT

## Deduplication

Before writing to the content calendar, check for duplicate headlines using fuzzy matching (Levenshtein distance < 10 or cosine similarity > 0.85). Skip duplicates.
