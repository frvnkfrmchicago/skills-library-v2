# AP-PLATFORM-2026-05 — Dispatch

## Mission
Close the 5 functional gaps that block AP-LEARN from real-world launch:
profile schema extension (services_interest / onboarding_step / email opt-in),
mobile design hardening (44pt audit + bottom tabs + carousel), email capture
+ drip pipelines, server-side analytics with drift score, smart engagement
layer, and the deploy-time fixes (CSP for n8n + build verify).

## Wave Structure (one wave, two batches)

### First Batch (parallel — disjoint files)
| # | Title | Brief |
|---|---|---|
| 1 | Profile Schema Agent 1 | `01-AGENT1-PROFILE-SCHEMA.md` |
| 2 | Mobile Polish Agent 2 | `02-AGENT2-MOBILE-POLISH.md` |
| 3 | Email & Drip Agent 3 | `03-AGENT3-EMAIL-DRIP.md` |
| 4 | Analytics Spine Agent 4 | `04-AGENT4-ANALYTICS-SPINE.md` |

### Second Batch (after First Batch closes)
| # | Title | Brief |
|---|---|---|
| 5 | Engagement Layer Agent 5 | `05-AGENT5-ENGAGEMENT-LAYER.md` |
| 6 | Ship Agent 6 | `06-AGENT6-SHIP.md` |

## Wave % Cadence
```
Agents 1-4 land → 70% wave done
Agent 5 lands  → 90% wave done
Agent 6 lands  → 100% wave done
```

## Skills + Librarians Cited

Each lane brief carries its own ≥1 SKILL + ≥1 LIBRARIAN + ≥1 2026 URL per
the orchestration librarian's invocation mandate. See lane briefs.

## Existing Context (per Pre-Plan Research Protocol)

| Surface | Already shipped — do NOT recreate |
|---|---|
| Architecture | Vite 8 + React 19 + Supabase + Cloudflare Pages, Bun primary |
| Edge Functions | `inquiry-webhook`, `generate-module`, `module-tutor`, `_shared/llm.ts` |
| Components | `WelcomeModal`, `OnboardingChecklist`, `StreakCard`, `ModuleCard`, module reader, tutor panel |
| Data layer | `learnStore.ts` bypass-or-Supabase router, `analytics.ts` localStorage ring, all AP-LEARN migrations |
| Configuration | `_headers` with CSP (missing n8n forwarder), `.env.example`, `n8n/workflows/{inquiry-router,engagement-nudges,news-to-module}.json` |

## Genuine Gaps (only build these)

1. **Profile columns missing** — WelcomeModal writes `services_interest` + `onboarding_step` but schema doesn't have them; silent fail
2. **Touch targets** — Modules.css `.modules-admin__act` (32px) + ModuleEdit.css `.module-edit__field input` (40px) violate 44pt iOS / 48dp Android
3. **No newsletter capture** — anywhere
4. **No drip emails** — no welcome-drip, no weekly-digest, no post-completion email
5. **CSP blocks n8n forwarding** — `connect-src` lacks the n8n public host
6. **No server-side events** — analytics.ts is localStorage-only; no per-learner journey
7. **No bottom-tab nav** — desktop nav is the only nav on mobile, top-heavy
8. **No swipe carousel** — Today's Drill is a static card
9. **No recommendations** — module reader's "next" is array-index, not score-based
10. **Code-block overflow on 360px** — `pre.learn-module__starter pre` lacks scroll guard

## Evidence Contract
See `99-EVIDENCE-CONTRACT.md`. Every lane rewrites its brief in place with
completion evidence. UI/visual changes write a `visual-log/<ISO>.md` entry.

## Numbering
Per orchestration librarian: Primary Agents numbered in execution order.
First Batch = Agents 1–4. Second Batch = Agents 5–6.
