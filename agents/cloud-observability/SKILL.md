---
name: cloud-observability
description: Production monitoring. Logging, metrics, distributed tracing, alerting, Grafana dashboards.
owner: Frank
last_updated: 2026-03
---

# Cloud Observability

See what's happening in production.

> **See also:** `agents/monitoring/SKILL.md` for error tracking (Sentry)

---

## Context Questions

Before setting up cloud observability:

1. **What cloud provider?** — AWS, GCP, Azure, multi-cloud
2. **What's the architecture?** — Monolith, microservices, serverless
3. **What's the scale?** — Small team vs enterprise
4. **What's the budget?** — Open source vs managed services
5. **What SLAs?** — Best effort vs 99.9% uptime requirements

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Stack** | Open source (Prometheus/Grafana) ←→ Managed (Datadog) |
| **Pillars** | Logs only ←→ Full observability (logs + metrics + traces) |
| **Alerting** | Slack notifications ←→ PagerDuty on-call |
| **Retention** | 7 days ←→ Years (compliance) |
| **Cost** | Free tiers ←→ Usage-based enterprise |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Startup/MVP | Axiom + Grafana Cloud free tier |
| AWS native | CloudWatch + X-Ray |
| Microservices | OpenTelemetry + distributed tracing |
| High uptime SLA | PagerDuty + runbooks + dashboards |
| Cost-sensitive | Prometheus + Grafana self-hosted |
| Enterprise compliance | Datadog or Splunk (audit trails) |

---

## TL;DR

| Pillar | Tools |
|--------|-------|
| **Logs** | Axiom, Datadog, CloudWatch |
| **Metrics** | Prometheus, Grafana, Datadog |
| **Traces** | Jaeger, Tempo, Datadog APM |
| **Alerting** | PagerDuty, Opsgenie, Slack |

**Start with:** Logging + basic metrics. Add tracing when debugging distributed issues.

---


## Part 1: The Three Pillars

```
┌─────────────────────────────────────────────────────┐
│                   OBSERVABILITY                      │
├─────────────┬─────────────┬─────────────────────────┤
│    LOGS     │   METRICS   │        TRACES           │
│  "What      │  "How much  │  "What path did this    │
│   happened" │   and fast" │   request take?"        │
├─────────────┼─────────────┼─────────────────────────┤
│  Structured │  Counters   │  Spans                  │
│  JSON logs  │  Gauges     │  Context propagation    │
│  Searchable │  Histograms │  Service maps           │
└─────────────┴─────────────┴─────────────────────────┘
```

---

## Part 2: Structured Logging

### Setup with Pino (Node.js)

```bash
npm install pino pino-pretty
```

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    env: process.env.NODE_ENV,
    service: 'my-app',
    version: process.env.APP_VERSION,
  },
})

// Usage
logger.info({ userId: '123', action: 'login' }, 'User logged in')
logger.error({ err, requestId: '456' }, 'Payment failed')
```

### Structured Log Format

```json
{
  "level": "info",
  "time": 1703596800000,
  "service": "my-app",
  "env": "production",
  "requestId": "req-123",
  "userId": "user-456",
  "action": "checkout",
  "duration_ms": 234,
  "msg": "Checkout completed"
}
```

### What to Log

| Level | When |
|-------|------|
| **error** | Failures that need attention |
| **warn** | Unusual but handled situations |
| **info** | Key business events |
| **debug** | Development troubleshooting |

### What NOT to Log

- Passwords, API keys, tokens
- Full credit card numbers
- PII without consent
- Health check spam
- Every database query

---

## Part 3: Metrics with Prometheus

### Setup

```bash
npm install prom-client
```

```typescript
// lib/metrics.ts
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'

export const register = new Registry()

// Collect Node.js defaults (memory, CPU, etc.)
collectDefaultMetrics({ register })

// Custom metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
})

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
})

export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Current active connections',
  registers: [register],
})
```

### Expose Metrics Endpoint

```typescript
// app/api/metrics/route.ts (Next.js)
import { register } from '@/lib/metrics'

export async function GET() {
  const metrics = await register.metrics()
  return new Response(metrics, {
    headers: { 'Content-Type': register.contentType },
  })
}
```

### Recording Metrics

```typescript
// Middleware
export function metricsMiddleware(req, res, next) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    
    httpRequestsTotal.inc({
      method: req.method,
      path: req.path,
      status: res.statusCode,
    })
    
    httpRequestDuration.observe(
      { method: req.method, path: req.path },
      duration
    )
  })
  
  next()
}
```

### Metric Types

| Type | Use Case | Example |
|------|----------|---------|
| **Counter** | Events that only increase | Requests, errors, signups |
| **Gauge** | Values that go up/down | Active users, queue size |
| **Histogram** | Distribution of values | Latency, request size |
| **Summary** | Percentiles (client-side) | Response times |

---

## Part 4: Distributed Tracing

### OpenTelemetry Setup

```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

```typescript
// instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

const sdk = new NodeSDK({
  serviceName: 'my-app',
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
})

sdk.start()
```

### Manual Spans

