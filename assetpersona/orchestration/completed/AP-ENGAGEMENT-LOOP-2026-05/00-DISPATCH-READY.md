# AP-ENGAGEMENT-LOOP-2026-05 — Dispatch Ready

## Mission
Close the engagement loop: **Frank schedules → module auto-publishes → member learns → member shares to feed + public web → non-member lands on share card → signs up → loops back**. Plus Uxcel-style public profiles (3-state visibility), pinned-project portfolio, multi-social broadcast (LinkedIn / X / Bluesky / Threads / IG / Mastodon, with YouTube manual-assist), and the silent-fail `notification_prefs` column the UserSettings UI has been writing to all along.

## Production Cadence

| Wave | Name | % on completion | Status |
|------|------|----|--------|
| 1 | Module polish + Share-card + Public profile + Portfolio + Multi-social + Notifications fix (6 lanes parallel) | 75% | not started |
| 2 | Shell coordinator (App.tsx routes, layout entries, Profile portfolio mount) | 92% | not started |
| 3 | Pre-launch gate | 100% | not started |

Status format: `Wave N of 3 complete → X% production done.`

## Audit-Driven Inputs

Six parallel audits found:

| Domain | Finding | Where it's addressed |
|--------|---------|----------------------|
| Module pipeline | 95% production-ready in code. Blockers: `generate-module` + `news-to-module` not deployed (Frank credential), no `scheduled_publish_at` column, no datetime picker in ModuleEdit. | Lane 1 |
| Public learn flow | Zero public module URL exists — everything's behind AuthGuard. No share-to-feed CTA. SEOHead has OG support but isn't used on modules. Module slugs not in sitemap. `post-completion-email` has no share CTA. | Lane 2 |
| Profiles | `profile.faceless` is narrow (leaderboard-hide only). No public profile URL. No `handle` or `visibility` columns. | Lane 3 |
| Portfolio | No `member_projects` table. Profile.tsx has no portfolio section. | Lane 4 |
| Content Hub social | Only Threads wired. No `social_posts` audit table. No scheduling queue. No multi-platform fan-out. | Lane 5 |
| Notifications + scheduling | **BUG**: `UserSettings.tsx` writes to `notification_prefs` column that doesn't exist — UI silently fails saying "Saved." `post_reaction` ENUM exists but no trigger fires it. No `module_published` / `achievement_earned` kinds. No scheduled-publish pipeline. | Lane 6 |

## 2026 Research Constraints (must plan around)

From the Uxcel + multi-social research lane:

- **YouTube Community has NO publishing API in 2026.** Lane 5 ships a manual-assist UI ("copy to clipboard + open YT Studio") — not automation.
- **X API costs $0.01/post pay-per-use** (or $200/mo Basic for 10k posts/mo) since Feb 2026. Adapter ships but Frank decides if he turns it on.
- **Threads + Instagram both require Meta app review** (multi-week delay). Adapter ships but production posting waits on approval.
- **LinkedIn `w_member_social` requires partner verification.** Adapter ships; production posting waits.
- **Bluesky is the cleanest integration** — app password (no OAuth), 5k pts/hr rate limit, no per-post cost.
- **Uxcel public-profile-toggle UX is not publicly documented.** Lane 3 uses Read.cv's documented **3-state model** (private / unlisted / public) — safer than guessing Uxcel internals.
- **Duolingo share-card design drives 5-10x organic share lift** when mascot-forward + ego-signal copy. Lane 2 mirrors that pattern with Asset Persona brand voice.

## Mode

**Multi Primary Agent**. Lead orchestrator is this chat. Each lane runs as its own sub-agent invocation. Lane brief file is canonical evidence. Per [feedback_packet_continuity.md](memory) the packet runs end-to-end. Per [feedback_frank_brand_spellings.md](memory) Grazzhopper / frvnkfrmchicago are verbatim where they appear. Per [feedback_standing_task_protocol.md](memory) every lane cites MULTIPLE skills + librarians + 2026 URLs (never just one of each). Per [feedback_rate_limit_continue.md](memory) if rate limits fire, the lead just continues — no incident notes in artifacts.

## Skills and Librarians Referenced (cross-lane)

