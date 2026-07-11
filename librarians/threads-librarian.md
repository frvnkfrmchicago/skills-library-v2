---
name: threads-librarian
description: Meta Threads feed intelligence, engagement scraping, multi-account session management, topic vertical monitoring, and automated interaction via Playwright. Covers For You feed scraping, profile monitoring, engagement analytics, cookie-based auth, and topic verticals. Use when scraping Threads feeds, monitoring engagement, managing Threads sessions, pulling posts by topic, or when user mentions Threads, feed scraping, engagement tracking, or social listening.
last_updated: 2026-05-30
version: v1
protocol: anti-skimming-v3
---

# Threads Librarian

**Role**: You manage **all interactions with Meta Threads** — scraping For You feeds, monitoring engagement, managing multi-account sessions, filtering by topic verticals, and enabling automated responses. You are the single source of truth for how Threads data enters the ecosystem.

**The question you answer**: "What's happening on Threads right now in my verticals, who's saying what, and how should I engage?"

---

## TLDR — What This Librarian Does

| Capability | What It Means | Example |
|-----------|--------------|---------|
| **Feed Scraping** | Scroll and intercept API data from any account's For You feed | Pull 30+ posts with full engagement data |
| **Topic Verticals** | Filter posts by keyword groups (not keyword search) | "Cannabis" vertical catches weed, blunt, smoke, 420, dispensary |
| **Engagement Data** | Extract @username, likes, replies, reposts, quotes, shares, timestamps | "@devinmeetworld — 3,297 likes — 5h ago" |
| **Multi-Account** | Manage separate sessions for each Threads account | GrazzHopper feed vs frvnkfrmchicago feed |
| **Session Management** | Cookie-based auth that persists without staying logged in | Session cookies last weeks, auto-detect expiry |
| **Profile Monitoring** | Scrape any public profile's recent posts | Monitor competitor or influencer activity |
| **Thread Scraping** | Scrub replies and sentiment on a specific post URL session-free | Scrub Grazzhopper comments thread for cannabis topic sentiment |
| **Post Links** | Generate direct clickable links to every post | `threads.net/@user/post/CODE` |

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│              Hermes Agent (VM)               │
│                                              │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Discord Bot  │→│  Threads Scraper      │  │
│  │ (AgentGem)   │  │  (Playwright + CDP)  │  │
│  └─────────────┘  └──────────┬───────────┘  │
│                              │               │
│  ┌───────────────────────────▼────────────┐  │
│  │         Session Manager                │  │
│  │  cookies/grazzhopper.json              │  │
│  │  cookies/frvnkfrmchicago.json          │  │
│  │  cookies/[any-account].json            │  │
│  └───────────────────────────┬────────────┘  │
│                              │               │
│  ┌───────────────────────────▼────────────┐  │
│  │         Topic Verticals                │  │
│  │  verticals/cannabis.json               │  │
│  │  verticals/tech.json                   │  │
│  │  verticals/ai.json                     │  │
│  │  verticals/[custom].json               │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

        ▼ Cookie Sync (one-time per account)

┌─────────────────────────────────────────────┐
│         User's Local Machine (Mac)           │
│  Chrome Debug Profile → CDP → Extract Cookies│
│  Logged into Threads → Session captured       │
└─────────────────────────────────────────────┘
```

---

## How It Works — The Feed Scraping Pipeline

### Why Feed Scraping (Not Search)

Threads **blocks keyword search** for accounts it classifies as under-18 ("predicted teens") — even for logged-in adults. The "Age inappropriate results hidden" wall is account-level and cannot be bypassed.

**The solution**: Scroll the **For You feed** instead. The algorithm already serves content matching the user's interests. We intercept the internal API responses (same data the app uses) to get structured post data with full engagement metrics.

### The Scraping Flow

```
1. Load session cookies into Playwright browser context
2. Navigate to https://www.threads.net/ (For You feed)
3. Register response interceptor for JSON responses containing `like_count` + `username`
4. Scroll 4-5 times to trigger lazy-loading API calls
5. Parse intercepted API responses recursively to extract post objects
6. Deduplicate by username+code
7. Sort by timestamp (newest first)
8. Format with time_ago() display
```

### What Gets Extracted Per Post

| Field | Source | Example |
|-------|--------|---------|
| `username` | `post.user.username` | `devinmeetworld` |
| `text` | `post.caption.text` | "If she's fine af and smokes weed..." |
| `like_count` | `post.like_count` | 3297 |
| `reply_count` | `post.text_post_app_info.direct_reply_count` | 93 |
| `repost_count` | `post.text_post_app_info.repost_count` | 385 |
| `quote_count` | `post.text_post_app_info.quote_count` | 49 |
| `share_count` | `post.text_post_app_info.share_count` | 0 |
| `taken_at` | `post.taken_at` (Unix epoch) | 1748565600 → "5h ago" |
| `code` | `post.code` | `DY7dipuFYGH` |
| `link` | Constructed | `threads.net/@devinmeetworld/post/DY7dipuFYGH` |

---

## Public Thread URL Scraping (Session-Free/Unauthenticated)

For public profiles or specific discussion links (e.g., analyzing comments on a specific post, reviewing cannabis sentiment on Grazzhopper threads), scraping can be performed **directly by post URL without session cookies**. This avoids profile switching conflicts (e.g., between `frvnkfrmchicago` and `grazzhopper`) and eliminates active login requirements.

### Method Overview
When navigating directly to a post thread (`https://www.threads.net/@username/post/code`), Threads loads the parent post and its initial replies. By intercepting GraphQL responses, the agent can parse replies recursively, and then perform automated scrolling to trigger lazy loading of additional replies.

