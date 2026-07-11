# Lane D — Notes/Tasks Pattern (Work-item Detail)

## Outcome
Implement a **work-item detail** pattern for Notes/Tasks (properties + activity feed) using proven 2026 conventions (no invented UX).

## Ownership Boundaries
- Owns: Notes/Tasks UX, activity feed model, sources linking, status transitions.
- Does NOT own: scanning adapters, asset indexing API.

## Inputs
- Skills: `.codex/skills/pattern-referencing/SKILL.md` (IAAA), `.codex/skills/ux-designing/SKILL.md` (states + a11y gates)\n
## Deliverables (rewrite THIS file on completion)
- Notes detail view structure: properties vs activity feed (updates/comments/history)
- Tasks detail view structure: status transitions + activity feed\n- Evidence tables per `99-EVIDENCE-CONTRACT.md`.

## Acceptance Criteria
- No jargon labels (“kanban”). Plain language.\n- Inline feedback for status changes + undo where destructive.\n- All states covered: empty, loading (if async), error.
