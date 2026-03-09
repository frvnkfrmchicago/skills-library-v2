# Skill Template

**Use this structure when creating or updating skills.**

---

## The Reasoning Framework Standard

**Skills are reasoning frameworks, NOT template libraries.**

Every skill MUST help AI agents:
1. Ask the right questions before implementing
2. Explore dimensions, not pick from menus
3. Derive recommendations from context
4. Present options with trade-offs

---

## Required Sections (MANDATORY)

### 1. Frontmatter

```yaml
---
name: skill-name
description: One-line description of what this skill covers.
last_updated: 2026-03
---
```

### 2. Context Questions (REQUIRED - NON-NEGOTIABLE)

**Skills without context questions FAIL the framework test.**

```markdown
## Context Questions

Before implementing:
1. [Question about scope/scale]
2. [Question about audience/users]
3. [Question about brand/emotion/goal]
4. [Question about constraints/capacity]
5. [Question about references/existing context]
```

### 3. Dimensions (REQUIRED)

**Spectrums to explore, not categories to pick:**

```markdown
## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| [Axis 1] | [Low end] ←→ [High end] |
| [Axis 2] | [Low end] ←→ [High end] |
```

### 4. Derivation Logic (REQUIRED)

**How context answers combine to produce recommendations:**

```markdown
## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| [Context combo 1] | [Approach + why] |
| [Context combo 2] | [Approach + why] |
```

### 5. TL;DR

Quick reference table for common needs and solutions.

### 6. Patterns/Options

**Building blocks, not recipes:**

Present multiple approaches. Explain when each is appropriate.

```markdown
## Patterns

### Pattern A: [Name]
When to use: [context]
Trade-offs: [pros/cons]

### Pattern B: [Name]
When to use: [context]
Trade-offs: [pros/cons]
```

### 7. Quick Decisions

Scenario → recommendation table for fast lookups.

### 8. Related Skills

Cross-references to other relevant skills.

---

## Anti-Patterns (Don't Do This)

| Bad Pattern | Problem |
|-------------|---------|
| "Use this color palette" | Prescriptive, no context |
| "Apply this animation" | Template, not framework |
| "Follow these steps" | Recipe, not reasoning |
| Single recommended approach | No exploration |
| No context questions | Assumptions instead of understanding |

---

## Flexibility Test

Every skill should pass these checks:

- [ ] **Choices over defaults** — presents options, not one answer
- [ ] **Ideation-enabling** — helps explore before implementing
- [ ] **Variation potential** — same skill, different outcomes possible
- [ ] **Context-aware** — asks about situation before recommending
- [ ] **Building blocks** — components to combine, not steps to follow

---

## Example Structure

```markdown
---
name: example-skill
description: Brief description.
---

# Skill Name

One-line summary.

## TL;DR

| Need | Solution |
|------|----------|
| X | Y |

## Context Questions

Before implementing:
1. What's the scale?
2. Who's the audience?
3. What's the brand vibe?
4. Any constraints?
5. References/inspirations?

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Complexity | Simple ←→ Complex |
| Audience | Consumer ←→ Enterprise |

## Patterns

### Pattern A
When: [context]
Approach: [details]

### Pattern B
When: [context]
Approach: [details]

## Quick Decisions

| Scenario | Recommendation |
|----------|----------------|
| [Situation] | [Approach] |

## Related Skills

- [skill-1](path)
- [skill-2](path)
```
