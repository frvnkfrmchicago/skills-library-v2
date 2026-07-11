# Morehouse Chicago Alumni — Test Harness (Lane J, mcaa-wave-002)

Owned by Lane J (QA / accessibility / security gate). Scope: `tests/**` only — no
source files are modified by this lane. Defects found in other lanes' code are
reported in `docs/security-review.md` with `file:line` and the owning lane; they
are NOT fixed here.

Wave-002 changed the money layer from Stripe to PayPal (dossier Dimension 4). The
Stripe webhook + checkout tests were ported accordingly; the auth-gate,
directory-privacy, and RLS specs were kept.

## Layout

```
tests/
  package.json                 # vitest devDependency; npm test / npm run e2e
  vitest.config.js             # node environment; include unit/**/*.test.mjs
  playwright.config.js         # live-backend e2e config (gated)
  helpers/loadBrowserModule.mjs# vm sandbox loader for window.* client modules
  unit/                        # runs offline now (no backend)
    dues-ledger.test.mjs           money / aging / CSV-injection defang (real js/admin-dues.js)
    directory-url-guard.test.mjs   link scheme allowlist + initials (real js/directory.js)
    checkout-body.test.mjs         PayPal: dues/ticket send NO amount; donation sends amount_cents
    edge-logic.test.mjs            relevance heuristic + donation clamp + non-billable (mirrored + drift-guarded)
    csv-import-validation.test.mjs anti-mock + format guards (real scripts/import-members.mjs bodies)
    security-invariants.test.mjs   §9 gates as executable checks (secrets, FOAC, directory privacy, no innerHTML, de-Stripe)
  e2e/                         # BLOCKED on credential boundary; see e2e/README.md
    auth-gate.spec.js
    directory-privacy.spec.js
    rls.spec.js
    paypal-webhook-signature.spec.js   verify-signature-FIRST; missing/forged headers -> 400, no write
```

## Run the unit suite (offline, now)

```
cd tests
npm install      # installs vitest
npm test         # vitest run  ->  6 files, 82 tests, all green
```

All unit tests pass with no `it.fails` markers. DEF-001 (the wave-001 homepage
`innerHTML` XSS) was resolved in the Batch-4 closeout and the homepage was rebuilt
as a router in wave-002 Lane D; the `security-invariants` XSS gate now asserts the
home grids are XSS-safe and passes as a normal green test.

Do NOT run heavy builds during this wave (no `deno check` / `tsc` / bundlers). The
Edge Functions are TypeScript/Deno and cannot be imported by Node; `edge-logic`
mirrors their pure logic with source-drift guards instead.

## Run the e2e suite (after the board connects a live project)

See `e2e/README.md`. These require a deployed/served site, a live Supabase project
(migrations applied incl. 011, `js/config.js` filled), and — for the webhook spec —
the deployed `paypal-webhook` function with `PAYPAL_WEBHOOK_ID` set and the webhook
registered in the PayPal Dashboard. They self-skip until their env vars are set:

```
export E2E_WEBHOOK_URL=https://<project-ref>.functions.supabase.co/paypal-webhook
npm run e2e
```

## Design notes

- The client modules assign to `window.*` and are not ES modules; `loadBrowserModule`
  evaluates them in a `vm` context with minimal DOM stubs and returns the global so
  PURE methods can be asserted directly against the real source.
- `checkout-body.test.mjs` runtime-captures the REAL `DonatePage` createOrder body
  (js/donate.js) and source-asserts the dues (js/membership.js) + event-ticket
  (js/events.js) call sites carry no client amount/price — with drift guards that
  fail if the PayPal call shape moves.
- `edge-logic.test.mjs` mirrors three pieces of Deno/TypeScript logic (which Node
  cannot import) and adds source-drift guards that fail if the real `.ts` files
  change the mirrored constants/keywords — keeping the mirror honest.
- `csv-import-validation.test.mjs` strips the supabase import + the `main()` call
  from the real script source and evaluates the remainder, so it exercises the
  ACTUAL `validateRow` / `splitCsvLine` bodies, not a copy.
