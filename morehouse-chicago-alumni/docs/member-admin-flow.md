# Member + Board Flows — Lane 5

Wave: `mcaa-wave-001`. Owner: Lane 5. Companion to `docs/data-contract.md`
(§2 Auth/Store, §4 schema, §6 RLS, §7 payments, §9 security invariants).

This document maps the member portal and board/admin journeys built by Lane 5,
walking each one TWICE: the happy path and the chaos path (where real users live).

---

## 1. Surfaces Lane 5 owns

| Surface | File(s) | Gate | Purpose |
|---|---|---|---|
| Member dashboard | `membership.html`, `js/membership.js` | `Auth.requireAuth()` + FOAC | Dues status, next renewal, receipts, my events, one-tap renew, directory opt-in |
| Dues ledger | `admin-dues.html`, `js/admin-dues.js` | `Auth.requireAdmin()` + FOAC | Filter by status, aging buckets, CSV export |
| Directory | `directory.html`, `js/directory.js` | Public gate; data only when signed in | Members-only, opt-in, sanitized listings |
| Admin shell | `admin.html`, `js/admin.js` | `Auth.requireAdmin()` + FOAC | Overview, approvals, members, events (read-only), nav to Dues + Content |
| Homepage CTAs | `index.html` (second-touch) | Sign-in for dues; open for donations | Membership tiers + donations -> Stripe Checkout |

All four protected/data surfaces depend on Lane 1's `window.Auth` / `window.Store`
(loaded in the contract order: supabase-js CDN -> config -> store -> auth -> module -> app).

---

## 2. Flow: Member renews dues (one-tap)

- **Entry point:** signed-in member on `membership.html` (or clicks Join/Renew on `index.html#membership`).
- **Exit point:** redirected to Stripe Checkout; on return, dashboard shows the pending/active state.
- **Effort score (target < 20, "standard"):** 1 decision (which plan), 0 fields typed, 1 context switch (Stripe) -> ~8. Delightful range.

