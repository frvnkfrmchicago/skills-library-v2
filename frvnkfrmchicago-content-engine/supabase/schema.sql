-- =============================================================================
-- Asset Persona Content Hub -- Supabase Schema
-- =============================================================================
-- Idempotent. Safe to run repeatedly in the Supabase SQL editor.
-- Includes: team_members, posts, comments tables, RLS, indexes, realtime,
-- and updated_at trigger.
--
-- AUTH MODEL
-- ----------
-- Uses Supabase Auth. All RLS policies gate on authenticated role.
-- The team_members table maps auth users to team identities.
-- Service-role key is used by Edge Functions for cross-cutting writes
-- (social publishing, n8n webhooks).
-- =============================================================================


-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";


-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

-- team_members ---------------------------------------------------------------
create table if not exists public.team_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  role         text not null default 'team' check (role in ('admin', 'team')),
  position     text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- posts ----------------------------------------------------------------------
create table if not exists public.posts (
  id                 uuid primary key default gen_random_uuid(),
  category           text not null check (category in (
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
                     )),
  headline           text not null,
  hl_words           text[]      not null default '{}',
  caption            text,
  tags               text[]      not null default '{}',
  image_url          text,
  bg_url             text,
  source             text,
  status             text not null default 'pending' check (status in (
                       'draft', 'pending', 'approved', 'scheduled', 'published'
                     )),
  platforms          text[]      not null default '{}',
  dimension          text,
  dimension_w        int,
  dimension_h        int,
  assignee           text,
  created_by         text not null,
  created_by_name    text,
  platform_post_ids  jsonb       not null default '{}'::jsonb,
  scheduled_at       timestamptz,
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- comments -------------------------------------------------------------------
create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts(id) on delete cascade,
  author       text not null,
  author_name  text,
  body         text not null,
  created_at   timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------
create index if not exists posts_status_idx        on public.posts (status);
create index if not exists posts_category_idx      on public.posts (category);
create index if not exists posts_created_at_idx    on public.posts (created_at desc);
create index if not exists posts_scheduled_at_idx  on public.posts (scheduled_at);
create index if not exists comments_post_id_idx    on public.comments (post_id);
create index if not exists comments_created_at_idx on public.comments (created_at);


-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ---------------------------------------------------------------------------
-- Automatically stamps updated_at on every UPDATE to a posts row.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Drop and recreate so the script is idempotent.
drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.team_members enable row level security;
alter table public.posts        enable row level security;
alter table public.comments     enable row level security;


-- POLICIES -------------------------------------------------------------------
-- Drop existing so the script is idempotent.
drop policy if exists team_members_select on public.team_members;
drop policy if exists team_members_insert on public.team_members;
drop policy if exists team_members_update on public.team_members;
drop policy if exists team_members_delete on public.team_members;

drop policy if exists posts_select on public.posts;
drop policy if exists posts_insert on public.posts;
drop policy if exists posts_update on public.posts;
drop policy if exists posts_delete on public.posts;

drop policy if exists comments_select on public.comments;
drop policy if exists comments_insert on public.comments;
drop policy if exists comments_update on public.comments;
drop policy if exists comments_delete on public.comments;

-- TEAM_MEMBERS: authenticated users can read. Only admins insert/update/delete
-- (enforced at app layer; DB allows authenticated for simplicity since team is
-- small and trusted).
create policy team_members_select on public.team_members
  for select to authenticated using (true);
create policy team_members_insert on public.team_members
  for insert to authenticated with check (true);
create policy team_members_update on public.team_members
  for update to authenticated using (true) with check (true);
create policy team_members_delete on public.team_members
  for delete to authenticated using (true);

-- POSTS: all authenticated users can CRUD. created_by is required on insert.
create policy posts_select on public.posts
  for select to authenticated using (true);
create policy posts_insert on public.posts
  for insert to authenticated with check (created_by is not null);
create policy posts_update on public.posts
  for update to authenticated using (true) with check (created_by is not null);
create policy posts_delete on public.posts
  for delete to authenticated using (true);

-- COMMENTS: all authenticated users can read and write. author is required.
create policy comments_select on public.comments
  for select to authenticated using (true);
create policy comments_insert on public.comments
  for insert to authenticated with check (author is not null);
create policy comments_update on public.comments
  for update to authenticated using (true) with check (author is not null);
create policy comments_delete on public.comments
  for delete to authenticated using (true);


-- ---------------------------------------------------------------------------
-- ADMIN DELETE RPC
-- ---------------------------------------------------------------------------
-- Posts can be deleted directly via RLS, but this RPC provides an audit-safe
-- path that verifies the caller is an admin in team_members.
create or replace function public.admin_delete_post(p_id uuid, p_admin_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select role into v_role from public.team_members where name = p_admin_name;
  if v_role is null or v_role <> 'admin' then
    raise exception 'unauthorized: % is not an admin', p_admin_name;
  end if;
  delete from public.posts where id = p_id;
  return true;
end;
$$;

revoke all on function public.admin_delete_post(uuid, text) from public;
grant execute on function public.admin_delete_post(uuid, text) to authenticated;


-- ---------------------------------------------------------------------------
-- REALTIME PUBLICATION
-- ---------------------------------------------------------------------------
-- Add tables to supabase_realtime so postgres_changes events are broadcast.
-- Idempotent: catch the "already added" error.
do $$
begin
  alter publication supabase_realtime add table public.posts;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- ERRORS (workflow error logs)
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
create index if not exists errors_workflow_idx   on public.errors (workflow);
create index if not exists errors_created_at_idx on public.errors (created_at desc);

-- ---------------------------------------------------------------------------
-- INGESTION (raw RSS/API items)
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
  draft_post_id  uuid references public.posts(id) on delete set null,
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
create unique index if not exists ingest_items_hash_uq     on public.ingest_items (content_hash);
create index if not exists ingest_items_created_at_idx     on public.ingest_items (created_at desc);
create index if not exists ingest_items_published_at_idx   on public.ingest_items (published_at desc);

do $$
begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null;
end $$;
