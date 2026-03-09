# Product Spec Skill

**Plain language in → structured spec out. Just enough to build fast.**

---

## Context Questions

Before creating a spec, ask:

1. **What's the project type?** — SaaS, mobile app, landing page, dashboard, game
2. **Who's the spec for?** — Solo building, team handoff, client approval, investor pitch
3. **What's the complexity?** — Simple (3-5 screens), medium (5-10), complex (10+)
4. **What's the timeline?** — Ship fast (minimal spec), planned build (full spec)
5. **Are there animations/interactions?** — Static, basic transitions, animation-heavy

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Detail | Minimal (2 min) ←→ Full spec (10 min) |
| Audience | Personal notes ←→ Client deliverable |
| Format | Plain language ←→ Structured template |
| Scope | MVP only ←→ Full feature roadmap |
| Technical | Concept only ←→ Stack + data model |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick solo build | Minimal Spec (1-2 min), just core screens + features |
| Complex app | Full Spec with user flows, data model, build order |
| Client project | Full Spec for approval, include timeline and scope |
| Animation-heavy | Spec + animation-planning/SKILL.md before coding |
| Just exploring | Skip spec entirely, build and discover |
| Team handoff | Full Spec with technical stack and dependencies |

---

## TL;DR

Two ways to start any project:

**Option 1: Voice/Chat (Fastest)**
```
"I want to build [plain language description]"
→ AI creates spec using this skill
→ You approve or adjust
→ Start building
```

**Option 2: Fill-in Template (More Control)**
```markdown
## [App Name]
**One sentence:** 
**Core screens:** 
**Must-have features:** 
**Stack:** [from COMMON-COMBOS]
```

---

## Why This Format

| Approach | Pros | Cons | Best For |
|----------|------|------|----------|
| Full PRD | Complete, no ambiguity | Slow, overkill for solo | Enterprise, teams |
| Plain language only | Fast, natural | AI may interpret wrong | Simple apps |
| **Quick Spec (this)** | Fast, clear, AI-optimized | Less detailed | Vibe coding, solo dev |

**Quick Spec wins for vibe coding** because:
- Takes 2 minutes, not 2 hours
- Captures enough to prevent wrong turns
- AI can execute immediately
- You stay in flow

---

## The Quick Spec Format

### Minimal Spec (1-2 minutes)

```markdown
# [App Name]

## What It Is
[One sentence description]

## Core Screens
1. [Screen 1 - what happens here]
2. [Screen 2 - what happens here]
3. [Screen 3 - what happens here]

## Must-Have Features
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

## Stack
[Reference from COMMON-COMBOS.md or custom]

## First Build
[What to build first - usually the core loop]
```

### Full Spec (5-10 minutes, complex apps)

```markdown
# [App Name]

## What It Is
[One sentence description]

## Target User
[Who uses this, one line]

## Core Screens

### 1. [Screen Name]
- Purpose: [Why this screen exists]
- Key elements: [What's on it]
- Actions: [What user can do]

### 2. [Screen Name]
- Purpose: 
- Key elements:
- Actions:

[Repeat for each screen]

## User Flows

### Primary Flow: [Name]
1. User lands on [screen]
2. User does [action]
3. System responds with [outcome]
4. User sees [result]

### Secondary Flow: [Name]
[Same format]

## Must-Have Features (MVP)
- [ ] Feature 1 - [one line description]
- [ ] Feature 2
- [ ] Feature 3

## Nice-to-Have (Post-MVP)
- [ ] Feature 4
- [ ] Feature 5

## Stack
[From COMMON-COMBOS.md]

Blueprint: [app-types/___/SKILL.md]
Core: [list skills]
Timeline: [estimate]

## Data Model (if complex)

### User
- id, email, name, created_at

### [Entity 2]
- fields

## First Build Order
1. [Component/screen 1]
2. [Component/screen 2]
3. [Integration]
4. [Polish]

## Open Questions
- [Anything unclear?]
```

---

## Information Architecture Basics

### When You Need IA

| App Type | IA Needed? | Why |
|----------|------------|-----|
| Landing page | No | Linear, one path |
| Simple app (3-5 screens) | Minimal | Just list screens |
| Complex app (10+ screens) | Yes | Prevent navigation chaos |
| Dashboard/Admin | Yes | Many entry points |

### Quick IA Patterns

**Pattern 1: Hub & Spoke (Most Common)**
```
        [Home/Dashboard]
       /    |    |    \
   [A]    [B]   [C]   [D]
```
Use for: Dashboards, admin panels, multi-feature apps

**Pattern 2: Linear Flow**
```
[Start] → [Step 1] → [Step 2] → [Result]
```
Use for: Onboarding, checkout, wizards

**Pattern 3: Tab-Based**
```
[Tab 1] | [Tab 2] | [Tab 3] | [Tab 4]
   ↓         ↓         ↓         ↓
 [View]   [View]   [View]   [View]
```
Use for: Mobile apps, content apps

