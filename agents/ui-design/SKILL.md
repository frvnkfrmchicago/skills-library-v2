---
name: ui-design
description: UI Design patterns for AI engineers. Component design, layout systems, visual hierarchy, design-to-code.
last_updated: 2026-03
owner: Frank
---

# UI Design

Design systems for engineers. Build beautiful interfaces systematically.

> **See also:** `agents/design-system/SKILL.md`, `agents/tailwind/SKILL.md`

---

## Context Questions

Before designing UI:

1. **What's the product type?** — Dashboard, marketing, app, tool
2. **What's the brand personality?** — Corporate, playful, minimal, bold
3. **Who's the audience?** — Consumers, enterprise, developers
4. **What's the platform?** — Web, mobile, both
5. **What's the design maturity?** — Starting fresh, evolving existing

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Density** | Spacious (marketing) ←→ Dense (dashboards) |
| **Personality** | Conservative ←→ Expressive |
| **Color** | Monochrome ←→ Vibrant |
| **Motion** | Static ←→ Highly animated |
| **Typography** | Traditional ←→ Experimental |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Marketing site | Spacious, expressive, vibrant |
| SaaS dashboard | Dense, functional, restrained |
| Consumer app | Playful, animated, accessible |
| Enterprise tool | Professional, consistent, accessible |
| Developer tool | Minimal, fast, keyboard-first |
| E-commerce | Photography-led, clear CTAs |

---

## TL;DR

| Need | Approach |
|------|----------|
| **Quick start** | Use existing design system |
| **Custom look** | Define tokens first |
| **Component library** | shadcn/ui + customization |
| **Responsive** | Mobile-first, breakpoints |
| **Dark mode** | CSS variables, system preference |

---

## Part 1: Visual Hierarchy

### The 5 Key Principles

```markdown
1. SIZE — Larger = more important
2. COLOR — Contrast draws attention
3. SPACING — Proximity = relationship
4. WEIGHT — Bold text = emphasis
5. POSITION — Top/left = first seen
```

### Applying Hierarchy

```css
/* Primary action */
.btn-primary {
  font-size: 1rem;
  font-weight: 600;
  background: var(--color-primary);
  padding: 0.75rem 1.5rem;
}

/* Secondary action */
.btn-secondary {
  font-size: 0.875rem;
  font-weight: 500;
  background: transparent;
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
}

/* Tertiary action */
.btn-tertiary {
  font-size: 0.875rem;
  font-weight: 400;
  background: none;
  text-decoration: underline;
}
```

### Typography Scale

```css
:root {
  /* Type scale (1.25 ratio) */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.25rem;    /* 20px */
  --text-xl: 1.563rem;   /* 25px */
  --text-2xl: 1.953rem;  /* 31px */
  --text-3xl: 2.441rem;  /* 39px */
  --text-4xl: 3.052rem;  /* 49px */
}
```

---

## Part 2: Color Systems

### Semantic Colors

```css
:root {
  /* Brand */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  
  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Neutrals (use 10 steps) */
  --color-gray-50: #fafafa;
  --color-gray-100: #f4f4f5;
  --color-gray-200: #e4e4e7;
  --color-gray-300: #d4d4d8;
  --color-gray-400: #a1a1aa;
  --color-gray-500: #71717a;
  --color-gray-600: #52525b;
  --color-gray-700: #3f3f46;
  --color-gray-800: #27272a;
  --color-gray-900: #18181b;
  
  /* Surfaces */
  --color-background: var(--color-gray-50);
  --color-surface: white;
  --color-border: var(--color-gray-200);
  --color-text: var(--color-gray-900);
  --color-text-muted: var(--color-gray-500);
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-gray-900);
    --color-surface: var(--color-gray-800);
    --color-border: var(--color-gray-700);
    --color-text: var(--color-gray-50);
    --color-text-muted: var(--color-gray-400);
  }
}

/* Or with class */
.dark {
  --color-background: var(--color-gray-900);
  /* ... */
}
```

### Contrast Requirements

```markdown
WCAG AA (minimum):
- Normal text: 4.5:1
- Large text (18px+ bold or 24px+): 3:1
- UI components: 3:1

WCAG AAA (enhanced):
- Normal text: 7:1
- Large text: 4.5:1

Tools:
- WebAIM Contrast Checker
- Stark (Figma plugin)
```

---

## Part 3: Spacing System

### 4px Base Unit

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### Component Spacing

```css
/* Card */
.card {
  padding: var(--space-6);
  gap: var(--space-4);
}

/* Section */
.section {
  padding-block: var(--space-16);
  gap: var(--space-8);
}

/* List items */
.list > * + * {
  margin-top: var(--space-2);
}
```

---

## Part 4: Layout Patterns

### Container

```css
.container {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

@media (min-width: 768px) {
  .container {
    padding-inline: var(--space-6);
  }
}
```

