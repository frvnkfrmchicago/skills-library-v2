# Lane 03 — Persistence Cutover

## Mission

Kill the six 503 "prisma-offline" stubs that block Build-a-Candle, identity bootstrap, and user preferences. Add the columns the P&L loop needs. Wire `outcome_pct` write path on `paper_candles` close. After this lane: every persistence path goes to Supabase with RLS enforced. No more theatre.

## Status: COMPLETE
## Completed: 2026-04-29

## TL;DR

All six 503 stubs are killed and wired to Supabase via `src/lib/candle/service.ts` → `storage-supabase.ts`. Schema additions (onboarding gate, preferences JSONB, P&L close-out columns, watchlist reason/interaction) live in a new migration and `supabase-schema.sql`. New `/api/journal/edge` endpoint computes Van Tharp expectancy; close-out path on `/api/trades` PATCH derives `realized_pnl` server-side so client values can't poison the roll-up.

## Files Changed

| Path | Lines (+/-) | Purpose |
|------|-------------|---------|
| src/app/api/paper-candles/route.ts | +228 / -13 | Kill 503 stub; GET/POST/PATCH/DELETE go to service.ts → Supabase |
| src/app/api/paper-candles/[id]/route.ts | +127 / -13 | Single-candle GET/PATCH/DELETE via service.ts |
| src/app/api/paper-candles/[id]/prep/route.ts | +123 / -13 | Prep-action POST/GET; dedupe + paper-quality recompute via service.ts |
| src/app/api/paper-candles/[id]/outcome/route.ts | +96 / -13 | Close-out POST sets closed_at + outcome_pct + melt_state; recomputes paper_quality_tier |
| src/app/api/me/bootstrap/route.ts | +90 / -29 | Surface `needs_onboarding` from profiles; auth-meta defaults on first POST |
| src/app/api/me/preferences/route.ts | +183 / -49 | Move from `candle_profiles` to `profiles.preferences` JSONB; PATCH does shallow merge |
| src/app/api/trades/route.ts | +83 / -10 | `?status=open\|closed\|all` filter; PATCH computes server-side `realized_pnl` |
| src/app/api/watchlist/route.ts | +71 / -1 | Reject empty `reason` with 400; map `last_interaction_at`/`archived_at` |
| src/lib/candle/service.ts | +9 / -0 | Recompute paper-quality on close so the closed record's tier reflects full prep |
| src/lib/schemas/watchlist.ts | +5 / -0 | `reason` required (min 1) on add; optional on patch |
| supabase-schema.sql | +24 / -0 | Mirror new columns into source-of-truth schema (idempotent ALTERs) |

## New Files Created

| Path | Purpose |
|------|---------|
| supabase/migrations/20260429065054_persistence_cutover.sql | Lane 03 migration: profiles (needs_onboarding, preferences), trades (closed_at, close_price, realized_pnl + index), watchlist_items (reason, last_interaction_at, archived_at) |
| src/app/api/journal/edge/route.ts | P&L roll-up endpoint — Van Tharp expectancy by setup/symbol; reads closed `trades` rows, derives R-multiples from sim payload |

## Schema Changes (Lane 3 only)

| Migration | Tables | Columns added/removed |
|-----------|--------|----------------------|
| 20260429065054_persistence_cutover.sql | profiles | +needs_onboarding (boolean, default true) |
| 20260429065054_persistence_cutover.sql | profiles | +preferences (jsonb, default '{}') |
| 20260429065054_persistence_cutover.sql | trades | +closed_at (timestamptz) |
| 20260429065054_persistence_cutover.sql | trades | +close_price (numeric) |
| 20260429065054_persistence_cutover.sql | trades | +realized_pnl (numeric) |
| 20260429065054_persistence_cutover.sql | trades | +idx_trades_user_closed index on (user_id, closed_at) |
| 20260429065054_persistence_cutover.sql | watchlist_items | +reason (text) |
| 20260429065054_persistence_cutover.sql | watchlist_items | +last_interaction_at (timestamptz, default now()) |
| 20260429065054_persistence_cutover.sql | watchlist_items | +archived_at (timestamptz) |

### RLS policies verified (STOP-gate)

| Table | Policy | Predicate |
|-------|--------|-----------|
| profiles | "Users can view their own profile" | `auth.uid() = id` (SELECT) |
| profiles | "Users can update their own profile" | `auth.uid() = id` (UPDATE) |
| profiles | "Users can insert their own profile" | `auth.uid() = id` (INSERT) |
| trades | "Users can manage their own trades" | `auth.uid() = user_id` (FOR ALL) |
| paper_candles | "Users can manage their own paper candles" | `(SELECT auth.uid()) = user_id` (FOR ALL) |
| prep_actions | "Users can manage prep on their candles" | parent-row ownership through paper_candles (FOR ALL) |
| watchlist_items | "Users can manage their own watchlist" | `auth.uid() = user_id` (FOR ALL) |

