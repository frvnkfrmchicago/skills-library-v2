---
name: live-teardown-librarian
description: Tear down a LIVE external app — running in the user's already-open browser — to model-and-improve, never to copy. Attaches over CDP to the open Chrome tab, walks the real platform (screens, states, flows) clicking into detail views, MEASURES real computed values from the DOM (avatar px, connector width/color, grid template, gaps, font sizes, media aspect rules), then runs IAAA (Identify → Adapt → Augment → Apply) to produce a measured TEARDOWN SPEC whose Augment column is what makes ours better. Works for ANY live app. The spec is the yield.
last_updated: 2026-06-15
version: v1
protocol: anti-skimming-v3
---

# Live Teardown Librarian

**Role**: You tear down a LIVE, running external app to understand exactly how it is built — measured, not eyeballed — and turn that into a spec for building something BETTER in our own world. Never a 1:1 clone.

**The gap this fills**: Three sibling librarians look like they cover this. None do.

| Sibling | What it does | Why it's not this |
|---------|--------------|-------------------|
| [app-scanner-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/app-scanner-librarian.md) | Discovers the architecture of YOUR OWN codebase from the filesystem (routes, states, systems) | Reads your source on disk. Cannot touch a competitor — you don't have their code. |
| [clone-mobbin-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/clone-mobbin-librarian.md) | Copies a Mobbin flow gallery into working code, 1:1 | Source is Mobbin's static screenshots, and the goal is an exact clone — the opposite of model-to-improve. |
| [mobbin-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/mobbin-librarian.md) | IAAA adaptation of proven patterns | Source is again Mobbin, and it adapts at the pattern level — it never measures a live competitor's running DOM. |

This librarian is the only one that **attaches to a live competitor app in the running browser, measures its real computed DOM, and yields a model-to-improve spec.** It borrows app-scanner's WALK discipline and mobbin-librarian's IAAA spine, but its source is a live tab and its differentiator is MEASUREMENT.

**Goal**: A measured **TEARDOWN SPEC** (markdown), in the format defined below, that any builder can act on cold.

---

## TL;DR

| Phase | What you do | Output |
|-------|-------------|--------|
| ATTACH | `chromium.connect_over_cdp("http://127.0.0.1:9222")` to the user's already-open browser; find the `type:"page"` tab by URL; `bring_to_front()` | A live `page` handle on the real tab |
| WALK | Enumerate the platform live like app-scanner (screens, states, flows) — CLICK into detail views (post detail, compose, profile, search, activity), screenshot each to `/tmp`, scroll to load virtualized content | Screen inventory + screenshots |
| MEASURE | Extract REAL computed values from the DOM via `page.evaluate` — avatar px, connector width/color, grid template, gaps, font sizes, media aspect rules | Measured-mechanics table |
| IAAA | Identify → Adapt → Augment → Apply over every measured mechanic | The TEARDOWN SPEC |
| VERIFY | Confirm every mechanic carries a measured value and an Augment that is an improvement, not a copy | Definition-of-Done pass |

**Works for ANY app.** Threads, Instagram, a SaaS dashboard, a bank — the protocol is identical. The spec is the yield, not the screenshots.

---

## Context Questions

> **STOP** — Before attaching, you MUST know:
> 1. **Is the target already open in the user's browser?** This librarian ATTACHES; it never launches. If the tab isn't open, ask the user to open it.
> 2. **Is the browser running with `--remote-debugging-port=9222`?** CDP attach needs the debug port live on `127.0.0.1:9222`.
> 3. **What is the target URL (or URL substring)?** You match the tab by URL — you don't open one.
> 4. **What is OUR world?** The Augment column is meaningless without knowing the product we're improving toward (its brand, mechanics, constraints). For GrazzHopper that is the purple/smoke world; read the project memory before writing the Augment.
>
> If you cannot answer #1 and #2, surface that as the one blocker and stop — do not fall back to computer-use, do not launch a second browser.

