# Agent 1 Handoff — Mobile Native (Expansion)

## Context

Skills Library for AI-assisted development. Expand mobile coverage beyond PWA to native.

**Location:** `/Users/franklawrencejr./Downloads/skills-library-v2 2/`

**Existing:** `app-types/mobile/SKILL.md`, `agents/pwa/SKILL.md`

---

## What to Build

### `agents/mobile-native/SKILL.md`

**Must cover:**

1. **React Native**
   - Project setup (CLI vs Expo)
   - Navigation (React Navigation)
   - State management (same as web)
   - Styling (StyleSheet, NativeWind)
   - Native components
   - Platform-specific code

2. **Expo**
   - Managed vs bare workflow
   - EAS Build and Submit
   - Expo Router
   - Expo modules
   - OTA updates
   - When to eject

3. **Capacitor**
   - Web-to-mobile bridge
   - Plugin ecosystem
   - Native API access
   - vs React Native decision

4. **Native Modules**
   - Bridging native code
   - iOS (Swift/Obj-C)
   - Android (Kotlin/Java)
   - When to go native

5. **App Store Submission**
   - iOS App Store process
   - Google Play Store process
   - Review guidelines
   - Metadata requirements
   - Screenshot specs

6. **Push Notifications (Mobile)**
   - APNs setup
   - FCM setup
   - Expo Push
   - Notification handling

7. **Deep Linking**
   - Universal links (iOS)
   - App links (Android)
   - Expo linking
   - Deferred deep links

8. **Mobile Performance**
   - List optimization (FlatList)
   - Image loading
   - Bundle size
   - Startup time

9. **Comparison Table**

| Feature | React Native | Flutter | Capacitor |
|---------|-------------|---------|-----------|
| Language | JS/TS | Dart | JS/TS |
| Performance | Near-native | Near-native | WebView |
| Learning curve | Low (if React) | Medium | Low |
| Expo? | Yes | No | No |

---

## Format

```yaml
---
name: mobile-native
description: Mobile native development. React Native, Expo, Capacitor, app stores.
last_updated: 2026-03
---
```

---

## After Building (REQUIRED)

1. Add to `SKILL-NAVIGATION.md` under app types
2. Add to `_meta/CHANGELOG.md`

---

## Completion Report

1. Path to created file
2. Confirmation navigation updated
3. Any issues
