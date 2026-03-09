---
name: framework-overview
description: The master map of the skills library. Where everything is and how it connects.
---

# Framework Overview

The complete map of your AI-assisted development system.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR WORKFLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   IDEATE ──→ SPEC ──→ BUILD ──→ REVIEW ──→ SHIP ──→ MAINTAIN   │
│     │         │        │         │         │          │         │
│     ▼         ▼        ▼         ▼         ▼          ▼         │
│  Brainstorm  Pipeline  Agents   Checklists Deploy   Refactor    │
│  Research    App-Types Skills   Security  Publish   Support     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Navigation

| I Want To... | Go To |
|--------------|-------|
| **Start a project** | `/packs/PACKS.md` → Find your project type |
| **Brainstorm ideas** | `/workflows/brainstorm/SKILL.md` |
| **Get design direction** | `/prompt-craft/SKILL.md` |
| **Build something** | `/agents/[tool]/SKILL.md` |
| **Check my platform** | `/platforms/[platform]/PLATFORM.md` |
| **Review quality** | Checklists in each skill file |
| **Ship fast** | `/workflows/ship-fast/SKILL.md` |
| **Estimate value** | `/workflows/app-status/SKILL.md` |
| **Find inspiration** | `/prompt-craft/RESOURCES.md` |

---

## Folder Map

```
cursor-skills/
│
├── _meta/                    # How to work with AI
│   ├── COLLABORATION.md      # Communication style
│   ├── RESPONSE-FORMAT.md    # How AI should respond
│   └── YOUR-WORKFLOW.md      # Customizing for you
│
├── _security/                # Security practices
│   ├── SECURITY.md           # General security
│   └── APP-SECURITY.md       # App-specific (auth, API, etc.)
│
├── _checkpoints/             # Progress tracking
│   └── CHECKPOINTS.md        # Save/resume system
│
├── platforms/                # IDE-specific guides
│   ├── cursor/PLATFORM.md    # Cursor setup + features
│   ├── claude-code/PLATFORM.md
│   └── anti-gravity/PLATFORM.md
│
├── prompt-craft/             # Design language (AI-agnostic)
│   ├── SKILL.md              # Overview + NotebookLM integration
│   ├── ANIMATION.md          # Motion, timing, effects
│   ├── STYLING.md            # Colors, themes, shadows
│   ├── TYPOGRAPHY.md         # Fonts, pairing, scale
│   ├── LAYOUT.md             # Responsive, grids, components
│   └── RESOURCES.md          # Inspiration + tools + assets
│
├── agents/                   # Technical skills
│   ├── gsap/SKILL.md         # Complex animation, scroll
│   ├── motion/SKILL.md       # React animation (was Framer Motion)
│   ├── r3f/SKILL.md          # 3D with React
│   ├── ai-sdk/SKILL.md       # Vercel AI SDK (text/chat only)
│   ├── google-ai-studio/     # Image gen, video, voice
│   ├── database/SKILL.md     # Prisma + Supabase
│   ├── tailwind/SKILL.md     # Styling
│   ├── stripe/SKILL.md       # Payments, subscriptions
│   ├── testing/SKILL.md      # Vitest, Testing Library, Playwright
│   ├── error-handling/SKILL.md # Error boundaries, API errors
│   ├── a11y/SKILL.md         # Accessibility, ARIA, keyboard
│   ├── seo/SKILL.md          # Meta tags, structured data, sitemap
│   ├── deployment/SKILL.md   # CI/CD, environment variables
│   └── prompting/SKILL.md    # How to prompt for specific outputs
│
├── content/                  # Copy and content
│   ├── copy/SKILL.md         # Product copy, headlines, CTAs
│   ├── legal/SKILL.md        # Privacy, terms, agreements
│   └── support/SKILL.md      # FAQ, help docs, support flow
│
├── app-types/                # Project templates
│   ├── dashboard/SKILL.md    # Admin panels
│   └── mobile/SKILL.md       # Expo/React Native
│
├── design-system/            # Visual consistency
│   ├── SKILL.md              # Core design system
│   ├── DESIGN-INNOVATION.md  # Standing out
│   └── VIRAL-IMPACT.md       # Memorable design
│
├── workflows/                # Process guides
│   ├── pipeline/SKILL.md     # Router → Publisher (7 phases)
│   ├── app-status/SKILL.md   # Project summary + value calc
│   ├── app-cost/SKILL.md     # Infrastructure costs + pricing
│   ├── brainstorm/SKILL.md   # Ideation mode
│   ├── research/SKILL.md     # Discovery
│   ├── ship-fast/SKILL.md    # Speed mode
│   └── review-refactor/SKILL.md
│
├── content/                  # Copy and content (NEW)
│   ├── copy/SKILL.md         # Product copy, headlines
│   └── legal/SKILL.md        # Privacy, terms, agreements
│
├── packs/                    # Quick-load bundles
│   └── PACKS.md              # Menu of skill groupings
│
├── tech-stack/               # Stack decisions
│   └── SKILL.md              # Default stack + alternatives
│
└── workspace/                # Project organization
    └── WORKSPACE.md          # Directory structure
```

---

