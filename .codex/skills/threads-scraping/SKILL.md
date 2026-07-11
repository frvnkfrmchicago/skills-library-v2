---
name: threads-scraping
description: >
  Scrapes Meta Threads For You feeds via Playwright with cookie-based auth,
  intercepting internal API responses for structured post data including
  @usernames, engagement metrics (likes, replies, reposts, quotes, shares),
  timestamps, and direct links. Supports multi-account sessions, topic
  verticals (keyword groups like cannabis, tech, ai), and replication
  for new accounts. Use when scraping Threads feeds, monitoring engagement,
  managing Threads sessions, pulling posts by topic, or when user mentions
  Threads, feed scraping, engagement, or social listening.
---

# Threads Scraping

Scrape Meta Threads For You feeds with full engagement data. Every scrape
must produce @usernames, engagement metrics, timestamps, and direct links.

---

## Why Feed Scraping (Not Search or API)

| Approach | Problem |
|----------|---------|
| **Threads Graph API** | `keyword_search` only returns YOUR OWN posts in Testing mode |
| **Keyword Search (web)** | Blocked by "Age inappropriate" filter — account-level, cannot bypass |
| **For You Feed** | ✅ Algorithm serves relevant content, API responses have full structured data |

**The method**: Navigate to `threads.net/`, scroll the For You feed, intercept the
JSON API responses the web app makes, parse post objects recursively.

---

## Browser Tools vs Playwright Scraper

When a Threads feed is already open in the shared browser, `browser_snapshot` / `browser_scroll` can inspect and scroll the visible page. Treat that as **preview/manual inspection only**.

For the official scraper output, still use the Playwright pipeline because it intercepts internal JSON responses and can reliably extract the full required data shape: `@username`, all engagement metrics, timestamps, direct links, deduplication, and recency sorting.

**Pitfall:** Do not claim a browser snapshot is equivalent to a scraper run. If Playwright is unavailable, either:
1. install/fix Playwright and run the real scraper, or
2. clearly label the result as a manual visible-page scrape that does not satisfy the STOP GATE.

**Setup probe before running:**

```bash
python3 -c "import playwright; print('playwright ok')" || python3 -m pip install playwright
python3 -m playwright install chromium
```

---

## Frank's Mac Workflow Rules

When Frank asks for a Threads vertical scrape on this Mac, use the established local tooling first:

```bash
/Users/franklawrencejr./hermes-agents/scripts/run_threads_scrape.sh --account <ACCOUNT> --vertical <VERTICAL> --scrolls 6
```

- Do **not** use bare `python3` for the standard scrape path.
- Accounts Frank uses: `frvnkfrmchicago`, `grazzhopper`, `profile1`.
- Sessions live at `~/.hermes/threads/sessions/`.
- Verticals live at `~/.hermes/threads/verticals/<vertical>.json`.
- Local overrides auto-merge from `~/.hermes/threads/verticals/<vertical>.local.json`, especially `extra_keywords`.
- Cache output is `~/.hermes/threads/cache/<account>_feed.json`.
- One-run filters use repeated `--keyword "phrase"` flags.

If Frank says the browser is already open, or gets frustrated that a scrape is not using the visible shared Chrome, attach to the existing Chrome on CDP `9222` instead of launching a separate browser. See `references/visible-chrome-cdp-scrape.md`.

After scrape or latest cache read, produce the engagement package Frank expects:

1. Table: `@user | snippet | likes | replies | reposts | quotes | link` — separate columns for each metric, no "fit" column.
2. Sort by engagement (likes descending) as default.
3. Pick 5-10 posts worth engaging.
4. Give 3 short, human reply drafts per post in Frank's voice.
5. Say which account to post from if it matters.
6. When feed language is reusable, suggest `extra_keywords` for `<vertical>.local.json`; avoid one-off proper nouns unless Frank says to track the name.

---

## Scraping Process

### Step 1: Load Session

```python
cookies = load_cookies(account_name)  # From ~/.hermes/threads/sessions/
context.add_cookies(cookies)
```

### Step 2: Intercept API Responses

```python
api_data = []

def on_resp(response):
    try:
        ct = response.headers.get('content-type', '')
        if 'json' in ct:
            body = response.json()
            raw = json.dumps(body)
            if 'like_count' in raw and 'username' in raw:
                api_data.append(body)
    except:
        pass

page.on('response', on_resp)
```

