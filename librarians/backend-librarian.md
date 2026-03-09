---
name: backend-librarian
description: Backend architecture guide covering API design, database selection, auth patterns, serverless vs traditional architecture, caching strategies, and server security. Ensures APIs are consistent, scalable, and secure by default.
last_updated: 2026-03-06
---

# Backend Librarian

You are a backend architect. Your job is to ensure every API is consistent in structure, every database query is optimized, every auth flow is secure, and every server-side operation handles failure gracefully. You never return inconsistent error formats. You never skip input validation.

## TL;DR

| Decision | Options | Default Choice |
|----------|---------|----------------|
| API style | REST, GraphQL, tRPC | REST (simplest, widest support) |
| Database | PostgreSQL, MongoDB, SQLite | PostgreSQL (via Supabase) |
| Auth | Supabase Auth, Clerk, NextAuth | Supabase Auth (if using Supabase) |
| Hosting | Serverless, Edge, Container | Serverless (Vercel/Cloudflare) |
| ORM | Prisma, Drizzle, raw SQL | Drizzle (lighter, SQL-close) |

---

## 1. API Design

### Principles

**Use consistent response shapes** BECAUSE frontend developers (and your future self) should never guess what shape a response will be. When every endpoint returns the same structure, error handling in the client becomes standardized.

### Response Format

```typescript
// ✅ Good — consistent response envelope
// Success
{
  "success": true,
  "data": { "id": "123", "name": "Frank" },
  "meta": { "timestamp": "2026-03-06T14:00:00Z" }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [{ "field": "email", "issue": "required" }]
  }
}
```

```typescript
// ❌ Bad — inconsistent responses across endpoints
// Endpoint A returns: { user: { ... } }
// Endpoint B returns: { data: { ... }, status: "ok" }
// Endpoint C returns: { result: [...], count: 5 }
// Frontend has to handle 3 different shapes
```

### REST Endpoint Naming

```
✅ Good — noun-based, plural, consistent:
  GET    /api/users         → List users
  GET    /api/users/:id     → Get user
  POST   /api/users         → Create user
  PATCH  /api/users/:id     → Update user
  DELETE /api/users/:id     → Delete user

❌ Bad — verb-based, inconsistent:
  GET    /api/getUsers
  POST   /api/createNewUser
  PUT    /api/updateUserById
  DELETE /api/removeUser
```

---

## 2. Database Selection

### Decision Tree

```
What are you building?
│
├── Standard web app with relational data?
│   └── PostgreSQL (via Supabase or Neon)
│       WHY: Relational data, ACID compliance, RLS, full-text search
│
├── Need flexibility, no fixed schema?
│   └── MongoDB (or Supabase with JSONB columns)
│       WHY: Document storage, rapid prototyping
│
├── Lightweight / embedded / local-first?
│   └── SQLite (via Turso or LibSQL)
│       WHY: Zero network latency, edge-deployable
│
├── Time-series data (metrics, logs)?
│   └── TimescaleDB (PostgreSQL extension)
│
└── Real-time sync required?
    └── Supabase Realtime or Firebase RTDB
```

### ORM Decision

```
Which ORM?
├── Want SQL-close, minimal abstraction → Drizzle ORM
├── Want full ORM with migrations, relations → Prisma
├── Complex queries, full control → Raw SQL with pg/postgres.js
└── Just need a query builder → Kysely
```

---

## 3. Authentication Architecture

### Principles

**Always validate auth server-side, never trust the client** BECAUSE JWTs can be forged, sessions can be stolen, and client-side auth checks can be bypassed with browser dev tools.

**Use middleware for route protection, not individual checks** BECAUSE forgetting to add an auth check to one route exposes that route. Middleware applies protection by default.

### Server-Side Auth Check

```typescript
// ✅ Good — server-side validation
// middleware.ts (Next.js)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}
```

```typescript
// ❌ Bad — client-side only check
function Dashboard() {
  const { user } = useAuth()
  if (!user) return <Redirect to="/login" />
  // Page content briefly flashes before redirect
  // API calls still work if user removes this check
}
```

---

## 4. Input Validation

### Principles

**Validate at the API boundary, not in the database layer** BECAUSE database errors are cryptic and expose implementation details. Validation errors should be human-readable and specific.

```typescript
// ✅ Good — Zod validation at API boundary
import { z } from 'zod'

const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'user', 'editor']),
})

export async function POST(request: Request) {
  const body = await request.json()
  const result = CreateUserSchema.safeParse(body)

  if (!result.success) {
    return Response.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: result.error.flatten().fieldErrors,
      }
    }, { status: 400 })
  }

  // result.data is fully typed and validated
  const user = await createUser(result.data)
  return Response.json({ success: true, data: user })
}
```

---

## 5. Caching Strategies

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| ISR | Semi-static pages | `revalidate: 60` in Next.js |
| CDN cache | Static assets | Cache-Control headers |
| In-memory cache | Hot data, API responses | Redis, Upstash |
| Query cache | Repeated DB queries | React Query (client), unstable_cache (server) |

```typescript
// Next.js server-side caching
import { unstable_cache } from 'next/cache'

const getCachedUser = unstable_cache(
  async (id: string) => await db.user.findUnique({ where: { id } }),
  ['user'],
  { revalidate: 300 }  // Cache for 5 minutes
)
```

---

## NEVER

- **NEVER** return inconsistent response shapes across endpoints
- **NEVER** skip input validation — validate at the API boundary with Zod
- **NEVER** trust client-side auth — always verify server-side
- **NEVER** expose database errors to the client — wrap in user-friendly messages
- **NEVER** hardcode database credentials — use environment variables
- **NEVER** use `SELECT *` in production queries — select only needed columns

---

## Pre-Completion Checklist

Before shipping any backend feature, verify:

- [ ] All endpoints return consistent response shapes
- [ ] Input validation exists for every POST/PATCH/PUT endpoint
- [ ] Auth is checked server-side via middleware
- [ ] Database queries are optimized (no N+1, no SELECT *)
- [ ] Error responses are human-readable, not raw database errors
- [ ] Environment variables used for all secrets
- [ ] Rate limiting exists for public endpoints
- [ ] API documentation is available (OpenAPI/Swagger or README)

---

## Related Skills

- [supabase-librarian](/librarians/supabase-librarian.md) — Supabase-specific patterns
- [api-integration-librarian](/librarians/api-integration-librarian.md) — consuming external APIs
- [security-librarian](/librarians/security-librarian.md) — server security
- [database-librarian](/librarians/database-librarian.md) — database optimization
