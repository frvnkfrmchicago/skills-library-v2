---
name: feature-architecting
description: >
  Enforces feature boundary architecture for large-scale frontend apps. Creates
  barrel files (public APIs) for every feature, enforces them via ESLint boundary
  rules, splits monster files, and normalizes route groups. Use when organizing
  a codebase with 10+ feature folders, when features are tangled (deep-path
  imports bypassing barrels), when files exceed 500 lines, or when the user
  mentions architecture, feature organization, barrel files, module boundaries,
  or Feature-Sliced Design.
---

# Feature Architecting

Enforce clear boundaries between feature modules so each feature is
independently editable. One feature, one public API, zero cross-feature coupling.

---

## Core Principle

**Every feature is a self-contained slice with a single public API (barrel).
Other features import from the barrel, never from internal files.**

This is Feature-Sliced Design (FSD): upper layers (app routes, shared widgets)
may import from feature barrels, but features never import from each other
laterally — and never reach past a barrel into another feature's internals.

---

## The 5 Elements of a Feature Module

| Element | What | Where |
|---------|------|-------|
| **Barrel** | The public API — the ONLY file outsiders import from | `components/{feature}/index.ts` |
| **Components** | Feature-specific UI, organized into sub-folders | `components/{feature}/{sub-folder}/` |
| **Hooks/Logic** | Feature-specific stateful logic | `lib/{feature}/` or colocated |
| **Route** | The route entry point for this feature | `app/(group)/{feature}/page.tsx` |
| **Types** | Feature-specific TypeScript types | `lib/{feature}/types.ts` or barrel re-export |

---

## Phase 1: Audit — Map the Current State

Before changing anything, understand what exists.

```bash
# 1. List all feature component folders
find src/components -maxdepth 1 -type d | sort

# 2. Find which features have barrels (public APIs)
for d in $(find src/components -maxdepth 1 -type d | sort | tail -n +2); do
  if [ -f "$d/index.ts" ] || [ -f "$d/index.tsx" ]; then
    echo "HAS BARREL: $d"
  else
    echo "MISSING: $d ($(find $d -name '*.tsx' -o -name '*.ts' | wc -l) files)"
  fi
done

# 3. Count deep-path violations (imports that bypass barrels)
grep -rn "from '@/components/" src/ app/ --include='*.ts' --include='*.tsx' \
  | grep -v "from '@/components/[^']*/index'" \
  | awk -F"'" '{print $2}' \
  | grep "/" \
  | grep -v "^@/components/[a-z-]*'$" \
  | sort | uniq -c | sort -rn | head -20

# 4. Find monster files (>500 lines)
find src/ -name '*.tsx' -o -name '*.ts' \
  | xargs wc -l 2>/dev/null | sort -rn | head -20 \
  | while read lines file; do
    if [ "$lines" -gt 500 ] 2>/dev/null; then echo "$lines $file"; fi
  done

# 5. Check route group organization
find src/app -maxdepth 1 -type d | sort
```

### Classification

| Verdict | Criteria |
|---------|----------|
| ✅ **Has barrel** | `index.ts` exists and re-exports public symbols |
| 🟡 **Barrel exists, not enforced** | `index.ts` exists but deep-path imports bypass it |
| 🔴 **No barrel** | Feature folder has no `index.ts` — internals are exposed |

---

## Phase 2: Create Barrels

For every feature missing a barrel, create `components/{feature}/index.ts`.

### Barrel Template

```typescript
/* ============================================================================
 * components/{feature} — the {FEATURE} feature module's PUBLIC SURFACE (barrel).
 * ----------------------------------------------------------------------------
 * This is the ONE door other features knock on. Anything imported from outside
 * this slice comes through `@/components/{feature}`, never a deep path like
 * `@/components/{feature}/SomeInternalFile`.
 *
 * Rule (Feature-Sliced Design):
 *   · INSIDE the slice, files import each other by relative path freely.
 *   · OUTSIDE the slice, import ONLY from this barrel. If a symbol isn't
 *     re-exported here, it's private — don't reach past the boundary.
 * ========================================================================== */

/* ── Route entry (if the feature has a route page) ── */
// export { default as FeaturePageClient } from './FeaturePageClient';

/* ── Public components (safe to import from other features) ── */
// export { ComponentA } from './ComponentA';
// export { ComponentB } from './ComponentB';

/* ── Hooks (re-exported so neighbors get data through the feature door) ── */
// export { useFeatureData } from '@/lib/{feature}/hooks';

/* ── Types ── */
// export type { FeatureTypeA, FeatureTypeB } from '@/lib/{feature}/types';
```

### What to export

| Export | Criteria |
|--------|----------|
| ✅ Route entry | The page-level component other routes or layouts mount |
| ✅ Shared components | Components other features render (e.g., PostCard in feed) |
| ✅ Public hooks | Data-fetching hooks neighbors need |
| ✅ Public types | Types neighbors need to talk to the feature |
| ❌ Internal UI | Components only used within the feature |
| ❌ Internal utilities | Helpers only the feature uses |
| ❌ Effects/animations | Visual implementation detail |
| ❌ State management internals | Store wiring, reducers, etc. |

---

## Phase 3: Enforce Boundaries

A barrel that isn't enforced is aspirational. Make it mandatory.

### Option A: `no-restricted-paths` (eslint-plugin-import)

