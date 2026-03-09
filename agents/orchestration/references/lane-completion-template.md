# Lane Completion Template

Use this to rewrite the same lane brief file after the agent finishes.

```md
# <Lane Title>
Status: reported-complete
Wave: <wave-id>
Owner: <agent/model>
Updated file path: <exact path to this file>

## Explainer
<Plain-language explanation of what is now done and what that means for the project.>

## TL;DR
- <What changed>
- <What now works>
- <What still needs review or follow-up>

| Requested outcome | Result | Evidence path |
|---|---|---|
| <outcome> | <done / partial / blocked> | <path> |

| File | Change |
|---|---|
| <path> | <what changed> |

| Command | Result | Plain meaning |
|---|---|---|
| `<command>` | <pass/fail/output summary> | <simple explanation> |

| Artifact | Path | Purpose |
|---|---|---|
| <artifact name> | <exact path> | <why it matters> |

| Remaining gap | Owner | Next action |
|---|---|---|
| <gap> | <who owns it> | <what should happen next> |

## What Changed
- <important implementation detail 1>
- <important implementation detail 2>

## Task-Sheet Update

| Wave | Lane | Status | Summary | Updated doc path | Lead action |
|---|---|---|---|---|---|
| <wave-id> | <lane-id> | reported-complete | <one-line summary> | <exact path> | review for accept/reject |

## Original Mission Snapshot
<Paste or summarize the original mission briefly so the file still carries its own history.>
```
