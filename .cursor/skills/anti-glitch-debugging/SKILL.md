---
name: anti-glitch-debugging
description: >
  Diagnoses and fixes slow page loads, layout shifts, animation jank,
  main thread blocking, asset loading issues, and bundle bloat in React,
  Next.js, Vite, and Expo apps. Profiles performance, identifies the
  exact bottleneck, and applies targeted fixes. Use when the app loads
  slow, stutters, flickers, feels broken, drops frames, or when user
  mentions glitch, jank, lag, loading, or white screen.
---

# Anti-Glitch Debugging

Diagnostic specialist that finds and fixes the exact reasons your app loads
slow, stutters, flickers, or feels broken. Does not guess — profiles,
measures, identifies the bottleneck, and fixes it.

---

## STOP — Identify the Symptom First

Before debugging, name the exact problem:

| Symptom | Jump To |
|---------|---------|
| White screen for too long | Phase 1: Initial Load |
| Content pops in late / jumps around | Phase 2: Layout Shift & Hydration |
| Scrolling is choppy / animations stutter | Phase 3: Animation Jank |
| App freezes on interaction | Phase 4: Main Thread Blocking |
| Images load slowly or not at all | Phase 5: Asset Loading |
| Build output is huge | Phase 6: Bundle Bloat |

---

## Phase 1: Initial Load Diagnosis

Run:
```bash
# Lighthouse audit
npx lighthouse http://localhost:3000 --output json --output-path report.json 2>/dev/null
```

Open Chrome DevTools → Network tab → Reload with cache disabled.

Look for:
- Red items = failed requests (broken API, missing file)
- Long blue bars = slow server response (API bottleneck)
- Large files = oversized bundles, unoptimized images
- Waterfall pattern = resources loading sequentially

### Common Slow Load Causes

| Cause | Detect | Fix |
|-------|--------|-----|
| Giant JS bundle | Network shows 500KB+ JS | Code split with `React.lazy()` |
| Unoptimized images | Network shows 2MB+ images | WebP, `loading="lazy"`, set width/height |
| Render-blocking CSS | Coverage shows unused CSS | Split critical CSS, defer rest |
| Slow API on load | Long-waiting API call | Streaming, loading skeleton, cache |
| Too many fonts | 4+ font files loading | Reduce to 2, `font-display: swap`, preload |
| No code splitting | Single JS bundle > 200KB | `React.lazy()` + `Suspense` |

### Fix Pattern

```tsx
// BEFORE — everything loads at once
import HeavyChart from './HeavyChart'

// AFTER — critical content first, heavy stuff lazy
import { lazy, Suspense } from 'react'
const HeavyChart = lazy(() => import('./HeavyChart'))

function Page() {
  return (
    <>
      <Hero /> {/* Renders immediately */}
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart /> {/* Loads after main paint */}
      </Suspense>
    </>
  )
}
```

---

## Phase 2: Layout Shift & Hydration

### CLS Debugging

Run:
```bash
# Images without dimensions
grep -rn "<img\|<Image" src/ --include="*.tsx" 2>/dev/null | grep -v "width\|height\|fill" | head -20

# Font loading
grep -rn "font-display\|@font-face\|next/font" src/ app/ --include="*.css" --include="*.tsx" 2>/dev/null
```

Common CLS causes:
- Images without width/height → browser can't reserve space
- Fonts loading late → text reflows
- Dynamic content injected above existing content

Fix:
```css
img, video {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9; /* prevents layout shift */
}
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}
```

### Hydration Mismatch (React)

Symptoms: content flashes, "Hydration failed" console warning, styles change after initial render.

Run:
```bash
# Date, random, or window usage in server components
grep -rn "new Date()\|Math.random()\|window\.\|document\." src/ app/ --include="*.tsx" 2>/dev/null | grep -v "useEffect\|typeof window"
```

---

## Phase 3: Animation & Rendering Jank

### The 60fps Rule

Smooth = 60fps = 16.67ms per frame. Anything longer = jank.

### Safe Properties (GPU-accelerated, no layout recalculation)
- `transform` (translate, scale, rotate)
- `opacity`
- `filter`

### Expensive Properties (trigger layout recalculation)
- `width`, `height`, `top`, `left`, `margin`, `padding`
- `font-size`, `line-height`, `display`, `position`

Run:
```bash
# Animations using expensive properties
grep -rn "left:\|top:\|width:\|height:\|margin:" src/ --include="*.css" 2>/dev/null | grep "animation\|transition\|@keyframes" | head -20

# GSAP animating layout properties
grep -rn "gsap.to\|gsap.from" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep "left\|top\|width\|height" | head -20

# Scroll listeners on every pixel (should use IntersectionObserver)
grep -rn "addEventListener.*scroll\|onScroll" src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

Fix: Use `transform` and `opacity` instead of layout properties. Use GSAP
`x`, `y`, `scale` instead of `left`, `top`, `width`.

---

## Phase 4: Main Thread Blocking

Run:
```bash
# Large list rendering without virtualization
grep -rn "\.map(" src/ --include="*.tsx" 2>/dev/null | head -20
grep -rn "react-window\|react-virtuoso\|virtualized" src/ --include="*.tsx" 2>/dev/null

# Check for React.memo usage on list items
grep -rn "React.memo\|memo(" src/ --include="*.tsx" 2>/dev/null | wc -l

# DOM node count (Chrome console: document.querySelectorAll('*').length — should be < 1500)
```

| Blocker | Fix |
|---------|-----|
| Massive list rendering | `react-window` or `react-virtuoso` |
| Synchronous data processing | Web Worker or `requestIdleCallback` |
| Unoptimized re-renders | `React.memo()`, `useMemo()`, `useCallback()` |
| Too many DOM nodes | Reduce to < 1,500, virtualize lists |

### React Re-Render Debugging

```tsx
import { Profiler } from 'react'
function onRender(id, phase, actualDuration) {
  if (actualDuration > 16) {
    console.warn(`Slow render: ${id} took ${actualDuration}ms`)
  }
}
<Profiler id="MyComponent" onRender={onRender}>
  <MyComponent />
</Profiler>
```

---

## Phase 5: Asset Loading

Refer to `references/ASSET-LOADING.md` for detailed image, video, and font
loading optimization checklists and commands.

Quick checks:
```bash
# Large images
find src/ public/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | xargs ls -lhS 2>/dev/null | head -10

# Console.log spam
grep -rn "console.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test\|spec" | wc -l
```

---

## Phase 6: Bundle Bloat

Refer to `references/BUNDLE-BLOAT.md` for detailed bundle analysis,
dependency alternatives, and tree shaking verification.

Quick checks:
```bash
# Bundle analysis
npx vite-bundle-visualizer 2>/dev/null || ANALYZE=true npm run build 2>/dev/null

# node_modules size
du -sh node_modules/ 2>/dev/null
```

---

## ⛔ STOP GATE — Diagnosis Complete
DO NOT deliver a fix without:
1. Identifying the specific symptom from the table above
2. Running the relevant diagnostic commands
3. Showing evidence of the bottleneck (file:line or measurement)
4. Verifying the fix resolves the symptom

---

## Output Format

```markdown
## Anti-Glitch Report — [Project/Page]

### Symptom
[What the user reported]

### Diagnosis
[Root cause identified through profiling]

### Bottleneck
| What | Where | Impact |
|------|-------|--------|
| [Bottleneck] | [file:line] | [Xms delay or X frames dropped] |

### Fix Applied
[Code change with before/after]

### Verification
- [ ] Symptom no longer occurs
- [ ] No new performance regressions
- [ ] Lighthouse score maintained or improved
```
