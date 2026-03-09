---
name: orchestration
description: Create and manage multi-agent build packets. Use when you need parallel agent lanes, separate handoff briefs, completion evidence, a master log, or an archive/review workflow for another project.
---

# Orchestration

Use this skill when the user wants a repeatable multi-agent system, not a one-off handoff. This skill is for creating or running a file-based orchestration loop:

1. one active wave packet,
2. one brief per agent,
3. one shared evidence contract,
4. one lead review pass,
5. one master log update, and
6. controlled move-to-completed or archive decisions.

If the user says `orchestration`, `multi-agent`, `handoff packet`, `dispatch packet`, `evidence contract`, `lead orchestrator`, or `master log`, use this skill.

## Always Read These First

1. `references/workflow.md`
2. `references/evidence-contract.md`

Then load only the reference file needed for the task:

- Drafting briefs: `references/lane-brief-template.md`
- Reviewing completed lanes: `references/lane-completion-template.md`
- Updating status/tracker: `references/master-log-template.md`
- Closing or moving files: `references/archive-lifecycle.md`
- Choosing models/lanes: `references/agent-strength-map.md`

## Core Model

The system is file-driven, not chat-driven.

- The active packet is the source of truth for current work.
- Each agent gets one lane brief path and one evidence contract path.
- The agent must update the same lane brief file when done so the brief becomes the authoritative completion record.
- The lead orchestrator reviews that updated file, updates the master log, then decides whether to leave the wave active, move it to `completed/`, or archive it.
- Do not delete lane files automatically. Delete only when the user explicitly asks.

## Non-Negotiable Rules

1. Keep one active packet at a time.
2. Never assign the same file ownership to two agents.
3. A lane is not done when the agent says "done." A lane is done when the lane brief has been rewritten with completion evidence.
4. Put the explainer first, TL;DR second, then tables.
5. Use plain language for non-technical readers. If you mention HTTP or runtime terms, explain them in plain words.
6. The master log is updated by the lead orchestrator only after reading the completed lane file.
7. Prefer move-to-completed over delete. Deletion is a user decision.

## Folder Pattern

Use this structure in the project being orchestrated:

```text
orchestration/
  active/
    <wave-id>/
      00-DISPATCH-READY.md
      01-<AGENT>-<LANE>.md
      02-<AGENT>-<LANE>.md
      90-ORCHESTRATION-CYCLE.md
      99-EVIDENCE-CONTRACT.md
  management/
    CANONICAL-INDEX.md
    MASTER-LOG.md
  completed/
    <wave-id>/
  archive/
```

If the repo already has an orchestration structure, adapt to it instead of forcing a rename. The important rule is still one active packet plus one master log.

## Standard Workflow

### 1. Start the wave

Read `references/workflow.md`, then either:

- scaffold the packet with `scripts/scaffold_packet.py`, or
- create the files manually from the reference templates.

### 2. Create lane briefs

For each agent:

- define a product outcome, not a tiny subtask,
- define exact ownership boundaries,
- define required evidence,
- define how the same file must be rewritten on completion.

Use `references/lane-brief-template.md`.

### 3. Enforce the evidence rewrite

When an agent finishes, the same lane brief file must be updated in place using `references/lane-completion-template.md`.

That completion file must include:

- Explainer
- TL;DR
- tables for completed work, files changed, commands run, artifact paths, remaining gaps
- exact path to the updated brief
- task-sheet update row for the lead orchestrator

Do not accept a separate "I finished" chat summary as evidence.

### 4. Lead review

The lead orchestrator reads the updated lane brief and classifies it:

- `accepted`
- `needs-rerun`
- `rejected`

Then the lead updates `MASTER-LOG.md` from that completed lane brief using `references/master-log-template.md`.

### 5. Close or move the wave

Use `references/archive-lifecycle.md`.

- Leave the wave in `active/` while any lane is still open.
- Move the full packet to `completed/` when the wave is accepted.
- Archive later if the user wants long-term retention.
- Delete only with explicit user approval.

## When The User Wants A New Project Setup

Do this in order:

1. Scaffold the packet.
2. Write `00-DISPATCH-READY.md`.
3. Write `99-EVIDENCE-CONTRACT.md`.
4. Write lane briefs.
5. Write `CANONICAL-INDEX.md` and `MASTER-LOG.md`.
6. Hand the user the exact brief paths to paste to each agent.

## When The User Says "They Completed It"

Do this in order:

1. Open the same lane brief file the agent was given.
2. Confirm it was rewritten with the required completion sections.
3. Update the master log from that file.
4. Tell the user whether the lane is accepted, needs rerun, or is still incomplete.
5. Do not rely on chat summaries when the file is missing or stale.

## Use The Bundled Script

For a fresh project or a new wave, use:

```bash
python3 scripts/scaffold_packet.py --project-root /path/to/project --wave-id wave-001
```

This creates the base orchestration directories and starter files. Then fill in the lane briefs manually or with Codex.
