---
name: cloudflare-pages
description: Cloudflare Pages for static and full-stack deployments. Workers, KV, D1, R2 storage.
last_updated: 2026-03
owner: Frank
---

# Cloudflare Pages

Deploy at the edge. Static sites, full-stack apps, serverless functions.

> **See also:** `agents/deployment/SKILL.md`, `agents/security/SKILL.md`

---

## Context Questions

Before deploying to Cloudflare:

1. **What's the app type?** — Static site, SSR, API, hybrid
2. **What framework?** — Next.js, Astro, SvelteKit, plain HTML
3. **What data needs?** — None, KV store, SQL (D1), object storage (R2)
4. **What's the scale?** — Hobby, startup, enterprise
5. **What existing infrastructure?** — None, AWS, Vercel migration

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Static HTML ←→ Full-stack SSR |
| **Data** | Stateless ←→ D1 + KV + R2 |
| **Compute** | Edge-only ←→ Long-running Workers |
| **Build** | Git-based ←→ Wrangler CLI |
| **Scale** | Free tier ←→ Enterprise |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Static site | Pages with build commands |
| API endpoints | Workers functions in `/functions` |
| Database needed | D1 (SQLite at edge) |
| Key-value storage | KV namespaces |
| File storage | R2 buckets |
| Next.js app | `@cloudflare/next-on-pages` adapter |
| Astro app | Cloudflare adapter built-in |

---

## TL;DR

| Need | Service |
|------|---------|
| **Static hosting** | Pages (free, unlimited bandwidth) |
| **Serverless functions** | Workers (via Pages Functions) |
| **Key-value data** | KV |
| **SQL database** | D1 |
| **Object storage** | R2 (S3-compatible) |
| **Edge caching** | Built-in CDN |

---

## Part 1: Setup

### Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### Create Pages Project

```bash
# From existing project
wrangler pages project create my-app

# Deploy directly
wrangler pages deploy ./dist
```

### Git Integration

1. Push to GitHub/GitLab
2. Connect in Cloudflare Dashboard → Pages
3. Configure build settings:
   - Build command: `npm run build`
   - Build output: `dist` or `.next` or `out`

---

## Part 2: Pages Functions (Serverless)

### File-Based Routing

```
functions/
├── api/
│   ├── hello.ts          # /api/hello
│   ├── users/
│   │   ├── index.ts      # /api/users
│   │   └── [id].ts       # /api/users/:id
│   └── [[catchall]].ts   # /api/*
└── _middleware.ts         # Runs on all requests
```

### Basic Function

```typescript
// functions/api/hello.ts
export const onRequest: PagesFunction = async (context) => {
  return new Response(JSON.stringify({ message: "Hello from the edge!" }), {
    headers: { "Content-Type": "application/json" },
  });
};
```

### With Methods

```typescript
// functions/api/users/[id].ts
export const onRequestGet: PagesFunction = async ({ params }) => {
  const userId = params.id;
  const user = await getUser(userId);
  return Response.json(user);
};

export const onRequestPut: PagesFunction = async ({ params, request }) => {
  const userId = params.id;
  const data = await request.json();
  const user = await updateUser(userId, data);
  return Response.json(user);
};

export const onRequestDelete: PagesFunction = async ({ params }) => {
  await deleteUser(params.id);
  return new Response(null, { status: 204 });
};
```

### Middleware

```typescript
// functions/_middleware.ts
export const onRequest: PagesFunction = async (context) => {
  // Add CORS headers
  const response = await context.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
};
```

---

## Part 3: KV Storage

### Create Namespace

```bash
wrangler kv:namespace create MY_KV
wrangler kv:namespace create MY_KV --preview
```

### Configure in wrangler.toml

```toml
# wrangler.toml
name = "my-app"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "MY_KV"
id = "xxxxx"
preview_id = "yyyyy"
```

### Use in Functions

```typescript
// functions/api/cache.ts
interface Env {
  MY_KV: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { MY_KV } = context.env;
  
  // Get
  const value = await MY_KV.get("my-key");
  
  // Get with metadata
  const { value: val, metadata } = await MY_KV.getWithMetadata("my-key");
  
  // Set
  await MY_KV.put("my-key", "my-value", {
    expirationTtl: 3600,  // 1 hour
    metadata: { createdAt: Date.now() },
  });
  
  // Delete
  await MY_KV.delete("my-key");
  
  // List
  const keys = await MY_KV.list({ prefix: "user:" });
  
  return Response.json({ value });
};
```

---

## Part 4: D1 Database (SQLite)

### Create Database

```bash
wrangler d1 create my-database
```

### Configure

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxx"
```

### Migrations

```bash
# Create migration
wrangler d1 migrations create my-database init

# Edit migration
# migrations/0001_init.sql
```

```sql
-- migrations/0001_init.sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

```bash
# Apply migrations
wrangler d1 migrations apply my-database
```

