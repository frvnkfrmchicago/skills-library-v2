---
name: debugging
description: AI-assisted debugging patterns. Strategic prompting, codebase extraction, stack trace analysis.
last_updated: 2026-03
owner: Frank
---

# AI-Assisted Debugging

Debug smarter with AI.

> **Key insight**: The best AI debugging starts with full context—extract your codebase, provide stack traces, and describe expected vs actual behavior.

---

## Context Questions

Before AI debugging:

1. **What's the expected behavior?** — What should happen
2. **What's the actual behavior?** — What's happening
3. **When did it break?** — What changed recently
4. **Is it reproducible?** — Always, sometimes, random
5. **What have you tried?** — Don't waste time on repeated attempts

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Scope** | Single line ←→ System-wide |
| **Visibility** | Clear error ←→ Silent failure |
| **Reproduction** | Always ←→ Intermittent |
| **Urgency** | Exploratory ←→ Production down |
| **Knowledge** | Familiar code ←→ Legacy/unknown |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Clear error message | Start with error analysis |
| Silent failure | Add logging, trace execution |
| Intermittent | Focus on race conditions, state |
| Performance issue | Profile first, then debug |
| Third-party integration | Check docs, versions, breaking changes |
| "Works on my machine" | Environment differences |

---

## TL;DR

| Technique | When |
|-----------|------|
| **Error Analysis** | Clear stack trace available |
| **Codebase Context** | Complex multi-file issue |
| **Rubber Duck** | Unclear what's wrong |
| **Binary Search** | Known regression, unclear where |
| **Logging Insertion** | Silent failures |
| **Environment Diff** | Works locally, fails in prod |

---

## Part 1: Providing Context to AI

### The Debugging Prompt Template

```markdown
## Problem
[One sentence: What's broken]

## Expected Behavior
[What should happen when...]

## Actual Behavior
[What actually happens, including errors]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Error occurs]

## Error Message/Stack Trace
```
[Paste full error]
```

## Relevant Code
```typescript
[Paste relevant code sections]
```

## What I've Tried
- [Attempt 1] — Result: [...]
- [Attempt 2] — Result: [...]

## Environment
- Node: 22.x
- Next.js: 16.x
- OS: [...]
```

### Full Codebase Extraction

For complex issues, provide full context:

```bash
# Using repo2txt or similar tool
npx repo2txt --output codebase.txt --ignore node_modules,.next

# Or manual selection
find . -name "*.ts" -o -name "*.tsx" | head -50 | xargs cat > context.txt
```

Then prompt:

```markdown
"Here's my full codebase:

[paste codebase.txt]

The issue is: [description]

Analyze the code and identify the root cause."
```

---

## Part 2: Error Analysis Patterns

### Stack Trace Analysis

```markdown
## Prompt
"Analyze this stack trace:

```
TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (src/components/UserList.tsx:15:23)
    at renderWithHooks (node_modules/react-dom/...)
    at mountIndeterminateComponent (...)
```

1. What's the immediate cause?
2. What's the likely root cause?
3. What should I check first?
4. How do I prevent this in the future?"
```

### Common Error Pattern Recognition

```typescript
// AI can recognize patterns like:

// 1. Async/Await missing
// "data is undefined" → fetched before await completed

// 2. Type narrowing missing
// "Cannot read property" → didn't check for null/undefined

// 3. Stale closure
// "wrong value in callback" → captured old state

// 4. Race condition
// "sometimes works, sometimes doesn't" → async timing
```

---

## Part 3: Strategic Debugging

### The Binary Search Method

```markdown
"This feature broke sometime in the last week.

Here are the commits:
- abc123: Added user preferences
- def456: Refactored API calls  
- ghi789: Updated dependencies
- jkl012: Fixed styling issues

Which commit should I check first to narrow down the issue?
What's my binary search strategy?"
```

### Rubber Duck Debugging with AI

```markdown
"I'm going to explain my code step by step. 
Interrupt me if you spot something wrong.

1. User clicks submit button
2. Form data is validated with Zod
3. Data is sent to /api/users POST endpoint
4. Server validates and saves to database
5. Response sent back to client
6. Client shows success message

The issue: Success message shows but data isn't saved."
```

---

## Part 4: IDE-Specific Debugging

### Cursor Debugging

```markdown
## Using Cursor for debugging:

1. Select error code + related files
2. Use @Codebase to search for related patterns
3. Prompt: "Why might this error occur given the codebase context?"

## Effective prompts:
- "Trace this function call through the codebase"
- "@UserService.ts @UserController.ts Debug the user creation flow"
- "What could cause [error] in this context?"
```

### Antigravity Debugging

```markdown
## Using Antigravity for debugging:

1. Use view_file to inspect relevant code
2. Use grep_search to find error patterns
3. Use run_command to check logs
4. Use browser_subagent to reproduce UI issues

## Workflow:
1. "Search for all uses of [function]"
2. "View the file where this error originates"
3. "Check if this pattern exists elsewhere"
4. "Run the tests for this module"
```

---

## Part 5: Preventive Debugging

### AI Suggests Missing Validations

```markdown
"Review this code for potential runtime errors:

```typescript
async function getUser(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  return user.email; // What if user is null?
}
```

What edge cases are not handled?"
```

### Type Safety Analysis

```markdown
"Analyze this TypeScript code for type safety issues.
Flag any potential runtime errors due to:
- Missing null checks
- Type assertions (as)
- any usage
- Incorrect generics"
```

---

## Part 6: Environment Debugging

### "Works on My Machine"

```markdown
"My app works locally but fails in production.

## Local
- Node 22.1.0
- npm 10.2.0
- macOS Sonoma
- DATABASE_URL: postgresql://localhost:5432/dev

## Production (Vercel)
- Node 22.x
- DATABASE_URL: [Neon connection string]

Error in production:
```
PrismaClientInitializationError: Can't reach database server
```

What are the likely differences causing this?"
```

### Log Analysis

```markdown
"Analyze these production logs for the root cause:

```
[2024-01-15T10:23:01] INFO: Request received /api/users
[2024-01-15T10:23:01] DEBUG: Auth token validated
[2024-01-15T10:23:02] DEBUG: Database query started
[2024-01-15T10:23:32] ERROR: Query timeout after 30s
[2024-01-15T10:23:32] ERROR: 500 Internal Server Error
```

What's the issue and how do I fix it?"
```

---

## Part 7: Human Verification

### Always Verify AI Suggestions

```markdown
Before applying any AI debugging suggestion:

1. [ ] Understand WHY the fix works
2. [ ] Check for side effects
3. [ ] Test the specific case
4. [ ] Test related functionality
5. [ ] Add a test to prevent regression
```

### When AI is Wrong

AI might miss:
- Business logic errors (doesn't know your requirements)
- Environment-specific issues (doesn't see your infra)
- Race conditions (can't run the code)
- Performance issues (can't measure)

---

## Debugging Checklist

- [ ] Collected full error message/stack trace
- [ ] Documented expected vs actual behavior
- [ ] Provided relevant code context
- [ ] Listed what I've already tried
- [ ] Specified environment details
- [ ] Verified AI suggestion before applying
- [ ] Added test to prevent regression

---

## Related Skills

- `agents/refactoring/SKILL.md` — Clean up after fixing
- `agents/testing/SKILL.md` — Prevent future bugs
- `agents/monitoring/SKILL.md` — Catch issues early
- `ai-builder/deep-reasoning/SKILL.md` — Complex problem analysis
