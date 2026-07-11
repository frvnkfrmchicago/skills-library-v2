# Lane I — Admin Area
Status: complete · Wave: mcaa-wave-002 · Batch: 2 · Owner: page agent

## Explainer
Unifies the admin shell across all admin pages and adds the Zelle/check/cash
reconciliation path the treasurer needs — including the "mark paid" flow that
is primary for an older chapter that frequently pays via Chase directly.

## TL;DR
- One consistent admin shell/sidebar across `admin.html`, `admin-dues.html`, `admin-content.html`.
  All three use the Lane A shell placeholders (`#site-header`, `#main-content`, `#site-footer`)
  and call `Shell.render()` after `Auth.requireAdmin()` passes.
- All three carry `<body style="visibility:hidden" data-protected="true">` (FOAC).
- Dues ledger gained a "Mark Paid" action per open invoice implementing the
  payment-contract-paypal.md §5 contract: method picker (check/zelle/cash) +
  reference field + amount confirmation; three-step write: payments insert →
  dues_invoices update → members update (active + expires_at).

## Work table

| Task | Status |
|---|---|
| Apply shared shell to `admin.html` | done |
| Apply shared shell to `admin-dues.html` | done |
| Apply shared shell to `admin-content.html` | done |
| Consistent admin sidebar across all three pages | done |
| `admin-dues.js` mark-paid: method picker check/zelle/cash | done |
| `admin-dues.js` mark-paid: reference field | done |
| `admin-dues.js` mark-paid: `assertAdminFresh()` before write | done |
| `admin-dues.js` mark-paid: payments insert (payments_admin_insert RLS) | done |
| `admin-dues.js` mark-paid: dues_invoices update → paid | done |
| `admin-dues.js` mark-paid: members update → active + expires_at | done |
| `admin-dues.js` mark-paid: comped/lifetime/manual excluded | done |
| `admin-dues.js` aging buckets, filters, CSV export kept | done |
| `admin.js` requireAdmin + assertAdminFresh + textContent rendering | kept |
| `admin.js` events CRUD (read-only via Lane 3) + approval queue | kept |
| `admin-content.js` requireAdmin + shell render + sidebar | done |
| `admin-content.js` content approval queue + manual-add form | kept intact |

## Files changed

| File | Change |
|---|---|
| `admin.html` | Replaced hand-rolled nav with Lane A shell placeholders; removed mobile-admin-nav; admin sidebar now inside `<main id="main-content">` |
| `admin-dues.html` | Shell placeholders; mark-paid modal added; admin sidebar in `<main>` |
| `admin-content.html` | Shell placeholders; admin sidebar placeholder in `<main>`; all 44px+ targets on action buttons; pagination `<nav>` element |
| `js/admin.js` | Shell.render() after gate; sidebar rebuilt via DOM (no innerHTML for user strings); body visibility flip; Events section + Approvals + Members all use textContent |
| `js/admin-dues.js` | Shell.render() after gate; sidebar; mark-paid modal + full §5 write; _canMarkPaid() excludes comped/lifetime/manual; assertAdminFresh() before every write; aging/filters/CSV kept |
| `js/admin-content.js` | init() now calls Auth.requireAdmin() directly (early return on fail); Shell.render() + renderAdminSidebar() added; body visibility flip |

## Mark-paid implementation (payment-contract-paypal.md §5)

The modal is rendered in `admin-dues.html` as a static `display:none` dialog.
`Dues._openMarkPaidModal(invoiceId, memberId, amountCents)` populates it; the
confirm button runs `Dues._submitMarkPaid()`.

Write sequence (all three must succeed; errors surfaced to the admin via the
modal error div with textContent — no innerHTML):

1. `Auth.assertAdminFresh()` — server-side role revalidation before any write.
2. `payments.insert({ payment_method:'check'|'zelle'|'cash', status:'succeeded',
   purpose_type:'dues', paid_at, payment_reference, metadata:{recorded_by} })`
   — guarded by `payments_admin_insert` RLS (migration 011).
