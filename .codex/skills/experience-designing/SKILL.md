---
name: experience-designing
description: >
  Establishes and enforces design token architecture so that a single change
  cascades structurally across the entire project. Covers color, typography,
  spacing, shadow, motion, and z-index tokens with dark mode support.
  Use when building a design system, creating tokens.css, reviewing component
  styling for raw values, switching fonts or color palettes, or when user
  mentions design tokens, design system, theming, or brand consistency.
---

## 2026 Fluid Token Patterns

### Container Queries (baseline 2025+)

Container queries let components respond to their own width, not just the viewport. Add container utility tokens to the design system:

    --gh-container-inline: container-type inline-size;
    --gh-container-card: container-type inline-size; container-name card;
    --gh-container-panel: container-type inline-size; container-name panel;

Components switch layout with `@container panel (min-width: 720px)` instead of viewport media queries. This means the same component adapts correctly whether it fills the full page or sits in a sidebar.

### Fluid Sizing with clamp()

Replace breakpoint-cascaded dimensions with single clamp() values:

    --gh-section-sm: clamp(200px, 30dvh, 400px);
    --gh-section-md: clamp(300px, 50dvh, 600px);
    --gh-section-lg: clamp(400px, 65dvh, 700px);

Typography:

    --gh-text-hero: clamp(2rem, 5vw, 4.5rem);
    --gh-text-sub: clamp(1rem, 1.2vw, 1.5rem);

The dvh unit accounts for mobile browser chrome — use it instead of vh everywhere.

### Pitfall: max-width content vs max-width breakpoints

Content `max-width` for readability (e.g., `max-width: 640px` on a prose column) is correct. The anti-pattern is `@media (max-width: 640px)` — always use `@media (min-width: 641px)` instead.

# Experience Designing Skill

Establish and enforce a design token architecture where every color, spacing
value, font size, radius, and shadow is a token. Raw values are technical debt.

---

## ⛔ STOP GATE — Comprehension Check

DO NOT proceed without answering:

1. What is the project's current design state? (new build, existing, redesign)
2. Does a `tokens.css` or equivalent design token file already exist?
3. Which platform is this for? (web, iOS, Android, cross-platform)

If a token file exists, read it first. If not, create one.

---

## Design Token Architecture

### The Token Cascade

```
tokens.css → components.css → pages/layouts → screens
     ↓              ↓                ↓
  Single source   All components    All pages
  of truth        reference tokens  reference components
```

**Hard rule:** No component file contains a raw hex color, raw pixel font size,
or raw spacing value. Everything references a token.

### Core Token Template

```css
:root {
  /* ═══ COLORS ═══ */
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-primary-subtle: rgba(99, 102, 241, 0.1);
  --color-secondary: #8b5cf6;
  --color-accent: #f59e0b;

  --color-surface: #ffffff;
  --color-surface-elevated: #f8fafc;
  --color-surface-overlay: rgba(0, 0, 0, 0.5);

  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-tertiary: #94a3b8;
  --color-text-inverse: #ffffff;

  --color-border: #e2e8f0;
  --color-border-focus: var(--color-primary);

  --color-error: #ef4444;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;

  /* ═══ TYPOGRAPHY ═══ */
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.563rem;
  --text-2xl: 1.953rem;
  --text-3xl: 2.441rem;
  --text-4xl: 3.052rem;
  --text-display: clamp(3rem, 5vw + 1rem, 5rem);

  /* ═══ SPACING (4px base grid) ═══ */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;

  /* ═══ BORDERS & RADII ═══ */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* ═══ SHADOWS ═══ */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 50px rgba(0, 0, 0, 0.15);

  /* ═══ MOTION ═══ */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);

  /* ═══ Z-INDEX ═══ */
  --z-dropdown: 50;
  --z-modal: 100;
  --z-toast: 150;
  --z-tooltip: 200;
}
```

### Dark Mode as Token Swap

Dark mode is NOT color inversion — it is a separate token set:

