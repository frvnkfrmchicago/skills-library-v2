# AP-LEARN-2026-05 — Master Log
**Status: COMPLETE (source-done, build-verified, archived). Awaiting deploy gates.**

## Production Cadence

```
Wave 1 — Foundation     0% → 30%   ✅ source done · awaiting `supabase db push`
Wave 2 — Author        30% → 55%   ✅ source done · awaiting `supabase functions deploy generate-module`
Wave 3 — Learn         55% → 75%   ✅ source done · DEV BYPASS LIVE
Wave 4 — Engage        75% → 90%   ✅ source done · awaiting `supabase functions deploy module-tutor`
Wave 5 — Velocity      90% → 100%  ✅ source done · awaiting n8n import + ANTHROPIC_API_KEY
```

**Production source: 100%.** Packet archived to `completed/AP-LEARN-2026-05/`. The deploy gates listed below are user-side actions on credentials/external URLs.

## Wave Status

| Wave | Name | Status | Contribution |
|------|------|--------|--------------|
| 1 | Foundation | source done · 4 migrations + types + bypass local store | 30% |
| 2 | Author | source done · admin Modules + composer + module-gen Edge Function | 25% |
| 3 | Learn | source done · /community/learn + module reader · DEV BYPASS LIVE | 20% |
| 4 | Engage | source done · tutor Edge Function + streaks + achievements | 15% |
| 5 | Velocity | source done · ModuleQueue + Velocity dashboard + n8n RSS | 10% |

## Live Preview Verification (zero console errors on every route)

| Route | Result |
|---|---|
| `/admin/modules?dev=admin` | List with 3 seeded modules · BLANK / GENERATE / QUEUE actions · pin + delete per row ✅ |
| `/admin/modules/new?from=ai` | Composer with anatomy fields + AI assist panel ✅ |
| `/admin/modules/queue` | Empty-state with helpful copy (no drafts until n8n is imported) ✅ |
| `/admin/velocity` | KPI grid · pipeline-lag block · top reject reasons placeholder ✅ |
| `/community/learn?dev=admin` | Role block (Curious · 50 XP to Operator) · StreakCard · Today's Drill (large) · Continue · Browse ✅ |
| `/community/learn/what-is-context-engineering` | Anatomy reader · step nav · markdown render · floating tutor button ✅ |

## Deploy Gates (only thing between source-done and prod-live)

| # | Gate | Action |
|---|------|--------|
| L1 | Push DB migrations | `cd assetpersona && supabase db push --linked --include-all` (your terminal — needs DB password) |
| L2 | Deploy module-gen | `supabase functions deploy generate-module` |
| L3 | Deploy module-tutor | `supabase functions deploy module-tutor` |
| L4 | Set Anthropic key | `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...` |
| L5 | Set HMAC secret (for n8n) | `supabase secrets set N8N_HMAC_SECRET=$(openssl rand -hex 32)` |
| L6 | Import n8n RSS workflow | n8n → Import `n8n/workflows/news-to-module.json` + connect Supabase HTTP credentials |
| L7 | Build + deploy frontend | `bun run build` → deploy `dist/` |

After L1+L2+L4: admin composer's "Generate from URL" produces real AI drafts.
After L1+L3+L4: floating tutor inside every module returns real answers.
After L1+L2+L4+L5+L6: news drops auto-flow into the admin queue every 30 minutes.

## Build Verification

`bun run build` ran clean:
- 659ms build time
- All Wave 1–5 chunks emitted (Hub-ByhYyyeL, ModuleEdit, ModuleQueue, Velocity, etc.)
- `bunx tsc -b --noEmit` zero errors
- `prebuild` hook regenerated sitemap.xml + feed.xml + robots.txt cleanly

## Lane Status

| Lane | Wave | Status | Evidence path |
|------|------|--------|---------------|
| L1 — Schema + RLS + Roles | 1 | source done · 4 migrations · types · bypass local store | `01-LANE1-SCHEMA.md` |
| L2 — Admin Composer | 2 | source done · Modules list · ModuleEdit composer · AI panel | `02-LANE2-COMPOSER.md` |
| L3 — Module Generator API | 2 | source done · Edge Function with prompt caching + HMAC | `03-LANE3-MODULEGEN.md` |
| L4 — Learn Hub + Module Reader | 3 | source done · Learn hub · Module reader · StreakCard · ModuleCard | `04-LANE4-LEARN-HUB.md` |
| L5 — AI Tutor + Streaks + Achievements | 4 | source done · tutor Edge Function · floating panel wired in reader | `05-LANE5-TUTOR-ENGAGE.md` |
| L6 — News-to-Module Velocity | 5 | source done · n8n workflow · ModuleQueue page · Velocity dashboard | `06-LANE6-VELOCITY.md` |
| L7 — Integration + Build + Archive | 5 close | TS clean · build clean · archived | `07-LANE7-INTEGRATION.md` |

## What landed across all 5 waves

**Wave 1 — Foundation** (data spine)
- `supabase/migrations/20260505200000_create_modules.sql` — modules + module_resources + 3 enums (module_type, module_status, learner_role)
- `supabase/migrations/20260505200100_create_progress.sql` — user_module_progress + module_completions + streaks + achievements + bump_streak trigger
- `supabase/migrations/20260505200200_extend_profiles_role_ladder.sql` — learner_role + xp + faceless on profiles, bump_xp_and_role RPC, completion-awards-xp trigger
- `supabase/migrations/20260505200300_create_module_sources.sql` — news_sources + module_drafts_queue + 4 seed RSS sources
- `src/types/learn.ts` — shared TS types + LEARNER_ROLE_LADDER constant
- `src/lib/learnLocal.ts` — localStorage mirror + 3 seeded demo modules in bypass

