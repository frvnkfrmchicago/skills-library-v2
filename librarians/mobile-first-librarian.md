---
name: mobile-first-librarian
description: Complete mobile development guide. Covers responsive architecture, touch interaction design, viewport management, adaptive layouts, mobile performance, PWA setup, gesture handling, mobile testing, and native-bridge patterns. Every rule includes WHY it exists and BAD vs GOOD examples.
last_updated: 2026-03-07
version: v3
protocol: anti-skimming-v3
---

# Mobile-First Librarian

**Role**: You build interfaces for the smallest screen first, then progressively enhance for larger viewports.

**Context**: Mobile traffic is 60%+ of global web traffic (Statcounter, 2025). Mobile CPUs are 3-5x slower than desktop. Mobile networks are unreliable. Touch is imprecise. If you build desktop-first, mobile is always an afterthought — and it shows.

**Goal**: Every interface you build MUST work flawlessly on a 320px-wide screen with touch input before you even consider what it looks like on a 1440px monitor.

---

## TL;DR

| Principle | Hard Rule | WHY |
|-----------|-----------|-----|
| Build mobile first | `min-width` media queries only | Forces essential content prioritization |
| Touch-first | 44px minimum tap targets | Apple HIG + Google Material specify this |
| Viewport | Use `dvh` not `vh` | `vh` breaks on mobile with dynamic toolbars |
| Performance | < 3s FCP on 3G | 53% abandon after 3s (Google) |
| Images | Always `srcset` + `sizes` | Mobile doesn't need 4K hero images |
| Fonts | `font-display: swap` + WOFF2 only | Invisible text is unacceptable |
| Testing | Real device testing required | Chrome DevTools ≠ real phones |

---

## 1. Responsive Architecture

### 1.1 Breakpoint System

**Always use `min-width` (mobile-up) media queries** BECAUSE `max-width` means you're building desktop and then overriding for mobile. Mobile-first means base styles ARE mobile styles — no media query needed.

```css
/* ✅ GOOD — Mobile-first: base = mobile, enhance upward */
.container {
  padding: 1rem;
  width: 100%;
}

@media (min-width: 640px) {
  .container { padding: 1.5rem; }
}

@media (min-width: 768px) {
  .container { padding: 2rem; max-width: 720px; margin: 0 auto; }
}

@media (min-width: 1024px) {
  .container { padding: 3rem; max-width: 960px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1200px; }
}

@media (min-width: 1536px) {
  .container { max-width: 1400px; }
}
```

```css
/* ❌ BAD — Desktop-first: mobile gets ALL the overrides */
.container {
  max-width: 1200px;
  padding: 3rem;
  margin: 0 auto;
}
@media (max-width: 1024px) { .container { padding: 2rem; } }
@media (max-width: 768px) { .container { padding: 1rem; max-width: 100%; } }
/* Mobile downloads desktop styles + 2 layers of overrides */
```

### The Standard Breakpoint Scale

| Breakpoint | px | What it targets |
|---|---|---|
| Base (no query) | 0-639px | All phones portrait |
| `sm` | 640px | Large phones landscape |
| `md` | 768px | Tablets portrait |
| `lg` | 1024px | Tablets landscape / small laptops |
| `xl` | 1280px | Standard desktops |
| `2xl` | 1536px | Large displays |

### 1.2 Layout Patterns

**Decision Tree: Which Layout Pattern?**

```
What are you building?
├── Content page (blog, docs, article)
│   └── Single column, max-width 720px, centered
├── Dashboard / Admin
│   └── Sidebar + content (sidebar collapses to bottom nav on mobile)
├── Product grid / Gallery
│   └── CSS Grid: 1 col → 2 col → 3-4 col
├── Settings / Form
│   └── Single column, full width inputs on mobile
└── Navigation-heavy app
    └── Bottom nav on mobile, side nav on desktop
```

```css
/* ✅ Adaptive grid — mobile gets 1 column naturally */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
}
```

### 1.3 Container Queries (2026 standard)

Container queries are now baseline in all modern browsers. Use them for component-level responsiveness:

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

.card { display: flex; flex-direction: column; }

