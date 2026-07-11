# Lane D — Homepage Router & Public Core Pages
Status: complete · Wave: mcaa-wave-002 · Batch: 2 · Owner: Homepage Router & Public Core Agent (Lane D)
Single source of truth: this file.

## Explainer
The owner rejected the prior homepage as a long-scroll brochure: About, Leadership, Donate, Events,
Scholarships, Gallery, Partnerships, News, Membership, and Contact were all anchor sections stacked
inside one `index.html`, with an inline Stripe checkout block and a sign-in modal floating over the
scroll (dossier Dimension 2). Lane D turns the homepage into a **router** — a short page whose only job
is "who we are, what's happening, where to go next" — and pulls About, Scholarships, and Contact into
their own standalone pages. Every page now renders the **shared shell** (Lane A: one nav + footer +
breadcrumb + skip link), and the homepage's giving CTA uses the **PayPal seam** (Lane B), not Stripe.

## TL;DR
- `index.html` is now a router: short hero (identity + exactly two actions) → "What's Happening" strip
  (Next Event live · Latest News live from `content_items` with the `HBCU_NEWS` fallback · Scholarships)
  → conditional sign-in / "Welcome back" panel → a PayPal donation block → shared footer. The inline
  Stripe checkout block, the donation/membership Stripe wiring, the sign-in modal, and the
  partnerships/gallery/leadership brochure sections are **gone**.
- New `about.html`, `scholarships.html`, `contact.html` — each on the shared shell with breadcrumbs and
  a light-surface section for eye-rest rhythm.
- `js/app.js` gained a homepage-only `HomePage` controller that calls `Shell.render({page:'home'})`,
  builds the live strips with `textContent`/DOM nodes (no `innerHTML` for feed strings), and renders the
  PayPal Smart Buttons against `paypal-checkout`.

| Field | Value |
|---|---|
| Mission | A homepage that directs people; standalone public pages; no Stripe, no long scroll. |
| Owned | `index.html`, `about.html` (new), `scholarships.html` (new), `contact.html` (new), `js/app.js` (homepage logic) |
| Did not touch | `js/shell.js`, `css/*`, `js/store.js`/`auth.js`/`config.js`, other lanes' pages/js, `supabase/**` |
| Inputs used | dossier Dim 2 & 5; Lane A `Shell.render()` contract (`js/shell.js` header); Lane B `docs/payment-contract-paypal.md` §3–§4; Lane C live `content_items` query pattern (`js/content.js`) |

## Work completed
| Task | Status | Evidence |
|---|---|---|
| `index.html` → router | done | Short `hero--router` (overrides the 100vh brochure hero) with exactly two actions: "Join the Chapter" → `membership.html`, "View Upcoming Events" → `events.html`. "What's Happening" strip with Next Event + Latest News + Scholarships cards. Conditional `#account-panel`. PayPal donation block. Brochure sections removed. |
| Shared shell wired | done | `<div id="site-header">` + `<main id="main-content">` + `<div id="site-footer">`; loads `js/shell.js`; `App`/`HomePage` call `Shell.render({page:'home'})` after `Store.init()`+`Auth.init()`. No hand-rolled nav/footer markup remains in any owned file. |
| Inline Stripe removed | done | `grep -rni "stripe"` over owned files returns nothing. The old `Checkout` object, `handleMembership`, `handleDonation`, `create-checkout-session` invoke, `openSignIn`/`signin-modal` are all deleted. |
| PayPal seam wired | done | Homepage donation renders `paypal.Buttons` whose `createOrder` POSTs `paypal-checkout` `{purpose:'donation', amount_cents, designation:'scholarship'}` and returns `data.order_id`; trust line shown verbatim. SDK loaded with `window.PAYPAL_CLIENT_ID` (browser-safe; documented `PAYPAL_CLIENT_ID` placeholder) + `currency=USD&intent=capture`. When the SDK/backend is not yet wired, a graceful note routes to `donate.html`. |
| Live news + fallback | done | `HomePage.loadLatestNews()` reads `content_items` (`approval_status in (approved,auto_approved)`, `order published_at desc`, `limit 4`) when `SUPABASE_CONFIGURED`; otherwise `window.HBCU_NEWS.slice(0,4)`. "View All News" → `content.html`. |
| `about.html` (new) | done | Chapter history + mission (light-surface `mission-grid`) + leadership board built live from `Store.get(MEMBERS)` (board roles only, `textContent` DOM build), breadcrumbs `[{label:'About'}]`, shell, cross-link row. |
| `scholarships.html` (new) | done | Program overview + how-it-works (light surface) + recipients (live from `SCHOLARSHIP_RECIPIENTS`, DOM build, anti-mock "pending board approval" honored), "Donate to the Scholarship Fund" → `donate.html`, "Apply for a scholarship" → `contact.html`, breadcrumbs `[{label:'Scholarships'}]`, shell. |
| `contact.html` (new) | done | Accessible contact form (labels + `autocomplete` + `aria-live` status; degrades to a `mailto:` handoff by category — no blocking `alert()`), category emails, and a "Follow the Chapter" row of plain social link-outs (`target=_blank rel="noopener noreferrer"`, no widgets — dossier Dim 5), breadcrumbs `[{label:'Contact'}]`, shell. |
| `js/app.js` homepage init | done | New `HomePage` IIFE controller (guarded to the homepage); `App.initDonation` made idempotent and `aria-pressed`-aware; existing `App` object (used by other pages) left intact. Re-renders the panel + dispatches `shell:auth` on auth change. `node --check js/app.js` passes. |

