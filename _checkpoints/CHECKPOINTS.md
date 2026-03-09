# Checkpoint System

Save progress, don't block progress.

## TL;DR

| Checkpoint | When | What to Save |
|------------|------|--------------|
| CP0 | Project start | Stack decision, file structure |
| CP1 | Core feature works | Working code, can demo |
| CP2 | UI complete | Styled, responsive |
| CP3 | Shipped | Deployed URL, what's missing |
| CP4+ | Post-ship iterations | Improvements made |

## How Checkpoints Work

```
┌──────────────────────────────────────────────────────────┐
│  Checkpoints are SNAPSHOTS, not GATES                    │
│                                                          │
│  ✓ Save state at key moments                            │
│  ✓ Know what's done vs what's left                      │
│  ✓ Rollback if needed                                   │
│  ✗ NOT approval required to continue                    │
│  ✗ NOT review that blocks shipping                      │
└──────────────────────────────────────────────────────────┘
```

## Checkpoint Template

When reaching a checkpoint, record:

```markdown
## Checkpoint [N]: [Name]
**Time**: [timestamp]
**Status**: [working | partial | blocked]

### What's Done
- [x] Feature A
- [x] Feature B

### What's Left
- [ ] Feature C
- [ ] Polish D

### Known Issues
- Issue 1 (can ship with this)
- Issue 2 (must fix before ship)

### To Rollback
git checkout [commit-hash]
# or
Restore from: [backup location]

### Next Checkpoint
CP[N+1]: [what triggers it]
```

## Standard Checkpoints

### CP0: Project Init
**Trigger**: After stack decision, before coding

```markdown
## CP0: Project Init
Stack: [Next.js | Expo | etc]
Type: [dashboard | saas | mobile | etc]
Structure: [link to file tree]

Key decisions:
- DB: [Prisma + Postgres | Supabase | etc]
- Auth: [Clerk | NextAuth | etc]
- Styling: [Tailwind + shadcn | etc]

Ready to build: [yes/no]
```

### CP1: Core Feature
**Trigger**: Main feature works (ugly is fine)

```markdown
## CP1: Core Feature
**Feature**: [what it does]
**Status**: Working

Can demo:
- [x] [action 1]
- [x] [action 2]

Not working yet:
- [ ] [edge case]
- [ ] [secondary feature]

Screenshot/recording: [link]
```

### CP2: UI Complete
**Trigger**: Looks good, responsive

```markdown
## CP2: UI Complete
**Status**: Styled

Screens done:
- [x] Home
- [x] Dashboard
- [x] [etc]

Responsive:
- [x] Mobile
- [x] Tablet
- [x] Desktop

Animations: [yes/no, which ones]
```

### CP3: Shipped
**Trigger**: Deployed to production

```markdown
## CP3: Shipped
**URL**: [production url]
**Time**: [timestamp]

What shipped:
- [features list]

What's missing (post-ship backlog):
- [ ] [feature]
- [ ] [polish]
- [ ] [optimization]

Known issues in prod:
- [issue, severity, workaround]
```

### CP4+: Iterations
**Trigger**: After each improvement cycle

```markdown
## CP4: [Iteration Name]
**Focus**: [what was improved]

Changes:
- [change 1]
- [change 2]

Remaining backlog:
- [ ] [item]
```

## Quick Checkpoint Commands

### Save checkpoint
```bash
# Git-based
git add -A && git commit -m "CP1: Core feature working"
git tag cp1-core-feature

# Or document-based
echo "CP1 reached at $(date)" >> CHECKPOINTS.md
```

### List checkpoints
```bash
git tag | grep cp
# or
cat CHECKPOINTS.md
```

### Rollback to checkpoint
```bash
git checkout cp1-core-feature
# or
git revert HEAD~[n]
```

## Checkpoint File

Keep in project root:

```markdown
# CHECKPOINTS.md

## Project: [Name]
Started: [date]
Type: [app-type]

---

## CP0: Init - [date]
Stack: Next.js 16.1.1 + Prisma + Clerk
[notes]

---

## CP1: Core - [date]
[notes]

---

## CP3: Shipped - [date]
URL: https://...
[notes]

---
```

## When to Checkpoint

| Situation | Action |
|-----------|--------|
| About to try risky change | Checkpoint first |
| Feature complete (any feature) | Checkpoint |
| Before major refactor | Checkpoint |
| Before shipping | Checkpoint |
| After shipping | Checkpoint |
| End of work session | Checkpoint |

## Checkpoint vs Review

| Checkpoint | Review |
|------------|--------|
| Quick snapshot | Deep analysis |
| During build | After shipping |
| "Where am I?" | "How good is it?" |
| Takes 1 min | Takes 15+ min |
| Always do | Do when ready |

Checkpoints happen constantly. Reviews happen when you choose.
