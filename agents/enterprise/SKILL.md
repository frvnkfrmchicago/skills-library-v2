---
name: enterprise
description: Enterprise patterns for production apps. Audit logging, RBAC, multi-tenancy, feature flags, rate limiting, and compliance for regulated industries.
owner: Frank
last_updated: 2026-03
---

# Enterprise Patterns

Production patterns for scale, compliance, and teams.

> **Note:** This skill covers general enterprise patterns. For industry-specific compliance (cannabis, fintech, healthcare), see the "Regulated Industries" section at the end.

---

## Context Questions

Before implementing enterprise patterns:

1. **What's the compliance requirement?** — SOC2, HIPAA, GDPR, industry-specific
2. **What's the scale?** — Single tenant vs multi-tenant
3. **Who are the users?** — Internal team, B2B customers, consumers
4. **What's the audit need?** — Basic logging vs full audit trail
5. **What features need control?** — Rollouts, A/B testing, kill switches

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Tenancy** | Single app ←→ Multi-tenant SaaS |
| **Access** | Simple roles ←→ Fine-grained RBAC |
| **Compliance** | Startup (minimal) ←→ Enterprise (SOC2, HIPAA) |
| **Features** | Ship everything ←→ Feature flags + gradual rollout |
| **Logging** | Error only ←→ Full audit trail |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| B2B SaaS | Multi-tenancy + RBAC + audit logging |
| Regulated industry | Compliance logging + data residency |
| Team of 5+ | Feature flags + environments |
| Processing payments | PCI compliance + fraud detection |
| Handling PII | Encryption + audit logging + GDPR |
| Enterprise customers | SSO + audit logs + SLAs |

---

## TL;DR

| Pattern | When You Need It |
|---------|------------------|
| **Audit Logging** | Regulated industry, compliance requirements |
| **Role-Based Access** | Multiple user types, admin controls |
| **Multi-Tenancy** | One codebase, many customers |
| **Feature Flags** | Controlled rollouts, A/B testing |
| **Rate Limiting** | API protection, abuse prevention |
| **Data Residency** | GDPR, state regulations |

---

## When to Use Enterprise Patterns

| Trigger | Patterns to Add |
|---------|-----------------|
| Raising funding | Audit logging, RBAC |
| Handling PII | Encryption, audit logging, data residency |
| Regulated industry | Compliance logging, age verification |
| Multiple customers | Multi-tenancy |
| Team of 5+ | Feature flags, environments |
| Processing payments | PCI compliance, fraud detection |

---


## Audit Logging

Track who did what, when. Required for regulated industries.

### Schema

```prisma
// prisma/schema.prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // "create", "update", "delete", "view"
  resource  String   // "user", "order", "product"
  resourceId String?
  metadata  Json?    // Additional context
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([resource, resourceId])
  @@index([createdAt])
}
```

### Logging Utility

```typescript
// lib/audit.ts
import { db } from "@/lib/db";
import { headers } from "next/headers";

interface AuditEntry {
  userId: string;
  action: "create" | "update" | "delete" | "view" | "login" | "logout";
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export async function audit(entry: AuditEntry) {
  const headersList = headers();
  
  await db.auditLog.create({
    data: {
      ...entry,
      ip: headersList.get("x-forwarded-for") || "unknown",
      userAgent: headersList.get("user-agent") || "unknown",
    },
  });
}

// Usage
await audit({
  userId: user.id,
  action: "update",
  resource: "order",
  resourceId: order.id,
  metadata: { previousStatus: "pending", newStatus: "approved" },
});
```

### With Middleware

```typescript
// middleware/audit.ts
export function withAudit<T>(
  action: string,
  resource: string,
  handler: (req: Request) => Promise<T>
) {
  return async (req: Request) => {
    const result = await handler(req);
    
    // Log after successful operation
    await audit({
      userId: getCurrentUserId(),
      action,
      resource,
      metadata: { /* ... */ },
    });
    
    return result;
  };
}
```

---

## Role-Based Access Control (RBAC)

### Define Roles

```typescript
// lib/permissions.ts
export const ROLES = {
  admin: {
    name: "Admin",
    permissions: ["*"], // All permissions
  },
  manager: {
    name: "Manager",
    permissions: [
      "orders:read",
      "orders:update",
      "products:read",
      "products:create",
      "products:update",
      "users:read",
    ],
  },
  employee: {
    name: "Employee",
    permissions: [
      "orders:read",
      "products:read",
    ],
  },
  customer: {
    name: "Customer",
    permissions: [
      "orders:read:own",
      "profile:read:own",
      "profile:update:own",
    ],
  },
} as const;

export type Role = keyof typeof ROLES;
```