## Files changed
| Path | Change |
|---|---|
| `index.html` | Rewritten as a router. Header/main/footer placeholders + `js/shell.js`; short hero (2 actions); "What's Happening" strip; conditional account panel; PayPal donation block + SDK loader (browser-safe client id); page-scoped `<style>` (tokens only, reuses `.section--light`/`.donate-amount`). Removed: inline Stripe block, donation/membership Stripe JS, sign-in modal, partnerships/gallery/leadership/sponsorship brochure sections. |
| `about.html` | New. Shell + breadcrumbs; history, mission (light surface), live leadership board, cross-links. |
| `scholarships.html` | New. Shell + breadcrumbs; overview, how-it-works (light surface), live recipients, donate/apply CTAs. |
| `contact.html` | New. Shell + breadcrumbs; form (accessible, mailto handoff), category emails, social link-out row. |
| `js/app.js` | Added `HomePage` controller (live news + fallback, next event, conditional panel, PayPal buttons, DOM/textContent build); idempotent `initDonation` with `aria-pressed`. |

## Commands run (verification)
| Command | Result |
|---|---|
| `grep -rni "stripe" index.html about.html scholarships.html contact.html js/app.js` | no matches (G1) |
| `grep -rn "service_role\|sk_live\|whsec_\|PAYPAL_CLIENT_SECRET\|PAYPAL_WEBHOOK_ID" <owned>` | no matches (G2) |
| `grep -rnE "innerHTML\s*=" <owned>` | no matches — every dynamic value is `textContent`/DOM (G5) |
| `grep -o "site-header\|site-footer\|main-content\|js/shell.js\|Shell.render(...)" <each page>` | present on all four pages; breadcrumbs on about/scholarships/contact, none on home (G6) |
| `grep -niE "id=\"partnerships\"\|id=\"gallery\"\|id=\"leadership\"\|sponsorship\|membership-card\|hero__stats" index.html` | no matches — brochure body removed |
| `node --check js/app.js` | syntax OK |

## Validation against the brief
- Homepage answers "who / what / where next" without a long scroll: hero (who) → What's Happening (what) → account panel + footer nav (where next). Brochure sections pulled into standalone pages.
- `#site-header`/`#site-footer` placeholders + `js/shell.js` on every owned page; `Shell.render` route keys used: `home`, `about`, `scholarships`, `contact`.
- Homepage news reads live `content_items` (4 latest) with the `HBCU_NEWS` fallback when `SUPABASE_CONFIGURED` is false.
- No Stripe block remains; the membership/donate CTAs use the PayPal contract (`paypal-checkout` → `order_id` → `paypal.Buttons`); the full giving page (`donate.html`, Lane G) carries Zelle/check.
- Standalone pages have breadcrumbs; "View All News" → `content.html`; plain-English, older-user labels throughout.

