---
name: prompt-craft-layout
description: How to prompt for responsive layouts, grids, components, and device framing.
---

# Prompt Craft: Layout

Structure, grids, responsive design, and components.

## TL;DR

| Layout Type | When to Use |
|-------------|-------------|
| **Grid** | Equal items, cards, galleries |
| **Flexbox** | Navigation, alignment, simple rows |
| **Bento** | Mixed-size cards, dashboards |
| **Stack** | Vertical content, mobile |
| **Split** | Two-column, hero sections |

---

## Variation Mode

> Activate when user wants "identity," "unique," or "break the grid"

### FORBIDDEN LAYOUTS (When Varied)

- **Bento grid as default** — Overused since Apple
- **Centered max-width container everywhere** — Predictable
- **Symmetrical layouts** — No tension
- **Standard section order** — Hero, features, testimonials, pricing, footer

### ANTI-GRID OPTIONS

When identity matters:
- **Asymmetric margins** — 3:1 ratio (e.g., 20px left, 60px right)
- **Text bleeding off edge** — Anchor to edge, let it clip
- **Rotated elements** — 90-degree text along edges
- **Overlapping content** — Intentional element collision
- **Non-linear flow** — Sections that blend into each other

### LAYOUT TENSION

Good layout creates visual tension:
- Something large next to something small
- Something dense next to something sparse
- Something expected next to something surprising

Reference: `/agents/anti-template/SKILL.md`

---

## Prompting for Layout

### The Formula

```
[LAYOUT TYPE] + [RESPONSIVE BEHAVIOR] + [SPACING] + [ALIGNMENT]
```

### Example Prompts

**Basic:**
```
Create a 3-column grid that becomes 1 column on mobile, 
with 24px gap between items.
```

**Detailed:**
```
Design a dashboard layout:
- Fixed sidebar (240px) on left
- Main content area with scrollable body
- Grid of cards: 4 columns desktop, 2 tablet, 1 mobile
- 24px gap, 16px padding on cards
- Sticky header (64px height)
```

---

## Responsive Design

### Mobile-First Approach

Always start with mobile, expand to larger:

```
Create a mobile-first layout:
- Mobile (0-640px): Single column, stacked
- Tablet (641-1024px): Two columns
- Desktop (1025px+): Three columns
```

### Breakpoints

| Name | Width | Tailwind |
|------|-------|----------|
| Mobile | 0-640px | default |
| Tablet | 641-1024px | `md:` |
| Desktop | 1025px+ | `lg:` |
| Large | 1280px+ | `xl:` |

### Responsive Prompt

```
Make it responsive:
- Desktop (1024px+): 3 columns, horizontal nav, sidebar visible
- Tablet (768-1023px): 2 columns, horizontal nav, sidebar hidden
- Mobile (below 768px): 1 column, hamburger menu, stacked content
```

---

## Common Layout Patterns

### Hero Section

```
Create hero section:
- Text on left (60%), image on right (40%)
- Mobile: Image stacks above text
- Centered vertically
- Max-width container (1200px)
- Padding: 64px vertical, 24px horizontal
```

### Card Grid

```
Product grid:
- 4 cards per row on desktop
- 2 cards per row on tablet
- 1 card per row on mobile
- 24px gap between cards
- Cards have image, title, price, button
```

### Sidebar Layout

```
Dashboard with sidebar:
- Fixed sidebar: 240px width, full height
- Main content: flex-1, scrollable
- Sidebar collapses to hamburger on mobile
- Header: sticky, 64px height
```

### Split Screen

```
Split layout:
- 50/50 on desktop
- Stacked on mobile (content first, image second)
- Content side has vertical centering
- Image side is full-bleed
```

---

## Grid Layouts

### Basic Grid

```
Grid layout:
- grid-cols-1 mobile
- md:grid-cols-2 tablet
- lg:grid-cols-3 desktop
- gap-6 between items
```

### Bento Grid

```
Bento grid for dashboard:
- 4-column grid
- Featured card spans 2 columns, 2 rows
- Small cards span 1 column each
- Gap of 16px
- Auto-rows with min-height
```

### Masonry

```
Masonry gallery:
- Images maintain aspect ratio
- 3 columns desktop, 2 tablet, 1 mobile
- No fixed height, items flow naturally
- Lazy loading on images
```

---

## Component Layouts

### Navigation Bar

```
Create navigation bar:
- Logo on left
- Links centered
- CTA button on right
- Mobile: hamburger menu, slide-out drawer
- Sticky at top, subtle shadow on scroll
- Height: 64px
```

### Footer

