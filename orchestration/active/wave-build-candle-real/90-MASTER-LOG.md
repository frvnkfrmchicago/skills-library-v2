# Master Log — wave-build-candle-real

| Wave | Lane | Status | Date | Notes |
|------|------|--------|------|-------|
| wave-build-candle-real | 01 — Quality & Truth | ✅ Accepted | 2026-04-29 | Anti-mock grep clean. 13 files touched, 2 deleted (calendar/manual route, StrategyBuilderPlaceholder). Honest empty states added on macro-speakers + ActiveCandlesRow. Citation scaffold (Step 1.6) was already implemented in voice-linter.ts — Lane 4 can extend directly. 3 documented gaps: sparkline mock fallback, weather var naming, dev demo surfaces (latter two safe per labeled-placeholder rule). |
| wave-build-candle-real | 02 — Engaging UX | ✅ Accepted | 2026-04-29 | 9 files modified + 7 new. **Step 2.1** `OnboardingMiniFlow` (3-question single screen, no tour, no confetti) → POSTs watchlist×3 + preferences + rules → redirects to `/inspector/<first>`. **Step 2.2** circuit-breaker (`circuit-breaker.ts` + `circuit-breaker-server.ts` + `useCircuitBreaker` hook + `/api/me/circuit-breaker` route) — TradeLogger Save button disables when daily-loss floor hit, deep-links to Decompressor `?activity=breathing&duration=60`; Decompressor adds breathing activity with `markSessionReset()` on completion (30-min trade unlock). **Step 2.3** mandatory `reason` (4+ chars) on watchlist add across ConvictionBoard + WatchlistGlanceCard + HomeClient; `auto-archive.ts` helper for 30-day stale; `RecoverTray` collapsed by default. **Step 2.4** PrepCard sticky bottom-right — renders `null` when no prep OR alert outside 1% (no nag); one CTA "Open trade ticket". **Step 2.5** Inspector reads `?from=alert&alertId=<id>`, expands PrepCard, PATCHes `lastViewedAt`. **Vocab cleanup:** renamed `litOpen` → `buildOpen` (banned-vocab). **Defensive coding:** every Lane 3 column dep handled with `schema-not-ready` fallback. STOP-gate clean: no confetti, no tour, no fire/lit/spark/ignite copy. |
| wave-build-candle-real | 03 — Persistence Cutover | ✅ Accepted | 2026-04-29 | All 6 of 6 503 stubs killed (paper-candles ×4, bootstrap, preferences). Migration `20260429065054_persistence_cutover.sql`: profiles +needs_onboarding/+preferences; trades +closed_at/+close_price/+realized_pnl +idx; watchlist_items +reason/+last_interaction_at/+archived_at. New `/api/journal/edge` Van Tharp expectancy roll-up. `/api/trades` PATCH derives `realized_pnl` **server-side** (client cannot poison roll-up). `/api/watchlist` rejects empty `reason` with 400. `closeCandle` recomputes `paper_quality_tier`. RLS STOP-gate verified — every table uses `auth.uid() = user_id`. **Coordination notes:** corrected Lane 2's `last_interacted_at` → `last_interaction_at`. `MigrationReceipt` UI reads `migrationAcknowledgedAt` from Prisma `User` — Lane 2 should migrate to read `needs_onboarding` from `profiles`. `service.ts` still imports Prisma (no callers from cutover routes). |
| wave-build-candle-real | 04 — AI Citation Layer | ✅ Accepted | 2026-04-29 | 5 files modified + 3 new. `enforceCitations` body written: tokenizes numeric claims, matches tool-call values, tags backed numbers `[^id]`, strips unsourced to `[unsourced]`. Anthropic tool-use loop (5 rounds max), 5-tool registry: get_quote/get_candles/get_news/get_earnings/get_company_info. Gemini fallback also passes through enforcement (any number stripped — fallback runs no tools). AuraPanel renders citation badges with hover popover (source/value/fetched_at). Chart-analysis snaps every support/resistance to real candle (1% tolerance); unsnapable claims dropped. Lane 4 wrote Lane 1's `src/lib/compliance/types.ts` scaffold since Lane 1 hadn't shipped at start. 3 fixture prompts documented (NVDA earnings, AAPL price, TSLA P/E). No model output bypasses voice-linter (verified via grep). |
| wave-build-candle-real | 05 — Realtime Delivery | ✅ Accepted | 2026-04-29 | 11 files (4 modified, 7 new). Edge Function `check-alerts` 60s cron + `archive-stale-watchlist` daily. `finnhub-ws.ts` stub fully implemented (per-tab pool, 1s→30s exp backoff). Web Push via VAPID (payload cap 3.5KB). `AlertSubscribeBanner` + `/api/push/subscribe`. Deep-link `/inspector/<T>?from=alert&alertId=<id>` ready for Lane 2 PrepCard. **Schema exception:** `notifications` + `push_subscriptions` + `watchlist_items.archived_at`/`last_interaction_at` migration written here — flagged for Lane 3 RLS verify. Live pill gated on `wsConnected`. Free-tier clean: no sendgrid/twilio/polygon.io/pusher. 5 manual deploy steps documented for Frank (VAPID gen, supabase secrets, env vars, fn deploy, cron.schedule SQL). |

