# Evidence Contract — AP-LAUNCH-2026-05

## Explainer
This contract defines what a completed lane file must contain before the lead accepts it. Mirrors `agents/orchestration/references/evidence-contract.md` with the production-cadence rule applied.

## TL;DR

| Requirement | Why it exists |
|---|---|
| Explainer at top | non-technical readers need plain-language context first |
| TL;DR after explainer | scannable summary before deep detail |
| Tables for facts | comparable status across lanes |
| Exact file paths | lead can reopen the same docs later |
| Commands + results | shows what was actually checked, not just claimed |
| Remaining gaps | prevents false "done" claims |
| No time language | per orchestration-librarian production-cadence rule |

## Required Completion Sections

In this order:

1. `Explainer`
2. `TL;DR`
3. `Delivery Summary` table
4. `Files Changed` table
5. `Commands Run` table
6. `Artifacts` table
7. `Remaining Gaps` table
8. `Task-Sheet Update` row for the master log

## Required Tables

| Table | Minimum columns |
|---|---|
| Delivery Summary | requested outcome, result, evidence path |
| Files Changed | file, change |
| Commands Run | command, result, plain meaning |
| Artifacts | artifact, path, purpose |
| Remaining Gaps | gap, owner, next action |

## Plain-Language Rule

If technical terms appear, translate them inline.

| Technical term | Plain language |
|---|---|
| `200` | worked |
| `404` | missing |
| `500` | broken on the server |
| RLS | database-level access rule |
| Edge Function | small server function that runs near users |
| HMAC | cryptographic signature proving the message wasn't tampered |
| migration | versioned schema change |
| runtime verification | live "does it work now" check |

## Production Cadence Rule

Lane briefs and completions must NOT include time fields (ETA, duration, deadline, "by tomorrow," "in a few hours," etc.). Use the wave + percentage system:

- Lane is part of one named Wave (1–4)
- Status updates report `Wave N of 4 complete → X% production done`
- Effort and scope are described as "owned files / outputs," not "time"

## File Authority Rule

The lane brief file IS the evidence record. Chat summaries are not authoritative.

## Lead Review Rule

The lead orchestrator rejects completion if any of these are missing:

1. The file was not rewritten (still has the dispatch template content)
2. The Explainer / TL;DR / required tables are missing
3. Artifact paths are missing
4. Remaining gaps are hidden or omitted
5. Time language was used anywhere in the file
