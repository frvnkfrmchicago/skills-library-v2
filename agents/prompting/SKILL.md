---
name: prompting
description: How to ask AI for specific outputs. Animation prompts, layout prompts, image gen prompts, code prompts. Get better results first try.
---

# Prompting Guide

Ask better, get better.

## TL;DR

```
STRUCTURE: [What] + [Style] + [Details] + [Constraints]

"Make a button" → Generic
"Make a primary button with icon left, loading state, disabled state, using shadcn" → Specific
```

---

## Context Questions (Ask Before Creating Prompts)

Before crafting any prompt:

1. **What's the output format?** (code, text, image, explanation)
2. **What's the specificity level?** (concept vs. production-ready)
3. **What constraints exist?** (library, pattern, time, dependencies)
4. **Who's the audience?** (developer, end user, stakeholder)
5. **What context is needed?** (existing code, brand guidelines, references)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Specificity** | High-level concept ←→ Exact implementation |
| **Output** | Explanation ←→ Code ←→ Visual |
| **Scope** | Single element ←→ Full feature |
| **Context** | Standalone ←→ Integrated with existing |
| **Format** | Freeform ←→ Structured template |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Animation | Trigger + target + library + timing |
| Layout | Responsive + dimensions + spacing |
| Image gen | Style + lighting + composition + details |
| Component | Variants + states + features + library |
| API/backend | Validation + auth + database + return type |
| Debugging | Error + context + expected vs actual |

---

## Animation Prompts (GSAP/Motion)

### What Works

```
✅ "Create a scroll-triggered fade-in for all section headings using GSAP ScrollTrigger"

✅ "Animate the hero text with GSAP SplitText - characters stagger in from bottom with rotation"

✅ "Add hover scale and shadow lift to all cards using Motion"
```

### What Doesn't Work

```
❌ "Make it animated" (what animation?)
❌ "Add some motion" (where? how?)
❌ "Make it smooth" (not actionable)
```

### Animation Prompt Template

```
[Animation type] + [Target element] + [Trigger] + [Library] + [Details]

Examples:
"Stagger fade-in for list items on scroll using GSAP ScrollTrigger with 0.1s delay between"
"Page transition fade with Motion AnimatePresence, 0.3s duration"
"Parallax effect on hero image using GSAP ScrollTrigger with scrub"
```

### Common Animation Requests

| Want | Prompt |
|------|--------|
| Fade in on scroll | "GSAP ScrollTrigger fade-in from opacity 0, y: 30" |
| Hover effect | "Motion whileHover with scale 1.02 and shadow lift" |
| Page transition | "Motion AnimatePresence with fade and slide" |
| Staggered list | "GSAP stagger animation, 0.1s between items" |
| Parallax | "GSAP ScrollTrigger with scrub, move Y on scroll" |
| Text reveal | "GSAP SplitText, characters animate from bottom" |

---

## Layout Prompts

### What Works

```
✅ "Create a responsive grid - 1 column mobile, 2 tablet, 3 desktop - with 24px gap"

✅ "Dashboard layout with fixed sidebar (240px), sticky header (64px), scrollable main content"

✅ "Hero section: full viewport height, content centered vertically, gradient background"
```

### Layout Prompt Template

```
[Layout type] + [Responsive behavior] + [Dimensions] + [Spacing]

Examples:
"Bento grid layout, 4 columns, auto-rows, gap-4, first item spans 2x2"
"Split layout, 50/50 on desktop, stacked on mobile, with 48px gap"
"Card grid, auto-fit columns min 300px, gap-6"
```

### Common Layout Requests

| Want | Prompt |
|------|--------|
| Centered content | "Container max-w-4xl mx-auto px-4" |
| Sidebar layout | "Fixed sidebar 240px, flex-1 main, sticky header 64px" |
| Hero full screen | "min-h-screen flex items-center justify-center" |
| Card grid | "Grid auto-fit minmax(300px, 1fr) gap-6" |
| Bento grid | "Grid with varying spans, first item 2x2" |

---

## Image Generation Prompts (Nano Banana / Midjourney)

### Structure

```
[Subject] + [Style] + [Lighting/Mood] + [Camera/Composition] + [Details]
```

### What Works

```
✅ "A glowing candle made of crystallized honey amber, 
    product photography style, 
    soft warm rim lighting on dark background, 
    macro close-up shot, 
    photorealistic, high detail"

✅ "Abstract geometric shapes floating in space,
    3D render style,
    neon purple and cyan colors,
    dramatic lighting with lens flare,
    wide angle perspective"
```

