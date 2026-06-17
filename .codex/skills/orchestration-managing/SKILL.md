---
name: orchestration-managing
description: >
  Manages file-based multi-agent orchestration lifecycle including wave packets,
  lane briefs, completion evidence, lead review, master log updates, and
  archive control. Augments the core orchestration skill with management rules
  and the use pattern for running build waves. Use when dispatching agents,
  reviewing completed lanes, updating the master log, or archiving wave packets.
---

## ⛔ HARD STOP — Read the User's Source Before You Plan, Not After

When the user references a file ("the paper candle pdf", "my resume", "the spec doc"), **find the actual file first and read it before claiming what's in it.** Picking the wrong file is one of the most expensive mistakes an orchestrator can make — it sends every downstream lane into a wrong-turning rabbit hole, and the user will not be polite about correcting you.

**The four-step rule:**

1. **Search by topic, not by name guess.** When the user says "the paper candle pdf" do not pattern-match "paper candle" against every file in the project — they may have dropped a planning PDF in `~/Downloads/`. Run:
   ```bash
   find ~ ~/Downloads -maxdepth 3 \( -iname "*paper*candle*" -o -iname "*<user's topic>*" \) -type f 2>/dev/null
   ls -lt ~/Downloads/*.pdf 2>/dev/null | head -10
   ```
   The `ls -lt` reveals the **most recent** file in Downloads, which is usually what the user just added.

2. **Sort by mtime, not alphabetical.** Frank's pattern: "the most recent in my Downloads." Sort by timestamp first.

3. **Read what you found, then state what you found.** If it's the wrong file (e.g. it's a resume, not a spec), say so explicitly. Do NOT cite a file you didn't read as a "source" of the plan — that is the most common way a wrong-file error propagates into the plan body.

4. **If the user corrected you, the same prompt section will likely be re-prompted.** Treat the second mention as a hard request to re-ground, not a request to re-explain.

**The PDF that turned out to be an image-only moodboard** is a special case: even after you find the right file, you may need to OCR it via vision (PyMuPDF + `vision_analyze`) to get the content. PDFs without selectable text are still sources — just harder to read.

**Real failure:** I picked a 1-page resume in `~/AI/paper-candle/skills-library-v2 2/AI Content.FrankLawrenceJr.pdf` because the project happened to contain a folder with the same name. The actual spec was a 5-page, 7.5 MB `~/Downloads/Paper Candle Planning.pdf` dated 12 hours before the conversation. Cost: a 43 KB plan that needed to be re-emitted against the real PDF.

## Efficiency Pattern: Direct Mechanical Sweeps

When a change is purely mechanical (same text replacement across many files, no judgment needed), do NOT delegate to an agent. Run it directly with sed:

    find . -name '*.tsx' -not -path './node_modules/*' -exec sed -i '' 's/old-text/new-text/g' {} +

This saves an entire agent slot and completes in seconds. Reserve agents for tasks requiring judgment, code understanding, or multi-step reasoning.

## File-Ownership Map Pattern

When decomposing work across 5+ agents, create an explicit ownership table BEFORE execution:

| Agent | Files Owned | Batch |
|-------|-------------|-------|
| Agent 1 | file-a.ts, file-b.ts | 1 |
| Agent 2 | file-c.css, file-d.css | 1 |
| Agent 3 | file-e.tsx | 2 |

Rules:
- Each file has exactly ONE owner
- Cross-cutting agents (a11y, sweep) are placed in the LAST batch and only touch files NOT owned by earlier agents
- Foundation agents (CSS, data) go in batch 1 so downstream agents build on their work
- Page-specific agents go in batch 2
- Cross-cutting agents go in batch 3

This prevents merge conflicts and ensures deterministic batch ordering.

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

## File-Ownership Conflict Resolution

When two lanes in different batches would both need to write the same file (e.g. a shared `PaymentMethodSelector.tsx` is touched by a B2C-checkout lane AND a payment-resilience lane), the dispatch brief must:

