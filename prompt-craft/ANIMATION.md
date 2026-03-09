---
name: prompt-craft-animation
description: How to prompt for animations, implement motion patterns, and review animation quality.
---

# Prompt Craft: Animation

Motion brings interfaces to life.

## TL;DR

| Animation Type | When to Use |
|----------------|-------------|
| **Fade** | Subtle entrances, opacity changes |
| **Slide** | Directional movement, page transitions |
| **Scale** | Emphasis, hover effects, buttons |
| **Blur** | Focus shifts, loading states |
| **Scroll-triggered** | Content reveal on scroll |
| **Hover** | Interactive feedback |
| **Staggered** | Lists, grids, sequences |

---

## Variation Mode

> Activate when user wants "identity," "unique," "memorable," or "choreographed"

### FORBIDDEN ANIMATIONS (When Varied)

- **fadeInUp on everything** — Overused, lazy
- **hover:scale-105** — Predictable
- **stagger: 0.1 uniformly** — No thought
- **opacity 0 to 1 as only animation** — Boring
- **parallax just because** — Decorative without purpose

### CHOREOGRAPHY RULES

Instead of animating everything the same:
1. **Primary element** animates first, most dramatically
2. **Secondary elements** follow with less emphasis
3. **Background/atmosphere** is continuous, subtle
4. **Direction matters** — Left content from left, right from right
5. **Speed variety** — Fast for attention, slow for elegance

### SIGNATURE MOMENTS

Every project should have at least ONE animation that is:
- Unique to this brand
- Memorable enough to describe
- Worth showing to someone

Reference: `/agents/anti-template/SKILL.md`

---

## Before You Prompt: Planning

Generic prompts produce generic animations. For stunning results, plan first.

**See:** `/workflows/animation-planning/SKILL.md`

### Quick Decision: Which Library?

| Situation | Use | Why |
|-----------|-----|-----|
| Scroll-driven, landing page | **GSAP** | Precise scroll control, timelines |
| UI state transitions | **Motion** | React-native, layout animations |
| Drag, hover, gestures | **Motion** | Built-in gesture support |
| Complex multi-element sequences | **GSAP** | Timeline + coordination |
| Simple fade/slide | **Either** | CSS or library |

**Implementation skills:**
- GSAP: `/agents/gsap/SKILL.md`
- Motion: `/agents/motion/SKILL.md`

### What Assets Can You Bring?

Better assets = better animations. Don't just animate text.

| Asset | Source | Animation Potential |
|-------|--------|---------------------|
| Images | AI Studio, Midjourney | Parallax, reveal, zoom |
| 3D objects | Spline, Blender | Rotate, float, explode |
| Video loops | Runway, stock | Background, reveals |
| SVG graphics | Figma, AI-generated | Path drawing, morphing |
| Lottie files | LottieFiles.com | Complex vector animation |

---

## Prompting for Animation

### The Formula

```
[ANIMATION TYPE] + [TARGET] + [TRIGGER] + [TIMING] + [DETAILS]
```

### Example Prompts

**Basic:**
```
Add a fade-in animation to the hero section that 
transitions from opacity 0 to 1 over 800ms with 
ease-in-out timing.
```

**Advanced:**
```
Animate when in view: fade in, slide up, blur in, 
element by element. Use 'both' instead of 'forwards'. 
Don't use opacity 0. Add stagger delay of 100ms.
```

**Complex (Border Beam):**
```
Add a 1px border beam animation around the 
pill-shaped button on hover. The beam should 
travel around the perimeter over 2 seconds.
```

---

## Animation Types + Prompts

### Text Animations

| Effect | Prompt |
|--------|--------|
| **Character reveal** | "Create a typing animation that reveals each character with 50ms delay for the headline" |
| **Word fade up** | "Animate words fading in and moving up with 100ms stagger between each word" |
| **Letter by letter** | "Reveal each letter with scale effect and 80ms staggered delay" |
| **Gradient text** | "Apply a moving gradient from blue to purple that animates horizontally over 3s loop" |
| **Blur transition** | "Blur from 0 to 5px and back when switching content, 400ms duration" |
| **Clipped slide** | "Slide in with clipping mask revealing text left to right over 800ms" |

### Card Animations

| Effect | Prompt |
|--------|--------|
| **Hover scale** | "Scale cards to 1.05x with shadow increase on hover, 300ms ease-out" |
| **Tilt effect** | "3D tilt that follows cursor position, max 10 degrees rotation" |
| **Staggered entrance** | "Cards fade in and move up with 100ms delay between each" |
| **Flip card** | "Rotate 180 degrees on hover to reveal back side content" |

### Button Animations

