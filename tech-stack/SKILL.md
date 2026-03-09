---
name: tech-stack
description: Tech stack decision helper. Use when starting a new project or evaluating architecture. Helps you understand trade-offs and pick the right tools for your specific needs.
---

# Tech Stack Decision Helper

Pick the right tools. Understand the trade-offs.

## TL;DR: Quick Stack Selector

| Building | Recommended Stack |
|----------|-------------------|
| SaaS | Next.js + Prisma + Clerk + Stripe |
| Dashboard | Next.js + Prisma + TanStack Query + Recharts |
| Landing page | Astro + Tailwind (or Next.js if needs auth) |
| Mobile app | Expo (React Native) + Clerk |
| PWA | Next.js + next-pwa |
| E-commerce | Shopify OR Next.js + Stripe |
| Blog/Content | Astro + MDX |
| API only | Hono on Cloudflare Workers |
| Real-time | Next.js + Supabase (or Pusher) |

**Tools Reference:** See `TOOLS_INVENTORY.md`

---

## Framework Decision

### Question 1: What are you building?

```
Full-stack app with complex UI?
├── YES → Next.js
└── NO → Continue...

Content-heavy site (blog, docs, marketing)?
├── YES → Astro
└── NO → Continue...

Simple SPA / Tool?
├── YES → Vite + React
└── NO → Continue...

Mobile app?
├── YES → Expo (React Native)
└── NO → Continue...

API / Backend only?
├── YES → Hono (Cloudflare) or Express
└── NO → Next.js (safe default)
```

### Framework Comparison

| Framework | Best For | Trade-offs |
|-----------|----------|------------|
| **Next.js** | Full-stack apps, SSR, SEO | Heavier, Vercel-optimized |
| **Astro** | Content sites, blogs | Limited interactivity |
| **Vite + React** | SPAs, tools | No SSR built-in |
| **Expo** | Mobile apps | React Native learning curve |
| **Hono** | APIs, edge functions | Backend only |
| **Remix** | Full-stack, forms | Smaller ecosystem |

### Next.js: When to Use

✅ **Use Next.js when:**
- Need SSR/SEO
- Building SaaS, dashboard, or full-stack app
- Want one framework for frontend + backend
- Using Vercel for deployment
- Need API routes

❌ **Don't use Next.js when:**
- Building content-only site (Astro lighter)
- Need mobile app (use Expo)
- Building simple static site (overkill)

### Astro: When to Use

✅ **Use Astro when:**
- Content-heavy site (blog, docs, marketing)
- SEO critical
- Want minimal JavaScript shipped
- Performance is top priority

❌ **Don't use Astro when:**
- Need complex interactivity
- Building app with authentication
- Need real-time features

---

## Database Decision

### Question: What data patterns do you have?

```
Relational data with complex queries?
├── YES → PostgreSQL + Prisma
└── NO → Continue...

Need real-time subscriptions?
├── YES → Supabase
└── NO → Continue...

Simple key-value or document storage?
├── YES → Cloudflare KV or D1
└── NO → Continue...

Need full-text search?
├── YES → PostgreSQL (pg_trgm) or Algolia
└── NO → PostgreSQL + Prisma (safe default)
```

### Database Comparison

| Database | Best For | Trade-offs |
|----------|----------|------------|
| **PostgreSQL + Prisma** | Most apps | Needs hosting (Neon, Supabase, Railway) |
| **Supabase** | Real-time, auth included | Vendor lock-in |
| **PlanetScale** | Serverless MySQL | MySQL not Postgres |
| **MongoDB** | Document storage | Different mental model |
| **Cloudflare D1** | Edge SQLite | Limited features |
| **Redis** | Caching, sessions | Not primary database |

### Hosting PostgreSQL

| Provider | Pros | Cons |
|----------|------|------|
| **Neon** | Serverless, branching, free tier | Newer |
| **Supabase** | Auth + realtime included | Full platform |
| **Railway** | Simple, good DX | No branching |
| **Vercel Postgres** | Vercel integration | Vercel only |

---

## Authentication Decision

### Question: What auth do you need?

```
Just social login (Google, GitHub)?
├── YES → Clerk (fastest) or NextAuth
└── NO → Continue...

Need email/password + MFA?
├── YES → Clerk
└── NO → Continue...

Want self-hosted / control?
├── YES → NextAuth or Lucia
└── NO → Continue...

Enterprise SSO (SAML, OIDC)?
├── YES → Clerk or Auth0
└── NO → Clerk (safe default)
```

### Auth Comparison

| Provider | Best For | Trade-offs |
|----------|----------|------------|
| **Clerk** | Fast setup, great DX, UI included | Paid at scale |
| **NextAuth** | Self-hosted, flexible | More setup |
| **Lucia** | Full control, lightweight | Most setup |
| **Auth0** | Enterprise features | Complex, expensive |
| **Supabase Auth** | If using Supabase | Tied to Supabase |