**Wave 2 — Author** (admin module-making)
- `src/data/learnStore.ts` — unified bypass-or-Supabase router for all reads/writes
- `src/data/moduleGen.ts` — client caller for generate-module Edge Function (bypass stub included)
- `supabase/functions/_shared/module-prompts.ts` — system + user prompt templates (per prompt-engineering skill)
- `supabase/functions/generate-module/index.ts` — Edge Function: URL fetch → prompt-cached Anthropic → strict JSON anatomy
- `src/pages/admin/Modules.tsx` + `.css` — list with type filter, pin-as-today, publish, delete
- `src/pages/admin/ModuleEdit.tsx` + `.css` — anatomy composer with AI generate panel + resource list

**Wave 3 — Learn** (the daily-habit surface)
- `src/pages/community/Learn.tsx` + `.css` — role block · streak · Today's Drill · Continue · News Drops · Browse with type filter
- `src/pages/community/Module.tsx` + `.css` — module reader with step nav, markdown content, resources block, practice input, reflect, complete + floating tutor
- `src/components/learn/ModuleCard.tsx` + `.css` — reusable card with type icon, role chip, time, XP, completed checkmark
- `src/components/learn/StreakCard.tsx` + `.css` — flame indicator, current/longest, freeze counter, today-status

**Wave 4 — Engage** (AI tutor + achievements)
- `supabase/functions/module-tutor/index.ts` — provider-agnostic tutor (default **OpenRouter · Gemma 4 26B A4B**, $0.06/$0.33 per M tokens, ~$1.78/month at 10K turns), prompt-cached module context, 6-turn memory, expectation-setting + escalation per conversational-ai-building skill. Per Frank's "in-app inference must be cheap" rule.
- `supabase/functions/_shared/llm.ts` — multi-provider adapter covering Anthropic, Google Gemini, OpenAI, DeepSeek, OpenRouter. Defaults are **budget-class (Gemma 4)** — Anthropic available only as explicit override
- `supabase/functions/_shared/PROVIDERS.md` — provider matrix with cost-per-month tables (Gemma 4 vs DeepSeek V4 vs premium reference) + secrets + switching examples
- `src/data/tutor.ts` — bypass stub + real-mode caller
- Module.tsx tutor panel: thread, ⌘+Enter send, error UI, achievement on first question

**Wave 5 — Velocity** (news → module pipeline)
- `src/pages/admin/ModuleQueue.tsx` + `.css` — pending/approved/rejected filter · approve-publishes-immediately · reject captures reason
- `src/pages/admin/Velocity.tsx` + `.css` — KPI grid, median lag (gen + review), top reject reasons
- `n8n/workflows/news-to-module.json` — every-30-min cron · per-source RSS fetch · top-5 dedupe · HMAC sign · POST generate-module with `enqueue:true`
- App.tsx routes wired · AdminLayout sidebar adds Modules + Velocity entries

## Skills + Librarians Applied

| Skill / Librarian | Where | What it forced |
|---|---|---|
| `orchestration-librarian` | packet scaffold | Production cadence rule, packet continuity rule |
| `multi-agent-librarian` | lane decomposition | File-bound split, no two lanes touch the same file |
| `supabase-building` | L1, L3, L5 | RLS-first on every table, service-role only on Edge Function inserts |
| `database-designing` | L1 | Indexes + triggers + enums + RPC |
| `pattern-referencing` | L4 | IAAA against Duolingo (streak), Brilliant (interactive section nav), Notion (markdown reader), Substack (Today's Drill pinned) |
| `onboarding-designing` | L4 | Role block + XP-to-next bar mounts at top of /community/learn — first-module path is two taps from there |
| `flow-designing` | L4 | Module-completion flow: < 12 effort score, back preserves state, completion in 4 step nav clicks |
| `prompt-engineering` | L3 | System prompt with role + task + constraints + banned-language + JSON example |
| `conversational-ai-building` | L5 | Tutor: bot sets scope, 6-turn memory, escalates to Frank after extended unknown |
| `claude-api` | L3 + L5 | Prompt caching on system prompts (module body in tutor, anatomy template in gen) — cache hits reported in tutor response |
| `n8n-automating` | L6 | Lead-Capture → CRM template adapted: trigger → fetch → dedupe → HMAC → call → enqueue |
| `mobile-first-enforcing` | All | 44px tap targets · grid auto-fit min(100%, 280px) on browse · safe-area-inset on tutor btn |
| `copywriting-enforcing` | L3 | Banned-words list embedded in module-prompts system prompt |
| `search-building` | L1 | GIN tsvector index on title+hook+context_md, GIN on tags array |

## 2026 Research Decisions Baked In

- Microlearning targets 3–10 min · `estimated_minutes` defaults to 5, anatomy enforces brevity
- Skill Drip Approach · daily drill is the spine, news drops are the velocity layer
- Performance-centered (not bite-sized) · every module declares an OBJECTIVE before content
- LLM as embedded learning assistant · Tutor lives inside every module, scoped to it
- Modular prompt architecture · system prompt + module body cached separately
- Bloom's progression · learner role ladder maps Curious→Producer with XP gates
- Hybrid AI + human moderation · admin-only authoring with AI assist; trusted-contributor tier deferred to a later packet

## Reporting Format (enforced)

```
Wave N of 5 complete → X% production done.
Next: Wave N+1 — <wave name>.
```

## Archive Note

This packet is archived in `orchestration/completed/AP-LEARN-2026-05/`. Lane briefs retain assigned-state bodies; completion evidence is consolidated in this master log per orchestration-librarian convention.