```css
[data-theme="dark"], .dark {
  --color-primary: #818cf8;
  --color-surface: #0f172a;
  --color-surface-elevated: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.5);
}
```

---

## Token Enforcement Directives

### Scan for Raw Values

Run this to find token violations:

```bash
grep -rn "px\|#[0-9a-fA-F]\{3,8\}" src/ --include="*.css" --include="*.tsx" --include="*.ts" | grep -v "tokens\|variables\|--" | grep -v "node_modules"
```

If any raw hex color, pixel font size, or pixel spacing value appears in a
component file, flag it as 🔴 TECHNICAL DEBT and replace with a token reference.

### Correct vs Incorrect

```css
/* ❌ WRONG — raw values create debt */
.card {
  padding: 24px;
  border-radius: 12px;
  color: #333;
  font-size: 14px;
}

/* ✅ RIGHT — token references cascade */
.card {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
}
```

---

## Structural Change Protocol

### Font Change

1. Update `--font-heading` or `--font-body` in tokens.css
2. Verify font is loaded (Google Fonts link, @font-face, or fontsource import)
3. Check all heading components render correctly
4. Check mobile rendering (different font metrics affect line height)
5. Run accessibility check (font readable at all sizes?)

### Color Change

1. Update the semantic token in tokens.css
2. Verify contrast ratios pass WCAG AA (4.5:1 text, 3:1 UI)
3. Check both light AND dark mode tokens
4. Review hover/focus/active states still look correct
5. Check error/success/warning colors still contrast with new palette

### Spacing Change

1. Update the spacing token in tokens.css
2. Check at mobile, tablet, and desktop breakpoints
3. Verify touch targets remain ≥ 44×44px
4. Confirm 4px grid consistency

---

## 2026 Design Patterns

### Liquid Glass

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 0 80px rgba(255, 255, 255, 0.05);
}
```

### Container Queries

```css
.card-container { container-type: inline-size; }

@container (min-width: 400px) {
  .card { flex-direction: row; }
}
@container (max-width: 399px) {
  .card { flex-direction: column; }
}
```

### Variable Fonts

```css
@font-face {
  font-family: 'Inter Variable';
  src: url('/fonts/InterVariable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
```

### Prefers Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
  }
}
```

---

## Elevation Framework

| Level | Name | Requirements |
|-------|------|-------------|
| 1 | Functional | Works, uses tokens, no raw values |
| 2 | Polished | Consistent spacing, coherent palette, proper hierarchy |
| 3 | Delightful | Micro-interactions, smooth transitions, loading skeletons |
| 4 | Exceptional | Unique identity, choreographed animations, surprise details |

---

## The Screenshot Test

Before approving any design, ask:

1. Could I remove the logo and still know it is this brand?
2. Is there anything here I have not seen before?
3. Would someone screenshot this to share it?
4. Does this deserve attention in a feed of content?

If "no" to any, the design needs more work.

---

## ⛔ STOP GATE — Completion

DO NOT mark design system as complete without:

1. Token file exists with all categories (colors, type, spacing, shadows, motion)
2. Dark mode tokens defined
3. Zero raw hex/pixel values in component files (run scan above)
4. Token-to-component mapping table produced
5. Responsive tokens verified at 320px, 768px, 1280px

---

## Output Format

When generating a design system spec, produce:

1. **Token File** — Complete tokens.css with all categories
2. **Dark Mode Tokens** — Dark mode overrides
3. **Component Token Mapping** — Table mapping components to tokens used
4. **Font Loading** — Google Fonts link or @font-face declarations
5. **Cascade Verification** — Confirm zero raw values in component files

---

## Resources

| Need | Source |
|------|--------|
| Hero sections | supahero.io, godly.website |
| Real product patterns | mobbin.com |
| Award-winning | awwwards.com |
| Dark mode reference | darkmodedesign.com |
| Icons (premium) | Solar (Iconify), Phosphor |
| Icons (clean) | Lucide, Heroicons |
| Color tools | Realtime Colors, Huemint, Coolors |
