---
name: mobile-first-enforcing
description: >
  Enforces mobile-first development for PWA web apps and React Native Expo
  projects. Assesses the codebase to determine platform, then applies the
  correct responsive, performance, and interaction rules. Use when building
  responsive layouts, fixing mobile bugs, optimizing mobile performance,
  or when user mentions mobile, responsive, touch, viewport, or PWA.
---

# Mobile-First Enforcing

## Responsive Parity Remediation (2026)

When desktop and mobile render like "two different platforms", the root causes are almost always:

- Hardcoded pixel heights (`h-[400px]`, `min-h-[500px]`) that create fixed blocks that do not scale
- Breakpoint cascades (`min-h-[400px] sm:min-h-[450px] md:min-h-[480px] lg:min-h-[500px]`) that JUMP at breakpoints instead of flowing
- `min-h-screen` / `h-screen` using `vh` which does not account for mobile browser chrome
- `@media (max-width: ...)` desktop-first overrides that fight mobile-first architecture
- No container queries — components only respond to viewport, not their container

### Fix Pattern: Replace with fluid clamp() + dvh

Section sizing tiers:

- Small sections (<400px): `clamp(200px, 30dvh, 400px)`
- Medium sections (400-600px): `clamp(300px, 50dvh, 600px)`
- Large sections (>600px): `clamp(400px, 65dvh, 700px)`
- Map or interactive: `clamp(300px, 48dvh, 520px)`
- Full sections: `clamp(340px, 50dvh, 550px)`

Replace multi-breakpoint cascades with a SINGLE clamp() value. The dvh unit naturally gives mobile less height and desktop more — no breakpoints needed.

### Bulk Sweep: min-h-screen to min-h-dvh

    find . -name '*.tsx' -not -path './node_modules/*' -not -path './.next/*' -exec sed -i '' 's/min-h-screen/min-h-dvh/g' {} +
    find . -name '*.tsx' -not -path './node_modules/*' -not -path './.next/*' -exec sed -i '' 's/h-screen/h-dvh/g' {} +

dvh is a superset of vh that accounts for dynamic browser chrome. All modern browsers support it (Safari 15.4+, Chrome 108+, Firefox 94+).

### Container Query Utilities (add to shared CSS)

    .gh-container { container-type: inline-size; }
    .gh-container--card { container-type: inline-size; container-name: card; }
    .gh-container--panel { container-type: inline-size; container-name: panel; }

Components use `@container panel (min-width: 720px)` for layout switches based on their own width, not viewport.

### See Also

- references/responsive-parity-checklist.md — full audit checklist and verification commands# Mobile-First Enforcing

## Step 0: Assess the Codebase (DO THIS FIRST)

> **Reference:** `references/responsive-shell-contract.md` — Real-world shell contract pattern (GrazzHopper Landing). One CSS file owns all viewport, safe-area, topbar, bottom-nav, and padding tokens. Components reference tokens, never hardcode values. Use when desktop and mobile feel like two different platforms.

Before applying any rules, determine what you're working with.

### Detection Procedure

1. Read `package.json` at the project root
2. Check for platform indicators:

```
Has "react-native" or "expo" in dependencies?
├── YES → REACT NATIVE PATH (Section 2)
│   ├── Check for expo-router → Expo Router navigation
│   ├── Check for @react-navigation → Stack/Tab navigation
│   └── Check app.json/app.config.js for build target
│
├── NO → check for next.config, vite.config, or index.html
│   ├── Has next.config → NEXT.JS PWA PATH (Section 1)
│   ├── Has vite.config → VITE PWA PATH (Section 1)
│   └── Has index.html only → STATIC PWA PATH (Section 1)
│
└── UNCLEAR → Ask the user before proceeding
```

3. Scan existing CSS/styles for patterns:
   - Look for existing breakpoint variables or tokens
   - Check if a design system (tokens.css, theme.ts) exists
   - Adopt existing conventions — do not override them

---

## Section 1: PWA / Web Path

Apply these rules when the project is a web app (Next.js, Vite, static).

### 1.1 Responsive Architecture

Base styles = mobile. No media query needed. Enhance upward with `min-width`.

