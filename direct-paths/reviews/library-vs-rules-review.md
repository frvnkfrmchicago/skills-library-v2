---
name: library-vs-rules-review
description: Review prompt comparing Skills Library to Cursor Rules integration. Deep dive analysis.
last_updated: 2026-01-26
---

# Skills Library vs Cursor Rules — Integration Review

A comprehensive comparison of how the Skills Library relates to Cursor Rules files.

---

## Quick Comparison

| Aspect | Cursor Rules (.cursorrules, .mdc) | Skills Library |
|--------|-----------------------------------|----------------|
| Purpose | Quick reference, defaults | Deep documentation, patterns |
| Length | 100-300 lines | 200-800+ lines per skill |
| Scope | Always loaded | Loaded on demand |
| Format | Concise rules | Comprehensive guides |
| Context usage | Low (fits context window) | High (rich detail) |

---

## How They Work Together

```
USER REQUEST
     |
     v
+------------------+
| Cursor Rules     |  <-- Always loaded, sets defaults
| (.mdc file)      |      Patterns, stack, file limits
+------------------+
     |
     | "Read this skill for depth"
     v
+------------------+
| Skills Library   |  <-- Loaded when needed
| (SKILL.md files) |      Full documentation, examples
+------------------+
     |
     v
IMPLEMENTATION
```

---

## Part 1: What Cursor Rules Do

### Role
- Set default stack and patterns
- Define file limits and structure
- Establish output format
- Point to skills when depth needed

### What Belongs in Cursor Rules

```
Good for Rules:
- Default tech stack
- File line limits
- Project structure
- Code patterns (brief)
- Output format requirements
- Tool selection table
- "Don't" list
- Pointer to skills library

Bad for Rules:
- Full tutorials
- 50+ code examples
- Decision trees
- Troubleshooting guides
- Alternative approaches
```

### Current cursor-skills.mdc Structure

```
1. Output Rules (no emojis, be specific)
2. Response Format (Task, Skills, Plan, Done, Next)
3. Workflow (plan-first)
4. Design Tokens (quick reference)
5. Stack (default tech)
6. File Limits
7. Skill Library Location
8. Don'ts
```

---

## Part 2: What Skills Library Does

### Role
- Provide deep documentation
- Full code examples
- Decision trees
- Best practices
- Troubleshooting
- Cross-references

### What Belongs in Skills

```
Good for Skills:
- Comprehensive patterns (20+)
- Full code examples (copy-paste ready)
- When to use / when not to use
- Common mistakes and fixes
- Integration with other tools
- Checklists
- Decision trees
- TL;DR quick reference

Bad for Skills:
- Real-time contextual rules
- Project-specific config
- Default enforcement
```

### Skill Structure

```
---
frontmatter
---

# Title
TL;DR table

## Part 1-10
Numbered sections with:
- Explanations
- Code examples
- Tables
- Checklists

## Related Skills
Cross-references
```

---

## Part 3: Integration Analysis

### Current Integration Points

| Cursor Rules Section | Skills Library Reference |
|---------------------|--------------------------|
| Output format | None (self-contained) |
| Workflow (plan-first) | References skills to list |
| Design tokens | Points to design-system skill |
| Animation patterns | Points to gsap, motion skills |
| Database patterns | Points to database skill |
| Deployment | Points to deployment skill |

### Gap Analysis

What's in Rules but NOT well-supported in Skills:
```
[ ] API integration patterns
[ ] Navigation/routing patterns
[ ] Fallback/error state patterns
[ ] Screenshot-to-code workflow (now added)
```

What's in Skills but NOT referenced in Rules:
```
[ ] Content creation skills
[ ] AI Builder wing
[ ] Platform skills (NotebookLM, Gems, GPTs)
[ ] Business operations
```

---

## Part 4: Deep Dive Comparison

### Example: Animation

**In Cursor Rules (brief):**
```tsx
// Animation (GSAP)
"use client"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
export function Animated({ children }) {
  const ref = useRef(null)
  useGSAP(() => {
    gsap.from(ref.current, { opacity: 0, y: 20 })
  }, [])
  return <div ref={ref}>{children}</div>
}
```

**In Skills Library (comprehensive):**
- 500+ lines in `agents/gsap/SKILL.md`
- Timeline patterns
- ScrollTrigger setup
- Stagger effects
- Performance optimization
- React integration
- Common issues
- When to use vs Motion

**Integration:**
Rules give quick pattern → Skill gives depth when needed

### Example: Database

