# Orchestration Cycle — mcaa-wave-001

## Batch order and why each is safe

| Batch | Lanes | Why safe to run together |
|---|---|---|
| 1 | 1, 3, 4 | Disjoint file ownership. Lanes 3/4 code against the FIXED contract (data-contract.md §2 client API, §4 schema), so they do not need Lane 1's files to exist on disk. Lane 1 owns `js/store.js`/`auth.js`/`config.js` + migrations; Lane 3 owns events files; Lane 4 owns content files + content-sync function. No overlap. |
| 2 | 2, 5, 8 | Lane 2 = Edge Functions (new dirs). Lane 5 = membership/admin/directory UI (own files) + second-touch `index.html` CTA AFTER Lane 1's first touch is committed. Lane 8 = seed/scripts/docs (own dirs). No overlap. |
| 3 | 6, 7 | Lane 6 = CSS + second-touch `js/app.js` gallery AFTER Lane 1's first touch. Lane 7 = tests + review docs. No overlap. |
| 4 | lead | Merge in dependency order, resolve any conflict, write provisioning/deploy runbook (credential boundary), update master log, archive. |

## Dependencies

- Lanes 3, 4, 5 depend on the CONTRACT (not the live files) for the client API + schema.
- Lane 2 depends on the schema contract (tables `payments`, `dues_invoices`, `members`,
  `membership_plans`, `event_registrations`, `stripe_webhook_events`).
- Lane 5 (Batch 2) and Lane 6 (Batch 3) depend on Lane 1's first-touch of `index.html` /
  `js/app.js` being committed (shared-file handoff, data-contract.md §10).
- Lane 7 reviews everything — runs last with Lane 6.

## Shared-file handoff (data-contract.md §10)

- `index.html`: Lane 1 first (script tags, async sign-in, nav session) → Lane 5 second
  (membership/donate CTAs). Lane 5 confirms Lane 1's edit present before touching it.
- `js/app.js`: Lane 1 first (async `App.init`) → Lane 6 second (gallery → Supabase Storage).

## Lead loop per batch

1. Dispatch the batch's lane agents (one brief path each).
2. On return, reopen each rewritten brief; verify hard gates (99-EVIDENCE-CONTRACT.md).
3. Classify accepted / needs-rerun / rejected; update `management/MASTER-LOG.md`.
4. Re-run any needs-rerun lane before advancing.
5. Advance to the next batch. Run end-to-end; do not pause between batches.
6. After Batch 4, move packet `active/ → completed/`.
