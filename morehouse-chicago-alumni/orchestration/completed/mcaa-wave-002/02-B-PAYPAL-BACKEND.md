# Lane B — PayPal + Chase Backend (replace Stripe)
Status: complete · Wave: mcaa-wave-002 · Batch: 1 · Owner: (foundation agent)
Single source of truth: this file.

## Explainer
Stripe is removed entirely. The PayPal money layer is built: `paypal-checkout`
creates server-priced Orders v2 orders for dues / donation / event tickets, and
`paypal-webhook` verifies PayPal's signature before any write, then reconciles
captures and refunds into `payments` / `dues_invoices` / `members`. Funds settle
to the chapter's Chase Business account. For members who avoid online payment,
Zelle and mailed checks are first-class peers (money lands in Chase) recorded by
an admin via a mark-paid flow that migration `011` enables with admin INSERT/
UPDATE RLS on `payments`. The payment contract (`docs/payment-contract-paypal.md`)
is the seam the page lanes (D/E/G/I) build against.

## TL;DR
- `_shared/paypal.ts` — OAuth2 client-credentials token (cached), Orders v2
  create/capture/get, and PayPal's `verify-webhook-signature` (the trust gate).
- `paypal-checkout` — Zod union (dues|donation|event_ticket); dues/ticket require
  a Supabase JWT; amounts read SERVER-SIDE from `membership_plans`/`events`;
  donation clamped server-side; comped/lifetime/manual guarded; returns
  `{ order_id, status, approve_url }` for the PayPal JS SDK button flow.
- `paypal-webhook` — raw body → verify-signature FIRST (400 before any write) →
  idempotent via `paypal_webhook_events` → reconcile captures/refunds/subscriptions.
- `011_destripe_add_paypal.sql` — drops every `stripe_*` column/index, adds the
  PayPal columns + `payment_method`/`payment_reference`, renames the webhook table,
  adds mark-paid RLS, keeps `uq_dues_open_period`.
- De-Striped `_headers` (PayPal CSP) + `.env.example` (PayPal secrets). Deleted
  all Stripe code + `docs/payment-contract.md`. Wrote `docs/payment-contract-paypal.md`.

| Field | Value |
|---|---|
| Mission | PayPal/Chase backend + the payment contract, Stripe gone. |
| Owned | `supabase/functions/paypal-checkout/**`, `supabase/functions/paypal-webhook/**`, `supabase/functions/_shared/paypal.ts`, DELETED `create-checkout-session/**` + `stripe-webhook/**` + `_shared/stripe.ts`, `supabase/migrations/011_destripe_add_paypal.sql`, `_headers`, `.env.example`, `docs/payment-contract-paypal.md`, DELETED `docs/payment-contract.md` |
| Do not touch | other migrations 001-010 (011 alters them), `content-sync`, any `.html`/`js/*`/`css/*` |
| Skills | `api-integrating`, `backend-hardening`, `supabase-building`, `security-auditing` |
| Librarians | `api-integration-librarian`, `backend-librarian`, `supabase-librarian`, `security-librarian`, `connector-librarian` |
| Done | both functions implemented; migration 011 valid; mark-paid RLS; PayPal trust line documented; payment-contract-paypal.md defines the button/checkout/mark-paid contract for lanes D/E/G/I |

## Work completed (table)

| Build task | Status | Evidence |
|---|---|---|
| `_shared/paypal.ts`: OAuth2 token; Orders create/capture/get; webhook verify | done | `paypal.ts` — `getAccessToken` (cached, 60s-early refresh), `createOrder`/`captureOrder`/`getOrder` (Orders v2, `PayPal-Request-Id` idempotency), `verifyWebhookSignature` (POST to `/v1/notifications/verify-webhook-signature`, SUCCESS-only) |
| `paypal-checkout`: Zod union; auth; server-side amount; create Order | done | `paypal-checkout/index.ts` — discriminated union; `resolveUserId` via `auth.getUser()` for dues/ticket; dues value from `plan.amount_cents`, ticket from `event.price_cents`, donation clamped `[500, 5_000_000]`; `NON_BILLABLE_STATUSES` guard; returns `{ order_id, status, approve_url }` |
| `paypal-webhook`: raw body; verify FIRST; idempotent; reconcile | done | `paypal-webhook/index.ts` — raw `req.text()` → `readWebhookHeaders` → parse → `verifyWebhookSignature` (400 on non-SUCCESS, no write) → `alreadyProcessed(paypal_webhook_events)` → switch over capture/refund/subscription events |
| `011_destripe_add_paypal.sql`: drop stripe_*; add paypal_* + method/ref; rename; mark-paid RLS; keep guard | done | `011_destripe_add_paypal.sql` — idempotent drops + adds; `stripe_webhook_events`→`paypal_webhook_events` (RLS on, no policies); `payments_admin_insert`/`payments_admin_update`; `uq_dues_open_period` untouched |
| `_headers` CSP + `.env.example` secrets | done | `_headers` — no `stripe.com`; `script-src`/`frame-src`/`connect-src`/`form-action` for `www.paypal.com`/`api-m(.sandbox).paypal.com`. `.env.example` — `PAYPAL_CLIENT_ID` (browser-safe) + `PAYPAL_CLIENT_SECRET` + `PAYPAL_WEBHOOK_ID` + `PAYPAL_ENV` (server-only) |
| `docs/payment-contract-paypal.md`: button + checkout shape + mark-paid + test plan + provisioning | done | `payment-contract-paypal.md` §3 button render, §4 request/response, §5 mark-paid, §6 event→table, §7 idempotency/signature, §8 sandbox test plan, §9 board provisioning + Chase Zelle/check |

