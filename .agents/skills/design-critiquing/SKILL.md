---
name: design-critiquing
description: >
  Elevates UI/UX design quality by providing concrete visual direction — 
  color palettes, layout compositions, typography pairings, interaction 
  recipes, and premium surface treatments. Not a checklist or detector.
  Provides the actual creative direction that makes a design feel premium,
  distinctive, and worth screenshotting. Use when designs look basic, feel
  generic, lack personality, need visual elevation, or when user mentions
  swag, appeal, premium, polish, vibe, aesthetic, or "make it look better."
---

# Design Critiquing

This skill makes your designs better. Not by finding what's wrong — by
showing you what premium looks like and giving you the exact CSS,
typography pairings, color palettes, and layout compositions to get there.

**The problem:** AI-coded designs are competent and forgettable. This skill
gives you the creative direction to make something people actually remember.

---

## STOP — Context First

Before giving any design direction:

1. **What kind of app is this?** (Dating, fintech, social, gaming, cannabis, SaaS)
2. **What emotion should it trigger?** (Excitement, trust, calm, fun, luxury, edge)
3. **What's the brand personality?** (Playful, sophisticated, bold, minimal, raw)
4. **Who are the users?** (Gen Z, professionals, enthusiasts, creators)
5. **What platform?** (Mobile-first, desktop, both)

The answer to these questions determines EVERYTHING below.

---

## Color Direction

### Palette Architecture

Every premium app has exactly 4 color layers:

```
Layer 1: SURFACE — The background personality
         Not white (#fff) or flat gray (#f5f5f5).
         Rich surfaces with subtle warmth or coolness.

Layer 2: BRAND — The signature color(s)
         1-2 distinctive hues that ARE the app.
         Not blue. Not purple-blue gradient. Something specific.

Layer 3: SEMANTIC — The communication colors
         Success, error, warning, info.
         These should harmonize with Layer 2, not fight it.

Layer 4: ACCENT — The surprise color
         Used sparingly. Creates visual punch on CTAs,
         badges, notifications. Often complementary to brand.
```

### Palette Recipes by App Personality

**🎰 Bold / High-Energy (Games, Dating, Entertainment)**
```css
:root {
  /* Rich dark surfaces with warmth */
  --surface-base: #0D0D12;
  --surface-raised: #16161F;
  --surface-elevated: #1E1E2A;

  /* Signature — electric, unapologetic */
  --brand-primary: #FF3366;        /* Hot coral-pink */
  --brand-secondary: #7B61FF;      /* Electric violet */
  --brand-gradient: linear-gradient(135deg, #FF3366 0%, #FF6B35 100%);

  /* Accent — unexpected pop */
  --accent: #00F5D4;               /* Neon mint — surprises against dark */

  /* Text with depth, not flat */
  --text-primary: #F0EFF4;
  --text-secondary: #8B8A97;
  --text-muted: #4A4958;
}
```

**🌿 Natural / Grounded (Cannabis, Wellness, Lifestyle)**
```css
:root {
  --surface-base: #0A0F0D;
  --surface-raised: #141C18;
  --surface-elevated: #1A2721;

  --brand-primary: #4ADE80;        /* Living green */
  --brand-secondary: #86EFAC;      /* Sage highlight */
  --brand-gradient: linear-gradient(135deg, #065F46 0%, #4ADE80 100%);

  --accent: #F59E0B;               /* Amber warmth */

  --text-primary: #ECFDF5;
  --text-secondary: #6EE7B7;
  --text-muted: #34D399;
}
```

**💰 Premium / Sophisticated (Fintech, SaaS, Professional)**
```css
:root {
  --surface-base: #09090B;
  --surface-raised: #18181B;
  --surface-elevated: #27272A;

  --brand-primary: #A78BFA;        /* Soft violet */
  --brand-secondary: #C4B5FD;
  --brand-gradient: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);

  --accent: #FCD34D;               /* Gold accent */

  --text-primary: #FAFAFA;
  --text-secondary: #A1A1AA;
  --text-muted: #52525B;
}
```

**🔥 Street / Raw / Cultural (Music, Fashion, Urban)**
```css
:root {
  --surface-base: #0C0A09;
  --surface-raised: #1C1917;
  --surface-elevated: #292524;

  --brand-primary: #F97316;        /* Burnt orange */
  --brand-secondary: #FB923C;
  --brand-gradient: linear-gradient(135deg, #EA580C 0%, #FBBF24 100%);

  --accent: #E11D48;               /* Blood red accent */

  --text-primary: #FEF3C7;         /* Warm white */
  --text-secondary: #D6D3D1;
  --text-muted: #78716C;
}
```

### Color Tools to Actually Use

