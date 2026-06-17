---
name: orchestration-librarian
description: >
 File-based multi-agent orchestration for parallel build waves. Manages
 wave packets, lane briefs, completion evidence, lead-orchestrator review,
 master log updates, and completed/archive control. Use when dispatching
 agents, reviewing completed lanes, updating the master log, or archiving
 wave packets.
last_updated: 2026-03-11
skill_ref: .agents/skills/orchestration-managing/SKILL.md
---

# Orchestration Librarian

> **Skill:** `.agents/skills/orchestration-managing/SKILL.md`
> **Full orchestration package:** `agents/orchestration/SKILL.md`

Use this librarian when the goal is to run a repeatable multi-agent build system,
not a one-off handoff. The system is file-driven, not chat-driven.

---

## Terminology (use these words exactly — never mix them)

| Term | What it means | What it does NOT mean |
|---|---|---|
| **Primary Agent** | A top-level agent in a wave. Has its own handoff document. May have sub-agents. Numbered in execution order across the wave. | Not a sub-agent. Not a batch. |
| **Sub-Agent** | An agent that exists ONLY inside a Primary Agent. Owns one lane brief inside that primary's wave packet. Does not have its own top-level handoff. | Not a primary agent. Doesn't appear in the wave-level handoff index. |
| **Batch** | A group of Primary Agents that run at the same time. Named "First Batch," "Second Batch," etc. | Not a sub-wave. Not a batch. Not about sub-agents. |
| **Sub-wave** | Reserved for ordering of sub-agents INSIDE one Primary Agent — only relevant if that primary has internal sequencing dependencies. | NEVER used to describe Primary Agent batching. Never used to describe Agent 1 vs. Agent 2 ordering. |
| **Lane** | A sub-agent's slice of work. One lane brief per sub-agent. Labels are scoped to the primary (e.g., L0a, L0b inside the Engine primary's wave packet). | Not a primary agent. Not a batch. Doesn't continue primary-agent numbering. |
| **Wave** | A complete unit of work tracked by a wave packet directory. | Not a single agent's task. |
| **Wave packet** | The directory `orchestration/active/<wave-id>/` containing dispatch + lane briefs + evidence. | Not the handoff document; the packet is on-disk evidence, the handoff is the dispatch instruction. |

## Numbering rule (Primary Agents)

Primary Agents are numbered in their EXECUTION ORDER, not by feature category.

- First Batch (agents that start first) gets the lowest numbers
- Second Batch (agents that start after the first batch closes) continues the count
- Example: a wave with 6 primary agents in 2 batches numbers them as: **First Batch = Agents 1, 2, 3** — **Second Batch = Agents 4, 5, 6**

Handoff filenames follow this order: `<wave-name>-01-<feature>-handoff.md`, `<wave-name>-02-<feature>-handoff.md`, etc.

Sub-agent lanes inside a Primary Agent use scoped labels (L0a, L0b, ... or 01, 02, ...). They do NOT continue the primary-agent numbering — sub-agents are siblings to each other inside one primary, not peers of other primaries.

## Title format (Primary Agents)

When referring to a Primary Agent in any document or chat output, the title order is:

**[Feature Name] Agent [N]**

Examples:
- "Scenario Engine Agent 1"
- "Educator Refresh Agent 2"
- "US Stocks Simulator Agent 4"
- "Crypto Simulator Agent 5"

NOT "Agent 1 — Feature Name" (puts the number first; harder to scan).
NOT "Agent N runtime" (verbose, redundant).

This format is required in the prompt opener, in chat output headers, and anywhere else the agent is named.

---

## Core Model

1. One active wave packet at a time
2. One lane brief per agent
3. One shared evidence contract
4. One lead review pass
5. One master log update
6. Controlled move-to-completed or archive

---

## Default Invocation Trigger

When this librarian is opened (referenced by name in a user message — e.g. "open Orchestration Librarian," "use Orchestration Librarian," "per Orchestration Librarian"), the lead agent applies these mandates without being asked:

