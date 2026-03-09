---\nname: security\ndescription: Security patterns. Cloudflare, rate limiting, spam prevention, DDoS protection, and input validation.\nlast_updated: 2026-01\nowner: Frank\n---\n\n# Security & Protection Skill\n\n**Cloudflare, rate limiting, spam prevention, DDoS protection.**

---

## TL;DR

```bash
npm install @upstash/ratelimit ioredis
```

| Layer | Tool | Purpose |
|-------|------|---------|
| **CDN/DDoS** | Cloudflare | Free tier, automatic protection |
| **Rate Limiting** | Upstash Redis | API protection |
| **Spam** | Turnstile (Cloudflare) | Free CAPTCHA |
| **Input** | Zod | Type-safe validation |

---

## Context Questions (Ask Before Recommending)

Before suggesting security patterns:

1. **What needs protection?** (API, forms, auth, payments)
2. **Traffic expectations?** (low, medium, high-volume)
3. **Existing infrastructure?** (Cloudflare, AWS WAF, none)
4. **Form exposure?** (public facing, authenticated only)
5. **Compliance requirements?** (none, SOC2, HIPAA)

---

## Dimensions (Spectrums to Explore)

| Dimension | Spectrum |
|-----------|----------|
| **Protection Level** | Basic (Cloudflare free) ←→ Enterprise WAF |
| **Rate Limiting** | Simple (memory) ←→ Distributed (Redis) |
| **Bot Detection** | Simple CAPTCHA ←→ Invisible + ML |
| **Validation** | Client only ←→ Server + Schema |
| **Logging** | None ←→ Full audit trail |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Public API | Rate limiting (Upstash) + Cloudflare |
| Public forms | Turnstile CAPTCHA + Zod validation |
| High-value endpoints | Rate limiting + CSRF + signature verification |
| Payment webhooks | Signature verification (Stripe/etc) |
| Enterprise | Full WAF + audit logging + compliance |

---

## Part 1: Cloudflare Setup (5 min)

### DNS + DDoS Protection

1. Sign up at cloudflare.com
2. Add your domain
3. Update nameservers
4. **Done** - DDoS protection active

**Free tier includes:**
- Unlimited DDoS protection
- CDN (faster site)
- SSL certificate
- Basic WAF rules

---

## Part 2: Rate Limiting

### Upstash Redis (Vercel Integration)

```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  return {
    allowed: success,
    limit,
    remaining,
    resetAt: new Date(reset),
  };
}
```

### Apply to API Routes

```typescript
// app/api/protected/route.ts
import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  
  const { allowed } = await checkRateLimit(ip);
  
  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // Your logic here
}
```

---

## Part 3: Spam Prevention

### Cloudflare Turnstile (Free CAPTCHA)

```bash
npm install @marsidev/react-turnstile
```

```tsx
// components/ContactForm.tsx
'use client';

import Turnstile from '@marsidev/react-turnstile';
import { useState } from 'react';

export function ContactForm() {
  const [token, setToken] = useState('');
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const res = await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ token, ...formData }),
    });
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setToken}
      />
      
      <button disabled={!token}>Submit</button>
    </form>
  );
}
```

```typescript
// app/api/contact/route.ts
export async function POST(req: Request) {
  const { token, ...data } = await req.json();
  
  // Verify turnstile token
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
      }),
    }
  );
  
  const outcome = await res.json();
  
  if (!outcome.success) {
    return Response.json({ error: 'Invalid CAPTCHA' }, { status: 400 });
  }
  
  // Process form
}
```

---

## Part 4: Input Validation

### Zod Schemas

```typescript
// lib/schemas.ts
import { z } from 'zod';

export const ContactSchema = z.object({
  email: z.string().email(),
  message: z.string().min(10).max(500),
  name: z.string().min(2).max(100),
});

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  name: z.string().min(2),
});
```

```typescript
// app/api/signup/route.ts
import { SignupSchema } from '@/lib/schemas';

export async function POST(req: Request) {
  const body = await req.json();
  
  const result = SignupSchema.safeParse(body);
  
  if (!result.success) {
    return Response.json(
      { errors: result.error.flatten() },
      { status: 400 }
    );
  }
  
  const { email, password, name } = result.data;
  // Safe to use
}
```

---

## Part 5: CSRF Protection

```typescript
// lib/csrf.ts
import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, expected: string): boolean {
  return token === expected;
}
```

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.method === 'POST') {
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionToken = request.cookies.get('csrf-token')?.value;
    
    if (!csrfToken || csrfToken !== sessionToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}
```

---

## Part 6: Security Checklist

```markdown
- [ ] Cloudflare DNS + DDoS protection
- [ ] Rate limiting on all API routes
- [ ] CAPTCHA on public forms
- [ ] Input validation with Zod
- [ ] CSRF tokens on mutations
- [ ] HTTPS only (redirect HTTP)
- [ ] Secure headers (CSP, X-Frame-Options)
- [ ] Environment variables never exposed client-side
- [ ] API keys in server-only files
- [ ] Regular dependency updates
```

---

## Resources

- Cloudflare: https://www.cloudflare.com/
- Upstash: https://upstash.com/
- Turnstile: https://www.cloudflare.com/products/turnstile/

---

## Related Skills

- `agents/database/SKILL.md` - SQL injection prevention
- `agents/stripe/SKILL.md` - Webhook signature verification
- `workflows/ship-fast/SKILL.md` - Security in MVP timeline
