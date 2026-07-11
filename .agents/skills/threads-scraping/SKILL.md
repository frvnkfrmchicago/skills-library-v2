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
// ~/.hermes/threads/verticals/cannabis.json
{
  "name": "cannabis",
  "description": "Cannabis culture, legalization, and lifestyle",
  "keywords": [
    "weed", "cannabis", "marijuana", "blunt", "smoke", "smoking",
    "420", "dispensary", "edibles", "gummies", "thc", "cbd",
    "joint", "bong", "dab", "stoner", "high", "sativa", "indica",
    "kush", "strain", "terpene", "flower", "pre-roll", "hash",
    "legalize", "decriminalize", "hemp", "budtender",
    "🍃", "💨", "🌿", "🔥"
  ],
  "match_mode": "any",
  "case_sensitive": false
}
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
| cannabis | weed, marijuana, blunt, smoke, 420, dispensary, edibles, thc, cbd |
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

1. Launch Chrome with debug port on Mac:
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.chrome-debug-profile"
   ```
2. Log into Threads with target account.
3. Extract cookies via CDP WebSocket (`Network.getCookies`).
4. Transfer to VM via SCP:
   ```bash
   scp cookies.json user@vm:~/.hermes/threads/sessions/[account].json
   ```
5. Test scrape — verify posts load.

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
