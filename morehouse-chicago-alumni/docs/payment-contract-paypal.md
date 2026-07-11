# Payment Contract — PayPal + Chase (Morehouse Chicago Alumni)

Lane B — `mcaa-wave-002`
Status: built (code complete). Live PayPal app + webhook id and the Chase Zelle
email / check address are board-supplied (credential boundary — see §9).

This document is the seam the UI lanes build against (membership page, donate,
event detail, admin dues). It specifies the exact `paypal-checkout`
request/response shape, the PayPal button render, the admin **mark-paid**
contract, which PayPal event writes which table, the Chase Zelle/check display,
and every rule each payment path obeys. Stripe has been removed entirely; this
file replaces `docs/payment-contract.md`.

Money settlement: PayPal funds settle into the chapter's **Chase Business**
account on the PayPal payout schedule. Zelle and mailed checks go **directly** to
Chase and are recorded by an admin via mark-paid.

---

## 1. Explainer (plain language)

Two server functions handle online money. `paypal-checkout` builds a PayPal order
with the correct amount (read from the database, never the browser).
`paypal-webhook` listens to PayPal and records what was actually captured. Nobody
can forge a payment or set their own price: the dues price comes from
`membership_plans`, the event-ticket price comes from the event row, and
donations are clamped to a server-enforced range. Every PayPal message is
verified with PayPal's own `verify-webhook-signature` endpoint before a single
row is written, and each message is processed exactly once.

For members who do not want to pay online, **Zelle and mailed checks are
first-class peers**, not a fallback. The money lands in Chase; a board admin then
records it with the **mark-paid** flow, which writes a `payments` row
(`payment_method` = `check` | `zelle` | `cash`), flips the member to `active`,
and sets the expiry. No card data ever touches our site; PayPal emails the payer
their receipt.

---

## 2. Decision matrix — which flow, which PayPal primitive

| Flow | Trigger | PayPal primitive | Price source | Auth |
|---|---|---|---|---|
| Annual dues (default) | Member clicks Renew/Join | Orders v2 (intent CAPTURE), one-time | `membership_plans.amount_cents` (by `plan_id`) | Supabase JWT required |
| Annual dues (opt-in auto-renew) | Member toggles auto-renew | Subscriptions v1 (`paypal_plan_id`) | the PayPal billing plan's price | Supabase JWT required |
| Donation (variable) | Donate CTA | Orders v2, one-time | client `amount_cents`, clamped server-side to `[$5, $50,000]` | anonymous allowed |
| Event ticket (gated/capacity) | Paid-event RSVP | Orders v2, one-time | `events.price_cents` (by `event_id`) | Supabase JWT required |
| **Zelle / check / cash (offline)** | Member pays the chapter directly | none (no PayPal) — admin **mark-paid** | the dues invoice / a board-entered amount | admin/board JWT |

Non-billable short-circuit: `comped` / `lifetime` / `manual` members and any
`$0`/`lifetime` plan **never** enter PayPal. `paypal-checkout` returns
`400 { "error": "MEMBER_NOT_BILLABLE" }`. Their dues invoices are `waived`.

> Auto-renew is an explicit opt-in. The default for this chapter's audience is a
> one-time annual order — older members prefer explicit annual control over a
> standing charge. The Subscriptions path is wired in the webhook
> (`BILLING.SUBSCRIPTION.*`, `PAYMENT.SALE.COMPLETED`) but a `paypal_plan_id`
> must be provisioned (§9) before the page offers the toggle.

---

## 3. PayPal button render (the client contract for lanes D/E/G)

The payment pages load the **PayPal JS SDK** once and render Smart Payment
Buttons. The browser asks our server to create the order (so the amount is
server-trusted), the payer approves in the PayPal popup/iframe, and the capture
is confirmed by the webhook.

### 3.1 Load the SDK (once per page that shows buttons)
`PAYPAL_CLIENT_ID` is browser-safe and lives in `js/config.js` (committed). The
SDK script is allowed by the CSP in `_headers` (`script-src … www.paypal.com`).

```html
<!-- components currency must match CHECKOUT_CURRENCY = USD -->
<script
  src="https://www.paypal.com/sdk/js?client-id=PAYPAL_CLIENT_ID&currency=USD&intent=capture"
  defer></script>
<div id="paypal-button-container"></div>
```

