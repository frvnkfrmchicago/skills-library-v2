---
name: orchestration-librarian
description: File-based multi-agent orchestration for parallel build waves. Use when you need separate lane briefs, completion evidence in the same file, lead-orchestrator review, a master log, and completed/archive control.
last_updated: 2026-03-06
---

# Orchestration Librarian

Use this librarian when the goal is to run a repeatable multi-agent build system, not a one-off handoff.

## Explainer
This librarian points to the full orchestration skill package and defines the management rules for dispatch, evidence, review, and archive control.

## TL;DR

| What it does | Path |
|---|---|
| Full skill package | `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/orchestration/SKILL.md` |
| Reference docs | `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/orchestration/references` |
| Scaffold script | `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/orchestration/scripts/scaffold_packet.py` |

| Rule | Requirement |
|---|---|
| Active packet | one active wave only |
| Agent handoff | one lane brief per agent |
| Completion evidence | agent rewrites the same lane brief file when done |
| Lead review | lead reopens that same file and classifies it |
| Tracking | lead updates master log from the completed lane file |
| Cleanup | move to completed/archive first, delete only by explicit user choice |

## Use Pattern

1. Read the full skill: `/Users/franklawrencejr./Downloads/skills-library-v2 2/agents/orchestration/SKILL.md`
2. Scaffold or create the active packet.
3. Give each agent one lane brief path and one evidence contract path.
4. Require the agent to rewrite the same lane brief with:
   - Explainer
   - TL;DR
   - tables
   - artifact paths
   - remaining gaps
   - task-sheet update row
5. When the agent reports completion, the lead reads that updated lane file and updates the master log.
6. Move the packet to `completed/` or `archive/` when accepted.

## Completion Rule

A lane is not done because an agent said "done." A lane is done when the assigned brief file itself has been rewritten with completion evidence and the lead has updated the master log from that file.
