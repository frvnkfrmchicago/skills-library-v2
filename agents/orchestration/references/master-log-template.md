# Master Log Template

## Explainer
The master log is updated by the lead orchestrator after reviewing a completed lane file.

## TL;DR
One row per lane. The log should point back to the updated lane brief path so the evidence is always traceable.

```md
# Master Log

| Wave | Lane | Owner | Review status | Summary | Updated doc path | Next action | Archive state |
|---|---|---|---|---|---|---|---|
| wave-001 | 01-CODEX-A | Codex A | accepted | Creative social flow built and evidenced | /absolute/path/to/01-CODEX-A.md | keep in active until wave closes | active |
```

## Review Rules

| If you see this | Do this |
|---|---|
| File missing rewrite sections | mark `needs-rerun` |
| Good code but weak proof | mark `needs-rerun` |
| Scope delivered and evidenced | mark `accepted` |
| Wrong scope or contradictory claims | mark `rejected` |

## Canonical Index Rule

After the master log changes, update the canonical index so everyone knows:

1. what packet is active,
2. which tracker is current,
3. which folders are archive-only.
