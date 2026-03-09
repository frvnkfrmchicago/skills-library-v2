# Agent 2 — Design & UX Lane

## Mission
Convert 10 design/UX librarians into proper Agent Skills with auto-discovery.

## Before You Start
**Read `agents/upgrade-library/SKILL.md`** — it contains the SKILL.md format spec, frontmatter requirements, and conversion steps.

## Your Librarians (10)

| # | Source File | Skill Name |
|---|-----------|------------|
| 1 | `librarians/experience-designer-librarian.md` | `experience-designing` |
| 2 | `librarians/typography-librarian.md` | `typography-enforcing` |
| 3 | `librarians/animation-librarian.md` | `animation-designing` |
| 4 | `librarians/interactive-animation-librarian.md` | `interactive-animating` |
| 5 | `librarians/3d-librarian.md` | `three-d-developing` |
| 6 | `librarians/components-librarian.md` | `component-building` |
| 7 | `librarians/mobile-first-librarian.md` | `mobile-first-enforcing` |
| 8 | `librarians/ux-design-librarian.md` | `ux-designing` |
| 9 | `librarians/visual-audit-librarian.md` | `visual-auditing` |
| 10 | `librarians/mobbin-librarian.md` | `pattern-referencing` |

## For Each Librarian

1. **Read** the source librarian file
2. **Create** `.agents/skills/<skill-name>/SKILL.md` with:
   - YAML frontmatter: `name` (matches directory), `description` (1-1024 chars, third person, includes WHAT + WHEN + trigger keywords)
   - Directive language
   - Body under 500 lines
3. **Copy** the skill directory into:
   - `.claude/skills/<skill-name>/SKILL.md`
   - `.cursor/skills/<skill-name>/SKILL.md`
   - `.codex/skills/<skill-name>/SKILL.md`

## Special Instructions for This Lane

- Design skills should include **token references** and **design system patterns**
- Animation skills should reference motion libraries (GSAP, Framer Motion, Reanimated)
- Include specific CSS/Tailwind patterns where applicable
- `visual-auditing` should include screenshot-comparison directives
- `mobbin-librarian` becomes `pattern-referencing` — focus on real-world UI pattern lookups

## Completion Evidence

### All 10 Skills Created

| # | Skill Name | File Path | Lines | Frontmatter |
|---|-----------|-----------|-------|-------------|
| 1 | `experience-designing` | `.agents/skills/experience-designing/SKILL.md` | 322 | ✅ Valid |
| 2 | `typography-enforcing` | `.agents/skills/typography-enforcing/SKILL.md` | 202 | ✅ Valid |
| 3 | `animation-designing` | `.agents/skills/animation-designing/SKILL.md` | 241 | ✅ Valid |
| 4 | `interactive-animating` | `.agents/skills/interactive-animating/SKILL.md` | 276 | ✅ Valid |
| 5 | `three-d-developing` | `.agents/skills/three-d-developing/SKILL.md` | 239 | ✅ Valid |
| 6 | `component-building` | `.agents/skills/component-building/SKILL.md` | 248 | ✅ Valid |
| 7 | `mobile-first-enforcing` | `.agents/skills/mobile-first-enforcing/SKILL.md` | 294 | ✅ Valid |
| 8 | `ux-designing` | `.agents/skills/ux-designing/SKILL.md` | 247 | ✅ Valid |
| 9 | `visual-auditing` | `.agents/skills/visual-auditing/SKILL.md` | 196 | ✅ Valid |
| 10 | `pattern-referencing` | `.agents/skills/pattern-referencing/SKILL.md` | 223 | ✅ Valid |

- [x] Table of all 10 skills created with file paths
- [x] Confirmation all have valid frontmatter (`name` + `description`, third person, trigger keywords)
- [x] Confirmation all copied to `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`
- [x] Overflow handling: `mobile-first-enforcing` (993→294 lines, overflow to `references/APP-STORE-COMPLIANCE.md` + `references/MOBILE-SECURITY.md`), `pattern-referencing` (472→223 lines, overflow to `references/WORKED-EXAMPLES.md`)