---

## Topic Verticals

A **vertical** is a group of related keywords that defines a content interest area. Instead of searching (which is blocked), we filter the For You feed results against vertical keyword lists.

### Vertical Definition Format

```json
{
  "name": "cannabis",
  "description": "Cannabis culture, legalization, and lifestyle",
  "keywords": [
    "weed", "cannabis", "marijuana", "blunt", "smoke", "smoking",
    "420", "dispensary", "edibles", "gummies", "thc", "cbd",
    "joint", "bong", "dab", "stoner", "high", "sativa", "indica",
    "hybrid", "kush", "og", "strain", "terpene", "flower",
    "pre-roll", "vape", "concentrate", "hash", "rosin",
    "legalize", "decriminalize", "hemp", "grower", "cultivator",
    "budtender", "dime", "eighth", "quarter", "ounce",
    "🍃", "💨", "🌿", "🔥"
  ],
  "match_mode": "any",
  "case_sensitive": false
}
```

### Pre-Built Verticals

| Vertical | Keywords (sample) | Use Case |
|----------|------------------|----------|
| **cannabis** | weed, marijuana, blunt, smoke, 420, dispensary, edibles, thc, cbd | Cannabis culture and industry |
| **tech** | AI, code, startup, SaaS, dev, programming, machine learning, API | Tech and startup culture |
| **ai** | artificial intelligence, machine learning, chatgpt, llm, prompt engineering | Deep AI research & agents |

### Custom Vertical Creation

Users can define custom verticals at any time:

```
User: "Create a vertical for marketing"
Agent creates: verticals/marketing.json with keywords:
  marketing, advertising, branding, growth hacking, seo, copy, ad
```

### Vertical Matching Logic

```python
def matches_vertical(post_text, vertical):
    """Check if a post matches a topic vertical."""
    text_lower = post_text.lower()
    keywords = vertical['keywords']
    
    if vertical.get('match_mode') == 'all':
        return all(kw.lower() in text_lower for kw in keywords)
    else:  # 'any' mode (default)
        return any(kw.lower() in text_lower for kw in keywords)
```

---

## Multi-Account Session Management

### Account Structure

Each Threads account gets its own session file:

```
~/.hermes/threads/
├── sessions/
│   ├── grazzhopper.json          # GrazzHopper account cookies
│   ├── frvnkfrmchicago.json      # frvnkfrmchicago account cookies
│   └── [account-name].json       # Any additional account
├── verticals/
│   ├── cannabis.json
│   ├── tech.json
│   └── [custom].json
└── cache/
    ├── grazzhopper_feed.json     # Last scraped feed (cached)
    └── frvnkfrmchicago_feed.json
```

### Cookie Sync Process (One-Time Per Account)

There are two methods to sync cookies:

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

```
Step 1: On the user's Mac, launch Chrome with debug port
  /Applications/Google Chrome.app/.../Google Chrome \
    --remote-debugging-port=9222 \
    --user-data-dir="~/.chrome-debug-profile"

Step 2: User logs into Threads in the debug Chrome

Step 3: Agent extracts cookies via CDP WebSocket
  → Connect to ws://127.0.0.1:9222/devtools/page/...
  → Send Network.getCookies for threads.com + instagram.com domains
  → Save decrypted cookie values to JSON

Step 4: Transfer cookies to VM
  scp cookies.json user@vm:~/.hermes/threads/sessions/[account].json

Step 5: Test the session on VM
  → Playwright loads cookies, navigates to threads.net
  → Verify For You feed loads with posts
  → Session saved, no further login needed
```

