---
name: app-cost
description: Cost analysis for running apps - hosting, services, infrastructure, and scaling.
---

# App Cost Analysis

What it costs to run your app.

## TL;DR

| Stage | Monthly Cost Range |
|-------|-------------------|
| **MVP / Testing** | $0 - $25 |
| **Launch (0-1k users)** | $25 - $100 |
| **Growth (1k-10k users)** | $100 - $500 |
| **Scale (10k+ users)** | $500+ |

---

## Context Questions

Before analyzing costs, ask:

1. **What's the app stage?** — MVP/testing, launch, growth, scale
2. **What's the expected user count?** — 100s, 1000s, 10K+, 100K+
3. **What features require paid services?** — Auth, database, AI, email, storage
4. **What's the budget sensitivity?** — Bootstrap (minimize), funded (optimize), enterprise (flexibility)
5. **What's the monetization model?** — Free, subscription, transaction-based, ad-supported

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Scale | MVP (0-100 users) ←→ Scale (100K+ users) |
| Budget | Minimize cost ←→ Maximize capability |
| Hosting | Serverless ←→ Dedicated infrastructure |
| AI Usage | Minimal ←→ AI-heavy features |
| Complexity | Simple CRUD ←→ Full-featured SaaS |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| MVP + bootstrapped | Stay on free tiers, Vercel + Supabase + Clerk free |
| Growth + funded | Upgrade to pro tiers, optimize for reliability |
| AI-heavy app | Budget for LLM costs ($50-500/mo), implement caching |
| Mobile app needed | Add Apple ($99/yr) + Google ($25) + Expo EAS costs |
| High traffic expected | Plan for serverless scaling, CDN caching, edge functions |
| Subscription revenue | Stripe 2.9% + 30¢, or MoR (5% + 50¢) for tax handling |

---

## Free Tier Strategy (MVP)

You can launch a real app for $0-25/month using free tiers:

| Service | Free Tier | Paid Starts |
|---------|-----------|-------------|
| **Vercel** | 100GB bandwidth, serverless | $20/mo |
| **Supabase** | 500MB DB, 50k auth users | $25/mo |
| **Clerk** | 10k MAU | $25/mo |
| **Resend** | 3k emails/mo | $20/mo |
| **Stripe** | 2.9% + 30¢ per transaction | No monthly fee |
| **PostHog** | 1M events/mo | $0 (generous free) |
| **Upstash** | 10k Redis commands/day | $0.2/100k |

**MVP Stack Cost: $0/month** (within free tiers)

---

## Cost by Service Category

### Hosting & Compute

| Service | Free | Starter | Growth |
|---------|------|---------|--------|
| **Vercel** | 100GB BW | $20/mo | $150/mo+ |
| **Railway** | $5 credit | $5/mo | Usage-based |
| **Render** | Static only | $7/mo | $25/mo+ |
| **Fly.io** | 3 shared VMs | $5/mo+ | Usage-based |
| **Cloudflare Pages** | Unlimited | $20/mo (Workers) | $5/M requests |

**Recommendation:** Start Vercel, move to Railway/Fly if you need more control.

### Database

| Service | Free | Pro | Notes |
|---------|------|-----|-------|
| **Supabase** | 500MB, 2 projects | $25/mo (8GB) | Includes auth, storage |
| **Neon** | 512MB, 1 project | $19/mo | Serverless Postgres |
| **PlanetScale** | 5GB, 1B reads | $29/mo | MySQL, branching |
| **Turso** | 9GB total | $29/mo | Edge SQLite |

**Recommendation:** Supabase (full-featured) or Neon (just database).

### Authentication

| Service | Free | Paid | Notes |
|---------|------|------|-------|
| **Clerk** | 10k MAU | $25/mo (100k) | Best DX |
| **Supabase Auth** | Included | Included | Part of Supabase |
| **Auth.js** | Free | Free | Self-managed |
| **Kinde** | 10.5k MAU | $25/mo | Simpler Clerk alt |

**Recommendation:** Clerk for best experience, Supabase if already using it.

### Payments

| Service | Fee | Monthly | Notes |
|---------|-----|---------|-------|
| **Stripe** | 2.9% + 30¢ | $0 | Industry standard |
| **Lemon Squeezy** | 5% + 50¢ | $0 | MoR (handles taxes) |
| **Paddle** | 5% + 50¢ | $0 | MoR (handles taxes) |

**Recommendation:** Stripe unless you want Merchant of Record (taxes handled).

### Email