---

## Phase 1 — ATTACH, NEVER LAUNCH

You connect to the browser the user already has open. You never open a second browser, and you never use computer-use.

**BECAUSE** the user is logged in, has real content on screen, and has arranged the tab they want torn down. Launching a fresh browser throws all of that away and lands you on a logged-out wall.

```
1. chromium.connect_over_cdp("http://127.0.0.1:9222")   ← attach to the running browser
2. Enumerate contexts → pages; find the page whose URL contains the target substring
3. page.bring_to_front()                                 ← surface the right tab, do not create one
4. Confirm page.url() matches before doing anything else
```

> [!CAUTION]
> If no `type:"page"` tab matches the target URL, STOP and ask the user to open it. NEVER `new_page()` / `goto()` a fresh tab as a workaround — that defeats the "attach to their session" guarantee and often hits a login wall. NEVER reach for computer-use even if it is loaded.

---

## Phase 2 — WALK (live, like app-scanner — but in the browser, not on disk)

Enumerate the platform the way app-scanner enumerates routes — except the source is the live DOM, not the filesystem. You do not have their code, so you walk their running app.

**BECAUSE** an inventory built from the top-level feed alone misses 30–40% of the real surface — detail views, compose affordances, activity modals, and empty/loaded states live one click deep.

```
FOR EACH primary surface (home/feed, detail, compose, profile, search, activity, nav):
  1. Navigate to it by CLICKING the real in-app affordance (not by typing a URL)
  2. Scroll to load virtualized content — most feeds mount only viewport rows
  3. Screenshot the surface to /tmp/teardown-<app>-<surface>.png
  4. CLICK into the detail view (open a post, open compose, open the activity modal,
     open a profile, run a search) — the detail view is where the real mechanics live
  5. Screenshot each detail/state to /tmp
  6. Note every interaction state you can trigger: default, loading, loaded, empty,
     hover/focus, selected, expanded
```

Record the inventory as you go:

```markdown
| Surface | Sub-state(s) reached | Screenshot | Notes |
|---------|----------------------|------------|-------|
| Home | For you / Following | /tmp/...home.png | tab switch is a segmented control |
| Post detail | replies loaded, quote card | /tmp/...detail.png | reply = full post unit stacked |
| Compose | toolbar, add-to-thread, reply-options | /tmp/...compose.png | topic selector at top |
```

> [!IMPORTANT]
> Click into detail views. A feed thumbnail tells you a card exists; only the detail view tells you how the reply tree, the connector, the quote card, and the activity modal are actually constructed.

---

## Phase 3 — MEASURE (the differentiator)

This is what separates a teardown from a vibe. You extract REAL computed values from the live DOM via `page.evaluate` — `getComputedStyle`, `getBoundingClientRect`, `naturalWidth/Height`. Numbers, not adjectives.

**BECAUSE** "small avatar, thin line" is unbuildable. "36px avatar in a 48px gutter, 2px connector at rgba(0,0,0,0.15)" is a spec a builder can hit on the first try.

What to measure on every surface you walked:

| Mechanic | What to read off the DOM | How |
|----------|--------------------------|-----|
| Avatar | width/height px, border-radius, the gutter column it sits in | `getBoundingClientRect`, `getComputedStyle` |
| Reply connector | width px, color (resolve `rgba`), where it anchors | `getComputedStyle().borderLeft` / pseudo-element / `backgroundColor` |
| Layout grid | `grid-template-columns`, `gap`, column widths | `getComputedStyle().gridTemplateColumns` / `gap` |
| Typography | `font-size`, `line-height`, `font-weight` per role | `getComputedStyle` on the heading/body/meta nodes |
| Spacing | padding/margin of the card, gaps between units | `getComputedStyle` |
| Media | rendered aspect ratio, `border-radius`, crop behavior, `naturalWidth/Height` vs rendered | `getBoundingClientRect` + `img.naturalWidth` |
| Controls | sizes/labels of compose toolbar, sort menus, modal rows | `getBoundingClientRect`, `textContent` |

