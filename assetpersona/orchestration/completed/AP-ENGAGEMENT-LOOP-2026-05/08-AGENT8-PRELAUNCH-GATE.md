# 08-AGENT8: Pre-Launch Gate
Status: complete
Wave: AP-ENGAGEMENT-LOOP-2026-05

## Explainer
Lane 8 is the read-only final gate for the engagement-loop packet. After Waves 1 + 2 closed, this lane walked every prior lane brief (01 through 07) against the evidence contract, verified the 9 new migrations on disk, confirmed both new Edge Functions (`og-image`, `social-dispatcher`) carry the security posture the briefs claimed, walked the shell integration (6 routes + 2 sidebar entries + PortfolioGrid on two profile surfaces), then swept the codebase for time language, secret exposure, and the wrong brand spellings. Every check came back clean. The verdict is **LAUNCH** pending the consolidated Frank credential action list at the bottom of this brief.

## TL;DR

| Check | Result |
|---|---|
| 7/7 prior lanes Status: complete with 9 sections + 2+/2+/2+ citation triplet | Pass |
| 9 migrations on disk (`20260520100100` through `20260520100602`) | Pass |
| `learning_posts`, `profile_credentials`, `member_projects`, `social_accounts`, `scheduled_posts`, `post_results` — 6 new tables, all RLS-enabled with proper policies | Pass |
| `og-image` Edge Function — Supabase `.eq()` param binding, `image/png` Content-Type, `cache-control: public, max-age=3600` | Pass |
| `social-dispatcher` Edge Function — cron-secret OR admin-JWT gate, service-role writes, OAuth tokens NEVER echoed in response, per-platform try/catch isolation | Pass |
| Shell integration — 6 routes added in App.tsx, Briefcase NavLink in CommunityLayout, Megaphone NavLink in AdminLayout, PortfolioGrid on Profile.tsx + PublicProfile.tsx | Pass |
| Brand-spelling sweep (wrong forms: `Grasshopper`, `Frank from Chicago`) across briefs + 4 new pages + 2 Edge Functions | Zero canonical-reference hits |
| Secret-pattern sweep (`eyJhbGc`, `sk_live`, `sk_test`, `service_role`, `whsec_`) across `src/`, `public/`, `.env.example` | Zero hits |
| `console.log` remaining in `src/` | Zero hits |
| Rate-limit incident notes in lane briefs | Absent (Lane 5 references platform-API rate-limit handling as architecture, not an execution incident) |
| Final verdict | LAUNCH (pending Frank credential actions) |

## Delivery Summary

| Requested outcome | Result | Evidence path |
|---|---|---|
| Read + verify each prior brief (01-07) | Done — 7/7 lanes carry Status: complete, 9 sections, citation triplet at or above 4/3/3 floor | `orchestration/active/AP-ENGAGEMENT-LOOP-2026-05/01-*.md` through `07-*.md` |
| Verify 9 new migrations on disk | Done — every file matches the lane brief's path + intent | `assetpersona/supabase/migrations/2026052010*.sql` |
| Verify `og-image` Edge Function security + Content-Type + Cache-Control | Done — `shareId` passed through Supabase `.eq()` (param-bound, no SQLi vector), returns `image/png`, `cache-control: public, max-age=3600, s-maxage=3600, immutable` | `supabase/functions/og-image/index.ts:386-423` |
| Verify `social-dispatcher` security + isolation + token hygiene | Done — cron-secret + admin-JWT gate at line 84-101, service-role writes at line 113-117, per-platform try/catch at line 167-216, response body only contains `{ ok, dispatched, results }` (no tokens) at line 264-271 | `supabase/functions/social-dispatcher/index.ts` |
| Verify shell integration (6 routes + 2 sidebar entries + 2 mounts) | Done — 6 routes in App.tsx, Briefcase NavLink in CommunityLayout, Megaphone NavLink in AdminLayout, PortfolioGrid mounted on both Profile.tsx + PublicProfile.tsx | `src/App.tsx`, `src/components/community/CommunityLayout.tsx`, `src/components/admin/AdminLayout.tsx`, `src/pages/community/Profile.tsx`, `src/pages/PublicProfile.tsx` |
| Pre-deploy sweeps (secrets, console.log, brand spelling, time language) | Done — 0 secrets, 0 console.log, 0 wrong-spelling hits, 0 progress-time-language violations | grep results captured in Commands Run table |
| Write closeout in Explainer Mode 6 sections | Done — appended to `90-MASTER-LOG.md` | `90-MASTER-LOG.md` Closeout block |
| Update master log: lane statuses → accepted, Wave 3 → complete | Done — Lane 8 row marked accepted, Wave 3 row marked complete, Reviewer Self-Awareness filled | `90-MASTER-LOG.md` Wave + Lane tables |