| Service | Free | Paid | Notes |
|---------|------|------|-------|
| **Resend** | 3k/mo | $20/mo (50k) | Best DX, React Email |
| **Postmark** | 100/mo | $15/mo (10k) | Reliable delivery |
| **SendGrid** | 100/day | $20/mo | Established |
| **Loops** | 1k contacts | $49/mo | Marketing focus |

**Recommendation:** Resend for transactional, Loops for marketing.

### File Storage

| Service | Free | Paid | Notes |
|---------|------|------|-------|
| **Supabase Storage** | 1GB | Included in plan | Easy if using Supabase |
| **Cloudflare R2** | 10GB | $0.015/GB | No egress fees |
| **Uploadthing** | 2GB | $10/mo | Simple uploads |
| **AWS S3** | 5GB (12mo) | $0.023/GB | Standard |

**Recommendation:** Supabase Storage or R2 for cost efficiency.

### AI / LLM

| Service | Free | Cost | Notes |
|---------|------|------|-------|
| **OpenAI** | $5 credit | $0.002-0.06/1k tokens | GPT-4o, GPT-4 |
| **Anthropic** | $5 credit | $0.003-0.015/1k tokens | Claude |
| **Google AI** | $300 credit | Varies | Gemini, Imagen |
| **Replicate** | Some free | $0.0001-0.01/sec | Image models |

**Recommendation:** Start with Google ($300 credit), then evaluate per-model costs.

### Analytics

| Service | Free | Paid | Notes |
|---------|------|------|-------|
| **PostHog** | 1M events | $0 (generous) | Full-featured |
| **Plausible** | None | $9/mo | Privacy-focused |
| **Vercel Analytics** | Included | Included | Basic |
| **Mixpanel** | 20M events | $0 | Product analytics |

**Recommendation:** PostHog (free and powerful) or Plausible (simple).

---

## Sample App Costs

### Basic SaaS (MVP)

```
Hosting:     Vercel Free         $0
Database:    Supabase Free       $0
Auth:        Clerk Free          $0
Email:       Resend Free         $0
Payments:    Stripe              $0 (% on transactions)
Analytics:   PostHog Free        $0
Domain:      Cloudflare          $10/year

TOTAL: ~$1/month (domain only)
```

### Growing SaaS (1k users)

```
Hosting:     Vercel Pro          $20
Database:    Supabase Pro        $25
Auth:        Clerk Starter       $25
Email:       Resend Starter      $20
Payments:    Stripe              $0
Analytics:   PostHog Free        $0
Domain:      Cloudflare          $1

TOTAL: ~$91/month
```

### Scaling SaaS (10k users)

```
Hosting:     Vercel Pro          $50
Database:    Supabase Pro        $25
Auth:        Clerk Pro           $100
Email:       Resend Pro          $40
Payments:    Stripe              $0
Analytics:   PostHog             $0
Storage:     Cloudflare R2       $10
Domain:      Cloudflare          $1

TOTAL: ~$226/month
```

### AI-Heavy App (with LLM usage)

```
Base Stack:                      $91 (from above)
OpenAI (10k requests/mo):        ~$50
Image Gen (1k images/mo):        ~$20
Vector DB (Pinecone):            $0 (free tier)

TOTAL: ~$161/month
```

---

## Mobile App Additional Costs

### App Store Fees

| Platform | Developer Fee | Transaction Fee |
|----------|---------------|-----------------|
| **Apple** | $99/year | 15-30% of purchases |
| **Google** | $25 one-time | 15-30% of purchases |

### Mobile-Specific Services

| Service | Free | Paid | Notes |
|---------|------|------|-------|
| **Expo EAS** | 30 builds/mo | $99/mo | Build service |
| **RevenueCat** | $2.5k MRR | 1% of MRR | In-app purchases |
| **OneSignal** | 10k users | $9/mo | Push notifications |

### PWA vs Native Cost Comparison

| Approach | Dev Cost | Monthly Cost | Reach |
|----------|----------|--------------|-------|
| **PWA Only** | Low | $0-100 | Web only |
| **PWA + Expo** | Medium | $100-200 | Web + App Stores |
| **Native Only** | High | $200+ | App Stores only |

**Recommendation:** Start PWA, add Expo when ready for app stores.

---

## Cost Optimization Tips

### 1. Stay on Free Tiers

```
Monitor usage dashboards weekly.
Set billing alerts at 80% of limits.
Don't upgrade until you actually hit limits.
```

### 2. Choose Serverless

```
Serverless = pay for what you use
VPS = pay whether used or not

For unpredictable traffic, serverless wins.
```

### 3. Edge Everything

