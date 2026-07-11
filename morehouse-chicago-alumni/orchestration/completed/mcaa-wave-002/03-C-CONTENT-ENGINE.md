# Lane C — Content Engine & Routing Data
Status: COMPLETED · Wave: mcaa-wave-002 · Batch: 1 · Owner: foundation agent

## Explainer

Corrected the morehouse_news pipeline so real Morehouse news flows in for free via the
verified HubSpot RSS feed at news.morehouse.edu/rss.xml. Added auto-approve logic so
general-relevance news and events land live immediately; direct/adjacent items hold in
the board queue for curated placement. Updated seed data and board reference docs.

## TL;DR

- morehouse_news now uses fetch_method='rss_poll', api_url='https://news.morehouse.edu/rss.xml'.
- Auto-approve: platform morehouse_news or morehouse_events + chicago_relevance='general'
  sets approval_status='auto_approved' at insert. relevance 'direct'/'adjacent' stays 'pending'.
- Existing RSS parser (syncLocalistRSS) handles both news and events; content_type inferred
  from source.platform ('news' for morehouse_news, 'event' for morehouse_events).
- Dedup, three provenance timestamps, auto-archive, failure counter: all intact.
- Relevance: keyword heuristic only — no LLM/model call anywhere.
- Morehouse events Localist source remains wired (fills when they post).

## Work completed

| Task | Status | Detail |
|---|---|---|
| morehouse_news → rss_poll + rss.xml URL | Done | seed row corrected; html_parse path no longer used for this source |
| Route morehouse_news through syncLocalistRSS | Done | fetch_method='rss_poll' routes automatically to existing parser |
| content_type inferred from platform | Done | 'news' for morehouse_news, 'event' for morehouse_events |
| resolveApprovalStatus() function added | Done | pure platform+relevance logic, no model call |
| Auto-approve general items at insert | Done | morehouse_news + morehouse_events, general relevance only |
| direct/adjacent stay pending | Done | board queue preserved for featured/suppressed items |
| Dedup intact | Done | read-before-write on (source_id, url) and (source_id, external_id) |
| Three provenance timestamps intact | Done | source_date, fetched_at, published_at — not collapsed |
| Auto-archive expired events intact | Done | source_date > 7 days past → archived |
| consecutive_failures + alert intact | Done | alert fires at >= 2 consecutive failures |
| seed data corrected | Done | morehouse_news row: rss_poll, rss.xml, poll_interval_hours=6 |
| docs/content-sources.md corrected | Done | stale "no RSS" claim removed; RSS + auto-approve + cron documented |
| schema.org NewsArticle note added | Done | docs + function header reference https://schema.org/NewsArticle |
| File ownership boundary respected | Done | only supabase/functions/content-sync/index.ts, data/seed/content_sources.json, docs/content-sources.md |

## Files changed

| File | Change |
|---|---|
| `supabase/functions/content-sync/index.ts` | Added resolveApprovalStatus(); updated syncLocalistRSS to infer content_type from platform and call resolveApprovalStatus; updated router comment; updated file header with correct source URLs and skills/librarians |
| `data/seed/content_sources.json` | morehouse_news row: source_name, api_url, fetch_method, poll_interval_hours, auth_notes, verdict all corrected; morehouse_events verdict note updated; _meta updated with auto-approve + cron note |
| `docs/content-sources.md` | Full rewrite: correction section added, auto-approve rule table, cron expression, schema.org note, capability matrix corrected |

## Key code: resolveApprovalStatus

```typescript
function resolveApprovalStatus(
  platform: ContentPlatform,
  relevance: ChicagoRelevance
): ApprovalStatus {
  if (
    (platform === "morehouse_news" || platform === "morehouse_events") &&
    relevance === "general"
  ) {
    return "auto_approved";
  }
  return "pending";
}
```

Called at insert inside syncLocalistRSS. No model call. Pure logic.

## pg_cron schedule

```
0 */6 * * *
```

Fires at 00:00, 06:00, 12:00, 18:00 UTC. Apply to both morehouse_news and morehouse_events.
sitemap_diff (morehouse_web) runs weekly: `0 0 * * 0`.

## Hard gate status

| Gate | Status | Note |
|---|---|---|
| G1 No Stripe remnants | Pass | grep returns zero hits in owned files |
| G2 No secrets | Pass | SUPABASE_SERVICE_ROLE_KEY read from Deno.env only; zero in client-facing code |
| G3 Payments | N/A | Lane C owns no payment code |
| G4 File ownership | Pass | only three owned files modified; no nav/shell/html/js/css touched |
| G5 Accessibility | N/A | Lane C owns no UI code |
| G6 Routing | N/A | Lane C owns no page routing code |
| G7 No emojis / no time-language / no A/B/C menus | Pass | none present in output |
| G8 Citations | Pass | see Citations section below |

## Remaining gaps

None for this lane. The HTML parse path (syncNewsHTML) is retained in the file for
completeness but is no longer used by morehouse_news — it can be pruned in a future
cleanup pass if desired (out of scope for Lane C).

## Citations

### Skills used
- `api-integrating` — RSS fetch, HTTP response handling, URL construction
- `research-conducting` — verified the real HubSpot RSS path (rss.xml not /feed)
- `n8n-automating` — scheduling pattern and polling interval design
- `search-building` — keyword heuristic for chicago_relevance scoring

### Librarians used
- `research-librarian` — source verification, dossier Dimension 5 findings
- `n8n-librarian` — pg_cron expression and poll interval design
- `connector-librarian` — RSS connector and dedup read-before-write pattern
- `search-librarian` — relevance keyword classification design

### 2026 URLs used
- https://news.morehouse.edu/rss.xml — verified working HubSpot RSS, keyless, public
- https://events.morehouse.edu/calendar/1.xml — Localist RSS (wired, currently empty)
- https://supabase.com/docs/guides/functions — Edge Function deployment reference
- https://schema.org/NewsArticle — content_type 'news' schema mapping
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS — server-side fetch rationale
- https://developers.google.com/search — JSON-LD NewsArticle SEO note