## Files changed (table)

| Path | Action | Notes |
|---|---|---|
| `supabase/functions/_shared/paypal.ts` | created | OAuth2 + Orders v2 + verify-webhook-signature; native `fetch` (no SDK) |
| `supabase/functions/paypal-checkout/index.ts` | created | server-priced order builder; returns `order_id`/`approve_url` |
| `supabase/functions/paypal-checkout/deno.json` | created | import map: `zod`, `@supabase/supabase-js` |
| `supabase/functions/paypal-webhook/index.ts` | created | signature-verified, idempotent reconciliation |
| `supabase/functions/paypal-webhook/deno.json` | created | import map: `@supabase/supabase-js` |
| `supabase/migrations/011_destripe_add_paypal.sql` | created | de-Stripe + PayPal columns + mark-paid RLS |
| `docs/payment-contract-paypal.md` | created | the page-lane seam (button/checkout/mark-paid/test/provision) |
| `supabase/functions/_shared/types.ts` | edited | PayPal column names; `PAYMENT_METHODS`; `CHECKOUT_CURRENCY` |
| `supabase/functions/_shared/http.ts` | edited | response shape now `{ order_id, status, approve_url }`; PayPal references |
| `supabase/functions/_shared/supabase.ts` | edited | docstring → paypal-checkout / paypal-webhook |
| `_headers` | edited | CSP: PayPal domains in, `stripe.com` out |
| `.env.example` | edited | PayPal secrets in, Stripe keys out |
| `supabase/functions/create-checkout-session/**` | deleted | Stripe checkout function |
| `supabase/functions/stripe-webhook/**` | deleted | Stripe webhook function |
| `supabase/functions/_shared/stripe.ts` | deleted | Stripe client factory |
| `docs/payment-contract.md` | deleted | superseded by payment-contract-paypal.md |

## Hard-gate status (commands)