```
Cloudflare R2 > S3 (no egress fees)
Edge functions > Traditional serverless
CDN caching > Origin requests
```

### 4. Database Efficiency

```
Index your queries
Paginate large datasets
Cache frequent reads (Upstash Redis)
Connection pooling (Prisma Accelerate)
```

### 5. AI Cost Control

```
Use cheaper models for simple tasks (GPT-4o-mini)
Cache AI responses where possible
Implement rate limiting per user
Set spend limits in provider dashboards
```

---

## Break-Even Analysis

### Per-User Cost Estimate

```
Typical cost per active user: $0.05-0.50/month

At $10/month subscription:
- 95%+ margin if under 1k users
- 90%+ margin at scale with optimization
```

### Revenue Needed to Cover Costs

| Monthly Cost | Users Needed at $10/mo | Users at $20/mo |
|--------------|------------------------|-----------------|
| $100 | 10 paid users | 5 paid users |
| $300 | 30 paid users | 15 paid users |
| $500 | 50 paid users | 25 paid users |

---

## Monitoring Costs

### Dashboards to Check Weekly

| Service | Where to Check |
|---------|----------------|
| Vercel | vercel.com/dashboard → Usage |
| Supabase | Dashboard → Project Settings → Usage |
| Clerk | clerk.com → Usage |
| Stripe | dashboard.stripe.com → Reports |
| OpenAI | platform.openai.com → Usage |

### Set These Alerts

```
Vercel: Alert at 80GB bandwidth
Supabase: Alert at 400MB database
Clerk: Alert at 8k MAU
OpenAI: Set hard spend limit ($50/mo)
```

---

## Cost Estimation Prompt

```
"Estimate monthly costs for an app with:
- [X] expected users
- [Y] features (auth, payments, AI, etc.)
- [Z] usage pattern (daily active, occasional, etc.)

Break down by service and suggest optimization."
```

---

## Cost by App Type

### SaaS Web App

| Component | MVP | Growth | Scale |
|-----------|-----|--------|-------|
| Hosting | $0 | $20 | $50-150 |
| Database | $0 | $25 | $50-100 |
| Auth | $0 | $25 | $100+ |
| Email | $0 | $20 | $40+ |
| Payments | 2.9%+30¢ | Same | Same |
| **Monthly Total** | **$0** | **$90** | **$300+** |

### AI-Powered App

| Component | MVP | Growth | Scale |
|-----------|-----|--------|-------|
| Base stack | $0 | $90 | $300 |
| LLM API (OpenAI/Claude) | $5-50 | $50-200 | $500+ |
| Image Gen | $0-20 | $50 | $200+ |
| Vector DB | $0 | $0-20 | $70+ |
| **Monthly Total** | **$5-70** | **$190-360** | **$1,000+** |

### Mobile App (PWA + App Stores)

| Component | MVP | Growth | Scale |
|-----------|-----|--------|-------|
| Base stack | $0 | $90 | $300 |
| Apple Dev Program | $8/mo | $8/mo | $8/mo |
| Google Play | $2/mo | $2/mo | $2/mo |
| Expo EAS Builds | $0 | $0-99 | $99 |
| Push Notifications | $0 | $0-9 | $29+ |
| RevenueCat | $0 | 1% MRR | 1% MRR |
| **Monthly Total** | **$10** | **$110-210** | **$450+** |

### Dashboard / Internal Tool

| Component | MVP | Growth | Scale |
|-----------|-----|--------|-------|
| Hosting | $0 | $20 | $50 |
| Database | $0 | $25 | $50 |
| Auth | $0 | $25 | $50 |
| Charts/Analytics | $0 | $0 | $0-50 |
| **Monthly Total** | **$0** | **$70** | **$150+** |

### E-Commerce

| Component | MVP | Growth | Scale |
|-----------|-----|--------|-------|
| Base stack | $0 | $90 | $300 |
| Stripe/Payments | 2.9%+30¢ | Same | Same |
| Inventory DB | $0 | $25 | $50+ |
| Email Marketing | $0 | $49 | $99+ |
| CDN/Images | $0 | $10 | $50+ |
| **Monthly Total** | **$0** | **$175** | **$500+** |

---

## Market Comparison: What Competitors Charge

Research these to validate your pricing:

### Where to Find Competitor Pricing

| Source | What You Find |
|--------|---------------|
| **SaaS competitor sites** | Public pricing pages |
| **Product Hunt** | Launch pricing, tiers |
| **G2/Capterra** | Enterprise pricing hints |
| **IndieHackers** | Transparent revenue reports |
| **OpenStartup list** | Public metrics from real SaaS |
| **Twitter/X** | Founders sharing numbers |

