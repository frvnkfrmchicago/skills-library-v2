# Orchestration Cycle — mcaa-wave-002

## Batch order and why each is safe
| Batch | Lanes | Why safe |
|---|---|---|
| 1 — foundation | A, B, C | Disjoint files (css+`js/shell.js` vs paypal functions+migration+`_headers`+`.env.example` vs `content-sync`+content data). They produce the contracts page lanes consume: the shared shell (nav/footer/breadcrumb/tokens), the PayPal checkout/webhook contract, and the corrected content data. |
| 2 — pages | D, E, F, G, H, I | File-disjoint (see ownership map). Each consumes Batch-1 contracts (shell include, PayPal button/`paypal-checkout` shape, live `content_items`). Run sub-groups D·E·F then G·H·I for the child-agent concurrency cap. |
| 3 — gate | J | Runs after pages land. Read-only verification + reports; routes any defect to the owning lane. |
| closeout | lead | Provisioning runbook + master log + archive. |

## Dependencies (contract, not live files)
- Lanes D-I consume Lane A's `js/shell.js` (a `<div id="site-header"></div>` + `<div id="site-footer"></div>` placeholder + the script). Page lanes add the placeholders; they do NOT write nav markup.
- Lanes D, E, G, I consume Lane B's PayPal contract (button render + `paypal-checkout` request shape + mark-paid `payments` insert) from `docs/payment-contract-paypal.md`.
- Lanes D, G, H consume Lane C's corrected `content_items` (news live; Morehouse events when present).

## Lead loop per batch
1. Dispatch the batch's lane agents (one brief path each).
2. On return, reopen each rewritten brief; verify hard gates (99-EVIDENCE-CONTRACT.md).
3. Classify accepted / needs-rerun / rejected; update `management/MASTER-LOG.md`.
4. Re-run any needs-rerun lane; then advance. Run end-to-end; do not pause between batches.
5. After Batch 3 + closeout, move packet `active/ → completed/`.
