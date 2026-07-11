# Pre-Deploy Report — Morehouse Chicago Alumni (mcaa-wave-002)

Owner: Lane J (QA / accessibility / security gate). The ship checklist with an
explicit PASS / FAIL / BLOCKED status per item, separating what Lane J VERIFIED NOW
(offline, against the real built artifacts — no live backend) from what is BLOCKED on
the credential boundary (the board supplies PayPal keys + webhook, the Supabase
project + hook registration + migration apply, and the Chase Zelle/check display
values). Build is complete and deployable; no code defect blocks ship.

Ship verdict: **GO, conditional on the credential boundary.** Every code-side gate is
PASS. The BLOCKED items are provisioning actions, not code work; the functions fail
closed without them (no silent insecure state). Deploy the static site now; payments
go live the moment the board sets the PayPal/Supabase secrets and applies migration
011.

---

## Verified-now (offline, against the real files) — all PASS

| # | Check | Status | Evidence |
|---|---|---|---|
| 1 | No live Stripe remnant (G1) | PASS | Targeted probe ZERO; the `grep -rni stripe` hits are comments / a visual accent var / the `--table-stripe` token / historical migration columns 011 drops. `docs/security-review.md` §G1. |
| 2 | No server secrets in client (G2) | PASS | `grep -rn "service_role\|sk_live\|whsec_\|PAYPAL_CLIENT_SECRET\|PAYPAL_WEBHOOK_ID" js/ *.html` = 0. `.gitignore` ignores `.env*`. |
| 3 | PayPal webhook verify-signature FIRST (G3) | PASS | `paypal-webhook/index.ts:576-585` — verify before any write; first DB op (`alreadyProcessed`) at `:595`. Real PayPal verify endpoint in `_shared/paypal.ts:287-325`, fail-closed. |
| 4 | Dues/ticket amounts server-side (G3) | PASS | `paypal-checkout/index.ts` reads `membership_plans.amount_cents` (`:170-198`) and `events.price_cents` (`:336`); client sends ids only. Donation clamped (`:216-226`). |
| 5 | Zelle/check/cash mark-paid first-class (G3) | PASS | `admin-dues.html` modal + `js/admin-dues.js` 3-write sequence (assertAdminFresh -> payments -> dues_invoices -> members); comped/lifetime/manual excluded. |
| 6 | Migration 011 de-Stripes + adds mark-paid RLS | PASS | `011_destripe_add_paypal.sql` drops stripe cols/indexes, renames webhook table, adds `payments_admin_insert/_update` (`:153-161`), keeps `uq_dues_open_period`. Idempotent. |
| 7 | Shared shell on every page (G4/G6) | PASS | 17/17 pages carry `#site-header`/`#main-content`/`#site-footer` + `js/shell.js` + `Shell.render`. No hand-rolled site nav. |
| 8 | Breadcrumbs on every page below home; none on home (G6) | PASS | passed via `Shell.render` incl. admin (JS modules); home passes none (`app.js:519`). |
| 9 | News in the nav (G6) | PASS | `js/shell.js:86,103` — route `news` -> `content.html`, in `PRIMARY`. |
| 10 | Lane F additive to components.css (ownership) | PASS | Lane A content lines 1-820 intact; Lane F appended at marker `components.css:821` (821-1170). No clobber. |
| 11 | Base type 18px (G5) | PASS | `--text-base:1.125rem` applied to `body` (`components.css:10`). |
| 12 | `--color-text-tertiary` passes AA (G5) | PASS | #8A9BAC on #0D0A0B = 6.91:1 (computed). `docs/accessibility-check.md`. |
| 13 | 44px targets; skip link; ambient off (G5) | PASS | `--touch-target` 44px on nav/btn/calendar/donate; skip link first on every page; `--duration-ambient:0ms` + reduced-motion. |
| 14 | No innerHTML for user/feed strings (G5) | PASS | scan in `docs/accessibility-check.md` §innerHTML; all PII via textContent/DOM; `security-invariants.test.mjs` gate green. |
| 15 | CSP de-Striped + PayPal added | PASS | `_headers:11` — no `stripe.com`; PayPal in script/connect/frame/form-action; `object-src 'none'`, `frame-ancestors 'none'`. |
| 16 | Anti-mock (no John Doe / lorem / test@) | PASS | `security-invariants.test.mjs` mock-string gate green across js + html. |
| 17 | Syntax sanity (no heavy build) | PASS | `node --check` clean on shell/app/directory/membership/donate/events/content/admin-dues + all edited tests. |
| 18 | Unit suite runnable + green | PASS | `cd tests && npx vitest run` -> 6 files, 82 tests, all pass (Lane J ported the Stripe tests to PayPal). |

