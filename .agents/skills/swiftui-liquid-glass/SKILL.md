---
name: swiftui-liquid-glass
description: >
  Builds iOS 26 Liquid Glass interfaces using glassEffect modifier,
  GlassEffectContainer, interactive glass, and version-gating patterns
  with fallbacks for older iOS versions. Covers design principles,
  when to use vs when NOT to, migration from flat/dark designs, and
  compatibility wrappers. Use when building iOS 26 UI, adopting Liquid
  Glass, upgrading existing apps to the new design language, or when
  user mentions liquid glass, glassEffect, iOS 26 design, or translucent.
---

# SwiftUI Liquid Glass

Liquid Glass is Apple's unified design language for iOS 26. It creates
translucent, responsive control surfaces that float above content. Use it
for the navigation/control layer — never for content itself.

---

## 1. Liquid Glass Principles

| Principle | What It Means | Enforcement |
|---|---|---|
| **Hierarchy** | Glass = controls. Content = behind glass. | Only nav bars, toolbars, floating buttons |
| **Harmony** | Consistent glass treatment across the app | Same style parameter everywhere |
| **Fluidity** | Glass morphs and responds to touch and light | Use `.interactive()` on actionable elements |

### When to Use Liquid Glass

```
Should this element use Liquid Glass?
│
├── Navigation bar, tab bar, toolbar?
│   └── YES — system applies it automatically in iOS 26
│
├── Floating action button or control overlay?
│   └── YES — .glassEffect(.regular)
│
├── Card or content container?
│   └── NO — glass on content creates visual noise
│
├── Media player controls over video?
│   └── YES — .glassEffect(.clear) for minimal obstruction
│
├── List rows, table cells?
│   └── NO — never apply glass to repeating content
│
└── Full-screen background?
    └── NO — glass needs content behind it to refract
```

---

## 2. Core API

### `.glassEffect()` Modifier

```swift
// ✅ Standard glass for floating controls
Button("Share") {
    shareItem()
}
.padding(.horizontal, 20)
.padding(.vertical, 12)
.glassEffect(.regular, in: .capsule)

// ✅ Clear glass for media overlays
HStack {
    Button(action: togglePlay) {
        Image(systemName: isPlaying ? "pause.fill" : "play.fill")
    }
    Slider(value: $progress)
}
.padding()
.glassEffect(.clear, in: .rect(cornerRadius: 16))
```

### Style Variants

| Style | Visual | Use For |
|---|---|---|
| `.regular` | Standard translucent glass with blur | Navigation, toolbars, floating controls |
| `.clear` | Minimal glass, more transparent | Controls over media, photos, maps |

### Shape Parameter

The shape defines the glass boundary. Use standard SwiftUI shapes:

```swift
.glassEffect(.regular, in: .capsule)           // Pill shape
.glassEffect(.regular, in: .rect(cornerRadius: 12))  // Rounded rect
.glassEffect(.regular, in: .circle)            // Circular
```

---

## 3. Interactive Glass

The `.interactive()` modifier makes glass elements respond to touch
with physical behaviors (scale, bounce, shimmer).

```swift
// ✅ Interactive floating action button
Button(action: createNew) {
    Image(systemName: "plus")
        .font(.title2)
        .frame(width: 56, height: 56)
}
.glassEffect(.regular, in: .circle)
.interactive()  // Responds to touch with spring physics
```

### When to Use `.interactive()`

- Floating action buttons
- Toolbar items that benefit from tactile feedback
- Control overlays on media

### When NOT to Use

- Navigation bars (system handles this)
- Static informational overlays
- Elements that are already inside a `GlassEffectContainer`

---

## 4. GlassEffectContainer

Groups multiple glass elements so the system can:
- Blend overlapping glass shapes intelligently
- Ensure consistent blur and lighting across the group
- Manage smooth morphing transitions between states