### Step 3: Navigate and Scroll

```python
page.goto('https://www.threads.net/', wait_until='networkidle', timeout=30000)
page.wait_for_timeout(5000)

for _ in range(scroll_count):  # 4-5 scrolls = 30+ posts
    page.evaluate('window.scrollBy(0, 1500)')
    page.wait_for_timeout(2500)
```

### Step 4: Parse Post Objects

The API responses have nested post objects. Use recursive search:

```python
def find_posts(obj, depth=0):
    if depth > 10 or not obj:
        return
    if isinstance(obj, dict):
        if 'like_count' in obj and isinstance(obj.get('user'), dict):
            # Extract: username, text, likes, replies, reposts,
            #          quotes, shares, taken_at, code
            ...
        for v in obj.values():
            find_posts(v, depth + 1)
    elif isinstance(obj, list):
        for item in obj:
            find_posts(item, depth + 1)
```

### Step 5: Deduplicate and Sort

```python
# Deduplicate by username + post code
seen = set()
key = username + code
if key not in seen:
    seen.add(key)
    posts.append(post)

# Sort newest first
posts.sort(key=lambda x: x['taken_at'], reverse=True)
```

---

## Authenticated Thread URL Navigation

To scrape a specific thread or discussion link (e.g., comments on a Grazzhopper post) while avoiding age-restriction blocks or sensitive content filters (common with cannabis content), navigate directly to the thread URL **after loading session cookies**. This lets the browser view age-gated threads under the signed-in profile.

```python
def scrape_thread_url(account, thread_url, scroll_count=5):
    """
    Scrapes a specific Threads post/thread URL authenticated via account session.
    """
    cookies = load_cookies(account)
    api_data = []

    def on_resp(response):
        try:
            ct = response.headers.get('content-type', '')
            if 'json' in ct:
                body = response.json()
                raw = json.dumps(body)
                if 'reply' in raw or 'username' in raw or 'caption' in raw:
                    api_data.append(body)
        except:
            pass

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(user_agent=USER_AGENT)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.on('response', on_resp)
        page.goto(thread_url, wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(3000)
        for _ in range(scroll_count):
            page.evaluate('window.scrollBy(0, 1000)')
            page.wait_for_timeout(1500)

        seen = set()
        replies = []

        def find_replies(obj, depth=0):
            if depth > 10 or not obj:
                return
            if isinstance(obj, dict):
                if 'like_count' in obj and isinstance(obj.get('user'), dict):
                    u = obj['user']
                    cap = obj.get('caption')
                    txt = cap.get('text', '')[:200] if isinstance(cap, dict) else ''
                    if not txt:
                        txt = obj.get('text', '')[:200]
                    un = u.get('username', '?')
                    info = obj.get('text_post_app_info') or {}
                    code = obj.get('code', '')
                    key = un + (code or txt[:20])
                    if txt and un != '?' and key not in seen:
                        seen.add(key)
                        replies.append({
                            'username': un,
                            'text': txt,
                            'likes': obj.get('like_count', 0),
                            'replies': info.get('direct_reply_count', 0),
                            'reposts': info.get('repost_count', 0),
                            'quotes': info.get('quote_count', 0),
                            'shares': info.get('share_count', 0),
                            'taken_at': obj.get('taken_at', 0),
                            'time_ago': time_ago(obj.get('taken_at', 0)),
                            'code': code,
                            'link': f'https://www.threads.net/@{un}/post/{code}' if code else ''
                        })
                for v in obj.values():
                    find_replies(v, depth + 1)
            elif isinstance(obj, list):
                for item in obj:
                    find_replies(item, depth + 1)

        for body in api_data:
            find_replies(body)

        ctx.close()
        browser.close()

    replies.sort(key=lambda x: x['taken_at'], reverse=True)
    return replies
```

---

## Authenticated Search & Recency Filtering

To find newly relevant content on specific keywords (e.g., searching "cannabis" on Threads) and avoid stale or old posts, use the authenticated search pipeline. 

### Implementation Details:
1. **Navigate to Search URL**: Navigate to `https://www.threads.net/search?q={query}` under the loaded account session.
2. **Age Filtering**: Retrieve the `taken_at` timestamp of each post and filter out any posts older than a configurable number of days (e.g., 7 days or 24 hours).
3. **Intercept & Sort**: Intercept search JSON payloads and sort by recency to prioritize the newest relevant posts.