## The Workflow (Flexible Entry Points)

You can start ANYWHERE. Here's what each phase does:

### 1. IDEATE

**Files:**
- `/workflows/brainstorm/SKILL.md`
- `/prompt-craft/RESOURCES.md`
- `/design-system/VIRAL-IMPACT.md`

**What happens:**
- Explore ideas freely
- Find inspiration
- No execution yet

### 2. SPEC

**Files:**
- `/workflows/pipeline/SKILL.md` (Phase 2: Spec)
- `/app-types/[type]/SKILL.md`
- `/tech-stack/SKILL.md`

**What happens:**
- Define what you're building
- List features and acceptance criteria
- Choose stack

### 3. BUILD

**Files:**
- `/platforms/[platform]/PLATFORM.md`
- `/agents/[tool]/SKILL.md`
- `/prompt-craft/[domain].md`

**What happens:**
- Write code
- Reference skills as needed
- Use checkpoints

### 4. REVIEW

**Files:**
- `/workflows/pipeline/SKILL.md` (Phase 5: Fix)
- `/_security/APP-SECURITY.md`
- Checklists in each skill file

**What happens:**
- Run through checklists
- Fix issues
- Security review

### 5. SHIP

**Files:**
- `/workflows/pipeline/SKILL.md` (Phase 6-7: Package + Publish)
- `/workflows/ship-fast/SKILL.md`

**What happens:**
- Package release
- Deploy
- Create assets

### 6. MAINTAIN

**Files:**
- `/workflows/app-status/SKILL.md`
- `/workflows/review-refactor/SKILL.md`
- `/content/legal/SKILL.md`

**What happens:**
- Track status
- Refactor as needed
- Update legal/support docs

---

## Entry Points by Situation

| Situation | Start Here |
|-----------|------------|
| "I have an idea" | `/workflows/brainstorm/SKILL.md` |
| "I know what to build" | `/workflows/pipeline/SKILL.md` Phase 2 |
| "I'm ready to code" | `/platforms/[platform]/PLATFORM.md` |
| "I need design direction" | `/prompt-craft/SKILL.md` |
| "Something's broken" | `/workflows/pipeline/SKILL.md` Phase 5 |
| "I need to ship NOW" | `/workflows/ship-fast/SKILL.md` |
| "What have I built?" | `/workflows/app-status/SKILL.md` |
| "I need inspiration" | `/prompt-craft/RESOURCES.md` |

---

## Workspace Strategy

### One Skills Library, Multiple Projects

```
~/
├── .claude/
│   └── skills/
│       └── cursor-skills/    # ONE copy (source of truth)
│
├── projects/
│   ├── app-1/                # Project workspace
│   │   └── .cursor/rules/    # Contains cursor-skills.mdc
│   │
│   ├── app-2/
│   │   └── .cursor/rules/
│   │
│   └── app-3/
│       └── .cursor/rules/
```

### How to Reference

**Option A: Claude Code**
Skills live at `~/.claude/skills/cursor-skills/` - Claude Code finds them automatically.

**Option B: Cursor**
Use `.cursor/rules/cursor-skills.mdc` which references the full library.

**Option C: NotebookLM**
Upload skill files to notebook, reference in conversation.

**Option D: Copy What You Need**
Copy only the relevant skill files into each project's docs folder.

---

## NotebookLM Integration

### Recommended Notebooks

| Notebook | What to Upload |
|----------|----------------|
| **Design Intelligence** | All `/prompt-craft/` files + trend research |
| **[Project Name]** | Relevant skills for that project |
| **Tech Reference** | Agent skills you use most |

### Workflow

1. Before building: "What design direction for [topic]?" → Design Intelligence notebook
2. While building: Reference specific skill files
3. After building: Update project notebook with decisions made

---

## Resource Checklist

When ideating, check these:

**Inspiration:**
- [ ] Supahero (hero sections)
- [ ] Mobbin (real products)
- [ ] Dribbble (creative visuals)
- [ ] Bento Grids (layouts)

**Assets:**
- [ ] Iconify Solar (icons)
- [ ] SVG Logo (brand logos)
- [ ] Unsplash (photos)
- [ ] Unicorn Studio (backgrounds)

**Colors:**
- [ ] Coolors (palettes)
- [ ] Realtime Colors (preview on UI)
- [ ] WebAIM (contrast check)

**Typography:**
- [ ] Google Fonts
- [ ] Fontpair (pairings)

Full list: `/prompt-craft/RESOURCES.md`

---

## Quick Commands

Tell your AI:

```
"Load the [Pack Name] pack and let's build [description]"

"Read /prompt-craft/SKILL.md and give me design direction for [topic]"

"Read /workflows/pipeline/SKILL.md and help me spec out [feature]"

"Read /agents/stripe/SKILL.md and implement payments for [product]"

"Read /workflows/app-status/SKILL.md and summarize what we've built"
```

---

## Remember

- **Start anywhere** - The system is flexible
- **Reference as needed** - Don't read everything, read what's relevant
- **Checklists at the end** - Each skill has review items
- **One source of truth** - Keep skills library in one place
- **NotebookLM for context** - Upload files + research for grounded responses
