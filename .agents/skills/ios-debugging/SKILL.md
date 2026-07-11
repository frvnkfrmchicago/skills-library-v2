---
name: ios-debugging
description: >
  Debugs iOS apps using Simulator workflows, SwiftUI preview debugging,
  structured logging with os.Logger, LLDB commands, network proxies
  (Proxyman/Charles), crash log symbolication, and Instruments. Covers
  both native Swift/SwiftUI and React Native Expo debugging in the iOS
  context. Use when diagnosing crashes, debugging UI in Simulator,
  analyzing network requests, reading crash logs from TestFlight, or
  when user mentions iOS debug, Simulator, crash, Xcode, or lldb.
---

# iOS Debugging

Debug with evidence. Every diagnosis must end with a specific file,
line, or Instruments trace — not a guess.

---

## 1. Simulator Workflows

### Device Selection

| Scenario | Simulator Choice |
|---|---|
| Smallest viewport testing | iPhone SE (3rd gen) — 375pt wide |
| Dynamic Island / notch | iPhone 16 Pro |
| Tablet layout | iPad Air / iPad Mini |
| Large text testing | Any device → Settings → Accessibility → Larger Text |
| Landscape testing | ⌘← / ⌘→ to rotate |

### Useful Simulator Commands

```bash
# List available simulators
xcrun simctl list devices

# Boot a specific simulator
xcrun simctl boot "iPhone 16 Pro"

# Open a URL in the simulator (deep link testing)
xcrun simctl openurl booted "myapp://task/123"

# Send a push notification
xcrun simctl push booted com.myapp.bundleid notification.apns

# Override status bar (clean screenshots)
xcrun simctl status_bar booted override --time "9:41" --batteryLevel 100

# Reset simulator to clean state
xcrun simctl erase booted

# Clear SwiftUI preview cache
xcrun simctl --set previews delete all
```

### Network Conditioning

Simulate poor network in Simulator:
1. Open **Settings** app in Simulator
2. Developer → Network Link Conditioner
3. Select: 3G Good, Edge, 100% Loss, etc.

Alternative: Use **Network Link Conditioner** from Additional Tools for Xcode
(download from developer.apple.com).

---

## 2. SwiftUI Preview Debugging

### Debug a Preview

1. Click **Debug Preview** button at the bottom of the canvas
   (or Editor → Canvas → Debug Preview)
2. This attaches the full Xcode debugger to the preview
3. Set breakpoints in your view code — they will hit during preview rendering
4. Inspect variables in the debug area

### View Console Output in Previews

Editor → Canvas → Preview Output — shows `print()` and `Logger` output
specifically from the preview process.

### Troubleshooting Failed Previews

```
Preview failed to load?
│
├── Step 1: Click "Diagnostics" in the canvas
│   └── Scroll to the BOTTOM for the actual error
│
├── Step 2: Clean build folder (⇧⌘K)
│
├── Step 3: Ensure project builds (⌘B)
│
├── Step 4: Resume preview (⌥⌘P)
│
├── Step 5: Clear preview cache
│   └── xcrun simctl --set previews delete all
│
├── Step 6: Delete DerivedData
│   └── rm -rf ~/Library/Developer/Xcode/DerivedData
│
└── Step 7: Check for legacy execution
    └── Editor → Canvas → Use Legacy Preview Execution
```

---

## 3. Console & Logging

### Structured Logging with os.Logger

```swift
// ✅ REQUIRED — Use os.Logger for production-grade logging
import os

extension Logger {
    private static let subsystem = Bundle.main.bundleIdentifier ?? "com.myapp"

    static let networking = Logger(subsystem: subsystem, category: "networking")
    static let auth = Logger(subsystem: subsystem, category: "auth")
    static let ui = Logger(subsystem: subsystem, category: "ui")
    static let data = Logger(subsystem: subsystem, category: "data")
}

// Usage
Logger.networking.info("Fetching tasks for user \(userID)")
Logger.auth.error("Token refresh failed: \(error.localizedDescription)")
Logger.data.debug("Cache hit for key: \(key)")
```