### Query in Functions

```typescript
// functions/api/users.ts
interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM users ORDER BY created_at DESC"
  ).all();
  
  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const { email, name } = await request.json();
  
  const result = await env.DB.prepare(
    "INSERT INTO users (email, name) VALUES (?, ?) RETURNING *"
  )
    .bind(email, name)
    .first();
  
  return Response.json(result, { status: 201 });
};

// Parameterized query
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const user = await env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  )
    .bind(params.id)
    .first();
  
  if (!user) {
    return new Response("Not found", { status: 404 });
  }
  
  return Response.json(user);
};
```

---

## Part 5: R2 Storage

### Create Bucket

```bash
wrangler r2 bucket create my-bucket
```

### Configure

```toml
# wrangler.toml
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "my-bucket"
```

### Use in Functions

```typescript
// functions/api/files/upload.ts
interface Env {
  BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  const key = `uploads/${Date.now()}-${file.name}`;
  
  await env.BUCKET.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });
  
  return Response.json({ key, url: `/api/files/${key}` });
};

// functions/api/files/[[path]].ts
export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const key = params.path;
  
  const object = await env.BUCKET.get(key);
  
  if (!object) {
    return new Response("Not found", { status: 404 });
  }
  
  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000",
    },
  });
};
```

---

## Part 6: Framework Adapters

### Next.js

```bash
npm install @cloudflare/next-on-pages
```

```javascript
// next.config.js
const { setupDevBindings } = require("@cloudflare/next-on-pages/next-dev");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your config
};

if (process.env.NODE_ENV === "development") {
  setupDevBindings({
    bindings: {
      MY_KV: { type: "kv", id: "xxx" },
      DB: { type: "d1", databaseId: "xxx" },
    },
  });
}

module.exports = nextConfig;
```

### Astro

```bash
npx astro add cloudflare
```

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    mode: "directory",
  }),
});
```

### SvelteKit

```bash
npm install @sveltejs/adapter-cloudflare
```

```javascript
// svelte.config.js
import adapter from "@sveltejs/adapter-cloudflare";

export default {
  kit: {
    adapter: adapter(),
  },
};
```

---

## Part 7: Environment Variables

### Set Secrets

```bash
# Production
wrangler pages secret put API_KEY
wrangler pages secret put DATABASE_URL

# List secrets
wrangler pages secret list
```

### wrangler.toml

```toml
[vars]
ENVIRONMENT = "production"
API_URL = "https://api.example.com"
```

### Access in Functions

```typescript
interface Env {
  API_KEY: string;
  ENVIRONMENT: string;
}

export const onRequest: PagesFunction<Env> = async ({ env }) => {
  const apiKey = env.API_KEY;
  const environment = env.ENVIRONMENT;
  // ...
};
```

---

## Part 8: Custom Domains

```bash
# Add custom domain via CLI
wrangler pages project create my-app

# In dashboard:
# 1. Go to Pages project
# 2. Custom domains tab
# 3. Add domain
# 4. Update DNS (CNAME to *.pages.dev)
```

### DNS Configuration

```
Type: CNAME
Name: @
Content: my-app.pages.dev
Proxy: Yes (orange cloud)
```

---

## Part 9: Pricing

| Resource | Free Tier | Pro ($20/mo) |
|----------|-----------|--------------|
| **Pages** | Unlimited sites | Unlimited sites |
| **Bandwidth** | Unlimited | Unlimited |
| **Builds** | 500/month | 5,000/month |
| **Workers** | 100k requests/day | 10M requests/month |
| **KV** | 100k reads/day | 10M reads/month |
| **D1** | 100k rows read/day | 25B rows read/month |
| **R2** | 10GB storage | 10GB + $0.015/GB |

---

## Part 10: Local Development

```bash
# Start local dev server with bindings
wrangler pages dev --local

# Or with npm scripts
npm run dev

# Test Functions locally
wrangler pages dev ./dist --binding MY_KV=my-kv-namespace

# Local D1
wrangler d1 execute my-database --local --command "SELECT * FROM users"
```

---

## Checklist

- [ ] Wrangler installed and logged in
- [ ] Pages project created
- [ ] Git repo connected (or using Wrangler deploy)
- [ ] Build settings configured
- [ ] Functions in `/functions` directory
- [ ] KV namespaces created (if needed)
- [ ] D1 database + migrations (if needed)
- [ ] R2 bucket created (if needed)
- [ ] Environment variables/secrets set
- [ ] Custom domain configured

---

## Resources

- Pages Docs: https://developers.cloudflare.com/pages
- Workers: https://developers.cloudflare.com/workers
- D1: https://developers.cloudflare.com/d1
- R2: https://developers.cloudflare.com/r2

---

## Related Skills

- `agents/deployment/SKILL.md` — Deployment options
- `agents/security/SKILL.md` — Cloudflare security
- `agents/database/SKILL.md` — Database patterns
