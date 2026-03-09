# Skills Library Assessment Prompt

Use this prompt with any AI agent to get a comprehensive assessment of the Skills Library.

---

## The Prompt

```
You are assessing a Skills Library designed for AI-powered app development. Your goal is to determine if this library reaches S-TIER status and identify exactly what's needed to get there.

## Context

This library belongs to Frank Lawrence Jr., an aspiring AI Product Engineer with these goals:
- Build domain authority in AI + product development
- Ship apps daily ("an app a day" approach)
- Get hired as an AI Product Engineer
- Attract freelance clients for AI development
- Launch successful apps (training app, literacy app, more)
- Build free AI tools to gain visibility and credibility
- Achieve "realm of the greats" quality in design, innovation, structure

## Assessment Framework

### Tier Definitions

**S-TIER (95-100):** Best-in-class. Any agent can pick this up and build production-quality apps. Complete coverage, perfect consistency, actionable patterns, no gaps.

**A-TIER (85-94):** Excellent. Minor gaps but highly functional. 90% of use cases covered with quality patterns.

**B-TIER (75-84):** Good foundation. Notable gaps or inconsistencies. Functional but needs polish.

**C-TIER (65-74):** Incomplete. Major gaps. Not production-ready.

**D-TIER (<65):** Fundamentally broken or missing critical pieces.

---

## Assessment Criteria (Score 1-10 each)

### 1. Coverage (Weight: 20%)
- Does the library cover ALL phases of app development?
- Ideation → Research → Design → Build → Deploy → Grow → Monetize
- Are there gaps where an agent would be stuck?

### 2. Depth (Weight: 20%)
- Does each skill provide enough detail to actually implement?
- Are there working code examples?
- Are edge cases addressed?

### 3. Consistency (Weight: 15%)
- Do skills follow the same structure?
- Does every skill have: Context Questions, Dimensions, Derivation Logic?
- Is formatting uniform across all files?

### 4. Agent Usability (Weight: 20%)
- Can an AI agent read this and immediately build?
- Are instructions clear and actionable?
- Is it obvious which skill to use when?

### 5. Innovation Alignment (Weight: 10%)
- Does it support cutting-edge development?
- Modern stack (2024-2025 patterns)?
- AI-native approaches?

### 6. Goal Alignment (Weight: 15%)
- Does it support the owner's specific goals?
  - Daily app shipping
  - Client work
  - Job hunting
  - Personal brand building
  - Premium design quality

---

## Assessment Tasks

1. **Full Inventory:** List every skill category and count. Identify any missing categories.

2. **Gap Analysis:** What CAN'T be built with this library? What workflows are incomplete?

3. **Consistency Audit:** Sample 10 random skills. How many follow the full structure (Context Questions, Dimensions, Derivation Logic)?

4. **Practical Test:** Pick a sample app (e.g., "build a habit tracker with Supabase and notifications"). Walk through which skills you'd use. Where do you get stuck?

5. **Goal Gap Analysis:** For each owner goal, identify which skills support it and what's missing:
   - [ ] Daily app shipping
   - [ ] Client work / freelance
   - [ ] Job applications
   - [ ] Personal brand / marketing
   - [ ] Premium design quality
   - [ ] Innovation / cutting-edge

6. **Prioritized Fix List:** What are the top 10 things that would increase the score the most?

---

## Output Format

Provide your assessment in this exact format:

### OVERALL TIER: [S/A/B/C/D]
### OVERALL SCORE: [X/100]

### Dimension Scores
| Dimension | Score (1-10) | Weighted | Notes |
|-----------|--------------|----------|-------|
| Coverage | | | |
| Depth | | | |
| Consistency | | | |
| Agent Usability | | | |
| Innovation Alignment | | | |
| Goal Alignment | | | |

### Critical Gaps (Blocking S-Tier)
1. [Gap 1 — How to fix]
2. [Gap 2 — How to fix]
...

### Nice-to-Have Improvements
1. [Improvement 1]
2. [Improvement 2]
...

### Path to S-Tier
[Specific, actionable steps to reach S-tier status]

### Practical Test Results
**App:** [Test app name]
**Skills Used:** [List]
**Gaps Encountered:** [List]
**Verdict:** [Could/Couldn't build it]

---

## Library Location

The Skills Library is located at: `/Users/franklawrencejr./Downloads/skills-library-v2 2/`

Key entry points:
- `SKILL-NAVIGATION.md` — Main navigation
- `README.md` — Overview
- `agents/` — 62 technical skills
- `platforms/` — 9 IDE/tool integrations
- `workflows/` — 26 process skills
- `ai-builder/` — 18 enterprise AI skills
- `content/` — 19 marketing skills
- `_meta/SKILL-TEMPLATE.md` — Expected skill structure

---

## Important Context from Previous Sessions

- 15 skills have been updated with the reasoning framework (Context Questions, Dimensions, Derivation Logic)
- Platform skills (Antigravity, Cursor, Claude Code, Google AI Studio) have official documentation links
- A multi-agent workflow exists in `workflows/app-building/SKILL.md`
- The library has 153+ total skills across all categories

---

## Execute This Assessment Now

Read the library thoroughly. Be BRUTAL. The goal is S-tier. Anything less is unacceptable. Identify every gap, every inconsistency, every missing piece. Then provide the exact roadmap to fix it.
```

---

## How to Use This Prompt

1. Copy the entire prompt above (everything inside the code block)
2. Paste it into Claude, Cursor, Antigravity, or any capable AI agent
3. Make sure the agent has access to the Skills Library folder
4. Let it run the full assessment
5. Use the output to prioritize improvements

---

## Expected Output

The agent should provide:
- Tier rating with justification
- Numeric scores for each dimension
- Critical gaps that block S-tier
- Exact steps to reach S-tier
- Practical test results

---

## Version History

| Date | Change |
|------|--------|
| 2026-01-26 | Initial prompt created |