```swift
// ❌ BAD — print() in production code
print("fetching tasks...")           // No structure, no filtering, no levels
print("ERROR: \(error)")             // Gets lost in noise
NSLog("something happened: %@", msg) // Slow, no category filtering
```

### Log Levels

| Level | Use For | Persisted? |
|---|---|---|
| `.debug` | Verbose development info | No (stripped in release) |
| `.info` | Normal operation events | Briefly |
| `.notice` | Notable but expected events | Yes |
| `.error` | Recoverable errors | Yes |
| `.fault` | Critical, likely bugs | Yes + crash report |

### Viewing Logs

- **Xcode Console**: Filter by category using the filter bar
- **Console.app**: Filter by subsystem and category for device logs
- **Terminal**: `log stream --predicate 'subsystem == "com.myapp"'`

---

## 4. LLDB Essentials

### Common Commands

| Command | What It Does | Example |
|---|---|---|
| `po` | Print object description | `po viewModel.items` |
| `p` | Print with type info | `p items.count` |
| `expr` | Evaluate expression | `expr viewModel.isLoading = true` |
| `bt` | Backtrace (call stack) | `bt` |
| `frame variable` | Show all local variables | `frame variable` |
| `breakpoint set` | Set breakpoint | `breakpoint set -f MyView.swift -l 42` |
| `thread info` | Current thread info | `thread info` |
| `image lookup` | Find symbol address | `image lookup -n "MyClass.init"` |

### Conditional Breakpoints

Right-click a breakpoint in Xcode → Edit Breakpoint:
- **Condition**: `items.count > 100` — only breaks when true
- **Action**: Add `po items` — prints on hit without stopping
- **Ignore count**: Skip first N hits
- **Automatically continue**: Log without pausing

### Symbolic Breakpoints

Debug → Breakpoints → Create Symbolic Breakpoint:
- `UIViewAlertForUnsatisfiableConstraints` — catch Auto Layout issues
- `swift_willThrow` — break on any Swift throw
- `-[UIApplication sendAction:to:from:forEvent:]` — catch all UI actions

---

## 5. Network Debugging

### Proxyman / Charles Setup for Simulator

1. Install Proxyman (recommended) or Charles Proxy
2. Proxyman automatically intercepts Simulator traffic
3. For HTTPS: install the Proxyman CA certificate in Simulator
   ```bash
   # Proxyman does this automatically via:
   # Proxyman → Certificate → Install on iOS Simulator
   ```
4. All URLSession requests now visible with headers and body

### React Native / Expo Network Debugging

```bash
# Flipper (React Native debugger)
npx react-native start --experimental-debugger

# Expo: Use Expo DevTools
npx expo start --dev-client
# Network tab shows all fetch() requests
```

### SSL Pinning Bypass for Debug

```swift
// ✅ Debug-only: Disable SSL pinning in debug builds
#if DEBUG
class DebugSessionDelegate: NSObject, URLSessionDelegate {
    func urlSession(
        _ session: URLSession,
        didReceive challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) {
        guard let trust = challenge.protectionSpace.serverTrust else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }
        completionHandler(.useCredential, URLCredential(trust: trust))
    }
}
#endif
```

---

## 6. Crash Log Analysis

### TestFlight Crash Reports

1. Open App Store Connect → Your App → TestFlight
2. Select the build → Crashes tab
3. Download the crash log
4. Symbolicate if needed (Xcode → Window → Organizer → Crashes)

### Symbolication Workflow

```bash
# Check if dSYMs are available
mdls -name com_apple_xcode_dsym_uuids path/to/MyApp.app.dSYM

# Symbolicate a crash log manually
xcrun atos -arch arm64 -o MyApp.app.dSYM/Contents/Resources/DWARF/MyApp \
  -l 0x100000000 0x100012345
```

