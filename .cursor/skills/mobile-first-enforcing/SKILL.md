---
name: mobile-first-enforcing
description: >
  Enforces mobile-first development standards including responsive architecture
  with min-width breakpoints, 44px touch targets, dynamic viewport units (dvh),
  safe area insets, mobile performance budgets, PWA setup, gesture handling,
  and device testing requirements. Covers App Store and Play Store compliance.
  Use when building responsive layouts, fixing mobile bugs, reviewing touch
  interactions, optimizing mobile performance, or when user mentions mobile,
  responsive, touch, viewport, or PWA.
---

# Mobile-First Enforcing Skill

Build for the smallest screen first, then progressively enhance. Mobile traffic
is 60%+ of global web. Mobile CPUs are 3–5x slower. Touch is imprecise.

---

## Hard Rules

| Principle | Rule | Why |
|-----------|------|-----|
| Build mobile first | `min-width` queries only | Forces essential content prioritization |
| Touch-first | 44px minimum tap targets | Apple HIG + Material Design mandate |
| Viewport | Use `dvh` not `vh` | `vh` breaks with mobile dynamic toolbars |
| Performance | < 3s FCP on 3G | 53% abandon after 3s (Google) |
| Images | Always `srcset` + `sizes` | Mobile doesn't need 4K images |
| Fonts | `font-display: swap` + WOFF2 | Invisible text is unacceptable |
| Testing | Real device required | Chrome DevTools ≠ real phones |

---

## 1. Responsive Architecture

### Breakpoint System — ALWAYS `min-width`

```css
/* Base = mobile. No media query needed. */
.container { padding: 1rem; width: 100%; }

@media (min-width: 640px)  { .container { padding: 1.5rem; } }
@media (min-width: 768px)  { .container { padding: 2rem; max-width: 720px; margin: 0 auto; } }
@media (min-width: 1024px) { .container { padding: 3rem; max-width: 960px; } }
@media (min-width: 1280px) { .container { max-width: 1200px; } }
@media (min-width: 1536px) { .container { max-width: 1400px; } }
```

```css
/* ❌ NEVER — Desktop-first with max-width overrides */
.container { max-width: 1200px; padding: 3rem; }
@media (max-width: 768px) { .container { padding: 1rem; max-width: 100%; } }
```

### Standard Breakpoints

| Token | px | Targets |
|-------|-----|---------|
| Base | 0-639 | All phones portrait |
| `sm` | 640 | Large phones landscape |
| `md` | 768 | Tablets portrait |
| `lg` | 1024 | Tablets landscape / small laptops |
| `xl` | 1280 | Standard desktops |
| `2xl` | 1536 | Large displays |

### Layout Decision Tree

```
Building what?
├── Content page → Single column, max-width 720px, centered
├── Dashboard → Sidebar + content (collapses to bottom nav on mobile)
├── Product grid → CSS Grid: 1→2→3-4 columns
├── Form → Single column, full-width inputs on mobile
└── App → Bottom nav on mobile, side nav on desktop
```

### Container Queries (2026)

```css
.card-wrapper { container-type: inline-size; }

@container (min-width: 400px) { .card { flex-direction: row; } }
@container (max-width: 399px) { .card { flex-direction: column; } }
```

---

## 2. Touch-First Interactions

### Tap Targets — 44×44px MINIMUM

```css
/* ✅ */
.button { min-height: 44px; min-width: 44px; padding: 12px 20px; }
.icon-btn { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }

/* ❌ */
.tiny-button { padding: 4px 8px; font-size: 11px; } /* ~24px tall */
```

Spacing between adjacent targets: ≥ 8px.

### Hover ≠ Functionality

NEVER rely on hover for functionality. Touch has no hover.

```tsx
// ✅ Touch-first, hover-enhanced
<button onClick={handleAction} onMouseEnter={() => setShowPreview(true)}>
  View Details
</button>

// ❌ Hover-only — mobile users never see dropdown
<div onMouseEnter={showDropdown}>Menu</div>
```

### Gestures — Always Provide Button Alternative

| Gesture | Use for | NEVER sole access to |
|---------|---------|---------------------|
| Tap | Primary actions | — |
| Swipe | Dismiss, tab navigation | Delete |
| Long press | Context menu | Critical action |
| Pull down | Refresh | — |