1. **Skills Library V2 path** — read SKILLS and LIBRARIANS from `~/Downloads/skills-library-v2 2/`.
2. **Multi-source citations per lane** — each lane brief MUST cite at least one SKILL, at least one LIBRARIAN, and at least one 2026 web URL. Multiple of each are encouraged when relevant — do NOT artificially limit to one of each.
3. **Multi-agent decomposition** — plan for as many agents as the work needs (**no cap**) able to run simultaneously where file ownership permits. Default to maximum parallelism within the orchestration librarian's exclusive-ownership rule — file-exclusivity is the only governor on agent count, never an arbitrary ceiling.
4. **Engagement standard** — every plan and lane prioritizes non-tedious, engaging, ease-of-use design. Defer to Explainer Mode + experience-designing + ux-designing for tactical patterns.
5. **Sequential Agentic Development (SAD) front gate** — run the five SAD gates in order before any plan or handoff is written: (1) **Understand** the codebase via the Pre-Plan Research Protocol (section below) — the point is to enhance what exists, never rebuild it; (2) **Research** the feature's 2026 pain points with real citable URLs; (3) **Synthesize** with the library (every lane cites a SKILL + LIBRARIAN + 2026 URL); (4) **Decompose** into as many file-exclusive lanes as the work needs (no cap), batched by dependency; (5) **Execute** in waves. State the Comprehension Gate (Understood / Researched / Gap) before scaffolding. *Sequential thinking feeds parallel doing.* Full definition: `.claude/skills/orchestration-managing/SKILL.md` → "Sequential Agentic Development (SAD)".
6. **Output format** — follow the Chat Output Format for Dispatch (section below). Default sequence: Breakdown (Explainer Mode 6 sections) → What To Do (run order in plain English) → Copy-paste prompts grouped by batch (skipped per the Exception clause when the planner is also the executor).
7. **Submission handoff** — when a wave closes, append a row to the project's `orchestration/management/SUBMISSIONS.md` (see Wave Submission and Review Handoff below) so the Review Orchestration Librarian can pick it up.
8. **No-Deferral Rule** — see section below. Every lane in scope ships in this wave; never mark a lane "deferred" or "queued for follow-up."
9. **No A/B/C Menus, Ever** — once the user has approved the plan, the lead executes. No "Option A / Option B / Option C / Default: A" menus at any stage — not in the plan, not mid-wave, not at closeout. If the user needs to be asked something, ask exactly one direct question.
10. **Progression Status Required** — see section below. After every lane closes, emit a one-line progression status. Mid-wave silence = packet review failure.
11. **No Known Limitations** — see section below. Banned in code, JSDoc, lesson bodies, audit trails: "approximate," "known limitation," "for simplicity," "best-effort," "TODO," "won't work if." Either fix correctly OR surface as a blocker BEFORE coding. Drop-with-reason is for objectively-impossible lanes only — never "we'll get to it later."

These mandates are non-optional once the librarian is invoked.

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
| Visual log | Agent writes a `visual-log/<ISO-timestamp>.md` entry whenever a lane produces UI/visual changes |
| Per-project tree | Each project owns its own `orchestration/` tree at the project root. The `/orchestrator` dashboard auto-discovers all such trees under configured workspace roots and renders them as separate sections. |

---

## Folder Pattern

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
 SUBMISSIONS.md
 completed/
 <wave-id>/
 archive/
 visual-log/
 <ISO-timestamp>.md
 reviews/
 <wave-id>.md
