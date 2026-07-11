# Morehouse Chicago Alumni — Platform Rebuild Research Dossier (mcaa-wave-002)

This is the grounding for `docs/MOREHOUSE-PLATFORM-REBUILD-PLAN.md`. It records the actual
findings and the real source URLs from the SAD critical-analysis pass (five parallel research
agents, each applying multiple Skills Library V2 skills + librarians + 2026 web sources). Every
claim in the plan traces back to a finding here. Nothing below is summarized away.

---

## Master source index (every 2026 URL used)

### Information architecture, navigation, homepage
- Nielsen Norman Group — Information Architecture Study Guide: https://www.nngroup.com/articles/information-architecture-study-guide/
- Nielsen Norman Group — Breadcrumb Navigation: https://www.nngroup.com/articles/breadcrumb-navigation-useful/
- Nielsen Norman Group — Usability for Senior Citizens: https://www.nngroup.com/articles/usability-for-senior-citizens/
- Nielsen Norman Group — Navigation: You Are Here: https://www.nngroup.com/articles/navigation-you-are-here/
- Nielsen Norman Group — Homepage links/usability: https://www.nngroup.com/articles/homepage-links/
- Baymard Institute — Homepage UX guidelines: https://baymard.com/blog/homepage-usability
- ASAE — Digital Member Experience benchmarking: https://www.asaecenter.org/resources/articles/an_plus/2025/digital-member-experience
- W3C WAI-ARIA Authoring Practices — Dialog (Modal) pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- Morehouse National Alumni Association (chapter scope reference): https://morehousealumni.org

### Accessibility + engaging design for older users
- W3C WCAG 2.2 (Recommendation, 2023): https://www.w3.org/TR/WCAG22/
- W3C Understanding SC 2.4.11 Focus Appearance: https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- Nielsen Norman Group — Designing for Older Adults: https://www.nngroup.com/articles/older-users-ux/
- AARP — Web & App Accessibility for older adults: https://www.aarp.org/home-family/personal-technology/web-accessibility/
- WebAIM — Contrast Checker: https://webaim.org/resources/contrastchecker/
- American Foundation for the Blind — low-vision web guidance: https://www.afb.org/blindness-and-low-vision/using-technology
- Smashing Magazine — designing for older users: https://www.smashingmagazine.com/category/accessibility/
- Deque University — keyboard/focus management: https://dequeuniversity.com/
- Google Fonts — Playfair Display (heading pairing candidate): https://fonts.google.com/specimen/Playfair+Display

### PayPal + Chase payments
- PayPal JavaScript SDK reference: https://developer.paypal.com/sdk/js/reference/
- PayPal Orders API v2 (server-side create + capture): https://developer.paypal.com/docs/api/orders/v2/
- PayPal Subscriptions API v1 (auto-renew): https://developer.paypal.com/docs/api/subscriptions/v1/
- PayPal Webhooks v1 (events + verification): https://developer.paypal.com/docs/api/webhooks/v1/
- PayPal verify-webhook-signature: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
- PayPal Standard / Donate integration: https://developer.paypal.com/docs/checkout/standard/integrate/
- PayPal REST authentication (OAuth2 client credentials): https://developer.paypal.com/api/rest/authentication/
- Chase Business — Zelle for Business: https://www.chase.com/business/banking/zelle
- Chase Business checking (mobile deposit): https://www.chase.com/business/banking/checking

### Content engine + routing
- Morehouse News RSS (verified working, keyless): https://news.morehouse.edu/rss.xml
- Morehouse Events Localist RSS (valid, currently empty): https://events.morehouse.edu/calendar/1.xml
- Morehouse Events Localist JSON API (currently empty): https://events.morehouse.edu/api/2/events
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Edge Function secrets: https://supabase.com/docs/guides/functions/secrets
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase custom access token hook: https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook
- MDN — CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- Cloudflare Workers: https://developers.cloudflare.com/workers/
- Netlify Functions: https://docs.netlify.com/functions/overview/
- GitHub Actions scheduled workflows (cron): https://docs.github.com/actions/using-workflows/events-that-trigger-workflows#schedule
- schema.org NewsArticle / Event + Google Search Central: https://schema.org/NewsArticle , https://developers.google.com/search
- Meta Instagram Graph API (access requirements): https://developers.facebook.com/docs/instagram-api
- LinkedIn Marketing Developer Platform: https://developer.linkedin.com
- HubSpot — blog RSS feeds (`/rss.xml` convention): https://knowledge.hubspot.com

