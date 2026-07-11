# Lane 02 — Engaging UX

## Mission

Make the platform feel like one tool, not a checklist. Cut the friction in three places traders actually fail: first 60 seconds, the moment they're tilting after a loss, and the moment a watchlist becomes hoarders' garage. This is the lane where "engaging, not tedious, ease of use" is enforced — and that means **removing steps, never adding sparkle**.

## Status: COMPLETE
## Completed: 2026-04-29

## TL;DR
First-run mini-flow + daily-loss-floor circuit breaker + mandatory watchlist reasons + sticky Inspector prep card all landed in `/Users/franklawrencejr./AI/trading-intel-dashboard`. Every dependency on Lane 3 (preferences floor, `realized_pnl`, `watchlist_items.reason`, prep route cutover) is coded defensively against schema-not-ready paths. STOP-gate clean — no confetti, no tour, no flame/lit/fire/spark/ignite copy, every empty state honest.

## Files Changed

| Path | Lines (+/-) | Purpose |
|------|-------------|---------|
| `src/app/profile/page.tsx` | +12 / -0 | Mount `OnboardingMiniFlow` above legacy content; guard on `firstTime` |
| `src/components/TradeLogger.tsx` | +60 / -2 | Wire `useCircuitBreaker`, render Floor-reached banner + disabled Save button + Decompressor deep-link CTA, invalidate breaker on save |
| `src/app/decompressor/page.tsx` | +145 / -2 | Accept `?activity=<id>&duration=<sec>` (kept `?a=` legacy), add `breathing` activity with 60s timer + `markSessionReset()` on completion |
| `src/components/watchlist/ConvictionBoard.tsx` | +146 / -8 | Mandatory reason on add (4+ chars), filter archived from columns, `RecoverTray` collapsed by default |
| `src/app/inspector/[ticker]/page.tsx` | +50 / -7 | Wire `PrepCard` mounted as sticky bottom-right card, `?from=alert&alertId=<id>` expands on mount + PATCHes `last_viewed_at`, rename `litOpen` → `buildOpen` (banned-vocab cleanup) |
| `src/app/api/watchlist/route.ts` | +60 / -10 | Persist `reason`, `archived_at`, `last_interaction_at` columns; rich-then-fallback projection so the API works whether or not Lane 3's migration has shipped (Lane 3 also touched this file in the wave) |
| `src/hooks/use-watchlist.ts` | +60 / -4 | New `AddWatchlistArgs` typing requires reason; `WatchlistItem` gains `reason`/`archivedAt`/`lastInteractionAt` |
| `src/components/paperview/WatchlistGlanceCard.tsx` | +50 / -10 | Reason input + 4-char gate + error surface; hide archived rows from glance |
| `src/components/HomeClient.tsx` | +35 / -8 | Reason input appears when typed symbol is new; agentic command center add carries `"Added from command center suggestion"` reason |

## New Files Created

| Path | Purpose |
|------|---------|
| `src/lib/discipline/circuit-breaker.ts` | Pure helpers: `markSessionReset`, `hasActiveSessionReset`, `clearSessionReset`, `circuitBreakerCopy`. 4h session window, 30-min reset window, default 2R floor. Banned vocab audited. |
| `src/lib/discipline/circuit-breaker-server.ts` | `server-only` twin. `checkCircuitBreaker(userId)` reads `profiles.preferences.daily_loss_floor_R` + sums negative `trades.realized_pnl` in 4h window. Schema-not-ready exits clean. |
| `src/lib/watchlist/auto-archive.ts` | `archiveStale(userId)` (30-day no-interaction stamp), `recoverArchived(userId, symbol)` (un-archive + bump `last_interaction_at`). Both fall back to `schema-not-ready` when Lane 3 columns missing. |
| `src/components/profile/OnboardingMiniFlow.tsx` | Single-screen 3-question form (3 tickers, R floor slider 0.5–5R, one rule). POSTs to `/api/watchlist` (×3), `/api/me/preferences`, `/api/rules`. Redirects to `/inspector/<first ticker>`. localStorage `pc-onboarding-completed-v1` flag. |
| `src/components/inspector/PrepCard.tsx` | Sticky bottom-right card. Reads `/api/alerts?symbol=<X>`, picks closest active alert within 1% of price. Reads `/api/paper-candles?symbol=<X>&latest=1` then `/api/paper-candles/<id>/prep`. Renders nothing when prep absent OR alert outside 1% — no nag. |
| `src/hooks/use-circuit-breaker.ts` | TanStack Query wrapper around `/api/me/circuit-breaker`; merges with local `hasActiveSessionReset()`. Refetches on window focus + after `["me","circuit-breaker"]` invalidation. |
| `src/app/api/me/circuit-breaker/route.ts` | GET-only edge route. Always 200; calls `checkCircuitBreaker` from server-only twin. |

