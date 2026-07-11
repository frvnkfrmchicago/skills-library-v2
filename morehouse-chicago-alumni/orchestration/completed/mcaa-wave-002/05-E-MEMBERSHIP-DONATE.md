# Lane E — Membership & Donate (PayPal UI)
Status: COMPLETE · Wave: mcaa-wave-002 · Batch: 2 · Owner: page agent

## Explainer
The pages where money happens: a public membership/join page and a real donate page, both on
PayPal with Zelle/check to Chase shown as first-class, trustworthy options for older members.

## TL;DR
- `membership.html`: rewritten — public tiers ($75 Standard / $150 Premium) + benefits; a PayPal
  Smart Button per tier; Zelle/check panel as a first-class peer; member dues status + "Renew" CTA
  (de-Stripe'd `js/membership.js startDuesCheckout` → PayPal order); shell + breadcrumbs.
- `donate.html`: new — PayPal Donate (variable amount + preset buttons), designation scholarship vs
  chapter, optional donor email, Zelle/check panel, trust line; shell + breadcrumbs.
- `js/membership.js`: Stripe `startDuesCheckout` replaced with `paypal.Buttons` / `paypal-checkout`.
  Comped/lifetime/manual guard preserved. No amount ever sent for dues — only `plan_id`.
- `js/donate.js`: new — `DonatePage.init()`, amount presets, validation, designation radio,
  `paypal.Buttons` donation flow with exact Lane B body shape.

## Work table

| Task | Status |
|---|---|
| `membership.html` — public tiers/benefits + PayPal buttons per tier | done |
| `membership.html` — Zelle/check panel first-class | done |
| `membership.html` — member dues status + renew (de-Stripe'd) | done |
| `membership.html` — shell (`site-header`, `main-content`, `site-footer`, `shell.js`, `Shell.render`) | done |
| `donate.html` — new page, PayPal variable donation + designation | done |
| `donate.html` — amount presets, $5/$50k validation | done |
| `donate.html` — Zelle/check panel first-class | done |
| `donate.html` — trust line (exact contract copy) | done |
| `donate.html` — shell + breadcrumbs | done |
| `js/membership.js` — replace Stripe redirect with `paypal.Buttons` | done |
| `js/membership.js` — comped/lifetime/manual guard preserved | done |
| `js/donate.js` — new module, `DonatePage.init()` | done |

## Files changed

| File | Change |
|---|---|
| `membership.html` | Full rewrite — shell, PayPal SDK load, two-tier grid, Zelle/check panel, member dues section |
| `donate.html` | New file — PayPal donate form, designation radios, presets, Zelle/check, trust line, shell |
| `js/membership.js` | Rewrite — `MembershipPage` (public join buttons) + `Member` (portal, de-Stripe'd dues CTA) |
| `js/donate.js` | New file — `DonatePage` with full Lane B donation flow |

Files NOT touched (respected ownership): `js/shell.js`, `css/*`, `index.html`, `js/app.js`,
`supabase/**`, `docs/payment-contract-paypal.md`, `_headers`.

## Exact PayPal request bodies (confirm against Lane B §4.1)

**Dues (membership.html / js/membership.js):**
```jsonc
{
  "purpose": "dues",      // literal — matches Lane B §4.1
  "plan_id": "<uuid>"     // membership_plans.id — price resolved server-side, NEVER client
}
```
Invoked: `window.supabaseClient.functions.invoke('paypal-checkout', { body: { purpose: 'dues', plan_id: planId } })`

**Donation (donate.html / js/donate.js):**
```jsonc
{
  "purpose":      "donation",
  "amount_cents": 5000,            // integer; user-entered, server clamps to [500, 5000000]
  "designation":  "scholarship",   // "scholarship" | "chapter" from radio input
  "donor_email":  "person@x.org"   // optional; omitted when the field is blank
}
```
Invoked: `window.supabaseClient.functions.invoke('paypal-checkout', { body: { purpose:'donation', amount_cents, designation, donor_email? } })`

Both match Lane B §4.1 exactly. No `amount` for dues. Donation `amount_cents` is clamped server-side.
Response `data.order_id` is returned from `createOrder`; `data.approve_url` is available as
redirect fallback. No Stripe calls anywhere.

## Remaining gaps (credential boundary — board action required)
- Replace `PAYPAL_CLIENT_ID` placeholder in `membership.html` and `donate.html` SDK script src with the live (or sandbox) client id from the PayPal Developer Dashboard app (§9.1 of `docs/payment-contract-paypal.md`).
- Replace Zelle address + check mailing address placeholder text (marked "board-provided at provisioning") in both pages with the chapter's live Chase credentials.
- After PayPal credentials are set, test Standard and Premium dues buttons in sandbox mode; test scholarship and chapter donation designation.

## Hard gate status

| Gate | Status | Evidence |
|---|---|---|
| G1 No Stripe | PASS | `grep -rni "stripe"` on owned files returns only comment/history text; zero live code references `stripe.com` or any Stripe SDK/key. |
| G2 Secrets | PASS | `grep -rn "service_role|sk_live|whsec_|PAYPAL_CLIENT_SECRET|PAYPAL_WEBHOOK_ID"` on owned files returns zero. `PAYPAL_CLIENT_ID` placeholder appears only as SDK src attribute (browser-safe by contract §9.1). |
| G3 Payments | PASS | Dues body sends `plan_id` only — no amount. Donations send `amount_cents` (clamped server-side). Comped/lifetime/manual members are guarded before any PayPal call in both `MembershipPage._buildButton` and `Member._buildDuesButton`. Zelle/check shown as first-class peer on both pages with explicit headings and full-panel treatment. |
| G4 File ownership | PASS | Edited only `membership.html`, `donate.html`, `js/membership.js`, `js/donate.js`. Shell (`js/shell.js`), CSS, `js/app.js`, supabase functions, and all other pages untouched. |
| G5 Accessibility | PASS | Shell provides skip link; `<main id="main-content">`; `aria-label` on PayPal button containers; `<fieldset>/<legend>` for designation radios; `aria-describedby` on amount input with error + hint targets; `aria-live="polite"` on error region; `role="radiogroup" aria-required="true"`; min-height 44px on preset buttons; visible focus styles via existing `components.css` tokens; no `innerHTML` for user strings (only `= ''` clears and one static loading string). |
| G6 Routing | PASS | Both pages use `Shell.render({ page:'membership'|'donate', breadcrumbs:[{label:'Membership'|'Donate'}] })`. Shell auto-prepends Home. `donate` and `membership` are in `js/shell.js` ROUTES and PRIMARY nav. |
| G7 No emojis / No time-language | PASS | `grep` for emoji chars returns zero. No days/hours/weeks language in any deliverable. |
| G8 Citations | PASS | See Citations section below. |

## Citations

**Skills applied:**
`ux-designing` (two-column layout, designation radios, accessible form structure, empty/error states, trust line placement),
`api-integrating` (exact Lane B request/response seam, `paypal.Buttons` createOrder → order_id pattern, deferred SDK load with retry, MEMBER_NOT_BILLABLE + AMOUNT_OUT_OF_RANGE error mapping),
`component-building` (tier cards, preset buttons, designation option components, offline panel, status badge row, all built with DOM nodes not innerHTML),
`flow-designing` (auth guard flow → PayPal popup → onApprove re-fetch; offline path: send Zelle/check → board mark-paid → member activation).

**Librarians applied:**
`ux-design-librarian` (older-audience UX: explicit annual control, large touch targets, clear copy, no jargon),
`api-integration-librarian` (PayPal JS SDK deferred-load pattern, createOrder/onApprove/onCancel/onError hooks, redirect fallback via approve_url),
`backend-librarian` (server-side amount enforcement, JWT auth guard before order creation, non-billable short-circuit),
`flow-librarian` (auth → checkout → onApprove state machine; offline: Zelle/check → admin mark-paid path).

**2026 reference docs (verified to exist):**
- PayPal JavaScript SDK reference: https://developer.paypal.com/sdk/js/reference/
- PayPal Standard / Donate integration: https://developer.paypal.com/docs/checkout/standard/integrate/
- PayPal Orders API v2: https://developer.paypal.com/docs/api/orders/v2/
- Chase Business — Zelle for Business: https://www.chase.com/business/banking/zelle
- W3C WCAG 2.2 (SC 1.4.3 Contrast, SC 2.4.1 Bypass Blocks, SC 2.4.11 Focus Appearance, SC 2.5.5 Target Size): https://www.w3.org/TR/WCAG22/
- Nielsen Norman Group — Designing for Older Adults: https://www.nngroup.com/articles/older-users-ux/
- W3C WAI-ARIA Authoring Practices — Radio Group pattern: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
