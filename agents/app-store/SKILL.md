---
name: app-store
description: iOS App Store and Google Play submission, ASO, screenshots, review compliance.
owner: Frank
last_updated: 2026-03
---

# App Store Submission & ASO

Ship to millions. App Store and Google Play done right.

---

## Context Questions

Before submitting:

1. **Which stores?** — iOS App Store, Google Play, or both?
2. **App type?** — Free, paid, freemium, subscription?
3. **Target regions?** — US only, global, specific markets?
4. **First submission?** — New app or update?
5. **In-app purchases?** — Products, subscriptions, consumables?

---

## TL;DR

| Need | Solution |
|------|----------|
| iOS submission | App Store Connect + Xcode |
| Android submission | Google Play Console |
| Screenshots | Figma templates + device frames |
| App description | SEO-optimized copy |
| Keywords (iOS) | 100 character limit, comma-separated |
| Review compliance | Follow guidelines strictly |

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Store focus** | iOS-first ←→ Android-first |
| **Monetization** | Free ←→ Paid ←→ Subscription |
| **Scale** | Single market ←→ Global localization |
| **Update frequency** | Rare updates ←→ Continuous deployment |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| iOS-only | App Store Connect + TestFlight |
| Android-only | Google Play Console + Internal testing |
| Cross-platform | Submit to both, stagger releases |
| Subscription app | RevenueCat for unified IAP |
| Enterprise | Apple Business Manager / Managed Play |

---

## App Store Connect (iOS)

### Pre-Submission Checklist

```
□ Apple Developer Account ($99/year)
□ App ID created in Developer Portal
□ Provisioning profiles configured
□ App Icon (1024x1024, no transparency)
□ Screenshots for all required device sizes
□ App description (4000 char max)
□ Keywords (100 char max)
□ Privacy Policy URL
□ Support URL
□ Build uploaded via Xcode or Transporter
```

### Required Screenshots

| Device | Size | Required |
|--------|------|----------|
| iPhone 6.7" | 1290 × 2796 | Yes (iPhone 15 Pro Max) |
| iPhone 6.5" | 1284 × 2778 | Yes (iPhone 14 Plus) |
| iPhone 5.5" | 1242 × 2208 | Optional (iPhone 8 Plus) |
| iPad Pro 12.9" | 2048 × 2732 | If iPad supported |

### App Description Template

```markdown
[HOOK - First 30 characters visible in search]
The fastest way to [core benefit].

[FEATURES - Use bullets or line breaks]
• [Feature 1] — [Benefit]
• [Feature 2] — [Benefit]
• [Feature 3] — [Benefit]

[SOCIAL PROOF]
"Quote from user/press" — Source

[CALL TO ACTION]
Download now and [desired outcome].

[TRUST SIGNALS]
✓ No ads
✓ Privacy-focused
✓ [Other differentiator]
```

### iOS Keywords (100 chars)

```
Primary keywords first, no spaces after commas, no app name
Example: task,todo,productivity,planner,checklist,organize,reminder
```

**Tips:**
- Don't repeat words (plurals count as separate)
- Don't include your app name or company
- Research competitors' keywords
- Use all 100 characters

---

## Google Play Console (Android)

### Pre-Submission Checklist

```
□ Google Play Developer Account ($25 one-time)
□ App signing key (or use Play App Signing)
□ App icon (512x512 PNG)
□ Feature graphic (1024x500)
□ Screenshots (min 2, max 8 per device type)
□ Short description (80 chars)
□ Full description (4000 chars)
□ Content rating questionnaire
□ Privacy Policy URL
□ Target audience and content declaration
□ AAB (Android App Bundle) uploaded
```

### Required Graphics

| Asset | Size | Notes |
|-------|------|-------|
| App icon | 512 × 512 | PNG, no transparency |
| Feature graphic | 1024 × 500 | Used in store listings |
| Phone screenshots | 1080 × 1920 (min) | 2-8 required |
| 7" tablet | 1080 × 1920 | If tablet supported |
| 10" tablet | 1200 × 1920 | If tablet supported |

### Short Description (80 chars)

```
[Core benefit in one punchy line]
Example: "Track habits, build routines, change your life."
```

---

## App Store Optimization (ASO)

### Keyword Research

| Tool | Purpose |
|------|---------|
| **AppTweak** | Keyword research, competitor analysis |
| **Sensor Tower** | Market intelligence |
| **App Annie (data.ai)** | Downloads, revenue estimates |
| **AppFollow** | Reviews monitoring |

### ASO Checklist

