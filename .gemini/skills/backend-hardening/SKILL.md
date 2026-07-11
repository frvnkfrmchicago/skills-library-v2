---
name: backend-hardening
description: >
  Enforces backend architecture standards including API response shapes,
  input validation, server-side auth middleware, CORS policy, rate limiting,
  database query optimization, and environment-based configuration. Includes
  a mandatory Security Gate with enforcement checks. Use when building or
  reviewing any API, server, or backend service, or before deployment.
---

# Backend Hardening

Enforce consistent, secure, and performant backend architecture on every API
and server-side service.

---

## 1. API Response Shape

Enforce a single response envelope across ALL endpoints. No exceptions.

```typescript
// ✅ REQUIRED — consistent response envelope
// Success
{ "success": true, "data": { ... }, "meta": { "timestamp": "..." } }

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

### Endpoint Naming

Use noun-based, plural, consistent REST routes:

```
GET    /api/users         → List
GET    /api/users/:id     → Get
POST   /api/users         → Create
PATCH  /api/users/:id     → Update
DELETE /api/users/:id     → Delete
```

## ⛔ STOP GATE — Response Shape
DO NOT proceed until every endpoint returns the same envelope shape.
Run: `grep -rn "Response.json\|res.json\|NextResponse.json" --include="*.ts" --include="*.tsx" src/`
Verify all results use `{ success, data|error }` format.

---

## 2. Database Selection

### Decision Tree

```
Standard web app with relational data?
  → PostgreSQL (via Supabase or Neon)

Need flexibility, no fixed schema?
  → MongoDB (or Supabase with JSONB columns)

Lightweight / embedded / local-first?
  → SQLite (via Turso or LibSQL)

Time-series data (metrics, logs)?
  → TimescaleDB (PostgreSQL extension)

Real-time sync required?
  → Supabase Realtime or Firebase RTDB
```

### ORM Decision Tree

```
Want SQL-close, minimal abstraction → Drizzle ORM
Want full ORM with migrations, relations → Prisma
Complex queries, full control → Raw SQL with pg/postgres.js
Just need a query builder → Kysely
```

---

## 3. Authentication Architecture

**Always validate auth server-side. Never trust the client.**

Use middleware for route protection — not individual per-route checks.

```typescript
// ✅ REQUIRED — server-side middleware auth
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

## ⛔ STOP GATE — Auth
DO NOT mark auth as complete without:
1. Running: `grep -rn "Depends.*auth\|Depends.*verify\|middleware" --include="*.ts" --include="*.py" src/ backend/`
2. Proving every protected route has server-side auth
3. Confirming no client-only auth checks exist

---

## 4. Input Validation

**Validate at the API boundary with Zod. Not in the database layer.**

```typescript
// ✅ REQUIRED pattern
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

  const user = await createUser(result.data)
  return Response.json({ success: true, data: user })
}
```

## ⛔ STOP GATE — Validation
Run: `grep -rn "safeParse\|z\.object\|z\.string\|z\.enum" --include="*.ts" src/`
Every POST/PATCH/PUT endpoint MUST have a Zod schema. List any without one.

---

## 5. Caching Strategies

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| ISR | Semi-static pages | `revalidate: 60` in Next.js |
| CDN cache | Static assets | Cache-Control headers |
| In-memory cache | Hot data, API responses | Redis, Upstash |
| Query cache | Repeated DB queries | React Query (client), unstable_cache (server) |

---

## 6. Security Gate

> This section is MANDATORY for every backend review.

### CORS Check
Run: `grep -rn "allow_origins\|CORSMiddleware\|Access-Control" --include="*.ts" --include="*.py" src/ backend/`
If origins are hardcoded strings (not read from env var), flag as 🔴 CRITICAL.
If `*` is used in production, flag as 🔴 CRITICAL.

### Rate Limiting Check
Run: `grep -rn "rateLimit\|rate-limit\|throttle\|429" --include="*.ts" src/`
If NO rate limiting exists on public endpoints, flag as 🔴 CRITICAL.

### Secrets Check
Run: `grep -rn "sk_live\|pk_live\|apiKey=\|secret=\|password=" --include="*.ts" --include="*.tsx" --include="*.js" src/`
If ANY secrets found in source code, flag as 🔴 CRITICAL.
Secrets MUST be in environment variables accessed via `process.env`.

### Environment Variables Check
Run: `cat .env.example` (must exist)
Run: `git ls-files | grep -E "\.env$|\.env\.local$"`
If `.env` or `.env.local` is tracked in git, flag as 🔴 CRITICAL.

## ⛔ STOP GATE — Security Gate
DO NOT mark this review as passed without:
1. Running ALL four scan commands above
2. Showing the grep output as evidence
3. Listing every finding with severity (🔴 CRITICAL / 🟡 WARNING)
4. Confirming zero CRITICAL findings remain

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

- [ ] All endpoints return consistent `{ success, data|error }` shape
- [ ] Input validation (Zod) on every POST/PATCH/PUT endpoint
- [ ] Auth checked server-side via middleware
- [ ] Database queries optimized (no N+1, no SELECT *)
- [ ] Error responses are human-readable, not raw database errors
- [ ] Environment variables used for all secrets
- [ ] Rate limiting on public endpoints
- [ ] CORS configured with env-based origins
- [ ] Security Gate passed with evidence
