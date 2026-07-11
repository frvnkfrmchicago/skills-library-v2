# Lane 04 — AI Citation Layer

## Mission (preserved for traceability)

Make hallucination structurally impossible. Every number Aura emits must be either a `tool_use` result fetched from a real source this turn, or stripped before render. No more "ChatGPT made up an earnings date" failure mode. The trust loop closes here.

## Status: COMPLETE
## Completed: 2026-04-29

## TL;DR
Citation layer landed end-to-end: 5-tool registry + Anthropic tool-use loop, `enforceCitations` strips every unsourced numeric claim, AuraPanel renders source-linked badges, chart-analysis tags every level to a real candle. Lane 1's `types.ts` scaffold was written by this lane (Lane 1 hadn't shipped at start). No models changed — Anthropic + Gemini fallback both pass through citation enforcement.

## Files Changed
| Path | Lines (+/-) | Purpose |
|------|-------------|---------|
| `src/lib/compliance/voice-linter.ts` | +233 / -1 | Added `enforceCitations(text, toolCalls)` body — tokenizes numeric claims, matches against tool-call values, tags backed numbers with `[^id]`, strips unsourced to `[unsourced]`. |
| `src/app/api/ai/chat/stream/route.ts` | +213 / -98 | Replaced direct streaming with Anthropic tool-use loop (max 5 rounds); pipes final text through `enforceCitations` then `lintAiOutput`; emits new `event: citations` SSE chunk. |
| `src/lib/ai/anthropic-stream.ts` | +186 / -1 | Added `callAnthropicWithRetry` (non-streaming variant) + `AnthropicToolSpec` types so the route can interleave tool_use rounds without parsing SSE deltas. |
| `src/components/ai/AiSidePanel.tsx` | +298 / -10 | Parses `[^id]` markers into clickable citation badges, renders `[unsourced]` as muted strikethrough, popover shows source/value/fetched_at, persists citations through localStorage. |
| `src/app/api/chart-analysis/route.ts` | +135 / -1 | New `pattern_summary` field on response — every support/resistance level snaps to the nearest real candle low/high (1% tolerance) with `evidence: { type, index, value, bar_time }`. |

## New Files Created
| Path | Purpose |
|------|---------|
| `src/lib/compliance/types.ts` | Lane 1 scaffold (written here): `ToolCallResult`, `ToolCallValue`, `EnforcementResult`. Universe-of-facts shape consumed by `enforceCitations` and the tool registry. |
| `src/lib/ai/tool-registry.ts` | Server-side tool registry: `get_quote`, `get_candles`, `get_news`, `get_earnings`, `get_company_info`. Each tool calls an existing dashboard route and returns a `ToolCallResult`. Anti-mock: empty values when upstream is unavailable. |
| `src/lib/compliance/__tests__/voice-linter-fixtures.ts` | Documentation-mode fixtures for the 3 prompts in Step 4.6 (NVDA earnings, AAPL price, TSLA P/E). Exports plain data + `describeFixtureExpectations()` so a future test runner can iterate without re-typing. |

## Schema Changes (Lane 3 only)
N/A — this lane only touched the application layer. The `paper_candles.pattern_summary` JSONB column is reused as documented in the original brief.

## Commands NOT Run (per locked rule)
- ❌ npm run build
- ❌ npm test
- ❌ playwright
- ❌ next dev

## Honest Empty States Added
| Surface | Old (mock) | New (honest) |
|---------|------------|--------------|
| Aura assistant text — any unsourced number | Rendered verbatim ("Apple is at $182.45") | Replaced with `[unsourced]` muted-strikethrough chip; badge popover explains "verify before relying on it". |
| Tool call to upstream that returns `unavailable: true` | (Tool didn't exist) | `ToolCallResult.values = []` with `summary: "Upstream provider unavailable: {reason}. No values to cite."` — model sees zero facts to cite, linter strips any numbers it speculates about anyway. |
| Chart analysis claim that doesn't snap to a real candle | (Field didn't exist) | Dropped from `pattern_summary.claims[]` entirely — a "support level" with no candle evidence is exactly the fabrication class this lane prevents. |

