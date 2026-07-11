# Lane A — Design System & Shared Shell
Status: complete · Wave: mcaa-wave-002 · Batch: 1 (foundation) · Owner: Design-Shell Agent
Single source of truth: this file.

## Explainer
This lane built the foundation every page now stands on: one shared navigation, footer,
breadcrumb trail, announce bar, and skip link — produced by a single `js/shell.js` and injected
into `#site-header` / `#site-footer` placeholders. That kills the four mismatched, hand-rolled nav
copies the prior build carried (dossier Dimension 2) and gives every page identical, accessible
chrome with correct `aria-current`, a focus-trapped mobile drawer, and schema.org breadcrumbs.
Alongside it, the design-token system was retuned for an OLDER alumni audience (dossier Dimension 3):
18px body baseline, a contrast-fixed metadata color that now passes WCAG AA, 44px+ touch targets on
every interactive control, infinite ambient motion turned OFF by default, plus new light-surface,
pull-quote, and prose components for dignified visual rhythm. The result is proper, professional, and
calm — not a childish grid of giant buttons and not a long marketing scroll.

## TL;DR
- `js/shell.js` (new): documented `Shell.render({ page, breadcrumbs })`. Renders skip link → announce
  bar (next future event) → unified nav (public / member / admin states from `window.Auth` with a
  cached-`Store._session` fallback) → focus-trapped mobile drawer → schema.org breadcrumbs → footer
  (Chapter / Members / External columns + Instagram / Facebook / LinkedIn plain link-outs). All
  dynamic strings are built with `textContent` / DOM nodes — never `innerHTML`.
- `css/tokens.css`: `--text-base` → 1.125rem (18px); `--color-text-tertiary` → `#8A9BAC` (passes AA);
  small steps lifted above the 16px floor; added `--touch-target-xl`, `--space-touch-gap`,
  `--focus-ring-*`, `--leading-prose`, `--measure-*`, the `--surface-light` set, `--announce-bar-*`,
  `--font-heading-serif` (Playfair Display), `--nav-height` → 80px, `--duration-ambient: 0ms`,
  `--shell-offset`.
- `css/animations.css`: ambient loops routed through `--duration-ambient` (off); one-shot entrances,
  Kente shimmer, line-draw, and stat counters kept; added `.skip-link`.
- `css/pages.css`: the three page-level ambient loops (`heroGradientShift`, `sectionAmbient`,
  `floatOrb`) routed through `--duration-ambient`; footer links underlined + made tappable; donate
  amount chips given a 44px floor.
- `css/components.css`: focus-visible upgraded to the thick `--focus-ring-*` tokens; `.nav__link`,
  `.btn--sm`, `.calendar__day`, `.donate-amount` brought to 44px; added `.announce-bar`, full unified
  nav / account-menu / mobile-drawer styling, `.breadcrumbs`, `.section--light`, `.pull-quote`,
  `.prose`, and token-backed text utilities.

| Field | Value |
|---|---|
| Mission | The shared shell + accessible token system the whole platform consumes. |
| Owned | `css/tokens.css`, `css/components.css`, `css/pages.css`, `css/animations.css`, `js/shell.js` (new) |
| Did not touch | any `.html` page, any `js/*` except `js/shell.js`, `supabase/**` |
| Inputs read | `docs/research/MOREHOUSE-PLATFORM-RESEARCH-DOSSIER.md` Dimensions 2 & 3; current `css/*`; `js/auth.js` (auth states) + `js/store.js` (events for the announce bar) |
| Validation | Node DOM harness rendered the shell in all three auth states (44/44 assertions pass): skip link → `#main-content`, nav `aria-label="Primary"`, announce bar shows the NEXT future event, drawer is an `aria-modal` dialog, breadcrumbs = Home › Events with `aria-current=page`, footer link-outs use `rel="noopener noreferrer"`, member hides Admin / admin shows it, BreadcrumbList JSON-LD injected. WebAIM-documented `--color-text-tertiary` AA pass. `node --check js/shell.js` clean. Every `var(--token)` resolves (212 tokens). |
| Done | All four token/animation/component tasks + the documented `Shell.render({page,breadcrumbs})` API complete; skip link + announce bar + light-surface + pull-quote components exist. |

