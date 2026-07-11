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

### Pitfall 1b — Once paused, STAY paused until the user moves

After the plan is delivered and Gate 4 is reached, do not keep re-asking the user to choose a verb ("build it / hold / edit lane N") at the bottom of every subsequent message. Once the plan is in `orchestration/active/<wave-id>/00-DISPATCH-READY.md` and the evidence contract is in `99-EVIDENCE-CONTRACT.md`, the user knows the plan exists and what the verbs are. Repeating the menu turn after turn is filler.

**Rules after Gate 4:**

1. **The first time** the plan is delivered, end with the three execution verbs (sad-librarian Pitfall 5: no A/B/C menus, just three verbs). One direct question only.
2. **Every subsequent message** in the same session while the plan is paused: state what you did (research, patch, append, etc.), confirm "plan is still at Gate 4 — no build until you say so," and STOP. Do not repeat the verbs. Do not offer menus. Do not re-summarize the architecture. The user has the conversation transcript.
3. **When the user gives a new direction** (corrections, more research, edits), follow it. Treat the new direction as a Gate-4-equivalent re-scoping — patch the plan, do not execute.
4. **Only re-mention the three verbs** if the user explicitly asks "what's the status" or after a major plan revision lands.

**Why this matters:** Frank has called this out ("stop telling me my call now, still at gate four. Don't mention gate four again."). The verb menu is for the delivery moment, not for every turn after.

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

The Orchestration Librarian's No-A/B-C-Menu rule applies to the lead's response, not just the agent prompts.

### Pitfall 6 — Critical-path assets must be sequenced, not parallelized

When a deliverable has a critical-path asset (a chart engine, a database schema, a design-token file, an auth layer) that **multiple downstream lanes depend on**, that asset ships in its own lane first. Do NOT put it in a parallel batch with downstream consumers.

**Concrete failure pattern:** A plan promises "5 parallel agents" and lists Lane C (chart engine) and Lane J (Inspector that uses the chart engine) in the same batch. Two agents race on `LiveChart.tsx`. Both produce stubs. The downstream surface ends up empty even though the chart engine "shipped." The user sees a 25-line stub where a full feature was promised.

**Rule:** In Gate 4, identify the dependency graph. If lane X's outputs are lane Y's inputs, X is on Y's critical path. Order the lanes sequentially: X first, Y next. Only fan out into parallel batches when the lanes are file-exclusive and the shared inputs are already shipped (or read-only).

**Real example (2026-06-18):** Paper Candle v2 had a 10-lane plan with 5 parallel batches. The chart engine and three downstream UI surfaces (Learn, Glossary, Simulator) all touched `LiveChart.tsx` in the same batch. The chart engine shipped as a stub, the Learn and Glossary pages imported zero charts, the simulator was 25 lines. The plan's "100% at wave 5" was never hit. The v2 proof plan (see `paper-candle-platform` → `references/papercandle-v2-proof-plan-2026-06.md`) fixes this by making the chart engine its own L0 lane that lands first, with L1, L2, L3, L4 consuming it sequentially.

### Pitfall 7 — "User referenced a PDF" means list, then title-match, then read

When the user says "the pdf in my downloads" or "the brief I just dropped" or similar, the file is almost always one of several. Don't grab the first PDF and call it good. Don't grab the PDF with the most relevant-sounding title in your head without checking the file system.