**Standard breakpoints** (adopt project's existing scale if one exists):

| Token | px | Targets |
|-------|-----|---------|
| Base | 0–639 | Phones portrait |
| `sm` | 640 | Large phones landscape |
| `md` | 768 | Tablets portrait |
| `lg` | 1024 | Tablets landscape / laptops |
| `xl` | 1280 | Desktops |
| `2xl` | 1536 | Large displays |

**Container queries for component-level responsiveness:**

```css
.card-wrapper { container-type: inline-size; container-name: card; }

.card { display: flex; flex-direction: column; }

@container card (min-width: 400px) {
  .card { flex-direction: row; }
}
```

Use container queries for components. Use media queries for page layout.

**Fluid sizing with `clamp()`** — eliminates breakpoint jumps:

```css
font-size: clamp(1rem, 0.5rem + 2vw, 2rem);
padding: clamp(1rem, 3vw, 3rem);
```

### 1.2 Viewport

- Use `dvh` not `vh` — dynamic viewport respects mobile browser chrome
- Add `viewport-fit=cover` to meta tag for safe area insets
- Set safe area CSS variables:

```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
```

### 1.3 Touch & Interaction

- All tap targets ≥ 44×44px with ≥ 8px spacing between them
- Never rely on hover for functionality — hover enhances, tap works
- Input `font-size` must be ≥ 16px (prevents iOS auto-zoom)
- Use correct `inputmode`: `email`, `tel`, `numeric`, `url`, `search`

### 1.4 Performance Budgets

| Metric | Target | Why |
|--------|--------|-----|
| FCP | < 1.8s | Google "good" threshold |
| INP | ≤ 200ms | Core Web Vital (replaced FID 2024) |
| CLS | < 0.1 | Layout jumps = accidental taps |
| JS bundle | < 100KB gzip | Mobile parses 3-5x slower |
| Images | AVIF first, WebP fallback | AVIF is 20-30% smaller than WebP |

**INP optimization** — break long tasks, use Web Workers for heavy computation, debounce high-frequency handlers.

**Images** — always set explicit `width`/`height` to prevent CLS. Use `fetchpriority="high"` on LCP image. Use `loading="lazy"` on everything else.

**Next.js projects**: use `next/image` with `sizes` prop. Do not use raw `<img>`.

### 1.5 PWA Configuration

For installable PWA, read `references/PWA-CONFIG.md` for manifest, service worker, and offline patterns.

### 1.6 Navigation

- 2-5 primary destinations → bottom tab bar on mobile, hide on desktop at `md`
- Bottom nav needs `padding-bottom: calc(var(--safe-bottom) + 8px)`
- Page content needs `padding-bottom: 80px` on mobile to clear nav

### 1.7 Horizontal Overflow Prevention

```css
html, body { overflow-x: hidden; width: 100%; }
img, video, iframe, table, pre { max-width: 100%; }
```

After changes, verify no horizontal scroll from 320px to 1536px.

---

## Section 2: React Native / Expo Path

Apply these rules when the project uses React Native or Expo.

> [!IMPORTANT]
> CSS media queries, `dvh`, `clamp()`, container queries — NONE of these exist in React Native. Do not apply web CSS rules to RN projects.

### 2.1 Responsive Layout in RN

Use `Dimensions`, `useWindowDimensions`, or percentage-based `flex` layouts:

```tsx
import { useWindowDimensions } from 'react-native';

function AdaptiveGrid() {
  const { width } = useWindowDimensions();
  const columns = width < 768 ? 2 : 4;

  return (
    <FlatList
      numColumns={columns}
      key={columns} // force re-render on column change
      data={items}
      renderItem={renderItem}
    />
  );
}
```

For responsive values, use a helper:

```tsx
function responsive<T>(phone: T, tablet: T): T {
  const { width } = useWindowDimensions();
  return width < 768 ? phone : tablet;
}

// Usage
const fontSize = responsive(16, 20);
const padding = responsive(12, 24);
```

### 2.2 Touch Targets in RN

- All `TouchableOpacity` / `Pressable` → `minHeight: 44, minWidth: 44`
- Use `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}` for small visual elements
- For icon buttons, wrap in `Pressable` with 44px dimensions

### 2.3 List Performance

```tsx
// ✅ FlatList for any list > 20 items
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>

// ❌ Never ScrollView + .map() for dynamic lists
```

### 2.4 Platform-Specific Code

```tsx
import { Platform } from 'react-native';

// Simple values
const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  android: { elevation: 4 },
});

// For significant differences, use platform files:
// Component.ios.tsx / Component.android.tsx
```

### 2.5 Safe Areas in RN

```tsx
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Wrap app root in SafeAreaProvider
// Use SafeAreaView for full-screen views
// Use useSafeAreaInsets() for custom padding

function BottomBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingBottom: insets.bottom + 8 }}>
      {/* nav content */}
    </View>
  );
}
```

### 2.6 Typography in RN

```tsx
const typography = {
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
};

// Body text minimum: 14px. Anything smaller is unreadable on mobile.
// Input text: 16px minimum (same iOS zoom issue applies in WebView).
```

### 2.7 Gesture Handling

Use `react-native-gesture-handler` for complex gestures, not raw `PanResponder`:

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const swipe = Gesture.Pan()
  .onEnd((e) => {
    if (e.translationX < -100) dismissCard();
  });
```

Every gesture must have a visible button alternative.

### 2.8 Secure Storage

```tsx
// ✅ Expo SecureStore for tokens and secrets
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('token', authToken);

// ❌ NEVER AsyncStorage for sensitive data
// AsyncStorage is plaintext — compromised on rooted devices
```

For full OWASP and store compliance, read `references/MOBILE-SECURITY.md` and `references/APP-STORE-COMPLIANCE.md`.

---

## NEVER (Both Platforms)

- NEVER apply web CSS rules to React Native projects
- NEVER apply RN StyleSheet patterns to web projects
- NEVER make tap targets < 44×44
- NEVER rely on hover for functionality
- NEVER use `100vh` on mobile web — use `100dvh`
- NEVER use `font-size` < 16px on web inputs (iOS zoom)
- NEVER use `ScrollView` + `.map()` for dynamic RN lists — use `FlatList`
- NEVER store tokens in localStorage (web) or AsyncStorage (RN)
- NEVER skip project detection — wrong platform rules break everything

---

### Pitfall: `min-h-screen` Epidemic

`min-h-screen` compiles to `min-height: 100vh`. On mobile Safari with the dynamic
URL bar, `100vh` includes the toolbar area — content overflows behind the browser
chrome. This is the #1 cause of "mobile and desktop look like two different
platforms."

**Detection:**
```bash
grep -rn 'min-h-screen' app/ components/ --include='*.tsx' | grep -v node_modules
```

**Fix patterns:**
- Full-page shells → `min-h-dvh` (Tailwind v4) or `min-height: var(--app-height)` from route-shells
- Content areas → remove fixed heights entirely; let content drive height
- Cards/sections → `min-h-[clamp(280px,42dvh,460px)]` or `container queries`

**Never** batch-replace without context. Some `min-h-screen` instances are
intentional (loading states, error boundaries that should fill the viewport).

---

### Pitfall: Hardcoded Dimension Cascading

Avoid chained breakpoint overrides with different hardcoded heights:

```css
/* ❌ WRONG — 4 different heights, breakpoint jumps, no fluidity */
min-h-[400px] sm:min-h-[450px] md:min-h-[480px] lg:min-h-[500px]

/* ✅ RIGHT — fluid sizing, zero breakpoint jumps */
min-h-[clamp(400px,10vw+300px,500px)]
```

Every hardcoded dimension in a component file is a token violation AND a
responsive consistency violation. Use `clamp()` for any dimension that varies
by viewport.

---

## Validation

After applying mobile rules, verify your work:

### Web / PWA
1. Check for `max-width` media queries: `grep -r "max-width" src/ --include="*.css" --include="*.scss"`
2. Check for `100vh` usage: `grep -r "100vh" src/ --include="*.css" --include="*.scss"`
3. Check for `min-h-screen` epidemic: `grep -r "min-h-screen" src/ --include="*.tsx" | wc -l`
4. Check for small tap targets: scan for buttons/links with padding < 12px
5. Check input font sizes: `grep -r "font-size" src/ --include="*.css" | grep -v "16px"`
6. Check for hardcoded dimension cascades: `grep -rn 'h-\[.*px\].*sm:h-\[' src/ --include='*.tsx'`
7. Verify no horizontal scroll at 320px width

### React Native
1. Check for ScrollView + map: `grep -rn "ScrollView" src/ --include="*.tsx" | head -20` — then verify none use `.map()` for lists
2. Check touch target sizes: scan `Pressable`/`TouchableOpacity` for `minHeight`/`minWidth`
3. Verify `SafeAreaView` or `useSafeAreaInsets` is used on full-screen views
4. Check for AsyncStorage misuse: `grep -r "AsyncStorage" src/ --include="*.ts" --include="*.tsx"` — should not store tokens

---

## References (load on-demand)

- `references/APP-STORE-COMPLIANCE.md` — Apple/Google submission checklists, rejection reasons, privacy
- `references/MOBILE-SECURITY.md` — OWASP Top 10, secure storage patterns, SSL pinning
- `references/PWA-CONFIG.md` — Manifest, service worker, offline strategy
- `references/RN-PERFORMANCE.md` — Hermes, re-render debugging, bridge optimization
