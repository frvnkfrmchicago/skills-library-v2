# Evidence Contract — mcaa-wave-002

A lane is done when its brief is rewritten with completion evidence AND the hard gates pass.

## Completion evidence (rewrite your own brief in place)
Explainer · TL;DR · tables (work, files changed, commands) · remaining gaps · exact paths ·
task-sheet row · Citations (the real skills, librarians, and 2026 URLs you used — verify they exist;
`content-hub-engine` and `content-hub-engine-librarian` do NOT exist).

## Hard gates
- G1 No Stripe remnants: `grep -rni "stripe" js/ *.html supabase/ css/ docs/payment-contract-paypal.md` returns only intentional history notes; no `stripe.com` in `_headers`; no Stripe SDK/keys anywhere.
- G2 Secrets: `grep -rn "service_role\|sk_live\|whsec_\|PAYPAL_CLIENT_SECRET\|PAYPAL_WEBHOOK_ID" js/ *.html` returns zero (server-only secrets live in Edge env / `.gitignore`). `PAYPAL_CLIENT_ID` (browser-safe) may appear in client.
- G3 Payments: PayPal `verify-webhook-signature` is the FIRST operation in `paypal-webhook` (no write before); dues/ticket amounts read server-side from the DB, never the client body; comped/lifetime/manual never charged; Zelle/check shown as first-class with admin mark-paid.
- G4 File ownership: edited ONLY files your lane owns. Shared nav/footer come from `js/shell.js` (Lane A) — no lane hand-rolls its own nav markup.
- G5 Accessibility (older users): base type 18px; `--color-text-tertiary` fixed to pass AA; 44px+ targets on nav/buttons/calendar; skip link on every page; visible link underlines in prose/footer; ambient motion off by default; no `innerHTML` for user/feed-controlled strings (textContent/DOM build).
- G6 Routing: every page below home has breadcrumbs + the shared nav; news hub is in the nav as "News"; homepage routes (no long brochure scroll); cross-links present.
- G7 No emojis. No time-language (no days/weeks/hours). No A/B/C menus in any deliverable.
- G8 Citations present per lane: ≥1 skill + ≥1 librarian + ≥1 real 2026 URL (multiple encouraged).

## Credential boundary (legitimate stop)
Live PayPal (client id/secret/webhook id), Chase Zelle email + check address, and the Supabase
project (URL/anon key, migrations, hook registration, gallery bucket, first admin) are board-supplied.
Build all code as deployable artifacts; document the exact commands; do not fabricate a live deploy.

## Lead review
Lead reopens each brief, marks accepted / needs-rerun / rejected, updates `management/MASTER-LOG.md`.
Wave closes only when all lanes accepted and the packet moves to `completed/`.
