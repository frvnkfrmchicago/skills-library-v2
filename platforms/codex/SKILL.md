---
name: codex
description: OpenAI Codex patterns. When to use, code generation prompts, multi-file workflows, limitations.
last_updated: 2026-03
owner: Frank
---

# OpenAI Codex

AI-powered coding in the cloud.

> **Key insight**: Codex excels at autonomous multi-file tasks with clear specifications. Use for greenfield generation, complex refactoring, and codebase-wide changes.

---

## Context Questions

Before using Codex:

1. **Is this greenfield or existing code?** — Codex is great for new code
2. **How complex is the task?** — Simple → IDE, Complex → Codex
3. **How many files involved?** — Multi-file favors Codex
4. **Is it well-specified?** — Vague tasks = poor results
5. **Do I need real-time iteration?** — Use IDE for back-and-forth

---

## When to Use Codex vs Others

| Scenario | Codex | Cursor | Antigravity |
|----------|-------|--------|-------------|
| **New feature, multiple files** | ✓ Best | Good | Good |
| **Quick single-file edit** | Overkill | ✓ Best | Good |
| **Complex refactoring** | ✓ Best | Good | Good |
| **Real-time iteration** | Slow | ✓ Best | ✓ Best |
| **Codebase-wide changes** | ✓ Best | Good | OK |
| **Visual/browser tasks** | No | No | ✓ Best |
| **File system operations** | Good | Limited | ✓ Best |

---

## TL;DR

| Use Codex For | Avoid Codex For |
|---------------|-----------------|
| Multi-file feature implementation | Quick syntax questions |
| Test suite generation | Simple formatting |
| Documentation generation | Real-time debugging |
| Codebase-wide refactoring | Interactive exploration |
| Boilerplate scaffolding | Visual verification |

---

## Part 1: Effective Codex Prompts

### Greenfield Feature

```markdown
"Create a complete user authentication system:

## Requirements
- Email/password sign up and sign in
- Password hashing with bcrypt
- JWT token generation and validation
- Protected route middleware

## Tech Stack
- Next.js 16 with App Router
- TypeScript (strict mode)
- Prisma with PostgreSQL
- Zod for validation

## Files to Create
- app/api/auth/signup/route.ts
- app/api/auth/signin/route.ts
- lib/auth.ts (token utilities)
- lib/password.ts (hashing utilities)
- middleware.ts (route protection)
- prisma/schema.prisma (User model)

## Patterns to Follow
- Use Server Actions where appropriate
- All API routes should return {success, data, error}
- Include proper error handling
- Add JSDoc comments"
```

### Test Generation

```markdown
"Generate a comprehensive test suite for:

```typescript
[paste code to test]
```

## Requirements
- Use Vitest as the test framework
- Mock external dependencies (database, APIs)
- Cover:
  - Happy path
  - Edge cases
  - Error conditions
  - Boundary values
- Use describe/it blocks for organization
- Add clear test descriptions"
```

### Documentation Generation

```markdown
"Generate documentation for this codebase:

## Include
- README.md with setup instructions
- API documentation (OpenAPI spec)
- Architecture decision records
- Component documentation

## Analyze
- All files in src/
- package.json for dependencies
- Environment variables needed

## Style
- Concise, scannable format
- Code examples for complex concepts
- Diagrams where helpful (Mermaid)"
```

---

## Part 2: Multi-File Workflows

### Structured Task Definition

```markdown
"Implement a payment integration with Stripe:

## Phase 1: Setup
CREATE lib/stripe.ts - Stripe client initialization
CREATE types/payment.ts - Payment-related types

## Phase 2: API Routes
CREATE app/api/payments/create-intent/route.ts
CREATE app/api/payments/webhook/route.ts
UPDATE app/api/checkout/route.ts - Add payment step

## Phase 3: UI Components
CREATE components/CheckoutForm.tsx
CREATE components/PaymentStatus.tsx
UPDATE components/Cart.tsx - Add checkout button

## Phase 4: Integration
UPDATE app/checkout/page.tsx - Wire everything together

For each file, include:
- Full implementation
- TypeScript types
- Error handling
- JSDoc comments"
```

### File-by-File Generation

```markdown
"Let's build this feature file by file.

Start with: lib/stripe.ts

Include:
- Stripe client setup
- Type-safe wrapper functions
- Error handling utilities

After you generate, I'll verify and ask for the next file."
```

---

## Part 3: Codex Best Practices

### Provide Full Context

```markdown
## Good: Full context
"Given this existing code:

```typescript
// lib/db.ts
export const db = new PrismaClient();

// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
}
```

Add a getUserById function to lib/users.ts that:
- Uses the existing db client
- Returns the User type
- Handles not-found cases"

## Bad: Missing context
"Add a function to get users"
```

### Specify Patterns

```markdown
## Good: Pattern specified
"Use this error pattern throughout:

```typescript
// Existing pattern in codebase
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400
  ) {
    super(message);
  }
}
```

All new error handling should use ApiError."

## Bad: No pattern guidance
"Handle errors appropriately"
```

### Request Explanations

```markdown
"For each generated file, include a header comment explaining:
- Purpose of the file
- Key design decisions
- Any trade-offs made
- Usage examples"
```

---

## Part 4: Limitations

### What Codex CAN'T Do

| Limitation | Workaround |
|------------|------------|
| Run code | Verify locally after generation |
| Access external URLs | Provide content inline |
| See your screen | Describe visual elements |
| Access private repos | Paste relevant code |
| Real-time debugging | Use IDE for debugging |
| Learn your preferences | Specify in each prompt |

### Common Failure Modes

```markdown
## Watch for:
- Hallucinated APIs (check docs exist)
- Outdated patterns (specify versions)
- Over-engineering (specify simplicity)
- Missing edge cases (list them explicitly)
- Inconsistent patterns (provide examples)
```

---

## Part 5: Integration with Other Tools

### Codex → IDE Workflow

```markdown
1. Generate boilerplate with Codex
2. Copy to local project
3. Type-check and lint
4. Use Cursor/Antigravity for refinement
5. Test and iterate locally
```

### Handoff Prompt

```markdown
"I'm going to take this code to my local IDE for refinement.

Summarize:
- What was implemented
- Any known limitations
- Suggested next steps
- Areas that might need attention"
```

---

## Part 6: Prompt Templates

### New Project Scaffold

```markdown
"Create a complete project scaffold for:

## Project Type
[SaaS dashboard / E-commerce / API service / etc.]

## Tech Stack
- Framework: [Next.js 16 / Express / FastAPI]
- Database: [PostgreSQL / MongoDB / SQLite]
- Auth: [Clerk / NextAuth / Custom]
- Styling: [Tailwind / CSS Modules / shadcn]

## Include
- Project structure
- Configuration files
- Basic routes/pages
- Database schema
- Environment setup
- README with setup instructions"
```

### Migration Script

```markdown
"Create a migration script to:

## Current State
[Describe current code patterns/structure]

## Target State
[Describe desired patterns/structure]

## Constraints
- Must be idempotent
- Should not break during migration
- Include rollback capability
- Handle edge cases: [list]"
```

---

## Related Skills

- `platforms/antigravity/SKILL.md` — Alternative IDE with file access
- `platforms/cursor/SKILL.md` — Real-time code editing
- `ai-builder/context-engineering/SKILL.md` — Providing context
- `agents/github/SKILL.md` — Version control workflows
