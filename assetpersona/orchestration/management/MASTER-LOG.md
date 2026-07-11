# Asset Persona — Project Master Log

**Project status: 10 waves shipped complete. 0 active waves in progress.**

## Wave Roll-up

| Wave ID | Mode | Lanes | Source | Review | Visual Log |
|---|---|---|---|---|---|
| **AP-LAUNCH-2026-05** | Planner+Executor (declared Flat Wave) | 7 | ✅ complete | ✅ pass | `visual-log/20260506T0100-ap-launch.md` |
| **AP-LEARN-2026-05** | Planner+Executor (declared Flat Wave) | 7 | ✅ complete | ✅ pass | `visual-log/20260506T0105-ap-learn.md` |
| **AP-PLATFORM-2026-05** | Planner+Executor (declared Flat Wave) | 6 | ✅ complete | ✅ pass | `visual-log/20260505T2200-ap-platform-mobile.md` + `20260506T0110-ap-platform-evidence.md` |
| **AP-COMMUNITY-2026-05** | Planner+Executor | 7 | ✅ complete | ✅ pass | `visual-log/20260505T2330-ap-community.md` |
| **AP-LAUNCH-READY-2026-05** | Multi Primary Agent | 7 | ✅ complete | ✅ pass | n/a (file-bound packet — `completed/AP-LAUNCH-READY-2026-05/90-MASTER-LOG.md` closeout) |
| **AP-CONTENT-HUB-2026-05** | Multi Primary Agent | 6 | ✅ complete | ✅ pass | n/a (file-bound packet — `completed/AP-CONTENT-HUB-2026-05/90-MASTER-LOG.md` closeout) |
| **AP-MODERNIZE-2026-05** | Multi Primary Agent | 7 | ✅ complete | ✅ pass | n/a (file-bound packet — `completed/AP-MODERNIZE-2026-05/90-MASTER-LOG.md` closeout) |
| **AP-ENGAGEMENT-LOOP-2026-05** | Multi Primary Agent | 8 | ✅ complete | ✅ pass | n/a (file-bound packet — `completed/AP-ENGAGEMENT-LOOP-2026-05/90-MASTER-LOG.md` closeout) |
| **wave-agentic-studyhall-simulator** | Multi Primary Agent | 7 | ✅ complete | ✅ pass | n/a (file-bound packet — b0b10d1b-58d4-4db7-ba06-43301e020b8a closeout) |
| **AP-GAMES-RECONNECT-2026-06** | Multi Primary Agent | 6 | ✅ complete | ✅ pass | n/a (file-bound packet — b0b10d1b-58d4-4db7-ba06-43301e020b8a closeout) |


## What Each Wave Delivered (one line)

