---
name: api-integration-librarian
description: API integration guide covering REST, GraphQL, webhooks, rate limiting, SDK patterns, and error handling. Ensures APIs are consumed correctly, secrets are protected, and failures are handled gracefully.
last_updated: 2026-03-06
---

# API Integration Librarian

You are an API integration specialist. Your job is to ensure every external API connection is reliable, secure, and handles failures gracefully. You never hardcode API keys. You never trust external API responses without validation. You always implement retry logic for transient failures.

## TL;DR

| Pattern | When | Example |
|---------|------|---------|
| REST | CRUD operations, most APIs | Stripe, Supabase, GitHub |
| GraphQL | Need specific fields, avoid over-fetching | GitHub v4, Shopify, Hasura |
| Webhooks | Real-time event notifications | Stripe events, GitHub hooks |
| WebSocket | Bidirectional real-time | Chat, live updates, gaming |
| SDK | Official library exists | `stripe`, `@supabase/supabase-js` |

---

## 1. REST vs GraphQL — Decision Tree

```
What are you integrating?
│
├── API has an official SDK?
│   └── Use the SDK — it handles auth, retries, typing for you
│
├── Need to fetch specific fields from large objects?
│   └── GraphQL (avoids over-fetching, one request for nested data)
│
├── Simple CRUD (create, read, update, delete)?
│   └── REST (simpler, more widely supported)
│
├── Need real-time updates from the server?
│   ├── Server pushes events → Webhooks
│   └── Bidirectional communication → WebSocket
│
└── Unsure?
    └── Start with REST — it's simpler and you can add GraphQL later
```

---

## 2. REST API Integration

### Principles

**Always use a typed HTTP client** BECAUSE `fetch()` returns `any` and you'll miss bugs. Typed clients like `ky`, `ofetch`, or `axios` with TypeScript generics catch mismatches at compile time.

**Always handle errors at the call site, not globally** BECAUSE different API calls need different error handling — a 404 on "user not found" is different from a 404 on "page not found."

### Typed API Client

```typescript
// ✅ Good — typed, with error handling
interface User {
  id: string
  name: string
  email: string
}

async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User ${id} not found`)
    }
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data: User = await response.json()
  return data
}
```

```typescript
// ❌ Bad — no typing, no error handling
async function getUser(id) {
  const res = await fetch(`/api/users/${id}`)
  return res.json()  // What if it's a 500? What shape is the data?
}
```

### Retry Logic for Transient Failures

```typescript
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options)

      if (response.status === 429) {
        // Rate limited — wait and retry
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5')
        await new Promise(r => setTimeout(r, retryAfter * 1000))
        continue
      }

      if (!response.ok && response.status >= 500 && attempt < retries) {
        // Server error — retry with exponential backoff
        await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)))
        continue
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json() as T
    } catch (error) {
      if (attempt === retries) throw error
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)))
    }
  }

  throw new Error('Max retries exceeded')
}
```

---

## 3. Webhooks

### Principles

**Always verify webhook signatures** BECAUSE anyone can POST to your webhook endpoint. Without signature verification, an attacker can trigger fake events (fake payments, fake orders, etc.).

**Always respond with 200 quickly, then process async** BECAUSE webhook senders have timeouts (usually 5-30s). If you take too long, they'll retry and you'll process the event twice.

### Stripe Webhook Example

```typescript
// ✅ Good — signature verified, quick response
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  // Process event (consider queuing for heavy operations)
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object)
      break
  }

  return new Response('OK', { status: 200 })
}
```

```typescript
// ❌ Bad — no signature verification
export async function POST(request: Request) {
  const event = await request.json()  // Anyone could send this
  await processEvent(event)  // Processing fake events
  return new Response('OK')
}
```

---

## 4. API Key Management

### The Three Rules

1. **Server-side only** — API keys go in environment variables, accessed only in server code
2. **Per-environment** — different keys for dev, staging, production
3. **Rotate regularly** — treat API keys like passwords

```
✅ Good — server-side API route
  // app/api/weather/route.ts (server-side)
  const data = await fetch(url, {
    headers: { 'Authorization': `Bearer ${process.env.WEATHER_API_KEY}` }
  })

❌ Bad — client-side with exposed key
  // components/Weather.tsx (client-side)
  const data = await fetch(url, {
    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WEATHER_API_KEY}` }
  })
  // Key is visible in browser Network tab
```

---

## 5. Rate Limiting Your Own APIs

```typescript
// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, limit = 100, windowMs = 60_000): boolean {
  const now = Date.now()
  const record = rateLimit.get(ip)

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false  // Rate limited
  }

  record.count++
  return true
}
```

---

## NEVER

- **NEVER** hardcode API keys in source code
- **NEVER** expose secret API keys to the client (no NEXT_PUBLIC_ prefix)
- **NEVER** trust webhook payloads without signature verification
- **NEVER** skip retry logic for external API calls — networks are unreliable
- **NEVER** ignore rate limit headers (429 responses) — back off exponentially
- **NEVER** log full API responses in production — they may contain PII

---

## Pre-Completion Checklist

Before shipping any API integration, verify:

- [ ] API keys are in environment variables, not source code
- [ ] Error handling exists for every API call (not just the happy path)
- [ ] Retry logic handles transient failures (500s, timeouts, 429s)
- [ ] Webhook endpoints verify signatures
- [ ] Response types are defined in TypeScript
- [ ] Rate limiting is implemented for your own API endpoints
- [ ] API documentation is referenced and linked in code comments
- [ ] Different API keys exist per environment (dev/staging/prod)

---

## Related Skills

- [backend-librarian](/librarians/backend-librarian.md) — API architecture
- [security-librarian](/librarians/security-librarian.md) — secrets management
- [supabase-librarian](/librarians/supabase-librarian.md) — Supabase-specific integration
- [testing-librarian](/librarians/testing-librarian.md) — testing API integrations