```
Footer layout:
- 4 columns: Logo/About, Links 1, Links 2, Newsletter
- Mobile: single column, stacked
- Background: gray-900
- Padding: 48px vertical
- Copyright row at bottom
```

### Modal

```
Modal dialog:
- Centered on screen
- Max-width: 500px
- Header with title and close button
- Scrollable body if content overflows
- Footer with Cancel/Confirm buttons
- Backdrop: black/50 with click-to-close
- Fade + scale entrance animation
```

### Card

```
Card component:
- Image at top (aspect-ratio 16:9)
- Title, description, metadata
- CTA button at bottom
- Padding: 16px
- Border-radius: 12px
- Shadow: medium
- Hover: lift effect (translateY -4px)
```

---

## Device Framing

### Browser Frame

```
Frame design in browser window:
- macOS traffic lights (red, yellow, green)
- URL bar with site name
- Subtle shadow beneath
- White/gray chrome depending on theme
```

### iPhone Frame

```
Display in iPhone 15 Pro frame:
- Dynamic Island at top
- Status bar with time, battery, signal
- Realistic bezels and corner radius
- Slight angle (10°) with shadow
```

### iPad Frame

```
Show in iPad Pro frame:
- Thin bezels, rounded corners
- Landscape orientation
- Home indicator at bottom
- Soft shadow beneath device
```

### Laptop Frame

```
MacBook Pro frame:
- Screen at slight angle
- Keyboard visible
- Shadow on surface
- Wooden desk texture beneath
```

---

## List Layouts

### Basic List

```
User list:
- Avatar (circular, 40px) on left
- Name and role in middle
- Action button on right
- Subtle dividers between items
- Hover state on each row
```

### Settings List

```
Settings menu:
- Icon on left
- Setting name
- Toggle/value on right
- Grouped with section headers
- Clear dividers between groups
```

### Notification List

```
Notification feed:
- Color-coded by type (red alert, blue info)
- Icon, message, timestamp
- Unread indicator (dot)
- Swipe to dismiss on mobile
- Hover to show actions on desktop
```

---

## Spacing System

### Consistent Spacing

| Size | Pixels | Use For |
|------|--------|---------|
| xs | 4px | Tight spacing, icons |
| sm | 8px | Between related items |
| md | 16px | Card padding, gaps |
| lg | 24px | Section spacing |
| xl | 32px | Major sections |
| 2xl | 48px | Page sections |
| 3xl | 64px | Hero padding |

### Spacing Prompt

```
Use consistent spacing:
- Gap between cards: 24px
- Card padding: 16px
- Section margin: 48px
- Page padding: 24px (mobile), 48px (desktop)
```

---

## Review Checklist

### Before Shipping

- [ ] **No horizontal scroll** - Check on all devices
- [ ] **Touch targets** - 44px minimum on mobile
- [ ] **Content readable** - Not too wide (max 65-75 characters)
- [ ] **Hierarchy clear** - Visual flow is obvious
- [ ] **Breakpoints tested** - Resize to check transitions
- [ ] **Spacing consistent** - Same gaps for same contexts
- [ ] **Container max-width** - Content doesn't stretch forever

### Common Mistakes

| Mistake | Fix |
|---------|-----|
| Content too wide | Max-width container (1200px) |
| No mobile testing | Design mobile-first |
| Inconsistent gaps | Use spacing system |
| Fixed heights | Use min-height, auto-height |
| Horizontal scroll on mobile | Check overflow, use vw carefully |

---

## Prompt Templates

### Full Page Layout

```
Create [PAGE TYPE] layout:
- Header: [DESCRIPTION]
- Hero: [DESCRIPTION]
- Features: [COLUMNS] columns, [DESCRIPTION]
- Testimonials: [DESCRIPTION]
- CTA: [DESCRIPTION]
- Footer: [DESCRIPTION]

Responsive:
- Desktop: [BEHAVIOR]
- Tablet: [BEHAVIOR]
- Mobile: [BEHAVIOR]

Spacing: [SYSTEM]
Max-width: [WIDTH]
```

### Component Layout

```
Create [COMPONENT] with:
- Layout: [grid/flex/stack]
- Columns: [NUMBER] desktop, [NUMBER] tablet, [NUMBER] mobile
- Gap: [SIZE]
- Padding: [SIZE]
- Alignment: [center/start/end]
- Max-width: [SIZE]
```

### Responsive Behavior

```
Make responsive:
- Mobile (below 768px): [BEHAVIOR]
- Tablet (768-1024px): [BEHAVIOR]
- Desktop (above 1024px): [BEHAVIOR]
- Content priority: [WHAT SHOWS FIRST ON MOBILE]
- Navigation: [HOW IT TRANSFORMS]
```
