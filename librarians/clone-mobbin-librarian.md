---
name: clone-mobbin-librarian
description: Automated app cloning from Mobbin. Takes a Mobbin flows URL, reads the flow tree from the DOM, clicks into each screen's detail view, extracts visuals, and generates working code. Hybrid approach — DOM-first for structure, clicks only for screen details.
last_updated: 2026-03-23
version: v3
protocol: anti-skimming-v3
---

# Clone Mobbin Librarian

**Role**: Take a Mobbin flows URL, extract every screen, generate working code.

**Not the Mobbin Librarian**: That one does IAAA adaptation. This one does exact structural cloning.

---

## How Mobbin Pages Work

The user gives you a **flows URL**:
```
https://mobbin.com/apps/[app-name]-[uuid]/[session-uuid]/flows
```

Stay on this page. Do NOT navigate away from Flows.

### Page Layout
```
┌──────────────────────────────────────────────────────────┐
│  [Flows]  [Screens]  [UI Elements]      ← STAY ON FLOWS │
├──────────────┬───────────────────────────────────────────┤
│  LEFT PANEL  │  MAIN CONTENT                            │
│  (Flow Tree) │  (Screen thumbnails per flow)            │
│              │                                           │
│  Sections →  │  Click a section → thumbnails appear     │
│  Flows →     │  Click a thumbnail → detail view opens   │
│  Sub-flows → │                                           │
└──────────────┴───────────────────────────────────────────┘
```

### What Mobbin Loads and Doesn't Load

| Data | In the DOM? | How to get it |
|------|------------|---------------|
| Flow tree (sections, flow names, sub-flows) | YES | Read DOM directly — `browser_get_dom` |
| Screen IDs | YES | In `href` attributes of thumbnail links |
| Thumbnail images | YES (low-res) | `img` tags, but only ~6-10 at a time (virtualized) |
| High-res screen images | NO | Only fetched on-demand when you scroll/click |
| Screen metadata (resolution, date) | NO | Only appears in detail view after clicking |

> [!IMPORTANT]
> Mobbin uses **virtualized lists** — only screens currently in the viewport exist in the DOM. You MUST scroll to load more. High-res images are fetched via `POST /api/screen/fetch-screen-info` only when triggered by scroll or click.

---

## The Clone Workflow

### Phase 1: Read the Flow Tree (DOM — No Clicking)

```
1. Open the flows URL
2. Run browser_get_dom
3. Parse the LEFT PANEL to extract the full flow tree:
   - Section names (Level 1): e.g., Onboarding, Home, Courses, You
   - Flow names (Level 2): e.g., Creating account, Course detail
   - Sub-flows (Level 3+): e.g., Completing a lesson, Giving feedback
4. Record the complete tree structure
```

This gives you the INVENTORY without clicking anything.

### Phase 2: Scroll + Click for Screen Details

Now that you know the tree, go section by section:

```
FOR EACH section in the flow tree:
  1. Click the section name in the left panel (expands it, scrolls main content)
  
  FOR EACH flow in that section:
    2. Click the flow name → main content shows that flow's screen thumbnails
    3. Scroll through the thumbnail strip to load all screens (virtualization)
    
    FOR EACH screen thumbnail:
      4. CLICK the thumbnail → detail view opens (high-res image + metadata)
      5. In the detail view, extract:
         - Full-size screen image (colors, layout, spacing now visible)
         - Background color / gradients
         - Header: title text, navigation elements, icons
         - Body: layout type (centered, grid, list, form, cards)
         - Every UI element: buttons, inputs, toggles, cards, images, icons
         - Text content (exact copy)
         - Typography: heading sizes, body text, captions
         - Color palette: primary, secondary, accent, background, text
         - Navigation: tab bar, back button, close button
         - Interactive states: selected tabs, progress bars, active items
      6. Close/back out to the flow view
      7. Move to the next thumbnail
```

> [!CAUTION]
> You MUST click into individual screen detail views (step 4). Thumbnails are too small to extract accurate design details. The detail view is where all the real information lives.

