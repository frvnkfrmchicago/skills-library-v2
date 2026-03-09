---
name: api-handling
description: API handling patterns. Error handling (RFC 9457), rate limiting, retries, and versioning.
last_updated: 2026-03
owner: Frank
---

# API Handling

Build robust, developer-friendly APIs.

> **Key insight**: Great APIs have consistent error responses (RFC 9457), transparent rate limiting, and clear versioning. These patterns apply whether you're building or consuming APIs.

---

## Context Questions

Before implementing API handling:

1. **Building or consuming?** — Different patterns apply
2. **What error format is expected?** — RFC 9457, custom, legacy?
3. **What's the rate limit strategy?** — Per user, per endpoint, tiered?
4. **How do you version?** — URL path, header, query param?
5. **Retry requirements?** — Idempotent operations? Backoff strategy?

---

## TL;DR

| Pattern | Standard |
|---------|----------|
| **Error Format** | RFC 9457 Problem Details |
| **Rate Limiting** | 429 + X-RateLimit-* headers |
| **Versioning** | URL path (/v1/) for public APIs |
| **Retries** | Exponential backoff with jitter |
| **Idempotency** | Idempotency-Key header |

---

## Part 1: Error Handling (RFC 9457)

### Standard Error Response

```typescript
// RFC 9457 Problem Details format
interface ProblemDetails {
  type: string;        // URI identifying the error type
  title: string;       // Short human-readable summary
  status: number;      // HTTP status code
  detail?: string;     // Detailed explanation
  instance?: string;   // URI for this specific occurrence
  
  // Custom extensions
  code?: string;       // Machine-readable error code
  errors?: ValidationError[]; // Field-level errors
  requestId?: string;  // For tracing/debugging
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

### Error Response Examples

```typescript
// Validation error
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more fields failed validation",
  "code": "VALIDATION_ERROR",
  "requestId": "req_abc123",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_format"
    },
    {
      "field": "password",
      "message": "Must be at least 8 characters",
      "code": "too_short"
    }
  ]
}

// Not found
{
  "type": "https://api.example.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "User with ID 'user_123' does not exist",
  "code": "USER_NOT_FOUND",
  "requestId": "req_xyz789"
}

// Rate limited
{
  "type": "https://api.example.com/errors/rate-limited",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit exceeded. Try again in 60 seconds.",
  "code": "RATE_LIMITED",
  "requestId": "req_def456"
}
```

### Implementation

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public type: string,
    public title: string,
    public status: number,
    public detail?: string,
    public code?: string,
    public errors?: ValidationError[]
  ) {
    super(title);
  }

  toJSON(): ProblemDetails {
    return {
      type: `https://api.example.com/errors/${this.type}`,
      title: this.title,
      status: this.status,
      detail: this.detail,
      code: this.code,
      errors: this.errors,
      requestId: getRequestId(),
    };
  }
}

// Common errors
export const Errors = {
  validation: (errors: ValidationError[]) =>
    new ApiError('validation', 'Validation Error', 400, 
      'One or more fields failed validation', 'VALIDATION_ERROR', errors),
  
  notFound: (resource: string, id: string) =>
    new ApiError('not-found', 'Resource Not Found', 404,
      `${resource} with ID '${id}' does not exist`, `${resource.toUpperCase()}_NOT_FOUND`),
  
  unauthorized: () =>
    new ApiError('unauthorized', 'Unauthorized', 401,
      'Authentication required', 'UNAUTHORIZED'),
  
  forbidden: () =>
    new ApiError('forbidden', 'Forbidden', 403,
      'You do not have permission to access this resource', 'FORBIDDEN'),
  
  rateLimited: (retryAfter: number) =>
    new ApiError('rate-limited', 'Too Many Requests', 429,
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`, 'RATE_LIMITED'),
};
```

### Error Middleware

```typescript
// app/api/middleware.ts
export function errorHandler(error: unknown, req: Request) {
  const requestId = crypto.randomUUID();
  
  // Log full error internally
  console.error({ requestId, error });
  
  // Return sanitized response
  if (error instanceof ApiError) {
    return Response.json(error.toJSON(), { 
      status: error.status,
      headers: { 'X-Request-ID': requestId }
    });
  }
  
  if (error instanceof z.ZodError) {
    return Response.json(Errors.validation(
      error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message,
        code: i.code
      }))
    ).toJSON(), { status: 400 });
  }
  
  // Don't expose internal errors
  return Response.json({
    type: 'https://api.example.com/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    requestId,
  }, { status: 500 });
}
```

---

## Part 2: Rate Limiting

### Rate Limit Headers

```typescript
// Standard rate limit headers
const headers = {
  'X-RateLimit-Limit': '100',       // Max requests in window
  'X-RateLimit-Remaining': '95',    // Remaining requests
  'X-RateLimit-Reset': '1704067200', // Unix timestamp when limit resets
  'Retry-After': '60',              // Seconds until retry (on 429)
};
```

### Rate Limiter Implementation

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different limits for different tiers
export const rateLimiters = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:free',
  }),
  pro: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:pro',
  }),
  enterprise: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 m'),
    prefix: 'ratelimit:enterprise',
  }),
};