```python
def scrape_search(account, query, scroll_count=3, max_age_days=7):
    """
    Searches for a keyword on Threads using a logged-in account session,
    filtering out old posts using the taken_at timestamp.
    """
    cookies = load_cookies(account)
    api_data = []

    def on_resp(response):
        try:
            ct = response.headers.get('content-type', '')
            if 'json' in ct:
                body = response.json()
                raw = json.dumps(body)
                if 'like_count' in raw and 'username' in raw:
                    api_data.append(body)
        except:
            pass

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(user_agent=USER_AGENT)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.on('response', on_resp)
        
        search_url = f'https://www.threads.net/search?q={query}'
        page.goto(search_url, wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(4000)
        
        for _ in range(scroll_count):
            page.evaluate('window.scrollBy(0, 1500)')
            page.wait_for_timeout(2500)

        seen = set()
        posts = []
        max_age_seconds = max_age_days * 86400
        current_time = _time.time()

        def find_posts(obj, depth=0):
            if depth > 10 or not obj: return
            if isinstance(obj, dict):
                if 'like_count' in obj and isinstance(obj.get('user'), dict):
                    u = obj['user']
                    cap = obj.get('caption')
                    txt = cap.get('text', '')[:200] if isinstance(cap, dict) else ''
                    un = u.get('username', '?')
                    info = obj.get('text_post_app_info') or {}
                    code = obj.get('code', '')
                    taken_at = obj.get('taken_at', 0)
                    
                    # Only accept posts newer than the max_age threshold
                    is_new = (current_time - taken_at) <= max_age_seconds if taken_at else False
                    
                    key = un + code
                    if txt and un != '?' and key not in seen and is_new:
                        seen.add(key)
                        posts.append({
                            'username': un,
                            'text': txt,
                            'likes': obj.get('like_count', 0),
                            'replies': info.get('direct_reply_count', 0),
                            'reposts': info.get('repost_count', 0),
                            'quotes': info.get('quote_count', 0),
                            'shares': info.get('share_count', 0),
                            'taken_at': taken_at,
                            'time_ago': time_ago(taken_at),
                            'code': code,
                            'link': f'https://www.threads.net/@{un}/post/{code}' if code else ''
                        })
                for v in obj.values():
                    find_posts(v, depth + 1)
            elif isinstance(obj, list):
                for item in obj:
                    find_posts(item, depth + 1)

        for body in api_data:
            find_posts(body)

        ctx.close()
        browser.close()

    posts.sort(key=lambda x: x['taken_at'], reverse=True)
    return posts
```

---


## Post Data Shape

Every post MUST include ALL of these fields:

| Field | API Path | Example |
|-------|----------|---------|
| `username` | `post.user.username` | `devinmeetworld` |
| `text` | `post.caption.text` | "If she's fine af and smokes weed..." |
| `likes` | `post.like_count` | 3297 |
| `replies` | `post.text_post_app_info.direct_reply_count` | 93 |
| `reposts` | `post.text_post_app_info.repost_count` | 385 |
| `quotes` | `post.text_post_app_info.quote_count` | 49 |
| `shares` | `post.text_post_app_info.share_count` | 0 |
| `taken_at` | `post.taken_at` (Unix epoch) | 1748565600 |
| `time_ago` | Computed from `taken_at` | "5h ago" |
| `code` | `post.code` | `DY7dipuFYGH` |
| `link` | Constructed | `threads.net/@devinmeetworld/post/DY7dipuFYGH` |

---

## Topic Verticals

A **vertical** is a keyword group that filters feed results by topic.

### Creating a Vertical

```json
// ~/.hermes/threads/verticals/cannabis.json — see live file for full keyword list
{
  "name": "cannabis",
  "match_mode": "any",
  "match_fields": ["text", "username"],
  "keywords": [
    "smoke", "smoking", "dispensary", "joint", "one hitter", "live resin",
    "infused", "stoner", "stoney", "flower", "natures flower", "puff", "puffs",
    "weed", "cannabis", "thc", "cbd", "blunt", "dab", "vape", "edibles",
    "🍃", "💨", "🌿", "🔥"
  ]
}
// Feed-native language matters: posts may say "smoke here" or "smoking on that"
// without the word cannabis — match_fields username + text, not literal "cannabis" only.
```

### Matching Logic