| Wave | What it shipped |
|---|---|
| AP-LAUNCH | Foundation: 7 migrations (RLS holes patched, profile extended, inquiries + blog_posts + user_events tables, find_stale_onboarders RPC), inquiry-webhook Edge Function with HMAC + lead-score, `/work` consultant hub + 4 pathway forms (Consulting/Speaking/Training/Marketing), 2 n8n workflows, sitemap + RSS + robots + CSP + vite console-drop polish |
| AP-LEARN | Learning modules: 4 module-system migrations, multi-provider LLM adapter (Anthropic/Google/OpenAI/DeepSeek/OpenRouter — defaults to Gemma 4 per in-app-budget rule), generate-module + module-tutor Edge Functions, admin composer (Modules + ModuleEdit + ModuleQueue + Velocity), `/community/learn` hub + module reader with floating tutor, RSS-to-module n8n pipeline |
| AP-PLATFORM | Engagement spine: profile schema completion (services_interest + onboarding_step + email_opt_in + faceless), email_subscribers + learner_events tables, drift-score RPC, MobileTabBar bottom nav, swipe Today's Drill carousel, NewsletterCard + subscribe-email Edge Function, post-completion-email Edge Function, 3 n8n drip workflows, smart recommendation pure function, NextUpCard + AchievementsGrid + CompletionTicker, LearnerExplorer admin search page |
| AP-COMMUNITY | Account + community polish: avatar/cover/social-links account settings rewrite, comment moderation queue + ModeratorGuard + flag/report flow + `comment_status` enum + `comment_reports` table, public `/faq` with categorized accordion + Ask-Frank form (`form_type='qa'`) + admin FAQ authoring, image + Tenor GIF picker in Feed posts and comments, deleted DirectMessage stub, route + sidebar wiring for new admin pages |
| AP-LAUNCH-READY | Pre-launch hardening: removed `/studio-preview` unauthenticated route + `BYPASS_FAKE`/`BYPASS_PENDING` seed arrays + inquiry-payload `console.log` + `example.com` autofill link + committed anon key; image bytes 29MB → 3MB (89.7% reduction) via WebP + lazy LandingV2 + code-split GSAP + deferred BlogHydrator + font weight trim; mobile responsive layer with 44px touch targets + 360/480/540/768/1024 breakpoint band + Admin amber notice + Studio CSS gate + iOS momentum scroll + gradient text fallback + safe-area-inset; inline AuthModal replacing /login redirect + post-signup "Check inbox" panel + flat 3-step OnboardingChecklist + auto-bumping onboarding_step; VideoUploader + VideoPlayer + Feed→Supabase Realtime (7 listeners) + communityData.ts Supabase swap + Classroom/Shop honest coming-soon panels; 8 new migrations (posts/comments/likes/follows/video_assets/storage/faceless-RLS/DELETE policies) + `enable_confirmations = true` + password floor 10 + 12 GDPR DELETE policies |
| AP-CONTENT-HUB | Content publishing pipeline: deploy runbook with 11 ordered Frank-credential steps + idempotent seed migration adding 5 active AI/dev RSS feeds to `news_sources` (Anthropic / OpenAI / Google AI / Hugging Face / Simon Willison); new `/admin/content-hub` single-form bulletin surface (single-form composer + severity picker + state dots + 30s auto-save) backed by `content_hub_bulletins` table with admin-scoped RLS; frvnkfrmchicago Threads workflow ported — new `_shared/threads.ts` carrying `BRAND_VOICE_PROMPT` (banned-words verbatim) + new `threads-broadcast` Edge Function (Gemini 2.0 Flash + HMAC verify in + HMAC sign out) + new `n8n/workflows/threads-broadcast.json` (Webhook → verify → container → 30s → publish) reusing Frank's existing `THREADS_FRVNK_USER_ID`/`THREADS_FRVNK_TOKEN`; analytics dual-layer rewrite — Analytics.tsx now reads 9 real metrics off `learner_events`/`user_events` with skeletons + synthetic-data banner when Supabase unconfigured; persistence migration — new `blog_drafts` table + tightened `studio_pages` RLS + Supabase-first data layers with localStorage fallback so drafts survive deploys |
| AP-MODERNIZE | Community + monetization modernization: fixed 2-line bug where `Blog.tsx` ignored published posts (now uses `getAllPublishedPosts()`) + RSS auto-discovery `<link rel="alternate">` in SEOHead; DMs end-to-end — 3 tables (`dm_threads`/`dm_messages`/`dm_thread_reads`) + RLS + thread-update trigger + `/community/messages` inbox + `/community/messages/:threadId` Realtime thread; @mentions + notifications — `notifications` table + mention trigger function parsing `@<DisplayName>` from posts + comments + `MentionInput` autocomplete + `NotificationBell` with badge in global nav + `/community/notifications` full page; bookmarks + real presence + leaderboard — `bookmarks` table + `BookmarkButton` + `/community/saved` reading list + `usePresence()` Supabase Realtime presence wrapper replacing the fake `Math.floor(members.length * 0.4)` math + Leaderboard period tabs wired to actually filter `learner_events`; upgrade flow modernization — `stripe-webhook` Edge Function with signature verification + idempotency + audit table auto-flipping `profile.tier` after Stripe payment + `subscription_events` audit + 4 new profiles columns (`stripe_customer_id`/`stripe_subscription_id`/`subscription_status`/`current_period_end`) + new inline `UpgradeModal` with monthly/annual toggle + "Most popular" badge + direct checkout per tier + Stripe Customer Portal link in UserSettings + duplicate `auth/TierGate` deleted; shell integration — 4 new routes + 3 sidebar entries + NotificationBell mount in Navbar + GroupSettings plugin stubs deleted |
| wave-agentic-studyhall-simulator | Studyhall & Parser: Built Classroom pathway navigation selector, mapped dynamic learning data models, created parser ingestion script for Upgrade.Self dot files, and integrated Paper Candle drone cockpit telemetry HUD cockpit |
| AP-GAMES-RECONNECT-2026-06 | Domain & Storage: Storage bucket SQL migration with public read / admin write policies + wired direct file upload selector in admin ProductManager saving to `download_url` column + Resources download handler wired to build Supabase file links; interactive game — RAG Parameter Optimizer sandbox with 3 scenarios, slider metrics, local points sync and SEOHead meta cards |


## All Production Migrations on Disk (chronological)

