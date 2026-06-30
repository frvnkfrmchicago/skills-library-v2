---
timestamp: 2026-06-30T00:00:00Z
wave: AP-STUDYHALL-SKOOL-REDESIGN-2026-06
mode: planner-executor
agent: planner+executor (SAD gates 1-5, 9 file-exclusive lanes, 2 batches)
branch: ash-redesign-skool
---

## TLDR
- Redesigned the Agentic Study Hall around one beginner-legible loop: Learn -> Discuss -> Build -> Show -> Ship.
- Fixed the broken build (unused `X` import that blocked `tsc -b`/deploy) and collapsed ~30 sprawling routes into a skool-simple grouped sidebar (Community / Learn / You) with no dead links.
- Unified the two competing learning hubs (a fake hardcoded Classroom vs the real LearnHub) onto one canonical `learnStore`; Classroom now shows real progress.
- Added two missing surfaces: realtime group Chat (channels + presence) and a Deploy & Ship guide; added a Start Here onboarding hub.
- Removed GrazzHopper wax/lumens brand-bleed from Portfolio and made it a tokenized proof-of-work Showcase; closed the Upgrade.Self pipeline to a single publish target.
- Verified live in the preview at desktop + mobile: build typecheck exits 0, zero console errors, every surface renders.

## What Was Created
| Type | Description | File Path |
| --- | --- | --- |
| Data | Single canonical module store (additive helpers + mapper) | src/data/learnStore.ts, src/lib/upgrade-self/courseBuilder.ts |
| Surface | Realtime group chat (channels + presence) | src/pages/community/Chat.tsx (+ .css), src/data/chatStore.ts |
| Migration | chat_messages table + RLS + realtime publication | supabase/migrations/20260630120000_community_chat.sql |
| Surface | Deploy & Ship guide (4-host decision + manage-it) | src/pages/community/Deploy.tsx (+ .css), src/data/deployTargets.ts |
| Surface | Start Here onboarding hub + activation milestones | src/pages/community/StartHere.tsx (+ .css), src/data/startHere.ts |
| Page | Portfolio cleaned into tokenized Showcase | src/pages/community/Portfolio.tsx (+ .css) |
| Shell | Build fix + skool-simple sidebar IA | src/components/community/CommunityLayout.tsx |
| Routing | New routes + learn->classroom unification | src/App.tsx |
| Page | Classroom driven by real learnStore progress | src/pages/community/Classroom.tsx (+ .css) |
| Pipeline | Single publish target + clearer landing loop | src/pages/community/UpgradeSelf.tsx, src/pages/AgenticStudyHall.tsx (+ .css) |

## Per-Lane Evidence

### Lane 1 — Community Chat — shipped (commit 5907cfd)
- **Files:** src/data/chatStore.ts, supabase/migrations/20260630120000_community_chat.sql, src/pages/community/Chat.tsx, src/pages/community/Chat.css
- **Citations:** SKILL supabase-building, conversational-ai-building, mobile-first-enforcing; LIBRARIAN supabase-librarian, backend-librarian, frontend-librarian; 2026 https://supabase.com/docs/guides/realtime/postgres-changes, https://supabase.com/docs/guides/realtime/presence
- **Rule applied:** durable messages via DB insert + postgres_changes delivery, presence for online status; group channels not 1:1 DMs (respects the retired-DM product decision).
- **TLDR:** Channel rail + autoscroll message list + composer + live presence, Supabase realtime with localStorage fallback. Verified in preview.
- **Remaining gap:** none (migration must be applied to the live Supabase project for remote mode; localStorage covers the demo).

### Lane 2 — Deploy & Ship — shipped (commit 488458e)
- **Files:** src/data/deployTargets.ts, src/pages/community/Deploy.tsx, src/pages/community/Deploy.css
- **Citations:** SKILL deploying, mobile-first-enforcing, copywriting-enforcing; LIBRARIAN deployment-librarian, mobile-first-librarian; 2026 https://danubedata.ro/blog/cloudflare-pages-vs-netlify-vs-vercel-static-hosting-2026, https://blog.vibecoder.me/vercel-vs-netlify-vs-cloudflare-pages
- **Rule applied:** easiest-to-start is not always cheapest-to-stay; decision guide + per-host steps + manage-it.
- **TLDR:** 4-host comparison, project-type recommender, manage section. Verified in preview.
- **Remaining gap:** none.

### Lane 3 — Start Here — shipped (commit fe781c9)
- **Files:** src/data/startHere.ts, src/pages/community/StartHere.tsx, src/pages/community/StartHere.css
- **Citations:** SKILL onboarding-designing, ux-designing, mobile-first-enforcing; LIBRARIAN onboarding-librarian, ux-design-librarian; 2026 https://circle.so/blog/community-onboarding, https://userpilot.com/blog/best-user-onboarding-experience/
- **Rule applied:** checklists drive activation (Zeigarnik/endowed-progress); milestones wired to real actions, probes read real data.
- **TLDR:** Welcome hub + loop visual + activation checklist. Chat milestone retargeted to /community/chat by the lead. Verified in preview.
- **Remaining gap:** none.