New columns inherit existing table policies — no new policies required. Verified by reading `supabase-schema.sql` lines 25-30 (profiles), 126 (trades), 293 (paper_candles), 329 (prep_actions), 82 (watchlist_items).

## Commands NOT Run (per locked rule)

- ❌ npm run build
- ❌ npm test
- ❌ playwright
- ❌ next dev
- ❌ supabase db push (no migration ran against the live DB)

## Honest Empty States Added

| Surface | Old (mock) | New (honest) |
|---------|------------|--------------|
| /api/paper-candles GET (unauth) | 503 "prisma-offline" | 401 with `error: "unauthenticated"` |
| /api/paper-candles POST (unauth) | 503 "prisma-offline" | 401 with `error: "unauthenticated"` |
| /api/paper-candles/[id]/prep (untethered candle) | 503 "prisma-offline" | 404 `error: "no_active_candle"` (matches prep-tracker silent-fail contract) |
| /api/paper-candles/[id]/outcome | 503 "prisma-offline" | service errors map to typed JSON: not_found (404), already_closed (409), invalid_body (400) |
| /api/me/bootstrap GET (unauth) | already returned nulls | unchanged — kept the graceful-null pattern |
| /api/me/preferences GET (unauth) | already returned nulls | unchanged + added `preferences: {}` for forward-compat |
| /api/journal/edge (no closed trades) | n/a (new) | empty arrays + zero overall stats; never fabricates demo trades |
| /api/watchlist POST (no reason) | accepted symbol-only | 400 `error: "reason_required"` with explanation |

## Citations to Skill/Librarian/Research Used

| Reference | Where applied |
|-----------|---------------|
| .agents/skills/supabase-building/SKILL.md | Service-role gate (no client exposure), RLS-first design (`auth.uid() = user_id` on every write) — applied to all six route cutovers |
| librarians/supabase-librarian.md | Migration-versioning rule (every schema change in `supabase/migrations/<UTC>_<name>.sql`) and "never disable RLS" — applied to migration 20260429065054 |
| _meta/TIME-AWARENESS.md | Next.js 16.1.1 / React 19 patterns — used `context: { params: Promise<{ id: string }> }` route signature in `[id]` handlers (March-2026 App Router shape) |
| https://supabase.com/docs/guides/database/postgres/row-level-security | Verified RLS predicate form `auth.uid() = user_id` matches current Supabase guidance — applied to STOP-gate audit |
| https://www.investopedia.com/terms/e/expectancy.asp | Van Tharp expectancy formula `(win_rate × avg_win_R) − (loss_rate × avg_loss_R)` — implemented in `/api/journal/edge` `expectancyR()` |
| https://supabase.com/docs/guides/functions/schedule-functions | Confirmed cron jobs are out-of-scope for this lane (Lane 5) — left untouched |

## Remaining Gaps

| Gap | Owner | Reason |
|-----|-------|--------|
| `service.ts` still imports Prisma via `resolvePrismaUser` | Future cleanup lane | Function is exported but no longer called from the cutover routes; leaving in place avoids ripping the bridge while other (older) callers might still exist outside this lane's scope |
| `MigrationReceipt` UI on `/profile` reads `migrationAcknowledgedAt` from `/api/me/bootstrap` | Lane 2 (UX) | Column lives on Prisma `User`, not Supabase `profiles`; route returns `null` to keep the surface from breaking. Lane 2 should migrate that UI to read `needs_onboarding` instead |
| Trades close-out on non-sim journal rows leaves `realized_pnl` null | Out of scope | Only `paper_trade` rows have an entry price + side + qty in the encoded note. Free-form journal rows lack the data to compute PnL — recording close metadata is honest |
| R-multiple in `/api/journal/edge` uses position cost as 1R | Future lane | No per-trade `risk_amount` column exists yet. Same-user expectancy is internally consistent; cross-user comparison would need explicit risk |

## Master-Log Row

| Wave | Lane | Status | Date | Notes |
|------|------|--------|------|-------|
| wave-build-candle-real | 03 | COMPLETE | 2026-04-29 | Six 503 stubs killed; migration adds onboarding gate, preferences JSONB, P&L close-out columns, watchlist reason — all RLS-verified |
