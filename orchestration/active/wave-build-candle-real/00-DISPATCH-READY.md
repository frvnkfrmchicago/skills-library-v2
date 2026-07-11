# wave-build-candle-real — Dispatch Ready

**Started:** 2026-04-29
**Lead:** Frank Lawrence Jr.
**Repo under work:** `/Users/franklawrencejr./AI/trading-intel-dashboard`
**Wave packet location:** `~/Downloads/skills-library-v2 2/orchestration/active/wave-build-candle-real/`

## Mission

Make Build-a-Candle actually build. Six 503 stubs, two mock-data violations, one alert loop that never fires, one P&L loop that never closes, one AI surface that hallucinates. Five lanes, parallel, same-day, free-tier only.

## Locked Constraints (from user memory)

- **Opus 4.7 only** — every spawned agent inherits Opus 4.7. No Sonnet, no Haiku.
- **No mock, no demo data** — Anti-Mock Librarian governs Lane 1.
- **No invented brand names** — locked: PaperView / Reporter / Inspector / Simulator / Educator / Decompressor / Candle$tore.
- **No flame / fire / spark imagery** — candles are BUILT, never lit.
- **Build a Candle vocabulary** — prep (research / paper-trade / alerts / calc) is how a candle is built.
- **Zero budget** — Supabase free tier (500K Edge Function invocations/mo), browser-native Web Push, Finnhub free WebSocket, no SendGrid/Twilio/Polygon paid.
- **No builds, no tests, no Playwright** — code only by default. Do not run `npm run build`, `npm test`, `playwright`, or `next dev`.
- **All waves land same day** — no v1/v2 phasing.

## Wave Structure

| Lane | Agent | Theme | Status |
|------|-------|-------|--------|
| 01 | Quality & Truth | Mock purge + RAG citation gate | 🟡 Ready |
| 02 | Engaging UX | First-run flow + circuit-breaker + watchlist conviction | 🟡 Ready |
| 03 | Persistence Cutover | Six 503 stubs → Supabase + P&L columns | 🟡 Ready |
| 04 | AI Citation Layer | voice-linter numeric guard + tool_use grounding | 🟡 Ready |
| 05 | Realtime Delivery | Edge cron alerts + Web Push + Finnhub WS | 🟡 Ready |

## Reference Material

Every agent MUST read before starting:

1. Their assigned lane brief: `0X-AGENTX-*.md` in this folder
2. The evidence contract: `99-EVIDENCE-CONTRACT.md` in this folder
3. Their assigned skill (gerund-form): `~/Downloads/skills-library-v2 2/.agents/skills/<skill>/SKILL.md`
4. Their assigned librarian: `~/Downloads/skills-library-v2 2/librarians/<librarian>.md`
5. `_meta/TIME-AWARENESS.md` — March 2026 baseline (Next.js 16.1.1, React 19.0.1, Node 22 LTS)

## Completion Rule (from orchestration-librarian)

A lane is **NOT done** because an agent says "done." A lane is done when:

1. The assigned brief file itself has been rewritten with completion evidence (per `99-EVIDENCE-CONTRACT.md`)
2. The lead has reviewed the rewritten file
3. The lead has updated `90-MASTER-LOG.md` from the lane file

## Coordination

- All five lanes run in parallel — no sequential dependencies that block parallelism.
- Where Lane 2 references work in Lane 3 (e.g., bootstrap UX needs the cutover route), Lane 2 should code defensively against the assumed shape and Lane 3 deliver that shape.
- Schema changes go through Lane 3 only. No other lane writes migrations.
- Voice-linter changes go through Lane 4 only. No other lane edits `src/lib/compliance/`.

## Rollback

Every lane keeps its diff small enough to revert with one `git revert <sha>`. No cross-lane file conflicts expected — if any arise, lead resolves before merge.