### Grid Systems

```css
/* Auto-fit grid */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

/* Fixed columns */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

@media (max-width: 768px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}

/* Asymmetric */
.grid-sidebar {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-8);
}
```

### Flexbox Patterns

```css
/* Space between */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Stack (vertical) */
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Cluster (wrapping) */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
```

---

## Part 5: Component Patterns

### Button States

```css
.btn {
  /* Base */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 150ms ease;
  
  /* Default state */
  background: var(--color-primary);
  color: white;
  
  /* Hover */
  &:hover {
    background: var(--color-primary-hover);
  }
  
  /* Focus */
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  /* Disabled */
  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  
  /* Loading */
  &.loading {
    position: relative;
    color: transparent;
    pointer-events: none;
  }
}
```

### Input States

```css
.input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 150ms, box-shadow 150ms;
  
  &:hover {
    border-color: var(--color-gray-400);
  }
  
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    outline: none;
  }
  
  &.error {
    border-color: var(--color-error);
  }
  
  &:disabled {
    background: var(--color-gray-100);
    cursor: not-allowed;
  }
}
```

### Card Component

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: var(--space-6);
  
  /* Shadow variants */
  &.elevated {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  /* Interactive */
  &.interactive {
    cursor: pointer;
    transition: transform 150ms, box-shadow 150ms;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
  }
}
```

---

## Part 6: Responsive Design

### Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Mobile-first approach */
.feature {
  font-size: 1rem;
  padding: 1rem;
}

@media (min-width: 768px) {
  .feature {
    font-size: 1.25rem;
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .feature {
    font-size: 1.5rem;
    padding: 3rem;
  }
}
```

### Responsive Typography

```css
/* Fluid typography */
.heading {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.1;
}

.body {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
}
```

---

## Part 7: Motion & Animation

### Transition Tokens

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Common Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Usage */
.modal {
  animation: scaleIn var(--duration-normal) var(--ease-out);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Part 8: Design-to-Code Workflow

### From Figma to Code

```markdown
1. Extract tokens first
   - Colors → CSS variables
   - Typography → Type scale
   - Spacing → Spacing scale
   - Shadows → Shadow tokens

2. Build atoms
   - Buttons, inputs, badges
   - Icons, avatars

3. Build molecules
   - Cards, forms, navigation

4. Build organisms
   - Headers, footers, sidebars

5. Compose pages
   - Combine organisms with layout
```

### Figma Dev Mode

```typescript
// Use Figma's CSS output as starting point
const figmaStyles = {
  button: {
    display: 'flex',
    padding: '10px 16px',
    borderRadius: '6px',
    background: '#2563EB',
  }
};

// Then refactor to use your tokens
const button = {
  display: 'flex',
  padding: `${spacing[2]} ${spacing[4]}`,
  borderRadius: radius.md,
  background: colors.primary.DEFAULT,
};
```

---

## Part 9: AI Design Tools

### Design Generation

```markdown
Tools for AI-assisted design:

1. **Galileo AI** — Generate UI from prompts
2. **Uizard** — Screenshot to editable design
3. **Magician (Figma)** — Auto-generate icons and copy
4. **v0.dev** — Generate React components from prompts
5. **Framer AI** — Generate and customize sites
```

### Prompting for Design

```markdown
Good prompt:
"Design a SaaS dashboard card component. Show:
- Metric value (large)
- Comparison to last period (badge)
- Sparkline chart
- Use subtle shadows, rounded corners
- Include hover state"

Bad prompt:
"Make a dashboard"
```

---

## Part 10: Design Review Checklist

### Visual Quality

```markdown
□ Visual hierarchy clear (can scan in 3 seconds)
□ Consistent spacing throughout
□ Color contrast meets WCAG AA
□ Typography readable at all sizes
□ Interactive states defined (hover, focus, active, disabled)
□ Loading and empty states designed
□ Error states communicative
```

### Technical Quality

```markdown
□ Responsive at all breakpoints
□ Dark mode supported
□ Reduced motion respected
□ Touch targets 44px minimum
□ Focus indicators visible
□ Keyboard navigation works
□ Screen reader compatible
```

---

## Checklist

- [ ] Design tokens defined (colors, spacing, typography)
- [ ] Component library set up
- [ ] Responsive breakpoints configured
- [ ] Dark mode implemented
- [ ] Motion system defined
- [ ] Accessibility requirements met
- [ ] Design review complete

---

## Resources

- Refactoring UI: https://refactoringui.com
- Tailwind UI: https://tailwindui.com
- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://radix-ui.com
- v0.dev: https://v0.dev

---

## Related Skills

- `agents/design-system/SKILL.md` — Design systems
- `agents/tailwind/SKILL.md` — Tailwind CSS
- `agents/motion/SKILL.md` — Animation
- `agents/a11y/SKILL.md` — Accessibility
