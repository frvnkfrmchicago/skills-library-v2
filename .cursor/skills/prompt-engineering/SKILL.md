---
name: prompt-engineering
description: >
  Crafts effective prompts for AI tools including Gemini, GPT, and Claude. Provides
  platform-specific templates, persona/role patterns, output format specifications,
  few-shot examples, prompt chaining strategies, and anti-patterns to avoid. Use
  when writing system instructions, creating PRD prompts, building code generation
  prompts, designing prompt chains, or debugging bad AI outputs.
---

# Prompt Engineering

The prompt is the product. A well-crafted prompt saves hours of back-and-forth.
Write prompts that work the first time.

---

## Prompt Structure — Universal Template

Every effective prompt has these components:

```markdown
## System Instruction
You are a [role] with expertise in [domain].

## Your Task
[Clear, specific instruction — one sentence if possible]

## Constraints
- [What to include]
- [What to avoid]
- [Tone/style requirements]

## Output Format
[Exact structure expected — JSON, markdown, table, etc.]

## Example Output
[Show what good looks like — one complete example]
```

---

## Platform-Specific Templates

### Google AI Studio / Gemini

Set system instructions separately from the user prompt. Gemini supports
structured output mode — use it for consistent JSON responses.

### PRD Prompt

```markdown
Create a Product Requirements Document for [product name].

## Context
- Target user: [who]
- Problem solved: [what pain point]
- Success metric: [how we know it works]

## Include
1. Executive Summary (2-3 sentences)
2. User Stories (as a [user], I want [action], so that [benefit])
3. Functional Requirements (must-have features)
4. Non-Functional Requirements (performance, security)
5. Technical Constraints
6. MVP Scope vs Future Phases

## Format
Use markdown with clear headings. Be specific, not vague.
```

### Code Generation Prompt

```markdown
Generate [language] code for [feature].

## Requirements
- [Requirement 1]
- [Requirement 2]

## Tech Stack
- [Framework]
- [Libraries]

## Patterns to Follow
- [Pattern 1]
- [Pattern 2]

## Output
Provide complete, working code with:
- Type annotations
- Error handling
- Comments on complex logic

Do NOT include placeholder comments like "// add logic here".
```

### Design Brief Prompt

```markdown
Design [component/page] for [product].

## Context
- Brand: [personality]
- Style: [modern/minimal/playful/etc]
- Inspiration: [reference sites]

## Requirements
- [Requirement 1]
- [Requirement 2]

## Constraints
- Mobile-first
- Accessibility (WCAG AA)
- Dark mode support

## Deliverable
Describe the design in detail, then provide implementation code.
```

---

## Persona / Role Patterns

| Persona | Best For |
|---------|----------|
| "You are a senior React engineer" | Code quality, architecture |
| "You are a UX designer" | Design feedback, user flows |
| "You are a security auditor" | Security review, threat modeling |
| "You are a product manager" | PRDs, specs, prioritization |
| "You are a copywriter" | Engaging text, brand voice |
| "You are a data scientist" | Analytics, statistical analysis |

---

## Output Format Patterns

### Table Format
```markdown
Output as a markdown table with columns:
| Column 1 | Column 2 | Column 3 |
```

### JSON Format
```markdown
Output as JSON matching this schema:
{
  "field": "type",
  "field2": "type"
}
```

### Structured Sections
```markdown
Output with these sections:
## Summary
## Details
## Next Steps
```

---

## Prompt Chaining — Break Complex Tasks Into Steps

```markdown
Step 1: Research and understand [topic]
Step 2: Generate options (at least 3)
Step 3: Evaluate each option against [criteria]
Step 4: Recommend the best with justification
Step 5: Provide implementation plan
```

Each step feeds into the next. Run them sequentially, not all at once.

---

## Anti-Patterns — What NOT to Do

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| Vague instructions ("make it better") | AI guesses what "better" means | Specify exact criteria |
| No output format | AI chooses its own structure | Define exact format |
| Too many tasks in one prompt | Quality drops on each task | One prompt, one task |
| No examples | AI has no reference point | Provide 1-3 examples |
| Asking "do you understand?" | Wastes tokens, always says yes | Just give the instruction |
| Over-constraining | AI cannot satisfy contradictory rules | Prioritize constraints |
| No persona/role | Generic responses | Set a specific expert role |

---

## ⛔ STOP GATE

DO NOT submit a prompt without verifying:
1. Role/persona is set (who is the AI acting as?)
2. Task is specific and singular (one clear instruction)
3. Output format is defined (structure, length, type)
4. Constraints are listed (what to include AND what to avoid)
5. At least one example is provided for complex tasks
