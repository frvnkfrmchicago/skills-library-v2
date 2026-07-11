# Content Source Provenance
## Morehouse Chicago Alumni Association — Source Capability Matrix

Board reference. Records every content source, how it is ingested, what is technically
possible without special approval, and what requires a formal relationship with Morehouse
College. Locked by the SAD content research pass; mirrors `docs/data-contract.md` §8 and
`docs/content-sources.md`.

---

## Capability Matrix

| Source | Platform | Ingestion method | Auth required? | Verdict |
|---|---|---|---|---|
| events.morehouse.edu | Localist calendar | RSS poll every 6 hours — `https://events.morehouse.edu/calendar/1.xml` | No | BUILD NOW — high confidence. Public feed. |
| news.morehouse.edu | HubSpot CMS | HTML parse of `/page/1` every 12 hours — no RSS exists (`/feed` returns 404) | No | BUILD NOW — fragile. Alert after 2 consecutive zero-item fetches. |
| morehouse.edu | HubSpot CMS | Sitemap diff `https://morehouse.edu/sitemap.xml`, weekly, pattern-filtered | No | BUILD NOW — low signal, supplemental. |
| Instagram @morehouse1867 | Meta Instagram Graph API | Manual URL capture by admin only | YES — college must grant OAuth | DEFER — manual capture only. |
| LinkedIn morehouse-college | LinkedIn Community Management API | Manual URL capture by admin only | YES — college must grant OAuth | DEFER — manual capture only. |
| morehousealumni.org | WordPress | Manual URL capture by admin only | No feed exists | Manual capture only. |

---

## Source Detail

### events.morehouse.edu — Localist RSS

- **Live URL:** https://events.morehouse.edu/calendar/1.xml
- **Format:** RSS 2.0. Each `<item>` contains title, link, description, and pubDate.
- **Poll schedule:** every 6 hours via the `content-sync` Edge Function.
- **Dedup:** read-before-write on `(source_id, url)`.
- **Auto-archive:** event items whose `source_date` is more than 7 days past are
  auto-archived (status set to `archived`) by the content-sync function.
- **Copyright:** summaries are stored as excerpts only (under 500 characters) with
  a link back to the Morehouse event page.
- **Status:** active in the `content_sources` table from initial provisioning.

---

### news.morehouse.edu — HubSpot HTML parse

- **Live URL:** https://news.morehouse.edu/page/1
- **Format:** HTML article cards (HubSpot CMS). No RSS feed exists — `/feed` returns 404.
- **Poll schedule:** every 12 hours via the `content-sync` Edge Function.
- **Fragility:** HubSpot CMS templates change without notice. The function alerts the
  board after two consecutive fetches returning zero items. This is a likely template
  change, not an absence of news.
- **Recommended action:** the board should request that Morehouse College web communications
  enable the HubSpot RSS feed for `news.morehouse.edu`. HubSpot supports this natively at
  no cost. A working RSS feed replaces the fragile HTML parse entirely.
- **Copyright:** summaries only (under 500 characters), linked to source.
- **Status:** active with fragility alert monitoring.

---

### morehouse.edu — Sitemap diff

- **Live URL:** https://morehouse.edu/sitemap.xml
- **Format:** standard XML sitemap. The function diffs against the previous run and
  queues only net-new URLs matching content patterns:
  news / announcements / scholarship / president / partnership / giving / alumni.
- **Poll schedule:** weekly (every 168 hours).
- **Signal level:** low. Most new URLs are student-facing or internal admin pages.
  This source is supplemental — it catches items that fall outside the news and events
  feeds.
- **Copyright:** summaries only (under 500 characters), linked to source.
- **Status:** active.

---

### Instagram @morehouse1867 — DEFERRED

- **Profile URL:** https://www.instagram.com/morehouse1867
- **Follower count:** approximately 100,000 (as of the SAD research pass).
- **Why deferred:**
  The account is owned and operated by Morehouse College's Office of Communications and
  Marketing — not by the Chicago Alumni chapter. Reading posts programmatically via the
  Meta Instagram Graph API requires two things that are outside the chapter's control:
  1. Meta App Review approval for the Pages API tier (requires Business Verification of
     our developer app).
  2. A Morehouse College Instagram admin granting OAuth consent to the chapter's app.
  Direct scraping is not possible — Meta actively blocks it and it violates Meta Platform
  Terms of Service section 3.2.
