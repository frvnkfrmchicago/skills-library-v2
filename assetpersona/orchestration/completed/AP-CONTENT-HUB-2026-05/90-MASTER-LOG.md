# Master Log — AP-CONTENT-HUB-2026-05

## Explainer
The master log is updated by the lead orchestrator after reading a completed lane brief file. One row per lane. Points back to the updated lane brief so evidence is always traceable.

## TL;DR
Wave packet closing the gap between the dormant module pipeline and a live publishing posture, adding a Grazzhopper-style Content Hub for short bulletins, and porting the frvnkfrmchicago Threads auto-poster pattern. 6 lanes across 2 waves.

## Wave Status

| Wave | Name | % on completion | Status |
|------|------|----|--------|
| 1 | Deploy runbook + Content Hub + Threads broadcast + Real analytics + Persistence migration | 85% | **complete** |
| 2 | Pre-launch gate | 100% | **complete** |

Current production: **100% code-side**. Next: **Frank credential actions** (Lane 1's runbook + Lane 3 secrets + n8n import) to flip the wave live.

## Lane Status

| Wave | Lane | Owner | Review status | Summary | Updated doc path | Next action | Archive state |
|---|---|---|---|---|---|---|---|
| 1 | 01-AGENT1-DEPLOY-RUNBOOK | sub-agent | accepted | RUNBOOK with 11 ordered Frank-credential steps + idempotent seed migration adding 5 active AI/dev RSS feeds to news_sources; surfaced schema-name reconciliation (real table is `news_sources`, not `module_sources`) | `orchestration/active/AP-CONTENT-HUB-2026-05/01-AGENT1-DEPLOY-RUNBOOK.md` | Frank runs the runbook | active |
| 1 | 02-AGENT2-CONTENT-HUB | sub-agent | accepted | New `content_hub_bulletins` table (2 enums, 4 RLS policies, 2 indexes, updated_at trigger); new `src/data/contentHub.ts` data layer; new `/admin/content-hub` list + composer pages with severity picker + state dots + 30s auto-save; sidebar nav entry under Modules | `orchestration/active/AP-CONTENT-HUB-2026-05/02-AGENT2-CONTENT-HUB.md` | `supabase db push` | active |
| 1 | 03-AGENT3-THREADS-BROADCAST | sub-agent | accepted | New `_shared/threads.ts` (BRAND_VOICE_PROMPT verbatim from frvnkfrmchicago + Threads body builders) + new `threads-broadcast` Edge Function (Gemini 2.0 Flash + HMAC + signed outbound) + new `n8n/workflows/threads-broadcast.json` (Webhook → verify → container → 30s → publish); manual trigger for now | `orchestration/active/AP-CONTENT-HUB-2026-05/03-AGENT3-THREADS-BROADCAST.md` | set `N8N_THREADS_BROADCAST_URL` + import n8n workflow + deploy Edge Function | active |
| 1 | 04-AGENT4-REAL-ANALYTICS | sub-agent | accepted | analyticsData.ts dual-layer rewrite (sync legacy + new async over learner_events/user_events); Analytics.tsx async with skeletons + empty states + synthetic banner; 9 real metrics across signups, completions, DAU, top content. Surfaced Dashboard.tsx legacy-stat gap (blog_view/course_start never emitted) for future wave. | `orchestration/active/AP-CONTENT-HUB-2026-05/04-AGENT4-REAL-ANALYTICS.md` | `supabase db push` + `supabase gen types` to drop `as any` casts | active |
| 1 | 05-AGENT5-PERSISTENCE-MIGRATION | sub-agent | accepted | New `blog_drafts` table + tightened `studio_pages` RLS (admin-scoped writes, published rows publicly readable); `blogDrafts.ts` mirrors saves to Supabase + new `hydrateDraftsFromSupabase()`; `studioStorage.ts` Supabase-first with localStorage fallback; function signatures preserved so no consumer page changes. Used real project trigger fn `public.update_updated_at()` not the brief's `handle_updated_at()` | `orchestration/active/AP-CONTENT-HUB-2026-05/05-AGENT5-PERSISTENCE-MIGRATION.md` | `supabase db push` + wire hydration call into App.tsx in next lane | active |
| 2 | 06-AGENT6-PRELAUNCH-GATE | sub-agent | accepted | Read-only Wave 2 gate. Verified all 5 prior lanes (status: complete, 9 sections, citation triplet, brand spellings, no time language). Confirmed RLS + admin-scoped policies on `content_hub_bulletins`, `blog_drafts`, `studio_pages`. Confirmed HMAC verify (inbound) + HMAC sign (outbound) on the Threads pipeline + `THREADS_FRVNK_TOKEN` never read or echoed by the Edge Function + `BRAND_VOICE_PROMPT` exported with verbatim ban list. Pre-deploy sweep clean: 0 console.log, 0 secret literals, 3 content-hub routes registered, 1 sidebar entry. Final verdict: **LAUNCH** | `orchestration/active/AP-CONTENT-HUB-2026-05/06-AGENT6-PRELAUNCH-GATE.md` | Frank executes the 12 credential actions in Lane 1's runbook | active |

## Review Rules

| If you see this | Do this |
|---|---|
| Lane brief file missing rewrite sections | mark `needs-rerun` |
| Missing Citations triplet | mark `needs-rerun` |
| Scope delivered and evidenced | mark `accepted` |
| Wrong scope or contradictory claims | mark `rejected` |
| Time language used anywhere | mark `needs-rerun` |
| Brand spelling violated (Grasshopper / Frank from Chicago) | mark `needs-rerun` |

## Reporting Format

After each lane: `Lane N of 6 complete → X% wave done. Next: Lane N+1 — <name>.`
After each wave: `Wave N of 2 complete → X% production done. Next: Wave N+1 — <wave name>.`

## Reviewer Self-Awareness

Three lanes independently surfaced real-state reconciliations because the agents read the actual code and migrations instead of trusting the dispatch brief verbatim. This is exactly what we want — and the pattern is worth recording here so the next dispatch is sharper.

| Lane | Brief said | Reality | Lane's choice |
|---|---|---|---|
| 1 | `module_sources` table with column `name` | Real table is `public.news_sources` with `(label, rss_url, active)`; the `news-to-module.json` n8n workflow already reads `news_sources` | Seed targets reality. Migration filename kept the brief-mandated stem for traceability. |
| 2 | "1 route hit" in `App.tsx` for `content-hub` | Lane 2 actually shipped 3 routes (list + new + edit/:id) — the composer page needs two routes (`/new` and `/edit/:id`) for the create vs. edit flows | 3 routes are correct; brief undercounted. Lane 6 sweep confirmed Lane 2's self-reported count. |
| 4 | Implies Dashboard.tsx will pick up the new async helpers | `Dashboard.tsx`'s legacy `blog_view` / `course_start` event names are never emitted anywhere in the codebase | Lane 4 preserved the sync surface (no Dashboard.tsx changes — out of owned scope), flagged the dead vocabulary as a future-wave cleanup. |
| 5 | Trigger fn `handle_updated_at()` | Real trigger fn is `public.update_updated_at()` (defined in `20260414180447_create_events_system.sql`, reused across 11+ migrations including `blog_posts`) | Migrations wire the real fn. Both new migrations match the convention every other migration uses. |
| 5 | JSON column named `root`, title column named `name` | Existing Studio code reads `puck_data` and `title`; the brief explicitly forbade consumer-file changes | Kept existing column names, added the brief's *missing* first-class fields (`author_id`, `metadata`, `published_at`) so the type system stays correct. |

What this tells the next dispatch: **the dispatch brief is a starting hypothesis, not a contract**. Lanes that read the actual file system + migrations + workflows are more useful than lanes that blindly type out the brief's prescriptions. The evidence-contract format (Files Changed + Commands Run with grep output + Remaining Gaps) is the right vehicle for surfacing these reconciliations so they don't get buried in chat summaries.

Brand-spelling sweep note: there are 7 hits for `Grasshopper` or `Frank from Chicago` across the wave packet, and every single one is in a line that *defines what the wrong spelling looks like* so the verification grep can detect it (EVIDENCE-CONTRACT.md "Never 'Grasshopper'", 06-AGENT6 brief's validation command, etc.). Those are evidence of the rule being enforced, not violated. Zero hits in any code file.

## Closeout

**Wave AP-CONTENT-HUB-2026-05 — orchestration-librarian Explainer Mode 6 sections.**

### 1. TLDR
Wave 1 landed the Content Hub readiness work in five parallel lanes: deploy runbook + RSS seed, the `/admin/content-hub` bulletin surface, the Threads broadcast pipeline ported from `frvnkfrmchicago-threads.json`, real analytics off `learner_events` + `user_events`, and durable persistence for blog drafts + studio pages. Wave 2's read-only Lane 6 verified every brief and every new file against the evidence contract. **Final verdict: LAUNCH.** Frank executes the 12 credential actions enumerated in section 5 below and the wave is live.

### 2. What each component delivers

| Lane | User-visible outcome | Hands-on artifact |
|---|---|---|
| 1 — Deploy Runbook + RSS Seed | A single document Frank follows top-to-bottom from `supabase db push` through smoke test; five active AI/dev RSS feeds land in the database so the first cron tick of `news-to-module` produces real module drafts at `/admin/modules/queue` instead of running against empty source rows | `orchestration/active/AP-CONTENT-HUB-2026-05/RUNBOOK.md`, `supabase/migrations/20260519100000_seed_module_sources.sql` |
| 2 — Content Hub | A new `/admin/content-hub` admin route with a list view (search + severity-filter chips + state-dot rows) and a single-form composer (title, summary, body, source URL, severity picker, status picker, 30s auto-save). Severity tiers are `info`/`advisory`/`important`/`breaking`. Sidebar entry sits directly under Modules with the Phosphor `Megaphone` icon | `src/pages/admin/ContentHub.tsx`, `src/pages/admin/ContentHubEdit.tsx`, `src/data/contentHub.ts`, migration `20260519100100_create_content_hub.sql` |
| 3 — Threads Broadcast | A new Supabase Edge Function (`threads-broadcast`) that drafts a Threads post using Gemini 2.0 Flash in Frank's voice (verbatim `BRAND_VOICE_PROMPT` + banned-words ban list from `frvnkfrmchicago-threads.json`), HMAC-signs the outbound, and forwards to a new n8n workflow (`threads-broadcast.json`) which runs the standard Threads container → 30s wait → publish flow. Reuses Frank's existing `THREADS_FRVNK_USER_ID` + `THREADS_FRVNK_TOKEN` credentials. Trigger is manual for this wave (admin button is a future-wave UI task) | `supabase/functions/threads-broadcast/index.ts`, `supabase/functions/_shared/threads.ts`, `n8n/workflows/threads-broadcast.json` |
| 4 — Real Analytics | The admin Analytics page is no longer a localStorage stub. It now reads 9 real metrics off `learner_events` + `user_events` (signups 7d, module completions 7d, blog/module/inquiry counts 30d, top blog posts, top modules, blog-view timeline 14d, daily active users 7d). Existing sync helpers preserved so `Dashboard.tsx` keeps working unchanged. Synthetic-data fallback + banner when Supabase is unconfigured or bypass is active | `src/data/analyticsData.ts`, `src/pages/admin/Analytics.tsx` |
| 5 — Persistence Migration | Blog drafts and Puck-based studio pages now survive deploys, device switches, and browser changes. New `blog_drafts` table with author-scoped RLS; tightened `studio_pages` RLS so only `profiles.role = 'admin'` can write while published pages stay publicly readable for `/p/:slug`. Function signatures on the data layers preserved so no consumer page needed editing | `src/data/blogDrafts.ts`, `src/studio/data/studioStorage.ts`, migrations `20260519100200_create_blog_drafts.sql` + `20260519100300_create_studio_pages.sql` |
| 6 — Pre-Launch Gate | This file's verdict block. Read-only verification confirming every lane meets the evidence contract, every new table has RLS, the Threads pipeline is signed end-to-end, and no credential or brand-spelling regressions slipped through | `orchestration/active/AP-CONTENT-HUB-2026-05/06-AGENT6-PRELAUNCH-GATE.md` |

### 3. What changes for the user (Today vs After)

| Surface | Today | After |
|---|---|---|
| Admin publishes a short AI-news bulletin | No dedicated surface — every drop has to be wrangled through the long-form Modules editor | Opens `/admin/content-hub/new`, fills one form (title, summary, body, source URL, severity picker), clicks Publish. State dot shows publication status in the list view. Single-form publish flow with 30s auto-save on the composer. |
| Admin sees site analytics | `/admin/analytics` shows a localStorage stub with placeholder numbers | `/admin/analytics` shows 9 real metrics aggregated over `learner_events` + `user_events`, with loading skeletons, empty-state messages, and a clearly-labeled synthetic banner when Supabase isn't wired so the page always works |
| Admin writes a blog draft from device A, opens device B | Draft is gone — drafts only live in device A's localStorage | Draft pulls from the new `blog_drafts` table on hydration; `hydrateDraftsFromSupabase()` exists for the next lane to wire into App.tsx mount |
| Admin edits a Puck page | A different browser sees a stale or missing copy | `studio_pages` is now the source of truth with admin-scoped RLS; localStorage is a true fallback when bypass is active |
| Admin publishes a module or bulletin | Threads cross-post is manual on Frank's phone using the existing `frvnkfrmchicago-threads.json` calendar-cron flow | The `threads-broadcast` Edge Function exists end-to-end. The future-wave admin button will POST `{source, id, title, summary, url?, severity?}` to it; Gemini drafts the post in Frank's voice; n8n runs Threads container → 30s wait → publish. The pipeline is live as soon as Frank deploys the function + imports the workflow |
| `news-to-module` cron picks up RSS feeds | Workflow runs but `news_sources` is empty so no drafts ever appear at `/admin/modules/queue` | After `supabase db push`, five active AI/dev feeds (Anthropic, OpenAI, Google AI, Hugging Face Daily Papers, Simon Willison) are seeded; first cron tick produces real drafts |

### 4. What you'll click (interaction walkthrough)

1. **Publish a Content Hub bulletin.** Go to `/admin/content-hub`. Click "New bulletin". Type a title, a summary (200-char counter is live), and optionally a body and source URL. Pick a severity chip (`info` / `advisory` / `important` / `breaking`). Pick a status chip (`draft` / `published` / `archived`). Click Publish. The state dot turns green on the list view. The bulletin is now in `public.content_hub_bulletins` with admin-only write policy enforced by the database.
2. **Broadcast to Threads (manual for this wave).** From the admin module or bulletin edit page, POST `{source, id, title, summary, url?, severity?}` to `/functions/v1/threads-broadcast` (the admin button UI is the future-wave UI task; the backend pipeline is live). The Edge Function drafts a Threads post in Frank's voice using Gemini 2.0 Flash, HMAC-signs the outbound, and forwards to n8n. n8n verifies HMAC, validates the text (≤500 chars, no hashtags), POSTs to Threads `/threads` for the container, waits 30 seconds, POSTs to `/threads_publish`. The post lands on @frvnkfrmchicago.
3. **See real analytics.** Go to `/admin/analytics`. The stat cards now show real numbers from `learner_events` + `user_events`: signups 7d, module completions 7d, blog views 30d, module views 30d, inquiries 30d. The blog-views chart shows the 14-day timeline. The DAU chart shows distinct users per day over 7d. Top posts and top modules rank by `payload.slug`/`payload.module_id`. If Supabase is unconfigured or bypass is active, you get clearly-labeled synthetic data with a banner up top.
4. **See drafts persist across devices.** Open `/admin/blog/write` on a laptop, type a draft, walk away. Open the same URL on a phone (signed in as the same admin). The draft appears once `hydrateDraftsFromSupabase()` is wired into App.tsx mount (future wave task — Lane 5 owned the data layer; App.tsx wiring is the next slice).

### 5. Decision needed — Frank credential actions

Twelve actions, in the order Lane 1's runbook spells them out. Every one is a Frank credential (the codebase cannot execute these from inside the lane work).

| # | Action | Command / location | Notes |
|---|---|---|---|
| 1 | Push migrations | `cd assetpersona && supabase db push --linked --include-all` | Picks up Lanes 1, 2, 5 migrations (4 new files) |
| 2 | Set Edge Function secrets | `supabase secrets set N8N_THREADS_BROADCAST_URL=…`, `N8N_HMAC_SECRET=…` (same as inquiry-router), `GOOGLE_AI_API_KEY=…`, `ALLOWED_ORIGIN=…`, plus the 5 other n8n URLs per runbook step 2 matrix | Run `supabase secrets list` to verify |
| 3 | Deploy Edge Functions | `supabase functions deploy generate-module module-tutor inquiry-webhook subscribe-email post-completion-email threads-broadcast` | Includes the new `threads-broadcast` from Lane 3 |
| 4 | Regenerate TypeScript types | `supabase gen types typescript --linked > src/types/supabase.ts` | Drops the `(supabase as any)` casts in Lane 4 + Lane 5 |
| 5 | Rotate previously-committed anon key | Supabase dashboard → Project Settings → API → Generate new anon key | Paste into `.env.local`. **Irreversible.** |
| 6 | Restart Auth | Supabase dashboard → Authentication → Restart | Activates `enable_confirmations = true` from `supabase/config.toml`. **Irreversible-in-effect.** |
| 7 | Wire production SMTP | SendGrid or Resend per Lane 1 runbook step 7 | Dashboard SMTP settings OR `[auth.email.smtp]` config.toml block + `SMTP_PASS` secret. **Irreversible-in-effect after switchover.** |
| 8 | Set n8n variables | `THREADS_FRVNK_USER_ID` + `THREADS_FRVNK_TOKEN` in the n8n variables panel | Reuse the same values from the existing `frvnkfrmchicago-threads.json` workflow |
| 9 | Import 7 n8n workflows | n8n → Workflows → Import from File for each `assetpersona/n8n/workflows/*.json` | Includes new `threads-broadcast.json` |
| 10 | Activate the 7 workflows | n8n → Workflows → toggle each to Active | Including the new `threads-broadcast` |
| 11 | Local build + host deploy | `bun install && bun run build` then upload `dist/` via wrangler or git-connected Cloudflare Pages | Per runbook steps 9–10 |
| 12 | Smoke test | Open `/admin/modules/queue` (wait for first cron tick of `news-to-module` after deploy to see drafts arrive), `/admin/content-hub` (create + publish a test bulletin), `/admin/analytics` (verify real numbers populate as you click around the public site to generate events) | Per runbook step 11. Also: RSS feed quality tuning — if any of the 5 seeded feeds produces low-quality drafts, `UPDATE public.news_sources SET active = false WHERE label = '<feed>'` |

### 6. Citations (primary triplet per lane)

| Lane | Skill | Librarian | 2026 URL |
|---|---|---|---|
| 1 — Deploy Runbook + RSS Seed | `.claude/skills/n8n-automating/SKILL.md` | `librarians/supabase-librarian.md` | `https://supabase.com/docs/reference/cli/supabase-db-push` |
| 2 — Content Hub | `.claude/skills/supabase-building/SKILL.md` | `librarians/supabase-librarian.md` | `https://supabase.com/docs/guides/database/postgres/row-level-security` |
| 3 — Threads Broadcast | `.claude/skills/copywriting-enforcing/SKILL.md` | `librarians/api-integration-librarian.md` | `https://developers.facebook.com/docs/threads/posts` |
| 4 — Real Analytics | `.claude/skills/supabase-building/SKILL.md` | `librarians/supabase-librarian.md` | `https://supabase.com/docs/reference/javascript/select` |
| 5 — Persistence Migration | `.claude/skills/supabase-building/SKILL.md` | `librarians/supabase-librarian.md` | `https://supabase.com/docs/guides/database/postgres/row-level-security` |
| 6 — Pre-Launch Gate | `.claude/skills/pre-deploy-gating/SKILL.md` | `librarians/orchestration-librarian.md` | `https://web.dev/articles/security-checklist` |
