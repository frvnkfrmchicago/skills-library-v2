---
name: ship-fast
description: Ship-fast workflow for maximum velocity. Use when building features, MVPs, or prototypes. No blocking reviews, no extra steps, results first. Checkpoints track progress without stopping progress.
---

# Ship Fast Workflow

Results first. Review later.

## TL;DR

| Principle | Meaning |
|-----------|---------|
| Ship > Perfect | Working beats polished |
| Do > Explain | Build, explain if asked |
| Checkpoint > Gate | Track progress, don't block it |
| Fix forward | Ship broken, fix in prod |
| One thing | Focus on core feature |

---

## Context Questions

Before applying ship-fast workflow, ask:

1. **What's being built?** — MVP, feature, prototype, bug fix
2. **What's the core deliverable?** — One thing that must work
3. **What's the risk level?** — Auth/payments (slow down), UI/prototype (ship fast)
4. **What's the current blocker?** — Over-planning, perfectionism, unclear scope
5. **What's the deployment target?** — Vercel, Netlify, local demo, production

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Scope | Single feature ←→ Full MVP |
| Polish | Ugly but working ←→ Production-ready |
| Testing | Click-through only ←→ Full test suite |
| Documentation | None ←→ Full docs |
| Review | Ship immediately ←→ Review first |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| MVP or prototype | Ship fast, polish later, working > clean |
| Auth or payments | Slow down, security matters, test thoroughly |
| Bug fix | Fix forward, ship fast, verify in prod |
| UI feature | Ship ugly, get feedback, iterate |
| Over-planning | Stop planning, start building, one sentence scope |
| Internal tool | Ship immediately, iterate based on use |

---

## The Ship Fast Loop

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   DEFINE (1 min)                                        │
│      ↓                                                  │
│   BUILD (until working)                                 │
│      ↓                                                  │
│   CHECKPOINT (1 min)                                    │
│      ↓                                                  │
│   SHIP (5 min)                                          │
│      ↓                                                  │
│   ITERATE (repeat)                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Rules

### 1. One Sentence Definition
Before building, write ONE sentence:

```
"I'm building [thing] that [does what]."
```

Examples:
- "I'm building a form that submits user signups."
- "I'm building a chart that shows revenue over time."
- "I'm building an API that returns user data."

If you can't say it in one sentence, scope is too big.

### 2. No Pre-Building

**Don't:**
- Research for hours
- Plan every detail
- Design before coding
- Document before shipping

**Do:**
- Start building immediately
- Figure it out as you go
- Learn by doing
- Document after shipping

### 3. Working > Clean

**Ship with:**
- Hardcoded values (abstract later)
- Copy-pasted code (DRY later)
- `any` types (fix later)
- console.logs (remove later)
- Ugly UI (polish later)

**Don't ship with:**
- Broken core feature
- Security holes
- Data loss bugs

### 4. Checkpoint, Don't Gate

```
✓ Checkpoint: "Core feature works, UI ugly"
  → Ship it

✗ Gate: "Must pass code review before shipping"
  → Blocks velocity
```

### 5. Fix Forward

Found a bug in production?
1. Fix it
2. Ship the fix
3. Move on

Don't:
- Roll back (unless critical)
- Stop to analyze
- Create tickets for small things
- Schedule meetings

---

## Anti-Patterns to Avoid

### DON'T Do These

| Anti-Pattern | Why It's Bad |
|--------------|--------------|
| "Let me record this action" | Wastes time, you can see what happened |
| "Before we proceed, let me analyze..." | Over-thinking, just build |
| "Let me explain what I'm about to do" | Do it, explain if asked |
| "This should be reviewed first" | Ship, review after |
| "Let me create a plan document" | One sentence is enough |
| "Let me set up the testing framework" | Test after core works |
| "Let me optimize this first" | Optimize after shipping |

### DO These Instead

| Instead of | Do |
|------------|-----|
| Long analysis | Start building |
| Detailed plan | One sentence definition |
| Perfect code | Working code |
| Complete features | Core feature only |
| Pre-optimization | Ship, then optimize |
| Pre-documentation | Ship, then document |

---

## Speed Patterns

### Pattern 1: Scaffold Fast
```bash
# Don't configure, just start
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npx shadcn@latest init -d  # -d for defaults
```

### Pattern 2: Copy, Don't Write
- Copy from previous projects
- Copy from docs examples
- Copy from Stack Overflow
- Modify to fit

### Pattern 3: Use Defaults
- Default shadcn theme
- Default Tailwind config
- Default Prisma settings
- Customize later

### Pattern 4: Skip Optional
- Skip tests (add later)
- Skip analytics (add later)
- Skip error tracking (add later)
- Skip SEO (add later)

---

## When to Slow Down

**Slow down for:**
- Authentication (security critical)
- Payments (money critical)
- Data deletion (irreversible)
- Public APIs (hard to change)

**Keep shipping for:**
- UI/UX
- Internal tools
- Prototypes
- MVPs

---

## Checkpoint Template (Quick)

```markdown
## CP[N]: [one word]
- Works: [yes/no]
- Missing: [one thing]
- Ship: [yes/no]
```

Example:
```markdown
## CP1: Core
- Works: yes
- Missing: error states
- Ship: yes
```

---

## Deploy Commands

```bash
# Just ship it
vercel --prod

# Or for other platforms
netlify deploy --prod
railway up
fly deploy
```

---

## Minimal Testing (5 Minutes - DO THIS)

**Before you deploy**, spend 5 minutes:

```markdown
- [ ] Click every button (all work?)
- [ ] Fill every form (validates? submits?)
- [ ] Check mobile view (responsive?)
- [ ] Test edge cases (empty states, errors show?)
- [ ] Run: npm run build (TypeScript errors caught?)
```

**Why 5 minutes matters:**
- Broken buttons kill trust
- Form errors = lost users
- Mobile breaks = 60% of traffic gone
- Build errors = app won't deploy

**What you're NOT testing:**
- ❌ Edge cases (do later)
- ❌ Performance (optimize later)
- ❌ Cross-browser (ship Chrome first)
- ❌ Accessibility (add later)

**Just verify core functionality works.**

---

## Post-Ship

After shipping, you can:
- [ ] Add error handling
- [ ] Add loading states
- [ ] Polish UI
- [ ] Add tests
- [ ] Add analytics
- [ ] Optimize performance
- [ ] Document

But only if you want to. Shipping was the goal.

---

## Velocity Metrics

Track your shipping speed:

| Metric | Target |
|--------|--------|
| Idea to shipped | < 3 hours |
| Feature addition | < 1 hour |
| Bug fix | < 15 min |
| Checkpoint | < 1 min |

If you're slower, you're over-thinking.
