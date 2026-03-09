---
name: tailwind-agent
description: Tailwind CSS reference. Classes, patterns, responsive design. For quick styling.
---

# Tailwind Agent

Style with utility classes. No CSS files needed.

## TL;DR

```
Tailwind = Write styles directly in your HTML/JSX
class="bg-blue-500 text-white p-4 rounded-lg"
     ↑ background  ↑ text   ↑ padding ↑ border radius
```

---

## Context Questions (Ask Before Recommending)

Before suggesting Tailwind patterns:

1. **What's the design language?** (minimal, bold, soft, sharp, glassmorphism)
2. **What's the content density?** (spacious, compact, data-heavy)
3. **Dark mode needed?** (light only, dark only, both)
4. **Mobile-first or desktop-first?** (responsive strategy)
5. **Any brand constraints?** (specific colors, fonts, spacing rules)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Density** | Spacious (p-8, gap-8) ←→ Compact (p-2, gap-2) |
| **Contrast** | Subtle (gray-50/gray-100) ←→ Bold (black/white) |
| **Corners** | Angular (rounded-none) ←→ Soft (rounded-3xl) |
| **Shadows** | Flat (shadow-none) ←→ Elevated (shadow-2xl) |
| **Colors** | Muted ←→ Vibrant |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Dashboard + data-heavy | Compact spacing, subtle backgrounds, readable text sizes |
| Marketing + engagement | Bold colors, generous spacing, dramatic shadows |
| Enterprise + professional | Neutral colors, consistent spacing, less rounded |
| Consumer app + playful | Rounded corners, vibrant colors, generous whitespace |
| Mobile-first + touch | Larger tap targets (min-h-11), more spacing |

---

## Most Used Classes

### Spacing (Padding & Margin)

```
p-4    = padding all sides (1rem)
px-4   = padding left + right
py-4   = padding top + bottom
pt-4   = padding top only
m-4    = margin all sides
mx-auto = center horizontally

Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24...
       0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6rem
```

### Colors

```
bg-blue-500     = background
text-blue-500   = text color
border-blue-500 = border color

Shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
        lightest -----------------------> darkest

Colors: slate, gray, zinc, neutral, stone, red, orange, amber,
        yellow, lime, green, emerald, teal, cyan, sky, blue,
        indigo, violet, purple, fuchsia, pink, rose
```

### Typography

```
text-sm    = small
text-base  = normal
text-lg    = large
text-xl    = extra large
text-2xl   = 2x large (up to 9xl)

font-normal, font-medium, font-semibold, font-bold
```

### Flexbox

```
flex           = display flex
flex-col       = column direction
items-center   = align items center
justify-center = justify content center
justify-between = space between
gap-4          = gap between items
```

### Grid

```
grid           = display grid
grid-cols-3    = 3 columns
grid-cols-12   = 12 columns
col-span-2     = span 2 columns
gap-4          = gap between
```

### Width & Height

```
w-full    = 100%
w-1/2     = 50%
w-screen  = 100vw
w-64      = 16rem (256px)
h-screen  = 100vh
min-h-screen = minimum 100vh
```

### Border & Rounded

```
border        = 1px border
border-2      = 2px border
rounded       = small radius
rounded-lg    = larger radius
rounded-full  = circle/pill
```

### Shadows

```
shadow-sm
shadow
shadow-md
shadow-lg
shadow-xl
shadow-2xl
```

---

## Responsive Design

```
Mobile first:
class="text-sm md:text-base lg:text-lg"
       ↑ mobile  ↑ medium   ↑ large

Breakpoints:
sm  = 640px
md  = 768px
lg  = 1024px
xl  = 1280px
2xl = 1536px
```

### Example

```tsx
<div className="
  p-4 md:p-8 lg:p-12        // Padding increases on larger screens
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3   // More columns on larger
  text-sm md:text-base       // Text size adjusts
">
```

---

## Common Patterns

### Center Everything

```tsx
<div className="flex items-center justify-center h-screen">
  Centered content
</div>
```

### Card

```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  Card content
</div>
```

### Button

```tsx
<button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
  Click me
</button>
```

### Container

```tsx
<div className="max-w-7xl mx-auto px-4">
  Centered, max-width content
</div>
```

### Stack (Vertical)

```tsx
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Row (Horizontal)

```tsx
<div className="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Full-Screen Hero

```tsx
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
  <h1 className="text-5xl font-bold text-white">Hero</h1>
</div>
```

### Overlay

```tsx
<div className="relative">
  <img src="..." className="w-full" />
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
    <span className="text-white">Overlay content</span>
  </div>
</div>
```

---

## States

```
hover:bg-blue-600      = on hover
focus:ring-2           = on focus
active:bg-blue-700     = on click
disabled:opacity-50    = when disabled
```

---

## Dark Mode

```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Adapts to dark mode
</div>
```

---

## Animations

```
animate-spin      = spinning
animate-ping      = ping effect
animate-pulse     = pulsing
animate-bounce    = bouncing
transition        = enable transitions
duration-300      = 300ms duration
```

---

## With shadcn/ui

```tsx
// shadcn components use Tailwind internally
import { Button } from "@/components/ui/button"

<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
```

---

## cn() Helper

```tsx
// Merge Tailwind classes safely
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes here",
  condition && "conditional-class",
  className // Props
)}>
```

---

## Quick Reference

| Want | Classes |
|------|---------|
| Center | `flex items-center justify-center` |
| Full width | `w-full` |
| Max width | `max-w-xl mx-auto` |
| Sticky header | `sticky top-0` |
| Fixed position | `fixed bottom-4 right-4` |
| Hide on mobile | `hidden md:block` |
| Show only mobile | `md:hidden` |
| Gradient bg | `bg-gradient-to-r from-blue-500 to-purple-500` |
| Truncate text | `truncate` |
| Line clamp | `line-clamp-3` |

---

## Official Resources

### Links
- **Docs:** https://tailwindcss.com/docs
- **Cheatsheet:** https://tailwindcomponents.com/cheatsheet
- **Play CDN:** https://play.tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com

### What's New (2025)
- Tailwind v4 (if released) - CSS-first config
- Improved performance
- Better dark mode support
- Native container queries

### Related Tools
- **shadcn/ui:** https://ui.shadcn.com
- **Radix UI:** https://radix-ui.com
- **Headless UI:** https://headlessui.com
- **NativeWind (React Native):** https://nativewind.dev

### Search For More
```
"tailwind [class/feature]"
"tailwindcss v4 [topic]"
"site:tailwindcss.com [feature]"
```
