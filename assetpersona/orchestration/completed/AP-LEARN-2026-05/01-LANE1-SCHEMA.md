# Lane 1 — Schema + RLS + Role Ladder
Status: assigned · Wave: 1 (Foundation) · % on completion: 30%

## Explainer
The data spine. Without these tables and RLS, every other lane is a stub. Adds modules + progress + role ladder + module-source pipeline tables. Bypass-friendly local store mirror so the rest of the packet is testable before remote push.

## TL;DR
- Modules · resources · tasks tables.
- Progress · streaks · achievements · completions tables.
- `learner_role` enum + `xp` int on profiles.
- News sources + draft queue tables for Wave 5 pipeline.
- `src/lib/learnLocal.ts` mirrors all of it in localStorage when bypass is active.
- `src/types/learn.ts` is the shared type file.

## Owned scope
`supabase/migrations/2026XXXX_*modules*.sql` (4 files), `src/types/learn.ts` (new), `src/lib/learnLocal.ts` (new)

## Do not touch
Anything outside the migrations + new files.

## Done criteria
- All 4 migrations run clean (push or dashboard)
- Every new table has `rowsecurity = true`
- Bypass local store covers create/read/update for modules + progress + streaks
- TS check zero errors
