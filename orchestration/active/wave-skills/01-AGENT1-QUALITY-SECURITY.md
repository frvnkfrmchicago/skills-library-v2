# Agent 1 — Quality & Security Lane

## Mission
Convert 10 quality/security librarians into proper Agent Skills with auto-discovery.

## Before You Start
**Read `agents/upgrade-library/SKILL.md`** — it contains the SKILL.md format spec, frontmatter requirements, and conversion steps.

## Your Librarians (10)

| # | Source File | Skill Name | Lines |
|---|-----------|------------|-------|
| 1 | `librarians/security-librarian.md` | `security-auditing` | 198 |
| 2 | `librarians/hacker-attacker-librarian.md` | `hacker-scanning` | 416 |
| 3 | `librarians/code-scrutinizer-librarian.md` | `code-scrutinizing` | 308 |
| 4 | `librarians/code-audit-librarian.md` | `code-auditing` | 164 |
| 5 | `librarians/code-cleaner-librarian.md` | `code-cleaning` | est |
| 6 | `librarians/testing-librarian.md` | `testing-enforcing` | est |
| 7 | `librarians/performance-librarian.md` | `performance-tuning` | est |
| 8 | `librarians/anti-glitch-librarian.md` | `anti-glitch-debugging` | est |
| 9 | `librarians/consistency-librarian.md` | `consistency-checking` | est |
| 10 | `librarians/reviewer-librarian.md` | `code-reviewing` | est |

## For Each Librarian

1. **Read** the source librarian file
2. **Create** `.agents/skills/<skill-name>/SKILL.md` with:
   - YAML frontmatter: `name` (matches directory), `description` (1-1024 chars, third person, includes WHAT + WHEN + trigger keywords)
   - Directive language — convert vague checkboxes to specific commands with evidence requirements
   - Framework-specific scan commands (Python + Node.js) where applicable
   - STOP gates for critical checks
   - Body under 500 lines
3. **Copy** the skill directory into:
   - `.claude/skills/<skill-name>/SKILL.md`
   - `.cursor/skills/<skill-name>/SKILL.md`
   - `.codex/skills/<skill-name>/SKILL.md`

## Special Instructions for This Lane

- `security-auditing` and `hacker-scanning` are the **highest priority** — these directly caused missed security findings
- Add Python/FastAPI/Django scan phases alongside existing Node/Next.js commands
- Every security checklist item must become a **directive**: "Run X, verify Y, flag if Z"
- Add STOP gates: "DO NOT mark passed without running the scan and showing output"

## Completion Evidence ✅

### All 10 Skills Created

| # | Skill Name | Lines | Path |
|---|-----------|-------|------|
| 1 | `security-auditing` | 270 | `.agents/skills/security-auditing/SKILL.md` |
| 2 | `hacker-scanning` | 326 | `.agents/skills/hacker-scanning/SKILL.md` |
| 3 | `code-scrutinizing` | 192 | `.agents/skills/code-scrutinizing/SKILL.md` |
| 4 | `code-auditing` | 182 | `.agents/skills/code-auditing/SKILL.md` |
| 5 | `code-cleaning` | 185 | `.agents/skills/code-cleaning/SKILL.md` |
| 6 | `testing-enforcing` | 254 | `.agents/skills/testing-enforcing/SKILL.md` |
| 7 | `performance-tuning` | 200 | `.agents/skills/performance-tuning/SKILL.md` |
| 8 | `anti-glitch-debugging` | 263 | `.agents/skills/anti-glitch-debugging/SKILL.md` |
| 9 | `consistency-checking` | 193 | `.agents/skills/consistency-checking/SKILL.md` |
| 10 | `code-reviewing` | 129 | `.agents/skills/code-reviewing/SKILL.md` |

- [x] All 10 skills have valid YAML frontmatter (`name` + `description`)
- [x] All `name` fields match directory names
- [x] All copied to `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`
- [x] No skills exceeded 500 lines — largest is `hacker-scanning` at 326 lines
- [x] Security skills include Python/FastAPI/Django scan commands alongside Node.js
- [x] All security checklist items converted to directives with STOP gates
