# Lane 7 — QA / Security / Pre-Deploy Gates
Status: done — DEF-001 found and now RESOLVED by lead (Batch 4); suite green 79/79. DEF-002 resolved (headers added). No code-level ship blocker remains.
Wave: mcaa-wave-001
Owner: Batch 3 agent (Lane 7 BUILD)
Single source of truth: this file only.

## Explainer
This lane is the adversary and the gatekeeper. It built a test harness that runs
offline and proves the parts of the site that do not need a live server: that the
membership "Join/Renew" button never sends its own price (so nobody can pick what
they pay), that donations are clamped to a safe range, that the news-relevance
tagger and the member-spreadsheet importer behave, and that the money and "days
overdue" math on the dues ledger are correct. It then walked the project's 15-item
security checklist against the actual built code. The good news: the payment
backend is solid — every message from Stripe is cryptographically checked before
anything is saved, dues prices come from the database, comped members never get
billed, and the database locks every table so a stranger sees nothing private. The
bad news: the public home page builds its event cards in an unsafe way, and because
real admin-entered events flow into that page, a booby-trapped event title could run
code in every visitor's browser. That is the one thing that must be fixed before
launch. A second gap — the site has no security response headers — is a hosting
setting the board must add. Everything else either passed now or is waiting on the
board to connect the live Supabase/Stripe accounts.

## TL;DR
- Built a Vitest harness (`tests/unit/**`, 6 files, 78 assertions green + 1
  intentional `it.fails` defect marker) that tests REAL source: dues-checkout body
  (no amount), donation clamp, comped non-billable set, Chicago-relevance heuristic,
  CSV import validation, money/aging math, CSV-injection defang, directory URL
  scheme guard, and the §9 invariants as repo gates.
- Built Playwright specs (`tests/e2e/**`: auth-gate redirect, directory zero-PII,
  RLS negative/positive + self-elevation, webhook 400-on-bad-signature) with manual
  fallbacks; execution is BLOCKED on the live backend (documented, not faked).
- Wrote `docs/security-review.md` (15-item risk register, recorded secrets grep,
  full RLS verification SQL incl. per-table negative tests + self-elevation, webhook
  signature-failure proof, DEF/OBS list) and `docs/predeploy-report.md`
  (PASS/FAIL/BLOCKED per item).
- FOUND DEF-001 (HIGH): stored XSS on `index.html` home grids via `innerHTML` of
  admin-entered event fields (`evt.title`/`evt.location`) that `store.js`
  hydrates from the live `events` table. Routed to the `index.html` owner (Lane
  1/5). DEF-002 (MEDIUM): no security response headers anywhere (deploy-layer).
- Hard gates on MY output: real findings only (every claim carries file:line); no
  emojis; no time-language; citations are real and verified.

| Field | Value |
|---|---|
| Mission | Prove the critical paths + security invariants hold; block ship on any failure. |
| Result | Done. Harness green; 13/15 risk items PASS; 1 HIGH defect (DEF-001) BLOCKS ship; 1 deploy-layer gap (DEF-002); live-DB items blocked on credentials. |
| Owned scope | `tests/**`, `docs/security-review.md`, `docs/predeploy-report.md` (only these touched). |
| Did NOT touch | any source file. Defects reported with file:line + owning lane; not fixed here. |

## Completed work
| # | Item | Status |
|---|---|---|
| 1 | Vitest harness installed under `tests/` (offline-capable; scoped to `unit/**`) | done |
| 2 | `dues-ledger.test.mjs` — real `Dues._money/_ageDays/_ageBucket/_csvCell` (CSV-injection defang incl. `=HYPERLINK`) | done |
| 3 | `directory-url-guard.test.mjs` — real `Directory._safeHttpUrl` (rejects javascript:/data:/file:) + `_initials` | done |
| 4 | `checkout-body.test.mjs` — executes the real `index.html` checkout helpers; DUES body proven to carry plan_id ONLY, no amount; DONATION carries amount_cents+designation | done |
| 5 | `edge-logic.test.mjs` — relevance heuristic + donation clamp + non-billable set (mirrored) WITH source-drift guards that fail if the real `.ts` changes | done |
| 6 | `csv-import-validation.test.mjs` — strips imports+main() from the real script and runs the actual `validateRow`/`splitCsvLine` (anti-mock + class-year + enum + quoted-comma) | done |
| 7 | `security-invariants.test.mjs` — §9 gates as executable checks (secrets, gate coverage, FOAC, anti-mock, no-innerHTML-user-strings) + DEF-001 `it.fails` marker | done |
| 8 | Playwright specs + config + e2e README (auth gate, directory privacy, RLS, webhook) with manual fallbacks | done |
| 9 | `docs/security-review.md` — 15-item register, secrets grep output, RLS SQL (incl. negatives + self-elevation), webhook proof, DEF/OBS | done |
| 10 | `docs/predeploy-report.md` — PASS/FAIL/BLOCKED checklist; verified-now vs credential-boundary split | done |
| 11 | Ran the secrets grep, auth-gate scan, innerHTML scan, anti-mock grep myself and recorded output | done |