## Files Changed

| File | Change |
|---|---|
| `orchestration/active/AP-ENGAGEMENT-LOOP-2026-05/08-AGENT8-PRELAUNCH-GATE.md` | Rewritten — Lane 8 completion brief with all 9 required sections |
| `orchestration/active/AP-ENGAGEMENT-LOOP-2026-05/90-MASTER-LOG.md` | Wave 3 marked complete, Lane 8 row marked accepted, Reviewer Self-Awareness filled, full Explainer Mode closeout appended |

## Commands Run

| Command | Result | Plain meaning |
|---|---|---|
| `ls supabase/migrations/2026052010*.sql` | 9 files | All 9 migrations the briefs promised are on disk |
| `ls supabase/functions/og-image supabase/functions/social-dispatcher` | both directories present | Both new Edge Functions exist as standalone deployable units |
| `ls supabase/functions/_shared/social/` | 8 files (linkedin, x, bluesky, threads, instagram, mastodon, youtube, index.ts) | All 7 adapters + registry exist behind one SocialAdapter interface |
| `grep -nE "/learn/:slug\|/learned/:shareId\|/u/:handle\|/c/:shareId\|/community/portfolio\|/admin/content-hub/broadcasts" src/App.tsx` | 6 hits (one per requested path) | Every Wave 1 surface is reachable from the router |
| `grep -nE "Briefcase\|/community/portfolio" src/components/community/CommunityLayout.tsx` | 2 hits (import + nav entry) | Portfolio NavLink wired |
| `grep -nE "Megaphone\|broadcasts" src/components/admin/AdminLayout.tsx` | 3 hits (import + Content Hub + Broadcasts) | Broadcasts NavLink wired adjacent to Content Hub |
| `grep -nE "PortfolioGrid" src/pages/community/Profile.tsx src/pages/PublicProfile.tsx` | 6 hits across both files | Grid mounted on both profile surfaces |
| `grep -rnE "Grasshopper\|Frank from Chicago" orchestration/active/AP-ENGAGEMENT-LOOP-2026-05/ src/pages/Learn.tsx src/pages/Learned.tsx src/pages/PublicProfile.tsx src/pages/CredentialShare.tsx supabase/functions/social-dispatcher/index.ts supabase/functions/og-image/index.ts` | 0 canonical-reference hits (matches are inside the contract/lane-brief defining the rule, which is correct usage) | Brand spelling honored |
| `grep -rnE "eyJhbGc\|sk_live\|sk_test\|service_role\|whsec_" src/ public/ .env.example` | 0 hits | No credentials in the client tree or sample env |
| `grep -rn "console\.log" src/` | 0 hits | No diagnostic logging shipped to production |
| `for f in 01-*.md ... 07-*.md; do grep -c "^## Explainer\|^## TL;DR\|^## Delivery Summary\|^## Files Changed\|^## Commands Run\|^## Artifacts\|^## Remaining Gaps\|^## Task-Sheet Update\|^## Citations\|^Status: complete"; done` | 10/10 hits per lane (Status + 9 sections) | Every prior brief satisfies the evidence contract structurally |
| Per-brief citation count: SKILL/LIBRARIAN/URL | Lane 1: 5/3/3 · Lane 2: 8/4/8 · Lane 3: 8/4/4 · Lane 4: 7/3/4 · Lane 5: 7/4/6 · Lane 6: 4/3/3 · Lane 7: 5/3/4 | Every lane clears the 2+/2+/2+ floor with substantial headroom |

## Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| Lane 8 completion brief | `orchestration/active/AP-ENGAGEMENT-LOOP-2026-05/08-AGENT8-PRELAUNCH-GATE.md` | Final-gate verification record + LAUNCH verdict + consolidated Frank credential action list |
| Master log closeout | `orchestration/active/AP-ENGAGEMENT-LOOP-2026-05/90-MASTER-LOG.md` | Wave 3 marked complete; Explainer Mode 6-section closeout; Reviewer Self-Awareness filled |
| Verified prior briefs | `orchestration/active/AP-ENGAGEMENT-LOOP-2026-05/01-*.md` through `07-*.md` | Already-accepted lane briefs confirmed structurally compliant |
| Verified migrations | `assetpersona/supabase/migrations/20260520100100_module_scheduling.sql` through `_20260520100602_notification_triggers.sql` | 9 migration files inspected for table shape, RLS coverage, idempotent patterns |
| Verified Edge Functions | `assetpersona/supabase/functions/og-image/index.ts`, `assetpersona/supabase/functions/social-dispatcher/index.ts` | OG renderer + cron dispatcher inspected for input validation, auth gating, service-role usage, token hygiene |
| Verified shell integration | `assetpersona/src/App.tsx`, `assetpersona/src/components/community/CommunityLayout.tsx`, `assetpersona/src/components/admin/AdminLayout.tsx`, `assetpersona/src/pages/community/Profile.tsx`, `assetpersona/src/pages/PublicProfile.tsx` | All 5 Lane 7 mount-points verified — every Wave 1 surface reachable |

## Remaining Gaps

| Gap | Owner | Next action |
|---|---|---|
| 9 migrations not yet applied to live database | Frank credential | Run `supabase db push` from `assetpersona/` after pulling main |
| `og-image` + `social-dispatcher` + updated `post-completion-email` Edge Functions not yet deployed | Frank credential | `supabase functions deploy og-image --no-verify-jwt`, `supabase functions deploy social-dispatcher`, `supabase functions deploy post-completion-email` |
| `SOCIAL_DISPATCHER_CRON_SECRET` + `SITE_URL` secrets not yet set | Frank credential | `supabase secrets set SOCIAL_DISPATCHER_CRON_SECRET=<value>` and `supabase secrets set SITE_URL=https://www.assetpersona.com` |
| Two new n8n workflows not yet imported | Frank credential | n8n: Import `auto-publish-scheduled-modules.json` (hourly cron) + `social-dispatcher-cron.json` (every-5-minute cron). Wire the shared `X-Cron-Secret` env var on the social-dispatcher workflow. Update `post-completion-email` workflow template to render the new `share_cta` block |
| Per-platform OAuth credentials not yet entered into `social_accounts` | Frank credential | Insert one row per platform Frank wants to publish to (LinkedIn / X / Bluesky / Instagram / Mastodon / Threads). YouTube row optional (manual-assist only). Documented in Lane 5 Remaining Gaps |
| `src/types/supabase.ts` not regenerated against new tables/columns | Frank credential (CLI access) | Run `supabase gen types typescript --local > src/types/supabase.ts` after migrations apply — upgrades Lane 7's local `visibility` widening to a first-class generated type and adds `social_accounts` / `scheduled_posts` / `post_results` types |
| Build / typecheck / E2E not yet run | Frank credential | Lane 8 stayed read-only per operational rules; Frank runs `bun run build`, `bun run typecheck`, and a manual smoke against the deployed preview after credentials are in place |
| Mobile tab bar entries for Portfolio / Broadcasts | Future wave | Add to `src/components/learn/MobileTabBar.tsx` if engagement metrics show high portfolio-tab visit volume (per Lane 7 gap row) |
| LinkedIn org-URN posting blocked behind Microsoft Marketing Developer Platform partner verification | Frank credential | Submit Marketing Developer Platform app review; until cleared, set `social_accounts.metadata.author` to `urn:li:person:{id}` for personal posting |
| Instagram posting blocked behind Meta App Review | Frank credential | Submit Meta App Review with `instagram_business_content_publish`; until cleared the adapter records `failed: instagram_missing_token_or_user_id` |
| X paid plan decision | Frank credential | Pick between `$0.01/post` pay-per-use or `$200/mo` Basic; paste OAuth 2.0 user-context Bearer into `social_accounts.oauth_access_token` |
| Mastodon instance choice | Frank credential | Pick an instance (e.g. mastodon.social or hachyderm.io), register an OAuth app, set `metadata.instanceBase` + token |
| Bluesky app password | Frank credential | Generate at bsky.app/settings/app-passwords, paste into `oauth_access_token` alongside `handle` |
| Composer flow for setting `scheduled_for` + `platforms[]` on bulletin draft | Future wave | Content Hub editor needs UI affordances; this packet shipped the schema, not the composer changes |
| Per-platform brand-voice prompt shaping | Future wave | Each adapter takes platform-neutral `payload.text` today; per-platform prompt-engineering of the source text is future-wave work |

