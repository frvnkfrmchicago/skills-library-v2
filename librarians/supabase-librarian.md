---
name: supabase-librarian
description: Supabase architecture guide covering auth, database, realtime, storage, and edge functions. Ensures Row Level Security is never skipped, migrations are versioned, and real-time patterns don't create memory leaks.
last_updated: 2026-03-06
---

# Supabase Librarian

You are a Supabase architect. Your job is to ensure every Supabase integration is secure by default, performant under load, and built on proper migration patterns. You never skip Row Level Security. You never hardcode service role keys in client code.

## TL;DR

| Area | Tool | Key Principle |
|------|------|---------------|
| Auth | `supabase.auth` | RLS on every table, no exceptions |
| Database | PostgreSQL + migrations | Version every schema change |
| Realtime | Channels + Presence | Always unsubscribe on unmount |
| Storage | Buckets + policies | Signed URLs for private assets |
| Edge Functions | Deno runtime | Keep cold starts under 200ms |

---

## 1. Authentication

### Principles

**Always use Row Level Security (RLS)** BECAUSE without it, any authenticated user can read/write any row in your table. RLS is your last line of defense — even if your app code has bugs, RLS prevents data leaks at the database level.

**Never expose the service role key to the client** BECAUSE the service role bypasses RLS entirely. If it leaks, your entire database is exposed.

### Auth Setup

```typescript
// Good — client-side with anon key
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // anon key = safe for client
)
```

```typescript
// Bad — service role key in client code
const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY! // NEVER do this in client code
)
```

### Social Auth Providers

```typescript
// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
 provider: 'google',
 options: {
 redirectTo: `${window.location.origin}/auth/callback`,
 queryParams: {
 access_type: 'offline',
 prompt: 'consent',
 }
 }
})
```

### Auth Session Management

```typescript
// Listen for auth state changes
useEffect(() => {
 const { data: { subscription } } = supabase.auth.onAuthStateChange(
 (event, session) => {
 if (event === 'SIGNED_IN') {
 // handle sign in
 }
 if (event === 'SIGNED_OUT') {
 // handle sign out
 }
 }
 )

 return () => subscription.unsubscribe() // Always cleanup
}, [])
```

---

## 2. Database & Migrations

### Principles

**Version every schema change through migrations** BECAUSE manual SQL changes in the dashboard create drift between environments. When you deploy to production, the schema won't match and things break silently.

**Use database functions for complex operations** BECAUSE moving logic to the database reduces round trips, runs atomically, and can't be bypassed by client code.

### Migration Workflow

```bash
# Create a new migration
supabase migration new create_users_table

# Apply migrations locally
supabase db reset

# Push to remote
supabase db push
```

### RLS Policies

```sql
-- Good — users can only read their own data
CREATE POLICY "Users read own data"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Good — users can only update their own data
CREATE POLICY "Users update own data"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

```sql
-- Bad — allows anyone to read everything
CREATE POLICY "Public read"
ON profiles FOR SELECT
USING (true); -- This defeats the purpose of RLS
```

### Decision Tree: When to Use What

```
Need to store data?
├── Simple key-value → Use a single table with JSONB column
├── Relational data → Normalized tables with foreign keys
├── Full-text search → Use PostgreSQL tsvector + GIN indexes
├── Geolocation → Use PostGIS extension
└── Time-series → Use TimescaleDB extension (if available)
```

---

## 3. Realtime

### Principles

**Always unsubscribe on component unmount** BECAUSE orphaned subscriptions create memory leaks, exhaust connection limits, and keep receiving data for components that no longer exist.

**Use channel-based subscriptions over legacy .on()** BECAUSE channels support presence, broadcast, and have better connection management.

### Realtime Setup

```typescript
// Good — channel-based with cleanup
useEffect(() => {
 const channel = supabase
 .channel('messages')
 .on(
 'postgres_changes',
 { event: 'INSERT', schema: 'public', table: 'messages' },
 (payload) => {
 setMessages(prev => [...prev, payload.new])
 }
 )
 .subscribe()

 return () => {
 supabase.removeChannel(channel) // Always cleanup
 }
}, [])
```

```typescript
// Bad — no cleanup, legacy pattern
supabase
 .from('messages')
 .on('INSERT', (payload) => {
 // This subscription lives forever, leaking memory
 })
 .subscribe()
```

### Presence (Who's Online)

```typescript
const channel = supabase.channel('room-1')

channel
 .on('presence', { event: 'sync' }, () => {
 const state = channel.presenceState()
 setOnlineUsers(Object.keys(state))
 })
 .subscribe(async (status) => {
 if (status === 'SUBSCRIBED') {
 await channel.track({ user_id: currentUser.id, online_at: new Date() })
 }
 })
```

---

## 4. Storage

### Principles

**Use signed URLs for private content** BECAUSE public URLs are guessable and indexed by search engines. Signed URLs expire and can't be shared beyond their TTL.

**Set bucket policies that match your RLS** BECAUSE storage has its own permission layer separate from database RLS.

### File Upload

```typescript
// Upload with path based on user ID
const { data, error } = await supabase.storage
 .from('avatars')
 .upload(`${user.id}/avatar.png`, file, {
 cacheControl: '3600',
 upsert: true,
 })
```

### Storage Policies

```sql
-- Users can upload to their own folder
CREATE POLICY "Users upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
 bucket_id = 'avatars'
 AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 5. Edge Functions

### Principles

**Keep edge functions focused and small** BECAUSE cold starts scale with bundle size. A 200ms cold start is acceptable; a 2s cold start means your users wait.

**Use edge functions for server-side secrets** BECAUSE they run on Deno Deploy, never expose code to the client, and can safely hold API keys.

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import Stripe from 'https://esm.sh/stripe'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

serve(async (req) => {
 const signature = req.headers.get('stripe-signature')!
 const body = await req.text()

 const event = stripe.webhooks.constructEvent(
 body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!
 )

 // Handle event...
 return new Response(JSON.stringify({ received: true }), {
 headers: { 'Content-Type': 'application/json' }
 })
})
```

---

## NEVER

- **NEVER** disable RLS on a table that holds user data
- **NEVER** use the service role key in client-side code
- **NEVER** leave realtime subscriptions without cleanup on unmount
- **NEVER** make storage buckets public unless content is truly public
- **NEVER** put secrets in edge function source — use `supabase secrets set`
- **NEVER** run raw SQL in production without a migration file

---

## Pre-Completion Checklist

Before marking any Supabase work as complete, verify:

- [ ] RLS is enabled on every table
- [ ] RLS policies cover SELECT, INSERT, UPDATE, DELETE as needed
- [ ] Service role key is only used server-side
- [ ] All schema changes are in migration files
- [ ] Realtime subscriptions have cleanup in useEffect returns
- [ ] Storage buckets have appropriate policies
- [ ] Edge functions use environment variables for secrets
- [ ] Auth callback URLs are configured for all environments

---

## Related Skills

- [database-librarian](/librarians/database-librarian.md) — general database patterns
- [security-librarian](/librarians/security-librarian.md) — security beyond Supabase
- [backend-librarian](/librarians/backend-librarian.md) — API architecture
- [deployment-librarian](/librarians/deployment-librarian.md) — deploying Supabase projects
