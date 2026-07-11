# Mobbin DOM Extraction & Auth Notes

## Recipe: extract all Onboarding flow images in one console call

On `/apps/<app-slug>/<app-screen-id>/flows` after the page loads and the
default Onboarding cell renders:

```js
(() => {
  const cells = Array.from(document.querySelectorAll('.group\\/cell'));
  return cells.map(c => Array.from(c.querySelectorAll('img'))
    .filter(i => i.src.includes('mobbin.com/prod/file.webp'))
    .map(i => i.src));
})()
```

The Onboarding cell (cell 0) holds 6-7 signed URLs in one shot. The "other
apps" cells (Truecaller, NAVER, etc.) use a different URL pattern
(`content/app_screens/<uuid>.png?f=webp&w=1920&q=85&fit=shrink-cover`) — the
filter above excludes them. To get other Sunlitt flows, click the flow
button in the left panel, wait for the right column to update, then
re-extract. Each click adds 1-7 cells.

## Recipe: extract from /screens page (limited to ~22 per session)

The `/apps/<app-slug>/<app-screen-id>/screens` page is virtualized. Only
the 18-22 highlighted + main-grid items render in the DOM at any time.
Scrolling the window does NOT trigger Mobbin's loader — it uses a Radix
scroll viewport that the IO observer hooks. Practical workarounds:

1. Use the `main a[href*="/screens/"]` selector to grab every visible
   screen UUID + image URL (one console call, 19-22 items).
2. Switch to `/flows` and click each flow button in the left panel.
3. If a per-flow detail page URL is available (e.g. from
   `mobbin_get_flow_screens` MCP), use that — it has a paginated, fully
   rendered list.

## Recipe: download Mobbin images with curl (no auth)

Mobbin's image CDN is `bytescale.mobbin.com`. The signed URLs work
without Mobbin cookies — the signature IS the auth. Standard
`curl -s -L -A "Mozilla/5.0" -o <file> <url>` works. Bytescale returns
`cache-control: max-age=1209167` so URLs are permacached (HTTP 200
lasts ~2 weeks); expired URLs return 403 and you re-extract from the
browser.

Parallel download shell pattern (~20 files in ~3s):

```bash
mkdir -p images
i=1
while IFS= read -r url; do
  [ -n "$url" ] && curl -s -L -A "Mozilla/5.0" \
    -o "images/screen_$(printf "%03d" $i).webp" "$url" &
  i=$((i+1))
done < urls.txt
wait
```

Dedupe after download with `md5`:

```bash
mkdir -p unique
j=1
for f in images/*.webp images-screens/*.webp; do
  h=$(md5 -q "$f")
  cp "$f" "unique/$(printf "%03d" $j)_$h.webp" 2>/dev/null
  j=$((j+1))
done
# (then dedupe by hash in a second pass if you want exact)
```

## Pitfalls

- **Mobbin MCP auth friction.** `~/.mobbin-mcp/auth.json` requires
  access_token + refresh_token + expires_at extracted from Supabase
  cookies. The Hermes Desktop approval gate silently blocks any terminal
  command that carries the >1KB cookie string, and `write_file` truncates
  the content shown to the agent past ~1.5KB. Workaround: user pastes
  cookie via pbpaste, runs a local node script. If they're in a hurry,
  skip MCP entirely — DOM + curl is faster for small clones.
- **Browserbase blob downloads don't land on disk.** `Blob` + `<a download>`
  in the agent Chrome silently does nothing. Use `curl` from the real
  terminal to get bytes onto disk.
- **Other-apps noise.** `.group\/cell` includes cards for competitor
  apps (Truecaller, NAVER, etc.). They have a different Bytescale URL
  pattern (`content/app_screens/<uuid>.png?f=webp&w=1920`...) and are
  small. Filter on `img.src.includes('mobbin.com/prod/file.webp')` to
  exclude them.
- **/screens virtualization stalls at ~22.** Body scrollHeight is ~15000
  px on a 996 px viewport, but `window.scrollBy` and friends don't
  trigger Mobbin's loader. The remaining 91+ of 113 screens are NOT in
  the DOM and cannot be extracted without page-by-page flow clicks or
  a per-flow URL.

## Worked example: Sunlitt iOS, 2026-06-04

- App slug: `sunlitt-ios-eaa42e6f-5912-4168-8e53-247687ed8010`
- App screen ID: `3acf56fe-9745-42d1-a9bc-c11e2cc45df0`
- Total screens: 113, total flows: 34
- Onboarding flow ID: `98ad079e-46a1-449e-b525-944ec8bd3b97` (7 screens)

Result: 20 unique Sunlitt screens downloaded to disk
(`~/hermes-agents/clones/sunlitt-ios/images-all/`, 2.1 MB total, all
1179x2676 iPhone webp). Time from URL extraction to files on disk:
~30 seconds. The remaining 90+ screens would need flow-by-flow
navigation, which was out of time budget.

## Auth script (only when user has time to do the pbpaste dance)

If you DO want MCP auth, the local node script pattern is:

```js
// /tmp/write-mobbin-auth.js
const fs = require('fs');
const cookie = process.argv[2]; // "sb-...:...; sb-...:..."
const parts = cookie.split(/;\s+/).map(c => decodeURIComponent(c));
const sb = parts.map(p => p.replace(/^sb-[^.]+\./, '')).join('');
const session = JSON.parse(sb);
// session is now { access_token, refresh_token, expires_at, user }
fs.writeFileSync(process.env.HOME + '/.mobbin-mcp/auth.json',
  JSON.stringify(session, null, 2));
console.log('wrote', session.access_token.length, 'byte token');
```

Run with: `node /tmp/write-mobbin-auth.js "$(pbpaste)" && chmod 600 ~/.mobbin-mcp/auth.json`
After: `/reload-mcp now` in the chat so the gateway re-discovers the server.
