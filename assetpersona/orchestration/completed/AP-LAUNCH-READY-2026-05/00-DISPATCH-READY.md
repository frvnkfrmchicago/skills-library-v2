# AP-LAUNCH-READY-2026-05 — Dispatch Ready

## Mission
Close the gap between "4 waves shipped, all source-complete" (per management/MASTER-LOG.md) and a public launch that survives contact with users. Address every blocker found in the six-lens launch readiness audit: dev-leak risk, image/bundle weight, mobile responsiveness, onboarding friction, missing engagement primitives, and backend RLS/auth posture.

## Production Cadence (no time language — orchestration-librarian rule)

| Wave | Name | % on completion | Status |
|------|------|----|--------|
| 1 | Dev-leak + Performance + Backend hardening (parallel) | 45% | not started |
| 2 | Mobile + Onboarding rebuild (parallel) | 75% | not started |
| 3 | Engagement closure (video upload, realtime feed, scope decisions) | 90% | not started |
| 4 | Pre-launch gate (security, visual, type-check, bundle audit) | 100% | not started |

Current production: **0%**. Next: **Wave 1 — Dev-leak + Performance + Backend hardening**.

Status format: `Wave N of 4 complete → X% production done. Next: Wave N+1 — <name>.`

## Audit-Driven Inputs

This packet exists because the launch-readiness audit (six parallel Explore agents, summarized in chat) found:

| Domain | Critical finding | Where it's addressed |
|--------|------------------|----------------------|
| Mock + dev-leak | `/studio-preview` unauthenticated in prod ([App.tsx:233](../../../src/App.tsx)); `BYPASS_FAKE` users on live `CompletionTicker`; `BYPASS_PENDING` sample comments on `Moderation`; `.env` contains real anon key; `console.log` in `PathwayInquiryForm` | Lane 1 |
| Performance | 29MB unoptimized PNGs in `public/images/`; LandingV2 NOT lazy-loaded; GSAP global eager-load; BlogHydrator blocks TTI; LCP estimated 3.5–4.5s | Lane 2 |
| Mobile | Paths grid 3-col down to 1024px; no 360–540px breakpoint band; 36px Navbar touch targets; Admin/Studio assume desktop; missing `-webkit-overflow-scrolling: touch` | Lane 3 |
| Onboarding | Hard redirect at `/login` instead of inline modal; no email-confirmation UX; `window.location.assign()` page reload; `OnboardingChecklist` points to dead-ends; profile completion not auto-tracked | Lane 4 |
| Engagement | No video upload UI exists; community feed is localStorage-only (no Supabase Realtime); courses are hollow shells (no `CourseDetail` page, no lesson manager); shop has no checkout | Lane 5 |
| Backend | `enable_confirmations = false` in `config.toml`; missing `posts`/`comments`/`likes`/`follows` tables; no `video_assets` table or bucket; faceless filter client-side only; missing DELETE policies | Lane 6 |
| Launch gate | No end-to-end pre-deploy verification on this wave's deliverables | Lane 7 |

## Mode

**Multi Primary Agent** (declared). Lead orchestrator is this chat. Each lane runs as its own sub-agent invocation; the lane brief file is the canonical evidence record. Per [feedback_packet_continuity.md](memory): runs end-to-end, no mid-packet checkpoint asks. Per [feedback_no_time_language.md](memory): waves + 0–100% only.

## Skills and Librarians Referenced