**Pattern 4: Nested (Complex)**
```
[Section A]
  ├── [Subsection 1]
  │     ├── [Item]
  │     └── [Item]
  └── [Subsection 2]
[Section B]
  └── ...
```
Use for: Large apps, documentation, e-commerce

---

## From Plain Language to Spec

### The Conversion Process

**You say:**
> "I want to build a trading journal where I can log my trades, see my stats, and track what's working"

**AI creates:**

```markdown
# Trading Journal

## What It Is
Personal trading journal with performance analytics.

## Core Screens
1. Dashboard - See P&L, win rate, recent trades
2. Log Trade - Quick entry form for new trades
3. Trade History - Filterable list of all trades
4. Analytics - Charts and patterns

## Must-Have Features
- [ ] Log trade (symbol, entry, exit, size, notes)
- [ ] Calculate P&L automatically
- [ ] Win/loss rate display
- [ ] Filter by date, symbol, outcome

## Stack
Blueprint: dashboard/SKILL.md
+ agents/database/SKILL.md (Supabase for data)
+ agents/state-management/SKILL.md (TanStack Query)

## First Build
Log Trade form → Trade History list → Dashboard stats
```

### Prompt to Generate Spec

Use this when starting a project:

```
I want to build [your plain language description].

Create a Quick Spec using this format:
1. What It Is (one sentence)
2. Core Screens (3-5, with what happens on each)
3. Must-Have Features (MVP only)
4. Stack (reference COMMON-COMBOS.md)
5. First Build (what to build first)

Keep it minimal. I'm vibe coding.
```

---

## When to Use What

| Scenario | Use |
|----------|-----|
| Quick idea, want to start now | Minimal Spec (1-2 min) |
| Bigger app, need clarity | Full Spec (5-10 min) |
| Client project | Full Spec + user review |
| Just exploring | Skip spec, just build |
| Animation-heavy | Spec + animation-planning/SKILL.md |

---

## Content Planning (If Needed)

### For Content-Heavy Apps

Add this section to your spec:

```markdown
## Content Structure

### Content Types
1. [Type 1] - [description]
   - Fields: title, body, image, category
   
2. [Type 2]
   - Fields: ...

### Content Relationships
- [Type 1] has many [Type 2]
- [Type 2] belongs to [Category]

### Content Sources
- [ ] User-generated
- [ ] CMS (which?)
- [ ] API (which?)
- [ ] Static
```

---

## Integration with Skills Library

### After Creating Spec

1. **Route to blueprint:** `STACK-ROUTER.md`
2. **Get full stack:** `COMMON-COMBOS.md`
3. **Look up specifics:** `SKILL-INDEX.md`
4. **If animation-heavy:** `animation-planning/SKILL.md` BEFORE coding

### Example Flow

```
Plain language idea
     ↓
Quick Spec (this skill)
     ↓
STACK-ROUTER → Pick blueprint
     ↓
COMMON-COMBOS → Get skill stack
     ↓
Start building (follow skill order)
```

---

## Templates by App Type

### SaaS / Dashboard

```markdown
# [SaaS Name]

## What It Is
[One sentence]

## Core Screens
1. Dashboard - Key metrics and quick actions
2. [Core Feature] - Main functionality
3. Settings - Account, billing, preferences
4. (Optional) Team - Invite, manage members

## Must-Have Features
- [ ] Auth (Clerk)
- [ ] [Core feature 1]
- [ ] [Core feature 2]
- [ ] Billing (Stripe)

## Stack
COMMON-COMBOS → "SaaS Dashboard - Production Stack"
```

### Mobile App

```markdown
# [App Name]

## What It Is
[One sentence]

## Core Screens
1. Home - Primary action/content
2. [Feature Screen] - Key functionality
3. Profile - User info, settings
4. (Tab bar navigation)

## Must-Have Features
- [ ] Auth
- [ ] [Core feature]
- [ ] Push notifications (if needed)

## Stack
COMMON-COMBOS → "Mobile App" combo
```

### Landing Page

```markdown
# [Site Name]

## What It Is
[One sentence]

## Sections
1. Hero - Headline, CTA
2. Features - What it does
3. Social Proof - Testimonials/logos
4. Pricing (if applicable)
5. CTA - Final conversion
6. Footer

## Stack
COMMON-COMBOS → "Landing Page" combo

## Animation Focus
Use animation-planning/SKILL.md for:
- [ ] Hero entrance
- [ ] Scroll reveals
- [ ] Hover states
```

---

## Quick Reference

**Start every project with:**
```
"I want to build [plain language]. Create a Quick Spec."
```

**The AI will output:**
1. What It Is
2. Core Screens
3. Must-Have Features
4. Stack
5. First Build

**Then:**
- Approve or adjust
- Follow the stack
- Build

---

## Related Skills

- `tech-stack/STACK-ROUTER.md` - Route to blueprint
- `tech-stack/COMMON-COMBOS.md` - Full skill stacks
- `tech-stack/SKILL-INDEX.md` - Specific need lookup
- `workflows/animation-planning/SKILL.md` - Pre-animation planning
- `workflows/research/SKILL.md` - Finding references
