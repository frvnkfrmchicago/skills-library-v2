# Evidence Contract — AP-MODERNIZE-2026-05

## Explainer
Same contract as AP-LAUNCH-READY-2026-05 and AP-CONTENT-HUB-2026-05. The lane brief file is the canonical evidence record. Chat summaries are not authoritative.

## TL;DR

| Requirement | Why |
|---|---|
| Explainer at top | Plain-language context first |
| TL;DR after Explainer | Scannable summary |
| 6 tables of facts | Comparable status across lanes |
| Citations triplet (SKILL + LIBRARIAN + 2026 URL) | Traceability + librarian mandate |
| No time language | Waves + 0–100% only |
| Grazzhopper and frvnkfrmchicago spelled verbatim where they appear | Brand-spelling rule |

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
| Files Changed | File \| Change |
| Commands Run | Command \| Result \| Plain meaning |
| Artifacts | Artifact \| Path \| Purpose |
| Remaining Gaps | Gap \| Owner (Frank credential / next lane / future wave) \| Next action |
| Citations | Resource \| Type \| What it gave the lane |

## Plain-Language Rule

| Technical term | Plain language |
|---|---|
| RLS | database-level access rule |
| Edge Function | small server function that runs near users |
| migration | versioned database schema change |
| anon key | the public Supabase key the browser uses |
| service_role | the admin Supabase key (server-side only) |
| HMAC | cryptographic signature proving the message wasn't tampered |
| webhook | a URL another service POSTs to when an event happens |
| Customer Portal | Stripe-hosted self-serve billing page |
| Realtime presence | Supabase's per-channel "who's connected" tracker |

## Brand-Spelling Rule

Per memory:
- **Grazzhopper** — double-z, no `s`. Never "Grasshopper."
- **frvnkfrmchicago** — F-R-V-N-K-F-R-M-C-H-I-C-A-G-O. Never "Frank from Chicago" as a canonical reference.

## File Authority Rule

The lane brief file IS the evidence record. Chat summaries are not authoritative.

## Lead Review Rule

Reject completion if any of these are missing:

1. The file was not rewritten (still has dispatch template content)
2. Required sections / Citations triplet missing
3. Artifact paths missing
4. Remaining gaps hidden
5. Time language used anywhere
6. Brand spelling violated
