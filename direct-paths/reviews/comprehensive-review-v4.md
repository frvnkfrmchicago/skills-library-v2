---
name: comprehensive-library-review-v4
description: Super comprehensive review prompt for external AI. Covers all recent updates, Cursor rules, production feedback, design skill gaps.
last_updated: 2026-01-26
---

# Skills Library v4 Comprehensive Review

Copy this entire prompt to another AI (Claude Opus, Gemini) for a deep external review.

---

## Review Prompt

```
You are reviewing a comprehensive Skills Library used for AI-assisted development.

CONTEXT:
- This library is used with Cursor (IDE), Claude Code (Opus/Sonnet), and Google Antigravity (Gemini 3/Flash)
- It contains 140+ skills across 7 wings (AI Builder, Agents, Platforms, Content, Workflows, App Types, Direct Paths)
- Recent massive update session just completed
- Used in production for building a Trading Intelligence Dashboard

YOUR TASK:
Perform a brutally honest, thorough review. Score each category 1-10.
Give specific examples of issues, not vague concerns.
Include file paths when referencing problems.

---

SECTION 1: CURSOR RULES INTEGRATION
Review: .cursor/rules/cursor-skills.mdc and platforms/cursor/stack-master.cursorrules

Evaluate:
1. Is the output format clear and enforceable?
2. Are the rules actually followed in practice?
3. Do the rules reference skills correctly?
4. Is the "no markdown docs" rule clear?
5. Is the "skills before implementation" workflow clear?
6. Are the design tokens/patterns sufficient for visual excellence?

Known Production Issues:
- Cursor created unnecessary markdown files (e.g., FEAR_GREED_API_INFO.md)
- Cursor referenced skills AFTER implementation instead of BEFORE
- Output was vague ("Progress: Complete" without specifics)
- Design output was decent but not standout ("good but not expansive")

Rate: Cursor Rules Integration (1-10)
List: Top 3 issues to fix
Suggest: Specific wording changes

---

SECTION 2: MULTI-TOOL WORKFLOW
Review: workflows/multi-tool-ai/SKILL.md

Evaluate:
1. Is the Antigravity → Cursor → Claude Code handoff clear?
2. Are the tool distinctions accurate?
   - Google Antigravity: Gemini 3, Gemini 3 Flash
   - Claude Code: Opus 4.5, Sonnet 4.5
   - Cursor: IDE with skills library
3. Are the handoff templates usable?
4. Does the decision tree make sense?

Rate: Multi-Tool Workflow (1-10)
List: Gaps or improvements needed

---

SECTION 3: SCREENSHOT-TO-CODE WORKFLOW
Review: workflows/screenshot-to-code/SKILL.md

Evaluate:
1. Is the prompt formula complete?
2. Are the tool references correct (Antigravity, Claude Code, Cursor only)?
3. Is the iterative refinement process clear?
4. Is design token extraction covered?
5. Are common issues addressed?

Rate: Screenshot-to-Code (1-10)
List: Missing patterns or scenarios

---

SECTION 4: DESIGN SKILL DEPTH
Review: agents/design-system/SKILL.md (and related)

Known Production Issue:
- "Bento Grid was good but not expansive"
- "Designs are better but still not differentiated"
- Need more flexible, premium visual patterns

Evaluate:
1. Does the design skill provide enough visual variety?
2. Are there enough color palette options beyond dark mode?
3. Are there alternative layout patterns beyond Bento?
4. Is the typography hierarchy detailed enough?
5. Are animation defaults sufficient?
6. Is there guidance for iteration/refinement?

Rate: Design System Depth (1-10)
Suggest: Additional patterns, styles, or sections to add

---

SECTION 5: NEW SKILLS QUALITY
Review these recently created skills:

Content Skills:
- content/email-subjects/SKILL.md
- content/prompting-3d/SKILL.md

Platform Skills:
- platforms/gemini-gems/SKILL.md
- platforms/notebooklm/SKILL.md
- platforms/chatgpt-gpts/SKILL.md

Workflow Skills:
- workflows/multi-tool-ai/SKILL.md
- workflows/screenshot-to-code/SKILL.md

Documentation Skills:
- agents/user-guide/SKILL.md

Evaluate each:
1. Does it follow the standard skill format (TL;DR, numbered sections, tables)?
2. Is content comprehensive enough?
3. Are there copy-paste examples?
4. Is the "Related Skills" section complete?

Rate: New Skills Quality (1-10)
List: Any skills that need revision

---

SECTION 6: AI BUILDER WING
Review: ai-builder/ directory

Evaluate:
1. Are ML/AI pipeline skills complete?
2. Is PyTorch coverage adequate?
3. Is AWS Bedrock covered?
4. Are event-driven patterns documented?
5. Is Kubernetes deployment covered?

Rate: AI Builder Wing (1-10)
List: Gaps for production ML workflows

---

SECTION 7: REVIEW TEMPLATES
Review: direct-paths/reviews/ directory

Files:
- library-usability-review.md
- library-update-review.md
- project-completion-review.md
- skills-library-v3-review.md
- library-review-prompt.md
- library-vs-rules-review.md

Evaluate:
1. Are there too many review templates?
2. Is there overlap/redundancy?
3. Which ones are actually useful?
4. Should any be consolidated?

Rate: Review Templates (1-10)
Suggest: Consolidation or simplification

---

SECTION 8: NAVIGATION & DISCOVERABILITY
Review: SKILL-NAVIGATION.md

Evaluate:
1. Can users find skills quickly?
2. Is the "Starting with an Idea?" section helpful?
3. Are all new skills properly linked?
4. Is the structure intuitive?

Rate: Navigation (1-10)
List: Missing sections or confusing areas

---

SECTION 9: PRODUCTION FEEDBACK INTEGRATION

Based on real production usage (Trading Dashboard build):
1. News API defaulting issue — should edge-cases skill cover this?
2. Economic calendar hardcoded dates — should there be a "dynamic data" pattern?
3. Fear & Greed Index integration — should API patterns be clearer?
4. Design iteration — is there guidance for refining visuals?

Evaluate:
1. Does the library anticipate common production issues?
2. Are error handling patterns clear?
3. Is API integration guidance sufficient?
4. Is navigation/routing covered?

Rate: Production Readiness (1-10)
List: Missing patterns discovered in production

---

SECTION 10: PLAN FRAMEWORK

The user wants a general framework for what "plan" means and outputs.

PROBLEM:
- Plans currently use week-by-week timelines which are inaccurate
- No consistent format across different plan types
- Completion status is unclear

PROPOSED PLAN FRAMEWORK:

Plan Types:
| Type | Scope | Example |
|------|-------|---------|
| App Plan | Full application | "Build trading dashboard" |
| Feature Plan | One feature | "Add fear & greed index" |
| Component Plan | Single component | "Create stats card" |
| Review Plan | Audit existing | "Review news feed" |

Standard Plan Output:
```
## [Plan Name]