### Lane 4 — Learning Unification (data) — shipped (commit dd657e9)
- **Files:** src/data/learnStore.ts, src/lib/upgrade-self/courseBuilder.ts
- **Citations:** SKILL frontend-architecting, anti-mock-enforcing; LIBRARIAN feature-architecture-librarian, frontend-librarian, backend-librarian; 2026 https://kentcdodds.com/blog/application-state-management-with-react
- **Rule applied:** single source of truth; merge-by-slug, canonical wins; additive-only so consumers migrate without breakage.
- **TLDR:** publishGeneratedCourse + listSandboxModules + listLearnableModules + generatedCourseToModule. Typecheck clean.
- **Remaining gap:** none.

### Lane 5 — Portfolio Showcase — shipped (commit b34038c)
- **Files:** src/pages/community/Portfolio.tsx, src/pages/community/Portfolio.css
- **Citations:** SKILL consistency-checking, ux-designing, anti-mock-enforcing, component-building; LIBRARIAN consistency-librarian, ux-design-librarian, anti-mock-data-librarian; 2026 https://webflow.com/blog/design-portfolio-examples
- **Rule applied:** gallery + process-over-polish + explicit-AI; token-only color/space; no fabricated stats.
- **TLDR:** Removed wax/lumens brand-bleed + literal hex; real stats; gallery cards. Verified in preview.
- **Remaining gap:** CertUpload.tsx (owned elsewhere) still writes ap_lumens internally; the Showcase page is fully decoupled from it. Flagged for a follow-up touch.

### Lane 6 — Shell & IA — shipped (commit cbcca91)
- **Files:** src/components/community/CommunityLayout.tsx
- **Citations:** SKILL mobile-first-enforcing, experience-designing, copywriting-enforcing; LIBRARIAN feature-architecture-librarian, frontend-librarian, mobile-first-librarian; 2026 https://www.skool.com/, https://www.nngroup.com/articles/information-architecture-study-guide/
- **Rule applied:** one click to any core feature; deliberate simplicity; mobile mirrors desktop.
- **TLDR:** Build fix (TS6133) + Community/Learn/You groups + dead-Inbox removal. Verified in preview.
- **Remaining gap:** none.

### Lane 7 — Routing — shipped (commit c9177c8)
- **Files:** src/App.tsx
- **Citations:** SKILL frontend-architecting, flow-designing; LIBRARIAN frontend-librarian, implementation-librarian; 2026 https://reactrouter.com/start/library/routing
- **Rule applied:** single canonical learning entry point; verify files exist before importing; import hygiene under noUnusedLocals.
- **TLDR:** Wired chat/deploy/start; learn -> classroom redirect; module player kept. Typecheck clean.
- **Remaining gap:** none.

### Lane 8 — Classroom — shipped (commit 0357da9)
- **Files:** src/pages/community/Classroom.tsx, src/pages/community/Classroom.css
- **Citations:** SKILL anti-mock-enforcing, experience-designing, mobile-first-enforcing; LIBRARIAN frontend-librarian, mobile-first-librarian, anti-mock-data-librarian; 2026 https://www.skool.com/
- **Rule applied:** no fabricated data; one screen, one clear next step.
- **TLDR:** Real modules/completions/reviews, honest progress bar, fake radar/cohort removed. Verified in preview ("0 of 5 tracks, 0%").
- **Remaining gap:** CompetencyRadar.tsx + CohortCalendar.tsx are now orphaned; safe to delete in a cleanup touch (no longer imported).

### Lane 9 — Pipeline & Landing — shipped (commit 7145366)
- **Files:** src/pages/community/UpgradeSelf.tsx, src/pages/AgenticStudyHall.tsx, src/pages/AgenticStudyHall.css
- **Citations:** SKILL api-integrating, copywriting-enforcing, mobile-first-enforcing, experience-designing; LIBRARIAN api-integration-librarian, frontend-librarian, mobile-first-librarian; 2026 https://kingy.ai/ai/the-definitive-guide-how-to-use-notebooklm-to-create-your-entire-course-curriculum-from-scratch/
- **Rule applied:** one typed write seam, stop the dual-write drift; research-to-product pipeline lands in the one hub.
- **TLDR:** Single learnStore publish (no ap_sandbox_modules dual-write); glyphs -> Phosphor icons; landing states the loop plainly. Verified in preview.
- **Remaining gap:** none.

## Verification
- Build: `tsc -b` exits 0 (was failing on the unused `X` import before the wave).
- Console: zero errors across Landing, Forum, Chat, Classroom, Showcase, Deploy, Start Here.
- Responsive: mobile (375x812) drawer + single-column reflow + bottom tab bar confirmed on Deploy.

## Explanation
Ran the five SAD gates straight through (no pause, per the user's instruction). Gate 1 mapped the real codebase and found the breakage was incoherence, not absence: a one-line build break, IA sprawl with a dead Inbox and duplicate sub-tabs, two competing learning hubs (one fake), brand-bleed in Portfolio, a split pipeline output, and two genuinely missing surfaces (chat, deploy). Gate 2 grounded each decision in 2026 sources (Skool simplicity, Supabase realtime, portfolio process-over-polish, deploy tradeoffs, onboarding checklists, NotebookLM-style pipelines). Gate 3 framed every lane around the gap. Gate 4 decomposed into 9 file-exclusive lanes across 2 dependency-ordered batches. Gate 5 dispatched them as parallel agents (Workflow), then the lead ran the single typecheck, verified in the browser preview, and committed each lane on the ash-redesign-skool branch.