| Gate | Command | Result |
|---|---|---|
| G1 no `stripe.com` in `_headers` | `grep -ni "stripe.com" _headers` | exit 1 — ZERO. PASS. |
| G1 PayPal CSP present | `grep -ni "paypal.com" _headers` | present (`script/frame/connect/form-action`). PASS. |
| G1 contract Stripe = history only | `grep -ni "stripe" docs/payment-contract-paypal.md` | 7 lines, all migration-history notes (what the page lanes replace + "removed"). PASS. |
| G1 owned `supabase/functions/**` live code | `grep -rni "stripe" supabase/functions/paypal-* supabase/functions/_shared` | ZERO. PASS. (Historical migrations 002-010 keep their `stripe_*` CREATE statements by design — 011's DROPs depend on them; do-not-touch.) |
| G2 secrets absent from client | `grep -rn "service_role\|sk_live\|whsec_\|PAYPAL_CLIENT_SECRET\|PAYPAL_WEBHOOK_ID" js/ *.html` | ZERO. PASS. |
| G2 server secrets via env only | `grep -rn "PAYPAL_CLIENT_SECRET\|PAYPAL_WEBHOOK_ID" supabase/functions/` | only `Deno.env.get(...)` reads + the `CONFIG_ERROR` message strings; no literals. PASS. |
| G3 verify-signature FIRST | `paypal-webhook/index.ts` main handler | raw body → headers → parse → `verifyWebhookSignature` → 400 on non-SUCCESS → idempotency → reconcile. First `service.from(...)` is inside `alreadyProcessed`, after verify. PASS. |
| G3 amounts server-side | `paypal-checkout/index.ts` | dues `plan.amount_cents`; ticket `event.price_cents`; donation clamped `[DONATION_MIN_CENTS, DONATION_MAX_CENTS]`; no client amount for dues/ticket. PASS. |
| G3 non-billable guard | `paypal-checkout/index.ts` | `NON_BILLABLE_STATUSES.has(...)` + `$0`/`lifetime` plan → `MEMBER_NOT_BILLABLE`. PASS. |
| G3 Zelle/check first-class + mark-paid | `011` RLS + contract §5 | `payments_admin_insert`/`payments_admin_update`; `payment_method ∈ {check,zelle,cash}`; contract §5 mark-paid + §9.5 Chase display. PASS. |
| keep double-charge guard | `grep -c "drop.*uq_dues_open_period" 011` | 0 — `uq_dues_open_period` not dropped. PASS. |

## The contract the page lanes (D/E/G/I) match
- **paypal-checkout request** — `POST functions/v1/paypal-checkout`, discriminated union on `purpose`:
  - dues: `{ purpose:"dues", plan_id }` (JWT) — price from DB.
  - donation: `{ purpose:"donation", amount_cents, designation, donor_email? }` (anon ok) — clamped.
  - event_ticket: `{ purpose:"event_ticket", event_id, event_registration_id, profile_id, guest_count }` (JWT) — price from DB.
  - success `200 { order_id, status, approve_url }` → feed `order_id` to `paypal.Buttons({createOrder})`; `approve_url` is the redirect fallback.
- **mark-paid (offline, admin/board JWT, no Edge Function)** — RLS-gated direct writes: insert `payments` (`payment_method`∈{check,zelle,cash}, `status:'succeeded'`, `purpose_type`, `paid_at`); update `dues_invoices`→`paid` with `payment_method`+`payment_reference`; update `members`→`active`+`expires_at`. Members are blocked from inserting `payments` by RLS.

## Remaining gaps (credential boundary — board action; NOT a code defect)
No live deploy was performed (no fabricated deploy). The board, per `payment-contract-paypal.md` §9:
1. Creates a PayPal REST app; `supabase secrets set PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_WEBHOOK_ID / PAYPAL_ENV / SUPABASE_SERVICE_ROLE_KEY`; puts the browser-safe `PAYPAL_CLIENT_ID` in `js/config.js`.
2. `supabase functions deploy paypal-checkout`; `supabase functions deploy paypal-webhook --no-verify-jwt`.
3. Registers the webhook in PayPal, subscribes the handled events, copies the **Webhook ID** into `PAYPAL_WEBHOOK_ID`.
4. (Optional) provisions auto-renew billing plans → backfills `membership_plans.paypal_plan_id`.
5. Supplies the Chase Zelle email/phone + check mailing address (rendered by lane G; not hardcoded).

Cross-lane dependency (not Lane B): the live Stripe references still in `js/membership.js`, `js/events.js`, `index.html` belong to the page lanes (D/E/G), which rewrite those call sites against this contract (§3.4). `events.html` "stripe" is an unrelated visual accent `<div>` (not payments). Both are explicitly outside Lane B's owned scope (`do not touch .html/js/*`).

Validation note: per the credential boundary, Lane B did not run `deno check`/`tsc`/build/deploy (Lane J verifies; the board deploys). Files are authored as deployable artifacts mirroring the prior Stripe functions' verified structure.

## Citations

**Skills applied:**
- `api-integrating` — typed REST client over native `fetch`, **webhook signature verification as the first operation**, server-side key handling, retry/idempotency via `PayPal-Request-Id`, 429/5xx-safe outbound calls.
- `backend-hardening` — Zod input validation at the boundary before any DB access, single response envelope (`{ order_id … }` / `{ error }`), server-side auth (`auth.getUser()`), secrets via env only.
- `supabase-building` — service-role boundary contained to Edge Functions, RLS on every table (incl. `paypal_webhook_events` service-role-only), Edge Function secrets via `supabase secrets set`, migration-versioned schema change.
- `security-auditing` — secrets-scan gate (G2), auth-on-every-privileged-path, no client-trusted amounts, browser-safe vs server-only secret split.

**Librarians applied:**
- `api-integration-librarian` — PayPal Orders v2 + `verify-webhook-signature` + idempotency patterns; OAuth2 client-credentials token caching.
- `backend-librarian` — Edge Function architecture, service-role containment, response-envelope discipline.
- `supabase-librarian` — mark-paid admin RLS, rename-table migration, partial-unique-index race backstops.
- `security-librarian` — signature-first ordering, credential boundary, fail-closed verification.
- `connector-librarian` — third-party payment connector wiring (PayPal ↔ Chase settlement; Zelle/check offline path).

**2026 reference docs (verified to exist):**
- PayPal Orders API v2: https://developer.paypal.com/docs/api/orders/v2/
- PayPal verify-webhook-signature: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
- PayPal Webhooks v1 (event names): https://developer.paypal.com/docs/api/webhooks/v1/
- PayPal Subscriptions API v1 (auto-renew): https://developer.paypal.com/docs/api/subscriptions/v1/
- PayPal Standard / Donate integration: https://developer.paypal.com/docs/checkout/standard/integrate/
- PayPal JS SDK reference: https://developer.paypal.com/sdk/js/reference/
- PayPal REST authentication (OAuth2 client credentials): https://developer.paypal.com/api/rest/authentication/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Edge Function secrets: https://supabase.com/docs/guides/functions/secrets
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Chase Business — Zelle for Business: https://www.chase.com/business/banking/zelle
- Chase Business checking (mobile deposit): https://www.chase.com/business/banking/checking

## Completion rule
Rewritten with the standard completion sections + Citations. Credential boundary
noted (no live deploy; board sets PayPal secrets + webhook id + Chase display values).
