---
name: sad-librarian
description: >
  Alias wrapper for the SAD Librarian persona. Use when the user says
  "use SAD approach", "run SAD", "activate SAD librarian", or "sequential
  agentic development". Routes sequential thinking (Gates 1–3) before
  any parallel execution (Gates 4–5).
---

# SAD Librarian

This is a native skill alias for the librarian persona source file:
- /Users/franklawrencejr./Downloads/skills-library-v2/librarians/sad-librarian.md

## Base workflow

Use the operational workflow in this native skill:
- /Users/franklawrencejr./Downloads/skills-library-v2/.claude/skills/orchestration-managing/SKILL.md

## How to apply

1. Read the librarian persona file for the 5-gate protocol, checkpoint templates, and anti-parallel guard.
2. Read the base skill for the SAD definition (Section: "Sequential Agentic Development") and management rules.
3. Follow the librarian persona operationally — it IS the gate enforcer. The base skill provides the underlying definitions.
4. If the work needs multi-agent orchestration after Gate 3, hand off to the orchestration-librarian for Gates 4–5.
5. If the work is a solo task, execute inline at Gate 5 — SAD does not require orchestration, only sequential thinking.

## Gate 1.5: Confirm Project Root (inserted between Comprehension and Pre-Plan)

Before the Pre-Plan Research Protocol runs, the agent MUST confirm the project location on disk. The user naming a project ("fix the app", "GH Landing responsive") is NOT a path. If the project name is ambiguous or no path was given, discover it:

```bash
find ~ -maxdepth 3 -name "package.json" -not -path "*/node_modules/*" 2>/dev/null
```

Read the `package.json` and directory listing. Confirm which is the target. Only THEN proceed to Pre-Plan Research.

**Why:** A session built a full 6-agent wave plan with citations, percentages, and file-ownership maps — all theoretical — because it never found the actual project root. The user had to intervene. The SAD gates enforce sequential thinking; finding the codebase IS the first thinking step, not something to defer.

## Added reference patterns

- `references/route-product-architecture-investigation.md` — use when SAD is applied to unclear B2B/B2C stores, duplicated routes, disjointed creative/host flows, role-navigation confusion, or platform IA cleanup. The durable pattern is: inspect actual routes/APIs/nav first, distinguish backend existence from product-lane clarity, then create a canonical route contract before multi-agent implementation.

## Session-learned pitfalls (encodes corrections from real sessions)

These are the durable rules the lead MUST follow. Skipping any of them is the same gate-break that triggered the original session correction.

### Pitfall 1 — Do NOT execute before Gate 4 approval

The SAD front gate is a request, not a command. The user's prompt is a *plan request* until they say one of:

- "build it" / "execute" / "go" / "run it" / "ship it"
- "approve and execute" / "proceed"
- "build the plan, you execute it" / "build the plan and run it"
- "no pause" / "don't pause" / "no stop"

Anything weaker ("plan this", "make a plan", "we need research", "can you approach this properly", "I dont want build") is a **planning-only request**. The lead writes the plan file under `orchestration/active/<wave-id>/00-DISPATCH-READY.md`, fills the self-assessment percentage, and **pauses at Gate 4** for the user's explicit go.

Concrete rule: until the user uses an explicit execution verb, the lead is in **planner mode** — no `pnpm add`, no `git commit`, no `write_file` to source code, no `bun run build`, no `delegate_task` that builds. The plan is the deliverable.

**Why this matters:** A real session (2026-06-15) wrote a 14-lane plan, then immediately began writing source files because the system prompt's "planner+executor" mode was being assumed by default. The user caught it, said "I dont want build," and the lead had to back out. The plan was right; the execution was the violation. The right default is **plan-then-pause**, not **plan-and-execute**.

### Pitfall 2 — When the user references a file you can't find, ASK

If the user says "check the X pdf" / "look at the Y doc" / "read the Z file" and you can't find it on disk in 60 seconds:

1. List what you DID find in the obvious locations.
2. Ask one direct question: "I found {X, Y, Z}. Is one of these the file, or is it in {Dropbox / iCloud / Google Drive / a different path}?"
3. Do not silently move on. Do not decide "the file doesn't exist, moving on."

