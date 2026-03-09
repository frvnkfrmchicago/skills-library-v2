---
name: prompt-craft-styling
description: How to prompt for colors, themes, shadows, and visual effects.
---

# Prompt Craft: Styling

Colors, themes, shadows, and visual effects.

## TL;DR

| Style Element | Key Considerations |
|---------------|-------------------|
| **Colors** | Psychology, contrast, accessibility |
| **Themes** | Light/dark, adaptive, consistency |
| **Shadows** | Depth, hierarchy, subtlety |
| **Effects** | Gradients, blur, overlays |

---

## Variation Mode

> Activate when user wants "identity," "unique," or "not default"

### FORBIDDEN STYLES (When Varied)

- **Blue-500 as primary** — Generic tech color
- **Glassmorphism cards** — 2024 is over
- **Gray-900 dark mode** — Everyone's dark mode
- **Gradient mesh backgrounds** — Lazy solution
- **White backgrounds** — When darker moods fit better

### INSTEAD

- **Derive colors from brand emotion**, not Tailwind palette
- **Create custom glass effects** with specific blur, saturation, border values
- **Dark mode with personality** — Purple-tinted, warm grays, or brand-colored
- **Texture and grain** — Noise overlays, organic patterns
- **Light sources** — Everything should feel lit from somewhere

### COLOR IDENTITY

Ask: "If I removed all text, would the color palette alone evoke the brand?"

Reference: `/agents/anti-template/SKILL.md`

---

## Prompting for Style

### The Formula

```
[STYLE TYPE] + [THEME] + [COLORS] + [EFFECTS] + [CONTEXT]
```

### Example Prompts

**Basic:**
```
Create a card component with glassmorphism style, 
subtle shadow, and blue-500 accent color.
```

**Detailed:**
```
Design a dashboard with:
- Dark theme (gray-900 background)
- Blue (#3B82F6) primary accent
- Medium shadows for depth
- Glassmorphism on cards (backdrop blur)
- WCAG AA compliant contrast
```

---

## Style Types

| Style | Characteristics | Prompt Keywords |
|-------|-----------------|-----------------|
| **Flat** | No shadows, solid colors | "flat design, solid colors, no shadows" |
| **Material** | Elevation shadows, depth | "material design, elevation, card shadows" |
| **Glassmorphism** | Blur, transparency | "glass effect, backdrop blur, translucent" |
| **Neumorphism** | Soft, extruded look | "neumorphic, soft shadows, inner shadows" |
| **Minimalist** | Clean, whitespace | "minimal, clean, ample whitespace" |
| **Brutalist** | Raw, bold, geometric | "brutalist, bold, raw edges" |

### Style Prompt Examples

**Flat:**
```
Create a flat design button with solid blue-500 
background, no shadows, clean borders.
```

**Glassmorphism:**
```
Design a card with glassmorphism: 
backdrop blur (12px), white/10 background, 
subtle white border, soft shadow.
```

**Neumorphism:**
```
Create neumorphic buttons with soft extruded 
appearance, light outer shadow, dark inner shadow, 
matching background color.
```

---

## Color Theory

### Psychology

| Color | Emotion | Use For |
|-------|---------|---------|
| **Blue** | Trust, stability | Finance, corporate, tech |
| **Green** | Growth, success | Health, eco, success states |
| **Red** | Energy, urgency | CTAs, warnings, errors |
| **Yellow** | Optimism, attention | Highlights, creative |
| **Purple** | Luxury, creativity | Premium, creative tools |
| **Orange** | Energy, warmth | Gaming, food, excitement |
| **Gray** | Neutral, sophisticated | Text, backgrounds, borders |

### 60-30-10 Rule

```
60% - Dominant color (background, large areas)
30% - Secondary color (cards, sections)
10% - Accent color (CTAs, highlights)
```

### Color Prompt

```
Use the 60-30-10 rule:
- 60% white/gray-50 backgrounds
- 30% gray-100 cards and sections
- 10% blue-600 for CTAs and accents
```

---

## Color Palettes

### Ready-to-Use Palettes

**Modern Tech:**
```
Primary: #3B82F6 (blue-500)
Secondary: #6B7280 (gray-500)
Background: #FFFFFF / #111827 (dark)
Accent: #10B981 (green-500)
```

**Warm Creative:**
```
Primary: #F59E0B (amber-500)
Secondary: #78716C (stone-500)
Background: #FFFBEB / #1C1917 (dark)
Accent: #EF4444 (red-500)
```

**Calm Wellness:**
```
Primary: #10B981 (emerald-500)
Secondary: #9CA3AF (gray-400)
Background: #F0FDF4 / #064E3B (dark)
Accent: #6366F1 (indigo-500)
```

