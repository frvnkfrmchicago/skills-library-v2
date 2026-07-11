---
name: swiftui-performance-auditing
description: >
  Audits SwiftUI runtime performance using Instruments (Time Profiler, Hangs,
  SwiftUI template), body evaluation analysis, state invalidation diagnosis,
  memory leak detection, and performance budgets. Use when views feel slow,
  scrolling stutters, animations drop frames, app hangs on interaction, or
  when user mentions SwiftUI performance, lag, Instruments, profiling, or
  body evaluation.
---

# SwiftUI Performance Auditing

Profile first, optimize second. Never guess at performance problems —
Instruments tells you exactly where the bottleneck is.

---

## 1. Instruments Workflow

### Setup

1. **Always profile on a REAL DEVICE** — Simulator does not represent actual CPU, GPU, or thermal constraints
2. **Use a RELEASE build** — Product → Profile (⌘I), not Debug
3. **Select the SwiftUI template** — pre-configured with the right instruments

### Essential Instruments

| Instrument | What It Shows | When to Use |
|---|---|---|
| **SwiftUI (View Body)** | Body evaluation count and duration | Always — primary diagnostic |
| **Time Profiler** | CPU usage by function | Main thread blocking |
| **Hangs** | Unresponsive main thread (>250ms) | User-reported freezes |
| **Allocations** | Memory usage over time | Growing memory, large objects |
| **Leaks** | Retain cycle detection | Closures, delegates, timers |
| **Core Animation** | Frame rate, offscreen rendering | Scroll jank, animation drops |

---

## 2. Body Evaluation Audit

### What to Look For

The **SwiftUI** instrument track has a **Long View Body Updates** lane. This shows:
- 🟢 Green markers: normal body evaluations (<1ms)
- 🟡 Orange markers: slow evaluations (1-16ms)
- 🔴 Red markers: critical evaluations (>16ms, frame drop guaranteed)

### Diagnosis Workflow

1. Start recording in Instruments
2. Interact with the app to reproduce the slowdown
3. Look at the SwiftUI track for orange/red markers
4. Click a marker to identify which view's `body` is slow
5. Set inspection range (Option + right-click → Set Inspection Range and Zoom)
6. Check Time Profiler for what executed during that range

### Common Causes of Slow Body Evaluation

```swift
// ❌ CRITICAL — Heavy computation in body
var body: some View {
    let sorted = items.sorted { $0.date > $1.date }  // Sorts on every render
    let filtered = sorted.filter { $0.isActive }       // Filters on every render
    List(filtered) { item in
        ItemRow(item: item)
    }
}

// ✅ FIX — Compute in ViewModel, body only reads
@Observable
class ViewModel {
    var items: [Item] = []

    var activeItems: [Item] {
        items.filter(\.isActive).sorted { $0.date > $1.date }
    }
    // Only recomputes when items changes, not on every body eval
}

var body: some View {
    List(viewModel.activeItems) { item in
        ItemRow(item: item)
    }
}
```

```swift
// ❌ CRITICAL — Synchronous I/O in body
var body: some View {
    let data = try! Data(contentsOf: fileURL)  // Blocks main thread
    let image = UIImage(data: data)!
    Image(uiImage: image)
}

// ✅ FIX — Use .task for async work
@State private var image: UIImage?

var body: some View {
    Group {
        if let image {
            Image(uiImage: image)
        } else {
            ProgressView()
        }
    }
    .task {
        image = await loadImage(from: fileURL)
    }
}
```

---

## 3. State Invalidation Analysis

### Over-Rendering Detection

A view re-evaluates its body when ANY observed state changes. If a ViewModel has
20 properties and you observe the whole object, changing ANY property re-renders
EVERY view that observes it.

```swift
// ❌ BAD — All views re-render when ANY property changes
@Observable
class AppState {
    var user: User?
    var items: [Item] = []
    var settings: Settings = .default
    var notifications: [Notification] = []
    var isLoading = false
    // Changing isLoading re-renders views only observing items
}

// ✅ GOOD — Split into focused observable objects
@Observable
class ItemsState {
    var items: [Item] = []
    var isLoading = false
}

@Observable
class UserState {
    var user: User?
    var settings: Settings = .default
}
```

### Diagnosis: Add Body Print

```swift
// DEBUG ONLY — Add to suspect views to count evaluations
var body: some View {
    let _ = Self._printChanges()  // Prints what triggered re-evaluation
    // ... view content
}
```