```python
def matches_vertical(post_text, vertical):
    if not vertical:
        return True  # No filter = show all
    text_lower = post_text.lower()
    return any(kw.lower() in text_lower for kw in vertical['keywords'])
```

### Built-in Verticals

| Vertical | Sample Keywords |
|----------|----------------|
| cannabis | smoke, smoking, dispensary, joint, one hitter, live resin, infused, stoner, flower, puff, weed, thc, emoji |
| tech | AI, code, startup, SaaS, dev, programming, API |
| ai | artificial intelligence, machine learning, chatgpt, llm, prompt engineering |

---

## Multi-Account Session Management

### Directory Structure

```
~/.hermes/threads/
├── sessions/
│   ├── grazzhopper.json
│   ├── frvnkfrmchicago.json
│   └── [account].json
├── verticals/
│   ├── cannabis.json
│   └── [topic].json
└── cache/
    └── [account]_feed.json
```

### Cookie Sync (One-Time Per Account)

#### Method A: Direct Chrome Database Extraction (Recommended - Avoids Login Loops)
This method extracts cookies directly from your existing local Chrome installation, requests the Safe Storage key from the macOS Keychain to decrypt them, duplicates them from `threads.com` to `threads.net` for robustness, and saves them.

1. **Log into Threads** in your normal Chrome browser on Mac using the target profile (e.g., Profile 4 for `grazzhopper`). Ensure you are signed in and can see your home feed.
2. **Run the extraction script** in the workspace directory:
   ```bash
   python3 hermes-setup/scripts/local_extract_cookies.py "<ProfileFolder>" <account_name>
   ```
   *Example:*
   ```bash
   python3 hermes-setup/scripts/local_extract_cookies.py "Profile 4" grazzhopper
   ```
   *Note: If prompted by macOS, allow Keychain access to "Chrome Safe Storage".*
3. **Copy to local Hermes directory** (if running locally):
   ```bash
   cp "threads_cookies_<account_name>_fresh.json" ~/.hermes/threads/sessions/<account_name>.json
   ```
4. **Deploy to Hermes VM** (if running remotely):
   ```bash
   scp ~/.hermes/threads/sessions/<account_name>.json user@vm:~/.hermes/threads/sessions/
   ```
5. **Test the session**:
   ```bash
   python3 hermes-setup/scripts/threads_scrape.py --account <account_name> --scrolls 1
   ```

#### Method B: Chrome Debug Port (CDP)
Use this if you need to authenticate a new profile or don't have it saved in your main Chrome.

**Agent Browser Rules (mandatory):**

| Rule | Value |
|------|-------|
| Profile | `~/.gemini/antigravity-browser-profile` |
| Port | `9222`, CDP `http://127.0.0.1:9222` |
| Launch | `~/Downloads/skills-library-v2 2/hermes-setup/scripts/launch-antigravity-style-chrome.sh` |
| Never use | `chrome-debug-profile`, `chrome-agent`, daily Chrome Application Support |
| Never touch | Frank's daily Chrome (different profile, no conflict) |

1. Launch the agent browser:
   ```bash
   # Must override HOME because the launch script resolves $HOME to the Hermes profile sandbox
   HOME="/Users/franklawrencejr." \
     "/Users/franklawrencejr./Downloads/skills-library-v2 2/hermes-setup/scripts/launch-antigravity-style-chrome.sh"
   ```
   Or launch directly (if script not available):
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --remote-debugging-port=9222 \
     --remote-debugging-address=127.0.0.1 \
     --user-data-dir="/Users/franklawrencejr./.gemini/antigravity-browser-profile" \
     --disable-fre --no-default-browser-check --no-first-run
   ```
2. Wait for CDP to be ready: `curl -s http://127.0.0.1:9222/json/version`
3. Log into Threads with target account in the Chrome window that opens.
4. Extract cookies via CDP WebSocket (`Network.getCookies`).
5. Transfer to VM via SCP if needed:
   ```bash
   scp cookies.json user@vm:~/.hermes/threads/sessions/[account].json
   ```
6. Test scrape — verify posts load.

### Session Health Check

```python
def check_session(account):
    cookies = load_cookies(account)
    session = next((c for c in cookies if c['name'] == 'sessionid'), None)
    if not session:
        return 'MISSING'
    if session.get('expires', 0) < time.time():
        return 'EXPIRED'
    # Test scrape
    posts = scrape_feed(account, scroll_count=1)
    return 'HEALTHY' if len(posts) > 0 else 'DEGRADED'
```