### Check Permissions

```typescript
// lib/auth.ts
export function hasPermission(
  userRole: Role,
  permission: string,
  ownerId?: string,
  userId?: string
): boolean {
  const role = ROLES[userRole];
  if (!role) return false;

  // Admin has all permissions
  if (role.permissions.includes("*")) return true;

  // Check exact permission
  if (role.permissions.includes(permission)) return true;

  // Check "own" permissions
  const ownPermission = `${permission}:own`;
  if (role.permissions.includes(ownPermission)) {
    return ownerId === userId;
  }

  return false;
}

// Usage
if (!hasPermission(user.role, "orders:update")) {
  throw new Error("Forbidden");
}
```

### Middleware Pattern

```typescript
// lib/require-permission.ts
import { auth } from "@clerk/nextjs/server";
import { hasPermission } from "./auth";

export function requirePermission(permission: string) {
  return async () => {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error("User not found");

    if (!hasPermission(user.role, permission)) {
      throw new Error("Forbidden");
    }

    return user;
  };
}

// Usage in Server Action
export async function updateOrder(orderId: string, data: OrderUpdate) {
  "use server";
  const user = await requirePermission("orders:update")();
  
  // Proceed with update...
}
```

---

## Multi-Tenancy

One codebase, many customers (organizations).

### Schema

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  plan      String   @default("free")
  createdAt DateTime @default(now())

  users     User[]
  products  Product[]
  orders    Order[]
}

model User {
  id             String       @id @default(cuid())
  clerkId        String       @unique
  email          String
  organizationId String
  role           String       @default("member")

  organization   Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
}

// All data scoped to organization
model Product {
  id             String       @id @default(cuid())
  name           String
  organizationId String

  organization   Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
}
```

### Tenant Context

```typescript
// lib/tenant.ts
import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { cache } from "react";

export const getCurrentOrganization = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  return user?.organization ?? null;
});

// Scoped query helper
export async function scopedQuery<T>(
  query: (orgId: string) => Promise<T>
): Promise<T> {
  const org = await getCurrentOrganization();
  if (!org) throw new Error("No organization context");
  return query(org.id);
}

// Usage
const products = await scopedQuery((orgId) =>
  db.product.findMany({ where: { organizationId: orgId } })
);
```

### Subdomain Routing

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const subdomain = hostname.split(".")[0];

  // Skip for main domain and special subdomains
  if (subdomain === "www" || subdomain === "app") {
    return NextResponse.next();
  }

  // Add organization context to headers
  const response = NextResponse.next();
  response.headers.set("x-organization-slug", subdomain);
  return response;
}
```

---

## Feature Flags

Control feature rollout without deploying.

### Simple Implementation

```typescript
// lib/features.ts
type FeatureFlag = {
  enabled: boolean;
  percentage?: number;  // For gradual rollout
  allowedOrgs?: string[];
  allowedUsers?: string[];
};

const FLAGS: Record<string, FeatureFlag> = {
  newCheckout: {
    enabled: true,
    percentage: 25, // 25% of users
  },
  betaAnalytics: {
    enabled: true,
    allowedOrgs: ["org_premium", "org_enterprise"],
  },
  experimentalAI: {
    enabled: false,
  },
};

export function isFeatureEnabled(
  flag: string,
  context?: { userId?: string; orgId?: string }
): boolean {
  const feature = FLAGS[flag];
  if (!feature || !feature.enabled) return false;

  // Check org allowlist
  if (feature.allowedOrgs && context?.orgId) {
    return feature.allowedOrgs.includes(context.orgId);
  }

  // Check user allowlist
  if (feature.allowedUsers && context?.userId) {
    return feature.allowedUsers.includes(context.userId);
  }

  // Percentage rollout
  if (feature.percentage && context?.userId) {
    const hash = hashString(context.userId);
    return (hash % 100) < feature.percentage;
  }

  return feature.enabled;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
```

### Usage

```tsx
// In component
function Checkout() {
  const { userId, orgId } = useAuth();
  
  if (isFeatureEnabled("newCheckout", { userId, orgId })) {
    return <NewCheckout />;
  }
  
  return <LegacyCheckout />;
}
```

### Production Options

