---
name: pattern-referencing
description: >
  Identifies proven UI/UX patterns from Mobbin and real-world apps, critically
  analyzes them using the IAAA method (Identify, Analyze, Adapt, Apply), and
  produces build-ready specs. Covers pattern quality scoring, screen
  assessment, condensation rules, anti-pattern rejection, and 2026 upgrades.
  Use when researching UI patterns, designing new flows, benchmarking against
  competitor apps, adapting onboarding/auth/commerce patterns, or when user
  mentions Mobbin, pattern reference, design inspiration, or flow adaptation.
---

# Pattern Referencing Skill

Extract proven patterns from real apps. Understand WHY a pattern works, then
rebuild it for YOUR project. Never copy pixel-for-pixel.

---

## ⛔ STOP GATE — The IAAA Method

Every pattern goes through ALL four stages. Skipping stages = cargo-cult design.

```
1. IDENTIFY — What pattern? What app? What problem?
2. ANALYZE  — 5 WHYs + quality score + anti-pattern check (MANDATORY)
3. ADAPT    — How does OUR context differ? What to change?
4. APPLY    — Build-ready spec with mobile-first, a11y, security
```

You may NOT skip from stage 1 to stage 3. Stage 2 (Analyze) is mandatory.

---

## Pattern Quality Scoring

Score every pattern before adapting (1–5 per factor, 6 factors, max 30):

| Factor | What to evaluate |
|--------|-----------------|
| **Solve-ability** | Does it solve a real user problem? |
| **Learnability** | First-time success without instruction? |
| **Efficiency** | Minimizes taps/inputs/time? |
| **Accessibility** | Screen readers, large fonts, motor control? |
| **Mobile-first** | Works at 320px with 44px targets? |
| **Error resilience** | What happens when things go wrong? |

### Minimum Score Thresholds

| Flow type | Minimum | Rationale |
|-----------|---------|-----------|
| Auth / Payment | 20/30 | Security-critical |
| Onboarding / Navigation | 18/30 | High drop-off risk |
| Content / Social / Settings | 15/30 | Less critical |

**Below threshold? Don't adapt it. Find a better pattern.**

---

## The 5 WHYs (Mandatory for Every Pattern)

1. **WHY does this pattern exist?** (What user problem?)
2. **WHY does this app use it?** (Business model? User base?)
3. **WHY would it work for MY users?** (Same problem? Context?)
4. **WHY this implementation?** (Better alternatives?)
5. **WHY now?** (Right priority vs other improvements?)

---

## Anti-Patterns — REJECT These

| Pattern | Why apps use it | Why to reject |
|---------|----------------|---------------|
| Confirmshaming | Reduces unsubscribes | Erodes trust, legal liability |
| Infinite scroll no save | Max engagement time | Users lose position, battery drain |
| Hidden unsubscribe | Reduces churn | App Store violation, user rage |
| Forced notification at launch | Higher opt-in front-loaded | 60% deny rate vs 40% in context |
| Fake countdown timers | Creates urgency | FTC has fined companies |
| Pre-checked consent | Higher marketing opt-in | GDPR violation |
| Social login ONLY | Simplifies auth | Excludes privacy-conscious users |

---

## Screen Assessment Method

### Step 1: Inventory

Catalog every screen in the reference flow:

```markdown
| # | Screen | Type | User Action | Data | Effort Score |
|---|--------|------|-------------|------|-------------|
| 1 | Welcome | Marketing | Read + CTA | None | 2 |
| 2 | Email | Form | Text + submit | email | 5 |
```

### Step 2: Score Each Screen

| Decision | When to use |
|----------|------------|
| **KEEP** | Proven, fits context, minimal change |
| **ADAPT** | Good concept, needs customization |
| **COMBINE** | Multiple screens → fewer screens |
| **SKIP** | Doesn't serve YOUR users |

### Step 3: Condensation Rules

| Pattern | Action |
|---------|--------|
| 3+ screens asking related questions | Combine into 1-2 |
| Screen with single toggle | Merge into adjacent |
| Optional field on its own screen | Move to settings |
| Confirmation for simple data | Replace with inline validation |
| Marketing opt-in screen | Skip or add to footer |
| Subscription upsell in onboarding | NEVER — show value first |

---

## 2026 Upgrades

When adapting any pattern, consider these upgrades:

### Authentication

| Old | 2026 Upgrade | Why |
|-----|-------------|-----|
| Email + password | Passkeys (FIDO2/WebAuthn) | Phishing-resistant |
| SMS OTP | Authenticator app or passkey | SIM swap eliminated |
| "Remember me" | Biometric re-auth | Secure + frictionless |

### Interactions

| Old | 2026 Upgrade | Why |
|-----|-------------|-----|
| Tap to select | Haptic feedback on selection | Confirms without visual focus |
| Pull to refresh | Smart refresh (auto-sync) | Reduces effort |
| Toast notifications | Contextual inline feedback | Toasts ignored 40% |

---

## Platform Convention Differences

| Element | iOS | Android |
|---------|-----|---------|
| Primary nav | Bottom tab bar (5 max) | Bottom nav or drawer |
| Primary action | Top-right bar button | FAB |
| Modal | Sheet from bottom | Full-screen or bottom sheet |
| Back | Swipe from left edge | System gesture/nav bar |
| Delete | Swipe-to-reveal or edit mode | Long-press context menu |

---

## How to Use Mobbin

Search by:
- **User flows** (most valuable): "Log in", "Onboarding", "Checkout"
- **Screens**: By component type (bottom sheet, modal, form)
- **Apps**: Study top apps holistically
- **Platform**: iOS vs Android vs Web

### What to Capture Per Pattern

1. Screenshot or description
2. App name and platform
3. Flow it belongs to
4. What makes it effective (specific, not "looks nice")
5. What's missing (every app has gaps)

---

## NEVER

- NEVER copy pixel-for-pixel — that's cargo culting
- NEVER adopt without understanding WHY
- NEVER skip mobile-first check
- NEVER ignore condensation rules
- NEVER use dark patterns
- NEVER skip accessibility
- NEVER adapt a pattern scoring < 15
- NEVER assume App Store apps are automatically good

---

## ⛔ STOP GATE — Pre-Adaptation Checklist

- [ ] Source pattern identified and documented
- [ ] 5 WHYs analysis completed (≥ 3 answered)
- [ ] Pattern quality score > threshold
- [ ] Screen inventory with effort scores
- [ ] KEEP/ADAPT/COMBINE/SKIP for every screen
- [ ] Condensation rules applied
- [ ] 2026 upgrades identified
- [ ] Mobile-first compliance check passed
- [ ] Build-ready spec produced

---

## Output Format

```markdown
## Pattern Adaptation: [Source App] → [Your Project]

### Source
- App: [Name] on [Platform]
- Flow: [Name]
- Total screens: [N] → After assessment: [M]

### Screen Assessment
| # | Screen | Decision | Reasoning |
|---|--------|----------|-----------|

### Quality Score
[Total] / 30 — [Pass/Fail]

### Adapted Flow
[Screen sequence with transitions]

### Per-Screen Specs
[Component spec, interactions, accessibility, security]
```

See `references/WORKED-EXAMPLES.md` for full adaptation examples (Duolingo,
Cash App).
