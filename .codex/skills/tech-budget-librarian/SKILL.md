---
name: tech-budget-librarian
description: >
  Alias wrapper for the Tech Budget Librarian. Use when analyzing project
  costs, budgeting for APIs and services, projecting infrastructure expenses
  at scale, or identifying hidden costs. Scans codebases for paid services
  and outputs TLDR tables with detailed breakdowns. Activate when user
  mentions budget, costs, pricing, spend, or infrastructure expenses.
---

# Tech Budget Librarian

This is an alias wrapper. Read the full librarian file for instructions:

```
/Users/franklawrencejr./Downloads/skills-library-v2 2/librarians/tech-budget-librarian.md
```

## When to Activate

- User asks about project costs or budgeting
- User wants to know what APIs/services cost money
- User asks "what will this cost to run?"
- User mentions tech budget, infrastructure costs, or pricing
- Before launching a project to production
- When evaluating whether to use a paid service vs free alternative

## What This Does

1. Scans your codebase for paid services (APIs, hosting, databases)
2. Models API costs based on estimated usage
3. Projects costs at different user scale (100 to 100K)
4. Audits hidden costs you haven't thought of
5. Recommends cost-saving strategies
6. Outputs everything as TLDR tables first, then detailed text