| Tool | What It Does | URL |
|------|-------------|-----|
| **Realtime Colors** | Preview palette on live UI | realtimecolors.com |
| **Huemint** | AI palette that looks human (ironic) | huemint.com |
| **Happy Hues** | Curated palettes applied to real UI | happyhues.co |
| **Coolors** | Generate + lock + adjust | coolors.co |
| **ColorMagic** | Generates palettes from keywords | colormagic.app |

---

## Typography That Creates Personality

### The Pairing Formula

Every premium app needs exactly TWO typefaces:
- **Display/Heading:** The personality. This is what makes your app look like YOUR app.
- **Body:** The workhorse. Needs to be legible at 14-16px.

### Pairing Recipes

**Bold / High-Energy:**
```css
--font-display: 'Clash Display', 'Space Grotesk', sans-serif;
--font-body: 'Satoshi', 'General Sans', sans-serif;
/* WHY: Clash Display has geometric edge. Satoshi is clean but not boring. */
```

**Natural / Grounded:**
```css
--font-display: 'Fraunces', 'Playfair Display', serif;
--font-body: 'Plus Jakarta Sans', 'DM Sans', sans-serif;
/* WHY: Serif display feels organic. Jakarta is modern but warm. */
```

**Premium / Sophisticated:**
```css
--font-display: 'Cabinet Grotesk', 'Outfit', sans-serif;
--font-body: 'Inter', 'Geist', sans-serif;
/* WHY: Cabinet Grotesk feels intentional. Inter is invisible (on purpose). */
```

**Street / Raw:**
```css
--font-display: 'Bebas Neue', 'Oswald', sans-serif;
--font-body: 'Work Sans', 'Rubik', sans-serif;
/* WHY: Bebas is loud and unapologetic. Work Sans grounds it. */
```

### Where to Get Premium Fonts (Free)

| Source | Quality | Best For |
|--------|---------|----------|
| **Fontshare** | ★★★★★ | Display fonts with character |
| **Google Fonts** | ★★★★ | Body fonts, huge selection |
| **Fontsource** | ★★★★★ | npm installable, self-hosted |
| **Uncut.wtf** | ★★★★★ | Experimental display fonts |

---

## Layout Compositions That Create Energy

### Kill the Uniform Grid

The #1 sign of AI-coded design: every card is the same size, every section
is the same height, every column is equal width. Symmetry is safe. Safe is
forgettable.

### Layout Patterns That Work

**Bento Grid (Variable sizing)**
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(200px, auto);
  gap: var(--space-md);
}

.bento-hero    { grid-column: span 2; grid-row: span 2; }  /* Big feature */
.bento-accent  { grid-column: span 1; grid-row: span 1; }  /* Small stat */
.bento-wide    { grid-column: span 2; grid-row: span 1; }  /* Wide info */
/* KEY: Items are DIFFERENT sizes. That's the whole point. */
```

**Z-Pattern (For landing/hero sections)**
```
┌─────────────────────────────────┐
│ [Logo]              [Nav items] │  ← Eye enters top-left
│                                 │
│ [BIG HEADLINE              ]   │  ← Scans right
│ [supporting text       ]       │
│                                 │
│        [CTA BUTTON]            │  ← Diagonal down to action
│                                 │
│ [Social proof / stats bar]     │  ← Scans left across bottom
└─────────────────────────────────┘
```

**Asymmetric Split (60/40 or 70/30)**
```css
.asymmetric-section {
  display: grid;
  grid-template-columns: 1.5fr 1fr; /* NOT 1fr 1fr */
  gap: var(--space-2xl);
  align-items: center;
}
/* WHY: Creates visual tension. Equal splits feel static. */
```

**Offset / Overlapping Elements**
```css
.featured-card {
  position: relative;
}
.featured-card .badge {
  position: absolute;
  top: -12px;
  right: -8px;
  /* Elements that break the box feel intentional and premium */
}
.featured-card .image {
  margin-top: -40px; /* Image breaks into the section above */
}
```

---

## Surface Treatments (The Premium Layer)

These are the visual techniques that make a surface feel crafted rather
than generated.

### Liquid Glass (2026's Signature)
```css
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
/* The inset top border is what makes glass feel real, not flat. */
```

### Noise Texture (Anti-Flatness)
```css
.textured-surface {
  background-color: var(--surface-base);
  position: relative;
}
.textured-surface::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/noise.svg');
  opacity: 0.03;
  pointer-events: none;
  mix-blend-mode: overlay;
}
/* Adds subtle grain that makes flat colors feel physical. */
```

### Ambient Glow
```css
.glow-accent {
  position: relative;
}
.glow-accent::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--brand-primary) 0%, transparent 70%);
  opacity: 0.15;
  filter: blur(60px);
  top: -100px;
  right: -50px;
  pointer-events: none;
  z-index: 0;
}
/* Creates depth and warmth. Use 1-2 per screen max. */
```

### Gradient Mesh (For Hero Sections)
```css
.mesh-bg {
  background:
    radial-gradient(at 20% 30%, var(--brand-primary) 0%, transparent 50%),
    radial-gradient(at 80% 20%, var(--brand-secondary) 0%, transparent 50%),
    radial-gradient(at 50% 80%, var(--accent) 0%, transparent 40%),
    var(--surface-base);
  opacity: 0.6;
}
/* Multiple radial gradients = organic color fields like Apple's marketing. */
```

---

## Interaction Recipes

These are copy-paste interaction patterns that add energy.

### Magnetic Button
```css
.magnetic-btn {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.magnetic-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(var(--brand-primary-rgb), 0.3);
}
.magnetic-btn:active {
  transform: translateY(0) scale(0.98);
  transition-duration: 0.1s;
}
```

### Card Lift
```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