```
20260505100000_fix_profile_trigger.sql                     [AP-LAUNCH]
20260505100100_extend_profiles.sql                         [AP-LAUNCH]
20260505100200_fix_rls_holes.sql                           [AP-LAUNCH]
20260505100300_create_inquiries.sql                        [AP-LAUNCH]
20260505100400_create_blog_posts.sql                       [AP-LAUNCH]
20260505100500_create_user_events.sql                      [AP-LAUNCH]
20260505100600_create_find_stale_onboarders_rpc.sql        [AP-LAUNCH]
20260505200000_create_modules.sql                          [AP-LEARN]
20260505200100_create_progress.sql                         [AP-LEARN]
20260505200200_extend_profiles_role_ladder.sql             [AP-LEARN]
20260505200300_create_module_sources.sql                   [AP-LEARN]
20260505300000_extend_profiles_engagement.sql              [AP-PLATFORM]
20260505300100_create_email_subscribers.sql                [AP-PLATFORM]
20260505300200_create_learner_events.sql                   [AP-PLATFORM]
20260505400000_storage_avatars_covers.sql                  [AP-COMMUNITY]
20260505400100_comments_moderation.sql                     [AP-COMMUNITY]
20260505400200_create_faqs.sql                             [AP-COMMUNITY]
20260602240000_digital_products_bucket.sql                  [AP-GAMES-RECONNECT-2026-06]

```

## All Edge Functions on Disk

| Function | Wave | Purpose |
|---|---|---|
| inquiry-webhook | AP-LAUNCH | Forms → inquiries table → n8n Gmail forward |
| generate-module | AP-LEARN | URL/paste/prompt → AI module draft (multi-provider) |
| module-tutor | AP-LEARN | Per-module Q&A tutor (multi-provider, prompt-cached) |
| subscribe-email | AP-PLATFORM | Public newsletter signup → n8n welcome drip |
| post-completion-email | AP-PLATFORM | Module completion → n8n templated follow-up |

Plus shared modules: `_shared/cors.ts`, `_shared/hmac.ts`, `_shared/llm.ts`, `_shared/module-prompts.ts`, `_shared/PROVIDERS.md`.

## All n8n Workflows on Disk

| Workflow | Wave | Trigger |
|---|---|---|
| inquiry-router.json | AP-LAUNCH | Webhook from inquiry-webhook Edge Function |
| engagement-nudges.json | AP-LAUNCH | Cron + Postgres `find_stale_onboarders` RPC |
| news-to-module.json | AP-LEARN | RSS poll → generate-module → admin queue |
| welcome-drip.json | AP-PLATFORM | Webhook from subscribe-email Edge Function |
| weekly-digest.json | AP-PLATFORM | Cron Mon 13:00 UTC + email_subscribers query |
| post-completion-email.json | AP-PLATFORM | Webhook from post-completion-email Edge Function |

## Frontend Surface Coverage

| Section | Pages |
|---|---|
| Marketing | `/`, `/about`, `/blog`, `/blog/:slug`, `/contact`, **`/faq`**, `/talkthrutech`, `/aistudyhall`, `/shop`, `/business` |
| Work With Frank | `/work` (hub) + `/work/{consulting,speaking,training,marketing}` |
| Auth | `/login`, `/signup`, **`/forgot-password`**, **`/reset-password`** |
| Community | `/community` (Feed), `/community/classroom`, `/community/calendar`, `/community/members`, `/community/leaderboard`, `/community/profile/:memberId`, `/community/user-settings`, **`/community/learn`**, **`/community/learn/:slug`**, **`/community/arcade/rag-optimizer`** |
| Admin | `/admin` (dashboard), `/admin/blog`, `/admin/events`, `/admin/members`, `/admin/courses`, `/admin/products`, `/admin/analytics`, `/admin/inquiries`, **`/admin/modules`**, **`/admin/modules/queue`**, **`/admin/velocity`**, **`/admin/learners`**, **`/admin/moderation`**, **`/admin/faq`** |

(**Bold** = added across the 4 waves.)

## Skills + Librarians Cited Across the Project

