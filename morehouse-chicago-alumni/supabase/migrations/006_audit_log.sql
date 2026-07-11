-- ============================================================================
-- 006_audit_log.sql
-- Lane 1 — append-only audit trail. Implements docs/data-contract.md §4
-- table 10 (audit_log).
-- ============================================================================

-- 10. audit_log (append-only) ------------------------------------------------
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
