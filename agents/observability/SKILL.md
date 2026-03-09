---
name: observability
description: Monitoring, logging, and observability. Axiom, Sentry, web-vitals, and structured logging.
owner: Frank
last_updated: 2026-03
---

# Observability

Know what's happening in production.

---

## Context Questions

Before implementing observability:

1. **What's the deployment target?** — Vercel, AWS, GCP, self-hosted
2. **What's the scale?** — MVP/startup vs high-traffic production
3. **What's the budget?** — Free tier vs paid observability stack
4. **What needs monitoring?** — Errors, performance, business metrics
5. **Who responds to issues?** — Solo dev vs on-call team

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Simple logging ←→ Full observability stack |
| **Cost** | Free tiers ←→ Enterprise tools |
| **Depth** | Error tracking only ←→ Distributed tracing |
| **Response** | Async review ←→ Real-time alerting |
| **Integration** | Platform-native ←→ Custom stack |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Vercel + Next.js | Sentry + Vercel Analytics + Axiom |
| AWS deployment | CloudWatch + X-Ray + Sentry |
| Budget-conscious MVP | Sentry free tier + console logging |
| High-traffic SaaS | Full Axiom stack + custom metrics |
| Multiple services | Distributed tracing (OpenTelemetry) |
| Solo developer | Sentry + web-vitals (minimal setup) |

---

## TL;DR

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking, crash reports |
| **Axiom** | Logs, metrics, traces (Vercel-friendly) |
| **Vercel Analytics** | Real User Monitoring (RUM) |
| **web-vitals** | Core Web Vitals tracking |

---

## Sentry (Error Tracking)

### Setup

```bash
npx @sentry/wizard@latest -i nextjs
```

This creates all config automatically. For manual setup:

```bash
pnpm add @sentry/nextjs
```

```js
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Custom Error Tracking

```typescript
import * as Sentry from "@sentry/nextjs";

// Capture exception
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: "checkout" },
    extra: { userId, orderId },
  });
  throw error;
}

// Capture message
Sentry.captureMessage("User completed onboarding", {
  level: "info",
  tags: { flow: "onboarding" },
});

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
});
```

### Error Boundary

```tsx
"use client";

import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  Sentry.captureException(error);

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

---

## Axiom (Logs & Metrics)

### Why Axiom?

- Works great with Vercel
- Generous free tier
- Fast queries on large datasets
- Native Next.js integration

### Setup

```bash
pnpm add @axiomhq/next
```

```typescript
// lib/axiom.ts
import { Axiom } from "@axiomhq/js";

export const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});
```

### Structured Logging

```typescript
// lib/logger.ts
import { axiom } from "./axiom";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEvent {
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

export const logger = {
  debug: (message: string, data?: object) => log("debug", message, data),
  info: (message: string, data?: object) => log("info", message, data),
  warn: (message: string, data?: object) => log("warn", message, data),
  error: (message: string, data?: object) => log("error", message, data),
};

function log(level: LogLevel, message: string, data?: object) {
  const event: LogEvent = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };

  // Always log to console
  console[level](message, data);

  // Send to Axiom in production
  if (process.env.NODE_ENV === "production") {
    axiom.ingest("logs", [event]);
  }
}
```

### Usage

```typescript
import { logger } from "@/lib/logger";

// In API routes
export async function POST(req: Request) {
  logger.info("Creating user", { email: user.email });
  
  try {
    const user = await createUser(data);
    logger.info("User created", { userId: user.id });
    return Response.json(user);
  } catch (error) {
    logger.error("Failed to create user", { 
      error: error.message,
      email: data.email,
    });
    throw error;
  }
}
```

### Vercel Integration

```bash
# Install Vercel Axiom integration
# Go to: vercel.com/integrations/axiom

# This automatically sends:
# - Function logs
# - Edge logs
# - Build logs
```

---

## Web Vitals

### Built-in Next.js Reporting

```tsx
// app/layout.tsx or pages/_app.tsx
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to your analytics
    console.log(metric);

    // Example: Send to Axiom
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating, // "good" | "needs-improvement" | "poor"
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    });

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/vitals", body);
    } else {
      fetch("/api/vitals", { body, method: "POST", keepalive: true });
    }
  });

  return null;
}
```

