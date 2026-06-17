---
name: multi-agent-designing
description: >
  Designs multi-agent task decomposition, agent selection by strength, context
  handoff protocols, and merge strategies for parallel builds. Complements the
  orchestration skill (which manages packet lifecycle) by focusing on HOW to
  split work across agents. Use when decomposing a project into agent tasks,
  choosing which agent handles what, writing handoff notes, or planning merge
  order.
---

# Multi-Agent Designing

Decompose large projects into parallel tasks, assign them to the right agents
based on strengths, manage context handoffs, and merge results without
conflicts. This skill focuses on DESIGNING the split. For managing the packet
lifecycle, use the `orchestration` skill.

---

## When to Use Multi-Agent

```
How many independent, file-exclusive concerns does this task have?
(Size by scope, never by clock. No cap on agent count — file-exclusivity is the only governor.)
│
├── One coherent concern → Single agent, do not split
│
├── A few independent concerns → one agent per concern
│   ├── Split by file boundaries (frontend agent, backend agent)
│   └── Or split by concern (build agent, test agent)
│
├── Many independent concerns → one agent per concern + a merge/integration agent
│   ├── Architecture + core-feature agents
│   ├── Test, docs, repetitive-task agents
│   └── Reserve 1 agent for integration/merge
│
└── Large interlocking system → as many agents as there are file-exclusive lanes
    ├── One lane per concern, no two agents on the same file
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

## Task Decomposition Principles

**Split by file boundaries, never by lines within a file.** Two agents editing
the same file creates merge conflicts harder to resolve than the original task.

**Give each agent a complete, self-contained task.** Agents cannot ask each other
questions mid-task. Each agent needs enough context to work independently.

### Decomposition Template

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

### Agent 3 (Codex)
**Task:** [What to build]
**Files:** [Exact file paths — NO overlap]
**Context:** [Interfaces from Agents 1 and 2]
**Output:** [What "done" looks like]
```

---

## Context Handoff Protocol

Write handoff notes as structured markdown, not conversation summaries. The
receiving agent needs actionable information.

```markdown
## Handoff: [Source Agent] → [Target Agent]

### What Was Built
- [File]: [What it does]
- [File]: [What it does]

### Key Decisions Made
- Chose X over Y because [reason]
- Used pattern Z for [reason]

### What the Next Agent Needs to Know
- Environment: [env vars needed]
- Dependencies: [packages installed]
- API contracts: [endpoints, request/response shapes]

### Open Issues
- [ ] [Specific thing that needs attention]
- [ ] [Known limitation]

### Files NOT to Touch
- [File] — being modified by another agent
```

---

## Merge Strategy

**Use Git branches, one per agent.** Branches isolate changes and make conflicts
visible before they hit main.

**Merge in dependency order:**

```
1. Infrastructure first (project setup, config, database)
2. Core features next (auth, data models)
3. UI/frontend after core is stable
4. Tests after features are merged
5. Docs last (needs final state of everything)

❌ Bad:  Tests → Frontend → Auth → Database
✅ Good: Database → Auth → Frontend → Tests → Docs
```

---

## ⛔ STOP GATE

DO NOT start a multi-agent build without:
1. Written task decomposition with file ownership per agent
2. No two agents assigned to the same file
3. Dependency order defined for merge
4. Handoff template prepared for inter-agent context
5. At least one agent reserved for integration if 4+ agents

---

## NEVER

- **NEVER** assign the same file to two agents
- **NEVER** start agents without a written task decomposition
- **NEVER** skip handoff notes — the next agent has no memory
- **NEVER** merge all branches at once — merge in dependency order
- **NEVER** assume agents communicate — they are completely isolated
- **NEVER** use multi-agent for tasks under 30 minutes