### 3.2 Render the buttons (dues example)
```js
paypal.Buttons({
  // createOrder calls OUR Edge Function — the amount is resolved server-side.
  createOrder: async () => {
    const { data, error } = await window.supabaseClient.functions.invoke(
      'paypal-checkout',
      { body: { purpose: 'dues', plan_id: PLAN_ID } }
    );
    if (error || !data || data.error) {
      const code = (data && data.error) || (error && error.message) || 'CHECKOUT_FAILED';
      showToast(code === 'MEMBER_NOT_BILLABLE'
        ? 'Your membership is complimentary — no payment needed.'
        : 'Could not start checkout. Please try again.', 'error');
      throw new Error(code);            // aborts the button flow
    }
    return data.order_id;               // PayPal captures THIS order
  },
  // onApprove: PayPal has captured. The webhook is the source of truth; here we
  // only give immediate UI feedback and let the page re-read member state.
  onApprove: async () => {
    showToast('Payment received. Your membership is being updated.', 'success');
    // re-fetch members/payments after a short delay, or route to a success view.
  },
  onCancel: () => showToast('No payment was taken.', 'info'),
  onError: () => showToast('PayPal could not complete the payment.', 'error'),
}).render('#paypal-button-container');
```

The same pattern serves **donation** (`{ purpose:'donation', amount_cents, designation, donor_email? }`)
and **event_ticket** (`{ purpose:'event_ticket', event_id, event_registration_id, profile_id, guest_count }`).

### 3.3 Trust line (required copy on every payment surface)
> "Secure checkout by PayPal. Morehouse Chicago does not see your card details.
> PayPal emails your receipt."

### 3.4 Migration note — what the page lanes replace
The Stripe build redirected to `fnData.url`. PayPal does **not** redirect by
default; it uses the button + `order_id`. Lanes replace:
- `index.html` inline Stripe checkout block → SDK load + `paypal.Buttons` (donations).
- `js/membership.js` `startDuesCheckout` Stripe redirect → `createOrder` returning `order_id`.
- `js/events.js` `RSVPs.createPaid` Stripe call → `createOrder` returning `order_id`.
- A redirect fallback exists: if a page cannot host the SDK, use `data.approve_url`
  (the order's `rel:"approve"` link) and send the browser there.

---

## 4. `paypal-checkout` — request/output schema (the seam)

`POST /functions/v1/paypal-checkout`
Invoked browser-side via `supabaseClient.functions.invoke('paypal-checkout', { body })`.
Body is a discriminated union on `purpose`. Validated with Zod **before any DB access**.

### 4.1 Request bodies

**Dues** — caller: `js/membership.js` / `index.html` membership CTA.
```jsonc
{
  "purpose": "dues",      // literal
  "plan_id": "<uuid>"     // membership_plans.id — price resolved server-side
}
```

**Donation (variable)** — caller: `index.html` / donate CTA.
```jsonc
{
  "purpose": "donation",         // literal
  "amount_cents": 5000,          // integer > 0; clamped to [500, 5000000]
  "designation": "scholarship",  // "scholarship" | "chapter"
  "donor_email": "person@x.org"  // optional — receipt note
}
```

**Event ticket (gated)** — caller: `js/events.js` `RSVPs.createPaid()`.
```jsonc
{
  "purpose": "event_ticket",          // literal
  "event_id": "<uuid>",               // events.id — price resolved server-side
  "event_registration_id": "<uuid>",  // the just-inserted pending registration row
  "profile_id": "<uuid>",             // auth.uid(); must own the registration
  "guest_count": 0                    // integer 0..20
}
```

> No `amount`, `price`, `currency`, or PayPal id is ever accepted from the client.
> Amounts are read from the DB; currency is pinned to `USD` server-side.

### 4.2 Responses (envelope)

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ "order_id": "<id>", "status": "CREATED", "approve_url": "https://www.paypal.com/checkoutnow?token=<id>" }` | feed `order_id` to `paypal.Buttons` `createOrder`; `approve_url` is the redirect fallback |
| 400 | `{ "error": "VALIDATION_ERROR", "message": "..." }` | body failed Zod |
| 400 | `{ "error": "MEMBER_NOT_BILLABLE", "message": "..." }` | comped/lifetime/manual or $0 plan |
| 400 | `{ "error": "AMOUNT_OUT_OF_RANGE", "message": "..." }` | donation outside [$5, $50,000] |
| 400 | `{ "error": "EVENT_NOT_PAID" \| "EVENT_NOT_AVAILABLE" }` | free/cancelled/draft event |
| 401 | `{ "error": "UNAUTHENTICATED" }` | dues/ticket with no valid JWT |
| 403 | `{ "error": "REGISTRATION_MISMATCH" }` | registration not owned by caller / wrong event |
| 404 | `{ "error": "MEMBER_NOT_FOUND" \| "PLAN_NOT_FOUND" \| "EVENT_NOT_FOUND" \| "REGISTRATION_NOT_FOUND" }` | |
| 409 | `{ "error": "ALREADY_PAID" \| "EVENT_AT_CAPACITY" }` | |
| 502 | `{ "error": "CHECKOUT_FAILED", "message": "Payment provider error (...)" }` | PayPal/network failure |
| 500 | `{ "error": "CONFIG_ERROR" }` | a required secret is unset |

The success fields are at the TOP LEVEL and the error key is `error` (the page
lanes read `data.order_id` / `data?.error`). This mirrors the prior `{ url }`
contract's shape conventions.

### 4.3 Server-side guarantees (what the caller can rely on)
- **Dues price never from the request** — only `plan_id`; server reads `membership_plans.amount_cents`.
- **Event-ticket price never from the request** — server reads `events.price_cents` by `event_id` and **re-verifies capacity** (`approved` + `checked_in` + 1 ≤ capacity).
- **Donation amount clamped** to `[DONATION_MIN_CENTS, DONATION_MAX_CENTS]`.
- Identity for dues/tickets is `supabase.auth.getUser()` against the bearer JWT — a real server-side check.
- The order's `custom_id` encodes `<purpose>:<domain-id>[:<aux>]` so the webhook reconciles without trusting the client.
- Every PayPal create carries a `PayPal-Request-Id` (idempotency — §6).

---

## 5. Admin mark-paid contract (Zelle / check / cash — the offline seam)

For money that arrives in Chase directly (Zelle, mailed check, cash at an event),
an **admin/board** user records it. There is no Edge Function for this — it is a
direct, RLS-gated Supabase write from the admin dues UI (lane G), enabled by the
admin INSERT/UPDATE policies on `payments` added in migration `011`.

### 5.1 What the admin UI writes (one transaction, two/three rows)
```js
// 1. Ledger row (payments) — RLS: payments_admin_insert (admin/board only).
await supabaseClient.from('payments').insert({
  member_id,                       // the member being credited
  amount_cents,                    // board-entered, matches the invoice/cheque
  currency: 'usd',
  purpose_type: 'dues',            // or 'donation'
  payment_method: 'check',         // 'check' | 'zelle' | 'cash'
  status: 'succeeded',
  paid_at: new Date().toISOString(),
  metadata: { recorded_by: adminProfileId },
});