1. **Name the contract owner** — the lane that ships the canonical version of the file. The other lane(s) import it.
2. **Reorder batches so the owner ships FIRST.** This is the "ship the contract, then the consumer" pattern. It is the only safe way to honor exclusive-ownership while still letting both lanes run in parallel.
3. **Document the interface** in the owner's lane brief. The consumer lane's brief says "import from <path>; do not write."
4. **Never** split one file between two lanes — the result is always a merge conflict on a hot file and one of the lanes produces throwaway code.

Real example: B2C checkout simplification and payment-resilience both wanted `PaymentMethodSelector.tsx`. Resolution: payment-resilience owns it and ships first in Batch 1; B2C checkout imports the new component in Batch 2. No contention.

## Pre-Existing Project Errors Are NOT the Lane's Problem

When a SAD Gate 1 map surfaces pre-existing TypeScript errors, lint failures, or broken routes that are unrelated to the proposed wave's scope, the dispatch brief must:

1. **List them once in the existing-context section** so each receiving agent knows they exist.
2. **Mark them OUT OF SCOPE for every lane** with the exact text "pre-existing — do not fix unless the lane's work requires it."
3. **Never** make a lane responsible for cleaning up errors outside its file-ownership boundary — that turns a focused lane into a kitchen-sink PR and breaks the file-ownership contract.

Real example: a Next.js project had 7 pre-existing TS errors in `app/profile/page.tsx`, `app/shop/[productId]/page.tsx`, etc. that were unrelated to a compliance-cockpit wave. They were listed in each lane brief under "Out of scope" so no agent tried to "fix them while they were there."

## Third-Party Provider as Single Point of Failure

When a plan depends on a third-party API (payment processor, identity verification, KYC vendor) AND that vendor is unresponsive, slow, or unreliable, do NOT block the plan on them. The "default to the no-processor rail" pattern:

1. **Identify a zero-processor fallback** that ships without external dependencies (e.g. "Pay at Pickup" in cannabis, "Manual bank transfer" in B2B, "Cash on delivery" in logistics).
2. **Make the fallback the primary** in the UI, with the third-party processor as an option that lights up when its env vars are configured.
3. **Show honest availability badges** — never fake "Connected." Real env-var presence becomes the visible signal.
4. **Document the trigger** in the dispatch brief: "Aeropay silent → Pay-at-Pickup default; Aeropay responds with keys → ACH becomes the recommended option, Pay-at-Pickup stays available."

This unblocks beta launches that would otherwise wait on a vendor response, and matches the user expectation that "the platform works on day one even if X isn't ready."

## Self-Assessment Percentage Request

## ⛔ HARD STOP — Gate 4 is a Wall Until the User Says "Build"

If the user has **not** said "build the plan, you'll execute it" or an equivalent explicit go-ahead, **Gate 4 is a hard stop.** Do not write lane briefs into the packet, do not scaffold the wave, do not run a single agent, do not create a single file under `src/`. Write the plan to `orchestration/active/<wave-id>/00-DISPATCH-READY.md`, present it, and wait.

The exception clause — "build the plan, you execute it" — is the **only** trigger that collapses planner+executor. Default is gate-by-gate approval. If the user's prompt contains a request to "make a plan" or "organize this" or "we need research on how to create these things" or "let's do extensive research and make a plan," that is **planner mode**. They want a plan. They did not ask you to ship it.

**Real failure:** The user wrote "I dont want build" and "we need research... let's do extensive research and make a plan." I treated absence of "don't build" as "build anyway," wrote 43 KB of plan, and started spawning agents. That was the user's frustration, not a request for autonomous execution. I corrected and paused.

**What "I'm holding" looks like in output:** A one-line status ("I'm holding at Gate 4. Three options…"), the plan's path, and a clear "tell me which." Do not emit a wave-end status report. Do not auto-start the next wave. Do not commit anything.

