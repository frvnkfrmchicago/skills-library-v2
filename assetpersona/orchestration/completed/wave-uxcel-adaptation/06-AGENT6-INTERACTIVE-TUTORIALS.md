# Agent 6 — Editorial Tutorials & Interactive Runner
Status: completed
Wave: wave-uxcel-adaptation
Owner: Agent 6

## Explainer
Implement structured, editorial-style tutorials for AI prompting and model integration. Each tutorial features clear progress tracking, bookmarks, helpfulness reactions, and an interactive code editor where users can edit and run Javascript snippets in real time inside a browser sandbox.

## Proposed Scope & Outcomes
1. **Interactive Code Runner (`src/components/learn/InteractiveRunner.tsx`)**:
   - Clean textarea input alongside a "Run" button and an output preview console.
   - Executes code inside a restricted iframe wrapper.
2. **Tutorial Reading Interface (`src/pages/community/TutorialDetail.tsx`)**:
   - Structured typography for text instructions.
   - Reaction buttons for "Was this helpful?" and bookmarks.
   - Dashboard page grouping guides.

## Files to Create/Modify
- [NEW] `src/components/learn/InteractiveRunner.tsx`
- [NEW] `src/components/learn/InteractiveRunner.css`
- [NEW] `src/pages/community/TutorialsList.tsx`
- [NEW] `src/pages/community/TutorialDetail.tsx`
- [NEW] `src/pages/community/TutorialDetail.css`
- [NEW] `src/data/tutorialsStore.ts`
