# Agent 4 — Timed AI Skill Assessments & Percentiles
Status: completed
Wave: wave-uxcel-adaptation
Owner: Agent 4

## Explainer
Build the timed skill assessment engine. This allows users to measure their AI skills through quick, timed multiple-choice questions. If they fail to answer in time, it auto-advances. Includes a visual progress bar and cooldown enforcement.

## Proposed Scope & Outcomes
1. **Intro & Cooldown Screen (`src/pages/community/AssessmentIntro.tsx`)**:
   - Displays rules: 20 seconds per question, zero Google searching, cooldown timers.
   - Prevents retaking the test for 14 days based on the database session log.
2. **Assessment Exam Interface (`src/pages/community/AssessmentExam.tsx`)**:
   - Clean viewport layout with a visual countdown slider at the top.
   - "I don't know" button to skip questions (doesn't count as negative points but advances).
   - End-of-test state displaying calculated PX rewards and scores.

## Files to Create/Modify
- [NEW] `src/pages/community/AssessmentIntro.tsx`
- [NEW] `src/pages/community/AssessmentExam.tsx`
- [NEW] `src/pages/community/AssessmentExam.css`
- [NEW] `src/data/assessmentsStore.ts`
