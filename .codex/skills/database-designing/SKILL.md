---
name: database-designing
description: >
  Enforces database architecture standards including schema design, query
  optimization, migration workflows, and data security. Covers Prisma,
  Drizzle ORM, and raw SQL patterns with technology decision trees. Use when
  designing schemas, writing migrations, optimizing queries, or choosing a
  database or ORM.
---

# Database Designing

Enforce solid data foundations: correct schemas, optimized queries, versioned
migrations, and secure data access.

---

## 1. Database Selection

### Decision Tree

```
What are you building?
│
├── Standard web app with relational data?
│   └── PostgreSQL (via Supabase or Neon)
│       WHY: ACID, RLS, full-text search, JSONB
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
├── Key-value / caching / sessions?
│   └── Redis or Upstash
│
└── Real-time sync required?
    └── Supabase Realtime or Firebase RTDB
```

### Quick Reference

| Database | Best For |
|----------|----------|
| **PostgreSQL** | Production apps, complex queries, JSON support |
| **SQLite** | Local dev, small apps, embedded |
| **MongoDB** | Document-based, flexible schema |
| **Redis** | Caching, sessions, real-time |
| **Supabase** | PostgreSQL + Auth + Realtime |
| **Neon** | Serverless PostgreSQL |

---

## 2. ORM / Query Layer Decision Tree

```
Which query layer?
│
├── Want SQL-close, minimal abstraction, type-safe
│   └── Drizzle ORM
│       Best for: New projects, developers who know SQL
│
├── Want full ORM with migrations, relations, studio
│   └── Prisma
│       Best for: Rapid prototyping, teams, visual schema management
│
├── Complex queries, full control, maximum performance
│   └── Raw SQL with pg / postgres.js
│       Best for: Performance-critical paths, complex joins
│
└── Just need a query builder
    └── Kysely
        Best for: Type-safe SQL without ORM overhead
```

---

## 3. Schema Design Rules

Apply these to EVERY table:

- Primary keys: UUIDs or `cuid()` (not auto-increment for distributed systems)
- Foreign keys MUST have indexes (`@@index([foreignKeyId])`)
- Timestamps: `createdAt` and `updatedAt` on ALL tables
- Soft delete where needed (`deletedAt DateTime?`)
- Normalize to 3NF, denormalize only for read-heavy paths
- No reserved words as column names
- Naming: `snake_case` for SQL columns, `camelCase` for ORM fields

---

## 4. Prisma Patterns

### Schema Example

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
}
```

### Common Queries

```typescript
// Find with relations
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { posts: true }
})

// Create with relation
const post = await prisma.post.create({
  data: {
    title: "Hello",
    author: { connect: { id: userId } }
  }
})

// Transaction
await prisma.$transaction([
  prisma.post.deleteMany({ where: { authorId: userId } }),
  prisma.user.delete({ where: { id: userId } })
])

// Pagination
const posts = await prisma.post.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
})
```

### Migrations

```bash
# Create migration
bunx prisma migrate dev --name add_user_role

# Apply to production
bunx prisma migrate deploy

# Reset (dev only)
bunx prisma migrate reset
```

---

## 5. Drizzle Patterns

### Schema Example

```typescript
import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').unique().notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  content: text('content'),
  published: boolean('published').default(false),
  authorId: text('author_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  authorIdx: index('author_idx').on(table.authorId),
}))
```

### Common Queries

```typescript
import { db } from './db'
import { users, posts } from './schema'
import { eq } from 'drizzle-orm'

// Select with filter
const user = await db.select().from(users).where(eq(users.id, userId))

// Insert
await db.insert(posts).values({ title: 'Hello', authorId: userId })

// Join
const result = await db
  .select()
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true))
```

---

## 6. Raw SQL Patterns

Use raw SQL for performance-critical queries or complex operations:

```typescript
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

// Parameterized query (NEVER interpolate user input)
const users = await sql`
  SELECT id, name, email
  FROM users
  WHERE email = ${email}
  LIMIT 1
`

// Explain for optimization
const plan = await sql`EXPLAIN ANALYZE SELECT * FROM posts WHERE author_id = ${id}`
```

## ⛔ STOP GATE — Raw SQL
NEVER use string interpolation in SQL queries. Always use parameterized queries.
Run: `grep -rn "SELECT.*\${" --include="*.ts" src/`
Any non-parameterized query = 🔴 CRITICAL SQL injection risk.

---

## 7. Query Optimization

| Issue | Fix |
|-------|-----|
| N+1 queries | Use `include` (Prisma) or `leftJoin` (Drizzle) |
| Missing indexes | Add `@@index` on foreign keys and frequent WHERE columns |
| SELECT * | Use `select` to pick only needed fields |
| No pagination | Always `take`/`LIMIT` results |
| Unneeded joins | Only include/join what you actually use |

### Debugging

```sql
EXPLAIN ANALYZE SELECT * FROM posts WHERE author_id = '123';
```

---

## NEVER

- **NEVER** use `SELECT *` in production — select only needed columns
- **NEVER** skip indexes on foreign keys
- **NEVER** use string interpolation in SQL — always parameterize
- **NEVER** make schema changes without a migration file
- **NEVER** use auto-increment IDs in distributed systems — use UUIDs/cuid
- **NEVER** store timestamps without timezone info

---

## Pre-Completion Checklist

- [ ] Schema follows naming conventions (snake_case SQL, camelCase ORM)
- [ ] All tables have `createdAt` and `updatedAt`
- [ ] Foreign keys have indexes
- [ ] No N+1 queries (verified with query logging)
- [ ] All schema changes are in migration files
- [ ] No raw SQL with string interpolation
- [ ] Pagination on all list queries
