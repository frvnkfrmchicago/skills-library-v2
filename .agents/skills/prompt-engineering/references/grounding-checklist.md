# Grounding Checklist

Quick-reference checklist for grounding citations at each prompt level.
Use this before submitting any prompt at L2 or above.

---

## L1 — Quick Prompt

- [ ] Role/persona set (who is the AI acting as?)
- [ ] Task is one clear sentence (singular, specific)
- [ ] Output format specified (structure, length, type)
- [ ] Constraints listed (include AND avoid)
- [ ] Example provided for complex tasks (optional at L1)

**Grounding: Not required.** Optional skill reference if helpful.

---

## L2 — Context-Grounded Prompt

All L1 checks, plus:

- [ ] Target tool identified (Antigravity / Claude Code / Codex / Hermes + model)
- [ ] Domain context provided (project name, codebase path, current state)
- [ ] At least 1 skill cited with:
  - [ ] Full path to SKILL.md provided (so the agent can read it)
  - [ ] Specific rule/pattern/template extracted (not just the skill name)
  - [ ] Application stated (how the extracted rule applies to THIS task)
- [ ] At least 1 librarian cited with:
  - [ ] Persona focus stated (what the librarian prioritizes)
  - [ ] Application stated (how it shapes the output)
- [ ] Grounding citations table present at the end of the prompt

**Anti-stapling check:** For every citation, can you answer both:
1. What is the concept? (extracted from the source)
2. How does it apply here? (applied to the task)

If no to either → the citation is decoration, not grounding. Fix it.

---

## L3 — SAD-Integrated Prompt

All L2 checks, plus:

- [ ] SAD 5-gate protocol embedded or referenced
  - [ ] Gate 1: 5-surface scan specified (architecture, API routes, components, data layer, config)
  - [ ] Gate 2: 2026 research requirement specified
  - [ ] Gate 3: Synthesis requirement (skills + librarians + research mapped to task)
  - [ ] Gate 4: Decomposition requirement (file-exclusive lanes)
  - [ ] Gate 5: Execution requirement (waves with progression)
- [ ] Gate confirmation pauses specified ("confirm each gate before proceeding")
- [ ] Self-assessment format included (surface scores, weighted overall, target)
- [ ] At least 1 2026 research source cited with:
  - [ ] Source URL provided
  - [ ] Concept extracted
  - [ ] Application to THIS task stated
  - [ ] Currency verified (published within 6 months)
- [ ] Resource requirements section present (SKILLS, LIBRARIANS, 2026 RESEARCH)
- [ ] Rules section present (no deferral, always commit, no banned phrases)
- [ ] Anti-stapling rule enforced across ALL citations

**CRAAP test for research sources:**
- [ ] Currency: < 6 months old
- [ ] Relevance: Directly addresses the domain
- [ ] Authority: Recognized source in the field
- [ ] Accuracy: Cross-referenced with 3+ sources for consequential claims
- [ ] Purpose: Informational, not marketing

---

## L4 — Orchestration Spec

All L3 checks, plus:

- [ ] Orchestration mode declared (Solo / Flat Wave / Single Primary / Multi Primary)
- [ ] Agent count specified at each level
- [ ] File-ownership map present:
  - [ ] Every file assigned to exactly one agent
  - [ ] Zero file overlap between agents
  - [ ] Action specified per file (NEW / MODIFY / REWRITE / DELETE / SYNC)
- [ ] Batch grouping defined:
  - [ ] Which agents run in parallel (Batch 1)
  - [ ] Which agents wait for prior batches
  - [ ] Dependencies between batches documented
  - [ ] Max concurrent agents specified (default: 3)
- [ ] Per-lane brief present for each agent:
  - [ ] Task description
  - [ ] File list (exact paths)
  - [ ] Context (what the agent needs to know)
  - [ ] Output definition (what done looks like)
  - [ ] Lane-specific citation table (SKILL + LIBRARIAN + 2026 URL)
- [ ] Progression format specified:
  - [ ] "Lane N of M → X% wave done" after every lane
  - [ ] "Wave N of M → X% production done" after every batch
- [ ] Commit discipline specified (semantic commits per lane)
- [ ] Engagement standard referenced (experience-designing + ux-designing)
- [ ] Confirm-gate rule present (pause at each gate close for review)
- [ ] Adhere-to-plan rule present (no freelancing, discovery → stop → report → re-scope)
