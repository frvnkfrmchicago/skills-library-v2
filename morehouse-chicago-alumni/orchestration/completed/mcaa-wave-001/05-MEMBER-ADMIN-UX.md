# Lane 5 — Member Portal + Admin Dues UI
Status: done
Wave: mcaa-wave-001
Owner: Batch 2 agent (Lane 5)
Single source of truth: this file.

## Explainer (plain language)
This lane built the screens chapter members and board members actually use. Members
now get a private dashboard that shows whether their dues are paid, when the next
renewal is, every receipt for what they have paid, and the events they have signed
up for — plus a one-tap button to renew or upgrade that sends them to a secure
payment page. Board members get a dues ledger they can filter (paid, overdue,
comped, and more), see how overdue each member is, and download as a spreadsheet.
The alumni directory is now locked: signed-out visitors see only a "members only"
sign-in panel with no member information at all, and signed-in members see only the
brothers who have chosen to be listed. The admin console is gated so nothing loads
until the system confirms the person is a board member. Finally, the homepage
"Join", "Renew", and "Donate" buttons now start real checkout instead of showing a
placeholder pop-up.

## TL;DR
- Member dashboard (`membership.html` + `js/membership.js`): dues status, next
  renewal, receipts, my events, one-tap renew/upgrade -> Stripe Checkout (sends
  `plan_id` only — never an amount), and a directory opt-in toggle. Gated by
  `Auth.requireAuth()` behind a hidden body (FOAC).
- Dues ledger (`admin-dues.html` + `js/admin-dues.js`): status filters across the
  whole `dues_status` enum + a derived Comped filter, aging buckets, outstanding
  total, and CSV export (with CSV-injection defanging). Gated by `Auth.requireAdmin()`.
- Directory (`directory.html` + `js/directory.js`): signed-out = zero-PII sign-in
  gate (the member query never runs); signed-in = only `directory_visible=true`
  peers, every member string rendered via `textContent` (no innerHTML), LinkedIn
  links scheme-checked.
- Admin shell (`admin.html` + `js/admin.js`): renders nothing until
  `Auth.requireAdmin()` passes (FOAC); live overview, pending-registration approvals,
  members, read-only events; nav links to Dues + Content added.
- `index.html` second-touch: membership tiers + donation buttons call
  `create-checkout-session` and redirect to the returned Stripe URL. Lane 1's
  first-touch (script tags, sign-in form, nav wiring) was PRESERVED — only the three
  `alert()` placeholders were replaced.
- `docs/member-admin-flow.md`: happy + chaos paths for all five flows.

## Completed work
| Task | Status | Notes |
|---|---|---|
| Member dashboard + one-tap dues checkout | done | `purpose:'dues'`, `plan_id` only; comped/lifetime/manual short-circuit (no Stripe). |
| Receipts (payments) + my events (registrations) | done | Succeeded payments only; registrations joined to events. |
| Directory opt-in toggle | done | Writes `profiles.directory_visible`; reverts on error. |
| Admin dues ledger + filters + aging + CSV | done | Deep-links `?status=overdue`; export re-validates admin. |
| Directory auth gate (zero PII signed out) | done | Peer query never runs when signed out (verified). |
| Directory visibility-aware + sanitized | done | `directory_visible` filter + `textContent`; URL scheme guard. |
| Admin shell gate + Supabase reads + Dues/Content nav | done | `requireAdmin()` + FOAC; counts via `head:true`. |
| `index.html` CTAs -> checkout (second-touch) | done | Dues + donations wired; Lane 1 first-touch preserved. |
| `docs/member-admin-flow.md` | done | Dual-path (happy + chaos) for all flows. |

## Files changed (path + one line)
| Path | Change |
|---|---|
| `js/membership.js` | NEW — member dashboard module: dues/renewal/receipts/events, dues checkout (plan_id only), directory toggle, all states. |
| `membership.html` | NEW — FOAC hidden body + `data-protected`; contract script order; `Member.start()` after Store/Auth init. |
| `js/admin-dues.js` | NEW — dues ledger: enum status filters + Comped, aging buckets, outstanding total, CSV export with injection defang. |
| `admin-dues.html` | NEW — FOAC hidden body; contract script order; `Dues.start()`. |
| `js/directory.js` | REWRITE — localStorage -> Supabase; signed-out zero-PII gate; `directory_visible` filter; DOM builders (no innerHTML for member data); URL scheme guard. |
| `directory.html` | REWRITE — contract script order (CDN+config+store+auth); sign-in modal; async sign-in; re-render on sign-in. |
| `js/admin.js` | REWRITE — localStorage/RSVPs CRUD -> `Auth.requireAdmin()` gate + Supabase reads (overview/approvals/members/events read-only); `assertAdminFresh()` before writes; Dues+Content nav. |
| `admin.html` | REWRITE — FOAC hidden body + `data-protected`; contract script order; `Admin.start()` after Store/Auth init. |
| `index.html` | SECOND-TOUCH — replaced 3 `alert()` stubs with `handleMembership`/`handleDonation` + shared `Checkout` helper -> `create-checkout-session` redirect. Lane 1 first-touch preserved. |
| `docs/member-admin-flow.md` | NEW — member + board flows, happy + chaos paths, Lane 2 seam, a11y notes. |

