# Security Review — Morehouse Chicago Alumni (mcaa-wave-002)

Owner: Lane J (QA / accessibility / security gate). This is an adversarial read of
the ACTUAL built artifacts after the Stripe-to-PayPal rebuild (dossier Dimension 4)
and the shared-shell / accessibility retune (Dimensions 2-3). It records the
hard-gate command output with `file:line`, the PayPal verify-first proof, the RLS
verification SQL the board runs, a risk register, and every defect with its owning
lane. Lane J does NOT fix source — defects are routed to the owning lane.

Verdict in one line: no live Stripe remnant, zero server secrets in client code,
PayPal webhook verifies-signature-first, dues/ticket amounts are server-side, and
migration 011 de-Stripes the schema and adds the mark-paid RLS. SHIP once the
credential-boundary items are provisioned. No code defects block ship.

---

## Hard gates (evidence-contract G1-G8) — command output

### G1 — No live Stripe remnants
Command (contract exact): `grep -rni stripe js/ *.html supabase/ css/`

Result: matches exist but EVERY one is a non-functional remnant. Classified:

| Class | Where | Verdict |
|---|---|---|
| Comments "No Stripe" / history notes | `js/events.js:9,448,506`, `js/config.js:10`, `js/admin-dues.js:35`, `js/membership.js:9,10,23,356,587`, `js/donate.js:19`, `event-detail.html:461` | Intentional. Documentation, not code. |
| Visual accent variable named `stripe` (an 8px left-border `<div>`) | `events.html:162,163,261,313,314,359` | NOT payments. A local DOM var for a colored card stripe. Cosmetic. |
| Zebra-row token `--table-stripe` | `css/tokens.css:277`, `css/components.css:408` | NOT payments. Table striping. |
| Historical Stripe columns in migrations 002/003/004/010 | `002:33-62`, `003:20-61`, `004:22`, `010:7-48` | By design. Migration 011 DROPs them; the DROP depends on the CREATE existing. Do-not-touch. |
| Migration 011 de-Stripe history comments + DROP statements | `011:2-165` | Intentional. This is the de-Stripe migration itself. |
| RLS comment + the to-be-renamed table in 008/009 | `008:8,22,24`, `009:100,199` | Historical; 011 renames `stripe_webhook_events` -> `paypal_webhook_events`. |

Targeted live-Stripe probe: `grep -rniE "stripe\.com|create-checkout-session|stripe-webhook|js\.stripe|sk_(live|test)|pk_(live|test)" js/ *.html supabase/ css/ _headers .env.example`
-> **ZERO**. No live Stripe endpoint, SDK, or key anywhere. `_headers:11` CSP carries
PayPal domains only (no `stripe.com`). **G1 PASS.**

### G2 — Secrets
Command (contract exact): `grep -rn "service_role|sk_live|whsec_|PAYPAL_CLIENT_SECRET|PAYPAL_WEBHOOK_ID" js/ *.html`
-> **ZERO matches. G2 PASS.**