### Recommendation

**Default: Clerk** - Best DX, handles edge cases, UI components included.

**Use NextAuth if:** Self-hosting required, cost-sensitive at scale, need full control.

---

## Styling Decision

### Question: What's your styling preference?

```
Want utility classes?
├── YES → Tailwind + shadcn/ui
└── NO → Continue...

Want pre-built components?
├── YES → shadcn/ui (Tailwind) or Chakra
└── NO → Continue...

Need design system from scratch?
├── YES → Tailwind + custom components
└── NO → Tailwind + shadcn/ui (safe default)
```

### Styling Comparison

| Approach | Best For | Trade-offs |
|----------|----------|------------|
| **Tailwind + shadcn/ui** | Most apps | Learning curve |
| **Chakra UI** | Quick prototypes | Larger bundle |
| **Material UI** | Enterprise apps | Opinionated |
| **CSS Modules** | Component isolation | More files |
| **Styled Components** | CSS-in-JS fans | Runtime cost |

### Recommendation

**Default: Tailwind + shadcn/ui + clsx + tailwind-merge**

This combo gives you:
- Utility classes (Tailwind)
- Pre-built accessible components (shadcn)
- Conditional classes (clsx)
- Class merging (tailwind-merge)

---

## State Management Decision

### Question: What state patterns do you have?

```
Server data (API calls, caching)?
├── YES → TanStack Query
└── NO → Continue...

Complex client state?
├── YES → Zustand
└── NO → Continue...

Form state?
├── YES → react-hook-form + zod
└── NO → Continue...

Simple local state?
├── YES → useState/useReducer
└── NO → TanStack Query + Zustand (safe default)
```

### State Comparison

| Library | Best For | Trade-offs |
|---------|----------|------------|
| **TanStack Query** | Server state, caching | Learning curve |
| **Zustand** | Client state, simple API | Manual hydration |
| **Jotai** | Atomic state | Different model |
| **Redux** | Complex global state | Boilerplate |
| **Recoil** | Facebook-style | Less maintained |

### Recommendation

**Server state: TanStack Query** - Handles caching, revalidation, optimistic updates.

**Client state: Zustand** - Simple, minimal boilerplate, works with SSR.

**Forms: react-hook-form + zod** - Performance + validation.

---

## Animation Decision

See `/agents/gsap/` and `/agents/motion/` for full details.

### Quick Decision

```
Need complex timelines, scroll effects?
├── YES → GSAP + ScrollTrigger
└── NO → Continue...

Want React-native feel, gestures, layout?
├── YES → Motion (Framer Motion)
└── NO → Continue...

Simple transitions only?
├── YES → Tailwind + tailwindcss-animate
└── NO → GSAP or Motion (pick one)
```

---

## Deployment Decision

### Question: What's your deployment need?

```
Want zero-config?
├── YES → Vercel
└── NO → Continue...

Need edge computing?
├── YES → Cloudflare Workers
└── NO → Continue...

Want more control / cost savings?
├── YES → Railway or Fly.io
└── NO → Vercel (safe default)
```

### Deployment Comparison

| Platform | Best For | Trade-offs |
|----------|----------|------------|
| **Vercel** | Next.js, zero-config | Can get expensive |
| **Cloudflare** | Edge, Workers, static | Different model |
| **Railway** | Full control, any framework | More config |
| **Fly.io** | Global deployment, containers | More complex |
| **Netlify** | Static sites, simple | Less powerful |

---

## Full Stack Templates

### SaaS Template
```
Framework: Next.js 16.1.1 (App Router)
Database: PostgreSQL + Prisma
Auth: Clerk
Payments: Stripe
Styling: Tailwind + shadcn/ui
State: TanStack Query + Zustand
Deploy: Vercel
```

### Dashboard Template
```
Framework: Next.js 16.1.1
Database: PostgreSQL + Prisma
Auth: Clerk
Styling: Tailwind + shadcn/ui
State: TanStack Query
Charts: Recharts
Deploy: Vercel
```

### Mobile Template
```
Framework: Expo (React Native)
Database: Supabase
Auth: Clerk or Supabase Auth
Styling: NativeWind (Tailwind for RN)
State: TanStack Query + Zustand
Deploy: Expo EAS
```

### Landing Page Template
```
Framework: Astro
Styling: Tailwind
Animations: GSAP or Motion
Deploy: Vercel or Cloudflare
```

---

## Terms to Know

| Term | What It Means |
|------|---------------|
| SSR | Server-Side Rendering - HTML generated on server |
| SSG | Static Site Generation - HTML generated at build |
| ISR | Incremental Static Regeneration - SSG with revalidation |
| Edge | Code running close to user (Cloudflare, Vercel Edge) |
| Serverless | Functions that scale to zero |
| ORM | Object-Relational Mapping (Prisma, Drizzle) |
| RSC | React Server Components |
| Hydration | Making static HTML interactive |