| Service | Features |
|---------|----------|
| **LaunchDarkly** | Enterprise-grade, targeting, analytics |
| **PostHog** | Open source, feature flags + analytics |
| **Vercel Edge Config** | Simple, fast, Vercel-native |
| **Custom (above)** | Full control, no vendor |

---

## Rate Limiting

Protect APIs from abuse.

### With Upstash

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

```typescript
// lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different limits for different endpoints
export const rateLimits = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 login attempts per minute
  }),
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 uploads per hour
  }),
};
```

### In API Routes

```typescript
// app/api/route.ts
import { rateLimits } from "@/lib/ratelimit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  
  const { success, limit, reset, remaining } = await rateLimits.api.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  // Proceed with request...
}
```

---

## Regulated Industry: Cannabis Tech

Specific patterns for cannabis industry compliance.

### Age Verification

```typescript
// lib/age-verification.ts
export async function verifyAge(dateOfBirth: Date): Promise<{
  isVerified: boolean;
  age: number;
  minimumAge: number;
}> {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  const MINIMUM_AGE = 21; // Cannabis industry standard

  return {
    isVerified: age >= MINIMUM_AGE,
    age,
    minimumAge: MINIMUM_AGE,
  };
}
```

### State Compliance Tracking

```prisma
model ComplianceRecord {
  id          String   @id @default(cuid())
  type        String   // "age_verification", "purchase_limit", "state_check"
  userId      String?
  state       String   // US state code
  status      String   // "passed", "failed", "pending"
  metadata    Json?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([type, state])
}

model StateLicense {
  id           String   @id @default(cuid())
  state        String
  licenseType  String   // "retail", "cultivation", "processing"
  licenseNumber String
  expiresAt    DateTime
  isActive     Boolean  @default(true)
  
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
}
```

### Purchase Limits

```typescript
// lib/compliance/purchase-limits.ts
const STATE_LIMITS: Record<string, { flower: number; concentrate: number }> = {
  CA: { flower: 28.5, concentrate: 8 }, // grams
  CO: { flower: 28, concentrate: 8 },
  // Add other states...
};

export async function checkPurchaseLimit(
  userId: string,
  state: string,
  productType: "flower" | "concentrate",
  quantity: number
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limits = STATE_LIMITS[state];
  if (!limits) throw new Error(`State ${state} not supported`);

  const limit = limits[productType];
  
  // Get purchases in last 24 hours
  const recentPurchases = await db.order.aggregate({
    where: {
      userId,
      productType,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    _sum: { quantity: true },
  });

  const purchased = recentPurchases._sum.quantity || 0;
  const remaining = limit - purchased;

  return {
    allowed: remaining >= quantity,
    remaining: Math.max(0, remaining),
    limit,
  };
}
```

---

## Environment Management

### Multiple Environments

```
production   → main branch, real users
staging      → develop branch, QA testing
preview      → PR branches, feature testing
development  → local, developer machines
```

### Environment-Specific Config

```typescript
// lib/config.ts
const config = {
  production: {
    api: "https://api.yourapp.com",
    features: { analytics: true, debug: false },
  },
  staging: {
    api: "https://staging-api.yourapp.com",
    features: { analytics: true, debug: true },
  },
  development: {
    api: "http://localhost:3001",
    features: { analytics: false, debug: true },
  },
};

export const APP_CONFIG = config[process.env.NODE_ENV as keyof typeof config] 
  || config.development;
```

---

## Checklist: Enterprise Ready

```markdown
## Security
- [ ] Audit logging implemented
- [ ] RBAC in place
- [ ] Rate limiting on APIs
- [ ] Input validation (Zod)
- [ ] SQL injection prevention (Prisma)

## Compliance
- [ ] Data residency requirements met
- [ ] Age verification (if required)
- [ ] Industry-specific regulations
- [ ] Audit trail for sensitive actions

## Operations
- [ ] Observability configured
- [ ] Error tracking (Sentry)
- [ ] Log aggregation (Axiom)
- [ ] Alerting on critical errors

## Team
- [ ] CI/CD pipeline
- [ ] Multiple environments
- [ ] Feature flags for deploys
- [ ] Documentation up to date
```

---

## Resources

- RBAC patterns: [casl.js.org](https://casl.js.org)
- Feature flags: [launchdarkly.com](https://launchdarkly.com)
- Rate limiting: [upstash.com/docs/ratelimit](https://upstash.com/docs/ratelimit)
- Multi-tenancy: [prisma.io/docs/guides/multi-tenancy](https://prisma.io/docs/guides/multi-tenancy)
