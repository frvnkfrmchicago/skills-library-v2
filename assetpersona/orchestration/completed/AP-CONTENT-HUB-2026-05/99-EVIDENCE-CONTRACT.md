# Evidence Contract — AP-CONTENT-HUB-2026-05

## Explainer
Same contract as AP-LAUNCH-READY-2026-05. The lane brief file is the canonical evidence record — chat summaries are not authoritative. Mirrors `agents/orchestration/references/evidence-contract.md` with the production-cadence rule applied and the orchestration-librarian's citation triplet enforced.

## TL;DR

| Requirement | Why it exists |
|---|---|
| Explainer at top | Plain-language context first |
| TL;DR after Explainer | Scannable summary |
| Tables for facts | Comparable status across lanes |
| Exact file paths | Lead can reopen evidence |
| Commands + results | Shows what was checked, not just claimed |
| Remaining gaps | Prevents false "done" claims |
| Citations triplet (SKILL + LIBRARIAN + 2026 URL) | Traceability + orchestration-librarian mandate |
| No time language | Waves + 0–100% only |
| Grazzhopper and frvnkfrmchicago spelled verbatim | Frank's standing brand-spelling rule |

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
| RLS | database-level access rule |
| Edge Function | small server function that runs near users |
| migration | versioned database schema change |
| RPC | call into the database from the app |
| anon key | the public Supabase key the browser uses |
| service_role | the admin Supabase key (server-side only) |
| HMAC | cryptographic signature proving the message wasn't tampered |
| OAuth | delegated-access flow (used by Threads + Gmail) |
| container | Threads API's draft state before publish |

## Brand-Spelling Rule

Per `/Users/franklawrencejr./.claude/projects/.../memory/feedback_frank_brand_spellings.md`:

- **Grazzhopper** — double-z, no `s`. Never "Grasshopper."
- **frvnkfrmchicago** — F-R-V-N-K-F-R-M-C-H-I-C-A-G-O. Never "Frank from Chicago" as a string.

Use both verbatim everywhere — in lane briefs, prompts, code comments, n8n workflow names, table names.

## Production Cadence Rule

No time fields. No ETAs, durations, deadlines, "by tomorrow," "in a few hours." Use waves + 0–100%.

## Citation Triplet Rule

Every lane brief MUST cite:
- ≥1 SKILL from `.claude/skills/`
- ≥1 LIBRARIAN from `librarians/`
- ≥1 2026 web URL

Multiple of each encouraged. Citations table at the bottom is where this lives.

## Lead Review Rule

Reject completion if any of these are missing:

1. The file was not rewritten (still has dispatch template content)
2. Required sections / Citations triplet missing
3. Artifact paths missing
4. Remaining gaps hidden
5. Time language used anywhere
6. Brand spelling violated (e.g., "Grasshopper" or "Frank from Chicago" appearing as the canonical reference)
