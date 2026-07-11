# Morehouse Chicago Alumni — Data & Integration Contract

Wave: `mcaa-wave-001`
Status: canonical. This file is the single source of truth for schema, client API,
RLS, payments, content sourcing, and security invariants. Every lane reads this
before writing code. If a lane needs to deviate, it raises it to the lead — it does
not silently diverge.

Derived from the SAD critical-analysis pass (5 agents) on top of
`docs/MOREHOUSE-CHICAGO-SAD-ASSESSMENT-PLAN.md`.

---

## 0. How lanes use this contract

- Lane 1 IMPLEMENTS sections 3–6 (enums, DDL, triggers/role hook, RLS) as migrations,
  plus the client API surface in section 2 (`js/store.js`, `js/config.js`, `js/auth.js`).
- Lanes 2–8 CODE AGAINST this contract. They never edit another lane's files. Because
  the client API surface (section 2) and table schema (section 4) are fixed here, lanes
  can build in parallel against the contract even before Lane 1's files exist on disk.
- Security invariants (section 9) are HARD GATES enforced by the evidence contract.

---

## 1. Architecture summary

- Frontend stays static HTML/CSS/JS. No build step. `supabase-js` v2 loads via UMD CDN.
- Backend: Supabase (Postgres + Auth + RLS + Edge Functions) and Stripe.
- Persistence replaces localStorage. Auth replaces hardcoded passwords.
- Payments: Stripe Checkout (subscription for dues, payment for donations/tickets) +
  webhook reconciliation through a Supabase Edge Function.
- Content: real Localist RSS for events; manual capture for social; admin approval queue.

---

## 2. Client API contract (preserve the existing surface)

### 2.1 Script load order (every page)

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/config.js"></script>     <!-- window.SUPABASE_URL, window.SUPABASE_ANON_KEY -->
<script src="js/store.js"></script>        <!-- creates window.supabaseClient + window.Store adapter -->
<script src="js/auth.js"></script>         <!-- window.Auth gate helper -->
<!-- page-specific modules: events.js / directory.js / membership.js / content.js / admin*.js -->
<script src="js/app.js"></script>          <!-- App.init(): await Store.init() then render -->
```

Rationale: the jsDelivr `+esm` build of supabase-js v2 is broken (submodule
`default null` exports). Use the UMD global tag. The codebase is already `window.*`
global-based, so `window.supabaseClient` fits the pattern.

### 2.2 `window.Store` — thin Supabase adapter (Lane 1 owns `js/store.js`)

Preserve the existing public surface so no page rewrite is needed. Internals change
from localStorage to Supabase + an in-memory cache (sync shim over async I/O).

| Method | Contract |
|---|---|
| `Store.init()` | async. Loads session + initial domain data into `Store._cache`. Awaited by `App.init()` before any render. Clears stale prototype key `mca_auth`. |
| `Store.get(key)` | sync read from `Store._cache` (populated by init/subscriptions). |
| `Store.set(key, value)` | sync cache write + queued async Supabase upsert; fires `_notify`. |
| `Store.isSignedIn()` | `Store._session !== null` (cached Supabase session). |
| `Store.isAdmin()` | `Store._session?.user?.app_metadata?.role === 'admin'`. UI hint only — never an access decision. |
| `Store.signIn(email,password)` | async `supabaseClient.auth.signInWithPassword(...)`. |
| `Store.signOut()` | async `supabaseClient.auth.signOut()`. |
| `Store.on/_notify` | unchanged listener map; also fires on `onAuthStateChange`. |
| `Store.reset()` | dev-only behind `window.__DEV__`. Not in production path. |

`window.STORAGE_KEYS`, `generateId`, `formatDate`, `formatDateShort`, `formatTime`
stay exported unchanged. `HBCU_NEWS` / `SCHOLARSHIP_RECIPIENTS` stay until Lane 4 / data
migration replaces them with real records.

Lanes 3/4/5 query Supabase directly in their own modules via
`window.supabaseClient.from('<table>')…` — they do not route new reads through `Store`.

### 2.3 `window.Auth` — shared gate helper (Lane 1 owns `js/auth.js`)

```
Auth.init()              // getSession(), set Store._session, subscribe onAuthStateChange
Auth.requireAuth()       // redirect to index.html?signin=1 if no session
Auth.requireAdmin()      // requireAuth() then redirect unless app_metadata.role === 'admin'
Auth.updateNavForSession()// toggle Sign In / Sign Out + Admin link across pages
```

- Auth gates read role from the JWT (`session.user.app_metadata.role`) — fast, unspoofable.
- UI display may read `profiles.role`.
- Sensitive ops (admin actions, payment initiation) call `supabaseClient.auth.getUser()`
  to re-validate server-side, not just `getSession()`.

### 2.4 Flash-of-unauthenticated-content (FOAC)

Protected pages (`admin.html`, `admin-dues.html`, `admin-content.html`, `membership.html`,
and directory full-data mode) ship `<body style="visibility:hidden">`. `Auth.requireAuth()` /
`requireAdmin()` set `document.body.style.visibility='visible'` only after the session/role
check passes; otherwise the redirect fires before content is ever visible.

---

## 3. Enums (final, reconciled)

```sql
create type public.user_role as enum ('admin','board','member','public');