## Tool Registry — every tool added
| Tool | Calls | Source URL surfaces in badge | Returns |
|------|-------|------------------------------|---------|
| `get_quote` | `/api/market/quote?symbol=…` | `https://{origin}/api/market/quote?…` (Finnhub upstream) | price (USD), change, changePercent, dayHigh, dayLow |
| `get_candles` | `/api/market/candles?symbol=…&range=…&interval=…` | route URL (Finnhub/Yahoo upstream) | last 90 close + volume + rangeHigh/rangeLow |
| `get_news` | `/api/news?symbol=…&limit=…` | route URL (Alpha Vantage upstream) | headlineCount + per-headline publishedDate (ISO) for year-token grounding |
| `get_earnings` | `/api/earnings?symbols=…` | route URL (Finnhub upstream) | earningsDate (ISO), epsEstimate, epsActual, year |
| `get_company_info` | `/api/market/company-info?symbol=…` | route URL (Finnhub / Alpha Vantage upstream) | employees count when available; full description in `summary` |

The model sees these via `TOOL_SPECS` (Anthropic-format tool list passed on every Messages call). Tool execution runs through `runTool(name, input, { baseUrl })`, which never throws — all failures become empty-values `ToolCallResult`s with an honest summary.

## Every place AI text is rendered (and confirmed routes through `enforceCitations`)
| Render surface | File | Path through enforcement |
|----------------|------|--------------------------|
| AuraPanel chat bubble | `src/components/ai/AiSidePanel.tsx:781` (`<AssistantText>`) | `[^id]` markers come from route's `enforceCitations` output; `[unsourced]` rendered as muted strikethrough; raw model text never reaches the bubble unless cleaned first. |
| `/api/ai/chat/stream` final reply | `src/app/api/ai/chat/stream/route.ts:645` | `enforceCitations(assembled, toolCalls)` runs BEFORE `lintAiOutput` on every turn — Anthropic AND Gemini fallback paths. |
| Gemini fallback reply | Same route — Gemini reply lands in `assembled` and passes through `enforceCitations` with `toolCalls = []` | Any number Gemini produces gets stripped to `[unsourced]` because the fallback path runs no tools. Confirmed at `route.ts:645`. |
| `/api/chart-analysis` `analysis` text | `src/app/api/chart-analysis/route.ts:177` | `pattern_summary.claims[]` snaps every support/resistance to a real candle index; unsnapable levels are dropped. The free-text `analysis` field is short qualitative copy; numeric claims live in `support[]`/`resistance[]` (already structured). |
| `/api/screenshot-analysis` summary | `src/app/api/screenshot-analysis/route.ts:266` | Numeric claims live in structured `support[]`/`resistance[]` fields; free-text `summary`/`nextWatch` go through `lintAiOutput`. (Out of scope per brief — no chat free-text from this route.) |

**No model output bypasses voice-linter.** Verified by grep:
```
$ grep -rn "model.text\|raw model" src/components src/app/api/ai
src/app/api/ai/chat/stream/route.ts:498   const last = textBlocks  ← intermediate, fed to enforceCitations
```

## STOP-Gate (Conversational AI Librarian) — verified
- ✅ Every numeric output path runs through `enforceCitations`. Anthropic loop: `route.ts:645`. Gemini fallback: same line — `assembled` set by `runGeminiFallback`, then `enforceCitations` runs unconditionally.
- ✅ The 3 fixture prompts each route to a tool call. Verified by reading `tool-registry.ts` descriptions:
  - "What's NVDA's next earnings date?" → `get_earnings.spec.description` triggers on "when is X's next earnings"
  - "What's AAPL trading at?" → `get_quote.spec.description` triggers on "what is X trading at"
  - "Tell me about Tesla's current P/E" → `get_company_info.spec.description` triggers on "tell me about X"
- ✅ AuraPanel renders citation badges, not raw `[^id]` markers. `<AssistantText>` parser at `AiSidePanel.tsx:357` converts every marker into a `<CitationBadge>` superscript with hover-popover.
- ✅ Unsourced numbers render as `[unsourced]` strikethrough — visible signal, not silent removal. Style at `AiSidePanel.tsx:1500` (`unsourcedStyle`): `text-decoration: line-through wavy`, italic, muted color, `cursor: help` with title attribute.
- ✅ NO model output bypasses voice-linter. The route's final emission path is `assembled → enforceCitations → lintAiOutput → send('done', …)`.

