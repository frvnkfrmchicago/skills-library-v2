---
name: hermes-session-guide-librarian
description: >
  Complete operational guide for Hermes agent infrastructure — session files,
  cookie-based browser automation, MCP servers, CLIs, and directory layout.
  Use when an agent needs to interact with platforms (ChatGPT, Google, Dribbble,
  Kling, Wix, Threads, etc.) via saved browser sessions, when configuring MCPs,
  or when onboarding a new agent to the Hermes VM environment.
---

# Hermes Session Guide Librarian

Reference guide for agents operating the Hermes infrastructure on the GCP VM.

## VM Connection

```bash
ssh -i ~/.ssh/google_compute_engine franklawrencejr.@34.28.216.185
```

## Directory Layout

```
~/.hermes/
├── .env                          # Environment variables (secrets, feature flags)
├── config.yaml                   # MCP servers, gateway config, model settings
├── hermes-agent/                 # Core agent code
│   ├── venv/                     # Python virtualenv (Playwright, tools)
│   ├── tools/                    # Browser tools, browser_camofox, etc.
│   └── plugins/browser/          # Browser backends
├── node/                         # Node.js runtime
├── profiles/                     # Agent profiles (agent-gem, big-venture, hecthor)
├── custom-skills/skills/         # Custom skills on the VM
│
├── # === SESSION FILES (cookie-based auth) ===
├── chatgpt-session.json          # ChatGPT / OpenAI (39 cookies)
├── google-session.json           # Google core services (36 cookies)
├── google-all-session.json       # Google + NotebookLM + YouTube combined (69 cookies)
├── notebooklm-session.json       # Google NotebookLM (7 cookies)
├── youtube-session.json          # YouTube (26 cookies)
├── dribbble-session.json         # Dribbble (13 cookies)
├── kling-session.json            # Kling AI (20 cookies)
├── mobbin-session.json           # Mobbin (16 cookies)
├── linkedin-session.json         # LinkedIn (31 cookies)
├── medium-session.json           # Medium (15 cookies)
├── uxcel-session.json            # Uxcel (14 cookies)
├── threads-session.json          # Threads + Instagram (16 cookies)
└── wix-session.json              # Wix website editor (34 cookies)
```

## How Session Files Work

Session files are **Playwright storage state** JSON files. Format:

```json
{
  "cookies": [
    {
      "name": "sessionid",
      "value": "abc123...",
      "domain": ".example.com",
      "path": "/",
      "secure": true,
      "httpOnly": true,
      "sameSite": "Lax",
      "expires": 1234567890
    }
  ],
  "origins": []
}
```

### Loading a session in Playwright

```python
from playwright.sync_api import sync_playwright
import json

SESSION_FILE = "/home/franklawrencejr./.hermes/chatgpt-session.json"

with open(SESSION_FILE) as f:
    session = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=['--disable-blink-features=AutomationControlled']
    )
    context = browser.new_context(
        storage_state=session,
        user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                   'AppleWebKit/537.36 (KHTML, like Gecko) '
                   'Chrome/120.0.0.0 Safari/537.36'
    )
    page = context.new_page()
    page.goto("https://chatgpt.com/")
    # ... interact with the page as the logged-in user
    browser.close()
```

### Creating new session files (cookie capture process)

1. On the **local Mac**, launch Chrome via the Antigravity-style script (see "Local Mac Chrome 9222" section below for full details):
   ```bash
   ~/Downloads/skills-library-v2\ 2/hermes-setup/scripts/launch-antigravity-style-chrome.sh
   ```
   This opens Chrome on port 9222 with the `~/.gemini/antigravity-browser-profile`.

2. Log into the site in the browser.

3. Extract cookies via CDP websocket:
   ```python
   import json, urllib.request, asyncio, websockets

   version = json.loads(urllib.request.urlopen(
       "http://127.0.0.1:9222/json/version").read())
   ws_url = version['webSocketDebuggerUrl']

   async def get_cookies():
       async with websockets.connect(ws_url) as ws:
           await ws.send(json.dumps({
               "id": 1, "method": "Storage.getCookies"
           }))
           result = json.loads(await ws.recv())
           return result['result']['cookies']

   cookies = asyncio.run(get_cookies())
   ```

