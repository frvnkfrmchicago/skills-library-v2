---
name: research
description: Research workflow for finding current solutions, best practices, and community patterns. Use when you need the latest 2026 information, not just documentation. Search the web, find what's working NOW.
---

# Research Workflow

Find what's working NOW, not just what's documented.

## TL;DR

| Need | Search Strategy |
|------|-----------------|
| Official docs | `site:docs.example.com [topic]` |
| Current best practices | `[topic] 2026 best practices` |
| Community patterns | `[topic] site:github.com` |
| Real implementations | `[tool] example site:github.com` |
| Problems & solutions | `[error message]` or `[topic] issues` |
| Comparisons | `[tool A] vs [tool B] 2026` |

---

## Context Questions

Before starting research, ask:

1. **What's the research goal?** — Learn new tool, solve specific problem, compare options
2. **How current does info need to be?** — Latest 2026 practices, stable patterns, historical context
3. **What's the source priority?** — Official docs only, community patterns, any working solution
4. **How much time is available?** — Quick 5-min search, 15-min deep dive, ongoing exploration
5. **What's the output needed?** — Working code, decision made, understanding gained

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Depth | Quick answer ←→ Comprehensive understanding |
| Recency | Stable docs ←→ Bleeding edge |
| Source Trust | Official only ←→ Any working solution |
| Format | Code examples ←→ Conceptual understanding |
| Scope | Specific error ←→ Broad topic exploration |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Specific error message | Search exact error, check GitHub issues, Stack Overflow |
| Learning new tool | Official docs first, then community examples |
| Comparing options | "[A] vs [B] 2026" search, check recent benchmarks |
| Best practices needed | "[topic] best practices 2026", check popular repos |
| Stuck for 15+ min | Stop researching, try different approach, ask for help |
| Found working example | Verify source tier, test locally, then adapt |

---

## Research Phases

### Phase 1: Quick Search (2 min)

Start with the simplest search:

```
[topic] [year]
```

Examples:
- "next.js app router 2026"
- "gsap scrolltrigger react 2026"
- "prisma postgres performance 2026"

### Phase 2: Official Docs (5 min)

If quick search doesn't solve it, go to source:

```
site:[official-docs-url] [topic]
```

**Common doc sites:**
| Library | Docs URL |
|---------|----------|
| Next.js | nextjs.org/docs |
| GSAP | gsap.com/docs |
| Motion | motion.dev |
| Prisma | prisma.io/docs |
| Tailwind | tailwindcss.com/docs |
| React | react.dev |
| Clerk | clerk.com/docs |

### Phase 3: Community Patterns (10 min)

Real implementations from the community:

```
[topic] site:github.com
[topic] example repo
[topic] starter template
```

**Look for:**
- Repos with many stars
- Recent commits (not abandoned)
- Active issues/discussions
- Clear documentation

### Phase 4: Problems & Solutions (5 min)

When you hit issues:

```
[exact error message]
[topic] issues site:github.com
[topic] stackoverflow
[topic] discord
```

---

## Search Operators

| Operator | What It Does | Example |
|----------|--------------|---------|
| `site:` | Search specific site | `site:github.com prisma` |
| `"quotes"` | Exact phrase | `"cannot find module"` |
| `-exclude` | Exclude term | `react -native` |
| `OR` | Either term | `framer-motion OR motion` (search both old and new package names) |
| `after:` | After date | `gsap after:2024-01-01` |
| `filetype:` | File type | `filetype:md gsap tutorial` |

---

## Source Quality Guide

### Tier 1: Trust (Official)
- Official documentation
- Official GitHub repos
- Official blogs/changelogs

### Tier 2: Verify (Community)
- Popular GitHub repos (1k+ stars)
- Stack Overflow accepted answers
- Dev.to / Medium from known authors
- Discord official channels

### Tier 3: Cross-Check (Individual)
- Personal blogs
- YouTube tutorials
- Random GitHub repos
- Reddit comments

**Rule:** Tier 3 sources need verification from Tier 1 or 2.

---

## Research Templates

### Learning a New Tool

```markdown
## Research: [Tool Name]

### Official
- Docs: [url]
- GitHub: [url]
- Discord/Community: [url]

### Quick Start
Search: "[tool] getting started 2026"
Found: [what you found]

### Common Patterns
Search: "[tool] best practices"
Found: [patterns]

### Gotchas
Search: "[tool] common mistakes"
Found: [issues to avoid]
```

### Solving a Problem

```markdown
## Research: [Problem Description]

### Error/Issue
[Exact error message or description]

### Searches Tried
1. "[error message]" → [result]
2. "[topic] [symptom]" → [result]
3. "site:github.com [repo] issues [keywords]" → [result]

### Solution Found
Source: [url]
Fix: [what fixed it]
```

### Comparing Options

```markdown
## Research: [Option A] vs [Option B]

### Search
"[A] vs [B] 2026"

### Comparison
| Factor | Option A | Option B |
|--------|----------|----------|
| Performance | | |
| DX | | |
| Bundle size | | |
| Community | | |
| Learning curve | | |

### Decision
Use [choice] because [reason]
```

---

## When to Stop Researching

**Stop and start building when:**
- You have a working example
- You understand the basic pattern
- You've spent more than 15 min on one topic
- You're reading the same answers

**Research is procrastination when:**
- You already know enough to start
- You're looking for "the perfect" solution
- You're avoiding actually building
- You've bookmarked 20 articles but built nothing

---

## Research + Build Loop

```
Research (15 min max)
    ↓
Try it (build something)
    ↓
Stuck? Research specific issue (5 min)
    ↓
Try again
    ↓
Working? Move on
```

---

## Quick Reference Searches

### By Topic

**Animation:**
```
gsap [effect] 2026
motion [effect]  # Note: Use "motion" package for new projects - see agents/motion/SKILL.md
framer-motion [effect]  # Legacy search term for older content
[effect] animation react
```

**Database:**
```
prisma [operation] best practice
[query type] prisma performance
```

**Auth:**
```
clerk [feature] nextjs
nextauth [provider] setup 2026
```

**Styling:**
```
tailwind [effect/pattern]
shadcn [component] customize
```

**AI:**
```
vercel ai sdk [feature]
[model] api [use case]
```

### By Problem

**"It's not working":**
```
[exact error message]
[library] [symptom] fix
```

**"How do I...":**
```
how to [action] [library] 2026
[library] [action] example
```

**"Which should I use?":**
```
[option a] vs [option b] [year]
best [category] for [use case] 2026
```

---

## Save Your Research

When you find good solutions, save them:

```markdown
## Research Log: [Date]

### [Topic]
**Problem:** [what you needed]
**Solution:** [what worked]
**Source:** [url]
**Notes:** [anything to remember]
```

Build your own knowledge base over time.
