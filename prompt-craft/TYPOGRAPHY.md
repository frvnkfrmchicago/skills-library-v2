---
name: prompt-craft-typography
description: How to prompt for fonts, pairing, scale, and text styling.
---

# Prompt Craft: Typography

Fonts, pairing, scale, and hierarchy.

## TL;DR

| Element | Key Decisions |
|---------|---------------|
| **Font family** | Sans-serif, serif, mono, display |
| **Font pairing** | Contrast in classification or weight |
| **Scale** | Consistent size progression |
| **Weight** | Hierarchy through boldness |
| **Spacing** | Letter-spacing and line-height |

---

## Prompting for Typography

### The Formula

```
[FONT FAMILY] + [SCALE] + [WEIGHTS] + [SPACING] + [PAIRING]
```

### Example Prompts

**Basic:**
```
Use Inter font with bold headings (700) and 
regular body text (400). 48px headlines, 16px body.
```

**Detailed:**
```
Create typography system:
- Headings: Playfair Display, 64px, 700 weight, -0.02em tracking
- Subheadings: Inter, 24px, 600 weight
- Body: Inter, 16px, 400 weight, 1.5 line-height
- Captions: Inter, 12px, 400 weight, 0.02em tracking
```

---

## Font Classifications

### Sans-Serif (Modern, Clean)

| Font | Vibe | Use For |
|------|------|---------|
| **Inter** | Universal, readable | Everything |
| **Geist** | Modern, Vercel style | Tech, SaaS |
| **Plus Jakarta Sans** | Friendly, digital | Apps, interfaces |
| **Manrope** | Geometric, clean | Modern sites |
| **IBM Plex Sans** | Corporate, precise | Enterprise |
| **Bricolage Grotesque** | Quirky, unique | Standing out |

### Serif (Classic, Editorial)

| Font | Vibe | Use For |
|------|------|---------|
| **Playfair Display** | Elegant, dramatic | Headlines, luxury |
| **Merriweather** | Readable, traditional | Long-form content |
| **IBM Plex Serif** | Technical, precise | Documentation |
| **Libre Baskerville** | Classic, bookish | Editorial |

### Monospace (Technical, Code)

| Font | Vibe | Use For |
|------|------|---------|
| **Geist Mono** | Clean, modern | Code, tech |
| **IBM Plex Mono** | Technical, precise | Code blocks |
| **JetBrains Mono** | Developer favorite | Code-heavy sites |

### Display (Headlines Only)

| Font | Vibe | Use For |
|------|------|---------|
| **Space Grotesk** | Futuristic | Tech headlines |
| **Playfair Display** | Elegant | Luxury headlines |
| **Bricolage Grotesque** | Unique | Standing out |

---

## Font Pairing

### Pairing Principles

1. **Contrast in classification** - Serif heading + Sans body
2. **Contrast in weight** - Heavy heading + Light body
3. **Shared qualities** - Similar x-height or proportions
4. **Maximum 2-3 fonts** - More creates chaos

### Proven Pairings

| Heading | Body | Vibe |
|---------|------|------|
| Playfair Display | Inter | Classic + Modern |
| Bricolage Grotesque | Inter | Unique + Readable |
| Merriweather | IBM Plex Sans | Editorial |
| Space Grotesk | Inter | Futuristic + Clean |
| Inter Bold (700) | Inter Regular (400) | Cohesive |

### Pairing Prompts

**Serif + Sans:**
```
Use Playfair Display for headings (dramatic, elegant) 
and Inter for body text (clean, readable). 
Create strong size contrast: 64px headings, 16px body.
```

**Sans + Sans:**
```
Use Bricolage Grotesque (600 weight) for headings 
and Inter for body. Same-family feel with 
personality in headlines.
```

---

## Type Scale

### Standard Scale

| Element | Size | Weight |
|---------|------|--------|
| H1 / Display | 48-64px | 700 |
| H2 / Heading | 32-40px | 600-700 |
| H3 / Subheading | 24-28px | 600 |
| Body | 16-18px | 400 |
| Small / Caption | 12-14px | 400 |
| Micro | 10-12px | 400-500 |

### Scale Prompt

```
Use this typography scale:
- H1: 48px, font-weight 700, letter-spacing -0.02em
- H2: 32px, font-weight 600, letter-spacing -0.01em
- H3: 24px, font-weight 600
- Body: 16px, font-weight 400, line-height 1.5
- Caption: 12px, font-weight 400, letter-spacing 0.02em
```

### Responsive Scale

