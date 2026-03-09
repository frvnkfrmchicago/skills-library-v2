# Stack Discovery

Answer questions → Get suggestions → Build with what fits.

No defaults. Full flexibility. You decide.

---

## How This Works

```
1. Answer the discovery questions below
2. Get category suggestions based on your answers
3. Pick from the full inventory (TOOLS_INVENTORY.md)
4. Mix and match - nothing is locked
```

---

## Discovery Questions

### Q1: What are you building?

| Answer | Suggests |
|--------|----------|
| Full-stack app with complex UI | Framework: Next.js, Remix, or Nuxt |
| Content site (blog, docs, marketing) | Framework: Astro, or static Next.js |
| Single-page tool/app | Framework: Vite + React, or SvelteKit |
| Mobile app (iOS/Android) | Framework: Expo (React Native) or Flutter |
| API/Backend only | Runtime: Hono, Express, or Fastify |
| Desktop app | Framework: Electron or Tauri |

### Q2: Who's your audience?

| Answer | Consider |
|--------|----------|
| Gen Z / younger users | Dark mode, animations, mobile-first |
| Enterprise / B2B | Accessibility, stability, long-term support |
| Developers | Performance, clean APIs, good docs |
| General consumers | Cross-browser, fast load, intuitive |

### Q3: What's your timeline?

| Answer | Suggests |
|--------|----------|
| Ship in days | Use hosted services (Clerk, Supabase, Vercel) |
| Ship in weeks | Can self-host some pieces |
| Long-term project | Evaluate build vs. buy for each piece |

### Q4: What's your budget?

| Answer | Suggests |
|--------|----------|
| $0 (free tiers only) | Vercel, Supabase, Clerk, Resend all have free tiers |
| $50-200/mo | Can upgrade individual services as needed |
| $500+/mo | Consider dedicated infrastructure, self-hosting |

### Q5: What features do you need?

Check all that apply, then find the category in the inventory:

| Feature | Category in Inventory |
|---------|----------------------|
| User accounts & login | Authentication |
| Payments / subscriptions | Payment Processing |
| Database / data storage | Database & ORM |
| File uploads / media | Asset Optimization, Storage |
| Real-time updates | Database (Supabase), or WebSockets |
| AI / LLM features | AI & Coding Agents |
| Complex animations | Animation Libraries |
| 3D graphics | 3D & Graphics |
| Charts / data viz | Data Visualization |
| Email sending | See app-cost/SKILL.md for options |
| Mobile app | Mobile Development |

---

## What These Tools Actually Are (Plain English)

### Frameworks - The Foundation

| Tool | What It Is | Why It Exists |
|------|-----------|---------------|
| **Next.js** | React + server rendering + routing | Most popular full-stack React option in 2025 |
| **Astro** | Ships zero JS by default, fast content sites | For when you don't need React's complexity |
| **Vite** | Super fast build tool | Makes development faster than webpack |
| **Remix** | React with better data loading patterns | Alternative to Next.js, simpler mental model |
| **SvelteKit** | Svelte's full-stack framework | Less code than React, growing in 2025 |
| **Nuxt** | Vue's equivalent of Next.js | If you prefer Vue over React |

### Runtimes - What Runs Your Code

| Tool | What It Is | Why It Matters |
|------|-----------|----------------|
| **Node** | JavaScript on servers | The standard, most compatible |
| **Bun** | Faster Node alternative | 2-3x faster, but newer |
| **Deno** | Secure Node alternative | TypeScript native, but different ecosystem |

### Database Tools - Where Data Lives

| Tool | What It Is | When To Use |
|------|-----------|-------------|
| **Prisma** | Writes database queries for you | Most popular ORM, great TypeScript |
| **Drizzle** | Lighter Prisma alternative | When you want more SQL control |
| **Supabase** | Postgres + Auth + Realtime + Storage | All-in-one, fast to start |
| **Neon** | Serverless Postgres | Just database, scales to zero |
| **PlanetScale** | Serverless MySQL | If you need MySQL |

### Authentication - User Login

| Tool | What It Is | When To Use |
|------|-----------|-------------|
| **Clerk** | Auth with UI components | Fastest setup, best DX |
| **NextAuth** | Auth.js, more control | Self-hosted, flexible |
| **Supabase Auth** | Built into Supabase | If already using Supabase |
| **Lucia** | Lightweight, full control | When you want to own everything |