4. Filter by domain, convert to Playwright format, save as session JSON.

5. SCP to VM:
   ```bash
   scp -i ~/.ssh/google_compute_engine /tmp/site-session.json \
     franklawrencejr.@34.28.216.185:~/.hermes/site-session.json
   ```

6. Secure:
   ```bash
   ssh ... "chmod 600 ~/.hermes/site-session.json"
   ```

### Cookie expiration

- Most cookies expire in 30-90 days
- When expired, repeat the capture process
- Instagram/Threads cookies tend to last ~90 days
- Google cookies refresh automatically if used regularly

## Cloudflare-Protected Sites

Some sites (ChatGPT, LinkedIn) use Cloudflare bot detection that blocks
regular headless Playwright. For these sites:

- **Camoufox** (Python package `camoufox`) provides an anti-fingerprint
  Firefox that bypasses Cloudflare. Already installed on the VM.
- Usage:
  ```python
  from camoufox.sync_api import Camoufox
  import json

  with open('/home/franklawrencejr./.hermes/chatgpt-session.json') as f:
      session = json.load(f)

  with Camoufox(headless=True) as browser:
      context = browser.new_context(storage_state=session)
      page = context.new_page()
      page.goto("https://chatgpt.com/")
      # Now logged in, bypassing Cloudflare
  ```

## Shared Chrome / CDP Target Triage

When controlling the visible shared Chrome session on port `9222`, verify target type before reporting what is on screen. Chrome can expose multiple simultaneous targets: the real tab as `type: "page"`, Gemini/side panels as `type: "webview"`, omnibox/profile UI as `type: "browser_ui"`, plus iframes and extension workers. If Frank says he does not see what the agent reported, call `Target.getTargets`, identify the `page` target by title/URL, and distinguish it from side panel/webview targets before answering. If navigation is needed, use `Page.navigate` against the specific `target_id` for the `page` target rather than relying on an ambiguous snapshot.

Reference: `references/shared-chrome-cdp-targets.md` documents the target-type workflow and reporting pattern.

## Local Mac Chrome 9222 Configuration

This section covers the **local Mac** (not the VM). Frank's machine runs a headed Chrome instance on CDP port 9222 that Hermes `browser_*` tools attach to.

### ONLY valid configuration

| Setting | Value |
|---------|-------|
| Port | `9222` |
| Profile | `~/.gemini/antigravity-browser-profile` |
| CDP URL | `http://127.0.0.1:9222` |
| Launch script | `~/Downloads/skills-library-v2 2/hermes-setup/scripts/launch-antigravity-style-chrome.sh` |

**NEVER use any of these profiles:**
- `~/.chrome-debug-profile` — blank profile, no logins
- `~/.chrome-agent` — wrong profile
- `~/Library/Application Support/Google/Chrome/` — daily Chrome, no debug port

### Launching Chrome on 9222

If Chrome is not already listening on 9222:

```bash
"/Users/franklawrencejr./Downloads/skills-library-v2 2/hermes-setup/scripts/launch-antigravity-style-chrome.sh"
```

The script is smart: if a headed Chrome already owns 9222, it exits cleanly. If a headless Chrome owns 9222, it kills it and launches headed.

### Pitfalls

1. **`$HOME` resolution under Hermes is wrong.** The Hermes agent shell sets `HOME` to `~/.hermes/profiles/adimeadozen/home/`. The launch script uses `$HOME` to build the profile path, which results in `~/.hermes/profiles/adimeadozen/home/.gemini/antigravity-browser-profile` — a blank directory. Fix: override `HOME` or pass `--user-data-dir` explicitly:
   ```bash
   HOME="/Users/franklawrencejr." launch-antigravity-style-chrome.sh
   # OR
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
     --remote-debugging-port=9222 \
     --remote-debugging-address=127.0.0.1 \
     --user-data-dir="/Users/franklawrencejr./.gemini/antigravity-browser-profile" \
     --disable-fre --no-default-browser-check --no-first-run
   ```

