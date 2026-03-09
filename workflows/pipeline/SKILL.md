---
name: pipeline
description: Universal build pipeline. Router → Spec → Build → Run → Fix → Package → Publish. Use for any project from idea to deployed.
---

# Pipeline Workflow

Idea to deployed. One flow.

## TL;DR

```
ROUTER → SPEC → BUILD → RUN → FIX → PACKAGE → PUBLISH
   ↓       ↓       ↓      ↓      ↓       ↓         ↓
 What?   Tasks   Code   Test   Errors  Assets   Deploy
```

---

## Context Questions

Before entering the pipeline, ask:

1. **What's the input type?** — Idea, specific feature, bug fix, deployment request
2. **Is this a new project or existing?** — New project, existing codebase, migration
3. **What's the clarity level?** — Vague concept, clear requirements, fully specced
4. **What's the urgency?** — Exploration, normal pace, ship fast
5. **What's the expected output?** — Prototype, MVP, production-ready

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Clarity | Vague idea ←→ Fully specced |
| Scope | Single task ←→ Full project |
| State | Greenfield ←→ Mature codebase |
| Urgency | Exploratory ←→ Ship now |
| Complexity | Simple fix ←→ Multi-phase build |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| New idea, unclear scope | Start at Spec phase, break down into tasks |
| Clear feature request | Jump to Build phase directly |
| Error message / bug | Go straight to Fix phase |
| Ready to ship | Package → Publish flow |
| Vague request | Ask one clarifying question, then route |
| Existing project + new feature | Load context first, then Spec → Build |

---

## Phase 1: Router

**Question:** What kind of task is this?

| Input | Route To |
|-------|----------|
| "I have an idea for..." | Spec phase (needs breakdown) |
| "Build [specific feature]" | Build phase (clear enough) |
| "Fix [error]" | Fix phase (has context) |
| "Deploy" | Package → Publish |
| "What's the status?" | App Status skill |
| "Let's brainstorm" | Brainstorm workflow |

### Router Decision Tree

```
Is this a new project?
├── Yes → Load relevant pack first, then Spec
└── No → Existing project
         ├── Clear task? → Build
         ├── Has error? → Fix
         ├── Ready to ship? → Package
         └── Vague? → Ask one clarifying question
```

---

## Phase 2: Spec (Idea → Tasks)

**Input:** Messy idea, feature request, vague goal
**Output:** Checklist + acceptance criteria

### Template

```markdown
## Feature: [Name]

### What It Does
[One sentence]

### Why It Matters
[User benefit]

### Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Acceptance Criteria
- [ ] When [action], [expected result]
- [ ] [Specific measurable outcome]

### Out of Scope
- [What we're NOT doing]

### Estimated Effort
- Traditional: [X hours]
- With AI: [Y hours]
```

### Example

```markdown
## Feature: Worry-to-Candle Animation

### What It Does
User types a worry, sees it transform into a candle that burns away.

### Why It Matters
Visual catharsis - watching worry literally disappear.

### Tasks
- [ ] Text input with character limit
- [ ] Text-to-candle morph animation (GSAP)
- [ ] Candle burn animation (GSAP timeline)
- [ ] Ash/smoke particle effect
- [ ] Reset/new worry button

### Acceptance Criteria
- [ ] Worry text visually transforms (not just disappears)
- [ ] Burn animation takes 5-10 seconds
- [ ] Mobile responsive
- [ ] Works without page reload

### Out of Scope
- AI image generation (v2)
- Sound effects (v2)

### Estimated Effort
- Traditional: 8 hours
- With AI: 2 hours
```

---

## Phase 3: Build

**Input:** Clear task from Spec
**Output:** Code changes

### Build Approach

```
1. Check relevant skills
   - Animation? → GSAP/Motion skill
   - Database? → Database skill
   - AI feature? → AI-SDK or Google AI Studio skill

2. Generate code
   - Follow project patterns
   - Use existing components
   - Don't over-engineer

3. Checkpoint
   - What was created
   - What files changed
   - What's next
```

