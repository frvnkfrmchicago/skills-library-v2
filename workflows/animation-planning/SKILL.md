---
name: animation-planning
description: How to plan animations before prompting. Timeline worksheets, asset planning, element coordination. Use BEFORE jumping into GSAP or Motion implementation.
last_updated: 2026-03
---

# Animation Planning

Plan before you prompt. This is the difference between mediocre and stunning.

## TL;DR

| Phase | What You Do | Output |
|-------|-------------|--------|
| **1. Vision** | What feeling/effect do you want? | Reference + description |
| **2. Assets** | What can you bring in? | Images, 3D, video list |
| **3. Timeline** | What happens when? | Timeline worksheet |
| **4. Coordination** | What moves together? | Element groups |
| **5. Breakdown** | What are the tasks? | Prompt sequence |
| **6. Implementation** | Build with GSAP or Motion | Code |

---

## Context Questions

Before planning animations, ask:

1. **What's the animation context?** — Landing page, app UI, marketing site, interactive experience
2. **What trigger type?** — Scroll-driven, state-based, gesture-based, time-based
3. **What feeling should it evoke?** — Premium/luxury, energetic/fun, minimal, organic
4. **What assets are available?** — Images, SVGs, 3D models, videos, Lottie files
5. **What's the performance requirement?** — 60fps critical, acceptable jank, mobile-first

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Complexity | Single element ←→ Multi-element timeline |
| Trigger | Load once ←→ Continuous scroll-driven |
| Fidelity | Simple fades ←→ Complex choreography |
| Assets | Text/shapes only ←→ Rich multimedia |
| Library | CSS transitions ←→ Full GSAP/Motion |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Scroll-driven landing page | GSAP + ScrollTrigger, timeline worksheet |
| React UI transitions | Motion (Framer Motion), state-based animations |
| Simple hover effects | CSS transitions, no library needed |
| Complex timeline coordination | GSAP timeline, element grouping |
| Mobile-first performance | Optimize assets, test on device, reduce complexity |
| Rich visual assets available | Plan reveals, parallax, morphing effects |

---

## Why Planning Matters

**Generic prompt:**
```
"Help me create a super animated cool landing page"
```
**Result:** Mediocre. Model defaults to safe, common patterns.

**Planned prompt:**
```
"Build scroll animation with this timeline:
- 0-25%: Hero text fades in word-by-word, 100ms stagger
- 25-50%: Phone mockup scales from 0.8 to 1, floats up 50px
- 50-75%: Feature cards stagger in from left, 150ms apart
- 75-100%: CTA buttons pulse with glow effect"
```
**Result:** Intentional. Model executes specific plan.

---

## Phase 1: Vision

### Find Your Reference

Before anything, find 2-3 examples of what you want.