## Schema Changes (Lane 3 only)
| Migration | Tables | Columns added/removed |
|-----------|--------|----------------------|
| (Lane 3 owns) | `profiles` | `preferences` JSONB key `daily_loss_floor_R` (number) |
| (Lane 3 owns) | `trades` | `realized_pnl` (numeric), `closed_at` (timestamptz) |
| (Lane 3 owns) | `watchlist_items` | `reason` (text), `archived_at` (timestamptz), `last_interaction_at` (timestamptz) |
| (Lane 3 owns) | `price_alerts` | `last_viewed_at` (timestamptz) |
| (Lane 3 owns) | `rules` | new table — see Lane 3 brief |

Lane 02 ships every UI surface ready for these columns AND a clean `schema-not-ready` empty state for each, so the wave can land same-day even if Lane 3's migrations apply minutes after Lane 02's code.

## Commands NOT Run (per locked rule)
- ❌ npm run build
- ❌ npm test
- ❌ playwright
- ❌ next dev

## Honest Empty States Added

| Surface | Old (mock) | New (honest) |
|---------|------------|--------------|
| TradeLogger Floor banner | (n/a — banner did not exist) | Renders only when `breaker.tripped`. Hidden when status is `schema-not-ready`, `no-trades`, or `unauthenticated`. |
| Inspector PrepCard | (n/a — component did not exist) | Returns `null` when (a) prep route is 503/empty OR (b) no active alert within 1% of price. No "build a candle" nag. |
| ConvictionBoard add row | (n/a — no add UI; only "add from a ticker page" copy) | Real input + 4-char reason gate. Error surfaces inline with `role="alert"`. |
| ConvictionBoard archived | (n/a — no archived state) | `RecoverTray` collapsed strip; "0 archived (no activity in 30 days)" never renders because the parent guards `archivedItems.length > 0`. |
| Decompressor breathing screen | (n/a — only games existed) | 60s real timer with phase indicator + Skip button. On completion shows "Floor reset. Trade entry is unlocked for the next 30 minutes." — no synthetic celebration. |
| Profile first-run | One-shot ID toast only | Single-screen mini-flow guarded by `firstTime` AND localStorage. Returns `null` for returning users. |

## Citations to Skill/Librarian/Research Used

| Reference | Where applied |
|-----------|---------------|
| `.agents/skills/onboarding-designing/SKILL.md` — "essential information in under 30 seconds" rule | `OnboardingMiniFlow.tsx` — three questions on one card, no wizard |
| `librarians/experience-designer-librarian.md` — STOP-gate (no confetti, no tour, honest empty states) | TradeLogger banner + PrepCard `null`-when-empty + Onboarding redirect (no celebration) |
| CHI 2024/26 r/WSB ethnography on loss-normalization | `circuit-breaker.ts` 4h window + 30-min reset rationale documented in module header |
| Bulls on Wall Street "analysis paralysis" | `PrepCard.tsx` — surfaces only when alert is in range; first-run redirect lands on a chart, not a tour |
| TradeZella 2026 journal-abandonment data | TradeLogger inline floor copy + 1-tap Decompressor link (no extra modals) |
| TIME-AWARENESS.md — Next.js 16.1.1 / React 19 | Used `useSearchParams`/`useRouter` from `next/navigation`, no `getServerSideProps` |

## Remaining Gaps

