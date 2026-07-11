# Event Flow — Morehouse Chicago Alumni
Lane 3 — mcaa-wave-001

---

## Registration status model

| Status | Meaning |
|---|---|
| `pending` | Inserted; awaiting admin approval (`requires_approval = true` events). |
| `approved` | Confirmed registrant; counts toward capacity. |
| `waitlisted` | Event at capacity; placed in queue. Promoted to `approved` by admin when a spot opens. |
| `cancelled` | Cancelled by member or admin. Does not count toward capacity. Allows re-registration attempt. |
| `checked_in` | Arrived at event; set by admin check-in tool (out of Lane 3 scope). Counts toward capacity. |

## Payment status model

| Status | Meaning |
|---|---|
| `not_required` | Free event. Set at insert time. |
| `pending` | Paid event; checkout session created but not yet completed. |
| `paid` | Stripe webhook confirmed `checkout.session.completed`. Set by Lane 2 Edge Function. |
| `refunded` | Stripe refund processed. Set by Lane 2 webhook handler. |

---

## Happy paths

### 1. Free public event (no approval required)

1. User loads `events.html`; `Events.getUpcoming()` fetches from `events` table via RLS (public rows visible to all).
2. User clicks event card; navigates to `event-detail.html?id=<uuid>`.
3. `Events.getById()` fetches the event. `RSVPs.getMyRegistration()` returns null (not yet registered).
4. User is signed in. CTA shows "Register Now." User clicks.
5. RSVP modal opens. User selects guest count, submits.
6. `RSVPs.create()` checks: session present, visibility allowed, no duplicate, capacity not exceeded.
7. Row inserted: `status = 'approved'`, `payment_status = 'not_required'`.
8. Success message shown. Attendee count re-renders via `Events.getAttendeeCount()`.
9. On next page load `RSVPs.getMyRegistration()` returns the row; CTA renders "Already Registered" (disabled).

### 2. Free event with admin approval required

Steps 1–6 identical.
7. Row inserted: `status = 'pending'`, `payment_status = 'not_required'`.
8. Modal shows "Registration Pending — your registration requires admin approval."
9. Admin sees row in approval queue (`RSVPs.getPending()`). Calls `RSVPs.approve(id)` → `status = 'approved'`.

### 3. Paid event (capacity-gated, checkout session)

1–3 same as path 1.
4. Event has `price_cents > 0` and `stripe_price_id` set.
5. User is signed in. CTA shows "Buy Ticket — $XX.XX."
6. User clicks. `RSVPs.createPaid()` fires:
   a. Capacity and duplicate checks pass.
   b. Row inserted: `status = 'pending'`, `payment_status = 'pending'`.
   c. `supabaseClient.functions.invoke('create-checkout-session')` called with body (see seam below).
   d. Lane 2 Edge Function validates capacity server-side, creates Stripe Checkout Session, returns `{ url }`.
   e. Browser redirects to `url`.
7. User completes Stripe checkout.
8. Stripe fires `checkout.session.completed` webhook → Lane 2 Edge Function sets `event_registrations.payment_status = 'paid'`, `status = 'approved'`.
9. User lands on `event-detail.html?id=<uuid>&checkout=success` (success_url). Banner confirms registration.

### 4. Paid event (simple fixed-price public, payment_link_url set)

No server round-trip. CTA is an `<a>` pointing directly to `events.payment_link_url` (Stripe Payment Link). No `event_registrations` row is created client-side; Lane 2 webhook creates it on `checkout.session.completed`.

### 5. Members-only event (free)

1. Unauthenticated visitor: RLS hides the event row; it does not appear in `events.html`. If navigating directly to `event-detail.html`, `Events.getById()` returns null (RLS block) → "Event not found" page.
2. Signed-in member: event appears. Flow identical to path 1 or 2.

---

## Chaos paths

### C1. Full event — waitlist available

- `capacity = 50`, current approved registrations = 50, `waitlist_capacity = 20`, current waitlisted = 5.
- `Events.getAttendeeCount()` returns `{ total: 50, waitlisted: 5 }`.
- `spotsLeft = 0`. CTA renders "Join Waitlist" (not "Event Full") because `waitlist_capacity > 0`.
- `RSVPs.create()` resolves `initialStatus = 'waitlisted'` (capacity exceeded, waitlist has room).
- Row inserted with `status = 'waitlisted'`.
- Modal shows "Added to Waitlist" message.

### C2. Full event — waitlist also full

