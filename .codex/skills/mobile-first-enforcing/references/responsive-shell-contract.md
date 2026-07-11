# Responsive Shell Contract Pattern

Captured from GrazzHopper Landing shell wave (2026-06-08). A reusable architecture for apps where desktop and mobile feel like two different platforms because viewport, safe-area, topbar, bottom-nav, and padding values are scattered and inconsistent.

## Problem

Three disconnected token systems (Slater CSS vars, globals.css hardcoded hex, Tailwind config custom colors), mismatched breakpoints (991/767/479px vs 1024/768/640px), `min-h-screen`/`100vh` hardcoded everywhere, no safe-area inset handling, mobile-last approach.

## Solution: Single Source of Truth Shell

### 1. `route-shells.css` — The contract file

One CSS file owns all shell spacing and viewport tokens:

```css
/* Viewport height — replaces all min-h-screen / 100vh */
--gh-shell-viewport-height: 100dvh;

/* Mobile chrome heights */
--gh-mobile-topbar-height: 52px;
--gh-mobile-bottom-nav-height: 76px;

/* Shell padding tiers */
--gh-shell-pad-inline: 1rem;    /* mobile 16px */
--gh-shell-pad-block: 1.5rem;   /* mobile 24px */

@media (min-width: 48rem) {
  --gh-shell-pad-inline: 2rem;  /* tablet 32px */
  --gh-shell-pad-block: 2rem;
}
@media (min-width: 64rem) {
  --gh-shell-pad-inline: 2rem;  /* desktop 32px */
  --gh-shell-pad-block: 2rem;
}

/* Safe-area proxies */
--gh-safe-top: env(safe-area-inset-top, 0px);
--gh-safe-bottom: env(safe-area-inset-bottom, 0px);
```

### 2. Route shell utility classes

```css
.gh-route-shell { /* base shell — applies dvh, flex col */ }
.gh-route-shell__fill { /* flex-1 fill for content area */ }
.gh-route-shell__section { /* section with canonical padding */ }
.gh-route-shell__content--flow { /* 42rem max centered flow content */ }
.gh-route-shell__content--wide { /* wider content column */ }
.gh-route-shell__viewport--page { /* full viewport page wrapper */ }
```

### 3. Component adoption pattern

Components reference tokens, not hardcoded values:

```tsx
// Before (scattered):
<div className="min-h-screen">
  <nav style={{ height: '52px' }}>

// After (token-driven):
<div className="gh-route-shell__viewport--page">
  <nav style={{ height: 'var(--gh-mobile-topbar-height)' }}>
```

### 4. Key rules

- All breakpoints use `min-width` (mobile-first), canonicalized to rem: `48rem` (768px), `64rem` (1024px)
- `100dvh` replaces all `100vh` — never use `vh` units
- Safe-area insets consumed via `--gh-safe-*` proxies, never direct `env()` in components
- Touch targets ≥44px enforced via `--gh-touch-target-min`
- Components never hardcode height, padding, or viewport values — reference shell tokens

### 5. Verification checklist

- [ ] Zero `min-h-screen` or `100vh` in touched files
- [ ] Zero direct `env(safe-area-inset-*)` in components (use proxies)
- [ ] All breakpoints are `min-width` with rem values
- [ ] Touch targets ≥44px
- [ ] `prefers-reduced-motion` present on animation rules
- [ ] Mobile viewport at 390×844 renders correct padding (topbar 52px, bottom nav 76px, sides 16px)
- [ ] Desktop viewport at 1280×900 renders 32px padding all sides

## When to use this pattern

- App has `min-h-screen` / `100vh` scattered across 10+ files
- Desktop and mobile feel like two different platforms
- Breakpoints are inconsistent (some max-width, some min-width, mixed px/rem)
- Safe-area handling is missing or duplicated
- Touch targets are undersized on mobile
- No single file owns the responsive shell contract
