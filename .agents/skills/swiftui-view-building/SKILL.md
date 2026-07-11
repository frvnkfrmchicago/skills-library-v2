---
name: swiftui-view-building
description: >
  Builds composable SwiftUI view hierarchies using NavigationStack, sheets,
  toolbars, searchable, and @ViewBuilder patterns. Covers view extraction,
  refactoring large files, state architecture with @Observable, type-safe
  routing, and lazy container usage. Use when building SwiftUI screens,
  refactoring bloated views, designing navigation flows, or when user
  mentions SwiftUI, NavigationStack, sheets, view architecture, or refactor.
---

# SwiftUI View Building

Build well-structured, composable SwiftUI views. Every screen you build
should be navigable, testable, and under 200 lines.

---

## 1. View Composition Decision Tree

```
What are you building?
│
├── Reusable component used across multiple screens?
│   └── Extract to its own struct in a separate file
│       WHY: Reusability, encapsulation, isolated previews
│
├── Complex conditional block (if/else, switch) within one view?
│   └── Use private @ViewBuilder computed property
│       WHY: Keeps body declarative without creating a new type
│
├── Repeated styling pattern (font + color + padding combo)?
│   └── Create a custom ViewModifier
│       WHY: Single source of truth for styling, DRY
│
├── Container with slots (header/content/footer)?
│   └── Use generic View with @ViewBuilder parameters
│       WHY: Composable layout without coupling to content
│
└── One-off layout helper within this file?
    └── Private struct at the bottom of the same file
        WHY: Co-located, private, no file proliferation
```

---

## 2. NavigationStack Patterns

**Always use `NavigationStack`. Never use `NavigationView`.**

### Type-Safe Routing

```swift
// ✅ REQUIRED — Enum-based routing
enum Route: Hashable {
    case detail(itemID: String)
    case settings
    case profile(userID: String)
    case editProfile
}

struct ContentView: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            HomeView(path: $path)
                .navigationDestination(for: Route.self) { route in
                    switch route {
                    case .detail(let id):
                        DetailView(itemID: id)
                    case .settings:
                        SettingsView()
                    case .profile(let id):
                        ProfileView(userID: id)
                    case .editProfile:
                        EditProfileView()
                    }
                }
        }
    }
}
```

```swift
// ❌ BAD — NavigationLink with inline destination
NavigationLink("Detail") {
    DetailView(itemID: "123") // Destination instantiated immediately
}
// Every link in a list creates every destination view eagerly
```

### Deep Linking

```swift
// ✅ Push multiple routes at once for deep links
func handleDeepLink(_ url: URL) {
    path.removeLast(path.count) // Reset stack
    path.append(Route.profile(userID: "abc"))
    path.append(Route.editProfile)
}
```

### Rules

- Each tab in a `TabView` gets its own independent `NavigationStack`
- NEVER nest `NavigationStack` inside another `NavigationStack`
- Keep `NavigationPath` in the View layer or a dedicated `Router` object — not in ViewModels
- Use `navigationTitle` and `navigationBarTitleDisplayMode` consistently

---

## 3. Sheet & Presentation

### Use `sheet(item:)` Over Multiple Booleans

```swift
// ✅ GOOD — Single enum drives all sheets
enum ActiveSheet: Identifiable {
    case settings
    case editProfile
    case shareItem(Item)

    var id: String {
        switch self {
        case .settings: return "settings"
        case .editProfile: return "editProfile"
        case .shareItem(let item): return "share-\(item.id)"
        }
    }
}

@State private var activeSheet: ActiveSheet?

var body: some View {
    content
        .sheet(item: $activeSheet) { sheet in
            switch sheet {
            case .settings:
                SettingsView()
            case .editProfile:
                EditProfileView()
            case .shareItem(let item):
                ShareView(item: item)
            }
        }
}
```

```swift
// ❌ BAD — Boolean explosion
@State private var showSettings = false
@State private var showEditProfile = false
@State private var showShare = false
// Three state variables for three sheets — unscalable
```

### Sheet Navigation

If a sheet needs its own navigation (multi-step flow), embed a `NavigationStack` INSIDE the sheet:

```swift
.sheet(isPresented: $showOnboarding) {
    NavigationStack {
        OnboardingStep1()
    }
}
```

### Presentation Chooser

| Presentation | Use When |
|---|---|
| `sheet` | Modal task, form, supplementary detail |
| `fullScreenCover` | Immersive experience (media player, onboarding) |
| `popover` | iPad contextual actions (falls back to sheet on iPhone) |
| `confirmationDialog` | Destructive action confirmation |
| `alert` | Error notification, acknowledgment |

---

## 4. Toolbar & Searchable

### Searchable

```swift
// ✅ Apply .searchable to the NavigationStack or top-level container
NavigationStack {
    List(filteredItems) { item in
        ItemRow(item: item)
    }
    .searchable(text: $searchText, prompt: "Search items")
    .searchSuggestions {
        ForEach(suggestions) { suggestion in
            Text(suggestion.name)
                .searchCompletion(suggestion.name)
        }
    }
    .searchScopes($scope) {
        Text("All").tag(SearchScope.all)
        Text("Favorites").tag(SearchScope.favorites)
    }
}
```

### Toolbar

```swift
.toolbar {
    ToolbarItem(placement: .topBarTrailing) {
        Button("Add", systemImage: "plus") {
            // action
        }
    }
    ToolbarItem(placement: .topBarLeading) {
        EditButton()
    }
    ToolbarItemGroup(placement: .bottomBar) {
        Spacer()
        Text("\(items.count) items")
        Spacer()
    }
}
```

