# CURSOR USER RULES

**Paste these into Cursor Settings → Rules → User Rules**

---

## Response Format

Always structure responses with:

```markdown
## TL;DR
[One sentence summary]

## Overview
[Tables for comparisons, bullet lists for steps]

## Details
[Code blocks with language specified]
[Numbered lists for sequences]

## Next Steps
[What to do next, clear and actionable]
```

---

## Progress Tracking (CRITICAL)

Include in EVERY update:

```markdown
**Progress:** Stage X of Y (Z% complete)
**Current:** [What's being worked on right now]
**Next:** [What's coming after this]
**Blockers:** [Any issues, or "None"]
```

**Example:**
```
Progress: Stage 2 of 4 (50% complete)
Current: Building authentication system
Next: Payment integration
Blockers: None
```

---

## Decision Making

**Priority order:**
1. **Skills Library first** - Check ~/skills-library-v2 2/ for patterns
2. **Web search** - ONLY for:
   - New tech (released this month)
   - Current events
   - Specific error messages
3. **Never assume** - If unclear, ask

**When referencing skills:**
```
Using agents/database/SKILL.md for Prisma setup
Following workflows/ship-fast/SKILL.md patterns
```

---

## Client Communication

When generating client-facing documents:

**Use these labels:**
- ✅ **Alpha** - Core features working, internal testing
- ✅ **Beta** - Polish, external testing
- ✅ **Launch** - Live to public

**Use Now-Next-Later format:**
```
NOW (This Week)
- Feature A
- Feature B

NEXT (2-4 Weeks)
- Feature C
- Feature D

LATER (Future)
- Feature E
```

**Avoid:**
- ❌ Technical jargon
- ❌ Absolute dates (use "Week 1-2")
- ❌ Implementation details

---

## Code Style

**File limits:**
- Components: 200 lines max
- Utilities: 100 lines max
- If longer, split into smaller files

**Always:**
- TypeScript (strict mode)
- Tailwind for styling
- Server Components by default (Next.js 16.1.1 

---

## Tech Stack (2025/2026)

**Current versions:**
- Next.js 16.1.1
- React 19.0.1
- Node.js 22 LTS
- Tailwind 4.0
- TypeScript 5.1+

**Never suggest:**
- Next.js 14 or earlier
- Pages router (use App Router)
- getServerSideProps (use Server Components)

---

## My Preferences

**I like:**
- TL;DR and tables
- Progress with stages/%
- Plain language
- Fast, actionable output

**I don't like:**
- Long explanations without code
- Asking permission to proceed
- Over-planning before building
- Sleep suggestions (I'm building)

---

## Skills Library Reference

**Entry point:** `SKILL-NAVIGATION.md`
**Discovery:** `STACK-ROUTER.md` → `COMMON-COMBOS.md`
**Lookup:** `SKILL-INDEX.md`

**Always reference skills when used.**

---

**These rules apply to ALL projects. Project-specific rules go in `.cursorrules` files.**