### Session Health Check

```python
def check_session_health(account_name):
    """Verify a session is still valid."""
    cookies_path = f'~/.hermes/threads/sessions/{account_name}.json'
    
    # Check file exists
    if not os.path.exists(cookies_path):
        return {'status': 'MISSING', 'action': 'Run cookie sync'}
    
    # Check cookie expiry
    with open(cookies_path) as f:
        cookies = json.load(f)
    
    session_cookie = next((c for c in cookies if c['name'] == 'sessionid'), None)
    if not session_cookie:
        return {'status': 'INVALID', 'action': 'Re-sync cookies'}
    
    if session_cookie.get('expires', 0) < time.time():
        return {'status': 'EXPIRED', 'action': 'Re-sync cookies'}
    
    # Test scrape
    try:
        posts = scrape_feed(account_name, scroll_count=1)
        if len(posts) > 0:
            return {'status': 'HEALTHY', 'posts_found': len(posts)}
        else:
            return {'status': 'DEGRADED', 'action': 'Check account status'}
    except Exception as e:
        return {'status': 'ERROR', 'error': str(e)}
```

### Session Expiry Timeline

| Cookie | Typical Lifespan | Impact When Expired |
|--------|-----------------|---------------------|
| `sessionid` | ~90 days | Full auth loss — re-sync required |
| `csrftoken` | ~365 days | API calls fail — re-sync required |
| `ds_user_id` | ~365 days | User identity lost |
| `mid` | ~730 days | Machine identifier |
| `ig_did` | ~730 days | Device identifier |

> [!IMPORTANT]
> Sessions typically last 60-90 days. Set a reminder to re-sync cookies before expiry. The health check endpoint should run weekly.

---

## How to Replicate for a New Account

### Step-by-Step: Adding a New Threads Account

1. **Open debug Chrome on Mac**
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
     --remote-debugging-port=9222 \
     --user-data-dir="$HOME/.chrome-debug-profile"
   ```

2. **Log into Threads** with the new account in the debug Chrome

3. **Extract cookies** (agent does this automatically)
   ```python
   # Connect to CDP, get cookies for threads.com + instagram.com
   # Save to /tmp/[account]_cookies.json
   ```

4. **Transfer to VM**
   ```bash
   scp /tmp/[account]_cookies.json \
     user@vm:~/.hermes/threads/sessions/[account].json
   ```

5. **Test**
   ```bash
   python3 /path/to/scrape_feed.py --account [account] --scrolls 2
   ```

6. **Register with Hermes**
   - Add account name to the bot's config
   - Set default vertical (optional)
   - Enable Discord commands for the new account

### Replication Checklist

- [ ] Chrome debug profile launched
- [ ] Logged into correct Threads account
- [ ] Cookies extracted (sessionid, csrftoken, ds_user_id present)
- [ ] Cookies transferred to VM
- [ ] Test scrape returns 10+ posts
- [ ] Account registered in Hermes config
- [ ] Verticals assigned (optional)
- [ ] Health check scheduled

---

## The Core Scraper Script

This is the production-ready script that lives on the VM:

```python
#!/usr/bin/env python3
"""Threads For You Feed Scraper — Production Script
Usage:
  python3 threads_scraper.py --account grazzhopper --scrolls 5
  python3 threads_scraper.py --account frvnkfrmchicago --vertical cannabis
  python3 threads_scraper.py --account grazzhopper --output json
"""

from playwright.sync_api import sync_playwright
import json, time as _time, argparse, os

SESSIONS_DIR = os.path.expanduser('~/.hermes/threads/sessions')
VERTICALS_DIR = os.path.expanduser('~/.hermes/threads/verticals')
CACHE_DIR = os.path.expanduser('~/.hermes/threads/cache')
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'

def time_ago(epoch):
    if not epoch: return '?'
    diff = _time.time() - epoch
    if diff < 60: return f'{int(diff)}s ago'
    elif diff < 3600: return f'{int(diff/60)}m ago'
    elif diff < 86400: return f'{int(diff/3600)}h ago'
    else: return f'{int(diff/86400)}d ago'

def load_cookies(account):
    path = os.path.join(SESSIONS_DIR, f'{account}.json')
    with open(path) as f:
        cookies = json.load(f)
    pw_cookies = []
    for c in cookies:
        cookie = dict(name=c['name'], value=c['value'], domain=c['domain'],
            path=c.get('path','/'), secure=c.get('secure',True),
            httpOnly=c.get('httpOnly',False))
        if c.get('expires',-1) > 0:
            cookie['expires'] = c['expires']
        pw_cookies.append(cookie)
    return pw_cookies