### Reading a Crash Log

```
Key sections:
├── Exception Type: EXC_BAD_ACCESS → memory issue (dangling pointer)
├── Exception Type: EXC_CRASH (SIGABRT) → assertion/force unwrap failure
├── Thread 0 (crashed): → main thread crash = UI-related
├── Thread N (crashed): → background thread crash = async issue
└── Binary Images: → verify your binary is in the crash stack
```

### Common Crash Patterns

| Crash Signature | Likely Cause | Fix |
|---|---|---|
| `EXC_BAD_ACCESS (SIGBUS)` | Accessing deallocated memory | Check retain cycles, weak references |
| `Fatal error: Unexpectedly found nil` | Force unwrap on nil | Use `guard let` or `if let` |
| `EXC_CRASH (SIGABRT)` in SwiftUI | State mutation during render | Move mutation to `.task` or button action |
| `Thread 1: signal SIGABRT` | Assertion failure | Check preconditions and force casts |

---

## 7. Instruments Quick Reference

| Template | Use For | Key Metric |
|---|---|---|
| Time Profiler | CPU bottlenecks | Heaviest stack trace |
| SwiftUI | Body evaluation performance | Long View Body Updates |
| Hangs | Main thread unresponsiveness | Hang duration (>250ms = bad) |
| Leaks | Retain cycle detection | Leak count and cycle graph |
| Allocations | Memory usage and growth | Persistent bytes over time |
| Network | HTTP request timing | Request duration, payload size |
| Energy Log | Battery drain diagnosis | CPU/GPU/network energy impact |
| Core Animation | Rendering performance | FPS counter, offscreen rendering |
| App Launch | Cold/warm start time | Time to first frame |

---

## 8. React Native / Expo in iOS Context

### Debugging Expo on Simulator

```bash
# Start with development client
npx expo start --dev-client

# Open in specific simulator
npx expo run:ios --device "iPhone 16 Pro"

# View native logs alongside JS
npx react-native log-ios
```

### React DevTools

```bash
# Standalone React DevTools
npx react-devtools
# Then shake device (or ⌘D in Simulator) → Debug → Connect to React DevTools
```

### Expo-Specific Debugging

- **EAS Build logs**: `eas build:view` — view build logs for failed builds
- **Expo DevTools**: Browser-based debugger at `localhost:8081`
- **Hermes debugging**: Chrome DevTools at `chrome://inspect`

---

## ⛔ STOP GATE — Evidence

DO NOT mark any debugging session as complete without:

1. **Specific evidence** — log output, crash stack trace, or Instruments screenshot
2. **Root cause identified** — file name and line number, not "might be X"
3. **Fix verified** — reproduction steps no longer trigger the bug
4. **No `print()` left** — convert to `os.Logger` or remove

---

## NEVER

- **NEVER** diagnose a crash without reading the actual crash log
- **NEVER** leave `print()` statements in production code — use `os.Logger`
- **NEVER** debug performance issues on Simulator — use a real device
- **NEVER** ship with SSL pinning bypass enabled
- **NEVER** guess at memory leaks — use the Leaks instrument
- **NEVER** ignore TestFlight crash reports — they represent real users

---

## Pre-Completion Checklist

- [ ] Root cause identified with specific file/line reference
- [ ] Fix verified by reproducing the original issue
- [ ] `os.Logger` used instead of `print()` for any new logging
- [ ] No debug-only code (`#if DEBUG`) shipped to production
- [ ] Crash logs symbolicated and readable
- [ ] TestFlight crashes reviewed if applicable

---

## Related Skills

- `swiftui-performance-auditing` — Detailed Instruments profiling
- `swiftui-view-building` — Architecture that prevents bugs
- `expo-testflight-shipping` — TestFlight crash report workflow
- `react-native-expo-building` — Expo-specific debugging