| Resource | Used By | Purpose |
|----------|---------|---------|
| [librarians/orchestration-librarian.md](../../../../librarians/orchestration-librarian.md) | Lead | Wave packet lifecycle + production cadence + Explainer Mode |
| [librarians/multi-agent-librarian.md](../../../../librarians/multi-agent-librarian.md) | All | File-bound decomposition; no two lanes touch the same file |
| [librarians/review-orchestration-librarian.md](../../../../librarians/review-orchestration-librarian.md) | Lead at closeout | 18-checklist review + Fixer Component |
| [.claude/skills/anti-mock-enforcing/SKILL.md](../../../../.claude/skills/anti-mock-enforcing/SKILL.md) | Lane 1 | Bypass-stub vs production-mock distinction; scrub fakes; dev-only gates |
| [.claude/skills/code-cleaning/SKILL.md](../../../../.claude/skills/code-cleaning/SKILL.md) | Lane 1 | Dead-code removal, console.log scrub, route hygiene |
| [.claude/skills/performance-tuning/SKILL.md](../../../../.claude/skills/performance-tuning/SKILL.md) | Lane 2 | Core Web Vitals — LCP, INP, CLS targets; bundle splits; image strategy |
| [.claude/skills/anti-glitch-debugging/SKILL.md](../../../../.claude/skills/anti-glitch-debugging/SKILL.md) | Lane 2 | Main-thread budget, asset loading, CLS |
| [.claude/skills/mobile-first-enforcing/SKILL.md](../../../../.claude/skills/mobile-first-enforcing/SKILL.md) | Lane 3 | 44px touch targets, dvh, safe-area, breakpoint architecture |
| [.claude/skills/visual-auditing/SKILL.md](../../../../.claude/skills/visual-auditing/SKILL.md) | Lane 3, Lane 7 | 360/390/768/1024 screenshot pass + brand consistency |
| [.claude/skills/consistency-checking/SKILL.md](../../../../.claude/skills/consistency-checking/SKILL.md) | Lane 3 | Token gaps, hardcoded values, raw hex |
| [.claude/skills/flow-designing/SKILL.md](../../../../.claude/skills/flow-designing/SKILL.md) | Lane 4 | Happy + chaos path mapping, drop-off scoring |
| [.claude/skills/onboarding-designing/SKILL.md](../../../../.claude/skills/onboarding-designing/SKILL.md) | Lane 4 | Progressive profiling, welcome chip, behavior nudges |
| [.claude/skills/ux-designing/SKILL.md](../../../../.claude/skills/ux-designing/SKILL.md) | Lane 4 | Inline-modal pattern, motion feedback, edge states |
| [.claude/skills/copywriting-enforcing/SKILL.md](../../../../.claude/skills/copywriting-enforcing/SKILL.md) | Lane 4 | Strip AI-tells from auth + welcome copy |
| [.claude/skills/api-integrating/SKILL.md](../../../../.claude/skills/api-integrating/SKILL.md) | Lane 5 | Upload retry, signed URLs, webhook verification |
| [.claude/skills/supabase-building/SKILL.md](../../../../.claude/skills/supabase-building/SKILL.md) | Lane 5, Lane 6 | RLS-first, signed URLs, realtime channel cleanup, storage policy |
| [.claude/skills/component-building/SKILL.md](../../../../.claude/skills/component-building/SKILL.md) | Lane 5 | VideoUploader + VideoPlayer micro-interactions |
| [.claude/skills/interactive-animating/SKILL.md](../../../../.claude/skills/interactive-animating/SKILL.md) | Lane 5 | Upload progress motion, feed entrance |
| [.claude/skills/database-designing/SKILL.md](../../../../.claude/skills/database-designing/SKILL.md) | Lane 6 | Schema for posts/comments/likes/follows/video_assets + indexes |
| [.claude/skills/security-auditing/SKILL.md](../../../../.claude/skills/security-auditing/SKILL.md) | Lane 6, Lane 7 | RLS coverage, DELETE policy gaps, GDPR posture |
| [.claude/skills/backend-hardening/SKILL.md](../../../../.claude/skills/backend-hardening/SKILL.md) | Lane 6 | Email confirmation, password policy, JWT verification |
| [.claude/skills/pre-deploy-gating/SKILL.md](../../../../.claude/skills/pre-deploy-gating/SKILL.md) | Lane 7 | Final gate — security + env + tests + docs |
| [.claude/skills/exit-gating/SKILL.md](../../../../.claude/skills/exit-gating/SKILL.md) | Lane 7 | STOP gates before live |
| [.claude/skills/hacker-scanning/SKILL.md](../../../../.claude/skills/hacker-scanning/SKILL.md) | Lane 7 | Offensive scan: secrets, routes, injection, headers |