```
□ App name includes primary keyword
□ Subtitle (iOS) / Short description (Android) optimized
□ Screenshots show key features + benefits
□ First 2 screenshots are most impactful
□ Localized for target markets
□ Reviews prompt implemented (in-app)
□ Regular update cadence (signals activity)
```

### Screenshot Best Practices

```
1. Show the app, not just marketing text
2. First screenshot = hook (most viewed)
3. Include device frames (looks polished)
4. Add captions over screenshots
5. Use consistent visual style
6. Show real app content, not placeholder
7. Consider video preview (iOS) or promo video (Android)
```

---

## Review Guidelines Compliance

### iOS Common Rejections

| Rejection Reason | Fix |
|------------------|-----|
| Crashes on launch | Test on real devices |
| Broken links | Verify all URLs work |
| Placeholder content | Replace Lorem Ipsum |
| Login required | Provide demo account |
| Incomplete metadata | Fill all required fields |
| Guideline 4.2 (Minimum Functionality) | Add more features |
| Guideline 2.1 (Performance) | Fix crashes, optimize |
| Guideline 5.1.1 (Data Collection) | Add privacy labels |

### Android Common Rejections

| Rejection Reason | Fix |
|------------------|-----|
| Policy violation | Read policies carefully |
| Deceptive behavior | Be transparent |
| Intellectual property | Don't use others' trademarks |
| User data policy | Proper consent, privacy policy |
| Families policy | If targeting children |

---

## In-App Purchases

### iOS Setup

```swift
// StoreKit 2 (recommended for 2026)
import StoreKit

func fetchProducts() async throws -> [Product] {
    let productIds = ["com.app.premium.monthly", "com.app.premium.yearly"]
    let products = try await Product.products(for: productIds)
    return products
}

func purchase(_ product: Product) async throws -> Transaction? {
    let result = try await product.purchase()
    
    switch result {
    case .success(let verification):
        let transaction = try checkVerified(verification)
        await transaction.finish()
        return transaction
    case .userCancelled, .pending:
        return nil
    @unknown default:
        return nil
    }
}
```

### RevenueCat (Recommended for Cross-Platform)

```typescript
// React Native / Expo
import Purchases from 'react-native-purchases'

// Initialize
Purchases.configure({ apiKey: 'your_api_key' })

// Get offerings
const offerings = await Purchases.getOfferings()
const monthly = offerings.current?.monthly

// Purchase
const { customerInfo } = await Purchases.purchasePackage(monthly)

// Check subscription status
const isSubscribed = customerInfo.entitlements.active['premium'] !== undefined
```

---

## Submission Workflow

### iOS

```bash
# 1. Archive in Xcode
Product → Archive

# 2. Upload to App Store Connect
# Via Xcode Organizer or Transporter app

# 3. In App Store Connect:
#    - Select build
#    - Complete app information
#    - Submit for review

# Review time: ~24-48 hours (often faster)
```

### Android

```bash
# 1. Build release AAB
./gradlew bundleRelease

# 2. Upload to Play Console
#    - Create new release
#    - Upload AAB
#    - Add release notes

# 3. Submit for review
# Review time: ~1-3 days
```

---

## Testing Before Submission

### iOS TestFlight

```
1. Upload build to App Store Connect
2. Add internal testers (up to 100)
3. Add external testers (up to 10,000)
4. Collect feedback
5. Fix issues
6. Submit final build
```

### Google Play Testing Tracks

```
Internal testing → Limited users, instant publish
Closed testing → Invite-only, review required
Open testing → Anyone can join, review required
Production → Full release
```

---

## Post-Launch

### Monitor & Respond

```
□ Set up crash reporting (Firebase Crashlytics)
□ Monitor reviews daily
□ Respond to negative reviews (professionally)
□ Track key metrics (downloads, retention, conversion)
□ Plan regular updates (every 4-6 weeks ideal)
```

### Update Strategy

```
□ Bug fixes → Expedited review (~24 hours)
□ New features → Full review
□ Increment version number properly
□ Update screenshots if UI changed
□ Refresh description with new features
□ Consider "What's New" to engage users
```

---

## Prompt Examples

```
"Prepare iOS App Store submission for my habit tracking app"

"Write App Store description optimized for keywords: meditation, mindfulness, sleep"

"Generate 5 screenshot captions for a fitness app"

"What do I need for Google Play submission?"

"Why was my app rejected for Guideline 4.2?"
```

---

## Related Skills

- `agents/swift/SKILL.md` — iOS development
- `agents/kotlin/SKILL.md` — Android development
- `agents/mobile-native/SKILL.md` — Cross-platform
- `agents/payments/SKILL.md` — In-app purchases
- `agents/seo/SKILL.md` — ASO optimization principles
