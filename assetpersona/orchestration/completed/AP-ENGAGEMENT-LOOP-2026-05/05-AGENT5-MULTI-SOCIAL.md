# 05-AGENT5: Multi-Social Dispatcher
Status: complete
Wave: AP-ENGAGEMENT-LOOP-2026-05

## Explainer
Before this lane the only social channel was Threads (via the existing `threads-broadcast` Edge Function + n8n workflow ported from frvnkfrmchicago). Frank wanted LinkedIn + X + Bluesky + Instagram + Mastodon + (manual-assist) YouTube Community on top — plus calendar scheduling and a single "what's been posted" admin monitor. The 2026 research said the right pattern is **adapter-behind-dispatcher** (Postiz-style): one Edge Function picks up due posts on a cron, hands the platform-neutral payload to a per-platform TypeScript adapter, and records every attempt in an audit table. Frank reviews the result in `/admin/content-hub/broadcasts`.

## TL;DR
- 2 migrations land — `social_broadcast` (social_accounts + scheduled_posts + post_results enums/tables/RLS) and `content_hub_scheduling` (scheduled_for + platforms[] columns on bulletins).
- 1 dispatcher Edge Function (`social-dispatcher`) accepts the cron secret OR an admin JWT, loads due rows, fans out to every platform in `target_platforms`, writes each attempt to `post_results`, marks the row dispatched.
- 7 adapter modules behind a single `SocialAdapter` interface — LinkedIn (Posts API v2), X (API v2 /tweets), Bluesky (AT Proto `createRecord`), Threads (wraps existing `_shared/threads.ts`), Instagram (Graph API v21 container model), Mastodon (per-instance OAuth `/api/v1/statuses`), YouTube (manual-assist stub).
- 1 admin page (`BroadcastsMonitor.tsx`) + token-only CSS — week calendar of upcoming posts with per-platform pills, and a recent-activity table with permalinks and errors.
- 1 data layer (`broadcasts.ts`) — bypass/remote mirror of the contentHub.ts pattern so dev clicks through with no Supabase deploy.
- 1 n8n cron workflow (`social-dispatcher-cron.json`) — fires every 5 minutes, posts to `/functions/v1/social-dispatcher` with the shared `X-Cron-Secret` header.
- Existing `threads-broadcast` Edge Function + `_shared/threads.ts` helper are untouched. The new Threads adapter WRAPS the helper — does not duplicate or replace it.

## Delivery Summary

| Requested outcome | Result | Evidence path |
|---|---|---|
| Adapter-behind-dispatcher schema | Three RLS-gated tables + 2 enums + 3 indexes shipped | `assetpersona/supabase/migrations/20260520100500_social_broadcast.sql` |
| Bulletin scheduling extension | `scheduled_for` + `platforms[]` columns added with partial index | `assetpersona/supabase/migrations/20260520100501_content_hub_scheduling.sql` |
| Cron-triggered fan-out function | Cron-secret + admin-JWT gated; loads due rows; isolated per-platform errors; writes audit rows | `assetpersona/supabase/functions/social-dispatcher/index.ts` |
| 7 platform adapters | All export `publish(payload, account)`; share the `SocialAdapter` interface; YouTube returns `manual_required` | `assetpersona/supabase/functions/_shared/social/{linkedin,x,bluesky,threads,instagram,mastodon,youtube,index}.ts` |
| Admin monitor view | Week calendar + recent-activity table; platform pills link to permalinks; mobile-first | `assetpersona/src/pages/admin/BroadcastsMonitor.tsx` + `.css` |
| Admin data layer | List/get/cancel functions w/ bypass storage | `assetpersona/src/data/broadcasts.ts` |
| n8n cron workflow | Every 5 minutes → POST to dispatcher with `X-Cron-Secret` | `assetpersona/n8n/workflows/social-dispatcher-cron.json` |

## Files Changed

