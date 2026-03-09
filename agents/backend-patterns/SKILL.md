# Backend Patterns Skill

**Queues, caching, background jobs, and API design for Next.js.**

---

## TL;DR

| Pattern | Tool | When to Use |
|---------|------|-------------|
| **Queue/Jobs** | BullMQ + Redis | Background processing, bulk operations |
| **Caching** | Upstash Redis | Repeated reads, API responses |
| **Scheduled** | Vercel Cron | Recurring tasks, cleanup |
| **Pub/Sub** | Redis | Real-time events, notifications |

---

## Context Questions (Ask Before Recommending)

Before suggesting backend patterns:

1. **What's the operation type?** (immediate response, background job, scheduled)
2. **What's the latency requirement?** (real-time, near-real-time, async OK)
3. **What's the scale?** (single user, concurrent users, high-throughput)
4. **Error tolerance?** (can fail silently, must retry, critical)
5. **Hosting constraints?** (Vercel serverless, dedicated server, edge)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Timing** | Sync (immediate) ←→ Async (queue) ←→ Scheduled (cron) |
| **Coupling** | Direct call ←→ Event-driven ←→ Pub/Sub |
| **State** | Stateless ←→ Cached ←→ Stateful |
| **Scale** | Single instance ←→ Distributed workers |
| **Reliability** | Fire-and-forget ←→ Guaranteed delivery |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| < 10 seconds, needs response | Inline processing |
| > 10 seconds, user can wait | Queue (BullMQ) + status endpoint |
| Repeated reads, same data | Cache (Redis/Upstash) |
| Daily/hourly tasks | Vercel Cron |
| Multiple services need event | Pub/Sub pattern |
| Critical, must not fail | Queue with retries + dead letter |

---

## Part 1: Queue Systems (BullMQ)

### Setup

```bash
npm install bullmq ioredis
```

```typescript
// lib/queue.ts
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// Create queue
export const emailQueue = new Queue('emails', { connection });

// Add job to queue
export async function queueEmail(to: string, template: string, data: object) {
  await emailQueue.add('send-email', {
    to,
    template,
    data,
    timestamp: Date.now(),
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}
```

### Worker (Separate Process)

```typescript
// workers/email-worker.ts
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { sendEmail } from '@/lib/email';

const connection = new IORedis(process.env.REDIS_URL!);

const worker = new Worker('emails', async (job) => {
  const { to, template, data } = job.data;
  
  console.log(`Processing job ${job.id}: ${template} to ${to}`);
  
  await sendEmail(to, template, data);
  
  return { sent: true, timestamp: Date.now() };
}, {
  connection,
  concurrency: 5,
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});
```

### Priority Queues

```typescript
// High priority jobs process first
await emailQueue.add('urgent-email', data, {
  priority: 1, // Lower = higher priority
});

await emailQueue.add('newsletter', data, {
  priority: 10, // Lower priority
});
```

### Progress Tracking

```typescript
// In worker
const worker = new Worker('import', async (job) => {
  const { rows } = job.data;
  
  for (let i = 0; i < rows.length; i++) {
    await processRow(rows[i]);
    await job.updateProgress((i / rows.length) * 100);
  }
});

// Check progress
const job = await importQueue.getJob(jobId);
const progress = await job?.progress;
```

---

## Part 2: Caching Strategies

