---
name: stripe
description: Payments, subscriptions, invoices, and checkout with Stripe.
last_updated: 2026-03
owner: Frank
---

# Stripe

Payments infrastructure for the internet.

> **See also:** `tech-stack/CROSS-REFERENCES.md` for related skills (database, email, monetization)

---

## Context Questions

Before implementing payments:

1. **What's the payment model?** — One-time, subscription, usage-based, marketplace
2. **Who is paying?** — B2C (individuals), B2B (invoiced), platform (marketplace cut)
3. **What's the pricing complexity?** — Single price, tiered, per-seat, metered
4. **What's the checkout experience?** — Stripe Hosted, embedded, custom UI
5. **Do you need invoicing?** — Auto-generated, manual, recurring

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Payment Type** | One-time ←→ Subscription ←→ Usage-based |
| **Checkout** | Stripe Hosted ←→ Embedded ←→ Custom UI |
| **Complexity** | Single product ←→ Multi-tier ←→ Marketplace |
| **Billing** | Card only ←→ Multi-method ←→ Invoicing |
| **Customer Management** | Anonymous ←→ Saved customers ←→ Portal self-service |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| MVP/quick launch | Stripe Checkout hosted, single price |
| SaaS with tiers | Subscription mode, customer portal |
| Marketplace/platform | Stripe Connect, split payments |
| B2B/enterprise | Invoicing, net-30 terms |
| High volume | Usage-based metering, bulk discounts |
| Physical goods | One-time + shipping calculation |

---

## TL;DR

| Feature | Use Case |
|---------|----------|
| **Checkout** | One-time payments, quick setup |
| **Subscriptions** | Recurring billing, SaaS |
| **Payment Intents** | Custom payment flows |
| **Invoicing** | Send invoices, track payments |
| **Connect** | Marketplace payments |

---

## Quick Start

### 1. Install

```bash
npm install stripe @stripe/stripe-js
```

### 2. Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Initialize

**Server (API routes):**
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // Use latest
});
```

**Client:**
```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

---

## Common Patterns

### One-Time Payment (Checkout)

**API Route:**
```typescript
// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { priceId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/canceled`,
  });

  return NextResponse.json({ url: session.url });
}
```

**Client:**
```typescript
const handleCheckout = async () => {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ priceId: 'price_xxx' }),
  });
  const { url } = await res.json();
  window.location.href = url;
};
```

### Subscription (SaaS)

**API Route:**
```typescript
// app/api/subscribe/route.ts
export async function POST(req: Request) {
  const { priceId, customerId } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId, // Or create new customer
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
```

### Webhook Handler

**CRITICAL: Always verify webhooks.**

```typescript
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
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      // Fulfill order, update database
      await handleCheckoutComplete(session);
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      // Update user's subscription status
      await handleSubscriptionUpdate(subscription);
      break;

    case 'customer.subscription.deleted':
      // Handle cancellation
      await handleSubscriptionCanceled(event.data.object);
      break;

    case 'invoice.paid':
      // Subscription renewed successfully
      break;

    case 'invoice.payment_failed':
      // Payment failed, notify user
      break;
  }

  return new Response('OK', { status: 200 });
}
```

---

## Pricing Models

### One-Time Products

```typescript
// Create in Stripe Dashboard or via API
const product = await stripe.products.create({
  name: 'Premium Template',
  description: 'Professional website template',
});

const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 4900, // $49.00 in cents
  currency: 'usd',
});
```

### Subscription Tiers

```typescript
// Free tier: No Stripe needed

// Pro tier
const proPrice = await stripe.prices.create({
  product: 'prod_xxx',
  unit_amount: 1900, // $19/month
  currency: 'usd',
  recurring: { interval: 'month' },
});

// Enterprise tier
const enterprisePrice = await stripe.prices.create({
  product: 'prod_xxx',
  unit_amount: 9900, // $99/month
  currency: 'usd',
  recurring: { interval: 'month' },
});
```

### Usage-Based

```typescript
const meteredPrice = await stripe.prices.create({
  product: 'prod_xxx',
  currency: 'usd',
  recurring: {
    interval: 'month',
    usage_type: 'metered',
  },
  unit_amount: 10, // $0.10 per unit
});

// Report usage
await stripe.subscriptionItems.createUsageRecord(
  'si_xxx',
  { quantity: 100, timestamp: Math.floor(Date.now() / 1000) }
);
```

---

## Customer Management

### Create Customer

```typescript
const customer = await stripe.customers.create({
  email: user.email,
  name: user.name,
  metadata: {
    userId: user.id,
  },
});

// Save customer.id to your database
await db.user.update({
  where: { id: user.id },
  data: { stripeCustomerId: customer.id },
});
```

### Customer Portal

Let users manage their own subscriptions:

```typescript
// app/api/portal/route.ts
export async function POST(req: Request) {
  const { customerId } = await req.json();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
```

---

## Invoicing

### Send Invoice

```typescript
const invoice = await stripe.invoices.create({
  customer: 'cus_xxx',
  collection_method: 'send_invoice',
  days_until_due: 30,
});

await stripe.invoiceItems.create({
  customer: 'cus_xxx',
  invoice: invoice.id,
  amount: 50000, // $500
  currency: 'usd',
  description: 'Website Development',
});

await stripe.invoices.sendInvoice(invoice.id);
```

### Invoice with Line Items

```typescript
const invoice = await stripe.invoices.create({
  customer: 'cus_xxx',
  collection_method: 'send_invoice',
  days_until_due: 14,
});

// Add multiple line items
const items = [
  { description: 'Design', amount: 150000 },
  { description: 'Development', amount: 250000 },
  { description: 'Hosting Setup', amount: 10000 },
];

for (const item of items) {
  await stripe.invoiceItems.create({
    customer: 'cus_xxx',
    invoice: invoice.id,
    amount: item.amount,
    currency: 'usd',
    description: item.description,
  });
}

await stripe.invoices.finalizeInvoice(invoice.id);
await stripe.invoices.sendInvoice(invoice.id);
```

---

## Security Checklist

- [ ] **Never expose secret key** - Only in server-side code
- [ ] **Verify webhooks** - Always check signature
- [ ] **Use HTTPS** - Required for production
- [ ] **Validate amounts** - Don't trust client-sent prices
- [ ] **Idempotency keys** - Prevent duplicate charges
- [ ] **Test mode first** - Use test keys during development

---

## Testing

### Test Cards

| Number | Result |
|--------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0000 0000 3220` | 3D Secure required |

### Test Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Common Issues

| Issue | Fix |
|-------|-----|
| Webhook not receiving | Check endpoint URL, verify secret |
| "No such price" | Use correct price ID from dashboard |
| Amount in wrong currency | Always use cents (multiply by 100) |
| Duplicate charges | Use idempotency keys |
| Customer not found | Create customer before checkout |

---

## Prompt Examples

```
"Implement Stripe checkout for one-time $49 product purchase"

"Add subscription billing with free, pro ($19/mo), and enterprise ($99/mo) tiers"

"Create webhook handler for subscription lifecycle events"

"Build customer portal integration for self-service billing management"

"Implement usage-based billing that charges $0.10 per API call"
```

---

## Official Resources

- **Docs**: stripe.com/docs
- **API Reference**: stripe.com/docs/api
- **Dashboard**: dashboard.stripe.com
- **CLI**: stripe.com/docs/stripe-cli
- **Testing**: stripe.com/docs/testing
