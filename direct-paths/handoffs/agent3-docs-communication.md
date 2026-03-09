# Agent 3 Build Plan — Leadership & Communication

## Context

Skills Library for AI-assisted development. Need skills covering soft skills mentioned in JDs (technical leadership, stakeholder communication).

**Location:** `/Users/franklawrencejr./Downloads/skills-library-v2 2/`

## What to Build

### 1. Technical Documentation Skill
Create `agents/documentation/SKILL.md`

Coverage:
- README structure
- API documentation
- Architecture decision records (ADRs)
- Changelog best practices
- Diagrams (Mermaid)
- Documentation as code

### 2. Technical Communication Skill
Create `agents/tech-communication/SKILL.md`

Coverage:
- Explaining tradeoffs to stakeholders
- Writing technical proposals
- Status updates that matter
- Presenting options clearly
- When to escalate
- Async communication patterns

---

## Format

Each skill must have:
- YAML frontmatter
- TL;DR table
- Numbered parts with examples
- Checklist
- Resources
- Related Skills

## Style

- Practical templates, not theory
- Copy-paste ready formats
- Real-world examples

## After Building (REQUIRED)

**You MUST update these files after creating skills:**

1. Add to `SKILL-NAVIGATION.md` under appropriate section
2. Add to `tech-stack/SKILL-INDEX.md` if applicable
3. Add to `_meta/CHANGELOG.md` with today's date

**Example entries:**
```markdown
# SKILL-NAVIGATION.md
| `agents/documentation/SKILL.md` | READMEs, ADRs, diagrams |
| `agents/tech-communication/SKILL.md` | Proposals, updates, stakeholders |

# CHANGELOG.md  
- `agents/documentation/SKILL.md` — READMEs, ADRs, Mermaid, docs-as-code
- `agents/tech-communication/SKILL.md` — Proposals, stakeholder updates
```

---

## Completion Report

When done, provide:
1. Paths to created files
2. Confirmation navigation updated
3. Any issues
