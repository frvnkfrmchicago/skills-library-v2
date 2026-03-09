---
name: orchestration-managing
description: >
  Manages file-based multi-agent orchestration lifecycle including wave packets,
  lane briefs, completion evidence, lead review, master log updates, and
  archive control. Augments the core orchestration skill with management rules
  and the use pattern for running build waves. Use when dispatching agents,
  reviewing completed lanes, updating the master log, or archiving wave packets.
---

# Orchestration Managing

Manage the lifecycle of multi-agent build waves using a file-based orchestration
system. This skill augments the core `orchestration` skill with management
rules and the use pattern.

> **Core skill:** Read `agents/orchestration/SKILL.md` first. It contains the
> full packet structure, folder pattern, standard workflow, and non-negotiable
> rules. This skill adds the management layer on top.

---

## Management Rules

| Rule | Requirement |
|------|-------------|
| Active packet | One active wave only |
| Agent handoff | One lane brief per agent |
| Completion evidence | Agent rewrites the same lane brief file when done |
| Lead review | Lead reopens that file and classifies it |
| Tracking | Lead updates master log from the completed lane file |
| Cleanup | Move to `completed/` or `archive/` first — delete only by explicit user choice |

---

## Use Pattern

1. **Read** the full skill at `agents/orchestration/SKILL.md`
2. **Scaffold** or create the active packet
3. **Give** each agent one lane brief path and one evidence contract path
4. **Require** the agent to rewrite the same lane brief with:
   - Explainer
   - TL;DR
   - Tables (files changed, commands run, artifact paths)
   - Remaining gaps
   - Task-sheet update row
5. **Review** — when the agent reports completion, the lead reads the updated
   lane file and updates the master log
6. **Archive** — move the packet to `completed/` or `archive/` when accepted

---

## Completion Rule

A lane is NOT done because an agent said "done." A lane is done when:

1. The assigned brief file itself has been rewritten with completion evidence
2. The lead has reviewed that file
3. The lead has updated the master log from that file

---

## Quick Reference Paths

| Resource | Path |
|----------|------|
| Full orchestration skill | `agents/orchestration/SKILL.md` |
| Reference docs | `agents/orchestration/references/` |
| Scaffold script | `agents/orchestration/scripts/scaffold_packet.py` |
| Lane brief template | `agents/orchestration/references/lane-brief-template.md` |
| Completion template | `agents/orchestration/references/lane-completion-template.md` |
| Master log template | `agents/orchestration/references/master-log-template.md` |
| Archive lifecycle | `agents/orchestration/references/archive-lifecycle.md` |

---

## ⛔ STOP GATE

DO NOT close a wave without:
1. Every lane brief rewritten with completion evidence (not just a chat message)
2. Lead review classification on each lane (accepted / needs-rerun / rejected)
3. Master log updated from each completed lane file
4. Wave packet moved to `completed/` (not deleted)
