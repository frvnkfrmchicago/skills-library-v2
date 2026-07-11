# 05-AGENT5: Upgrade.Self `@xyflow` Visualizer

Status: dispatch-ready
Wave: wave-agentic-studyhall-simulator

## Explainer
Implement the front-end interactive visualizers for **Upgrade.Self**. Uses `@xyflow/react` to render a node tree representing parsed concepts.

## Required Scope
- **Files Owned**: `assetpersona/src/components/upgrade-self/MindMap.tsx`, `assetpersona/src/pages/community/UpgradeSelf.tsx`.
- **Tasks**:
  - Mount `@xyflow/react` viewport inside the mind map component.
  - Dynamically map parsed database nodes into flow chart coordinates.
  - Connect node clicking events to show highlight cheat sheets.

## Dispatch Checklists
- [ ] Setup xyflow nodes and edges mapping inside MindMap.tsx.
- [ ] Design Upgrade.Self landing container page.
- [ ] Connect cheatsheet drawers to node triggers.

## Citations
- Skill: `.agents/skills/frontend-architecting/SKILL.md`
- Librarian: `.agents/skills/performance-tuning/SKILL.md`
- 2026 URL: https://xyflow.com/