// 2. Dues invoice → paid (payments + members are the source of truth).
await supabaseClient.from('dues_invoices')
  .update({ status: 'paid', payment_method: 'check',
            payment_reference: 'check #1842', // confirmation/cheque number
            updated_at: new Date().toISOString() })
  .eq('id', duesInvoiceId);

// 3. Member → active with a fresh expiry (admin members RLS already allows this).
await supabaseClient.from('members')
  .update({ membership_status: 'active',
            expires_at: oneYearOut,           // 'YYYY-MM-DD'
            updated_at: new Date().toISOString() })
  .eq('id', member_id);
```

### 5.2 Rules the mark-paid flow obeys
- **`payment_method` ∈ {`check`,`zelle`,`cash`}** for offline; `paypal` is reserved for the webhook.
- **`payment_reference`** captures the check number / Zelle confirmation so the board can reconcile against the Chase statement.
- Only **admin/board** can insert/update `payments` (RLS — `get_my_role() in ('admin','board')`). A member cannot self-mark-paid.
- `comped`/`lifetime`/`manual` members are not marked paid — their dues are `waived`.
- The same path records an **offline donation** (`purpose_type='donation'`, a `designation`, no dues invoice).

### 5.3 Column reference (after migration 011)
| Table | Column | Used by |
|---|---|---|
| `payments` | `payment_method` (`paypal`/`check`/`zelle`/`cash`, NOT NULL default `paypal`) | online + mark-paid |
| `payments` | `paypal_order_id`, `paypal_capture_id` | webhook only (NULL for offline) |
| `dues_invoices` | `payment_method`, `payment_reference`, `paypal_order_id` | mark-paid + webhook |
| `members` | `paypal_payer_id`, `paypal_subscription_id` | webhook only |
| `membership_plans` | `paypal_plan_id` | auto-renew opt-in only |

---

## 6. PayPal event → write table (`paypal-webhook`)

Signature verified first (PayPal `verify-webhook-signature`); idempotency on
`paypal_webhook_events.id`; all writes via the service-role client. The webhook
branches on the capture/refund `custom_id` we stamped at order creation.

| PayPal event | members | dues_invoices | payments | event_registrations |
|---|---|---|---|---|
| `PAYMENT.CAPTURE.COMPLETED` (dues) | → `active`, `expires_at` = +1y, set `paypal_payer_id` | open invoice → `paid` (+ `paypal_order_id`, `payment_method='paypal'`) | insert `succeeded`, `purpose_type='dues'`, keyed by capture id | — |
| `PAYMENT.CAPTURE.COMPLETED` (donation) | — | — | insert `succeeded`, `purpose_type='donation'`, `designation` | — |
| `PAYMENT.CAPTURE.COMPLETED` (event_ticket) | — | — | insert `succeeded`, `purpose_type='event_ticket'`, link `event_registration_id` | → `payment_status='paid'`, `status='approved'`, `payment_id` |
| `PAYMENT.CAPTURE.DENIED` / `.DECLINED` (dues) | → `past_due` | open invoice → `payment_failed` | insert `failed` | — |
| `PAYMENT.CAPTURE.REFUNDED` / `.REVERSED` (dues) | → `lapsed`, clear `paypal_subscription_id` | paid invoice → `refunded` | ledger row → `refunded`, `refunded_at` | — |
| `PAYMENT.CAPTURE.REFUNDED` / `.REVERSED` (event ticket) | — | — | ledger row → `refunded`, `refunded_at` | → `payment_status='refunded'`, `status='cancelled'` (frees the slot) |
| `BILLING.SUBSCRIPTION.ACTIVATED` (auto-renew) | → `active`, set `paypal_subscription_id`, `expires_at` = next billing | — | — | — |
| `BILLING.SUBSCRIPTION.CANCELLED`/`.EXPIRED`/`.SUSPENDED` | → `lapsed`, clear `paypal_subscription_id` | — | — | — |
| `PAYMENT.SALE.COMPLETED` (subscription cycle) | → `active`, push `expires_at` +1y | — | upsert `succeeded`, `purpose_type='dues'`, `renewal:true` | — |

Unhandled event types are acknowledged `200` (PayPal stops retrying them).

---

## 7. Idempotency + signature rules

### Signature (HARD GATE — data-contract §9 #5)
1. Read the **raw text body** (`await req.text()`) before any parse.
2. Read the five `paypal-transmission-*` / `paypal-cert-url` / `paypal-auth-algo` headers; any missing → `400`.
3. `verifyWebhookSignature(headers, parsedEvent)` — POSTs to PayPal's
   `/v1/notifications/verify-webhook-signature` with `PAYPAL_WEBHOOK_ID` — is the
   **first trust operation**. Only an explicit `{ verification_status: "SUCCESS" }`
   proceeds; anything else (FAILURE, non-200, missing headers) → `400`, **no DB write**.
4. Missing `PAYPAL_WEBHOOK_ID` → `500` (refuse to process unverifiable traffic).

### Idempotency (three layers)
1. **`paypal_webhook_events`** — check by `event.id`; if present, `200 {duplicate:true}`. Otherwise insert (PK `23505` race → treat as duplicate).
2. **`payments.paypal_capture_id`** partial unique index — ledger upserts read-before-write, with the unique index as the race backstop.
3. **`uq_dues_open_period`** partial unique index — at most one open dues invoice per member per period (kept from the original schema).

Retry semantics: if a handler throws **after** the idempotency marker is inserted,
the function **deletes the marker** and returns `500`, so PayPal's retry re-runs
the handler rather than short-circuiting as a false duplicate.

### `PayPal-Request-Id` on outbound order creates (`paypal-checkout`)
| Operation | Request id |
|---|---|
| Create dues order | `dues:<member_id>:<plan_id>` |
| Create event order | `event:<registration_id>` |
| Create donation order | `donation:<random-uuid>` (anonymous; no stable domain id) |

---

## 8. PayPal sandbox test plan

All testing uses **sandbox** credentials (`PAYPAL_ENV=sandbox`, a sandbox app's
client id/secret, and a sandbox webhook id). No live app is used in staging.

### 8.1 Sandbox accounts (PayPal Developer Dashboard → Sandbox → Accounts)
- One **business** sandbox account (the receiver — mirrors the chapter/Chase).
- One **personal** sandbox account (the payer) with a sandbox balance/card.

### 8.2 Local webhook loop
PayPal cannot reach `localhost`. Use the **Webhooks simulator**
(Developer Dashboard → Webhooks → Simulator) to POST signed sample events at a
tunnel (e.g. an `ngrok`/`cloudflared` URL) forwarding to:
`http://localhost:54321/functions/v1/paypal-webhook` (run `supabase functions serve --no-verify-jwt`).
Set `PAYPAL_WEBHOOK_ID` in `supabase/functions/.env` to the **simulator/webhook id**
so `verify-webhook-signature` matches.

