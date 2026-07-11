# Lane 5 — AI Tutor + Streaks + Achievements
Status: assigned · Wave: 4 (Engage) · % on completion: 90%

## Explainer
The daily-habit layer. AI tutor inside every module (Claude API + prompt-cached module context). Streak tracker with 1 freeze day per 4-day streak. Achievement badges. Optional public completion feed (off by default).

## Owned scope
`supabase/functions/module-tutor/index.ts`, `src/components/learn/Tutor.tsx`, `src/components/learn/StreakCard.tsx`, `src/components/learn/AchievementsRow.tsx`, `src/components/learn/CompletionFeed.tsx`

## Done criteria
- Tutor responds in < 5s with cached module context
- Streak increments on completion · freezes work
- Achievement triggers fire on completion (badge inserts)
- Faceless mode: feed posts skipped
- Per conversational-ai-building skill: graceful failure after 3+ unknowns + escalation route
