---
name: upgrade-library
description: >
  Upgrades librarian .md files into proper Agent Skills (SKILL.md) format for
  cross-platform auto-discovery. Covers Antigravity, Claude Code, Cursor, and
  OpenAI Codex. Use when converting librarians to skills, fixing skill
  discovery issues, adding frontmatter, or preparing skills for a new platform.
last_updated: 2026-03-09
metadata:
  author: frank-lawrence
  version: "1.0"
---

# Upgrade Library Skill

Convert your librarian `.md` files into proper Agent Skills that auto-discover
across Antigravity, Claude Code, Cursor, and OpenAI Codex.

---

## The Problem

Librarian `.md` files in `librarians/` are only loaded when manually activated
("activate security librarian"). They are invisible to agent auto-discovery
because they:

1. Aren't in a discoverable path (`.agents/skills/`, `.claude/skills/`, etc.)
2. Lack YAML frontmatter (`name`, `description`)
3. Use vague checklist language instead of directive commands

---

## The Agent Skills Standard

Published by Anthropic (Dec 2025) at [agentskills.io](https://agentskills.io).
Adopted by Antigravity, Claude Code, Cursor, OpenAI Codex, GitHub Copilot.

### Progressive Disclosure (How Skills Load)

| Stage | What Loads | When | Token Cost |
|-------|-----------|------|-----------|
| Discovery | `name` + `description` from frontmatter | Session start | ~100 per skill |
| Activation | Full SKILL.md body | Task matches description | <5000 recommended |
| Execution | `scripts/`, `references/`, `assets/` | When skill needs them | On-demand |

### SKILL.md Format Requirements

```yaml
---
name: lowercase-with-hyphens     # Must match directory name, 1-64 chars
description: >                   # 1-1024 chars, third person, specific keywords
  Does X and Y. Use when Z happens or user mentions A, B, C.
---
```

**Name rules:** lowercase, hyphens only, no `--`, no leading/trailing `-`

**Description rules:**
- Third person ("Scans for..." not "I scan for...")
- Include WHAT it does AND WHEN to use it
- Include trigger keywords that match real tasks

---

## Platform Skill Directories

### Where to Place Skills

| Platform | Workspace Path | Global Path |
|----------|---------------|-------------|
| **Antigravity** | `.agents/skills/<name>/SKILL.md` | `~/.gemini/antigravity/skills/` |
| **Claude Code** | `.claude/skills/<name>/SKILL.md` | `~/.claude/skills/` |
| **Cursor** | `.cursor/skills/<name>/SKILL.md` | `~/.cursor/skills/` |
| **OpenAI Codex** | `.codex/skills/<name>/SKILL.md` | — |
| **GitHub Copilot** | `.agents/skills/<name>/SKILL.md` | — |

### Platform-Specific Notes

**Antigravity:**
- Also reads from `.agent/skills/` (singular alias)
- Skills are discovered in the workspace URI at session start
- Progressive disclosure is the default behavior

**Cursor:**
- Also supports `.mdc` rules files in `.cursor/rules/` with glob auto-attach
- Rules = always-on constraints; Skills = on-demand capabilities
- Rules use `globs` frontmatter for file-pattern matching

**Claude Code:**
- `CLAUDE.md` at repo root = always-on rules (like `.cursorrules`)
- `.claude/skills/` = on-demand skills with progressive disclosure
- Built-in `/create-skill` command for generating new skills

**OpenAI Codex:**
- Reads from `.codex/skills/` by default
- Also reads from `.agents/skills/` (cross-platform)

---

## Skill Directory Structure

### Minimal (just instructions)

```
security-auditing/
└── SKILL.md
```

### Standard (with references)

```
security-auditing/
├── SKILL.md
└── references/
    ├── PYTHON-CHECKS.md
    ├── NODE-CHECKS.md
    └── OWASP-TOP-10.md
```

### Full (with scripts and assets)

```
security-auditing/
├── SKILL.md
├── references/
│   ├── PYTHON-CHECKS.md
│   └── NODE-CHECKS.md
├── scripts/
│   ├── scan-secrets.sh
│   └── check-auth.py
└── assets/
    └── report-template.md
```

---

## Converting a Librarian to a Skill

### Step 1: Create the directory

```bash
mkdir -p .agents/skills/<skill-name>
```

### Step 2: Add frontmatter

```yaml
---
name: <skill-name>              # Must match directory name
description: >
  [WHAT it does]. [WHEN to use it — include trigger keywords].
---
```

### Step 3: Rewrite vague checklists as directives

```markdown
# ❌ Vague (current librarian style)
□ CORS properly configured
□ Authentication on all endpoints

# ✅ Directive (skill style)
## CORS Check
Run: `grep -rn "allow_origins\|CORSMiddleware" backend/ --include="*.py"`
If origins are hardcoded strings (not read from env var), flag as 🔴 CRITICAL.

## Auth Check  
Run: `grep -rn "APIRouter\|@app\." backend/ --include="*.py"`
Run: `grep -rn "Depends.*auth\|Depends.*verify" backend/ --include="*.py"`
Compare outputs. Any endpoint without auth = 🔴 CRITICAL.
```

### Step 4: Add STOP gates

```markdown
## ⛔ STOP GATE
DO NOT mark this passed without:
1. Running the scan commands above
2. Showing the grep output as evidence
3. Listing every unprotected endpoint found
```

### Step 5: Keep body under 500 lines

Move detailed checklists into `references/` files.

### Step 6: Symlink for cross-platform

```bash
# After creating in .agents/skills/, symlink to other platforms:
ln -s ../../.agents/skills/<name>/SKILL.md .claude/skills/<name>
ln -s ../../.agents/skills/<name>/SKILL.md .cursor/skills/<name>
ln -s ../../.agents/skills/<name>/SKILL.md .codex/skills/<name>
```

Or copy the full directory if symlinks cause issues.

---

## Priority Librarians to Convert

| Librarian | Proposed Skill Name | Why First |
|-----------|-------------------|-----------|
| `security-librarian.md` | `security-auditing` | Directly caused the missed findings |
| `hacker-attacker-librarian.md` | `hacker-scanning` | Has scan commands but Node-only |
| `code-scrutinizer-librarian.md` | `code-scrutinizing` | 7-lens review, high value |
| `backend-librarian.md` | `backend-hardening` | Missing Security Gate section |
| `pre-deployment-librarian.md` | `pre-deploy-gating` | Ship gate, needs enforcement |

---

## Description Templates

### Security Skill
```yaml
description: >
  Audits API authentication, CORS, rate limiting, secrets, input validation,
  and prompt injection for FastAPI, Express, Next.js, Django backends.
  Use when reviewing backend code, before deployment, when backend/ or
  server/ files change, or when user mentions security or production.
```

### Scrutinizer Skill
```yaml
description: >
  Deep 7-lens code review covering mobile reality, scalability, launch
  readiness, design integrity, security posture, code intelligence, and
  architecture quality. Use before demos, deployments, client presentations,
  or when code feels off.
```

### Backend Skill
```yaml
description: >
  Enforces backend architecture standards including API response shapes,
  input validation, server-side auth middleware, rate limiting, database
  query optimization, and environment-based configuration. Use when
  building or reviewing any API, server, or backend service.
```

---

## Rules vs Skills Quick Reference

| | Rules | Skills |
|---|---|---|
| **Loaded** | Always, every session | On-demand, when relevant |
| **Purpose** | Constraints, coding standards | Specialized capabilities |
| **Length** | Short (<200 lines) | Medium (<500 lines body) |
| **Where** | `.cursorrules`, `CLAUDE.md`, settings | `.agents/skills/`, `.claude/skills/` |
| **Example** | "Always use TypeScript strict" | "How to audit security" |

---

## Validation

Use the official validator from the Agent Skills repo:

```bash
npx skills-ref validate ./my-skill
```

Or manually verify:
- [ ] `SKILL.md` exists in a named directory
- [ ] YAML frontmatter has `name` and `description`
- [ ] `name` matches directory name
- [ ] `name` is lowercase with hyphens only
- [ ] `description` is 1-1024 chars, third person
- [ ] Body is under 500 lines
- [ ] No secrets or sensitive info in the file

---

## Sources

- [agentskills.io/specification](https://agentskills.io/specification) — Open standard spec
- [agentskills.io/what-are-skills](https://agentskills.io/what-are-skills) — How skills work
- [platform.claude.com/best-practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) — Authoring guide
- [cursor.com/docs](https://docs.cursor.com) — Rules vs Skills
- [github.com/anthropics/skills](https://github.com/anthropics/skills) — Example skills
- [github.com/agentskills/agentskills](https://github.com/agentskills/agentskills) — Reference library
