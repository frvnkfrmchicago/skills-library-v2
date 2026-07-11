-- ============================================================================
-- 004_events_registrations.sql
-- Lane 1 — events. Implements docs/data-contract.md §4 tables 6 (events),
-- 7 (event_registrations), and the deferred payments.event_registration_id FK.
-- ============================================================================

-- 6. events ------------------------------------------------------------------
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  location_url text,
  capacity integer check (capacity > 0),
  waitlist_capacity integer check (waitlist_capacity >= 0),
  visibility public.event_visibility not null default 'public',
  status public.event_status not null default 'draft',
  price_cents integer not null default 0 check (price_cents >= 0),
  stripe_price_id text,
  payment_link_url text,                                 -- simple fixed-price public events
  image_url text,
  requires_approval boolean not null default false,
  category text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_events_visibility on public.events(visibility);
create index idx_events_status on public.events(status);
create index idx_events_date on public.events(event_date);

-- 7. event_registrations -----------------------------------------------------
create table public.event_registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  guest_count smallint not null default 0 check (guest_count >= 0),
  status public.registration_status not null default 'pending',
  payment_status public.registration_payment_status not null default 'not_required',
  payment_id uuid references public.payments(id) on delete set null,
  checked_in_at timestamptz,
  qr_code_token text unique default encode(gen_random_bytes(16),'hex'),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, profile_id)
);
create index idx_reg_event on public.event_registrations(event_id);
create index idx_reg_profile on public.event_registrations(profile_id);
create index idx_reg_status on public.event_registrations(status);

-- Resolve the forward reference from payments (declared in 003).
alter table public.payments
  add constraint fk_payments_event_registration
  foreign key (event_registration_id) references public.event_registrations(id) on delete set null;
