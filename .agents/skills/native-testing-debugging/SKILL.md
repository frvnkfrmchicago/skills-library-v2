---
name: native-testing-debugging
description: >
  Tests and debugs native iOS and Android apps using E2E frameworks
  (Detox, Maestro, XCUITest, Espresso), TestFlight feedback collection,
  crash symbolication, device testing matrices, and native performance
  profiling. Use when adding E2E tests, setting up Detox or Maestro,
  reading TestFlight crash reports, creating device test plans, or when
  user mentions E2E testing, Detox, Maestro, crash logs, or device testing.
---

# Native Testing & Debugging

Every critical user flow needs an automated test. Every crash needs
a symbolicated stack trace. No shipping without evidence.

---

## 1. E2E Testing Decision Tree

```
What are you testing?
│
├── React Native / Expo app?
│   ├── Need fast authoring with YAML? → Maestro
│   └── Need deep native integration? → Detox
│
├── Native iOS (SwiftUI / UIKit)?
│   └── XCUITest (built into Xcode)
│
├── Native Android (Kotlin / Compose)?
│   └── Espresso (Android standard)
│
├── Cross-platform (same tests, both platforms)?
│   └── Maestro (YAML tests run on iOS + Android)
│
└── Quick smoke test before submission?
    └── Maestro (fastest to write, no code)
```

### Framework Comparison

| Feature | Detox | Maestro | XCUITest | Espresso |
|---|---|---|---|---|
| Language | JavaScript | YAML | Swift | Kotlin |
| Platform | iOS + Android | iOS + Android | iOS only | Android only |
| Setup complexity | High | Low | Medium | Medium |
| CI integration | Good | Good | Excellent | Excellent |
| Speed | Fast | Fast | Fast | Fast |
| Reliability | Good (gray box) | Good (black box) | Excellent | Excellent |
| Best for | React Native | Quick E2E | Native iOS | Native Android |

---

## 2. Detox Setup (React Native)

### Installation

```bash
npm install detox --save-dev
npx detox init
```

### Configuration

```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      config: 'e2e/jest.config.js',
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/MyApp.app',
      build: 'xcodebuild -workspace ios/MyApp.xcworkspace -scheme MyApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 16' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_7_API_35' },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

### Writing Detox Tests

```javascript
// e2e/login.test.js
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login successfully with valid credentials', async () => {
    await element(by.id('email-input')).typeText('user@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should show error with invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpass');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

### Running Detox Tests

```bash
# Build for testing
npx detox build --configuration ios.sim.debug

# Run tests
npx detox test --configuration ios.sim.debug

# Run specific test
npx detox test --configuration ios.sim.debug e2e/login.test.js
```

---

## 3. Maestro Flows

### YAML-Based Testing (No Code)

```yaml
# .maestro/login_flow.yaml
appId: com.myapp
---
- launchApp
- tapOn:
    id: "email-input"
- inputText: "user@example.com"
- tapOn:
    id: "password-input"
- inputText: "password123"
- tapOn:
    id: "login-button"
- assertVisible:
    id: "home-screen"
```

### Advanced Maestro Features

```yaml
# .maestro/full_onboarding.yaml
appId: com.myapp
---
- launchApp:
    clearState: true

# Wait for splash screen to dismiss
- waitForAnimationToEnd

# Onboarding carousel
- swipeLeft
- swipeLeft
- tapOn: "Get Started"

# Sign up flow
- tapOn: "Create Account"
- inputText: "Test User"
- tapOn: "Next"
- inputText: "test@example.com"
- tapOn: "Next"

# Take screenshot for visual comparison
- takeScreenshot: "onboarding_complete"

# Assert final state
- assertVisible: "Welcome, Test User"
```

### Running Maestro

```bash
# Install
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run a single flow
maestro test .maestro/login_flow.yaml

# Run all flows
maestro test .maestro/

# Record a video
maestro test .maestro/login_flow.yaml --format junit --output report.xml
```

---

## 4. TestFlight Feedback Loop

### Collecting Beta Feedback

```
TestFlight feedback channels:
│
├── In-App Screenshots
│   └── Testers shake to send feedback with screenshot
│   └── Available in App Store Connect → TestFlight → Feedback
│
├── Crash Reports
│   └── Automatic — no tester action needed
│   └── Available in Xcode Organizer and App Store Connect
│
├── Beta Tester Notes
│   └── Tester can write notes from TestFlight app
│   └── Available in App Store Connect → TestFlight → Tester feedback
│
└── Build-Level Metrics
    └── Install count, session count, crash rate per build
    └── Available in App Store Connect → TestFlight → Build details
```

### Responding to Crashes

1. App Store Connect → TestFlight → Crashes
2. Download crash log
3. Symbolicate (see section 5)
4. Fix, rebuild, resubmit
5. Include fix note in TestFlight "What to Test" description

### Asking Testers What to Test

Always include specific test instructions in your TestFlight build:
```
What to Test:
- New payment flow: Try adding a card and making a purchase
- Profile editing: Change your name and avatar
- Notifications: Enable push and verify you receive them
- Report any crashes by shaking your phone
```

---

## 5. Crash Symbolication