| Effect | Prompt |
|--------|--------|
| **Scale + color** | "Scale to 1.05x and shift from blue-500 to blue-600 on hover, 250ms" |
| **Ripple** | "Material Design ripple effect expanding from click point" |
| **Border animation** | "Animated border that draws around button perimeter on hover" |
| **Icon slide** | "Text slides left, arrow icon appears from right on hover" |
| **Pulse** | "Pulsing glow effect that expands and fades repeatedly" |
| **Loading state** | "Show spinner when clicked, text fades out, spinner fades in" |

### Scroll Animations

| Effect | Prompt |
|--------|--------|
| **Fade in on view** | "Fade in when element enters viewport, 600ms duration" |
| **Slide from direction** | "Left content slides from left (-30px), right from right (30px)" |
| **Parallax** | "Background moves at 0.5x scroll speed for depth effect" |
| **Progress indicator** | "Progress bar fills as user scrolls down page" |

---

## Animation Timing

### Duration Guidelines

| Type | Duration | Why |
|------|----------|-----|
| Micro-interaction | 100-150ms | Feels instant |
| Hover effect | 200-300ms | Quick feedback |
| Button press | 150ms | Responsive |
| Modal/alert | 400-600ms | Noticeable but not slow |
| Page transition | 300-500ms | Smooth flow |
| Scroll animation | 600-800ms | Elegant reveal |

### Easing Functions

| Easing | Feel | Use For |
|--------|------|---------|
| `ease` | Natural | General purpose |
| `ease-in` | Accelerating | Exits |
| `ease-out` | Decelerating | Entrances |
| `ease-in-out` | Smooth | Transitions |
| `linear` | Mechanical | Progress bars |
| `bounce` | Playful | Emphasis, games |

### Timing Prompt

```
Use an ease-out timing function with 600ms duration 
and 100ms stagger delay between elements. 
Apply to elements as they enter viewport.
```

---

## Implementation Patterns

### Scroll-Triggered (Code Snippet)

More reliable than prompting:

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-on-scroll {
  animation: fadeInUp 0.6s ease-out both;
}
```

```js
// Intersection Observer pattern
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-on-scroll');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-target').forEach(el => {
  observer.observe(el);
});
```

### Staggered Entrance

```css
.stagger-item {
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 100ms; }
.stagger-item:nth-child(3) { animation-delay: 200ms; }
.stagger-item:nth-child(4) { animation-delay: 300ms; }
```

### Hover Scale (Tailwind)

```html
<div class="transition-transform duration-300 hover:scale-105 hover:shadow-lg">
  Card content
</div>
```

---

## Advanced Animation Prompts

### Border Beam

```
Add a 1px border beam animation around the 
pill-shaped button on hover. Beam travels 
around perimeter over 2 seconds.
```

### Noodle Connections

```
Add noodles to connect with the circle. 
Animate the noodles with beam animation.
```

### Marquee Loop

```
Add a marquee infinite loop slow animation 
to the logos using alpha mask.
```

### Flashlight Effect

```
Add a subtle flashlight effect on hover/mouse 
position to both background and border of cards.
```

### Card Rotation

```
Animate the big card to rotate between 3 cards 
in a loop. Add prev/next arrows to switch.
```

### Clip Animation

```
Add a clip animation to the background, 
column by column using clip-path.
```

---

## Review Checklist

### Before Shipping

- [ ] **Duration appropriate** - Not too slow, not too fast
- [ ] **Easing feels natural** - Not mechanical or jarring
- [ ] **Performance smooth** - No jank on scroll
- [ ] **Mobile tested** - Works on phones
- [ ] **Reduced motion respected** - Check `prefers-reduced-motion`
- [ ] **Purpose clear** - Animation adds meaning, not distraction

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Performance Tips

| Do | Don't |
|----|-------|
| Animate `transform` and `opacity` | Animate `width`, `height`, `top`, `left` |
| Use `will-change` sparingly | Apply `will-change` to everything |
| Batch scroll animations | Create 100 individual triggers |
| Lazy load animated elements | Animate off-screen content |

---

## Animation by Context

### Hero Section

```
Staggered entrance: heading fades in first, 
subheading 200ms later, CTA button 300ms after. 
Each slides up from 20px below with ease-out.
```

### Feature Grid

```
Cards enter with stagger as they come into view. 
Fade in + slide up, 100ms delay between cards.
```

### Testimonials

```
Marquee infinite loop with alpha mask fading 
edges. Slow, continuous scroll.
```

### Navigation

```
Mobile menu slides in from left with overlay 
fade. 300ms duration, ease-out.
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Everything animates | Only animate what matters |
| Too slow | Keep under 600ms for most interactions |
| No easing | Always specify easing function |
| Ignores mobile | Test on actual phone |
| Breaks on scroll | Use Intersection Observer, not scroll event |
| No fallback | Provide static version for reduced motion |
