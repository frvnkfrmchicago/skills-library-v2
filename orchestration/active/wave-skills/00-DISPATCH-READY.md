# WAVE-SKILLS — Dispatch Ready

## Mission
Convert all 49 librarian `.md` files into proper Agent Skills (`SKILL.md` format) with YAML frontmatter, directive language, STOP gates, and cross-platform publishing.

## Reference Material

> **Every agent MUST read this file before starting:**
> `agents/upgrade-library/SKILL.md` — contains the Agent Skills standard, SKILL.md format requirements, conversion steps, and description templates.

## Wave Structure

| Agent | Lane | Librarians | Theme |
|-------|------|:---:|-------|
| Agent 1 | Quality & Security | 10 | Code review, security, testing, performance |
| Agent 2 | Design & UX | 10 | Visual, animation, typography, components |
| Agent 3 | Building & Architecture | 10 | Frontend, backend, DB, API, flows |
| Agent 4 | AI, Content & Automation | 10 | AI models, prompts, content, workflows |
| Agent 5 | DevOps, Cloud & Meta | 9 | Deploy, cloud, meta, orchestration |

## Evidence Contract

Each agent must produce for EVERY librarian converted:

1. **A new `SKILL.md`** in `.agents/skills/<skill-name>/SKILL.md`
2. With valid YAML frontmatter (`name` matching directory, `description` 1-1024 chars, third person)
3. Body under 500 lines with directive language (not vague checklists)
4. Cross-platform copies in `.claude/skills/`, `.cursor/skills/`, `.codex/skills/`
5. **Completion update** to this lane brief with files created

## Naming Convention

Convert librarian filename to skill name:
- `security-librarian.md` → `security-auditing/SKILL.md`
- `hacker-attacker-librarian.md` → `hacker-scanning/SKILL.md`
- Drop the `-librarian` suffix
- Use gerund form when possible (e.g., `code-scrutinizing`, `backend-hardening`)

## Status

| Lane | Status |
|------|--------|
| Agent 1 — Quality & Security | 🟡 Ready |
| Agent 2 — Design & UX | 🟡 Ready |
| Agent 3 — Building & Architecture | 🟡 Ready |
| Agent 4 — AI, Content & Automation | 🟡 Ready |
| Agent 5 — DevOps, Cloud & Meta | 🟡 Ready |