1a. **`$HOME` override applies to ALL filesystem tools, not just Chrome.** Confirmed in 2026-06: every `terminal()` call (foreground, background, execute_code) and every `read_file`/`write_file`/`search_files` resolves paths against `~/.hermes/profiles/adimeadozen/home/` by default. Symptom: `du -sh ~/*` returns 0B/empty results and creates files silently inside the sandbox home. Always start Mac filesystem work with `export HOME=/Users/frankrencejr.` (or pass the absolute path explicitly) before any `du`, `rm`, `mv`, or `ls` against user data. Same root cause, broader blast radius than just the Chrome script.

2. **Two Chrome instances conflict.** Frank's regular Chrome (no debug port) and a debug Chrome **cannot both run** simultaneously. If the regular Chrome is running, the debug Chrome will either fail to start or crash shortly after. To get 9222 with the GrazzHopper profile, the regular Chrome must be closed first, then relaunched with `--remote-debugging-port=9222`. Tabs will restore on relaunch.

3. **Crash recovery loses the session.** If Chrome on 9222 crashes during a scraper run or other operation, relaunching with the **wrong profile** (like `chrome-debug-profile`) creates a blank session with no logins. Always verify the profile directory matches `~/.gemini/antigravity-browser-profile` before navigating.

4. **Verify before navigating.** After launching, always check:
   ```bash
   curl -s http://127.0.0.1:9222/json/version | head -3
   ```
   And confirm `HeadlessChrome` is NOT in the User-Agent string.

5. **Never launch Chrome by hand for live DOM research — the Hermes CDP discovery is enough.** When a task requires reading platform architecture that lives in JS-rendered DOM (Threads.com nav, TikTok newsroom pages, Instagram Reels tab structure, X profile pages, etc.), the `browser_navigate` + `browser_snapshot` tools attach to the existing Chrome on port 9222 and render JS automatically. Spawning a second `Google Chrome --remote-debugging-port=9222` in a background terminal collides with the existing process (port already bound, SIGTERM kills your own session), and `--headless=new` + `--disable-gpu` may render but will be terminated on the next session boundary. **The right move is one of:**
   - **`browser_navigate(url)` first** — if it succeeds, the existing CDP Chrome is alive. Snapshot + `browser_console expression=...` extracts the rendered DOM/text.
   - **`curl` the URL directly** — many public product/help pages return server-rendered HTML that survives JS-disabled parsing. `python3 -c "..."` with regex strips scripts/styles and prints readable text. This is what works for `support.google.com`, `about.instagram.com`, `engineering.fb.com`, `newsroom.tiktok.com` (when not gated), `github.com/raw/...`.
   - **`curl` a `raw.githubusercontent.com` or `export.arxiv.org/api/query?...` URL** — for source code, papers, raw data.
   - **Only if both fail:** run `launch-antigravity-style-chrome.sh` once, but expect the user's primary Chrome may need to be closed first (Pitfall 2). Don't loop.

## Installed MCP Servers