### Phase 3: Screen Inventory Table

After browsing, produce:

```markdown
| Section | Flow | Screen # | Description | Key Components | Colors | User Action |
|---------|------|----------|-------------|----------------|--------|-------------|
```

Every screen from every flow. No skipping.

### Phase 4: Design Tokens

Extract a unified design system from all screens:

```css
/* tokens.css */
:root {
  --color-primary: ;
  --color-secondary: ;
  --color-accent: ;
  --color-background: ;
  --color-surface: ;
  --color-text-primary: ;
  --color-text-secondary: ;
  --color-border: ;
  --color-success: ;
  --color-error: ;

  --font-family: ;
  --font-size-heading: ;
  --font-size-subheading: ;
  --font-size-body: ;
  --font-size-caption: ;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```

**Skill**: [experience-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/experience-designing/SKILL.md)

### Phase 5: Component Identification

From the inventory, identify reusable components:

| Component | Where Used | Props |
|-----------|-----------|-------|
| NavBar | Every screen | title, showBack, rightAction |
| BottomTabBar | Home, Courses, Profile | activeTab, tabs[] |
| Card | Home, Courses | title, image, progress |
| CTAButton | Onboarding, Lessons | text, variant |

**Skill**: [component-building](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/component-building/SKILL.md)

### Phase 6: Build the Code

> [!IMPORTANT]
> There are TWO output modes. The user MUST specify one. If unspecified, DEFAULT to **PROTOTYPE**.

---

#### MODE 1: PROTOTYPE (Default)

**Trigger phrases:** "clone this", "clone this as a prototype", "prototype clone", or no mode specified.

**What it produces:** A single-page Vanilla HTML/CSS/JS mobile app that looks and feels like a native iOS app running in the browser. NO React. NO Vite. NO build step. NO `npm install`.

**Architecture rules:**
- ONE `index.html` file containing ALL screens as `<div class="screen" id="screen-[name]">` sections
- ONE `style.css` file with all styling (mobile-first, iOS-accurate dimensions)
- ONE `app.js` file with screen navigation via JavaScript class toggling
- Navigation uses `screen.classList.add('active')` / `screen.classList.remove('active')` — no routing libraries
- Bottom tab bar with SVG icons (iOS-style)
- Flow headers with back buttons and close buttons
- iOS safe area insets respected (`env(safe-area-inset-*)`)
- Viewport meta tag: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- The page MUST render at mobile phone dimensions by default (max-width ~430px centered on desktop)

**Why this mode exists:** This is what produced the Hims clone — the gold standard. Because everything lives in one file, the AI never loses context between components. The result looks exactly like a native app and can be used immediately for demos, content creation, and client presentations.

**File structure:**
```
[app-name]/
├── index.html      (ALL screens, ALL markup)
├── style.css       (ALL styles, design tokens at top)
├── app.js          (navigation logic, interactions)
└── images/         (any extracted or generated assets)
```

---

#### MODE 2: SHELL

**Trigger phrases:** "clone this as a shell", "shell clone", "build a shell".

**What it produces:** A fully scaffolded React + Vite (or Next.js) project with modular components, file-based routing, and a proper `src/` directory structure. Requires `npm install` + `npm run dev` to run.

**Architecture rules:**
- Standard Vite + React scaffold (`npx create-vite`)
- Each screen becomes its own component in `src/components/` or `src/pages/`
- Shared components (NavBar, TabBar, Card, Button) in `src/components/shared/`
- Design tokens in `src/styles/tokens.css`
- React Router for navigation
- Props and state management for interactive elements

**Why this mode exists:** Shells are for actual development — when you want to build ON TOP of the clone, add a real backend, deploy to GitHub, or hand it to another developer. The tradeoff is it won't look as instantly polished as a Prototype.

**File structure:**
```
[app-name]/
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── images/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles/
    │   └── tokens.css
    ├── components/
    │   ├── shared/
    │   │   ├── NavBar.jsx
    │   │   ├── TabBar.jsx
    │   │   └── Button.jsx
    │   └── screens/
    │       ├── HomeScreen.jsx
    │       ├── ProfileScreen.jsx
    │       └── ...
    └── assets/
```