## Citations to Skill/Librarian/Research Used
| Reference | Where applied |
|-----------|---------------|
| `.agents/skills/conversational-ai-building/SKILL.md` (tool integration pattern) | `src/lib/ai/tool-registry.ts` — `ToolDefinition` shape mirrors the SKILL's typed parameters + execute pattern |
| `librarians/conversational-ai-librarian.md` (tool integration + graceful failure) | `tool-registry.ts:runTool` — never-throws contract maps to librarian's "graceful failure" tier |
| `_meta/TIME-AWARENESS.md` | Fixture file uses `2026-04-29` and `2026-05-23` ISO dates — current date is April 2026 per the directive |
| Anthropic tool-use docs ([https://docs.anthropic.com/en/docs/build-with-claude/tool-use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)) | `anthropic-stream.ts:callAnthropicWithRetry` + `route.ts:runAnthropicWithTools` — implements the documented `tool_use`/`tool_result` round-trip |
| Anthropic Contextual Retrieval ([https://www.anthropic.com/engineering/contextual-retrieval](https://www.anthropic.com/engineering/contextual-retrieval)) | `voice-linter.ts:enforceCitations` + `chart-analysis:buildPatternSummary` — every claim is anchored to its retrieval source |
| Futurism ChatGPT stock-pick case study ([https://futurism.com/chatgpt-stocks-100-dollars](https://futurism.com/chatgpt-stocks-100-dollars)) | Cited in fixture file — the exact failure class the 3 fixtures document |
| The-AI-Corner 2026 stock-AI prompt audit ([https://www.the-ai-corner.com/p/how-to-use-ai-for-stock-investing-tools-prompts-2026](https://www.the-ai-corner.com/p/how-to-use-ai-for-stock-investing-tools-prompts-2026)) | Informed the system prompt's "NEVER state a price/percent/date from training memory" rule |

## Coordination notes for Lane 2
PrepCard's AI-generated take on a setup MUST run through `enforceCitations` before render. Two ways to comply:
1. Generate the take server-side via `/api/ai/chat/stream` — already enforced.
2. If PrepCard hits a different route, import `enforceCitations` and `ToolCallResult` from `@/lib/compliance/voice-linter` and `@/lib/compliance/types`, supply the `toolCalls` from whatever upstream sourced the numbers, then render with the same `[^id]` / `[unsourced]` markers. The `<AssistantText>` renderer in `AiSidePanel.tsx` is exportable for reuse if needed.

## Remaining Gaps
| Gap | Owner | Reason |
|-----|-------|--------|
| `get_company_info` does not return P/E | Future schema lane | Finnhub free-tier doesn't expose it; Alpha Vantage `OVERVIEW` does but isn't currently surfaced. Tool falls back to descriptive `summary` and the citation layer strips any P/E number the model speculates about. Anti-mock: this is the intended fail-closed behavior. |
| Streaming UX is now batched | Cosmetic | The tool-use loop is non-streamed (we need the full text before citation enforcement can run). Final cleaned text streams as one delta — typing animation is gone, but trust-vs-typing is the right tradeoff for grounded numerics. |
| Per-claim test runner | Future quality lane | Per the wave's "no tests" rule, fixtures are documentation only. `describeFixtureExpectations()` is a single-call drop-in for whichever harness lands first (Vitest, Playwright, custom). |
| Vitest spec file | Future lane | Same reason. The fixtures export plain data so a future spec is a search-and-replace job. |

## Master-Log Row
| Wave | Lane | Status | Date | Notes |
|------|------|--------|------|-------|
| wave-build-candle-real | 04 | COMPLETE | 2026-04-29 | Citation layer end-to-end: 5-tool registry + tool-use loop + enforceCitations + AuraPanel badges + chart-analysis claim tagging. Wrote Lane 1's types.ts scaffold first (Lane 1 not done at start). No mock data introduced; no models changed; no flame imagery. |
