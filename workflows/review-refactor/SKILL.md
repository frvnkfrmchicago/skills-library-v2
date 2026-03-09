---
name: review-refactor
description: Post-ship review and refactoring workflow. Use AFTER shipping to improve code quality, fix tech debt, and optimize. This is separate from building - review when YOU decide to, not as a gate.
---

# Review & Refactor Workflow

Ship first. Review when ready.

## TL;DR

| Phase | Time | Focus |
|-------|------|-------|
| Quick Review | 15 min | Critical issues only |
| Code Quality | 30 min | Types, patterns, lint |
| Performance | 30 min | Speed, bundle size |
| Refactor | 1-2 hr | Structure improvements |

---

## Context Questions

Before starting a review/refactor cycle, ask:

1. **What's the trigger?** — Post-ship cleanup, tech debt pain, planning next iteration
2. **How much time is available?** — 15 min quick pass, 30 min deep review, 1-2 hr refactor
3. **What's the priority?** — Security issues, performance, maintainability, all
4. **What's the test coverage?** — Good coverage, minimal tests, no tests
5. **What's the risk tolerance?** — Can break things temporarily, must stay stable

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Depth | Quick scan ←→ Deep refactor |
| Scope | Single file ←→ Entire codebase |
| Focus | Bug fixes ←→ Architecture improvements |
| Safety | Aggressive changes ←→ Conservative tweaks |
| Timing | Immediate ←→ Scheduled review cycle |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Just shipped feature | Quick Review (15 min) for critical issues only |
| Tech debt slowing velocity | Schedule focused Refactor session (1-2 hr) |
| Before major additions | Code Quality Review (30 min) to ensure solid base |
| Performance complaints | Performance Review (30 min) with profiling |
| No tests + making changes | Add safety net (tests/checkpoints) before refactoring |
| Team handoff | Full review cycle: quality + performance + documentation |

---

## When to Review

**Review when:**
- Feature is shipped and working
- You have dedicated time
- Planning next iteration
- Before major additions
- Tech debt is slowing you down

**Don't review:**
- Before shipping (blocks velocity)
- During building (distracts)
- Every commit (overkill)
- When you should be shipping

---

## Quick Review (15 min)

Fast pass for critical issues only.

### Checklist

```markdown
## Quick Review: [Feature]

### Security
- [ ] No secrets in code
- [ ] Auth on protected routes
- [ ] Input validation present
- [ ] No SQL injection vectors

### Data
- [ ] No data loss scenarios
- [ ] Errors handled
- [ ] User feedback on failures

### Critical Bugs
- [ ] Core flow works
- [ ] No infinite loops
- [ ] No memory leaks

Pass? → Ship more features
Fail? → Fix critical only, then ship
```

---

## Code Quality Review (30 min)

Deeper review for maintainability.

### Type Safety

```bash
# Run type check
pnpm tsc --noEmit
```

**Fix these:**
```typescript
// ❌ Bad
const data: any = response
function handle(x: any) {}
// @ts-ignore

// ✓ Good
const data: User = response
function handle(x: unknown) {
  if (isUser(x)) { ... }
}
```

### Linting

```bash
# Run linter
pnpm lint

# Auto-fix
pnpm lint --fix
```

### Pattern Consistency

| Check | Look For |
|-------|----------|
| Naming | Consistent case conventions |
| Imports | Ordered, no unused |
| Components | Same structure across files |
| Error handling | Consistent approach |
| State management | Using agreed patterns |

### Code Smells

| Smell | Fix |
|-------|-----|
| File > 200 lines | Split into modules |
| Function > 50 lines | Extract helpers |
| Nested callbacks | Use async/await |
| Repeated code | Extract to utility |
| Magic numbers | Use constants |
| Long parameter lists | Use options object |

---

## Performance Review (30 min)

### Bundle Analysis

```bash
# Next.js
npx @next/bundle-analyzer

# General
npx source-map-explorer dist/**/*.js
```

**Fix these:**
- Large dependencies (find alternatives)
- Unused imports
- Missing code splitting
- Unoptimized images

### Runtime Performance

```typescript
// Add performance marks
performance.mark("start")
// ... code
performance.mark("end")
performance.measure("operation", "start", "end")
```

**Check:**
- Initial load time < 3s
- Time to interactive < 5s
- No layout shifts
- Smooth animations (60fps)

### Database Performance

```typescript
// Check for N+1 queries
// Before (N+1):
const users = await db.user.findMany()
for (const user of users) {
  const posts = await db.post.findMany({ where: { userId: user.id } })
}

// After (single query):
const users = await db.user.findMany({
  include: { posts: true }
})
```

---

## Refactor Workflow

### Step 1: Identify Target

```markdown
## Refactor Target
**What:** [component/module]
**Why:** [reason - slow, messy, hard to change]
**Risk:** [low/medium/high]
```

### Step 2: Create Safety Net

Before refactoring:
```bash
# Checkpoint
git add -A && git commit -m "pre-refactor: [target]"
git tag pre-refactor-[target]

# If you have tests
pnpm test
```

### Step 3: Refactor

**Rules:**
- One change at a time
- Verify after each change
- Commit frequently
- Keep working at all times

### Step 4: Verify

```bash
# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Test (if exists)
pnpm test

# Manual test
# Click through the feature
```

### Step 5: Document Decision

```markdown
## Refactor Complete: [target]
**Before:** [old approach]
**After:** [new approach]
**Why:** [benefit]
```

---

## Common Refactors

### Extract Component

```tsx
// Before: Large component
function Page() {
  return (
    <div>
      {/* 50 lines of header */}
      {/* 100 lines of content */}
      {/* 30 lines of footer */}
    </div>
  )
}

// After: Extracted
function Page() {
  return (
    <div>
      <Header />
      <Content />
      <Footer />
    </div>
  )
}
```

### Extract Hook

```tsx
// Before: Logic in component
function Component() {
  const [data, setData] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  
  useEffect(() => {
    setLoading(true)
    fetch(url).then(setData).catch(setError).finally(() => setLoading(false))
  }, [url])
  
  // ...
}

// After: Custom hook
function useData(url) {
  const [data, setData] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState()
  
  useEffect(() => { /* ... */ }, [url])
  
  return { data, loading, error }
}

function Component() {
  const { data, loading, error } = useData(url)
  // ...
}
```

### Extract Utility

```tsx
// Before: Repeated logic
function ComponentA() {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function ComponentB() {
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

// After: Utility
// lib/utils.ts
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}
```

### Simplify Conditionals

```tsx
// Before: Nested ifs
if (user) {
  if (user.isAdmin) {
    if (user.isActive) {
      // do thing
    }
  }
}

// After: Early returns
if (!user) return
if (!user.isAdmin) return
if (!user.isActive) return
// do thing
```

---

## Review Schedule

| Frequency | Type | Time |
|-----------|------|------|
| After each ship | Quick Review | 15 min |
| Weekly | Code Quality | 30 min |
| Monthly | Performance | 30 min |
| As needed | Refactor | 1-2 hr |

---

## Don't Over-Review

**Signs of over-reviewing:**
- Reviewing before shipping
- Multiple review rounds
- Reviewing small changes
- Perfectionism blocking progress

**Remember:** Code in production > perfect code in development
