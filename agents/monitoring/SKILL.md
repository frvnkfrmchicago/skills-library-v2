---
name: monitoring
description: Error tracking, performance monitoring, alerting, and production debugging.
owner: Frank
last_updated: 2026-03
---

# Monitoring & Observability Skill

**Error tracking, performance monitoring, alerting, and production debugging.**

---

## Context Questions

Before setting up monitoring:

1. **What's the deployment?** — Vercel, AWS, self-hosted
2. **What's the budget?** — Free tiers only vs paid tools
3. **What needs monitoring?** — Errors, performance, user behavior
4. **Who responds to alerts?** — Solo dev vs on-call team
5. **What's the SLA?** — Best effort vs 99.9% uptime

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Tools** | Free (Sentry free tier) ←→ Enterprise (Datadog) |
| **Alerting** | Email/Slack ←→ PagerDuty on-call |
| **Depth** | Error tracking only ←→ Full APM |
| **Session Replay** | None ←→ Full replay (PostHog) |
| **Logs** | Console only ←→ Structured logging (Axiom) |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| MVP/Startup | Sentry free + Vercel Analytics |
| Production SaaS | Sentry + Axiom + PostHog |
| Enterprise | Datadog or custom stack |
| User debugging | Session replay (PostHog) |
| API performance | Custom latency tracking |
| Compliance needs | Full audit logging + retention |

---

## TL;DR

| Tool | Purpose | Cost |
|------|---------|------|
| **Sentry** | Error tracking, source maps | Free tier generous |
| **Vercel Analytics** | Core Web Vitals, performance | Free with Vercel |
| **PostHog** | User analytics, session replay | Free tier |
| **Axiom** | Logs, structured logging | Free tier |

**Minimum production setup:** Sentry + Vercel Analytics

---


## Part 1: Sentry Setup (Errors)

### Installation

```bash
npx @sentry/wizard@latest -i nextjs
```

This creates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

### Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Capture 10% of transactions for performance
  tracesSampleRate: 0.1,
  
  // Capture 100% of errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Don't send errors in development
  enabled: process.env.NODE_ENV === 'production',
  
  // Filter out noise
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Network request failed',
  ],
});
```

### Error Boundaries

```tsx
// app/global-error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <button onClick={reset} className="mt-4 btn">
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### Manual Error Capture

```typescript
import * as Sentry from '@sentry/nextjs';

// Capture with context
try {
  await processPayment(userId, amount);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'payments' },
    extra: { userId, amount },
  });
  throw error;
}

// Capture breadcrumb
Sentry.addBreadcrumb({
  category: 'user',
  message: 'User clicked checkout',
  level: 'info',
});
```

---

## Part 2: Performance Monitoring

### Vercel Analytics (Built-in)

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Web Vitals Tracking

```typescript
// app/layout.tsx
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to your analytics
    console.log(metric);
    
    // Or send to Sentry
    Sentry.captureMessage(`Web Vital: ${metric.name}`, {
      extra: {
        value: metric.value,
        rating: metric.rating,
      },
    });
  });
  
  return null;
}
```

### API Latency Tracking

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const start = Date.now();
  const response = NextResponse.next();
  
  const duration = Date.now() - start;
  response.headers.set('X-Response-Time', `${duration}ms`);
  
  // Log slow requests
  if (duration > 1000) {
    console.warn(`Slow request: ${request.url} took ${duration}ms`);
  }
  
  return response;
}
```

---

## Part 3: Alerting

### Sentry Alerts

Set up in Sentry dashboard:
1. Go to Alerts → Create Rule
2. Choose conditions:
   - Error count > 10 in 1 hour
   - New issues only
   - Specific transaction errors

### Slack Integration

```typescript
// lib/alerts.ts
export async function alertSlack(
  channel: string,
  message: string,
  severity: 'info' | 'warning' | 'critical'
) {
  const emoji = {
    info: 'ℹ️',
    warning: '⚠️',
    critical: '🚨',
  };

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel,
      text: `${emoji[severity]} ${message}`,
    }),
  });
}

