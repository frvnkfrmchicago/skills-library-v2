# Animation Library Decision Tree

Choose between GSAP and Motion (Framer Motion) for your animation needs.

---

## Quick Decision

```
START
  │
  ├─ Is this a React project?
  │   ├─ NO → Use GSAP
  │   │
  │   └─ YES → Continue...
  │
  ├─ What type of animation?
  │   │
  │   ├─ UI state changes (hover, tap, toggle)
  │   │   └─ Use Motion (`whileHover`, `whileTap`, `animate`)
  │   │
  │   ├─ Layout animations (list reorder, shared elements)
  │   │   └─ Use Motion (`layout`, `layoutId`)
  │   │
  │   ├─ Page/route transitions
  │   │   └─ Use Motion (`AnimatePresence`)
  │   │
  │   ├─ Scroll-triggered reveals (simple)
  │   │   └─ Use Motion (`whileInView`)
  │   │
  │   ├─ Scroll-scrubbed animations (progress-linked)
  │   │   └─ Use GSAP (ScrollTrigger + `scrub`)
  │   │
  │   ├─ Complex scroll timelines (multi-section)
  │   │   └─ Use GSAP (ScrollTrigger + timeline)
  │   │
  │   ├─ Landing page hero sequences
  │   │   └─ Use GSAP (timeline control)
  │   │
  │   ├─ Text splitting/animation
  │   │   └─ Use GSAP (SplitText plugin)
  │   │
  │   ├─ SVG morphing
  │   │   └─ Use GSAP (MorphSVG plugin)
  │   │
  │   └─ Draggable elements
  │       ├─ Simple drag → Use Motion (`drag`)
  │       └─ Complex physics → Use GSAP (Draggable + Inertia)
```

---

## Side-by-Side Comparison

| Criterion | Motion | GSAP |
|-----------|--------|------|
| **React integration** | Native, declarative | Requires `@gsap/react`, imperative |
| **Learning curve** | Lower for React devs | Steeper, more concepts |
| **Bundle size** | ~15KB | ~25KB + plugins |
| **Layout animations** | Built-in (`layout` prop) | Manual, complex |
| **Scroll timeline** | Basic (`useScroll`) | Advanced (ScrollTrigger) |
| **Page transitions** | Built-in (`AnimatePresence`) | Manual setup |
| **Spring physics** | Excellent | Good (via eases) |
| **Timeline control** | Limited | Precise |
| **Plugin ecosystem** | None | Rich (SplitText, MorphSVG, etc.) |
| **Performance** | Good | Excellent |
| **Non-React** | No | Yes |

---

## Use Both Together

For complex projects, combine them:

```
Motion: UI components, layout animations, gesture feedback
GSAP: Scroll experiences, hero sequences, marketing sections
```

### Example Architecture

```tsx
// UI components → Motion
export const Card = () => (
  <motion.div whileHover={{ scale: 1.02 }} layout>
    {/* content */}
  </motion.div>
);

// Scroll sequences → GSAP
useGSAP(() => {
  gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      scrub: true,
    },
  })
  .from(".hero-text", { opacity: 0, y: 40 })
  .from(".hero-image", { scale: 0.8 }, "-=0.3");
}, []);
```

---

## Decision by Project Type

| Project Type | Primary Library | Why |
|--------------|-----------------|-----|
| **SaaS Dashboard** | Motion | UI state, layout animations |
| **Marketing Site** | GSAP | Scroll experiences, hero impact |
| **E-commerce** | Motion | Quick interactions, cart animations |
| **Portfolio** | GSAP | Creative expression, scroll storytelling |
| **Mobile App (React Native)** | Moti / Reanimated | Native performance |
| **Data Visualization** | GSAP | Precise control |

---

## Related Skills

- `agents/gsap/SKILL.md` — Full GSAP patterns
- `agents/motion/SKILL.md` — Full Motion patterns
- `agents/micro-interactions/SKILL.md` — UI feedback animations
- `workflows/animation-planning/SKILL.md` — Planning before implementing