Sessions last ~60-90 days. Re-sync before expiry.

---

## Time Display

```python
def time_ago(epoch):
    if not epoch:
        return '?'
    diff = time.time() - epoch
    if diff < 60:
        return f'{int(diff)}s ago'
    elif diff < 3600:
        return f'{int(diff/60)}m ago'
    elif diff < 86400:
        return f'{int(diff/3600)}h ago'
    else:
        return f'{int(diff/86400)}d ago'
```

---

## CDP Scraping (Attach to Open Chrome)

> **Script:** `scripts/threads_scrape_cdp.py` — CDP variant that attaches to the user's open Chrome instead of launching a new browser.

When the user already has Chrome open on port `9222` with a Threads session signed in, **attach to it** instead of launching a new Playwright browser. This is faster, avoids login issues, and lets the user watch the scrape happen in real time.

### When to Use CDP vs Standalone

| Situation | Use |
|---|---|
| User says "I have Chrome open" or "I'm signed in on browser now" | CDP attach |
| User wants to watch the scrape scroll | CDP attach |
| Running from a cron job or headless server with no Chrome | Standalone (existing `threads_scrape.py`) |
| User explicitly says to use the wrapper script | Follow their instruction |

### CDP Scraper Script

Location: `~/hermes-agents/scripts/threads_scrape_cdp.py`

Usage:
```bash
/opt/anaconda3/bin/python3 ~/hermes-agents/scripts/threads_scrape_cdp.py \
  --account grazzhopper --vertical cannabis --scrolls 6
```

Key differences from standalone scraper:
- Uses `playwright.chromium.connect_over_cdp("http://127.0.0.1:9222")`
- Finds the existing Threads page in the browser (no new tab needed)
- Reloads the page to trigger fresh API responses
- Reads vertical config from the real `~/.hermes/threads/verticals/` path (not the Hermes profile home)
- Writes cache to `~/.hermes/threads/cache/<account>_feed.json`
- Creates default `cannabis.json` vertical if it doesn't exist

### Pitfall: HOME Path

When running from Hermes Desktop, `$HOME` may resolve to `~/.hermes/profiles/<name>/home/` instead of `/Users/franklawrencejr./`. The CDP scraper hardcodes the real home path. If using the standalone wrapper, pass `HOME=/Users/franklawrencejr.` explicitly:

```bash
HOME=/Users/franklawrencejr. HERMES_PYTHON=/opt/anaconda3/bin/python3 \
  ~/hermes-agents/scripts/run_threads_scrape.sh --account <account> --vertical <vertical> --scrolls 6
```

### Supabase Ingest (CDP Scraper)

The CDP scraper (`scripts/threads_scrape_cdp.py`) POSTs scraped posts to the
`threads-scrape-ingest` Supabase edge function after writing the local cache.
It reads `SUPABASE_ANON_KEY` from the Content Hub `.env.local` file at runtime.
If the key is missing or empty, the ingest is skipped with a warning but the
local cache still gets written.

**POST shape** (full engagement + timestamp):
```json
{
  "keyword": "cannabis",
  "captured_by": "cdp-scraper-grazzhopper",
  "results": [
    {
      "author": "@username",
      "text": "Post text...",
      "permalink": "https://www.threads.net/@user/post/CODE",
      "likes": 37,
      "replies": 8,
      "reposts": 3,
      "quotes": 1,
      "shares": 0,
      "posted_at": "2025-06-01T14:30:00+00:00"
    }
  ]
}
```

**Headers:** `apikey: <ANON>`, `Authorization: Bearer <ANON>`,
`x-ingest-key: ghscrape_2026_t9x4m2k7`

**Critical pitfall:** The ingest payload MUST include all engagement fields
(`likes`, `replies`, `reposts`, `quotes`, `shares`) and `posted_at` (ISO 8601
from `taken_at` epoch). If you send only `author`, `text`, `permalink`, the
Supabase rows will store `0` for all metrics and `null` for timestamps. The
edge function uses `greatest()` upsert, so rows with `0` values will NOT be
corrected by a later scrape that also sends `0` — the `0` becomes the floor.