### Typical SaaS Pricing by Category

| Category | Low End | Mid | High End |
|----------|---------|-----|----------|
| **Dev Tools** | $10/mo | $25/mo | $100+/mo |
| **Design Tools** | $12/mo | $20/mo | $50/mo |
| **Productivity** | $8/mo | $15/mo | $30/mo |
| **AI Tools** | $20/mo | $50/mo | $200+/mo |
| **Analytics** | $9/mo | $30/mo | $150+/mo |
| **Marketing** | $29/mo | $99/mo | $500+/mo |

### Rule of Thumb: Pricing vs Costs

```
Your Price = 5-20x your per-user cost

If it costs you $1/user/month to run:
- Price at $10-20/month minimum
- Aim for 80%+ gross margin
```

---

## Cost Review Process

### Monthly Cost Audit Checklist

Run this on the 1st of each month:

```
□ Check each service dashboard for usage
□ Compare actual vs projected usage
□ Identify unused services (cancel them)
□ Check for services approaching paid tier
□ Review AI/LLM spend (often the surprise)
□ Update cost projection spreadsheet
```

### Quarterly Cost Review

```
□ Compare costs to revenue (target <20% of revenue)
□ Evaluate alternatives for expensive services
□ Check if you're using premium features you pay for
□ Review vendor pricing changes
□ Renegotiate if spending $500+/mo on any service
□ Consider annual plans for 20% savings
```

### Cost Red Flags

| Warning Sign | What to Do |
|--------------|------------|
| AI costs > 30% of revenue | Cache more, use cheaper models |
| Database growing fast | Archive old data, optimize queries |
| Bandwidth spikes | Add CDN, optimize images |
| Auth costs high | Evaluate Supabase Auth (included) |
| Multiple unused services | Audit and cancel |

---

## Build vs Buy Analysis

### When to Use Paid Service

| Scenario | Build | Buy |
|----------|-------|-----|
| Auth | ❌ Complex, security risk | ✅ Clerk/Supabase |
| Payments | ❌ Compliance nightmare | ✅ Stripe |
| Email delivery | ❌ Deliverability issues | ✅ Resend |
| Analytics | Maybe | ✅ PostHog (free tier) |
| File uploads | Maybe | ✅ Uploadthing/R2 |
| Search | Can build simple | ✅ Algolia if complex |

### When to Build Yourself

| Scenario | Why |
|----------|-----|
| Simple CRUD | Supabase + Prisma handles it |
| Basic caching | Upstash free tier |
| Static assets | Vercel/Cloudflare included |
| Simple charts | Recharts (free) |

---

## Cost Tracking Template

### Spreadsheet Columns

```
| Service | Free Limit | Current Usage | % Used | Monthly Cost | Annual Cost | Notes |
```

### Example Row

```
| Clerk | 10k MAU | 8,500 | 85% | $0 | $0 | Approaching paid |
```

### Services to Track

```
1. Hosting (Vercel/Railway)
2. Database (Supabase/Neon)
3. Auth (Clerk)
4. Email (Resend)
5. Payments (Stripe %)
6. AI APIs (OpenAI/Anthropic)
7. Storage (R2/S3)
8. Analytics (PostHog)
9. Domain (Cloudflare)
10. Mobile (Apple/Google fees)
```

---

## Pricing Your App

### Value-Based Pricing Framework

```
1. What problem does it solve?
2. What's the alternative cost? (time, other tools)
3. Who's the buyer? (consumer, SMB, enterprise)
4. What's the perceived value?

Price = 10-20% of value delivered
```

### Pricing Tiers Template

```
FREE
- Core features
- Limited usage (X per month)
- Community support
- "Powered by [Your App]"

PRO ($X/mo)
- Everything in Free
- Higher limits
- Priority support
- Remove branding

TEAM ($X/user/mo)
- Everything in Pro
- Collaboration features
- Admin controls
- SSO

ENTERPRISE (Custom)
- Everything in Team
- Dedicated support
- Custom integrations
- SLA
```

---

## Quick Reference

| Question | Answer |
|----------|--------|
| Can I launch for free? | Yes, MVP on free tiers |
| When do I pay? | When you exceed free limits |
| Biggest cost driver? | Usually database or AI |
| How to reduce costs? | Edge, cache, optimize queries |
| App store worth it? | Only when you have traction |
| How to price? | 5-20x your per-user cost |
| When to review costs? | Monthly quick check, quarterly deep dive |
| Where to find competitor pricing? | Product Hunt, IndieHackers, G2 |
