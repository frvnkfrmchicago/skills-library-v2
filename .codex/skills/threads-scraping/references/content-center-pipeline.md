# Content Center Pipeline — Threads Scraper → GrazzHopper Hub

## Architecture

```
┌─────────────────────┐
│  Threads Scraper    │  CDP scraper, Playwright scraper, or Userscript
│  (any source)       │
└────────┬────────────┘
         │ POST /functions/v1/threads-scrape-ingest?action=ingest
         │ Body: { keyword, captured_by, results: [{author,text,permalink}] }
         │ Headers: apikey, Authorization Bearer, x-ingest-key
         ▼
┌─────────────────────┐
│ threads-scrape-ingest│  Supabase Edge Function
│ (edge function)     │  Validates ingest key, writes rows
└────────┬────────────┘
         │ INSERT INTO gh_threads_scraped
         ▼
┌─────────────────────┐
│ gh_threads_scraped  │  Supabase Table
│ (Supabase table)    │  Columns: author, text, permalink, keyword,
│                     │  captured_by, created_at, engagement metrics
└────────┬────────────┘
         │ GET /functions/v1/convo-ingest?action=feed&topic=cannabis
         ▼
┌─────────────────────┐
│ convo-ingest        │  Supabase Edge Function
│ (edge function)     │  Reads gh_threads_scraped, serves as unified feed API
│                     │  Actions: feed, keywords, pull
└────────┬────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Discover│ │  Feed  │
│ & Reply │ │  Intel │
│ (tab)   │ │ (tab)  │
└────────┘ └────────┘
cc-conversations.js  cc-feed-intel.js
```

## GrazzHopper Content Center Tabs

| Tab | Source File | Data Source | Features |
|-----|-------------|-------------|----------|
| Discover & Reply | `src/cc-conversations.js` | `convo-ingest` | Keyword search, "Turn into post" via MiniMax voice engine, compliance check |
| Feed Intel | `src/cc-feed-intel.js` | `convo-ingest` | Vertical chips (Cannabis, Tech, Music, etc), sort by Newest/Most Engaged/Opportunity |
| Voice & Types | `src/cc-voice.js` | Local state | Content type picker, voice compliance checker |
| Schedule | `src/cc-schedule.js` | Supabase `gh_content_queue` | Queue drafts for timed publishing |

## Hub Location

`/Users/franklawrencejr./Documents/Automation Centre/grazzhopper-content-hub/`

Key files:
- `gh-content-hub.html` — Main hub page (open via `file://` URL)
- `gh-hub.js` — Core hub logic (2561 lines), post management, AI generation, canvas
- `grazzhopper-threads-capture.user.js` — Tampermonkey userscript for manual capture

## Userscript Capture Flow

The userscript (`grazzhopper-threads-capture.user.js`) adds a "Capture to Hub" button
to Threads pages. When clicked:
1. Extracts posts from DOM using `a[href*="/post/"]` anchor pattern
2. Derives author + permalink from the URL (stable even with obfuscated CSS)
3. Reads post text from the nearest container ancestor
4. POSTs batch to `threads-scrape-ingest` with the ingest key

## Diagnosis Checklist

When Content Center shows empty:

1. **Check convo-ingest directly** — `GET convo-ingest?action=feed&topic=cannabis&limit=5`
   - Returns `{ ok: true, items: [] }` = table empty, need to scrape
   - Returns error = edge function misconfigured
2. **Check scraper output** — Did the scraper write to local cache only?
   - `~/.hermes/threads/cache/<account>_feed.json` is LOCAL, not Supabase
   - Scraper must POST to `threads-scrape-ingest` to feed the hub
3. **Check table directly** — Query `gh_threads_scraped` in Supabase dashboard
4. **Check edge function logs** — Supabase → Edge Functions → threads-scrape-ingest → Logs

## Supabase Project

- Project URL: `https://aklndweljnjvrdfjsnkn.supabase.co`
- Anon key: Public (safe client-side, RLS provides security)
- Edge functions: `threads-scrape-ingest`, `convo-ingest`, `threads-engage`, `minimax-generate`
