# AP-CONTENT-HUB-2026-05 — Dispatch Ready

## Mission
Take the assetpersona admin from "90% connected" to "Frank can publish AI-generated content end-to-end and watch it auto-broadcast to @frvnkfrmchicago on Threads." Closes the gap between the existing module pipeline (designed, dormant) and a live publishing posture, adds a Grazzhopper-style Content Hub for short bulletins distinct from full modules, and ports the frvnkfrmchicago Threads auto-poster pattern into the assetpersona n8n folder for cross-posting on publish.

## Production Cadence

| Wave | Name | % on completion | Status |
|------|------|----|--------|
| 1 | Deploy runbook + Content Hub + Threads broadcast + Real analytics + Persistence migration (5 lanes parallel) | 85% | not started |
| 2 | Pre-launch gate (1 lane) | 100% | not started |

Current production: **0%**. Next: **Wave 1 — 5 lanes in parallel**.

Status format: `Wave N of 2 complete → X% production done. Next: Wave N+1 — <name>.`

## Audit-Driven Inputs

This packet exists because three parallel audits (frvnkfrmchicago workflow inspection, Grazzhopper Content Hub inspection, assetpersona admin audit) found:

| Domain | Finding | Where it's addressed |
|--------|---------|----------------------|
| frvnkfrmchicago workflow | Threads auto-poster: cron 30min → 63-slot/week calendar → Gemini 2.0 Flash → Threads container+publish. Brand-voice constraints (banned-words, 500-char cap, no hashtags) baked in prompt. Auth via 3 env vars (`GEMINI_API_KEY`, `THREADS_FRVNK_USER_ID`, `THREADS_FRVNK_TOKEN`). | Lane 3 ports this into `n8n/workflows/threads-broadcast.json` triggered on module/blog/bulletin publish events. |
| Grazzhopper Content Hub | Officially "Regulatory Updates Admin" at `grazzhopper-v2/grazzhopper-landing/app/platform/admin/regulatory-updates/`. Single-form-single-curation pattern: title, summary, source URL, severity tier, state dots (pending/curated/archived). Simpler than assetpersona's ModuleQueue. | Lane 2 adds `/admin/content-hub` with the same pattern — short bulletins distinct from long Modules. Severity → AI/dev relevance tier. |
| Admin audit (existing) | Admin UI 90% complete and CONNECTED. Blocker is deploy + schema + RSS seed. `generate-module` and `module-tutor` Edge Functions ready. `news-to-module.json` n8n workflow ready. | Lane 1 writes a deploy runbook + RSS seed migration. |
| Analytics is STUB | `Analytics.tsx:12-46` and `analyticsData.ts` use placeholder `getEventCount`. The `learner_events` and `user_events` tables already exist on disk. | Lane 4 wires Analytics page to those existing tables. |
| Persistence localStorage | BlogDrafts + StudioPages still write to localStorage; survives a refresh but not a deploy or a multi-device session. | Lane 5 migrates both to Supabase (additive migrations + adapter swap with localStorage fallback for offline). |

## Mode

**Multi Primary Agent** (declared). Lead orchestrator is this chat. Each lane runs as its own sub-agent invocation; the lane brief file is the canonical evidence record. Per [feedback_packet_continuity.md](memory): runs end-to-end. Per [feedback_no_time_language.md](memory): waves + 0–100% only. Per [feedback_frank_brand_spellings.md](memory): use `Grazzhopper` and `frvnkfrmchicago` verbatim — never the obvious corrections.

## Skills and Librarians Referenced

