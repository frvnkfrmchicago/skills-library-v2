# Pattern Referencing — Worked Examples

## Example A: Duolingo Onboarding → Language Learning App

```
Source: Duolingo (iOS) — Onboarding flow on Mobbin
Screens: 14 total

Assessment:
  KEEP (3):  Language selection, proficiency quiz, first lesson preview
  ADAPT (2): Goal setting (simplify 4 options → 2), reminder setup
  COMBINE (5): 5 marketing screens → 1 animated value prop
  SKIP (4):  Leaderboard preview, streak explanation, social features, paywall

Result: 14 screens → 6 screens (57% reduction)
Effort score: 28 → 14

Key adaptation: Duolingo gates the first lesson behind onboarding.
We let users START a lesson immediately, then onboard between lessons.
Result: first value in < 30 seconds vs Duolingo's 3+ minutes.
```

### Quality Score: 22/30

| Factor | Score | Notes |
|--------|-------|-------|
| Solve-ability | 4 | Clearly solves "what to learn" |
| Learnability | 4 | Intuitive progression |
| Efficiency | 3 | Too many marketing screens |
| Accessibility | 3 | Good but can improve |
| Mobile-first | 4 | Native, touch-optimized |
| Error resilience | 4 | Handles well |

---

## Example B: Cash App Payment → E-commerce Checkout

```
Source: Cash App (iOS) — Send money flow on Mobbin
Screens: 4 total (recipient → amount → confirm → success)

Assessment:
  KEEP (3):  Amount entry (numpad UX), confirmation, success animation
  ADAPT (1): Recipient → change to "delivery address" with saved addresses
  SKIP (0):  All screens serve a purpose

Key adaptations:
  - Cash App: phone number for recipient → we use saved addresses
  - Cash App: no itemized receipt → we add order summary
  - Add Apple Pay / Google Pay as primary CTA (one-tap checkout)
  - Add shipping estimate before confirmation
  - Security: add 3D Secure for card payments

Compliance additions Cash App doesn't need:
  - Tax calculation display (e-commerce requirement)
  - Return policy link (App Store requirement for physical goods)
  - GDPR consent for marketing opt-in
```

### Quality Score: 25/30

| Factor | Score | Notes |
|--------|-------|-------|
| Solve-ability | 5 | Perfect — "send money" is clear |
| Learnability | 5 | Numpad is universal |
| Efficiency | 4 | 4 screens for payment is minimal |
| Accessibility | 3 | Could improve screen reader labels |
| Mobile-first | 4 | Native, touch-optimized |
| Error resilience | 4 | Good error handling |

---

## Example C: Spotify Settings → SaaS Settings

```
Source: Spotify (iOS) — Settings flow
Screens: 8 sections in scrollable list

Assessment:
  KEEP (3): Account info, notification preferences, playback settings
  ADAPT (2): Privacy → simplify for our context, Storage → rename to "Data"
  COMBINE (2): "Social" + "Display" → single "Preferences" section
  SKIP (1): "Car Thing" hardware settings (irrelevant)

Key adaptation:
  Spotify uses full-page navigation for each setting section.
  For our simpler settings, use bottom sheets for quick toggles.
  Research: Bottom sheets have 23% higher completion (NNG 2024).
```
