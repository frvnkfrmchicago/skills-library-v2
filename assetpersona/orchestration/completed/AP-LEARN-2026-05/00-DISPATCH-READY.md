# AP-LEARN-2026-05 — Dispatch Ready

## Mission
Build a daily AI-learning engine inside the Asset Persona community. Modules, role ladder, AI tutor, news-to-module velocity. Admin + AI authoring (hybrid moderation per 2026 best practice). Bypass-friendly so it's testable locally before Wave 1 migrations are pushed.

## Production Cadence (no time language)

| Wave | Name | % on completion | Status |
|------|------|----|--------|
| 1 | Foundation | 30% | not started |
| 2 | Author | 55% | not started |
| 3 | Learn | 75% | not started |
| 4 | Engage | 90% | not started |
| 5 | Velocity | 100% | not started |

Current production: **0%**. Continuity rule applies — drive end to end, no mid-packet pauses.

## Module Anatomy (one shape, every type)

```
HOOK · OBJECTIVE · CONTEXT · RESOURCES · PRACTICE · AI TUTOR · REFLECT · SAVE/NEXT
```

Five module types: Daily Drill · News Drop · Concept · Role Pathway · Project.

## Learner Role Ladder

```
Curious → Operator → Crafter → Architect → Producer
```

XP-based progression. Each role unlocks: badges + display label + role-aware "Suggested Next Module."

## Skills + Librarians Referenced

| Resource | Used By | Purpose |
|---|---|---|
| `librarians/orchestration-librarian.md` | Lead | Production cadence + packet continuity rules |
| `librarians/multi-agent-librarian.md` | All | File-bound decomposition |
| `.claude/skills/supabase-building/SKILL.md` | L1, L3, L5 | RLS-first, signed URLs, channel cleanup |
| `.claude/skills/database-designing/SKILL.md` | L1 | Schema + indexes |
| `.claude/skills/pattern-referencing/SKILL.md` | L4 | IAAA: Duolingo / Brilliant / Notion / Substack |
| `.claude/skills/onboarding-designing/SKILL.md` | L4 | First-module experience |
| `.claude/skills/flow-designing/SKILL.md` | L4 | Module-completion flow audit |
| `.claude/skills/prompt-engineering/SKILL.md` | L3 | Module-generation prompts |
| `.claude/skills/conversational-ai-building/SKILL.md` | L5 | In-module AI tutor |
| `.claude/skills/claude-api/SKILL.md` | L3, L5 | Module gen + tutor (with prompt caching) |
| `.claude/skills/n8n-automating/SKILL.md` | L6 | RSS → admin queue automation |
| `.claude/skills/mobile-first-enforcing/SKILL.md` | All | Daily mobile use |
| `.claude/skills/copywriting-enforcing/SKILL.md` | L2 | Strip AI-tells from generated copy |
| `.claude/skills/search-building/SKILL.md` | L4 | Module discovery |

## 2026 Research Decisions Baked In

- 3–10 minute modules → +50% retention, +85% engagement
- Skill Drip Approach: low-barrier, just-in-time, integrates technical+ethical+pedagogical
- Performance-centered, not just bite-sized
- LLM as embedded learning assistant (real-time performance support)
- Modular prompt architecture (LangChain 4-strat / Stanford ACE / context-rot)
- Backward Design + Project-Based + Bloom's Taxonomy progression
- Hybrid AI + human moderation (admin-first, contributor-tier later)

Sources cited in master log per wave completion.

## Lane Decomposition (file-bound, no overlap)

| Agent | Lane | Wave | Owner | File ownership |
|---|---|---|---|---|
| L1 | Schema + RLS + Roles | 1 | Antigravity Opus 4.7 | `supabase/migrations/2026XXXX_*modules*.sql`, `src/types/learn.ts` (new), `src/lib/learnLocal.ts` (new) |
| L2 | Admin Composer | 2 | Antigravity Opus 4.7 | `src/pages/admin/Modules*.tsx`, `src/components/admin/module-composer/*` (new) |
| L3 | Module Generator API | 2 | Codex (cloud, parallel) | `supabase/functions/generate-module/`, `supabase/functions/_shared/module-prompts.ts` |
| L4 | Learn Hub + Module Reader | 3 | Antigravity Opus 4.7 | `src/pages/community/Learn.tsx`, `src/pages/community/Module.tsx`, `src/components/learn/*` (new) |
| L5 | AI Tutor + Streaks + Achievements | 4 | Antigravity Opus 4.7 | `supabase/functions/module-tutor/`, `src/components/learn/Tutor.tsx`, `src/components/learn/StreakCard.tsx`, `src/components/learn/AchievementsRow.tsx` |
| L6 | News-to-Module Velocity | 5 | Codex | `n8n/workflows/news-to-module.json`, `src/pages/admin/ModuleQueue.tsx`, `src/pages/admin/Velocity.tsx` |
| L7 | Integration + Build + Archive | 5 close | Antigravity Opus 4.7 | env, build, exit-gate, master log close |

Per multi-agent rule: no file owned by two lanes. L7 is the only merge agent.

## Evidence Contract

Same as `99-EVIDENCE-CONTRACT.md`. Each lane brief is rewritten in place on completion with: Explainer · TL;DR · Delivery Summary · Files Changed · Commands Run · Artifacts · Remaining Gaps · Master-log row.

## Reporting Format

```
Wave N of 5 complete → X% production done.
Next: Wave N+1 — <wave name>.
```

No time language anywhere.
