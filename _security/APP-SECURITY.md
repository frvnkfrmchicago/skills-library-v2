# App Security

Security in the application context. Protecting users and data.

## TL;DR

| Layer | What | Priority |
|-------|------|----------|
| Auth | Who can access | Critical |
| Data | What they can see | Critical |
| Privacy | User data protection | Critical |
| Input | What they can send | High |
| Output | What we expose | High |
| Infrastructure | How it's deployed | High |

---

## Authentication Security

### Clerk Best Practices

```tsx
// middleware.ts - Protect routes
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/api/protected(.*)",
  "/settings(.*)",
])

const isAdmin = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect()
  }
  
  if (isAdmin(req)) {
    await auth.protect({ role: "admin" })
  }
})
```

### Server Action Auth

```tsx
"use server"
import { auth, currentUser } from "@clerk/nextjs/server"

export async function sensitiveAction(data: FormData) {
  // Always verify auth in server actions
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error("Unauthorized")
  }
  
  // For role-based access
  const user = await currentUser()
  if (user?.publicMetadata?.role !== "admin") {
    throw new Error("Forbidden")
  }
  
  // Proceed with action
}
```

### Session Management

```tsx
// Don't store sensitive data in JWT
// Use database for sensitive user data
// Clerk handles session security

// If using custom sessions:
// - Short expiration (15 min)
// - Refresh tokens (7 days)
// - Secure, HttpOnly, SameSite cookies
```

---

## Authorization (Who Can Do What)

### Role-Based Access

```tsx
// types/auth.ts
type Role = "user" | "admin" | "super_admin"

type Permission = 
  | "read:users"
  | "write:users"
  | "delete:users"
  | "read:analytics"
  | "manage:billing"

const rolePermissions: Record<Role, Permission[]> = {
  user: ["read:users"],
  admin: ["read:users", "write:users", "read:analytics"],
  super_admin: ["read:users", "write:users", "delete:users", "read:analytics", "manage:billing"],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}
```

### Resource-Based Access

```tsx
// Can this user access this resource?
export async function canAccessResource(
  userId: string,
  resourceId: string,
  resourceType: "project" | "document" | "team"
): Promise<boolean> {
  const resource = await db[resourceType].findUnique({
    where: { id: resourceId },
    include: { members: true },
  })
  
  if (!resource) return false
  
  // Owner can access
  if (resource.ownerId === userId) return true
  
  // Member can access
  if (resource.members.some((m) => m.userId === userId)) return true
  
  return false
}
```

### Multi-Tenant Isolation

```tsx
// CRITICAL: Always filter by tenant
export async function getProjects(userId: string, orgId: string) {
  // ✓ Good - filtered by org
  return db.project.findMany({
    where: {
      organizationId: orgId,
      members: { some: { userId } },
    },
  })
  
  // ✗ Bad - can access any project
  // return db.project.findMany({ where: { id } })
}
```

---

## Data Protection

### Encryption at Rest

```tsx
// Prisma + Encrypted fields
import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes
const ALGORITHM = "aes-256-gcm"

export function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv)
  
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":")
  
  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(ivHex, "hex")
  )
  
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"))
  
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  
  return decrypted
}
```

### PII Handling

```tsx
// Identify PII fields
type UserPII = {
  email: string       // PII
  phone?: string      // PII
  ssn?: string        // Sensitive PII - encrypt
  address?: string    // PII
  dateOfBirth?: Date  // PII
}

// Mask for display
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  return `${local[0]}***@${domain}`
}

export function maskPhone(phone: string): string {
  return `***-***-${phone.slice(-4)}`
}
```

### Data Retention

```tsx
// Implement data retention policies
export async function cleanupOldData() {
  const retentionDays = 90
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
  
  // Delete old logs
  await db.auditLog.deleteMany({
    where: { createdAt: { lt: cutoffDate } },
  })
  
  // Anonymize old user data (soft delete)
  await db.user.updateMany({
    where: {
      deletedAt: { lt: cutoffDate },
    },
    data: {
      email: "redacted@deleted.com",
      name: "Deleted User",
      phone: null,
    },
  })
}
```

