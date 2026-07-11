# Agent 6 — Engagement, Tracking & CRM
Status: assigned
Wave: 3 (Engagement)
% on completion: 90%
Owner: Codex
Single source of truth: this file only.

## Explainer
The audit found no analytics, no CRM view of inquiries, and no behavior-triggered engagement. This lane adds privacy-first analytics, a typed `track()` interface, an Inquiries Kanban for Frank to work leads, and the data hooks that feed Agent 4's nudge workflow. Search-building skill applied for full-text blog/resource search.

## TL;DR
- Plausible analytics integrated with a typed `track()` API.
- Custom events: signup, profile_completed, inquiry_submitted, event_registered, post_view, tier_upgrade.
- `/admin/inquiries` Kanban — New → Contacted → Qualified → Won / Lost. Filter by `service_interest`. Quick-reply via `mailto:` template.
- `MemberCRM.tsx` enriched: last_seen, post count, event RSVPs, linked inquiries.
- Postgres tsvector full-text search across blog + resources.
- Every tracked event also writes to `user_events` so Agent 4's nudge workflow can read it.

| Field | Value |
|---|---|
| Mission | See what users do, work the inquiries, trigger relevant nudges only |
| Owned scope | `src/lib/analytics.ts` (new), `src/pages/admin/Inquiries.tsx` (new), `src/pages/admin/MemberCRM.tsx` (extend), `src/components/admin/InquiryCard.tsx` (new), `src/lib/search.ts` (new) |
| Do not touch | Auth, consultant pages, n8n workflows (read-only contract) |
| Inputs | Agent 1 (inquiries + user_events tables), Agent 2 (auth state shape), Agent 4 (nudge contract) |
| Skills required | `.claude/skills/onboarding-designing/SKILL.md`, `.claude/skills/search-building/SKILL.md`, `.claude/skills/frontend-architecting/SKILL.md` |
| Validation commands | `bun run build`, manual Kanban drag-test, Plausible event verification, search query test |
| Done criteria | Plausible records all custom events, Kanban renders all inquiries with status drag, MemberCRM shows enrichment, search returns results across blog/resources |
| Output contract | Rewrite this file with completion evidence per `99-EVIDENCE-CONTRACT.md` |

## Build Tasks

- [ ] `analytics.ts`: typed `track(event: AnalyticsEvent, props?: Record<string, unknown>)`. Wraps Plausible. Also writes to `user_events` via Supabase for events that drive nudges.
- [ ] Add Plausible script to `index.html` with event-tracking opt-in.
- [ ] Wire events in: `Login.tsx` (signup), `WelcomeModal.tsx` (profile_started), profile editor (profile_completed), `InquiryForm` (inquiry_submitted), event registration page (event_registered), BlogPost page (post_view), tier upgrade hook (tier_upgrade).
- [ ] `Inquiries.tsx`: Kanban board, columns by status, drag-drop updates DB. Filter chips by `service_interest`. Quick-reply opens templated `mailto:` per form_type.
- [ ] `MemberCRM.tsx`: add columns for last_seen, post count, event RSVPs, related inquiries.
- [ ] `search.ts`: PostgREST RPC over Postgres `to_tsvector` index across `blog_posts.body_md` and `products.description`.
- [ ] Add a search input to `Resources.tsx` and `Blog.tsx`.

## Validation Plan

| Check | Action | Pass condition |
|---|---|---|
| Plausible events fire | Plausible dashboard | each custom event visible |
| user_events mirror | query `user_events` after a tracked event | row present |
| Kanban drag | drag a card New → Contacted | DB row updated |
| Search relevance | search "AI literacy" | top result is the matching post |
| MemberCRM enrichment | open a member | last_seen shows recent activity |

## Completion Rule

Rewrite this file with completion evidence. No time language.
