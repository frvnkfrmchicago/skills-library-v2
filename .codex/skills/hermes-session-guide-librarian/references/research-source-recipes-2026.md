# Research source recipes — what actually works in Hermes to fetch 2026 platform architecture

Condensed from a real session (June 2026) where the goal was "research how Threads / YouTube Shorts / TikTok actually work, ground every claim in a real URL." The lesson: most product and engineering content is reachable with `curl` + a Python regex; JS-rendered DOM requires the existing CDP Chrome; only the few blocked sources need a different path.

## Tier 1 — `curl` directly, server-rendered HTML, no auth required

These return real content on the first request. Strip `<script>`/`<style>`/`<nav>`/`<footer>` with regex, print the inner text. Source-grounded, no fabrication.

### Tier 1a — Engineering blogs (architecture)

```bash
curl -s -L -o /tmp/meta_eng.html 'https://engineering.fb.com/2023/11/how-meta-built-threads-in-5-months/'
curl -s -L -o /tmp/x_algo.html 'https://raw.githubusercontent.com/twitter/the-algorithm-ml/main/projects/home/recap/README.md'
```

- `engineering.fb.com/<YYYY>/<MM>/<slug>/` — Meta's real engineering write-ups. Returns full article HTML with code blocks, date, author. Title and H2 anchors give the architecture.
- `raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>` — exact file content from any public repo. Use this for open-source rankers, SDK source, model configs. The X `the-algorithm-ml` repo's `recap/README.md` is the published Heavy Ranker weight table.
- `engineering.fb.com/category/<category>/` — full post list; grep for `[Thread, Reels, ranking, recsys, embed]` to find real post URLs.

### Tier 1b — Official product / policy pages

```bash
curl -s -L -o /tmp/yt.html 'https://support.google.com/youtube/answer/10059070'
curl -s -L -o /tmp/reels.html 'https://about.instagram.com/features/reels'
curl -s -L -o /tmp/tiktok.html 'https://www.tiktok.com/safety/en/policies-and-engagement/recommendation-system'
```

**Rule (Frank's call): support/help center pages are product copy, not architecture.** Use them only for the **product behavior** they describe (e.g. "Shorts views count starts to play or replay with no minimum watch time"). They do NOT tell you the ranker weights or the candidate-pool algorithm. For that you need Tier 1a (engineering blog) or Tier 2 (Chrome-rendered JS).

### Tier 1c — arXiv (papers, raw metadata)

```bash
curl -s 'http://export.arxiv.org/api/query?search_query=all:short+video+recommendation+system&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending'
```

- Returns Atom XML. Parse `<entry>` blocks for `<title>`, `<summary>`, `<published>`, `<author><name>`.
- **Always read the abstract before citing the paper.** Frank caught me citing `arxiv.org/abs/2502.02545` as "Pinterest KDD 2025 cold-start prior" — the actual paper is "Optimal Spectral Transitions in High-Dimensional Multi-Index Models" (unrelated). Title-scanning is not enough; read 200 words of the abstract first.

### Tier 1d — open-source repos (algorithms, weights, configs)

```bash
curl -s 'https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>'
```

- Used for X's heavy ranker, ByteDance monolith, Meta DLRM, etc.
- **The real numbers are in the README or a `weights.py` / `config/defaults.yaml`**, not in marketing blog posts. Always `curl` the source.

## Tier 2 — Chrome CDP (existing 9222), `browser_navigate` + `browser_snapshot`

Use when the page returns a JS SPA shell (Threads.com, TikTok newsroom SPA, X profile pages). The existing CDP Chrome on `127.0.0.1:9222` renders JS automatically and `browser_snapshot` returns the rendered DOM.

### Workflow

```
1. browser_navigate(url="https://example.com/path")
2. browser_snapshot(full=true)  → text-based DOM with ref IDs
3. browser_console expression="JSON.stringify({article: document.querySelector('article')?.innerText})"  → real innerText
```

### Pitfalls

- **`browser_console` runs against the current tab.** If you navigated elsewhere, the expression evaluates against the new page. Always snapshot first.
- **One Chrome on 9222, period.** Don't launch a second `Google Chrome --remote-debugging-port=9222` in a background terminal — port conflict. Use what's already there.
- **bot detection** ("stealth_warning: Running WITHOUT residential proxies") is informational, not blocking. Modern Cloudflare-protected sites still respond to Hermes' CDP Chrome with full DOM.
- **Login walls.** Threads.com, Instagram, X all show a login wall when unauthenticated, but the public nav, brand-account profiles, and the first ~5 posts of any public user still render. That's enough for product-shape research. For authenticated views, the cookies live in `~/.gemini/antigravity-browser-profile` (Mac) or `~/.hermes/threads-session.json` (VM). See the parent SKILL.md for session-file capture.

## Tier 3 — sources that fail and need an honest blocker

- **NYT / WSJ articles (paywall)** — HTTP 403, only headline + lede in HTML. Don't cite beyond the headline.
- **Reddit `/r/MachineLearning/comments/...`** — "Please wait for verification" challenge page in 2026. The actual content is reachable only via API auth.
- **`research.bytedance.com`** — sometimes DNS-blocked from this VM. Fall back to `tiktok.com/safety/.../recommendation-system` (Tier 1b — the public safety docs are the only architecture ByteDance confirms).
- **`research.google/pubs/youtube-8m/`** — returns 404 in 2026; the paper is real but the canonical URL changed. Search arXiv (`arxiv.org/abs/1904.06614` is one real YouTube-8M paper).
- **Mobbin MCP** — `refresh_token_already_used` is unrecoverable without `npx mobbin-mcp auth`. Don't loop the search; surface the blocker once and ask the user.

## What NOT to do (lesson learned this session)

- **Don't dispatch parallel research subagents that depend on `web_search` / `web_extract` when those tools aren't wired in.** The subagents will silently return "tools unavailable" with no research. Verify the tool surface first.
- **Don't cite a YouTube Help Center or Meta Help Center page as "architecture."** Product copy confirms behavior; it does not ground algorithm design.
- **Don't cite a paper from its title alone.** Read 200 words of the abstract. Title ≠ topic for ML papers (multi-task learning, embeddings, multi-index models — many overlap).
- **Don't repeat the same menu ("Build it / Hold / Edit lane N") turn after turn after the user has confirmed they're not building.** Once the user says "no building," stop re-asking. Save the menu for the final delivery, or fold it into the plan doc itself.

## Standard session-end checklist (this class of task)

1. **Self-assessment table** in the doc with file:line evidence per surface (sad-librarian Pitfall 4). No prose "I assessed it."
2. **Honest "what I CAN cite vs what I CAN'T" section** (Section 9 in the G2 TV plan). Cite URLs I fetched; mark "[ungrounded]" for what I can't.
3. **Per-lane citations with the distilled rule applied** — not just "we cite X" but "X says Y, so we do Z."
4. **No fabricated URLs.** Every cite is a real `curl` or Chrome-rendered page from this session, with the exact quote shown in the doc.
5. **No re-asking the same question** ("build / hold / edit"). Once paused, stay paused until the user moves.