### 8.3 Happy-path checks (real sandbox order via the buttons)
| Flow | Action | Expect |
|---|---|---|
| Dues | pay with the personal sandbox account | `PAYMENT.CAPTURE.COMPLETED` → member `active`, `expires_at` +1y, open invoice `paid`, `payments` row `succeeded` `paypal` |
| Donation | enter an amount, pay | `payments` row `succeeded`, `purpose_type='donation'`, `designation` set |
| Event ticket | RSVP a paid event, pay | registration `payment_status='paid'` + `status='approved'`, `payments` linked |

### 8.4 Signature / idempotency / failure (simulator)
- Send a `PAYMENT.CAPTURE.COMPLETED` from the simulator → reconciles once.
- Re-send the **same** event id → `200 {duplicate:true}`, no double write.
- POST a hand-forged body with a bad `paypal-transmission-sig` → `400`, nothing written.
- Send `PAYMENT.CAPTURE.REFUNDED` for a captured dues payment → member `lapsed`, invoice `refunded`, payment `refunded`.
- Send `PAYMENT.CAPTURE.REFUNDED` for a ticket → registration `cancelled`/`refunded`.

### 8.5 Mark-paid (no PayPal)
- As an admin, record a `check` payment for a pending invoice → invoice `paid`, member `active`, `payments` row `payment_method='check'` with `payment_reference`.
- As a **member**, attempt the same insert → blocked by RLS (no `payments_admin_insert` grant).

