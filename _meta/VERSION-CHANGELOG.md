# Version Changelog: 2024 → 2025/2026

**Last Updated:** January 26, 2026

What changed in the stack from 2024 to 2025/2026, and why it matters for AI-assisted development.

---

## Why This Matters

When AI models use outdated patterns, they write code that:
- Uses deprecated APIs
- Misses performance improvements
- Requires refactoring later
- Teaches wrong patterns

This changelog ensures AI agents understand **why** these versions matter.

---

## Core Framework Changes

### Next.js 14 → 15

**What Changed:**
- Turbopack became stable (faster dev server)
- `useFormState` → `useActionState` (renamed)
- Improved caching behavior (more predictable)
- Better error messages in development
- Partial Prerendering improvements
- Enhanced Server Actions

**Why It Matters:**
- **Performance:** Dev server 76% faster with Turbopack
- **DX:** Better error messages reduce debugging time
- **Stability:** APIs finalized, less experimental flags
- **AI Impact:** Models trained on Next.js 14 may use old hook names

**Migration Notes:**
```diff
- import { useFormState } from 'react-dom'
+ import { useActionState } from 'react'

- experimental: { serverActions: true }
+ (no longer needed - stable by default)
```

**When to Still Use Next.js 14:**
- Existing projects not ready to migrate
- Dependencies incompatible with 15
- **Note:** Security updates continue through mid-2025