| Resource | Used By | Purpose |
|----------|---------|---------|
| [librarians/orchestration-librarian.md](../../../../librarians/orchestration-librarian.md) | Lead | Packet lifecycle + Explainer Mode + production cadence |
| [librarians/multi-agent-librarian.md](../../../../librarians/multi-agent-librarian.md) | All | File-bound decomposition; max parallelism |
| [librarians/review-orchestration-librarian.md](../../../../librarians/review-orchestration-librarian.md) | Lead at closeout | 18-checklist + Explainer Mode 6-section closeout |
| [.claude/skills/implementation-guiding/SKILL.md](../../../../.claude/skills/implementation-guiding/SKILL.md) | Lane 1 | Edge Function deploy + end-to-end module flow validation |
| [.claude/skills/n8n-automating/SKILL.md](../../../../.claude/skills/n8n-automating/SKILL.md) | Lanes 1, 5, 6 | Cron workflows + multi-step orchestration + per-platform fan-out |
| [.claude/skills/supabase-building/SKILL.md](../../../../.claude/skills/supabase-building/SKILL.md) | Lanes 1-6 | RLS-first; Realtime; Edge Functions; storage; per-user RLS scoping |
| [.claude/skills/database-designing/SKILL.md](../../../../.claude/skills/database-designing/SKILL.md) | Lanes 1-6 | Schema + indexes + ENUM extension + RLS policy authoring |
| [.claude/skills/api-integrating/SKILL.md](../../../../.claude/skills/api-integrating/SKILL.md) | Lane 5 | Per-platform OAuth + signature verification + retry/backoff |
| [.claude/skills/frontend-architecting/SKILL.md](../../../../.claude/skills/frontend-architecting/SKILL.md) | Lanes 2, 3, 4, 7 | Public-route architecture; React Router v7 patterns; lazy-load |
| [.claude/skills/component-building/SKILL.md](../../../../.claude/skills/component-building/SKILL.md) | Lanes 1, 2, 4 | Share prompt + ModuleTeaser + WhatsNext + PortfolioGrid |
| [.claude/skills/ux-designing/SKILL.md](../../../../.claude/skills/ux-designing/SKILL.md) | Lanes 2, 3, 4 | Teaser → gate → signup flow; portfolio pinning UX; 3-state privacy |
| [.claude/skills/flow-designing/SKILL.md](../../../../.claude/skills/flow-designing/SKILL.md) | Lane 2 | Member-completion → share → public-card → signup chaos-path mapping |
| [.claude/skills/copywriting-enforcing/SKILL.md](../../../../.claude/skills/copywriting-enforcing/SKILL.md) | Lanes 2, 3 | Share prompt copy + signup-gate copy + privacy-toggle labels |
| [.claude/skills/search-building/SKILL.md](../../../../.claude/skills/search-building/SKILL.md) | Lane 2 | Sitemap + OG-discovery + public module URLs |
| [.claude/skills/interactive-animating/SKILL.md](../../../../.claude/skills/interactive-animating/SKILL.md) | Lane 2 | Share card celebration + completion micro-interactions |
| [.claude/skills/mobile-first-enforcing/SKILL.md](../../../../.claude/skills/mobile-first-enforcing/SKILL.md) | Lanes 2-7 | 44px touch targets across new pages + modals + buttons |
| [.claude/skills/pattern-referencing/SKILL.md](../../../../.claude/skills/pattern-referencing/SKILL.md) | Lanes 3, 4 | IAAA against Uxcel + Read.cv + Duolingo + Postiz |
| [.claude/skills/security-auditing/SKILL.md](../../../../.claude/skills/security-auditing/SKILL.md) | Lanes 5, 8 | OAuth token storage + RLS coverage on social_accounts |
| [.claude/skills/backend-hardening/SKILL.md](../../../../.claude/skills/backend-hardening/SKILL.md) | Lane 5 | Rate-limit handling + retry/backoff per platform |
| [.claude/skills/conversational-ai-building/SKILL.md](../../../../.claude/skills/conversational-ai-building/SKILL.md) | Lane 1 | Tutor handoff to Frank when out-of-scope |
| [.claude/skills/prompt-engineering/SKILL.md](../../../../.claude/skills/prompt-engineering/SKILL.md) | Lane 1, 2 | Per-platform brand-voice prompt templates + share-card 140-char prompt |
| [.claude/skills/pre-deploy-gating/SKILL.md](../../../../.claude/skills/pre-deploy-gating/SKILL.md) | Lane 8 | Final gate checklist |
| [.claude/skills/exit-gating/SKILL.md](../../../../.claude/skills/exit-gating/SKILL.md) | Lane 8 | STOP gates before ship |

