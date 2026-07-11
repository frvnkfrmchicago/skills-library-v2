-- ============================================================================
-- 005_content.sql
-- Lane 1 — content tracking. Implements docs/data-contract.md §4 tables
-- 8 (content_sources), 9 (content_items).
-- ============================================================================

-- 8. content_sources ---------------------------------------------------------
create table public.content_sources (
  id uuid primary key default uuid_generate_v4(),
  platform public.content_platform not null,
  source_name text not null,
  source_url text not null,
  api_url text,                                          -- the actual polled URL
  fetch_method public.content_fetch_method not null,
  poll_interval_hours integer,                           -- null for manual
  api_config_key text,                                   -- name of a Supabase Vault secret, never the secret
  active boolean not null default true,
  requires_auth boolean not null default false,          -- true for instagram/linkedin
  auth_notes text,                                       -- why auth is deferred
  last_fetched_at timestamptz,
  last_successful_at timestamptz,
  consecutive_failures integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_content_sources_active on public.content_sources(active);
create index idx_content_sources_platform on public.content_sources(platform);

-- 9. content_items -----------------------------------------------------------
create table public.content_items (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid not null references public.content_sources(id) on delete cascade,
  external_id text,                                      -- RSS GUID / native id for dedup
  title text,
  summary text,                                          -- excerpt only (<=500 chars), never full text
  url text,
  source_url text,                                       -- denormalized base domain
  source_platform public.content_platform,               -- denormalized for fast display
  source_date date,                                      -- publish/event date per the source
  fetched_at timestamptz not null default now(),         -- when our system first captured it
  published_at timestamptz,                               -- when an admin approved it
  relevance_tags text[] not null default '{}',
  chicago_relevance public.content_chicago_relevance not null default 'general',
  content_type public.content_type,
  image_url text,
  approval_status public.content_approval_status not null default 'pending',
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, url),
  unique (source_id, external_id)
);
create index idx_content_items_source on public.content_items(source_id);
create index idx_content_items_status on public.content_items(approval_status);
create index idx_content_items_published on public.content_items(published_at desc);
create index idx_content_items_tags on public.content_items using gin(relevance_tags);
