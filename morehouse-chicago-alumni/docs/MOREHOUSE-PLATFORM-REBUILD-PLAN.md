# Morehouse Chicago Alumni — Platform Rebuild Plan (SAD, mcaa-wave-002)

Goal: turn the rejected long-scroll build into a proper, navigable, engaging, accessible
PLATFORM with real content routing and PayPal/Chase payments. Not a landing page. Not a
button hub. Backend stays; the face of it and the payment engine are rebuilt.

## TL;DR

- Production-readiness now: **49%**. Target after this wave: **87%**.
- Root cause of rejection: a working Supabase backend wrapped in a marketing-scroll homepage
  with a 3-item nav that routes to nothing, the wrong payment engine (Stripe), and readability
  not tuned for an older audience.
- Fix: real global navigation + content routing, a homepage that ROUTES (not a scroll, not a
  button grid), standalone section pages, an accessible/dignified design system, PayPal + Chase
  (Stripe ripped out), and the free Morehouse news feed wired correctly.
- Execution: a 10-lane multi-agent wave in 3 batches, file-exclusive, run to completion.

## Comprehension Gate (SAD Gates 1-3)

- Understood: backend (Supabase auth, RLS on 11 tables, dues ledger, events, content queue,
  admin) is sound and KEEP. The front end is a long-scroll `index.html` brochure; nav has 3
  items; `content.html` (news hub) is orphaned (not in nav); payments are entirely Stripe; base
  font is 16px and `--color-text-tertiary` fails WCAG AA on the dark surface.
- Researched (2026): proper membership/community-platform IA and navigation (Nielsen Norman,
  Baymard, ASAE); accessible design for older adults (WCAG 2.2, NN/g, AARP, AFB); PayPal Orders/
  Subscriptions/Donate + webhook verification and Chase Zelle; the Morehouse news RSS
  (`news.morehouse.edu/rss.xml`) is real and keyless; the Morehouse events feed is valid but
  currently empty.
- Gap: navigation/IA, homepage wayfinding, payments (PayPal/Chase), and older-user readability.
  This is a front-end IA + payments rebuild on top of a backend that already works.

## The percentage (weighted)

| Area | Weight | Now | Target | Why it moves |
|---|---:|---:|---:|---|
| Navigation / Information Architecture | 15 | 30 | 90 | 3-item nav → real global nav (7 items) + member/admin nav; content routing |
| Homepage / wayfinding | 10 | 35 | 85 | scroll brochure → a router: hero + "what's happening" + section links |
| Payments | 12 | 10 | 80 | Stripe removed; PayPal Smart Buttons + Donate; Zelle/check first-class |
| Content (news/events) | 10 | 60 | 85 | news source fixed to the working RSS; hub put in nav; homepage live |
| Accessibility (older users) | 12 | 50 | 90 | 18px base, contrast fixes, bigger targets, calmer motion, skip links |
| Member tools | 10 | 65 | 85 | real dashboard as post-login landing; profile + my-events; PayPal renew |
| Admin tools | 8 | 70 | 85 | consistent admin shell; PayPal/Zelle/check "mark paid" flow |
| Mobile | 8 | 72 | 88 | router homepage removes the long mobile scroll; target-size fixes |
| Security / data | 15 | 68 | 90 | de-Stripe CSP; PayPal webhook verify-first; backend provisioned + RLS verified |
| **Total** | **100** | **49%** | **87%** | proper platform after this wave |

## Vision (what "proper platform" means here)

A professional alumni-chapter platform with a persistent global navigation, dedicated section
pages, and a homepage that directs people to the right place fast. Engaging and genuinely easy
to use; accessible to older alumni (large readable type, strong contrast, generous spacing,
plain-English labels, calm motion) — dignified, NOT childish, NOT a grid of giant buttons, NOT
an endless marketing scroll. Money runs through PayPal (and Zelle/check to Chase). Instagram and
other socials are plain link-outs.

## Architecture decisions (locked by the analysis — no options menu)

- Navigation: one shared nav + footer + breadcrumb component injected by `js/shell.js` into a
  placeholder on every page (kills the four inconsistent nav copies). Global nav: About · Events ·
  News · Scholarships · Membership · Donate · Sign In/Account. Member subnav (Dashboard · My
  Membership · Directory · My Profile · My Events). Admin sidebar unified across admin pages.
- Homepage: hero (identity + two actions: Join, View Events) → "What's Happening" strip (next
  event, latest news, scholarships) → conditional sign-in/welcome panel → footer. Standalone
  pages pulled out of the scroll: about, scholarships, donate, contact, signin, dashboard,
  profile, my-events.
- Payments: PayPal Smart Buttons one-time per dues tier (default), optional auto-renew toggle;
  PayPal Donate for variable donations; Zelle + mailed-check shown as first-class peers with an
  admin "mark paid" flow. Server-side amount (never client). `paypal-checkout` + `paypal-webhook`
  Edge Functions; migration `011` de-Stripes the schema. Verify-webhook-signature before any write.
