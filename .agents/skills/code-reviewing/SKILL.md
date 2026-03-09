---
name: code-reviewing
description: >
  Reviews code, explanations, feedback, and outputs for quality, clarity,
  and actionability. Provides constructive verdicts with strengths and
  improvement areas. Distinct from auditing — review validates quality,
  audit finds problems. Use when reviewing PRs, code submissions,
  documentation, client deliverables, or when user mentions review,
  feedback, or approval.
---

# Code Reviewing

Review is not audit. Audit finds problems. Review validates quality and
provides constructive feedback. Every piece of output should meet its
intended purpose.

---

## Review Types

### Code Review

Run:
```bash
# Get the diff to review
git diff --stat HEAD~1 2>/dev/null || git diff --cached --stat 2>/dev/null

# Check the changed files
git diff --name-only HEAD~1 2>/dev/null || git diff --cached --name-only 2>/dev/null

# Check for common issues in changed files
git diff HEAD~1 2>/dev/null | grep "^+" | grep -E "console\.log|TODO|FIXME|any|as any" | head -20
```

Evaluate:
1. **Does it solve the stated problem?** — Read the PR description / commit message
2. **Is it readable and maintainable?** — Could a new dev understand this in 5 minutes?
3. **Are variable/function names clear?** — No abbreviations, self-documenting
4. **Is error handling appropriate?** — Not swallowed, not over-caught
5. **Are edge cases covered?** — Null checks, empty states, boundary conditions
6. **Would I understand this in 6 months?** — The ultimate readability test

### What Code Review Does NOT Check (That's Audit)
- Security vulnerabilities → use `security-auditing` skill
- Performance optimization → use `performance-tuning` skill
- Dependency issues → use `code-auditing` skill

---

### Explanation Review

Evaluate:
1. **Clear to the target audience?** — Technical for devs, simple for clients
2. **Jargon defined or avoided?** — No undefined acronyms
3. **Examples provided?** — Abstract concepts need concrete examples
4. **Answers the actual question?** — Not tangential
5. **Right length?** — Not a novel, not a tweet

---

### Feedback Review

Evaluate:
1. **Specific, not vague?** — "The auth flow is missing X" not "auth is broken"
2. **Actionable?** — Recipient knows exactly what to do next
3. **Constructive?** — Points to solutions, not just problems
4. **Explains WHY, not just WHAT?** — "This matters because..." 
5. **Tone appropriate?** — Professional, respectful, helpful

---

## Review Modes

| Mode | Focus | Use When |
|------|-------|----------|
| **Quick** | Pass/fail on obvious issues | Small changes, hotfixes |
| **Technical** | Line-by-line with rationale | Feature branches, complex logic |
| **Client** | Polished, professional | Deliverables, external-facing |

---

## Review Checklist

Run for any code review:
```bash
# What changed?
git diff --stat HEAD~1 2>/dev/null

# Any new dependencies added?
git diff HEAD~1 -- package.json 2>/dev/null | grep "^+" | grep -v "version"

# Any new environment variables needed?
git diff HEAD~1 2>/dev/null | grep "process.env\|import.meta.env\|os.environ" | head -10

# Tests updated for new code?
git diff --name-only HEAD~1 2>/dev/null | grep "test\|spec"

# File size check on changed files
git diff --name-only HEAD~1 2>/dev/null | xargs wc -l 2>/dev/null | sort -rn | head -10
```

---

## ⛔ STOP GATE — Review Completeness
DO NOT approve a review without:
1. Reading every changed file (not skimming)
2. Checking that the change solves the stated problem
3. Verifying no new issues introduced (console.logs, TODOs, `any` types)

---

## Output Format

```markdown
## Review — [What was reviewed]

### Verdict
✅ Approved / 🟡 Needs Minor Changes / 🔴 Needs Major Revision

### Strengths
- [What's done well — acknowledge good work]

### Improvements Needed
- [Specific, actionable feedback with file:line]

### Questions
- [Clarifications needed before approval]
```