Output a measured-mechanics table where every row has a NUMBER or a resolved color — never "looks ~medium."

---

## Phase 4 — IAAA: Identify → Adapt → Augment → Apply

This is the same spine as the [mobbin-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/mobbin-librarian.md) IAAA, with the second A reframed for live teardown: where mobbin-librarian *Analyzes*, here you **Augment** — you name the thing that makes ours BETTER, because the input is already a measured live mechanic and the whole point is model-to-improve.

```
1. IDENTIFY  — the measured mechanic (the number/color/rule from Phase 3)
2. ADAPT     — the decision that maps it into OUR world (our brand, scale, constraints)
3. AUGMENT   — the improvement that makes ours better than theirs (NOT a copy)
4. APPLY     — the build checklist item(s): component, tokens, states, file targets
```

> **GATE** — A mechanic may not enter the spec until it has all four: a measured Identify, an Adapt decision, a named Augment that is genuinely an improvement, and an Apply checklist line. A row with an empty Augment is a clone, not a teardown — reject it.

The spec table:

```markdown
| Mechanic (IDENTIFY, measured) | ADAPT (to our world) | AUGMENT (why ours is better) | APPLY (build checklist) |
|-------------------------------|----------------------|------------------------------|-------------------------|
| 36px avatar in 48px gutter, 2px connector @ rgba(0,0,0,0.15) | same geometry, connector tinted to our purple | connector intensity tracks heat-state, not a flat line | <ReplyThread> connector token; cold/active variants |
```

---

## Teardown Spec — Output Format

Every run of this librarian produces ONE markdown spec with these sections, in order:

```markdown
# <App> Teardown — <year>

## 1. Attach + Walk log
- Attached tab URL, surfaces walked, screenshot paths in /tmp

## 2. Screen Inventory
| Surface | Sub-states | Screenshot | Notes |

## 3. Measured Mechanics
| Mechanic | Measured value (px / color / grid / ratio) | Where measured |
- Every row carries a number or a resolved color.

## 4. Algorithm / ranking (if observable or publicly documented)
- Cite the public source; never invent weights.

## 5. Media rules
| Rule | Measured / documented value |

## 6. IAAA — Identify → Adapt → Augment → Apply
| Mechanic (measured) | Adapt | Augment (our improvement) | Apply (checklist) |

## 7. Definition of Done
- Checklist (below) all green.
```

---

## NEVER

- **NEVER** launch a browser — ATTACH over CDP to the one the user already has open.
- **NEVER** open a second tab / `new_page()` / `goto()` the target as a workaround for a missing tab — ask the user to open it instead.
- **NEVER** use computer-use, even if it is loaded — DOM-aware CDP only.
- **NEVER** eyeball a value — every mechanic in the spec carries a measured number or a resolved color from `getComputedStyle` / `getBoundingClientRect` / `naturalWidth`.
- **NEVER** ship a spec row with an empty Augment — that's a clone, and this librarian models-to-improve, never copies 1:1.
- **NEVER** invent algorithm weights — cite the public source or mark the row "observed behavior, not documented."
- **NEVER** skip the detail-view click — feed thumbnails don't reveal reply-tree, connector, quote-card, or activity-modal construction.
- **NEVER** screenshot without scrolling first — virtualized feeds mount only viewport rows; you'll miss most of the surface.
- **NEVER** write the Augment column without knowing OUR world (read the project memory first).

---

## Definition of Done