| Resource | Used By | Purpose |
|----------|---------|---------|
| [librarians/orchestration-librarian.md](../../../../librarians/orchestration-librarian.md) | Lead | Packet lifecycle, Explainer Mode, production cadence |
| [librarians/multi-agent-librarian.md](../../../../librarians/multi-agent-librarian.md) | All | File-bound decomposition |
| [librarians/review-orchestration-librarian.md](../../../../librarians/review-orchestration-librarian.md) | Lead at closeout | 18-checklist review + Explainer Mode closeout |
| [.claude/skills/n8n-automating/SKILL.md](../../../../.claude/skills/n8n-automating/SKILL.md) | Lanes 1, 3 | Cron + webhook + Gemini + Threads OAuth patterns |
| [.claude/skills/api-integrating/SKILL.md](../../../../.claude/skills/api-integrating/SKILL.md) | Lane 3 | Threads container→publish flow; webhook signature verification; retry/backoff |
| [.claude/skills/supabase-building/SKILL.md](../../../../.claude/skills/supabase-building/SKILL.md) | Lanes 2, 5 | RLS-first table layout; client/server boundary; storage policy |
| [.claude/skills/database-designing/SKILL.md](../../../../.claude/skills/database-designing/SKILL.md) | Lane 2, 5 | Schema + indexes for content_hub_bulletins + blog_drafts + studio_pages tables |
| [.claude/skills/component-building/SKILL.md](../../../../.claude/skills/component-building/SKILL.md) | Lane 2 | ContentHub admin form with severity picker + state dots |
| [.claude/skills/ux-designing/SKILL.md](../../../../.claude/skills/ux-designing/SKILL.md) | Lane 2 | Single-form one-step-curation pattern from Grazzhopper |
| [.claude/skills/copywriting-enforcing/SKILL.md](../../../../.claude/skills/copywriting-enforcing/SKILL.md) | Lane 3 | Brand-voice prompt template (ported from frvnkfrmchicago) |
| [.claude/skills/google-ai-integrating/SKILL.md](../../../../.claude/skills/google-ai-integrating/SKILL.md) | Lane 3 | Gemini 2.0 Flash API usage matching the frvnkfrmchicago workflow |
| [.claude/skills/prompt-engineering/SKILL.md](../../../../.claude/skills/prompt-engineering/SKILL.md) | Lane 3 | System-prompt structure for brand-voice generation |
| [.claude/skills/progress-tracking/SKILL.md](../../../../.claude/skills/progress-tracking/SKILL.md) | Lane 4 | Real analytics rollup format |
| [.claude/skills/security-auditing/SKILL.md](../../../../.claude/skills/security-auditing/SKILL.md) | Lane 6 | Final gate: RLS coverage on new tables, secret handling for Threads tokens |
| [.claude/skills/pre-deploy-gating/SKILL.md](../../../../.claude/skills/pre-deploy-gating/SKILL.md) | Lane 6 | Final-gate checklist |
| [.claude/skills/exit-gating/SKILL.md](../../../../.claude/skills/exit-gating/SKILL.md) | Lane 6 | STOP gates before ship |

## 2026 Research Decisions Baked Into Packet

- **Calendar-slot publishing pattern (frvnkfrmchicago):** the value isn't the auto-poster itself, it's the *brand-voice prompt template* + *banned-words list* + *50-char-cap discipline*. Lane 3 ports those verbatim; the trigger changes from cron to publish-event.
- **Grazzhopper's single-form curation beats multi-step workflow** for short-lived content (news bulletins, current-event drops). Don't bolt content-hub onto ModuleQueue — give it its own surface with its own simpler shape.
- **Threads API requires container → 30s wait → publish** (per the frvnkfrmchicago workflow file:line 81-86). This is not negotiable — the Threads backend needs the sync window.
- **Don't break existing modules pipeline.** The Content Hub is *additive*. ModuleQueue + Velocity keep doing what they do (long-form lesson generation from RSS); Content Hub handles short bulletins.
- **Gemini 2.0 Flash is the right model for Threads drafts** per the existing workflow + Frank's in-app budget rule (cheap inference for end-user-facing copy). Long-form module generation can stay on Claude/OpenRouter.
- **Real analytics off `learner_events`** beats yet another tracking table. The schema already exists; the page just needs to read it.

## Lane Decomposition (file-bound, no overlap)

