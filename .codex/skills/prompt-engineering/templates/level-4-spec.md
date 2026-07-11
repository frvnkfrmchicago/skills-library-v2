# L4 Orchestration Spec Template

Full multi-agent orchestration specification. This is the complete replacement
for pasting the 30-line SAD + orchestration wall. Fill in the brackets, paste
once, and the receiving agent has everything it needs to decompose and dispatch.

---

## Template

```markdown
## Goal
[State what you want in plain language — be specific about the outcome]

## Orchestration Mode
[Solo / Flat Wave / Single Primary Agent / Multi Primary Agent]
Agent count: [N] agents across [M] batches.

## Target Tool
[Antigravity / Claude Code / Codex / Hermes] ([model])

## SAD Protocol
Run SAD (Sequential Agentic Development) on the goal above.

Read these IN FULL first, then follow them exactly:
- ~/Downloads/skills-library-v2 2/librarians/sad-librarian.md
- ~/Downloads/skills-library-v2 2/.codex/skills/orchestration-managing/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/multi-agent-designing/SKILL.md
- ~/Downloads/skills-library-v2 2/librarians/orchestration-librarian.md
- ~/Downloads/skills-library-v2 2/.codex/skills/[domain-skill-1]/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/[domain-skill-2]/SKILL.md
- ~/Downloads/skills-library-v2 2/librarians/[domain-librarian-1].md
- ~/Downloads/skills-library-v2 2/librarians/[domain-librarian-2].md
- Every additional domain skill + librarian that matches
  (via SKILL-NAVIGATION.md and librarians/WINGS.md)

### Gate Protocol
Gate 1 — UNDERSTAND: Open with `graphify update .` (or `graphify .` if no
  graph exists). Drive the 5-surface scan off the graph (file:line references).
  Classify every finding as REAL / MOCK / BROKEN. Readiness % from the build
  probe (what actually works), never node counts. graphify = wiring, not function.
Gate 2 — RESEARCH: 2026 sources. GROUND, don't scrape — distill the actual
  concept/principle and state how it applies to THIS build. A link with no
  extracted, applied rule transfers nothing. Flag stale (>6 months).
Gate 3 — SYNTHESIZE: Skills + librarians + research. Extract AND apply.
Gate 4 — DECOMPOSE: File-exclusive lanes, batched by dependency.
  Use `graphify affected` so lanes never collide.
  No cap on agent count — file-exclusivity is the only governor.
Gate 5 — EXECUTE: Waves with progression tracking. Semantic commits per lane.

Confirm each gate before proceeding.
Hold at Gate 4 — present the plan, no code until I approve.

### Self-Assessment
| Surface | Score | Evidence | Target |
|---------|-------|----------|--------|
Overall: [N]% → Target: [M]% → Which wave gets us there.

### Resource Requirements
- SKILLS: Load every matching skill. Read in full. Apply workflows.
  Use as many as needed — never limit to 1 of each.
- LIBRARIANS: Activate every matching librarian. Persona + base skill.
- 2026 RESEARCH: Current-year sources. 3+ cross-references for
  consequential decisions. Flag stale.

## File-Ownership Map
Every file assigned to exactly one agent. Zero overlap.

| File | Owner (Agent N) | Action |
|------|----------------|--------|
| [path/to/file] | Agent 1 | [NEW / MODIFY / REWRITE / DELETE] |
| [path/to/file] | Agent 2 | [NEW / MODIFY / REWRITE / DELETE] |

## Batch Plan
Maximum parallelism within file-ownership constraint.
Default max concurrent: 3 agents.

| Batch | Agents | Parallel-Safe? | Depends On |
|-------|--------|----------------|------------|
| 1 | Agent 1, Agent 2, Agent 3 | Yes | None |
| 2 | Agent 4, Agent 5 | Yes | Batch 1 |

## Per-Lane Brief
For each agent:
- **Task**: [what to build — complete description]
- **Files**: [exact paths — NO overlap with other agents]
- **Context**: [what the agent needs to know]
- **Output**: [what done looks like — verifiable completion criteria]
- **Citations**:
  | Type | Reference | Applied Concept |
  |------|-----------|-----------------|
  | SKILL | [name] | [rule → application] |
  | LIBRARIAN | [name] | [focus → application] |
  | 2026 URL | [source] | [concept → application] |

## Engagement Standard
Every surface prioritizes non-tedious, engaging, ease-of-use design.
Defer to experience-designing + ux-designing for tactical patterns.

## Progression Format
- Per lane: "Lane N of M → X% wave done"
- Per batch: "Wave N of M → X% production done"
- No time estimates. Progress in waves and % only.
- Do not pause between waves.

## Rules
- Pick the obvious default and ship — no A/B/C option menus
- File-ownership: every file to exactly one agent. Zero overlap.
- No deferral — every lane ships or is dropped with reason
- Always commit — semantic commits per lane, listed in files-changed table
- No banned phrases: "approximate," "known limitation," "for simplicity," "TODO"
- No internal build output in UI (no hashes, model names, graphify IDs)
- Confirm gates — pause at each gate close for review
- Adhere to plan — no freelancing, no scope creep. Discovery → stop → report
  → wait for re-scope. The plan is the contract.
- Be extensive in the plan
- Ship, don't defer

## Grounding Directive
Ground every decision in the skills, librarians, and 2026 sources loaded above.
Every agent in every lane must: (1) read assigned skills IN FULL, (2) extract
specific rules from them, (3) apply those rules to their deliverables, and
(4) end each lane's output with a citations table showing SKILL + LIBRARIAN +
2026 URL with extracted concepts and applications. Do not name a skill without
extracting and applying a concept from it. A citation with no extracted, applied
rule transfers nothing.
```

