-- ============================================================================
-- 002_core_profiles_members_plans.sql
-- Lane 1 — core identity tables. Implements docs/data-contract.md §4 tables
-- 1 (profiles), 2 (members), 3 (membership_plans).
-- ============================================================================

-- 1. profiles (mirror of auth.users) -----------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  class_year smallint check (class_year between 1867 and 2100),
  role public.user_role not null default 'member',
  directory_visible boolean not null default false,   -- privacy: default PRIVATE
  bio text,
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_id on public.profiles(id);
create index idx_profiles_email on public.profiles(email);
create index idx_profiles_role on public.profiles(role);

-- 2. members (chapter membership record, 1:1 profiles) ------------------------
create table public.members (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  membership_status public.membership_status not null default 'pending',
  chapter_role_title text,
  class_year smallint,
  stripe_customer_id text unique,
  stripe_subscription_id text,                          -- needed by payments lane
  joined_at date not null default current_date,
  expires_at date,
  notes text,                                            -- admin-only
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_members_profile_id on public.members(profile_id);
create index idx_members_status on public.members(membership_status);
create index idx_members_stripe_customer on public.members(stripe_customer_id);
create index idx_members_stripe_subscription on public.members(stripe_subscription_id);
create index idx_members_expires_at on public.members(expires_at);

-- 3. membership_plans --------------------------------------------------------
create table public.membership_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  amount_cents integer not null check (amount_cents >= 0),
  interval text not null check (interval in ('year','month','one_time','lifetime')),
  stripe_product_id text,
  stripe_price_id text unique,
  benefits jsonb not null default '[]',
  active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_membership_plans_active on public.membership_plans(active);
create index idx_membership_plans_stripe_price on public.membership_plans(stripe_price_id);