```swift
// ✅ Grouped glass controls
GlassEffectContainer {
    HStack(spacing: 16) {
        ForEach(tabItems) { tab in
            Button(action: { selectedTab = tab }) {
                VStack(spacing: 4) {
                    Image(systemName: tab.icon)
                    Text(tab.title)
                        .font(.caption2)
                }
                .frame(width: 64, height: 48)
            }
            .glassEffect(
                selectedTab == tab ? .regular : .clear,
                in: .rect(cornerRadius: 12)
            )
        }
    }
    .padding(8)
}
```

### Container Rules

- Wrap related glass elements in one `GlassEffectContainer`
- The container manages shared blur — don't set blur manually
- Use for custom tab bars, floating toolbars, segmented controls

---

## 5. Version-Gating Pattern

Liquid Glass APIs require iOS 26+. For apps supporting older versions,
wrap all glass usage with availability checks.

```swift
// ✅ REQUIRED — Version-gated glass with fallback
struct AdaptiveGlassButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(title, action: action)
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .modifier(GlassModifier())
    }
}

struct GlassModifier: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOS 26, *) {
            content
                .glassEffect(.regular, in: .capsule)
        } else {
            content
                .background(.ultraThinMaterial, in: .capsule)
        }
    }
}
```

### Centralized Glass Wrapper

```swift
// ✅ Create a single reusable wrapper
extension View {
    func adaptiveGlass(
        in shape: some Shape = .rect(cornerRadius: 12)
    ) -> some View {
        modifier(AdaptiveGlassModifier(shape: shape))
    }
}

struct AdaptiveGlassModifier<S: Shape>: ViewModifier {
    let shape: S

    func body(content: Content) -> some View {
        if #available(iOS 26, *) {
            content.glassEffect(.regular, in: shape)
        } else {
            content.background(.ultraThinMaterial, in: shape)
        }
    }
}

// Usage — works on any iOS version
Text("Hello")
    .padding()
    .adaptiveGlass(in: .capsule)
```

---

## 6. Migration Checklist

When upgrading an existing app to Liquid Glass:

### Phase 1: System Surfaces (Free)
iOS 26 automatically applies Liquid Glass to:
- Navigation bars
- Tab bars
- Toolbars
- Search bars

Verify these look correct with your color scheme. You may need:
```swift
.scrollContentBackground(.hidden)       // If custom list backgrounds
.containerBackground(.clear, for: .navigation)  // If custom nav styling
```

### Phase 2: Custom Controls
Convert custom floating controls:
```swift
// Before (flat dark style)
.background(Color.black.opacity(0.8))
.cornerRadius(12)

// After (Liquid Glass)
.glassEffect(.regular, in: .rect(cornerRadius: 12))
```

### Phase 3: Audit & Remove
- Remove hardcoded `backdrop-filter` or `.blur()` on control surfaces
- Remove manual `Color.black.opacity(X)` backgrounds on controls
- Keep solid backgrounds for content areas (cards, list rows)

---

## NEVER

- **NEVER** apply `.glassEffect` to content areas (lists, cards, table cells)
- **NEVER** stack multiple glass layers on top of each other
- **NEVER** use glass without content behind it — glass needs something to refract
- **NEVER** apply glass to full-screen backgrounds
- **NEVER** use `.glassEffect` without version-gating if supporting iOS < 26
- **NEVER** manually set blur on elements inside a `GlassEffectContainer`
- **NEVER** combine `.glassEffect` with `.background(.ultraThinMaterial)` — pick one

---

## Pre-Completion Checklist

- [ ] Glass used only on control/navigation layer, not content
- [ ] Version-gating with `#available(iOS 26, *)` on all glass usage
- [ ] Fallback to `.ultraThinMaterial` for iOS < 26
- [ ] `GlassEffectContainer` wraps grouped glass elements
- [ ] `.interactive()` on actionable floating elements
- [ ] No stacked glass layers
- [ ] System surfaces (nav bar, tab bar) verified with custom colors
- [ ] Centralized glass wrapper created (not scattered inline checks)

---

## Related Skills

- `swiftui-view-building` — View composition patterns
- `swiftui-performance-auditing` — Glass rendering performance
- `native-store-compliance` — iOS 26 SDK requirement
- `experience-designing` — Design token system integration