---

#### Build Order (Both Modes)

1. `tokens.css` first (design tokens extracted from Mobbin detail views)
2. Base layout (app shell, nav bar, tab bar)
3. Each screen in flow order
4. Navigation between screens
5. Animations and transitions (CSS transitions for Prototype, framer-motion optional for Shell)
6. Polish (responsive, real content, no placeholders)

**Skills applied in order:**
1. [experience-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/experience-designing/SKILL.md) — tokens
2. [component-building](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/component-building/SKILL.md) — components
3. [animation-designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/animation-designing/SKILL.md) — transitions
4. [mobile-first-enforcing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/mobile-first-enforcing/SKILL.md) — 320px baseline
5. [anti-mock-enforcing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/anti-mock-enforcing/SKILL.md) — real content

---

## Clone vs Customize

| Mode | What to Do |
|------|-----------|
| **"Clone this"** (Default) | 1:1 structural + visual clone. Match every screen exactly. |
| **"Clone with changes"** | **Step 1**: Build 1:1 clone. **Step 2**: Apply changes after clone works. Two separate steps. |
| **"Adapt this"** | Use the [Mobbin Librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/mobbin-librarian.md) + [pattern-referencing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/pattern-referencing/SKILL.md) IAAA method instead. |

---

## Hard Rules

### ALWAYS
- ALWAYS stay on the Flows tab
- ALWAYS read the flow tree from DOM first (Phase 1) before clicking
- ALWAYS click into each screen's detail view for extraction
- ALWAYS use SVG icons (lucide-react, heroicons, or inline SVG)
- ALWAYS build mobile-first (320px baseline)
- ALWAYS include working navigation between all screens
- ALWAYS use real or realistic content

### NEVER
- NEVER use emojis as icons
- NEVER skip screens — clone ALL of them
- NEVER mix cloning and customizing in the same step
- NEVER use Stitch or screenshot-to-code tools
- NEVER skip `tokens.css`
- NEVER build desktop-first
- NEVER guess at colors — extract from detail view
- NEVER rely on thumbnails — they are too small and low-res

---

## Pre-Completion Checklist

- [ ] Flow tree read from DOM (all sections, flows, sub-flows)
- [ ] Every screen clicked and viewed in detail
- [ ] Screen inventory table complete
- [ ] Design tokens in `tokens.css`
- [ ] Reusable components identified and built
- [ ] Code runs locally
- [ ] Navigation works between all screens
- [ ] Animations match original
- [ ] Mobile-first verified (320px)
- [ ] No emojis — only SVG icons
- [ ] No mock/placeholder content

---

## Skills References

| Skill | Phase | Purpose |
|-------|-------|---------|
| [Experience Designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/experience-designing/SKILL.md) | 4 | Design tokens |
| [Component Building](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/component-building/SKILL.md) | 5 | Reusable components |
| [Animation Designing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/animation-designing/SKILL.md) | 6 | Transitions |
| [Mobile-First Enforcing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/mobile-first-enforcing/SKILL.md) | 6 | Responsive |
| [Anti-Mock Enforcing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/anti-mock-enforcing/SKILL.md) | 6 | No placeholders |
| [Pattern Referencing](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/.agents/skills/pattern-referencing/SKILL.md) | Only if adapting | IAAA method |
| [Mobbin Librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/mobbin-librarian.md) | Only if adapting | Full IAAA pipeline |

---

## Related Librarians

- [mobbin-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/mobbin-librarian.md) — Pattern adaptation (IAAA)
- [flow-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/flow-librarian.md) — Flow validation
- [mobile-first-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/mobile-first-librarian.md) — Mobile compliance
- [experience-designer-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/experience-designer-librarian.md) — Design system
- [frontend-librarian](file:///Users/franklawrencejr./Downloads/skills-library-v2%202/librarians/frontend-librarian.md) — Component architecture