---

## 9. Remaining gaps (credential boundary — board action required)

The functions are built as deployable artifacts. The following require live
credentials and are intentionally NOT performed here (no fabricated deploy).

### 9.1 Create a PayPal REST app, then set the Edge Function secrets
PayPal Developer Dashboard → Apps & Credentials → create a **REST API app** for
the business account (sandbox first, then live). Copy its **Client ID** and
**Secret**.
```bash
supabase secrets set \
  PAYPAL_CLIENT_ID=<app-client-id> \
  PAYPAL_CLIENT_SECRET=<app-secret-SERVER-ONLY> \
  PAYPAL_WEBHOOK_ID=<webhook-id-SERVER-ONLY> \
  PAYPAL_ENV=sandbox \
  SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
# SUPABASE_URL / SUPABASE_ANON_KEY are auto-injected into deployed functions;
# set them explicitly only for `supabase functions serve` local runs.
# Optional: SITE_URL / ALLOWED_ORIGIN to lock the browser surface to one origin.
```
Put the **browser-safe** `PAYPAL_CLIENT_ID` into `js/config.js` (the SDK script
src). It is the ONLY PayPal value allowed in client files.

### 9.2 Deploy the functions
```bash
supabase functions deploy paypal-checkout
# paypal-webhook must accept unauthenticated PayPal POSTs — it authenticates via
# PayPal's signature, NOT a Supabase JWT. Disable JWT verification for it:
supabase functions deploy paypal-webhook --no-verify-jwt
```

### 9.3 Register the webhook in PayPal, then capture its id
PayPal Developer Dashboard → Apps & Credentials → your app → **Add Webhook**.
- Webhook URL: `https://<project-ref>.functions.supabase.co/paypal-webhook`
- Event types to subscribe (the ones we handle):
  `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.DECLINED`,
  `PAYMENT.CAPTURE.REFUNDED`, `PAYMENT.CAPTURE.REVERSED`,
  `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`,
  `BILLING.SUBSCRIPTION.EXPIRED`, `BILLING.SUBSCRIPTION.SUSPENDED`,
  `PAYMENT.SALE.COMPLETED`.
- Copy the created **Webhook ID** into `PAYPAL_WEBHOOK_ID` (§9.1).

