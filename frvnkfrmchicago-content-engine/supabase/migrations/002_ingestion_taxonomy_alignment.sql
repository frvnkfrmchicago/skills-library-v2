-- =============================================================================
-- Migration 002: Ingestion + Taxonomy Alignment
-- Asset Persona Content Hub
-- =============================================================================
-- Adds: ingest_items, errors tables
-- Aligns: posts columns + constraints with app + n8n workflows
--   - categories: add AI verticals
--   - status: remove rejected, add scheduled
--   - scheduled_at: rename from scheduled_for
--   - image_url: rename from img_url
--   - platforms + dimensions: add columns used by UI/workflows
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- POSTS: column alignment
-- ---------------------------------------------------------------------------

-- Rename scheduled_for -> scheduled_at (idempotent-ish)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='posts' and column_name='scheduled_for'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='posts' and column_name='scheduled_at'
  ) then
    alter table public.posts rename column scheduled_for to scheduled_at;
  end if;
end $$;

-- Rename img_url -> image_url
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='posts' and column_name='img_url'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='posts' and column_name='image_url'
  ) then
    alter table public.posts rename column img_url to image_url;
  end if;
end $$;

-- Add platforms array (used for routing / scheduled publisher)
alter table public.posts
  add column if not exists platforms text[] not null default '{}';

-- Add dimension fields (UI presets + downstream rendering)
alter table public.posts
  add column if not exists dimension text,
  add column if not exists dimension_w int,
  add column if not exists dimension_h int;

-- Drop old check constraints if present (names may vary; be defensive)
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.posts'::regclass
      and contype = 'c'
      and (pg_get_constraintdef(oid) ilike '%category%' or pg_get_constraintdef(oid) ilike '%status%')
  loop
    execute format('alter table public.posts drop constraint if exists %I', c.conname);
  end loop;
end $$;

-- Re-add category/status constraints with current taxonomy
alter table public.posts
  add constraint posts_category_check check (category in (
    'ai_ml',
    'ai_education',
    'ai_finance',
    'ai_health',
    'ai_public_health',
    'ai_dentistry',
    'dev_tools',
    'career',
    'culture',
    'creative',
    'industry'
  ));

alter table public.posts
  add constraint posts_status_check check (status in (
    'draft',
    'pending',
    'approved',
    'scheduled',
    'published'
  ));

-- ---------------------------------------------------------------------------
-- ERRORS: workflow error log table (used by n8n deploy scripts)
-- ---------------------------------------------------------------------------
create table if not exists public.errors (
  id         uuid primary key default gen_random_uuid(),
  workflow   text not null,
  error      text not null,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.errors enable row level security;

drop policy if exists errors_select on public.errors;
drop policy if exists errors_insert on public.errors;
drop policy if exists errors_update on public.errors;
drop policy if exists errors_delete on public.errors;

create policy errors_select on public.errors for select to authenticated using (true);
create policy errors_insert on public.errors for insert to authenticated with check (workflow is not null);
create policy errors_update on public.errors for update to authenticated using (true) with check (workflow is not null);
create policy errors_delete on public.errors for delete to authenticated using (true);

create index if not exists errors_workflow_idx on public.errors (workflow);
create index if not exists errors_created_at_idx on public.errors (created_at desc);

-- ---------------------------------------------------------------------------
-- INGESTION: raw RSS/API items for draft generation
-- ---------------------------------------------------------------------------
create table if not exists public.ingest_items (
  id             uuid primary key default gen_random_uuid(),
  source_type    text not null check (source_type in ('rss', 'api')),
  source_name    text not null,
  source_url     text,
  item_url       text not null,
  title          text not null,
  summary        text,
  published_at   timestamptz,
  category_hint  text,
  raw            jsonb not null default '{}'::jsonb,
  content_hash   text not null,
  created_at     timestamptz not null default now()
);

alter table public.ingest_items enable row level security;

drop policy if exists ingest_select on public.ingest_items;
drop policy if exists ingest_insert on public.ingest_items;
drop policy if exists ingest_update on public.ingest_items;
drop policy if exists ingest_delete on public.ingest_items;

create policy ingest_select on public.ingest_items for select to authenticated using (true);
create policy ingest_insert on public.ingest_items for insert to authenticated with check (content_hash is not null);
create policy ingest_update on public.ingest_items for update to authenticated using (true) with check (content_hash is not null);
create policy ingest_delete on public.ingest_items for delete to authenticated using (true);

create unique index if not exists ingest_items_hash_uq on public.ingest_items (content_hash);
create index if not exists ingest_items_created_at_idx on public.ingest_items (created_at desc);
create index if not exists ingest_items_published_at_idx on public.ingest_items (published_at desc);

commit;