## Build tasks
- [x] tokens.css: `--text-base:1.125rem`; `--color-text-tertiary:#8A9BAC`; added `--touch-target-xl`, `--space-touch-gap`, `--focus-ring-width/offset/color/shadow`, `--leading-prose:1.75`, `--measure-body/prose/narrow`, `--surface-light` set (+ on-light text + link colors), `--announce-bar-*`, `--font-heading-serif` (Playfair Display loaded with `display=swap`), `--nav-height:80px`, `--duration-ambient:0ms`, `--shell-offset`.
- [x] animations.css: `glowAmbient` + `floatBadge` → `var(--duration-ambient)` (off, hold resting frame); one-shot entrances, Kente shimmer `@keyframes`, line-draw, stat counters kept; added `.skip-link` (reveal-on-focus, 44px, thick ring).
- [x] pages.css (owned): `heroGradientShift`, `sectionAmbient`, `floatOrb` → `var(--duration-ambient)`; `.footer__link` underlined + 44px row; `.footer__bottom` link color lifted off `--color-text-muted`; `.donate-amount` 44px floor + focus ring.
- [x] components.css: focus-visible → `--focus-ring-*`; `.nav__link` / `.btn--sm` / `.calendar__day` / `.donate-amount` 44px; `.announce-bar`, unified `.nav__group` / `.nav__actions` / `.nav__account` (menu) / `.nav__drawer` (focus-trap) / `.breadcrumbs`, `.section--light`, `.pull-quote`, `.prose`, text utilities, `.visually-hidden`.
- [x] `js/shell.js`: `Shell.render({page,breadcrumbs})` (+ `Shell.refresh()`, `Shell.ROUTES`) builds nav (states via `Auth` → cached `Store._session`), footer (Chapter / Members / External + social link-outs), breadcrumbs (schema.org BreadcrumbList + JSON-LD twin), announce bar (next future event from `Store.get(STORAGE_KEYS.EVENTS)`, dismissible), skip link; injects into `#site-header` / `#site-footer`; `aria-current="page"`, nav `aria-label="Primary"`, mobile drawer focus-trap + Escape-to-close + focus-return; account menu Escape + outside-click close with self-detaching listeners.

## Work performed
| # | Change | File | Why (source) |
|---|---|---|---|
| 1 | Body baseline 16→18px; small steps lifted (`--text-sm` 14→16px, `--text-xs` 12→13px); `--text-lg/xl` re-stepped monotonic | `css/tokens.css` | Older-user readability — NN/g Older Adults, AARP, WCAG 2.2 SC 1.4.4 |
| 2 | `--color-text-tertiary` `#6C7A89`→`#8A9BAC` (~3.8:1→~5.2:1) | `css/tokens.css` | Metadata/labels failed AA — WebAIM Contrast Checker |
| 3 | Added focus-ring, touch-xl + touch-gap, leading-prose, measure, surface-light set, announce-bar, serif font, shell-offset tokens; `--nav-height` 72→80px; `--duration-ambient:0ms` | `css/tokens.css` | WCAG 2.2 SC 2.4.11 + 2.5.5; eye-rest rhythm; calmer motion |
| 4 | Playfair Display added to the font `@import` (`display=swap`) | `css/tokens.css` | Institutional serif option — Google Fonts Playfair |
| 5 | Ambient infinite loops (`glowAmbient`, `floatBadge`) routed through `--duration-ambient`; `.skip-link` added | `css/animations.css` | Reduce motion fatigue — NN/g Older Adults; WCAG 2.2 SC 2.4.1 (skip link) |
| 6 | Page ambient loops (`heroGradientShift`, `sectionAmbient`, `floatOrb`) gated; footer links underlined + tappable; donate chips 44px | `css/pages.css` | Same motion/contrast/target rationale |
| 7 | Focus-visible → thick offset ring tokens; nav/btn/calendar/donate to 44px; announce bar, unified nav, account menu, focus-trapped drawer, breadcrumbs, light section, pull-quote, prose, text utilities | `css/components.css` | WCAG 2.2 SC 2.4.11 / 2.5.5; W3C APG Dialog; Dim 3 components |
| 8 | New `Shell.render({page,breadcrumbs})` — unified shell, all DOM via `textContent` | `js/shell.js` | Dim 2 IA/nav; data-contract §9 #8 (no innerHTML for feed/user strings) |

## Files changed (exact paths)
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/css/tokens.css`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/css/animations.css`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/css/pages.css`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/css/components.css`
- `/Users/franklawrencejr./Downloads/skills-library-v2 2/morehouse-chicago-alumni/js/shell.js` (new)

## Commands run (read-only / no servers, no bundlers)
| Command | Purpose | Result |
|---|---|---|
| `node --check js/shell.js` | Syntax-validate the shell | PARSE OK |
| `node /tmp/shell-harness.js` (temp DOM shim, deleted after) | Render shell in public/member/admin | 44/44 assertions PASS |
| `python3` token-resolution scan over components/animations/pages vs tokens.css | No dangling `var(--token)` | OK — all resolve, 212 tokens defined |
| `grep` audits (innerHTML / emoji / time-language / A-B-C / stripe) on owned files | Hard-gate self-check | Clean (matches were comments, date-format options, or `--table-stripe` zebra token) |

## Shell API contract (page lanes call exactly this)
```js
// After Store.init() and Auth.init():
Shell.render({
  page: 'events',                       // route key → active nav item + aria-current="page"
  breadcrumbs: [{ label: 'Events' }]    // Home is auto-prepended; last item = current (no href)
});
// Shell.refresh()  — repaint after a sign-in/out without re-passing opts.
// Shell.ROUTES     — the label/href map (single source of truth for nav + footer).
```
- Placeholders the page must include: `<div id="site-header"></div>`, `<div id="site-footer"></div>`,
  and a `<main id="main-content">` (the skip-link target).
