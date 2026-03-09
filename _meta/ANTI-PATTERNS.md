# Anti-Patterns (January 2026)

**Common mistakes to avoid. Costs you time and money.**

---

## What "Centralizing Anti-Patterns" Means

**Before:** Anti-patterns scattered across 50+ skill files. You'd have to read everything to know what NOT to do.

**After (this file):** All the "don't do this" patterns in ONE place. Quick reference before building.

**Use this when:**
- Starting a new project (scan this first)
- Stuck on a bug (probably hit one of these)
- Code review (check against this list)

---

## Next.js 16.1.1 (Current)

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| `getServerSideProps` | Server Components | Old API, removed in 15 |
| `getStaticProps` | `generateStaticParams` | New App Router pattern |
| `pages/` directory | `app/` directory | Pages router is legacy |
| `_app.tsx` | `app/layout.tsx` | New root layout pattern |
| `next/head` | `metadata` export | App Router metadata API |
| `next/image` without `alt` | Always add `alt` | Accessibility + SEO |

---

## React 19 (Current)

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| `useEffect` for data fetching | TanStack Query | Race conditions, cache issues |
| `useState` + `useEffect` combo | `use()` hook or Server Components | Simpler, fewer bugs |
| Prop drilling | Context or Zustand | Maintainability |
| `className` conditionals everywhere | `class-variance-authority` | Cleaner component APIs |
| Forward refs manually | `ref` as prop (React 19) | New pattern, simpler |

---

## TypeScript 5

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| `any` everywhere | Proper types or `unknown` | Defeats purpose of TypeScript |
| Type assertions without validation | Zod schema + infer | Runtime safety |
| Ignoring strict mode | Enable `strict: true` | Catches real bugs |
| `as any` to bypass errors | Fix the actual type | Technical debt |

---

## Styling (Tailwind 4)

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Inline styles | Tailwind classes | Consistency |
| `!important` everywhere | Proper specificity | Maintainability |
| Copy-pasting component styles | Extract to shared component | DRY |
| Custom CSS for everything | Use Tailwind utilities | Faster, smaller bundle |
| Tailwind 3 `@apply` | Tailwind 4 CSS functions | New syntax |

---

## Animation

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| `import from 'framer-motion'` | `import from 'motion/react'` | New package name |
| Animating without planning | Use animation-planning/SKILL.md | Saves rework |
| CSS animations for complex sequences | GSAP | More control, better performance |
| `transition` on layout properties | `transform` and `opacity` only | Performance |

---

## Database (Prisma 5)

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Raw SQL everywhere | Prisma Client | Type safety |
| Missing indexes | Add indexes to queried fields | Performance |
| N+1 queries | Use `include` or `select` | Database load |
| No connection pooling | Use connection pooling | Serverless limits |
| Migrations in production without backup | Backup first | Data loss prevention |

---

## State Management

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Redux for everything | TanStack Query (server) + Zustand (client) | Simpler |
| Global state for server data | TanStack Query | Built for it |
| `useState` for forms | React Hook Form | Validation, performance |
| Context for everything | Zustand for global, props for local | Performance |

---

## Authentication (Clerk)

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Roll your own auth | Use Clerk | Security is hard |
| Storing passwords | OAuth only | Don't handle passwords |
| Missing rate limiting | Add rate limits | Prevent abuse |
| Auth logic in frontend | Middleware + Server Actions | Security |

---

## Payments (Stripe)

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Processing payments client-side | Server-side only | Security |
| Ignoring webhooks | Use webhooks for fulfillment | Reliability |
| Hardcoded prices | Stripe Products API | Flexibility |
| Missing webhook signature verification | Always verify | Prevent fraud |
| Using old Stripe API | Use `2024-12-18.acacia` | Current stable version |

---

## Performance

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Loading all data upfront | Lazy load, pagination | Slow initial load |
| Large bundle sizes | Code splitting, dynamic imports | Slow page loads |
| Unoptimized images | `next/image` with proper sizing | Page speed |
| No caching | Add caching strategies | Server load |
| Client-side rendering everything | Server Components where possible | Performance + SEO |

---

## Deployment

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Node 20 in CI/CD | Node 22 LTS | Current LTS |
| No environment variables validation | Validate at build time | Catch issues early |
| Deploying without `npm run build` | Always build locally first | Catch errors |
| Missing error tracking | Add Sentry/PostHog | Debug production issues |

---

## Security

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Exposing API keys client-side | Server-side only, use env vars | Security |
| No input validation | Zod schemas everywhere | Prevent injection |
| Missing CORS setup | Configure CORS properly | Security |
| Trusting user input | Always sanitize | XSS prevention |
| No rate limiting | Add rate limits | DDoS prevention |

---

## Development Workflow

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Working on `main` branch | Feature branches | Safety |
| No version control | Git for everything | Recovery |
| Committing node_modules | Add to `.gitignore` | Repo size |
| Committing `.env` files | Add to `.gitignore` | Security |
| No error boundaries | Add error boundaries | UX |

---

## AI/Prompting

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Vague prompts | Specific, contextual prompts | Better output |
| Not mentioning 2025/2026 | Include date context | Avoid outdated patterns |
| One massive prompt | Break into steps | Better results |
| Ignoring AI suggestions | Review and adapt | Learn patterns |

---

## General

| ❌ Don't | ✅ Do | Why |
|---------|-------|-----|
| Premature optimization | Ship first, optimize later | Velocity |
| Over-engineering | Build what's needed | Time waste |
| Perfect code | Working code | Ship faster |
| Feature creep | MVP first | Focus |
| No backups | Backup everything | Data safety |

---

## Cost of Common Mistakes

| Mistake | Time Lost | Money Lost |
|---------|-----------|------------|
| Using outdated Next.js patterns | 4-8 hours rewriting | $0 (time) |
| No database indexes | Hours debugging slowness | Server costs |
| Client-side payments | Security breach | $$$$ |
| Missing webhook verification | Fraud | $$$$ |
| No error tracking | Days debugging | Lost users |
| Bad mobile UX | - | 60% of potential users |

---

## How to Use This File

**Before starting a project:**
1. Scan relevant sections (Next.js, React, DB you're using)
2. Set up linting/TypeScript to catch these
3. Bookmark this file

**When debugging:**
1. Check if you hit one of these
2. Fix using the "Do" column

**During code review:**
1. Check code against this list
2. Prevent before it becomes tech debt

---

**Updated:** January 2026
**Next review:** March 2026 (when versions change)
