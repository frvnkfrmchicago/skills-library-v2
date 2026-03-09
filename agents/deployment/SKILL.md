---
---
name: deployment
description: Environment variables, CI/CD, preview deployments, and rollbacks.
last_updated: 2026-03
owner: Frank
---

# Deployment

Ship with confidence.

## TL;DR

| Platform | Best For | Complexity |
|----------|----------|------------|
| **Vercel** | Next.js, frontend | Low |
| **Railway** | Full-stack, databases | Low |
| **Fly.io** | Docker, edge | Medium |
| **AWS/GCP** | Enterprise, custom | High |

---

## Context Questions (Ask Before Recommending)

Before suggesting deployment patterns:

1. **What's the stack?** (Next.js, Node, Docker, static site)
2. **Database needs?** (none, managed, self-hosted)
3. **Team size/expertise?** (solo dev, small team, DevOps team)
4. **Budget constraints?** (free tier, startup, enterprise)
5. **Scale expectations?** (hobby, startup, high-traffic)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | One-click deploy ←→ Custom infrastructure |
| **Control** | Fully managed ←→ Self-hosted |
| **Cost** | Free tier ←→ Enterprise pricing |
| **Database** | External ←→ Integrated ←→ Self-managed |
| **CI/CD** | Platform built-in ←→ Custom GitHub Actions |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Next.js + quick deploy | Vercel |
| Full-stack + needs database | Railway |
| Docker containers | Fly.io |
| Enterprise + custom needs | AWS/GCP |
| Static site | Vercel or Cloudflare Pages |
| Complex CI/CD | GitHub Actions + any platform |

---

## Vercel (Recommended for Next.js)

### Initial Setup

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

### Project Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"], // US East
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Environment Variables

```bash
# Add single variable
vercel env add NEXT_PUBLIC_API_URL

# Add from file
vercel env pull .env.local  # Download
vercel env push .env.local  # Upload (doesn't exist, use dashboard)

# List variables
vercel env ls
```

**Environment Types:**
- `Production` - Only production deployments
- `Preview` - All non-production deployments
- `Development` - Local development only

### GitHub Integration

1. Connect repo in Vercel dashboard
2. Every push to `main` → Production deploy
3. Every PR → Preview deployment with unique URL

---

## Railway

### Initial Setup

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Configuration

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### Database + App Together

```bash
# Add PostgreSQL
railway add -p postgresql

# Environment variable automatically added
# DATABASE_URL=postgresql://...

# Deploy app
railway up
```

---

## Environment Variables

### .env Files Structure

```
.env                 # Shared defaults (committed, no secrets)
.env.local           # Local overrides (gitignored)
.env.development     # Development-specific
.env.production      # Production-specific (for reference, not secrets)
```

### Next.js Convention

```bash
# Server-only (API routes, server components)
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...

# Client-accessible (prefix with NEXT_PUBLIC_)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_STRIPE_KEY=pk_...
```

### Environment Variable Validation

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Server
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  
  // Client
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_KEY: z.string().startsWith('pk_'),
})

// Validate at build time
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten())
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
```

### Secrets Management

| Tool | Best For |
|------|----------|
| **Vercel Environment Variables** | Vercel deployments |
| **Railway Variables** | Railway deployments |
| **Doppler** | Multi-platform, team secrets |
| **1Password/Bitwarden** | Team password sharing |
| **AWS Secrets Manager** | AWS infrastructure |

---

## CI/CD with GitHub Actions

### Basic Deploy Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Full CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  e2e-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy-preview:
    needs: [lint, unit-test]
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: [lint, unit-test, e2e-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Database Migrations

### Prisma Migrations in CI

```yaml
# In your deploy job
- name: Run migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Migration Strategy

```
Development:
  npx prisma migrate dev     # Create and apply migrations

Staging/Production:
  npx prisma migrate deploy  # Apply existing migrations only
```

### Safe Migration Practices

```typescript
// 1. Always backup before migrations
// 2. Test migrations on staging first
// 3. For breaking changes, use expand-contract pattern:

// Step 1: Add new column (nullable)
model User {
  oldField String?
  newField String?  // Add nullable first
}

// Step 2: Backfill data
// UPDATE users SET newField = transform(oldField)

// Step 3: Make new column required, remove old
model User {
  newField String
}
```

---

## Preview Deployments

### Vercel (Automatic)

Every PR gets a preview URL: `project-git-branch-name-org.vercel.app`

### Custom Preview Environment

```yaml
# .github/workflows/preview.yml
name: Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy Preview
        id: deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
      
      - name: Comment Preview URL
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed to: ${{ steps.deploy.outputs.preview-url }}'
            })
```

---

## Rollbacks

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Git-Based Rollback

```bash
# Revert last commit
git revert HEAD
git push

# Or reset to specific commit (careful!)
git reset --hard <commit-sha>
git push --force
```

### Database Rollback Strategy

```
1. Always have backups before deploy
2. For data-only issues: restore from backup
3. For schema issues: create new migration that reverses changes
4. Never use prisma migrate reset in production
```

---

## Health Checks

### API Health Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check database
    await db.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 }
    )
  }
}
```

### External Monitoring

| Service | What It Does |
|---------|--------------|
| **UptimeRobot** | Free uptime monitoring |
| **Better Uptime** | Status pages, incident management |
| **Checkly** | Synthetic monitoring, API checks |
| **Vercel Analytics** | Performance monitoring |

---

## Pre-Deploy Checklist

```
□ All tests passing
□ No TypeScript errors
□ No linting errors
□ Environment variables set in production
□ Database migrations tested on staging
□ Secrets rotated if needed
□ Backup taken (for major changes)
□ Team notified
```

## Post-Deploy Checklist

```
□ Health check passing
□ Key user flows working
□ No new errors in logs
□ Performance acceptable
□ Rollback plan ready
```

---

## Prompt Examples

```
"Set up GitHub Actions CI/CD for this Next.js project with Vercel"

"Add environment variable validation with Zod"

"Create a health check endpoint that verifies database connection"

"Configure preview deployments with PR comments"

"Set up database migrations in CI pipeline"
```
