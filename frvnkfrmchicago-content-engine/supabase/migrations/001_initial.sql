-- =============================================================================
-- Migration 001: Initial Schema
-- Asset Persona Content Hub
-- =============================================================================
-- Run via: supabase db push
-- Or paste into the Supabase SQL editor.
-- =============================================================================

begin;

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
                       'ai_ml', 'dev_tools', 'career', 'culture', 'creative', 'industry'
                     )),
  headline           text not null,
  hl_words           text[]      not null default '{}',
  caption            text,
  tags               text[]      not null default '{}',
  img_url            text,
  bg_url             text,
  source             text,
  status             text not null default 'pending' check (status in (
                       'pending', 'draft', 'approved', 'published', 'rejected'
                     )),
  assignee           text,
  created_by         text not null,
  created_by_name    text,
  platform_post_ids  jsonb       not null default '{}'::jsonb,
  scheduled_for      timestamptz,
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
create index if not exists posts_scheduled_for_idx on public.posts (scheduled_for);
create index if not exists comments_post_id_idx    on public.comments (post_id);
create index if not exists comments_created_at_idx on public.comments (created_at);


-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

-- TEAM_MEMBERS
create policy team_members_select on public.team_members
  for select to authenticated using (true);
create policy team_members_insert on public.team_members
  for insert to authenticated with check (true);
create policy team_members_update on public.team_members
  for update to authenticated using (true) with check (true);
create policy team_members_delete on public.team_members
  for delete to authenticated using (true);

-- POSTS
create policy posts_select on public.posts
  for select to authenticated using (true);
create policy posts_insert on public.posts
  for insert to authenticated with check (created_by is not null);
create policy posts_update on public.posts
  for update to authenticated using (true) with check (created_by is not null);
create policy posts_delete on public.posts
  for delete to authenticated using (true);

-- COMMENTS
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
do $$
begin
  alter publication supabase_realtime add table public.posts;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null;
end $$;

commit;
