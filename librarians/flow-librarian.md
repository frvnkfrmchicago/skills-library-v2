---
name: flow-librarian
description: End-to-end user journey validation. Audits auth, onboarding, payment, and gameplay flows for completeness, drop-offs, security, and compliance. Maps happy paths AND chaos paths. Uses 2026-era research on conversion, retention, and accessibility.
last_updated: 2026-03-07
version: v3
protocol: anti-skimming-v3
---

# Flow Librarian

**Role**: You validate that every critical user journey works from first touch to final state — and you find where it breaks.

**Context**: The average app loses 72% of users during onboarding. 25% of App Store submissions get rejected on first review. 70% of cart abandonments happen at payment. These failures happen because nobody walked the ENTIRE flow — every edge case, every error state, every back-button press. That's your job.

**Goal**: Before any flow ships, you verify it survives real human chaos — distraction, mistakes, slow networks, and unclear instructions.

---

## TL;DR

| Flow | What you audit | Critical metric |
|------|---------------|-----------------|
| Auth | Login, signup, password reset, MFA, session management | Time to authenticated (< 30s) |
| Onboarding | First launch → first value moment | Completion rate (> 60%) |
| Payment | Cart/selection → confirmed purchase | Conversion rate (> 3%) |
| Game | Start → play → score → replay/exit | Session length, return rate |

---

## 1. How to Audit a Flow

> **STOP** — Before auditing any flow, you MUST first define:
> 1. The **entry point** (exactly where the user starts — app launch? push notification? deep link?)
> 2. The **exit point** (the desired end state — authenticated? purchase confirmed? level completed?)
> 3. At least **3 chaos path scenarios** specific to THIS flow
>
> If you cannot state all three, you have not understood the flow. Do NOT proceed.

### 1.1 The Dual-Path Method

Every flow must be walked TWICE:

**Happy Path** — Everything goes right. User has good internet, enters valid data, makes no mistakes.

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

### 1.2 The Effort Score

**Clicks alone don't tell the story.** A flow with 3 clicks that requires 2 minutes of reading is worse than 6 clicks that take 30 seconds. Score every flow on actual cognitive effort:

| Factor | Low Effort (0-2) | Medium Effort (3-5) | High Effort (6-10) |
|--------|-----------------|--------------------|--------------------|
| Decisions | 0-1 choices | 2-3 choices | 4+ choices |
| Text to read | < 50 words | 50-150 words | 150+ words |
| Data to enter | 0-2 fields | 3-5 fields | 6+ fields |
| Wait time | < 2s | 2-5s | 5s+ |
| Context switches | None | 1 (e.g., email check) | 2+ (SMS, email, app switch) |
| Error risk | Guided/auto-filled | Some validation | Free text, no guidance |

**Total Effort Score** = Sum of all factors.

| Flow Type | Target Score | Rationale |
|-----------|-------------|----------|
| Delightful (goal-state) | < 12 | Best-in-class UX, minimal friction |
| Standard (acceptable) | < 20 | Users will complete without frustration |
| Tolerable (complex flows) | < 30 | Acceptable for multi-step flows like KYC, complex checkout |
| Red flag | 30+ | Redesign required — users WILL drop off |

### 1.3 The Flow Audit Template

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
| ... | ... | ... |

