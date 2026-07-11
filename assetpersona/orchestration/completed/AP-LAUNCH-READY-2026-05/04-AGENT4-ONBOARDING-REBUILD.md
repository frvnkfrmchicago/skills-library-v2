# 04-AGENT4: Onboarding Rebuild
Status: complete
Wave: AP-LAUNCH-READY-2026-05

## Explainer
The signup-to-first-post path used to bounce visitors across three full page navigations (gated route, `/login`, back to `/community`) and never told them a verification email had been sent. This lane stitches the path into a single inline overlay: visitors hit a gated route, see an inline `AuthModal`, get a "Check your inbox" panel after signup, and land on the gated route they originally requested with no page reloads. Onboarding tasks now happen in place rather than navigating away, and the profile row auto-bumps `onboarding_step` so the checklist marks itself done without a separate "I did the thing" click.

## TL;DR
- Inline `AuthModal` replaces the `/login` page navigation; supports email + password, Google OAuth, and a post-signup "Check your inbox" panel
- `AuthGuard` no longer hard-redirects; it mounts the modal over an inert background and preserves the requested URL for post-auth resolution
- `WelcomeModal` uses `useNavigate({ replace: true })` instead of `window.location.assign`; chip selection plays a checkmark celebration before the route swap
- `OnboardingChecklist` is now a 3-step inline wizard (avatar + bio in place, live-event link, scroll-to-composer) with a progress bar and per-step inline forms
- `UserSettings` profile save auto-bumps `onboarding_step` to 1 whenever avatar + bio are both present, including a separate code path for avatar-only uploads
- Auth + welcome copy scrubbed against the copywriting-enforcing ban list (no "elevate", "unlock", "leverage", "supercharge", "seamless", no em-dashes in user-facing strings)

| Field | Value |
|---|---|
| Mission | Visitor lands, clicks any auth-gated action, sees an inline signup modal, confirms email, builds profile inline, drops first post. No page reloads. No dead-ends. Feels like the conversation it is. |
| Owned scope | `src/components/guards/AuthGuard.tsx`, `src/components/onboarding/AuthModal.tsx` (NEW), `src/components/onboarding/AuthModal.css` (NEW), `src/components/onboarding/WelcomeModal.tsx`, `src/components/onboarding/WelcomeModal.css`, `src/components/onboarding/OnboardingChecklist.tsx`, `src/components/onboarding/OnboardingChecklist.css`, `src/pages/community/UserSettings.tsx`, `src/context/AuthContext.tsx`, `src/context/AuthContextBase.ts`, `src/pages/Login.tsx`, `src/pages/Login.css` |
| Do not touch | Lane 6 still owns `supabase/config.toml`. Lane 5 still owns `Feed.tsx`. Lane 3 still owns the responsive layout CSS. None of those files were modified. |
| Inputs consumed | Onboarding audit findings from chat; existing `AuthContext`, `WelcomeModal`, `OnboardingChecklist`, `UserSettings`, `Login` source files |
| Skills/docs consulted | `.claude/skills/flow-designing/SKILL.md`, `.claude/skills/onboarding-designing/SKILL.md`, `.claude/skills/ux-designing/SKILL.md`, `.claude/skills/copywriting-enforcing/SKILL.md`, `.claude/skills/interactive-animating/SKILL.md` |
| Done criteria status | All four validation greps pass (see Commands Run). |

