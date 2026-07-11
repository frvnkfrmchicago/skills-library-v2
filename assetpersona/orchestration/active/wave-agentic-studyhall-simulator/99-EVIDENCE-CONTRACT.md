# Evidence Contract — wave-agentic-studyhall-simulator

## Explainer
This contract defines what a completed lane file must contain before the lead orchestrator accepts it. The lane brief file is the canonical evidence record — chat summaries are not authoritative.

---

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

---

## Required Table Columns

| Table | Minimum columns |
|---|---|
| Delivery Summary | Requested outcome \| Result \| Evidence path |
| Files Changed | File \| Change (one phrase) |
| Commands Run | Command \| Result \| Plain meaning |
| Artifacts | Artifact \| Path \| Purpose |
| Remaining Gaps | Gap \| Owner (Frank credential / next lane / future wave) \| Next action |
| Citations | Resource \| Type (Skill / Librarian / URL) \| What it gave the lane |

---

## Production Cadence Rule

Lane briefs and completions must NOT include time fields. No ETAs, no durations, no deadlines, no "by tomorrow," no "in a few hours." Use:
- Lane is part of one named Wave (1–4)
- Status updates: `Wave N of 4 complete → X% production done`
- Effort and scope described as "owned files / outputs," not "time"

---

## Citation Triplet Rule

Every lane brief MUST cite at minimum:
- **≥1 SKILL** from `.agents/skills/`
- **≥1 LIBRARIAN** from `librarians/` or `.agents/skills/`
- **≥1 2026 web URL** (technique, spec, or pattern reference)

---

## No-Deferral Rule

Every lane in scope must ship in this wave. Never mark anything "deferred" or "queued." Drop it cleanly with reason in Remaining Gaps, or ship it.

---

## No Mid-Wave Decision Asks

Once this dispatch is approved, no A/B/C asks during execution. Pick the obvious default per the lane brief, document the choice in Remaining Gaps if relevant, and ship.
