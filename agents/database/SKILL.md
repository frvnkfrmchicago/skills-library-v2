---
name: database-agent
description: Database setup and patterns. Prisma + Supabase/Neon. For vibe coders - just make it work.
owner: Frank
last_updated: 2026-03
---

# Database Agent

Store your data. Keep it simple.

## TL;DR - Just Use This

**For most projects:**
```
Prisma (the translator) + Supabase (the database)
```

That's it. Don't overthink it.

---

## Context Questions (Ask Before Recommending)

Before suggesting database patterns:

1. **What's the data shape?** (relational, document, graph, key-value)
2. **What's the scale?** (prototype, production, high-traffic)
3. **Real-time needed?** (live updates, subscriptions)
4. **Who manages it?** (self or hosted/managed)
5. **What's the budget?** (free tier OK, enterprise features needed)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Simple Prisma ←→ Raw SQL / complex queries |
| **Hosting** | Managed (Supabase) ←→ Self-hosted |
| **Scale** | Prototype ←→ Production ←→ Enterprise |
| **Type** | Relational (PostgreSQL) ←→ NoSQL (MongoDB) |
| **Features** | Just storage ←→ Auth + Storage + Realtime |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Prototype + beginner | Supabase (easy dashboard, free tier) |
| Just need DB, no extras | Neon (serverless PostgreSQL) |
| Need realtime updates | Supabase (built-in realtime) |
| Document/flexible schema | MongoDB Atlas + Prisma |
| High scale, MySQL | PlanetScale |
| Already on Railway | Railway PostgreSQL |

---

## Plain English: What's What

```
YOUR APP
    ↓ talks to
PRISMA (translator - turns your code into database language)
    ↓ talks to
DATABASE (where data actually lives)
    ↓ hosted on
PLATFORM (Supabase, Neon, Railway, etc.)
```

**Prisma** = How your code talks to the database
**Supabase/Neon** = Where your database lives (they host it)
**PostgreSQL** = Type of database (most common, most flexible)

---

## Quick Setup (Copy This)

### 1. Install

```bash
pnpm add @prisma/client
pnpm add -D prisma
npx prisma init
```

### 2. Get a Database URL

**Option A: Supabase (recommended for beginners)**
1. Go to supabase.com
2. Create project
3. Go to Settings → Database → Connection string
4. Copy the URL

**Option B: Neon (good free tier)**
1. Go to neon.tech
2. Create project
3. Copy connection string

### 3. Add to .env

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### 4. Define Your Data

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Your data models (like spreadsheet tables)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]   // User has many posts
  createdAt DateTime @default(now())
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
```

### 5. Push to Database

```bash
npx prisma db push
```

### 6. Use It

```tsx
// lib/db.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

```tsx
// In your code
import { db } from "@/lib/db"

// Create
const user = await db.user.create({
  data: { email: "test@example.com", name: "Test" }
})

// Read
const users = await db.user.findMany()
const user = await db.user.findUnique({ where: { email: "test@example.com" } })

// Update
await db.user.update({
  where: { id: "..." },
  data: { name: "New Name" }
})

// Delete
await db.user.delete({ where: { id: "..." } })
```

---

## Common Patterns

### User with Clerk

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique  // From Clerk
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

```tsx
// Sync Clerk user to database
import { currentUser } from "@clerk/nextjs/server"

async function getOrCreateUser() {
  const clerkUser = await currentUser()
  if (!clerkUser) throw new Error("Not authenticated")
  
  return db.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { email: clerkUser.emailAddresses[0].emailAddress },
    create: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: clerkUser.firstName,
    },
  })
}
```

### Relationships

```prisma
// One to Many: User has many Posts
model User {
  id    String @id
  posts Post[]
}

model Post {
  id       String @id
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}

// Many to Many: Posts have many Tags
model Post {
  id   String @id
  tags Tag[]
}

model Tag {
  id    String @id
  posts Post[]
}
```

---

## MySQL / MariaDB Support

### When to Use MySQL vs PostgreSQL

| Use Case | Choose |
|----------|--------|
| General web apps | Either works |
| JSON operations | PostgreSQL (better JSONB) |
| High read performance | MySQL (InnoDB) |
| Full-text search | PostgreSQL (built-in) |
| Replication at scale | MySQL (PlanetScale, Vitess) |
| Legacy system migration | MySQL (more common in enterprises) |
| Vector/AI workloads | PostgreSQL (pgvector) |

### MySQL Connection String

```env
# MySQL
DATABASE_URL="mysql://user:password@host:3306/dbname"

# MariaDB (same format)
DATABASE_URL="mysql://user:password@host:3306/dbname"

# PlanetScale (serverless MySQL)
DATABASE_URL="mysql://user:password@aws.connect.psdb.cloud/dbname?sslaccept=strict"
```

### Prisma with MySQL

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"  // Change from "postgresql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"  // Required for PlanetScale
}

model User {
  id        Int      @id @default(autoincrement())  // MySQL uses Int, not cuid()
  email     String   @unique @db.VarChar(255)
  name      String?  @db.VarChar(100)
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(255)
  content   String?  @db.Text
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  
  @@index([authorId])  // Add indexes explicitly in MySQL
}
```

### MySQL-Specific Notes

```markdown
Key Differences from PostgreSQL:
- Use `@default(autoincrement())` instead of `@default(cuid())`
- Add `@db.VarChar(n)` for string lengths
- Use `@db.Text` for long content
- Add `@@index([field])` explicitly (no auto-indexing)
- Use `relationMode = "prisma"` for PlanetScale (no foreign keys)
```

### PlanetScale Setup

1. Create account at [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string from "Connect" button
4. Add to `.env`
5. Run `npx prisma db push`

---

## Decision Tree

```
Need a database?
│
├── Simple app, starting out → Supabase (easy dashboard, free tier)
├── Need more control → Neon (just PostgreSQL, nothing extra)
├── Already using Railway → Railway PostgreSQL
├── Want realtime updates → Supabase (has built-in realtime)
├── MongoDB required → Use MongoDB Atlas + Prisma
├── MySQL / high scale needed → PlanetScale (serverless MySQL)
└── Enterprise MySQL migration → Use MySQL with Prisma
```

---

## Commands to Remember

```bash
# After changing schema.prisma
npx prisma db push      # Push changes to database

# See your data visually
npx prisma studio       # Opens a GUI

# Generate client after schema changes
npx prisma generate

# Full reset (deletes all data!)
npx prisma db push --force-reset
```

---

## Don't Overthink It

- **Prisma + Supabase** covers 90% of use cases
- You don't need to understand SQL
- Prisma writes the database queries for you
- Supabase hosts it for free (to start)
- Scale later if needed

---

## Official Resources

### Links
- **Prisma Docs:** https://prisma.io/docs
- **Prisma Schema Reference:** https://prisma.io/docs/reference/api-reference/prisma-schema-reference
- **Supabase Docs:** https://supabase.com/docs
- **Neon Docs:** https://neon.tech/docs

### What's New (2025)
- Prisma Accelerate (connection pooling)
- Better edge runtime support
- Improved TypeScript inference
- Supabase branching (database per branch)

### When to Use What
| Platform | Best For |
|----------|----------|
| Supabase | Full-featured (auth + storage + realtime + db) |
| Neon | Just PostgreSQL, serverless |
| PlanetScale | MySQL, high scale |
| Railway | Any database, simple hosting |

### Search For More
```
"prisma [feature] 2025"
"supabase [feature]"
"site:prisma.io [topic]"
```