### Build Rules

| Do | Don't |
|----|-------|
| One feature at a time | Multiple features at once |
| Use existing patterns | Invent new patterns |
| Match codebase style | Your preferred style |
| Test as you go | Build everything then test |

---

## Phase 4: Run

**Input:** Code changes from Build
**Output:** Working or error report

### Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm lint         # Check for issues

# Testing
pnpm test         # Run tests
pnpm test:e2e     # End-to-end tests

# Type checking
pnpm typecheck    # TypeScript errors
```

### What to Check

```
[ ] Dev server runs without errors
[ ] No TypeScript errors
[ ] No console errors in browser
[ ] Feature works as specified
[ ] Mobile responsive (if applicable)
```

---

## Phase 5: Fix

**Input:** Error from Run phase
**Output:** Patch that resolves error

### Fix Approach

```
1. Read the error message
   - What file?
   - What line?
   - What type of error?

2. Identify cause
   - Missing import?
   - Type mismatch?
   - Undefined variable?
   - Logic error?

3. Apply minimal fix
   - Don't refactor while fixing
   - One change at a time
   - Re-run after each change

4. If stuck
   - Search for error message
   - Check skill docs
   - Ask with full error context
```

### Common Fixes

| Error Type | Likely Fix |
|------------|------------|
| Module not found | `pnpm add [package]` |
| Type error | Check types, add assertion |
| Undefined | Check if value exists before using |
| Hydration | Add "use client" or check SSR |
| CORS | API route or proxy config |

---

## Phase 6: Package

**Input:** Working feature/app
**Output:** Release-ready artifacts

### Checklist

```markdown
## Release Package

### Assets
- [ ] App icon (1024x1024)
- [ ] OG image (1200x630)
- [ ] Screenshots (if App Store)
- [ ] Favicon

### Documentation
- [ ] README updated
- [ ] Changelog entry
- [ ] Version bumped

### Marketing (if needed)
- [ ] App Store description
- [ ] Social media copy
- [ ] Demo video/GIF

### Technical
- [ ] Environment variables documented
- [ ] Build passes
- [ ] No console errors/warnings
```

### Screenshots (App Store)

| Device | Size |
|--------|------|
| iPhone 6.7" | 1290 x 2796 |
| iPhone 6.5" | 1284 x 2778 |
| iPad 12.9" | 2048 x 2732 |

---

## Phase 7: Publish

**Input:** Packaged release
**Output:** Live deployment

### Deploy Commands

```bash
# Vercel (web)
vercel --prod

# Expo (mobile)
eas build --platform all
eas submit --platform ios
eas submit --platform android

# GitHub release
git tag v1.0.0
git push origin v1.0.0
```

### Post-Deploy

```markdown
## Deployment Complete

**Version:** [X.Y.Z]
**Date:** [Date]
**URL:** [Production URL]

### What's New
- [Feature 1]
- [Feature 2]

### Known Issues
- [Any known bugs]

### Next Up
- [What comes next]
```

---

## Using the Pipeline

### New Feature

```
"I want to add [feature]"
→ Router: New feature → Spec
→ Spec: Break down into tasks
→ Build: Code each task
→ Run: Test it works
→ Fix: (if errors)
→ Package: (when ready to release)
→ Publish: Deploy
```

### Bug Fix

```
"[Error message]"
→ Router: Has error → Fix
→ Fix: Identify and patch
→ Run: Verify fixed
→ (Continue or Publish)
```

### Quick Ship

```
"Deploy the current version"
→ Router: Deploy → Package
→ Package: Check release readiness
→ Publish: Deploy
```

---

## Pipeline + Checkpoints

Every phase transition = checkpoint.

```
After Spec:
## ✓ Done
- [x] Feature specced: [name]
- [x] Tasks identified: [count]

## → Next
- [ ] Build task 1

## 📋 Handoff
"[Feature] specced with [N] tasks. Start with [first task]."
```

This enables agent handoffs between phases.
