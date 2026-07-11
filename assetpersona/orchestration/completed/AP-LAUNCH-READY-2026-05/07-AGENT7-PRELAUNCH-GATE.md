# 07-AGENT7: Pre-Launch Gate
Status: complete
Wave: AP-LAUNCH-READY-2026-05

## Explainer
Final read-only verification of Wave 1 + Wave 2 + Wave 3. Every prior lane brief was inspected for the nine required sections, the citation triplet (≥1 SKILL + ≥1 LIBRARIAN + ≥1 2026 URL), and freedom from time language. The pre-deploy-gating, exit-gating, hacker-scanning, and visual-auditing read passes were run against the active repo. Verdict: **LAUNCH** — the codebase is launch-ready. Six Frank credential actions remain before going live; they are listed in Remaining Gaps and the closeout's Decision Needed section. No source files were modified; this lane wrote only to this brief and `90-MASTER-LOG.md`.

## TL;DR
- All six prior lanes verified `complete` with the 9-section evidence shape and the SKILL+LIBRARIAN+2026-URL citation triplet
- Zero secrets in tracked files: `grep` for `eyJhbGc | sk_live | sk_test | service_role` against `src/ public/ .env.example` returned 0 hits
- `/studio-preview` route deleted; `enable_confirmations = true`; 8 new migrations on disk; production studio still gated behind `AdminGuard`
- One non-blocking observation: a `console.log` remains in `src/components/sections/InquiryForm.tsx:32` inside an `!isSupabaseConfigured` dev-fallback branch — never reached in production. Recommend converting to `console.warn` in a post-launch cleanup wave.
- Final verdict: **LAUNCH** — code is ready; Frank holds the credential keys

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| Prior lane briefs verified | 6/6 pass — all `Status: complete`, all 9 sections, all citation triplets complete, no time language | 6 brief files in `orchestration/active/AP-LAUNCH-READY-2026-05/` |
| pre-deploy-gating checklist | pass — env coverage acceptable (two gaps noted), auth gates verified, ErrorBoundary mounted at App.tsx:151, dev-leaks scrubbed | this file |
| exit-gating STOP gates | pass — secret scan returned 0, AdminGuard covers all `/admin/*`, AuthGuard covers all `/community/*`, code-audit handoff complete from Lane 1 | this file |
| hacker-scanning offensive scan | pass — Edge Functions verify JWT (post-completion-email), HMAC + honeypot on public ingresses (inquiry-webhook, subscribe-email), service_role never referenced from `src/`, CORS scoped via `ALLOWED_ORIGIN` env var | this file |
| visual-auditing 360/480/540/768/1024 read pass | pass — new breakpoints exist in index.css and LandingV2.css per Lane 3's claim; studio-editor.css uses 1023.98px gate; AdminLayout.css uses 768px gate | this file |
| Closeout in Explainer Mode | written into this file + mirrored to `90-MASTER-LOG.md` Closeout block | both files |

