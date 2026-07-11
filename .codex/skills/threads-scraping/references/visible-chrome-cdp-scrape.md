# Visible Chrome CDP Threads Scrape Pattern

Use this when Frank already has Threads open in the shared Chrome window on port `9222` and explicitly wants the scraper to use that browser session.

## Why

The standard Threads scraper may launch its own Playwright browser. That is fine for headless runs, but it can confuse Frank when he is looking at an already-open Chrome window and expects the scrape to happen there.

## Agent Browser Rules (mandatory)

| Rule | Value |
|------|-------|
| Profile | `~/.gemini/antigravity-browser-profile` |
| Port | `9222`, CDP `http://127.0.0.1:9222` |
| Launch | `~/Downloads/skills-library-v2 2/hermes-setup/scripts/launch-antigravity-style-chrome.sh` |
| Never use | `chrome-debug-profile`, `chrome-agent`, daily Chrome Application Support |
| Never touch | Frank's daily Chrome (different profile, no conflict) |
| HOME override | The launch script resolves `$HOME` to the Hermes profile sandbox. Always pass `HOME="/Users/franklawrencejr."` |

### Launching the Agent Browser

```bash
# Preferred: via the launch script with HOME override
HOME="/Users/franklawrencejr." \
  "/Users/franklawrencejr./Downloads/skills-library-v2 2/hermes-setup/scripts/launch-antigravity-style-chrome.sh"

# Direct launch (if script unavailable)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="/Users/franklawrencejr./.gemini/antigravity-browser-profile" \
  --disable-fre --no-default-browser-check --no-first-run
```

Wait for CDP ready: `curl -s http://127.0.0.1:9222/json/version`

### If Chrome on 9222 Crashes During Scrape

If the scraper crashes Chrome (ECONNREFUSED on 9222), **relaunch with the same profile** — do NOT switch to a different profile. The GrazzHopper Threads login lives in `~/.gemini/antigravity-browser-profile`. Switching profiles loses the session and forces a re-login.

```bash
# Re-launch on 9222 with the correct profile
HOME="/Users/franklawrencejr." \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="/Users/franklawrencejr./.gemini/antigravity-browser-profile" \
  --disable-fre --no-default-browser-check --no-first-run
```

**NEVER** kill Frank's daily Chrome to make room. Both Chrome instances coexist because they use different user-data-dirs.

### Launch Script HOME Override Pitfall

The `launch-antigravity-style-chrome.sh` script resolves `$HOME` at runtime. When called from Hermes Desktop, `$HOME` is the Hermes profile sandbox (`~/.hermes/profiles/<name>/home/`), NOT `/Users/franklawrencejr./`. This causes Chrome to use a wrong profile directory that has no GrazzHopper login.

**Always pass the real HOME:**
```bash
HOME="/Users/franklawrencejr." \
  "/Users/franklawrencejr./Downloads/skills-library-v2 2/hermes-setup/scripts/launch-antigravity-style-chrome.sh"
```

Or launch Chrome directly with the explicit `--user-data-dir` to avoid the HOME issue entirely:
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="/Users/franklawrencejr./.gemini/antigravity-browser-profile" \
  --disable-fre --no-default-browser-check --no-first-run
```

## Preferred CDP Scrape Sequence

1. Confirm the visible browser is a preview/control surface only unless the scraper attaches to CDP.
2. Attach to the existing Chrome via Playwright CDP:

```python
browser = playwright.chromium.connect_over_cdp('http://127.0.0.1:9222')
contexts = browser.contexts
pages = [page for ctx in contexts for page in ctx.pages]
page = next((p for p in pages if 'threads.' in p.url), None)
```

3. Register `page.on('response', on_response)` before reload/scroll.
4. Reload the existing Threads page to capture fresh JSON API responses.
5. Scroll with `page.mouse.wheel(0, 1600)` and wait between scrolls.
6. Reuse the existing recursive post parser and vertical matching logic.
7. Write the same cache target: `~/.hermes/threads/cache/<account>_feed.json`.

## Pitfalls

- Do not tell Frank the visible Chrome is being scraped if the script launched a separate browser.
- Browser snapshots are useful for preview only. They are not enough for the reply package because they can miss links, timestamps, dedupe, quotes, and shares.
- If the user says the browser is already open, prefer CDP attach before installing or launching another browser.
- Keep the reply package short and action-oriented after scrape success.
- **Never switch browser profiles** after a crash. Always relaunch with the same `~/.gemini/antigravity-browser-profile`.
- **Never pkill all Chrome.** Only kill processes matching `remote-debugging-port=9222`. Frank's daily Chrome must stay untouched.
- **Never use `pkill -f chrome` or `pkill chrome`** — this kills Frank's daily Chrome too. Target only: `pkill -f "remote-debugging-port=9222"` or `pkill -f "antigravity-browser-profile"`.

### page.reload() Crashes CDP-Attached Pages

Calling `page.reload()` on a CDP-attached page can invalidate the Playwright
page handle, causing `TargetClosedError` on subsequent operations. This is a
Playwright-over-CDP limitation — the browser navigates away from the tracked
page object.

**Workarounds (pick one):**
1. Use `page.goto(page.url, ...)` instead of `page.reload()` — less likely to
   invalidate the handle.
2. Wrap reload in try/except with reconnect logic — re-connect to CDP and
   re-acquire the page handle from the browser contexts.
3. Catch the error in the scroll loop and skip to the next scroll after
   reconnecting.

If the Chrome process itself died (ECONNREFUSED on 9222), relaunch Chrome
before retrying — using the **same profile**, not a different one.

### Gemini Sidebar Steals Snapshot Focus

The Antigravity Chrome profile may have the Gemini extension active. When
taking `browser_snapshot`, the active tab might be the Gemini sidebar instead
of the Threads tab. Fix: use `Target.getTargets` to find the Threads tab by
title/URL, then `Target.activateTarget` to switch, or use CDP `Runtime.evaluate`
with `target_id` to run JS directly on the Threads tab.

## Output after scrape

After scrape or cache read, provide:

- Table with **separate metric columns** (not smushed): `@user | snippet | likes | replies | reposts | quotes | link`
- **No "fit" column** — the user evaluates fit themselves
- Sort by engagement (likes descending) as default
- Pick 5-10 posts worth engaging
- 3 short human reply drafts per picked post
- Which account to post from if relevant
- For video posts: text snapshots can't show video content. Use `browser_vision` to inspect the thumbnail, or ask the user what the video shows rather than guessing