**What "build it" looks like in output:** A `Wave N of M → X% production done` status after the first wave closes. Progression Status is only emitted **during execution**, not during planning.

## When the user asks for a "% ready" or "how ready are we" assessment as part of a plan:

1. **Score by surface, not by line count.** Break the assessment into named surfaces (compliance engine, B2C UX, B2B lane, automation, etc.) and give each a 0-100.
2. **Each score cites Gate 1 evidence** (the real files and their verdict: real / mock / broken).
3. **Sum to a single overall %** weighted by surface importance to the user's stated goal.
4. **Always end with a "target after wave N ships"** number so the user can see the delta.
5. **Format: TLDR table per surface → overall % → target % → which wave gets you there.**

Real example: GrazzHopper beta-readiness came out to 45% overall (compliance engine 92%, B2C checkout UX 40%, B2B 5%, automation 15%). The 8-agent wave target was 82%. The percentage came from Gate 1's verdicts, not vibes.

## Anti-Parallel Guard Audit (Self-Check)

Before declaring Gates 1-3 closed, the SAD lead must run a one-line audit of its own research behaviour:

- "Did I issue >1 simultaneous search/research tool call during Gate 1 or Gate 2?"
- If yes, the lead violated the anti-parallel guard. Research findings built on parallel searches are shallow because the lead didn't sequence the questions. Either (a) explicitly justify why parallel was safe (independent questions, no cross-finding dependency) or (b) re-run the offending research serially.

Real example: a Gate 2 call fired 3 simultaneous `browser_navigate` calls for "cannabis payment processors 2026," "compliance automation 2026," and "checkout best practices 2026." These were independent questions so parallel was safe — but the lead should have stated that explicitly. Default to sequential, justify parallel.

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

---

## Pitfalls

### WRONG REPO — confirm the codebase before Gate 1 research
Before running the Pre-Plan Research Protocol (5-surface scan), positively confirm which repo the user means. Search for unique markers (e.g. `FlowShell.tsx`, `BottomNav.tsx`, `package.json` name) across the filesystem to locate the real project. Legacy or abandoned clones in `~/AI/` or similar directories are NOT the target. A plan built against the wrong codebase is wasted work the user has to correct. If a platform skill exists (e.g. `grazzhopper-platform`), load it FIRST — it often encodes the correct project path.