### What Doesn't Work

```
❌ "A nice candle" (no style, no details)
❌ "Something cool" (not specific)
❌ "Logo for my app" (AI struggles with logos/text)
```

### Image Prompt Building Blocks

| Category | Options |
|----------|---------|
| **Style** | Photorealistic, 3D render, illustration, watercolor, oil painting, anime, minimal, abstract |
| **Lighting** | Soft, dramatic, rim light, backlit, golden hour, neon, studio lighting |
| **Mood** | Warm, cool, moody, bright, dark, ethereal, energetic |
| **Camera** | Close-up, macro, wide angle, aerial, portrait, product shot |
| **Quality** | High detail, 8K, sharp focus, bokeh background |

### Negative Prompts (What to Avoid)

```
Add to prompt: "no text, no watermarks, no distortion, no extra limbs"
```

---

## Component Prompts

### What Works

```
✅ "Create a Button component with variants: default, secondary, outline, ghost, destructive. 
    Include icon slot (left or right), loading state with spinner, disabled state.
    Use shadcn/ui patterns with cva for variants."

✅ "Data table component with:
    - Sortable columns
    - Search filter
    - Pagination (10/25/50 per page)
    - Row selection with checkbox
    - Actions dropdown per row
    Using TanStack Table + shadcn"
```

### Component Prompt Template

```
[Component type] + [Variants/States] + [Features] + [Library/Pattern]

Examples:
"Modal component with header, body, footer slots, close button, click-outside-to-close, using shadcn Dialog"
"Toast notification system with success/error/warning variants, auto-dismiss, using shadcn Sonner"
```

---

## API/Backend Prompts

### What Works

```
✅ "Create a server action for creating a post:
    - Zod validation for title (required, max 100), content (required)
    - Check user is authenticated via Clerk
    - Save to database via Prisma
    - Return the created post or error"

✅ "API route for fetching user's posts:
    - GET /api/posts
    - Paginated (limit, offset params)
    - Filter by status (draft, published)
    - Include author relation
    - Return typed response"
```

### API Prompt Template

```
[Action type] + [Input/validation] + [Auth requirement] + [Database operation] + [Return type]
```

---

## Refactoring Prompts

### What Works

```
✅ "Extract the authentication logic from this component into a custom hook called useAuth"

✅ "Split this 300-line component into:
    - Container component (logic)
    - Presentation component (UI)
    - Types file"

✅ "Convert this to use React Query instead of useEffect + useState for data fetching"
```

### Refactoring Prompt Template

```
[Action] + [Target] + [Pattern/Approach] + [Constraints]
```

---

## Debugging Prompts

### What Works

```
✅ "This error appears: [paste full error]
    Context: I was trying to [action]
    File: [filename]
    What I've tried: [attempts]"

✅ "The animation doesn't trigger on scroll.
    Using GSAP ScrollTrigger.
    Here's my code: [code]
    Expected: fade in when element enters viewport
    Actual: nothing happens"
```

### Debug Prompt Template

```
[Error/Issue] + [Context] + [Expected behavior] + [Actual behavior] + [Code if relevant]
```

---

## Universal Prompting Rules

### Be Specific

```
❌ "Make it better"
✅ "Improve the loading performance by lazy loading images below the fold"

❌ "Add some style"
✅ "Add hover state with scale 1.02 and shadow-lg transition"
```

### Include Constraints

```
❌ "Build a dashboard"
✅ "Build a dashboard with:
    - Max 3 hours effort
    - Use existing shadcn components
    - No new dependencies
    - Mobile responsive"
```

### Reference Patterns

```
❌ "Make authentication"
✅ "Add Clerk authentication following the pattern in /app-types/dashboard/SKILL.md"
```

### State the Output Format

```
❌ "Explain this code"
✅ "Explain this code in plain English, no jargon, like explaining to a non-developer"
```

---

## Quick Reference

| Building | Prompt Includes |
|----------|-----------------|
| Animation | Trigger, target, library, timing |
| Layout | Responsive behavior, dimensions, spacing |
| Image | Style, lighting, composition, details |
| Component | Variants, states, features, library |
| API | Validation, auth, database, return type |
| Refactor | Action, target, pattern, constraints |
| Debug | Error, context, expected vs actual |