### Skills (Skills Library V2, verified present)
ux-designing, flow-designing, frontend-architecting, experience-designing, visual-auditing,
typography-enforcing, mobile-first-enforcing, consistency-checking, component-building,
animation-designing, api-integrating, backend-hardening, supabase-building, security-auditing,
research-conducting, n8n-automating, search-building, pattern-referencing, copywriting-enforcing,
onboarding-designing, testing-enforcing, pre-deploy-gating, exit-gating, code-scrutinizing,
code-auditing, anti-mock-enforcing, progress-tracking.

### Librarians (verified present)
ux-design-librarian, flow-librarian, frontend-librarian, experience-designer-librarian,
visual-audit-librarian, typography-librarian, mobile-first-librarian, design-librarian,
consistency-librarian, components-librarian, animation-librarian, api-integration-librarian,
backend-librarian, supabase-librarian, security-librarian, connector-librarian, research-librarian,
n8n-librarian, search-librarian, clone-mobbin-librarian, copywriting-librarian, onboarding-librarian,
testing-librarian, hacker-attacker-librarian, pre-deployment-librarian, code-audit-librarian,
code-scrutinizer-librarian, progress-tracker-librarian, lazy-leaky-librarian, orchestration-librarian.

---

## Dimension 1 — Build triage + the percentage

Skills: code-auditing, code-scrutinizing, anti-mock-enforcing, progress-tracking.
Librarians: code-audit-librarian, code-scrutinizer-librarian, progress-tracker-librarian, lazy-leaky-librarian.

### Verdicts by surface (KEEP / REFACTOR / REMOVE)
- KEEP (backend works): `js/store.js` adapter, `js/auth.js` (FOAC + JWT role + assertAdminFresh),
  migrations 001/005/006/007/008/009 (enums, content tables, audit log, triggers + custom access
  token hook + get_my_role, RLS enable, RLS policies), `content-sync` function, all admin/member/
  events/directory JS modules, `js/config.js`.
- REFACTOR: migrations 002/003/004/010 (de-Stripe the columns: `stripe_customer_id`,
  `stripe_subscription_id`, `stripe_price_id`, `stripe_product_id`, `stripe_invoice_id`,
  `stripe_checkout_session_id`, `stripe_webhook_events`); `_headers` (remove Stripe CSP entries);
  `.env.example` (Stripe → PayPal secret names); `_shared/types.ts` (drop Stripe row types);
  `index.html` (restructure scroll → router; replace inline Stripe checkout block ~lines 389-502);
  `tests/` (port Stripe webhook/checkout tests to PayPal).
- REMOVE: `supabase/functions/create-checkout-session/`, `supabase/functions/stripe-webhook/`,
  `_shared/stripe.ts`, `docs/payment-contract.md`, `tests/e2e/webhook-signature.spec.js`.

### Weighted score (current 49% → target 87%)
Nav/IA 30→90 (w15) · Homepage 35→85 (w10) · Payments 10→80 (w12) · Content 60→85 (w10) ·
Accessibility 50→90 (w12) · Member tools 65→85 (w10) · Admin 70→85 (w8) · Mobile 72→88 (w8) ·
Security/data 68→90 (w15). Weighted current = 49.3% → target = 86.7%.

Sources: WCAG 2.2 SC 1.4.4 (Resize Text), 2.5.5 (Target Size); Supabase custom access token hook (URL above).

---

## Dimension 2 — Information architecture, navigation, content routing

Skills: ux-designing, flow-designing, frontend-architecting, onboarding-designing, pattern-referencing.
Librarians: ux-design-librarian, flow-librarian, frontend-librarian, onboarding-librarian, clone-mobbin-librarian.

### Core findings
- The prior build is a long-scroll brochure: About/Leadership/Donate/Events/Scholarships/Gallery/
  Partnerships/News/Membership/Contact are all anchor sections inside one `index.html` with 570+
  lines of inline JS. The nav has 3 destination links (Home, Events, Directory). That is the
  literal reason it reads as "not a platform."
- `content.html` (news hub) is orphaned — not in any nav. Four different nav markup patterns exist
  across pages (some hardcoded, some JS-injected) → inconsistent header. Only one breadcrumb exists
  in the whole codebase (event-detail). Sign-in is a modal over the brochure.

### Proposed structure (21 pages: 10 public, 5 member, 6 admin)
- Public: Home (router), About, Events, Event Detail, News (content.html), Scholarships,
  Membership (public info), Donate, Contact, Sign In (dedicated page).
