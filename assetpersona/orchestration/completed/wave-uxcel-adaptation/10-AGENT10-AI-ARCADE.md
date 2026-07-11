# Agent 10 — AI Arcade Games
Status: completed
Wave: wave-uxcel-adaptation
Owner: Agent 10

## Explainer
Build the AI Arcade section. Includes two game engines:
1. **Prompt Battle Arena**: Prompt an LLM to match a target sentiment or output phrase under constraints (character limits, forbidden tokens). Renders matching percentage feedback and high scores.
2. **Jailbreak Puzzle**: Multi-level puzzle where users attempt to prompt an AI agent into revealing a protected secret code, testing prompt security skills.

## Reference Citations
- **Game Loops & CSS Grids**: [web-game-foundations](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/web-game-foundations/SKILL.md)
- **Architecture Strategy**: [playmaster-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.codex/skills/playmaster-librarian/SKILL.md)

## Proposed Scope & Outcomes
1. **Arcade Lobby (`src/pages/community/ArcadeLobby.tsx`)**:
   - Lists prompt battles and jailbreak challenges with game covers and high scores.
2. **Prompt Battle Engine (`src/pages/community/PromptBattle.tsx`)**:
   - Game canvas showing rules, constraint badges, user prompt text-area, evaluation feedback, and PX prize award triggers.
3. **Jailbreak puzzle engine (`src/pages/community/JailbreakChallenge.tsx`)**:
   - Terminal-style layout, prompt instructions, system role description, secret code validation, level-complete transitions.

## Files to Create/Modify
- [NEW] `src/pages/community/ArcadeLobby.tsx`
- [NEW] `src/pages/community/PromptBattle.tsx`
- [NEW] `src/pages/community/JailbreakChallenge.tsx`
- [NEW] `src/pages/community/Arcade.css`
- [NEW] `src/data/arcadeStore.ts`
