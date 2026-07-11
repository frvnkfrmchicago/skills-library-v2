---
name: prompt-engineering
description: >
  Context-aware prompt and specification engineering for Antigravity, Claude Code,
  Codex, and Hermes. Four levels from quick prompts to full multi-agent orchestration
  specs. Knows the skills library v2 (84 librarians, 151+ skills), embeds SAD gates,
  enforces grounding citations, and generates ready-to-paste prompts from natural
  language. Use when crafting any prompt, building agent instructions, creating system
  prompts, designing multi-agent specs, or when user says "I need a prompt for X."
---

# Prompt Engineering — Context Engineering System

The prompt is dead. Context is the product. In 2026, effective AI steering is not about
magic phrases — it is about assembling the right information at the right time in the
right structure so the answer you want is the most likely answer the model gives.

This skill provides a 4-level system for generating prompts that scale from quick
questions to full multi-agent orchestration specifications, all grounded in the
skills library.

---

## Table of Contents

1. [The 4-Level System](#1--the-4-level-system)
2. [Tool Profiles](#2--tool-profiles)
3. [Library Navigation Protocol](#3--library-navigation-protocol)
4. [Grounding Protocol](#4--grounding-protocol)
5. [Context Engineering Patterns](#5--context-engineering-patterns)
6. [Anti-Patterns](#6--anti-patterns)
7. [STOP Gate](#7--stop-gate)

---

## 1 — The 4-Level System

### Decision Tree

```
Is this a simple question, small fix, or quick generation?
  YES → L1: Quick Prompt
  NO  → Does it touch multiple files or need design/research context?
    YES → Does it need 2026 research, SAD gates, or self-assessment?
      YES → Does it need multiple agents?
        YES → L4: Orchestration Spec
        NO  → L3: SAD-Integrated Prompt
      NO  → L2: Context-Grounded Prompt
    NO  → L1: Quick Prompt
```

---

### L1: Quick Prompt — The Asker

**When to use:** Simple one-off tasks, questions, small fixes, quick generations.
One agent, one concern, one output.

**Output:** 5–15 lines with role + task + constraints + format.

**Grounding required:** None (optional skill reference).

**Template:** See `templates/level-1-quick.md`

**Structure:**
```markdown
## Role
You are a [role] with expertise in [domain].

## Task
[One clear, specific instruction — one sentence if possible]

## Constraints
- [What to include]
- [What to avoid]
- [Tone/style requirements]

## Output Format
[Exact structure expected — JSON, markdown, table, code, etc.]
```

**Example:**
```markdown
## Role
You are a senior TypeScript engineer.

## Task
Refactor the useAuth hook in src/hooks/useAuth.ts to use the new session
token format from the auth-v2 migration. Replace the JWT decode with the
new parseSessionToken utility.

## Constraints
- Do not change the hook's public API (return shape stays the same)
- Keep existing error handling patterns
- Add type annotations for the new token shape

## Output Format
Complete TypeScript file with inline comments on changed sections only.
```

---

### L2: Context-Grounded Prompt — The Curator

**When to use:** Feature builds, design work, research tasks — anything touching
multiple files or needing domain expertise from the library.

**Output:** 20–50 lines that load specific skills/librarians by name and path.

**Grounding required:** At least 1 skill + 1 librarian cited with concepts extracted.

**Template:** See `templates/level-2-context.md`

**Structure:**
```markdown
## Target Tool
[Antigravity / Claude Code / Codex / Hermes] + [model]

## Domain Context
- Project: [name]
- Codebase: [path or description]
- Current state: [what exists, what's broken]

## Skills Library Context
Read and follow these skills IN FULL before proceeding:
- ~/Downloads/skills-library-v2 2/.codex/skills/[skill]/SKILL.md — for [aspect]
- ~/Downloads/skills-library-v2 2/.codex/skills/[skill]/SKILL.md — for [aspect]

Activate these librarian personas:
- ~/Downloads/skills-library-v2 2/librarians/[librarian].md — for [focus]

## Task
[Clear instruction that references the skills' workflows]

## Constraints
- [From the loaded skills' STOP gates]
- [Project-specific constraints]

## Output Format
[Structure, citing which skill's format to follow]

## Grounding Citations
| Type | Reference | Applied Concept |
|------|-----------|-----------------|
| SKILL | [name] | [extracted rule → how it applies here] |
| LIBRARIAN | [name] | [persona focus → how it shapes output] |
```

**Example:**
```markdown
## Target Tool
Antigravity (Sonnet 4.6)

## Domain Context
- Project: GrazzHopper dispensary platform
- Codebase: ~/projects/grazzhopper
- Current state: Dashboard exists but uses raw hex colors and px values
  throughout component files. No design tokens. Dark mode is color inversion.

## Skills Library Context
Read and follow these skills IN FULL before proceeding:
- ~/Downloads/skills-library-v2 2/.codex/skills/experience-designing/SKILL.md
  — for token cascade architecture and dark mode as token swap
- ~/Downloads/skills-library-v2 2/.codex/skills/consistency-checking/SKILL.md
  — for detecting hardcoded values and token gaps

Activate these librarian personas:
- ~/Downloads/skills-library-v2 2/librarians/experience-designer-librarian.md
  — for design system prioritization and elevation framework

## Task
Build a tokens.css file following the token cascade architecture from
experience-designing. Scan all component files for raw hex colors and px
values using the grep commands from consistency-checking. Replace every raw
value with a token reference. Implement dark mode as a token swap, not
color inversion.

## Constraints
- Zero raw hex colors in component files after completion (enforce via grep scan)
- Use clamp() for fluid typography (from experience-designing Section 6)
- Support prefers-reduced-motion (zero out duration tokens)
- Follow the 4px base grid for spacing tokens

## Output Format
1. tokens.css with all 7 token categories
2. Updated component files with token references
3. Grep scan results showing zero raw values remaining

## Grounding Citations
| Type | Reference | Applied Concept |
|------|-----------|-----------------|
| SKILL | experience-designing | Token cascade (tokens.css → components → pages) applied to GrazzHopper component refactor |
| SKILL | consistency-checking | Hardcoded value detection grep commands applied to audit existing components |
| LIBRARIAN | experience-designer-librarian | Elevation framework (Functional → Polished → Delightful → Exceptional) sets the quality bar |
```

---

### L3: SAD-Integrated Prompt — The Architect

**When to use:** Multi-file features, audits, refactors — anything needing
research, grounding, and structured investigation before building.

**Output:** Full SAD prompt with gate protocol, grounding rules, self-assessment.
This level absorbs the reusable SAD prompt so you stop pasting walls.

**Grounding required:** Skills + librarians + 2026 research sources, all with
concepts extracted and applied.

**Template:** See `templates/level-3-intent.md`

**Structure:**
```markdown
## Goal
[State what you want in plain language]

## Target Tool
[Tool + model]

## SAD Protocol
Run SAD (Sequential Agentic Development) on the goal above.

Read these IN FULL first:
- ~/Downloads/skills-library-v2 2/librarians/sad-librarian.md
- ~/Downloads/skills-library-v2 2/.codex/skills/orchestration-managing/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/[domain-skill]/SKILL.md
- ~/Downloads/skills-library-v2 2/librarians/[domain-librarian].md

### Gate Protocol
Gate 1 — UNDERSTAND: 5-surface scan (architecture, API routes, components,
  data layer, configuration). Inspect real state. Don't assume — verify.
Gate 2 — RESEARCH: Find 2026 sources for the feature's current pain points.
  Ground every decision in current-year data.
Gate 3 — SYNTHESIZE: Map skills + librarians + research to the task.
  Every citation must extract AND apply a concept. No stapling links.
Gate 4 — DECOMPOSE: File-exclusive lanes, batched by dependency.
Gate 5 — EXECUTE: Waves with progression tracking.

Confirm each gate before proceeding. Hold at Gate 4 for approval.

### Self-Assessment
Score readiness by surface (0-100 each), weighted by importance.
| Surface | Score | Evidence | Target |
Overall % → Target % → Which wave gets us there.

### Resource Requirements
- SKILLS: Load every matching skill from .codex/skills/. Read in full.
  Apply their workflows, not just their names. Use as many as needed.
- LIBRARIANS: Activate every matching librarian from librarians/.
  Read the persona file for framing, then the base skill for execution.
- 2026 RESEARCH: Ground every decision in current-year sources.
  Cross-reference 3+ sources for consequential decisions. Flag stale (>6mo).

### Rules
- Pick the obvious default and ship — no A/B/C option menus
- No deferral — every item ships or is dropped with reason
- Always commit — semantic commit messages (feat:, fix:, refactor:, docs:)
- No banned phrases: "approximate," "known limitation," "for simplicity," "TODO"
- No internal build output in UI (no hashes, model names, graphify IDs)
- Per-item citations: every deliverable ends with a citations table

## Grounding Citations
| Type | Reference | Applied Concept |
|------|-----------|-----------------|
```

---

### L4: Orchestration Spec — The Orchestrator

**When to use:** Multi-agent builds, full features, production ships — anything
requiring coordinated parallel execution across multiple agents.

**Output:** Complete orchestration specification with file-ownership map, batch
plan, wave packets, and per-lane citation tables.

**Grounding required:** Full citation table per lane. Every lane cites at least
1 skill + 1 librarian + 1 2026 source.

**Template:** See `templates/level-4-spec.md`

**Structure:**
```markdown
## Goal
[State what you want in plain language]

## Orchestration Mode
[Solo / Flat Wave / Single Primary Agent / Multi Primary Agent]
Agent count: [N] agents across [M] batches.

## SAD Protocol
[Same as L3 — includes all gates, self-assessment, resource requirements]

Additional reads:
- ~/Downloads/skills-library-v2 2/.codex/skills/multi-agent-designing/SKILL.md
- ~/Downloads/skills-library-v2 2/librarians/orchestration-librarian.md

## File-Ownership Map
Every file assigned to exactly one agent. Zero overlap.

| File | Owner (Agent N) | Action |
|------|----------------|--------|
| [path] | Agent 1 | [NEW/MODIFY/REWRITE] |

## Batch Plan
| Batch | Agents | Parallel-Safe? | Depends On |
|-------|--------|----------------|------------|
| 1 | Agent 1, Agent 2 | Yes | None |
| 2 | Agent 3 | Yes | Batch 1 |

Maximum parallelism within file-ownership constraint.
Default: 3 concurrent agents (max_concurrent_children).

## Per-Lane Brief Template
For each agent:
- Task: [what to build]
- Files: [exact paths — NO overlap with other agents]
- Context: [what the agent needs to know]
- Output: [what done looks like]
- Citations:
  | Type | Reference | Applied Concept |
  |------|-----------|-----------------|

## Engagement Standard
Every surface prioritizes non-tedious, engaging, ease-of-use design.
Defer to experience-designing + ux-designing for tactical patterns.

## Progression Format
- Per lane: "Lane N of M → X% wave done"
- Per batch: "Wave N of M → X% production done"
- No time estimates. Progress in waves and % only.
- Do not pause between waves.

## Rules
[All L3 rules plus:]
- File-ownership: every file assigned to exactly one agent. Zero overlap.
- Confirm gates: pause at each SAD gate close for user review.
- Adhere to plan: no freelancing, no scope creep. If an agent discovers
  something that changes the plan, it MUST stop, report, and wait for
  re-scope. The plan is the contract.
```

---

## 2 — Tool Profiles

Compact reference. Full details in `references/tool-profiles.md`.

| Tool | Context | Best For | Prompt Style |
|------|---------|----------|-------------|
| **Antigravity (Opus 4.6)** | Full codebase | Deep architecture, complex reasoning | Detailed system prompt, reference specific files, use Thinking mode |
| **Antigravity (Sonnet 4.6)** | Full codebase | Standard coding, fast iteration | Concise, task-focused, near-Opus quality |
| **Antigravity (Gemini 3.1 Pro)** | 1M tokens | Bulk edits, large-context analysis | Load entire codebases, speed over precision |
| **Claude Code (Opus 4.7/4.8)** | 200K | Deep reasoning, plan generation | Specification-style, structured, terminal-based |
| **Claude Code (Sonnet 4.6)** | 200K | Standard coding, fast turnaround | Task-focused, terminal-based |
| **Codex** | Cloud-side | Parallel tasks, git worktrees | Self-contained briefs — agents cannot ask questions mid-task |
| **Hermes (GLM 5.2)** | Variable | Backup lane, offline | Compact, explicit instructions |
| **Hermes (MiniMax M3)** | Variable | Terminal, model-agnostic | Direct, less capable on complex reasoning |

**Key constraints by tool:**
- Antigravity Ultra: 1,500 Thinking prompts/day, 12,500 credits/mo, refreshes every 5 hours
- Claude Code: Terminal-only, no GUI — prompts must be text-complete
- Codex: Agents are isolated — briefs must be fully self-contained with all context
- Hermes: GCP VM infrastructure with 13+ authenticated browser sessions

---

## 3 — Library Navigation Protocol

The skills library contains 84 librarians and 151+ skills organized into 11 Wings.
Use this protocol to find the right ones for any prompt.

### Step 1: Identify the domain

What is the user building/fixing/researching? Map to a Wing:

| Domain | Wing | Key Librarians |
|--------|------|----------------|
| Frontend / UI | Build Wing | frontend, components, mobile-first |
| Design / Tokens / UX | Design Wing | experience-designer, animation, typography, consistency, UX, visual-audit |
| Backend / API | Backend Wing | backend, database, supabase, API-integration, security |
| Mobile / Native | Mobile Wing | mobile-first, expo-building, expo-testflight, native-testing |
| iOS / Swift | Native Wing | swiftui-view, swiftui-performance, swiftui-liquid-glass, ios-debugger, ios-intents |
| Android | Native Wing | android |
| Games | Game Studio Wing | playmaster, game-assessor, r3f-game, three-webgl-game, web-game-foundations, gamification |
| AI / ML | Intelligence Wing | google-ai, conversational-ai, fine-tuning, prompt, notebooklm |
| Security | Quality Wing | code-audit, code-scrutinizer, hacker-attacker, security |
| Shipping / Deploy | Ship Wing | deployment, exit, pre-deployment, progress-tracker |
| Content / Copy | Content Wing | copywriting, threads, media-creation |
| Automation | API & Resource Wing | n8n, connector, hermes-session-guide |

> **This table is a starting point, not the full set.** Always check
> `librarians/WINGS.md` for the complete Wing membership. Many skills span
> multiple Wings or don't appear in the shorthand above. When in doubt,
> run `ls .codex/skills/` and scan for domain-matching skill names.

### Step 2: Load matching skills

Every librarian alias wrapper in `.codex/skills/[librarian-name]/SKILL.md` points
to both the persona file in `librarians/` and the base operational skill. Read both.

### Step 3: Extract applicable patterns

Don't just name skills — extract what they contribute:
- What specific rule, template, or STOP gate applies?
- What workflow steps does the skill prescribe?
- What anti-patterns does it flag?

### Step 4: Cite in the prompt output

Every skill/librarian used appears in the grounding citations table with an
extracted concept and its application to this specific task.

---

## 4 — Grounding Protocol

Grounding is what separates context engineering from prompt engineering. Every
citation must EXTRACT a concept and STATE how it applies. A link with no
extracted, applied rule transfers nothing.

### By Level

| Level | Grounding Required |
|-------|-------------------|
| L1 | None (optional) |
| L2 | At least 1 skill + 1 librarian with concepts extracted |
| L3 | Skills + librarians + at least 1 2026 research source |
| L4 | Full citation table per lane — each lane cites skills + librarians + 2026 URLs |

### Citation Table Format

```markdown
| Type | Reference | Applied Concept |
|------|-----------|-----------------|
| SKILL | experience-designing | Token cascade architecture → applied to component token enforcement |
| LIBRARIAN | orchestration-librarian | Wave management → applied to batch plan sequencing |
| 2026 URL | Anthropic context engineering | Stable vs dynamic context → applied to prompt structure |
```

### Anti-Stapling Rule

Borrowed from `sad-librarian`: grounding means distilling the concept and applying
it. Not stapling a link. Every citation answers two questions:
1. What is the concept/rule/pattern? (extracted from the source)
2. How does it apply to THIS specific task? (applied to the work)

If you cannot answer both, the citation is decoration, not grounding.

### Source Quality (from research-conducting CRAAP test)

For 2026 research sources:
- **Currency**: Published within the last 6 months. Flag anything older.
- **Relevance**: Directly addresses the task domain, not tangentially related.
- **Authority**: From a recognized org, team, or researcher in the field.
- **Accuracy**: Claims are cross-referenced with 3+ sources for consequential decisions.
- **Purpose**: Informational or educational, not marketing or sales.

Full checklist: `references/grounding-checklist.md`

---

## 5 — Context Engineering Patterns

Context engineering is how you assemble the situation around a model —
instructions, tools, retrieved knowledge, and conversation memory — so the
answer you want is the most likely answer the model gives.

### The Four Pillars

| Pillar | Type | Examples | Management |
|--------|------|----------|------------|
| **Instructions** | Stable | System prompts, skill directives, STOP gates | Loaded once, rarely changed |
| **Tools** | Dynamic | MCP servers, CLI utilities, API endpoints | Available on demand |
| **Retrieved Knowledge** | Dynamic | Skills loaded by domain, research results, file reads | Fetched per task |
| **Conversation Memory** | Sliding | Recent turns, session state, handoff notes | Managed within token budget |

### Key Patterns

**Signal-to-Noise Optimization**
Load the smallest possible set of high-signal tokens. Don't stuff the context
window with everything you have — curate what's relevant.
- Bad: Loading 10 skills because they might be relevant
- Good: Loading 3 skills that directly address the task, extracting specific rules

**Separation of Concerns**
Keep the three zones distinct:
1. Instructions (system prompt) — what to do and how
2. Data (user content, file reads) — what to work with
3. Tools (function schemas, MCP) — what capabilities are available

Never mix instructions into data or data into instructions.

**Context Offloading**
The skills library IS context offloading — 4,500+ lines of structured context
stored externally, fetched dynamically per task. Don't inline what the library
already documents.

**Memory Tiers** (from conversational-ai-building)
- Session memory: Recent turns, capped at manageable size. What just happened.
- Long-term memory: User profile, project context, preferences. Injected per session.

**Reasoning Effort Matching**
Match the model's reasoning effort to the task:
- Quick question → Low reasoning (Gemini 3 Flash, Sonnet quick mode)
- Standard coding → Medium reasoning (Sonnet 4.6, Gemini 3.1 Pro)
- Complex architecture → High reasoning (Opus 4.6, Opus 4.7/4.8 with Thinking)

---

## 6 — Anti-Patterns

### Legacy Anti-Patterns (still valid)

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Vague instructions ("make it better") | AI guesses what "better" means | Specify exact criteria |
| No output format | AI chooses its own structure | Define exact format |
| Too many tasks in one prompt | Quality drops on each task | One prompt, one task |
| No examples | AI has no reference point | Provide 1-3 examples |
| Asking "do you understand?" | Wastes tokens, always says yes | Just give the instruction |
| Over-constraining | AI cannot satisfy contradictory rules | Prioritize constraints |
| No persona/role | Generic responses | Set a specific expert role |

### Agentic Anti-Patterns (new)

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Pasting the same 30-line wall every time | Agents skim long walls, miss critical details | Use L3/L4 templates — they encode the protocol |
| Naming skills without reading them | Agents list skills but apply nothing from them | Cite specific rules extracted from each skill |
| No file-ownership map (multi-agent) | Two agents edit the same file, merge conflicts | L4 requires explicit file → agent mapping |
| Mixing concerns in one prompt | Research + build + review each get shallow treatment | Separate into sequential prompts or agent lanes |
| Using L4 for a simple question | Over-engineering wastes time and tokens | Match level to complexity via decision tree |
| AI-sounding language in prompts | "Leverage," "seamless," "cutting-edge" | Direct, human language (see copywriting-enforcing) |
| Temperature tuning for logic tasks | Outdated approach for reasoning quality | Use reasoning effort parameter or model selection |
| Stuffing the context window | Signal gets lost in noise | Curate the smallest high-signal token set |

---

## 7 — STOP Gate

DO NOT submit a prompt without verifying:

- [ ] **Level selected** (L1-L4) matches task complexity
- [ ] **Tool target** identified — which tool will execute this prompt
- [ ] **Role/persona** set and domain-appropriate
- [ ] **Grounding citations** included (skills + librarians at L2+, + 2026 URLs at L3+)
- [ ] **Output format** defined — structure, length, type
- [ ] **Constraints** listed — what to include AND what to avoid
- [ ] **File-ownership map** present (L4 only) — every file to exactly one agent
- [ ] **Anti-patterns checked** — no AI language, no over-engineering, no skill-name-dropping

If any check fails, fix it before submitting. A prompt that skips grounding
at L2+ is not a context-engineered prompt — it is a guess.