Per-lane briefs cite their primary 3-5 skills + 2-3 librarians + 2-4 2026 URLs.

## Lane Decomposition (file-bound, no overlap)

| Agent | Lane | Wave | File ownership |
|-------|------|------|----------------|
| Agent 1 | Module Pipeline Polish | 1 | `src/pages/admin/ModuleEdit.tsx` (datetime picker), `src/pages/community/Learn.tsx` (social proof on cards), `src/components/learn/WhatsNextPanel.tsx` (NEW), `src/components/learn/WhatsNextPanel.css` (NEW), `supabase/migrations/20260520100100_module_scheduling.sql` (NEW), `n8n/workflows/auto-publish-scheduled-modules.json` (NEW). Reads `src/data/learnStore.ts` to add a `listScheduledModules()` helper — owns that addition. |
| Agent 2 | Public Learn + Share-Card Loop | 1 | `src/pages/community/Module.tsx` (Share CTA + WhatsNext mount + analytics event), `src/pages/Learn.tsx` (NEW — public `/learn/:slug` teaser) + `.css`, `src/pages/Learned.tsx` (NEW — public `/learned/:shareId` share card) + `.css`, `src/components/learn/SharePrompt.tsx` (NEW) + `.css`, `src/components/learn/ModuleTeaser.tsx` (NEW) + `.css`, `src/data/learningPosts.ts` (NEW), `supabase/migrations/20260520100200_learning_posts.sql` (NEW), `supabase/functions/og-image/index.ts` (NEW — Satori-based dynamic OG image generator), `scripts/generate-sitemap.ts` (extend to include module slugs from `blog_posts` query already present + new `modules` query), `supabase/functions/post-completion-email/index.ts` (extend to include share CTA + share_id deep link), `src/components/seo/SEOHead.tsx` (extend to support OG type=article + dynamic image URL). |
| Agent 3 | Public Profile (3-state, Uxcel/Read.cv) | 1 | `src/pages/community/UserSettings.tsx` (Privacy tab + visibility toggle + handle picker), `supabase/migrations/20260520100300_public_profile.sql` (NEW — adds `handle`, `visibility` ENUM, public-read RLS gated on visibility; creates `profile_credentials` table with `share_id` short slug + admin/owner write + public read when profile visibility != private), `src/pages/PublicProfile.tsx` (NEW — public `/u/:handle`) + `.css`, `src/pages/CredentialShare.tsx` (NEW — public `/c/:shareId`) + `.css`, `src/data/publicProfile.ts` (NEW). |
| Agent 4 | Portfolio / Pinned Projects | 1 | `supabase/migrations/20260520100400_member_projects.sql` (NEW — `member_projects` table + owner RLS + public-read when profile visibility = public), `src/data/memberProjects.ts` (NEW), `src/components/community/PortfolioGrid.tsx` (NEW), `src/components/community/PortfolioGrid.css` (NEW), `src/components/community/PortfolioItemEditor.tsx` (NEW), `src/components/community/PortfolioItemEditor.css` (NEW), `src/pages/community/Portfolio.tsx` (NEW — standalone owner-edit page at `/community/portfolio`) + `.css`. **Does NOT touch `UserSettings.tsx`** (Lane 3 owns it). Lane 7 mounts the PortfolioGrid on `Profile.tsx`. |
| Agent 5 | Multi-Social Dispatcher | 1 | `supabase/migrations/20260520100500_social_broadcast.sql` (NEW — `social_accounts` + `scheduled_posts` + `post_results` tables + RLS), `supabase/migrations/20260520100501_content_hub_scheduling.sql` (NEW — adds `scheduled_for` timestamptz + `platforms text[]` to `content_hub_bulletins`), `supabase/functions/social-dispatcher/index.ts` (NEW — cron-triggered fan-out), `supabase/functions/_shared/social/index.ts` (NEW adapter registry), `supabase/functions/_shared/social/linkedin.ts`, `_shared/social/x.ts`, `_shared/social/bluesky.ts`, `_shared/social/threads.ts` (NEW adapter wrapping the existing `_shared/threads.ts` helper from AP-CONTENT-HUB — do not modify the existing helper), `_shared/social/instagram.ts`, `_shared/social/mastodon.ts`, `_shared/social/youtube.ts` (NEW — manual-assist returning `{ status: 'manual-required' }`), `src/pages/admin/BroadcastsMonitor.tsx` (NEW — `/admin/content-hub/broadcasts`) + `.css`, `src/data/broadcasts.ts` (NEW), `n8n/workflows/social-dispatcher-cron.json` (NEW — hourly cron trigger). Read-only on existing `supabase/functions/threads-broadcast/index.ts` + `n8n/workflows/threads-broadcast.json` (those continue to work standalone). |
| Agent 6 | Notifications + Scheduling Fixes | 1 | `supabase/migrations/20260520100600_notification_prefs_column.sql` (NEW — adds the missing `notification_prefs jsonb DEFAULT '{}'::jsonb` column to `profiles` that UserSettings.tsx has been writing to all along), `supabase/migrations/20260520100601_extend_notification_kinds.sql` (NEW — adds `module_published`, `course_recommended`, `achievement_earned`, `portfolio_project_liked` to the `notification_kind` ENUM), `supabase/migrations/20260520100602_notification_triggers.sql` (NEW — trigger on `modules` status='published' → fan-out to followers + email queue; trigger on `module_completions` insert → award_achievement_if_milestone_hit() function). |
| Agent 7 | Shell + Cuts | 2 | `src/App.tsx` (6 new routes added in single coordinated block: `/learn/:slug` public + `/learned/:shareId` public + `/u/:handle` public + `/c/:shareId` public + `/community/portfolio` member + `/admin/content-hub/broadcasts` admin), `src/components/community/CommunityLayout.tsx` (single sidebar entry for Portfolio), `src/components/admin/AdminLayout.tsx` (single sidebar entry for Broadcasts under Content Hub), `src/pages/community/Profile.tsx` (mount Lane 4's `PortfolioGrid` section when target profile is visible to viewer). |
| Agent 8 | Pre-Launch Gate | 3 | Read-only across the repo. Writes ONLY to its own brief and `90-MASTER-LOG.md`. |

**Conflict resolution rules:**
- Lanes 1-6 each own ONE narrow file in `src/pages/community/` or `src/pages/admin/` plus their NEW components and migrations. Lane 7 (shell) is the ONLY lane touching `App.tsx`, `Navbar.tsx`, `CommunityLayout.tsx`, `AdminLayout.tsx`, `Profile.tsx`.
- Lane 5 reuses the existing `_shared/threads.ts` helper from AP-CONTENT-HUB but writes a NEW adapter wrapper at `_shared/social/threads.ts` — does NOT modify the helper.
- All migration filenames are distinct (each lane owns its own date-suffixed slot under `20260520*`).

## Evidence Contract

See [99-EVIDENCE-CONTRACT.md](./99-EVIDENCE-CONTRACT.md). Per Frank's standing protocol: every lane brief MUST cite 2+ skills, 2+ librarians, 2+ 2026 URLs (the triplet rule's floor, not its ceiling).

