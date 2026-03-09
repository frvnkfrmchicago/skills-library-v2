---
name: animation-designing
description: >
  Designs purposeful motion and micro-interactions using GSAP, Framer Motion,
  CSS animations, and React Native Reanimated. Covers micro-interactions,
  page transitions, scroll-triggered animations, loading states, and 3D
  effects with performance and accessibility enforcement. Use when adding
  animations, reviewing motion design, implementing scroll effects, building
  hover states, or when user mentions animation, transitions, motion, or
  micro-interactions.
---

# Animation Designing Skill

Design motion that tells a story. Every animation has purpose — if it does not
add meaning, cut it.

---

## Animation Decision Tree

```
Is it React-based?
├─ Yes → Layout/presence animation?
│   ├─ Yes → Framer Motion (motion/react)
│   └─ No → Complex timeline?
│       ├─ Yes → GSAP
│       └─ No → CSS
├─ React Native?
│   ├─ Yes → Reanimated 3 + Gesture Handler
│   └─ No → continue below
└─ No → Scroll-triggered?
    ├─ Yes → GSAP ScrollTrigger
    └─ No → CSS or GSAP
```

---

## Priority Order

1. **Micro-interactions** — hover, click, focus feedback
2. **Page transitions** — enter/exit choreography
3. **Loading states** — skeletons over spinners
4. **Scroll-triggered** — reveal on scroll
5. **3D effects** — background depth

---

## Motion Token Integration

Reference motion tokens from `tokens.css`:

```css
:root {
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

All animation durations and easings MUST reference these tokens.

---

## Micro-Interaction Patterns

### Buttons

```css
.btn { transition: transform var(--duration-fast) var(--ease-out); }
.btn:hover {
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}
.btn:active { transform: scale(0.98); }
```

### Cards (Framer Motion)

```tsx
<motion.div
  whileHover={{ rotateX: 5, rotateY: 5, scale: 1.02 }}
  transition={{ type: "spring", stiffness: 300 }}
/>
```

### Text Reveals (Framer Motion)

```tsx
<motion.div initial="hidden" animate="visible">
  {text.split("").map((char, i) => (
    <motion.span
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ delay: i * 0.03 }}
    >
      {char}
    </motion.span>
  ))}
</motion.div>
```

### React Native (Reanimated 3)

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

// On press
scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
```

---

## Scroll Animation Patterns

### GSAP ScrollTrigger

```tsx
gsap.to(".element", {
  scrollTrigger: {
    trigger: ".element",
    start: "top 80%",
    end: "bottom 20%",
    scrub: 1
  },
  y: -100,
  opacity: 1
});
```

### Framer Motion useScroll

```tsx
import { motion, useScroll } from "motion/react"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-blue-500 origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  )
}
```

---

## Forbidden Animations (Variation Mode)

When building for identity, REJECT these lazy patterns:

- ❌ **fadeInUp on everything** — most overused animation
- ❌ **hover:scale-105** — everyone does this
- ❌ **parallax just because** — decorative, not purposeful
- ❌ **stagger: 0.1 on cards** — same timing every time
- ❌ **opacity 0→1 as only animation** — boring

### Instead

- Choreograph: Different elements animate DIFFERENTLY
- Direction: Left content from left, right from right
- Speed variety: Primary fast, secondary slow, tertiary drift
- Surprise: At least one unexpected animation
- Scroll-driven: Tie to scroll position, not just trigger

---

## Performance Enforcement

Run these checks on every animation:

- [ ] Hardware accelerated (`transform`, `opacity` only — no `top`/`left`)
- [ ] 60fps on mobile (test with Chrome DevTools Performance tab)
- [ ] No layout shifts (CLS < 0.1)
- [ ] Heavy animations lazy-loaded
- [ ] `will-change` used sparingly (not on everything)

### Reduced Motion — MANDATORY

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ⛔ STOP GATE — Before Animating

Ask these four questions:

1. What story does this motion tell?
2. Would this animation work on a competitor's site? (If yes, differentiate)
3. Is every section animated the same way? (If yes, add variety)
4. Would someone notice if you removed it? (If no, make it matter or cut it)

---

## Output Format

For each animation, produce:

```markdown
## Animation: [Name]

### Purpose
[Why this animation exists]

### Trigger
[hover / click / scroll / load]

### Implementation
[Code with library specified]

### Timing
- Duration: [Xms or token reference]
- Easing: [function or token reference]

### Reduced Motion Fallback
[What happens with prefers-reduced-motion]
```