### Vitals API Endpoint

```typescript
// app/api/vitals/route.ts
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const metric = await req.json();
  
  logger.info("web-vital", {
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
  });

  return new Response("ok");
}
```

### What to Track

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| LCP | ≤2.5s | ≤4s | >4s |
| INP | ≤200ms | ≤500ms | >500ms |
| CLS | ≤0.1 | ≤0.25 | >0.25 |

---

## Vercel Analytics

### Speed Insights (Core Web Vitals)

```bash
pnpm add @vercel/speed-insights
```

```tsx
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Analytics (Page Views)

```bash
pnpm add @vercel/analytics
```

```tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Custom Metrics

### Track Business Events

```typescript
// lib/metrics.ts
import { logger } from "./logger";

export const metrics = {
  // User events
  userSignup: (userId: string, source: string) => {
    logger.info("user.signup", { userId, source });
  },
  
  userLogin: (userId: string) => {
    logger.info("user.login", { userId });
  },

  // Business events
  orderCreated: (orderId: string, amount: number) => {
    logger.info("order.created", { orderId, amount });
  },
  
  paymentCompleted: (orderId: string, amount: number, provider: string) => {
    logger.info("payment.completed", { orderId, amount, provider });
  },

  // Performance events
  apiLatency: (endpoint: string, durationMs: number) => {
    logger.info("api.latency", { endpoint, durationMs });
  },
};
```

### Usage

```typescript
import { metrics } from "@/lib/metrics";

// In your code
metrics.userSignup(user.id, "google");
metrics.orderCreated(order.id, order.total);
metrics.apiLatency("/api/users", endTime - startTime);
```

---

## Request Tracing

### Add Trace IDs

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const traceId = request.headers.get("x-trace-id") || crypto.randomUUID();
  
  const response = NextResponse.next();
  response.headers.set("x-trace-id", traceId);
  
  return response;
}
```

### Include in Logs

```typescript
// lib/logger.ts
export function createLogger(traceId: string) {
  return {
    info: (message: string, data?: object) => {
      log("info", message, { ...data, traceId });
    },
    error: (message: string, data?: object) => {
      log("error", message, { ...data, traceId });
    },
  };
}

// Usage in API route
export async function GET(req: Request) {
  const traceId = req.headers.get("x-trace-id") || "unknown";
  const log = createLogger(traceId);
  
  log.info("Fetching users");
  // ...
}
```

---

## Alerting

### Sentry Alerts

- Configure in Sentry dashboard
- Alert on: error rate spikes, new errors, performance degradation

### Axiom Monitors

```typescript
// Create monitors in Axiom dashboard
// Example queries:
// 
// Error rate:
// | where level == "error"
// | summarize count() by bin(_time, 5m)
//
// Slow API calls:
// | where durationMs > 1000
// | summarize count() by endpoint
```

### Simple Alerting Webhook

```typescript
// lib/alerts.ts
async function sendAlert(message: string, severity: "low" | "high") {
  // Slack
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: "POST",
    body: JSON.stringify({ text: `[${severity.toUpperCase()}] ${message}` }),
  });

  // Or Discord, PagerDuty, etc.
}

// Usage
if (errorRate > threshold) {
  await sendAlert("Error rate exceeded threshold", "high");
}
```

---

## Quick Setup Checklist

```markdown
## Minimum Viable Observability
- [ ] Sentry for error tracking
- [ ] Vercel Analytics/Speed Insights
- [ ] Structured logging in API routes

## Production Ready
- [ ] All of the above
- [ ] Axiom for log aggregation
- [ ] Custom business metrics
- [ ] Web Vitals tracking
- [ ] Alerting configured

## Enterprise
- [ ] All of the above
- [ ] Distributed tracing
- [ ] Custom dashboards
- [ ] SLO monitoring
- [ ] On-call rotation
```

---

## Resources

- Sentry Next.js: [docs.sentry.io/platforms/javascript/guides/nextjs](https://docs.sentry.io/platforms/javascript/guides/nextjs)
- Axiom: [axiom.co/docs](https://axiom.co/docs)
- Web Vitals: [web.dev/vitals](https://web.dev/vitals)
- Vercel Analytics: [vercel.com/docs/analytics](https://vercel.com/docs/analytics)
