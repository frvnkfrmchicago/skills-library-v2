---
name: code-scrutinizing
description: >
  Deep 7-lens code review covering mobile reality, scalability, launch
  readiness, design integrity, security posture, code intelligence, and
  architecture quality. Provides scored verdicts with evidence and
  references. Use before demos, deployments, client presentations, when
  code quality feels off, or when user mentions scrutiny or deep review.
---

# Code Scrutinizing

The relentless quality critic that refuses to let mediocre code ship. Every
line must justify its existence. Every finding comes with evidence, reasoning,
and a path forward.

---

## The 7 Scrutiny Lenses

Every codebase gets examined through ALL seven lenses. No shortcuts.

### Lens 1: 📱 Mobile Reality Check

Run:
```bash
# Check for mobile-first CSS (should use min-width, not max-width)
grep -rn "max-width" src/ --include="*.css" --include="*.scss" 2>/dev/null | wc -l
grep -rn "min-width" src/ --include="*.css" --include="*.scss" 2>/dev/null | wc -l

# Check for vh usage (broken on mobile — should use dvh)
grep -rn "[^d]vh" src/ --include="*.css" --include="*.scss" --include="*.ts" --include="*.tsx" 2>/dev/null

# Check for horizontal overflow (the cardinal sin)
grep -rn "overflow-x\|overflow: hidden" src/ --include="*.css" 2>/dev/null
```

Verify: All tap targets ≥ 44×44px. All images have `srcset`/`sizes` or use `next/image`. Safe area insets handled for notch phones.

### Lens 2: 🏗️ Scalability Interrogation

Run:
```bash
# Find N+1 query patterns
grep -rn "findMany\|findAll\|select\|query" src/ lib/ --include="*.ts" --include="*.py" 2>/dev/null | head -20

# Check for pagination
grep -rn "pagination\|paginate\|limit\|offset\|cursor\|skip\|take" src/ --include="*.ts" --include="*.py" 2>/dev/null | wc -l

# Check for hardcoded limits
grep -rn "= 100\|= 1000\|= 9999\|MAX_" src/ --include="*.ts" --include="*.py" 2>/dev/null
```

Flag if: no pagination on list endpoints, hardcoded limits that will silently fail, copy-pasted components instead of reusable ones.

### Lens 3: 🚀 Launch Readiness Verdict

Run:
```bash
# Check for empty state handling
grep -rn "empty\|no data\|no results\|nothing" src/ components/ --include="*.tsx" 2>/dev/null | wc -l

# Check for loading states
grep -rn "loading\|isLoading\|skeleton\|Spinner\|Suspense" src/ components/ --include="*.tsx" 2>/dev/null | wc -l

# Check for error boundaries
grep -rn "ErrorBoundary\|error\.tsx\|error\.js" app/ src/ --include="*.tsx" --include="*.ts" 2>/dev/null

# Check for 404 page
find app/ pages/ -name "not-found*" -o -name "404*" 2>/dev/null

# Check for favicon and meta tags
grep -rn "favicon\|og:title\|og:image\|meta.*description" app/ src/ --include="*.tsx" --include="*.html" 2>/dev/null
```

Flag if: no empty states, no loading states, no error boundaries, no 404 page, no meta tags.

### Lens 4: 🎨 Design Integrity Check

Run:
```bash
# CSS variables vs hardcoded hex values
grep -rn "var(--" src/ --include="*.css" --include="*.scss" 2>/dev/null | wc -l
grep -rn "#[0-9a-fA-F]\{3,8\}" src/ --include="*.css" --include="*.scss" --include="*.tsx" 2>/dev/null | wc -l

# Check for consistent spacing (should be multiples of 4)
grep -rn "margin\|padding\|gap" src/ --include="*.css" 2>/dev/null | grep -E "[0-9]+(px|rem)" | head -20

# Check for custom fonts
grep -rn "font-family\|@font-face\|next/font" src/ app/ --include="*.css" --include="*.tsx" 2>/dev/null
```

Flag if: more hardcoded hex values than CSS variables, spacing values not on 4px grid, no custom typography.

### Lens 5: 🔐 Security Posture

Run the `security-auditing` skill's Phase 1-4 scan commands. Reference that skill for full details.

Flag if: any secrets in source, unprotected routes, raw SQL queries, XSS vectors.

### Lens 6: 🧠 Code Intelligence

Run:
```bash
# TypeScript `any` escape hatches
grep -rn ": any\|as any" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l

# Dead code (unused imports — TypeScript compiler)
npx tsc --noEmit 2>&1 | grep "declared but" | head -20

# File size check (components should be < 200 lines)
find src/ -name "*.tsx" -o -name "*.ts" | xargs wc -l 2>/dev/null | sort -rn | head -20

# Console.log statements
grep -rn "console.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test\|spec" | wc -l
```

Flag if: more than 5 `any` types, files over 300 lines, unreachable code, inconsistent error handling.

### Lens 7: 📦 Build & Architecture Quality

Run:
```bash
# Check for circular dependencies
npx madge --circular src/ 2>/dev/null || echo "Install: npm i -g madge"

# Build time
time npm run build 2>/dev/null

# Check folder structure
find src/ -maxdepth 2 -type d 2>/dev/null

# Unused dependencies
npx depcheck 2>/dev/null | head -30
```

Flag if: circular dependencies found, build time > 2 minutes, unclear folder structure, unused dependencies.

---

## Scrutinizer Rules of Engagement

1. **Never rush** — read every file, don't skim
2. **Always explain WHY** — what's wrong, why it matters, how to fix, source reference
3. **Challenge assumptions** — "Why this approach?", "What at 10,000 users?", "Tested on a real phone?"
4. **Be constructive** — every finding comes with a path forward
5. **Acknowledge good work** — builds trust, shows what to replicate

---

## ⛔ STOP GATE — Scrutiny Completeness
DO NOT deliver a scrutiny report without:
1. Running scan commands for ALL 7 lenses
2. Scoring each lens 1-10 with evidence
3. Listing at least one finding per lens (or explicitly stating "no issues found")

---

## Output Format

```markdown
## 🔍 Code Scrutiny Report — [Project Name]

### Overall Verdict: 🟢 SHIP / 🟡 FIX FIRST / 🔴 NOT READY

### Scrutiny Score
| Lens | Score (1-10) | Verdict |
|------|-------------|---------|
| 📱 Mobile Reality | X/10 | 🔴/🟡/🟢 |
| 🏗️ Scalability | X/10 | 🔴/🟡/🟢 |
| 🚀 Launch Readiness | X/10 | 🔴/🟡/🟢 |
| 🎨 Design Integrity | X/10 | 🔴/🟡/🟢 |
| 🔐 Security Posture | X/10 | 🔴/🟡/🟢 |
| 🧠 Code Intelligence | X/10 | 🔴/🟡/🟢 |
| 📦 Architecture | X/10 | 🔴/🟡/🟢 |
| **TOTAL** | **X/70** | |

### 🔴 Critical Findings (Must Fix Before Ship)
#### [Finding N]
- **Lens:** [Which scrutiny lens]
- **File:** [path:line]
- **Problem:** [What's wrong]
- **Why it matters:** [Real-world consequence]
- **Fix:** [Specific solution]
- **Source:** [Documentation or best practice reference]

### 🟡 Concerns (Fix Soon)
[Same format]

### 🟢 Strengths Observed
[What's done well]
```