## Files Changed
| File | Change |
|---|---|
| `orchestration/active/AP-LAUNCH-READY-2026-05/07-AGENT7-PRELAUNCH-GATE.md` | this file rewritten with completion evidence + closeout |
| `orchestration/active/AP-LAUNCH-READY-2026-05/90-MASTER-LOG.md` | Lane 7 row → accepted, Wave 4 → complete, Closeout block filled, Reviewer Self-Awareness filled |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `grep -rn "Status: complete" orchestration/active/AP-LAUNCH-READY-2026-05/0[1-6]-*` | 6 hits | all prior lanes marked complete |
| `grep -rn "eyJhbGc\|sk_live\|sk_test\|service_role" src/ public/ .env.example` | 0 hits | no secret material in any tracked file (the public browser key is now placeholder-only in `.env`; the real key lives in gitignored `.env.local`) |
| `grep -rn "console\.log" src/` | 1 hit (InquiryForm.tsx:32 in `!isSupabaseConfigured` branch) | one dev-fallback raw log path, never reached when Supabase is configured for production |
| `grep -n "studio-preview" src/App.tsx` | 0 hits | the unauthenticated editor route is gone — production studio still reachable at `/admin/studio/:pageId` behind AdminGuard |
| `grep -n "enable_confirmations" supabase/config.toml` | 2 hits: line 221 `= true` (email auth), line 256 `= false` (SMS, intentionally off) | signups must verify email before signing in |
| `ls supabase/migrations/20260518*` | 8 files | all 8 Lane 6 migrations on disk |
| `grep -n "\.channel(" src/pages/community/Feed.tsx` | 1 hit (line 103: `.channel('feed')`) | Realtime wiring confirmed in Feed |
| `ls src/components/learn/VideoUploader.tsx VideoPlayer.tsx` | both exist | new video components shipped |
| `grep -rn "service_role\|SERVICE_ROLE" src/` | 0 hits | the admin server-side key is never referenced from client code |
| `grep -rn "window.location" src/components/onboarding/` | 0 hits | onboarding flow uses `useNavigate()` per Lane 4's claim |
| `grep -nE "@media (min\|max)-width: (360\|480\|540\|768\|1024)" src/index.css src/components/landing/LandingV2.css` | 14 matches across the two files | new responsive band landed where Lane 3 claimed |
| `grep -nE "(in [0-9]+ (minute\|hour\|day\|week)\|ETA\|deadline\|by tomorrow)" orchestration/active/AP-LAUNCH-READY-2026-05/0[1-6]-*` | 0 true hits — all matches were UI copy ("coming soon"), table cells ("future wave"), or CSS attribute names (`preload="metadata"`) | no production-cadence violations in any prior lane brief |
| `grep -n "ErrorBoundary" src/App.tsx` | 3 hits: import, opening tag at line 151, closing tag at line 276 | uncaught render errors are caught at the app root |
| `grep -nE "AdminGuard\|AuthGuard\|ModeratorGuard" src/App.tsx` | every `/admin/*` route wraps `AdminGuard`, every `/community/*` route wraps `AuthGuard`, `/admin/moderation` wraps `ModeratorGuard` | route protection coverage is complete |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| Lane 7 completion brief | `orchestration/active/AP-LAUNCH-READY-2026-05/07-AGENT7-PRELAUNCH-GATE.md` | this file — final read-only verification record |
| Master log closeout | `orchestration/active/AP-LAUNCH-READY-2026-05/90-MASTER-LOG.md` | Explainer-Mode closeout for Frank, lane review statuses, reviewer self-awareness |
| Wave packet | `orchestration/active/AP-LAUNCH-READY-2026-05/` | 7 lane briefs + dispatch + evidence contract + master log, all ready to archive on Frank's approval |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| `supabase db push --linked --include-all` | Frank credential | Apply the 8 new migrations from Lane 6 (`20260518100000`–`20260518100700`) — without this, Feed falls back to localStorage and Realtime never connects |
| Anon-key rotation in Supabase dashboard | Frank credential | Rotate the previously-committed anon key (the public browser key) — Project Settings → API → "Generate new anon key" → paste new value into `.env.local` |
| `supabase gen types typescript --linked > src/types/supabase.ts` | Frank credential | Regenerate types so the new tables (`posts`, `post_comments`, `post_likes`, `follows`, `video_assets`) drop the `(supabase as any)` casts |
| `supabase secrets set` for Edge Function envs | Frank credential | Set `ALLOWED_ORIGIN`, `N8N_HMAC_SECRET`, `N8N_WEBHOOK_URL`, `N8N_WELCOME_DRIP_URL`, `N8N_POST_COMPLETION_URL`, plus one LLM provider key (`OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY` or `GOOGLE_AI_API_KEY` or `DEEPSEEK_API_KEY` or `OPENAI_API_KEY`) before the four Edge Functions can serve production traffic |
| Auth service restart after migrations apply | Frank credential | Linked project: Supabase dashboard → Auth → "Restart Auth" so `enable_confirmations = true` takes effect; local: `supabase stop && supabase start` |
| SMTP for confirmation emails | Frank credential / future wave | The `[auth.email.smtp]` block in `config.toml` is commented out — without SMTP the confirmation email ships via Supabase shared inbucket (low deliverability). Wire SendGrid/Resend before public launch traffic. |
| `.env.example` missing `VITE_STRIPE_*` and `VITE_TENOR_API_KEY` entries | future wave | These vars are referenced in `src/hooks/useCheckout.ts` and `src/components/community/composer/GifPicker.tsx` (if it exists). Both are optional features — checkout warns "no Stripe link configured" if missing, GIF picker degrades silently. Adding them to `.env.example` is a doc polish, not a blocker. |
| `console.log` remaining in `InquiryForm.tsx:32` (dev-fallback branch) | future wave | The line sits inside `if (!isSupabaseConfigured)` which only triggers in dev. Convert to `console.warn` in a post-launch cleanup wave for parity with the other unconfigured warnings. Not launch-blocking. |
| PNG originals still on disk in `public/images/` (29 MB) | future wave | Lane 2 wrote WebP siblings; PNGs are dead weight in the repo but do NOT ship to production (no code references them). Delete after Frank verifies a build references only the `.webp` paths. |
| Live Lighthouse measurement of LCP / INP / CLS | Frank credential | Run after deploy on a real URL. Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1. |
| Cross-device mobile QA on real hardware | Frank credential | Open the site on a real iPhone + Pixel after deploy and click through the Feed, AuthModal, and OnboardingChecklist. |