## Commands run (verification)
| Command | Result |
|---|---|
| `node --check` on all 4 new/rewritten JS files | all OK |
| inline-script parse of `index.html` (`new Function`) | OK |
| `grep -rn "service_role\|sk_live\|sk_test\|whsec_" js/ *.html` | ZERO (G1 PASS) |
| innerHTML interpolation audit (member data) | only static/numeric tokens interpolated; member strings via `textContent` (G5 #7 PASS) |
| emoji + time-language scans (Lane 5 files) | none (G6 PASS) |
| anti-mock grep (John Doe / lorem / test@test) | none (G3 PASS) |
| Node harness: directory signed-OUT | peer query NOT called; sign-in gate rendered (HARD GATE PASS) |
| Node harness: directory signed-IN | peer query called; `directory_visible` filter keeps 1/2 peers; own row first; `javascript:` URL rejected, `https:` accepted |
| Node harness: membership/admin-dues helpers | money/status/aging/CSV-defang all correct |
| Node harness: `index.html` checkout bodies | DUES sends NO amount field (plan_id only); DONATION reads per-card chip -> `amount_cents`; fn name `create-checkout-session` |
| curl FOAC check (`admin`/`admin-dues`/`membership`) | all `<body style="visibility:hidden" data-protected="true">` |
| curl directory.html served HTML | zero seed member names present |
| `git status` ownership check | only the 10 owned files; zero forbidden files modified (G2 PASS) |

## Hard gates — status
- Directory zero PII when logged out: PASS (peer query never invoked signed-out; verified by Node harness + curl of served HTML).
- Admin renders nothing until `requireAdmin()`: PASS (FOAC `visibility:hidden` on `admin.html`/`admin-dues.html`; `Admin.start()`/`Dues.start()` gate first).
- Member with `directory_visible=false` not shown to peers: PASS (client filter on top of RLS; hidden peer excluded in harness).
- Dues amount never sent from client: PASS (DUES body contains `plan_id` only; no `amount`/`amount_cents`/`price*`).
- No `innerHTML` for user-controlled strings: PASS (member data via `textContent`/DOM builders; only static/numeric tokens in template literals).
- No secrets / no emojis / no time-language: PASS.

## Cross-lane seam — Lane 2 `create-checkout-session` (reconciled)
Lane 2 landed during this lane. I read its deployed `index.ts` Zod schema and
confirmed my call bodies match:

- DUES — Lane 2 `DuesInput` requires `{ purpose:'dues', plan_id:uuid }` (+ optional
  `success_url`/`cancel_url`). I send those plus `member_id`/`profile_id`; Zod
  `.object()` strips the extras and Lane 2 derives the member from the authenticated
  JWT (`.eq('profile_id', userId)`), then reads the price from `membership_plans` by
  `plan_id` and rejects comped/lifetime/$0 with `MEMBER_NOT_BILLABLE`. MATCH.
- DONATION — Lane 2 `DonationInput` requires `{ purpose:'donation', amount_cents,
  designation }` (+ optional `donor_email`, URLs). I send those plus `profile_id`
  (stripped; donor derived from session). MATCH.

The EXACT bodies I send (for the lead to confirm against Lane 2):
```js
// Dues (membership.js startDuesCheckout + index.html handleMembership):
supabaseClient.functions.invoke('create-checkout-session', { body: {
  purpose:'dues', plan_id:'<uuid>', member_id:'<uuid>', profile_id:'<uuid>',
  success_url:'<origin>/membership.html?checkout=success',
  cancel_url:'<origin>/membership.html?checkout=cancelled'   // index.html uses #membership
}})  // -> 200 { url } redirect ; 400 { error:'MEMBER_NOT_BILLABLE' }

// Donation (index.html handleDonation):
supabaseClient.functions.invoke('create-checkout-session', { body: {
  purpose:'donation', designation:'scholarship'|'chapter', amount_cents:<int>,
  profile_id:'<uuid>|null',
  success_url:'<origin>/index.html?checkout=success',
  cancel_url:'<origin>/index.html#donate'
}})  // -> 200 { url } redirect
```

## Remaining gaps (honest)
- Live Supabase + Stripe not provisioned in this environment (credential boundary).
  All code is deployable; nothing was deployed. To go live the board must: set
  `js/config.js` URL + anon key; run migrations 001–010; Lane 2 deploys the Edge
  Functions and sets Stripe secrets; create Stripe Products/Prices and write their
  `stripe_price_id` into `membership_plans` (the seed leaves them `null`, so until
  then the membership CTA shows "plans are being finalized" / routes to the dashboard
  rather than failing).
- Browser-driven preview verification was unavailable (the sandbox blocked the
  managed preview server from binding, and the fallback Node static server is not
  reachable from the preview browser). Verification was done instead via curl against
  a local Node server + deterministic Node harnesses that load the actual modules and
  assert the security-critical behaviors. The harness DOM stub is minimal — it proves
  logic and the gate, not pixel rendering. Lane 7 (QA) should do a live click-through.
- `member_id` pre-lookup in `index.html handleMembership` is redundant given Lane 2
  derives the member server-side; harmless (stripped by Zod). Left in as a fast
  signed-in/has-record check; the lead may simplify at merge if desired.
- Aging "days overdue" language in the dues ledger refers to invoice `due_date`
  (financial aging, standard ledger terminology) — this is data about invoices, not a
  project-effort duration, so it is intentionally NOT a G6 time-language violation.
- Directory/admin do not paginate; for a large roster a future lane should add range
  pagination. Out of scope for this wave.
- Email is shown to admins in the approvals/members views and exported in the dues
  CSV — that is intentional (board-only, RLS-gated), but the CSV is a local download
  of member contact + financial data; the board runbook (Lane 8) should note handling.

## Exact paths created/edited
- `/morehouse-chicago-alumni/js/membership.js` (new)
- `/morehouse-chicago-alumni/membership.html` (new)
- `/morehouse-chicago-alumni/js/admin-dues.js` (new)
- `/morehouse-chicago-alumni/admin-dues.html` (new)
- `/morehouse-chicago-alumni/js/directory.js` (rewrite)
- `/morehouse-chicago-alumni/directory.html` (rewrite)
- `/morehouse-chicago-alumni/js/admin.js` (rewrite)
- `/morehouse-chicago-alumni/admin.html` (rewrite)
- `/morehouse-chicago-alumni/index.html` (second-touch edit)
- `/morehouse-chicago-alumni/docs/member-admin-flow.md` (new)

## Task-sheet update row (for the lead)
| Wave | Lane | Owner | Status-claim | Summary | Doc path |
|---|---|---|---|---|---|
| mcaa-wave-001 | 5 | Batch 2 agent | done | Member dashboard, admin dues ledger, auth-gated directory, gated admin shell, homepage checkout CTAs. All hard gates verified; Lane 1 index.html first-touch preserved; checkout bodies match Lane 2's deployed schema. | orchestration/active/mcaa-wave-001/05-MEMBER-ADMIN-UX.md |

## Citations
Skills applied:
- `ux-designing` — all-states design (loading/empty/error/success), WCAG AA flow,
  focus + screen-reader support, never dead-end the user.
- `flow-designing` — dual-path (happy + chaos) walkthroughs in member-admin-flow.md;
  payment "price visible / no surprise cost"; state-machine framing.
- `component-building` — token-only styling (`var(--*)`), focus-visible reliance,
  44px `.btn` touch targets, decorative glyphs `aria-hidden`.
- `frontend-architecting` — separation of data-fetch from render (module `_load()` vs
  `render()`), no API calls inline in markup, explicit per-module state object.

Librarians applied:
- `ux-design-librarian` (`librarians/ux-design-librarian.md`) — gate/empty-state and
  accessibility patterns.
- `components-librarian` (`librarians/components-librarian.md`) — card/table/badge
  composition with tokens.
- `frontend-librarian` (`librarians/frontend-librarian.md`) — vanilla-JS module
  structure over the `window.*` global surface.
- `backend-librarian` (`librarians/backend-librarian.md`) — RLS-aware reads, server-
  side price authority, `getUser()` revalidation before sensitive ops.

2026 references (verified to exist):
- supabase-js Auth (getUser / getSession / signInWithPassword):
  https://supabase.com/docs/reference/javascript/auth-getuser
- Edge Functions invoke from the client:
  https://supabase.com/docs/reference/javascript/functions-invoke
- Row Level Security:
  https://supabase.com/docs/guides/database/postgres/row-level-security
- Stripe Checkout — redirect to the Session URL:
  https://docs.stripe.com/payments/checkout/how-checkout-works
- Stripe — fixed-price subscriptions via Checkout:
  https://docs.stripe.com/billing/subscriptions/build-subscriptions
- WCAG 2.2 quick reference:
  https://www.w3.org/WAI/WCAG22/quickref/
- OWASP CSV / formula injection (export defang rationale):
  https://owasp.org/www-community/attacks/CSV_Injection

## Completion rule
This file is the record. Hard gates verified above. `index.html` handoff order was
respected (Lane 1 first-touch present and preserved before the second-touch edit).
The Lane 2 checkout seam was reconciled against Lane 2's deployed Edge Function and
matches.