## Files changed (path + one line)
| Path | What |
|---|---|
| `tests/package.json` | Vitest harness manifest (npm test / npm run e2e); Lane 7 owns `tests/**`. |
| `tests/vitest.config.js` | Scopes Vitest to `unit/**`; excludes the Playwright `e2e/**`. |
| `tests/playwright.config.js` | Playwright config for the live-backend e2e specs (gated). |
| `tests/helpers/loadBrowserModule.mjs` | `vm` sandbox loader for `window.*` client modules + source reader. |
| `tests/unit/dues-ledger.test.mjs` | Real admin-dues money/aging/CSV-defang assertions. |
| `tests/unit/directory-url-guard.test.mjs` | Real directory link scheme allowlist + initials. |
| `tests/unit/checkout-body.test.mjs` | Real index.html checkout-body construction (dues no-amount; donation amount). |
| `tests/unit/edge-logic.test.mjs` | Relevance/donation/non-billable mirrors + source-drift guards. |
| `tests/unit/csv-import-validation.test.mjs` | Real import-members validateRow/splitCsvLine via source extraction. |
| `tests/unit/security-invariants.test.mjs` | §9 invariants as repo gates + DEF-001 fail-marker. |
| `tests/e2e/auth-gate.spec.js` | Admin/auth gate redirect + FOAC (live-gated). |
| `tests/e2e/directory-privacy.spec.js` | Signed-out directory zero-PII + no profiles query (live-gated). |
| `tests/e2e/rls.spec.js` | RLS anon negatives/positives + member self-elevation block (live-gated). |
| `tests/e2e/webhook-signature.spec.js` | Webhook 400 on missing/invalid signature (live-gated). |
| `tests/e2e/README.md` | How to run the e2e suite + manual fallbacks. |
| `tests/README.md` | Harness layout, run instructions, design notes. |
| `tests/.gitignore` | Ignores `tests/node_modules`, Playwright artifacts. |
| `docs/security-review.md` | 15-item risk register, secrets grep, RLS SQL, webhook proof, DEF/OBS. |
| `docs/predeploy-report.md` | PASS/FAIL/BLOCKED pre-deploy checklist. |

## Commands run (by Lane 7; output recorded)
| Command | Result |
|---|---|
| `grep -rn "service_role\|sk_live\|sk_test\|whsec_" js/ *.html` | ZERO (exit 1) — G1 PASS. |
| `grep -rn "sk_live_..\|sk_test_..\|whsec_.." supabase/functions/ --include="*.ts"` | ZERO — secrets via `Deno.env` only. |
| auth-gate scan (`requireAuth\|requireAdmin` across js/ + FOAC in html) | all 4 protected modules gated; FOAC on all 4 pages. |
| innerHTML interpolation scan (perl, all js/ + html) | feature modules clean; `index.html` grids interpolate user fields -> DEF-001. |
| anti-mock grep (`john doe\|lorem\|test@test\|foo@bar`) | zero data hits (only input `placeholder=` attrs + import-script REJECT checks). |
| security-headers search (`_headers`/`netlify.toml`/`vercel.json`/`http-equiv`) | none found -> DEF-002. |
| `cd tests && npm install` then `npx vitest run` | 6 files, 78 passed + 1 expected-fail (DEF-001 marker). |

## Defects found (routed to lead; NOT fixed by Lane 7)
| ID | Severity | File:line | Owning lane | Summary |
|---|---|---|---|---|
| DEF-001 | HIGH (blocks ship) | `index.html:548,554,559,563` (+ `js/store.js:127-157` data source) | `index.html` owner (Lane 1 first-touch / Lane 5 second-touch) | Home grids build markup with `innerHTML` and interpolate user-controlled strings (`evt.title`, `evt.location`, etc.). `store.js:_hydratePublic()` feeds REAL `events`-table rows into that cache, so an admin-entered hostile event title is stored XSS on the public home page. The dedicated events page renders the same fields safely via `textContent` (`events.html:169,173`). Fix: convert all four grids to `textContent`/`createElement`. Test marker ready (`security-invariants.test.mjs` `it.fails`). |
| DEF-002 | MEDIUM (deploy-layer) | repo-wide (no header config) | deploy/hosting config (lead-assigned) | §9 #11 headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, CSP) are not configured anywhere. BLOCKED on the hosting choice; CSP must allow `cdn.jsdelivr.net` + the Supabase origin. |

Observations (not defects — see `security-review.md` §6): OBS-1 admin-content
`await Auth.requireAdmin()` awaits a sync boolean and ignores the return (RLS still
protects; consistency fix, Lane 4); OBS-2 `profiles_select_visible_directory` policy
exposes all columns (incl. email/phone) of opted-in profiles — matches §6 contract,
flagged for conscious board acceptance; OBS-3 `scoreRelevance` never emits
`not_relevant` (by design); OBS-4 contact-form `alert()` stub (UX, not security).

