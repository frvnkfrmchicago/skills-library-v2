---
name: github-portfolio
description: Prepare projects for public GitHub. Strip sensitive data, create impressive READMEs, showcase architecture without exposing proprietary logic.
last_updated: 2026-03
owner: Frank
---

# GitHub Portfolio Prep

Make your projects showcase-ready without exposing secrets or proprietary details.

> **See also:** `agents/github/SKILL.md`, `agents/documentation/SKILL.md`

---

## Core Goal

**Impress recruiters and clients. Protect your IP.** Show architecture, patterns, and code quality—not business logic or secrets.

---

## What to SHOW vs HIDE

### ✅ SHOW (Impressive)

| Show | Why It Impresses |
|------|------------------|
| File structure | Shows organization skills |
| Component architecture | Demonstrates system design |
| API route structure | Shows backend knowledge |
| Type definitions | Proves TypeScript mastery |
| Custom hooks | Reusable code patterns |
| Utility functions | Clean abstractions |
| README with diagrams | Communication skills |
| CI/CD workflows | DevOps knowledge |
| Test structure | Quality mindset |

### ❌ HIDE (Protect)

| Hide | Why |
|------|-----|
| API keys | Security |
| Business logic algorithms | Proprietary |
| Customer data schemas | Privacy |
| Pricing logic | Business sensitive |
| Third-party integrations (full) | Vendor deals |
| Internal documentation | Company-specific |
| .env files | Never commit |
| Proprietary AI prompts | IP protection |

---

## Shell Structure

Keep the bones, remove the meat:

```
project/
├── README.md           # ✅ Showcase (detailed)
├── .github/            # ✅ Show CI/CD workflows
├── src/
│   ├── app/            # ✅ Show route structure
│   │   ├── page.tsx    # ✅ Keep UI components
│   │   └── api/        # ⚠️  Stub business logic
│   ├── components/     # ✅ Show all
│   ├── lib/            # ⚠️  Remove proprietary utils
│   ├── hooks/          # ✅ Show custom hooks
│   ├── types/          # ✅ Show type definitions
│   └── utils/          # ✅ Show generic utilities
├── prisma/
│   └── schema.prisma   # ⚠️  Generalize field names
├── .env.example        # ✅ Document required vars
└── package.json        # ✅ Show tech stack
```

---

## How to "Shell" a File

### API Route (Before - Proprietary)

```typescript
// src/app/api/pricing/route.ts (BEFORE)
export async function POST(req: Request) {
  const { plan, seats, annualDiscount } = await req.json()
  
  // PROPRIETARY: Custom pricing algorithm
  const basePrice = PRICING_TIERS[plan].base
  const seatPrice = seats * PRICING_TIERS[plan].perSeat
  const discount = annualDiscount ? 0.2 : 0
  const enterpriseMultiplier = seats > 100 ? 0.85 : 1
  
  const total = (basePrice + seatPrice) * (1 - discount) * enterpriseMultiplier
  
  await stripe.prices.create({ unit_amount: total * 100 })
  
  return Response.json({ price: total })
}
```

### API Route (After - Shelled)

```typescript
// src/app/api/pricing/route.ts (AFTER)
import { calculatePrice } from "@/lib/pricing"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.json()
  
  // Price calculation logic removed for portfolio
  // See README for architecture overview
  const price = calculatePrice(body)
  
  await stripe.prices.create({ unit_amount: price * 100 })
  
  return Response.json({ price })
}
```

---

## Stub Patterns

### Empty Implementation Stub

```typescript
// lib/pricing.ts
/**
 * Calculate price based on plan configuration.
 * 
 * Architecture:
 * - Tier-based pricing with volume discounts
 * - Annual billing discount
 * - Enterprise custom pricing
 * 
 * @see README.md for full architecture documentation
 */
export function calculatePrice(config: PricingConfig): number {
  // Implementation removed for portfolio
  // This demonstrates the API contract and type safety
  throw new Error("Implementation removed for portfolio")
}
```

### Type-Only Export

```typescript
// types/pricing.ts
export interface PricingConfig {
  plan: "starter" | "pro" | "enterprise"
  seats: number
  billingCycle: "monthly" | "annual"
  addons?: string[]
}

export interface PriceResult {
  subtotal: number
  discount: number
  total: number
  breakdown: LineItem[]
}
```

---

## README Structure for Portfolio

