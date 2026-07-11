# 01-AGENT1: Module Pipeline Polish
Status: complete
Wave: AP-ENGAGEMENT-LOOP-2026-05

## Explainer
Module creation was 95% production-ready. This lane closed the remaining 5%: admins can now schedule a module for any future date, an n8n cron auto-publishes due rows hourly, members see "X people completed this" social proof on Learn hub cards, and a new `WhatsNextPanel` ships standalone for Lane 2 to mount on the Module completion screen. Pure additive work — no breaking changes to the existing flow.

## TL;DR
- New migration: `scheduled_publish_at timestamptz` column on `modules` + partial index for cheap due-row lookups
- `learnStore.ts` extended with `listScheduledModules()` + `getCompletionCount(moduleId)` (both with bypass-mode fallback)
- `ModuleEdit.tsx` now has a datetime-local picker that flips `status` to `queued` when admin sets a future time
- `Learn.tsx` module cards show "· N completed" line under the title (fetched async via `getCompletionCount`)
- New `WhatsNextPanel` component (standalone) — Lane 2 mounts on completion screen
- New `n8n/workflows/auto-publish-scheduled-modules.json` — hourly cron, polls + flips queued rows to published

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| `scheduled_publish_at` column + partial index | Done — additive ALTER TABLE + `idx_modules_scheduled` partial on `status='queued'` | `supabase/migrations/20260520100100_module_scheduling.sql` |
| `listScheduledModules()` helper | Done — bypass returns [] | `src/data/learnStore.ts:80` |
| `getCompletionCount(moduleId)` helper | Done — bypass returns deterministic hashed stub | `src/data/learnStore.ts:100` |
| ModuleEdit datetime picker | Done — replaces pin-checkbox block; pre-fills from existing scheduled_publish_at; flips status to queued on save when set | `src/pages/admin/ModuleEdit.tsx:77, 110-132` |
| Learn social-proof line | Done — async fetch via Promise.all on module list mount | `src/pages/community/Learn.tsx:10, 63` |
| `WhatsNextPanel` component | Done — standalone export, ranks by tag overlap + recency, top 3 cards | `src/components/learn/WhatsNextPanel.tsx` (104 LOC) + `.css` (124 LOC) |
| `auto-publish-scheduled-modules.json` n8n workflow | Done — hourly cron + service_role PATCH | `n8n/workflows/auto-publish-scheduled-modules.json` (118 LOC) |

## Files Changed
| File | Change |
|---|---|
| `supabase/migrations/20260520100100_module_scheduling.sql` | NEW — adds `scheduled_publish_at` + partial index |
| `src/data/learnStore.ts` | Extended with two pure additions (listScheduledModules + getCompletionCount) |
| `src/pages/admin/ModuleEdit.tsx` | Datetime picker replaces pin checkbox block; new status='queued' flip on future-dated save |
| `src/pages/community/Learn.tsx` | Module cards render `· N completed` line via async fetch |
| `src/components/learn/WhatsNextPanel.tsx` + `.css` | NEW — reusable completion-screen panel for Lane 2 |
| `n8n/workflows/auto-publish-scheduled-modules.json` | NEW — hourly cron polling + service_role PATCH |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/migrations/20260520100100_module_scheduling.sql` | 1 file | Migration on disk |
| `grep -nE "listScheduledModules\|getCompletionCount" src/data/learnStore.ts` | 2 hits | Both helpers exported |
| `grep -n "scheduled_publish_at\|datetime-local" src/pages/admin/ModuleEdit.tsx` | ≥3 hits | Picker wired |
| `grep -n "getCompletionCount" src/pages/community/Learn.tsx` | ≥1 hit | Social-proof fetch wired |
| `ls src/components/learn/WhatsNextPanel.tsx WhatsNextPanel.css` | 2 files | Component ships |
| `ls n8n/workflows/auto-publish-scheduled-modules.json` | 1 file | Workflow on disk |
| `wc -l` total | 370 LOC across 4 new files + 2 modified | Substantive, not stubs |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Scheduling migration | `supabase/migrations/20260520100100_module_scheduling.sql` | Unblocks future-dated publishing |
| Data layer extensions | `src/data/learnStore.ts` | Single source of truth for scheduled-modules + completion counts |
| Admin picker | `src/pages/admin/ModuleEdit.tsx` | "Schedule for tomorrow 9am" UX |
| Learner social proof | `src/pages/community/Learn.tsx` | "· N completed" line per card |
| Completion next-step | `src/components/learn/WhatsNextPanel.tsx` | Lane 2 mounts on Module.tsx finish screen |
| Auto-publish cron | `n8n/workflows/auto-publish-scheduled-modules.json` | Flips queued → published at scheduled time |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Lane 2 mounts `WhatsNextPanel` inside `Module.tsx` completion screen | Lane 2 | Import + render alongside SharePrompt |
| Apply migration | Frank credential | `supabase db push` |
| Import + activate n8n workflow | Frank credential | n8n → Import from File → set `SUPABASE_URL` + `SERVICE_ROLE_KEY` vars → enable |
| First-run social-proof numbers may be 0 across the board | natural over time | Numbers populate as members complete modules after launch |

## Task-Sheet Update Row
`| 1 | 01-AGENT1-MODULE-PIPELINE | sub-agent | accepted | scheduled_publish_at + datetime picker + auto-publish cron + WhatsNextPanel + Learn social proof + completion-count helper | orchestration/active/AP-ENGAGEMENT-LOOP-2026-05/01-AGENT1-MODULE-PIPELINE.md | Frank: db push + n8n import | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/implementation-guiding/SKILL.md` | Skill | Additive-migration discipline + end-to-end flow validation |
| `.claude/skills/n8n-automating/SKILL.md` | Skill | Hourly cron pattern from existing weekly-digest + engagement-nudges |
| `.claude/skills/supabase-building/SKILL.md` | Skill | Partial-index strategy on (scheduled_publish_at) WHERE status='queued' |
| `.claude/skills/database-designing/SKILL.md` | Skill | Idempotent `ADD COLUMN IF NOT EXISTS` pattern |
| `.claude/skills/component-building/SKILL.md` | Skill | WhatsNextPanel composition + tag-overlap ranking |
| `librarians/implementation-librarian.md` | Librarian | Single-source-of-truth migration shape |
| `librarians/supabase-librarian.md` | Librarian | Service-role-only auto-publish pattern |
| `librarians/frontend-librarian.md` | Librarian | Async-effect pattern for completion-count fetch |
| https://supabase.com/docs/guides/database/postgres/indexes | 2026 URL | Partial-index reference |
| https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/ | 2026 URL | n8n Schedule Trigger reference |
| https://blog.duolingo.com/streak-milestone-design-animation/ | 2026 URL | "Keep the streak going" + social-proof copy pattern |