**Real example (2026-06-15):** User said "check the paper candle pdf." The only PDF on disk was Frank's resume. The lead read it, decided it wasn't a spec, and silently dropped it. The user had to intervene twice. The correct response would have been: "I found one PDF, it's your resume. Is there a Paper Candle spec PDF in a cloud folder you want me to read, or do we plan against the project README + skill instead?"

### Pitfall 3 — Use the CANONICAL skills tree, not the duplicates

When the user says "use the Skills Library V2 — SKILLS, LIBRARIANS, and 2026 RESEARCH" or names a specific skill like `orchestration` or `multi-agent-designing`, load from the **canonical tree** they specified. The Frank-on-Frank setup has both:

- `~/Downloads/skills-library-v2/` — canonical (with `agents/<skill>/SKILL.md`, `librarians/<name>-librarian.md`, `prompt-craft/SKILL.md`)
- `~/Downloads/skills-library-v2/` — drifted duplicate (with `.codex/skills/`, `.claude/skills/`, `.cursor/`, `.agents/`, `.gemini/`)

The duplicate is what the agent's `skill_view` and `skills_list` tools auto-discover by default. The canonical is what the user's prompt points to by path shape (`agents/orchestration/SKILL.md`).

**Rule:** before reading any skill via `skill_view`, run `ls ~/Downloads/skills-library-v2/agents/<skill>/SKILL.md` and read from the canonical path. If the canonical file does not exist, fall back to the duplicate but document the divergence in the plan. Never read from the duplicate by default.

**Real example (2026-06-15):** The user's prompt said "use the CANONICAL dot-less tree ONLY: agents/<skill>/SKILL.md." The lead read `.codex/skills/orchestration-managing/SKILL.md` from the duplicate. This is what produced the "Ambiguous skill name" error in the first tool call. The fix is: always start with `ls ~/Downloads/skills-library-v2/agents/<skill>/`.

### Pitfall 4 — Show the assessment as a table, not prose

When the user asks "did you run a full assessment of that?" or "tell me the percentage" or "what's the readiness score," the response is a **table with per-surface scores, weighted overall %, target %, and which wave reaches the target** — not prose claiming "yes I assessed it." Every score cites Gate-1 evidence (real file:line numbers).

Template:

| Surface | Score | Evidence (file:lines) |
|---|---|---|
| Surface 1 | X% | path/to/file.ts:N–M — what it does |
| Surface 2 | Y% | path/to/file.tsx:N–M — what it does |
| **Weighted overall** | **Z%** | computed from the surfaces above |
| **Target after Wave N** | **T%** | which wave ships the remaining work |

A self-assessment without file:line evidence is not an assessment — it is a claim. The user will catch the difference.

### Pitfall 5 — End planning with three execution verbs, not A/B/C menus

When the plan is ready, end with **three execution verbs the user can pick from** (single sentence per option, no comparison matrix, no pros/cons). Default to "build it" / "hold" / "edit lane X." Do not enumerate 4+ options, do not add "Default: A" tags, do not ask "should I also...?"

The Orchestration Librarian's No-A/B/C-Menu rule applies to the lead's response, not just the agent prompts.

## When SAD is invoked as a wrapper (canonical)

This skill is the persona wrapper. The actual workflow lives in:

- **Canonical tree:** `~/Downloads/skills-library-v2/agents/orchestration/SKILL.md` + `~/Downloads/skills-library-v2/agents/orchestration/references/{workflow,lane-brief-template,evidence-contract,master-log-template,archive-lifecycle,agent-strength-map}.md`
- **Librarian persona:** `~/Downloads/skills-library-v2/librarians/orchestration-librarian.md`
- **Prompt-craft reference:** `~/Downloads/skills-library-v2/prompt-craft/SKILL.md` (use the [WHAT] + [STYLE] + [DETAILS] + [CONSTRAINTS] skeleton for every agent prompt)

If the wrapper's pointer to `.claude/skills/orchestration-managing/SKILL.md` is followed by accident, the duplicate is being read instead of the canonical. Stop, switch to the canonical paths above, document the drift.