---

## 5. State Architecture

### @Observable (Preferred in 2026)

```swift
// ✅ REQUIRED — Use @Observable for view models
@Observable
class ItemViewModel {
    var items: [Item] = []
    var isLoading = false
    var errorMessage: String?

    func loadItems() async {
        isLoading = true
        defer { isLoading = false }
        do {
            items = try await api.fetchItems()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

```swift
// ❌ OUTDATED — ObservableObject + @Published
class ItemViewModel: ObservableObject {
    @Published var items: [Item] = []
    // Requires @StateObject/@ObservedObject at call site
    // More boilerplate, less granular invalidation
}
```

### State Placement

| State Type | Use | Where |
|---|---|---|
| `@State` | View-local UI state (toggle, text input) | View struct |
| `@Observable` | Shared business state | ViewModel injected via `.environment()` |
| `@Environment` | System values (colorScheme, dismiss) | View struct |
| `@Binding` | Parent→child two-way state | Child view parameter |
| `@AppStorage` | Persistent user preferences | Anywhere (wraps UserDefaults) |

---

## 6. Refactoring Protocol

### When to Refactor

| Signal | Action |
|---|---|
| File exceeds 200 lines | Extract subviews to separate files |
| `body` exceeds 50 lines | Extract `@ViewBuilder` computed properties |
| Same styling block repeated 3+ times | Create a `ViewModifier` |
| Passing 4+ properties to a subview | Introduce a ViewModel or data struct |
| View contains business logic | Move to `@Observable` ViewModel |
| Multiple `if/else` branches in `body` | Extract conditional sections |

### Extraction Checklist

1. Identify the boundary — is this a reusable component or view-specific?
2. Extract to a new struct with explicit, minimal `init` parameters
3. Use `@Binding` for two-way state, plain values for display-only
4. Add a SwiftUI Preview with realistic sample data
5. Name descriptively: `ItemDetailHeader`, not `HeaderView`

### Naming Conventions

```
✅ Good names:
  ItemDetailHeader       — describes content + context
  TransactionRowView     — describes what it renders
  OnboardingStepOne      — describes position in flow

❌ Bad names:
  HeaderView             — too generic, no context
  CustomView             — meaningless
  MyComponent            — not descriptive
```

---

## 7. Lazy Containers

**Always use lazy containers for scrollable data.**

```swift
// ✅ REQUIRED — Lazy loading for lists
ScrollView {
    LazyVStack(spacing: 12) {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}

// ✅ Lazy grid
ScrollView {
    LazyVGrid(columns: [
        GridItem(.flexible()),
        GridItem(.flexible()),
        GridItem(.flexible())
    ], spacing: 16) {
        ForEach(items) { item in
            ItemCard(item: item)
        }
    }
}
```

```swift
// ❌ BAD — VStack renders ALL items immediately
ScrollView {
    VStack {
        ForEach(items) { item in
            ItemRow(item: item) // 1000 items = 1000 views created at once
        }
    }
}
```

### `List` vs `LazyVStack`

| Use | When |
|---|---|
| `List` | Need swipe actions, selection, edit mode, section headers |
| `LazyVStack` in `ScrollView` | Need full visual control, custom layouts, no default styling |

---

## ⛔ STOP GATE — Architecture

DO NOT mark any SwiftUI view work as complete without verifying:

1. **No `NavigationView`** — must use `NavigationStack`
2. **No `AnyView`** — use `@ViewBuilder` or `some View` generics instead
3. **No nested `NavigationStack`** — one per tab, one per sheet
4. **No `ObservableObject`** without justification — prefer `@Observable`
5. **No file over 300 lines** — extract subviews
6. **No `body` over 80 lines** — extract `@ViewBuilder` properties

Run mental checklist:
```
[ ] NavigationStack (not NavigationView)
[ ] @Observable (not ObservableObject)
[ ] sheet(item:) over multiple booleans
[ ] LazyVStack/LazyVGrid for scrollable data
[ ] No AnyView type erasure
[ ] File < 300 lines, body < 80 lines
[ ] Every subview has a Preview
```

---

## NEVER

- **NEVER** use `NavigationView` — it is deprecated
- **NEVER** use `AnyView` — it destroys SwiftUI's diffing performance
- **NEVER** nest `NavigationStack` inside another `NavigationStack`
- **NEVER** put business logic in `body` — use `@Observable` ViewModel
- **NEVER** use `VStack` for large scrollable lists — use `LazyVStack`
- **NEVER** pass more than 4 bindings to a subview — introduce a data struct
- **NEVER** use `@ObservedObject` for owned state — use `@State` with `@Observable`

---

## Pre-Completion Checklist

- [ ] All navigation uses `NavigationStack` with type-safe routing
- [ ] Sheets use `sheet(item:)` with `Identifiable` enum
- [ ] State uses `@Observable` pattern
- [ ] No file exceeds 300 lines
- [ ] No `body` exceeds 80 lines
- [ ] Lazy containers used for all scrollable content
- [ ] Every extracted subview has a SwiftUI Preview
- [ ] Toolbar items use standard placements
- [ ] `.searchable` applied at container level

---

## Related Skills

- `swiftui-performance-auditing` — Profile body evaluation and rendering
- `swiftui-liquid-glass` — iOS 26 Liquid Glass design patterns
- `ios-debugging` — Preview debugging, Instruments
- `react-native-expo-building` — Cross-platform alternative