| File | Change |
|---|---|
| `assetpersona/supabase/migrations/20260520100500_social_broadcast.sql` | NEW — social_accounts + scheduled_posts + post_results + enums + RLS + partial index on (scheduled_for) WHERE dispatched_at IS NULL |
| `assetpersona/supabase/migrations/20260520100501_content_hub_scheduling.sql` | NEW — bulletin `scheduled_for` + `platforms[]` columns + draft-scheduled partial index |
| `assetpersona/supabase/functions/social-dispatcher/index.ts` | NEW — cron-callable dispatcher Edge Function |
| `assetpersona/supabase/functions/_shared/social/index.ts` | NEW — `SocialAdapter` interface + adapter registry + shared helpers (`truncateOnWord`, `httpErrorToResult`) + `Platform` type mirroring the Postgres enum |
| `assetpersona/supabase/functions/_shared/social/linkedin.ts` | NEW — LinkedIn Posts API v2 adapter (OAuth Bearer, w_member_social or w_organization_social) |
| `assetpersona/supabase/functions/_shared/social/x.ts` | NEW — X API v2 /tweets adapter (OAuth Bearer, 280 cap, quota-aware 403 → rate_limited) |
| `assetpersona/supabase/functions/_shared/social/bluesky.ts` | NEW — AT Proto adapter (app password, createSession + createRecord, 300 cap) |
| `assetpersona/supabase/functions/_shared/social/threads.ts` | NEW — Threads adapter WRAPPING `_shared/threads.ts` helpers (container → 30s wait → publish) |
| `assetpersona/supabase/functions/_shared/social/instagram.ts` | NEW — Graph API v21 adapter (image-required, container + media_publish) |
| `assetpersona/supabase/functions/_shared/social/mastodon.ts` | NEW — per-instance `/api/v1/statuses` adapter w/ Idempotency-Key |
| `assetpersona/supabase/functions/_shared/social/youtube.ts` | NEW — manual-assist stub returning `{ status: 'manual_required', deepLink, copyText }` |
| `assetpersona/src/data/broadcasts.ts` | NEW — admin-only `listScheduledPosts` / `listPostResults` / `getCalendarRange` / `cancelScheduledPost` w/ bypass mirror |
| `assetpersona/src/pages/admin/BroadcastsMonitor.tsx` | NEW — week calendar + recent-activity table |
| `assetpersona/src/pages/admin/BroadcastsMonitor.css` | NEW — token-only, 44px touch targets, mobile-first responsive |
| `assetpersona/n8n/workflows/social-dispatcher-cron.json` | NEW — `*/5 * * * *` → POST `/functions/v1/social-dispatcher` w/ X-Cron-Secret |
| `assetpersona/supabase/functions/threads-broadcast/index.ts` | UNTOUCHED — read-only per scope contract |
| `assetpersona/n8n/workflows/threads-broadcast.json` | UNTOUCHED — read-only per scope contract |
| `assetpersona/supabase/functions/_shared/threads.ts` | UNTOUCHED — new adapter WRAPS this helper |

## Commands Run

| Command | Result | Plain meaning |
|---|---|---|
| `ls assetpersona/supabase/migrations/20260520100500_social_broadcast.sql assetpersona/supabase/migrations/20260520100501_content_hub_scheduling.sql` | both present | Both new schema files exist on disk |
| `ls assetpersona/supabase/functions/social-dispatcher/index.ts` | 1 | Cron-callable dispatcher Edge Function file exists |
| `ls assetpersona/supabase/functions/_shared/social/{linkedin,x,bluesky,threads,instagram,mastodon,youtube,index}.ts` | 8 | All 7 adapters + registry exist |
| `ls assetpersona/n8n/workflows/social-dispatcher-cron.json` | 1 | Cron workflow file exists |
| `ls assetpersona/src/pages/admin/BroadcastsMonitor.tsx assetpersona/src/pages/admin/BroadcastsMonitor.css assetpersona/src/data/broadcasts.ts` | 3 | Admin monitor + CSS + data layer all exist |

## Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| Multi-social broadcast schema | `assetpersona/supabase/migrations/20260520100500_social_broadcast.sql` | Per-platform OAuth credential storage + queue + audit |
| Bulletin scheduling extension | `assetpersona/supabase/migrations/20260520100501_content_hub_scheduling.sql` | Adds `scheduled_for` + `platforms[]` to bulletins |
| Dispatcher Edge Function | `assetpersona/supabase/functions/social-dispatcher/index.ts` | Cron-triggered fan-out across N adapters; service-role writes |
| Adapter registry + interface | `assetpersona/supabase/functions/_shared/social/index.ts` | One file the dispatcher imports; defines `SocialAdapter` + `getAdapter` |
| LinkedIn adapter | `assetpersona/supabase/functions/_shared/social/linkedin.ts` | LinkedIn Posts API v2 + LinkedIn-Version: 202508 |
| X adapter | `assetpersona/supabase/functions/_shared/social/x.ts` | X API v2 /tweets w/ quota-aware 403 mapping |
| Bluesky adapter | `assetpersona/supabase/functions/_shared/social/bluesky.ts` | AT Proto session + createRecord, 300-char cap |
| Threads adapter | `assetpersona/supabase/functions/_shared/social/threads.ts` | Wraps existing `_shared/threads.ts` for the dispatcher |
| Instagram adapter | `assetpersona/supabase/functions/_shared/social/instagram.ts` | Graph API v21 container model — requires `mediaUrls[0]` |
| Mastodon adapter | `assetpersona/supabase/functions/_shared/social/mastodon.ts` | Per-instance OAuth + Idempotency-Key |
| YouTube adapter | `assetpersona/supabase/functions/_shared/social/youtube.ts` | Manual-assist stub returning copy text + deep link |
| Broadcasts data layer | `assetpersona/src/data/broadcasts.ts` | Admin reads + cancel; bypass/remote mirror |
| Broadcasts admin page | `assetpersona/src/pages/admin/BroadcastsMonitor.tsx` | Week calendar + recent-activity table |
| Broadcasts admin styling | `assetpersona/src/pages/admin/BroadcastsMonitor.css` | Token-only, 44px touch targets, mobile-first |
| Dispatcher cron workflow | `assetpersona/n8n/workflows/social-dispatcher-cron.json` | Every 5 minutes triggers the Edge Function |

## Remaining Gaps

| Gap | Owner | Next action |
|---|---|---|
| LinkedIn org-URN posting blocked behind Microsoft Marketing Developer Platform partner verification | Frank credential | Submit Marketing Developer Platform app review; until cleared, leave `social_accounts.metadata.author` set to `urn:li:person:{id}` for personal posting |
| X paid plan decision | Frank credential | Decide between `$0.01/post` pay-per-use or `$200/mo` Basic; once chosen, paste OAuth 2.0 user-context Bearer into `social_accounts.oauth_access_token` for the `x` row |
| Instagram posting blocked behind Meta App Review | Frank credential | Submit Meta App Review with `instagram_business_content_publish`; until cleared, no Instagram fan-outs land — the adapter records `failed: instagram_missing_token_or_user_id` |
| Mastodon instance choice | Frank credential | Pick an instance (e.g. mastodon.social or hachyderm.io), register an OAuth app there, set `metadata.instanceBase` + token on the `mastodon` row |
| Bluesky app password | Frank credential | Generate at bsky.app/settings/app-passwords, paste into `oauth_access_token` for the `bluesky` row alongside `handle` |
| Threads long-lived token rotation | Frank credential | Existing 60-day Meta token rotation continues to apply; the wrapper relies on whatever the frvnkfrmchicago pipeline has set |
| YouTube Community publishing | Future wave | Manual-assist only in 2026 — re-evaluate if Google ships a Community publishing endpoint |
| Database type regeneration | Next lane | Run `mcp__fe6d2c3a__generate_typescript_types` after migrations apply so `src/types/supabase.ts` includes `social_accounts`, `scheduled_posts`, `post_results`, and the new enums |
| Route wiring for `/admin/content-hub/broadcasts` | Next lane | Lane 7 owns the router registration per the wave plan |
| Composer flow for setting `scheduled_for` + `platforms[]` on a bulletin draft | Future wave | Content Hub editor needs UI affordances; this lane shipped the schema, not the composer changes |
| Per-platform brand-voice prompt shaping | Future wave | Each adapter takes platform-neutral `payload.text` today; per-platform prompt-engineering of the source text (length, tone, link strategy) is a Lane 6 / future-wave concern |

