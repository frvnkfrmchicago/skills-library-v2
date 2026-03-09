---
name: component-building
description: >
  Builds interactive UI components with micro-interactions, token enforcement,
  and accessibility. Covers text effects, button animations, card interactions,
  loading states, and design system integration using GSAP, Framer Motion, and
  CSS. Use when building reusable components, adding hover states, implementing
  card interactions, creating loading animations, or when user mentions
  components, buttons, cards, or micro-interactions.
---

# Component Building Skill

Build interactive components that use design tokens, provide micro-interaction
feedback, and respect accessibility constraints.

---

## ⛔ STOP GATE — Token Check

Before writing ANY component CSS or styled-component:

1. Does every value reference a token from `tokens.css`?
2. Are motion values using `--duration-*` and `--ease-*` tokens?
3. Does `prefers-reduced-motion` have a fallback?

If any raw value exists in a component, flag as 🔴 TECHNICAL DEBT.

---

## Component Disciplines

1. **Explore variety** — Always offer 3 different approaches
2. **Check motion** — Reference motion tokens for all animations
3. **Ensure consistency** — All values from design tokens
4. **Performance first** — CSS over JS when possible
5. **Accessibility** — Reduced motion support, no seizure triggers

---

## Text Effect Patterns

### Highlight on Scroll

```tsx
<HighlightText trigger="scroll">Important text</HighlightText>
```

Implementation: Use `IntersectionObserver` to trigger a `background-size`
animation from `0% 100%` to `100% 100%` with a gradient underline.

### Character-by-Character Reveal

```tsx
<TypeWriter text="Hello world" speed={50} />
```

Implementation: Use `setInterval` to reveal characters. Respect
`prefers-reduced-motion` by showing all text immediately.

### Word Flip Animation

```tsx
<FlipText words={["Build", "Ship", "Grow"]} />
```

Implementation: Use Framer Motion `AnimatePresence` to swap words with
exit/enter animations.

---

## Button Patterns

### Magnetic Button

```tsx
<MagneticButton>Click me</MagneticButton>
```

Tracks mouse position relative to button center, applies spring-physics
offset. Resets on `mouseleave`.

### Ripple Effect

```css
.ripple-btn { position: relative; overflow: hidden; }
.ripple-btn::after {
  content: '';
  position: absolute;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  opacity: 1;
}
.ripple-btn:active::after {
  transform: scale(2);
  opacity: 0;
  transition: transform var(--duration-normal) var(--ease-out),
              opacity var(--duration-normal);
}
```

### Loading State

```tsx
<Button loading={isLoading}>
  {isLoading ? <Spinner size={16} /> : 'Save'}
</Button>
```

Disable button during loading. Use skeleton shimmer, not spinners, for
content areas.

---

## Card Interaction Patterns

### 3D Tilt on Hover (Framer Motion)

```tsx
<motion.div
  whileHover={{ rotateX: 5, rotateY: 5, scale: 1.02 }}
  transition={{ type: "spring", stiffness: 300 }}
  style={{ perspective: 1000 }}
>
  <CardContent />
</motion.div>
```

### Expandable Card

```tsx
<motion.div
  layout
  onClick={() => setExpanded(!expanded)}
  transition={{ type: "spring", stiffness: 200, damping: 25 }}
>
  <Preview />
  <AnimatePresence>
    {expanded && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <FullContent />
    </motion.div>}
  </AnimatePresence>
</motion.div>
```

### Parallax Card

```tsx
<div onMouseMove={handleMouseMove} className="parallax-card">
  <div className="layer-bg" style={{ transform: `translate(${x * 0.5}px, ${y * 0.5}px)` }} />
  <div className="layer-mid" style={{ transform: `translate(${x * 1}px, ${y * 1}px)` }} />
  <div className="layer-fg" style={{ transform: `translate(${x * 1.5}px, ${y * 1.5}px)` }} />
</div>
```

---

## Token Enforcement

### Scan Before Shipping

```bash
grep -rn "px\|#[0-9a-fA-F]" src/components/ --include="*.css" --include="*.tsx" | grep -v "var(--" | grep -v "node_modules"
```

Every result is a token violation. Replace with token references:

```css
/* ❌ WRONG */
.card { padding: 24px; border-radius: 12px; color: #333; }

/* ✅ RIGHT */
.card {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
}
```

---

## Accessibility Enforcement

### Reduced Motion — MANDATORY for all components

```css
@media (prefers-reduced-motion: reduce) {
  .animated-component {
    animation: none;
    transition: none;
  }
}
```

### Focus States — MANDATORY for all interactive elements

```css
.btn:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

### ARIA Labels — Check on all non-text interactive elements

```tsx
<button aria-label="Close dialog" onClick={onClose}>
  <XIcon />
</button>
```

---

## ⛔ STOP GATE — Completion

DO NOT mark component complete without:

1. All values reference design tokens (zero raw values)
2. Reduced motion fallback implemented
3. Focus states visible on all interactive elements
4. Component tested at 320px width
5. Touch targets ≥ 44×44px

---

## Output Format

```markdown
## Component: [Name]

### Interaction
- Trigger: [hover / click / scroll / load]
- Animation: [description]
- Duration: [token reference]
- Easing: [token reference]

### Code
[Implementation]

### Reduced Motion Fallback
[What happens with prefers-reduced-motion]

### Token Coverage
[List all tokens used — confirm zero raw values]
```
