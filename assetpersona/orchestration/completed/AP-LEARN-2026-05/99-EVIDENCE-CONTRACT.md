# Evidence Contract — AP-LEARN-2026-05

Mirrors `agents/orchestration/references/evidence-contract.md` with the production-cadence + packet-continuity rules applied.

## Required Completion Sections

1. Explainer
2. TL;DR
3. Delivery Summary table
4. Files Changed table
5. Commands Run table
6. Artifacts table
7. Remaining Gaps table
8. Task-Sheet Update row for the master log

## Required Tables

| Table | Minimum columns |
|---|---|
| Delivery Summary | requested outcome, result, evidence path |
| Files Changed | file, change |
| Commands Run | command, result, plain meaning |
| Artifacts | artifact, path, purpose |
| Remaining Gaps | gap, owner, next action |

## Plain-Language Rule

| Technical term | Plain language |
|---|---|
| `200` | worked |
| `404` | missing |
| `500` | broken on the server |
| RLS | database-level access rule |
| Edge Function | small server function that runs near users |
| migration | versioned schema change |
| RPC | database-side function |

## Production Cadence

No time fields. Use waves + percentages. Status: `Wave N of 5 complete → X% production done`.

## Continuity

Lead does not pause between waves to ask "continue?". Drive to packet completion. Stop only when:
1. All source landed + build verified + log closed + packet archived, OR
2. Credential / external URL / destructive remote action requires the user.

## File Authority

The lane brief file IS the evidence record. Chat summaries are not authoritative.

## Lead Review

Reject completion if any of these are missing:
1. The file was not rewritten (still has the dispatch template content)
2. The Explainer / TL;DR / required tables are missing
3. Artifact paths are missing
4. Remaining gaps are hidden or omitted
5. Time language was used anywhere in the file
