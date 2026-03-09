---
name: multi-tool-ai-workflow
description: Workflow for using multiple AI tools together. Planning, skeleton, features, review.
last_updated: 2026-03
owner: Frank
---

# Multi-Tool AI Workflow

How to use different AI tools together for building fast.

> **See also:** `platforms/cursor/SKILL.md`, `platforms/antigravity/SKILL.md`

---

## Context Questions

Before using multi-tool workflow, ask:

1. **What's the project stage?** — New, existing, refactoring
2. **What's the complexity?** — Simple feature, full app, complex system
3. **Which tools available?** — Antigravity, Cursor, Claude Code, AI Studio
4. **What's strongest for this task?** — Planning, generation, implementation, review
5. **What's the handoff format?** — Code, prompts, specs

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Depth** | Quick task ←→ Full project |
| **Tools** | Single tool ←→ Full pipeline |
| **Handoff** | Copy-paste ←→ Structured |
| **Focus** | Speed ←→ Quality |
| **Stage** | Planning ←→ Review |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Starting from scratch | Antigravity (plan) → AI Studio (skeleton) → Cursor |
| Adding major feature | Antigravity (plan) → Cursor (build) |
| Small feature/fix | Cursor directly |
| Need code review | Claude Code |
| Design breakdown needed | Antigravity with Gemini |
| Fast iteration needed | Cursor with skills |

---

## TL;DR

| Phase | Tool | Purpose |
|-------|------|---------|
| 1. Ideation | Antigravity (Opus 4.5) | Structured planning, prompt generation |
| 2. Skeleton | Google AI Studio | Initial build, design system, page structure |
| 3. Features | Cursor | Feature development, component by component |
| 4. Review | Claude Code | Code review, refactoring, quality check |

---

## The Workflow

```
IDEATION          SKELETON           FEATURES          REVIEW
[Antigravity] --> [AI Studio] --> [Cursor] --> [Claude Code]
     |                |               |              |
  Planning         Initial        Feature         Quality
  Prompts          Build          by Feature      Check
```

---

## Phase 1: Ideation (Antigravity / Opus 4.5)

**When:** Starting a new project or major feature
**Use for:** Structured planning, generating prompts for other tools

### What You Get
- Project spec
- Screen breakdown
- Prompt to hand off to skeleton phase

### Prompt Template
```
I'm building [PROJECT].

Break this down into:
1. Core screens/pages needed
2. Key components per screen
3. Data models
4. API routes

Then generate a prompt I can give to AI Studio to build the skeleton.
```

### Output Format
```
## Project: [Name]

### Screens
1. [Screen] — [Purpose]
2. [Screen] — [Purpose]

### Components per Screen
[Screen 1]:
- [Component]
- [Component]

### Data Models
- [Model]: [fields]

### Handoff Prompt for AI Studio
[Copy this to AI Studio]
```

---

## Phase 2: Skeleton (Google AI Studio)

**When:** Building initial structure, design system, page shells
**Use for:** Fast scaffolding, design tokens, layout structure

### What You Build
- Design tokens (colors, typography, spacing)
- Page layouts (shells, not full features)
- Component structure (placeholders)
- Navigation

### Prompt Template
```
Build the skeleton for [PROJECT].

Include:
1. Design tokens (dark mode, professional colors)
2. Layout for these pages: [list]
3. Placeholder components for: [list]
4. Navigation structure

Use Next.js 16.1.1  TypeScript, Tailwind, shadcn/ui.
No placeholder text — use realistic content.
```

### Output
- Working Next.js app with pages
- Design system in place
- Components stubbed out
- Ready for feature development

---

## Phase 3: Features (Cursor)

**When:** Building out each feature/screen
**Use for:** Component implementation, API integration, interactivity

### How It Works
1. Open Cursor with project
2. Point to skills library: `skills-library-v2/`
3. Work screen by screen

### Prompt Template
```
Build the [FEATURE] feature.

Read these skills first:
- agents/[relevant-skill]/SKILL.md
- agents/[relevant-skill]/SKILL.md

Then implement:
1. [Component 1]
2. [Component 2]
3. [API integration]

Follow the output format from cursor-skills rules.
```

### Work Flow
```
Screen 1: Dashboard
├── Build header component
├── Build stats cards
├── Build chart section
└── Connect to API

Screen 2: Trade Journal
├── Build entry form
├── Build entry list
├── Add CRUD operations
└── Connect to database

Screen 3: Options Calculator
├── Build calculator inputs
├── Build result display
├── Add calculation logic
└── Add real-time updates
```

