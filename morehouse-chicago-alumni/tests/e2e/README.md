# Lane J — End-to-end specs (live-backend gated)

These specs cover the flows that CANNOT be verified without a live Supabase project
(and, for payments, a live PayPal sandbox/live app + registered webhook). They are
written to be runnable as soon as the credential boundary is crossed, and each has a
documented MANUAL fallback so a board operator can verify by hand if Playwright is
not set up.

## Status

- The Vitest unit suite (`tests/unit/**`) runs now, offline, with no backend. It
  covers all logic that does not require a live backend (checkout-body
  construction, donation clamp, relevance heuristic, CSV import validation,
  money/aging math, CSV-injection defang, URL scheme guard, and the security
  invariants as repo gates). Run: `cd tests && npm test`.
- The Playwright specs below are BLOCKED on the credential boundary
  (`99-EVIDENCE-CONTRACT.md`). They are not executed in this environment because
  no live Supabase project / PayPal app is provisioned and Playwright browsers are
  not installed here. Do not interpret their presence as a passing run.

## To run (after the board connects a live project)

```
cd tests
npm install            # vitest already present; adds nothing for unit
npm i -D @playwright/test
npx playwright install chromium
export E2E_BASE_URL="https://<deployed-site>"      # or http://localhost:8000 for a local static serve
export E2E_MEMBER_EMAIL="..."  E2E_MEMBER_PASSWORD="..."
export E2E_ADMIN_EMAIL="..."   E2E_ADMIN_PASSWORD="..."
npm run e2e
```

`js/config.js` must already hold the live Project URL + anon key, and migrations
001-011 must be applied, before any of these can pass. The webhook spec also needs
`E2E_WEBHOOK_URL` (the deployed `paypal-webhook` endpoint) and the function deployed
with `PAYPAL_WEBHOOK_ID` set.

## Spec inventory

| Spec | Invariant (data-contract.md) | Manual fallback |
|---|---|---|
| `auth-gate.spec.js` | §9 #2 — `admin.html` / `admin-dues.html` / `admin-content.html` and the protected member pages (`dashboard.html` / `profile.html` / `my-events.html`) redirect a signed-out visitor to `signin.html?next=<page>` and never paint protected content (FOAC). NOTE: `membership.html` is a PUBLIC info/join page in wave-002 — it does NOT redirect. | Open each protected URL in a private window while signed out; confirm you land on the sign-in page and never see the protected content flash. Confirm `membership.html` loads publicly. |
| `directory-privacy.spec.js` | §9 #3 — signed-out `directory.html` shows the "Members only" gate and ZERO member PII; the network tab shows no `profiles` query. | Open `directory.html` signed out; confirm only the sign-in gate renders and DevTools Network shows no request returning member rows. |
| `rls.spec.js` | §6 / §9 #9 — anon can read only active plans + published/public events + approved content; cannot read `profiles`, `members`, `dues_invoices`, `payments`, `event_registrations`, `content_sources`, `audit_log`, `paypal_webhook_events`. A member cannot self-elevate `role`. | Run the SQL probes in `docs/security-review.md` §RLS against the live DB with an anon key and a member JWT. |
| `paypal-webhook-signature.spec.js` | §9 #5 — the deployed `paypal-webhook` calls PayPal's verify-webhook-signature FIRST and returns 400 for a delivery with missing PayPal transmission headers or a forged signature, writing nothing. | `curl -X POST https://<ref>.functions.supabase.co/paypal-webhook -H 'Content-Type: application/json' -d '{"id":"WH-FORGED-TEST","event_type":"PAYMENT.CAPTURE.COMPLETED","resource":{}}'` -> expect HTTP 400; confirm no row in `paypal_webhook_events` for `WH-FORGED-TEST`. |

The specs use only public anon-key reads and the provided test accounts; they never
embed a service-role key (that would violate §9 #1).