## Gate results (summary)
- Risk register: PASS 13 / 15 · FAIL 1 (DEF-001) · DEFERRED 1 (DEF-002).
- Pre-deploy checklist: PASS 19 · FAIL 1 · BLOCKED 12 (credential boundary) ·
  DEFERRED 1.
- Unit suite: 78 assertions green + 1 expected-fail marker. Ship decision:
  DO NOT SHIP until DEF-001 is fixed and the BLOCKED live-DB items pass.

## Remaining gaps (honest)
- DEF-001 must be fixed in `index.html` (not Lane 7's file) before ship.
- DEF-002 headers must be added at the hosting layer.
- All live-backend verification (RLS row-disclosure probes, live self-elevation
  test, directory zero-PII network assertion, auth-gate browser redirects, webhook
  400-on-bad-signature against the deployed endpoint, live Stripe payment test) is
  BLOCKED on the board provisioning Supabase + Stripe. The exact SQL/curl/specs are
  written and ready (`security-review.md` §3-4, `tests/e2e/**`).
- Edge Functions were NOT re-typechecked here (no Deno toolchain in this env); Lane
  2 reported `deno check`/`deno lint` clean. Re-run at deploy.
- `tests/node_modules` (Vitest) is installed locally and gitignored; CI/board runs
  `cd tests && npm install` to restore it.

## Exact paths created/edited
- `tests/package.json`, `tests/package-lock.json`, `tests/vitest.config.js`,
  `tests/playwright.config.js`, `tests/.gitignore`, `tests/README.md`
- `tests/helpers/loadBrowserModule.mjs`
- `tests/unit/dues-ledger.test.mjs`, `tests/unit/directory-url-guard.test.mjs`,
  `tests/unit/checkout-body.test.mjs`, `tests/unit/edge-logic.test.mjs`,
  `tests/unit/csv-import-validation.test.mjs`, `tests/unit/security-invariants.test.mjs`
- `tests/e2e/auth-gate.spec.js`, `tests/e2e/directory-privacy.spec.js`,
  `tests/e2e/rls.spec.js`, `tests/e2e/webhook-signature.spec.js`, `tests/e2e/README.md`
- `docs/security-review.md`, `docs/predeploy-report.md`
- `orchestration/active/mcaa-wave-001/07-QA-SECURITY.md` (this file)

## Task-sheet update row (for the lead)
| Wave | Lane | Owner | Status-claim | Summary | Doc path |
|---|---|---|---|---|---|
| mcaa-wave-001 | 7 (QA-SECURITY) | Batch 3 agent | done — 1 HIGH defect blocks ship | Vitest harness (78 green +1 fail-marker) over real source; Playwright specs (live-gated); security-review (15-item register + RLS SQL) + predeploy report. Found DEF-001 stored-XSS on index.html home grids (admin event data via innerHTML) and DEF-002 missing security headers; both routed, neither fixed here. Backend trust boundary verified strong. | `orchestration/active/mcaa-wave-001/07-QA-SECURITY.md` (+ `docs/security-review.md`, `docs/predeploy-report.md`) |

## Citations
Skills applied (verified at `.claude/skills/<name>/SKILL.md`):
- `testing-enforcing` — unit/integration/e2e split, coverage of critical paths, real
  source under test, source-drift guards.
- `security-auditing` — secrets-grep gate, default-deny RLS verification, self-
  elevation prevention, input-validation boundary, XSS sink identification.
- `hacker-scanning` — adversarial read: secrets, route protection, injection
  (CSV/XSS), header verification; attacker data-flow from `store.js` to the home grid.
- `pre-deploy-gating` — PASS/FAIL/BLOCKED checklist with executable evidence and the
  credential-boundary split.
- `exit-gating` — STOP-on-defect: DEF-001 blocks ship; explicit ship decision.
- `code-scrutinizing` — security-posture + code-intelligence lenses on the payment
  and auth surfaces.

Librarians (verified at `librarians/<name>.md`):
- `testing-librarian`, `security-librarian`, `hacker-attacker-librarian`,
  `code-audit-librarian`, `pre-deployment-librarian` (also `code-scrutinizer-librarian`).

2026 documentation (real, used this lane):
- Vitest guide: https://vitest.dev/guide/
- Playwright: https://playwright.dev/docs/intro
- Supabase RLS (enable, USING vs WITH CHECK, default-deny): https://supabase.com/docs/guides/database/postgres/row-level-security
- Stripe webhook signatures: https://docs.stripe.com/webhooks/signature
- Stripe testing: https://docs.stripe.com/testing
- OWASP Top 10: https://owasp.org/Top10/
- OWASP CSV Injection: https://owasp.org/www-community/attacks/CSV_Injection
- OWASP XSS Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- MDN Content-Security-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy

## Completion Rule (met)
This file is rewritten in place with Explainer, TL;DR, completion tables (work,
files, commands), the defect register with file:line + owning lane, gate results,
honest remaining gaps (credential boundary separated from verified-now), exact paths,
the task-sheet row, and verified citations — per `99-EVIDENCE-CONTRACT.md`. No source
file was edited by Lane 7.
