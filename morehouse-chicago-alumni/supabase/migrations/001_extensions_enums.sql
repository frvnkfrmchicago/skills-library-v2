-- ============================================================================
-- 001_extensions_enums.sql
-- Morehouse Chicago Alumni (mcaa-wave-001) — Lane 1 (ARCH-DATA-AUTH)
-- Implements docs/data-contract.md §3 (enums) and required extensions.
-- Apply in order: supabase db reset (local) / supabase db push (remote).
-- Never hand-edit via the dashboard.
-- ============================================================================

-- Extensions ------------------------------------------------------------------
-- uuid-ossp provides uuid_generate_v4(). pgcrypto provides gen_random_bytes()
-- used by event_registrations.qr_code_token.
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enums (data-contract §3) ----------------------------------------------------
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
