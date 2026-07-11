# Lane 2 — Stripe Dues / Payment Backend
Status: built — code complete; awaiting board credentials for live deploy (credential boundary).
Wave: mcaa-wave-001
Owner: Batch 2 agent
Single source of truth: this file only.

## Explainer
This lane built the money layer: two Supabase Edge Functions (Deno/TypeScript). The first,
`create-checkout-session`, builds the Stripe payment page for three things — annual dues
(a subscription), donations (a variable one-time gift), and paid event tickets (a gated
one-time charge). The second, `stripe-webhook`, listens to Stripe and records what was
actually paid into the membership and payment tables. The whole design is built so nobody
can forge a payment or pick their own price: the dues price is read from the database, the
ticket price is read from the event row, donations are clamped to a server-enforced range,
and every message from Stripe is cryptographically verified before a single row is written —
and processed exactly once. The functions are NOT deployed here; deploying them and setting
the secret keys is a board action documented under Remaining gaps.

## TL;DR
- `create-checkout-session` built: Zod discriminated union over `purpose` (dues | donation |
  event_ticket); dues = subscription with price from `membership_plans` by `plan_id`; donation =
  one-time inline price clamped to [$5, $50,000]; event_ticket = capacity re-check + price from
  the `events` row; comped/lifetime/manual → `MEMBER_NOT_BILLABLE` (400). Idempotency-Key on
  every Stripe write. Dues/tickets require a Supabase JWT (`auth.getUser()`); donation may be anon.
- `stripe-webhook` built: raw text body, `constructEventAsync(...)` as the FIRST op (400 on
  failure, no write before), idempotency via `stripe_webhook_events` (check-then-insert),
  service-role client, switch over the 7 §7 events, full reconciliation incl. renewal, dunning,
  SCA, and a refund cascade (dues → lapse + cancel subscription; ticket → refund + cancel reg).
- `docs/payment-contract.md` written: decision matrix, event→write table, idempotency +
  signature rules, the exact request/output schema other lanes match, the Stripe test plan
  (test cards + `stripe trigger` + test clocks), top-5 risks, and the board provisioning commands.
- Verification: both functions `deno check` clean against real Stripe 17.5.0 + supabase-js types;
  `deno lint` clean; G1 secret gate clean (all secrets via `Deno.env.get`); 8 cited URLs return 200.
- Credential boundary respected: no live deploy, no live key used. Exact deploy/secrets/Dashboard
  steps documented for the board.

| Field | Value |
|---|---|
| Mission | Implement the Stripe checkout + webhook backend exactly per `docs/data-contract.md` §7. |
| Owned scope | `supabase/functions/create-checkout-session/**`, `supabase/functions/stripe-webhook/**`, `supabase/functions/_shared/**`, `docs/payment-contract.md`. |
| Did not touch | migrations (Lane 1), `supabase/functions/content-sync/**` (Lane 4), any UI/JS, any other lane's files. |
| Skills applied | `api-integrating`, `backend-hardening`, `security-auditing` |
| Librarians applied | `api-integration-librarian`, `backend-librarian`, `security-librarian` |
| Status tracking | done (build) / blocked-on-credentials (live deploy) |

## Completed work

