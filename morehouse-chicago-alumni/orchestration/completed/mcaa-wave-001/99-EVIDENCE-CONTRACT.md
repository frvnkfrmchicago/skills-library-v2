# Evidence Contract — mcaa-wave-001

Every lane agent must satisfy this contract. A lane is NOT done because the agent says
"done." It is done when its brief file is rewritten with completion evidence AND the hard
gates below pass.

## Completion evidence (rewrite your own lane brief file in place)

When finished, rewrite `0N-<LANE>.md` with:

1. Explainer (plain language, non-technical reader).
2. TL;DR (3–6 bullets).
3. Tables: completed work, files changed (path + one line), commands run, artifact paths.
4. Remaining gaps (be honest — what is stubbed, deferred, or needs credentials).
5. Exact paths of everything you created/edited.
6. A task-sheet update row for the lead (Wave | Lane | Owner | status-claim | summary | doc path).

Do not rely on a chat summary. The file is the record.

## Hard gates (apply to every lane that touches the relevant surface)

- G1 Secrets: `grep -rn "service_role\|sk_live\|sk_test\|whsec_" js/ *.html` returns ZERO.
  Real secrets live only in Edge Function env / `.gitignore`d files. Anon key may be in
  `js/config.js`.
- G2 File ownership: you edited ONLY files your lane owns (see data-contract.md §11). The two
  shared files (`index.html`, `js/app.js`) follow the §10 handoff order.
- G3 No mock data ships unlabeled: real-format seed data, or `[PLACEHOLDER]` labeled, per the
  anti-mock policy. No `John Doe` / `lorem ipsum` / `test@test.com`.
- G4 Contract adherence: schema/enums/API names match `docs/data-contract.md` exactly. If you
  must deviate, note it in "Remaining gaps" and flag the lead — do not silently diverge.
- G5 Security invariants (data-contract.md §9) relevant to your lane are honored. Notably:
  service_role never client-side; admin gated by `Auth.requireAdmin()`; webhook verifies
  signature first; dues amount server-side; no `innerHTML` for user strings; RLS on every
  table you create.
- G6 No time-language in any deliverable (no days/weeks/hours). No emojis. Track status as
  done / in-progress / blocked, not durations.
- G7 Citations: your completion record lists the skills, librarians, and 2026 URLs you applied
  (real ones only — verify they exist; `content-hub-engine` and `content-hub-engine-librarian`
  do NOT exist).

## Credential boundary (legitimate stop point)

Live Supabase project + Stripe account are not provisioned in this environment. Build all code
as deployable artifacts. Where a step genuinely requires live credentials (apply migration to a
real project, deploy an Edge Function, run a live Stripe webhook), STOP at that step, document
the exact command/secret the board must supply, and record it under "Remaining gaps." Do not
fabricate a successful deploy.

## Lead review classification

The lead reopens each rewritten brief and marks: `accepted` / `needs-rerun` / `rejected`,
then updates `management/MASTER-LOG.md`. Wave closes only when all lanes are accepted and the
packet is moved to `completed/`.
