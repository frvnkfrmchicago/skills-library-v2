---
name: native-store-compliance
description: >
  Ensures iOS and Android apps pass App Store and Play Store review on first
  submission. Covers Apple review guidelines (Xcode 26, AI disclosure, privacy
  labels, ATT, rejection reasons), Google Play requirements (API 35, data
  safety form, developer verification, MASA), and privacy regulation compliance
  (GDPR, CCPA, COPPA). Use before app submission, when preparing store
  listings, handling rejections, completing privacy forms, or when user
  mentions App Store, Play Store, review, rejection, compliance, or privacy.
---

# Native Store Compliance

Pass App Store and Play Store review on the FIRST submission. Every
rejected build costs 24-72 hours of review queue time.

---

## 1. Apple App Store — Current Requirements

| Requirement | Detail | Since |
|---|---|---|
| Xcode 26 + latest SDK | All submissions must use current tools | April 2026 |
| AI data sharing disclosure | Explicit consent if user data goes to third-party AI | Nov 2025 |
| Privacy labels | Accurate, complete, matching actual behavior | Ongoing |
| 44pt tap targets | Apple HIG minimum | Ongoing |
| Age-rated content | Creator apps must verify content age appropriateness | Nov 2025 |
| No copycat apps | Cannot impersonate another app's brand/icon | Nov 2025 |
| External payment links (US) | US devs can link to external payment | May 2025 |

---

## 2. Top Apple Rejection Reasons

Apple rejected ~1.93 million submissions in 2024. Know these to avoid them.

### 1. Privacy Violations (40% of rejections)

```
What triggers rejection:
├── Missing or unclear privacy policy
├── Collecting data without explicit permission
├── Privacy labels don't match actual data collection
├── No purpose string for camera/location/microphone
└── Tracking without ATT consent
```

**Fix checklist:**
- [ ] Privacy policy URL is live, public, and HTTPS
- [ ] Every permission has a descriptive purpose string
- [ ] Privacy labels in App Store Connect are accurate
- [ ] ATT prompt implemented if any cross-app tracking occurs

### 2. Incomplete Information (25%)

```
What triggers rejection:
├── Placeholder content (lorem ipsum, "Coming Soon" pages)
├── Broken links or features
├── Inaccurate app description
├── Missing demo credentials for review team
└── Screenshots don't match current app state
```

**Fix checklist:**
- [ ] No placeholder text anywhere in the app
- [ ] All features work as described
- [ ] Demo account credentials provided in App Review notes
- [ ] Screenshots are current — not mockups

### 3. Crashes and Bugs (20%)

```
What triggers rejection:
├── App crashes on launch
├── Crash during normal use flow
├── Excessive load times
├── Features don't work as described
└── App requires network but no offline handling
```

**Fix checklist:**
- [ ] Tested on physical device matching review team's hardware
- [ ] No force-unwraps without guard conditions
- [ ] Network errors show user-friendly messages
- [ ] Offline state handled gracefully (not blank screen)

### 4. Design Guideline Violations (15%)

```
What triggers rejection:
├── Not following Apple HIG
├── Non-standard navigation patterns
├── Tap targets smaller than 44×44pt
├── Missing back button or unclear navigation
└── Content that violates content policies
```

---

## 3. Apple Privacy Labels

### Completing Privacy Labels

In App Store Connect → App Privacy:

```
Category: Data types you collect
│
├── Contact Info
│   ├── Name → linked or not linked to identity?
│   ├── Email → used for tracking?
│   └── Phone → purpose: app functionality / analytics / etc.
│
├── Identifiers
│   ├── User ID → always linked to identity
│   └── Device ID → used for tracking? (ATT required if yes)
│
├── Usage Data
│   ├── Product Interaction → usually analytics
│   └── Crash Data → usually not linked
│
└── Location
    ├── Precise Location → must justify
    └── Coarse Location → preferred when precise isn't needed
```

### Golden Rule

> Your privacy labels MUST match actual app behavior. Apple can
> and does verify. A mismatch = rejection.

---

## 4. ATT Implementation (iOS)

### App Tracking Transparency

```swift
// ✅ REQUIRED — Request before any tracking
import AppTrackingTransparency

func requestTrackingPermission() {
    ATTrackingManager.requestTrackingAuthorization { status in
        switch status {
        case .authorized:
            // Can use IDFA, enable ad tracking
            enableAdTracking()
        case .denied, .restricted:
            // MUST respect this — no workarounds, no fingerprinting
            disableAdTracking()
        case .notDetermined:
            // Will be asked on next launch
            break
        @unknown default:
            break
        }
    }
}
```

### What Counts as "Tracking" Under ATT

| Activity | Tracking? | ATT Required? |
|---|---|---|
| Linking user data with third-party ad data | Yes | Yes |
| Sharing data with data brokers | Yes | Yes |
| Using IDFA for personalized ads | Yes | Yes |
| First-party analytics (your own data) | No | No |
| Fraud detection | No | No |
| Attribution (SKAdNetwork) | No | No |

### Purpose String

```xml
<!-- Info.plist -->
<key>NSUserTrackingUsageDescription</key>
<string>We use this to show you relevant content and measure campaign performance.</string>
```

Tip: Be specific and honest. Generic strings like "to improve your experience" often trigger review questions.

---

## 5. Google Play Store Requirements (2026)

