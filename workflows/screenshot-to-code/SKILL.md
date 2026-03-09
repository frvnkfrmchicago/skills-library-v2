---
name: screenshot-to-code
description: Convert screenshots, mockups, and designs to working code. Best practices for AI-assisted implementation.
last_updated: 2026-03
owner: Frank
---

# Screenshot to Code

Convert designs, screenshots, and mockups into working code.

> **See also:** `agents/design-system/SKILL.md`, `workflows/cloning/SKILL.md`

---

## Context Questions

Before converting a screenshot, ask:

1. **What's the source type?** — Figma, screenshot, PDF, hand-drawn
2. **What's the fidelity?** — Pixel-perfect needed, or approximate
3. **What's the scope?** — Single component, page, or multi-page
4. **What states exist?** — Default, hover, active, error, loading
5. **What's the target?** — React component, full page, design system

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Source** | Low-fi sketch ←→ High-fi mockup |
| **Scope** | Component ←→ Full page |
| **Fidelity** | Approximate ←→ Pixel-perfect |
| **States** | Default only ←→ All states |
| **Output** | Quick prototype ←→ Production-ready |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| High-fi mockup | Direct vision analysis with Claude/GPT-4V |
| Figma design | Use Dev Mode for tokens + assets first |
| Low-fi sketch | Describe intent in prompt, not pixels |
| Multiple states | Separate screenshots per state |
| Full page | Break down components first |
| Pixel-perfect needed | Extract design tokens first |

---

## TL;DR

| Input Type | Best Tool | Approach |
|------------|-----------|----------|
| High-fidelity mockup | Claude/GPT-4V | Direct vision analysis |
| Figma design | Figma Dev Mode | Extract tokens, export assets |
| PDF wireframe | Claude/GPT-4V | Describe structure first |
| Sketch/hand-drawn | AI Studio | Interpret intent, not pixels |
| Existing website | Browser inspect | Clone approach |

---

## Part 1: Preparing the Screenshot

### What Works Best

| Quality | Result |
|---------|--------|
| Full page, high resolution | Best |
| Component cropped clean | Good |
| Mobile screenshot | Good |
| Low resolution/blurry | Poor |
| Partial crop mid-component | Poor |

### Pre-Processing Checklist

```
Before submitting:
[ ] Screenshot is high resolution (2x minimum)
[ ] Full component visible (not cropped mid-element)
[ ] No overlapping modals/dropdowns unless intentional
[ ] If multiple states, separate screenshots
[ ] Annotate if specific behavior needed
```

### Annotation Tips

When you need specific behavior, annotate the screenshot:

```
Good annotations:
- "This button opens a modal"
- "Clicking row navigates to /detail/:id"
- "This list is fetched from /api/items"
- "Hover state: slight lift + shadow"

Bad annotations:
- "Make it work"
- "Same as the other one"
- "You know what I mean"
```

---

## Part 2: The Prompt Formula

### Basic Structure

```
[ROLE] You are implementing a React component from a design.

[CONTEXT] This is a [component type] for [purpose].

[SCREENSHOT] [attach image]

[CONSTRAINTS]
- Use: Next.js 16.1.1  TypeScript, Tailwind, shadcn/ui
- Follow our design tokens (dark mode)
- Component should be responsive

[BEHAVIOR]
- [describe any interactions]
- [describe any data]

[OUTPUT]
- Complete, working component
- Include TypeScript types
- Include sample data if needed
```

### Example: Card Component

```
Implement this stats card from the screenshot.

Tech: Next.js 16.1.1  TypeScript, Tailwind, shadcn/ui
Behavior: Shows metric value, trend indicator, sparkline chart
Data: Accepts { title, value, trend, data[] } props

Make it match the design exactly:
- Same spacing
- Same colors (use HSL tokens)
- Same typography hierarchy

[screenshot attached]
```

### Example: Full Page

