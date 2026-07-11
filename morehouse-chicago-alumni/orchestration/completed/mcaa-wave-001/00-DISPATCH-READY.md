# Dispatch Ready — mcaa-wave-001

Wave: `mcaa-wave-001`
Project: Morehouse Chicago Alumni chapter web app
Goal: turn the polished static prototype into a production chapter platform — real auth,
membership dues ledger, Stripe payments, event registration, content hub, admin/member
portals, security/privacy hardening — without rebuilding the front-end design.

## Comprehension Gate (SAD Gates 1–3, closed)

- Understood: a polished static HTML/CSS/JS prototype with a localStorage `Store`
  (`js/store.js`), hardcoded-password auth (`js/store.js:80-99`: `morehouse2026`/`alumni2026`),
  ungated admin (`js/admin.js:7`), public directory (`js/directory.js:14`), and
  `[PLACEHOLDER]`-labeled seed data. Verified against the actual files.
- Researched: 5-agent critical-analysis pass locked Supabase schema/RLS/role-hook, Stripe
  primitives + webhook design, the REAL content-source reality (Localist RSS works;
  Instagram/LinkedIn require college OAuth + platform review and are deferred to manual
  capture), a 15-item security risk register, and the Store-adapter integration map.
- Gap: there is no backend. Auth, dues ledger, payments, persistence, content provenance, and
  privacy enforcement are all missing. This wave is an enhancement of a good shell.

## Canonical inputs (read before coding)

- `docs/data-contract.md` — THE contract: client API, enums, DDL (11 tables), RLS, payments,
  content reality, security invariants, file ownership, migration split.
- `99-EVIDENCE-CONTRACT.md` — completion requirements + hard gates.
- `docs/MOREHOUSE-CHICAGO-SAD-ASSESSMENT-PLAN.md` — original SAD assessment.

## Lanes

| Lane | File | Owns |
|---|---|---|
| 1 | `01-ARCH-DATA-AUTH.md` | migrations, RLS, role hook, `js/store.js`/`config.js`/`auth.js`, `.env.example`/`.gitignore`, first-touch `index.html`+`js/app.js` |
| 2 | `02-PAYMENTS-DUES.md` | Stripe Edge Functions (checkout + webhook), payment contract |
| 3 | `03-EVENTS-REGISTRATION.md` | events pages + `events.js`/`calendar.js`, event flow doc |
| 4 | `04-CONTENT-HUB.md` | content pages + `content.js`/`admin-content.js`, content-sync function, sources doc |
| 5 | `05-MEMBER-ADMIN-UX.md` | membership + admin-dues + directory + admin shell, second-touch `index.html` CTA |
| 6 | `06-DESIGN-SYSTEM-MOBILE.md` | css tokens/components/pages/animations, gallery storage, a11y doc |
| 7 | `07-QA-SECURITY.md` | tests, security review, pre-deploy report |
| 8 | `08-DATA-MIGRATION-DOCS.md` | seed data, member import script, board runbook, provenance doc |

## Batch plan (see `90-ORCHESTRATION-CYCLE.md`)

- Batch 1: Lanes 1, 3, 4 (disjoint files; contract-first parallel).
- Batch 2: Lanes 2, 5, 8.
- Batch 3: Lanes 6, 7.
- Batch 4: lead merge, gate, master log, provisioning runbook, archive.

Concurrency in this environment is capped at 3 child agents per batch — matches the batches.

## Status

DISPATCH READY. Lead writes lane briefs, then dispatches Batch 1.
