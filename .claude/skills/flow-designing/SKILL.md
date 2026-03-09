---
name: flow-designing
description: >
  Validates end-to-end user journeys including auth, onboarding, payment,
  and gameplay flows for completeness, drop-offs, security, and compliance.
  Maps happy paths AND chaos paths with effort scoring. Use when auditing
  user flows, reviewing onboarding funnels, testing payment checkout, or
  validating game session loops.
---

# Flow Designing

Validate that every critical user journey works from first touch to final
state — and find where it breaks before users do.

---

## 1. Before You Audit

> **STOP** — Before auditing any flow, you MUST define:
> 1. The **entry point** (exactly where the user starts)
> 2. The **exit point** (the desired end state)
> 3. At least **3 chaos path scenarios** specific to THIS flow
>
> If you cannot state all three, you have not understood the flow. Do NOT proceed.

---

## 2. The Dual-Path Method

Every flow MUST be walked TWICE:

**Happy Path** — Everything goes right. Good internet, valid data, no mistakes.

**Chaos Path** — Everything goes wrong. This is where real users live.

```
Chaos Path scenarios to test EVERY flow:
├── User hits Back at every step
├── User leaves midway and returns next day
├── User enters invalid data in every field
├── User loses network connection mid-action
├── User rotates device during critical moment
├── User receives a phone call mid-flow
├── User's session token expires
├── User has 14pt font size (accessibility)
├── User is on a 3G connection
└── User is on a 5-year-old device (low RAM/CPU)
```

---

## 3. The Effort Score

Clicks alone don't tell the story. Score every flow on actual cognitive effort:

| Factor | Low (0-2) | Medium (3-5) | High (6-10) |
|--------|-----------|-------------|-------------|
| Decisions | 0-1 choices | 2-3 choices | 4+ choices |
| Text to read | < 50 words | 50-150 words | 150+ words |
| Data to enter | 0-2 fields | 3-5 fields | 6+ fields |
| Wait time | < 2s | 2-5s | 5s+ |
| Context switches | None | 1 (email check) | 2+ (SMS, email, app) |
| Error risk | Guided | Some validation | Free text, no guidance |

**Total Effort Score** = Sum of all factors.

| Flow Type | Target Score | Action |
|-----------|-------------|--------|
| Delightful | < 12 | Best-in-class UX |
| Standard | < 20 | Users complete without frustration |
| Tolerable | < 30 | Acceptable for complex flows (KYC, checkout) |
| Red flag | 30+ | Redesign required — users WILL drop off |

---

## 4. Flow Audit Template

Use this for EVERY flow you audit:

```markdown
## Flow Audit: [Flow Name]

### Overview
- **Entry point:** [Where user starts]
- **Exit point:** [Desired end state]
- **Happy path steps:** [N]
- **Effort score:** [0-60]
- **Estimated time:** [seconds]

### Step-by-Step Walkthrough
| Step | Screen | User Action | System Response | Error State | Back Behavior |
|------|--------|-------------|-----------------|-------------|---------------|
| 1 | ... | ... | ... | ... | ... |

### Drop-Off Risk Map
| Step | Risk Level | WHY | Mitigation |
|------|-----------|-----|------------|
| ... | HIGH/MED/LOW | ... | ... |

### Chaos Path Results
| Scenario | Outcome | Fix Required? |
|----------|---------|---------------|
| Back button at step 3 | State lost | YES |
| Network loss at step 5 | Spinner forever | YES |

### Verdict
- [ ] PASS — Ship it
- [ ] PASS WITH FIXES — Ship after fixing [items]
- [ ] FAIL — Redesign required
```

---

## 5. Flow-Specific Audits

Detailed audit checklists for each flow type are in `references/`:

- **Auth flows** — See `references/AUTH-FLOW.md` (sign-up, login, password reset, MFA, security)
- **Payment flows** — See `references/PAYMENT-FLOW.md` (checkout, IAP, regional methods, compliance)
- **Game flows** — See `references/GAME-FLOW.md` (game session, chaos paths, retention, monetization)

### Onboarding Quick Checklist

```
├── Can user reach the core experience in < 3 steps?
├── Is there a clear "aha moment" (first value)?
├── Progress indicator shows how many steps remain?
├── Can user SKIP non-essential steps?
├── Permissions requested IN CONTEXT (not at launch)?
├── Does returning to the app resume where user left off?
└── Does the onboarding state persist across sessions?
```

### Notification Quick Checklist

```
├── Permission requested IN CONTEXT (not at launch)?
├── Tapping notification opens the CORRECT screen?
├── Deep link works when app is foreground, background, and killed?
├── No sensitive data in notification payload?
└── Rate limiting on notification sends?
```

---

## 6. Cross-Flow Validation

Test the seams where flows connect:

```
Auth → Onboarding: Sign up → lands in onboarding (not blank state)
Onboarding → Core App: Finish → sees personalized home
Core App → Payment: Tap premium → payment starts (context preserved)
Payment → Core App: Purchase → returns to where they were (not home)
Game → Profile: Finish game → stats update immediately
App → Background → App: Leave 24h → returns to correct state
Logged Out → Deep Link: Tap link without account → handled gracefully
```

### State Machine

Every flow should have explicit states. Use XState or Zustand for complex
flows (5+ states with branching). For simple flows (< 5 linear states), a
switch statement or object map is sufficient.

```
Auth States:
  anonymous → signing_up → verifying_email → authenticated
  authenticated → session_expired → re_authenticating → authenticated

Payment States:
  browsing → cart → checkout → processing → success
  processing → failed → retry
```

---

## 7. Accessibility Flow Audit

Every flow must pass:

- [ ] Entire flow navigable with VoiceOver / TalkBack
- [ ] Every input has a visible label (not just placeholder text)
- [ ] Error messages announced to screen readers
- [ ] Focus order follows visual flow
- [ ] Color is not the ONLY state indicator
- [ ] WCAG AA contrast (4.5:1 for normal text)
- [ ] Dynamic font sizes don't break layouts

---

## NEVER

- **NEVER** test only the happy path — test chaos paths or ship bugs
- **NEVER** let a user see a blank screen after sign-up
- **NEVER** surprise users with costs — show full price at ALL TIMES
- **NEVER** gate content before showing value
- **NEVER** make the user repeat information
- **NEVER** show a spinner with no indication of what's happening
- **NEVER** let a force-quit lose user data
- **NEVER** use different error messages for wrong email vs wrong password

---

## Pre-Ship Checklist

### Auth
- [ ] Sign-up works (email, social, passkey)
- [ ] Login works (credentials, biometrics, passkey)
- [ ] Password reset works end-to-end
- [ ] Session management correct (token expiry, refresh)
- [ ] No email enumeration vulnerability

### Onboarding
- [ ] < 3 taps to first value moment
- [ ] Skip option on non-essential steps
- [ ] Permissions asked in context

### Payment
- [ ] Price visible at all times
- [ ] Multiple payment methods work
- [ ] Error recovery doesn't restart the flow

### Game
- [ ] < 3 taps from launch to gameplay
- [ ] State survives backgrounding and force-quit
- [ ] Replay is fast (< 2s to restart)
