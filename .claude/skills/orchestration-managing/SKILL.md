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

## Sequential Agentic Development (SAD) — the front gate

> **SAD is the thinking that must happen before the wave.** Multi-agent
> orchestration parallelizes *execution*. SAD makes the *thinking* that
> precedes it sequential and considered — so parallel agents never duplicate
> work, collide on files, or build the wrong thing. Run these five gates **in
> order**. Each gate closes before the next opens. Do NOT scaffold a wave
> packet until Gates 1–3 are closed.

| Gate | Phase | What happens | The gate's "closed" evidence |
|---|---|---|---|
| 1 | **Understand the codebase** | Map what ALREADY EXISTS for the target feature across the 5 surfaces (architecture · API routes · components · data layer · configuration). Read whole files; classify each finding real / mock / broken. The point of understanding is to ENHANCE what exists — never to rebuild it. | Paths + one-line descriptions per surface + a real/mock/broken verdict. This is the Pre-Plan Research Protocol (below); SAD names it Gate 1 and makes it non-skippable. |
| 2 | **Research the pain points** | For the *specific* feature, gather current best practices and the real, citable pain points — not generic advice. | A tight synthesis + real 2026 web URLs per problem area (never fabricated links). |
| 3 | **Synthesize with the library** | Pull Gates 1 + 2 together using Skills Library V2. Frame every lane around the GAP found in Gate 1, never a greenfield rebuild. | Each planned lane cites ≥1 SKILL + ≥1 LIBRARIAN + ≥1 2026 URL (multiple encouraged; all three TYPES required). |
| 4 | **Decompose for parallel execution** | Split into 3–10 file-exclusive lanes. Batch by dependency. Maximize parallelism *within* the exclusive-ownership rule. | A file-ownership map (no two agents on one file) + batch grouping + parallelism reasoning. |
| 5 | **Execute in waves** | Hand the decomposition to the orchestration machinery below: dispatch → evidence rewrite → lead review → master log → archive. | A closed, archived wave packet. |

**The one-line rule:** Understand → Research → Synthesize → Decompose →
Execute. *Sequential thinking feeds parallel doing.*

### Apply skills at EVERY gate — the research↔apply loop

Skills Library V2 is not a citation bolted on at Gate 3. **You APPLY skills to DO each gate**, and the gates form an iterative loop, not a one-shot pass:

1. **Apply skills to research the app** (Gate 1). FIRST refresh the knowledge graph — `graphify update <target-repo>` (AST-only, free; first run: `graphify <target-repo>`) — so the map carries `file:line` evidence (architecture = `GRAPH_REPORT.md` god-nodes; routes/components/data/config = `graphify query`/`explain`). Then drive the codebase map by applying the relevant librarians — `app-scanner` to enumerate surfaces, `code-audit` / `code-scrutinizer` to classify real vs mock vs dead, `anti-mock-data` to catch fake data — plus the domain librarian for the feature (`store-compliance`, `backend`, `supabase`, `flow`, …). graphify proves *wiring* (A imports/calls B) and never the real/mock/broken verdict; that verdict comes from reading the cited file + the build-stability probe, and the readiness % is never computed from node counts. At Gate 4, `graphify affected "<module>"` gives lane blast-radius for file-exclusive decomposition. The map is the *output of applying those skills*, not a freehand read. Never surface graphify internal output (node IDs, community numbers, hashes) in UI.
2. **Apply skills to research the world** (Gate 2). Drive the external pass with `research-librarian` + the domain librarian + real 2026 web sources. Bring back citable best practices and the feature's actual pain points.
3. **Bring the research back and apply MORE** (Gate 3). Synthesize the app-map (1) and the world-research (2) into the real gap. If synthesis exposes a new unknown — a surface you didn't map, a pain point you didn't research — **loop back to Gate 1 or 2 before decomposing.** Never decompose on a half-mapped feature.
4. **Apply skills per lane** (Gates 4–5). Each lane brief again applies ≥1 SKILL + ≥1 LIBRARIAN + ≥1 2026 URL to its own slice.

The cadence: **apply-to-understand → apply-to-research → bring back → apply-to-synthesize → (loop if a knowledge gap appears) → apply-per-lane.** A wave whose recon or research was done WITHOUT applying the library is not SAD — it is guessing with citations stapled on afterward. On a large platform with interlocking subsystems (compliance + POS + admin + social), iterate this loop **per subsystem** before a cross-cutting wave is decomposed — research one subsystem, bring it back, let it inform how you research the next.

### Comprehension Gate (state this before scaffolding any wave)

Before writing a dispatch brief, the lead states, in one line each:

1. **Understood** — what already exists for this feature (cite the Gate 1 map).
2. **Researched** — the pain points + the 2026 sources that inform the fix.
3. **Gap** — what is actually missing / broken (NOT a greenfield build).

A wave that skips the Comprehension Gate fails review. "Considered" means
deliberate: you do not blast parallel agents at a feature you have not first
mapped and researched.

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