@container card (min-width: 400px) {
  .card { flex-direction: row; }
}
```

**When to use container queries vs media queries:**
- Media query: page-level layout shifts (sidebar collapse, grid columns)
- Container query: component adapts to its container size (card layout, widget)

---

## 2. Touch-First Interactions

### 2.1 Tap Target Sizing

**Minimum 44×44px tap targets** BECAUSE fingers are imprecise. Apple's Human Interface Guidelines and Google's Material Design both mandate this. Smaller targets cause mis-taps, frustration, and accessibility failures.

```css
/* ✅ GOOD — generous tap targets */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
  font-size: 1rem;
}

/* Icon buttons: visual icon can be 20-24px, but hit area must be 44px */
.icon-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
}
```

```css
/* ❌ BAD — user will rage-quit */
.tiny-button {
  padding: 4px 8px;
  font-size: 11px;
  /* ~24px tall — impossible to hit reliably on mobile */
}
```

### Spacing Between Tap Targets

```css
/* ✅ At least 8px between adjacent tap targets */
.nav-list li + li { margin-top: 8px; }

/* ❌ Stacked links with 0 spacing = will tap the wrong one */
```

### 2.2 Hover vs Touch

**NEVER rely on hover for functionality** BECAUSE mobile has no hover. Hover can enhance desktop, but the feature MUST work without it.

```tsx
// ✅ GOOD — touch-first, hover-enhanced
<button
  onClick={handleAction}
  onMouseEnter={() => setShowPreview(true)}
  onMouseLeave={() => setShowPreview(false)}
>
  View Details
</button>
// Mobile: taps to act. Desktop: hover shows a preview as bonus.

// ❌ BAD — hover-only
<div onMouseEnter={showDropdown}>
  Menu {/* Mobile users NEVER see the dropdown */}
</div>
```

### 2.3 Gesture Patterns

| Gesture | Use for | NEVER use as |
|---------|---------|-------------|
| Tap | Primary actions | — |
| Swipe | Dismiss, navigate between tabs | Only way to delete |
| Long press | Context menu | Only way to access critical action |
| Pull down | Refresh content | — |
| Pinch | Zoom images/maps | Disable zoom on text (`user-scalable=no`) |

**Every gesture MUST have a visible button alternative.**

```tsx
// ✅ Swipe to dismiss + visible close button
<div onTouchEnd={handleSwipeDismiss}>
  <span>Notification text</span>
  <button onClick={dismiss} aria-label="Dismiss">×</button>
</div>
```

---

## 3. Viewport Management

### 3.1 Dynamic Viewport Units

**Use `dvh` instead of `vh`** BECAUSE mobile browsers have dynamic toolbars. The address bar and bottom navigation appear/disappear as you scroll. `100vh` includes the space behind these toolbars. `100dvh` adjusts to the actual visible area.

```css
/* ✅ Dynamic viewport — respects mobile browser chrome */
.full-screen-section {
  min-height: 100dvh;
}

/* ✅ For sticky footers */
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
.app-content { flex: 1; }

/* ❌ Static viewport — content goes behind address bar */
.full-screen-section {
  height: 100vh; /* WRONG on mobile */
}
```

### Unit comparison

| Unit | Meaning | Use when |
|------|---------|----------|
| `dvh` | Dynamic viewport height | Full-screen layouts, hero sections |
| `svh` | Smallest viewport height | When you need the minimum (toolbar visible) |
| `lvh` | Largest viewport height | When you need the maximum (toolbar hidden) |
| `vh` | Legacy viewport height | NEVER on mobile |

### 3.2 Safe Area Insets

Handle notched devices (iPhone, Android with camera cutout):

```css
/* ✅ Full safe area handling */
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
}

.header {
  padding-top: calc(var(--safe-top) + 12px);
}

.bottom-nav {
  padding-bottom: calc(var(--safe-bottom) + 8px);
}

/* In index.html: */
/* <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"> */
```

### 3.3 Prevent Horizontal Overflow

```css
html, body {
  overflow-x: hidden;
  width: 100%;
}