### 9.4 (Optional) provision auto-renew billing plans, then backfill `membership_plans`
Only needed if the page offers the auto-renew toggle. Create a PayPal **product**
+ **billing plan** for Standard ($75/yr) and Premium ($150/yr), then:
```sql
update public.membership_plans set paypal_plan_id='<plan_standard>' where name='Standard Membership';
update public.membership_plans set paypal_plan_id='<plan_premium>'  where name='Premium Membership';
-- 'Comped Membership' stays null — comped/lifetime/manual never enter PayPal.
```
One-time annual dues need **no** `paypal_plan_id` (the order is created with an
inline amount from `amount_cents`).

### 9.5 Chase Zelle + check display (board-supplied, shown on the payment pages)
The membership/donate pages show these **alongside** the PayPal buttons as
first-class options (lane G renders the values from a board-supplied config):
- **Zelle:** "Send Zelle to `<chapter Zelle email/phone>` (Chase Business)." Memo: member name + "dues".
- **Check:** "Mail a check payable to `<chapter legal name>` to `<chapter mailing address>`." Memo: member name + "dues".
- After sending, the board records it via mark-paid (§5); the member's account
  flips to `active` on confirmation.
> The Zelle email/phone and the mailing address are NOT in this repo — they are
> board-supplied at provisioning. Do not hardcode placeholder values.

### 9.6 Known follow-ups (not blockers)
- TTL cleanup for stale `pending` event registrations (abandoned PayPal approvals) — `event-flow.md` C6.
- Partial-refund policy for tickets (current behavior: cascade on FULL refund; PayPal capture refunds are full-amount here).

---

## 10. Files (Lane B owned scope)

| Path | Role |
|---|---|
| `supabase/functions/paypal-checkout/index.ts` | order builder (dues/donation/event_ticket); amounts from DB |
| `supabase/functions/paypal-checkout/deno.json` | import map (zod, supabase-js) |
| `supabase/functions/paypal-webhook/index.ts` | signature-verified, idempotent reconciliation |
| `supabase/functions/paypal-webhook/deno.json` | import map (supabase-js) |
| `supabase/functions/_shared/paypal.ts` | OAuth2 token, Orders v2 create/capture/get, verify-webhook-signature |
| `supabase/functions/_shared/supabase.ts` | service-role + user-scoped client factories |
| `supabase/functions/_shared/http.ts` | response envelope + CORS helpers |
| `supabase/functions/_shared/types.ts` | row shapes (PayPal columns); donation bounds; payment methods |
| `supabase/migrations/011_destripe_add_paypal.sql` | de-Stripe schema; PayPal columns; mark-paid RLS |
| `_headers` | CSP (PayPal domains; no `stripe.com`) |
| `.env.example` | `PAYPAL_CLIENT_ID` (browser-safe) + `PAYPAL_CLIENT_SECRET` + `PAYPAL_WEBHOOK_ID` (server-only) |
| `docs/payment-contract-paypal.md` | this document |

Removed: `create-checkout-session/`, `stripe-webhook/`, `_shared/stripe.ts`, `docs/payment-contract.md`.

---

## 11. Citations

**Skills applied:** `api-integrating` (typed REST client, webhook signature
verification, server-side key handling, retry/idempotency via request ids),
`backend-hardening` (Zod input validation at the boundary, single response
envelope, server-side auth, secrets via env), `supabase-building` (service-role
boundary, RLS on every table, Edge Function secrets), `security-auditing`
(secrets-scan gate, auth-on-every-privileged-path, no client-trusted amounts).

**Librarians applied:** `api-integration-librarian` (PayPal Orders + webhook
verify-signature + idempotency patterns), `backend-librarian` (Edge Function
architecture, service-role containment), `supabase-librarian` (mark-paid RLS,
rename-table migration), `security-librarian` (signature-first ordering,
credential boundary, browser-safe vs server-only secret split).

**2026 reference docs (verified to exist):**
- PayPal Orders API v2: https://developer.paypal.com/docs/api/orders/v2/
- PayPal verify-webhook-signature: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
- PayPal Webhooks v1 (event names): https://developer.paypal.com/docs/api/webhooks/v1/
- PayPal Subscriptions API v1: https://developer.paypal.com/docs/api/subscriptions/v1/
- PayPal Standard / Donate integration: https://developer.paypal.com/docs/checkout/standard/integrate/
- PayPal JS SDK reference: https://developer.paypal.com/sdk/js/reference/
- PayPal REST authentication (OAuth2 client credentials): https://developer.paypal.com/api/rest/authentication/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Edge Function secrets: https://supabase.com/docs/guides/functions/secrets
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Chase Business — Zelle for Business: https://www.chase.com/business/banking/zelle
- Chase Business checking (mobile deposit): https://www.chase.com/business/banking/checking
