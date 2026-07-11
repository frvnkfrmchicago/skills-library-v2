---
name: facilitating
description: >
  Audits and maintains the skills library health, tracking currency,
  coverage, and consistency across all skills. Runs full audits, gap
  analysis, and generates status reports. Use when checking library health,
  finding outdated skills, running a full audit, onboarding new agents to
  the library, or when user says "library status".
---

# Facilitating

Head librarian responsible for library health, status, and maintenance.
Knows what is fresh, what is stale, and what is missing.

---

## ⛔ STOP — Which Action?

| Command | Action |
|---------|--------|
| "run full audit" | Complete library health check |
| "library status" | Quick status report (TLDR + table) |
| "what's outdated?" | List skills needing updates |
| "what's missing?" | Gap analysis |
| "quick context" | Onboarding summary for new agents |

---

## Full Audit Protocol

### 1. Currency Check

Run:
```bash
find .agents/skills -name "SKILL.md" -exec grep -l "last_updated" {} \;
```

For each skill, verify:
- Version numbers mentioned are current (Next.js 15+, React 19+, etc.)
- Tools/services referenced still exist and are maintained
- Best practices reflect 2025-2026 standards
- No deprecated patterns or APIs
- Links still resolve

Flag as:
- 🟢 **Current** — reviewed within 30 days
- 🟡 **Needs Review** — not reviewed in 60+ days
- 🔴 **Outdated** — contains deprecated info

### 2. Coverage Check

Run:
```bash
# Count skills per directory
find .agents/skills -name "SKILL.md" | wc -l
find .claude/skills -name "SKILL.md" | wc -l
find .cursor/skills -name "SKILL.md" | wc -l
find .codex/skills -name "SKILL.md" | wc -l
```

Verify:
- All development phases covered (IDEA → DEPLOY → MONITOR)
- Major frameworks/tools have skills
- Cross-references are complete
- No orphaned skills (skills not referenced anywhere)

### 3. Consistency Check

Run:
```bash
# Check all skills have frontmatter
find .agents/skills -name "SKILL.md" -exec head -1 {} \; | grep -c "^---"

# Check name matches directory
for dir in .agents/skills/*/; do
  name=$(basename "$dir")
  grep -q "name: $name" "$dir/SKILL.md" || echo "MISMATCH: $dir"
done
```

Verify:
- YAML frontmatter has `name` and `description`
- `name` matches directory name
- Body under 500 lines
- STOP gates present for critical skills

---

## Status Report Template

```markdown
## Library Status Report

**Audit Date:** [Date]
**Audited By:** Facilitator

### Health Summary

| Category | Count | Status | Last Reviewed |
|----------|-------|--------|---------------|
| .agents/skills/ | [N] | 🟢/🟡/🔴 | [date] |
| .claude/skills/ | [N] | 🟢/🟡/🔴 | [date] |
| .cursor/skills/ | [N] | 🟢/🟡/🔴 | [date] |
| .codex/skills/ | [N] | 🟢/🟡/🔴 | [date] |
| librarians/ | [N] | 🟢/🟡/🔴 | [date] |

### Priority Updates Needed

| Skill | Issue | Priority |
|-------|-------|----------|
| [path] | [description] | 🔴/🟡 |

### Gaps Identified

| Gap | Suggested Action |
|-----|-----------------|
| [missing area] | [create/expand/update] |
```

---

## Quick Context (New Agent Onboarding)

```markdown
## Skills Library Quick Context

**What:** Curated skills library for AI-assisted development.

**How to Use:**
1. Skills auto-discover from `.agents/skills/` directories
2. Each skill has YAML frontmatter with name + description
3. Skills are loaded on-demand when task matches description

**Key Skills:**
- `deploying` — Deploy to GitHub Pages, Vercel, Cloudflare
- `security-auditing` — Security scan before production
- `exit-gating` — Final ship gate
- `lab-orchestrating` — Full pipeline from idea to ship

**Skill Format:**
- YAML frontmatter with `name` (matches dir) and `description`
- Directive language (not vague checklists)
- Body under 500 lines
- STOP gates for critical checks
```

---

## Gap Analysis Methodology

1. List all development phases: Plan → Design → Build → Test → Secure → Deploy → Monitor
2. For each phase, list required capabilities
3. Cross-reference against existing skills
4. Identify missing capabilities as gaps
5. Prioritize by frequency of need

---

## ⛔ STOP GATE

DO NOT mark an audit as complete without:
1. Running all currency, coverage, and consistency checks
2. Documenting every finding in the status report
3. Providing actionable recommendations for each issue found
