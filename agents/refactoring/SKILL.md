---
name: refactoring
description: AI-assisted refactoring patterns. Multi-file refactoring, maintaining functionality, and strategic prompting.
last_updated: 2026-03
owner: Frank
---

# AI-Assisted Refactoring

Improve code without breaking it.

> **Key insight**: Refactoring with AI works best when you're specific about goals, provide full context, and verify each change preserves functionality.

---

## Context Questions

Before refactoring:

1. **What's the goal?** — Readability, performance, maintainability?
2. **What must NOT change?** — Behavior, API, types?
3. **How will you verify?** — Tests, manual check, type check?
4. **What's the scope?** — Single file, feature, codebase-wide?
5. **Is there test coverage?** — Can you safely change?

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Scope** | Single function ←→ Entire codebase |
| **Risk** | Cosmetic changes ←→ Logic restructuring |
| **Verification** | Type check only ←→ Full test suite |
| **Urgency** | Cleanup at leisure ←→ Blocking feature work |
| **Test Coverage** | None ←→ Comprehensive |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Cosmetic/formatting | Auto-format, lint fix |
| Rename/move | IDE refactor tools first |
| Extract function | AI + verify types |
| Restructure logic | Tests first, then AI |
| Multi-file changes | One file at a time |
| No tests | Add tests before refactoring |

---

## TL;DR

| Refactoring Type | AI Help Level | Verification Needed |
|------------------|---------------|---------------------|
| **Rename** | Low - use IDE | Type check |
| **Format** | None - use tools | Lint |
| **Extract function** | Medium | Type check + test |
| **Restructure** | High | Full test suite |
| **Pattern migration** | High | Comprehensive review |
| **Multi-file** | High | Tests + manual review |

---

## Part 1: Strategic Prompting

### The Refactoring Prompt Template

```markdown
## Current Code
```typescript
[paste code]
```

## Refactoring Goal
[What you want to improve]

## Constraints
- [ ] Must preserve existing behavior exactly
- [ ] Must maintain current TypeScript types/API
- [ ] Must not break existing tests
- [ ] [Any other constraints]

## Specific Changes Requested
1. [Change 1]
2. [Change 2]
3. [Change 3]

## Output Format
Provide the refactored code with comments explaining changes.
```

### Effective Refactoring Prompts

```markdown
## Good Prompts

✓ "Refactor this function to use async/await instead of .then() chains.
   Preserve all error handling behavior."

✓ "Extract the validation logic from this function into a separate 
   validateUserInput function. Keep the same return types."

✓ "Split this 200-line component into smaller components.
   Keep the same props interface on the parent."

## Bad Prompts

✗ "Make this code better" (too vague)
✗ "Refactor this" (no goal specified)
✗ "Clean this up" (unclear scope)
```

---

## Part 2: Refactoring Patterns

### Extract Function

```markdown
"Extract the following logic into a separate function:

```typescript
function processOrder(order: Order) {
  // Calculate discount - EXTRACT THIS
  let discount = 0;
  if (order.total > 100) discount = 10;
  if (order.total > 500) discount = 20;
  if (order.customer.isVip) discount += 5;
  
  // Apply discount
  const finalTotal = order.total - (order.total * discount / 100);
  // ... rest of function
}
```

Create: calculateDiscount(total: number, isVip: boolean): number
The parent function should call this new function."
```

### Inline Complexity

```markdown
"Simplify this nested conditional into a more readable form:

```typescript
function getAccess(user: User) {
  if (user.isAdmin) {
    if (user.isActive) {
      if (!user.isLocked) {
        return 'full';
      } else {
        return 'locked';
      }
    } else {
      return 'inactive';
    }
  } else {
    return 'limited';
  }
}
```

Use early returns and/or a lookup table."
```

### Pattern Migration

```markdown
"Migrate this class component to a functional component with hooks:

```tsx
class UserProfile extends React.Component {
  state = { user: null, loading: true };

  async componentDidMount() {
    const user = await fetchUser(this.props.id);
    this.setState({ user, loading: false });
  }

  render() {
    if (this.state.loading) return <Spinner />;
    return <Profile user={this.state.user} />;
  }
}
```

Convert to use useState and useEffect."
```

---

## Part 3: Multi-File Refactoring

### Step-by-Step Approach

