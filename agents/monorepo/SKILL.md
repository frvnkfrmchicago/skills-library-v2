---
name: monorepo
description: Turborepo + pnpm workspaces for multiple apps. Shared packages, caching, and selective deploys.
last_updated: 2026-03
owner: Frank
---

# Monorepo Patterns

Multiple apps, shared code, one repo.

## TL;DR

| Tool | Purpose |
|------|---------|
| **Turborepo** | Build orchestration, caching |
| **pnpm workspaces** | Dependency management |
| **Shared packages** | Reusable code (UI, utils, types) |

---

## Context Questions

Before setting up a monorepo:

1. **How many apps?** — Single app doesn't need monorepo
2. **Shared code?** — UI components, utils, types shared?
3. **Same team?** — Different teams may prefer separate repos
4. **Deploy together?** — Atomic changes across apps needed?
5. **Build speed?** — Is caching worth the complexity?

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Repos** | Single app ←→ Multiple related apps |
| **Sharing** | No shared code ←→ Heavy code reuse |
| **Build** | Simple (no cache) ←→ Turborepo (cached) |
| **Deploy** | Independent ←→ Atomic cross-app |
| **Team** | Single developer ←→ Multiple teams |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| 2+ Next.js apps | Turborepo + pnpm workspaces |
| Shared UI components | `packages/ui` with exports |
| Shared Prisma | `packages/database` |
| CI/CD needs | Selective builds with `--filter` |
| Team collaboration | Remote cache (Vercel) |
| Simple needs | Just pnpm workspaces (no Turbo) |

---

## When to Use a Monorepo

| Use Monorepo | Stay Single Repo |
|--------------|------------------|
| Multiple related apps | Single app |
| Shared UI components | No shared code |
| Same team/org | Different teams |
| Want atomic changes | Independent deploy cycles |

---

## Project Structure

```
my-monorepo/
├── apps/
│   ├── web/               # Main Next.js app
│   │   ├── app/
│   │   ├── package.json
│   │   └── next.config.js
│   ├── admin/             # Admin dashboard
│   │   ├── app/
│   │   └── package.json
│   └── docs/              # Documentation site
│       └── package.json
├── packages/
│   ├── ui/                # Shared UI components
│   │   ├── src/
│   │   └── package.json
│   ├── utils/             # Shared utilities
│   │   ├── src/
│   │   └── package.json
│   ├── database/          # Prisma client
│   │   ├── prisma/
│   │   └── package.json
│   ├── eslint-config/     # Shared ESLint config
│   │   └── package.json
│   └── typescript-config/ # Shared tsconfig
│       └── package.json
├── turbo.json             # Turborepo config
├── pnpm-workspace.yaml    # Workspace definition
└── package.json           # Root package.json
```

---

## Setup

### 1. Initialize

```bash
# Create new Turborepo
npx create-turbo@latest my-monorepo

# Or add Turborepo to existing project
pnpm add -D turbo -w
```

### 2. pnpm Workspace Config

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 3. Root package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "test": "turbo test",
    "clean": "turbo clean"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 4. Turborepo Config

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## Shared UI Package

### Package Setup

```json
// packages/ui/package.json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./button": "./src/button.tsx",
    "./card": "./src/card.tsx",
    "./input": "./src/input.tsx"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.0.0"
  }
}
```

### Component

```tsx
// packages/ui/src/button.tsx
import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    ghost: "hover:bg-gray-100",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
```

### Use in App

```json
// apps/web/package.json
{
  "name": "web",
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

```tsx
// apps/web/app/page.tsx
import { Button } from "@repo/ui/button";

export default function Home() {
  return <Button variant="primary">Click me</Button>;
}
```

### Next.js Transpile Config

```js
// apps/web/next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@repo/ui"],
};
```

---

## Shared Database Package

### Setup

```json
// packages/database/package.json
{
  "name": "@repo/database",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/client.ts"
  },
  "scripts": {
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0"
  }
}
```

```typescript
// packages/database/src/client.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export * from "@prisma/client";
```

### Use in Apps

```typescript
// apps/web/app/api/users/route.ts
import { db } from "@repo/database";

export async function GET() {
  const users = await db.user.findMany();
  return Response.json(users);
}
```

---

## Commands

### Development

```bash
# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm dev --filter=web

# Run multiple specific apps
pnpm dev --filter=web --filter=admin
```

### Building

```bash
# Build all
pnpm build

# Build specific app
pnpm build --filter=web

# Build app and its dependencies
pnpm build --filter=web...
```

### Adding Dependencies

```bash
# Add to specific package
pnpm add react --filter=@repo/ui

# Add to root (dev dependency for tooling)
pnpm add -D prettier -w

# Add workspace package as dependency
pnpm add @repo/ui --filter=web
```

---

## Caching

### Local Cache

Turborepo caches task outputs. Re-running doesn't rebuild unchanged packages.

```bash
# First run - builds everything
pnpm build   # ✓ web 5.2s ✓ admin 4.1s

# Second run - uses cache
pnpm build   # ✓ web CACHED ✓ admin CACHED
```

### Remote Cache (Team Sharing)

```bash
# Login to Vercel (free remote cache)
npx turbo login

# Link your repo
npx turbo link

# Now cache is shared across team/CI
```

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "pnpm"
      
      - run: pnpm install
      
      - run: pnpm lint
      
      - run: pnpm build
```

### Selective Deploys

Only deploy apps that changed:

```yaml
# Deploy web only if apps/web or its dependencies changed
jobs:
  deploy-web:
    if: contains(github.event.head_commit.modified, 'apps/web') || 
        contains(github.event.head_commit.modified, 'packages/')
    steps:
      - run: pnpm build --filter=web
      - run: vercel deploy --prod
```

---

## Shared Config Packages

### ESLint Config

```json
// packages/eslint-config/package.json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./next": "./next.js",
    "./react": "./react.js"
  }
}
```

```js
// packages/eslint-config/next.js
module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
  },
};
```

```js
// apps/web/eslint.config.js
module.exports = require("@repo/eslint-config/next");
```

### TypeScript Config

```json
// packages/typescript-config/base.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "moduleResolution": "bundler",
    "noEmit": true
  }
}
```

```json
// apps/web/tsconfig.json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": ["**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Common Patterns

### Versioning (with Changesets)

```bash
pnpm add -D @changesets/cli -w
pnpm changeset init

# Create changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish (if public)
pnpm changeset publish
```

### Internal Packages Only

For private monorepos, keep all packages at `"version": "0.0.0"` and skip publishing:

```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true
}
```

---

## Resources

- Turborepo Docs: [turbo.build/repo/docs](https://turbo.build/repo/docs)
- pnpm Workspaces: [pnpm.io/workspaces](https://pnpm.io/workspaces)
- Changesets: [github.com/changesets/changesets](https://github.com/changesets/changesets)
