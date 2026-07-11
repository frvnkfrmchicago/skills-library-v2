# Evidence Contract — AP-LAUNCH-READY-2026-05

## Explainer
This contract defines what a completed lane file must contain before the lead orchestrator accepts it. The lane brief file is the canonical evidence record — chat summaries are not authoritative. Mirrors `agents/orchestration/references/evidence-contract.md` with the production-cadence rule applied and the orchestration-librarian's citation triplet added.

## TL;DR

| Requirement | Why it exists |
|---|---|
| Explainer at top | Non-technical readers need plain-language context first |
| TL;DR after Explainer | Scannable summary before deep detail |
| Tables for facts | Comparable status across lanes |
| Exact file paths | Lead can reopen the same docs later |
| Commands + results | Shows what was actually checked, not just claimed |
| Remaining gaps | Prevents false "done" claims |
| Citations triplet (SKILL + LIBRARIAN + 2026 URL) | Traceability + orchestration-librarian mandate |
| No time language | Production cadence rule — waves + 0–100% only |

## Required Completion Sections (in order)

1. `Explainer`
2. `TL;DR`
3. `Delivery Summary` table
4. `Files Changed` table
5. `Commands Run` table
6. `Artifacts` table
7. `Remaining Gaps` table
8. `Task-Sheet Update` row
9. `Citations` table (≥1 SKILL + ≥1 LIBRARIAN + ≥1 2026 URL)

## Required Table Columns

| Table | Minimum columns |
|---|---|
| Delivery Summary | Requested outcome \| Result \| Evidence path |
| Files Changed | File \| Change (one phrase) |
| Commands Run | Command \| Result \| Plain meaning |
| Artifacts | Artifact \| Path \| Purpose |
| Remaining Gaps | Gap \| Owner (Frank credential / next lane / future wave) \| Next action |
| Citations | Resource \| Type (Skill / Librarian / URL) \| What it gave the lane |

## Plain-Language Rule

If technical terms appear in the brief, translate them inline. Reference set:

| Technical term | Plain language |
|---|---|
| `200` | worked |
| `404` | missing |
| `500` | broken on the server |
| RLS | database-level access rule |
| Edge Function | small server function that runs near users |
| migration | versioned database schema change |
| LCP | how fast the biggest visible thing loads |
| INP | how fast the page responds when you tap |
| CLS | how much the page jumps around as it loads |
| RPC | call into the database from the app |
| anon key | the public Supabase key the browser uses (read-mostly) |
| service_role | the admin Supabase key (server-side only) |
| HMAC | cryptographic signature proving the message wasn't tampered |

## Production Cadence Rule

Lane briefs and completions must NOT include time fields. No ETAs, no durations, no deadlines, no "by tomorrow," no "in a few hours." Use:

- Lane is part of one named Wave (1–4)
- Status updates: `Wave N of 4 complete → X% production done`
- Effort and scope described as "owned files / outputs," not "time"

## Citation Triplet Rule

Per [feedback_orchestration_librarian_format.md](memory): every lane brief MUST cite at minimum:

- ≥1 SKILL from `.claude/skills/`
- ≥1 LIBRARIAN from `librarians/`
- ≥1 2026 web URL (technique, spec, or pattern reference)

Multiple of each are encouraged. The Citations table at the bottom of the completed brief is where this lives.

## File Authority Rule

The lane brief file IS the evidence record. Chat summaries are not authoritative. The lead orchestrator reads the rewritten file, not the agent's chat output, to decide accept/needs-rerun/rejected.

## Lead Review Rule

The lead orchestrator rejects completion if any of these are missing:

1. The file was not rewritten (still has dispatch template content)
2. Required sections (Explainer / TL;DR / required tables / Citations triplet) are missing
3. Artifact paths are missing
4. Remaining gaps are hidden or omitted
5. Time language was used anywhere in the file
6. The Citations triplet is incomplete (missing skill, librarian, or 2026 URL)

## No-Deferral Rule

Per orchestration-librarian: every lane in scope ships in this wave. Never mark anything "deferred" or "queued." Drop it cleanly with reason in Remaining Gaps, or ship it. Lane 5 specifically authorized to drop scope (e.g., hide Courses/Shop behind coming-soon gates) — that counts as "dropped cleanly," not "deferred."

## No Mid-Wave Decision Asks

Per [feedback_packet_continuity.md](memory): once this dispatch is approved, no A/B/C asks during execution. Pick the obvious default per the lane brief, document the choice in Remaining Gaps if relevant, ship.
