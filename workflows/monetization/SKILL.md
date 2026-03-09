---
name: monetization
description: Turn your app into revenue with pricing, paywalls, and upsells.
last_updated: 2026-03
owner: Frank
---

# Monetization Skill

**Turn your app into revenue with pricing, paywalls, and upsells.**

> **See also:** `tech-stack/CROSS-REFERENCES.md` for related skills (stripe, analytics, app-cost)

---

## Context Questions

Before implementing monetization, ask:

1. **What's the revenue model?** — Subscription, one-time, usage, freemium
2. **Who's paying?** — Individual, team, enterprise
3. **What's the price point?** — <$10, $10-50, $50-200, $200+
4. **When to monetize?** — Day 1, after traction, post-PMF
5. **What payment processor?** — Stripe, LemonSqueezy, Paddle

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Timing** | Free first ←→ Paid from day 1 |
| **Model** | One-time ←→ Recurring |
| **Pricing** | Low touch ←→ Enterprise sales |
| **Complexity** | Single tier ←→ Usage-based |
| **Conversion** | Hard paywall ←→ Generous freemium |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| SaaS product | Subscription tiers + annual discount |
| API or tool | Usage-based pricing |
| Templates/courses | One-time purchase |
| Consumer app | Freemium + premium |
| Enterprise target | Custom pricing + sales |
| Early stage | Free tier for traction first |

---

## TL;DR

| Revenue Model | Best For | Setup Time |
|---------------|----------|------------|
| **Subscription** | SaaS, tools | 2-3 hours |
| **One-time** | Templates, tools | 1 hour |
| **Usage-based** | APIs, SMS, credits | 3-4 hours |
| **Freemium** | User tools, games | 4-6 hours |

**Stack:** Stripe + Clerk (auth) + Prisma

---

## Part 1: Pricing Models

### Subscription (Most Common)

```typescript
// Stripe Products (set in dashboard or API)
const PLANS = {
  free: { price: 0, limits: { projects: 3, storage: 1  } },
  pro: { price: 9.99, limits: { projects: 50, storage: 10 } },
  enterprise: { price: 49.99, limits: { projects: 999, storage: 100 } },
};
```

**When to use:**
- Predictable revenue
- Ongoing value (dashboards, tools, SaaS)
- Recurring engagement

### One-Time

```typescript
const PRODUCTS = {
  template: { price: 29 },
  course: { price: 99 },
  lifetime: { price: 299 }, // One-time, unlimited access
};
```

**When to use:**
- Templates, courses, assets
- One-and-done value
- No ongoing costs

### Usage-Based

```typescript
// Credits or metered billing
const PRICING = {
  perMessage: 0.02, // SMS
  perRequest: 0.001, // API calls
  perMinute: 0.10, // AI processing
};
```

**When to use:**
- APIs, AI tools, SMS/email
- Cost scales with usage
- Variable user needs

---

## Part 2: Stripe Checkout (Quickest)

### Subscription Checkout

```typescript
// app/api/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { priceId, userId } = await req.json();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: priceId, // price_xxx from Stripe dashboard
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    client_reference_id: userId,
  });
  
  return Response.json({ url: session.url });
}
```

```tsx
// app/pricing/page.tsx
'use client';

async function handleCheckout(priceId: string) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, userId: user.id }),
  });
  
  const { url } = await res.json();
  window. location.href = url; // Redirect to Stripe
}

export default function Pricing() {
  return (
    <div>
      <PricingCard 
        plan="Pro"
        price="$9.99/mo"
        onClick={() => handleCheckout('price_xxx')}
      />
    </div>
  );
}
```

**That's it. Stripe handles payment, tax, invoices.**

---

## Part 3: Webhooks (Critical)

### Why Webhooks?

**Don't do this:**
```typescript
// ❌ Client says "I paid", you trust them
await updateUserToPro(userId);
```

**Do this:**
```typescript
// ✅ Stripe confirms payment via webhook
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      await handleCancellation(subscription);
      break;
  }
  
  return Response.json({ received: true });
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: 'pro',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
    },
  });
}
```

---

## Part 4: Paywalls & Gates

### Feature Gating

```typescript
// lib/features.ts
export function canAccess(user: User, feature: string): boolean {
  const limits = {
    free: { projects: 3, exports: 5, ai: false },
    pro: { projects: 50, exports: 999, ai: true },
  };
  
  const userLimits = limits[user.plan];
  
  switch (feature) {
    case 'ai':
      return userLimits.ai;
    case 'newProject':
      return user.projectCount < userLimits.projects;
    default:
      return true;
  }
}
```