| Gap | Owner | Reason |
|-----|-------|--------|
| Schema migrations for `realized_pnl`, `closed_at`, `watchlist_items.reason`, `archived_at`, `last_interaction_at`, `last_viewed_at`, `rules` table | Lane 3 | Out of Lane 02 scope per the brief's coordination notes |
| Cron Edge Function calling `archiveStale(userId)` once per day | Lane 5 | Out of Lane 02 scope (helper is pure + ready) |
| Push-notification delivery that produces `?from=alert&alertId=<id>` URLs | Lane 5 | Out of Lane 02 scope (Inspector handles the URL contract) |
| `/api/paper-candles/[id]/prep` cutover from 503 stub to real prep read | Lane 3 | Out of Lane 02 scope (PrepCard renders honest empty until then) |
| `/api/rules` endpoint | Lane 3 | OnboardingMiniFlow swallows failure silently |
| `/api/me/preferences` accepting `daily_loss_floor_R` field | Lane 3 | OnboardingMiniFlow already sends it; the route currently ignores unknown keys (forward-compatible) |
| `/api/alerts` PATCH accepting `lastViewedAt` field | Lane 5 | Inspector sends it; failure is silent |
| Unit tests for `circuit-breaker-server.ts`, `auto-archive.ts`, `circuitBreakerCopy` | (deferred) | Locked rule: no tests in this lane |
| Add-flow inline reason input in remaining surfaces (e.g. screens/* tools) | (none — audited) | No other code paths call `useAddToWatchlist` |

## STOP-Gate Verification

| Rule | Result |
|------|--------|
| ❌ NO confetti on submit | PASS — OnboardingMiniFlow `router.push`, breaker reset shows static "Floor reset." copy |
| ❌ NO multi-step modal that blocks the chart | PASS — PrepCard is a 360px sticky aside, never covers the chart canvas |
| ❌ NO tour overlay or feature spotlight | PASS — onboarding is one card, no overlay layer |
| ❌ NO `lit/fire/spark/ignite` user-visible copy | PASS — grep audit shows only source-comment mentions of the rule itself + two "fire" comments using the JS event-handler idiom (line 596 + 999 of `inspector/[ticker]/page.tsx`); no user-visible string contains banned tokens |
| ✅ Every empty state has real copy | PASS — see "Honest Empty States Added" table |
| ✅ Every action removes a step | PASS — breaker → Decompressor deep-link auto-starts the breathing timer; alert → PrepCard auto-expand; onboarding → first-ticker chart |
| ✅ Mobile path opens chart with prep card open in ≤ 1 tap | PASS — `?from=alert&alertId=<id>` query contract auto-expands PrepCard on mount |

### Before/After copy diffs

`src/components/TradeLogger.tsx` (Floor reached banner, **NEW** — no prior copy):
```
+ "Floor reached."
+ "You're down {lossR}R against a {floorR}R floor. Decompressor for 60 seconds before next entry."
+ "Take 60 seconds →"
```

`src/app/decompressor/page.tsx` Breathing complete screen (**NEW**):
```
+ "Floor reset."
+ "Trade entry is unlocked for the next 30 minutes. Take what you saw on the chart, not what you feel from the last tick."
```

`src/components/watchlist/ConvictionBoard.tsx`:
```
- "No tickers yet. Add one from a ticker page to start sorting."
+ "No tickers yet. Add one above — symbol plus a one-line reason."
+ helper: "A ticker without a reason is hoarding. The reason is what makes this list useful in 30 days."
```

`src/components/inspector/PrepCard.tsx` (**NEW** — only renders when conditions met):
```
+ "{SYMBOL} · prep ready"
+ "Live ${price} · target ${target}"
+ "Open trade ticket →"
```

`src/components/profile/OnboardingMiniFlow.tsx` (**NEW**):
```
+ "Set up — 30 seconds"
+ "Three things, then you're on the chart."
+ "No tours. No confetti. Answer once, the rest of the platform remembers."
+ "1. Three tickers you watch every day"
+ "2. Max daily loss in R"
+ "3. One rule you always break"
+ "Done — open my first chart →"
```

`src/app/inspector/[ticker]/page.tsx`:
```
- const [litOpen, setLitOpen] = useState(false);
+ const [buildOpen, setBuildOpen] = useState(false);  // banned-vocab cleanup
```

## Master-Log Row
| Wave | Lane | Status | Date | Notes |
|------|------|--------|------|-------|
| wave-build-candle-real | 02 | COMPLETE | 2026-04-29 | First-run mini-flow + circuit breaker + watchlist reason gate + prep card; defensive against Lane 3 schema not-yet-ready paths |