## Operational Rules

| Rule | Reason |
|------|--------|
| No `bun build`, `tsc --noEmit`, playwright, vitest | N agents = memory exhaustion |
| Read + Edit + Write for code; Bash limited to `ls` / `grep` / `cat` / `find` / `date` | Same |
| User verifies builds after wave settles | Single verification point |
| Every brief ends with Citations triplet (2+ of each minimum) | Standing protocol per memory |
| No time language | Production cadence rule |
| Grazzhopper and frvnkfrmchicago spelled verbatim | Brand-spelling rule |
| No rate-limit incident notes in deliverables | Per standing rule — just continue |

## Merge Order

```
Wave 1 (6 lanes parallel — no file overlap):
  Lane 1 (Module polish)            ┐
  Lane 2 (Share-card loop)          │
  Lane 3 (Public profile)           ├─ all run simultaneously
  Lane 4 (Portfolio)                │
  Lane 5 (Multi-social)             │
  Lane 6 (Notifications fixes)      ┘

Wave 2 (shell coordinator):
  Lane 7 (App.tsx + layouts + Profile mount)

Wave 3 (gate):
  Lane 8 (verification + Explainer Mode closeout)
```

## Reporting Format

`Wave N of 3 complete → X% production done.`
`Lane N of 8 complete → X% wave done.`