### Scope
[One line: what this plan covers]

### Stages
- [ ] Stage 1: [description]
- [ ] Stage 2: [description]
- [ ] Stage 3: [description]
(number of stages varies by scope)

### Skills Used
- [skill] — [why]

### Current Stage
Stage [X] — [status]

### Completed
- [x] [specific item]

### Next
- [ ] [next item]
```

Key Principles:
1. Stages, not weeks — no time estimates
2. Stages scale to scope — big plan = more stages, small plan = fewer
3. Always show current stage — know where you are
4. Skills referenced — which skills apply

Questions for reviewer:
1. Is this format clear and usable?
2. Should this be a Cursor rule or a workflow skill?
3. What's the ideal stage count range? (2-5? flexible?)
4. Should stage naming be standardized or flexible?

Recommendation:
- Should this framework be added to cursor-skills.mdc?
- Draft a sample for each plan type

---

SECTION 11: INNOVATION PHILOSOPHY

CRITICAL ISSUE IDENTIFIED:

The current skills library is too prescriptive. Skills provide defaults that
get applied, resulting in sameness. This kills innovation.

Current Problem:
- Skills give one answer (Bento grid, dark navy, specific patterns)
- AI applies whatever is in the skill
- Output: Cookie-cutter results
- No exploration, no ideation, no differentiation

What Skills SHOULD Do:
1. Ask questions before giving answers
2. Present a SPECTRUM of options, not a default
3. Encourage exploration and experimentation
4. Lead to ideation, not rigid outcomes

Example of What's Wrong:
User: "Build dashboard"
AI: [applies Bento grid, dark navy, same animations]
Result: Same as every other dashboard

Example of What's Right:
User: "Build dashboard"
AI: "What direction? Options:
     1. Editorial: Asymmetric, bold type, minimal
     2. Technical: Dense data, precision, glass effects
     3. Playful: Rounded corners, gradients, micro-interactions
     What's the vibe?"
Result: Innovation through exploration

Questions for Improvement:
1. Should skills include "Direction Prompts" that ask before defaulting?
2. Should design skills present 3+ visual directions instead of one?
3. How do we structure skills to enable innovation, not conformity?
4. Should there be an "Ideation Mode" vs "Implementation Mode"?

Recommendation:
- Review design-system skill structure
- Add "Explore Before Commit" philosophy
- Skills should open possibilities, not close them

---

FINAL VERDICT

Overall Score: ___/100

Top 5 Strengths:
1.
2.
3.
4.
5.

Top 5 Weaknesses:
1.
2.
3.
4.
5.

Immediate Action Items (do now):
1.
2.
3.

Future Improvements (next iteration):
1.
2.
3.

Should the design skill be expanded or kept separate from Google AI Studio workflow?
Recommendation:
```

---

## What to Attach

When using this prompt, attach these files:

Priority 1 (must have):
- .cursor/rules/cursor-skills.mdc
- SKILL-NAVIGATION.md
- workflows/multi-tool-ai/SKILL.md
- workflows/screenshot-to-code/SKILL.md

Priority 2 (recommended):
- agents/design-system/SKILL.md
- _meta/CHANGELOG.md
- 2-3 recent skill files

Priority 3 (optional):
- direct-paths/reviews/*.md
- platforms/cursor/SKILL.md

---

## How to Use Response

After receiving the review:

1. Create issues for each weakness
2. Prioritize by impact
3. Update skills with suggested wording
4. Test changes in production
5. Re-run review after major changes