/* Elements that commonly cause horizontal scroll: */
img, video, iframe, table, pre {
  max-width: 100%;
}

pre {
  overflow-x: auto; /* allow scroll INSIDE the block, not the page */
}

table {
  display: block;
  overflow-x: auto; /* scrollable table container */
}
```

---

## 4. Mobile Performance

### 4.1 Performance Budgets

| Metric | Target | WHY |
|--------|--------|-----|
| First Contentful Paint | < 2.5s on 4G | Google Core Web Vital (LCP threshold) |
| Time to Interactive | < 3.5s on 4G | When user can actually interact |
| Initial JS bundle | < 100KB gzipped | Mobile CPUs parse JS 3-5x slower |
| Total page weight | < 500KB first load | Mobile data is expensive globally |
| Layout Shift (CLS) | < 0.1 | Jumping content = accidental taps |
| Images | < 200KB each, lazy loaded | Biggest bandwidth consumer |
| Fonts | < 50KB total | Use subsetting, WOFF2 only |

### 4.2 Image Optimization

```tsx
// ✅ Next.js — automatic optimization
import Image from 'next/image'

<Image
  src="/hero.jpg"
  width={800}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  priority     // Only for above-the-fold
  alt="Hero image"
/>
```

```html
<!-- ✅ Native HTML — responsive images -->
<img
  src="hero-800.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
  decoding="async"
  alt="Hero image"
  width="800"
  height="600"
/>
<!-- ALWAYS set width/height to prevent layout shift -->
```

### 4.3 Font Loading

```css
/* ✅ Swap strategy — show fallback immediately */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
}

/* ✅ Preload critical fonts in HTML head */
/* <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin> */
```

### 4.4 Code Splitting

```tsx
// ✅ Lazy load routes — mobile only downloads what it needs
import { lazy, Suspense } from 'react'

const Settings = lazy(() => import('./pages/Settings'))
const Profile = lazy(() => import('./pages/Profile'))

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  )
}
```

---

## 5. Mobile Navigation Patterns

### Decision Tree

```
How many primary destinations?
├── 2-5 destinations
│   └── Bottom tab bar (iOS/Android standard)
├── 6-10 destinations
│   └── Bottom bar (4-5 shown) + hamburger for rest
├── Content-focused (blog, docs)
│   └── Top header + search + minimal nav
└── Complex app (admin, dashboard)
    └── Bottom bar on mobile + sidebar on desktop
```

### Bottom Navigation

```tsx
// ✅ Mobile bottom nav pattern
function MobileNav() {
  const location = useLocation()

  return (
    <nav className="mobile-nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        <HomeIcon size={22} />
        <span>Home</span>
      </Link>
      <Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>
        <SearchIcon size={22} />
        <span>Search</span>
      </Link>
      <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
        <UserIcon size={22} />
        <span>Profile</span>
      </Link>
    </nav>
  )
}
```

```css
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  padding: 8px 0 env(safe-area-inset-bottom, 8px);
  border-top: 1px solid rgba(255,255,255,0.06);
  z-index: 100;
}

.mobile-nav a {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.5);
  min-width: 44px;
  min-height: 44px;
  justify-content: center;
}

.mobile-nav a.active { color: var(--accent-primary); }

/* Hide on desktop */
@media (min-width: 768px) {
  .mobile-nav { display: none; }
}

/* Account for bottom nav in page content */
.page-content {
  padding-bottom: 80px;
}
@media (min-width: 768px) {
  .page-content { padding-bottom: 0; }
}
```

---

## 6. Mobile Forms

### Input Sizing

```css
/* ✅ Mobile-friendly form inputs */
input, select, textarea {
  font-size: 16px;
  /* iOS zooms in on inputs < 16px — this prevents that */
  min-height: 44px;
  padding: 12px 16px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3);
}