---

## 3. Viewport Management

### Dynamic Viewport Units

```css
/* ✅ Respects mobile browser chrome */
.full-screen { min-height: 100dvh; }

/* ❌ Content goes behind address bar */
.full-screen { height: 100vh; }
```

| Unit | Use when |
|------|----------|
| `dvh` | Full-screen layouts, hero sections |
| `svh` | Need minimum (toolbar visible) |
| `lvh` | Need maximum (toolbar hidden) |
| `vh` | NEVER on mobile |

### Safe Area Insets

```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}
.header { padding-top: calc(var(--safe-top) + 12px); }
.bottom-nav { padding-bottom: calc(var(--safe-bottom) + 8px); }
```

Required meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`

### Prevent Horizontal Overflow

```css
html, body { overflow-x: hidden; width: 100%; }
img, video, iframe, table, pre { max-width: 100%; }
```

---

## 4. Mobile Performance

### Budgets

| Metric | Target | Why |
|--------|--------|-----|
| FCP | < 2.5s on 4G | Core Web Vital |
| TTI | < 3.5s on 4G | User interaction threshold |
| JS bundle | < 100KB gzip | Mobile parses JS 3-5x slower |
| Page weight | < 500KB first load | Mobile data is expensive |
| CLS | < 0.1 | Jumping content = accidental taps |
| Images | < 200KB each, lazy | Biggest bandwidth consumer |

### Images

```tsx
<Image
  src="/hero.jpg" width={800} height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  placeholder="blur" priority alt="Hero"
/>
```

Always set `width`/`height` to prevent layout shift.

### Font Loading

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
}
```

### Code Splitting

```tsx
const Settings = lazy(() => import('./pages/Settings'));
<Suspense fallback={<LoadingSkeleton />}>
  <Route path="/settings" element={<Settings />} />
</Suspense>
```

---

## 5. Mobile Navigation

### Bottom Nav Pattern

```css
.mobile-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  display: flex; justify-content: space-around;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  padding: 8px 0 env(safe-area-inset-bottom, 8px);
  z-index: 100;
}
.mobile-nav a { min-width: 44px; min-height: 44px; }
@media (min-width: 768px) { .mobile-nav { display: none; } }
.page-content { padding-bottom: 80px; }
```

---

## 6. Mobile Forms

```css
/* Font size ≥ 16px prevents iOS auto-zoom */
input, select, textarea {
  font-size: 16px;
  min-height: 44px;
  padding: 12px 16px;
  width: 100%;
}
```

Use correct `inputmode`:
- `email` → @ key visible
- `tel` → phone keypad
- `numeric` → number pad
- `url` → .com key visible

---

## NEVER

- NEVER use `max-width` as primary breakpoints
- NEVER make tap targets < 44×44px
- NEVER rely on hover for functionality
- NEVER use `100vh` on mobile — use `100dvh`
- NEVER load desktop images on mobile
- NEVER use `font-size` < 16px on inputs (iOS zoom)
- NEVER test only Chrome DevTools
- NEVER disable pinch-to-zoom
- NEVER hardcode API keys in client code

---

## ⛔ STOP GATE — Pre-Ship Checklist

Run all checks before shipping:

### UI/UX
- [ ] Base styles work at 320px
- [ ] All tap targets ≥ 44×44px with ≥ 8px spacing
- [ ] No hover-only interactions
- [ ] `dvh` used for full-height layouts
- [ ] Safe area insets handled
- [ ] No horizontal scroll (320px–1536px)

### Performance
- [ ] Images: `srcset` + `sizes`, `loading="lazy"`, explicit dimensions
- [ ] Fonts: `font-display: swap`, WOFF2
- [ ] Input font-size ≥ 16px
- [ ] FCP < 2.5s on throttled 3G
- [ ] CLS < 0.1

### Compliance
- [ ] Privacy policy live and linked
- [ ] Using current SDK versions

See `references/APP-STORE-COMPLIANCE.md` and `references/MOBILE-SECURITY.md`
for full App Store, Play Store, OWASP, and privacy compliance checklists.
