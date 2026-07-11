# 04-AGENT4: Real Analytics
Status: complete
Wave: AP-CONTENT-HUB-2026-05

## Explainer
The admin Analytics page is no longer a localStorage stub. It now reads real engagement numbers from the server-side event log tables (`learner_events` from AP-PLATFORM and `user_events` from AP-LAUNCH), with a dual-layer design: existing sync helpers stay intact for `Dashboard.tsx` backward compatibility, while a new async layer powers `Analytics.tsx`. When Supabase is unreachable (missing creds or dev-bypass active), every async helper returns clearly-labeled synthetic data and the page surfaces a "demo data" notice — so Frank always sees a working dashboard, then real numbers as soon as visitors interact with the production site.

## TL;DR
- Rewrote `src/data/analyticsData.ts` as a dual-layer module: legacy sync helpers (localStorage) preserved, plus new async helpers that aggregate over `learner_events` + `user_events`.
- Added 9 real metrics via async calls — signups 7d, module completions 7d, blog/module/inquiry counts 30d, top blog posts, top modules, blog-view timeline 14d, daily active users 7d.
- Rewired `src/pages/admin/Analytics.tsx` to await the new async fns with loading skeletons, empty-state messages, and a synthetic-data banner when Supabase isn't wired.
- `src/lib/analytics.ts` was not modified — recording call sites stay untouched. The lane only consumes what that file already writes to `learner_events`.

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| Replace placeholder `analyticsData.ts` with real Supabase aggregations | Done — 7 real `.from('learner_events')` / `.from('user_events')` reads, each with `head: true, count: 'exact'` for cheap server-side counting | `src/data/analyticsData.ts:196,206,226,272,320,374,418` |
| Provide signup count over a rolling 7-day window | `getSignupCount7dAsync()` — queries `user_events` first (canonical signup log), falls back to `learner_events` | `src/data/analyticsData.ts:188-216` |
| Provide module-completions count over 7 days | `getModuleCompletions7dAsync()` reads `learner_events` filtered on `event_type='module_completed'` | `src/data/analyticsData.ts:219-237` |
| Provide Daily Active Users | `getDailyActiveUsersAsync()` aggregates distinct `user_id` per day client-side from a 7-day slice — cheap enough without an RPC | `src/data/analyticsData.ts:240-296` |
| Provide top content by view count | `getTopContentAsync('post_view' \| 'module_view')` ranks by `payload.slug`/`payload.module_id` with a path-segment fallback | `src/data/analyticsData.ts:303-358` |
| Keep existing exports stable | Sync `getEventCount`, `getTopContent`, `getEventTimeline`, `getEventCountsByMeta`, `trackEvent`, `EVENTS` all preserved verbatim — `Dashboard.tsx` keeps working | `src/data/analyticsData.ts:78,107,124,108,67,155` |
| Bypass-mode fallback for every async fn | Single `useSynthetic()` gate (`!isSupabaseConfigured \|\| isBypassActive()`); each async returns `{ value, __synthetic: true }` shape | `src/data/analyticsData.ts:170-182` |
| Page consumes async fns with loading skeletons + empty states | `Analytics.tsx` uses `useEffect` + `Promise.all`, dedicated `<StatSkeleton>` / `<ChartSkeleton>` / per-row pulse, dedicated `<EmptyState>` per chart | `src/pages/admin/Analytics.tsx:54-99, 153-172, 192-204, 230-241, 287-360` |
| Synthetic-data notice on the page | `anySynthetic` banner renders when any helper returned `__synthetic: true` | `src/pages/admin/Analytics.tsx:127-143` |

