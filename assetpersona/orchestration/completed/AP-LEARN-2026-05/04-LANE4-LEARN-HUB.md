# Lane 4 — Learn Hub + Module Reader
Status: assigned · Wave: 3 (Learn) · % on completion: 75%

## Explainer
The learner-facing surface. `/community/learn` shows Today's Drill, Continue, Your Path, News Drops, Browse. `/community/learn/:slug` is the module reader with section scroll + practice + reflect. Faceless toggle hides completions from feed.

## Owned scope
`src/pages/community/Learn.tsx`, `src/pages/community/Module.tsx`, `src/components/learn/TodayCard.tsx`, `src/components/learn/PathCard.tsx`, `src/components/learn/ModuleSection.tsx`, `src/components/learn/PracticeStep.tsx`, `src/components/learn/ReflectStep.tsx`

## Done criteria
- Hub renders all 5 sections with bypass-aware data
- Module reader: scroll → complete → XP + streak bump
- Faceless toggle on profile (boolean)
- Effort score < 12 per module (per flow-designing skill)
- Mobile audit at 360/390/768
