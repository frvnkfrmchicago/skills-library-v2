# Documentation Workflow

**How to generate docs as you build.**

---

## The Problem

You build stuff → docs are outdated or missing → you forget how it works.

## The Solution

Generate docs inline as you build:

1. **While coding** → Ask AI to generate explainer
2. **After feature** → Ask AI to update README
3. **Before PR** → Ask AI to generate changelist

---

## Patterns

### 1. Inline Explainer

When you finish a file, prompt:

```
Generate a code explainer for this file using the template in direct-paths/explainers/TEMPLATE.md

[paste code]
```

### 2. README Update

After adding a feature:

```
Update the README to include this new feature:
- What: [feature name]
- How: [brief usage]
- Where: [file location]
```

### 3. API Documentation

For backend routes:

```
Generate OpenAPI documentation for these endpoints:
[paste route handlers]
```

### 4. Architecture Doc

For system-level understanding:

```
Create an architecture diagram (mermaid) and explanation for:
- How data flows through the system
- What components exist
- How they communicate
```

---

## Storybook Integration

For UI components, use `agents/storybook/SKILL.md`:
- Stories generate visual docs
- Docs are always in sync with components
- Can export as static site

---

## Automation Ideas

1. **Pre-commit hook** — Generate explainer on changed files
2. **CI step** — Validate docs exist for new files
3. **Daily cron** — Regenerate architecture docs

---

## Related

- `agents/storybook/SKILL.md` — Component documentation
- `direct-paths/explainers/` — Explainer templates
- `_meta/CHANGELOG.md` — Version tracking