### Happy path
1. `membership.html` loads with `<body hidden>`. `Store.init()` + `Auth.init()` seed the session; `Auth.requireAuth()` reveals the body.
2. `Member.start()` reads `members`, `dues_invoices`, `payments`, `event_registrations`, `membership_plans`. Status card renders with the membership status + next renewal (`members.expires_at`).
3. Member clicks **Choose Standard / Premium**.
4. `startDuesCheckout(plan_id)` re-validates the user with `auth.getUser()`, then calls `create-checkout-session` with `purpose:'dues'`, `plan_id`, `member_id`, `profile_id`, success/cancel URLs. **No amount is sent** — the price is resolved server-side from `membership_plans` (§9 #6).
5. Edge Function returns `{ url }`; the browser redirects to Stripe.
6. On payment, Stripe redirects back to `membership.html?checkout=success`; a toast confirms; the webhook (Lane 2) flips the invoice to `paid` and the member to `active`.

### Chaos path
| Scenario | Handling |
|---|---|
| Not signed in | FOAC body stays hidden; `requireAuth()` redirects to `index.html?signin=1` before any paint. |
| Comped / lifetime / manual member | CTA is replaced with a "complimentary — no dues" note; the checkout call is never made. If reached anyway, the Edge Function returns `MEMBER_NOT_BILLABLE` and the UI shows a friendly message. |
| Plans not provisioned (no Stripe price yet) | The CTA shows "plans are being finalized"; no broken checkout. |
| Backend not configured (`window.supabaseClient` absent) | Dashboard renders a "ready — connect backend" notice; the button shows a toast instead of failing silently. |
| Checkout returns an error / network drop | Button re-enables, original label restored, toast explains; no half-submitted state. |
| Member cancels at Stripe | Returns to `?checkout=cancelled`; toast: "no payment was taken." |
| Session expired between load and click | `auth.getUser()` fails -> toast: "session expired, sign in again"; no call to Stripe. |
| Returns next day | Fresh load re-reads live state; the URL `?checkout=` param is stripped via `replaceState` so a refresh does not re-toast. |

---

## 3. Flow: Member appears in the directory (opt-in)

- **Entry point:** member dashboard, "Directory & privacy" section.
- **Exit point:** `profiles.directory_visible` flipped; the directory reflects it for peers.
- **Default is PRIVATE** (`directory_visible=false`, §9 #3). This is the chapter's privacy guarantee.

### Happy path
1. Member toggles **Show me in the member directory**.
2. `js/membership.js` updates `profiles.directory_visible` for `auth.uid()` (RLS: a member may update their own profile, but the §6 `WITH CHECK` blocks changing `role`).
3. Toast confirms; the directory now lists this member to other signed-in members.

### Chaos path
| Scenario | Handling |
|---|---|
| Update fails (RLS / network) | The checkbox reverts to its prior state; toast shows the error. No optimistic lie. |
| Toggle off while listed | Member immediately disappears from peers; their own dashboard still shows their card with a "you are hidden" hint. |

---

## 4. Flow: Visitor opens the directory

- **Entry point:** anyone clicks Directory in the nav.
- **Exit point (signed out):** a sign-in gate with **zero member PII**.
- **Exit point (signed in):** a grid of opt-in peers, sanitized.

### Happy path (signed in)
1. `Directory.init()` checks `Store.isSignedIn()`. Signed in -> show a skeleton, then fetch.
2. The query `profiles.select(... members(chapter_role_title)).order(full_name)` returns the member's own row plus `directory_visible=true` rows (RLS-enforced). A client-side filter on `directory_visible` is defense-in-depth.
3. Cards are built with `textContent` / DOM nodes only — names, class years, role titles, bios, LinkedIn are never interpolated into HTML (§9 #7). LinkedIn renders as a link only when it parses as an `http(s)` URL (no `javascript:` schemes).
4. The member always sees their own card first; if their visibility is off, a hint nudges them to enable it.

### Chaos path
| Scenario | Handling |
|---|---|
| **Signed out** | The peer query NEVER runs. A static sign-in gate renders with no member data of any kind. **(Hard gate.)** |
| Signed in but no peers opted in | Empty state: "No public listings yet — be the first." Own card still shows. |
| Search / filter yields nothing | "No members match" empty state; filter chips reflect `aria-pressed`. |
| Hostile profile value (script in name/bio) | Inert: rendered via `textContent`; a `javascript:`/`data:` LinkedIn URL is rejected by the URL-scheme check. |
| Backend offline | Sign-in gate (signed out) or empty grid (signed in) — never a crash. |

---

## 5. Flow: Board reviews dues (ledger + export)

- **Entry point:** admin/board opens `admin-dues.html` (or the "Overdue dues" card on the admin overview deep-links with `?status=overdue`).
- **Exit point:** a filtered, aged ledger; optional CSV download.

### Happy path
1. FOAC body hidden; `Auth.requireAdmin()` reads the JWT role and reveals only for admin/board.
2. `Dues.start()` reads `dues_invoices` joined to `members -> profiles` (RLS: admin/board read all).
3. Status chips filter the view (`all / paid / overdue / pending / payment_failed / action_required / waived / refunded / void`, plus a derived **Comped** filter on `membership_status`).
4. Each unpaid invoice shows aging (days past `due_date`) bucketed `1–30 / 31–60 / 61–90 / 90+`; a summary strip totals the outstanding amount.
5. **Export CSV** re-validates admin with `assertAdminFresh()`, then downloads the current filtered view as a Blob. Member names are CSV-injection-defanged (leading `= + - @` prefixed with `'`).

### Chaos path
| Scenario | Handling |
|---|---|
| Non-admin (member) reaches the URL | FOAC body stays hidden; `requireAdmin()` redirects to `index.html`. RLS would also return zero rows. **(Hard gate.)** |
| Admin session expired at export time | `assertAdminFresh()` fails -> toast; no file written. |
| Empty filter view | "No invoices in this view"; export shows "nothing to export." |
| Backend offline | "Ledger is ready — connect backend" notice. |
| Deep-link `?status=overdue` | Pre-selects the overdue filter on load. |

---

## 6. Flow: Board admin console

- **Entry point:** admin/board opens `admin.html`.
- **Exit point:** chapter overview; navigate to approvals, members, events (read-only), Dues, or Content.

### Happy path
1. FOAC body hidden; `Auth.requireAdmin()` reveals only for admin/board. **Nothing renders until the gate passes (§9 #2).**
2. Overview shows live counts (members, pending approvals, published events, overdue dues) using `head:true` count queries — no member PII moved to the client for the overview.
3. **Approvals** lists pending `event_registrations` (joined to profile + event); Approve/Deny re-validate with `assertAdminFresh()` before writing `status`.
4. **Members** lists `profiles` + `members.membership_status` as sanitized cards.
5. **Events** is read-only here (Lane 3 owns event CRUD); a link points to the Events page. Sidebar adds **Dues ledger** and **Content queue** links.

### Chaos path
| Scenario | Handling |
|---|---|
| Non-admin reaches `admin.html` | Body never painted; redirect fires. |
| Approve/Deny after session expiry | `assertAdminFresh()` fails -> toast; no write. RLS is the backstop. |
| A section query errors | That section shows an inline error block; the rest of the shell stays usable. |
| Backend offline | Overview shows a "connect backend" block; shell still renders for admins. |
| Mobile width | A mobile section switcher replaces the sidebar (which is hidden under 1024px). |

---

## 7. Homepage CTAs -> Checkout (second-touch on `index.html`)

Lane 1's first-touch (script tags, async sign-in form, nav wiring) is PRESERVED.
Lane 5 replaced only the three `alert(...)` placeholders.

| CTA | Purpose | Body sent to `create-checkout-session` |
|---|---|---|
| Join / Renew (Standard, Premium) | `dues` | `{ purpose:'dues', plan_id, member_id, profile_id, success_url, cancel_url }` — **no amount** |
| Donate to Scholarships / Chapter | `donation` | `{ purpose:'donation', designation, amount_cents, profile_id, success_url, cancel_url }` — amount is donor-chosen; server clamps min/max |

- Dues require sign-in (the button opens the sign-in modal if signed out). If the member has no record yet, they are routed to `membership.html` to join.
- Donations are open to anyone; the amount comes from the active chip **within the clicked donation card** (two cards exist).
- Both paths share the `Checkout` helper, which redirects to the returned Stripe `url` and surfaces friendly errors (including `MEMBER_NOT_BILLABLE`).

---

## 8. Cross-lane seam — Lane 2 `create-checkout-session`

Lane 5 is a CLIENT of Lane 2's Edge Function. The exact request/response contract
Lane 5 sends (mirroring Lane 3's `events.js` shape for consistency):

```js
supabaseClient.functions.invoke('create-checkout-session', { body })
// body (dues):     { purpose:'dues', plan_id, member_id, profile_id, success_url, cancel_url }
// body (donation): { purpose:'donation', designation, amount_cents, profile_id, success_url, cancel_url }
// response 200:    { url: string }   -> client redirects
// response 400:    { error: string } -> e.g. 'MEMBER_NOT_BILLABLE'
```

Lane 2 MUST:
1. For dues, read the price from `membership_plans` by `plan_id` — never trust a client amount (none is sent).
2. For donations, clamp `amount_cents` to the chapter min/max server-side.
3. Bind `client_reference_id = member_id` and embed metadata so the webhook can reconcile `dues_invoices` / `payments`.
4. Return `MEMBER_NOT_BILLABLE` (400) for comped/lifetime/manual members.

If Lane 2's deployed body differs from the above, the lead reconciles at merge; Lane 5
follows the data-contract §7 shape as the source of truth.

---

## 9. Accessibility (WCAG 2.2) notes

- Every protected page reveals only after its gate passes; focus lands on real content, not a flash.
- Filter chips use `aria-pressed`; result counts use `role="status" aria-live="polite"`.
- Search inputs have associated labels (visually-hidden where the design omits a visible one).
- Decorative glyphs are `aria-hidden="true"`; status is conveyed by text, not color alone (badges carry the status word).
- Touch targets use the shared `.btn` sizes; focus-visible outlines come from the global `.btn:focus-visible` token rule.
- Toasts are `role="status" aria-live="polite"` so screen readers announce checkout/visibility results.
