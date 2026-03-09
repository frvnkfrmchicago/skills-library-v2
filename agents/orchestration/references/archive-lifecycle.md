# Archive And Deletion Lifecycle

## Explainer
Move files through explicit states. Do not delete by default.

## TL;DR

| State | What it means | Action |
|---|---|---|
| Active | current wave under review or build | keep in `active/` |
| Completed | wave accepted and no longer being edited | move to `completed/` |
| Archived | old completed wave kept for reference | move to `archive/` |
| Deleted | removed on explicit user instruction only | do not do automatically |

## File Movement Rules

1. Keep the packet in `active/` until all required lanes are reviewed.
2. Move the full packet folder to `completed/` when the wave is accepted.
3. Archive later if needed for long-term history.
4. Never delete lane docs automatically.
5. If the user wants optional cleanup, propose a delete candidate list instead of deleting first.

## Delete Candidate List

When the user asks what can be deleted, produce:

| Path | Why it could be deleted | Risk |
|---|---|---|
| <path> | stale duplicate | low |

Then wait for explicit approval.
