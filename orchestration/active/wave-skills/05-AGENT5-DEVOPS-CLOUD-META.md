# Agent 5 — DevOps, Cloud & Meta Lane

## Mission
Convert 9 DevOps/cloud/meta librarians into proper Agent Skills with auto-discovery.

## Before You Start
**Read `agents/upgrade-library/SKILL.md`** — it contains the SKILL.md format spec, frontmatter requirements, and conversion steps.

## Your Librarians (9)

| # | Source File | Skill Name |
|---|-----------|------------|
| 1 | `librarians/deployment-librarian.md` | `deploying` |
| 2 | `librarians/exit-librarian.md` | `exit-gating` |
| 3 | `librarians/aws-librarian.md` | `aws-building` |
| 4 | `librarians/azure-librarian.md` | `azure-building` |
| 5 | `librarians/computer-lab-librarian.md` | `lab-orchestrating` |
| 6 | `librarians/facilitator-librarian.md` | `facilitating` |
| 7 | `librarians/progress-tracker-librarian.md` | `progress-tracking` |
| 8 | `librarians/tech-advisor-librarian.md` | `tech-advising` |
| 9 | `librarians/search-librarian.md` | `search-building` |

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

- `deploying` should cover GitHub Pages, Vercel, Cloudflare Pages, and Netlify
- `exit-gating` is the final ship checklist — must have STOP gates that block deployment
- Cloud skills (`aws-building`, `azure-building`) should include service selection decision trees
- `computer-lab-librarian` → `lab-orchestrating` — this is the master orchestrator / one-prompt builder
- `tech-advising` should include research methodology and evidence-based recommendation format
- `search-building` should cover search implementation patterns (full-text, vector, etc.)

## Completion Evidence Required

- [x] Table of all 9 skills created with file paths
- [x] Confirmation all have valid frontmatter
- [x] Confirmation all copied to `.claude/`, `.cursor/`, `.codex/`
- [x] Any skills that exceeded 500 lines and how you handled overflow

---

## ✅ Completion Evidence

### All 9 Skills Created

| # | Skill | Path | Lines | Frontmatter |
|---|-------|------|-------|-------------|
| 1 | `deploying` | `.agents/skills/deploying/SKILL.md` | 260 | ✅ |
| 2 | `exit-gating` | `.agents/skills/exit-gating/SKILL.md` | 181 | ✅ |
| 3 | `aws-building` | `.agents/skills/aws-building/SKILL.md` | 232 | ✅ |
| 4 | `azure-building` | `.agents/skills/azure-building/SKILL.md` | 245 | ✅ |
| 5 | `lab-orchestrating` | `.agents/skills/lab-orchestrating/SKILL.md` | 243 | ✅ |
| 6 | `facilitating` | `.agents/skills/facilitating/SKILL.md` | 165 | ✅ |
| 7 | `progress-tracking` | `.agents/skills/progress-tracking/SKILL.md` | 196 | ✅ |
| 8 | `tech-advising` | `.agents/skills/tech-advising/SKILL.md` | 165 | ✅ |
| 9 | `search-building` | `.agents/skills/search-building/SKILL.md` | 236 | ✅ |

### Cross-Platform Copies

| Platform | All 9 Skills Present |
|----------|---------------------|
| `.claude/skills/` | ✅ All 9 confirmed |
| `.cursor/skills/` | ✅ All 9 confirmed |
| `.codex/skills/` | ✅ All 9 confirmed |

### Line Count & Overflow

All 9 skills are **under 500 lines** (range: 165–260 lines). No overflow handling was needed. The largest source file (`deployment-librarian.md` at 763 lines) was condensed to 260 lines by:
- Removing activation phrases and "when to hand off" sections
- Condensing verbose code examples into compact snippets
- Removing cross-librarian reference tables (replaced by auto-discovery)
- Keeping all platform decision trees and troubleshooting tables

### Special Instructions Verified

| Instruction | Status |
|-------------|--------|
| `deploying` covers GitHub Pages, Vercel, Cloudflare, Netlify | ✅ |
| `exit-gating` has STOP gates that block deployment | ✅ |
| `aws-building` has service selection decision tree | ✅ |
| `azure-building` has service selection decision tree | ✅ |
| `lab-orchestrating` is master orchestrator / one-prompt builder | ✅ |
| `tech-advising` has research methodology + evidence format | ✅ |
| `search-building` covers full-text, vector, fuzzy, autocomplete | ✅ |

### Completed: 2026-03-09