## Status Legend
- 🟡 Dispatched — agent assigned, not yet rewritten brief
- ✅ Accepted — agent rewrote brief, lead reviewing
- ✅ Accepted — lead approved, row finalized
- 🔴 Rejected — needs rework
- ⚫ Archived — moved to `completed/` or `archive/`

## Wave-Level Notes
- All five lanes spawned 2026-04-29 in parallel, Opus 4.7 inherited.
- Free-tier-only commitment in force.
- No-build/no-test rule in force.

## Lead-Review: Cross-Lane Coordination Gaps (tail-patches)

Two real gaps at lane seams. Each lane met its individual brief; these emerge only at integration. Both are 1–2 line fixes — open as a separate `wave-build-candle-real-tail` packet OR resolve inline.

| # | Gap | Surface | Fix |
|---|-----|---------|-----|
| T1 | `price_alerts.last_viewed_at` column missing | Lane 02 PATCHes it from Inspector when `?from=alert&alertId=<id>` arrives; Lane 03's migration did not add it | One ALTER: `ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS last_viewed_at timestamptz;` |
| T2 | `/api/rules` route missing | Lane 02 OnboardingMiniFlow POSTs to `/api/rules`; route file does not exist (the `rules` table itself exists at supabase-schema.sql:353) | New file `src/app/api/rules/route.ts` mirroring `/api/notes` pattern: POST inserts `{ user_id, text, triggers }`, GET lists |

## Lead-Review: Acknowledged Cleanup (non-blocking)

| # | Item | Owner |
|---|------|-------|
| C1 | `service.ts` still imports Prisma via `resolvePrismaUser` — no callers from the 6 cutover routes | future cleanup lane |
| C2 | `MigrationReceipt` UI on `/profile` reads `migrationAcknowledgedAt` — Lane 03 flagged for migration to `needs_onboarding` | future small UX patch |
| C3 | `archive-stale-watchlist` Edge Function (Lane 5) duplicates `auto-archive.ts` helper logic (Lane 2) — Edge Functions can't import from `src/lib`. Both honor 30-day rule. Acceptable. | none |
| C4 | Sparkline `mockSeriesFor` random-walk fallback (Lane 1 documented) | broader refactor lane |

## Manual Deploy Steps (per no-deploys rule)

These run when Frank chooses to ship:
1. Apply migrations: `supabase db push` (after merging T1 fix)
2. `npx web-push generate-vapid-keys --json` locally
3. `supabase secrets set VAPID_PUBLIC_KEY=… VAPID_PRIVATE_KEY=… VAPID_SUBJECT=mailto:flawrence.d@gmail.com`
4. `.env.local` + Vercel env: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_FINNHUB_API_KEY`
5. `supabase functions deploy check-alerts archive-stale-watchlist`
6. `cron.schedule()` SQL per each `config.toml`