### Per-Feature Output
```
Feature: [Name]

Skills Used:
- [skill] — [what from it]

Completed:
- [x] [Specific thing]
- [x] [Specific thing]

Next:
- [ ] [What's next]
```

---

## Phase 4: Review (Claude Code)

**When:** Feature is "done" — needs quality check
**Use for:** Code review, refactoring, catching issues

### What to Check
- Code quality
- Performance issues
- Missing error handling
- Type safety
- Test coverage

### Prompt Template
```
Review this [FEATURE] implementation.

Check for:
1. Missing error handling
2. Type safety issues
3. Performance problems
4. Code that could be cleaner

Be critical. List specific issues with file:line references.
Then suggest fixes.
```

### Output Format
```
## Code Review: [Feature]

### Issues Found
| File | Line | Issue | Severity |
|------|------|-------|----------|
| [file] | [line] | [issue] | High/Med/Low |

### Suggested Fixes
1. [Fix with code example]
2. [Fix with code example]

### Overall
[Brief assessment]
```

---

## Tool Comparison

| Tool | Strength | Weakness | Best For |
|------|----------|----------|----------|
| Antigravity (Opus) | Deep planning, structure | Slower | Planning, complex reasoning |
| Google AI Studio | Fast generation, broad knowledge | Less code-focused | Skeleton, design system |
| Cursor | Code-aware, fast iteration | Needs direction | Feature by feature |
| Claude Code | Code review, refactoring | Limited context | Quality check |

---

## When to Use Each

### Use Antigravity/Opus When:
- Starting from scratch
- Need a structured plan
- Generating prompts for other tools
- Complex architectural decisions

### Use AI Studio When:
- Initial scaffold/skeleton
- Design system setup
- Broad code generation
- Multi-file creation

### Use Cursor When:
- Feature implementation
- Component by component work
- Bug fixes
- Quick iterations

### Use Claude Code When:
- Code review after feature done
- Refactoring existing code
- Quality checks
- Before deployment

---

## Example: Trading Dashboard

### Phase 1: Antigravity
```
Prompt: Break down a trading dashboard with:
- Trade journal
- Options calculator
- Economic calendar
- Watchlist

Generate a skeleton prompt for AI Studio.
```

### Phase 2: AI Studio
```
Build skeleton for trading dashboard.
5 pages: Dashboard, Journal, Calculator, Calendar, Watchlist.
Dark theme, professional. Next.js 16.1.1 
```

### Phase 3: Cursor (per feature)
```
Build the Economic Calendar feature.
Read: agents/backend-patterns/SKILL.md
Read: agents/design-system/SKILL.md

Include:
- This week / next week / last week tabs
- Dynamic date calculation (not hardcoded)
- Event list with categories
- News integration (default to SPY)
```

### Phase 4: Claude Code
```
Review the Economic Calendar implementation.
Check for:
- Hardcoded dates (should be dynamic)
- Missing error handling on API calls
- Type safety
```

---

## Handoff Templates

### Antigravity to AI Studio
```
Build this skeleton:
[paste Antigravity output]

Use: Next.js 16.1.1  TypeScript, Tailwind, shadcn/ui
Include design tokens and page layouts.
```

### AI Studio to Cursor
```
I have a skeleton project. Now build [FEATURE].

Skills to use:
- [skill 1]
- [skill 2]

Implement:
- [component 1]
- [component 2]
```

### Cursor to Claude Code
```
Review this feature I just built: [FEATURE]

Files:
- [file 1]
- [file 2]

Check for issues and suggest improvements.
```

---

## Decision Tree

```
Starting new project?
├── Yes → Antigravity (plan) → AI Studio (skeleton) → Cursor (features)
└── No, existing project
    ├── Adding major feature?
    │   ├── Yes → Antigravity (plan) → Cursor (build)
    │   └── No, small feature → Cursor directly
    └── Reviewing code?
        └── Claude Code
```

---

## Related Skills

- [platforms/cursor/SKILL.md](/platforms/cursor/SKILL.md) — Cursor setup
- [platforms/antigravity/SKILL.md](/platforms/antigravity/SKILL.md) — Antigravity capabilities
- [platforms/google-ai-studio/SKILL.md](/platforms/google-ai-studio/SKILL.md) — AI Studio usage
- [workflows/product-spec/SKILL.md](/workflows/product-spec/SKILL.md) — Creating specs
- [direct-paths/handoffs/](/direct-paths/handoffs/) — Handoff templates
