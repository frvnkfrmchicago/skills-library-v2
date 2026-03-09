---
name: supabase-building
description: >
  Enforces Supabase architecture standards including Row Level Security,
  auth session management, realtime channel subscriptions, storage policies,
  edge functions, and migration workflows. Use when building with Supabase,
  configuring RLS policies, setting up realtime, or deploying Supabase
  edge functions.
---

# Supabase Building

Ensure every Supabase integration is secure by default, performant under
load, and built on proper migration patterns.

---

## 1. Authentication

### Rules

**Always use Row Level Security (RLS).** Without it, any authenticated user
can read/write any row. RLS is your last defense — even if app code has bugs,
RLS prevents data leaks at the database level.

**Never expose the service role key to the client.** The service role bypasses
RLS entirely. If it leaks, your entire database is exposed.

### Auth Setup

```typescript
// ✅ REQUIRED — client-side uses anon key only
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // anon key = safe
)
```

### Social Auth

```typescript
// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: { access_type: 'offline', prompt: 'consent' }
  }
})
```

### Session Management

```typescript
// ✅ REQUIRED — listen + cleanup
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN') { /* handle */ }
      if (event === 'SIGNED_OUT') { /* handle */ }
    }
  )
  return () => subscription.unsubscribe()  // Always cleanup
}, [])
```

## ⛔ STOP GATE — Auth
Run: `grep -rn "SUPABASE_SERVICE_ROLE\|service_role" --include="*.ts" --include="*.tsx" src/`
If found in ANY client-side file, flag as 🔴 CRITICAL.
Run: `grep -rn "createClient" --include="*.ts" --include="*.tsx" src/`
Verify all client instances use `ANON_KEY`, not service role key.

---

## 2. Database & Migrations

**Version every schema change through migrations.** Manual SQL changes in the
dashboard create drift between environments.

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
-- ✅ REQUIRED — users can only read their own data
CREATE POLICY "Users read own data"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- ✅ REQUIRED — users can only update their own data
CREATE POLICY "Users update own data"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Data Type Decision Tree

```
Need to store data?
├── Simple key-value → Single table with JSONB column
├── Relational data → Normalized tables with foreign keys
├── Full-text search → PostgreSQL tsvector + GIN indexes
├── Geolocation → PostGIS extension
└── Time-series → TimescaleDB extension
```

## ⛔ STOP GATE — RLS
Run: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
Then: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
Every table with user data MUST have `rowsecurity = true`.
List any tables with RLS disabled.

---

## 3. Realtime

**Always unsubscribe on component unmount.** Orphaned subscriptions create
memory leaks, exhaust connection limits, and keep receiving data for
components that no longer exist.

**Use channel-based subscriptions** (not legacy `.on()`). Channels support
presence, broadcast, and have better connection management.

```typescript
// ✅ REQUIRED — channel-based with cleanup
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
    supabase.removeChannel(channel)  // Always cleanup
  }
}, [])
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

**Use signed URLs for private content.** Public URLs are guessable and
indexed by search engines. Signed URLs expire.

```typescript
// Upload with user-scoped path
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

**Keep edge functions focused and small.** Cold starts scale with bundle
size. Target < 200ms cold start.

**Use edge functions for server-side secrets.** They run on Deno Deploy and
never expose code to the client.

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

- [ ] RLS enabled on every table with user data
- [ ] RLS policies cover SELECT, INSERT, UPDATE, DELETE as needed
- [ ] Service role key only used server-side
- [ ] All schema changes in migration files
- [ ] Realtime subscriptions have cleanup in useEffect returns
- [ ] Storage buckets have appropriate policies
- [ ] Edge functions use environment variables for secrets
- [ ] Auth callback URLs configured for all environments