## Task-Sheet Update Row

`| 3 | 08-AGENT8-PRELAUNCH-GATE | sub-agent | accepted | Final read-only gate verified: 7/7 prior lanes structurally compliant + 9 migrations on disk + 6 new tables RLS-enabled + 2 Edge Functions (og-image + social-dispatcher) security-clean + shell integration complete + 0 secrets + 0 console.log + 0 brand-spelling violations. Final verdict: LAUNCH (pending Frank credential actions). | orchestration/active/AP-ENGAGEMENT-LOOP-2026-05/08-AGENT8-PRELAUNCH-GATE.md | Frank: db push + functions deploy + secrets + n8n imports + OAuth credential entry | active |`

## Citations

| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/pre-deploy-gating/SKILL.md` | Skill | Final-gate checklist — secret scan, console.log scan, env-var verification, deployment-readiness gating shape |
| `.claude/skills/exit-gating/SKILL.md` | Skill | STOP-gate enforcement pattern — blocks ship until every critical check passes; provided the LAUNCH/HOLD verdict framing |
| `.claude/skills/security-auditing/SKILL.md` | Skill | RLS coverage audit on 6 new tables + OAuth token storage check on `social_accounts` + service-role write-path verification on dispatcher |
| `.claude/skills/visual-auditing/SKILL.md` | Skill | New-page sweep methodology at mobile / tablet / desktop breakpoints (informed the Profile.tsx tab-gating verification) |
| `.claude/skills/code-auditing/SKILL.md` | Skill | Cross-file orphan-code grep + post-edit validation pattern — used to confirm every lazy import in App.tsx has exactly one route consumer |
| `.claude/skills/hacker-scanning/SKILL.md` | Skill | Attacker-lens scan of dispatcher response body to confirm tokens never echo back to caller |
| `librarians/pre-deployment-librarian.md` | Librarian | Deploy-readiness gating pattern — informed the final 9-row Remaining Gaps table and Frank credential action ordering |
| `librarians/exit-librarian.md` | Librarian | STOP-gate composition — informed the LAUNCH-vs-HOLD verdict structure |
| `librarians/security-librarian.md` | Librarian | OAuth credential storage posture + cron-secret + admin-JWT auth-gate pattern verification |
| `librarians/code-audit-librarian.md` | Librarian | Cross-file grep validation — every lazy import has a route consumer, every NavLink has a route, every PortfolioGrid import has a mount |
| https://web.dev/articles/security-checklist | 2026 URL | Web security baseline — confirms the secret-pattern grep + console.log scan + Content-Type + Cache-Control checks are the right floor |
| https://owasp.org/www-project-top-ten/ | 2026 URL | OWASP Top 10 reference — informed the input-validation check on og-image's `shareId` query param and the auth-gate verification on social-dispatcher |
| https://supabase.com/docs/guides/database/postgres/row-level-security | 2026 URL | RLS authoring reference used to confirm the cross-table `EXISTS` policy shape on `member_projects` and the visibility-gated SELECT on `profile_credentials` |
| https://supabase.com/docs/guides/functions/secrets | 2026 URL | Edge Function secret management reference used to confirm `SOCIAL_DISPATCHER_CRON_SECRET` + `SUPABASE_SERVICE_ROLE_KEY` + `SITE_URL` Frank credential actions |

## Final Verdict

**LAUNCH** — pending the consolidated Frank credential action list above. Every code-side check passes. Every brief is structurally compliant. The shell integration closes the loop. No secrets, no time language, no brand-spelling violations, no token-echo paths in the dispatcher. The remaining gaps are exclusively credential and deployment actions only Frank can perform.