### Cache-Aside Pattern (Most Common)

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached) return cached;
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Cache for next time
  await redis.set(key, data, { ex: ttlSeconds });
  
  return data;
}
```

### Usage

```typescript
// app/api/products/route.ts
export async function GET() {
  const products = await cached(
    'products:all',
    () => prisma.product.findMany(),
    300 // 5 minutes
  );
  
  return Response.json(products);
}
```

### Cache Invalidation

```typescript
// lib/cache.ts
export async function invalidate(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// After product update
await invalidate('products:*');
```

### Write-Through Pattern

```typescript
export async function updateProduct(id: string, data: ProductInput) {
  // Update database
  const product = await prisma.product.update({
    where: { id },
    data,
  });
  
  // Immediately update cache
  await redis.set(`product:${id}`, product, { ex: 300 });
  
  // Invalidate list caches
  await invalidate('products:list:*');
  
  return product;
}
```

---

## Part 3: Background Jobs

### Vercel Cron Jobs

```typescript
// app/api/cron/cleanup/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Run cleanup
  const deleted = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  
  return NextResponse.json({ 
    success: true, 
    deleted: deleted.count 
  });
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Long-Running Processes

```typescript
// For processes > 10s, use queue
export async function POST(request: Request) {
  const { data } = await request.json();
  
  // Don't process here - queue it
  const job = await importQueue.add('import', { data });
  
  return Response.json({ 
    jobId: job.id,
    status: 'queued',
    checkUrl: `/api/jobs/${job.id}`,
  });
}

// Separate endpoint to check status
// app/api/jobs/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const job = await importQueue.getJob(params.id);
  
  if (!job) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  const state = await job.getState();
  const progress = job.progress;
  
  return Response.json({ state, progress });
}
```

---

## Part 4: Pub/Sub Patterns

### Redis Pub/Sub

```typescript
// lib/pubsub.ts
import IORedis from 'ioredis';

const publisher = new IORedis(process.env.REDIS_URL!);
const subscriber = new IORedis(process.env.REDIS_URL!);

export async function publish(channel: string, message: object) {
  await publisher.publish(channel, JSON.stringify(message));
}

export function subscribe(channel: string, handler: (message: object) => void) {
  subscriber.subscribe(channel);
  
  subscriber.on('message', (ch, message) => {
    if (ch === channel) {
      handler(JSON.parse(message));
    }
  });
}
```

### Event-Driven Pattern

```typescript
// After order placed
await publish('orders', {
  type: 'ORDER_CREATED',
  orderId: order.id,
  userId: order.userId,
});

// Listeners handle their concerns
subscribe('orders', async (event) => {
  switch (event.type) {
    case 'ORDER_CREATED':
      await sendOrderConfirmation(event.orderId);
      await updateInventory(event.orderId);
      await notifySlack(event.orderId);
      break;
  }
});
```

---

## Part 5: API Design

### REST Best Practices

```typescript
// app/api/products/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Pagination
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const skip = (page - 1) * limit;
  
  // Filtering
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  
  const where = {
    ...(category && { category }),
    ...(minPrice && { price: { gte: parseInt(minPrice) } }),
  };
  
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit }),
    prisma.product.count({ where }),
  ]);
  
  return Response.json({
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
```

### Cursor-Based Pagination (Better for Large Sets)

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = 20;
  
  const products = await prisma.product.findMany({
    take: limit + 1, // Get one extra to check if more exist
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: 'desc' },
  });
  
  const hasMore = products.length > limit;
  const data = hasMore ? products.slice(0, -1) : products;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  
  return Response.json({
    data,
    nextCursor,
    hasMore,
  });
}
```

### Error Responses

```typescript
// lib/api-error.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

// Usage
throw new APIError(400, 'INVALID_INPUT', 'Email is required');

// Handler
export async function POST(request: Request) {
  try {
    // ... logic
  } catch (error) {
    if (error instanceof APIError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }
    
    return Response.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}
```

---

## Part 6: When to Use What

| Scenario | Pattern |
|----------|---------|
| Sending 1000 emails | Queue (BullMQ) |
| Repeated API calls | Cache (Redis) |
| Daily cleanup | Cron job |
| Real-time notifications | Pub/Sub |
| File processing | Queue with progress |
| Session data | Cache with TTL |
| Webhook retries | Queue with backoff |

---

## Part 7: Redis Hosting Options

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| Upstash | 10K commands/day | Caching, small apps |
| Railway | 500MB | Full Redis features |
| Redis Cloud | 30MB | Production apps |

---

## Resources

- BullMQ: https://docs.bullmq.io/
- Upstash: https://upstash.com/docs
- Vercel Cron: https://vercel.com/docs/cron-jobs

---

## Related Skills

- `agents/security/SKILL.md` - Rate limiting patterns
- `agents/database/SKILL.md` - Prisma integration
- `agents/realtime/SKILL.md` - Real-time updates
- `agents/monitoring/SKILL.md` - Job monitoring