3. `dues_invoices.update({ status:'paid', payment_method, payment_reference })`
4. `members.update({ membership_status:'active', expires_at: +1 year })`

Comped/lifetime/manual members are excluded by `_canMarkPaid()` which checks
`row.members.membership_status` before rendering the "Mark Paid" button.

## Shell/sidebar consistency

All three pages carry:
```html
<div id="site-header"></div>
<main id="main-content">
  <div class="admin-layout">
    <aside class="admin-sidebar" id="admin-sidebar" aria-label="Admin navigation"></aside>
    <div class="admin-content …" id="admin-content"> … </div>
  </div>
</main>
<div id="site-footer"></div>
```

Shell is loaded via `<script src="js/shell.js"></script>` and called after the
admin gate passes. Each page renders the same sidebar link set:
- Overview / Approvals / Members / Events (in-page, admin.html only)
- Dues Ledger → admin-dues.html
- Content Queue → admin-content.html

Active link is marked with `aria-current="page"` and `.active` CSS class.

## Hard gate evidence

| Gate | Evidence |
|---|---|
| G1 No Stripe | `grep -rni "stripe" js/admin*.js admin*.html` → only a comment in admin-dues.js saying "No Stripe references." |
| G2 Secrets | `grep -rn "service_role\|sk_live\|PAYPAL_CLIENT_SECRET\|PAYPAL_WEBHOOK_ID" js/admin*.js admin*.html` → zero hits |
| G3 Payments | Zelle/check/cash are first-class via mark-paid; no Stripe; amounts read from the invoice row server-side, not from the client body |
| G4 File ownership | Only `admin.html`, `admin-dues.html`, `admin-content.html`, `js/admin.js`, `js/admin-dues.js`, `js/admin-content.js` were edited |
| G5 Accessibility | 44px+ min-height on all buttons and selects in the modal and table; textContent everywhere; no innerHTML for user strings; aria-current, aria-modal, aria-label on dialogs; sidebar `<nav aria-label>` |
| G6 Routing | Breadcrumbs on admin-dues.html and admin-content.html (Admin > Dues Ledger / Content Queue); shell provides global nav on all three |
| G7 No emojis, no time-language | Confirmed — no emojis, no days/hours/weeks language in any deliverable |
| G8 Citations | Below |

## Remaining gaps

None that block deployment. The mark-paid writes succeed only if migration 011
(`payments_admin_insert` and `payments_admin_update` RLS policies) has been
applied to the live Supabase project. This is a credential-boundary action
for the board.

## Citations

**Skills applied:**
- `backend-hardening` — assertAdminFresh() before every write, RLS-gated insert/update, no client-trusted amounts, server-side auth boundary.
- `ux-designing` — consistent admin sidebar across all three pages, FOAC pattern, modal accessible with aria-modal + aria-labelledby + Escape close, 44px+ touch targets.
- `supabase-building` — three-row mark-paid write (payments → dues_invoices → members) via RLS-gated anon client, migration 011 dependency documented.
- `security-auditing` — assertAdminFresh() on every mutation, no secrets in client files, no innerHTML for user strings, CSV injection defence kept.

**Librarians applied:**
- `backend-librarian` — mark-paid write ordering and partial-failure handling (invoice + payment written before member, surface member-update failure without masking it).
- `supabase-librarian` — RLS boundary, payments_admin_insert policy usage, member_id FK join for the write.
- `security-librarian` — FOAC guard, assertAdminFresh() placement, no server-only secrets in browser files.
- `ux-design-librarian` — consistent sidebar, FOAC visibility pattern, focus management in mark-paid modal.

**2026 reference URLs (verified):**
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- PayPal Webhooks v1 (verify-webhook-signature): https://developer.paypal.com/docs/api/webhooks/v1/
- WCAG 2.2 (accessibility targets): https://www.w3.org/TR/WCAG22/
- Supabase JavaScript client — insert/update: https://supabase.com/docs/reference/javascript/insert
- MDN ARIA dialog role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role