/* ✅ Stack labels above inputs on mobile */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}
```

```css
/* ❌ BAD — iOS will zoom the entire page */
input { font-size: 14px; }
```

### Input Types for Mobile Keyboards

```html
<!-- ✅ Right keyboard for the right input -->
<input type="email" inputmode="email" />     <!-- @ key visible -->
<input type="tel" inputmode="tel" />          <!-- phone keypad -->
<input type="number" inputmode="numeric" />   <!-- number pad -->
<input type="url" inputmode="url" />          <!-- .com key visible -->
<input type="search" inputmode="search" />    <!-- search button on keyboard -->
```

---

## 7. PWA Setup

### When to Make a PWA

```
Should this be a PWA?
├── Users return repeatedly → YES
├── Works offline / poor connection → YES
├── Needs home screen icon → YES
├── Push notifications needed → YES
├── Simple marketing page → NO
├── Needs native camera/NFC/Bluetooth → NO (use Capacitor or native)
└── Users expect 60fps animations → Consider native
```

### Minimal Configuration

```json
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#060b14",
  "background_color": "#060b14",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

```html
<!-- In <head> -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#060b14">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icon-192.png">
```

---

## 8. Testing

### Real Device Testing Required

Chrome DevTools device mode is NOT sufficient BECAUSE:
- It doesn't simulate actual mobile CPU speed
- Touch events behave differently
- Scrolling physics are different
- Safe areas and notches aren't real
- Keyboard behavior isn't simulated
- Battery impact can't be measured

### Testing Checklist

```
Physical test on at least:
├── iPhone SE (smallest iOS viewport: 375px)
├── iPhone 15/16 Pro (notch + dynamic island)
├── Samsung Galaxy (popular Android, ~360px)
└── iPad Mini (768px, tablet breakpoint)

If budget is tight:
├── BrowserStack / LambdaTest for device coverage
└── At minimum: one real phone + Chrome DevTools
```

### Performance Testing

```bash
# Lighthouse in CI
npx lighthouse http://localhost:3000 \
  --emulated-form-factor=mobile \
  --throttling-method=simulate \
  --output=json \
  --output-path=./lighthouse-report.json

# Check key metrics in the report:
# - Performance score > 90
# - FCP < 2.5s
# - LCP < 4s
# - CLS < 0.1
# - TBT < 300ms
```

---

## 9. Apple App Store Compliance (2025/2026)

### 9.1 Current Requirements (as of March 2026)

**These are not suggestions. Failing any of these guarantees rejection.**

| Requirement | Details | Effective |
|---|---|---|
| **Xcode 26 + latest SDK** | All submissions must use Xcode 26 and target the latest OS versions | April 2026 |
| **AI data sharing disclosure** | Must disclose when user data is shared with third-party AI services and get explicit consent | Nov 2025 |
| **Privacy labels** | Must accurately describe all data collection, storage, and usage | Ongoing |
| **44px tap targets** | Apple HIG mandates minimum 44×44pt touch targets | Ongoing |
| **Age-rated content** | Creator apps must verify/declare age for content exceeding the app's rating | Nov 2025 |
| **No copycat apps** | Cannot use another developer's icon, brand, or product name in your icon/name without approval | Nov 2025 |
| **External payment links (US only)** | US developers can link to external payment methods outside Apple IAP | May 2025 |

### 9.2 Top Rejection Reasons (25% of first submissions fail)

```
Apple rejected ~1.93 million submissions in 2024. Top reasons:

1. Privacy violations (40%)
   ├── Missing or unclear privacy policy
   ├── Collecting data without user permission
   └── Not explaining data collection/usage

2. Incomplete information (25%)
   ├── Placeholder content or broken links
   ├── Inaccurate app description
   └── Missing demo credentials for review

3. Crashes and bugs (20%)
   ├── App crashes on launch or during normal use
   ├── Slow load times or excessive resource usage
   └── Features that don't work as described

4. Design guideline violations (15%)
   ├── Not following Apple HIG
   ├── Poor UI/UX
   └── Non-standard navigation patterns
```

### 9.3 Submission Checklist

Before submitting to the App Store:

- [ ] Privacy policy URL is live, publicly accessible, and linked in app
- [ ] All data collection is disclosed in App Store Connect privacy labels
- [ ] AI features disclose data sharing with third-party services
- [ ] Demo account provided for App Review team
- [ ] No placeholder content (lorem ipsum, test images, broken links)
- [ ] App works offline or gracefully handles no-network state
- [ ] All tap targets ≥ 44×44pt
- [ ] Using current SDK and Xcode version
- [ ] No mention of other platforms (Android, Google) in screenshots or description
- [ ] Screenshots are accurate — show current app state, not mockups

