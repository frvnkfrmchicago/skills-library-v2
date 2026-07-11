---
name: api-integrating
description: >
  Enforces API integration standards for REST, GraphQL, webhooks, and
  WebSocket connections. Covers typed HTTP clients, retry logic with
  exponential backoff, webhook signature verification, API key management,
  and rate limiting. Use when consuming external APIs, building webhook
  endpoints, or managing API keys and secrets.
---

## Government Open Data Pitfall

When integrating government open-data feeds (Socrata, ArcGIS Hub, state data portals):
- **Feeds get removed without warning.** States are migrating away from Socrata to proprietary portals. Always verify the endpoint is live before wiring an adapter. Cache the last-known-good schema.
- **Source classification tier system**: Tier 1 (machine-readable JSON/CSV/API), Tier 2 (HTML scrape target), Tier 3 (manual registry only, <50 records), Tier 4 (needs further research).
- **XLS/XLSX downloads** from agency "frequently requested lists" pages are more stable than Socrata feeds but require file download + parse adapter.
- **ArcGIS FeatureServer** endpoints are reliable: `query?where=1%3D1&outFields=*&f=json` returns all records.

# API Integrating

Ensure every external API connection is reliable, typed, secure, and handles
failures gracefully.

---

## 1. Integration Type Decision Tree

```
What are you integrating?
│
├── API has an official SDK?
│   └── Use the SDK — it handles auth, retries, typing for you
│
├── Need specific fields from large objects?
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
    └── Start with REST — add GraphQL later if needed
```

---

## 2. REST API Integration

### Typed API Client

```typescript
// ✅ REQUIRED — typed, with explicit error handling
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

### Retry Logic with Exponential Backoff

```typescript
// ✅ REQUIRED for all external API calls
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
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5')
        await new Promise(r => setTimeout(r, retryAfter * 1000))
        continue
      }

      if (!response.ok && response.status >= 500 && attempt < retries) {
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

## 3. Webhook Integration

**Always verify webhook signatures.** Without verification, anyone can POST
fake events to your endpoint (fake payments, fake orders).

**Always respond with 200 quickly, then process async.** Webhook senders
timeout at 5-30s. Slow responses cause duplicate processing.

### Stripe Webhook Example

```typescript
// ✅ REQUIRED — signature verified, quick response
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

## ⛔ STOP GATE — Webhooks
Run: `grep -rn "constructEvent\|verify.*signature\|verifyWebhookSignature" --include="*.ts" src/`
Every webhook endpoint MUST verify signatures. List any without verification.

---

## 4. API Key Management

### The Three Rules

1. **Server-side only** — API keys in env vars, accessed only in server code
2. **Per-environment** — different keys for dev, staging, production
3. **Rotate regularly** — treat API keys like passwords

```
✅ Good — server-side API route
  // app/api/weather/route.ts (server-side)
  headers: { 'Authorization': `Bearer ${process.env.WEATHER_API_KEY}` }

❌ Bad — client-side with exposed key
  // components/Weather.tsx (client-side)
  headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WEATHER_API_KEY}` }
  // Key is visible in browser Network tab
```

## ⛔ STOP GATE — API Keys
Run: `grep -rn "NEXT_PUBLIC_.*KEY\|NEXT_PUBLIC_.*SECRET" --include="*.ts" --include="*.tsx" src/`
Any public-prefixed secret key = 🔴 CRITICAL. Keys must stay server-side.

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

  if (record.count >= limit) return false
  record.count++
  return true
}
```

---

## NEVER

- **NEVER** hardcode API keys in source code
- **NEVER** expose secret keys to the client (`NEXT_PUBLIC_` prefix)
- **NEVER** trust webhook payloads without signature verification
- **NEVER** skip retry logic for external API calls
- **NEVER** ignore 429 responses — back off exponentially
- **NEVER** log full API responses in production — they may contain PII

---

## 6. Unified API Tracker CLI (VM Integration)

To gather market odds, macroeconomic data, regulatory alerts, social sentiment, and financial stock info, run the pre-installed unified `api_tracker.py` utility on the VM.

### Usage Options:
```bash
# Polymarket Sentiment & Odds
python3 ~/.hermes/api_tracker.py --source polymarket --query "trump" --limit 5

# Kalshi Prediction Markets
python3 ~/.hermes/api_tracker.py --source kalshi --query "Fed" --limit 5
# Look up specific Kalshi ticker details:
python3 ~/.hermes/api_tracker.py --source kalshi --ticker "FED-26DEC31-T8.00"

# FRED Macroeconomic Indicators (Keyless Fallback active)
python3 ~/.hermes/api_tracker.py --source fred --series-id UNRATE --limit 12
python3 ~/.hermes/api_tracker.py --source fred --series-id FEDFUNDS --limit 12

# OpenFDA Drug Recalls & Enforcement
python3 ~/.hermes/api_tracker.py --source openfda --query "aspirin" --limit 5

# Bluesky Social Sentiment
python3 ~/.hermes/api_tracker.py --source bsky --query "trading" --limit 5

# HackerNews Top Trending Stories
python3 ~/.hermes/api_tracker.py --source hackernews --limit 10

# Yahoo Finance Real-time Stock Quote & Chart history
python3 ~/.hermes/api_tracker.py --source yfinance --ticker AAPL --range 5d --interval 1d
```

### JSON Output Schema:
All CLI outputs are formatted as clean JSON to stdout for easy parsing. If the query succeeds, `success` will be `true`. If it fails, `success` is `false` and an `error` string is provided with a non-zero exit code.

---

## Pre-Completion Checklist

- [ ] API keys are in environment variables, not source code
- [ ] Error handling on every API call (not just the happy path)
- [ ] Retry logic handles transient failures (500s, timeouts, 429s)
- [ ] Webhook endpoints verify signatures
- [ ] Response types defined in TypeScript
- [ ] Rate limiting on your own API endpoints
- [ ] Different API keys per environment (dev/staging/prod)

