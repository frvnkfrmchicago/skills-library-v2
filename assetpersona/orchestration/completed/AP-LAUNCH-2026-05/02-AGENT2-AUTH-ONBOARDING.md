# Agent 2 — Auth & Onboarding Flow
Status: assigned
Wave: 3 (Engagement)
% on completion: 90%
Owner: Antigravity Sonnet 4.6
Single source of truth: this file only.

## Explainer
Audit found auth works but is unsafe and uninviting: profile-creation race lost display names, no email verification, no password reset, weak 6-char minimum, and after signup the user lands on `/community` cold with no welcome and no progressive profiling. This lane fixes the auth flow and adds the engagement on-ramp that 2026 research shows lifts activation 25%+.

## TL;DR
- New users hit a single-question welcome chip ("What brings you here?") that writes their intent into `services_interest` and routes them to the right landing.
- Forgot password + reset password routes work end-to-end.
- Google OAuth gives a one-click signup path.
- Email verification is enforced before community access.
- A 3-item onboarding checklist (profile · event · feed hello) shows on `/community` for users with `onboarding_step < 3`.
- Tier gating is applied to paid routes.

| Field | Value |
|---|---|
| Mission | Make signup safe, friendly, and routed by intent |
| Owned scope | `src/context/AuthContext.tsx`, `src/pages/Login.tsx`, `src/pages/ForgotPassword.tsx` (new), `src/pages/ResetPassword.tsx` (new), `src/components/onboarding/*` (new), `src/components/guards/AuthGuard.tsx` (extend, not replace) |
| Do not touch | DB migrations (Agent 1), inquiries table (Agent 1), consultant `/work` pages (Agent 3), n8n workflows (Agent 4), blog (Agent 5), CRM (Agent 6) |
| Inputs | Agent 1 completed evidence (profiles columns, trigger), `flow-designing` SKILL, `onboarding-designing` SKILL |
| Skills required | `.claude/skills/flow-designing/SKILL.md`, `.claude/skills/onboarding-designing/SKILL.md`, `.claude/skills/supabase-building/SKILL.md`, `.claude/skills/copywriting-enforcing/SKILL.md` |
| Validation commands | Manual flow walkthrough on real device, effort score audit per flow-designing, `bun run build` |
| Done criteria | Effort score < 12 on signup, 4 chaos paths from `flow-designing` checklist tested, `/forgot-password` emails the link, OAuth round-trip works, welcome modal records intent |
| Output contract | Rewrite this file with completion evidence per `99-EVIDENCE-CONTRACT.md` |

## Build Tasks

- [ ] Remove client-side `INSERT INTO profiles` in `AuthContext.signUp` (now handled by Agent 1's fixed trigger). Pass `display_name` via `options.data.full_name`.
- [ ] Add Google OAuth button on `Login.tsx` using `signInWithOAuth({ provider: 'google' })` with `redirectTo: ${origin}/auth/callback`.
- [ ] Add `/auth/callback` route to handle OAuth return.
- [ ] Add `ForgotPassword.tsx` with `supabase.auth.resetPasswordForEmail`.
- [ ] Add `ResetPassword.tsx` to handle the recovery email link.
- [ ] Bump password `minLength` to 10 on signup form, add a small strength meter component.
- [ ] Enable hCaptcha on signup (Supabase setting + frontend integration).
- [ ] In `AuthGuard`, after auth check, additionally redirect users with `email_confirmed_at = null` to a "verify your email" interstitial page.
- [ ] New `WelcomeModal` (single question, 4 chips: Hire Frank · Speaking · Training · Just Learning). On submit: PATCH `profiles.services_interest`, set `onboarding_step = 1`, route to the relevant landing.
- [ ] New `OnboardingChecklist` (3 items max) that renders on `/community` while `onboarding_step < 3`. Items: complete profile (avatar + bio), join an event, post first hello in feed.
- [ ] Tier-gate component for `/community/classroom` and any future paid route — checks `profile.tier`.

## Flow Audits to Run (per flow-designing skill)

- [ ] Happy path: signup → welcome → personalized landing in ≤ 3 taps
- [ ] Chaos: user closes welcome modal → it must reappear next session until completed
- [ ] Chaos: user signs up with already-used email → clean error, not enumeration
- [ ] Chaos: forgot-password link opened twice → second use invalidates first
- [ ] Chaos: OAuth cancellation → returns to login with no orphaned profile row

## Completion Rule

Rewrite this file with completion evidence. No time language.

## Hand-off

Agent 6 (engagement + CRM) reads `onboarding_step` and `services_interest` to power the Kanban filters and behavior nudges.
