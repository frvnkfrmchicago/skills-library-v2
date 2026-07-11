---
name: multi-agent-librarian
description: >
 Designs multi-agent task decomposition, agent selection by strength,
 context handoff protocols, and merge strategies for parallel builds.
 Complements the orchestration skill (which manages packet lifecycle)
 by focusing on HOW to split work across agents. Use when decomposing
 a project into agent tasks, choosing which agent handles what, writing
 handoff notes, or planning merge order.
last_updated: 2026-03-11
skill_ref: .agents/skills/multi-agent-designing/SKILL.md
---

# Multi-Agent Librarian

> **Skill:** `.agents/skills/multi-agent-designing/SKILL.md`

Decompose large projects into parallel tasks, assign them to the right agents
based on strengths, manage context handoffs, and merge results without conflicts.

---

## When to Use Multi-Agent

```
How big is this task?
│
├── < 30 minutes → Single agent, do not split
│
├── 1-3 hours → 2-3 agents
│ ├── Split by file boundaries (frontend agent, backend agent)
│ └── Or split by concern (build agent, test agent)
│
├── Full day → 4-6 agents
│ ├── Antigravity agents: architecture + core features
│ ├── Codex agents: tests, docs, repetitive tasks
│ └── Reserve 1 agent for integration/merge
│
└── Multi-day project → 6-10 agents
 ├── Daily task assignments
 ├── Shared task file for coordination
 └── Dedicated integration agent
```

### When NOT to Multi-Agent

- **Tightly coupled code** — if Agent A's output depends on Agent B's, run sequentially
- **Small tasks** — overhead of splitting exceeds time saved
- **Exploratory work** — scope unknown, use one agent to explore first

---

## Agent Strengths Map

| Agent | Strength | Best For |
|-------|----------|----------|
| Antigravity (Opus 4.6) | Deep reasoning, full codebase | Architecture, complex logic, debugging |
| Antigravity (Sonnet 4.6) | Fast, near-Opus quality | Bulk edits, routine features |
| Antigravity (Gemini 3.1) | 1M context, speed | Large codebase analysis, refactors |
| Codex | Cloud-side, parallel, Git worktrees | Independent features, tests, docs |
| KiloCode + GLM 4.7 | VS Code extension, local model | Backup lane, offline work |
| OpenCode + MiniMax | Terminal agent, model-agnostic | CLI tasks, scripting |

---

## Task Decomposition

**Split by file boundaries, never by lines within a file.**

**Give each agent a complete, self-contained task.**

```markdown
## Project: [Name]

### Agent 1 (Antigravity — Opus 4.6)
**Task:** [What to build]
**Files:** [Exact file paths this agent owns]
**Context:** [What this agent needs to know]
**Output:** [What "done" looks like]

### Agent 2 (Antigravity — Sonnet 4.6)
**Task:** [What to build]
**Files:** [Exact file paths — NO overlap with Agent 1]
**Context:** [Dependencies on Agent 1's output]
**Output:** [What "done" looks like]
```

---

## Context Handoff Protocol

```markdown
## Handoff: [Source Agent] → [Target Agent]

### What Was Built
- [File]: [What it does]

### Key Decisions Made
- Chose X over Y because [reason]

### What the Next Agent Needs to Know
- Environment: [env vars needed]
- Dependencies: [packages installed]
- API contracts: [endpoints, request/response shapes]

### Open Issues
- [ ] [Specific thing that needs attention]

### Files NOT to Touch
- [File] — being modified by another agent
```

---

## Merge Strategy

**Merge in dependency order:**

```
1. Infrastructure first (project setup, config, database)
2. Core features next (auth, data models)
3. UI/frontend after core is stable
4. Tests after features are merged
5. Docs last (needs final state of everything)

 Bad: Tests → Frontend → Auth → Database
 Good: Database → Auth → Frontend → Tests → Docs
```

---

## NEVER

- **NEVER** assign the same file to two agents
- **NEVER** start agents without a written task decomposition
- **NEVER** skip handoff notes — the next agent has no memory
- **NEVER** merge all branches at once — merge in dependency order
- **NEVER** assume agents communicate — they are completely isolated
- **NEVER** use multi-agent for tasks under 30 minutes

---

## Related

| Resource | Path |
|----------|------|
| Orchestration management | `.agents/skills/orchestration-managing/SKILL.md` |
| Lab orchestrating | `.agents/skills/lab-orchestrating/SKILL.md` |
| Full orchestration package | `agents/orchestration/SKILL.md` |
