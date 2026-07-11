# Lane 1 — Architecture, Supabase Schema, RLS, Auth Contracts
Status: done (pending lead review)
Wave: mcaa-wave-001
Owner: Batch 1 agent (Lane 1 BUILD)
Single source of truth: this file only.

## Explainer
This lane built the foundation the rest of the site stands on. It created the real
database: eleven tables that hold members, dues, payments, events, and tracked content,
plus the security rules (Row Level Security) that decide who is allowed to see or change
each row. It added the login system on top of Supabase Auth, including a server-side hook
that stamps each member's role into their login token so the security rules can trust it.
It also rewrote the small "store" layer the existing pages already use so those pages keep
working unchanged while their data moves from the browser to the real backend. The polished
home page, its sign-in, and its grids all still render — now they hydrate from the cache and
(once a live project is connected) from Supabase. Nothing was deployed to a live account;
that step needs the board's credentials and is written out below.

## TL;DR
- 10 migrations (001-010) create 11 tables + 18 enums + triggers + the access-token role
  hook + RLS enabled on every table + all policies + seed plans (Standard $75/yr, Premium
  $150/yr, Comped $0). Validated end-to-end against a real Postgres.
- `js/store.js` rewritten to the Supabase adapter while preserving the entire public surface
  (`Store.get/set/on`, `STORAGE_KEYS`, `generateId`, `formatDate/Short/Time`, `HBCU_NEWS`,
  `SCHOLARSHIP_RECIPIENTS`, `Gallery`); `js/config.js` and `js/auth.js` added.
- First-touch `index.html` (CDN + config script tags in order, async sign-in, nav session,
  `?signin=1` handling) and `js/app.js` (`async init()` awaits `Store.init()` before render);
  HANDOFF comments left for Lane 5 (CTAs) and Lane 6 (gallery).
- Hard gates pass: secret grep returns ZERO, RLS on all 11 tables, no emojis, no time-language.
- Caught and fixed a real bug: `custom_access_token_hook` used `jsonb_set` on a path whose
  parent (`app_metadata`) did not exist, which silently dropped the role claim and would have
  broken every RLS check. Fixed and re-verified.
- Self-elevation is provably blocked: a member updating their own `role` to `admin` is denied
  by the policy WITH CHECK; benign self-edits still succeed.

| Field | Value |
|---|---|
| Mission | Implement the data + auth + client-adapter foundation exactly per `docs/data-contract.md`. |
| Result | Done. All owned files created; gates pass; schema validated on real Postgres. Not deployed (credential boundary). |
| Validation depth | All 10 migrations applied in order on a throwaway Postgres 14 with auth-schema shims; RLS, role-hook, self-elevation block, and anon visibility tested live. JS syntax-checked and runtime-smoke-tested (store + auth). |