```tsx
// app/dashboard/new-project/page.tsx
import { canAccess } from '@/lib/features';
import { redirect } from 'next/navigation';

export default async function NewProject() {
  const user = await getCurrentUser();
  
  if (!canAccess(user, 'newProject')) {
    redirect('/upgrade');
  }
  
  return <ProjectForm />;
}
```

---

## Part 5: Upsells & Upgrades

### In-App Prompts

```tsx
// components/UpgradePrompt.tsx
export function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="border rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50">
      <h3 className="font-bold">Unlock {feature}</h3>
      <p className="text-sm text-gray-600">
        Upgrade to Pro for unlimited {feature.toLowerCase()}
      </p>
      <Button href="/upgrade">Upgrade Now →</Button>
    </div>
  );
}
```

**Where to show:**
- When hitting limits (projects, exports)
- Premium features (AI, analytics)
- After success (exported 5 projects = show upgrade)

---

## Part 6: Trial → Paid Conversion

### 7-Day Trial Pattern

```typescript
// When creating user
await prisma.user.create({
  data: {
    email,
    plan: 'trial',
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});

// Check trial status
export function isTrialActive(user: User): boolean {
  if (user.plan !== 'trial') return false;
  return new Date() < user.trialEndsAt;
}

// Auto-downgrade on cron
export async function downgradeExpiredTrials() {
  await prisma.user.updateMany({
    where: {
      plan: 'trial',
      trialEndsAt: { lt: new Date() },
    },
    data: { plan: 'free' },
  });
}
```

---

## Part 7: Pricing Psychology

### Anchor Pricing

```
┌─────────────────────────────────────┐
│ FREE          PRO         ENTERPRISE│
│ $0/mo         $9.99/mo   $49.99/mo  │ ← Enterprise anchors Pro
│ 3 projects    50 projects  Unlimited│
│ Basic         + AI         + Custom │
└─────────────────────────────────────┘
```

**Most will choose middle (Pro) - that's the goal.**

### Value-Based Pricing

**Don't price on cost:**
- SMS tool costs $20/mo to run
- DON'T charge $30

**Price on value:**
- Saves client 10 hours/mo
- Client's time = $50/hr
- Value = $500/mo
- CHARGE $200-400/mo

---

## Part 8: Revenue Models by App Type

| App Type | Best Model | Price Range |
|----------|------------|-------------|
| SaaS Dashboard | Subscription | $9-99/mo |
| API/Tool | Usage-based | $0.001-0.10/call |
| Course/Template | One-time | $29-299 |
| Game | Freemium + IAP | $0.99-9.99/item |
| SMS/Email Tool | Usage-based | $0.01-0.05/message |
| Trading Journal | Subscription | $9-49/mo |

---

## Part 9: Stripe Billing Portal

**Let users manage their own subscriptions:**

```typescript
// app/api/create-portal-session/route.ts
export async function POST(req: Request) {
  const { customerId } = await req.json();
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
  });
  
  return Response.json({ url: session.url });
}
```

**Users can:**
- Update card
- Cancel subscription
- View invoices
- Change plan

**You don't build any of this - Stripe does.**

---

## Part 10: Database Schema

```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  plan                  String    @default("free") // free, trial, pro, enterprise
  trialEndsAt           DateTime?
  stripeCustomerId      String?
  stripeSubscriptionId  String?
  projectCount          Int       @default(0)
  createdAt             DateTime  @default(now())
}

model Payment {
  id              String   @id @default(cuid())
  userId          String
  amount          Int      // cents
  currency        String   @default("usd")
  status          String   // succeeded, failed
  stripePaymentId String
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
}
```

---

## Part 11: Quick Revenue Checklist

```markdown
- [ ] Set up Stripe account
- [ ] Create products/prices in Stripe dashboard
- [ ] Add Stripe Checkout API route
- [ ] Add webhook handler (critical!)
- [ ] Add paywall checks to features
- [ ] Add upgrade prompts
- [ ] Add billing portal link
- [ ] Test with Stripe test mode
```

---

## Resources

- **Stripe Docs:** https://stripe.com/docs
- **Stripe Checkout:** https://stripe.com/docs/payments/checkout
- **Webhooks:** https://stripe.com/docs/webhooks
- **Pricing Best Practices:** https://stripe.com/guides/atlas/saas-pricing

---

## Related Skills

- `agents/sms/SKILL.md` - Usage-based pricing for SMS
- `agents/email/SKILL.md` - Email paywall funnels
- `agents/analytics/SKILL.md` - Track conversion rates
- `agents/stripe/SKILL.md` - Deep Stripe patterns