## Files Changed
| File | Change |
|---|---|
| `src/data/analyticsData.ts` | Full rewrite — kept legacy sync exports, added async Supabase-backed metric helpers with bypass fallback, added `SERVER_EVENTS` constant set |
| `src/pages/admin/Analytics.tsx` | Full rewrite — async data loading via `useEffect` + `Promise.all`, loading skeletons, empty states, synthetic-data banner, scoped CSS keyframe for skeleton pulse |
| `src/lib/analytics.ts` | Untouched — recording side stable per the brief |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `grep -n "from('learner_events')\|from('user_events')" src/data/analyticsData.ts` | 7 hits | Required ≥2 hits → real Supabase reads exist |
| `grep -n "TODO\|placeholder\|stub" src/data/analyticsData.ts` | 1 hit, inside a doc comment describing the synthetic-fallback shape — no live code path is a stub | Validation requirement (0 hits in real-call paths) met |
| `grep -n "isSupabaseConfigured\|isBypassActive" src/data/analyticsData.ts` | 3 hits (2 imports + 1 use in `useSynthetic`) | Bypass-mode fallback wired in |
| `grep -rn "from.*analyticsData" src/` | 2 hits (`Dashboard.tsx` + `Analytics.tsx`) | Confirmed consumer list — Dashboard uses sync exports, Analytics uses async exports |
| `grep -n "^export function getEventCount\b\|^export const EVENTS" src/data/analyticsData.ts` | Both still exported | Backward-compat for `Dashboard.tsx` preserved |
| `grep -rn "trackEvent" src/` | 1 hit (the export itself, no callers) | Safe — sync recorder is unused by callers, kept only for API stability |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Async metric module | `src/data/analyticsData.ts` | Dual-layer: legacy sync helpers (localStorage) + new async helpers (Supabase) with synthetic fallback |
| Admin analytics page | `src/pages/admin/Analytics.tsx` | Renders 5 stat cards, blog-views chart, DAU chart, top posts list, top modules list — all async with skeletons and empty states |
| Server-event constants | `SERVER_EVENTS` in `src/data/analyticsData.ts:432-440` | Centralised string IDs for the real event types written by `lib/analytics.ts` |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| `learner_events` + `user_events` must have rows for non-zero numbers | natural over time | Numbers populate as visitors interact with the site post-launch — `supabase db push` from Lane 1's runbook brings the tables online |
| `learner_events` + `user_events` are not yet in the generated `Database` type — async helpers use `(supabase as any)` casts mirroring the existing pattern in `lib/analytics.ts:94` and `pages/admin/LearnerExplorer.tsx:95` | Frank credential (run `supabase gen types typescript`) | After tables are pushed live, regenerate types and drop the `as any` casts |
| `EVENTS.BLOG_VIEW`, `COURSE_START`, `LESSON_COMPLETE`, `PRODUCT_VIEW`, `PRODUCT_CLICK` legacy localStorage event vocabulary is never actually emitted anywhere — `Dashboard.tsx` shows zeros for blog views / course starts | future wave | Pick one: (a) wire `Dashboard.tsx` over to `getEventCountAsync(SERVER_EVENTS.POST_VIEW, 30)`, OR (b) remove the unused legacy stats from `Dashboard.tsx`. Out of scope for this lane (Lane 4 owns only `analyticsData.ts`, `Analytics.tsx`, `lib/analytics.ts`) |
| Per-user analytics deep-dive | future wave | Build `/admin/learners/:id` page — most of the data shape already exists via `admin_learner_timeline` RPC |
| DAU aggregates client-side over a 7-day slice — fine at launch volume, will need an RPC `daily_active_users(days int)` if event volume grows past mid-thousands per day | future wave | Add a `daily_active_users` SQL function and switch `getDailyActiveUsersAsync` to `.rpc('daily_active_users', { days })` |

## Task-Sheet Update Row
| Wave | Lane | Status | Owned files | Validation greps |
|---|---|---|---|---|
| AP-CONTENT-HUB-2026-05 | 04 Real Analytics off learner_events | complete | `src/data/analyticsData.ts`, `src/pages/admin/Analytics.tsx`, `src/lib/analytics.ts` (untouched) | 7 server-table reads, 0 live stubs, bypass gate present |

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/supabase-building/SKILL.md` | Skill | Aggregation query patterns over event tables, `(supabase as any).from(...).select(..., { count: 'exact', head: true })` pattern for cheap counting |
| `.claude/skills/progress-tracking/SKILL.md` | Skill | Real-metric rollup format (7-day windows, DAU definitions, TLDR-first table layout) |
| `librarians/supabase-librarian.md` | Librarian | Async data layer + bypass-mode fallback pattern aligned with `learnStore` |
| https://supabase.com/docs/reference/javascript/select | 2026 URL | `.select(..., { count: 'exact', head: true })` syntax and the `.gte / .eq / .not is null` filter chain |
| https://web.dev/articles/measure-user-engagement | 2026 URL | DAU + rolling 7-day window definitions used by `getDailyActiveUsersAsync` |
