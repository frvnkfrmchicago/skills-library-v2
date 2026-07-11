---
name: clone-mobbin-librarian
description: >
  Alias wrapper for the Clone Mobbin Librarian persona. Use when the user
  wants to clone an app from Mobbin into working code. The user will provide
  a Mobbin flows URL. This librarian handles the browser navigation, screen
  extraction, and code generation. Distinct from the Mobbin Librarian which
  does IAAA pattern adaptation — this one does exact structural cloning.
  Use ALSO when Frank says "clone from mobbin", "download mobbin screens",
  "clone the app", or asks to capture a whole app from mobbin.com.
  When Frank asks for an A/B test of cloning approaches, run 2-3 cheap paths
  and report measured numbers (time, screens, failures) — do not describe
  options as a comparison matrix.
---

# Clone Mobbin Librarian

## Fast Path: Mobbin MCP (check FIRST)

Before any per-screen browser clicking, check whether the `mobbin` MCP is loaded. If `mcp_mobbin_*` tools are available in your toolset, use them — they collapse 100+ browser clicks into a handful of structured calls.

Discovery protocol (run before assuming browser-only):
1. Read `~/.hermes/profiles/<active-profile>/config.yaml` → look under `mcp_servers` for `mobbin:`. If present, the server is *configured* (may or may not be *running* in this session).
2. Scan your tool list for any `mcp_mobbin_*` function names. If present, use them.
3. If configured but not loaded, the agent can start it manually. There are two auth paths — try the env-var one first, fall back to writing the auth file:

### Path A — env-var (faster, no disk write)
Extract the `sb-*-auth-token.0` + `.1` cookies from the active browser via `browser_cdp(method="Storage.getCookies")`, filter by `domain: "mobbin.com"`, join into a `name=value; name=value; ...` cookie header string, set as `MOBBIN_AUTH_COOKIE` env var, then run `npx -y mobbin-mcp` in the background.

### Path B — write `~/.mobbin-mcp/auth.json` (when env-var path fails or you want a persistent session)
The MCP server reads auth from a JSON file at this path. The file must contain these top-level fields:

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": 1780557096,
  "refresh_token": "...",
  "user": { "id": "...", "email": "..." }
}
```

**Important shape notes (discovered 2026-06):**
- The `access_token` is the *full JWT* (~1400 chars), not a shortened version. Truncating it causes silent auth failures — the MCP will start but every call returns 401.
- The auth-store schema requires `access_token` + `refresh_token` + `expires_at` to all be present and truthy. Missing any one → `readStoredSession()` returns `null`.
- Supabase cookies come chunked: `sb-ujasntkfphywizsdaapi-auth-token.0` and `.1` (chunk size 3180 bytes per the `@supabase/ssr` default). Join them, strip the `base64-` prefix from the first chunk, `atob()` decode, `JSON.parse`. The resulting object IS what goes into `auth.json`.
- After writing, `chmod 600 ~/.mobbin-mcp/auth.json` — file mode 0o600 is set by the writer, but a manual write via `write_file` defaults to 0o644. The `readStoredSession` check tolerates this, but the `writeStoredSession` helper enforces 0o600 for hygiene.
- Reload MCP with `hermes mcp reload` (or `/reload-mcp now` in Desktop) so the gateway rediscovers the tools.

### How to extract the session from the active browser
```js
// In the active browser DevTools console:
const p = 'sb-ujasntkfphywizsdaapi-auth-token';
const ch = [];
for (let i = 0; ; i++) {
  const v = document.cookie.split('; ').find(c => c.startsWith(p + '.' + i + '='));
  if (!v) break;
  ch.push(decodeURIComponent(v.split('=').slice(1).join('=')));
}
const session = JSON.parse(atob(ch.join('').replace(/^base64-/, '')));
copy(JSON.stringify(session));  // user pastes into terminal
```

The user then writes it to disk. **Approval-gate warning:** long base64 strings (the full session is ~4 KB encoded) often trip the Hermes destructive-command gate. If your write command is blocked, ask the user to paste-and-pipe it themselves rather than rephrasing the command — the gate will keep blocking any tool that handles the same payload.

**Do not default to clicking when an MCP path exists.** The per-screen clicking workflow below remains the fallback for when the MCP is unavailable AND the user does not have time for auth setup (see "Time-pressure fallback" below).

### Time-pressure fallback
If the user signals "no time" or "just do it from the browser" — drop auth setup entirely. The MCP path is *quality-of-life*, not a hard requirement. The browser fallback can extract every screen image and flow ID directly from a logged-in session. This is the documented "no-auth" path and it's what `pattern-referencing` does by default.

## Browser Fallback: Flow DOM Structure (verified 2026-06)

When extracting screens from a Mobbin flow page (`/apps/<app-id>/<app-version>/flows`) via `browser_console`, the right column has flow "cells" with this structure:

```html
<div class="group/cell relative isolate flex flex-col ...">
  <!-- One cell per flow. Find the Onboarding one by walking the DOM
       from the "Onboarding" + "N screens" text element. -->
  <img src="https://bytescale.mobbin.com/...?enc=..." />  <!-- 1 per screen, NOT wrapped in <a> -->
  <!-- ... other screens ... -->
