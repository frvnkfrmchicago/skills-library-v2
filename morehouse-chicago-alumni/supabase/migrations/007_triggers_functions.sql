-- ============================================================================
-- 007_triggers_functions.sql
-- Lane 1 — triggers, new-user handler, custom access token hook, role helper.
-- Implements docs/data-contract.md §5.
--
-- References (2026):
--   supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook
--   supabase.com/docs/guides/database/postgres/row-level-security
-- ============================================================================

-- ----------------------------------------------------------------------------
-- handle_updated_at(): BEFORE UPDATE trigger keeps updated_at fresh.
-- ----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach to every mutable table that carries updated_at.
create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.members
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.membership_plans
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.dues_invoices
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.payments
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.events
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.event_registrations
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.content_sources
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.content_items
  for each row execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- handle_new_user(): on auth.users INSERT, create the mirror profiles row.
-- SECURITY DEFINER so it can write public.profiles regardless of caller.
-- search_path pinned to '' to prevent search-path hijacking (security hardening).
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- custom_access_token_hook(event jsonb): injects profiles.role into the JWT at
-- claims.app_metadata.role so RLS + the client can read role without a DB hit.
-- Registered in Dashboard -> Authentication -> Hooks (Customize Access Token).
-- Grant ONLY to supabase_auth_admin; revoke from authenticated/anon/public so
-- no end user can call it directly.
-- ----------------------------------------------------------------------------
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  claims     jsonb;
  user_role  public.user_role;
begin
  select role into user_role
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  claims := coalesce(event -> 'claims', '{}'::jsonb);

  -- jsonb_set will NOT create a missing parent object, so a path like
  -- '{app_metadata,role}' is a silent no-op when 'app_metadata' is absent
  -- (common for a fresh token). Ensure the parent exists first, otherwise the
  -- role claim never lands and every get_my_role()-based RLS policy breaks.
  if not (claims ? 'app_metadata') then
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  end if;

  -- No profile yet (race on first sign-in) -> 'public' until the next refresh.
  claims := jsonb_set(
    claims,
    '{app_metadata,role}',
    to_jsonb(coalesce(user_role::text, 'public'))
  );

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- The auth server (supabase_auth_admin) is the only caller of the hook.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
-- The hook reads profiles directly; grant the auth admin row access and bypass RLS.
grant select on table public.profiles to supabase_auth_admin;
create policy "Auth admin can read profiles for token hook"
  on public.profiles
  as permissive
  for select
  to supabase_auth_admin
  using (true);

-- ----------------------------------------------------------------------------
-- get_my_role(): STABLE SECURITY DEFINER helper used by RLS policies. Reads the
-- role claim the hook injected; defaults to 'public' when absent.
-- ----------------------------------------------------------------------------
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    'public'
  );
$$;

grant execute on function public.get_my_role() to authenticated, anon;