| Agent | Lane | Wave home | File ownership |
|-------|------|-----------|----------------|
| Agent 1 | Deploy runbook + RSS seed | Wave 1 | `orchestration/active/AP-CONTENT-HUB-2026-05/RUNBOOK.md` (NEW), `supabase/migrations/20260519100000_seed_module_sources.sql` (NEW) |
| Agent 2 | Content Hub admin surface | Wave 1 | `src/pages/admin/ContentHub.tsx` (NEW), `src/pages/admin/ContentHub.css` (NEW), `src/pages/admin/ContentHubEdit.tsx` (NEW), `src/data/contentHub.ts` (NEW), `supabase/migrations/20260519100100_create_content_hub.sql` (NEW), `src/App.tsx` (one new route only — distinct block), `src/components/admin/AdminLayout.tsx` (sidebar entry only — single block) |
| Agent 3 | frvnkfrmchicago → assetpersona Threads broadcast | Wave 1 | `n8n/workflows/threads-broadcast.json` (NEW), `supabase/functions/threads-broadcast/index.ts` (NEW if Edge Function approach chosen over direct n8n webhook), `supabase/functions/_shared/threads.ts` (NEW shared helper if needed). Reads only: `supabase/migrations/*` to learn publish-event shape, the existing frvnkfrmchicago workflow at `/Users/franklawrencejr./Documents/Automation Centre/n8n-workflows/frvnkfrmchicago-threads.json`. |
| Agent 4 | Real analytics off learner_events | Wave 1 | `src/lib/analytics.ts` (extend — keep existing exports stable), `src/pages/admin/Analytics.tsx`, `src/data/analyticsData.ts`. No new migrations — `learner_events` already exists. |
| Agent 5 | Persistence migration (Blog + Studio) | Wave 1 | `src/data/blogDrafts.ts` (Supabase swap), `src/data/studioStorage.ts` (Supabase swap), `supabase/migrations/20260519100200_create_blog_drafts.sql` (NEW), `supabase/migrations/20260519100300_create_studio_pages.sql` (NEW). Reads `src/data/blogSync.ts` for shape consistency; does NOT modify it. |
| Agent 6 | Pre-launch gate | Wave 2 | Read-only scan + this lane brief + master log update |

**No two lanes touch the same file.** Lane 2 owns specific blocks in `src/App.tsx` (route addition) and `src/components/admin/AdminLayout.tsx` (sidebar entry) — Lane 2 is the only writer to those files in this packet.

## Evidence Contract

See [99-EVIDENCE-CONTRACT.md](./99-EVIDENCE-CONTRACT.md). Same as AP-LAUNCH-READY: Explainer + TL;DR + 6 tables + Citations triplet (≥1 SKILL + ≥1 LIBRARIAN + ≥1 2026 URL).

## Operational Rules (per orchestration-librarian)

| Rule | Reason |
|------|--------|
| No `bun build`, `tsc --noEmit`, playwright, vitest during agent execution | N agents = memory exhaustion |
| Read + Edit + Write for code; Bash limited to `ls` / `grep` / `cat` / `find` / `date` | Same memory protection |
| User verifies builds after wave settles | Single point of verification |
| Every brief ends with Citations table | Traceability |
| No time language | Production cadence rule |
| No model-name references in plans | Plans are model-agnostic |
| No mid-wave A/B/C asks | Per [feedback_packet_continuity.md](memory) |
| Grazzhopper and frvnkfrmchicago spelled verbatim | Per [feedback_frank_brand_spellings.md](memory) |

## Merge Order

```
Wave 1 (5 lanes in parallel — no file overlap):
  Lane 1 (Runbook + seed)         ┐
  Lane 2 (Content Hub)             │
  Lane 3 (Threads broadcast)       ├─ all run together
  Lane 4 (Real analytics)          │
  Lane 5 (Persistence migration)   ┘

Wave 2 (gate):
  Lane 6 (Pre-launch gate)         — read-only verification + closeout
```

## Reporting Format

```
Wave N of 2 complete → X% production done.
Next: Wave N+1 — <wave name>.
```

After each lane closes: `Lane N of 6 complete → X% wave done.`
