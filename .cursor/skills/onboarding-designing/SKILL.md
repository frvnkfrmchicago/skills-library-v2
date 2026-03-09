---
name: onboarding-designing
description: >
  Rapidly transfers project context to new agents and guides library
  navigation, default configurations, skill creation, and handoff protocols.
  Use when onboarding a new agent, transferring context between sessions,
  creating new skills or librarians, or when user mentions onboarding,
  context transfer, or getting started.
---

# Onboarding Designing

Transfer project context to new agents fast. Provide essential information
in under 30 seconds of reading.

---

## 1. Quick Context Transfer

When onboarding a new agent or session, provide this:

```markdown
## Skills Library — Quick Context

### What This Is
Curated skills library: 77+ agent skills, 33+ librarians,
comprehensive workflows for AI-assisted development.

### How to Navigate
1. `START-HERE.md` — Reasoning protocol, defaults
2. `SKILL-NAVIGATION.md` — Full index, all categories
3. `librarians/README.md` — All 33+ librarians

### Defaults (Unless Told Otherwise)
- **Package Manager:** Bun
- **Framework:** Next.js App Router
- **Styling:** Tailwind v4
- **Type Safety:** TypeScript strict
- **Design:** 2026 innovative

### Most Used Skills
| Need | Go To |
|------|-------|
| Tech stack decision | `tech-stack/STACK-ROUTER.md` |
| Add feature | Find agent in `agents/` |
| Plan animations | `workflows/animation-planning/SKILL.md` |
| Quality check | Activate code audit librarian |
| Library status | Activate facilitator librarian |
```

---

## 2. Adding a Skill

Follow this protocol to add a new skill:

1. **Check template:** `_meta/SKILL-TEMPLATE.md`
2. **Check rules:** `_meta/LIBRARY-RULES.md`
3. **Find right directory:**
   - Tool/technology → `agents/`
   - Process/workflow → `workflows/`
   - Specialized persona → `librarians/`
   - App blueprint → `app-types/`
4. **Create file:** `[category]/[tool-name]/SKILL.md`
5. **Add YAML frontmatter:** `name` (matches directory), `description` (third person, WHAT + WHEN)
6. **Update navigation:** Add to `SKILL-NAVIGATION.md`
7. **Cross-platform copy:** `.agents/skills/`, `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`

---

## 3. Creating a Librarian

1. **Check existing:** `librarians/README.md`
2. **Use format from:** Any existing librarian file
3. **Must include:**
   - Activation phrase
   - Core principle
   - Focus priorities table
   - Output format
   - Library references
   - Hand-off conditions
4. **Update:** `librarians/README.md` and `START-HERE.md`

---

## 4. Handoff Protocol

After transferring context, suggest next steps:

| If You Need... | Activate... |
|----------------|-------------|
| Tech stack advice | Tech Advisor Librarian |
| Library status | Facilitator Librarian |
| Code quality review | Code Audit Librarian |
| Build a feature | Implementation Librarian |
| Research on topic | Research Librarian |

---

## 5. Development Workflow

```
Audit → Plan → Implement → Review → Clean → Secure → Ship
```

Every step has a corresponding skill or librarian. New agents should
understand this pipeline before starting work.

---

## Key Resources

| Resource | Purpose |
|----------|---------|
| `START-HERE.md` | Entry point |
| `SKILL-NAVIGATION.md` | Full navigation |
| `librarians/README.md` | Librarian directory |
| `_meta/SKILL-TEMPLATE.md` | Skill format |
| `_meta/LIBRARY-RULES.md` | Standards |
| `librarians/facilitator-librarian.md` | Full library status |

---

## NEVER

- **NEVER** start work without reading `START-HERE.md` first
- **NEVER** create a skill without YAML frontmatter
- **NEVER** skip updating `SKILL-NAVIGATION.md` after adding a skill
- **NEVER** assume defaults — check the defaults table above