// Rate limit middleware
export async function rateLimit(req: Request, tier: 'free' | 'pro' | 'enterprise' = 'free') {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const limiter = rateLimiters[tier];
  
  const { success, limit, remaining, reset } = await limiter.limit(ip);
  
  const headers = new Headers({
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  });
  
  if (!success) {
    headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString());
    throw new ApiError('rate-limited', 'Too Many Requests', 429,
      `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
      'RATE_LIMITED');
  }
  
  return headers;
}
```

### Usage in Route

```typescript
// app/api/users/route.ts
export async function GET(req: Request) {
  try {
    const user = await getUser(req);
    const rateLimitHeaders = await rateLimit(req, user?.tier ?? 'free');
    
    const data = await fetchUsers();
    
    return Response.json({ data }, { headers: rateLimitHeaders });
  } catch (error) {
    return errorHandler(error, req);
  }
}
```

---

## Part 3: Retry Patterns

### Exponential Backoff with Jitter

```typescript
// lib/retry.ts
interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryOn?: (error: unknown) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    retryOn = isRetryable,
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts || !retryOn(error)) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
        maxDelay
      );
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Retry on rate limits and server errors
    return error.status === 429 || error.status >= 500;
  }
  // Retry on network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  return false;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
```

### Usage

```typescript
// Fetch with automatic retry
const data = await withRetry(
  () => fetch('/api/users').then(r => r.json()),
  { maxAttempts: 3, baseDelay: 1000 }
);
```

---

## Part 4: Versioning

### URL Path Versioning (Recommended)

```typescript
// /api/v1/users - Version 1
// /api/v2/users - Version 2

// app/api/v1/users/route.ts
export async function GET(req: Request) {
  // V1 implementation
}

// app/api/v2/users/route.ts  
export async function GET(req: Request) {
  // V2 implementation with new fields
}
```

### Header-Based Versioning

```typescript
// X-API-Version: 2024-01-15

export async function GET(req: Request) {
  const version = req.headers.get('X-API-Version') ?? '2024-01-15';
  
  switch (version) {
    case '2024-01-15':
      return handleV1(req);
    case '2024-06-01':
      return handleV2(req);
    default:
      return Response.json(
        { error: 'Unsupported API version' },
        { status: 400 }
      );
  }
}
```

### Deprecation Headers

```typescript
// Signal upcoming deprecation
const headers = {
  'Deprecation': 'true',
  'Sunset': 'Sat, 01 Jan 2025 00:00:00 GMT',
  'Link': '</api/v2/users>; rel="successor-version"'
};
```

---

## Part 5: Idempotency

### Idempotency Key Header

```typescript
// lib/idempotency.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({ /* config */ });
const IDEMPOTENCY_TTL = 60 * 60 * 24; // 24 hours

export async function withIdempotency<T>(
  key: string | null,
  fn: () => Promise<T>
): Promise<{ result: T; cached: boolean }> {
  if (!key) {
    return { result: await fn(), cached: false };
  }
  
  const cacheKey = `idempotency:${key}`;
  
  // Check for existing result
  const cached = await redis.get<T>(cacheKey);
  if (cached !== null) {
    return { result: cached, cached: true };
  }
  
  // Execute and cache
  const result = await fn();
  await redis.set(cacheKey, result, { ex: IDEMPOTENCY_TTL });
  
  return { result, cached: false };
}

// Usage in route
export async function POST(req: Request) {
  const idempotencyKey = req.headers.get('Idempotency-Key');
  
  const { result, cached } = await withIdempotency(idempotencyKey, async () => {
    return createPayment(await req.json());
  });
  
  return Response.json(result, {
    headers: cached ? { 'X-Idempotent-Replay': 'true' } : {}
  });
}
```

---

## Part 6: Consuming APIs

### Robust API Client

```typescript
// lib/api-client.ts
interface ApiClientOptions {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

export function createApiClient(options: ApiClientOptions) {
  const { baseUrl, apiKey, timeout = 30000, retries = 3 } = options;
  
  return {
    async request<T>(path: string, init?: RequestInit): Promise<T> {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        return await withRetry(async () => {
          const response = await fetch(`${baseUrl}${path}`, {
            ...init,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
              ...init?.headers,
            },
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new ApiError(
              error.type,
              error.title,
              error.status,
              error.detail,
              error.code
            );
          }
          
          return response.json();
        }, { maxAttempts: retries });
      } finally {
        clearTimeout(timeoutId);
      }
    },
    
    get: <T>(path: string) => this.request<T>(path),
    post: <T>(path: string, data: unknown) => 
      this.request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
    put: <T>(path: string, data: unknown) => 
      this.request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
    delete: <T>(path: string) => 
      this.request<T>(path, { method: 'DELETE' }),
  };
}
```

---

## Checklist

Building an API:
- [ ] Error responses follow RFC 9457
- [ ] Rate limiting with proper headers
- [ ] Versioning strategy decided
- [ ] Idempotency for mutations
- [ ] Request IDs for tracing
- [ ] Proper HTTP status codes

Consuming an API:
- [ ] Error handling for all response types
- [ ] Retry logic with backoff
- [ ] Timeout handling
- [ ] Rate limit awareness
- [ ] Version pinning

---

## Related Skills

- `agents/openapi/SKILL.md` — API specification
- `agents/backend-patterns/SKILL.md` — Backend architecture
- `agents/security/SKILL.md` — API security
- `agents/monitoring/SKILL.md` — API monitoring
