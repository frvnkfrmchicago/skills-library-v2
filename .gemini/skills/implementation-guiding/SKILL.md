---
name: implementation-guiding
description: >
  Guides systematic execution of audit findings, PRD specifications, and
  refactoring plans into working code. Covers audit-to-fix workflows,
  PRD-to-build pipelines, and refactoring protocols with verification gates.
  Use when executing from audits, building from PRDs, implementing refactors,
  or when user mentions implementation, execution, or building features.
---

# Implementation Guiding

Turn plans into working code. Execute audit findings, PRD specs, and
refactoring plans systematically — one concern at a time, each verified
before moving on.

---

## 1. When to Use This Skill

| Scenario | Use? | Approach |
|----------|------|----------|
| After running code audit | ✅ Yes | Audit → Fix workflow |
| After creating PRD | ✅ Yes | PRD → Build workflow |
| After planning refactor | ✅ Yes | Refactor workflow |
| New feature request | ✅ Yes | Feature → Build workflow |
| Quick one-off fix | ❌ No | Just do it |

---

## 2. Audit → Fix Workflow

When implementing fixes from an audit or code review:

1. **Read** the audit findings (sort by severity: Critical → Warning → Info)
2. **Create** a fix checklist ordered by priority
3. **Fix** one finding at a time
4. **Verify** each fix (run type-check, tests, manual check)
5. **Mark** completed in checklist
6. **Repeat** until all Critical and Warning items are resolved

### Fix Priority Order

```
🔴 CRITICAL — Fix immediately, blocks deployment
├── Security vulnerabilities (exposed secrets, missing auth)
├── Data integrity issues (race conditions, missing validation)
└── Breaking bugs (crashes, infinite loops)

🟡 WARNING — Fix before next release
├── Performance issues (N+1 queries, missing indexes)
├── Code quality (missing types, inconsistent patterns)
└── Missing error handling

🟢 INFO — Fix when convenient
├── Style inconsistencies
├── Documentation gaps
└── Minor refactoring opportunities
```

## ⛔ STOP GATE — Audit Fixes
DO NOT mark audit fixes as complete without:
1. Running `tsc --noEmit` (zero TypeScript errors)
2. Running the project's test suite
3. Manually verifying each Critical fix
4. Listing every fix applied with before/after evidence

---

## 3. PRD → Build Workflow

When building from a product requirements document:

1. **Review** all PRD sections and acceptance criteria
2. **Identify** build order (dependencies first)
3. **Create** per-feature implementation checklist
4. **Build** core functionality → integrate → polish
5. **Verify** against PRD acceptance criteria

### Build Order Decision

```
What depends on what?
│
├── Data layer first (schemas, types, API contracts)
│   └── Build these before any UI
│
├── Core logic second (business rules, state management)
│   └── Build after data layer is stable
│
├── UI components third (presentational, reusable)
│   └── Build once data shape is known
│
└── Integration last (wiring, error handling, edge cases)
    └── Connect everything, handle failures
```

---

## 4. Refactoring Workflow

When executing a planned refactor:

1. **Confirm** tests exist for the code being refactored (safety net)
2. **Define** scope: what IS changing and what is NOT
3. **Make** small changes — one concern at a time
4. **Run** tests after EACH change
5. **Document** what changed and why

### Scope Document (Required for Refactors)

Before starting any refactor, write:

```markdown
## Refactor Scope: [Name]

### Changing
- [List specific files/functions/patterns being modified]

### NOT Changing
- [List explicitly what stays the same]

### Success Criteria
- [How to verify the refactor worked]
- [Tests that must still pass]
- [Performance that must not regress]
```

## ⛔ STOP GATE — Refactoring
DO NOT start refactoring without:
1. A written scope document (what changes, what doesn't)
2. Existing tests passing as a baseline
3. Agreement on success criteria

---

## 5. Implementation Status Template

Use this format to track progress:

```markdown
## Implementation Status

### Current Focus
[What we're building right now]

### Completed
- [x] [Task 1] — verified with [evidence]
- [x] [Task 2] — verified with [evidence]

### In Progress
- [ ] [Current task]

### Next Up
- [ ] [Future task]

### Blockers
[Any issues preventing progress]
```

---

## NEVER

- **NEVER** implement without a plan — even a 5-line scope doc counts
- **NEVER** skip verification after each change
- **NEVER** refactor without tests as a safety net
- **NEVER** fix multiple concerns in one commit — one at a time
- **NEVER** mark something as done without evidence it works

---

## Pre-Completion Checklist

- [ ] All Critical audit findings fixed with evidence
- [ ] TypeScript compiles with zero errors
- [ ] Test suite passes
- [ ] Each change verified individually
- [ ] Implementation status document updated
- [ ] Scope document written (for refactors)