---

## Privacy (GDPR/CCPA)

### Consent Management

```tsx
// Track user consents
model Consent {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "marketing", "analytics", "necessary"
  granted   Boolean
  timestamp DateTime @default(now())
  ipAddress String?
  userAgent String?
}

// Check before processing
async function canSendMarketing(userId: string): Promise<boolean> {
  const consent = await db.consent.findFirst({
    where: { userId, type: "marketing" },
    orderBy: { timestamp: "desc" },
  })
  return consent?.granted ?? false
}
```

### Data Export (Right to Access)

```tsx
export async function exportUserData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      projects: true,
      documents: true,
      consents: true,
      auditLogs: true,
    },
  })
  
  return {
    profile: {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    projects: user.projects.map((p) => ({
      name: p.name,
      createdAt: p.createdAt,
    })),
    consents: user.consents,
    activityLog: user.auditLogs,
  }
}
```

### Data Deletion (Right to Erasure)

```tsx
export async function deleteUserData(userId: string) {
  // 1. Delete or anonymize data
  await db.$transaction([
    db.auditLog.deleteMany({ where: { userId } }),
    db.consent.deleteMany({ where: { userId } }),
    db.document.deleteMany({ where: { ownerId: userId } }),
    db.project.deleteMany({ where: { ownerId: userId } }),
    db.user.delete({ where: { id: userId } }),
  ])
  
  // 2. Clear from third-party services
  await stripe.customers.del(user.stripeCustomerId)
  await analytics.deleteUser(userId)
  
  // 3. Log deletion for compliance
  await complianceLog.create({
    type: "user_deletion",
    userId: userId,
    timestamp: new Date(),
  })
}
```

---

## Input Security

### Validation (Always)

```tsx
import { z } from "zod"

// Define strict schemas
const createUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  age: z.number().int().min(13).max(120).optional(),
})

// Validate in server actions
export async function createUser(input: unknown) {
  const result = createUserSchema.safeParse(input)
  
  if (!result.success) {
    return { error: result.error.flatten() }
  }
  
  // Use result.data (typed and validated)
}
```

### File Upload Security

```tsx
// Validate file uploads
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function handleUpload(file: File) {
  // Check type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type")
  }
  
  // Check size
  if (file.size > MAX_SIZE) {
    throw new Error("File too large")
  }
  
  // Check magic bytes (not just extension)
  const buffer = await file.arrayBuffer()
  const header = new Uint8Array(buffer.slice(0, 4))
  
  // Verify actual file type matches claimed type
  if (!verifyMagicBytes(header, file.type)) {
    throw new Error("File type mismatch")
  }
  
  // Sanitize filename
  const safeName = sanitizeFilename(file.name)
  
  // Store securely
}
```

### Rate Limiting

```tsx
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
})

export async function rateLimitedAction(userId: string) {
  const { success, remaining } = await ratelimit.limit(userId)
  
  if (!success) {
    throw new Error("Rate limit exceeded. Try again later.")
  }
  
  // Proceed
}
```

---

## Output Security

### API Response Sanitization

```tsx
// Never expose internal IDs or sensitive fields
function sanitizeUser(user: FullUser): PublicUser {
  return {
    id: user.publicId, // Use public ID, not internal
    name: user.name,
    avatar: user.avatar,
    // Don't include: email, phone, internalId, hashedPassword
  }
}

// Use consistent response types
export async function GET() {
  const users = await db.user.findMany()
  return Response.json(users.map(sanitizeUser))
}
```

### Error Handling

```tsx
// Don't leak internal errors
export async function POST(req: Request) {
  try {
    // ... logic
  } catch (error) {
    // Log full error internally
    console.error("API Error:", error)
    
    // Return generic message to user
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
    
    // ✗ Don't: return Response.json({ error: error.message })
    // This could leak: "Cannot read property 'x' of undefined"
    // Or worse: SQL errors, file paths, etc.
  }
}
```

---

## Infrastructure Security

### Environment Variables