---

## 10. Google Play Store Compliance (2025/2026)

### 10.1 Current Requirements

| Requirement | Details | Effective |
|---|---|---|
| **Target API 35 (Android 15)** | New apps and updates must target API 35+ | Aug 2025 |
| **Developer verification** | All Android developers must verify identity — even outside Play Store | Sep 2026 |
| **Data Safety form** | Must complete Data Safety form in Play Console | Ongoing |
| **Privacy policy on active URL** | Must be publicly accessible (not PDF), linked in app | Ongoing |
| **Scoped Storage enforced** | Apps must use app-specific directories or MediaStore API | 2025 |
| **Photo/video permission limits** | Cannot request broad READ_MEDIA_IMAGES/VIDEO unless core functionality | May 2025 |
| **Financial features declaration** | ALL apps must complete financial features declaration | Oct 2025 |
| **Age-restricted content** | Dating, gambling, real-money games must block minors | Jan 2026 |
| **Health app declarations** | Step trackers, sleep monitors, etc. require health declarations | Aug 2025 |

### 10.2 Data Safety Form Requirements

The Data Safety form requires disclosure of:

```
What to disclose:
├── Types of data collected (contacts, location, files, etc.)
├── Whether data is shared with third parties
├── How data is used (analytics, advertising, personalization, etc.)
├── Security practices (encryption in transit, data deletion)
├── Whether users can request data deletion
└── Whether the app follows Google's Families Policy (if targeting children)
```

### 10.3 Google Play Protect & MASA Certification

```
Mobile Application Security Assessment (MASA):
├── Independent validation against OWASP MASVS Level 1
├── Earns a badge in your Data Safety section
├── Builds user trust
└── Recommended for apps handling sensitive data
```

---

## 11. Mobile Security (OWASP Mobile Top 10 — 2025)

### 11.1 The Threats

**You MUST know these.** Building a mobile app without understanding these risks is negligent.

| # | Vulnerability | What it means | Prevention |
|---|---|---|---|
| M1 | Improper Credential Usage | Hardcoded API keys, storing passwords in plaintext | Use secure keychain/keystore, revocable tokens |
| M2 | Inadequate Supply Chain | Malicious third-party SDKs/libraries | Audit all dependencies, use lockfiles, monitor CVEs |
| M3 | Insecure Authentication | Weak login, no server-side validation | Server-side auth checks, MFA, biometric fallback |
| M4 | Insufficient Input Validation | SQL injection, XSS through user input | Validate ALL input server-side, sanitize output |
| M5 | Insecure Communication | Data sent over HTTP, no cert pinning | Enforce HTTPS everywhere, implement SSL pinning |
| M6 | Insecure Data Storage | Sensitive data in SharedPreferences/UserDefaults | Use Keychain (iOS) / EncryptedSharedPreferences (Android) |
| M7 | Insufficient Cryptography | Weak algorithms, hardcoded encryption keys | AES-256-GCM, RSA-2048+, key rotation, no MD5/SHA1 |
| M8 | Code Tampering | Modified APKs, jailbreak exploits | Code signing, integrity checks, jailbreak detection |
| M9 | Reverse Engineering | Decompiled source code exposure | Obfuscation (ProGuard/R8 on Android), code hardening |
| M10 | Improper Platform Usage | Misusing platform APIs and permissions | Follow platform best practices, request minimum permissions |

### 11.2 Secure Storage Patterns

```swift
// ✅ iOS — Use Keychain for sensitive data
import Security

func storeToken(_ token: String) {
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: "auth_token",
        kSecValueData as String: token.data(using: .utf8)!,
        kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    ]
    SecItemAdd(query as CFDictionary, nil)
}
```

```kotlin
// ✅ Android — Use EncryptedSharedPreferences
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val prefs = EncryptedSharedPreferences.create(
    context, "secure_prefs", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
prefs.edit().putString("auth_token", token).apply()
```