How to run the offline suite (no heavy build this wave):
```
cd tests && npm install && npx vitest run     # 6 files, 82 tests green
node --check js/shell.js                       # syntax sanity (repeat per file)
```

---

## BLOCKED on the credential boundary (board action — NOT code defects)

The functions and migration are authored as deployable artifacts. They fail closed
without these (e.g. `paypal-webhook` returns 500 if `PAYPAL_WEBHOOK_ID` is unset —
never an insecure pass). No live deploy was fabricated.

| # | Item | Status | Action the board takes |
|---|---|---|---|
| B1 | PayPal REST app (client id/secret) | BLOCKED | Create the app; `supabase secrets set PAYPAL_CLIENT_ID PAYPAL_CLIENT_SECRET PAYPAL_ENV`; put the browser-safe `PAYPAL_CLIENT_ID` in `js/config.js` (and the SDK `<script>` src on payment pages). |
| B2 | PayPal webhook id | BLOCKED | Deploy `paypal-webhook` (`--no-verify-jwt`); register the endpoint in the PayPal Dashboard; subscribe the handled events; copy the Webhook ID into `PAYPAL_WEBHOOK_ID`. Then run `tests/e2e/paypal-webhook-signature.spec.js` with `E2E_WEBHOOK_URL`. |
| B3 | Supabase project (URL + anon key) | BLOCKED | Fill `js/config.js` `SUPABASE_URL` + `SUPABASE_ANON_KEY`. |
| B4 | Apply migrations incl. 011 | BLOCKED | `supabase db push` (001-011). Then run the RLS SQL in `docs/security-review.md` §RLS (verify Stripe cols gone, table renamed, mark-paid policies present, double-charge guard intact). |
| B5 | Custom access token hook registration | BLOCKED | Register `custom_access_token_hook` in the Dashboard (Auth -> Hooks). Without it the role claim never lands and every `get_my_role()` RLS policy over-denies admins. |
| B6 | Deploy `paypal-checkout` + `content-sync` | BLOCKED | `supabase functions deploy paypal-checkout`; ensure `content-sync` runs (pg_cron `0 */6 * * *`) so News + Morehouse-events blocks populate. |
| B7 | Chase Zelle email/phone + check mailing address | BLOCKED | Supply the live values; they render on `membership.html` / `donate.html` (placeholders today, not hardcoded). |
| B8 | First admin + gallery bucket + real social handles | BLOCKED | Seed the first admin role; create the storage bucket; swap the Instagram/Facebook/LinkedIn placeholder hrefs. |

Live-backend e2e (gated): after B1-B6, run `tests/e2e/*` per `tests/e2e/README.md`
(set `E2E_BASE_URL`, member/admin creds, `E2E_WEBHOOK_URL`). They self-skip until
their env vars are set, so CI stays green without a backend.

---

## STOP gates (block ship if they ever flip)

| Gate | State |
|---|---|
| Any live Stripe endpoint/key/SDK in client or `_headers` | CLEAR (zero) |
| Any server secret in `js/` or `*.html` | CLEAR (zero) |
| Webhook writes before signature verification | CLEAR (verify is first) |
| Client-trusted amount honored for dues/ticket | CLEAR (server-priced) |
| A protected page paints before the auth gate (FOAC) | CLEAR (visibility:hidden + data-protected on all 6) |
| Member PII readable by anon / via innerHTML XSS | CLEAR (gate + textContent + RLS) |

All STOP gates are CLEAR. No code-side blocker remains.

---

## Citations

Skills: `pre-deploy-gating`, `exit-gating` (PASS/FAIL/BLOCKED gating + credential-
boundary stop), `security-auditing`, `testing-enforcing`.
Librarians: `pre-deployment-librarian`, `security-librarian`, `testing-librarian`,
`code-audit-librarian`.
2026 docs (verified): PayPal verify-webhook-signature
https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post ;
Supabase Edge Function secrets https://supabase.com/docs/guides/functions/secrets ;
Supabase RLS https://supabase.com/docs/guides/database/postgres/row-level-security ;
W3C WCAG 2.2 https://www.w3.org/TR/WCAG22/ ; OWASP Top Ten
https://owasp.org/www-project-top-ten/ .

## Completion rule
Ship checklist with PASS/FAIL/BLOCKED per item; verified-now vs credential-boundary
split; run commands documented; no heavy build run; no source edited. Verdict: GO,
conditional on the credential boundary.