```bash
# .env.local (never commit)
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_...
STRIPE_SECRET_KEY=sk_...
ENCRYPTION_KEY=...

# .env.example (commit this)
DATABASE_URL=postgresql://user:password@localhost:5432/db
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
ENCRYPTION_KEY=generate-32-byte-hex-string
```

### Security Headers

```tsx
// next.config.js
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  },
]

module.exports = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}
```

---

## CORS Configuration

### Next.js API Routes

```typescript
// app/api/public/route.ts
import { NextResponse } from 'next/server'

const allowedOrigins = [
  'https://myapp.com',
  'https://app.myapp.com',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000',
].filter(Boolean)

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  
  if (origin && allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
    })
  }
  
  return new NextResponse(null, { status: 403 })
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin')
  
  const response = NextResponse.json({ data: 'example' })
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  return response
}
```

### CORS Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowedOrigins = ['https://myapp.com', 'https://app.myapp.com']

export function middleware(request: NextRequest) {
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return handlePreflight(request)
  }
  
  const response = NextResponse.next()
  const origin = request.headers.get('origin')
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return response
}

function handlePreflight(request: NextRequest) {
  const origin = request.headers.get('origin')
  
  if (origin && allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }
  
  return new NextResponse(null, { status: 403 })
}

export const config = {
  matcher: '/api/:path*',
}
```

---

## Content Security Policy (CSP)

### Strict CSP Configuration

```typescript
// next.config.js

// Generate nonce for inline scripts (if needed)
const generateNonce = () => {
  const crypto = require('crypto')
  return crypto.randomBytes(16).toString('base64')
}

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.supabase.co https://*.stripe.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co;
  frame-src 'self' https://js.stripe.com https://challenges.cloudflare.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests;
`

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ]
  },
}
```

### CSP by Page Type

```typescript
// For stricter pages (admin, settings)
const strictCSP = `
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  form-action 'self';
`

// For pages with third-party content (embeds, widgets)
const relaxedCSP = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://platform.twitter.com;
  frame-src 'self' https://www.youtube.com https://player.vimeo.com;
`
```

### Report CSP Violations

```typescript
// Add reporting
const CSPWithReporting = `
  ${ContentSecurityPolicy}
  report-uri /api/csp-report;
  report-to default;
`

// app/api/csp-report/route.ts
export async function POST(request: Request) {
  const report = await request.json()
  
  // Log to your monitoring service
  console.error('CSP Violation:', report)
  // await sendToSentry(report)
  
  return new Response(null, { status: 204 })
}
```

---

## Input Sanitization

### XSS Prevention

```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

// Sanitize HTML input (for rich text editors)
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

// Escape for plain text display
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

// Sanitize for URLs
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // No double dots
    .substring(0, 255) // Limit length
}
```

### SQL Injection Prevention

```typescript
// Prisma handles this automatically with parameterized queries
// ✓ Safe - Prisma parameterizes
const user = await prisma.user.findUnique({
  where: { email: userInput }
})

// ✓ Safe - Tagged template literal
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`

// ✗ DANGEROUS - String interpolation
const users = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${userInput}'` // SQL INJECTION!
)

// For raw queries, always use parameterization
import { sql } from '@prisma/client'

const result = await prisma.$queryRaw(
  sql`SELECT * FROM users WHERE email = ${userInput}`
)
```

### NoSQL Injection Prevention

```typescript
// With MongoDB/Supabase, validate input types strictly
import { z } from 'zod'

// ✗ Dangerous - could receive { $gt: "" }
const findUser = (query: any) => db.users.findOne(query)

// ✓ Safe - validate input
const querySchema = z.object({
  email: z.string().email(),
})

const findUserSafe = (input: unknown) => {
  const { email } = querySchema.parse(input)
  return db.users.findOne({ email }) // Now guaranteed to be string
}
```

### Command Injection Prevention

```typescript
// ✗ NEVER do this
import { exec } from 'child_process'
exec(`convert ${userFilename} output.png`) // COMMAND INJECTION!

// ✓ Use array arguments
import { execFile } from 'child_process'
execFile('convert', [sanitizedFilename, 'output.png'])