- Member: Dashboard (post-login landing), My Membership, Alumni Directory, My Profile, My Events.
- Admin: Overview, Member Mgmt, Event Mgmt, Registration Approvals, Dues Ledger, Content Queue.
- Global nav (plain-English, older-user labels): About · Events · News · Scholarships · Membership ·
  Donate (button) · Sign In/Account. Member subnav + unified admin sidebar.
- Homepage = router: hero (identity + two actions) → "What's Happening" strip (Next Event ·
  Latest News · Scholarships) → conditional sign-in/welcome panel → footer. Standalone pages pulled
  out of the scroll. Breadcrumbs on every page below home. One shared nav/footer component.
- Systematic cross-linking (events↔news↔scholarships↔directory↔dues) so nothing is buried.

Sources: NN/g IA Study Guide, NN/g Breadcrumbs, NN/g You-Are-Here, NN/g Senior Citizens, NN/g
Homepage, Baymard Homepage UX, ASAE Digital Member Experience, W3C ARIA Dialog (URLs above).

---

## Dimension 3 — Accessible, engaging design for older users (done professionally)

Skills: experience-designing, visual-auditing, typography-enforcing, mobile-first-enforcing, consistency-checking, animation-designing.
Librarians: experience-designer-librarian, visual-audit-librarian, typography-librarian, mobile-first-librarian, design-librarian, animation-librarian, consistency-librarian.

### Findings + concrete changes
- Base font is 16px; small body text (`--text-sm` ≈ 14px) is used widely. For an older audience the
  standard is 18-20px. Change `--text-base: 1rem → 1.125rem` (the Major Third scale then shifts
  proportionally; no other scale value changes).
- `--color-text-tertiary` (#6C7A89) on the dark surface measures ≈3.8:1 → FAILS WCAG AA (used on
  dates, locations, metadata, form labels). Fix to #8A9BAC (≈5.2:1). `--color-text-muted` (#4A3F42 ≈
  2.2:1) restrict to decorative only. Other text tokens pass.
- Touch targets: `.nav__link` (~22px tall) and `.btn--sm` (36px) are below 44px; donate amount
  buttons and calendar day cells too. Bump to `min-height: var(--touch-target)` (44px); add
  `--touch-target-xl: 3.5rem` for primary mobile CTAs.
- Motion: multiple infinite ambient loops (`heroGradientShift` 14s, `sectionAmbient` 10s ×6-7,
  `floatOrb`, `glowAmbient`) run at once → fatiguing and a perf cost on older devices. Make ambient
  loops off by default (`--duration-ambient: 0ms`); keep one-shot entrances, the Kente shimmer,
  line-draw, stat counters.
- Add: skip links on every page (currently absent); visible underlines on footer/prose links;
  light-surface sections (`--surface-light: #FAF7F2`) to alternate with dark for visual rhythm and
  eye rest; pull-quote component for alumni testimonials; optional serif headings (Playfair Display)
  for institutional dignity; `--leading-prose: 1.75` on small body copy; full-month date formats.
- Contrast/focus targets per WCAG 2.2: AA 4.5:1 normal / 3:1 large / 3:1 UI; SC 2.4.11 focus
  appearance; recommend AAA (7:1) for primary reading text given the audience.

Sources: WCAG 2.2 + Understanding Focus Appearance, NN/g Older Adults, AARP, WebAIM Contrast,
AFB low-vision, Smashing, Deque, Google Fonts Playfair (URLs above).

---

## Dimension 4 — PayPal + Chase (replace Stripe)

Skills: api-integrating, backend-hardening, supabase-building, security-auditing.
Librarians: api-integration-librarian, backend-librarian, supabase-librarian, security-librarian, connector-librarian.

### Decisions
- Dues: PayPal Smart Payment Buttons, one-time per tier (default) — best for an older audience that
  prefers explicit annual control over a recurring charge; optional "auto-renew" toggle via PayPal
  Subscriptions for those who want it. Amount read server-side from `membership_plans` (never client).
- Donations: PayPal Donate (variable amount entered on PayPal-hosted page); two designations
  (scholarship vs chapter) via the order `custom`/metadata field.
- Chase: Zelle (native in Chase Business Online) + mailed check shown as FIRST-CLASS peers, with an
  admin "mark paid" flow (writes a `payments` row with method check/zelle/cash + reference, flips
  member active, sets expiry). For an older chapter this is a primary path, not a fallback.