def load_vertical(name):
    path = os.path.join(VERTICALS_DIR, f'{name}.json')
    if not os.path.exists(path): return None
    with open(path) as f:
        return json.load(f)

def matches_vertical(text, vertical):
    if not vertical: return True
    text_lower = text.lower()
    return any(kw.lower() in text_lower for kw in vertical['keywords'])

def scrape_feed(account, scroll_count=5, vertical_name=None):
    cookies = load_cookies(account)
    vertical = load_vertical(vertical_name) if vertical_name else None
    api_data = []

    def on_resp(response):
        try:
            ct = response.headers.get('content-type','')
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
        page.goto('https://www.threads.net/', wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(5000)
        for _ in range(scroll_count):
            page.evaluate('window.scrollBy(0, 1500)')
            page.wait_for_timeout(2500)

        seen = set()
        posts = []

        def find_posts(obj, depth=0):
            if depth > 10 or not obj: return
            if isinstance(obj, dict):
                if 'like_count' in obj and isinstance(obj.get('user'), dict):
                    u = obj['user']
                    cap = obj.get('caption')
                    txt = cap.get('text','')[:200] if isinstance(cap, dict) else ''
                    un = u.get('username','?')
                    info = obj.get('text_post_app_info') or {}
                    code = obj.get('code','')
                    key = un + code
                    if txt and un != '?' and key not in seen:
                        seen.add(key)
                        post = {
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
                        }
                        if matches_vertical(txt, vertical):
                            posts.append(post)
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

def scrape_thread_url(account, thread_url, scroll_count=5):
    """
    Scrapes a specific public Threads post/thread URL authenticated via account session.
    Allows accessing age-gated (cannabis) or restricted threads.
    """
    cookies = load_cookies(account)
    api_data = []

    def on_resp(response):
        try:
            ct = response.headers.get('content-type','')
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
            if depth > 10 or not obj: return
            if isinstance(obj, dict):
                if 'like_count' in obj and isinstance(obj.get('user'), dict):
                    u = obj['user']
                    cap = obj.get('caption')
                    txt = cap.get('text','')[:200] if isinstance(cap, dict) else ''
                    if not txt:
                        txt = obj.get('text','')[:200]
                    un = u.get('username','?')
                    info = obj.get('text_post_app_info') or {}
                    code = obj.get('code','')
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

def scrape_search(account, query, scroll_count=3, max_age_days=7):
    """
    Searches for a keyword on Threads using a logged-in account session,
    intercepting the GraphQL search results, and filtering out old posts.
    """
    cookies = load_cookies(account)
    api_data = []

    def on_resp(response):
        try:
            ct = response.headers.get('content-type','')
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
        
        # Navigate to Threads search page
        search_url = f'https://www.threads.net/search?q={query}'
        page.goto(search_url, wait_until='networkidle', timeout=30000)
        page.wait_for_timeout(4000)
        
        # Scroll to load more search results
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
                    txt = cap.get('text','')[:200] if isinstance(cap, dict) else ''
                    un = u.get('username','?')
                    info = obj.get('text_post_app_info') or {}
                    code = obj.get('code','')
                    taken_at = obj.get('taken_at', 0)
                    
                    # Age filter: discard posts older than max_age_days
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

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--account', default=None)
    parser.add_argument('--url', default=None)
    parser.add_argument('--search', default=None)
    parser.add_argument('--max-age-days', type=int, default=7)
    parser.add_argument('--scrolls', type=int, default=5)
    parser.add_argument('--vertical', default=None)
    parser.add_argument('--output', choices=['text','json'], default='text')
    args = parser.parse_args()

    account = args.account or 'grazzhopper'

    if args.url:
        posts = scrape_thread_url(account, args.url, args.scrolls)
    elif args.search:
        posts = scrape_search(account, args.search, args.scrolls, args.max_age_days)
    elif args.account:
        posts = scrape_feed(args.account, args.scrolls, args.vertical)
    else:
        posts = scrape_feed(account, args.scrolls, args.vertical)

    if args.output == 'json':
        print(json.dumps(posts, indent=2))
    else:
        for p in posts:
            print()
            print(f'@{p["username"]}  ({p["time_ago"]})')
            print(f'  {p["text"]}')
            print(f'  likes={p["likes"]} replies={p["replies"]} reposts={p["reposts"]} quotes={p["quotes"]} shares={p["shares"]}')
            if p['link']:
                print(f'  {p["link"]}')
```

---

## Integration with Hermes Bots

### Discord Commands

| Command | What It Does |
|---------|-------------|
| `!threads feed` | Scrape For You feed, show top 10 posts |
| `!threads feed --account frvnkfrmchicago` | Scrape a specific account's feed |
| `!threads cannabis` | Scrape feed filtered by cannabis vertical |
| `!threads cannabis --account grazzhopper` | Cannabis vertical on GrazzHopper feed |
| `!threads profile @leafly` | Scrape a specific user's profile posts |
| `!threads status` | Check session health for all accounts |
| `!threads vertical create marketing branding,seo,advertising` | Create a new vertical |

### Hermes Integration Pattern

```python
# In the Hermes bot command handler:
async def handle_threads_command(ctx, args):
    account = args.get('account', 'grazzhopper')  # default account
    vertical = args.get('vertical', None)
    scrolls = args.get('scrolls', 5)
    
    posts = scrape_feed(account, scrolls, vertical)
    
    # Format for Discord embed
    embed = discord.Embed(title=f"Threads Feed ({account})", color=0x00ff00)
    for post in posts[:10]:
        embed.add_field(
            name=f"@{post['username']} ({post['time_ago']})",
            value=f"{post['text'][:100]}...\n❤️ {post['likes']} 💬 {post['replies']} 🔁 {post['reposts']}",
            inline=False
        )
    await ctx.send(embed=embed)
```

---

## Rate Limiting and Safety

| Rule | Value | Why |
|------|-------|-----|
| **Min delay between scrapes** | 60 seconds | Avoid triggering rate limits |
| **Max scrolls per session** | 10 | Diminishing returns + risk |
| **Max scrapes per hour** | 10 | Stay under radar |
| **Max scrapes per day** | 50 | Daily safety cap |
| **User-Agent** | Real Chrome UA | Match real browser |
| **Headless detection** | Playwright stealth | Avoid bot detection |
| **Cookie refresh** | Every 30 days | Re-sync before expiry |

> [!WARNING]
> Do NOT spam scrape. Threads will rate-limit or block sessions. Respect the limits above. One scrape per Discord command is the intended pattern.

---

## How This Differs From Other Librarians

| Librarian | What It Does | Threads Does NOT Do This |
|-----------|-------------|--------------------------|
| **API Integration** | REST/GraphQL client patterns | Threads uses scraping, not official API for feed |
| **N8N Automating** | Workflow automation nodes | Threads provides the data source, N8N can consume it |
| **Search Librarian** | Multi-source information retrieval | Threads is a specific social platform, not general search |
| **Research Librarian** | Topic exploration | Threads provides real-time social sentiment, not research |

---

## Hard Rules

### ALWAYS
- ALWAYS use cookie-based auth via Playwright (never hardcode passwords)
- ALWAYS intercept API responses for structured data (never parse DOM text only)
- ALWAYS include timestamps in output (time_ago format)
- ALWAYS include direct post links
- ALWAYS respect rate limits
- ALWAYS check session health before scraping
- ALWAYS support multi-account switching
- ALWAYS deduplicate posts by username+code

### NEVER
- NEVER use keyword search (it's age-gated and unreliable)
- NEVER store passwords or auth tokens in plaintext
- NEVER scrape more than 10 scrolls in one session
- NEVER scrape more than 50 times per day per account
- NEVER skip engagement metrics (likes, replies, reposts, quotes, shares)
- NEVER present posts without timestamps
- NEVER assume a session is valid without testing it

---

## Pre-Completion Checklist

- [ ] Session cookies loaded and tested
- [ ] For You feed loads with posts
- [ ] API responses intercepted (not just DOM text)
- [ ] All engagement metrics extracted
- [ ] Timestamps displayed as time_ago
- [ ] Direct links to every post
- [ ] Posts sorted by recency
- [ ] Vertical filtering applied (if requested)
- [ ] Results deduplicated
- [ ] Output formatted for target (Discord/JSON/text)

---

## Skills References

| Skill | Purpose |
|-------|---------|
| [threads-scraping](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/threads-scraping/SKILL.md) | Operational scraping workflow |
| [n8n-automating](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/n8n-automating/SKILL.md) | Workflow automation for scheduled scrapes |
| [api-integrating](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/api-integrating/SKILL.md) | API client patterns |

## Related Librarians

- [api-integration-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/api-integration-librarian.md) — API client design
- [n8n-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/n8n-librarian.md) — Workflow automation
- [search-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/search-librarian.md) — Information retrieval
- [research-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/research-librarian.md) — Topic exploration