Configured in `~/.hermes/profiles/<active-profile>/config.yaml` under `mcp_servers:`. Names below match the configured keys (the active profile's `config.yaml` is the source of truth; the table is a snapshot for quick reference).

| MCP Server | Command | Purpose |
|-----------|---------|---------|
| `notebooklm` | `npx -y notebooklm-mcp` | Google NotebookLM interaction |
| `mobbin` | `npx -y mobbin-mcp` | Mobbin design pattern search (apps, flows, screens, images) |
| `blender` | `npx -y blender-mcp` | Blender 3D modeling control |
| `rive` | `npx -y @rive-mcp/server-core` | Rive animation control |

### MCP Discovery Protocol (run before defaulting to non-MCP paths)

MCP tools appear in the agent's toolset as `mcp_<server>_<tool>` (e.g. `mcp_mobbin_get_screen_details`). If a task could plausibly be served by an installed MCP, run this check **before** falling back to browser clicks, raw `curl`, or manual work:

1. **Is it configured?** `cat ~/.hermes/profiles/<active-profile>/config.yaml | grep -A 4 'mcp_servers:'`. If the server is listed, it was intended to be available.
2. **Is it loaded in this session?** Scan the tool list at session start (or after `hermes mcp reload`) for `mcp_<server>_*` function names. Auto-loaded MCPs vary by session — the config says "available," the tool list says "active."
3. **If configured but not loaded**, the agent can start it as a sidecar: run the configured `command` in a background `terminal()` call, then either (a) `hermes mcp reload` and wait for the next turn, or (b) for auth-required servers, set the required env var from the active browser session's cookies and re-launch.
4. **Auth source.** Most MCPs that touch authenticated web apps take a cookie header via env var (e.g. `MOBBIN_AUTH_COOKIE`). Extract from the active browser via `browser_cdp(method="Storage.getCookies")` → filter by domain → join into `name=value; name=value; ...` format. Note that session cookies for the agent's primary domains (e.g. `mobbin.com`, `threads.com`) typically live in `~/.gemini/antigravity-browser-profile`, NOT in `~/Library/Application Support/Google/Chrome/` (which is the daily Mac Chrome).

> [!CAUTION]
> Do not assume an MCP is unavailable just because the SOUL.md or session preamble didn't enumerate its tools. Config + active toolset are the only reliable signals.

## Installed CLIs

| CLI | Location | Purpose |
|-----|----------|---------|
| `mobbin` | `/usr/bin/mobbin` | Mobbin design search from terminal |
| `hermes` | `~/.hermes/hermes-agent/venv/bin/hermes` | Hermes agent management |

## Python Environment

```bash
export PATH="$HOME/.local/bin:$HOME/.hermes/node/bin:$HOME/.hermes/hermes-agent/venv/bin:$PATH"
```

Key packages in venv:
- `playwright` 1.60.0 (with Chromium browser)
- `camoufox` 0.4.11 (anti-fingerprint Firefox)
- `playwright-stealth` 2.0.3

## Platform-Specific Notes

### ChatGPT
- Uses Cloudflare — requires Camoufox, not regular Playwright
- Image generation: navigate to chatgpt.com, type prompt, wait for image
- No API key needed — uses browser session cookies

### Wix
- Session covers manage.wix.com (editor dashboard)
- Can navigate to specific sites and edit via browser automation
- Complex SPA — use accessibility snapshots for element targeting

### Threads / Instagram
- Original session pattern — cookies from .instagram.com and .threads.com
- Used by content-hub-engine skill for posting and monitoring
- Cron jobs refresh engagement data automatically

### Google Services
- One Google account session covers: YouTube, NotebookLM, Veo, Drive
- Use `google-all-session.json` for cross-service access
- Multi-account: append `?authuser=0` or `?authuser=1` to URLs

### Kling AI
- Video/image generation platform
- Navigate to klingai.com, use creation tools via browser automation

### Dribbble
- Design inspiration and portfolio browsing
- Search shots, save to collections, browse designers

## Security

- All session files are `chmod 600` (owner-read only)
- Never commit session files to git
- Never log cookie values
- VM access restricted to SSH key authentication
- Cookies expire naturally — no permanent credential exposure

## Prompt Template for Other Agents

When handing off to another agent that needs to use browser sessions:

```
You have access to browser session files on the Hermes VM at
~/.hermes/<platform>-session.json. These are Playwright storage
state files containing authenticated cookies.

To use them:
1. SSH to the VM: ssh -i ~/.ssh/google_compute_engine franklawrencejr.@34.134.195.104
2. Set PATH: export PATH="$HOME/.local/bin:$HOME/.hermes/node/bin:$HOME/.hermes/hermes-agent/venv/bin:$PATH"
3. Load session in Python with playwright sync_api
4. For Cloudflare-protected sites (ChatGPT, LinkedIn), use camoufox instead of regular playwright

Available sessions: chatgpt, google, google-all, notebooklm, youtube,
dribbble, kling, mobbin, linkedin, medium, uxcel, threads, wix
```