</div>
```

**Critical DOM facts that wasted time in real sessions:**

1. **The right-column screen images are NOT wrapped in `<a>`** — they are clickable spans/divs that open a modal. Don't waste cycles calling `img.closest('a')` looking for hrefs. The `<a>` tags you DO find with `closest('a')` are the "Other apps" cards in the sidebar (Truecaller, NAVER, App Store, etc.), not the flow previews.

2. **To find the Onboarding cell:** walk the DOM from the "Onboarding" text element. Its containing `<div class="group/cell">` is the right one. The left nav uses the same flow names but different cell structure.

3. **Image src pattern:** `https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/file.webp?enc=1.<...>.<signature>.<token>` — these are **signed URLs with a TTL** (typically ~5 minutes). Download them immediately if persistence matters, or pass them directly to the cloning pipeline.

4. **All 7 screens in a flow link to the same flow URL** (`/flows/<flow-uuid>`) — not individual screen URLs. To get the flow UUID, look for the `<a href="/flows/...">` inside the cell. Individual screen UUIDs are NOT exposed in the rendered HTML.

5. **After clicking anything in Mobbin, recheck `location.href` before reading page state.** A click on a flow header that should "expand" can fire a navigation in a different tab. In one real session, clicking inside Mobbin ended up navigating a different tab to a Wix editor. Always verify the active URL matches the intended domain.

**Verification recipe (use this exact form):**
```js
(() => {
  const cell = document.querySelectorAll('.group\\/cell')[0]; // first cell = first flow
  const imgs = Array.from(cell.querySelectorAll('img'));
  return {
    count: imgs.length,
    flowHref: cell.querySelector('a[href*="/flows/"]')?.getAttribute('href'),
    screenUrls: imgs.map(i => i.src),
  };
})()
```

For the full DOM/auth reference including the `auth.json` exact shape, the Supabase cookie reconstruction recipe, and the approval-gate failure mode, see `references/mobbin-dom-and-auth.md`.

---

This is an alias wrapper. Read the full librarian file for instructions:

```
/Users/franklawrencejr./Downloads/skills-library-v2 2/librarians/clone-mobbin-librarian.md
```

## When to Activate

- User says "clone this app" or "clone from Mobbin"
- User provides a Mobbin flows URL
- User asks to replicate an app's design as working code
- User mentions Mobbin cloning (not adapting)

## What This Does

1. Takes a Mobbin flows URL
2. Uses the browser agent to navigate the left-panel flow tree
3. Clicks into each individual screen detail view
4. Extracts visual details from every screen
5. Generates working code (HTML / Next.js / Vite+React)
6. Applies design tokens, components, animations, mobile-first, and anti-mock skills

## Quality Standards — Non-Negotiable

These are hard rules enforced by the user. Violating any one means the clone gets deleted and trust is lost.

1. **CLONE = interactive HTML prototype, NOT a gallery.** Never suggest screenshot extraction, image grids, or "browsable gallery" as the output. The output is real markup (buttons, inputs, cards, navigation bars) that a user can interact with. The user has rejected the gallery approach explicitly multiple times.

2. **Minimum 30 screens.** Eight screens is a stub, not a clone. Plan for 30+ from the start.

3. **Animations must be UNIQUE to each app.** Never reuse transition/animation patterns from a previous clone. Swiggy ≠ Sunlitt ≠ Hems. Each app has its own motion language — study the actual screens on Mobbin and build animations that reflect *that* app's design. Copying a slide-opacity pattern across all clones defeats the purpose.

4. **No "jump screens" or keyboard shortcuts as navigation.** Keyboard shortcuts (1-8 to jump between screens) are a dev convenience that make the prototype feel fake. Navigation must be through real UI — button clicks, tab bars, back arrows — the same way a user would interact with the actual app.

5. **No placeholder shapes or decorative corners.** Random geometric shapes in corners, generic icons, or filler visuals are immediately rejected. Every visual element must correspond to something in the actual app.

6. **Do not cut corners.** The user terminates agents that cut corners. If the app has 113 screens on Mobbin, study enough of them to faithfully reconstruct the experience. Skipping screens, reusing markup patterns without adaptation, or rushing the prototype to "done" will result in deletion.

## What This Does NOT Do

- Does NOT do IAAA adaptation — use `mobbin-librarian` for that
- Does NOT use Stitch or screenshot-to-code tools
- Does NOT use emojis — only SVG icons
- Does NOT produce galleries, screenshot collections, or image grids — always interactive HTML prototypes

## Reference Project: Swiggy Clone (canonical example)

The swiggy-clone at `~/Downloads/skills-library-v2 2/swiggy-clone/` is the **canonical reference** for what a finished Mobbin clone looks like. Structure:

```
swiggy-clone/
├── index.html    (573 lines — all screens as <section class="screen" id="screen-X">)
├── style.css     (1410 lines — design tokens, screen-specific styles, bottom nav)
├── app.js        (492 lines — history stack, navigation, deep links, live clock)
└── screens/      (Vite+React gallery — optional evolution of the static prototype)
```

Every screen is **fully reconstructed HTML/CSS** — not downloaded images displayed in an `<img>` tag. Buttons, inputs, cards, navigation bars are real markup that the user can interact with. The swiggy-clone has 8 functional screens (onboarding → OTP → location → home → search → restaurant detail → cart → tracking).

**Use this pattern when building a Mobbin clone:**
1. Extract screen images from Mobbin (Bytescale URLs → parallel curl)
2. Study each screen's layout, components, and interactions
3. Build `index.html` + `style.css` + `app.js` with real markup, not image galleries
4. Each screen is a `<section class="screen" id="screen-X">` with the `.active` class toggled by JS
5. Navigation uses a history stack (`const screenStack = [...]`) with forward/back transitions
6. Bottom nav appears/hides per screen (auth screens hide it, home tabs show it)
7. Design tokens in `:root` CSS variables, not hardcoded values

## Pitfalls (session-tested)

### file:// protocol blocks external scripts
When the clone is opened via `open index.html` (file:// URL), `<script src="app.js">` silently fails — no error, no execution, just a blank screen with all sections at `opacity: 0`. **Always inline the JS** directly into `index.html` with a `<script>...</script>` block. Alternatively, serve via `npx serve .` for http:// which loads external scripts fine.

### Click-through verification, NOT screenshots
The STOP GATE is verified by **clicking through** the clone: navigate to each screen, query DOM state (`document.querySelector('.screen.active').id`), call functions, check that interactive elements work. Do NOT use `browser_vision` screenshots to verify — the user explicitly rejected that approach. Check:
- Each screen becomes `.active` when navigated to
- Bottom nav visibility toggles correctly
- Interactive elements (buttons, toggles, inputs) are functional
- Data renders (clock, sun position, card counts)

### Reusing animations across clones is a hard rejection
Each clone must have animations and motion language unique to *that* app. Swiggy uses bottom-sheet slide-ups and horizontal scroll feeds. Sunlitt uses orbital arcs and sun-position color shifts. Hems has its own patterns. Do NOT copy-paste CSS transitions, @keyframes, or JS animation logic from one clone to another. Study the actual app's screens on Mobbin, identify its specific motion language, and build fresh. The user explicitly called out that reusing animation patterns between clones makes the work "useless" and "not applicable."

### Bytescale CDN needs no auth
Signed Bytescale image URLs from Mobbin are self-authenticating. `curl -sI <url>` returns 200 with `cache-control: max-age=1209167` (14 days). No cookies, no tokens, no referer header needed. This is the fastest extraction path: extract URLs from DOM → parallel curl in ~30 seconds.

### The /screens page stalls at ~22 items
Mobbin's /screens page uses virtualized infinite scroll that `window.scrollBy` cannot trigger. The /flows page loads all flow cells immediately. Prefer /flows for bulk extraction — click each flow in the left panel to expand its cells, then extract all URLs in one pass.

## Reference: Session-tested recipes

See `references/mobbin-dom-and-auth.md` for:
- One-call Onboarding flow extraction
- /screens page virtualization workaround
- Parallel-curl download pattern (no auth, signed URLs are the auth)
- MCP auth friction pitfalls and the pbpaste+node fallback
- Worked Sunlitt iOS clone (2026-06-04, 20/113 screens, 30s download)
- Does NOT mix cloning and customization in the same step