```markdown
## When refactoring across multiple files:

1. **Identify all affected files**
   "Find all files that import/use [component/function]"

2. **Plan the changes**
   "What needs to change in each file?"

3. **Execute one file at a time**
   "Refactor [file1] first, verify, then proceed"

4. **Run tests between each file**
   "npm test" after each file change

5. **Full verification at the end**
   Type check, lint, full test suite
```

### Multi-File Prompt

```markdown
"I'm refactoring the user authentication flow.

Files involved:
- src/hooks/useAuth.ts (current auth hook)
- src/context/AuthContext.tsx (auth provider)
- src/components/Login.tsx (uses auth)
- src/components/ProtectedRoute.tsx (uses auth)

Goal: Move from Context to TanStack Query for auth state.

Start with src/hooks/useAuth.ts. Show the refactored version.
I'll verify and ask for the next file."
```

---

## Part 4: Maintaining Functionality

### Behavioral Constraints

```markdown
"Refactor this function with these constraints:

```typescript
function formatDate(date: Date, options?: FormatOptions): string {
  // complex existing logic
}
```

## MUST PRESERVE:
- All 47 existing tests must pass
- Return type must remain string
- Default behavior (no options) unchanged
- Invalid date returns 'Invalid Date'
- Handles timezone as before

## CAN CHANGE:
- Internal implementation
- Performance optimizations
- Code organization"
```

### Safe Refactoring Pattern

```markdown
1. Write tests for current behavior (if missing)
2. Verify tests pass
3. Refactor with AI
4. Run same tests
5. Compare outputs for edge cases
6. Commit only if tests pass
```

---

## Part 5: Verification

### Side-by-Side Diff Review

```markdown
"Show the diff between original and refactored code.
Highlight any behavioral changes."

## AI Output Format:
```diff
- old line
+ new line
```

## Review checklist:
- [ ] No logic changes I didn't request
- [ ] No removed error handling
- [ ] No changed types
- [ ] No removed edge case handling
```

### Test After Refactoring

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Unit tests
npm test

# E2E tests (if applicable)
npm run test:e2e
```

### When to Accept/Reject AI Suggestions

| Accept | Reject |
|--------|--------|
| Cleaner but equivalent | Changed logic unexpectedly |
| Better naming, same behavior | Removed error handling |
| Modern syntax, same types | Added dependencies |
| Performance improvement (verified) | "Improved" without explanation |
| Matches project patterns | Invented new patterns |

---

## Part 6: Common Refactorings

### Rename Variable/Function

```markdown
"Rename the variable 'data' to 'userProfile' throughout this file.
Update all references."
```

### Consolidate Duplicate Code

```markdown
"These three functions share similar logic:

[paste functions]

Create a common utility function and refactor all three to use it."
```

### Modernize Syntax

```markdown
"Update this ES5 code to modern TypeScript:

```javascript
var self = this;
function getData(callback) {
  fetch('/api/data')
    .then(function(response) { return response.json(); })
    .then(function(data) { callback(null, data); })
    .catch(function(err) { callback(err); });
}
```

Use async/await, arrow functions, const/let, and proper types."
```

---

## Part 7: IDE-Specific Refactoring

### Cursor

```markdown
- Select code → Cmd+K → "Refactor to..."
- Use Composer for multi-file refactoring
- Agent mode for large-scale changes
- Reference patterns: @lib/patterns.ts
```

### Antigravity

```markdown
- Use view_file to see current code
- Use grep_search to find all usages
- Edit one file at a time
- Run tests with run_command between edits
```

---

## Refactoring Checklist

Before:
- [ ] Goal clearly defined
- [ ] Constraints stated
- [ ] Tests exist (or write them first)
- [ ] All affected files identified

During:
- [ ] One logical change at a time
- [ ] Verify types after each change
- [ ] Run tests frequently

After:
- [ ] All tests pass
- [ ] No type errors
- [ ] Linting passes
- [ ] Reviewed diff for unexpected changes
- [ ] Commit with descriptive message

---

## Related Skills

- `agents/debugging/SKILL.md` — Fix issues found during refactoring
- `agents/testing/SKILL.md` — Ensure safety before refactoring
- `agents/typescript-advanced/SKILL.md` — Type-safe refactoring
- `ai-builder/deep-reasoning/SKILL.md` — Plan complex refactors