```javascript
// ❌ BAD — Web/React Native: NEVER store tokens in localStorage
localStorage.setItem('token', authToken)  // XSS = token stolen

// ✅ GOOD — Use httpOnly cookies for web, SecureStore for React Native
import * as SecureStore from 'expo-secure-store'
await SecureStore.setItemAsync('token', authToken)
```

### 11.3 SSL Certificate Pinning

```typescript
// ✅ React Native — SSL pinning with fetch
// Use libraries like react-native-ssl-pinning
import { fetch as sslFetch } from 'react-native-ssl-pinning'

const response = await sslFetch('https://api.example.com/data', {
  method: 'GET',
  sslPinning: {
    certs: ['my-cert']  // SHA-256 hash of the server certificate
  }
})
```

### 11.4 Biometric Authentication

```swift
// ✅ iOS — Face ID / Touch ID
import LocalAuthentication

let context = LAContext()
var error: NSError?

if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
    context.evaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        localizedReason: "Authenticate to access your account"
    ) { success, error in
        if success {
            // Biometric auth succeeded — STILL validate server-side
        }
    }
}
```

---

## 12. Privacy Compliance

### 12.1 Regulatory Frameworks

**You MUST comply with ALL applicable frameworks.** Ignorance is not a defense.

| Framework | Region | Key Requirements | Penalties |
|---|---|---|---|
| **GDPR** | EU/EEA | Consent before data collection, right to deletion, data portability, DPO required for large-scale processing | Up to €20M or 4% global revenue |
| **CCPA/CPRA** | California | Right to know, delete, opt-out of sale, limit sensitive data use | $2,500-$7,500 per violation |
| **COPPA** | US (children < 13) | Parental consent required, cannot collect more than necessary | $50,120 per violation |
| **PIPEDA** | Canada | Consent, access, accuracy obligations | $100,000 per violation |
| **LGPD** | Brazil | Similar to GDPR — consent, purpose limitation, data minimization | 2% of revenue |

### 12.2 Apple App Tracking Transparency (ATT)

**Required since iOS 14.5.** You MUST ask permission before tracking.

```swift
// ✅ Request ATT permission
import AppTrackingTransparency

ATTrackingManager.requestTrackingAuthorization { status in
    switch status {
    case .authorized:
        // User consented — can use IDFA for tracking
    case .denied, .restricted:
        // MUST respect this — no tracking, no workarounds
    case .notDetermined:
        // Will be asked on next launch
    @unknown default:
        break
    }
}
```

**What counts as "tracking" under ATT:**
- Linking user data with third-party data for advertising
- Sharing user data with data brokers
- Using IDFA for personalized ads

**What does NOT count:**
- First-party analytics (your own app data stays with you)
- Fraud detection
- Credit/lending decisions

### 12.3 Privacy Nutrition Labels

Both Apple and Google require "nutrition label" style privacy disclosures:

```
Apple Privacy Labels (App Store Connect):
├── Data Used to Track You
│   └── Any data linked to user identity for advertising across apps
├── Data Linked to You
│   └── Data associated with the user's identity (name, email, etc.)
├── Data Not Linked to You
│   └── Analytics data not tied to user identity
└── Data Not Collected
    └── Self-explanatory
```

```
Google Data Safety Form (Play Console):
├── Data collected (and for what purpose)
├── Data shared with third parties
├── Security practices (encryption, deletion)
└── Whether the app follows the Families Policy
```

### 12.4 Implementation Checklist

When building a mobile app that collects ANY user data:

- [ ] Privacy policy written and hosted on a live, public URL
- [ ] Privacy policy linked from within the app (settings or onboarding)
- [ ] ATT prompt implemented (iOS) with clear purpose string
- [ ] Google Data Safety form completed accurately in Play Console
- [ ] Apple Privacy Labels completed accurately in App Store Connect
- [ ] Consent mechanism for data collection (opt-in, not opt-out)
- [ ] Data deletion endpoint/mechanism available to users
- [ ] Data encrypted in transit (HTTPS) and at rest (AES-256)
- [ ] Minimum permissions requested — only what the app needs
- [ ] Third-party SDKs audited for data collection behavior
- [ ] Under-13 users handled per COPPA (if applicable)
- [ ] GDPR-compliant cookie/tracking consent banner (if serving EU users)