- `capacity = 50`, approved = 50, `waitlist_capacity = 20`, waitlisted = 20.
- `RSVPs.create()` returns `{ error: 'This event has reached capacity and the waitlist is full.' }`.
- CTA renders "Event Full" (disabled button). No insert occurs.

### C3. Double RSVP blocked (unique constraint)

- Member already has an `approved` or `pending` registration for the event.
- Client-side: `RSVPs.getMyRegistration()` returns the existing row; CTA renders "Already Registered" (disabled).
- Server-side safety net: `unique(event_id, profile_id)` constraint on `event_registrations` returns `error.code = '23505'`. `RSVPs.create()` catches this and returns `{ error: 'You have already registered for this event.' }`.
- A `cancelled` registration does not block re-registration (re-registration opens a new row after RLS allows the insert — requires a schema-level unique partial index or admin delete to properly allow; documented as a remaining gap).

### C4. Member-only event accessed as guest

- Unauthenticated request to `Events.getById(id)`: RLS policy for `members_only` events blocks the row → returns null → "Event not found."
- If user lands via a shared URL: same result. No event data exposed.
- In `events.html`: `Events.getUpcoming()` RLS filters out `members_only` rows for anon users.
- `event-detail.html` CTA logic: if `visibility = 'members_only'` and not signed in, button renders "Sign In to Register" and redirects to `index.html?signin=1`.

### C5. Checkout session creation failure

- `supabaseClient.functions.invoke('create-checkout-session')` returns an error (network, Edge Function 400/500, `MEMBER_NOT_BILLABLE`).
- `RSVPs.createPaid()` deletes the just-created `pending` registration row (rollback).
- Returns `{ error: message }`.
- Page shows inline banner with the error. Button re-enables. No orphan registration rows.

### C6. User cancels Stripe checkout

- Stripe redirects to `cancel_url`: `event-detail.html?id=<uuid>&checkout=cancelled`.
- The `pending` registration row remains (not deleted on cancel — Lane 2 webhook does not fire).
- Banner shows "Checkout was cancelled."
- On re-render, `RSVPs.getMyRegistration()` finds the `pending/payment:pending` row. CTA shows "Already Registered" (disabled) — this prevents duplicate attempts.
- Admin can cancel/delete the stale pending row; or Lane 2 can expire stale sessions.
- Documented as a remaining gap: stale pending-paid rows need a TTL cleanup job.

### C7. Board-only event as non-board member

- RLS blocks `board_only` rows from non-board/admin users — same as members-only logic.
- If somehow reached (direct URL), `Events.getById()` returns null.
- Client guard in `RSVPs.create()` and `RSVPs.createPaid()` checks `_isAdminOrBoard()` and returns an error.

---

## Capacity math

- `capacity` = max approved + checked_in registrations (NOT including guests).
- Pending and waitlisted rows do NOT count toward capacity.
- `guest_count` is stored on the registration but does not consume capacity slots (chapter decision: one slot per registered person, guests are additive for headcount only).
- `Events.getAttendeeCount()` returns `{ morehouse, guests, total, waitlisted }` where:
  - `morehouse` = count of `approved`/`checked_in` registration rows
  - `guests` = sum of `guest_count` across approved/checked_in rows
  - `total` = morehouse + guests (total bodies expected)
  - `waitlisted` = count of `waitlisted` rows

---

## Lane 2 checkout seam (exact call shape)

`RSVPs.createPaid()` calls:

```js
supabaseClient.functions.invoke('create-checkout-session', {
  body: {
    purpose:                  'event_ticket',
    event_id:                 '<uuid>',
    event_registration_id:    '<uuid>',   // just-inserted pending row
    profile_id:               '<uuid>',   // auth.uid()
    stripe_price_id:          '<string>', // from events.stripe_price_id
    guest_count:              0,          // number
    success_url:              'https://<origin>/event-detail.html?id=<uuid>&checkout=success',
    cancel_url:               'https://<origin>/event-detail.html?id=<uuid>&checkout=cancelled',
  },
})
```

Expected response:
- `200 { url: string }` — Stripe Checkout URL for redirect
- `400 { error: string }` — e.g. `MEMBER_NOT_BILLABLE`, capacity failure

Lane 2 must:
1. Re-verify capacity server-side using `event_registration_id`.
2. Never trust `price_cents` from the client body — read it from `events.price_cents` by `event_id`.
3. On `checkout.session.completed` webhook: update `event_registrations` row with `payment_status = 'paid'`, `status = 'approved'`, and `payment_id` pointing to the `payments` ledger row.
