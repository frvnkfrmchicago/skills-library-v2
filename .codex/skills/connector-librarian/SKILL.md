---
name: connector-librarian
description: >
  Alias wrapper for the Connector Librarian. Use when auditing whether an
  app is fully wired — every user type has complete flows, every screen is
  reachable, every route has a backend, no dead code exists. Distinct from
  code audit (quality) and flow design (UX). Activate when user mentions
  connectivity, dead code, hanging features, completeness, or asks "is this
  actually done?"
---

# Connector Librarian

This is an alias wrapper. Read the full librarian file for instructions:

```
/Users/franklawrencejr./Downloads/skills-library-v2 2/librarians/connector-librarian.md
```

## When to Activate

- User asks "is everything connected?" or "is this actually done?"
- User wants to verify all user types work end-to-end
- User mentions dead code, hanging features, or incomplete flows
- Before production launch (complements exit gate)
- User says "connector" or "code connector"
- User asks if all profiles / user types are functional

## What This Does

1. Maps all user types and what each should be able to do
2. Traces every flow: frontend -> API -> database -> response -> UI
3. Audits every route for backend coverage
4. Checks profile integrity (demo profiles that work like real users)
5. Maps feature connectivity graph (does feature A feed feature B?)
6. Verifies decision trees (every conditional branch resolves)
7. Finds dead/orphaned code
8. Outputs everything as TLDR tables with priority levels