```javascript
// eslint.config.js
import importPlugin from 'eslint-plugin-import';

export default [
  {
    plugins: { import: importPlugin },
    rules: {
      'import/no-restricted-paths': ['error', {
        zones: [
          {
            // Block any file OUTSIDE components/feed/ from importing
            // deep paths INSIDE components/feed/
            target: './!components/feed/**/*',
            from: './components/feed/**/*',
            except: ['./components/feed/index.ts'],
            message: 'Import from @/components/feed barrel, not deep paths'
          },
          // Repeat for each feature barrel
          {
            target: './!components/messages/**/*',
            from: './components/messages/**/*',
            except: ['./components/messages/index.ts'],
            message: 'Import from @/components/messages barrel, not deep paths'
          },
        ]
      }]
    }
  }
];
```

### Option B: `eslint-plugin-boundaries` (element-type based)

```javascript
// eslint.config.js — boundaries plugin
{
  settings: {
    'boundaries/elements': [
      { type: 'feature', pattern: 'components/*', mode: 'file' },
      { type: 'app', pattern: 'app/*' },
      { type: 'lib', pattern: 'lib/*' },
    ]
  },
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        { from: 'app', allow: ['feature', 'lib'] },
        { from: 'feature', allow: ['lib'] },  // features can use shared lib
        // features CANNOT import from other features directly — only through barrels
      ]
    }]
  }
}
```

### Redirect existing violations

```bash
# Find all files that deep-import from a feature
grep -rl "from '@/components/feed/" src/ app/ --include='*.ts' --include='*.tsx'

# For each file: change
//   from '@/components/feed/PostCard'
// to
//   from '@/components/feed'  (and ensure PostCard is in the barrel)
```

---

## Phase 4: Split Monster Files

Files over 500 lines block editability. Split by responsibility.

### Decision Tree

```
How big is the file?
│
├── < 300 lines → Leave it
│
├── 300-500 lines → Review: can a section be extracted?
│
└── > 500 lines → MUST split
    │
    ├── Multiple responsibilities in one file?
    │   → Extract each responsibility into its own file
    │     (e.g., MessageInterface.tsx → MessageList.tsx + MessageInput.tsx)
    │
    ├── One component with many sub-sections?
    │   → Extract sub-sections as child components in the same feature folder
    │     (e.g., PostComposer.tsx → composer/MediaSection.tsx + composer/StickerSection.tsx)
    │
    └── Component + hooks + utils mixed?
        → Separate: component stays, hooks go to lib/, utils go to lib/
```

### Rules

- **One component per file** (max 300 lines for the component itself)
- **Extract when reused** OR when a function exceeds 30 lines
- **Colocate** split files within the same feature sub-folder
- **Re-export** through the barrel if the split component is public

---

## Phase 5: Normalize Route Groups

Use Next.js App Router route groups for URL-transparent organization.

### Pattern

```
app/
├── (auth)/          # Authentication flows
│   ├── login/
│   ├── register/
│   └── reset-password/
├── (social)/        # Consumer social features
│   ├── feed/
│   ├── messages/
│   ├── notifications/
│   └── post/
├── (business)/      # Business dashboard
│   ├── dashboard/
│   ├── inventory/
│   └── compliance/
├── (platform)/      # Platform/admin
│   ├── admin/
│   ├── analytics/
│   └── insights/
└── api/             # API routes (not grouped)
```

### Rules

- Route groups `(name)` do NOT affect the URL — `/feed` stays `/feed`
- Group by user persona or functional domain, not by file count
- Each route page imports from the feature barrel, not internals

---

## ⛔ STOP GATE — Feature Architecture

DO NOT mark a feature organized without:

1. **Barrel exists** — `components/{feature}/index.ts` with documented public surface
2. **Zero deep-path violations** — no external file imports past the barrel
3. **ESLint rule active** — boundary enforcement is in the lint config
4. **No file over 500 lines** — monster files split
5. **Route grouped** (if major feature) — lives in a `(group)/` folder
6. **Import order enforced** — external → internal → relative → type imports

---

## NEVER

- **NEVER** import from a deep path past a barrel (`@/components/feed/PostCard`) — use the barrel
- **NEVER** create a barrel without enforcing it — unenforced barrels are aspirational, not real
- **NEVER** put business logic in a barrel — barrels are for re-exporting, not implementing
- **NEVER** export internals — if a neighbor doesn't need it, don't re-export it
- **NEVER** skip the ESLint rule — the boundary is the barrel + the lint rule together
- **NEVER** leave a file over 500 lines when organizing a feature — split it

---

## Pre-Completion Checklist

- [ ] Every feature folder has an `index.ts` barrel
- [ ] Barrel has a comment block explaining the public/private contract
- [ ] ESLint `no-restricted-paths` or `boundaries` rule is active
- [ ] Zero deep-path import violations (verified by grep)
- [ ] No component file exceeds 500 lines
- [ ] Major features are in route groups
- [ ] Import order is consistent across the codebase

---

## Related Skills

| Skill | Use For |
|-------|---------|
| `frontend-architecting` | General component hierarchy, state management, rendering |
| `code-cleaning` | Dead code removal, import hygiene, naming conventions |
| `consistency-checking` | Design token consistency across features |

---

## References

- [Feature-Sliced Design](https://feature-sliced.design) — architectural methodology
- [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) — boundary enforcement
- [eslint-plugin-import — no-restricted-paths](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-restricted-paths.md) — path restrictions
- [Next.js Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — URL-transparent grouping
