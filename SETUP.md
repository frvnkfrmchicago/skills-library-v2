# Skills Library — Setup Guide

> **For any AI agent on any machine:** Read this file, then follow the steps below.

---

## What Is This?

This is a **skills library** — a collection of 50 Agent Skills and 49 librarian personas that give AI coding agents specialized capabilities. It works across:

- **Antigravity** (Google DeepMind)
- **Claude Code** (Anthropic)
- **Cursor**
- **OpenAI Codex**

---

## How It Works

Skills are `.md` files with YAML frontmatter. When you open this workspace, your AI agent **auto-discovers** all skills by scanning these directories:

| Platform | Scans From |
|----------|-----------|
| Antigravity | `.agents/skills/*/SKILL.md` |
| Claude Code | `.claude/skills/*/SKILL.md` |
| Cursor | `.cursor/skills/*/SKILL.md` |
| Codex | `.codex/skills/*/SKILL.md` |

Each skill has a `name` and `description` in its frontmatter. The agent loads these at session start (~100 tokens each). When your task matches a skill's description, the full instructions load automatically.

**You don't need to activate anything.** Just mention what you're doing — "deploy this," "audit my security," "review this code" — and the agent picks the right skill.

---

## What's Inside

### Auto-Discovered Skills (50)

Located in `.agents/skills/` (and mirrored to `.claude/`, `.cursor/`, `.codex/`):

**Quality & Security:** `security-auditing`, `hacker-scanning`, `code-scrutinizing`, `code-auditing`, `code-cleaning`, `testing-enforcing`, `performance-tuning`, `anti-glitch-debugging`, `consistency-checking`, `code-reviewing`

**Design & UX:** `experience-designing`, `typography-enforcing`, `animation-designing`, `interactive-animating`, `three-d-developing`, `component-building`, `mobile-first-enforcing`, `ux-designing`, `visual-auditing`, `pattern-referencing`

**Building & Architecture:** `backend-hardening`, `frontend-architecting`, `database-designing`, `api-integrating`, `supabase-building`, `flow-designing`, `implementation-guiding`, `onboarding-designing`, `web-game-foundations`, `r3f-game-building`, `three-webgl-game-building`, `playmaster`, `web-3d-asset-pipeline`, `pre-deploy-gating`

**AI, Content & Automation:** `google-ai-integrating`, `conversational-ai-building`, `model-fine-tuning`, `prompt-engineering`, `multi-agent-designing`, `orchestration-managing`, `n8n-automating`, `copywriting-enforcing`, `anti-mock-enforcing`, `research-conducting`, `graphify`

**DevOps, Cloud & Meta:** `deploying`, `exit-gating`, `aws-building`, `azure-building`, `lab-orchestrating`, `facilitating`, `progress-tracking`, `tech-advising`, `search-building`, `remotion-best-practices`

### Manual-Activation Librarians (49)

Located in `librarians/`. Activate by saying "activate [X] librarian" in conversation. These are the original persona-based versions of the skills above.

### Wings (Grouped Librarians)

Located in `librarians/WINGS.md`. Wings load multiple librarians at once: "Open the Build Wing," "Launch Quality Wing," "Activate Ship Wing."

### Agent Skills (146 reference skills)

Located in `agents/`. Deep reference material on specific technologies (Stripe, GSAP, Supabase, etc.).

---

## Quick Start for a New Machine

1. **Clone this repo:**
   ```bash
   git clone <repo-url>
   ```

2. **Open the workspace folder** in your AI coding tool (Antigravity, Cursor, Claude Code, etc.)

3. **That's it.** Skills auto-discover. Start coding and mention what you need — the agent will pull the right skill.

---

## Quick Start for a New Agent

If you're an AI agent reading this for the first time:

1. You have 50 skills available in `.agents/skills/` — check the names and descriptions
2. When the user asks you to do something, match their request to a skill description
3. Load the full `SKILL.md` for that skill and follow its instructions
4. If a skill has a `references/` directory, load those files only when needed
5. If a skill has a `scripts/` directory, execute those scripts when instructed

---

## Key Files

| File | Purpose |
|------|---------|
| `SETUP.md` | This file — how to get started |
| `README.md` | Library overview |
| `FRAMEWORK.md` | How the library is structured |
| `START-HERE.md` | First-time orientation |
| `SKILL-NAVIGATION.md` | How to find skills |
| `librarians/README.md` | Librarian index |
| `librarians/WINGS.md` | Grouped librarian sets |
| `agents/upgrade-library/SKILL.md` | How to convert librarians to skills |

---

## Adding New Skills

See `agents/upgrade-library/SKILL.md` for the full conversion guide. The short version:

```bash
mkdir -p .agents/skills/my-new-skill
```

Create `SKILL.md` with:
```yaml
---
name: my-new-skill
description: >
  Does X and Y. Use when the user mentions A, B, or C.
---

# My New Skill

Instructions here...
```

Then copy to other platforms:
```bash
cp -r .agents/skills/my-new-skill .claude/skills/
cp -r .agents/skills/my-new-skill .cursor/skills/
cp -r .agents/skills/my-new-skill .codex/skills/
```