```
Build this dashboard page from the screenshot.

Tech: Next.js 16.1.1 App Router, TypeScript, Tailwind

Break it down into:
1. Page layout (app/dashboard/page.tsx)
2. Individual components (list each visible)
3. Any needed API routes

For each component:
- Match design exactly
- Add realistic placeholder data
- Include hover/active states where visible

[screenshot attached]
```

---

## Part 3: Multi-Screenshot Workflow

When building a full feature from multiple screenshots:

### Step 1: Overview First

```
I have 5 screenshots for a [feature name].

Screenshot 1: [description]
Screenshot 2: [description]
Screenshot 3: [description]
Screenshot 4: [description]
Screenshot 5: [description]

First, analyze all screenshots and give me:
1. Component breakdown
2. Shared elements
3. State variations
4. Suggested file structure

[attach all screenshots]
```

### Step 2: Component by Component

```
Now implement [component name] from screenshot 2.

Context:
- Part of [feature]
- Connects to [other components]
- State: [describe state management]

[attach specific screenshot]
```

### Step 3: Integration

```
Now connect these components:
- [Component A] should [behavior]
- [Component B] receives [data] from [Component A]
- Navigation between [states]
```

---

## Part 4: Design Token Extraction

### What to Extract

| Element | How to Describe |
|---------|-----------------|
| Colors | HSL values or "dark navy", "muted gray" |
| Spacing | Consistent scale (4, 8, 16, 24, 32, 48) |
| Typography | Size, weight, line-height |
| Border radius | sm, md, lg, full |
| Shadows | Subtle, medium, strong |

### Prompt for Token Extraction

```
Analyze this screenshot and extract:

1. Color palette (as HSL)
   - Background colors
   - Text colors
   - Accent/action colors
   - Border colors

2. Typography scale
   - Heading sizes
   - Body text
   - Labels/captions

3. Spacing patterns
   - Card padding
   - Section gaps
   - Component margins

4. Visual effects
   - Border radius
   - Shadows
   - Any gradients

Output as Tailwind config or CSS variables.

[screenshot attached]
```

---

## Part 5: Handling States

### State Screenshots

Provide separate screenshots for:

| State | Example |
|-------|---------|
| Default | Normal view |
| Hover | Button hovered |
| Active | Tab selected |
| Loading | Skeleton/spinner |
| Empty | No data state |
| Error | Error message |

### State Prompt

```
Implement this button with all visible states.

Screenshots:
1. Default state
2. Hover state  
3. Active/pressed state
4. Disabled state (if shown)

Match exact visual treatment for each state.

[attach state screenshots]
```

---

## Part 6: Motion and Animation

Screenshots don't show motion, so describe it:

```
Add these animations (not shown in screenshot):

Entry:
- Cards fade in + slide up (stagger 0.1s)
- Duration: 0.5s, easing: ease-out

Hover:
- Cards lift 4px with shadow increase
- Duration: 0.2s

Transitions:
- Tab content crossfade (0.3s)
- Modal fade + scale (0.2s)

Use: Motion library (not framer-motion)
```

---

## Part 7: Iterating on Output

### Refinement Prompts

```
The spacing is off:
- Card padding should be 24px not 16px
- Gap between cards should be 16px
- Section margin-bottom should be 48px

Fix these specific issues.
```

```
Colors don't match:
- The background is too bright. Use hsl(222 47% 11%)
- The accent is more teal. Use hsl(172 66% 50%)
- Text secondary should be more muted

Update the color values.
```

```
Typography hierarchy is wrong:
- Main heading should be larger (text-4xl)
- Labels should be uppercase tracking-wide
- Numbers should be tabular-nums

Fix the typography.
```

---

## Part 8: Tools for Screenshot-to-Code

### Your Toolchain

| Tool | Models | Best For |
|------|--------|----------|
| Google Antigravity | Gemini 3, Gemini 3 Flash | Vision analysis, planning, design breakdown |
| Claude Code | Opus 4.5, Sonnet 4.5 | Implementation, code review, refactoring |
| Cursor | (with skills library) | Feature implementation, file creation |

