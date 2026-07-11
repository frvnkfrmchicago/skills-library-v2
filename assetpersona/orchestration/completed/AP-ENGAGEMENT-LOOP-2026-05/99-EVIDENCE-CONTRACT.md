# Evidence Contract — AP-ENGAGEMENT-LOOP-2026-05

## Explainer
Same shape as prior packets. The lane brief file IS the canonical evidence record. Chat summaries are not authoritative.

## TL;DR

| Requirement | Why |
|---|---|
| Explainer at top | Plain-language context first |
| TL;DR after Explainer | Scannable summary |
| 6 tables of facts | Comparable status across lanes |
| Citations triplet (2+ SKILL + 2+ LIBRARIAN + 2+ 2026 URL) | Standing protocol per `feedback_standing_task_protocol.md` — multiple of each, never just one |
| No time language | Waves + 0-100% only |
| Grazzhopper and frvnkfrmchicago verbatim where they appear | Brand-spelling rule |
| No rate-limit incident notes | If rate limit fires, lead continues silently |

## Required Completion Sections (in order)

1. `Explainer`
2. `TL;DR`
3. `Delivery Summary` table
4. `Files Changed` table
5. `Commands Run` table
6. `Artifacts` table
7. `Remaining Gaps` table
8. `Task-Sheet Update` row
9. `Citations` table (2+ SKILL rows + 2+ LIBRARIAN rows + 2+ 2026 URL rows minimum)

## Required Table Columns

| Table | Minimum columns |
|---|---|
| Delivery Summary | Requested outcome \| Result \| Evidence path |
| Files Changed | File \| Change |
| Commands Run | Command \| Result \| Plain meaning |
| Artifacts | Artifact \| Path \| Purpose |
| Remaining Gaps | Gap \| Owner (Frank credential / next lane / future wave) \| Next action |
| Citations | Resource \| Type \| What it gave the lane |

## Citation Triplet Rule (UPDATED)

Per [feedback_standing_task_protocol.md](memory): the citation triplet's MINIMUM floor is **2+ skills, 2+ librarians, 2+ 2026 URLs** per lane brief. The 1-of-each floor from earlier packets has been raised. Frank explicitly said "do not limit it to only using 1 of each. Use as many as needed."

Aim for 3-5 skills + 2-3 librarians + 2-4 URLs per lane where the work justifies it.

## Plain-Language Rule

| Technical term | Plain language |
|---|---|
| RLS | database-level access rule |
| Edge Function | small server function that runs near users |
| migration | versioned database schema change |
| OAuth | delegated-access flow (used by every social platform) |
| OG / OpenGraph | metadata that makes a link render as a card on social platforms |
| Satori | renderer Vercel uses to turn React/JSX into dynamic OG images |
| dispatcher | one Edge Function that fans out to N platform adapters |

## Brand-Spelling Rule

- **Grazzhopper** — double-z, no `s`. Never "Grasshopper."
- **frvnkfrmchicago** — F-R-V-N-K-F-R-M-C-H-I-C-A-G-O. Never "Frank from Chicago" as a canonical reference.

## Lead Review Rule

Reject completion if any of these are missing:

1. Lane brief file was not rewritten (still has dispatch template content)
2. Required 9 sections / Citations triplet (2+ of each) missing
3. Artifact paths missing
4. Remaining gaps hidden
5. Time language used anywhere
6. Brand spelling violated
7. Rate-limit incident notes in artifacts