```
Responsive typography:
- H1: 48px mobile → 64px desktop
- H2: 28px mobile → 40px desktop
- Body: 16px all sizes
- Use clamp() for fluid scaling: clamp(32px, 5vw, 64px)
```

---

## Font Weights

| Weight | Name | Use For |
|--------|------|---------|
| 300 | Light | Subtitles, secondary |
| 400 | Regular | Body text |
| 500 | Medium | Emphasis, subheadings |
| 600 | SemiBold | Buttons, labels |
| 700 | Bold | Headings |
| 800 | ExtraBold | Display, impact |

### Weight Hierarchy

```
Establish weight hierarchy:
- Page titles: 700 (bold)
- Section headings: 600 (semibold)
- Card titles: 600
- Body text: 400 (regular)
- Captions: 400
- Buttons: 600
```

---

## Letter Spacing (Tracking)

| Context | Spacing | Why |
|---------|---------|-----|
| Large headlines | -0.02em to -0.05em | Tighten for cohesion |
| Body text | 0em (default) | Optimal reading |
| Small text | 0.01em to 0.02em | Improve legibility |
| ALL CAPS | 0.05em to 0.1em | Prevent cramping |

### Tracking Prompt

```
Apply letter-spacing:
- Headlines: -0.02em (tighter)
- Body: 0em (default)
- Buttons: 0.01em (slightly open)
- ALL CAPS labels: 0.05em (airy)
```

---

## Line Height

| Text Type | Line Height | Why |
|-----------|-------------|-----|
| Headlines | 1.1 - 1.2 | Tight, impactful |
| Subheadings | 1.2 - 1.3 | Slightly open |
| Body text | 1.5 - 1.6 | Comfortable reading |
| Long-form | 1.6 - 1.8 | Relaxed, editorial |

### Line Height Prompt

```
Set line-height for readability:
- Headlines: 1.1 (tight)
- Subheadings: 1.25
- Body: 1.5 (comfortable)
- Long paragraphs: 1.6
```

---

## Text Animation

| Effect | Prompt |
|--------|--------|
| Character reveal | "Type each character with 50ms delay" |
| Word fade up | "Words fade in and slide up, 100ms stagger" |
| Gradient text | "Animated gradient moving horizontally over 3s" |
| Clip reveal | "Text reveals through clip-path, left to right" |

---

## Implementation Patterns

### Tailwind Typography

```html
<!-- Heading -->
<h1 class="text-5xl md:text-6xl font-bold tracking-tight">
  Headline
</h1>

<!-- Body -->
<p class="text-base leading-relaxed text-gray-600">
  Body text with comfortable reading line-height.
</p>

<!-- Caption -->
<span class="text-sm font-medium tracking-wide uppercase text-gray-500">
  CAPTION TEXT
</span>
```

### CSS Custom Properties

```css
:root {
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  
  --text-h1: 3rem;      /* 48px */
  --text-h2: 2rem;      /* 32px */
  --text-body: 1rem;    /* 16px */
  
  --weight-regular: 400;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

---

## Review Checklist

### Before Shipping

- [ ] **Max 2-3 fonts** - Not more
- [ ] **Hierarchy clear** - Can distinguish H1 from H2 from body
- [ ] **Readable body text** - 16px minimum, 1.5 line-height
- [ ] **Contrast sufficient** - Text visible on background
- [ ] **Responsive tested** - Scales appropriately on mobile
- [ ] **Weights consistent** - Same weight for same purpose
- [ ] **Fonts loaded** - Check for FOUT (flash of unstyled text)

### Common Mistakes

| Mistake | Fix |
|---------|-----|
| Too many fonts | Stick to 2, max 3 |
| Body text too small | Minimum 16px |
| No hierarchy | Clear size/weight differences |
| Tight line-height on body | 1.5 minimum for paragraphs |
| Same weight everywhere | Vary for emphasis |
| Light text on light bg | Ensure contrast |

---

## Prompt Templates

### Full Typography System

```
Create typography system using:
- Heading font: [FONT], [SIZE], [WEIGHT], tracking [VALUE]
- Body font: [FONT], [SIZE], [WEIGHT], line-height [VALUE]
- Accent/Display: [FONT] for special elements

Scale: H1 [SIZE], H2 [SIZE], H3 [SIZE], Body [SIZE], Caption [SIZE]
```

### Quick Typography

```
Use [FONT] for everything with:
- Headlines: [WEIGHT], [SIZE]
- Body: [WEIGHT], [SIZE], line-height 1.5
- Responsive: scale down 20% on mobile
```