// Usage
await alertSlack('#alerts', 'Payment failed for user 123', 'critical');
```

### Email Alerts

```typescript
// Use with Resend (see email skill)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function alertEmail(subject: string, body: string) {
  await resend.emails.send({
    from: 'alerts@yourdomain.com',
    to: 'team@yourdomain.com',
    subject: `[ALERT] ${subject}`,
    text: body,
  });
}
```

---

## Part 4: Log Management

### Structured Logging

```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export function log(
  level: LogLevel,
  message: string,
  context?: LogContext
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  
  if (process.env.NODE_ENV === 'production') {
    // Send to Axiom/Logtail
    console.log(JSON.stringify(entry));
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
}

// Usage
log('info', 'User signed up', { userId: user.id, plan: 'pro' });
log('error', 'Payment failed', { userId, error: err.message });
```

### Axiom Setup

```bash
npm install @axiomhq/nextjs
```

```typescript
// lib/axiom.ts
import { Axiom } from '@axiomhq/js';

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
});

export async function logToAxiom(
  dataset: string,
  events: object[]
) {
  await axiom.ingest(dataset, events);
}

// Usage
await logToAxiom('production-logs', [
  { event: 'purchase', amount: 99, userId: '123' },
]);
```

---

## Part 5: Production Debugging

### Session Replay (PostHog)

```bash
npm install posthog-js
```

```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://app.posthog.com',
    capture_pageview: false,
    session_recording: {
      maskAllInputs: true,
      maskTextContent: true,
    },
  });
}

export { posthog };
```

```typescript
// Track events
posthog.capture('purchase_completed', {
  amount: 99,
  product: 'pro_plan',
});

// Identify user
posthog.identify(user.id, {
  email: user.email,
  plan: user.plan,
});
```

### Error Context

```typescript
// When catching errors, add context
Sentry.setUser({ id: user.id, email: user.email });
Sentry.setTag('page', window.location.pathname);
Sentry.setContext('cart', { items: cart.items, total: cart.total });
```

### Reproducing Issues

1. **Get Sentry issue ID** from error
2. **Check session replay** in PostHog
3. **Search logs** in Axiom for request ID
4. **Check performance** in Vercel Analytics

---

## Part 6: Health Checks

### API Health Endpoint

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {
    console.error('Database health check failed', e);
  }

  try {
    await redis.ping();
    checks.redis = true;
  } catch (e) {
    console.error('Redis health check failed', e);
  }

  const healthy = checks.database && checks.redis;

  return Response.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

### Cron Health Check

```typescript
// app/api/cron/health/route.ts
export async function GET() {
  // Run full health check
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/health`);
  const health = await response.json();

  if (!response.ok) {
    await alertSlack('#alerts', 'Health check failed!', 'critical');
  }

  return Response.json(health);
}
```

---

## Part 7: Dashboard Setup

### What to Monitor

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Error rate | < 0.1% | 0.1-1% | > 1% |
| P95 latency | < 500ms | 500ms-2s | > 2s |
| Uptime | > 99.9% | 99-99.9% | < 99% |
| LCP | < 2.5s | 2.5-4s | > 4s |

### Quick Dashboard

```markdown
## Production Dashboard

### Real-time
- [ ] Sentry: Open errors
- [ ] Vercel: Deployment status
- [ ] PostHog: Active users

### Daily Review
- [ ] Error trends (Sentry)
- [ ] Performance trends (Vercel)
- [ ] User flows (PostHog)

### Weekly Review
- [ ] P95 latency trends
- [ ] Error patterns
- [ ] Feature usage
```

---

## Quick Setup Checklist

```bash
# 1. Sentry
npx @sentry/wizard@latest -i nextjs

# 2. Vercel Analytics (add to layout)
import { Analytics } from '@vercel/analytics/react';

# 3. Structured logging
# Create lib/logger.ts (see above)

# 4. Health endpoint
# Create app/api/health/route.ts
```

---

## Resources

- Sentry: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- PostHog: https://posthog.com/docs/libraries/next-js
- Axiom: https://axiom.co/docs/send-data/nextjs

---

## Related Skills

- `agents/error-handling/SKILL.md` - Error boundaries, graceful degradation
- `agents/observability/SKILL.md` - Deeper observability patterns
- `agents/backend-patterns/SKILL.md` - Job monitoring
- `agents/deployment/SKILL.md` - CI/CD alerting
