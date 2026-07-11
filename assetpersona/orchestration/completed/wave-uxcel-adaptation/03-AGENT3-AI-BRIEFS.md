# Agent 3 — AI Design & Prompting Briefs
Status: completed
Wave: wave-uxcel-adaptation
Owner: Agent 3

## Explainer
Build the AI Briefs section, matching the design challenges of Uxcel. Users can choose structured AI briefs (e.g. prompt engineering projects, agent flowcharts, RAG optimization), download template assets, complete Task checklists, and submit links to their deliverables.

## Proposed Scope & Outcomes
1. **Briefs Dashboard (`src/pages/community/BriefsList.tsx`)**:
   - List cards showing difficulty levels, duration, and reward PX.
   - Categorized by theme (e.g., Prompt Engineering, LLM Integration, UI Mockups).
2. **Brief Detail Page (`src/pages/community/BriefDetail.tsx`)**:
   - Context, scenario descriptions, task checklists.
   - Click-to-copy asset links and embedded Google Colab / Figma template buttons.
   - Submission input fields for project links, saving records to `brief_submissions`.

## Files to Create/Modify
- [NEW] `src/pages/community/BriefsList.tsx`
- [NEW] `src/pages/community/BriefsList.css`
- [NEW] `src/pages/community/BriefDetail.tsx`
- [NEW] `src/pages/community/BriefDetail.css`
- [NEW] `src/data/briefsStore.ts`