### What Is Symbolication?

Crash logs contain memory addresses. Symbolication converts them
to file names, function names, and line numbers.

### Xcode Organizer (Easiest)

1. Xcode → Window → Organizer → Crashes
2. Select your app
3. Xcode auto-symbolicates if it has the dSYM

### Manual Symbolication

```bash
# Find the dSYM for your build
mdfind "com_apple_xcode_dsym_uuids == 'YOUR-UUID-HERE'"

# Symbolicate an address
xcrun atos -arch arm64 \
  -o MyApp.app.dSYM/Contents/Resources/DWARF/MyApp \
  -l 0x100000000 \
  0x100012345

# Output: -[MyViewController viewDidLoad] (MyViewController.swift:42)
```

### EAS Build dSYMs

```bash
# Download dSYMs from EAS build
eas build:view --json | jq '.artifacts.buildUrl'
# dSYMs are included in the build artifacts

# For Expo/React Native, also upload source maps
npx expo export --dump-sourcemap
```

### React Native Crash Patterns

| Crash Type | Location | Fix |
|---|---|---|
| `RCTFatalException` | JS runtime error | Check JS error boundary |
| `EXC_BAD_ACCESS` | Native module issue | Check native bridge calls |
| `NSInternalInconsistencyException` | UIKit thread issue | Ensure UI updates on main thread |
| `std::terminate` | C++ exception in Hermes | Check Hermes version compatibility |

---

## 6. Device Testing Matrix

### Minimum iOS Test Devices

| Device | Why | Viewport |
|---|---|---|
| iPhone SE (3rd gen) | Smallest current iPhone | 375×667pt |
| iPhone 16 | Standard size, Dynamic Island | 393×852pt |
| iPhone 16 Pro Max | Largest screen | 430×932pt |
| iPad Air | Tablet layout | 820×1180pt |

### Minimum Android Test Devices

| Device | Why | Screen |
|---|---|---|
| Pixel 7 / 8 | Reference Android | 1080×2400 |
| Samsung Galaxy S24 | Most popular OEM | 1080×2340 |
| Samsung Galaxy A15 | Budget segment (large market) | 1080×2340 |
| Pixel Tablet | Tablet layout | 2560×1600 |

### Testing Priorities

```
Priority 1 (MUST test before every release):
├── One small iPhone (SE)
├── One standard iPhone (16)
└── One Android (Pixel or Samsung)

Priority 2 (Test before major releases):
├── Large iPhone (Pro Max)
├── iPad
├── Budget Android
└── Android tablet

Priority 3 (Test when able):
├── Older iOS (2 versions back)
├── Older Android (API 26-30)
└── Accessibility (VoiceOver/TalkBack)
```

---

## 7. Performance Testing (Native)

### iOS — Instruments

See `swiftui-performance-auditing` for detailed Instruments workflow.

Quick targets:
- Cold launch < 2s
- Scroll at 60fps
- Memory stable (<150MB peak)
- Zero hangs >250ms

### Android — Android Profiler

1. Android Studio → View → Tool Windows → Profiler
2. Attach to running process
3. Monitor CPU, Memory, Network, Energy

Quick targets:
- Cold launch < 3s
- Janky frames < 5% of total
- Memory stable (<150MB peak)
- No strict mode violations

### React Native — Flipper

```bash
# Start Flipper for RN debugging
npx react-native start --experimental-debugger
```

Key panels:
- Performance: JS FPS, UI FPS
- Network: All fetch() requests
- Databases: AsyncStorage contents
- Logs: Native + JS console

---

## ⛔ STOP GATE — Coverage

DO NOT mark testing as complete without:

1. **At least one E2E flow** covering the critical happy path (login → core action → logout)
2. **Crash-free rate** verified on TestFlight (target: >99%)
3. **Tested on at least 2 physical devices** (1 iOS, 1 Android)
4. **dSYMs uploaded** for crash symbolication
5. **All TestFlight crashes investigated** and resolved or documented

---

## NEVER

- **NEVER** ship without at least a happy-path E2E test
- **NEVER** ignore TestFlight crash reports — they're real user crashes
- **NEVER** skip crash symbolication — unsymbolicated logs are useless
- **NEVER** test only on Simulator/Emulator — real devices behave differently
- **NEVER** use `testID` or `accessibilityIdentifier` inconsistently — standardize

---

## Pre-Completion Checklist

- [ ] E2E framework chosen and configured (Detox, Maestro, XCUITest, or Espresso)
- [ ] Happy-path E2E test written and passing
- [ ] Tested on minimum 2 physical devices
- [ ] TestFlight feedback reviewed and crashes addressed
- [ ] dSYMs/source maps uploaded for symbolication
- [ ] Performance targets met (launch time, scroll FPS, memory)
- [ ] CI integration configured for automated test runs
- [ ] No unresolved crashes in TestFlight analytics

---

## Related Skills

- `ios-debugging` — Deeper iOS debugging toolkit
- `swiftui-performance-auditing` — SwiftUI-specific performance profiling
- `expo-testflight-shipping` — TestFlight build and submission pipeline
- `testing-enforcing` — General testing strategy and coverage targets