## Delivery Summary
| Requested outcome | Result | Evidence path |
|---|---|---|
| Inline AuthModal | shipped, NEW component, mounts on gated routes via `AuthGuard`, supports Google OAuth + email/password, post-signup "Check your inbox" panel | `src/components/onboarding/AuthModal.tsx` |
| AuthGuard → modal trigger | swapped `<Navigate to="/login" replace />` for an `AuthModal` overlay; close button bails to `/` rather than leaving the visitor staring at a gated shell | `src/components/guards/AuthGuard.tsx` |
| Post-signup confirmation UX | renders when `signUp` returns `needsConfirmation: true` (Supabase user without active session); also mirrored on the standalone `/login` page for direct hits | `src/components/onboarding/AuthModal.tsx`, `src/pages/Login.tsx` |
| Kill window.location.assign | replaced with `useNavigate()` + `navigate(route, { replace: true })`; modal stays mounted during the route swap | `src/components/onboarding/WelcomeModal.tsx` |
| Flatten OnboardingChecklist | every step now renders inline UI on the same surface: avatar uploader + bio textarea, anchor link to the next live event, scroll-to-composer button. Progress bar feedback added | `src/components/onboarding/OnboardingChecklist.tsx`, `src/components/onboarding/OnboardingChecklist.css` |
| Auto-bump onboarding_step on profile save | two paths: text save uses GREATEST() semantics in the UPDATE, avatar save fires a dedicated `bumpOnboardingStepOne()` helper when a bio is also present | `src/pages/community/UserSettings.tsx` |
| Motion polish on chip selection | brief checkmark animation overlays the picked chip before the route changes (Framer Motion `AnimatePresence` + spring) | `src/components/onboarding/WelcomeModal.tsx`, `src/components/onboarding/WelcomeModal.css` |
| Copy AI-tell scrub | grep run against the ban list returns zero hits in user-facing strings; em-dashes only appear in code comments | `src/components/onboarding/AuthModal.tsx`, `src/components/onboarding/WelcomeModal.tsx`, `src/components/onboarding/OnboardingChecklist.tsx` |
| AuthContext signUp return shape | added `needsConfirmation: boolean` to the typed return so the UI knows whether to show the email panel | `src/context/AuthContext.tsx`, `src/context/AuthContextBase.ts` |

## Files Changed
| File | Change |
|---|---|
| `src/components/guards/AuthGuard.tsx` | Replaced page redirect with inline `AuthModal` overlay; close-bail routes home |
| `src/components/onboarding/AuthModal.tsx` | NEW. Inline auth surface with sign in / sign up toggle, Google OAuth, and post-signup confirmation phase |
| `src/components/onboarding/AuthModal.css` | NEW. Token-only styling, 480px max-width card, spring entrance, reduced-motion fallback |
| `src/components/onboarding/WelcomeModal.tsx` | Switched to `useNavigate({ replace: true })`; added checkmark celebration on chip pick; copy scrubbed |
| `src/components/onboarding/WelcomeModal.css` | Added confirmed-chip overlay styles and reduced-motion fallback |
| `src/components/onboarding/OnboardingChecklist.tsx` | Rewrote as inline 3-step wizard (avatar + bio, event link, composer scroll); progress bar; auto-saving textarea |
| `src/components/onboarding/OnboardingChecklist.css` | Added progress bar, inline form styles, save-status indicators, reduced-motion fallback |
| `src/pages/community/UserSettings.tsx` | Added `bumpOnboardingStepOne()` helper; text-save uses GREATEST() semantics; avatar `onUpdated` callback fires the bump when a bio is present |
| `src/context/AuthContext.tsx` | `signUp` now returns `needsConfirmation` derived from `data.user && !data.session` |
| `src/context/AuthContextBase.ts` | Typed `signUp` return shape now includes `needsConfirmation: boolean` |
| `src/pages/Login.tsx` | Added a "Check your inbox" render path mirrored from `AuthModal` so direct `/login` signups also see confirmation UX |
| `src/pages/Login.css` | Added `login-confirm` styles for the new email-check panel |

## Commands Run
| Command | Result | Plain meaning |
|---|---|---|
| `grep -rn "window.location.assign" src/components/onboarding/` | 0 hits | No more forced full-page reloads from the onboarding flow |
| `grep -rn '<Navigate to="/login"' src/components/guards/` | 0 hits | The guard no longer kicks visitors to the standalone login page |
| `grep -rn "AuthModal" src/` | 7 hits across 2 files (component + guard import) | New modal is wired into the route guard |
| `grep -cn "onboarding_step" src/pages/community/UserSettings.tsx` | 7 hits | Step auto-bump logic is in place in both the text-save path and the avatar-only path |
| `grep -niE "elevate\|unlock\|leverage\|supercharge\|seamless\|cutting.edge\|game.chang\|revolutionar" src/components/onboarding/` | 0 hits | Copy passes the AI-tell ban list |