```typescript
import { trace } from '@opentelemetry/api'

const tracer = trace.getTracer('my-app')

async function processOrder(orderId: string) {
  return tracer.startActiveSpan('process-order', async (span) => {
    try {
      span.setAttribute('order.id', orderId)
      
      // Child span
      await tracer.startActiveSpan('validate-inventory', async (childSpan) => {
        const result = await checkInventory(orderId)
        childSpan.setAttribute('inventory.available', result)
        childSpan.end()
      })
      
      // More processing...
      
      span.setStatus({ code: SpanStatusCode.OK })
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message })
      span.recordException(error)
      throw error
    } finally {
      span.end()
    }
  })
}
```

### Context Propagation

```typescript
// Pass trace context to downstream services
import { propagation, context } from '@opentelemetry/api'

async function callDownstream(url: string, data: any) {
  const headers: Record<string, string> = {}
  
  // Inject trace context into headers
  propagation.inject(context.active(), headers)
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  })
}
```

---

## Part 5: Alerting

### Alert Categories

| Severity | Response Time | Example |
|----------|---------------|---------|
| **Critical** | < 5 min | Site down, payments failing |
| **Warning** | < 1 hour | Error rate elevated, latency high |
| **Info** | Next business day | Disk 70%, unusual traffic |

### Alert Rules (Prometheus/Grafana)

```yaml
# alerts.yml
groups:
  - name: app-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) 
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error rate > 5%"
          
      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, 
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
          ) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "P95 latency > 2s"
          
      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
```

### Alert Best Practices

| Do | Don't |
|----|-------|
| Alert on symptoms (users affected) | Alert on every error |
| Include runbook links | Use vague messages |
| Set appropriate thresholds | Alert on transient issues |
| Have clear ownership | Alert everyone |
| Review and tune alerts | Set and forget |

---

## Part 6: Grafana Dashboards

### Dashboard Structure

```
┌────────────────────────────────────────────────────┐
│  Service Health Dashboard                          │
├────────────────────────────────────────────────────┤
│  [Overview Row]                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Uptime  │ │ RPS     │ │ Error % │ │ P95 ms  │  │
│  │ 99.9%   │ │ 1.2k    │ │ 0.1%    │ │ 234     │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
├────────────────────────────────────────────────────┤
│  [Request Rate Graph]                              │
│  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█                          │
├────────────────────────────────────────────────────┤
│  [Latency Heatmap]        [Error Rate Graph]       │
│  ▓▓▒░░░░░░░░░            ─────────────────────    │
└────────────────────────────────────────────────────┘
```

### Key Panels

```
// Request Rate
rate(http_requests_total[5m])

// Error Rate
sum(rate(http_requests_total{status=~"5.."}[5m])) 
/ sum(rate(http_requests_total[5m]))

// P50/P95/P99 Latency
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

// Active Users (Gauge)
active_connections

// Saturation (how full is the resource)
process_resident_memory_bytes / process_max_memory_bytes
```

### Dashboard as Code

```json
// dashboard.json (Grafana)
{
  "title": "Service Health",
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "targets": [
        {
          "expr": "sum(rate(http_requests_total[5m])) by (path)"
        }
      ]
    }
  ]
}
```

---

## Part 7: Cost of Observability

| Tool | Free Tier | Paid |
|------|-----------|------|
| **Axiom** | 500GB/month | Usage-based |
| **Grafana Cloud** | 10k metrics, 50GB logs | $49+/mo |
| **Datadog** | None | $15/host/mo + |
| **AWS CloudWatch** | Basic | $0.30/GB logs |

### Cost Optimization

1. **Log sampling** — Sample verbose logs in production
2. **Metric cardinality** — Limit unique label combinations
3. **Retention policies** — Keep detailed logs for 7 days, aggregated longer
4. **Filter noise** — Don't log health checks, debug in prod

---

## Part 8: Quick Start Stack

### For Startups (Free/Cheap)

```
Logs:     Axiom (generous free tier)
Metrics:  Grafana Cloud Free
Traces:   Grafana Tempo (if needed)
Alerts:   Grafana Alerting → Slack
```

### For Production

```
Logs:     Datadog Logs or Axiom
Metrics:  Prometheus + Grafana
Traces:   Datadog APM or Jaeger
Alerts:   PagerDuty for critical, Slack for warnings
```

---

## Checklist

- [ ] Structured logging with JSON format
- [ ] Request ID in all logs
- [ ] Key metrics exposed (/metrics endpoint)
- [ ] Error rate and latency dashboards
- [ ] Critical alerts with paging
- [ ] Warning alerts to Slack
- [ ] Runbooks linked in alerts
- [ ] Log retention policy set
- [ ] Trace sampling configured

---

## Resources

- Prometheus Docs: https://prometheus.io/docs/
- Grafana Dashboards: https://grafana.com/grafana/dashboards/
- OpenTelemetry: https://opentelemetry.io/docs/
- Axiom: https://axiom.co/docs

---

## Related Skills

- `agents/monitoring/SKILL.md` — Sentry, error tracking
- `agents/deployment/SKILL.md` — CI/CD and health checks
- `agents/performance/SKILL.md` — Performance optimization