create type public.membership_status as enum
  ('pending','active','lapsed','past_due','comped','lifetime','manual','suspended','paused','expired');

create type public.dues_status as enum
  ('pending','paid','overdue','payment_failed','action_required','waived','refunded','void');

create type public.dues_invoice_type as enum ('annual_dues','pro_rated_dues','one_time_fee');

create type public.payment_purpose as enum ('dues','event_ticket','donation','sponsorship','other');

create type public.payment_status as enum ('pending','succeeded','failed','refunded','disputed');

create type public.event_visibility as enum ('public','members_only','board_only','draft');
create type public.event_status as enum ('draft','published','cancelled','completed');

create type public.registration_status as enum
  ('pending','approved','waitlisted','cancelled','checked_in');
create type public.registration_payment_status as enum ('not_required','pending','paid','refunded');

create type public.content_platform as enum
  ('morehouse_web','morehouse_news','morehouse_events','instagram','linkedin','national','chapter','other');
create type public.content_fetch_method as enum ('rss_poll','sitemap_diff','html_parse','manual_entry');
create type public.content_type as enum ('news','event','announcement','social_post','institutional');
create type public.content_chicago_relevance as enum ('direct','adjacent','general','not_relevant');
create type public.content_approval_status as enum ('pending','approved','rejected','archived','auto_approved');
```

---

## 4. DDL (11 tables — Lane 1 implements as migrations)

Reconciliation deltas applied over the schema analysis:
`members.stripe_subscription_id`, `membership_plans.stripe_product_id`,
`payments.designation`, new `stripe_webhook_events` table, and the richer
`content_sources` / `content_items` from the content analysis.

```sql
create extension if not exists "uuid-ossp";

-- 1. profiles (mirror of auth.users)
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

-- 2. members (chapter membership record, 1:1 profiles)
create table public.members (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  membership_status public.membership_status not null default 'pending',
  chapter_role_title text,
  class_year smallint,
  stripe_customer_id text unique,
  stripe_subscription_id text,                          -- DELTA: needed by payments lane
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

-- 3. membership_plans
create table public.membership_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  amount_cents integer not null check (amount_cents >= 0),
  interval text not null check (interval in ('year','month','one_time','lifetime')),
  stripe_product_id text,                                -- DELTA
  stripe_price_id text unique,
  benefits jsonb not null default '[]',
  active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_membership_plans_active on public.membership_plans(active);
create index idx_membership_plans_stripe_price on public.membership_plans(stripe_price_id);

-- 4. dues_invoices
create table public.dues_invoices (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid not null references public.members(id) on delete restrict,
  plan_id uuid references public.membership_plans(id) on delete set null,
  invoice_type public.dues_invoice_type not null default 'annual_dues',
  period_start date not null,
  period_end date not null,
  amount_cents integer not null check (amount_cents >= 0),
  status public.dues_status not null default 'pending',
  due_date date not null,
  stripe_invoice_id text unique,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  notes text,                                            -- admin-only
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end > period_start)
);
create index idx_dues_member on public.dues_invoices(member_id);
create index idx_dues_status on public.dues_invoices(status);
create index idx_dues_due_date on public.dues_invoices(due_date);
-- Double-charge guard: at most one open invoice per member per period
create unique index uq_dues_open_period on public.dues_invoices(member_id, period_start)
  where status in ('pending','payment_failed','action_required');