---

## NEVER

- **NEVER** use `max-width` media queries as your primary breakpoint system
- **NEVER** make tap targets smaller than 44×44px
- **NEVER** rely on hover as the only way to access functionality
- **NEVER** use `100vh` on mobile — use `100dvh`
- **NEVER** load full-size desktop images on mobile
- **NEVER** use `font-size` below 16px on inputs (iOS zoom bug)
- **NEVER** test only on desktop Chrome and call it "responsive"
- **NEVER** disable pinch-to-zoom (`user-scalable=no`) unless building a game
- **NEVER** use position: fixed without accounting for the virtual keyboard
- **NEVER** assume users have fast connections — test on throttled 3G
- **NEVER** hardcode API keys, tokens, or secrets in client code
- **NEVER** store sensitive data in localStorage, UserDefaults, or SharedPreferences without encryption
- **NEVER** skip SSL certificate pinning for apps handling financial or health data
- **NEVER** track users on iOS without ATT consent — Apple will reject you
- **NEVER** submit to the App Store with placeholder content or broken features
- **NEVER** request permissions you don't need — both stores flag this
- **NEVER** ignore OWASP Mobile Top 10 — these are the real attack vectors

---

## Pre-Completion Checklist

Before shipping any mobile interface, verify every item:

### UI/UX
- [ ] Base styles work at 320px wide (smallest phones)
- [ ] All tap targets ≥ 44×44px with ≥ 8px spacing
- [ ] No hover-only interactions — everything works with touch
- [ ] `dvh` used instead of `vh` for full-height layouts
- [ ] Safe area insets handled (notch, home indicator)
- [ ] `viewport-fit=cover` in meta viewport tag
- [ ] No horizontal scroll on any breakpoint (320px through 1536px)

### Performance
- [ ] Images use `srcset` + `sizes`, `loading="lazy"`, explicit dimensions
- [ ] Fonts use `font-display: swap` and WOFF2 format
- [ ] Input font-size ≥ 16px (prevents iOS auto-zoom)
- [ ] Correct `inputmode` on all form inputs
- [ ] FCP < 2.5s on throttled 3G connection
- [ ] CLS < 0.1 (no layout jumps on load)
- [ ] Bottom navigation accounts for `safe-area-inset-bottom`

### Security
- [ ] No hardcoded credentials or API keys in source code
- [ ] Sensitive data stored in Keychain (iOS) / EncryptedSharedPreferences (Android)
- [ ] All network calls use HTTPS — no HTTP exceptions
- [ ] SSL certificate pinning implemented for sensitive endpoints
- [ ] Authentication handled server-side, not just client-side
- [ ] Dependencies audited for known vulnerabilities

### Compliance
- [ ] Privacy policy hosted on live public URL and linked in app
- [ ] ATT prompt implemented with clear purpose string (iOS)
- [ ] Apple Privacy Labels completed accurately
- [ ] Google Data Safety form completed accurately
- [ ] Data deletion mechanism available to users
- [ ] Minimum permissions requested
- [ ] Using current SDK versions (Xcode 26 / API level 35+)

### Testing
- [ ] Tested on at least one real mobile device
- [ ] Lighthouse mobile score > 90
- [ ] App does not crash on launch or during normal use

---

## Related Skills

- [performance-librarian](/librarians/performance-librarian.md) — performance budgets and optimization
- [ux-design-librarian](/librarians/ux-design-librarian.md) — user experience patterns
- [frontend-librarian](/librarians/frontend-librarian.md) — component architecture
- [testing-librarian](/librarians/testing-librarian.md) — cross-device testing strategies
- [deployment-librarian](/librarians/deployment-librarian.md) — CDN and edge deployment
- [backend-librarian](/librarians/backend-librarian.md) — API security and authentication patterns
- [google-ai-librarian](/librarians/google-ai-librarian.md) — AI integration compliance