// ✓ Or use purpose-built libraries
import sharp from 'sharp'
await sharp(sanitizedPath).png().toFile('output.png')
```

---

## Session Security

### Secure Cookie Configuration

```typescript
// For custom session handling (if not using Clerk)
import { cookies } from 'next/headers'

export function setSessionCookie(sessionId: string) {
  cookies().set('session', sessionId, {
    httpOnly: true,      // Not accessible via JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax',     // CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

// For sensitive operations, use stricter settings
export function setSecureSessionCookie(sessionId: string) {
  cookies().set('secure_session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',  // Strictest CSRF protection
    maxAge: 60 * 15,     // 15 minutes only
    path: '/',
  })
}
```

### Session Validation

```typescript
// lib/session.ts
import { db } from './db'
import { cookies } from 'next/headers'

interface Session {
  id: string
  userId: string
  expiresAt: Date
  userAgent: string
  ipAddress: string
}

export async function validateSession(): Promise<Session | null> {
  const sessionId = cookies().get('session')?.value
  
  if (!sessionId) return null
  
  const session = await db.session.findUnique({
    where: { id: sessionId },
  })
  
  if (!session) return null
  
  // Check expiration
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: sessionId } })
    return null
  }
  
  // Extend session on activity (sliding expiration)
  await db.session.update({
    where: { id: sessionId },
    data: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  })
  
  return session
}

// Invalidate all sessions (logout everywhere)
export async function invalidateAllSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } })
}

// Invalidate current session
export async function logout() {
  const sessionId = cookies().get('session')?.value
  if (sessionId) {
    await db.session.delete({ where: { id: sessionId } })
  }
  cookies().delete('session')
}
```

### Session Fixation Prevention

```typescript
// Always regenerate session ID after login
export async function login(userId: string, request: Request) {
  // Delete old session if exists
  const oldSessionId = cookies().get('session')?.value
  if (oldSessionId) {
    await db.session.delete({ where: { id: oldSessionId } }).catch(() => {})
  }
  
  // Create new session with new ID
  const newSession = await db.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || '',
    },
  })
  
  setSessionCookie(newSession.id)
  return newSession
}
```

---

## Rate Limiting (Expanded)

### Tiered Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Different limits for different operations
export const rateLimiters = {
  // General API: 100 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api',
  }),
  
  // Auth attempts: 5 per minute (prevent brute force)
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'ratelimit:auth',
  }),
  
  // Sensitive operations: 10 per hour
  sensitive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:sensitive',
  }),
  
  // AI/expensive operations: 20 per day
  expensive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '24 h'),
    prefix: 'ratelimit:expensive',
  }),
}

// Helper with user feedback
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const { success, remaining, reset } = await limiter.limit(identifier)
  
  return {
    allowed: success,
    remaining,
    resetIn: Math.ceil((reset - Date.now()) / 1000), // seconds
  }
}
```

### Rate Limit Middleware

```typescript
// middleware.ts
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get identifier (IP or user ID)
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  
  // Check rate limit
  const { allowed, remaining, resetIn } = await checkRateLimit(
    rateLimiters.api,
    ip
  )
  
  if (!allowed) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        retryAfter: resetIn,
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(resetIn),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }
  
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  
  return response
}
```

---

## Security Checklist

### Before Ship
- [ ] Auth on all protected routes
- [ ] Authorization checks in server actions
- [ ] Input validation with Zod
- [ ] No secrets in client code
- [ ] Error messages don't leak internals
- [ ] Rate limiting on sensitive endpoints
- [ ] HTTPS only in production
- [ ] CORS configured properly
- [ ] CSP headers set
- [ ] Session cookies are httpOnly and secure

### For User Data
- [ ] PII identified and handled appropriately
- [ ] Encryption for sensitive fields
- [ ] Data export capability
- [ ] Data deletion capability
- [ ] Retention policy implemented

### Infrastructure
- [ ] Environment variables secured
- [ ] Security headers configured
- [ ] Database not publicly accessible
- [ ] Logs don't contain sensitive data
- [ ] Monitoring/alerting enabled
- [ ] Rate limiting prevents abuse
