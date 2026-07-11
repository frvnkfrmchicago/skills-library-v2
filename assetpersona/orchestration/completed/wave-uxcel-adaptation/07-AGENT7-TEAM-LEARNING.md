# Agent 7 — Team Learning & Group Study Dashboard
Status: completed
Wave: wave-uxcel-adaptation
Owner: Agent 7

## Explainer
Build the co-op team learning features. Users can join study teams, set team daily goals, view a collective team progress bar, compete on the team leaderboards, and invite teammates to challenges.

## Reference Citations
- **Flow Rules**: [flow-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/flow-designing/SKILL.md) and [flow-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/flow-librarian/SKILL.md)
- **Onboarding / Group Invites**: [onboarding-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/onboarding-designing/SKILL.md)

## Proposed Scope & Outcomes
1. **Team Landing & Lobby (`src/pages/community/TeamLearning.tsx`)**:
   - List active groups, group membership list, group invites list.
   - Join/leave team forms.
2. **Team Progress Panel**:
   - Renders progress bars tracking collective team PX goals.
   - Triggers group rewards on milestone completion.
3. **Private Group Feed & Standings**:
   - Group chat thread or activity feed.
   - Internal team rankings.

## Files to Create/Modify
- [NEW] `src/pages/community/TeamLearning.tsx`
- [NEW] `src/pages/community/TeamLearning.css`
- [NEW] `src/data/teamsStore.ts`