| Requirement | Detail | Deadline |
|---|---|---|
| Target API 35 (Android 15) | New apps and updates | Aug 2025+ |
| Developer verification | Identity verification for all devs | Sep 2026 |
| Data Safety form | Complete in Play Console | Ongoing |
| Privacy policy on active URL | Public, non-PDF | Ongoing |
| Financial features declaration | ALL apps must complete | Oct 2025+ |
| Photo/video permission limits | No broad READ_MEDIA_* | May 2025+ |
| Age-restricted content | Block minors for dating/gambling | Jan 2026+ |
| Health app declarations | Step trackers, sleep monitors | Aug 2025+ |

---

## 6. Google Data Safety Form

### Step-by-Step Completion

In Play Console → App Content → Data Safety:

```
Step 1: Data collection overview
├── Does your app collect or share user data? → Yes/No
└── Does your app handle sensitive data types? → List them

Step 2: Data types collected
├── Location → precise or approximate?
├── Personal info → name, email, phone, address?
├── Financial → payment info, purchase history?
├── Health/Fitness → if applicable
├── Messages → chat content?
├── Photos/Videos → captured or accessed?
├── Audio → microphone access?
├── Files/Docs → document access?
├── Calendar → events access?
├── Contacts → address book?
├── App activity → pages visited, features used?
├── Web browsing → URL history?
├── App info → crash logs, diagnostics?
└── Device identifiers → device ID, advertising ID?

Step 3: For each data type
├── Is it collected? (captured from user)
├── Is it shared? (transferred to third party)
├── Is it optional? (can user decline)
├── Purpose: App functionality / Analytics / Developer comms / Ads / Security / Personalization
└── Is it processed ephemerally? (not stored permanently)

Step 4: Security practices
├── Data encrypted in transit? → Must be yes (HTTPS)
├── Data deletion mechanism? → Must provide one
└── Follows Google Families Policy? → If targeting children
```

---

## 7. Privacy Compliance Matrix

| Regulation | Region | Key Requirements | Penalty |
|---|---|---|---|
| **GDPR** | EU/EEA | Consent before collection, right to deletion, DPO | €20M or 4% revenue |
| **CCPA/CPRA** | California | Right to know, delete, opt-out of sale | $2,500-$7,500/violation |
| **COPPA** | US (under 13) | Parental consent, data minimization | $50,120/violation |
| **PIPEDA** | Canada | Consent, access, accuracy | $100K/violation |
| **LGPD** | Brazil | Similar to GDPR | 2% of revenue |

### Universal Requirements

Regardless of specific laws:
- [ ] Privacy policy hosted on public HTTPS URL
- [ ] Consent mechanism is opt-in (not pre-checked)
- [ ] Data deletion endpoint available to users
- [ ] Data encrypted in transit (HTTPS) and at rest
- [ ] Minimum data collection — only what's needed
- [ ] Third-party SDKs audited for their own data collection

---

## 8. Submission Checklists

### Apple Submission Checklist

- [ ] Using Xcode 26 and latest SDK
- [ ] Privacy policy URL live and linked in App Store Connect
- [ ] All privacy labels completed and accurate
- [ ] ATT implemented if any tracking occurs
- [ ] Demo account provided in App Review notes
- [ ] No placeholder content (lorem ipsum, test images, broken links)
- [ ] All tap targets ≥ 44×44pt
- [ ] App works offline or shows graceful offline state
- [ ] No mention of competing platforms in screenshots/description
- [ ] Screenshots reflect current app state
- [ ] AI features disclose data sharing with third-party services
- [ ] Age rating set correctly
- [ ] Export compliance (encryption) declared

### Google Submission Checklist

- [ ] Target API ≥ 35
- [ ] Data Safety form completed accurately
- [ ] Privacy policy on live public URL
- [ ] Financial features declaration completed
- [ ] Developer identity verified
- [ ] ProGuard/R8 enabled for release builds
- [ ] No broad storage permissions when alternatives exist
- [ ] Age-restricted content properly gated
- [ ] Health declarations completed if applicable
- [ ] App does not crash on launch or during normal use
- [ ] Content rating questionnaire completed

---

## ⛔ STOP GATE — Compliance

DO NOT submit to either store without:

1. **Both checklists above fully verified** — every item checked
2. **Privacy policy tested** — URL loads correctly, content is current
3. **Demo credentials ready** — for Apple review team
4. **No placeholder content** — scan app end-to-end

```bash
# Scan for placeholder content
grep -rn "lorem\|placeholder\|TODO\|FIXME\|test@\|John Doe\|Coming Soon" \
  src/ app/ --include="*.ts" --include="*.tsx" --include="*.swift" --include="*.kt"
```

---

## NEVER

- **NEVER** submit with placeholder content — Apple/Google will reject
- **NEVER** mismatch privacy labels with actual data collection
- **NEVER** track users on iOS without ATT consent
- **NEVER** skip the Data Safety form — Play Store will remove your app
- **NEVER** use screenshots that don't match the current app
- **NEVER** request permissions you don't actively use
- **NEVER** forget demo credentials for Apple review

---

## Pre-Completion Checklist

- [ ] Apple submission checklist passed
- [ ] Google submission checklist passed
- [ ] Privacy policy reviewed and current
- [ ] Privacy labels/Data Safety form match actual behavior
- [ ] ATT implemented and tested (iOS)
- [ ] No placeholder content in app
- [ ] All permissions have purpose strings
- [ ] Compliance with applicable privacy regulations confirmed

---

## Related Skills

- `expo-testflight-shipping` — Build and submit pipeline
- `android-building` — Android-specific requirements
- `mobile-first-enforcing` — Mobile UI standards
- `hacker-scanning` — Security audit before submission
- `exit-gating` — General deployment readiness