### Workflow

```
Screenshot → Antigravity (Gemini - analyze)
                    ↓
         Cursor (implement with skills)
                    ↓
         Claude Code (Opus - review)
```

### In Google Antigravity (Gemini)

Use for: Vision analysis, design breakdown, planning

```
Attach screenshot. Prompt:

"Analyze this design.
1. Break down into components
2. Extract design tokens (colors, spacing, typography)
3. Note interactions or states visible
4. Create implementation plan for Cursor"
```

### In Cursor (with Skills Library)

Use for: Implementation, feature by feature

```
Take the plan from Antigravity. Prompt:

"Implement [component] from this plan.
Skills to use:
- design-system — tokens
- [relevant skill]

[Paste plan or attach screenshot]"
```

### In Claude Code (Opus/Sonnet)

Use for: Code review, quality check, refactoring

```
Review the implementation:

"Review this component against the original design.
Check: spacing, colors, typography, responsiveness.
Be specific about issues with file:line references."
```

---

## Part 9: Common Issues

### Issue: AI Guesses Colors

```
Problem: AI uses generic colors instead of matching design.

Fix: Be specific:
"Use exactly these colors:
- Background: hsl(222 47% 11%)
- Card: hsl(217 33% 17%)
- Text: hsl(210 40% 98%)
- Accent: hsl(142 76% 36%)"
```

### Issue: Wrong Component Library

```
Problem: AI uses wrong UI components.

Fix: Specify exactly:
"Use shadcn/ui components:
- Card from @/components/ui/card
- Button from @/components/ui/button
- Do NOT use @chakra-ui, @mui, or other libraries"
```

### Issue: Not Responsive

```
Problem: Component breaks on mobile.

Fix: Specify breakpoints:
"Make responsive:
- Mobile: stack vertically, full width
- Tablet (md): 2 columns
- Desktop (lg): layout as shown in screenshot
Use Tailwind responsive prefixes."
```

### Issue: Missing Interactivity

```
Problem: Static output, no interactions.

Fix: Describe interactions:
"Interactions needed:
- Row click: navigate to /detail/:id
- Sort button: toggle sort direction
- Filter dropdown: shows options, filters list
- Checkbox: toggles selection (bulk actions appear)"
```

---

## Part 10: Workflow Integration

### With Figma

```
Workflow:
1. Design in Figma
2. Use Figma Dev Mode for measurements
3. Export assets (icons, images)
4. Screenshot components
5. Feed to AI with extracted tokens
```

### With Design System

```
If you have an existing design system:

"Use our design system tokens:
- Colors: @/lib/design-tokens
- Typography: @/styles/typography
- Spacing: Tailwind spacing scale

Match the screenshot but use our token values."
```

### With Skills Library

```
Combine with other skills:

1. Screenshot shows layout
   → Use design-system skill for tokens
   
2. Screenshot shows animation
   → Use gsap or motion skill for implementation
   
3. Screenshot shows data
   → Use database skill for API pattern
```

---

## Checklist

Before submitting screenshot:
```
[ ] High resolution (retina/2x)
[ ] Full component visible
[ ] States shown separately (if multiple)
[ ] Annotated with behavior notes
[ ] Tech stack specified
[ ] Design tokens provided (or ask AI to extract)
```

After receiving code:
```
[ ] Pixel accuracy check
[ ] Responsive behavior check
[ ] All states implemented
[ ] Interactions work
[ ] Matches design tokens
[ ] Component is typed correctly
```

---

## Related Skills

- [design-system](/agents/design-system/SKILL.md) — Design tokens
- [gsap](/agents/gsap/SKILL.md) — Complex animations
- [motion](/agents/motion/SKILL.md) — React animations
- [a11y](/agents/a11y/SKILL.md) — Accessibility
- [multi-tool-ai](/workflows/multi-tool-ai/SKILL.md) — Which tool to use
