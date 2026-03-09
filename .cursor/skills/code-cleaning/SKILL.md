---
name: code-cleaning
description: >
  Cleans code organization, file structure, naming conventions, dead code,
  and import hygiene for Next.js, React, Node.js, and Python projects.
  Use when cleaning up a codebase, removing dead code, organizing imports,
  restructuring folders, or when user mentions cleanup, refactor, hygiene,
  or technical debt.
---

# Code Cleaning

Systematic code organization — finds clutter, removes dead code, enforces
naming conventions, and recommends structure improvements. Clean code is
readable code, not clever code.

---

## Phase 1: Dead Code Detection

Run:
```bash
# Unused imports (TypeScript)
npx tsc --noEmit 2>&1 | grep "declared but" | head -30

# Unused exports
npx ts-unused-exports tsconfig.json 2>/dev/null || echo "Install: npm i -g ts-unused-exports"

# Unused dependencies
npx depcheck 2>/dev/null | head -30

# Commented-out code (should use git history instead)
grep -rn "^\s*//.*=\|^\s*//.*return\|^\s*//.*function" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "TODO\|NOTE\|FIXME\|eslint" | head -20

# Python unused imports
grep -rn --include="*.py" "^import\|^from" . 2>/dev/null | head -40
```

**Action:** Remove every unused import, variable, export, and dependency found. Use git history instead of commented-out code.

---

## Phase 2: Import Organization

Enforce this import order in every file:

```typescript
// 1. External packages (react, next, third-party)
import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

// 2. Internal packages (aliases like @/ or ~/)
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

// 3. Relative imports (local files)
import { formatDate } from './utils'
import styles from './styles.module.css'

// 4. Type imports (last)
import type { User } from '@/types'
```

Run to check violations:
```bash
# Find files with unsorted imports
grep -rn "^import" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -40
```

---

## Phase 3: Naming Convention Audit

Run:
```bash
# Components should be PascalCase
find src/ -name "*.tsx" 2>/dev/null | grep -v "PascalCase\|index\|layout\|page\|error\|loading\|not-found" | head -20

# Utilities should be camelCase
find src/lib/ src/utils/ src/helpers/ -name "*.ts" 2>/dev/null | head -20

# Constants should be SCREAMING_SNAKE_CASE
grep -rn "const [a-z].*=" src/ --include="*.ts" 2>/dev/null | grep -v "function\|=>\|import\|require" | head -20

# Boolean variables should start with is/has/should/can
grep -rn "const \|let " src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep "boolean\|Bool\|= true\|= false" | grep -v "is\|has\|should\|can\|was\|will" | head -20
```

### Naming Rules

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Utilities | camelCase | `formatDate.ts` |
| Folders | kebab-case | `user-profile/` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Event handlers | `handle` + Event | `handleClick` |
| Booleans | `is/has/should/can` prefix | `isLoading` |

---

## Phase 4: File Size & Structure Audit

Run:
```bash
# Files over 300 lines (should be split)
find src/ -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | sort -rn | head -20

# Functions over 30 lines
# Manual review — search for long function bodies

# Check folder structure depth
find src/ -maxdepth 3 -type d 2>/dev/null
```

### Recommended Structure (Next.js App Router)

```
src/
├── app/                    # Routes
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   └── layout.tsx
├── components/
│   ├── ui/                # Base components (buttons, inputs)
│   └── [feature]/         # Feature-specific components
├── lib/                   # Utilities, helpers
├── hooks/                 # Custom hooks
├── types/                 # TypeScript types
├── styles/                # Global styles
└── config/                # Configuration
```

### Rules

- **One component per file** (max 300 lines)
- **Colocate** related files (component + styles + tests together)
- **Extract** when reused OR when function exceeds 30 lines
- **Never** have more than 3 levels of folder nesting

---

## Phase 5: Console & Debug Cleanup

Run:
```bash
# Console statements in production code
grep -rn "console.log\|console.debug\|console.info\|console.warn" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test\|spec\|__tests__" | wc -l

# Python print statements
grep -rn --include="*.py" "print(" . 2>/dev/null | grep -v "venv/\|test_\|__pycache__/" | wc -l

# TODO/FIXME items
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx" --include="*.py" 2>/dev/null
```

**Action:** Remove all `console.log` from production code. Convert `TODO`/`FIXME` to tracked issues.

---

## Output Format

```markdown
## Code Cleaner Report — [Project Name]

### Dead Code Found
| File | Issue | Action |
|------|-------|--------|
| [file] | [unused import/export/dep] | Remove |

### Naming Violations
| File | Current | Should Be |
|------|---------|-----------|
| [file] | [current name] | [correct name] |

### Structure Recommendations
[What to move, extract, or reorganize]

### Cleanup Summary
- [X] unused imports removed
- [X] console.logs removed
- [X] files restructured
```