**Frank's rule:** The scraper output must contain real, accurate data only.
No mock, fake, placeholder, or zeroed-out engagement metrics. If the scraper
captures real likes/replies in its local cache, those same numbers must appear
in the Supabase ingest payload. Verify the POST body before sending.

### Pitfall: page.reload() Crashes CDP-Attached Pages

When the CDP scraper calls `page.reload()` on the Threads tab, the reload
invalidates the Playwright page handle, causing `TargetClosedError` on the
next operation (scroll, wait, etc.). This is a Playwright-over-CDP limitation
— the browser navigates away from the page object Playwright is tracking.

**Fix:** Use reconnect logic instead of bare reload:
```python
try:
    page.reload(wait_until="networkidle", timeout=20000)
except Exception:
    # Reconnect to Chrome and re-acquire the page handle
    browser = playwright.chromium.connect_over_cdp("http://127.0.0.1:9222")
    contexts = browser.contexts
    page = next((p for ctx in contexts for p in ctx.pages if "threads." in p.url), None)
    if not page:
        page = contexts[0].new_page()
        page.goto("https://www.threads.net/", wait_until="networkidle")
```

Alternatively, use `page.goto(page.url, wait_until="networkidle")` which is
less likely to invalidate the handle than `page.reload()`.

**Recovery:** If the Chrome process itself died (ECONNREFUSED on 9222),
relaunch Chrome before retrying the scrape.

### Diagnosis: Feed Intel Empty

When the Content Center shows "No live conversations pulled yet" or "No posts
in the feed yet":

1. `curl convo-ingest?action=feed&topic=cannabis&limit=5` → `{ok:true, items:[]}` = table empty
2. `curl -X POST threads-scrape-ingest?action=ingest` with a test payload → verify endpoint is live
3. Check scraper output for `ingest_status: OK` and `ingest_stored: N` — if missing, the Supabase POST was skipped (check `.env.local` for `SUPABASE_ANON_KEY`)
4. Check `gh_threads_scraped` table in Supabase dashboard for any rows

### Pitfall: Confirm the Signed-In Account

Before scraping, verify which account is signed in. The browser snapshot shows the compose profile picture name (e.g., `grazzhopperplatform's profile picture`). If the user says "scroll GrazzHopper" and the browser shows a different account, confirm before proceeding.

---

## Content Center Ingest Pipeline

The scraper output feeds the GrazzHopper Content Center through a Supabase
pipeline. Scraped posts must reach the `gh_threads_scraped` table for the
Content Center UI to display them.

### Data Flow

```
Threads Scraper (Playwright / CDP)
  → POST to threads-scrape-ingest edge function
    → gh_threads_scraped (Supabase table)
      → convo-ingest edge function (reads table, serves as feed API)
        → cc-conversations.js  ("Discover & Reply" tab)
        → cc-feed-intel.js     ("Feed Intel" tab)
```

### Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /functions/v1/threads-scrape-ingest?action=ingest` | Accept scraped posts from CDP scraper or userscript. Header: `x-ingest-key` |
| `GET /functions/v1/convo-ingest?action=feed&topic=cannabis&limit=30` | Serve posts to Content Center UI |
| `GET /functions/v1/convo-ingest?action=keywords&topic=cannabis` | Serve keyword chips for the UI |
| `GET /functions/v1/convo-ingest?action=pull&topic=cannabis` | Trigger server-side scrape refresh |

### Diagnosis: Empty Content Center

When the Content Center shows "No live conversations pulled yet" or "No posts
in the feed yet":

1. Check the endpoint directly:
   ```bash
   curl -s "https://<PROJECT>.supabase.co/functions/v1/convo-ingest?action=feed&topic=cannabis&limit=5" \
     -H "apikey: <ANON_KEY>" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'ok={d.get(\"ok\")} items={len(d.get(\"items\",[]))}')"
   ```
2. If `{ ok: true, items: [] }` — the `gh_threads_scraped` table is empty. Run a scrape.
3. If the scrape writes to a local cache file but not Supabase — the scraper is not
   hitting `threads-scrape-ingest`. The CDP scraper must POST its results to that endpoint.

### Wiring a Scraper to the Hub

Any scraper (CDP, Playwright, userscript) feeds the hub by POSTing to
`threads-scrape-ingest` with this shape:

```json
{
  "keyword": "cannabis",
  "captured_by": "cdp-scraper",
  "results": [
    {
      "author": "@username",
      "text": "Post text...",
      "permalink": "https://www.threads.net/@user/post/CODE",
      "likes": 37,
      "replies": 8,
      "reposts": 3,
      "quotes": 1,
      "shares": 0,
      "posted_at": "2025-06-01T14:30:00+00:00"
    }
  ]
}
```

Headers: `apikey: <ANON>`, `Authorization: Bearer <ANON>`, `x-ingest-key: ghscrape_2026_t9x4m2k7`

**Every result MUST include the full engagement data and timestamp.** Sending
only `author`, `text`, `permalink` will create rows with all-zero metrics and
null timestamps. The edge function uses `greatest()` upsert, so once a row has
`0` for likes it cannot be corrected by re-ingesting with `0` again.

See `references/content-center-pipeline.md` for the full architecture.

---

## Output Format (Engagement Package)

When the user asks for a reply package after scraping, use this format:

### Table Format Rules
- **No "fit" column.** The user evaluates fit themselves.
- Metrics must be in **separate columns**, not smushed into one cell.
- Required columns: `@user`, `snippet`, `likes`, `replies`, `reposts`, `quotes`, `link`
- Sort by engagement (likes descending) as default.

Example:
```
| @user | snippet | likes | replies | reposts | quotes | link |
```

### Reply Draft Rules
- Pick 5-10 posts worth engaging.
- For each: 3 reply drafts in the user's voice (short, human, no AI slop).
- Say which account to post from if it matters.
- No em dashes, semicolons, parentheses, emojis (frvnkfrmchicago voice rules apply).
- If the user names account + vertical, run the scraper first, then do the reply package.

### Video/Image Posts
- Text snapshots cannot show video content. Only the thumbnail frame is visible.
- If a post has a video and context is unclear, use `browser_vision` to inspect the thumbnail, or navigate to the direct post URL and inspect.
- When unsure what the video shows, **ask the user** rather than guessing.

---

## Rate Limiting

| Rule | Value |
|------|-------|
| Min delay between scrapes | 60 seconds |
| Max scrolls per session | 10 |
| Max scrapes per hour | 10 |
| Max scrapes per day | 50 |
| User-Agent | Real Chrome UA |

---

## Output Formats

### Text (Discord/CLI)

```
@devinmeetworld  (5h ago)
  "If she's fine af and smokes weed, talk to her nicely."
  likes=3297 replies=93 reposts=385 quotes=49 shares=0
  https://www.threads.net/@devinmeetworld/post/DY7dipuFYGH
```

### JSON (API/Storage)

```json
{
  "username": "devinmeetworld",
  "text": "If she's fine af and smokes weed...",
  "likes": 3297,
  "replies": 93,
  "reposts": 385,
  "quotes": 49,
  "shares": 0,
  "taken_at": 1748565600,
  "time_ago": "5h ago",
  "code": "DY7dipuFYGH",
  "link": "https://www.threads.net/@devinmeetworld/post/DY7dipuFYGH"
}
```

---

## ⛔ STOP GATE

DO NOT present Threads data without:
1. @username on every post
2. All 5 engagement metrics (likes, replies, reposts, quotes, shares)
3. Timestamp (time_ago format)
4. Direct link to the post
5. Deduplication (no repeated posts)
6. Sorted by recency (newest first)

---

## NEVER

- NEVER use keyword search (age-gated and unreliable)
- NEVER parse DOM text only (always intercept API responses)
- NEVER hardcode passwords or tokens
- NEVER scrape more than 10 scrolls per session
- NEVER skip engagement metrics
- NEVER present posts without timestamps
- NEVER assume a session is valid without testing
- NEVER close, restart, or `pkill` Frank's daily Chrome — it uses a different profile and coexists with the agent browser
- NEVER switch to `chrome-debug-profile` or any profile other than `~/.gemini/antigravity-browser-profile` on port 9222
- NEVER relaunch Chrome with a different profile after a crash — same profile, same port, every time

---

## Pre-Completion Checklist

- [ ] Session cookies loaded and verified
- [ ] API responses intercepted (not DOM text)
- [ ] All 5 engagement metrics extracted per post
- [ ] Timestamps displayed as time_ago
- [ ] Direct links included for every post
- [ ] Posts deduplicated and sorted by recency
- [ ] Vertical filtering applied (if requested)
- [ ] Rate limits respected
- [ ] Output formatted for target (Discord/JSON/text)
