---
name: anti-template
description: Hardcoded rules against AI default patterns. Use when you want identity, not templates. Forces variation.
last_updated: 2026-03
owner: Frank
---

# Anti-Template Design

Stop AI from giving you the same output everyone else gets.

> **Core rule:** If you've seen it before, don't use it. Identity comes from SPECIFIC DECISIONS, not flexible guidelines.

---

## The Problem

AI models default to the AVERAGE of all training data. That means:

- Inter font
- Centered hero
- Bento grids
- Fade-up animations
- shadcn cards
- Glassmorphism
- "Trusted by 10,000+ users"
- Hero, features, testimonials, pricing, footer

This is not design. This is pattern matching.

---

## FORBIDDEN PATTERNS

Include this in every design prompt:

```
## FORBIDDEN (DO NOT USE)

Typography:
- NO Inter, Outfit, Plus Jakarta Sans as primary font
- NO safe system font stacks
- NO centered headlines
- NO 48-64px hero text (too predictable)

Layout:
- NO bento grids
- NO symmetrical layouts
- NO max-width centered containers for everything
- NO cookie-cutter section order (hero, features, testimonials, pricing, footer)

Animation:
- NO generic fade-up-on-scroll
- NO basic scale-on-hover
- NO parallax just because

Components:
- NO shadcn defaults
- NO glassmorphism cards (overused)
- NO rounded rectangles as the only shape

Copy:
- NO "Everything you need"
- NO "Built for you"
- NO "Trusted by X users"
- NO "The ultimate [product type]"

If you catch yourself doing any of these, STOP and do something different.
```

---

## FORCING IDENTITY

Instead of flexible prompts, make SPECIFIC DECISIONS:

### Typography

Bad:
```
Use a premium font
```

Good:
```
Primary: Bebas Neue, uppercase, 15vw on desktop
Letter-spacing: -0.03em
Line-height: 0.9 (overlapping)
Position: Anchored left edge, bleeds off screen by 10%
Each letter is a separate element for independent animation
```

### Layout

Bad:
```
Create an asymmetric layout
```

Good:
```
Left margin: 20px
Right margin: 120px (6x larger)
Hero text positioned bottom-left, not center
One element rotated 90 degrees along right edge
Section 3 is 90vh of pure atmosphere with a single word
```

### Animation

Bad:
```
Add scroll animations
```

Good:
```
0-25% scroll: Earth colors emerge from bottom
25-50% scroll: Water ripple distortion on all text
50-75% scroll: Fire particles react to scroll velocity
75-100% scroll: Air drift effect, elements float upward
Each letter of headline parallaxes independently on mouse move
Transitions scrubbed to scroll position, not triggered
```

---

## ANTI-PATTERN CHECKLIST

Before accepting any design output, verify:

- [ ] Could I identify the brand if the logo was removed?
- [ ] Is there at least ONE element that breaks the grid?
- [ ] Is the typography treatment unique (not just a nice font)?
- [ ] Are animations choreographed (not just fade-up everything)?
- [ ] Would someone screenshot this?
- [ ] Does it look like an agency made it, not a template?
- [ ] Is there something unexpected that rewards exploration?

If NO to any, push back and ask for variation.

---

## THE VARIATION MANDATE

Every design prompt should request:

```
Provide 3 different visual approaches:

Approach A: [Conservative but elevated]
Approach B: [Rule-breaking layout]
Approach C: [Experimental/artistic]

Each should be distinct enough that I could NOT confuse them.
Do not give me variations of the same idea.
```

---

## SPECIFIC VS FLEXIBLE

| Flexible (weak) | Specific (strong) |
|-----------------|-------------------|
| "Premium typography" | "Bebas Neue, 180px, -0.03em tracking, anchored left" |
| "Asymmetric layout" | "Left margin 20px, right margin 120px" |
| "Scroll animation" | "Letters separate on scroll, each drifting at different speed" |
| "Dark mode" | "Background #0a0a0a, text #e5e5e5, accent #ff6b35" |
| "Glass effect" | "Blur 40px, saturate 180%, 1px border rgba(255,255,255,0.08)" |

Specificity prevents regression to defaults.

---

## QUALITY REFERENCES

Include visual references in prompts. Not to copy, but to set the bar:

**Typography + Motion:**
- kubrick.life
- aristidebenoist.com

**Polish + Detail:**
- linear.app
- raycast.com

**Identity + Breaking Rules:**
- resn.co.nz
- gmunk.com

**Landing Pages That Don't Look Like Templates:**
- godly.website (curated examples)
- awwwards.com/websites/sites_of_the_day/

---

## PUSHING BACK

When AI gives template output, say:

```
That output is too safe. I see [specific pattern].

Specifically:
- The hero is centered. Move it to [position].
- The animation is fade-up. Change it to [specific behavior].
- The layout is symmetrical. Break it by [specific action].
- This looks like every other [category]. Add [specific element].

Make it feel like a magazine spread meets an app, not a SaaS template.
```

---

## INTEGRATION

Use this skill with:
- `/agents/design-philosophy/SKILL.md` — "Safe is failure" mindset
- `/prompt-craft/SKILL.md` — Prompting structure
- `/app-types/landing/SKILL.md` — Landing page structure (use as baseline to BREAK)

---

## Remember

Identity is not:
- A nice font
- Good colors  
- Smooth animations

Identity is:
- Decisions that could ONLY belong to this brand
- Breaking patterns where it creates tension
- Details that reward exploration
- Something worth screenshotting
