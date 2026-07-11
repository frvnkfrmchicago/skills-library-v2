# Wave mcaa-wave-001 — Closeout

Lead Batch-4 closeout for the Morehouse Chicago Alumni production build. Packet:
`orchestration/completed/mcaa-wave-001/`. Contract: `docs/data-contract.md`.

## TL;DR

- The polished static prototype is now a real chapter platform in code: Supabase Auth +
  Postgres + RLS, a Stripe dues/donations/tickets backend, event registration, a content
  hub with honest provenance, member and admin portals, a mobile/accessible design system,
  a test suite, and board operations docs.
- Eight lanes ran across three batches with exclusive file ownership; every lane closed with
  completion evidence in its brief; the QA lane found one real stored-XSS defect (DEF-001),
  which the lead fixed and proved with the test suite (79/79 green).
- Nothing was deployed to a live account. The remaining work is the credential boundary:
  the board provisions Supabase + Stripe and runs the documented steps. No code-level ship
  blocker remains.

## What each component delivers

| Lane | Delivered |
|---|---|
| 1 Arch/Data/Auth | 10 migrations: 11 tables, enums, triggers, `custom_access_token_hook`, RLS on every table (self-elevation blocked by WITH CHECK); `js/store.js` Supabase adapter preserving the old API; `js/auth.js` gate + FOAC; `js/config.js`; `.env.example`/`.gitignore`. Validated on a real Postgres; caught and fixed a role-claim hook bug. |
| 2 Payments | `create-checkout-session` + `stripe-webhook` Edge Functions: dues subscription, variable donations, gated event tickets; signature verified first, idempotent via `stripe_webhook_events`, server-side pricing, refund cascade. `deno check`/`lint` clean. |
| 3 Events | `events.js`/`calendar.js` on Supabase; free/paid/member-only, capacity + waitlist; JSON-LD Event structured data; add-to-calendar; attendee lists gated; safe `textContent` rendering. |
| 4 Content hub | `content-sync` Edge Function (real Localist RSS for events.morehouse.edu; news HTML parse; weekly sitemap diff); admin approval queue + first-class manual capture; public hub; honest 3-timestamp provenance; Instagram/LinkedIn deferred (need college OAuth + platform review). |
| 5 Member/Admin | Member dashboard (dues, renew, receipts, my events); admin dues ledger (filters, aging, CSV); directory locked to zero-PII-when-signed-out + visibility-aware; admin shell gated by `requireAdmin()` + FOAC; homepage CTAs wired to checkout. |
| 6 Design/Mobile | Design tokens + components for all new surfaces; mobile-first 390px (no overflow, 44px targets, dvh, safe-area); visible focus; reduced-motion; gallery uploads moved to Supabase Storage. |
| 7 QA/Security | Offline Vitest suite (79 assertions green) testing real source; Playwright specs (live-gated); 15-item security review; pre-deploy report. Found DEF-001. |
| 8 Data/Docs | Seed (plans/events/members template/content_sources), `import-members.mjs`, board runbook (11-step provisioning), source-provenance reference. Anti-mock clean. |

## Today vs after

- Today (before): static pages, localStorage data, hardcoded passwords (`morehouse2026`/`alumni2026`),
  ungated admin, public member directory, alert() payments, hardcoded news.
- After (this wave, in code): real per-user accounts and roles, a dues ledger and payment
  ledger, Stripe checkout + webhook reconciliation, RLS protecting every table, a private-by-
  default directory, real event registration, and a tracked content hub — all behind the same
  visual design.

## What the board does next (the credential boundary)

These need live credentials and are documented in `docs/board-runbook.md`:

1. Create a Supabase project; run migrations 001–010 (`supabase db push`).
2. Register the access-token hook (Dashboard → Authentication → Hooks).
3. Create the first admin; provision the `gallery` Storage bucket.
4. Create Stripe Products/Prices for Standard ($75/yr) and Premium ($150/yr); write the
   `stripe_price_id`s into `membership_plans`.
5. `supabase secrets set` the service-role + Stripe keys; `supabase functions deploy` the
   three functions; register the Stripe webhook endpoint (7 events).
6. Fill `js/config.js` with the project URL + anon key; deploy the static site (the `_headers`
   file applies on Netlify/Cloudflare Pages — see it for the Vercel/nginx equivalent).
7. Import the real member roster; seed `content_sources`; promote events from draft.

## Verified now vs blocked on credentials

- Verified now: schema applies on real Postgres; RLS on all 11 tables; self-elevation blocked;
  webhook signature-first; dues amount server-side; comped guard; secrets gate zero; 79/79
  unit tests; home-grid XSS fixed (DEF-001); security headers present (DEF-002).
- Blocked on credentials (documented, not faked): live migration apply, function deploy, live
  Stripe webhook test, and the Playwright e2e specs that need a running backend.

## Follow-ups (non-blocking)

- Tighten the CSP `script-src` by externalizing index.html's inline scripts (currently
  `'unsafe-inline'`).
- OBS-1: `admin-content.js:50` awaits a synchronous `requireAdmin()` — cosmetic.
- Lane 4 content pages use light-theme inline styles; migrate to the shared component classes
  Lane 6 defined.
- Replace remaining `[PLACEHOLDER]` seed (event details, member roster) with real board data.

## Citations

- Skills applied across lanes: `supabase-building`, `database-designing`, `backend-hardening`,
  `security-auditing`, `api-integrating`, `frontend-architecting`, `flow-designing`,
  `research-conducting`, `n8n-automating`, `ux-designing`, `component-building`,
  `experience-designing`, `mobile-first-enforcing`, `typography-enforcing`,
  `testing-enforcing`, `pre-deploy-gating`, `exit-gating`, `code-scrutinizing`,
  `anti-mock-enforcing`, `orchestration-managing`.
- Librarians applied: `supabase-librarian`, `database-librarian`, `backend-librarian`,
  `security-librarian`, `api-integration-librarian`, `frontend-librarian`, `flow-librarian`,
  `research-librarian`, `n8n-librarian`, `connector-librarian`, `ux-design-librarian`,
  `components-librarian`, `experience-designer-librarian`, `mobile-first-librarian`,
  `design-librarian`, `testing-librarian`, `hacker-attacker-librarian`,
  `code-audit-librarian`, `pre-deployment-librarian`, `anti-mock-data-librarian`,
  `research-librarian`, `progress-tracker-librarian`.
- 2026 sources: Supabase (RLS, custom access token hook, API keys, Edge Functions, Storage,
  supabase-js install), Stripe (Checkout, Subscriptions, Webhooks, Testing), Meta Instagram
  Platform app review, LinkedIn Marketing increasing-access, Localist RSS, Google Event
  structured data, WCAG 2.2, OWASP Top 10.