```

---

## Pre-Plan Research Protocol (required before any plan or handoff is written)

Before you scaffold a wave packet or write a handoff, research the codebase and document what already exists. Don't propose to build anything that's already built — receiving agents waste time recreating things that work.

### What to research — 5 surfaces (check all that touch the proposed feature)

| Surface | Where to look | Why it matters |
|---|---|---|
| **Architecture** | `package.json`, framework version (Next.js / React / etc.), `next.config.ts`, `tsconfig.json`, root directory layout | Tells you the stack, conventions, and what build/dev patterns are already established |
| **API routes** | `src/app/api/**/route.ts` (or `pages/api/`), edge functions, middleware | Existing endpoints, data sources, integrations — don't duplicate them |
| **Components** | `src/components/**`, `src/app/**` page/layout files, shared UI primitives | Reusable UI that lanes should reuse, not recreate |
| **Data layer** | `src/lib/**`, `prisma/schema.prisma`, type files, db utilities, hooks | Existing types, schemas, query helpers, state management |
| **Configuration** | `.env.example`, `middleware.ts`, route guards, env registry, feature flags | What's wired up and what's gated where |

### Steps

| Step | Action | Output |
|---|---|---|
| 1 | Run `grep -r` / `find` / `ls` across the 5 surfaces above to enumerate what exists for the proposed feature | Paths + line numbers + 1-line descriptions per surface |
| 2 | Read the existing implementations that overlap with the proposed feature | Plain-English understanding of what they do today |
| 3 | Identify the actual gap — what's missing, broken, or only partially implemented | List of genuine gaps |
| 4 | Frame the plan around the gap, not a greenfield build | Plan only proposes new work for actual gaps |
| 5 | Cite existing files in the plan so receiving agents know what NOT to recreate | Every lane brief and handoff includes an "Existing context" section organized by the 5 surfaces |

A plan that proposes to rebuild something already in the codebase fails review. The "Existing context" section is mandatory in every handoff — it's the place where research findings go, organized by the 5 surfaces above.

---

## Use Pattern

1. **Run the Pre-Plan Research Protocol first** (section above) — codebase awareness is mandatory before scaffolding
2. **Read** the full skill at `agents/orchestration/SKILL.md`
3. **Scaffold** or create the active packet
4. **Give** each agent one lane brief path and one evidence contract path
5. **Require** the agent to rewrite the same lane brief with:
 - Explainer
 - TL;DR
 - Tables (files changed, commands run, artifact paths)
 - Remaining gaps
 - Task-sheet update row
6. **Visual log** — if the lane produced UI or visual changes, the agent
 writes `orchestration/visual-log/<ISO-timestamp>.md` with: TLDR bullets,
 a `What Was Created` table (Type / Description / File Path), screenshot
 refs or descriptions, and an Explanation paragraph. Format documented
 in `orchestration/visual-log/README.md`.
7. **Review** — when the agent reports completion, the lead reads the updated
 lane file (and any visual-log entry) and updates the master log
8. **Submit** — append a row to `orchestration/management/SUBMISSIONS.md` with `Review = ⏳ pending` so the Review Orchestration Librarian can pick it up (see Wave Submission and Review Handoff)
9. **Archive** — move the packet to `completed/` or `archive/` when accepted

---

## Completion Rule

A lane is NOT done because an agent said "done." A lane is done when:

1. The assigned brief file itself has been rewritten with completion evidence
2. A `visual-log/` entry is present if the lane produced UI/visual changes
3. The lead has reviewed both files
4. The lead has updated the master log from that file

---

## Explainer Mode (required for plans, dispatch briefs, and wave closeouts)

Every plan, dispatch brief, and wave closeout MUST include an explainer pass. The lead and every primary agent format user-facing output using the explainer skills below. This is not optional — a wave packet without an explainer pass fails review.

### Source skills

| Skill / Template | What it provides |
|---|---|
| `agents/tech-communication/SKILL.md` | TLDR format and audience calibration. The 3-option decision framework from this skill is NOT inherited — see "No Decision-Asking" rules below. |
| `agents/user-guide/SKILL.md` | Audience spectrum, quick-start mode, "what you'll click" walkthrough framing |
| `agents/documentation/SKILL.md` | TL;DR table conventions (`Type \| When to Use` shape) |
| `direct-paths/explainers/TEMPLATE.md` | Per-file Purpose / How It Works / Key Functions structural scaffold (adapt to wave-plan target) |
| `direct-paths/documentation/WORKFLOW.md` | Inline-explainer-as-you-build pattern |

### Default audience calibration

| Spectrum | Default |
|---|---|
| Tech-savvy ↔ Non-technical | **Tech-savvy** |
| Quick start ↔ Comprehensive | **Quick start** |
| Text ↔ Rich media | **Text + tables** |
| Engineering detail ↔ User outcomes | **Lead with user outcomes; engineering as footnotes** |

### Required output sections (in order)

1. **TLDR** — 1-3 sentence bottom line
2. **What each component delivers** — table mapping agent/lane → user-visible outcome
3. **What changes for the user** — Today vs. After table
4. **What you'll click** — interaction walkthrough table
5. **Citations** — table listing each explainer skill used and what it gave the writer

The Explainer explains. It does not request a decision. If the user needs to be asked something, ask one direct question — never offer an A/B/C menu.

---

## Production Cadence Rule (no time language)

Never describe progress, plans, or remaining work in time units (minutes,
hours, days, weeks, sprints, months). Time language is banned in dispatch
files, lane briefs, master logs, and user-facing status updates.

Use **waves of production** and a **0–100% completion meter** instead:

- A wave packet declares a fixed total number of waves (e.g. *"4 waves total"*)
- Progress reports as `% complete` of that total, starting at **0%**
- After each wave lands, state the new percentage and name the next wave
- "Effort" or "scope" is described in lanes, not duration
- If a stakeholder asks "how long," answer with the wave number and the
 resulting percentage on completion — never a calendar estimate

**Lane brief and master log templates MUST omit time fields.** Replace any
"ETA," "duration," "time to complete," or "deadline" column with **Wave**
and **% on completion**.

### Status report format

```text
Wave N of M complete → X% production done.
Next: Wave N+1 — <wave name>.
```

---

## Packet Continuity Rule (run to completion)

When a packet has been kicked off, drive it to completion in one continuous
session. Do NOT pause between waves to ask "what next?". The packet's wave
declaration is the contract — fulfill it.

| Allowed stop | Not allowed |
|--------------|-------------|
| All source landed + build verified + log closed + packet archived | "Wave 2 of 4 complete, want me to continue?" |
| A credential is required (DB password, OAuth client) | "Wave 3 of 4, ready for Wave 4 when you are" |
| A third-party URL is needed (n8n webhook, Stripe link) | "Wave 1 of 4 done, type continue" |
| A destructive remote action needs explicit approval | Pausing because "you might want to review" |

If a wave defers polish items, **queue them as Wave N+1 inside the same packet**
rather than ending early. The packet is not "done" because the originally
declared waves landed — it's done when the audit findings + deferred polish
are all closed and the master log marks the packet `complete`.

Status reports between waves are still emitted (one line: `Wave N of M
complete → X% production done`), but they do not pause execution. Continue
into the next wave's first lane immediately.

---

## No-Deferral Rule

A lane in scope ships in its wave. Period.

The lead does NOT mark a lane `deferred to follow-up`, `queued for next wave`, `out of scope after pre-plan`, or any synonym. Those are polite ways to say "I gave up." If pre-plan research surfaces that a lane's stated target is wrong (e.g., "wrap chart-lab's LiveChart" when chart-lab doesn't render LiveChart), the lead RE-SCOPES the lane in real time to the correct target and ships it in the same wave — does not punt.

| Allowed | Forbidden |
|---|---|
| Re-scope a lane mid-wave when pre-plan finds the original target was wrong, then ship the re-scoped work | Mark the lane "deferred" and move on |
| Drop a lane entirely with a plain-English "this is genuinely out of scope, here's why" recorded in the wave packet | Mark a lane "partial" or "queued for follow-up" |
| Pause the lane because a credential / third-party URL / destructive remote action is genuinely blocked on the user (per Packet Continuity Rule) | Pause the lane because "this would take longer than the rest" |

Half-completed lanes with `deferred` verdicts are forbidden. If the work is real, it ships now. If the work isn't real, the lane is dropped (not "deferred"). The wave closeout reports `shipped` or `dropped` per lane — never `deferred`.

---

## No Known Limitations

A wave never ships code, scenarios, or features carrying a "known limitation" disclaimer in comments, JSDoc, lesson bodies, scenario summaries, README sections, or audit trails. Either fix it correctly the first time, OR surface it as a blocker BEFORE coding so the user can decide whether to descope.

### Banned phrases

The reviewer (Substantive Check #19) greps the wave's touched files case-insensitively for these. Any hit = ` fail`:

- "approximate" / "approximation"
- "known limitation"
- "for simplicity"
- "good enough"
- "edge case" (when the case isn't handled)
- "TODO" (any TODO-as-doc, not just `// TODO:`)
- "may produce incorrect"
- "best-effort"
- "this won't work if"
- "wall-clock … is wrong" (any phrasing admitting code is wrong)

If the lead catches one of these mid-build, the lead either:
1. Fixes it properly — uses the right API (e.g., `Intl.DateTimeFormat` for time zones, `Decimal.js` for currency math, real data source instead of hard-coded constant), OR
2. Surfaces a single blocker question to the user upfront — never ships the disclaimer.

### Drop-with-reason is for blockers only

A lane ships `drop-with-reason` ONLY when the lane is objectively impossible — third-party data 4xx/5xx, API key not in env, hardware unavailable. The blocker must be documented in the dispatch brief OR raised to the user mid-wave for explicit drop approval.

| Allowed `drop-with-reason` | Forbidden `drop-with-reason` |
|---|---|
| "Finnhub returned 401 — `FINNHUB_API_KEY` not set in env" | "Higher-impact, lower-risk slice ships first" |
| "Polyhaven preview asset 404" | "Larger consumer-side change saved for next-touch wave" |
| "Hardware (GPU / 3D / camera) unavailable in this runner" | "Will get picked up in a future wave" |

### Cross-references

- `~/.claude/projects/<project>/memory/feedback_no_known_limitations.md` — user-level memory entry the rule mirrors
- `~/.claude/projects/<project>/memory/feedback_all_waves_same_day.md` — sibling rule on no phasing

---

## No A/B/C Menus, Ever

The lead never offers the user an "Option A / Option B / Option C / Default: A" menu — not in the plan, not in dispatch briefs, not mid-wave, not at closeout. The Explainer explains; it does not request a decision. The "3-option decision framework" pattern from `agents/tech-communication/SKILL.md` is explicitly NOT inherited by this librarian.

If the lead genuinely needs the user to decide something, the rule is: ask exactly ONE direct question and wait. Never list options.

Mid-wave decision asks ("which of these 3 patterns should I use?", "should I do X or Y first?", "do you want me to also...?") are forbidden. The lead picks the obvious default and ships. If multiple defaults are equally good, the lead picks one, documents the choice in the lane brief, and the user can override at closeout — never mid-wave.

| Allowed | Forbidden |
|---|---|
| One direct question if a real decision is needed (no menu) | Asking the user to pick A/B/C anywhere |
| Pause for credentials / third-party URLs / destructive remote actions | Pausing because "you might prefer X over Y" |
| Output a status report between lanes (no decision required) | Any A/B/C menu, anywhere |

The only exception: a destructive action that genuinely needs the user's eyes (delete data, push force, accept legal terms). Those still require explicit user approval. Everything else: pick a default, ship, document.

---

## Progression Status Required (between every lane and every sub-wave)

After every lane closes, the lead emits a one-line progression status in the format:

```text
Lane N of M complete → X% wave done.
Next: Lane N+1 — <lane name>.
```

After every sub-wave / batch closes, the lead emits the higher-level format defined by the Production Cadence Rule:

```text
Wave N of M complete → X% production done.
Next: Wave N+1 — <wave name>.
```

This is mandatory. Skipping the status report is a packet review failure. The status report does NOT pause execution — the lead immediately continues to the next lane / wave's first action.

The user reads these to know progress. Silence between lanes = the user assumes the lead is stuck.

---

## Planner+Executor Mode (when the planner is also the executor)

When the user says "build the plan, you'll execute it" (or equivalent — the Exception clause that suppresses copy-paste prompts), the lead does NOT scaffold a formal `orchestration/active/<wave-id>/` directory with per-lane brief files. The work happens inline. This mode is real and common, but the standard evidence model (per-lane brief files) doesn't apply.

In planner+executor mode, the **visual log entry IS the canonical per-lane evidence file**, with required per-lane sub-sections.

### Required visual log structure for planner+executor waves

```markdown
---
timestamp: <ISO UTC>
wave: <wave-id>
mode: planner-executor
agent: <model + context tier>
---

## TLDR
- 3-5 wave-level bullets

## What Was Created
| Type | Description | File Path |
| ... aggregated table for the whole wave ... |

## Per-Lane Evidence

### Lane 1 — <name> — shipped | dropped (with reason)
- **Files:** path/to/file1, path/to/file2
- **Citations:** SKILL `<name>`, LIBRARIAN `<name>`, 2026 URL `<url>`
- **TLDR:** one sentence
- **Remaining gap:** none | <description>

### Lane 2 — <name> — shipped | dropped (with reason)
- ... same shape ...

(repeat per lane)

## Screenshots
... wave-level screenshots ...

## Explanation
... wave-level explanation ...
```

The Per-Lane Evidence section is mandatory in planner+executor mode. Without it, the Review Orchestration Librarian cannot verify per-lane citations / file ownership / shipping verdicts and the wave fails review check #1, #3, and #11.

### What changes vs. multi-agent mode

| Multi-agent mode | Planner+Executor mode |
|---|---|
| `active/<wave-id>/00-DISPATCH-READY.md` | Skipped — wave plan lives in chat |
| `active/<wave-id>/<NN>-<AGENT>-<LANE>.md` × N | Per-Lane Evidence sub-section inside the visual log |
| `active/<wave-id>/99-EVIDENCE-CONTRACT.md` | Skipped — single-agent contract is implicit |
| Mode declared in dispatch brief | Mode declared in visual log frontmatter (`mode: planner-executor`) |
| Citations per lane brief | Citations per Per-Lane Evidence sub-section |

### Mode declaration in SUBMISSIONS

The SUBMISSIONS row's Mode column states `Planner+Executor` (a recognized variant of Flat Wave) so the reviewer knows to look for inline per-lane evidence in the visual log instead of separate brief files.

---

## Orchestration Modes

A wave declares its mode in the dispatch brief. Pick the mode that fits the scope — don't force a tier hierarchy when the work is flat, and don't strip hierarchy when the work has real internal structure.

### Modes

| Mode | When to use | Structure | Evidence tiers |
|---|---|---|---|
| **Solo** | One coherent task that fits one agent's context | 1 agent | 1 (lane brief only) |
| **Flat Wave** | Several independent tasks, no nesting needed | N peer agents (as many as the work needs — no cap) | 1 (per-agent lane brief) |
| **Single Primary Agent** | One feature with internal task structure | 1 Primary Agent + N sub-agents | 2 (sub-evidence + Primary Agent wave packet) |
| **Multi Primary Agent** | Multiple features that each have internal task structure | Lead + multiple Primary Agents + each Primary Agent's sub-agents | 3 (sub-evidence + Primary Agent wave packet + META-LOG) |

### How to choose the mode

| Question | If yes → mode |
|---|---|
| Single coherent task that fits one agent's context? | Solo |
| Multiple independent tasks, no nesting needed? | Flat Wave |
| One feature, but it decomposes into multiple tasks? | Single Primary Agent |
| Multiple features, each with their own task decomposition? | Multi Primary Agent |

### Mode declaration (required in every dispatch brief)

The dispatch brief states explicitly:

- **Mode** chosen (Solo / Flat Wave / Single Primary Agent / Multi Primary Agent)
- **Agent count** at each level (e.g. Multi Primary Agent with 4 Primary Agents and 3-5 sub-agents each)
- **File-ownership map** across all agents (no two agents on the same file)
- **Batch grouping** if any (which agents run in which batch)
- **Parallelism reasoning** — which agents run in parallel and why it's safe

### Parallelism rules per mode

| Mode | Parallel rule |
|---|---|
| Solo | N/A — single agent |
| Flat Wave | All agents parallel-safe by file-ownership exclusivity |
| Single Primary Agent | Sub-agents within the Primary Agent run parallel when their files don't overlap; sequential when one produces a contract another consumes |
| Multi Primary Agent | Primary Agents in the same batch run parallel when no dependency between Primary Agents; sub-agents within each Primary Agent follow the Single Primary Agent rule |

### Batch structure (when batchs are needed)

Batchs are a sequencing tool, not a fixed shape. Use them when one set of work must close before another can start. A single-mode wave may have one batch or many. The dispatch brief names them in plain English (e.g. "Batch 1: foundation; Batch 2: surfaces; Batch 3: closeout") rather than forcing a numbered protocol.

---

## Evidence Documents (per mode)

Evidence files match the chosen mode. They live under `orchestration/active/<wave-id>/`.

### Lane brief (used by every mode)

| Field | Value |
|---|---|
| Pattern | `orchestration/active/<wave-id>/<NN>-<AGENT>-<LANE>.md` |
| Owned by | The agent doing the work (sub-agent in tiered modes; peer agent in Flat Wave; the only agent in Solo) |
| Updated | When the agent's lane closes |
| Contains | TLDR · files-changed table · key decisions · remaining gaps · 3 citations (SKILL + LIBRARIAN + 2026 URL) · explainer pass |

### Wave packet entry (Flat Wave, Single Primary Agent, Multi Primary Agent)

| Field | Value |
|---|---|
| Entry file | `orchestration/active/<wave-id>/00-DISPATCH-READY.md` |
| Contract | `orchestration/active/<wave-id>/99-EVIDENCE-CONTRACT.md` |
| Owned by | The dispatching agent (lead in Multi Primary Agent, the Primary Agent in Single Primary Agent mode, any peer can scaffold in Flat Wave) |
| Updated | When the wave closes |
| Contains | Wave-level TLDR · agent roster · file-ownership map · aggregated files-changed · lane brief index · explainer pass |

### META-LOG (Multi Primary Agent only)

| Field | Value |
|---|---|
| Pattern | `orchestration/active/META-<wave-id>/META-LOG.md` |
| Owned by | The lead orchestrator |
| Updated | At each batch close and at final closeout |
| Contains | Project-level progress · per-Primary-Agent completion percentage · cross-Primary-Agent dependency status · final exit checklist · top-level explainer pass for the user |

### What lands in `/orchestrator` dashboard

| Mode | Evidence path the dashboard auto-discovers | Renders as |
|---|---|---|
| Solo | `wave-<id>/<NN>-<AGENT>-<LANE>.md` | Wave card with one lane brief |
| Flat Wave | `wave-<id>/00-DISPATCH-READY.md` + N lane briefs | Wave card with N lane briefs grid |
| Single Primary Agent | `wave-<id>/00-DISPATCH-READY.md` + N sub-evidence files | Wave card with sub-evidence grid |
| Multi Primary Agent | `META-<id>/META-LOG.md` + N Primary Agent wave packets, each with their own briefs | Top META card + N Primary Agent wave cards |
| Any | `visual-log/<ISO-timestamp>.md` | Visual change log section |
| Any | `management/MASTER-LOG.md` "Wave roll-up" row | Project section header |

---

## Operational Rules — Multi-Agent Execution

These rules apply when multiple agents (Primary Agents and sub-agents) run against the same machine. They protect local resources from N-way build/test storms and keep evidence model-agnostic.

| Rule | Reason |
|---|---|
| NO `bun build`, no `tsc --noEmit`, no playwright, no vitest, no smoke tests during agent execution | Multiple builds × multiple agents = local memory exhaustion |
| NO model name references in plans, handoffs, briefs, or evidence | Plans must be model-agnostic; model names age fast and break re-runs |
| Lead in plain English; engineering detail goes in footnotes | Vibe-readable per Explainer Mode |
| Use Read + Edit + Write for code; Bash limited to `ls`/`grep`/`cat`/`date`/`find` | Same memory protection as the build rule |
| User verifies builds after the wave settles, manually | Single point of verification, not N agents racing |
| Every brief, every closeout, every plan ends with the Citations table | Traceability — every claim traces to a skill, librarian, or 2026 URL |
| No unexplained acronyms — spell out the full term on first use, or use the spelled-out form throughout | Plans and handoffs cross human readers; abbreviations create confusion. "TLDR" is the only acronym permitted without spell-out (it's Frank's standing format). |

---

## Handoff Format Requirements

Every handoff document MUST include all of the following sections, in this order:

| # | Section | Content |
|---|---|---|
| 1 | Header | From / To / Date / Wave id / Mode / Project / Other agents not touched |
| 2 | TLDR | 1-3 sentence bottom line |
| 3 | Existing context | What's already in the codebase that this agent should know about (paths + 1-line descriptions). Sourced from the Pre-Plan Research step. |
| 4 | Read first | Files the receiving agent reads before starting |
| 5 | Sub-agent lanes | Numbered table — only if Single Primary Agent or Multi Primary Agent mode |
| 6 | File-ownership map | Explicit paths owned by this agent |
| 7 | Operational rules | Verbatim hard-rules block |
| 8 | Evidence requirements | Where to write lane briefs and packet entry |
| 9 | Closeout | When this agent is done |
| 10 | Citations | Skill + librarian + 2026 URL contributions |

The handoff document does NOT contain a copy-paste prompt section. Copy-paste prompts are output in chat (see next section).

### Numerical ordering

When a wave produces multiple handoff documents:

- Number them 1, 2, 3, ... in numerical order
- List them in that order in any index
- Use a "Batch" column to show which run together — do NOT reorder the index to group by parallelism

### Copy-paste prompts (delivered in chat, NOT in the handoff document)

When the planner finishes preparing the handoffs, the planner OUTPUTS the copy-paste prompts directly in chat to the user, with the absolute path to each handoff document. The user pastes these from chat into agent runtimes — they never need to open a handoff file just to find a prompt.

### Streamlined prompt format

```text
You are the [Feature Name] Agent [N]. Execute the work in this handoff:

[absolute path to the handoff file]

[Only if the agent has sub-agents:] You have N sub-agent lanes (parallel-safe; dispatch them in parallel batches).

Hard rules: no bun build, no tsc, no playwright, no smoke tests. Code only — Read, Edit, Write. No model name references in evidence. When all lane briefs are closed and the wave packet entry is updated, summarize for [user] and stop.
```

Rules for prompt language:

| Do | Don't |
|---|---|
| Say "you are the [Feature] Agent [N]" — title-then-number per the Title format rule | Don't say "you are the runtime for..." |
| State the path; let the handoff document carry the rest | Don't say "in the [project] [wave] wave" — the handoff specifies that |
| Mention sub-agents (and count) if the agent has any | Don't reference sibling primary agents — each agent only knows its own work |
| State the closeout condition (this agent's own) | Don't tell the agent it runs in parallel with others — irrelevant to its work |
| Use the word "batch" if you reference primary agent ordering | Don't use "sub-wave" to describe primary agent ordering — that's "Batch" |

### Chat Output Format for Dispatch (the order of the chat output to the user)

When the planner outputs the dispatch to chat, the structure is (in this order):

1. **Breakdown** (also called "explainer") — TLDR + tables + "what each agent delivers" (per Explainer Mode requirements above)
2. **What to do — run order in plain English** — describe each batch of work in plain language. Example: "Start now — run these 3 agents at the same time: Agent X, Agent Y, Agent Z. Wait for Agent X to finish, then run these 3 at the same time: Agent A, Agent B, Agent C."
3. **Copy-paste prompts grouped by batch** — for each batch, output a header (e.g. "▼ FIRST BATCH — paste these N now") followed by N prompts. Each prompt is preceded by a one-sentence summary of what that agent ships.

### Exception

Copy-paste prompts are not generated when the user explicitly says "build the plan, you'll execute it" — the planner is also the executor.

---

## Archive Workflow — getting completed wave files OUT of the project

When a wave closes, the markdown files should not pile up indefinitely. The `/orchestrator` dashboard absorbs completed waves so local files can be removed.

| Step | What happens | Source of truth after this step |
|---|---|---|
| 1 | Wave closes and is accepted by the lead | Live wave packet at `orchestration/active/<wave-id>/` |
| 2 | Wave packet moves from `active/` to `completed/` | `orchestration/completed/<wave-id>/` |
| 3 | Lead snapshots the wave packet to JSON | `orchestration/archive-snapshots/<wave-id>.json` |
| 4 | Dashboard renders the wave from the snapshot, not the live files | The snapshot |
| 5 | Lead deletes the local `completed/<wave-id>/` directory | Snapshot remains; dashboard still renders the wave |

The dashboard at `/orchestrator` reads BOTH live wave packets AND archive snapshots, so completed-and-snapshotted waves keep showing up even after their local files are gone.

Implementation note: the parser at `src/lib/orchestrator-manifest.ts` should be extended to read `orchestration/archive-snapshots/*.json` in addition to the live `active/` and `completed/` directories. Adding this capability is a Tracker-agent responsibility (or its own follow-up wave).

---

## Wave Submission and Review Handoff

Every closed wave is recorded in a per-project `orchestration/management/SUBMISSIONS.md` log. The Review Orchestration Librarian reads this log to discover waves needing a review pass. Communication is file-driven, not chat-driven — the lead writes the row, the reviewer (whenever invoked) reads the log and picks up pending entries.

### Submission row format

| Wave ID | Submitted | Mode | Lanes | Visual Log | Review | Report |
|---|---|---|---|---|---|---|

- `Submitted` — ISO timestamp (UTC)
- `Mode` — matches the Mode declared in the dispatch brief
- `Lanes` — count of lane briefs in the wave packet
- `Visual Log` — count of `visual-log/<ts>.md` entries the wave produced
- `Review` — one of: `⏳ pending`, ` pass`, `️ partial`, ` fail`
- `Report` — relative path to the review report, or `—` while pending

### Lead writes the row when

When the lead moves a wave from `active/` to `completed/` (per the Archive Workflow), the lead also appends a SUBMISSIONS.md row with `Review = ⏳ pending`. This is the trigger that hands the wave to the Review Orchestration Librarian.

### Reviewer updates the row when

When the Review Orchestration Librarian completes a review, it writes `orchestration/reviews/<wave-id>.md` and updates the matching SUBMISSIONS.md row's Review + Report columns.

### Cross-reference

See `librarians/review-orchestration-librarian.md` (the reviewer's protocol) and `.agents/skills/orchestration-reviewing/SKILL.md` (the reviewer's technical contract).

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
| Tech communication skill (TLDR formatting, decision frameworks) | `agents/tech-communication/SKILL.md` |
| User guide skill (audience, walkthroughs) | `agents/user-guide/SKILL.md` |
| Documentation skill (TL;DR conventions) | `agents/documentation/SKILL.md` |
| Code explainer template | `direct-paths/explainers/TEMPLATE.md` |
| Documentation workflow | `direct-paths/documentation/WORKFLOW.md` |

---

## Related

| Resource | Path |
|----------|------|
| Lab orchestrating skill | `.agents/skills/lab-orchestrating/SKILL.md` |
| Multi-agent designing skill (handoff protocol) | `.agents/skills/multi-agent-designing/SKILL.md` |
| Multi-agent librarian (decomposition) | `librarians/multi-agent-librarian.md` |
| Onboarding librarian (rapid context transfer) | `librarians/onboarding-librarian.md` |
| Exit librarian (final ship checkpoint) | `librarians/exit-librarian.md` |
| Review orchestration librarian (verification half) | `librarians/review-orchestration-librarian.md` |
| Orchestration reviewing skill (review checklist + verdict mapping) | `.agents/skills/orchestration-reviewing/SKILL.md` |
| Skills handoff (library propagation) | `SKILLS-HANDOFF.md` |
| Existing handoff examples | `direct-paths/handoffs/` |
