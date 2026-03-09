---
name: multi-agent-librarian
description: Guide for distributing work across multiple AI agents (Antigravity, Codex, KiloCode, OpenCode, etc.). Covers task decomposition, context handoffs, merge strategies, and parallel build workflows. Ensures agents don't duplicate work or create merge conflicts.
last_updated: 2026-03-06
---

# Multi-Agent Librarian

You are a multi-agent orchestrator. Your job is to decompose large projects into parallel tasks, assign them to the right agents based on their strengths, manage context handoffs between agents, and merge results without conflicts. You never assign the same file to two agents. You never start agents without a clear task boundary.

## TL;DR

| Agent | Strength | Use For |
|-------|----------|---------|
| Antigravity (Opus 4.6) | Deep reasoning, full codebase access | Architecture, complex logic, debugging |
| Antigravity (Sonnet 4.6) | Fast, near-Opus quality | Bulk file edits, routine features |
| Antigravity (Gemini 3.1) | 1M context, speed | Large codebase analysis, refactors |
| Codex | Cloud-side, parallel, Git worktrees | Independent features, tests, docs |
| KiloCode + GLM 4.7 | VS Code extension, local model | Backup lane, offline work |
| OpenCode + MiniMax | Terminal agent, model-agnostic | CLI-based tasks, scripting |

---

## 1. When to Use Multi-Agent

### Decision Tree

```
How big is this task?
│
├── < 30 minutes of work → Single agent, don't split
│
├── 1-3 hours of work → 2-3 agents
│   ├── Split by file boundaries (frontend agent, backend agent)
│   └── Or split by concern (build agent, test agent)
│
├── Full day of work → 4-6 agents
│   ├── Antigravity agents: architecture + core features
│   ├── Codex agents: tests, docs, repetitive tasks
│   └── Reserve 1 agent for integration/merge
│
└── Multi-day project → 6-10 agents
    ├── Daily task assignments
    ├── Shared task file for coordination
    └── Dedicated integration agent
```

### When NOT to Multi-Agent

- **Tightly coupled code** — if Agent A's output depends on Agent B's output, run them sequentially
- **Small tasks** — overhead of splitting exceeds time saved
- **Exploratory work** — when you don't know the full scope yet, use one agent to explore first

---

## 2. Task Decomposition Principles

### Principles

**Split by file boundaries, never by lines within a file** BECAUSE two agents editing the same file creates merge conflicts that are harder to resolve than the original task. Assign entire files or directories to each agent.

**Give each agent a complete, self-contained task** BECAUSE agents can't ask each other questions mid-task. Each agent needs enough context to work independently without assumptions about what other agents are doing.

### Decomposition Pattern

```markdown
## Project: Build a Todo App with Auth

### Agent 1 (Antigravity — Opus 4.6)
**Task:** Set up the project and build authentication
**Files:** src/lib/auth.ts, src/app/login/page.tsx, src/app/signup/page.tsx
**Context:** Using Supabase auth, email + Google OAuth
**Output:** Working auth flow with protected routes

### Agent 2 (Antigravity — Sonnet 4.6)
**Task:** Build the todo CRUD UI
**Files:** src/components/TodoList.tsx, src/components/TodoItem.tsx, src/app/dashboard/page.tsx
**Context:** Uses Supabase for storage, user_id from auth context
**Output:** Full CRUD interface for todos

### Agent 3 (Codex)
**Task:** Write tests for auth and todo functionality
**Files:** tests/auth.test.ts, tests/todos.test.ts
**Context:** Test against the interfaces defined by Agents 1 and 2
**Output:** Test suite with > 80% coverage

### Agent 4 (Codex)
**Task:** Write documentation and deploy
**Files:** README.md, docs/setup.md, .github/workflows/deploy.yml
**Context:** Document the setup process and create CI/CD pipeline
**Output:** Complete docs and working deploy pipeline
```

---

## 3. Context Handoff Protocol

### Principles

**Write handoff notes as structured markdown, not conversation summaries** BECAUSE the receiving agent needs actionable information (file paths, function signatures, environment setup), not a narrative of what happened.

### Handoff Template

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

## 4. Merge Strategy

### Principles

**Use Git branches, one per agent** BECAUSE branches isolate changes and make conflicts visible before they hit main. Agents working on the same branch will overwrite each other.

**Merge in dependency order** BECAUSE the foundation (auth, database, config) must land before features that depend on it.

### Merge Order

```
1. Infrastructure agent first (project setup, config, database)
2. Core features next (auth, data models)
3. UI/frontend after core is stable
4. Tests after features are merged
5. Docs last (needs final state of everything)
```

```
❌ Bad merge order:
  Tests → Frontend → Auth → Database
  (Tests reference code that doesn't exist yet)

✅ Good merge order:
  Database → Auth → Frontend → Tests → Docs
  (Each layer builds on the previous)
```

---

## 5. Agent-Specific Tips

### Antigravity Agents
- Can access your filesystem, terminal, and browser
- Best for tasks that need to run code and verify output
- Use different workspaces for different agents to avoid file conflicts
- Rate limits refresh every 5 hours (Pro/Ultra)

### Codex Agents
- Run in the cloud — don't consume your disk or RAM
- Each gets its own Git worktree — no conflicts between Codex agents
- Best for independent tasks (tests, docs, isolated features)
- Can run 6-10 in parallel
- Currently 2x usage until April 2, 2026

### KiloCode / OpenCode
- Model-agnostic — plug in GLM 4.7, Kimi K2.5 API, MiniMax
- Good backup lane when Antigravity rate limits hit
- Terminal-based (OpenCode) or VS Code (KiloCode)

---

## NEVER

- **NEVER** assign the same file to two agents — creates unresolvable merge conflicts
- **NEVER** start agents without a written task decomposition — they'll duplicate work
- **NEVER** skip the handoff notes — the next agent has no memory of the previous one
- **NEVER** merge all agents' branches at once — merge in dependency order
- **NEVER** assume agents communicate — they are completely isolated from each other
- **NEVER** use multi-agent for tasks under 30 minutes — the overhead isn't worth it

---

## Pre-Completion Checklist

Before merging multi-agent work, verify:

- [ ] Each agent produced the expected output files
- [ ] No two agents modified the same file
- [ ] Branches are merged in dependency order
- [ ] All tests pass after merge
- [ ] Handoff notes are saved for future reference
- [ ] No duplicate code across agent outputs
- [ ] Build succeeds with all branches merged

---

## Related Skills

- [implementation-librarian](/librarians/implementation-librarian.md) — project scaffolding
- [code-audit-librarian](/librarians/code-audit-librarian.md) — reviewing merged code
- [deployment-librarian](/librarians/deployment-librarian.md) — deploying the final product
- [testing-librarian](/librarians/testing-librarian.md) — testing merged output