## 2026 Research Decisions Baked Into Packet

- **Core Web Vitals targets:** LCP < 2.5s, INP < 200ms, CLS < 0.1 (web.dev 2026 Vitals baseline). Lane 2 must measurably move LCP from ~4s estimate toward this band.
- **Mobile-first remains the only correct architecture for public-launch consumer brand surfaces** — desktop assumptions for admin/studio are acceptable behind explicit gates, never silent breakage.
- **Inline auth modals beat hard redirects** for signup conversion (Mobbin pattern: every modern consumer app — Threads, Substack, Discord — uses inline auth modals on first action, not page navigation).
- **Email confirmation is non-optional** for public launch (spam + impersonation risk if disabled; OWASP 2026 ASVS L2).
- **Realtime feeds are table stakes** — a community feed without Supabase Realtime (or equivalent) is broken for any concurrent user pair.
- **Cut scope before launch is stronger than ship-broken** — Lane 5 explicitly authorized to hide Courses/Shop behind "coming soon" gates if full implementations don't land cleanly.

2026 sources cited per lane in their respective briefs.

## Lane Decomposition (file-bound, no overlap)

| Agent | Lane | Wave home | File ownership |
|-------|------|-----------|----------------|
| Agent 1 | Dev-leak + Mock cleanup | Wave 1 | `src/App.tsx` (one block — `/studio-preview` route), `src/components/learn/CompletionTicker.tsx`, `src/pages/admin/Moderation.tsx`, `src/components/intake/PathwayInquiryForm.tsx`, `src/data/moduleGen.ts`, `src/components/blog/ModuleEmbed.tsx`, `.env`, `.env.example`, `.gitignore` |
| Agent 2 | Performance — image + bundle | Wave 1 | `src/main.tsx`, `src/App.tsx` (lazy-load block only), `src/hooks/useGSAP.ts`, `src/data/blogSync.ts`, `vite.config.ts`, `index.html`, `public/images/**` (image conversion), `src/components/landing/**` (lazy-load wrapping), `src/assets/projects/**` |
| Agent 3 | Mobile responsive fix | Wave 2 | `src/index.css`, `src/tokens.css`, `src/components/landing/LandingV2.css`, `src/components/layout/Navbar.css`, `src/components/admin/AdminLayout.css`, `src/components/admin/AdminLayout.tsx` (mobile gate only), `src/studio/engine/StudioEditor.css`, `src/components/learn/FloatingDock.css`, `src/components/learn/ChapterNav.css`, `src/pages/Admin.css`, `src/components/onboarding/WelcomeModal.css` (responsive touch only) |
| Agent 4 | Onboarding rebuild | Wave 2 | `src/components/guards/AuthGuard.tsx`, `src/components/onboarding/AuthModal.tsx` (NEW), `src/components/onboarding/AuthModal.css` (NEW), `src/components/onboarding/WelcomeModal.tsx`, `src/components/onboarding/OnboardingChecklist.tsx`, `src/components/onboarding/OnboardingChecklist.css`, `src/pages/community/UserSettings.tsx`, `src/context/AuthContext.tsx`, `src/pages/Login.tsx` |
| Agent 5 | Engagement closure | Wave 3 | `src/components/learn/VideoUploader.tsx` (NEW), `src/components/learn/VideoUploader.css` (NEW), `src/components/learn/VideoPlayer.tsx` (NEW), `src/components/learn/VideoPlayer.css` (NEW), `src/pages/community/Feed.tsx` (realtime wiring only), `src/data/communityData.ts` (Supabase swap only), `src/pages/community/CourseDetail.tsx` (NEW or `/coming-soon` redirect), `src/pages/admin/CourseManager.tsx` (lesson manager addition), `src/components/layout/Navbar.tsx` (nav-gate only), `src/pages/Shop.tsx` (CTA gate only) |
| Agent 6 | Backend hardening | Wave 1 | `supabase/config.toml`, `supabase/migrations/20260518100000_enable_email_confirm.sql` (NEW), `supabase/migrations/20260518100100_create_posts.sql` (NEW), `supabase/migrations/20260518100200_create_post_comments_likes.sql` (NEW), `supabase/migrations/20260518100300_create_follows.sql` (NEW), `supabase/migrations/20260518100400_create_video_assets.sql` (NEW), `supabase/migrations/20260518100500_storage_videos_bucket.sql` (NEW), `supabase/migrations/20260518100600_faceless_rls_to_db.sql` (NEW), `supabase/migrations/20260518100700_add_delete_policies.sql` (NEW) |
| Agent 7 | Pre-launch gate | Wave 4 close | Read-only scan + this lane brief rewrite |

