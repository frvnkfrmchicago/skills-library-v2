# Lane 6 — News-to-Module Velocity
Status: assigned · Wave: 5 (Velocity) · % on completion: 100%

## Explainer
The "news drops, module ships fast" pipeline. n8n RSS trigger → dedupe → POST generate-module → admin queue. Velocity dashboard tracks median time-from-news-to-published. Module analytics shows completion rate + drop-off step + AI-tutor heatmap per module.

## Owned scope
`n8n/workflows/news-to-module.json`, `src/pages/admin/ModuleQueue.tsx`, `src/pages/admin/Velocity.tsx`, `src/pages/admin/ModuleAnalytics.tsx`, `n8n/news-sources.md`

## Done criteria
- Workflow imports cleanly · branches dedupe + error
- Admin queue page shows pending drafts with one-click publish/reject
- Velocity dashboard: median time-to-publish, drafts/day, accept rate
- Module analytics: views/starts/completion/drop-off/tutor-heatmap
- RSS sources list seeded