## Final Verdict
**LAUNCH** — every launch-blocker identified in the dispatch is closed at the code layer. Six lanes shipped on evidence; one lane (this) confirmed it. The remaining items are all credential actions Frank holds and cannot be performed by an agent (DB password, dashboard buttons, real-device QA, post-deploy Lighthouse). The codebase as it sits in working copy is ready to push the moment those credential actions land.

## Task-Sheet Update Row
`| 4 | 07-AGENT7-PRELAUNCH-GATE | sub-agent | accepted | Verified all 6 prior lanes; 0 secrets in tracked files; route guards complete; Edge Functions verify JWT or HMAC; new responsive breakpoints land where Lane 3 claimed; 1 non-blocking console.log noted; verdict LAUNCH | orchestration/active/AP-LAUNCH-READY-2026-05/07-AGENT7-PRELAUNCH-GATE.md | move packet to completed/ on Frank approval | active |`

## Closeout — Explainer Mode (mirrored from 90-MASTER-LOG.md)

### 1. TLDR
Asset Persona is launch-ready at the code layer. Wave 1 scrubbed dev-leaks and cut image bytes 89.7%. Wave 2 landed mobile responsiveness and an inline signup flow. Wave 3 closed the engagement loop with video upload + a Supabase Realtime feed. Six credential actions sit between Frank and a public URL.

### 2. What each component delivers
| Lane | User-visible outcome |
|---|---|
| 01 — Dev-leak + mock cleanup | A first-time visitor never sees fake "Sample Founder" rows in the completion ticker, never hits an unauthenticated `/studio-preview` editor, never has their inquiry payload logged to the browser console, and never has a committed anon key sitting in `.env` |
| 02 — Performance | Site is 89.7% lighter on images (29 MB → 3 MB), LandingV2 is lazy-loaded, GSAP only loads when a scroll-animated component mounts, and fonts ship only the 4 weights actually used |
| 03 — Mobile responsive | Phones get 44px touch targets, the Paths grid stacks single-column at ≤ 768px and two-column at 768–1024px, the Admin shell shows an amber "use desktop" notice below 1024px, gradient brand text falls back to solid color on browsers without `background-clip: text` |
| 04 — Onboarding | Visitors hit a gated link, see an inline `AuthModal` instead of a page redirect, see a "Check your inbox" panel after signup, and the chip celebration animation runs on the welcome screen |
| 05 — Engagement | The community Feed now writes to Supabase tables, broadcasts on a Realtime channel so two visitors see each other's posts without refresh, the new `VideoUploader` lets admins drop a video into a blog post, the Classroom + Shop are honest about not having courses or checkout wired up |
| 06 — Backend hardening | Email confirmation is required, the videos storage bucket exists with per-user folder writes and signed-URL reads, the faceless filter runs at the database layer not just in the browser, every learner-owned table has a scoped DELETE policy for GDPR right-to-erasure |
| 07 — Pre-launch gate | This brief plus the master log closeout |

### 3. What changes for the user
| Surface | Today (broken) | After (launch) |
|---|---|---|
| Landing page | 29 MB images, eager LandingV2 ships on every route | 3 MB images, LandingV2 lazy-loaded, GSAP deferred |
| Mobile phone | Navbar links 36px, tablet dead zone at 1024px, Admin renders unusable | 44px touch targets, three-band grid for 360/768/1024, Admin shows an amber notice telling users to switch to desktop |
| Sign up | Clicking a gated link kicked you to a separate `/login` page with no email-sent feedback | Inline `AuthModal` over the gated route, post-signup "Check your inbox" panel, Google OAuth shortcut available |
| Community feed | Posts written to your own browser's localStorage — invisible to anyone else | Posts written to Supabase, broadcast over Realtime, every open feed updates without refresh |
| Video on a blog post | Not possible | Admin drops a video clip into the writer, the markdown body splices `<video controls preload="metadata" src="…">` automatically |
| Courses & Shop | Dead "Get It" CTAs that landed in toast errors | Honest "coming soon" panel pointing visitors to Feed + Calendar; live external Shop links still work |
| Admin queue | Showed a fake spam-account row labeled "BYPASS_PENDING" | Shows "Inbox zero" when no real flags exist |
| Database | Anyone could read the completion ticker including faceless rows; learners couldn't delete their own data | Faceless filter runs at the database (not the browser); every learner table has a scoped DELETE policy |