- Design: base font 18px (`--text-base: 1.125rem`); fix `--color-text-tertiary` (#6C7A89 →
  #8A9BAC, AA fail → pass); 44px+ targets on nav/buttons/calendar; calm motion (ambient loops off
  by default); light-surface sections for rhythm; skip links; serif headings option; pull-quotes.
- Content: point `morehouse_news` at `https://news.morehouse.edu/rss.xml` (`rss_poll`);
  auto-approve general news; homepage news reads live `content_items` with the static fallback;
  Morehouse events surface on Events when the feed fills; socials = plain link-outs (footer +
  contact). Keep the content-sync function and admin approval queue.

## Multi-agent decomposition

- Mode: Flat Wave (peer agents), 10 lanes, 3 batches. File-exclusive ownership; no two lanes
  share a file. Run to completion; the board's credentials are the only stop point.
- Foundation first (the shared shell + the payment backend + the content engine are dependencies
  the page lanes consume by contract, so page lanes can run in parallel without colliding).

| Lane | Agent | Delivers | Owns (exclusive) | Citations (skills · librarians · 2026) |
|---|---|---|---|---|
| A | Design System & Shared Shell | 18px/contrast/target/motion fixes; `js/shell.js` unified nav+footer+breadcrumb+announce+skip-link; light surfaces; pull-quote | `css/tokens.css`, `css/components.css`, `css/pages.css`, `css/animations.css`, `js/shell.js` (new) | experience-designing, visual-auditing, typography-enforcing, mobile-first-enforcing, consistency-checking, animation-designing · experience-designer-librarian, visual-audit-librarian, typography-librarian, mobile-first-librarian, design-librarian, consistency-librarian · WCAG 2.2, NN/g older-adults, AARP, AFB |
| B | PayPal + Chase Backend | delete Stripe fns; `paypal-checkout` + `paypal-webhook` + `_shared/paypal.ts`; migration `011_destripe_add_paypal.sql`; de-Stripe `_headers`/`.env.example`; `docs/payment-contract-paypal.md` | `supabase/functions/paypal-*`, `supabase/functions/_shared/paypal.ts`, delete `supabase/functions/stripe-*` + `_shared/stripe.ts`, `supabase/migrations/011_*.sql`, `_headers`, `.env.example`, `docs/payment-contract-paypal.md` | api-integrating, backend-hardening, supabase-building, security-auditing · api-integration-librarian, backend-librarian, supabase-librarian, security-librarian, connector-librarian · PayPal Orders/Subscriptions/Webhooks/Donate, Chase Zelle |
| C | Content Engine & Routing Data | point news source to the real RSS; auto-approve general items; schema.org; keep approval queue | `supabase/functions/content-sync/index.ts`, `data/seed/content_sources.json`, `docs/content-sources.md` | research-conducting, n8n-automating, api-integrating, search-building · research-librarian, n8n-librarian, connector-librarian, search-librarian · news.morehouse.edu/rss.xml, Supabase Edge/pg_cron, schema.org |
| D | Homepage Router & Public Core | restructure `index.html` into a router; new `about.html`, `scholarships.html`, `contact.html`; homepage news live + "View All News" | `index.html`, `about.html` (new), `scholarships.html` (new), `contact.html` (new) | ux-designing, flow-designing, frontend-architecting, pattern-referencing, copywriting-enforcing · ux-design-librarian, flow-librarian, frontend-librarian, clone-mobbin-librarian, copywriting-librarian · NN/g IA, Baymard homepage, ASAE |
| E | Membership & Donate (PayPal UI) | `membership.html` public join (PayPal/Zelle/check), new `donate.html` (PayPal Donate + Zelle/check), member dues actions | `membership.html`, `donate.html` (new), `js/membership.js`, `js/donate.js` (new) | ux-designing, flow-designing, component-building, api-integrating · ux-design-librarian, components-librarian, flow-librarian, backend-librarian · PayPal Buttons/Donate, WCAG 2.2 |
| F | Member Area | post-login `dashboard.html`; `profile.html`, `my-events.html`, dedicated `signin.html`; cross-linked `directory.html` | `dashboard.html` (new), `profile.html` (new), `my-events.html` (new), `signin.html` (new), `directory.html`, `js/dashboard.js` (new), `js/profile.js` (new), `js/directory.js` | ux-designing, frontend-architecting, onboarding-designing, supabase-building · ux-design-librarian, frontend-librarian, onboarding-librarian, supabase-librarian · Supabase auth/getUser, ASAE dashboard, WCAG |
| G | Events | `events.html` + "Morehouse College Events" block + breadcrumbs; `event-detail.html` PayPal ticket flow | `events.html`, `event-detail.html`, `js/events.js`, `js/calendar.js` | flow-designing, frontend-architecting, api-integrating, testing-enforcing · flow-librarian, frontend-librarian, api-integration-librarian, testing-librarian · schema.org Event, PayPal Orders, Localist |
| H | News / Content Hub | `content.html` in nav as "News", default filter, cross-links, live items, schema.org | `content.html`, `js/content.js` | frontend-architecting, search-building, research-conducting · frontend-librarian, search-librarian, research-librarian · schema.org NewsArticle, Supabase query |
| I | Admin Area | unified admin shell; PayPal/Zelle/check "mark paid"; content queue; events CRUD | `admin.html`, `admin-dues.html`, `admin-content.html`, `js/admin.js`, `js/admin-dues.js`, `js/admin-content.js` | backend-hardening, ux-designing, supabase-building, security-auditing · backend-librarian, ux-design-librarian, supabase-librarian, security-librarian · Supabase RLS, PayPal reconciliation |
| J | QA / Accessibility / Security Gate | nav+breadcrumb consistency audit; font/contrast/target audit; PayPal/Zelle flow tests; secrets + RLS gate; pre-deploy report | `tests/**`, `docs/security-review.md`, `docs/predeploy-report.md`, `docs/accessibility-check.md` | testing-enforcing, security-auditing, hacker-scanning, pre-deploy-gating, exit-gating, code-scrutinizing, visual-auditing · testing-librarian, security-librarian, hacker-attacker-librarian, pre-deployment-librarian, visual-audit-librarian, code-audit-librarian · WCAG 2.2, OWASP, PayPal sandbox |