---

## Example: Dashboard Redesign with Animation System

```markdown
## Goal
Redesign the GrazzHopper admin dashboard with a new design token system,
animated transitions between views, and a responsive layout that works
from mobile to ultrawide. Replace the current static grid with a Bento
layout using CSS container queries.

## Orchestration Mode
Flat Wave — 5 agents across 2 batches.

## Target Tool
Antigravity (Sonnet 4.6)

## SAD Protocol
Run SAD on the goal above.

Read these IN FULL first:
- ~/Downloads/skills-library-v2 2/librarians/sad-librarian.md
- ~/Downloads/skills-library-v2 2/.codex/skills/orchestration-managing/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/multi-agent-designing/SKILL.md
- ~/Downloads/skills-library-v2 2/librarians/orchestration-librarian.md
- ~/Downloads/skills-library-v2 2/.codex/skills/experience-designing/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/animation-designing/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/component-building/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/mobile-first-enforcing/SKILL.md
- ~/Downloads/skills-library-v2 2/.codex/skills/creative-motion-design/SKILL.md
- ~/Downloads/skills-library-v2 2/librarians/experience-designer-librarian.md
- ~/Downloads/skills-library-v2 2/librarians/animation-librarian.md
- ~/Downloads/skills-library-v2 2/librarians/components-librarian.md
- ~/Downloads/skills-library-v2 2/librarians/mobile-first-librarian.md
- ~/Downloads/skills-library-v2 2/librarians/creative-motion-librarian.md

### Gate Protocol
[Standard 5 gates — confirm each, hold at Gate 4]

### Self-Assessment
| Surface | Score | Evidence | Target |
|---------|-------|----------|--------|
Overall: ?% → Target: 92%+ → Which wave gets us there.

### Resource Requirements
- SKILLS: experience-designing, animation-designing, component-building,
  mobile-first-enforcing, creative-motion-design, consistency-checking,
  typography-enforcing
- LIBRARIANS: experience-designer, animation, components, mobile-first,
  creative-motion, consistency, typography
- 2026 RESEARCH: CSS container queries baseline support, Bento grid patterns,
  View Transitions API, scroll-driven animations

## File-Ownership Map

| File | Owner | Action |
|------|-------|--------|
| src/styles/tokens.css | Agent 1 | NEW |
| src/styles/typography.css | Agent 1 | NEW |
| src/styles/motion.css | Agent 1 | NEW |
| src/components/BentoGrid.tsx | Agent 2 | NEW |
| src/components/DashboardCard.tsx | Agent 2 | REWRITE |
| src/components/StatWidget.tsx | Agent 2 | REWRITE |
| src/components/ChartPanel.tsx | Agent 2 | REWRITE |
| src/animations/transitions.ts | Agent 3 | NEW |
| src/animations/scroll-reveals.ts | Agent 3 | NEW |
| src/hooks/useViewTransition.ts | Agent 3 | NEW |
| src/layouts/DashboardLayout.tsx | Agent 4 | REWRITE |
| src/layouts/MobileLayout.tsx | Agent 4 | NEW |
| src/layouts/ResponsiveShell.tsx | Agent 4 | NEW |
| src/pages/dashboard.tsx | Agent 5 | REWRITE |
| src/pages/dashboard.test.tsx | Agent 5 | NEW |

## Batch Plan

| Batch | Agents | Parallel-Safe? | Depends On |
|-------|--------|----------------|------------|
| 1 | Agent 1 (tokens), Agent 3 (animations) | Yes | None |
| 2 | Agent 2 (components), Agent 4 (layouts), Agent 5 (page + tests) | Yes | Batch 1 |

## Per-Lane Briefs

### Agent 1: Design Token Foundation
- **Task**: Build the complete token system (tokens.css, typography.css, motion.css)
- **Files**: src/styles/tokens.css, src/styles/typography.css, src/styles/motion.css
- **Context**: GrazzHopper brand colors are #1a1a2e (dark navy), #e94560 (coral),
  #0f3460 (deep blue). Cannabis industry — professional but not corporate.
- **Output**: Three CSS files with all 7 token categories, dark mode swap,
  fluid typography via clamp(), motion tokens with reduced-motion support
- **Citations**:
  | Type | Reference | Applied Concept |
  |------|-----------|-----------------|
  | SKILL | experience-designing | Token cascade (7 categories) → foundation for all components |
  | SKILL | typography-enforcing | Fluid type scale with clamp() → responsive headings |
  | LIBRARIAN | experience-designer-librarian | Elevation framework → target Polished level |
  | 2026 URL | [Gate 2] | Fluid typography best practices |

### Agent 2: Component Rebuild
[... similar per-lane brief structure ...]

### Agent 3: Animation System
[... similar ...]

### Agent 4: Responsive Layout
[... similar ...]

### Agent 5: Page Assembly + Tests
[... similar ...]

## Engagement Standard
Every surface prioritizes non-tedious, engaging, ease-of-use design.
Defer to experience-designing + ux-designing for tactical patterns.

## Progression Format
- Per lane: "Lane N of 5 → X% wave done"
- Per batch: "Wave N of 2 → X% production done"
- No time estimates.

## Rules
[Standard L4 rules — file-ownership, confirm gates, adhere to plan,
semantic commits, no deferral, no banned phrases, no internal build output]
```