-- 5. payments (immutable ledger; service-role writes only)
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid references public.members(id) on delete set null,
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  amount_cents integer not null check (amount_cents >= 0),
  currency char(3) not null default 'usd',
  purpose_type public.payment_purpose not null,
  designation text,                                      -- DELTA: e.g. 'scholarship' | 'chapter'
  status public.payment_status not null default 'pending',
  dues_invoice_id uuid references public.dues_invoices(id) on delete set null,
  event_registration_id uuid,                            -- FK added after event_registrations
  metadata jsonb not null default '{}',
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_payments_member on public.payments(member_id);
create index idx_payments_pi on public.payments(stripe_payment_intent_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_purpose on public.payments(purpose_type);

-- 6. events
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
  payment_link_url text,                                 -- for simple fixed-price public events
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

-- 7. event_registrations
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
alter table public.payments
  add constraint fk_payments_event_registration
  foreign key (event_registration_id) references public.event_registrations(id) on delete set null;

-- 8. content_sources
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

-- 9. content_items
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

-- 10. audit_log (append-only)
create table public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role public.user_role,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_state jsonb,
  after_state jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);
create index idx_audit_actor on public.audit_log(actor_id);
create index idx_audit_entity on public.audit_log(entity_type, entity_id);
create index idx_audit_created on public.audit_log(created_at desc);