## Hard-gate status (99-EVIDENCE-CONTRACT.md)
- **G1 No Stripe remnants** — PASS. No `stripe` token, no Stripe SDK/keys, no `create-checkout-session` in any owned file.
- **G2 Secrets** — PASS. No server-only secrets in client; only the browser-safe `PAYPAL_CLIENT_ID` is referenced (via `window.PAYPAL_CLIENT_ID` with a documented placeholder; the value is set by the board in `js/config.js`, which Lane D does not edit).
- **G3 Payments** — PASS (lane scope). Homepage sends `purpose:'donation'` only; the amount is donor-chosen but **clamped server-side** to `[$5,$50,000]` by `paypal-checkout` (no client-trusted amount is honored); dues are routed to `membership.html`/`donate.html` (Lane E/G) where plan_id-only checkout lives. No webhook logic in this lane.
- **G4 File ownership** — PASS. Only `index.html`, `about.html`, `scholarships.html`, `contact.html`, `js/app.js` were edited. Nav/footer come entirely from `js/shell.js`; no hand-rolled nav markup in any owned file.
- **G5 Accessibility (older users)** — PASS. Base 18px + fixed contrast tokens + 44px targets + skip link all come from Lane A (tokens.css/components.css) and the shell; Lane D adds: `min-height: var(--touch-target)` on its links/amount chips/social links, visible underlines on prose/footer/social links, `aria-live` status on the contact form, `aria-pressed` on amount chips, `aria-busy` on async regions, and **no `innerHTML` for any user/feed string** (textContent/DOM build, with `esc`/`safeUrl` retained as defense-in-depth on the single href interpolation). No new ambient motion introduced.
- **G6 Routing** — PASS. Breadcrumbs + shared nav on every page below home; "News" is in the shared nav (`content.html`); homepage routes (no brochure scroll); cross-links present (home↔membership↔events↔scholarships↔donate↔contact↔directory).
- **G7 No emojis / no time-language / no A/B/C menus** — PASS in all user-facing content. (Remaining `grep` hits are box-drawing rules `─`/`═` inside JS code comments — the repo's house style, not emojis — and regex false positives like `(c)` in an HTML-escape map.)
- **G8 Citations** — PASS (below): 5 skills + 5 librarians + multiple verified 2026 URLs.

## Remaining gaps (credential boundary — board action; not blockers)
- `window.PAYPAL_CLIENT_ID` (browser-safe) must be set in `js/config.js` by the board (per `docs/payment-contract-paypal.md` §9.1) before the homepage renders live PayPal buttons; until then the donation block shows a graceful "more ways to give" note routing to `donate.html`. Lane D does not own `js/config.js`.
- The social link-out hrefs (Instagram/Facebook/LinkedIn) and the chapter email addresses are public placeholders; the board swaps in the real handles/inboxes. No widget, scraper, or paid service is used (dossier Dim 5).
- Contact form has no server mailer in this repo; it validates and hands off to the matching category inbox via `mailto:`. A future Edge Function could capture submissions to a table if the board wants an in-app inbox.

## Task-sheet row
| Lane | Scope | Files | Gates | Status |
|---|---|---|---|---|
| D | Homepage router + About/Scholarships/Contact + homepage JS | `index.html`, `about.html`, `scholarships.html`, `contact.html`, `js/app.js` | G1–G8 pass | complete — ready for lead review |

## Citations

**Skills applied (verified present in `.claude/skills/`):**
- `ux-designing` — information architecture and the router model (hero → What's Happening → account panel → footer), WCAG-compliant labels, edge/empty states for the live strips.
- `flow-designing` — the "who / what / where next" journey and cross-linking so no destination is buried; the signed-out vs. signed-in panel branch; the donate happy-path + "no amount chosen" / SDK-unavailable chaos paths.
- `frontend-architecting` — the homepage-only `HomePage` controller guarded off shared markers so `js/app.js` stays safe on every page; idempotent `initDonation`; DOM-node construction over `innerHTML`.
- `pattern-referencing` — adapting the proven "homepage as a directory of next actions" pattern (one short hero, a small set of clear destinations) rather than a feature dump.
- `copywriting-enforcing` — plain-English, older-user labels ("Join the Chapter", "View Upcoming Events", "What's Happening", "Already a member?"); no AI-tells; no time-language.

**Librarians applied (verified present in `librarians/`):**
- `ux-design-librarian` — homepage IA and accessible-for-older-users structure.
- `flow-librarian` — auth-state branching and end-to-end routing/cross-links.
- `frontend-librarian` — shared-shell integration and the page-scoped, token-only styling boundary (no edits to `css/*`).
- `clone-mobbin-librarian` — benchmarking real association/alumni homepages to keep the page a router, not a brochure.
- `copywriting-librarian` — chapter voice across the hero, panels, and the three new pages.

**2026 reference docs (verified to exist; from the dossier master source index):**
- Nielsen Norman Group — Information Architecture Study Guide: https://www.nngroup.com/articles/information-architecture-study-guide/
- Nielsen Norman Group — Homepage links / usability: https://www.nngroup.com/articles/homepage-links/
- Nielsen Norman Group — Navigation: You Are Here (breadcrumbs/current location): https://www.nngroup.com/articles/navigation-you-are-here/
- Nielsen Norman Group — Usability for Senior Citizens: https://www.nngroup.com/articles/usability-for-senior-citizens/
- Baymard Institute — Homepage UX guidelines: https://baymard.com/blog/homepage-usability
- ASAE — Digital Member Experience benchmarking: https://www.asaecenter.org/resources/articles/an_plus/2025/digital-member-experience
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- PayPal JavaScript SDK reference: https://developer.paypal.com/sdk/js/reference/
- PayPal Orders API v2: https://developer.paypal.com/docs/api/orders/v2/
- PayPal Standard / Donate integration: https://developer.paypal.com/docs/checkout/standard/integrate/
- schema.org NewsArticle (news cards) + Google Search Central: https://schema.org/NewsArticle , https://developers.google.com/search

## Completion rule
Brief rewritten in place with completion sections + Citations. Confirmed: the Lane A shared shell
(`Shell.render` + `#site-header`/`#site-footer` + `js/shell.js`) and the Lane B PayPal seam
(`paypal-checkout` → `order_id` → `paypal.Buttons`, browser-safe `PAYPAL_CLIENT_ID`, no Stripe) are both
used. Ready for lead review.