Remove `_printChanges()` before shipping. It is a debug-only tool.

---

## 4. Memory Profiling

### Retain Cycle Detection

```swift
// ❌ COMMON LEAK — Closure captures self strongly
class ViewModel: ObservableObject {
    var timer: Timer?

    func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            self.tick()  // Strong reference to self — ViewModel never deallocates
        }
    }
}

// ✅ FIX — Use [weak self]
timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
    self?.tick()
}
```

### Instruments Leaks Workflow

1. Open Instruments → Leaks template
2. Run the app and navigate through screens
3. Pop back to check for deallocated controllers
4. Look for leak clusters — Instruments groups related leaks
5. Click the leak to see the retain cycle graph

### Memory Budget

| Metric | Target | Action If Exceeded |
|---|---|---|
| Idle memory | < 50MB | Check for cached images, uncleared arrays |
| Peak during scroll | < 150MB | Implement cell reuse, image downsampling |
| Memory growth per navigation push/pop | ~0MB | Check for retain cycles on dismiss |
| Image cache | < 100MB | Use `NSCache` with `totalCostLimit` |

---

## 5. Common Pitfalls Checklist

| Pitfall | Why It's Bad | Fix |
|---|---|---|
| `GeometryReader` in every cell | Forces layout recalculation per cell | Move to parent level or use `onGeometryChange` |
| Large `body` with inline logic | Body evaluation blocks main thread | Extract to ViewModel computed properties |
| `@State` array with 1000+ items | Diffing 1000 items on every mutation | Use `@Observable` + `identifiable` + `LazyVStack` |
| Missing `.id()` on ForEach | SwiftUI can't diff efficiently | Always use `Identifiable` or explicit `id:` |
| `.onAppear` firing multiple times | Side effects run repeatedly | Use `.task` (auto-cancels) or add a guard flag |
| Animating non-animatable properties | View rebuilds instead of interpolating | Animate with `withAnimation` + `Animatable` protocol |
| Image loading without caching | Re-downloads on every appearance | Use `AsyncImage` with cache or a library (Kingfisher/SDWebImage) |

---

## 6. Performance Budgets

| Metric | Target | Measurement |
|---|---|---|
| Body evaluation | < 16ms (60fps budget) | SwiftUI instrument |
| Body evaluation count per interaction | < 5 views | `_printChanges()` |
| Main thread hang | 0 hangs > 250ms | Hangs instrument |
| Scroll frame rate | 60fps sustained | Core Animation instrument |
| Cold launch to interactive | < 2s | Time Profiler + App Launch template |
| Memory at idle | < 50MB | Allocations instrument |
| Memory growth on navigation cycle | ~0MB | Allocations (mark generations) |

---

## ⛔ STOP GATE — Profiling

DO NOT mark a performance audit as complete without:

1. **Instruments evidence** — screenshots or trace summaries from a REAL DEVICE, RELEASE build
2. **No red markers** in the SwiftUI View Body lane
3. **Zero hangs** > 250ms in the Hangs instrument
4. **Memory stable** — no growth after push/pop navigation cycles
5. **Scroll at 60fps** — verified via Core Animation instrument

If you cannot run Instruments (e.g., agent without Xcode access), explicitly state:
"⚠️ Code-level audit only. Instruments profiling required on device for full verification."

---

## NEVER

- **NEVER** guess at performance — use Instruments
- **NEVER** profile on Simulator — always use a real device
- **NEVER** profile a Debug build — always use Release
- **NEVER** leave `_printChanges()` in production code
- **NEVER** do synchronous I/O in `body` — use `.task`
- **NEVER** sort/filter large arrays in `body` — precompute in ViewModel
- **NEVER** ignore memory growth — it's a retain cycle until proven otherwise
- **NEVER** use `GeometryReader` inside repeating cells

---

## Pre-Completion Checklist

- [ ] Profiled on real device with Release build
- [ ] SwiftUI instrument shows no red/orange body evaluations
- [ ] Hangs instrument shows zero hangs > 250ms
- [ ] Memory stable across navigation push/pop cycles
- [ ] Leaks instrument shows no retain cycles
- [ ] Scroll maintains 60fps
- [ ] No `_printChanges()` in production code
- [ ] Heavy computation moved to ViewModel

---

## Related Skills

- `swiftui-view-building` — View architecture that prevents performance issues
- `ios-debugging` — Broader debugging toolkit
- `anti-glitch-debugging` — Web/React Native performance debugging