-- 11. stripe_webhook_events (idempotency; service-role only)  -- DELTA
create table public.stripe_webhook_events (
  id text primary key,                                   -- Stripe event.id
  type text not null,
  processed_at timestamptz not null default now()
);
```

---

## 5. Triggers + role hook (Lane 1)

- `handle_updated_at()` BEFORE UPDATE trigger on all mutable tables.
- `handle_new_user()` SECURITY DEFINER trigger on `auth.users` INSERT → inserts a `profiles`
  row (id, email, full_name from raw_user_meta_data).
- `custom_access_token_hook(event jsonb)` reads `profiles.role` and injects it into
  `claims.app_metadata.role`. Granted to `supabase_auth_admin` only; revoked from
  `authenticated/anon/public`. Registered in Dashboard → Authentication → Hooks.
- `get_my_role()` STABLE SECURITY DEFINER helper returns `auth.jwt()->'app_metadata'->>'role'`
  (default `'public'`), used by RLS policies.

Role model decision: `profiles.role` enum is the source of truth, mirrored into the JWT via
the hook. No separate roles table (scope is three fixed roles). Role changes take effect on
next token refresh; admin may force `auth.admin.signOut(userId)` for immediate revocation.

---

## 6. RLS (Lane 1 — enable on ALL 11 tables, then policies)

Enable RLS on every table including `stripe_webhook_events` (no policies → service-role only).
Policy intent per table (full `create policy` SQL provided to Lane 1 in the lane brief and
mirrored from the schema analysis):

| Table | Anon | Member | Admin/Board | Notes |
|---|---|---|---|---|
| profiles | none | own + `directory_visible=true` others | all | self-update cannot change `role` (WITH CHECK) |
| members | none | own | all | Stripe ids + notes never exposed to member via column intent |
| membership_plans | read `active=true` | read active | manage | pricing page is public |
| dues_invoices | none | own (via members.profile_id) | all | financial — private |
| payments | none | own | all | no client INSERT/UPDATE — service role only |
| events | read published+public | + members_only when published | all incl. drafts | board_only gated to admin/board |
| event_registrations | none | own | all | attendee lists are member/admin only |
| content_sources | none | none | all | holds Vault secret names |
| content_items | read approved/auto_approved | read approved | manage all | pending/rejected hidden from non-admin |
| audit_log | none | none | admin read only | append-only; no client writes |
| stripe_webhook_events | none | none | none | service role only |

CRITICAL: the `profiles` self-update policy MUST include
`with check (role = (select role from public.profiles where id = auth.uid()))`
to block self-elevation to admin. This is a tested QA item.

---

## 7. Payment architecture (Lane 2)

| Flow | Stripe primitive | Mode | Notes |
|---|---|---|---|
| Annual dues ($75 Standard / $150 Premium) | Checkout Session | subscription | Payment Links insufficient — need `client_reference_id=member_id` + metadata binding |
| Donations (variable) | Checkout Session + inline `price_data` | payment | `designation` = scholarship/chapter; min/max enforced server-side |
| Event tickets — simple fixed public | Payment Link (`events.payment_link_url`) | n/a | no server round-trip |
| Event tickets — gated / capacity / tiered | Checkout Session | payment | server checks capacity, embeds `event_registration_id` |

- Comped / lifetime / manual members NEVER enter Stripe. `create-checkout-session` returns
  `MEMBER_NOT_BILLABLE` (400) for those statuses; their dues_invoices are `waived`.
- Dues price is read from `membership_plans` by `plan_id` server-side — the client never
  sends an amount for dues.
- Webhook events handled: `checkout.session.completed`, `invoice.paid`,
  `invoice.payment_failed`, `invoice.payment_action_required`,
  `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`.
- Idempotency: check/insert `stripe_webhook_events` by `event.id`; unique constraints on
  `payments.stripe_payment_intent_id` and the dues open-period index as second layer.
- Deno runtime specifics: read raw body as text, verify with
  `stripe.webhooks.constructEventAsync(body, sig, STRIPE_WEBHOOK_SECRET)` FIRST,
  `Stripe.createFetchHttpClient()`, `npm:stripe` import.

---

## 8. Content sourcing reality (Lane 4)

| Source | Method | Verdict |
|---|---|---|
| events.morehouse.edu | Localist RSS `https://events.morehouse.edu/calendar/1.xml`, poll 6h | BUILD NOW — high confidence |
| news.morehouse.edu | HubSpot, no RSS (`/feed` → 404). HTML-parse page 1 (12h) AND request RSS from college | BUILD NOW — fragile; alert on 2 consecutive 0-item fetches |
| morehouse.edu | sitemap diff weekly, pattern-filter new URLs | BUILD NOW — low signal, supplemental |
| Instagram @morehouse1867 | needs college OAuth consent + Meta App Review | DEFER — manual capture only |
| LinkedIn morehouse-college | needs college OAuth consent + LinkedIn MDP approval | DEFER — manual capture only |
| morehousealumni.org (national) | no feed exists | manual capture only |

- Manual admin capture is a FIRST-CLASS feature, not a fallback (it is the only path for
  social). `content_sources` rows for IG/LinkedIn carry `requires_auth=true` + `auth_notes`.
- `content-sync` Edge Function: per-source invocation, read-before-write dedup on
  `(source_id, url)`, items land `approval_status='pending'`, never deletes, increments
  `consecutive_failures` and alerts at >=2. Auto-archive event items whose `source_date` is
  >7 days past.
- Provenance: keep `source_date`, `fetched_at`, `published_at` as three distinct timestamps.
- Copyright: summaries are excerpts only (<=500 chars) with attribution + link back;
  `image_url` links to source, not copied into Storage.
- Chicago relevance: keyword heuristic (no LLM call — in-app inference must stay cheap):
  `direct` (Chicago/Illinois/Midwest/chapter), `adjacent` (alumni/career/scholarship/giving/
  networking/mentoring/homecoming), `general`, `not_relevant`.

---

## 9. Security invariants (HARD GATES — evidence contract enforces)

1. `service_role` / `sk_live` / `sk_test` / `whsec_` NEVER in any client file. Gate:
   `grep -rn "service_role\|sk_live\|sk_test\|whsec_" js/ *.html` returns zero.
2. Admin gated by Supabase session + RLS, not hidden UI. `admin.html` and every admin module
   call `Auth.requireAdmin()` and render nothing until it passes. (This is the cross-lane
   item that "falls between lanes" — it is an explicit shared contract requirement.)
