# L1 Quick Prompt Template

Copy, fill in the brackets, paste. No grounding required.

---

## Template

```markdown
## Role
You are a [role] with expertise in [domain].

## Task
[One clear, specific instruction — one sentence if possible]

## Constraints
- Include: [what to include]
- Avoid: [what to avoid]
- Style: [tone/style requirements]

## Output Format
[Exact structure expected — code, JSON, markdown, table, etc.]
```

---

## Examples

### Code Generation

```markdown
## Role
You are a senior TypeScript engineer.

## Task
Write a debounced search hook (useDebounceSearch) that accepts a query string
and delay in ms, returns { results, isLoading, error }, and cancels pending
requests on unmount.

## Constraints
- Include: AbortController for request cancellation, TypeScript generics for result type
- Avoid: External libraries (no lodash), class components
- Style: Functional React with proper cleanup

## Output Format
Single TypeScript file with JSDoc comments on the exported hook.
```

### Design Brief

```markdown
## Role
You are a product designer specializing in mobile-first interfaces.

## Task
Design a notification preferences screen for a social app where users
control push, email, and in-app notifications per category (messages,
follows, likes, mentions).

## Constraints
- Include: Toggle groups by category, master on/off switch, quiet hours setting
- Avoid: Nested modals, more than 2 scroll depths
- Style: Clean, accessible, dark mode compatible

## Output Format
Describe the layout section by section, then provide React component code.
```

### Research Question

```markdown
## Role
You are a technical researcher focused on frontend performance.

## Task
Compare the current state of React Server Components vs Astro Islands
for content-heavy sites with moderate interactivity. Which approach
produces better Core Web Vitals in production?

## Constraints
- Include: LCP, INP, and CLS data from real benchmarks (2025-2026)
- Avoid: Opinion without data, marketing claims
- Style: Technical but readable

## Output Format
Comparison table with metrics, then a recommendation with cited evidence.
```