**Rule (3 steps, in order):**
1. **List** — `ls -lt ~/Downloads/ | head -30` (or `find ~/Downloads -type f -iname "*.pdf" | xargs -I{} stat -f "%Sm %N"`) to surface every PDF with its mtime.
2. **Title-match** — pick the file whose **title and date** both match what the user described. Title alone is not enough (Frank's downloads has multiple "Paper Candle Planning" PDFs from different days); date alone is not enough (the most recent PDF may be a different project).
3. **Read in full** — `pdftotext -layout` for text PDFs, `pymupdf → /tmp PNGs → vision_analyze` for image-only PDFs (see `paper-candle-platform` → `references/pdf-vision-extraction-2026-06.md`).

**Real example (2026-06-18):** Frank said "the pdf in my downloads goes over some of this." The agent grabbed `STILL HUMAN — PRODUCT CONCEPT DOCUMENT.pdf` because it was the most prominent PDF in the directory listing. It was a StillHuman product brief from March 2026, completely unrelated to Paper Candle. Frank pushed back with "wtf are you talking about" — a first-class frustration signal. The right file was `Paper Candle Planning (2).pdf` (June 17) or `Paper Candle AppSmithing.pdf` (June 18) — the same project, more recent versions, with very different filenames. The mistake was reading the file that *looked* right and answering from it instead of listing and matching.

**Why this is a separate pitfall from Pitfall 2:** Pitfall 2 covers "the file isn't there, ask." Pitfall 7 covers "the file IS there but it's the wrong one — and you'll be confidently wrong, not stuck." A confident wrong answer is worse than asking, because the user has to argue you out of the wrong framing before you can hear them.

### Pitfall 9 — When the user says "run SAD," read the actual SAD-PROMPT.md file FIRST

When the user says "run the SAD prompt," "run SAD in detail," or "run SAD against it," they mean the canonical `~/Downloads/skills-library-v2 2/SAD-PROMPT.md` file, not just the librarian persona. Read that file in full before starting Gate 1. The prompt file is short (it binds the run to the goal and lists the files to read in full). The librarian persona is the gate enforcer; the PROMPT file is the actual instruction.

**Real example (2026-06-21):** User said "run the SAD prompt in detail with citations and grounding." The agent read `sad-librarian.md` but NOT `SAD-PROMPT.md`. The agent then produced a lightweight analysis instead of the full 5-gate process. The user corrected: "did you run the sad prompt in my skills library??" — meaning the canonical file, not the librarian skill. The fix: when SAD is invoked, read BOTH the librarian AND the prompt file.

### Pitfall 10 — Do NOT narrow scope to the obvious surface

When SAD Gate 1 scans a platform, scan ALL surfaces that touch the user's ask, not just the most visible one. If the user says "the educational content can be better," that means every learning surface in the app, not just the 3 hand-authored lessons. A narrow scan produces a narrow plan, which the user rejects.

**Real example (2026-06-21):** The user asked to analyze Paper Candle's educational content. The agent scanned `src/lib/learn/content.ts` (3 lessons) and reported "only 3 lessons." The user corrected twice: "you keep saying three lessons. There are many educated parts." The actual platform has 765+ content entries across 12 surfaces (patterns, glossary, concepts, sayings, options strategies, playbooks, tool lessons, scenarios, practice games). The agent had to re-run the full 5-surface scan to discover the true scope.

**Rule:** Gate 1's 5-surface scan (Architecture, API routes, Components, Data layer, Configuration) must cover every directory that touches the user's stated domain. If the user says "educational content," that includes `src/lib/content/`, `src/lib/patterns/`, `src/lib/learn/`, `src/components/learn/`, `src/components/glossary/`, `src/components/tools/`, `src/components/patterns/`, AND `src/lib/srs/`. Do not stop at the first directory with content.

### Pitfall 8 — "The plan was ass" means ground every rule, don't add more lanes

When the user says "the first build was ass", "the plan was ass", "this lacks structure", "I need my rules and outlines for each page to be CLEAR and supported in grounded context and research so we can build" — the diagnosis is **grounding, not shape**. The shape (lanes, file-ownership map, dependency order) is usually fine. What's missing is that each rule is asserted without evidence.

**Rule:** every non-trivial rule in a SAD plan must come with **two artifacts**:
1. The rule statement.
2. A cited 2024-2026 source: a real URL, skill, librarian, prior review, or local file:line reference, with the rule extracted and applied to this build.

A link with no extracted, applied rule transfers nothing. A rule with no link is a claim. The pairing is the standard. The user pushes back hardest on plans that look authoritative but ship on assertion. A self-assessment table without file:line evidence is the same anti-pattern at the surface level (see Pitfall 4). The fix is the same: evidence, not assertion.

If a rule cannot be grounded, mark it `[ungrounded]` in the plan and surface it to the user as an open question. Do not bury ungrounded rules in flowing prose.

**Real example (2026-06-18):** A first-cut Paper Candle v2 plan had 10 lanes and 35+ rules, but most rules were asserted ("use lightweight-charts", "show real bars") without a cited source. Frank said "did you improve new plan? are these instructions clear? i need my rules and outlines for each page to be CLEAR and supported in grounded context and research so we can build." The next pass added a 2024-2026 URL to every rule (TradingView Bar Replay for replay, Tastytrade for options flow, Kolb for lesson cycle, Duolingo Crown Levels for mastery grid, WCAG 2.2 for touch targets). The plan went from "10 lanes, asserted" to "7 lanes, every rule cited" — fewer lanes, more depth. The shape was the right call. The grounding was the fix.

**Companion rule:** No time estimates in plans (see `writing-plans` and `plan` skill). Banned: "1 hour", "30 min", "2-3 days", "Effort:". Frank calls this out. The plan describes the shape of the work; the cadence is the user's call.

## When SAD is invoked as a wrapper (canonical)

This skill is the persona wrapper. The actual workflow lives in:

- **Canonical tree:** `~/Downloads/skills-library-v2/agents/orchestration/SKILL.md` + `~/Downloads/skills-library-v2/agents/orchestration/references/{workflow,lane-brief-template,evidence-contract,master-log-template,archive-lifecycle,agent-strength-map}.md`
- **Librarian persona:** `~/Downloads/skills-library-v2/librarians/orchestration-librarian.md`
- **Prompt-craft reference:** `~/Downloads/skills-library-v2/prompt-craft/SKILL.md` (use the [WHAT] + [STYLE] + [DETAILS] + [CONSTRAINTS] skeleton for every agent prompt)

If the wrapper's pointer to `.claude/skills/orchestration-managing/SKILL.md` is followed by accident, the duplicate is being read instead of the canonical. Stop, switch to the canonical paths above, document the drift.

## Pitfall 11 — Research-tool availability audit (added 2026-06-23)

When a SAD plan's "2026 Research" pillar names platform / competitor
research the lead cannot do itself in this session, the default trap
is to dispatch research subagents assuming the runtime exposes built-in
`web_search` / `web_extract`. Many Hermes sessions do NOT. Subagents
either fabricate (worst case) or return an honest blocker (better
case but the plan cites nothing). The user's hard rule is "no made
up stuff for research — verified URLs only."

**Before any research subagent is dispatched during Gate 2, audit the
tool surface the subagent will actually inherit.** Two checks:

1. Enumerate the available tools (subagent's `toolsets` parameter +
   the MCP servers mounted on the subagent's profile).
2. Verify the tool works. For NotebookLM: `mcp_notebooklm_get_health`.
   If `authenticated: false`, that path is closed for this session.

If every research path is closed, **rewrite the delegation prompt to
enumerate ONLY the available tools and instruct the subagent to stop
and report on failure — never to fabricate.** That matches the user's
"no made up stuff" rule.

If NO research tools will work this session, the plan's "2026
Research" pillar must be **honestly downgraded** in the plan doc
itself. Add a "Research Pillar Status" section naming the unavailable
tools, stating what the pillar is grounded in instead (existing
librarian references + the codebase itself + prior session findings),
and documenting the recovery path (`notebooklm.auth-setup` next
session, or running the wave in a web-tool-equipped runtime).

**Session example (2026-06-23):** A wave-g2-tv-feed plan claimed a
35/35/30 SKILL/LIBRARIAN/2026-RESEARCH citation weight. Three
parallel research subagents all returned honest blockers in 30
seconds: built-in `web_search` not wired, NotebookLM
`authenticated: false`, Mobbin token expired. The lead then patched
the plan doc to honestly downgrade the research pillar and document
the recovery path. The plan was accepted as shippable.

**Companion rule:** "research pillar honestly downgraded, recovery
path documented" is shippable. "research pillar: 12 verified 2026
URLs" when no such URLs exist in the session is a failed review.

See `references/sad-grounding-checklist.md` for the full grounding
protocol + `templates/research-tool-availability-audit.md` for the
copy-pasteable audit prompt to drop into a delegation brief.