3. Directory default-private: `profiles.directory_visible` defaults `false`; unauthenticated
   visitors see zero member PII.
4. Every Edge Function validates input (Zod) before any DB access.
5. Stripe webhook verifies signature as the FIRST operation; 400 on failure; no write before.
6. Payment amounts for dues come from `membership_plans` server-side, never the client body.
7. No `innerHTML` for user-controlled strings — use `textContent` or sanitize. Applies to
   `admin.js`, `directory.js`, `events.js`, `event-detail.html`, new modules.
8. No security-relevant trust in localStorage. `Store.isAdmin()` is a UI hint only.
9. RLS enabled on EVERY table (verify `select tablename,rowsecurity from pg_tables where
   schemaname='public'` all true) — not just Lane 1's core tables.
10. `.gitignore` (`.env*`) and `.env.example` exist before any real key. Anon key may be
    committed in `js/config.js`; service role / Stripe secrets are Edge Function env only.
11. Security headers at hosting layer: `X-Frame-Options: DENY`, `X-Content-Type-Options:
    nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Content-Security-Policy`.

---

## 10. Shared-file handoff rules

Only two files have cross-lane ownership. Sequential handoff, enforced by batch order:

| File | First (Batch 1) | Then | Rule |
|---|---|---|---|
| `index.html` | Lane 1: CDN+config script tags, async sign-in form, nav session wiring | Lane 5 (Batch 2): membership/donate CTAs → Stripe | Lane 5 verifies Lane 1's commit + `js/config.js`/`js/auth.js` exist before editing |
| `js/app.js` | Lane 1: `App.init()` awaits `Store.init()` before render | Lane 6 (Batch 3): gallery upload → Supabase Storage | Lane 6 edits only after Lane 1 commit present |

All other files have exactly one lane owner (section 11).

---

## 11. File ownership map (no two lanes share a file except section 10)

| Lane | Owns |
|---|---|
| 1 | `supabase/migrations/*.sql`, `js/store.js`, `js/config.js`, `js/auth.js`, `.env.example`, `.gitignore`, `index.html`+`js/app.js` (first-touch per §10), `docs/data-contract.md` |
| 2 | `supabase/functions/create-checkout-session/**`, `supabase/functions/stripe-webhook/**`, `docs/payment-contract.md` |
| 3 | `events.html`, `event-detail.html`, `js/events.js`, `js/calendar.js`, `docs/event-flow.md` |
| 4 | `content.html`, `js/content.js`, `admin-content.html`, `js/admin-content.js`, `supabase/functions/content-sync/**`, `docs/content-sources.md` |
| 5 | `membership.html`, `js/membership.js`, `admin-dues.html`, `js/admin-dues.js`, `js/directory.js`, `directory.html`, `js/admin.js`, `admin.html`, `index.html` (CTA, second-touch), `docs/member-admin-flow.md` |
| 6 | `css/tokens.css`, `css/components.css`, `css/pages.css`, `css/animations.css`, `js/app.js` (gallery, second-touch), `docs/accessibility-check.md` |
| 7 | `tests/**`, `docs/security-review.md`, `docs/predeploy-report.md` |
| 8 | `data/seed/**`, `scripts/import-members.mjs`, `docs/board-runbook.md`, `docs/source-provenance.md` |

Note: directory + admin shell files moved to Lane 5 (they are member/admin UX and depend on
the auth gate), keeping Lane 3 strictly on events. This avoids Lane 3 ↔ Lane 5 collision.

---

## 12. Migration file split (Lane 1, apply in order)

```
001_extensions_enums.sql
002_core_profiles_members_plans.sql
003_financial_invoices_payments_webhookevents.sql
004_events_registrations.sql
005_content.sql
006_audit_log.sql
007_triggers_functions.sql        -- updated_at, handle_new_user, custom_access_token_hook, get_my_role
008_rls_enable.sql                -- enable RLS on all 11 tables
009_rls_policies.sql              -- all policies
010_seed_plans.sql                -- Standard $75/yr, Premium $150/yr, comped marker (labeled, real-format)
```

Apply: `supabase db reset` (local) / `supabase db push` (remote). Never hand-edit via dashboard.
