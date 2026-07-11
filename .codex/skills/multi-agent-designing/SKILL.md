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

## Multi-Agent Research Waves (2026-06-04 lesson)

When using `delegate_task` for parallel research across many items (states, markets, etc.):
- **max_concurrent_children is typically 3** — plan waves of ≤3 agents. Batches of 4 will be silently truncated.
- **Browser contention**: concurrent agents sharing CDP port 9222 interfere (tabs collide, snapshots cross-contaminate). At most 1-2 concurrent agents should use `browser` toolset; assign `web` only to the rest.
- **Iteration caps are real**: browser-heavy agents typically hit the ~50-iteration cap before completing all items. Mitigate by (a) writing output files early (by iteration 20), (b) using web_search first and browser only for verification, (c) assigning fewer items per agent (8-10 max per browser agent, 12-15 per web-only agent).
- **Wave pattern**: Wave 1 (3 agents, mixed regions) → collect results → identify gaps → Wave 2 (3 agents, focused on uncovered items) → parent writes consolidation report.

# Multi-Agent Designing

Decompose large projects into parallel tasks, assign them to the right agents
based on strengths, manage context handoffs, and merge results without
conflicts. This skill focuses on DESIGNING the split. For managing the packet
lifecycle, use the `orchestration` skill.

---

## When to Use Multi-Agent

```
How big is this task?
│
├── < 30 minutes → Single agent, do not split
│
├── 1-3 hours → 2-3 agents
│   ├── Split by file boundaries (frontend agent, backend agent)
│   └── Or split by concern (build agent, test agent)
│
├── Full day → 4-6 agents
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

### Geographic / Regional Decomposition

When research or data collection spans all US states (or other geographic regions),
split agents by region rather than by task type. Each agent handles all aspects of
their assigned region and produces the SAME output shape.

```
Agent A: Northeast + Mid-Atlantic  (CT, DE, DC, ME, MD, MA, NH, NJ, NY, PA, RI, VT)
Agent B: Midwest + Plains          (IL, MI, MN, MO, MT, ND, OH, SD)
Agent C: South + Southeast         (AL, AR, FL, KY, LA, MS, OK, WV)
Agent D: West + Pacific            (AK, AZ, CA, CO, HI, NV, NM, OR, UT, WA)
```

**Rules:**
- Each agent produces the SAME output schema (one entry per state/entity)
- Already-completed states are listed as "done" in the agent's context — no duplicate work
- Merge is trivial: concatenate the per-region reports
- Scale to 5-7 agents for denser regions (e.g., split West into Pacific + Mountain)

**When to use:** multi-state regulatory research, market mapping, license directory collection,
any task where the data is independent per jurisdiction and the volume justifies parallelism.

### SAD Reporting Style

When Frank explicitly requests SAD approach with a skills-usage accounting, include:

```
## Skills / Librarians Usage Percentage

| Category | Count | Names |
|----------|-------|-------|
| Skills | N | [list] |
| Librarians | N | [list] |
| 2026 Research | Applied | [how] |
```

This gives Frank a visibility audit of which library assets actually informed the plan.

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

## Pre-Decomposition: Run SAD First

Before writing any agent decomposition, run **SAD** on the actual problem:

1. **Situation** — Inspect the real state of every component. Test endpoints, check tables, grep the code, curl the APIs. Don't assume what's broken — verify.
2. **Analysis** — Map what's actually broken vs what's working. Most "complex" problems collapse to a single missing link once you see the real state.
3. **Decision** — Only NOW decide: does this need agents, or is it a single-file fix?

**Rule of thumb:** If you can't name the exact file and line that needs changing, you haven't diagnosed enough to decompose. A 5-agent wave for a 30-line fix wastes time and erodes trust.

## NEVER

- **NEVER** assign the same file to two agents
- **NEVER** start agents without a written task decomposition
- **NEVER** skip handoff notes — the next agent has no memory
- **NEVER** merge all branches at once — merge in dependency order
- **NEVER** assume agents communicate — they are completely isolated
- **NEVER** use multi-agent for tasks under 30 minutes
- **NEVER** decompose into agents before diagnosing — run SAD first or you'll over-engineer the fix