- Route keys: `home, about, events, news, scholarships, membership, donate, signin, dashboard,
  my-membership, directory, profile, my-events, admin`. Plain-English nav labels:
  About · Events · News · Scholarships · Membership · Donate (button) · Sign In/Account.
- Auth: `public` → Sign In; `member` → account menu (Dashboard / My Membership / Alumni Directory /
  My Profile / Sign Out); `admin` → same menu + Admin entry. Read from `window.Auth`, never written.
- Layout contract: the shell sets `--shell-offset` (nav, or nav + announce bar) and a
  `body.shell-has-breadcrumbs` flag. When breadcrumbs are present the shell's bar owns the top
  clearance, so the page's `<main>` should NOT also add the offset; pages without breadcrumbs pad
  `<main>` with `var(--shell-offset)`.

## Remaining gaps (handoffs, not blockers)
- Page lanes (D–I) must add the two placeholders + the `<script src="js/shell.js"></script>` tag and
  call `Shell.render(...)`. No lane may hand-roll nav markup (evidence-contract G4).
- External footer hrefs (Instagram / Facebook / LinkedIn handles) are public-destination placeholders
  pending the board's real handles (credential boundary). They are plain `rel="noopener noreferrer"`
  link-outs — swapping the URL is a one-line change in `SOCIAL` / `FOOTER_EXTERNAL`.
- The announce bar reads chapter events from the `Store` cache; once Supabase is connected and events
  hydrate, the bar repaints automatically (it listens on `Store.on(STORAGE_KEYS.EVENTS)`).
- `Shell.ROUTES` points `signin` → `signin.html`, `dashboard` → `dashboard.html`, etc.; the page
  lanes that own those files should keep filenames in sync (the dossier's 21-page IA uses these).

## Hard-gate status (this lane)
- G4 File ownership — PASS. Only the five owned files changed; shared nav/footer come solely from
  `js/shell.js`.
- G5 Accessibility — PASS. 18px base; `--color-text-tertiary` fixed to ~5.2:1; 44px+ on
  nav/buttons/calendar/donate; skip link first; footer/prose links underlined; ambient motion off by
  default; zero `innerHTML` for dynamic strings (all `textContent`/DOM).
- G6 Routing — PARTIAL (shell side complete). Shell provides breadcrumbs + shared nav for every page,
  News is in the nav as "News" (`content.html`). Per-page wiring belongs to lanes D–I.
- G7 No emojis / no time-language / no A-B-C — PASS on owned files (verified by grep).
- G8 Citations — PASS (below: skills + librarians + 2026 URLs).

## Task-sheet row
| Lane | Status | Files | Validated | Gaps |
|---|---|---|---|---|
| A — Design System & Shared Shell | complete | `css/tokens.css`, `css/animations.css`, `css/pages.css`, `css/components.css`, `js/shell.js` | Node DOM harness 44/44 across public/member/admin; `node --check` clean; token-resolution clean (212); contrast/target/motion per WCAG 2.2 | Page lanes add placeholders + script + `Shell.render()`; board supplies real social handles |

## Citations
Skills (Skills Library V2, verified present in `.claude/skills/`):
- `experience-designing` — token cascade architecture (single source of truth; raw values are debt).
- `typography-enforcing` — token-based scale, 16px body floor, `display: swap`, hierarchy check.
- `mobile-first-enforcing` — 44px targets + ≥8px gap, `min-width` queries, `dvh`, safe-area insets.
- `animation-designing` — motion tokens, hardware-accelerated transforms, mandatory reduced-motion.
- (cross-checked) `visual-auditing`, `consistency-checking` — token-usage + visible-state audits.

Librarians (verified present in `librarians/`):
- `experience-designer-librarian`, `typography-librarian`, `mobile-first-librarian`,
  `visual-audit-librarian`, `design-librarian`, `consistency-librarian`, `animation-librarian`.

2026 sources applied (from the dossier master index, Dimensions 2 & 3):
- W3C WCAG 2.2 — https://www.w3.org/TR/WCAG22/ (SC 1.4.4 Resize Text; 2.5.5 Target Size; 2.4.1 Bypass Blocks).
- W3C Understanding SC 2.4.11 Focus Appearance — https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- W3C WAI-ARIA Authoring Practices, Dialog (Modal) — https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- Nielsen Norman Group — Designing for Older Adults — https://www.nngroup.com/articles/older-users-ux/
- Nielsen Norman Group — Breadcrumb Navigation — https://www.nngroup.com/articles/breadcrumb-navigation-useful/
- Nielsen Norman Group — Navigation: You Are Here — https://www.nngroup.com/articles/navigation-you-are-here/
- AARP — Web & App Accessibility for older adults — https://www.aarp.org/home-family/personal-technology/web-accessibility/
- WebAIM — Contrast Checker — https://webaim.org/resources/contrastchecker/
- Google Fonts — Playfair Display — https://fonts.google.com/specimen/Playfair+Display
- schema.org — BreadcrumbList — https://schema.org/BreadcrumbList

## Completion rule
Rewritten in place with Explainer, TL;DR, tables (work / files / commands), the Shell API contract,
remaining gaps, exact paths, hard-gate status, task-sheet row, and Citations.