### Shimmer Loading
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-raised) 25%,
    var(--surface-elevated) 50%,
    var(--surface-raised) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Staggered Fade-In (For Lists)
```css
.stagger-item {
  opacity: 0;
  transform: translateY(12px);
  animation: fadeUp 0.4s ease forwards;
}
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 60ms; }
.stagger-item:nth-child(3) { animation-delay: 120ms; }
.stagger-item:nth-child(4) { animation-delay: 180ms; }
/* 60ms stagger feels natural. 200ms+ feels sluggish. */

@keyframes fadeUp {
  to { opacity: 1; transform: translateY(0); }
}
```

---

## The Elevation Move List

When a design needs to go from "competent" to "premium," pick from this list:

| Current State | Elevation Move | Impact |
|---------------|---------------|--------|
| Flat white background | Add subtle noise texture + warm tone | Medium |
| Uniform card grid | Convert to bento with variable sizes | High |
| System font | Swap heading font to display typeface | High |
| Single button color | Add gradient + shadow on hover | Medium |
| Plain section breaks | Add ambient glow between sections | Medium |
| Static loading | Add shimmer skeletons | Medium |
| Instant page transitions | Add staggered fade-in | Medium |
| Generic success toast | Custom celebration with confetti/checkmark | High |
| Gray empty states | Illustrated empty state with personality | High |
| Equal-width layout | Asymmetric 60/40 split | Medium |
| Flat cards | Glass cards with border glow | High |
| Default hover (opacity) | Magnetic lift with shadow expansion | Medium |

---

## Inspiration Sources (Bookmarkable)

| Source | What You Get | URL |
|--------|-------------|-----|
| **Godly** | Award-level web design | godly.website |
| **Mobbin** | Real product screen patterns | mobbin.com |
| **Awwwards** | Creative direction examples | awwwards.com |
| **Lapa Ninja** | Landing page inspiration | lapa.ninja |
| **SaaS Landing Page** | SaaS-specific layouts | saaslandingpage.com |
| **Dark Mode Design** | Dark palette references | darkmodedesign.com |
| **Bento Grids** | Variable grid layouts | bentogrids.com |
| **Supahero** | Hero section patterns | supahero.io |
| **UI Garage** | Component pattern library | uigarage.net |
| **Refactoring UI** | Practical design technique | refactoringui.com/previews |

---

## Output Format

When providing design direction:

```markdown
## Design Direction: [Project Name]

### Brand Personality
[2-3 words that define the vibe]

### Color Palette
[Complete CSS custom properties with rationale]

### Typography
[Display + body pairing with source links]

### Layout Strategy
[Primary layout pattern with CSS]

### Surface Treatments
[1-2 treatments from the recipe list with code]

### Interaction Set
[3-4 interaction recipes with code]

### The Flex Moment
[One specific visual/interaction that makes this memorable]
```

---

## NEVER

- **NEVER** default to blue or purple-blue gradient — that's the AI signature
- **NEVER** suggest Inter as a display font — it's a body font
- **NEVER** recommend equal-width grids — asymmetry creates energy
- **NEVER** say "add animations" without specifying which ones and where
- **NEVER** use white (#fff) as a primary background — warm it up or go dark
- **NEVER** ignore mobile — every recipe must degrade gracefully to 375px
- **NEVER** suggest more than 2 typefaces — that's chaos, not personality

---

## Related Skills

| Skill | When to use |
|-------|-------------|
| `experience-designing` | After direction is set, build the token system |
| `typography-enforcing` | Lock in the type scale and loading strategy |
| `animation-designing` | Expand the interaction set with full motion system |
| `component-building` | Build the components using the direction |
| `visual-auditing` | After building, verify everything matches |
| `consistency-checking` | Ensure direction propagates consistently |
