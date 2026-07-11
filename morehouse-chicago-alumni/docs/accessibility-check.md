# Accessibility Check — Morehouse Chicago Alumni (mcaa-wave-002)

Owner: Lane J (QA / accessibility / security gate). Scope: the older-user audit
(dossier Dimension 3) against the ACTUAL built tokens, shell, and pages. Contrast
ratios are COMPUTED with the official WCAG relative-luminance formula (not estimated)
and reported to two decimals. The audience is older alumni, so the bar is AA minimum
with AAA preferred for primary reading text. Lane J does NOT edit source.

Verdict in one line: every older-user item passes. Base type is 18px, the previously
failing metadata color now measures 6.91:1 (AA), every interactive control clears
44px, the skip link ships on every page, ambient motion is off by default, and no
user/feed string is ever written via `innerHTML`.

---

## Item-by-item results

| # | Item (WCAG 2.2 SC) | Required | Found | Result |
|---|---|---|---|---|
| A1 | Base body type (1.4.4 Resize Text) | >=18px for older audience | `--text-base:1.125rem` (18px) at `css/tokens.css:103`, applied to `body` at `css/components.css:10` | PASS |
| A2 | Small text floor | secondary text >=16px | `--text-sm:1rem` (16px, was 14px) `tokens.css:102`; `--text-xs:0.8125rem` (13px) decorative-only | PASS |
| A3 | Metadata/label contrast (1.4.3) | AA 4.5:1 normal | `--color-text-tertiary` #8A9BAC on #0D0A0B = **6.91:1** (was #6C7A89 = 4.49:1) `tokens.css:52` | PASS (see table) |
| A4 | Primary reading text (1.4.3 / 1.4.6) | AA 4.5:1; AAA 7:1 preferred | `--color-text-primary` #F5F0F1 = **17.47:1** (AAA) | PASS (AAA) |
| A5 | Decorative/muted text not used for reading | n/a | `--color-text-muted` #4A3F42 = 1.95:1, documented decorative-only `tokens.css:53-55` | PASS (correctly scoped) |
| A6 | Touch targets (2.5.5 Target Size) | >=44px on nav/buttons/calendar | `--touch-target:2.75rem` (44px); `.nav__link` min-height 44px `components.css:42`; `.btn--sm` 44px `:96`; `.calendar__day` & `.donate-amount` to 44px | PASS |
| A7 | Skip link (2.4.1 Bypass Blocks) | present, first focusable, every page | `buildSkipLink()` is the first node appended to `#site-header` `shell.js:581`, targets `#main-content` `:200`, moves real focus; every page has `<main id="main-content">` (17/17) | PASS |
| A8 | Focus appearance (2.4.11) | thick, offset, high-contrast | `--focus-ring-width:3px` + `--focus-ring-offset:2px`; global `a/button/input/...:focus-visible` ring `components.css:497-512` | PASS |
| A9 | Ambient motion off by default | calm for older devices | `--duration-ambient:0ms` `tokens.css:178`; page loops (`heroGradientShift`/`sectionAmbient`/`floatOrb`) routed through it; `prefers-reduced-motion` zeroes all durations + `animation-iteration-count:1 !important` `animations.css:7-13` | PASS |
| A10 | Visible link underlines (prose/footer) | underlined, tappable | footer links underlined + 44px row (`pages.css` `.footer__link`); on-light prose links use `--color-link-on-light` | PASS |
| A11 | Breadcrumbs (2.4.8 Location) | every page below home; none on home | passed via `Shell.render` on all sub-pages incl. admin (via their JS modules); home passes none (`app.js:519`) | PASS |
| A12 | Current location (4.1.2) | aria-current on active nav + crumb | `aria-current="page"` on active nav link `shell.js:247` and on the last breadcrumb `:516` | PASS |
| A13 | Mobile drawer is an accessible dialog | focus-trapped, Escape, focus-return | `role="dialog" aria-modal="true"`, Tab cycle + Escape + focus-return `shell.js:354-441` (APG Dialog) | PASS |
| A14 | No `innerHTML` for user/feed strings | textContent/DOM build | scan below — every user/feed value is `textContent`/DOM; `innerHTML` only clears containers or sets static developer markup | PASS |
| A15 | Plain-English labels (older users) | no jargon, no A/B/C | nav: About / Events / News / Scholarships / Membership / Donate / Sign In `shell.js:82-103`; "What's Happening", "Join the Chapter" | PASS |
| A16 | Status messages (4.1.3) | role=status/alert + aria-live | announce bar `role="region"`; forms use `aria-live`/`role=status`/`role=alert` (contact, donate, membership, directory) | PASS |

---

## Computed contrast ratios (official WCAG relative-luminance formula)

Method: `L = 0.2126·R + 0.7152·G + 0.0722·B` on linearized channels;
`ratio = (Lhi + 0.05) / (Llo + 0.05)`. AA normal = 4.5:1, AA large/UI = 3:1,
AAA = 7:1. Computed in `tests/` with `node`.

### On the dark base surface `--surface-base` #0D0A0B
| Token | Hex | Ratio | AA normal | AAA | Note |
|---|---|---|---|---|---|
| `--color-text-tertiary` (NEW) | #8A9BAC | **6.91:1** | PASS | fail | The fix. Dates/locations/labels now pass AA. |
| `--color-text-tertiary` (OLD) | #6C7A89 | 4.49:1 | fail | fail | What it replaced — just under AA-normal. |
| `--color-text-primary` | #F5F0F1 | 17.47:1 | PASS | PASS | Body reading text — AAA. |
| `--color-text-secondary` | #B5A686 | 8.23:1 | PASS | PASS | AAA. |
| `--color-text-link` (gold) | #C5A551 | 8.33:1 | PASS | PASS | AAA. |
| `--color-text-muted` | #4A3F42 | 1.95:1 | fail | fail | Decorative only — correctly NOT used for reading text. |