- **Current path:** admin manual capture. A board member who monitors Instagram can submit
  the post URL through Admin > Content > Submit URL. The item enters the approval queue
  like any automated item.
- **To activate full integration:**
  The chapter must formalize a relationship with Morehouse College communications and
  obtain both the Meta App Review and the college admin OAuth grant. This is a partnership
  decision, not a technical one. Contact: Morehouse College Office of Communications and
  Marketing.
- **Status:** `active = false` in `content_sources`. Row exists to document the intent
  and the auth requirements.

---

### LinkedIn morehouse-college — DEFERRED

- **Profile URL:** https://www.linkedin.com/school/morehouse-college
- **Why deferred:**
  The page is managed by Morehouse College. Programmatic access requires:
  1. LinkedIn Marketing Developer Platform (MDP) approval for the Community Management API
     (LinkedIn no longer offers unapproved scraping or legacy API access).
  2. A Morehouse College LinkedIn Page administrator granting OAuth consent to the
     chapter's app.
  Direct scraping violates LinkedIn Terms of Service sections 8.2 and 2, and LinkedIn
  actively rate-limits and blocks unauthorized crawlers.
- **Current path:** admin manual capture. The same Submit URL workflow applies.
- **To activate full integration:**
  Same partnership path as Instagram — formal relationship with Morehouse College
  communications and OAuth grant from a college page admin.
- **Status:** `active = false` in `content_sources`. Row exists for documentation.

---

### morehousealumni.org — National Alumni Association

- **URL:** https://morehousealumni.org
- **CMS:** WordPress (confirmed via page source).
- **Why no feed:** the WordPress `/feed` and `/rss` endpoints return empty archives.
  No sitemap with content URLs exists. The site is primarily a directory and
  event-registration portal, not a news publishing platform.
- **Current path:** manual capture only. Board members monitoring national announcements
  should submit URLs through Admin > Content > Submit URL.
- **Status:** active in `content_sources` with `fetch_method = 'manual_entry'`.

---

## Three-Timestamp Provenance Standard

Every content item in the platform carries three distinct timestamps. Never collapse them.

| Timestamp | Meaning |
|---|---|
| `source_date` | When the source says the content was published, or when the event occurs. |
| `fetched_at` | When the chapter's content-sync function first captured the item. |
| `published_at` | When a chapter admin approved it for the public content hub. |

A Morehouse news article from last month that was approved today shows last month's
`source_date`. A board member approving a Localist event for an event next month sees
the event's actual date, not today's approval date.

---

## Chicago Relevance Tagging

All content items receive a relevance tag computed at ingest time by a keyword heuristic.
No LLM or AI call is used — in-app inference must remain cheap (Gemma 4 / DeepSeek class).

| Tag | Criteria |
|---|---|
| `direct` | Content mentions Chicago, Illinois, Midwest, or the chapter specifically. |
| `adjacent` | Content covers alumni, career, scholarship, giving, networking, mentoring, homecoming — relevant to the membership even without a local hook. |
| `general` | Morehouse news without a local hook (athletics, rankings, campus events). Shown on the hub but lower priority. |
| `not_relevant` | Internal student affairs with no alumni angle. Rejected from the queue automatically or by admin. |

---

## Partnership Ask

The single highest-value relationship action for this platform's content quality is to ask
Morehouse College web communications to:

1. Enable the HubSpot RSS feed for `news.morehouse.edu`. This is a built-in HubSpot feature
   that costs the college nothing and converts the fragile HTML parse into a reliable feed.
2. Consider granting the Chicago chapter social-content access once the Meta App Review and
   LinkedIn MDP approval processes are complete.

Contact point: Morehouse College, Office of Communications and Marketing.
Reference: https://morehouse.edu (contact details on the college website).

---

## Copyright and Attribution Policy

- Summaries are stored as excerpts only — under 500 characters per item.
- Every item carries attribution (source name) and a direct link back to the original URL.
- Images are linked to the source image URL; they are never copied into Supabase Storage.
- For any at-scale aggregation beyond these bounds, the board should secure a content
  agreement with Morehouse College first.
- The deferred social platforms (Instagram, LinkedIn) carry additional terms: any access
  granted by the college must be used within the platform's approved use case and must not
  republish full posts without the college's permission.