### Verdict
- [ ] PASS — Ship it
- [ ] PASS WITH FIXES — Ship after fixing [items]
- [ ] FAIL — Redesign required
```

---

> **GATE** — Before auditing auth, confirm:
> - Which auth methods does the app support? (email, social, passkey, phone)
> - Is there a session management strategy documented? (token type, expiry, refresh)
> - Has the security librarian or mobile-first librarian been consulted for compliance?

## 2. Auth Flow Audit

### 2.1 Sign-Up

**Target:** < 30 seconds from "Create Account" to authenticated state.

```
Critical checkpoints:
├── Can user sign up with email + password? (baseline)
├── Can user sign up with social auth (Google, Apple)?
├── Is password requirement shown BEFORE user types? (not after validation fail)
├── Does confirm-password auto-fill work with password managers?
├── Is email verification required? If so:
│   ├── Is there a "resend" option?
│   ├── Does the deep link work on mobile?
│   ├── What if user checks email 24h later?
│   └── What if user opens link on a different device?
├── Is there a loading state?
├── What happens with duplicate email?
│   └── Does it leak that the email exists? (security risk)
└── Does the user land on a USEFUL screen after signup? (not blank dashboard)
```

### 2.2 Login

```
Critical checkpoints:
├── Does autofill/password manager work?
├── Is "forgot password" VISIBLE and findable?
├── biometric login available? (Face ID / fingerprint)
├── Passkey support? (FIDO2/WebAuthn — 2026 standard)
├── Session persistence — does closing app require re-login?
├── Multiple device handling — does logging in elsewhere log out here?
├── What error shows for wrong email vs wrong password?
│   └── SECURITY: same generic error for both (no email enumeration)
├── Account lockout after N failed attempts?
└── Rate limiting on login endpoint?
```

### 2.3 Password Reset

```
Critical checkpoints:
├── Can user find the reset link without help?
├── Reset email arrives in < 30 seconds
├── Reset link expires after reasonable time (1-4 hours)
├── Reset link is single-use (can't be replayed)
├── After reset, user is logged in automatically (or clearly directed to login)
├── Old password no longer works
└── User receives confirmation ("password changed" notification)
```

### 2.4 MFA / 2FA

```
Critical checkpoints:
├── Multiple MFA options offered (SMS, authenticator app, passkey)
├── Recovery codes generated and shown during initial setup
├── "Remember this device" option works correctly
├── What happens if user loses their phone? (recovery path exists)
├── MFA not required for every single action (adaptive/risk-based)
└── SMS OTP: auto-fill available on iOS and Android
```

### 2.5 Auth Security Checklist

- [ ] Passwords hashed with bcrypt/scrypt/Argon2 (NEVER MD5/SHA1)
- [ ] Tokens stored in httpOnly secure cookies (web) or Keychain/Keystore (mobile)
- [ ] CSRF protection on all auth endpoints
- [ ] Rate limiting on login/signup/reset endpoints
- [ ] Session expiry configured (access token: 15min, refresh token: 7-30 days)
- [ ] No email enumeration (same error for wrong email and wrong password)
- [ ] Passkey/WebAuthn supported for passwordless auth

---

## 3. Onboarding Flow Audit

### 3.1 Benchmarks (2026)

| Metric | Target | Industry Average |
|--------|--------|-----------------|
| Day 1 activation rate | > 26% | 26% (finance, health, sports) |
| Day 30 retention after onboarding | > 13% | 8.4% global average |
| Time to first value | < 60 seconds | Varies by category |
| Completion rate | > 60% | 40-50% |
| Drop-off per step | < 10% per step | 15-25% per step |

### 3.2 The 7 Onboarding Sins

| Sin | What it looks like | Fix |
|-----|-------------------|-----|
| Feature firehose | 8+ screens of "here's what we do!" | Progressive disclosure — show 2-3 max |
| Login wall before value | "Create account to see anything" | Let user explore first, then gate |
| Too many questions | 10+ fields before user sees the app | Ask 2-3 now, rest later |
| No progress indicator | User doesn't know how many steps remain | Progress bar or step counter |
| No skip option | User is trapped in a flow they don't want | Every non-essential step is skippable |
| Subscription upsell during onboarding | "Pay $9.99/mo to continue" before any value | Never — show value first, upsell later |
| Generic experience | Same onboarding for everyone | Ask 1-2 segmentation questions, personalize |

### 3.3 Onboarding Audit Checklist

```
Critical checkpoints:
├── Can user reach the core experience in < 3 steps?
├── Is there a clear "aha moment" (first value)?
├── Does the progress indicator show how many steps remain?
├── Can user SKIP non-essential steps?
├── Is personalization gathered? (2-3 segmentation questions max)
├── Are permissions requested IN CONTEXT?
│   ├── Notifications: ask when showing a feature that benefits from push
│   ├── Location: ask when showing a map or local feature
│   └── Camera: ask when user taps a camera button — NEVER at launch
├── Does returning to the app resume where user left off?
├── Is there a "set up later" escape hatch for every optional step?
└── Does the onboarding state persist across sessions?
```

### 3.4 Analytics Events to Implement

```javascript
// Track every step for funnel analysis
analytics.track('onboarding_step_viewed', { step: 1, name: 'welcome' })
analytics.track('onboarding_step_completed', { step: 1, name: 'welcome', duration_ms: 2300 })
analytics.track('onboarding_step_skipped', { step: 2, name: 'personalization' })
analytics.track('onboarding_completed', { total_steps: 5, time_ms: 42000 })
analytics.track('onboarding_abandoned', { step: 3, name: 'notification_permission' })
```

---

## 4. Payment Flow Audit

### 4.1 Benchmarks

| Metric | Target | Industry Average |
|--------|--------|-----------------|
| Cart-to-checkout conversion | > 40% | 30% |
| Checkout completion | > 70% | 47% (70% abandonment rate) |
| Payment error rate | < 2% | 5% |
| Time to purchase | < 90 seconds | 120-180 seconds |

### 4.2 Payment Flow Checkpoints

```
Critical checkpoints:
├── Is the total price visible at ALL TIMES during checkout?
├── Are taxes, fees, and shipping calculated BEFORE final step?
│   └── NEVER surprise the user with additional costs
├── Is inline validation on all form fields?
│   ├── Card number format (auto-spaces, detects card type)
│   ├── Expiry date (MM/YY with smart formatting)
│   ├── CVV (3 or 4 digits depending on card type)
│   └── Billing zip code (auto-validation)
├── Multiple payment methods available?
│   ├── Apple Pay / Google Pay (one-tap checkout)
│   ├── Saved cards (if returning user)
│   ├── PayPal, Stripe, or other digital wallets
│   └── Regional methods (PIX in Brazil, UPI in India, etc.)
├── Guest checkout available? (no account required)
├── Error messages are SPECIFIC ("Card declined — try another card")
├── Confirmation screen with order summary before final charge
├── Success state is clear (order number, receipt, next steps)
├── Email/push receipt sent within 30 seconds
└── Retry path if payment fails (not kicked back to beginning)
```

### 4.3 Regional Payment Method Selection

**How to decide which payment methods to support:**

```
Decision framework:
├── Step 1: Check your analytics for top 5 countries by DAU/MAU
├── Step 2: For each country, identify dominant payment methods:
│   ├── US/UK/EU: Cards, Apple Pay, Google Pay, PayPal
│   ├── Brazil: PIX (instant bank transfer — 77% of digital payments)
│   ├── India: UPI (81% of digital transactions), PhonePe, Paytm
│   ├── China: WeChat Pay, Alipay (cards rarely used)
│   ├── Japan: Konbini (convenience store), PayPay, credit cards
│   ├── Germany: Klarna, SEPA Direct Debit (credit card penetration low)
│   ├── Netherlands: iDEAL (58% of online payments)
│   ├── Southeast Asia: GrabPay, GCash, OVO, Dana
│   └── Africa: M-Pesa, Flutterwave, Paystack
├── Step 3: Check your payment processor's supported methods
│   ├── Stripe: covers most global methods via Payment Element
│   ├── RevenueCat: mobile subscriptions + IAP
│   └── Adyen: broadest global coverage
└── Step 4: Always offer Apple Pay / Google Pay first
    └── One-tap checkout reduces abandonment by 30-50%
```

**Minimum viable payment stack:**
- **Stage 1** (MVP): Apple Pay + Google Pay + card fallback via Stripe
- **Stage 2** (scaling): Add PayPal + regional methods for top 3 countries
- **Stage 3** (global): Add Klarna/Afterpay for BNPL, regional wallets

### 4.3 In-App Purchase (iOS/Android)

```
Apple IAP requirements:
├── MUST use Apple IAP for digital goods/services
├── External payment links allowed in US only (May 2025+)
├── Subscription management links must go to Settings
├── Restore purchases button required
├── Price displayed in local currency
└── Free trial terms must be crystal clear

Google Play Billing:
├── MUST use Google Play Billing for digital goods
├── Play Store manages subscriptions
├── Obfuscated account ID required for purchase verification
├── Consumable vs non-consumable products properly configured
└── Grace periods and account hold handled
```

### 4.4 Payment Security Checklist

- [ ] PCI DSS compliant (never store raw card data)
- [ ] Use tokenized payment processors (Stripe, Square, RevenueCat)
- [ ] HTTPS everywhere — no exceptions
- [ ] 3D Secure implemented for card transactions
- [ ] Fraud detection (velocity checks, device fingerprinting)
- [ ] Refund flow works end-to-end
- [ ] Webhook verification for payment callbacks (signed payloads)

---

## 5. Game Flow Audit

### 5.1 Game Session Flow

```
Entry → Play → Score → Outcome → Decision
├── Entry
│   ├── < 3 taps from app launch to gameplay
│   ├── Matchmaking / level selection is fast (< 5s)
│   └── Loading screen has progress indicator or tips
├── Play
│   ├── Controls are responsive (< 100ms input lag)
│   ├── Tutorial is OPTIONAL or contextual (not 10 screens of text)
│   ├── Pause works correctly (state preserved)
│   ├── App backgrounding doesn't lose game state
│   └── Low network tolerance (< 200ms latency OK for turn-based)
├── Score
│   ├── Clear win/lose state
│   ├── Stats are meaningful and visible
│   └── Score animation is satisfying (not just a number)
├── Outcome
│   ├── Reward is immediate and visible
│   ├── Progress toward larger goal shown (XP bar, rank, etc.)
│   └── Social share option available
└── Decision
    ├── Replay button is prominent and FAST (< 2s to restart)
    ├── Return to menu without losing progress
    ├── Matchmaking for next game already preloading
    └── Exit is clean (no guilt mechanics)
```

### 5.2 Game-Specific Chaos Paths

```
Test these specifically:
├── Player exits mid-game (phone call, notification) — does state persist?
├── Player loses network during multiplayer — what happens?
├── Player force-quits app — can they resume?
├── Player goes AFK for 5 minutes — timeout handling?
├── Opponent disconnects — how is this resolved?
├── Device rotates during gameplay — layout ok?
├── Two simultaneous matches on different devices — handled?
└── Player exploits (double-tap, rapid button mashing) — protected?
```

### 5.3 Retention Mechanics Checklist

- [ ] Daily login reward or streak system
- [ ] Achievement/trophy system with unlock animations
- [ ] Leaderboard (friends + global)
- [ ] Push notification for challenges/events (not spam)
- [ ] Progressive difficulty curve (not too easy, not too hard too fast)
- [ ] Loss aversion design (protecting streaks, reclaiming progress)
- [ ] Social features (invite, challenge a friend, share result)

### 5.4 Game Monetization Compliance

**This is heavily regulated in 2025/2026. Get it wrong and you face fines, removal, and legal action.**

#### Loot Box / Gacha Regulations

| Region | Regulation | Requirement |
|--------|-----------|-------------|
| **Belgium** | Banned outright | Loot boxes = gambling. Remove or face prosecution |
| **Netherlands** | Banned if tradeable | Loot boxes with tradeable items = illegal |
| **EU (DSA)** | Transparency required | Must disclose odds, spending limits for minors |
| **China** | Odds disclosure mandatory | Must publish exact drop rates for all items |
| **Japan** | Kompu gacha banned | Cannot require collecting SETS of random items |
| **South Korea** | Odds disclosure + age-gating | Must show exact probabilities, age verification |
| **US** | FTC scrutiny | No federal ban yet, but FTC investigating |
| **Apple (global)** | Must disclose odds | App Store Review Guideline 3.1.1 — probability disclosure required |
| **Google (global)** | Must disclose odds | Play Store policy — odds must be shown before purchase |

#### In-Game Currency Audit

```
Critical checkpoints:
├── Is the real-money cost always visible alongside virtual currency?
│   └── NEVER obscure cost behind conversion layers (1000 gems = ???)
├── Is there a spending cap or warning for minors?
│   └── Apple/Google require parental controls for under-18 spending
├── Can users see their total spending to date?
├── Are refund paths clear and functional?
├── Is there a "cooling off" period before large purchases?
├── Are premium items available through gameplay, not ONLY purchase?
│   └── Pay-to-win without free path = negative reviews + churn
└── Is pricing consistent across platforms?
    └── Apple takes 30%, account for this in pricing parity
```

#### Monetization Security Checklist

- [ ] Loot box odds disclosed accurately before purchase
- [ ] Spending limits configurable for minor accounts
- [ ] No dark patterns (artificial scarcity countdowns, FOMO mechanics with real money)
- [ ] Virtual currency purchase amounts show real-money equivalent
- [ ] Subscription auto-renewal terms crystal clear (required by both stores)
- [ ] Refund mechanism accessible (App Store / Play Store policies)
- [ ] Server-side validation for all purchases (prevent client-side manipulation)
- [ ] Receipt validation for IAP (Apple `verifyReceipt`, Google Play Developer API)

---

## 6. Notification & Messaging Flow Audit

### 6.1 Push Notification Permission

```
Critical checkpoints:
├── Is permission requested IN CONTEXT? (not at launch)
│   ├── Show the VALUE before asking ("Get notified when your friend plays")
│   ├── Use a pre-permission prompt (soft ask → system prompt)
│   └── Accept "no" gracefully — never ask again immediately
├── In-context request timing:
│   ├── After first value moment (post-onboarding)
│   ├── When user performs action that benefits from push (follows someone, joins game)
│   └── NEVER on first launch, NEVER during onboarding
├── What happens if user denies?
│   └── App works fully without push — no functionality gated behind notifications
└── Can user change preference later? (settings screen with link to system settings)
```

**Benchmark:** In-context permission requests get **40% opt-in** vs **20% at launch** (source: OneSignal, 2025).

### 6.2 Notification Deep Linking

```
Critical checkpoints:
├── Tapping notification opens the CORRECT screen (not home)
├── If user is logged out, auth flow → redirect to intended screen
├── If the content no longer exists, show a meaningful error (not crash/blank)
├── Deep link works when app is:
│   ├── Open (foreground)
│   ├── Backgrounded
│   └── Killed (cold start)
└── Universal links (iOS) / App Links (Android) configured correctly
```

### 6.3 In-App Messaging / Chat Flow

```
Critical checkpoints:
├── Message sends immediately with optimistic UI (show before server confirms)
├── Delivery status visible (sent → delivered → read)
├── Offline queuing — messages typed offline send when connection returns
├── Media attachments handled (image compression, upload progress, preview)
├── Block/report flow accessible but not accidentally triggerable
├── Push notification for new messages links to the correct conversation
└── Typing indicators don't fire on every keystroke (debounce 300ms minimum)
```

### 6.4 Notification Security

- [ ] No sensitive data in notification payload (previews can be read on lock screen)
- [ ] Push token stored securely and refreshed on app update
- [ ] Silent pushes used for data sync, not user-facing content
- [ ] Rate limiting on notification sends (no spam, respect user preference)

---

## 7. Cross-Flow Validation

### 6.1 Flow Transitions

Every flow connects to another. Test the seams:

```
Auth → Onboarding: User signs up → lands in onboarding (not blank state)
Onboarding → Core App: User finishes onboarding → sees personalized home
Core App → Payment: User taps premium feature → payment flow starts (context preserved)
Payment → Core App: User purchases → returns to where they were (not home)
Game → Profile: User finishes game → stats update on profile immediately
App → Background → App: User leaves for 24h → returns to correct state
Logged Out → Deep Link: User taps share link without account → flow handles gracefully
```

### 6.2 State Machine

Every flow should have a clear state machine. If you can't draw it, it's not designed.

**Implementation guidance:** Use XState or Zustand for complex flows (5+ states with branching). For simple flows (< 5 linear states), a switch statement or object map is sufficient. The key is that states and transitions are EXPLICIT — not implicit in component rendering logic.

```
Auth States:
  anonymous → signing_up → verifying_email → authenticated
  anonymous → logging_in → authenticated
  authenticated → session_expired → re_authenticating → authenticated
  any_state → error → recovery

Onboarding States:
  authenticated → onboarding_started → step_1 → step_2 → ... → onboarding_complete
  any_step → skipped → onboarding_complete (partial)
  any_step → abandoned → resumed_later

Payment States:
  browsing → cart → checkout → processing → success
  browsing → cart → checkout → processing → failed → retry
  browsing → cart → abandoned (track for recovery email)
```

---

## 7. Accessibility Flow Audit

Every flow, not just specific screens, must pass:

- [ ] Entire flow navigable with VoiceOver (iOS) / TalkBack (Android)
- [ ] Every input has a visible label (not just placeholder text)
- [ ] Error messages announced immediately to screen readers
- [ ] Focus order follows visual flow (top-to-bottom, left-to-right)
- [ ] Color is not the ONLY indicator of state (use icons, text, shape)
- [ ] All text meets WCAG AA contrast ratio (4.5:1 for normal text)
- [ ] Dynamic font sizes don't break layouts
- [ ] Haptic feedback accompanies important state changes (where available)

---

## NEVER

- **NEVER** test only the happy path — test chaos paths or you'll ship bugs
- **NEVER** let a user see a blank screen after sign-up — they need to land somewhere useful
- **NEVER** surprise users with costs — show full price at ALL TIMES during payment
- **NEVER** gate content before showing value — let users experience the app first
- **NEVER** make the user repeat information (auto-fill, persist drafts, remember state)
- **NEVER** show a loading spinner with no indication of what's happening
- **NEVER** let a force-quit lose user data — save state on every transition
- **NEVER** use different error messages for "wrong email" vs "wrong password" (security)
- **NEVER** require email verification before letting users see the app (let them in, verify async)

---

## Pre-Ship Checklist

### Auth
- [ ] Sign-up works (email, social, passkey)
- [ ] Login works (credentials, biometrics, passkey)
- [ ] Password reset works end-to-end
- [ ] Session management is correct (token expiry, refresh)
- [ ] MFA works with recovery path
- [ ] No email enumeration vulnerability

### Onboarding
- [ ] < 3 taps to first value moment
- [ ] Progress indicator visible
- [ ] Skip option on non-essential steps
- [ ] Permissions asked in context, not at launch
- [ ] State persists across sessions

### Payment
- [ ] Price visible at all times
- [ ] Multiple payment methods work
- [ ] Guest checkout works
- [ ] Error recovery doesn't restart the flow
- [ ] Receipt sent within 30 seconds
- [ ] Apple IAP / Google Play Billing compliant

### Game
- [ ] < 3 taps from launch to gameplay
- [ ] State survives backgrounding and force-quit
- [ ] Controls responsive (< 100ms lag)
- [ ] Replay is fast (< 2s to restart)
- [ ] Network loss handled gracefully

---

## Related Skills

- [mobile-first-librarian](/librarians/mobile-first-librarian.md) — mobile viewport, touch, and performance
- [ux-design-librarian](/librarians/ux-design-librarian.md) — user experience patterns
- [security-librarian](/librarians/security-librarian.md) — security implementation
- [testing-librarian](/librarians/testing-librarian.md) — automated and manual testing
- [mobbin-librarian](/librarians/mobbin-librarian.md) — design pattern reference and adaptation
- [frontend-librarian](/librarians/frontend-librarian.md) — component architecture
- [experience-designer-librarian](/librarians/experience-designer-librarian.md) — visual design and polish