- [ ] Attached over CDP to the user's already-open tab (URL confirmed); no second browser, no computer-use.
- [ ] Every primary surface walked: home/feed (+ its tabs), detail, compose, search, activity, nav.
- [ ] Detail views clicked into; interaction states (default/loading/loaded/empty/selected/expanded) noted.
- [ ] Screenshots saved to `/tmp` and referenced in the spec.
- [ ] Measured-mechanics table: every row has a real number or resolved color from the DOM.
- [ ] Algorithm/media sections cite public sources or mark observed-vs-documented.
- [ ] IAAA table complete: every measured mechanic has Adapt + a named Augment + an Apply line.
- [ ] Every Augment is a genuine improvement, not a restatement of theirs.
- [ ] Spec written in the Output Format above and saved as a doc.

---

## Reference Implementation — Playwright probe (attach + find tab + screenshot + measure)

```python
from playwright.sync_api import sync_playwright

TARGET = "threads.com"   # URL substring of the tab to tear down

with sync_playwright() as p:
    # PHASE 1 — ATTACH, NEVER LAUNCH
    browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")

    # find the type:"page" tab whose URL matches the target — do NOT open one
    page = None
    for ctx in browser.contexts:
        for pg in ctx.pages:
            if TARGET in pg.url:
                page = pg
                break
        if page:
            break
    if page is None:
        raise SystemExit(f"No open tab matches {TARGET!r}. Ask the user to open it — do not launch a browser.")

    page.bring_to_front()
    print("attached:", page.url)

    # PHASE 2 — WALK: scroll to load virtualized rows, then screenshot to /tmp
    page.mouse.wheel(0, 4000)
    page.wait_for_timeout(600)
    page.screenshot(path="/tmp/teardown-threads-home.png", full_page=False)

    # PHASE 3 — MEASURE: read REAL computed values off the live DOM
    measured = page.evaluate(
        """
        () => {
          const px = el => el ? el.getBoundingClientRect() : null;
          const cs = el => el ? getComputedStyle(el) : null;

          const avatar = document.querySelector('img[alt*="profile" i], a[href*="/@"] img');
          const post   = avatar ? avatar.closest('article, [role="article"], div') : null;
          const grid   = post ? cs(post) : null;

          // reply connector: a thin vertical rule between stacked post units
          const connector = document.querySelector('[style*="border-left"], [class*="connector"], [class*="line"]');

          const media = document.querySelector('article img:not([alt*="profile" i]), article video');

          return {
            avatar:     avatar ? { w: px(avatar).width, h: px(avatar).height, radius: cs(avatar).borderRadius } : null,
            gutterGrid: grid ? { cols: grid.gridTemplateColumns, gap: grid.gap, pad: grid.padding } : null,
            connector:  connector ? { borderLeft: cs(connector).borderLeft, bg: cs(connector).backgroundColor, w: px(connector).width } : null,
            heading:    (() => { const h = post && post.querySelector('a[href*="/@"]'); const c = cs(h); return c ? { size: c.fontSize, weight: c.fontWeight, lh: c.lineHeight } : null; })(),
            media:      media ? { rw: px(media).width, rh: px(media).height, radius: cs(media).borderRadius, natW: media.naturalWidth || null, natH: media.naturalHeight || null } : null,
          };
        }
        """
    )
    print(measured)   # → feeds the Phase-3 measured-mechanics table verbatim
```

This is the canonical pattern: attach to the running browser, locate the real tab by URL, screenshot to `/tmp`, and `page.evaluate` the live DOM into measured numbers. Swap `TARGET` and the selectors for any app — the protocol does not change.

---

## Related Librarians

- [app-scanner-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/app-scanner-librarian.md) — the WALK discipline (screens/states/flows). Scans YOUR OWN code on disk; this librarian walks a LIVE competitor in the browser instead.
- [mobbin-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/mobbin-librarian.md) — the IAAA spine. Adapts patterns from Mobbin; this librarian measures a live running DOM and reframes the second A as Augment (model-to-improve).
- [clone-mobbin-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/clone-mobbin-librarian.md) — the opposite end: exact 1:1 clone from a Mobbin gallery. Use that when the goal is to copy; use THIS when the goal is to measure-and-beat.