## Task-Sheet Update

| Field | Value |
|---|---|
| Lane | 05-AGENT5 Multi-Social Dispatcher |
| Wave | AP-ENGAGEMENT-LOOP-2026-05 |
| Status | complete |
| Owned scope satisfied | yes — 13 NEW files, 0 modifications to read-only Threads helper / function / workflow |
| Validation status | all `ls` checks from the brief pass |
| Time language | absent |
| Brand spelling | Grazzhopper + frvnkfrmchicago preserved verbatim where they appear |
| Rate-limit incident notes | absent |

## Citations

| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/api-integrating/SKILL.md` | Skill | Per-platform OAuth Bearer + retry/backoff + quota-aware 403 → rate_limited mapping |
| `.claude/skills/n8n-automating/SKILL.md` | Skill | Cron-trigger pattern + secret-guarded HTTP webhook + retry-on-5xx settings |
| `.claude/skills/supabase-building/SKILL.md` | Skill | service_role write path for dispatcher + admin-scoped RLS read policies |
| `.claude/skills/backend-hardening/SKILL.md` | Skill | Per-platform rate-limit handling + independent per-platform errors + Idempotency-Key on Mastodon |
| `.claude/skills/security-auditing/SKILL.md` | Skill | OAuth token storage in social_accounts; no token echo in `error_message`; 512-char body cap on response_payload |
| `.claude/skills/database-designing/SKILL.md` | Skill | Partial index on (scheduled_for) WHERE dispatched_at IS NULL + composite (scheduled_post_id, platform) index for monitor reads |
| `.claude/skills/prompt-engineering/SKILL.md` | Skill | Per-platform character + format constraint mapping — adapter shapes payload per platform (Threads 500 / X 280 / Bluesky 300 / LinkedIn 3000 / Instagram 2200) |
| `librarians/api-integration-librarian.md` | Librarian | Postiz-style adapter-behind-dispatcher pattern + uniform `PublishResult` shape |
| `librarians/supabase-librarian.md` | Librarian | Audit-table pattern (`post_results`) + dispatched_at mark-once semantics |
| `librarians/multi-agent-librarian.md` | Librarian | File-bound 7-adapter decomposition with one file per platform — no overlap |
| `librarians/security-librarian.md` | Librarian | RLS coverage on every token-bearing table + service-role isolation for the dispatcher |
| https://github.com/gitroomhq/postiz-app | 2026 URL | Reference architecture (NestJS + Prisma + Temporal) for adapter-behind-dispatcher; informed the SocialAdapter interface |
| https://zernio.com/blog/linkedin-posting-api | 2026 URL | LinkedIn Posts API v2 endpoint + LinkedIn-Version header + partner verification reality |
| https://zernio.com/blog/twitter-api-pricing | 2026 URL | X API pricing $0.01/post pay-per-use OR $200/mo Basic + 403-quota mapping |
| https://developers.facebook.com/docs/threads/reference/publishing/ | 2026 URL | Threads container → 30s wait → publish two-step reference |
| https://docs.bsky.app/docs/advanced-guides/rate-limits | 2026 URL | Bluesky 5k pts/hr + 35k/day rate limits + createRecord cost |
| https://community.zapier.com/how-do-i-3/how-to-automate-youtube-community-post-15727 | 2026 URL | YouTube Community NO publishing API constraint → manual-assist only |