**Premium Dark:**
```
Primary: #8B5CF6 (violet-500)
Secondary: #A1A1AA (zinc-400)
Background: #09090B (zinc-950)
Accent: #F472B6 (pink-400)
```

### Palette Prompt

```
Use a calm wellness palette:
- Emerald-500 primary for growth/health
- Soft gray secondary for text
- Light green tinted background
- Indigo accents for CTAs
- Dark mode with deep emerald background
```

---

## Themes

### Light vs Dark

| Aspect | Light Theme | Dark Theme |
|--------|-------------|------------|
| Background | White, gray-50 | Gray-900, gray-950 |
| Text | Gray-900, gray-800 | White, gray-100 |
| Borders | Gray-200 | Gray-700, gray-800 |
| Cards | White | Gray-800, gray-850 |
| Shadows | Gray shadows | Darker, less visible |

### Theme Switching Prompt

```
Design for both themes:
- Light: white background, gray-900 text, gray-200 borders
- Dark: gray-900 background, gray-100 text, gray-700 borders
- Accent colors stay the same in both themes
- Shadows lighter in dark mode
```

### Adaptive Theme

```
Use adaptive theme that responds to system preference.
Invert color intensities when switching:
- gray-200 becomes gray-800
- white becomes gray-900
- Preserve opacity values
```

---

## Shadows

### Depth Scale

| Level | Use Case | Tailwind |
|-------|----------|----------|
| None | Flat elements | `shadow-none` |
| Small | Subtle depth | `shadow-sm` |
| Medium | Cards, panels | `shadow-md` |
| Large | Dropdowns, popovers | `shadow-lg` |
| XL | Modals, overlays | `shadow-xl` |
| 2XL | Hero elements | `shadow-2xl` |

### Shadow Prompt

```
Apply shadow hierarchy:
- Cards: medium shadow (shadow-md)
- Buttons: small shadow, larger on hover
- Modal: extra large shadow (shadow-xl)
- Consistent shadow direction (bottom-right)
```

### Colored Shadows

```
Add colored shadow matching the button color:
blue-500 button gets blue-500/20 shadow
```

---

## Effects

### Gradients

| Type | Prompt |
|------|--------|
| Linear | "Linear gradient from blue-500 to purple-600, left to right" |
| Radial | "Radial gradient from center, white to transparent" |
| Mesh | "Mesh gradient with multiple color points, organic feel" |
| Text | "Gradient text from blue to purple, clip background" |

### Blur Effects

| Type | Prompt |
|------|--------|
| Backdrop | "Backdrop blur on card, 12px blur, semi-transparent bg" |
| Background | "Blur background image, 20px, with overlay" |
| Progressive | "Progressive blur from top to bottom" |

### Overlays

```
Add dark overlay (black/50) on hero image 
for text readability. Gradient overlay 
from bottom for text placement.
```

---

## Accessibility

### Contrast Requirements

| Level | Ratio | For |
|-------|-------|-----|
| AA | 4.5:1 | Normal text |
| AA | 3:1 | Large text (18px+) |
| AAA | 7:1 | Enhanced accessibility |

### Contrast Prompt

```
Ensure WCAG AA compliance:
- Text contrast at least 4.5:1
- Large headings at least 3:1
- Focus states clearly visible
- Don't rely on color alone for meaning
```

### Common Issues

| Issue | Fix |
|-------|-----|
| Light gray on white | Use gray-600 minimum for text |
| Blue on purple | Choose contrasting hues |
| Color-only indicators | Add icons or text labels |
| Missing focus states | Add visible focus rings |

---

## Review Checklist

### Before Shipping

- [ ] **Contrast checked** - Use contrast checker tool
- [ ] **Both themes work** - Light and dark tested
- [ ] **Colors consistent** - Same palette throughout
- [ ] **Shadows appropriate** - Hierarchy makes sense
- [ ] **Effects performant** - Blur doesn't lag
- [ ] **Brand aligned** - Colors match brand guidelines

### Tools

| Tool | Purpose |
|------|---------|
| WebAIM Contrast Checker | Test contrast ratios |
| Coolors | Generate palettes |
| Realtime Colors | Preview palettes on UI |
| Color Blindness Simulator | Test for color blindness |

---

## Prompt Templates

### Brand-Aligned Design

```
Design a [COMPONENT] for [BRAND TYPE]:
- Primary color: [HEX]
- Style: [flat/material/glass]
- Theme: [light/dark/adaptive]
- Shadows: [none/subtle/prominent]
- Target audience: [description]
```

### Full Styling Spec

```
Create [COMPONENT] with:
- Style: glassmorphism with backdrop blur
- Theme: dark (gray-900 base)
- Primary: blue-500 (#3B82F6)
- Shadows: medium, consistent direction
- Borders: 1px gray-700
- Effects: subtle gradient accent
- Accessibility: WCAG AA compliant
- Device: optimized for [desktop/mobile]
```
