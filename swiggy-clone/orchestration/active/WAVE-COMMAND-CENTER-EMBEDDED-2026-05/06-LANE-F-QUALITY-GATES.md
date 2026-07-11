# Lane F — Quality Gates (UX + A11y + Perf)

## Outcome
Run usability and accessibility gates across the embedded Command Center surfaces and document evidence.

## Ownership Boundaries
- Owns: a11y checks, state coverage, cognitive load audit, perf guardrails, polish passes.\n- Does NOT own: core scanning/adapter implementation.\n
## Inputs
- Skill: `.codex/skills/ux-designing/SKILL.md`\n- Screens: Command Center panels + Apps + Assets

## Deliverables (rewrite THIS file on completion)
- State coverage table (loading/empty/error/success/offline)\n- Keyboard navigation checks + focus visibility\n- Contrast check for text and status pills\n- Evidence tables per `99-EVIDENCE-CONTRACT.md`.

## Acceptance Criteria
- Primary CTAs obvious above the fold\n- No dead ends in empty states\n- 44px+ touch targets maintained
