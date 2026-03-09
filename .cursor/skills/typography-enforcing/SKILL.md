---
name: typography-enforcing
description: >
  Establishes and enforces token-based type systems including font selection,
  scale ratios, line heights, responsive clamp() values, and font loading
  strategy. Use when building a type system, changing fonts, reviewing
  typography hierarchy, fixing font loading issues, or when user mentions
  fonts, type scale, headings, or text sizing.
---

# Typography Enforcing Skill

Establish and maintain the type system through design tokens. Every font size,
line height, and font family is a token that cascades from a single source.

**Core principle:** Typography IS the interface. 95% of the web is text.

---

## ⛔ STOP GATE — Before Generating Type System

1. Does a `tokens.css` file already exist with type tokens? Read it first.
2. What platform? (Web, iOS, Android, React Native)
3. What brand personality? (Professional, playful, technical, editorial)

DO NOT suggest fonts or scales without answering these.

---

## Token-Based Type Scale (1.25 Major Third)

All sizes are CSS custom properties. Change `--font-heading` once → every
heading updates.

```css
:root {
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs: 0.75rem;     /* 12px — captions, labels */
  --text-sm: 0.875rem;    /* 14px — secondary text */
  --text-base: 1rem;      /* 16px — body (NEVER below for body) */
  --text-lg: 1.25rem;     /* 20px — card titles */
  --text-xl: 1.563rem;    /* 25px — section headers */
  --text-2xl: 1.953rem;   /* 31px — page subtitles */
  --text-3xl: 2.441rem;   /* 39px — page titles */
  --text-4xl: 3.052rem;   /* 49px — hero headlines */
  --text-display: clamp(3rem, 5vw + 1rem, 5rem);

  --leading-tight: 1.1;   /* Headings */
  --leading-snug: 1.3;    /* Large body */
  --leading-normal: 1.5;  /* Body text */
  --leading-relaxed: 1.7; /* Small text, long-form */

  --tracking-tight: -0.025em;  /* Display text */
  --tracking-normal: 0;         /* Body */
  --tracking-wide: 0.025em;     /* All caps, labels */
}
```

### Token Application

```css
/* ✅ RIGHT — references tokens only */
.heading-1 {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  font-weight: 700;
}

/* ❌ WRONG — raw values won't cascade */
.bad-heading {
  font-family: 'Space Grotesk';
  font-size: 49px;
}
```

---

## Font Change Protocol

### Step 1: Update Token

Edit `--font-heading` or `--font-body` in `tokens.css`. DO NOT edit individual
component files.

### Step 2: Load the Font

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700&display=swap" rel="stylesheet">
```

Or self-host with variable fonts:

```css
@font-face {
  font-family: 'Bricolage Grotesque';
  src: url('/fonts/BricolageGrotesque-Variable.woff2') format('woff2');
  font-weight: 200 800;
  font-display: swap; /* ALWAYS — prevents invisible text */
}
```

### Step 3: Verify Cascade

- [ ] All headings render with new font
- [ ] Mobile rendering correct (different font metrics)
- [ ] Line heights still correct (x-height differences)
- [ ] Bold/italic variants loaded
- [ ] Page load time not significantly increased

### Step 4: Accessibility

- [ ] Font readable at `--text-sm` (14px)
- [ ] Contrast ratios pass WCAG AA
- [ ] No decorative fonts for body text

---

## Font Selection Guide (2026)

### Fonts With Identity

| Font | Personality | Use Case |
|------|-------------|----------|
| **Bricolage Grotesque** | Quirky, memorable | Brands needing identity |
| **Space Grotesk** | Futuristic, technical | Tech products, dev tools |
| **Geist** | Modern, precise | Clean UI, Vercel ecosystem |
| **Outfit** | Friendly, rounded | Consumer apps |
| **Bebas Neue** | Bold, cinematic | Headlines, editorial |
| **Cabinet Grotesk** | Premium, distinctive | High-end products |
| **Satoshi** | Clean, contemporary | SaaS, professional |

### Fonts That Say Nothing About Your Brand

Use for body copy only, never for headings when identity matters:
- **Inter** — universal means invisible
- **Roboto** — Android default means generic
- **Open Sans** — dated

### Pairing Rules

1. **Contrast:** Pair geometric + humanist (Space Grotesk + Inter)
2. **Limit:** 2–3 fonts maximum (heading + body + code)
3. **Weight contrast:** Headings 600–800, body 400–500

---

## Responsive Typography

### Fluid Type with clamp()

```css
h1 { font-size: clamp(2rem, 5vw + 1rem, 4rem); }
h2 { font-size: clamp(1.5rem, 3vw + 0.75rem, 2.5rem); }
body { font-size: clamp(1rem, 0.5vw + 0.875rem, 1.125rem); }
```

### Optimal Line Length

```css
.prose { max-width: 65ch; }  /* 45-75 chars ideal for readability */
h1 { max-width: 20ch; }      /* Forces natural line breaks */
```

### Platform-Specific

| Platform | System Font | Base Size | Notes |
|----------|------------|-----------|-------|
| iOS | SF Pro | 17px | Dynamic Type support |
| Android | Roboto | 16px | Material type scale |
| Web | System stack | 16px | Never below 16px body on mobile |

---

## Quick Hierarchy Check

For any design, ask:

1. What do you see FIRST? → Should be main message or CTA
2. What do you see SECOND? → Should be supporting info
3. What do you see LAST? → Should be tertiary details

Fix hierarchy with: **Size** (bigger), **Weight** (bolder), **Color** (higher
contrast), **Position** (top/center).

---

## ⛔ STOP GATE — Completion

DO NOT mark type system complete without:

1. Token file has font families, scale, line heights, letter spacing
2. Font loading configured with `font-display: swap`
3. Hierarchy verified at mobile and desktop
4. Zero raw font-size values in component files
5. `clamp()` used for responsive display text