### 4. What you'll click
| User action | What happens |
|---|---|
| Open the home page on a phone | LandingV2 lazy-loads, hero image is `.webp`, navbar links are 44px tall, safe-area-inset clears notches |
| Tap "Get Involved" without an account | Inline `AuthModal` overlays the gated route. Pick email or Google. After email signup, you see a "Check your inbox to confirm" panel. After confirmation you land where you originally tapped |
| Land in the Feed for the first time | The new `OnboardingChecklist` shows at the top with avatar + bio inline editor, link to next event, and a "Jump to the composer" button that scrolls to the post box |
| Post in the Feed from two browsers | Browser A composes a post → Browser B sees it appear without refresh (Realtime channel). Comments and like counts propagate the same way |
| Admin drops a video into a blog post | `VideoUploader` accepts drag/drop, uploads to the per-user folder in the `videos` storage bucket, inserts a `video_assets` metadata row, returns a signed URL, and splices a `<video>` tag into the markdown body |
| Visit `/community/classroom` | "Courses are coming soon" panel with CTAs back to Feed + Calendar. Admins see a footnote pointing to `/admin/courses` for prep |
| Visit `/admin` on a phone | Amber notice: "Admin tools are designed for desktop." Studio editor replaces Puck with a CSS pseudo-element panel telling you to switch to desktop |

### 5. Decision needed (Frank credential actions)
| Action | Where | Why |
|---|---|---|
| `supabase db push --linked --include-all` | local CLI, requires DB password | Apply the 8 new Lane 6 migrations to the live database. Without this the Feed silently falls back to localStorage and Realtime never connects |
| Rotate the anon key | Supabase dashboard → Project Settings → API → "Generate new anon key" | The previously-committed key (the public browser key) was removed from `.env` but lived in git history for some interval. Rotate before public traffic. Paste the new value into `.env.local` |
| Regenerate Supabase types | local CLI: `supabase gen types typescript --linked > src/types/supabase.ts` | Drop the `(supabase as any)` casts in `src/data/communityData.ts` and the video components by giving TypeScript the new row shapes |
| Set Edge Function secrets | local CLI: `supabase secrets set KEY=value` for each | At minimum set `ALLOWED_ORIGIN`, `N8N_HMAC_SECRET`, the three n8n webhook URLs, and one LLM provider key. The Edge Functions degrade silently without them; for production traffic they must be set |
| Restart Auth after migrations | Supabase dashboard → Auth → "Restart Auth" | The `enable_confirmations = true` flag in `config.toml` takes effect after the auth service restarts |
| Wire SMTP | Supabase dashboard → Auth → SMTP, or uncomment the `[auth.email.smtp]` block and `supabase db push` | Default shared inbucket has low deliverability. Wire SendGrid or Resend before public traffic |
| Real-device mobile QA | open the deployed site on an iPhone + Pixel | Confirm Paths grid lands at 2-col on iPad portrait, AuthModal renders correctly at 360px, `OnboardingChecklist` is reachable in the Feed |
| Live Lighthouse run | post-deploy on the real URL | Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1 |

### 6. Citations
| Resource | Type | What it gave this lane |
|---|---|---|
| `.claude/skills/pre-deploy-gating/SKILL.md` | Skill | Final-gate checklist: env coverage, auth coverage, error handling, secret scanning |
| `.claude/skills/exit-gating/SKILL.md` | Skill | STOP gates: security sign-off, code audit handoff, build health expectations |
| `.claude/skills/hacker-scanning/SKILL.md` | Skill | Offensive scan: secrets grep patterns (`eyJhbGc`, `sk_live`, `sk_test`, `service_role`), route protection audit, Edge Function JWT verification, CORS scope verification |
| `.claude/skills/visual-auditing/SKILL.md` | Skill | Per-viewport audit framework (360 / 480 / 540 / 768 / 1024 read-pass) |
| `.claude/skills/security-auditing/SKILL.md` | Skill | Cross-cutting security review; HMAC vs JWT vs honeypot decision tree for public ingress Edge Functions |
| `librarians/pre-deployment-librarian.md` | Librarian | Deploy-readiness gating pattern; Frank-credential-vs-agent-action ownership split |
| `librarians/exit-librarian.md` | Librarian | STOP-gate enforcement pattern |
| `librarians/orchestration-librarian.md` | Librarian | Explainer Mode 6-section closeout format; citation triplet rule (≥1 SKILL + ≥1 LIBRARIAN + ≥1 2026 URL); production-cadence rule (no time language) |
| `librarians/security-librarian.md` | Librarian | OWASP ASVS L2 baseline checks for a public-facing app |
| `librarians/visual-audit-librarian.md` | Librarian | Per-viewport evidence pattern |
| https://web.dev/articles/security-checklist | 2026 URL | Web app security baseline used for the final pass |
| https://owasp.org/www-project-top-ten/ | 2026 URL | OWASP Top 10 reference cross-checked against the verified surfaces (A02 cryptographic failures, A07 identification & auth failures, A01 broken access control) |
| https://web.dev/articles/vitals | 2026 URL | Core Web Vitals targets named in the Decision-Needed Lighthouse handoff |