| Item | Status | Notes |
|---|---|---|
| `create-checkout-session` — Zod discriminated union (dues/donation/event_ticket) | done | validated before any DB access (§9 #4) |
| Dues branch — subscription, price from `membership_plans` by `plan_id` | done | `MEMBER_NOT_BILLABLE` for comped/lifetime/manual + $0/lifetime plans; `ALREADY_SUBSCRIBED` guard; `PLAN_NOT_PROVISIONED` when Stripe price unset |
| Donation branch — one-time, inline `price_data`, min/max clamp, designation | done | `[$5, $50,000]`; designation `scholarship`/`chapter`; anon allowed; PaymentIntent metadata stamped |
| Event-ticket branch — capacity re-check + price from `events` row | done | client `stripe_price_id` ignored; ownership + event-match check; `EVENT_AT_CAPACITY`; matches the live `js/events.js` seam |
| Auth gate — `auth.getUser()` server-side identity | done | dues/ticket require JWT; donation optional |
| Idempotency-Key on all outbound Stripe writes | done | customer, dues session, event session, donation session |
| `stripe-webhook` — signature verified FIRST (raw body, `constructEventAsync`) | done | 400 on failure, no write before; missing secret → 500 |
| Idempotency via `stripe_webhook_events` (check + insert, 23505 backstop) | done | retry-safe: marker deleted on handler error so Stripe re-runs |
| Switch over the 7 §7 events + reconciliation | done | active+expires_at, renewal, dunning, SCA, void-on-cancel |
| Refund cascade (`charge.refunded`) | done | dues → lapse + cancel subscription + invoice refunded; ticket → reg cancelled/refunded; partial refund leaves status |
| `_shared` modules (stripe/supabase/http/types) | done | `createFetchHttpClient`, pinned apiVersion, service-role + user-scoped clients, response envelope, row types |
| `docs/payment-contract.md` | done | seam schema, event→write table, idempotency/signature rules, test plan, top-5 risks, provisioning commands |
| `deno check` + `deno lint` both functions | done | clean against real Stripe 17.5.0 + supabase-js type defs |

## Files changed

| Path | One line |
|---|---|
| `supabase/functions/create-checkout-session/index.ts` | Checkout Session builder for dues/donation/event_ticket; Zod union; server-side price; idempotency keys. |
| `supabase/functions/create-checkout-session/deno.json` | Import map: stripe@17.5.0, zod@3.24.1, supabase-js. |
| `supabase/functions/create-checkout-session/deno.lock` | Pinned dependency tree for reproducible deploy. |
| `supabase/functions/stripe-webhook/index.ts` | Signature-first, idempotent reconciliation over the 7 events incl. refund cascade. |
| `supabase/functions/stripe-webhook/deno.json` | Import map: stripe@17.5.0, supabase-js. |
| `supabase/functions/stripe-webhook/deno.lock` | Pinned dependency tree. |
| `supabase/functions/_shared/stripe.ts` | Stripe client factory; `createFetchHttpClient()`; pinned `apiVersion` (matches SDK literal). |
| `supabase/functions/_shared/supabase.ts` | `getServiceClient()` (RLS-bypass, server-only) + `getUserScopedClient()` (JWT identity). |
| `supabase/functions/_shared/http.ts` | `{ url }` success / `{ error }` envelope + CORS + OPTIONS preflight. |
| `supabase/functions/_shared/types.ts` | Row shapes mirrored from data-contract §4; donation bounds; non-billable status set. |
| `docs/payment-contract.md` | The cross-lane payment seam + test plan + board runbook. |

## Commands run (verification only — no live deploy)

| Command | Result |
|---|---|
| `deno check create-checkout-session/index.ts` (with deps) | clean |
| `deno check stripe-webhook/index.ts` (with deps) | clean |
| `deno lint <both>` (with import maps) | clean (0 problems) |
| `grep -rn "service_role\|sk_live\|sk_test\|whsec_" js/ *.html` | ZERO (G1 pass) |
| `grep -rn "sk_live\|sk_test\|whsec_\|service_role" supabase/functions/ --include="*.ts"` | ZERO secret literals (all via `Deno.env.get`) |
| `curl` HEAD on all 8 cited doc URLs | 200 ×8 |
| existence check: 3 librarians + 3 skills | all present |

## Artifact paths
- Functions: `supabase/functions/create-checkout-session/`, `supabase/functions/stripe-webhook/`, `supabase/functions/_shared/`
- Contract: `docs/payment-contract.md`
- This brief: `orchestration/active/mcaa-wave-001/02-PAYMENTS-DUES.md`

## Hard-gate status (evidence contract)
- G1 Secrets — PASS. `grep` of `js/`+`*.html` returns zero; all function secrets read from
  `Deno.env` (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_ANON_KEY`, `SUPABASE_URL`). `node_modules/` is gitignored and not committed.
- G2 File ownership — PASS. Only `supabase/functions/**` (mine) + `docs/payment-contract.md`
  created. No migrations, no `content-sync`, no UI/JS, no other lane files modified.
- G3 No unlabeled mock — PASS. No fake data introduced; donation bounds and error codes are real.
- G4 Contract adherence — PASS. Column/enum/table names match data-contract §4 exactly; the
  checkout seam matches the already-built `js/events.js` caller and `event-flow.md`.
- G5 Security invariants — PASS. Signature verified first (#5); dues/ticket amounts server-side (#6);
  Zod before DB access (#4); service-role only inside the function (#1); RLS untouched (no schema edits).
- G6 No time-language / no emojis — PASS. Status tracked as done/blocked; plain text throughout.
- G7 Citations — PASS. Skills + librarians verified on disk; 8 doc URLs verified 200 (below).

## Remaining gaps (credential boundary — board action required)
Full commands are in `docs/payment-contract.md` §8. Summary:
1. **Provision Stripe Products/Prices** for Standard ($75/yr) and Premium ($150/yr), then
   `update public.membership_plans set stripe_product_id=…, stripe_price_id=… where name=…`
   (the seed left them null on purpose; Comped stays null — never enters Stripe).
2. **Set Edge Function secrets:**
   `supabase secrets set STRIPE_SECRET_KEY=sk_test_… STRIPE_WEBHOOK_SECRET=whsec_… SUPABASE_SERVICE_ROLE_KEY=…`
   (optional `SITE_URL`, `ALLOWED_ORIGIN`).
3. **Deploy:** `supabase functions deploy create-checkout-session` and
   `supabase functions deploy stripe-webhook --no-verify-jwt` (the webhook authenticates by
   Stripe signature, not a Supabase JWT — JWT verification must be OFF for it).
4. **Register the webhook** in Stripe Dashboard → Developers → Webhooks: endpoint
   `https://<project-ref>.functions.supabase.co/stripe-webhook`, subscribe the 7 events, copy
   the endpoint signing secret into `STRIPE_WEBHOOK_SECRET`.
5. **Configure dunning** (Settings → Billing → Smart Retries) to drive `invoice.payment_failed` cadence.
6. **Run the live test plan** (`payment-contract.md` §6): test cards, `stripe trigger`, test clocks.
   Real end-to-end reconciliation needs a real test checkout (so `metadata` is present), not just `trigger`.
7. **Known follow-ups (not blockers):** TTL cleanup for abandoned `pending` event registrations
   (`event-flow.md` C6); partial-refund policy for tickets (today: cascade on FULL refund only).

## Cross-lane seam notes (for the lead)
- **Lane 3 (events):** the `event_ticket` request shape in `create-checkout-session` matches the
  ALREADY-BUILT caller `js/events.js` `RSVPs.createPaid()` exactly (`purpose, event_id,
  event_registration_id, profile_id, stripe_price_id, guest_count, success_url, cancel_url`) and
  returns `{ url }` / `{ error }` as that caller reads. The webhook sets the registration to
  `payment_status='paid'`, `status='approved'`, `payment_id` per `event-flow.md` path 3 step 8. No change needed in Lane 3.
- **Lane 5 (membership/donate CTAs):** dues + donation request shapes are defined authoritatively
  here and in `payment-contract.md` §3. Lane 5 must send `{ purpose:'dues', plan_id }` and
  `{ purpose:'donation', amount_cents, designation }`, include the user's `Authorization: Bearer
  <jwt>` (the supabase-js client does this automatically) for dues, and read `fnData.url` /
  `fnData?.error`. Lead: confirm Lane 5's calls match before closing the wave.

## Citations
**Skills:** `api-integrating` (typed clients, webhook signature verification, server-side keys,
idempotency/retry), `backend-hardening` (Zod boundary validation, single response envelope,
server-side auth, env secrets), `security-auditing` (secrets scan gate, auth on every privileged
path, no client-trusted amounts).
**Librarians:** `api-integration-librarian` (Stripe webhook + idempotency), `backend-librarian`
(Edge Function architecture, service-role boundary), `security-librarian` (signature-first
ordering, credential boundary, RLS-bypass containment).
**2026 docs (verified 200):**
docs.stripe.com/payments/checkout · docs.stripe.com/billing/subscriptions/webhooks ·
docs.stripe.com/webhooks · docs.stripe.com/testing · docs.stripe.com/billing/testing/test-clocks ·
supabase.com/docs/guides/functions/examples/stripe-webhooks ·
supabase.com/docs/guides/functions/secrets · supabase.com/docs/reference/javascript/auth-getuser

## Task-sheet row (for the lead)
| Wave | Lane | Owner | Status-claim | Summary | Doc path |
|---|---|---|---|---|---|
| mcaa-wave-001 | 2 — Stripe dues/payment backend | Batch 2 agent | built / blocked-on-credentials | `create-checkout-session` + `stripe-webhook` + `_shared` built in Deno/TS; signature-first, idempotent, server-side amounts, refund cascade; typecheck+lint+secret-gate clean; live deploy awaits board Stripe keys. | `orchestration/active/mcaa-wave-001/02-PAYMENTS-DUES.md` (+ `docs/payment-contract.md`) |

## Completion Rule
This file is the record. Live deploy + real webhook testing await the board's Stripe keys
(credential boundary) — explicitly NOT performed here; no fabricated deploy.