**References:**
- [Next.js 16.1.1 Release Notes](https://nextjs.org/blog/next-15)

---

### React 18 → 19

**What Changed:**
- Actions (form handling)
- `use()` hook (async data fetching)
- Document metadata (no more `<Head>`)
- Improved `useOptimistic`
- Better hydration errors
- Ref as prop (no more `forwardRef`)

**Why It Matters:**
- **Simpler code:** No more `forwardRef` boilerplate
- **Better forms:** Actions replace manual form state
- **Cleaner async:** `use()` hook simplifies data fetching
- **AI Impact:** Models may still suggest `forwardRef` and old patterns

**Migration Notes:**
```diff
- const Component = forwardRef((props, ref) => {
-   return <div ref={ref} />
- })
+ function Component({ ref }) {
+   return <div ref={ref} />
+ }

- <Head><title>Page</title></Head>
+ export const metadata = { title: 'Page' }
```

**When to Still Use React 18:**
- Libraries not yet React 19 compatible
- Next.js 14 projects (React 18 is default)

**References:**
- [React 19 Release](https://react.dev/blog/2024/12/05/react-19)

---

### Node.js 20 → 22 LTS

**What Changed:**
- V8 12.4 (faster JavaScript execution)
- Better ESM support
- `require()` for ES modules (experimental)
- Improved watch mode
- Better test runner

**Why It Matters:**
- **Performance:** 10-15% faster execution
- **DX:** Native test runner reduces dependencies
- **Future-proof:** LTS through April 2027
- **AI Impact:** CI configs may still use `node-version: 20`

**Migration Notes:**
```diff
# .github/workflows/ci.yml
- node-version: '20'
+ node-version: '22'
```

**When to Still Use Node.js 20:**
- Enterprise environments with approval processes
- Dependencies incompatible with Node 22
- **Note:** Node 20 LTS through April 2026

**References:**
- [Node.js 22 Release](https://nodejs.org/en/blog/announcements/v22-release-announce)

---

### TypeScript 5.3 → 5.6+

**What Changed:**
- Iterator helpers
- Better type narrowing
- Improved error messages
- Faster compiler (10-20%)
- Better support for decorators

**Why It Matters:**
- **Speed:** Faster type checking in large projects
- **DX:** Clearer error messages
- **Features:** Iterator helpers reduce lodash usage

**Migration Notes:**
- Generally seamless (minor version updates)
- Check `tsconfig.json` target if using new features

---

## Styling & UI

### Tailwind 3 → 4

**What Changed:**
- New engine (Oxide - Rust-based)
- Better performance (5x faster)
- Native CSS variables
- Container queries built-in
- Simplified config

**Why It Matters:**
- **Performance:** Much faster builds
- **Features:** Native container queries (no plugin)
- **DX:** Less configuration needed
- **AI Impact:** Config syntax changed

**Migration Notes:**
```diff
# tailwind.config.js
- module.exports = {
-   content: ['./src/**/*.{js,ts,jsx,tsx}'],
- }
+ export default {
+   content: ['./src/**/*.{js,ts,jsx,tsx}'],
+ }
```

**When to Still Use Tailwind 3:**
- Plugins not yet compatible with v4
- Large existing projects

**References:**
- [Tailwind CSS 4.0 Alpha](https://tailwindcss.com/blog/tailwindcss-v4-alpha)

---

## Animation

### framer-motion → motion

**What Changed:**
- Package renamed to `motion`
- Import path: `motion/react` (was `framer-motion`)
- Smaller bundle size
- Better tree-shaking

**Why It Matters:**
- **Performance:** 30% smaller bundle
- **Future:** Old package will be deprecated
- **AI Impact:** Models trained on old package name will suggest wrong imports

**Migration Notes:**
```diff
- import { motion } from 'framer-motion'
+ import { motion } from 'motion/react'

- npm install framer-motion
+ npm install motion
```

**When to Still Use framer-motion:**
- Existing projects not ready to migrate
- **Note:** Both packages work, but `motion` is the future

**References:**
- [Motion.dev](https://motion.dev)
- Package renamed in 2024

---

## State Management

### No Major Version Changes

**What's Current:**
- **Zustand:** Still 4.x (stable, no changes needed)
- **TanStack Query:** v5 (from React Query v4)
  - Changed: Import from `@tanstack/react-query` (was `react-query`)
  - Better TypeScript support
  - Improved DevTools

**Migration Notes:**
```diff
- import { useQuery } from 'react-query'
+ import { useQuery } from '@tanstack/react-query'
```

---

## Database & Backend

### Prisma 4 → 5

**What Changed:**
- Better performance (query engine rewrite)
- JSON protocol (faster client)
- TypedSQL (type-safe raw queries)
- Better error messages

**Why It Matters:**
- **Performance:** 30-50% faster queries
- **Safety:** TypedSQL prevents SQL injection
- **DX:** Better error messages

**Migration Notes:**
- Generally seamless (prisma migrate dev handles it)
- Check breaking changes in Prisma 5 docs if migrating

---

## Deployment & Cloud

### Vercel Platform Updates (2024-2025)

**What Changed:**
- Better Edge Functions
- Improved caching
- Firewall features
- Enhanced analytics

**Why It Matters:**
- Better security out of the box
- Improved performance monitoring
- Edge Functions more reliable

**No breaking changes** - gradual platform improvements

---

## Testing

### Vitest & Playwright (No Major Version Changes)

**What's Current:**
- **Vitest:** 2.x (stable)
- **Playwright:** 1.x (stable)

**Best Practices Updated:**
- Component testing with Vitest (improved)
- Better Playwright fixtures
- MSW 2.0 for API mocking

---

## AI & LLM

### Vercel AI SDK 2 → 3

**What Changed:**
- Better streaming
- Improved tool calling
- Multi-modal support
- Better error handling

**Why It Matters:**
- **Features:** Native multi-modal support
- **DX:** Simpler API for tool calling
- **Reliability:** Better error recovery

**Migration Notes:**
```typescript
// v3 has simpler streaming API
import { streamText } from 'ai'

const result = await streamText({
  model: openai('gpt-4'),
  prompt: 'Hello',
})
```

---

## Package Manager

### pnpm 8 → 9

**What Changed:**
- Faster installs
- Better workspace support
- Improved peer dependency resolution

**Why It Matters:**
- **Speed:** 20% faster installs
- **Monorepos:** Better workspace handling

**Migration Notes:**
- Update `packageManager` in package.json:
```diff
- "packageManager": "pnpm@8.15.0"
+ "packageManager": "pnpm@9.0.0"
```

---

## Build Tools

### Turborepo 1 → 2

**What Changed:**
- Better caching
- Improved task scheduling
- Better remote cache
- Simplified config

**Why It Matters:**
- **Performance:** Faster monorepo builds
- **DX:** Simpler turbo.json

**Migration Notes:**
```diff
# turbo.json
{
-  "pipeline": { ... }
+  "tasks": { ... }
}
```

---

## Authentication

### Clerk (No Major Version Change)

**What's New (2024-2025):**
- Better organization support
- Improved mobile SDKs
- Enhanced security features
- SAML improvements

**No breaking changes** - gradual feature additions

---

## What Stayed the Same

These tools didn't have major version changes:
- **shadcn/ui** - Still component-based (no versions)
- **Lucide icons** - Stable
- **Radix UI** - Stable v1
- **GSAP** - Still 3.12+ (stable)
- **Three.js / R3F** - Incremental updates
- **Stripe SDK** - API versioning (not package versions)

---

## Summary: What AI Models Might Get Wrong

| Pattern | 2024 (Outdated) | 2025/2026 (Current) |
|---------|-----------------|---------------------|
| **Next.js version** | "Next.js 14" | "Next.js 16.1.1  |
| **Node in CI** | `node-version: '20'` | `node-version: '22'` |
| **React hook** | `useFormState` | `useActionState` |
| **Motion import** | `from 'framer-motion'` | `from 'motion/react'` |
| **TanStack Query** | `from 'react-query'` | `from '@tanstack/react-query'` |
| **Ref handling** | `forwardRef` | `ref` as prop |
| **Turbo config** | `pipeline` key | `tasks` key |
| **Tailwind config** | `module.exports` | `export default` |

---

## How to Use This Changelog

### For AI Prompting
Include time context:
```
"Using 2025/2026 best practices with Next.js 16.1.1 and React 19..."
```

### For Code Review
Check for outdated patterns:
- Search codebase for "framer-motion" → should be "motion/react"
- Search CI configs for "node-version: 20" → should be 22
- Check for `useFormState` → should be `useActionState`

### For New Projects
Use current versions:
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "motion": "^11.0.0"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

---

## When to Deviate

**It's OK to use older versions if:**
- Migrating a large existing project (incremental updates)
- Critical dependency incompatible with latest
- Enterprise approval process requires older LTS
- Testing compatibility before full migration

**Document it:**
```typescript
// TECH DEBT: Using Next.js 14 until @acme/legacy-package supports 15
// Tracking: https://github.com/acme/legacy-package/issues/123
```

---

## Version Support Timeline

| Technology | Current | Previous | Previous EOL |
|------------|---------|----------|--------------|
| Next.js | 15 | 14 | Mid-2025 (security only) |
| React | 19 | 18 | Ongoing (community) |
| Node.js | 22 LTS | 20 LTS | April 2026 |
| TypeScript | 5.6+ | 5.3-5.5 | N/A (community) |
| Tailwind | 4 | 3 | Ongoing |

---

## Resources

**Official Changelogs:**
- Next.js: https://nextjs.org/blog
- React: https://react.dev/blog
- Node.js: https://nodejs.org/en/blog
- TypeScript: https://devblogs.microsoft.com/typescript
- Tailwind: https://tailwindcss.com/blog

**Migration Guides:**
- Next.js 16.1.1  https://nextjs.org/docs/upgrading
- React 19: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- Motion: https://motion.dev/docs/migrate-from-framer-motion

**This Skills Library:**
- See `_meta/TIME-AWARENESS.md` for version table
- See this changelog for context on "why these versions"
