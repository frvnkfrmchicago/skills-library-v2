# Agent 11 — Routing & State Integration
Status: completed
Wave: wave-uxcel-adaptation
Owner: Agent 11

## Explainer
Integrate the routes, navigation menus, and global state tracking for the newly created features. Wires the sidebar navigation, registers React router endpoints, and hooks the notifications dispatcher so that learning actions trigger live toasts.

## Reference Citations
- **Layout Architecture**: [experience-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/experience-designing/SKILL.md)
- **Deployment Gates**: [exit-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/exit-librarian/SKILL.md)

## Proposed Scope & Outcomes
1. **Routing Registration**:
   - Register routes in `src/App.tsx` for Briefs, Assessments, Tutorials, Teams, Showcase, Arcade, and Certificates.
   - Guard premium sections with tier checks.
2. **Sidebar Navigation**:
   - Add sidebar entries with SVG icons matching Peach-Tech tokens.
3. **Notification Integration**:
   - Dispatch toast messages when users reach their 100 PX daily goal, move up a league zone, or finish assessments.

## Files to Create/Modify
- [MODIFY] `src/App.tsx`
- [MODIFY] `src/components/navigation/Sidebar.tsx`