**Per multi-agent rule: no two lanes touch the same file.** Lane 1 owns the `/studio-preview` route block in `App.tsx` (one narrow gate); Lane 2 owns the lazy-load block (different lines). They must coordinate via explicit ordering: Lane 1 first writes its block, Lane 2 then writes its block. Lane 5 has nav-gate-only authority on `Navbar.tsx` and CTA-gate-only on `Shop.tsx`; Lane 3 owns the CSS only. Lane 6 owns supabase/ exclusively. Lane 4 owns auth + onboarding exclusively.

## Evidence Contract

See [99-EVIDENCE-CONTRACT.md](./99-EVIDENCE-CONTRACT.md). Each lane MUST rewrite its own brief file on completion with: Explainer, TL;DR, Delivery Summary table, Files Changed table, Commands Run table, Artifacts table, Remaining Gaps table, Task-Sheet Update row, Citations table (≥1 SKILL + ≥1 LIBRARIAN + ≥1 2026 URL).

## Merge Order

```
Wave 1 (parallel):  Lane 1 (Dev-leak)     ┐
                    Lane 2 (Performance)   ├─ no file overlap, run together
                    Lane 6 (Backend)       ┘
Wave 2 (parallel):  Lane 3 (Mobile)        ┐
                    Lane 4 (Onboarding)    ┴─ no file overlap, run together
Wave 3:             Lane 5 (Engagement)    — depends on Lane 6's tables existing
Wave 4 (gate):      Lane 7 (Pre-launch)    — read-only audit + closeout
```

## Operational Rules (per orchestration-librarian)

| Rule | Reason |
|------|--------|
| No `bun build`, `tsc --noEmit`, playwright, vitest, smoke tests during agent execution | N agents racing the same machine = memory exhaustion |
| Read + Edit + Write for code; Bash limited to `ls`/`grep`/`cat`/`find`/`date` | Same memory protection |
| User verifies builds after the wave settles, manually | Single point of verification |
| Every brief + closeout ends with Citations table | Traceability |
| No time language anywhere | Production cadence rule |
| No model-name references in plans/briefs | Plans are model-agnostic |
| No mid-wave A/B/C asks once plan is approved | Pick the obvious default, document, ship |

## Reporting Format

After every wave (batch) lands:

```
Wave N of 4 complete → X% production done.
Next: Wave N+1 — <wave name>.
```

After every lane closes:

```
Lane N of 7 complete → X% wave done.
Next: Lane N+1 — <name>.
```

## Note on Prior Wave-Studio Packet

`orchestration/active/wave-studio/` has all 5 lanes accepted per its master log; it remains in `active/` pending Frank's user-side migration deploy. This new packet runs in parallel; the orchestration-librarian's "one active packet" rule is interpreted as "one active *work* packet" — wave-studio is deployment-blocked, not work-blocked.