### Batches & parallelism

- Batch 1 (foundation, parallel): A · B · C. Disjoint files (css+shell vs paypal functions+migration vs content-sync). The shared shell, payment contract, and content data become the contracts the page lanes consume.
- Batch 2 (pages, parallel by ownership): D · E · F · G · H · I. All file-disjoint; each consumes the Batch-1 contracts. Run in concurrency-safe sub-groups (e.g. D·E·F then G·H·I) given the runtime's child-agent cap.
- Batch 3 (gate): J. Runs after pages land; read-only verification + reports; routes any defect back to the owning lane.
- Lead closeout: provisioning runbook update + master log + archive.

## Today vs After

| The board / a member does | Today (rejected build) | After this wave |
|---|---|---|
| Land on the site | Long marketing scroll; 3-item nav | A homepage that routes; full nav to every section |
| Find news/events/dues | Buried in scroll or no nav link | One click from the nav; cross-linked |
| Pay dues / donate | Stripe checkout (wrong) | PayPal button, or Zelle/check to Chase |
| Read it (older eyes) | 16px, a failing-contrast label color | 18px base, AA+ contrast, calm motion, skip links |
| Get Morehouse news | 5 hardcoded headlines | Live from the real Morehouse RSS, board-approved |
| Sign in / manage membership | Modal over a brochure | Dedicated sign-in → a real member dashboard |

## What the board supplies (credential boundary)

- PayPal: business `PAYPAL_CLIENT_ID` (browser-safe), `PAYPAL_CLIENT_SECRET` + `PAYPAL_WEBHOOK_ID` (server-only).
- Chase: Zelle email/phone on the business account; check payee name + mailing address (P.O. Box recommended).
- Supabase: project URL + anon key for `js/config.js`; run migrations; register the access-token hook; create the first admin; provision the gallery bucket.
- Social handles to link out (Instagram/Facebook/LinkedIn).

## Citations (aggregated; multiples per lane in the table above)

- Skills: ux-designing, flow-designing, frontend-architecting, experience-designing, visual-auditing, typography-enforcing, mobile-first-enforcing, consistency-checking, component-building, animation-designing, api-integrating, backend-hardening, supabase-building, security-auditing, research-conducting, n8n-automating, search-building, pattern-referencing, copywriting-enforcing, onboarding-designing, testing-enforcing, pre-deploy-gating, exit-gating, code-scrutinizing, code-auditing, anti-mock-enforcing, progress-tracking.
- Librarians: ux-design-librarian, flow-librarian, frontend-librarian, experience-designer-librarian, visual-audit-librarian, typography-librarian, mobile-first-librarian, design-librarian, consistency-librarian, components-librarian, animation-librarian, api-integration-librarian, backend-librarian, supabase-librarian, security-librarian, connector-librarian, research-librarian, n8n-librarian, search-librarian, clone-mobbin-librarian, copywriting-librarian, onboarding-librarian, testing-librarian, hacker-attacker-librarian, pre-deployment-librarian, code-audit-librarian, code-scrutinizer-librarian, progress-tracker-librarian, lazy-leaky-librarian, orchestration-librarian.
- 2026 web: WCAG 2.2 (w3.org), NN/g (older adults, IA, breadcrumbs, homepage), Baymard homepage UX, AARP + AFB low-vision, ASAE member experience, PayPal Developer (JS SDK, Orders v2, Subscriptions v1, Webhooks + verify-signature, Donate), Chase Business Zelle, Supabase (Edge Functions, pg_cron, RLS, auth/getUser, custom access token hook), news.morehouse.edu/rss.xml, events.morehouse.edu Localist, schema.org NewsArticle/Event, OWASP Top 10, MDN CORS.
