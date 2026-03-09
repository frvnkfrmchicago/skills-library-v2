# Orchestration Workflow

## Explainer
This is the full operating loop: dispatch, build, evidence, review, tracker update, then move or archive.

## TL;DR

| Step | What happens | Output |
|---|---|---|
| 1 | Lead defines the wave | active packet |
| 2 | Each agent gets one lane brief | separate lane docs |
| 3 | Each agent builds and rewrites its own lane brief on completion | completed lane brief |
| 4 | Lead reviews the updated lane brief | accepted / needs-rerun / rejected |
| 5 | Lead updates the master log | management tracker stays truthful |
| 6 | Full wave moves to completed or archive | clean history |

## Status Lifecycle

| Status | Meaning |
|---|---|
| `assigned` | brief exists, agent has not started |
| `in-progress` | agent is working |
| `reported-complete` | agent says work is done and rewrote the brief |
| `accepted` | lead reviewed and accepts the lane |
| `needs-rerun` | lead found missing proof or incomplete work |
| `rejected` | lane does not meet scope |
| `archived` | packet is retained for history only |

## Folder Lifecycle

| Folder | Use |
|---|---|
| `orchestration/active/<wave-id>` | current packet only |
| `orchestration/management` | canonical index + master log |
| `orchestration/completed/<wave-id>` | accepted wave packet |
| `orchestration/archive/<wave-id>` | older completed packets kept for reference |

## Review Rule

The lead orchestrator reads the updated lane brief, not a separate chat message. The lane brief is the authoritative record because it contains:

- original mission,
- what changed,
- proof,
- artifact paths,
- remaining gaps,
- tracker update row.

## What Counts As "Done"

A lane is done only when all of these are true:

1. code or docs were actually changed,
2. the lane brief was rewritten with completion evidence,
3. artifact paths are listed,
4. remaining gaps are stated clearly,
5. the lead reviewed it and updated the master log.