| Source | Used in |
|---|---|
| 📚 [orchestration-librarian](../../../librarians/orchestration-librarian.md) | Every wave — packet lifecycle, Production Cadence Rule, No-Deferral, Progression Status, Explainer Mode, Planner+Executor mode |
| 📚 [multi-agent-librarian](../../../librarians/multi-agent-librarian.md) | All decompositions — file-bound split, agent-strength map, batch grouping |
| 📚 [review-orchestration-librarian](../../../librarians/review-orchestration-librarian.md) | All 4 review reports — 18-checklist + Fixer Component |
| 🛠 [supabase-building](../../../.claude/skills/supabase-building/SKILL.md) | Every migration — RLS-first, service-role only on Edge Functions, signed URLs |
| 🛠 [database-designing](../../../.claude/skills/database-designing/SKILL.md) | Schema + enums + indexes + RPCs |
| 🛠 [pattern-referencing](../../../.claude/skills/pattern-referencing/SKILL.md) | All UI surfaces — IAAA against Discord/Skool/Coral/Reddit/Substack/Duolingo |
| 🛠 [mobile-first-enforcing](../../../.claude/skills/mobile-first-enforcing/SKILL.md) | All UI — 44pt touch targets, dvh, safe-area |
| 🛠 [flow-designing](../../../.claude/skills/flow-designing/SKILL.md) | Onboarding + comment-flag flows |
| 🛠 [onboarding-designing](../../../.claude/skills/onboarding-designing/SKILL.md) | Welcome chip + progressive profiling |
| 🛠 [conversational-ai-building](../../../.claude/skills/conversational-ai-building/SKILL.md) | Module tutor + Ask Frank |
| 🛠 [api-integrating](../../../.claude/skills/api-integrating/SKILL.md) | Webhook signatures, retry/backoff, Tenor v2 |
| 🛠 [n8n-automating](../../../.claude/skills/n8n-automating/SKILL.md) | All n8n workflows |
| 🛠 [search-building](../../../.claude/skills/search-building/SKILL.md) | FAQ FTS, learner timeline |
| 🛠 [ux-designing](../../../.claude/skills/ux-designing/SKILL.md) | Information architecture across 17 new routes |
| 🛠 [experience-designing](../../../.claude/skills/experience-designing/SKILL.md) | Token discipline (raw values are tech debt) |
| 🛠 [code-cleaning](../../../.claude/skills/code-cleaning/SKILL.md) | Dead-code removal (DM stub, etc.) |
| 🛠 [anti-mock-enforcing](../../../.claude/skills/anti-mock-enforcing/SKILL.md) | Bypass-prefixed stubs only |
| 🛠 [copywriting-enforcing](../../../.claude/skills/copywriting-enforcing/SKILL.md) | Em-dash + AI-tell sweep |
| 🛠 [security-auditing](../../../.claude/skills/security-auditing/SKILL.md) | Comment moderation defense layer |
| 🛠 [code-scrutinizing](../../../.claude/skills/code-scrutinizing/SKILL.md) | 7-lens review on AP-COMMUNITY + retroactive on the others |
| 🛠 [pre-deploy-gating](../../../.claude/skills/pre-deploy-gating/SKILL.md) | Build verification deferred to user (Operational Rule) |
| 🛠 [visual-auditing](../../../.claude/skills/visual-auditing/SKILL.md) | Mobile audit at 360/390/768/1024 |
| 🛠 [claude-api](../../../.claude/skills/claude-api/SKILL.md) | Prompt caching on Anthropic path |
| 🛠 [prompt-engineering](../../../.claude/skills/prompt-engineering/SKILL.md) | module-prompts system template |
| 🛠 [google-ai-integrating](../../../.claude/skills/google-ai-integrating/SKILL.md) | Gemma 4 default routing |

## Memory Rules That Constrained Decisions

- `feedback_no_time_language.md` — wave + 0–100% only, never time units
- `feedback_packet_continuity.md` — packets run end-to-end, no mid-wave checkpoint asks
- `feedback_model_default_opus_47.md` — Opus 4.7 for dev-tool inference (not in-app)
- `feedback_in_app_model_budget.md` — Gemma 4 / DeepSeek class for in-app inference; Claude is too expensive
- `feedback_orchestration_librarian_format.md` — Explainer Mode 6 sections + Pre-Plan Research + 3-citation triplet + Planner+Executor mode rules

## True Blockers Remaining (only credentials Frank holds)

These are the only items the librarian permits to stop a wave. None are code work. All are user-side actions on credentials or third-party URLs.

| Action | Why it's blocked |
|---|---|
| `supabase db push --linked --include-all` | Requires DB password (credential — librarian permits stop) |
| `supabase functions deploy {inquiry-webhook,generate-module,module-tutor,subscribe-email,post-completion-email}` | Requires authenticated `supabase login` session |
| `supabase secrets set OPENROUTER_API_KEY=…` (or DEEPSEEK / GOOGLE_AI / ANTHROPIC) | Requires Frank's API key from a paid account (credential) |
| `supabase secrets set N8N_HMAC_SECRET=…` + `N8N_WEBHOOK_URL=…` + `N8N_WELCOME_DRIP_URL=…` + `N8N_POST_COMPLETION_URL=…` | Requires Frank's n8n instance public URLs (third-party URL) |
| Import 6 n8n workflow JSONs + connect Gmail OAuth | Requires Frank's n8n + Gmail credentials |
| Set `VITE_TENOR_API_KEY=…` | Requires Tenor API key (credential) |
| `bun run build` and deploy `dist/` to Cloudflare Pages | Frank chooses when to ship |

Everything else is in the codebase, type-checked, and review-passed.

## Reporting Format Reference

```
Wave N of M complete → X% production done.
Next: Wave N+1 — <wave name>.
```

(Per the Production Cadence Rule — never time units.)