```markdown
# [Project Name]

Brief description of what this does and why it's impressive.

![Hero Screenshot](./docs/screenshot.png)

## 🚀 Live Demo

[View Live](https://project.vercel.app) | [Video Walkthrough](link)

---

## 📐 Architecture

```mermaid
graph TB
    Client[React Frontend] --> API[Next.js API Routes]
    API --> Auth[Clerk Auth]
    API --> DB[(PostgreSQL)]
    API --> AI[OpenAI/Gemini]
    API --> Payments[Stripe]
```

### Key Patterns

- **RAG Pipeline**: Vector embeddings with context retrieval
- **Streaming**: Real-time AI responses via Server-Sent Events
- **Type Safety**: End-to-end TypeScript with Zod validation

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind 4 |
| Backend | Next.js API Routes, Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | Clerk |
| AI | OpenAI GPT-4, Vercel AI SDK |
| Payments | Stripe |
| Deploy | Vercel |

---

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (marketing)/     # Public pages
│   ├── (dashboard)/     # Authenticated pages
│   └── api/             # API routes
├── components/          # React components
│   ├── ui/              # shadcn/ui components
│   └── features/        # Feature-specific
├── lib/                 # Shared utilities
├── hooks/               # Custom React hooks
└── types/               # TypeScript definitions
```

---

## ✨ Features

- **Feature 1**: Description of what it does
- **Feature 2**: Description with technical detail
- **Feature 3**: Why this is impressive

---

## 🔐 Security

- Row-level security in database
- API rate limiting
- Input validation with Zod
- Secure headers configured

---

## 📝 Note

This is a portfolio version. Some business logic has been abstracted 
to protect proprietary implementations while demonstrating:

- Clean architecture
- Type safety patterns
- API design
- Component organization

---

## 📬 Contact

Interested in discussing this project or working together?

[Portfolio](https://link) | [LinkedIn](https://link) | [Email](mailto:email)
```

---

## Git History Cleanup

Before pushing to public repo:

```bash
# Option 1: Fresh repo (cleanest)
rm -rf .git
git init
git add .
git commit -m "Initial portfolio commit"

# Option 2: Squash history
git checkout --orphan clean-branch
git add .
git commit -m "Portfolio version"
git branch -D main
git branch -m main
git push -f origin main

# Option 3: BFG for secret removal
# If secrets ever existed in history
bfg --delete-files .env
bfg --replace-text passwords.txt
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

---

## Files to Create

### .env.example

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Authentication
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""

# AI
OPENAI_API_KEY=""
# or
GOOGLE_GENERATIVE_AI_API_KEY=""

# Payments
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### .gitignore (ensure these)

```gitignore
# Environment
.env
.env.local
.env.*.local

# Secrets
*.pem
*.key
secrets/

# IDE
.idea/
.vscode/settings.json

# Build
.next/
node_modules/
dist/
```

---

## Pre-Push Checklist

```
□ All .env files removed from history
□ No API keys in code
□ No customer data or real emails
□ Business logic properly abstracted
□ README is impressive and complete
□ Screenshots/diagrams added
□ Tech stack clearly documented
□ Contact info included
□ License added (MIT usually)
□ Live demo link works
```

---

## Project-by-Project Shell Guide

### ToolChain (RAG/Orchestration)
- ✅ Show: RAG pipeline architecture, vector search patterns
- ✅ Show: Multi-agent orchestration flow
- ❌ Hide: Specific prompts, API integrations

### Trading Intel Dashboard
- ✅ Show: Dashboard components, charts, real-time patterns
- ❌ Hide: Trading algorithms, data sources

### Ship Free APIs
- ✅ Show: API catalog structure, search
- ✅ Show: UI components
- ❌ Hide: Curation logic, monetization

### SMS Marketing Platform
- ✅ Show: Campaign builder UI
- ✅ Show: Message queue architecture
- ❌ Hide: Phone number handling, compliance logic

### Agentic Library
- ✅ Show: Full library (it's the product!)
- ❌ Hide: Personal notes, client-specific adaptations

---

## Resources

- GitHub Profile README: github.com/abhisheknaiidu/awesome-github-profile-readme
- README Templates: github.com/othneildrew/Best-README-Template
- Shields.io Badges: shields.io

---

## Related Skills

- `agents/github/SKILL.md` — Git workflows
- `agents/documentation/SKILL.md` — README structure
- `librarians/pre-deployment-librarian.md` — Security checks
