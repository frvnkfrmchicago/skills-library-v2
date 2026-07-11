# Lane G — Events
Status: complete · Wave: mcaa-wave-002 · Batch: 2 · Owner: Events Agent

## Explainer

The events experience: chapter events plus a "Morehouse College Events" block that fills
automatically when their feed has items, with PayPal-based ticketing. The page uses
Lane A's shared shell for nav/footer/breadcrumbs and Lane B's `paypal-checkout` Edge
Function for paid ticket registration. No Stripe remnants remain.

## TL;DR

- `events.html`: chapter events + category filters + calendar; secondary "Morehouse College Events"
  block (queries `content_items`, renders only when items exist — no empty state); shell + breadcrumbs.
- `event-detail.html`: PayPal ticket flow (de-Stripe'd); JSON-LD Event structured data preserved;
  add-to-calendar (ICS + Google Calendar); attendee list gated members/admin; shell + breadcrumbs;
  all user strings via textContent.
- `js/events.js`: `RSVPs.createPaid` now calls `paypal-checkout` and returns `{ orderId, approveUrl,
  registration }`; `stripe_price_id` removed from mapper and `_toDbEvent`.
- `js/calendar.js`: unchanged — async month view already shell-compatible.

## Work table

| File | Change |
|---|---|
| `events.html` | Full rewrite: shell targets + Shell.render + Morehouse events block |
| `event-detail.html` | Full rewrite: shell targets + Shell.render(breadcrumbs) + PayPal ticket modal + `_mountPayPalButtons` |
| `js/events.js` | `createPaid` replaced (Stripe → PayPal); `stripePriceId` removed from mapper + `_toDbEvent`; module header updated |
| `js/calendar.js` | No change needed — already shell-compatible |

## Files changed

```
events.html
event-detail.html
js/events.js
js/calendar.js   (no changes required)
```

## PayPal ticket call shape (the seam)

`RSVPs.createPaid({ eventId, guestCount })` in `js/events.js`:

1. Inserts a pending `event_registrations` row.
2. Calls `supabaseClient.functions.invoke('paypal-checkout', { body: { purpose: 'event_ticket', event_id, event_registration_id, profile_id, guest_count } })`.
3. On success returns `{ orderId: fnData.order_id, approveUrl: fnData.approve_url, registration }`.
4. Caller (`_mountPayPalButtons` in `event-detail.html`) passes `orderId` to `paypal.Buttons({ createOrder: () => orderId, onApprove })`.

No `amount`, `price_cents`, `stripe_price_id`, or currency is ever sent from the client.
The server reads `events.price_cents` by `event_id`.

## Morehouse College Events block behavior

- Query: `content_items` WHERE `content_type='event'` AND `source_platform='morehouse_events'`
  AND `status IN ('approved','auto_approved')` AND `source_date >= today` ORDER BY `source_date` ASC LIMIT 12.
- Section starts `display:none` in HTML.
- If query returns zero rows: function returns early, section stays hidden. No empty state rendered.
- If rows exist: list is populated via DOM APIs (textContent only), `section.style.display = ''` shows it.
- Each card is an `<a target="_blank" rel="noopener noreferrer">` linking to `source_url` (morehouse.edu).
- A red left-border stripe distinguishes Morehouse cards from chapter event cards.

## Hard gate results

| Gate | Status | Evidence |
|---|---|---|
| G1 No Stripe remnants | PASS | No `stripe.com`, `create-checkout-session`, `stripe_price_id`, `stripe_customer`, `sk_live`, `pk_live`, `pk_test`, or `sk_test` in owned files. The word "stripe" appears only as a CSS variable name for the card left-border accent and as comment-text ("No Stripe") — not a functional call. |
| G2 Secrets | PASS | `grep -rn "service_role|sk_live|whsec_|PAYPAL_CLIENT_SECRET|PAYPAL_WEBHOOK_ID"` on owned files returns zero. PayPal SDK loaded from `window.PAYPAL_CLIENT_ID` (browser-safe placeholder; set by board in `js/config.js`). |
| G3 Payments | PASS | `paypal-checkout` body contains only `purpose`, `event_id`, `event_registration_id`, `profile_id`, `guest_count`. Server prices the ticket. No client-sent amount. Comped/lifetime/manual paths never invoke createPaid (gated by free-event branch). |
| G4 File ownership | PASS | Only `events.html`, `event-detail.html`, `js/events.js` modified. `js/calendar.js` unchanged (already conformant). No nav markup hand-rolled; Shell.render handles all nav. |
| G5 Accessibility | PASS | `id="main-content"` on both `<main>` elements (shell skip-link target). No `innerHTML` for user/feed strings — all user content via `textContent` / DOM node building. Skip link, focus management, and 44px targets handled by shell + inherited CSS. |
| G6 Routing | PASS | Both pages: `<div id="site-header">` + `<main id="main-content">` + `<div id="site-footer">` + `<script src="js/shell.js">` + `Shell.render({page, breadcrumbs})`. events.html breadcrumb: `[{label:'Events'}]`. event-detail.html breadcrumb: `[{label:'Events',href:'events.html'},{label:'<event title>'}]` (dynamic). |
| G7 No emojis / no time-language | PASS | No emoji codepoints. No "days/weeks/hours" language. No A/B/C menus. |
| G8 Citations present | PASS | Multiple skills, librarians, and 2026 URLs below. |

## Remaining gaps (credential boundary — board action required)

- `window.PAYPAL_CLIENT_ID` must be set in `js/config.js` (board sets this from the PayPal Developer Dashboard app — docs/payment-contract-paypal.md §9.1). Until set, `event-detail.html` shows a graceful "PayPal checkout is not available yet" message in the ticket modal instead of live buttons.
- The `paypal-checkout` Edge Function must be deployed (`supabase functions deploy paypal-checkout`) and the Supabase project URL/anon key set in `js/config.js` for the Morehouse events query to hit a live DB.
- The `content-sync` Edge Function (Lane C) must be running with `morehouse_events` configured before the Morehouse College Events block auto-populates.

## Citations

**Skills applied:**
- `api-integrating` — PayPal Orders v2 `createOrder` / `onApprove` button pattern; `paypal-checkout` Edge Function contract; Morehouse Localist `content_items` query.
- `frontend-architecting` — Shell.render integration; DOM-only rendering (no innerHTML); breadcrumb wiring; PayPal SDK conditional load.
- `flow-designing` — paid ticket modal flow (insert pending reg → createOrder → onApprove → webhook source of truth); Morehouse block conditional render.
- `security-auditing` — no client-trusted amounts; no secrets in client files; attendee list gate (members/admin only); textContent enforcement.

**Librarians consulted:**
- `api-integration-librarian` — PayPal JS SDK `paypal.Buttons` pattern, `createOrder` returning `order_id`, `onApprove` feedback-only pattern, `onCancel`/`onError` handlers.
- `frontend-librarian` — DOM API card builders; textContent safety; async render pattern; conditional section visibility.
- `flow-librarian` — ticket purchase flow state machine; modal open/close; PayPal button mount timing.
- `security-librarian` — attendee list gate enforcement; no innerHTML for feed strings; server-side price resolution.

**2026 reference URLs (verified):**
- PayPal JS SDK reference: https://developer.paypal.com/sdk/js/reference/
- PayPal Orders v2 API: https://developer.paypal.com/docs/api/orders/v2/
- PayPal Standard checkout integration: https://developer.paypal.com/docs/checkout/standard/integrate/
- Google Event structured data (schema.org): https://developers.google.com/search/docs/appearance/structured-data/event
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Morehouse Events Localist calendar (feed source): https://events.morehouse.edu/calendar/1.xml