**Where to look:**
- [awwwards.com](https://awwwards.com) - Award-winning sites
- [lapa.ninja](https://lapa.ninja) - Landing page inspiration
- [gsap.com/showcase](https://gsap.com/showcase) - GSAP examples
- [motion.dev/examples](https://motion.dev/examples) - Motion examples
- [codepen.io](https://codepen.io/search/pens?q=gsap) - Live code examples

### Describe the Feeling

| Feeling | Animation Style |
|---------|-----------------|
| **Premium/Luxury** | Slow, smooth, elegant easing |
| **Energetic/Fun** | Bouncy, playful, fast |
| **Tech/Modern** | Clean, geometric, precise |
| **Organic/Natural** | Flowing, curved paths, parallax |
| **Minimal** | Subtle, restrained, purposeful |

---

## Phase 2: Asset Planning

### What Can You Bring In?

Models can animate whatever you provide. More interesting assets = more interesting animations.

| Asset Type | How to Get | Animation Potential |
|------------|-----------|---------------------|
| **Images** | Generate with AI Studio, Midjourney | Parallax, reveal, zoom |
| **SVG graphics** | Illustrator, Figma, AI-generated | Path drawing, morphing |
| **3D models** | Spline, Blender, AI | Rotate, float, explode |
| **Video loops** | Stock footage, AI-generated | Background, reveals |
| **Lottie files** | LottieFiles.com | Complex vector animation |
| **Icon sets** | Solar, Lucide | Stagger, bounce, glow |

### Asset Worksheet

Fill this out before prompting:

```
ASSETS I HAVE:
- [ ] Hero image: _______________
- [ ] Background: _______________
- [ ] Product mockup: _______________
- [ ] Icons: _______________
- [ ] 3D elements: _______________
- [ ] Video: _______________
- [ ] SVG shapes: _______________

ASSETS I NEED TO CREATE:
- [ ] _______________
- [ ] _______________
```

### Creating Assets

| For | Tool | Prompt Example |
|-----|------|----------------|
| Product mockups | Google AI Studio | "Create 3D phone mockup showing app interface, white background, floating angle" |
| Abstract shapes | Midjourney / AI Studio | "Abstract gradient blob, purple to blue, transparent PNG" |
| Background videos | Runway, Pika | "Slow-moving particle field, dark background, subtle glow" |
| SVG illustrations | Claude / Cursor | "Create SVG illustration of [subject], minimal style" |
| 3D objects | Spline (free) | Export as embed or GLTF |

---

## Phase 3: Timeline Planning

### The Timeline Worksheet

For scroll-driven animations, map what happens at each scroll position:

```
SCROLL TIMELINE

0% (Page Load / Top)
├── Element: ________________
│   └── State: ________________
├── Element: ________________
│   └── State: ________________

25% (First Scroll)
├── Element: ________________
│   └── Transition: ________________
├── Element: ________________
│   └── Transition: ________________

50% (Mid-page)
├── Element: ________________
│   └── Transition: ________________

75% (Lower Page)
├── Element: ________________
│   └── Transition: ________________

100% (Bottom)
├── Element: ________________
│   └── Final State: ________________
```

### Example: Landing Page Timeline

```
SCROLL TIMELINE: SaaS Landing Page

0% (Load)
├── Hero headline: Invisible
├── Hero subhead: Invisible
├── CTA button: Invisible
├── Phone mockup: Scale 0.8, opacity 0, y: 100px

25%
├── Hero headline: Fade in, word-by-word
├── Hero subhead: Start fade in
├── CTA button: Still invisible
├── Phone mockup: Still hidden

50%
├── Hero headline: Fully visible
├── Hero subhead: Fully visible
├── CTA button: Scale in with bounce
├── Phone mockup: Scale 1, opacity 1, y: 0, float animation starts

75%
├── Feature cards: Stagger in from left (3 cards, 150ms apart)
├── Stats counter: Numbers count up

100%
├── Footer CTA: Pulse glow effect
├── All animations complete
```

---

## Phase 4: Element Coordination

### Which Elements Move Together?

Group elements that should animate as a unit:

```
COORDINATION GROUPS

Group A (Hero):
- Headline
- Subheadline
- CTA buttons
→ Behavior: Stagger 100ms, same direction

Group B (Product):
- Phone mockup
- Floating badges
- Glow effect
→ Behavior: Move together, same timing

Group C (Features):
- Card 1, Card 2, Card 3
→ Behavior: Stagger 150ms, left to right

Group D (Social Proof):
- Testimonial cards
- Logo bar
→ Behavior: Fade in together
```

### Stagger vs Simultaneous

| Pattern | When to Use |
|---------|-------------|
| **Staggered** | Lists, grids, sequential reveal |
| **Simultaneous** | Elements that are one "unit" |
| **Chained** | One triggers the next |
| **Independent** | Unrelated elements |

---

## Phase 5: Breaking Down Into Tasks

### From Plan to Prompts

Don't ask for everything at once. Break it down:

**BAD:**
```
"Create a fully animated landing page with scroll animations"
```

**GOOD:**
```
Prompt 1: "Set up GSAP ScrollTrigger with 4 scroll sections"
Prompt 2: "Animate hero text: word-by-word fade-in, 100ms stagger"
Prompt 3: "Animate phone mockup: scale + float on scroll"
Prompt 4: "Animate feature cards: stagger reveal from left"
Prompt 5: "Add polish: easing adjustments, timing refinement"
```

### Prompt Sequence Template

```
1. SETUP
   "Set up [GSAP/Motion] with [plugins needed]"

2. STRUCTURE
   "Create [X] sections with refs for animation"

3. TIMELINE
   "Create scroll timeline with markers at [positions]"

4. ELEMENT ANIMATIONS (one at a time)
   "Animate [element] from [start state] to [end state] at [scroll position]"

5. COORDINATION
   "Add [stagger/sequence] to [element group]"

6. POLISH
   "Adjust easing to [feel], timing to [values]"
```

---

## Phase 6: Implementation

### GSAP or Motion?

| Use GSAP When | Use Motion When |
|---------------|-----------------|
| Scroll-driven animations | UI state transitions |
| Complex multi-element timelines | Layout animations |
| Performance-critical | Gesture-based (drag, hover) |
| Landing pages | App interfaces |
| Precise control needed | React-native feel |

### Handoff to Implementation

Once you have your plan, reference the appropriate skill:

- **GSAP:** `/agents/gsap/SKILL.md`
- **Motion:** `/agents/motion/SKILL.md`

Your prompt should now include:
1. The timeline worksheet
2. Asset list
3. Coordination groups
4. Specific scroll positions/triggers

---

## Quick Planning Templates

### Landing Page (Scroll-Driven)

```
VISION: [Premium / Energetic / Minimal]
REFERENCE: [URL]

ASSETS:
- Hero: [image/video]
- Product: [mockup/3D]
- Icons: [set name]

TIMELINE:
0%: Hero invisible
25%: Hero text animate in
50%: Product mockup enters
75%: Features stagger
100%: CTA pulse

LIBRARY: GSAP + ScrollTrigger
```

### App Interface (State-Based)

```
VISION: [Smooth / Snappy / Playful]
REFERENCE: [URL]

TRANSITIONS:
- Page enter: [fade/slide]
- Modal open: [scale + backdrop]
- Tab switch: [underline animate]
- List load: [stagger fade]

GESTURES:
- Cards: [hover scale]
- Buttons: [tap feedback]
- Drag: [if applicable]

LIBRARY: Motion
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| "Make it cool" | Define specific timeline + easing |
| One giant prompt | Break into 4-5 focused prompts |
| No references | Always provide visual reference |
| No assets | Create/find interesting assets first |
| Skip planning | Fill out timeline worksheet |
| Wrong library | GSAP for scroll, Motion for UI |

---

## Resources

### Official Docs
- GSAP: https://gsap.com/docs
- Motion: https://motion.dev/docs

### Inspiration + Examples
- GSAP Showcase: https://gsap.com/showcase
- CodePen GSAP: https://codepen.io/GreenSock
- Awwwards: https://awwwards.com

### Asset Sources
- LottieFiles: https://lottiefiles.com
- Spline (3D): https://spline.design
- Solar Icons: https://www.solar-icons.com

### Skills Library
- `/agents/gsap/SKILL.md` - GSAP syntax
- `/agents/motion/SKILL.md` - Motion syntax
- `/prompt-craft/ANIMATION.md` - Animation prompts
