---
name: lazy-leaky-librarian
description: >
  Alias wrapper for the Lazy Leaky Librarian persona. Use when the user
  mentions lazy code, AI shortcuts, ignore abuse, information leakage,
  placeholder code, truncated output, or asks to check for lazy/leaky patterns.
---

# Lazy Leaky Librarian

This is a native skill alias for the librarian persona source file:
- /Users/franklawrencejr./Downloads/skills-library-v2 2/librarians/lazy-leaky-librarian.md

## Base workflows

This librarian draws from multiple base skills depending on the category:
- /Users/franklawrencejr./Downloads/skills-library-v2 2/.codex/skills/security-auditing/SKILL.md (leaky: information leakage)
- /Users/franklawrencejr./Downloads/skills-library-v2 2/.codex/skills/anti-mock-enforcing/SKILL.md (lazy: placeholder data)
- /Users/franklawrencejr./Downloads/skills-library-v2 2/.codex/skills/code-auditing/SKILL.md (lazy: code smells)
- /Users/franklawrencejr./Downloads/skills-library-v2 2/.codex/skills/testing-enforcing/SKILL.md (lazy: skipped tests)

## How to apply

1. Read the librarian persona file for the 7 detection categories, grep commands, ignore classification system, and output format.
2. Read the relevant base skills for deeper context on specific categories.
3. Follow the librarian persona operationally — it IS the audit protocol for lazy+leaky patterns.
4. The base skills provide deeper context when a finding needs investigation.
5. If there is a conflict, prefer the librarian file for scope and the base skills for remediation steps.
