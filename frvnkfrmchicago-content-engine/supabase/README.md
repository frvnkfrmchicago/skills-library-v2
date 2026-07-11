# Supabase Setup -- Asset Persona Content Engine

This directory contains the database schema, migration, and Edge Functions for Frank's content engine.

---

## Project Creation

1. Create a new Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Note your **Project URL**, **anon key**, and **service role key** from **Settings > API**.
3. Install the Supabase CLI:

```bash
npm install -g supabase
```

4. Link your project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

---

## Running the Migration

### Option A: SQL Editor (quickest)

1. Open the Supabase dashboard for your project.
2. Go to **SQL Editor**.
3. Paste the contents of `schema.sql` and run it.

### Option B: CLI migration

```bash
supabase db push
```

This runs all files in `supabase/migrations/` in order. The `001_initial.sql` migration creates all tables, indexes, RLS policies, triggers, and realtime configuration.

---

## Edge Functions

### Deploy

Deploy the social-publish function and its shared dependencies:

```bash
supabase functions deploy social-publish --no-verify-jwt
```

The `--no-verify-jwt` flag is used because this function is called from server-side automation (n8n), not from the browser. If you want JWT verification, remove the flag and pass a valid Supabase auth token in the Authorization header.

### Invoke

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/social-publish' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{ "post_id": "uuid-here", "platforms": ["linkedin", "threads"] }'
```

### Response shape

```json
{
  "success": true,
  "results": [
    { "platform": "linkedin", "status": "success", "postId": "urn:li:share:123" },
    { "platform": "threads", "status": "success", "postId": "456" }
  ]
}
```

Each platform result is independent. If one fails, others still succeed.

---

## Setting Secrets

All platform credentials are stored as Supabase secrets, never hardcoded. Set them with:

```bash
supabase secrets set \
  SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  LINKEDIN_ACCESS_TOKEN=your-linkedin-token \
  LINKEDIN_AUTHOR_URN=urn:li:person:XXXXX \
  THREADS_ACCESS_TOKEN=your-threads-token \
  THREADS_USER_ID=your-threads-user-id \
  INSTAGRAM_ACCESS_TOKEN=your-ig-token \
  INSTAGRAM_BUSINESS_ID=your-ig-business-id \
  FACEBOOK_PAGE_TOKEN=your-fb-page-token \
  FACEBOOK_PAGE_ID=your-fb-page-id
```

Or use an env file:

```bash
supabase secrets set --env-file .env.local
```

---

## Realtime Configuration

Realtime is enabled on `posts` and `comments` tables via the migration. This means any INSERT, UPDATE, or DELETE on these tables will broadcast postgres_changes events to subscribed clients.

### How it works

The migration adds both tables to the `supabase_realtime` publication:

```sql
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
```

### Client subscription

```javascript
const channel = supabase
  .channel('content-engine')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
    console.log('Post changed:', payload);
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
    console.log('Comment changed:', payload);
  })
  .subscribe();
```

---

## RLS Policy Explanation

Row Level Security is enabled on every table. The auth model is team-based: any authenticated user can perform all CRUD operations. This is appropriate because the content engine is used by a small, trusted team.

### team_members

| Operation | Policy |
|-----------|--------|
| SELECT | All authenticated users can read the team roster |
| INSERT | All authenticated users (admin enforced at app layer) |
| UPDATE | All authenticated users (admin enforced at app layer) |
| DELETE | All authenticated users (admin enforced at app layer) |

### posts

| Operation | Policy |
|-----------|--------|
| SELECT | All authenticated users see all posts |
| INSERT | Authenticated users, `created_by` must be set |
| UPDATE | Authenticated users, `created_by` must remain set |
| DELETE | Authenticated users (admin-delete RPC also available) |

### comments

| Operation | Policy |
|-----------|--------|
| SELECT | All authenticated users see all comments |
| INSERT | Authenticated users, `author` must be set |
| UPDATE | Authenticated users, `author` must remain set |
| DELETE | Authenticated users |

The `admin_delete_post` RPC function provides an audited deletion path that verifies the caller has the `admin` role in `team_members` before deleting.

---

## Schema Overview

### posts

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| category | text | One of: ai_ml, dev_tools, career, culture, creative, industry |
| headline | text | Required |
| hl_words | text[] | Words to highlight in the headline |
| caption | text | Post body/caption |
| tags | text[] | Hashtags for social posting |
| img_url | text | Featured image URL |
| bg_url | text | Background/card image URL |
| source | text | Content source attribution |
| status | text | pending, draft, approved, published, rejected |
| assignee | text | Team member assigned to the post |
| created_by | text | Who created the post (required) |
| created_by_name | text | Display name of creator |
| platform_post_ids | jsonb | Map of platform to post ID after publishing |
| scheduled_for | timestamptz | When to auto-publish |
| published_at | timestamptz | When published |
| created_at | timestamptz | Row creation time |
| updated_at | timestamptz | Auto-updated via trigger |

### comments

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| post_id | uuid | FK to posts, cascade delete |
| author | text | Who wrote the comment (required) |
| author_name | text | Display name |
| body | text | Comment text (required) |
| created_at | timestamptz | Row creation time |

### team_members

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| name | text | Unique team member name |
| role | text | admin or team |
| position | text | Job title/role description |
| avatar_url | text | Profile image URL |
| created_at | timestamptz | Row creation time |

---

## Status Flow

```
pending --> draft --> approved --> published
                 \                /
                  --> rejected --/
```

Posts start as `pending` (e.g., from AI generation or n8n webhook). Team members move them to `draft` for editing, then `approved` for publishing. The `social-publish` Edge Function sets the status to `published` after successful platform delivery. Posts can be `rejected` at any stage.