## Completed work
| # | Item | Status |
|---|---|---|
| 1 | 001 extensions + 18 enums (§3) | done |
| 2 | 002 profiles / members / membership_plans (§4) | done |
| 3 | 003 dues_invoices / payments / stripe_webhook_events (§4) | done |
| 4 | 004 events / event_registrations + deferred payments FK (§4) | done |
| 5 | 005 content_sources / content_items (§4) | done |
| 6 | 006 audit_log (§4) | done |
| 7 | 007 updated_at trigger, handle_new_user, custom_access_token_hook, get_my_role (§5) | done |
| 8 | 008 enable RLS on all 11 tables (§6, §9 #9) | done |
| 9 | 009 all RLS policies incl. profiles self-update WITH CHECK blocking role change (§6) | done |
| 10 | 010 seed plans: Standard $75/yr, Premium $150/yr, Comped $0 (§12) | done |
| 11 | `js/config.js` (URL + anon placeholders + safe-to-commit note + SUPABASE_CONFIGURED flag) | done |
| 12 | `js/store.js` Supabase adapter (cache + async init + Auth signIn/out; preserved surface) | done |
| 13 | `js/auth.js` window.Auth gate (init/requireAuth/requireAdmin/updateNavForSession + FOAC + onAuthStateChange + assertAdminFresh) | done |
| 14 | `.env.example` + `.gitignore` (§9 #10) | done |
| 15 | First-touch `index.html` (script order, async sign-in, nav, ?signin=1) + HANDOFF Lane 5 | done |
| 16 | First-touch `js/app.js` (async init awaits Store.init) + HANDOFF Lane 6 | done |

## Files changed
| Path | What |
|---|---|
| `supabase/migrations/001_extensions_enums.sql` | uuid-ossp + pgcrypto; all 18 enums (§3). |
| `supabase/migrations/002_core_profiles_members_plans.sql` | profiles, members, membership_plans + indexes. |
| `supabase/migrations/003_financial_invoices_payments_webhookevents.sql` | dues_invoices (open-period unique guard), payments (ledger), stripe_webhook_events. |
| `supabase/migrations/004_events_registrations.sql` | events, event_registrations; resolves payments.event_registration_id FK. |
| `supabase/migrations/005_content.sql` | content_sources, content_items (GIN index on relevance_tags). |
| `supabase/migrations/006_audit_log.sql` | append-only audit_log + indexes. |
| `supabase/migrations/007_triggers_functions.sql` | handle_updated_at on 9 tables; handle_new_user (SECURITY DEFINER, search_path=''); custom_access_token_hook (granted to supabase_auth_admin, revoked from authenticated/anon/public); get_my_role. |
| `supabase/migrations/008_rls_enable.sql` | `enable row level security` on all 11 tables. |
| `supabase/migrations/009_rls_policies.sql` | every policy in the §6 matrix; profiles self-update WITH CHECK pins role; payments/stripe_webhook_events get no client write policy. |
| `supabase/migrations/010_seed_plans.sql` | idempotent seed: Standard 7500/year, Premium 15000/year, Comped 0/lifetime. |
| `js/config.js` | NEW. window.SUPABASE_URL/ANON_KEY placeholders, safe-to-commit note, SUPABASE_CONFIGURED. |
| `js/store.js` | REWRITE. §2.2 adapter; creates window.supabaseClient; preserved public surface; clears stale mca_auth; graceful degradation when unconfigured. |
| `js/auth.js` | NEW. window.Auth per §2.3 + §2.4 FOAC + onAuthStateChange + assertAdminFresh server re-validation. |
| `.env.example` | NEW. Labeled public vs server-only secrets; documents where each lives. |
| `.gitignore` | NEW. Ignores `.env*` (keeps `.env.example`), Supabase local state, node/editor cruft. |
| `index.html` | FIRST-TOUCH. §2.1 script tags in order; async Store.signIn; Auth.init + updateNavForSession; ?signin=1 modal; HANDOFF Lane 5. |
| `js/app.js` | FIRST-TOUCH. `async init()` awaits Store.init() (+Auth.init) before render; HANDOFF Lane 6. |

## Commands run (validation — none touched a live project)
| Command | Purpose | Result |
|---|---|---|
| `initdb` + `pg_ctl start` (throwaway cluster on a private socket) | Stand up a real Postgres 14 for migration validation (Docker unavailable, so `supabase db reset` could not run). | Cluster up. |
| Create auth-schema shims (auth.users, auth.uid/jwt, supabase_* roles) then `psql -f 001..010` | Apply all migrations in order with ON_ERROR_STOP on a clean DB. | All 10 applied, no errors. |
| `select tablename,rowsecurity from pg_tables where schemaname='public'` | Verify RLS on every table. | 11 tables, all `t`. |
| RLS behavior tests (single-tx, simulated member/anon JWT GUCs) | Prove self-elevation blocked, benign self-edit allowed, anon sees 3 plans / 0 profiles, directory_visible toggles other-profile read. | All as expected. |
| Exercise custom_access_token_hook + handle_new_user directly | Prove role injection, public fallback, app_metadata preservation, auto-profile on signup. | Pass after hook fix. |
| `grep -rn "service_role\|sk_live\|sk_test\|whsec_" js/ *.html` | G1 hard gate. | ZERO. |
| `node --check` on all client JS; Node runtime smoke of store.js + auth.js | Syntax + behavior of the adapter and gate helper. | All pass. |
| `pg_ctl stop` + `rm -rf` throwaway cluster | Clean up. | Port clear. |

## Artifacts
| Path | Type |
|---|---|
| `supabase/migrations/001_extensions_enums.sql` … `010_seed_plans.sql` | Deployable migrations (731 lines total). |
| `js/config.js`, `js/store.js`, `js/auth.js` | Client config + adapter + auth gate. |
| `.env.example`, `.gitignore` | Secret hygiene. |
| `index.html`, `js/app.js` | First-touch shared files with HANDOFF markers. |

## Remaining gaps (honest)
- CREDENTIAL BOUNDARY — not deployed. No live Supabase project or Stripe account exists in
  this environment. Migrations were validated against a local throwaway Postgres, NOT pushed.
  The board must run, in order:
  1. `supabase link --project-ref <ref>`
  2. `supabase db push`  (applies 001-010 to the live project)
  3. Dashboard -> Authentication -> Hooks -> Customize Access Token (JWT) Claims -> select
     `public.custom_access_token_hook`. The migration grants/revokes are already in place;
     this registration step is Dashboard-only and cannot be scripted from here.
  4. Replace the two placeholders in `js/config.js` with the live Project URL + anon key
     (Dashboard -> Project Settings -> API). The anon key is safe to commit.
  5. Server-only secrets for Lane 2's Edge Functions (NOT client-side, NOT in git):
     `supabase secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... SUPABASE_SERVICE_ROLE_KEY=...`
- Local `supabase db reset` was not run because Docker is not available in this environment;
  the equivalent validation was done with a hand-stood Postgres + auth shims (documented above).
  When Docker is present, `supabase db reset` should also be run as a second check.
- Seed plans intentionally carry null `stripe_product_id`/`stripe_price_id` (marked
  `[PROVISION]`); Lane 2 / the board create the Stripe Products/Prices and backfill them.
- `Store._hydratePublic()` currently hydrates events only (the one domain the home page reads
  through Store). Members/plans for member-facing pages are read directly by Lanes 3/4/5 via
  `window.supabaseClient.from(...)` per §2.2 — intentional, not a gap.
- Contract deviations: NONE. Schema, enums, table names, and the client API surface match
  `docs/data-contract.md` exactly.

## Exact paths created/edited
- `supabase/migrations/001_extensions_enums.sql`
- `supabase/migrations/002_core_profiles_members_plans.sql`
- `supabase/migrations/003_financial_invoices_payments_webhookevents.sql`
- `supabase/migrations/004_events_registrations.sql`
- `supabase/migrations/005_content.sql`
- `supabase/migrations/006_audit_log.sql`
- `supabase/migrations/007_triggers_functions.sql`
- `supabase/migrations/008_rls_enable.sql`
- `supabase/migrations/009_rls_policies.sql`
- `supabase/migrations/010_seed_plans.sql`
- `js/config.js`
- `js/store.js`
- `js/auth.js`
- `.env.example`
- `.gitignore`
- `index.html` (first-touch, shared)
- `js/app.js` (first-touch, shared)

## Task-sheet update row (for the lead)
| Wave | Lane | Owner | Status-claim | Summary | Doc path |
|---|---|---|---|---|---|
| mcaa-wave-001 | 1 (ARCH-DATA-AUTH) | Batch 1 agent | done (pending review) | 11 tables + enums + triggers + role hook + RLS-on-all + seed; store/config/auth client adapter; first-touch index.html/app.js with Lane 5/6 handoffs. Schema validated on real Postgres; secret gate ZERO. Not deployed (needs board creds). | `orchestration/active/mcaa-wave-001/01-ARCH-DATA-AUTH.md` |

## Citations (real — verified present this session)
Skills applied (files confirmed at `.claude/skills/<name>/SKILL.md`):
- `supabase-building` — RLS-always, anon-key-only client, migration workflow, never service_role client-side.
- `database-designing` — normalized schema, FK strategy, migration discipline, index placement.
- `backend-hardening` — secret hygiene, server-side trust boundary, input/role validation.
- `security-auditing` — secrets-grep gate, default-deny RLS, self-elevation prevention, FOAC.
- `frontend-architecting` — window.* global module pattern, preserved public surface, load order.

Librarians (files confirmed at `librarians/<name>.md`):
- `supabase-librarian`, `database-librarian`, `backend-librarian`, `security-librarian`, `frontend-librarian`.

2026 documentation (Supabase official):
- supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook (hook signature, grant to
  supabase_auth_admin, revoke from authenticated/anon, Dashboard registration).
- supabase.com/docs/guides/database/postgres/row-level-security (enable RLS, USING vs WITH CHECK,
  `(select auth.uid())` pattern, default-deny).
- supabase.com/docs/guides/auth/auth-hooks (hook model, security-definer + pinned search_path).
- supabase.com/docs/reference/javascript/installing (UMD CDN tag; the +esm build is broken — §2.1).
- supabase.com/docs/reference/javascript/auth-onauthstatechange (subscription shape
  `{ data: { subscription } }`, SIGNED_IN/SIGNED_OUT/TOKEN_REFRESHED).

## Completion Rule (met)
This file is rewritten in place with Explainer, TL;DR, tables (work, files changed, commands,
artifacts), honest remaining gaps (credential boundary noted), exact paths, task-sheet row, and
verified citations, per `99-EVIDENCE-CONTRACT.md`.