### Animation - Making Things Move

| Tool | What It Is | When To Use |
|------|-----------|-------------|
| **GSAP** | Professional-grade animation | Complex timelines, scroll effects |
| **Motion (Framer)** | React-native animation | Component animations, gestures |
| **react-spring** | Physics-based animation | Natural-feeling motion |
| **Lottie** | After Effects → web | Designer-made animations |
| **Rive** | Interactive animations | State machines, games |
| **CSS/Tailwind** | Built-in browser animation | Simple transitions |

### Styling - How It Looks

| Tool | What It Is | When To Use |
|------|-----------|-------------|
| **Tailwind** | Utility CSS classes | Fast iteration, consistent |
| **shadcn/ui** | Copy-paste components | Pre-built, customizable |
| **Radix** | Unstyled accessible components | Build your own design system |
| **Chakra** | Styled component library | Quick prototypes |

---

## 2025-2026: What's Hot & Why

### Trending Up

| Trend | What's Happening | Why It Matters |
|-------|------------------|----------------|
| **Edge computing** | Code runs closer to users | Faster, cheaper |
| **AI-native apps** | Built around LLMs | New product categories |
| **React Server Components** | Server + client hybrid | Better performance |
| **Bun adoption** | Faster everything | Dev experience improvement |
| **Supabase growth** | Firebase alternative | Open source, Postgres-based |
| **Astro for content** | Minimal JS, fast sites | SEO, performance |

### Still Solid

| Tool | Status | Notes |
|------|--------|-------|
| **Next.js** | Dominant | Still the default for most |
| **Tailwind** | Standard | Most used CSS approach |
| **TypeScript** | Required | Not optional in 2025 |
| **Vercel** | Leading | Best Next.js host |
| **Prisma** | Standard | ORM of choice |

### Watch These

| Tool | Why Watching |
|------|--------------|
| **Drizzle** | Lighter than Prisma, gaining traction |
| **SvelteKit** | Simpler than React, growing |
| **Hono** | Edge-first, very fast |
| **Turso** | SQLite at the edge |

---

## The Process

```
1. Answer discovery questions above
2. Note which categories you need
3. Open TOOLS_INVENTORY.md
4. Pick tools from those categories
5. Start building - swap anything that doesn't work
```

**Nothing is permanent. You can change any tool at any point.**

---

## Quick Reference

→ Full tool list: `TOOLS_INVENTORY.md`
→ Cost details: `../workflows/app-cost/SKILL.md`
→ Specific tool deep-dives: `../agents/[tool]/SKILL.md`

---

## Example Flows

### "I'm building a SaaS dashboard"

```
Q1: Full-stack app → Next.js, Remix, or Nuxt
Q2: B2B → accessibility, stability
Q3: Weeks → use hosted services
Q4: Free tier → Vercel + Supabase + Clerk
Q5: Auth ✓ Database ✓ Payments ✓

Suggested stack:
- Framework: Next.js (or Remix)
- Database: Prisma + Supabase (or Neon)
- Auth: Clerk (or Supabase Auth)
- Payments: Stripe
- Styling: Tailwind + shadcn
```

### "I'm building a portfolio with animations"

```
Q1: Content site → Astro or Next.js
Q2: General → cross-browser
Q3: Days → hosted services
Q4: Free → Vercel free tier
Q5: Animations ✓

Suggested stack:
- Framework: Astro (or Next.js)
- Animation: GSAP (or Motion)
- Styling: Tailwind
- Deploy: Vercel
```

### "I'm building AI chat product"

```
Q1: Full-stack → Next.js
Q2: Developers → performance, clean API
Q3: Weeks → hosted
Q4: Usage-based → AI costs vary
Q5: AI ✓ Auth ✓ Database ✓

Suggested stack:
- Framework: Next.js
- AI: Vercel AI SDK + provider of choice
- Database: Prisma + Supabase
- Auth: Clerk
- Styling: Tailwind + shadcn
```

---

## Remember

- These are **suggestions**, not requirements
- Swap any piece that doesn't fit your needs
- The inventory has alternatives for everything
- Build fast, change later if needed