**In Cursor Rules (brief):**
```tsx
// Server Action pattern
"use server"
import { z } from "zod"
import { db } from "@/lib/db"
// ... basic pattern
```

**In Skills Library (comprehensive):**
- Full Prisma schema patterns
- Relation strategies
- Migration workflow
- Query optimization
- Connection pooling
- Supabase/Neon specifics

**Integration:**
Rules show default pattern → Skill shows all variations

---

## Part 5: Scoring the Integration

### How Well Do They Work Together?

| Criteria | Score | Notes |
|----------|-------|-------|
| Rules are concise | 9/10 | Good length |
| Rules point to skills | 7/10 | Some gaps |
| Skills are comprehensive | 9/10 | Very thorough |
| Coverage matches | 7/10 | Content/AI wings not in rules |
| Output format is clear | 9/10 | Good structure |
| Workflow is defined | 8/10 | Plan-first is clear |
| Design guidance | 8/10 | Tokens + patterns |
| **Overall** | **8/10** | Good, room to improve |

---

## Part 6: Recommendations

### For Cursor Rules

1. **Add content skill references**
   - When creating content, reference content/ skills

2. **Add AI builder references**
   - When building AI features, reference ai-builder/ skills

3. **Add screenshot-to-code reference**
   - When receiving designs/mockups, reference workflow

4. **Add error handling patterns**
   - Brief error pattern + point to error-handling skill

### For Skills Library

1. **Add "For Cursor Users" section to key skills**
   - How this skill integrates with default stack

2. **Create cursorrules variants**
   - Project-specific rule files (e-commerce, dashboard, etc.)

3. **Add API integration skill**
   - External APIs, fallback patterns, caching

---

## Part 7: The Review Prompt

Copy this to get external AI feedback on the integration:

```
Review how these two systems work together:

SYSTEM 1: Cursor Rules (attached)
- Purpose: Quick reference, defaults for AI coding assistant
- Format: .mdc file, ~250 lines

SYSTEM 2: Skills Library (attached key files)
- Purpose: Deep documentation for specific topics
- Format: SKILL.md files, 200-800 lines each

Evaluate:
1. Do the rules effectively point to skills when depth is needed?
2. Are there gaps where rules mention something but skills don't cover it?
3. Are there skills that should be referenced in rules but aren't?
4. Is the output format in rules clear enough?
5. Does the plan-first workflow make sense?
6. Is the design guidance sufficient for "visual excellence"?

Score each 1-10 and explain.

Also identify:
- Top 3 integration improvements
- Top 3 gaps to fill
- Any conflicts or contradictions

Be specific and critical.

[Attach: cursor-skills.mdc, SKILL-NAVIGATION.md, 2-3 sample skill files]
```

---

## Part 8: Quick Reference

### When to Update Rules

```
Update Cursor Rules when:
- Default stack changes
- Output format needs adjustment
- New pattern becomes standard
- New skill category needs reference
```

### When to Update Skills

```
Update Skills when:
- Tool version changes
- New patterns emerge
- Users report confusion
- Edge cases discovered
```

### When to Create New Skill

```
Create new skill when:
- Topic is new (screenshot-to-code)
- Existing skill is too long (split)
- Cross-cutting concern (API patterns)
- User requests depth
```

---

## Current Status

### Cursor Rules Files

| File | Location | Purpose |
|------|----------|---------|
| cursor-skills.mdc | `.cursor/rules/` | Main rules file |
| stack-master.cursorrules | `platforms/cursor/` | Portable rules template |

### Skills Library Stats

| Metric | Value |
|--------|-------|
| Total skills | 135+ |
| Total lines | ~50,000+ |
| Wings | 7 |
| Cross-references | Strong |

### Integration Score

**8/10** — Good integration, minor gaps in content/AI wing references.

---

## Checklist

For rules-to-skills integration:
```
[ ] Rules are under 300 lines
[ ] Rules define output format
[ ] Rules point to skills for depth
[ ] All major skill categories referenced
[ ] Design guidance is clear
[ ] Workflow is plan-first
[ ] No contradictions between rules and skills
```

---

## Related

- [cursor-skills.mdc](/.cursor/rules/cursor-skills.mdc) — Main rules
- [SKILL-NAVIGATION.md](/SKILL-NAVIGATION.md) — Library navigation
- [platforms/cursor/SKILL.md](/platforms/cursor/SKILL.md) — Cursor IDE skill
- [multi-tool-ai](/workflows/multi-tool-ai/SKILL.md) — Multi-tool workflow
