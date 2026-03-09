# Skills Library Review Prompt

Use this prompt to audit the Skills Library for quality issues.

---

## Prompt Template

Copy and paste this to any AI:

```
I need you to review this Skills Library for quality and usability issues.

## What I'm Looking For

### 1. Naming/Structure Confusion
- Are there folders or files with similar names that could confuse users?
- Is the hierarchy logical? (e.g., why is X in agents/ vs workflows/?)
- Are cross-references consistent?

### 2. Redundancy
- Are there skills that overlap significantly?
- Should any skills be merged?
- Are there duplicates (same content, different locations)?

### 3. Missing Coverage
- Based on the "I want to..." routing, are there common needs not covered?
- Are there skills referenced that don't exist?
- Are there dead ends in the navigation?

### 4. Framework Consistency
- Do all skills have: Context Questions, Dimensions, Derivation Logic?
- Is frontmatter consistent (owner, last_updated)?
- Do skills follow the same structure?

### 5. Outdated Content
- Are there 2024 references that should be 2025?
- Are there deprecated tools/libraries mentioned?
- Are version numbers current?

### 6. Cross-Reference Issues
- Do internal links work?
- Are "See also" references accurate?
- Are related skills actually related?

## Output Format

Please provide:

1. **Critical Issues** (blocking/confusing)
2. **Medium Issues** (should fix)
3. **Minor Issues** (nice to have)
4. **Recommendations** (improvements)

For each issue, specify:
- File/location
- What's wrong
- Suggested fix

---

## Files to Review

[Paste file list or content here]
```

---

## Quick Audit Commands

Run these to get data for the review:

```bash
# Count skills with framework
grep -rl "## Context Questions" agents/ workflows/ platforms/ | wc -l

# Find skills missing owner
for f in $(find agents -name "SKILL.md"); do grep -L "owner:" "$f"; done

# List all skill names
find . -name "SKILL.md" -exec dirname {} \; | sort
```

---

## Known Areas to Watch

| Area | What to Check |
|------|---------------|
| `/design-innovation/` vs `/agents/design-system/` | Creative philosophy vs technical tokens |
| `/agents/observability/` vs `/agents/cloud-observability/` | Potential overlap |
| `/agents/personas/` vs `/workflows/personas/` | Different purposes? |

---

## When to Run This

- After adding 5+ new skills
- Before major version bump
- When agent feedback mentions confusion
- Quarterly maintenance
