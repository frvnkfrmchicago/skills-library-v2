# Content Sources — Provenance & Reality

Board reference for the content hub. What we track, how, and what is honestly NOT
obtainable without a partnership with Morehouse College. Locked by the SAD content
research pass; mirrors `docs/data-contract.md` §8. Updated by Lane C (mcaa-wave-002)
to correct the stale "no RSS exists" finding and document the RSS + auto-approve rule.

## Capability matrix

| Source | Platform | Method | Obtainable without approval? | Verdict |
|---|---|---|---|---|
| events.morehouse.edu | Localist calendar | RSS `https://events.morehouse.edu/calendar/1.xml`, poll 6h | Yes — public feed | BUILD NOW (high confidence) |
| news.morehouse.edu | HubSpot CMS | RSS `https://news.morehouse.edu/rss.xml`, poll 6h | Yes — verified working, keyless | BUILD NOW (high confidence) |
| morehouse.edu | HubSpot CMS | Sitemap diff `https://morehouse.edu/sitemap.xml`, weekly, pattern-filtered | Yes — public sitemap | BUILD NOW — low signal, supplemental |
| Instagram @morehouse1867 | Meta Instagram Graph API | Manual URL capture by admin | NO — requires the college to grant OAuth consent to our app AND Meta App Review (Business Verification) | DEFER — manual capture only |
| LinkedIn morehouse-college | LinkedIn Community Management API | Manual URL capture by admin | NO — requires LinkedIn Marketing API approval AND a college page admin granting OAuth | DEFER — manual capture only |
| morehousealumni.org (national) | WordPress | Manual URL capture by admin | No feed exists (empty archives) | Manual capture only |

## Correction: Morehouse News RSS feed exists and works

The prior research pass checked `news.morehouse.edu/feed` — a WordPress path — and
incorrectly concluded no RSS feed existed. The real, verified, keyless HubSpot RSS
feed lives at `https://news.morehouse.edu/rss.xml`. The `morehouse_news` source row
has been corrected:

- `fetch_method` → `rss_poll`
- `api_url` → `https://news.morehouse.edu/rss.xml`
- `poll_interval_hours` → 6

The `content-sync` Edge Function routes `morehouse_news` through the existing
`syncLocalistRSS` RSS 2.0 parser (the same parser used for Localist events). No HTML
parse, no scraping, no ToS gray area.

## Auto-approve rule

At insert, the function applies the following rule — no model/LLM call, pure
platform + relevance logic:

| platform | chicago_relevance | approval_status at insert |
|---|---|---|
| `morehouse_news` | `general` | `auto_approved` |
| `morehouse_news` | `direct` or `adjacent` | `pending` (board queue) |
| `morehouse_events` | `general` | `auto_approved` |
| `morehouse_events` | `direct` or `adjacent` | `pending` (board queue) |
| all other platforms | any | `pending` (board queue) |

Rationale: Morehouse general news (athletics, rankings, campus milestones) is safe
to surface immediately without board review. Items that mention Chicago / alumni /
career / scholarship — the signals that make them board-queue candidates — are
exactly the items that may warrant a custom intro or featured placement, so the board
keeps final say on those.

## Schedule

Both RSS sources (morehouse_news and morehouse_events) run on pg_cron schedule:

```
0 */6 * * *
```

This fires at 00:00, 06:00, 12:00, 18:00 UTC every day. Invoke via
`supabase functions invoke content-sync` or wire the pg_cron job to call the function
URL with the Supabase service role key. See Supabase docs:
https://supabase.com/docs/guides/functions

The sitemap diff source (`morehouse_web`) runs weekly (`0 0 * * 0`).

## Why Instagram and LinkedIn are deferred

Both accounts are owned and operated by Morehouse College, not the Chicago chapter.
Reading their posts programmatically requires, for each platform: (1) the platform to
approve our app for the relevant API tier, and (2) a Morehouse College page administrator
to grant our app OAuth consent. Neither is a technical task — both are partnership
decisions that sit with the college's communications office. Direct scraping violates
both platforms' terms and is actively blocked. Until a formal relationship exists, the
honest path is admin manual capture, which is a first-class feature of the admin queue.

## Ingestion design (build-now)

- The `content-sync` Edge Function runs one invocation per source.
- Morehouse News RSS: parse `https://news.morehouse.edu/rss.xml` (HubSpot RSS 2.0
  `<item>` nodes) → title, link, description (as summary excerpt), pubDate, image.
  `content_type = 'news'`. schema.org NewsArticle applies to these items.
- Localist RSS (events): parse `https://events.morehouse.edu/calendar/1.xml` (RSS 2.0
  `<item>` nodes) → title, link, description, pubDate, enclosure/media:content for image.
  `content_type = 'event'`.
- Sitemap diff: compare the URL list against last run; queue only net-new URLs matching
  content patterns (news / announcements / scholarship / president / partnership).
- Dedup is read-before-write on `(source_id, url)` and `(source_id, external_id)`;
  nothing is ever deleted.
- Auto-approve rule: see table above.
- Event items whose `source_date` is more than 7 days past are auto-archived.
- `consecutive_failures` increments on each failed fetch; an ALERT fires at >= 2.

## Provenance (three distinct timestamps)

- `source_date` — when the source says it was published / when the event occurs.
- `fetched_at` — when our system first captured the item.
- `published_at` — when a chapter admin approved it for the public hub.

Never collapse these. A Morehouse event from last month approved today shows last month's
`source_date`, not today's.

## Relevance tagging (Chicago lens)

Computed at ingest by a keyword heuristic — no AI/LLM call (in-app inference stays cheap):

- `direct` — Chicago / Illinois / Midwest / chapter / CAMAA / Chicagoland
- `adjacent` — alumni / career / scholarship / giving / networking / mentoring /
  homecoming / fellowship / grant / award / foundation / donation
- `general` — Morehouse news without a local hook (athletics, rankings, campus milestones)
- `not_relevant` — internal student affairs with no alumni angle

## Copyright

Store summaries as excerpts only (500 chars max) with attribution and a link back to the
source. Link `image_url` to the source image; do not copy images into Storage. For any
at-scale aggregation, secure a content agreement with the college first.

## schema.org NewsArticle

News items (`content_type = 'news'`) from `morehouse_news` map to schema.org NewsArticle.
The news and homepage rendering lanes (Lane D / Lane E) should emit JSON-LD with
`@type: NewsArticle`, `headline`, `url`, `datePublished` (= source_date), and
`publisher.name = "Morehouse College"`. Reference: https://schema.org/NewsArticle and
https://developers.google.com/search.