## Artifacts
| Artifact | Path | Purpose |
|---|---|---|
| AuthModal | `src/components/onboarding/AuthModal.tsx` | Inline signup / signin overlay that replaces the `/login` page navigation for gated routes |
| AuthModal styles | `src/components/onboarding/AuthModal.css` | Token-only styling, spring entrance, reduced-motion fallback |
| Rebuilt AuthGuard | `src/components/guards/AuthGuard.tsx` | Mounts the modal over the gated surface, preserves requested URL for post-auth resolution |
| Inline WelcomeModal | `src/components/onboarding/WelcomeModal.tsx` | Chip picker with celebration animation, router-based navigation |
| Inline OnboardingChecklist | `src/components/onboarding/OnboardingChecklist.tsx` | 3-step inline wizard with progress bar and per-step inline forms |
| AuthContext type update | `src/context/AuthContextBase.ts` | Typed `signUp` return includes `needsConfirmation` flag |

## Remaining Gaps
| Gap | Owner | Next action |
|---|---|---|
| Email confirmation requires `enable_confirmations = true` in Supabase config | Lane 6 | Lane 6 enables the flag in `supabase/config.toml`. UI is ready; flag flips on backend, then Frank runs `supabase db push`. |
| `OnboardingChecklist` is not yet rendered in any page | Lane 5 (Feed rebuild) | Lane 5 imports `OnboardingChecklist` into the Feed sidebar or hero region so it actually surfaces. The component is self-contained and ready to drop in. |
| Branded email template | future wave | The default Supabase email works for launch; Frank can swap the template in the Supabase dashboard later for brand polish. |
| `signOut` does not clear the bypass session | known behavior, pre-existing | The dev-bypass banner controls bypass lifecycle. Not in lane scope. |
| `/login` page still exists as a standalone route | by design, per the brief | Direct URL hits, password-reset link-backs, and OAuth callbacks all still hit `/login` cleanly. The brief said "don't break the password reset flow" so the page stays. |

## Task-Sheet Update Row
`| 2 | 04-AGENT4-ONBOARDING-REBUILD | sub-agent | accepted | Inline AuthModal + welcome celebration + flat onboarding wizard + step auto-bump | orchestration/active/AP-LAUNCH-READY-2026-05/04-AGENT4-ONBOARDING-REBUILD.md | hand to Lane 7 visual audit | active |`

## Citations
| Resource | Type | What it gave the lane |
|---|---|---|
| `.claude/skills/flow-designing/SKILL.md` | Skill | Happy + chaos path mapping; the inline-modal pattern is the chaos-path repair for "visitor clicks a gated link" |
| `.claude/skills/onboarding-designing/SKILL.md` | Skill | Progressive profiling cap at three steps, behavior-triggered nudges, no time-based blasts |
| `.claude/skills/ux-designing/SKILL.md` | Skill | Inline-modal pattern, motion-as-feedback, edge state design for "Check your email" panel |
| `.claude/skills/copywriting-enforcing/SKILL.md` | Skill | AI-tell ban list, microcopy standards, no em-dashes in user-facing strings |
| `.claude/skills/interactive-animating/SKILL.md` | Skill | Spring entrance for modal, checkmark celebration on chip pick, `prefers-reduced-motion` fallback |
| `librarians/facilitator-librarian.md` | Librarian | UX flow review pattern, step decomposition into inline-vs-route, drop-off triage |
| `librarians/frontend-librarian.md` | Librarian | React 19 modal pattern, Framer Motion `AnimatePresence` usage, accessible focus management |
| https://www.nngroup.com/articles/sign-up-forms/ | 2026 URL | Nielsen Norman Group canonical guidance on signup form best practices (label-on-top, single column, social as primary path) |
| https://supabase.com/docs/guides/auth/auth-email | 2026 URL | Supabase email confirmation behavior reference; `data.user && !data.session` is the documented "needs confirmation" signal |
| https://web.dev/articles/sign-in-form-best-practices | 2026 URL | web.dev signup conversion patterns: 44px touch targets, autocomplete attributes, minimal cognitive load |