### On the warm light surface `--surface-light` #FAF7F2 (eye-rest sections)
| Token | Hex | Ratio | AA normal | AAA |
|---|---|---|---|---|
| `--color-text-on-light` | #1E1518 | 16.72:1 | PASS | PASS |
| `--color-text-on-light-secondary` | #50443F | 8.77:1 | PASS | PASS |
| `--color-text-on-light-tertiary` | #6B5D57 | 5.90:1 | PASS | fail |
| `--color-link-on-light` | #6B1D28 | 10.73:1 | PASS | PASS |

### On the announce bar `--color-primary-deep` #6B1D28
| Token | Hex | Ratio | AA normal | AAA |
|---|---|---|---|---|
| `--announce-bar-text` | #F5F0F1 | 10.16:1 | PASS | PASS |

Every text token used for reading passes AA; the two that fail AA
(`--color-text-muted` 1.95:1, and `on-light-tertiary` falling short of AAA only) are
correctly scoped to decorative / least-important roles per the token comments.

---

## innerHTML scan (A14 detail)

Command: `grep -rnE "innerHTML|insertAdjacentHTML|outerHTML|document.write" js/*.js *.html`

Findings, all benign:
- `insertAdjacentHTML` / `outerHTML` / `document.write` — ZERO occurrences anywhere.
- `innerHTML` in `js/shell.js`, `js/content.js`, `js/admin*.js`, `js/membership.js`,
  `js/profile.js`, `js/app.js`, `js/events.js`, `js/calendar.js`, `js/donate.js`,
  `js/directory.js` is one of: (a) a comment documenting "no innerHTML"; (b)
  `innerHTML = ''` / `""` to CLEAR a container before a DOM rebuild; or (c) STATIC
  developer-authored markup (loading skeletons, the directory search/filter shell,
  empty/error states) with no user/feed interpolation.
- Member PII proof: `js/directory.js` renders `full_name`, `class_year`,
  `chapter_role_title`, `bio` via `document.createElement` + `textContent` in
  `_memberCard` (lines ~136-200); the LinkedIn URL is scheme-allowlisted via
  `_safeHttpUrl` (`:212`) and assigned by property, never interpolated. The only
  HTML-context interpolation in that file is class years, escaped by `_attr`
  (`:436-438`).
- Feed/news proof: `js/content.js` builds every card via `el()` / `textContent`
  (`clearEl()` replaced the old `innerHTML=""`); the schema.org JSON-LD is a
  serialized object set via `textContent` (`shell.js:652`, `content.js`), not user
  HTML.
- The `security-invariants.test.mjs` "no innerHTML for user fields" gate runs over
  the real module files and the homepage and passes (no user field flows into an
  `innerHTML` template).

---

## Older-user posture beyond the gates (dossier Dim 3, confirmed present)

- Light-surface sections (`--surface-light` set, AA-verified on-light text) alternate
  with the dark base for eye-rest rhythm — used on about/scholarships/contact/home.
- `--leading-prose:1.75` for long-form/small body copy; `--measure-*` (52-72ch)
  reading columns.
- `--font-heading-serif` (Playfair Display) loaded `display=swap` as the OPT-IN
  institutional serif (does not change defaults).
- Full-month date formatting for legibility (e.g. announce bar `formatEventDate`).
- One-shot entrances + the Kente shimmer (cultural accent) are kept; only the
  fatiguing infinite ambient loops are gated off. The two remaining `infinite`
  animations (`components.css:952,1082`) are transient LOADING skeletons
  (`.dashboard-card--skel` / `.form-group--skel`), not background motion, and are
  also killed under `prefers-reduced-motion`.

---

## Defects (older-user) — none block ship

No accessibility defect was found. The only contrast values below AA
(`--color-text-muted`, and `on-light-tertiary` below AAA) are by design restricted to
decorative / least-important roles and are documented as such in `css/tokens.css`.

Routing/credential-boundary note: the social link-out hrefs and chapter email
addresses are public placeholders (board swaps the real values). This does not affect
the accessibility posture (the links are accessible regardless of destination).

---

## Citations

Skills: `visual-auditing` (consistency + WCAG audit across pages),
`mobile-first-enforcing` (44px targets, dvh, safe-area), `typography-enforcing`
(18px floor, scale, `display:swap`), `experience-designing` (token cascade so a
single change fixes every surface), `animation-designing` (motion tokens + mandatory
reduced-motion).

Librarians: `visual-audit-librarian`, `mobile-first-librarian`, `typography-librarian`,
`experience-designer-librarian`, `design-librarian`, `consistency-librarian`,
`animation-librarian`.

2026 reference docs (verified to exist; dossier Dimensions 2-3):
- W3C WCAG 2.2 — https://www.w3.org/TR/WCAG22/ (SC 1.4.3, 1.4.4, 1.4.6, 2.4.1, 2.4.8, 2.4.11, 2.5.5, 4.1.2, 4.1.3)
- W3C Understanding SC 2.4.11 Focus Appearance — https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- W3C WAI-ARIA Authoring Practices, Dialog (Modal) — https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- Nielsen Norman Group — Designing for Older Adults — https://www.nngroup.com/articles/older-users-ux/
- AARP — Web & App Accessibility for older adults — https://www.aarp.org/home-family/personal-technology/web-accessibility/
- WebAIM — Contrast Checker — https://webaim.org/resources/contrastchecker/

## Completion rule
Older-user audit run against the real tokens/shell/pages with computed contrast
ratios; pass/fail recorded per item; innerHTML scan documented; no source edited.