Broader sweep `grep -rniE "\beval\(|new Function\(|AKIA[0-9A-Z]{16}|ey[A-Za-z0-9_-]{30,}\."`
over `js/*.js *.html` -> ZERO (no eval, no hardcoded JWT, no AWS key). Server secrets
(`PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `SUPABASE_SERVICE_ROLE_KEY`) are read
only via `Deno.env.get(...)` in `supabase/functions/**` and never echoed in a
response body (`_shared/paypal.ts:336-347` strips PayPal error bodies to a machine
token; payer PII never surfaced). `js/config.js` holds only the browser-safe
`SUPABASE_URL` + `SUPABASE_ANON_KEY` (publishable, RLS-protected) with documented
placeholders. `.gitignore:8-10` ignores `.env` / `.env.*` and tracks only
`.env.example`. The browser-safe `PAYPAL_CLIENT_ID` is the only PayPal value that
may appear client-side (SDK `<script>` src); it is read from `window.PAYPAL_CLIENT_ID`
and never committed as a literal.

### G3 — Payments (PayPal verify-first + server-side amounts)

VERIFY-SIGNATURE-FIRST — `supabase/functions/paypal-webhook/index.ts` main handler,
order is load-bearing and proven line-by-line:

| Step | Line | Operation |
|---|---|---|
| 1 | `559` | `const rawBody = await req.text()` — raw signed payload captured first |
| 2 | `562` | `readWebhookHeaders(req)` — the five PayPal transmission headers |
| 3 | `568` | `JSON.parse(rawBody)` — parse (PayPal verify needs the parsed event) |
| 4 | `576` | `await verifyWebhookSignature(headers, event)` — **FIRST trust op** |
| 4a | `582-585` | non-verified -> `400`, NO write |
| 5 | `595` | `alreadyProcessed(...)` — the FIRST DB access, AFTER verify passes |
| 6 | `614+` | reconciliation switch |

`verifyWebhookSignature` (`_shared/paypal.ts:287-325`) POSTs to the real PayPal
`/v1/notifications/verify-webhook-signature` with all five headers + the server-only
`PAYPAL_WEBHOOK_ID` + the event body, and returns true ONLY on
`verification_status === "SUCCESS"`. Fail-closed: missing headers -> false (`:295`),
missing webhook id -> throw -> 500 (`:291-294`), any non-200 -> false (`:319-322`).
Not a stub. **No DB write precedes a SUCCESS verification. G3 verify-first PASS.**

SERVER-SIDE AMOUNTS — `supabase/functions/paypal-checkout/index.ts`:
- Dues (`:170-198`): price read from `membership_plans.amount_cents` by `plan_id`;
  client sends `plan_id` only. JWT required (`:393-394`). Comped/lifetime/manual
  rejected (`:161` `NON_BILLABLE_STATUSES`); $0/lifetime plan rejected (`:189`).
- Event ticket (`:266-336`): price read from `events.price_cents` (`:336`). Ownership
  enforced — `reg.profile_id !== userId || reg.event_id !== event.id` -> 403 (`:307`);
  already-paid -> 409 (`:310`); server-side capacity re-check (`:316-330`). JWT
  required (`:399-400`).
- Donation (`:215-248`): amount clamped server-side to `[DONATION_MIN_CENTS,
  DONATION_MAX_CENTS]` (`:216-226`); anonymous allowed.
- Zod validation BEFORE any DB access (`:379`).

Client call bodies confirmed to carry NO amount/price for dues/ticket:
`js/membership.js:200,723` dues body = `{ purpose:'dues', plan_id }`;
`js/events.js:511-515` ticket body = `{ purpose, event_id, event_registration_id,
profile_id, guest_count }`; `js/donate.js:185-189` donation body = `{ purpose,
amount_cents, designation }` (clamped server-side). **G3 server-side amounts PASS.**

Zelle/check/cash first-class: `admin-dues.html` mark-paid modal +
`js/admin-dues.js` write sequence (`assertAdminFresh()` -> insert `payments` ->
update `dues_invoices` -> update `members`), method picker check/zelle/cash, gated
by migration 011 admin RLS. Comped/lifetime/manual excluded via `_canMarkPaid()`.
**G3 offline path PASS.**

### G4 — File ownership
Shared nav/footer come solely from `js/shell.js` (Lane A). No page hand-rolls site
nav: `grep -rniE '<nav[^>]*(id=|class=)' *.html` returns only two CONTENT pagination
`<nav>`s (`admin-content.html:462` queue-pagination, `content.html:383`
content-pagination) — correct semantic use, not site nav. No `<header>`/`<footer>`
hand-rolled in pages; no `main-nav` / `nav__link` / `mobile-admin-nav` markup in HTML.
Lane F appended its member-area styles to `css/components.css` ADDITIVELY (marker at
`components.css:821`, lines 821-1170) without clobbering Lane A's content (lines
1-820 intact). **G4 PASS.**

### G5 — Accessibility
Covered in full in `docs/accessibility-check.md`. Summary: 18px base; tertiary text
6.91:1 (computed, passes AA); 44px targets; skip link on every page; ambient off;
no `innerHTML` for user/feed strings. **G5 PASS.**

### G6 — Routing
Every page below home has breadcrumbs (passed via `Shell.render`, including admin
pages via their JS modules); home has none (`js/app.js:519` passes no breadcrumbs).
News is in the shared nav as "News" -> `content.html` (`js/shell.js:86,103`).
**G6 PASS.**

### G7 / G8
No emojis, no time-language, no A/B/C menus in any Lane J deliverable. Citations
present below. **G7/G8 PASS.**

---

## RLS verification SQL (the board runs these against the LIVE project)

Migration 011 (`supabase/migrations/011_destripe_add_paypal.sql`) drops the Stripe
columns/indexes, renames `stripe_webhook_events` -> `paypal_webhook_events` (RLS on,
NO policies = service-role only), and adds the mark-paid policies
(`payments_admin_insert` `:153-155`, `payments_admin_update` `:158-161`), both gated
on `public.get_my_role() in ('admin','board')`. The double-charge guard
`uq_dues_open_period` (from `003:32`) is untouched. Run the following to PROVE the
posture on the live DB.

### 1. Confirm migration 011 landed (columns + table rename + policies)
```sql
-- Stripe columns are GONE:
select column_name from information_schema.columns
where table_schema='public' and table_name='payments'
  and column_name like 'stripe%';                          -- expect 0 rows

-- PayPal columns + payment_method exist:
select column_name from information_schema.columns
where table_schema='public' and table_name='payments'
  and column_name in ('paypal_order_id','paypal_capture_id','payment_method'); -- expect 3

-- The webhook table was renamed:
select to_regclass('public.paypal_webhook_events') is not null as renamed,  -- expect t
       to_regclass('public.stripe_webhook_events') is null      as old_gone; -- expect t

-- The mark-paid policies exist:
select policyname, cmd from pg_policies
where schemaname='public' and tablename='payments'
order by policyname;   -- expect payments_admin_insert (INSERT), payments_admin_update (UPDATE),
                       --        payments_admin_select_all (SELECT), payments_select_own (SELECT)

-- The double-charge guard survived:
select indexname from pg_indexes
where schemaname='public' and tablename='dues_invoices'
  and indexname='uq_dues_open_period';                     -- expect 1 row
```

### 2. Anon (publishable key) — default-deny on private tables
Run with the ANON key (e.g. the SQL editor "anon" role, or a REST call with the anon
JWT). Each must return ZERO rows (RLS denies):
```sql
set role anon;
select count(*) from public.profiles;             -- 0
select count(*) from public.members;              -- 0
select count(*) from public.dues_invoices;        -- 0
select count(*) from public.payments;             -- 0
select count(*) from public.event_registrations;  -- 0
select count(*) from public.paypal_webhook_events;-- 0 (service-role only)
select count(*) from public.audit_log;            -- 0
reset role;
-- Anon SHOULD read (public surfaces):
-- membership_plans (active), events (published+public), content_items (approved/auto_approved).
```

### 3. Member JWT cannot self-elevate or write payments
With a member's JWT (role='member' in `app_metadata`):
```sql
-- Self-elevation must FAIL (no UPDATE on profiles.role for members):
update public.profiles set role='admin' where id = auth.uid();   -- 0 rows / blocked

-- Members cannot INSERT payments (only admin/board via 011 RLS):
insert into public.payments (amount_cents, payment_method, purpose_type, status)
values (1, 'cash', 'dues', 'succeeded');                          -- blocked by RLS
```

### 4. Admin JWT CAN mark-paid (the offline path)
With an admin/board JWT, the three mark-paid writes must SUCCEED (this is what the
`admin-dues.html` modal does):
```sql
-- INSERT payments (payments_admin_insert):
insert into public.payments (member_id, amount_cents, payment_method, purpose_type, status, paid_at)
values ('<member-uuid>', 7500, 'check', 'dues', 'succeeded', now());   -- succeeds

-- UPDATE dues_invoices -> paid:
update public.dues_invoices set status='paid', payment_method='check', payment_reference='ck #1041'
where member_id='<member-uuid>' and status in ('pending','payment_failed','action_required'); -- succeeds

-- UPDATE members -> active + expiry:
update public.members set membership_status='active', expires_at = (current_date + interval '1 year')
where id='<member-uuid>';                                              -- succeeds
```

`get_my_role()` (`007:132`) is a STABLE SECURITY DEFINER function reading
`app_metadata.role` from the JWT, injected by `custom_access_token_hook` (`007:78`).
The hook must be registered in the Supabase Dashboard (Auth -> Hooks) or the role
claim never lands — a credential-boundary action.

---

## Risk register

| # | Risk | Severity | Status / mitigation | Owner |
|---|---|---|---|---|
| R1 | Forged webhook writes a fake payment / activates a member | High | MITIGATED — verify-signature is the first op; 400 before any write (`paypal-webhook:576-585`). e2e: `tests/e2e/paypal-webhook-signature.spec.js`. | Lane B (verified) |
| R2 | Client tampers the dues/ticket price | High | MITIGATED — amounts read server-side from DB; client sends ids only (`paypal-checkout:170-198,266-336`). unit: `tests/unit/checkout-body.test.mjs`. | Lane B/E/G (verified) |
| R3 | Server secret leaks to the browser | High | MITIGATED — G2 zero; env-only reads; PII-stripped error bodies. | Lane B (verified) |
| R4 | Member PII (directory) exposed to anon / via XSS | High | MITIGATED — `_isSignedIn()` gate before any `profiles` query (`directory.js:42`); all PII via `textContent` DOM build (`directory.js` `_memberCard`); LinkedIn URL scheme-allowlisted (`_safeHttpUrl`). RLS default-deny on `profiles`. | Lane F (verified) |
| R5 | Member self-elevates to admin | High | MITIGATED — `profiles.role` not member-updatable (009 RLS); admin RLS reads JWT claim via `get_my_role()`. PROVE with SQL §3. | Lane 1 (verify on live) |
| R6 | Double-charge of annual dues | Medium | MITIGATED — `uq_dues_open_period` partial unique index intact (011 keeps it); webhook upserts keyed on capture id (`uq_payments_paypal_capture`). | Lane B (verified) |
| R7 | Mark-paid writes fail silently if 011 not applied | Medium | OPEN (credential boundary) — admin INSERT/UPDATE RLS lives in 011; until applied, mark-paid is blocked by default-deny. Apply 011, then run SQL §4. | Board |
| R8 | Webhook id / client secret unset -> payments inoperative | Medium | EXPECTED (credential boundary) — functions fail closed (500) without `PAYPAL_WEBHOOK_ID`; board sets secrets + registers webhook. | Board |
| R9 | Custom access token hook unregistered -> role claim missing -> RLS over-denies | Medium | OPEN (credential boundary) — register the hook in the Dashboard; without it every `get_my_role()` policy denies admins. | Board |
| R10 | Stripe column DROP fails on a fresh DB applied out of order | Low | MITIGATED — 011 uses `drop ... if exists` (idempotent) and guards the rename; safe to re-run. | Lane B (verified) |
| R11 | Social/Instagram link-out hrefs are placeholders | Low | EXPECTED — plain `rel="noopener noreferrer"` link-outs; board swaps real handles (one-line). No widget/scraper. | Board |
| R12 | CSP too tight/loose for PayPal | Low | MITIGATED — `_headers:11` allows `www.paypal.com` / `api-m(.sandbox).paypal.com` in script/connect/frame/form-action; `object-src 'none'`, `frame-ancestors 'none'`. Verify after deploy. | Lane B (verified) |

---

## Defects found (file:line + owning lane) — Lane J does NOT fix

No code defects that block ship were found. The items below are the complete set of
findings; all are either test-harness drift (fixed in `tests/**`, which Lane J owns)
or credential-boundary provisioning (board action). None require a source edit by a
build lane.

| ID | Finding | file:line | Owning lane | Severity | Disposition |
|---|---|---|---|---|---|
| QA-T1 | Wave-001 `checkout-body.test.mjs` targeted the removed inline Stripe block in `index.html` and threw "checkout inline script not found" | `tests/unit/checkout-body.test.mjs` (old) | Lane J (tests) | Med (test only) | FIXED by Lane J — rewritten for the PayPal call bodies (runtime-captures the real donation body; source-asserts dues/ticket carry no amount). |
| QA-T2 | `security-invariants.test.mjs` asserted `membership.html` ships FOAC, but wave-002 IA makes membership a PUBLIC page (Lane E) | `tests/unit/security-invariants.test.mjs:70-75` (old) | Lane J (tests) | Med (test only) | FIXED by Lane J — FOAC list now covers admin + dashboard/profile/my-events; membership asserted public. Secret regex extended to PayPal names; added a live-Stripe-remnant gate. |
| QA-T3 | `dues-ledger.test.mjs` `_ageDays` exact-equality assertion is brittle across a day boundary / negative-UTC offset (got 44, expected 45) | `tests/unit/dues-ledger.test.mjs:54` (old) | Lane J (tests) | Low (test only) | FIXED by Lane J — assertion now tolerant (44-45). The SOURCE `_ageDays` (`js/admin-dues.js:157-164`) is correct. |
| QA-T4 | e2e specs referenced the renamed table and the removed Stripe webhook spec | `tests/e2e/rls.spec.js:48`, `tests/e2e/auth-gate.spec.js`, `tests/e2e/README.md` (old) | Lane J (tests) | Low (test only) | FIXED by Lane J — `stripe_webhook_events`->`paypal_webhook_events`; Stripe webhook spec ported to `paypal-webhook-signature.spec.js`; auth-gate updated (membership public, `signin.html?next=` redirect). |
| OBS-1 | `content-sync` retains the unused `syncNewsHTML` HTML-parse path (morehouse_news now uses RSS) | `supabase/functions/content-sync/index.ts` | Lane C | Info (no risk) | NOTE only — Lane C flagged it as a future cleanup; not a defect, not a blocker. |
| BND-1..3 | PayPal secrets + webhook registration, Supabase project + hook registration + 011 apply, Chase Zelle/check display values are unprovisioned | n/a (credential boundary) | Board | Blocked (expected) | Documented in `docs/predeploy-report.md`. Not a code defect. |

---

## Citations

Skills (Skills Library V2, verified present in `.claude/skills/`):
- `security-auditing` — secrets-grep gate, auth-on-every-privileged-path, no
  client-trusted amounts, PII non-leakage in error bodies.
- `hacker-scanning` — adversarial secrets/eval/route sweep, RLS default-deny probes,
  webhook forgery attack (missing/forged transmission headers -> 400).
- `pre-deploy-gating` / `exit-gating` — PASS/FAIL/BLOCKED gating with executable
  evidence and the credential-boundary stop.
- `code-scrutinizing` — verify-first ordering, fail-closed posture, ownership-boundary
  read across all lanes.
- `supabase-building` — RLS verification SQL, service-role containment, mark-paid
  policy review, custom access token hook dependency.
- `testing-enforcing` — porting the Stripe webhook/checkout tests to PayPal; keeping
  the auth-gate / directory-privacy / RLS specs runnable.

Librarians (verified present in `librarians/`):
- `security-librarian` — signature-first ordering, credential boundary, fail-closed
  verification, no server-only secrets in browser files.
- `hacker-attacker-librarian` — webhook forgery + price-tamper + self-elevation attack
  modeling and the RLS probe set.
- `pre-deployment-librarian` — ship checklist and verified-now vs blocked split.
- `code-audit-librarian` / `code-scrutinizer-librarian` — adversarial artifact read
  and defect routing with file:line + owning lane.
- `supabase-librarian` — mark-paid RLS, rename-table migration, partial-unique-index
  double-charge backstop.
- `testing-librarian` — vm-sandbox body-capture pattern and source-drift guards.

2026 reference docs (verified to exist; from the dossier master index):
- W3C WCAG 2.2 — https://www.w3.org/TR/WCAG22/
- OWASP Top Ten — https://owasp.org/www-project-top-ten/
- PayPal verify-webhook-signature — https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
- PayPal Webhooks v1 (event names) — https://developer.paypal.com/docs/api/webhooks/v1/
- PayPal Orders API v2 (server create + capture) — https://developer.paypal.com/docs/api/orders/v2/
- PayPal REST authentication (OAuth2 client credentials) — https://developer.paypal.com/api/rest/authentication/
- Supabase Row Level Security — https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase custom access token hook — https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook
- Supabase Edge Function secrets — https://supabase.com/docs/guides/functions/secrets
- Chase Business — Zelle for Business — https://www.chase.com/business/banking/zelle

## Completion rule
Adversarial read of the real artifacts. Hard gates recorded with file:line, PayPal
verify-first proven, RLS SQL documented for the board, risk register + every defect
routed to its owning lane. Lane J fixed only `tests/**` (its own scope) and wrote no
source. See `docs/predeploy-report.md` for the ship verdict and the credential
boundary; `docs/accessibility-check.md` for the older-user audit.
