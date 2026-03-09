---
name: code-auditing
description: >
  Comprehensive code quality audit covering security vulnerabilities,
  performance bottlenecks, code smells, anti-patterns, maintainability
  issues, and test coverage gaps. Use when reviewing code quality, before
  merging large PRs, when onboarding to an existing codebase, or when
  user mentions audit, tech debt, or code review.
---

# Code Auditing

Thorough code quality investigation that catches what eyes miss. Not a quick
glance — a systematic inspection of security, performance, quality,
maintainability, and test coverage.

---

## Phase 1: Security Scan

Run:
```bash
# Secrets in code
grep -rn --include="*.ts" --include="*.tsx" --include="*.py" \
  -E "(api_key|API_KEY|secret|SECRET|password|PASSWORD|sk-|PRIVATE_KEY)" \
  src/ app/ lib/ 2>/dev/null

# SQL injection risk
grep -rn "raw\|rawQuery\|\$queryRaw\|\$executeRaw\|execute(" src/ lib/ --include="*.ts" --include="*.py" 2>/dev/null

# XSS risk
grep -rn "dangerouslySetInnerHTML\|innerHTML\|__html\|mark_safe\|| safe" src/ app/ --include="*.tsx" --include="*.html" 2>/dev/null

# Authentication check
find src/ app/ pages/ -name "route.ts" -o -name "route.js" 2>/dev/null | while read f; do
  if ! grep -l "auth\|session\|middleware" "$f" > /dev/null 2>&1; then
    echo "🔴 UNPROTECTED: $f"
  fi
done

# Dependency vulnerabilities
npm audit --audit-level=high 2>/dev/null || pip audit 2>/dev/null
```

Flag any finding as 🔴 CRITICAL.

---

## Phase 2: Performance Scan

Run:
```bash
# N+1 query patterns
grep -rn "findMany\|findAll" src/ lib/ --include="*.ts" 2>/dev/null
grep -rn "include:\|select:" src/ lib/ --include="*.ts" 2>/dev/null

# Bundle size
ls -lhS .next/static/chunks/*.js 2>/dev/null | head -10 || ls -lhS dist/assets/*.js 2>/dev/null | head -10

# Lazy loading usage
grep -rn "React.lazy\|dynamic(\|lazy(" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l

# Image optimization
grep -rn "next/image\|Image\|loading=\"lazy\"" src/ --include="*.tsx" 2>/dev/null | wc -l

# Memory leaks (useEffect without cleanup)
grep -rn "useEffect" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l
grep -rn "return.*=>\|cleanup\|clearInterval\|clearTimeout\|removeEventListener" src/ --include="*.tsx" 2>/dev/null | wc -l
```

Flag if: N+1 queries without eager loading, bundle > 250KB, no lazy loading, useEffect without cleanup.

---

## Phase 3: Code Quality Scan

Run:
```bash
# TypeScript `any` usage
grep -rn ": any\|as any" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l

# File size (> 300 lines is a smell)
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | sort -rn | head -10

# Commented-out code
grep -rn "^\s*//.*=\|^\s*//.*return\|^\s*//.*function\|^\s*/\*" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "TODO\|NOTE\|FIXME" | wc -l

# Console.log in production code
grep -rn "console.log\|console.debug" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test\|spec" | wc -l

# Unused imports (TypeScript compiler check)
npx tsc --noEmit 2>&1 | grep "declared but" | wc -l
```

Flag: any `any` type > 5 occurrences, files > 300 lines, console.logs in non-test code.

---

## Phase 4: Maintainability Scan

Run:
```bash
# Folder structure check
find src/ -maxdepth 2 -type d 2>/dev/null

# Magic numbers
grep -rn "[^a-zA-Z][0-9]\{3,\}[^a-zA-Z]" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test\|spec\|\.d\.ts" | head -20

# Missing README
test -f README.md && echo "✅ README exists" || echo "🟡 No README"

# Environment variables documented
test -f .env.example && echo "✅ .env.example exists" || echo "🟡 No .env.example"
```

---

## Phase 5: Test Coverage Scan

Run:
```bash
# Check if tests exist
find src/ -name "*.test.*" -o -name "*.spec.*" -o -name "__tests__" 2>/dev/null | wc -l

# Run coverage if available
npx vitest run --coverage 2>/dev/null || npx jest --coverage 2>/dev/null || pytest --cov 2>/dev/null

# Check for E2E tests
find . -name "*.e2e.*" -o -name "playwright.config.*" -o -name "cypress.config.*" 2>/dev/null
```

Flag if: zero test files, no coverage report, no E2E tests for critical paths.

---

## Common Anti-Patterns to Flag

| Anti-Pattern | Why It's Bad | Scan Command |
|--------------|-------------|--------------|
| `any` type | No type safety | `grep ": any\|as any" src/` |
| God components (500+ lines) | Unmaintainable | `wc -l src/**/*.tsx | sort -rn` |
| Props drilling > 3 levels | Needs state management | Manual review |
| Inline styles everywhere | No consistency | `grep "style={{" src/` |
| No error boundaries | Crashes entire app | `grep "ErrorBoundary" src/` |
| Hardcoded URLs | Should be env vars | `grep "http://\|https://" src/` |

---

## ⛔ STOP GATE — Audit Completeness
DO NOT deliver an audit report without:
1. Running scan commands for ALL 5 phases
2. Listing every critical finding with file:line
3. Providing a fix for each finding

---

## Output Format

```markdown
## Code Audit Report — [Project Name]

### Summary
| Category | Issues | Severity |
|----------|--------|----------|
| Security | X | 🔴/🟡/🟢 |
| Performance | X | 🔴/🟡/🟢 |
| Code Quality | X | 🔴/🟡/🟢 |
| Maintainability | X | 🔴/🟡/🟢 |
| Testing | X | 🔴/🟡/🟢 |

### 🔴 Critical Issues (Fix Immediately)
#### [Issue N]
**File:** [path:line]
**Problem:** [description]
**Fix:** [solution]

### 🟡 Warnings (Fix Soon)
[Same format]

### 🟢 Good Practices Found
[What's done well]
```