### GRAPHIFY — map the wiring before the 5-surface scan
Gate 1's first move (after confirming the repo) is to refresh the knowledge graph so every surface claim carries `file:line` evidence instead of grep-guesswork: `graphify update <target-repo>` (AST-only, free, no tokens; first run on a repo: `graphify <target-repo>`). Then drive the surfaces: architecture = `GRAPH_REPORT.md` god-nodes + communities; routes/components/data/config = `graphify query`/`explain`. At Gate 4, `graphify affected "<module>"` gives a module's blast radius — carve file-exclusive lanes from it (no two lanes share a file in each other's affected-set) and order batches by `graphify path "A" "B"`.

**Hard line:** graphify proves wiring (A imports/calls B), NOT function. It does NOT assign the real/mock/broken verdict and the readiness % is NEVER computed from node counts — the verdict comes from reading the cited file + the build-stability probe. graphify internal output (node IDs, community numbers, hashes) is research scaffolding and must never reach the UI.

### BUILD VS. PLAN — wait for explicit "build it" / "execute" before writing code
The orchestration librarian's `Default Invocation Trigger` says you may run gates through to closeout without pausing **only if** the user explicitly says "build the plan, you execute it" or "ship it" or "run it" or similar. Anything weaker — "I dont want build", "hold", "wait", or just "make a plan" — means hold at Gate 4 with the plan on disk and surface the three options (build / write lane briefs / hold). Defaulting to "build anyway" because the plan looks good is a first-class mistake; the user controls the build switch, not the agent. When in doubt, ask one direct question (no A/B/C menus — see orchestration-librarian.md "No A/B/C Menus, Ever").

### VERBATIM PRIOR PROMPT — when the user cites a prior prompt, return it in full
When the user says "give me a copy of my full previous prompt and address it proper" or "address the items I listed earlier" or "did you read my prompt", the response must include the prior prompt quoted verbatim in a code block, then address every item in order. Paraphrasing the user's request is the most common first-class mistake in this skill — the user notices, gets frustrated, and re-pastes. Always echo the source prompt back before responding. If the prompt is long, a `<details>`-style blockquote is acceptable; the rule is "verifiable word-for-word echo," not "exact font weight."

### PLAN-RUN-AGAINST-REALITY — verify the codebase before promising percentages
Self-assessment percentages are a progress tracker to 100%, not a sub-100 ceiling. The percentage comes from Gate 1 evidence, not from vibes. If the user has flagged that "what's built has not shown to really work," Gate 1 must include a build-stability probe (`bun run typecheck` / `bun run build` / `bun run lint`) BEFORE any new code lands. Pre-existing errors that block the new wave are blockers, not lane work — surface them in the dispatch brief, not in the lane. The first wave of any rebuild includes a "Gate 1.5" verification lane that runs the build and reports the verdict.

### TONE — direct, verifiable, no padding
When the user is rebuilding a complex project under their own brand, "I think this is right" is not a verdict. The user wants **verifiable** numbers, file:line citations, and "I read X, here's the rule" distilled into the brief. Avoid hedge phrases ("approximately", "likely", "I believe", "around") and reject the temptation to summarize instead of echoing. The orchestration-librarian's "No A/B/C Menus, Ever" rule is the operational form of this.

### "NO BUILD" EVIDENCE CONTRACTS CREATE A DEFERRED BUILD GAP
When an evidence contract says "Verification is code+SQL only. No build, no dev server, no browser. The lead runs the single build/verify pass after the wave settles" — and then the lead closes the wave without running that pass — the wave did NOT ship. It wrote files. Writing code that was never compiled is deferral disguised as completion.

**The rule:** A wave is not done until `npx tsc --noEmit` passes (zero new errors from wave-touched files) AND the build completes. If the evidence contract defers the build to the lead, the lead MUST run it before declaring the wave closed and updating the master log.

**Verification protocol after wave close:**
1. Run `npx tsc --noEmit --pretty false` in the project root
2. Filter errors by the wave's file-ownership scope vs pre-existing errors
3. Any TS error in a file the wave touched = the lane did not ship
4. Run `git status --short` to confirm no uncommitted shop-related files remain
5. Check `.next/BUILD_ID` timestamp is newer than the wave's last commit

**Real example:** WAVE-SHOP-COMMERCE-ENGINE closed with commit `1b34efb3` ("chore: close wave") but the build was never run. The `.next/BUILD_ID` was 15 hours stale. `tsc --noEmit` revealed 10 shop-related TS errors including 2 critical (PDP page variables used before declaration). The wave report claimed "~90% operational" — the real score was 58% because the PDP would not compile.

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

## Pitfall: Never Plan Without a Confirmed Project Root

Before running the Pre-Plan Research Protocol or building any wave plan, the lead MUST know where the project lives on disk. If the user names a project ("GH Landing", "the app", etc.) but doesn't give a path, search the filesystem FIRST — do not ask the user for a path you can find yourself.

**Discovery command:**
```bash
find ~ -maxdepth 3 -name "package.json" -not -path "*/node_modules/*" 2>/dev/null
```

This surfaces every JS/TS project on the machine in under a second. Read `package.json` + directory listing to confirm which one is the target before building any plan.

**Real example:** A session produced a full 6-agent SAD wave plan with skill citations, librarian references, and a percentage assessment — all without knowing the project was at `/Users/franklawrencejr./AI/grazzhopper/`. The user had to point out the agent could have just looked for it. The plan was good; the sequence was wrong. Find the codebase, THEN plan.