- Reconciliation: `paypal-webhook` Edge Function verifies via PayPal `verify-webhook-signature`
  BEFORE any write (the equivalent of Stripe's signature check), idempotent via a
  `paypal_webhook_events` table, then updates `payments`/`dues_invoices`/`members`.
- Trust line on payment pages: "Secure checkout by PayPal. Morehouse Chicago does not see your card
  details." No card data ever touches our site; PayPal emails the receipt.

### Stripe removal map (exact)
- Delete: `create-checkout-session/`, `stripe-webhook/`, `_shared/stripe.ts`,
  `docs/payment-contract.md`, `tests/e2e/webhook-signature.spec.js`.
- New: `paypal-checkout/`, `paypal-webhook/`, `_shared/paypal.ts`,
  `supabase/migrations/011_destripe_add_paypal.sql`, `docs/payment-contract-paypal.md`,
  `tests/e2e/paypal-webhook-signature.spec.js`.
- Migration 011 column changes: members `stripe_customer_id/stripe_subscription_id` →
  `paypal_payer_id/paypal_subscription_id`; membership_plans `stripe_product_id/stripe_price_id` →
  `paypal_plan_id`; dues_invoices `stripe_*` → `paypal_order_id` + `payment_method` + `payment_reference`;
  payments `stripe_payment_intent_id/stripe_charge_id` → `paypal_order_id/paypal_capture_id/payment_method`;
  rename `stripe_webhook_events` → `paypal_webhook_events`; add admin INSERT/UPDATE RLS on `payments`
  for mark-paid. Keep the `uq_dues_open_period` double-charge guard.
- Client: replace `index.html` checkout block + `js/membership.js startDuesCheckout` +
  `js/events.js createPaid` Stripe calls with PayPal buttons / `paypal-checkout`; load PayPal JS SDK;
  `.env.example` Stripe keys → `PAYPAL_CLIENT_ID` (browser-safe) + `PAYPAL_CLIENT_SECRET` +
  `PAYPAL_WEBHOOK_ID` (server-only); `_headers` CSP drop Stripe domains, add PayPal.

Sources: PayPal JS SDK, Orders v2, Subscriptions v1, Webhooks v1 + verify-webhook-signature, Donate,
REST auth; Supabase functions/secrets/RLS/getUser; Chase Zelle + checking (URLs above).

---

## Dimension 5 — Content engine + routing (free only)

Skills: research-conducting, n8n-automating, api-integrating, search-building.
Librarians: research-librarian, n8n-librarian, connector-librarian, search-librarian.

### Findings + decision
- News: `https://news.morehouse.edu/rss.xml` is the real, keyless HubSpot RSS feed (the prior pass
  checked `/feed`, a WordPress path, and wrongly concluded none existed). Keep the existing
  `content-sync` Edge Function; change the `morehouse_news` source row to `fetch_method='rss_poll'`,
  `api_url='https://news.morehouse.edu/rss.xml'`. Auto-approve `general`-relevance news at ingest;
  send `direct`/`adjacent` to the board queue. Schedule pg_cron `0 */6 * * *`.
- Pipeline choice: keep Supabase Edge Function (Option C) over a build-time JSON script (Option A) or
  a Cloudflare/Netlify proxy (Option B) — it is already built, preserves the approval queue, and adds
  no second vendor. CORS is not an issue: the browser reads `content_items` from Supabase (anon key);
  only the Edge Function (server-side) touches Morehouse.
- Events: chapter events (the `events` table) are the real content. The Morehouse Localist feed is
  wired but currently empty; surface a "Morehouse College Events" block on Events/Home that renders
  only when items exist (auto-fills later; no empty-state needed).
- Social: plain link-outs only (footer + contact): "Instagram: @handle", Facebook, LinkedIn — plain
  `<a target="_blank" rel="noopener noreferrer">`, no widgets, no scraping, no paid service. If we
  can't create it, link to it.
- Homepage news: read live `content_items` (4 latest) with the `window.HBCU_NEWS` static fallback when
  Supabase is unconfigured; add "View All News" → `content.html`; add `content.html` to the nav as
  "News". Add schema.org NewsArticle/Event JSON-LD.

Sources: news.morehouse.edu/rss.xml, events.morehouse.edu Localist, Supabase Edge/RLS, MDN CORS,
Cloudflare Workers, Netlify Functions, GitHub Actions cron, schema.org + Google Search Central,
Meta Instagram Graph API, LinkedIn MDP, HubSpot RSS (URLs above).
