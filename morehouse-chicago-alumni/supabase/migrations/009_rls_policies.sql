-- ============================================================================
-- 009_rls_policies.sql
-- Lane 1 — all RLS policies. Implements the policy matrix in
-- docs/data-contract.md §6 exactly.
--
-- Role checks read get_my_role() (the JWT app_metadata.role claim injected by
-- custom_access_token_hook). This is fast and avoids recursive RLS on profiles
-- that a `select ... from profiles` subquery would cause inside a profiles
-- policy. 'admin' and 'board' share management rights per the §6 matrix.
--
-- CRITICAL (§6): the profiles self-update policy WITH CHECK blocks a member
-- from changing their own role (self-elevation). Tested QA item.
-- ============================================================================

-- ===========================================================================
-- profiles
-- anon: none | member: own + directory_visible others | admin/board: all
-- ===========================================================================
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_select_visible_directory"
  on public.profiles for select to authenticated
  using (directory_visible = true);

create policy "profiles_admin_select_all"
  on public.profiles for select to authenticated
  using (public.get_my_role() in ('admin','board'));

create policy "profiles_insert_self"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- Self-update: a user may edit their own profile but MUST NOT change role.
-- The WITH CHECK pins the post-update role to the current stored value.
create policy "profiles_update_own_no_role_change"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Admin/board may update any profile (including role changes).
create policy "profiles_admin_update_all"
  on public.profiles for update to authenticated
  using (public.get_my_role() in ('admin','board'))
  with check (public.get_my_role() in ('admin','board'));

create policy "profiles_admin_delete"
  on public.profiles for delete to authenticated
  using (public.get_my_role() in ('admin','board'));

-- ===========================================================================
-- members
-- member: own (via profile_id) | admin/board: all
-- ===========================================================================
create policy "members_select_own"
  on public.members for select to authenticated
  using (profile_id = auth.uid());

create policy "members_admin_all"
  on public.members for all to authenticated
  using (public.get_my_role() in ('admin','board'))
  with check (public.get_my_role() in ('admin','board'));

-- ===========================================================================
-- membership_plans
-- public + member: read active | admin/board: manage. Pricing page is public.
-- ===========================================================================
create policy "membership_plans_read_active"
  on public.membership_plans for select to anon, authenticated
  using (active = true);

create policy "membership_plans_admin_all"
  on public.membership_plans for all to authenticated
  using (public.get_my_role() in ('admin','board'))
  with check (public.get_my_role() in ('admin','board'));

-- ===========================================================================
-- dues_invoices
-- member: own (via members.profile_id) | admin/board: all. Financial — private.
-- ===========================================================================
create policy "dues_select_own"
  on public.dues_invoices for select to authenticated
  using (
    member_id in (
      select m.id from public.members m where m.profile_id = auth.uid()
    )
  );

create policy "dues_admin_all"
  on public.dues_invoices for all to authenticated
  using (public.get_my_role() in ('admin','board'))
  with check (public.get_my_role() in ('admin','board'));

-- ===========================================================================
-- payments
-- member: own (read) | admin/board: all. NO client INSERT/UPDATE — the Stripe
-- webhook writes via the service role (which bypasses RLS).
-- ===========================================================================
create policy "payments_select_own"
  on public.payments for select to authenticated
  using (
    member_id in (
      select m.id from public.members m where m.profile_id = auth.uid()
    )
  );

create policy "payments_admin_select_all"
  on public.payments for select to authenticated
  using (public.get_my_role() in ('admin','board'));

-- ===========================================================================
-- events
-- anon: read published+public | member: + members_only when published
-- admin/board: all incl. drafts. board_only gated to admin/board.
-- ===========================================================================
create policy "events_public_read"
  on public.events for select to anon, authenticated
  using (status = 'published' and visibility = 'public');

create policy "events_members_read"
  on public.events for select to authenticated
  using (status = 'published' and visibility in ('public','members_only'));

create policy "events_board_read"
  on public.events for select to authenticated
  using (
    public.get_my_role() in ('admin','board')
    and visibility = 'board_only'
  );

create policy "events_admin_all"
  on public.events for all to authenticated
  using (public.get_my_role() in ('admin','board'))
  with check (public.get_my_role() in ('admin','board'));

-- ===========================================================================
-- event_registrations
-- member: own | admin/board: all. Attendee lists are member/admin only.
-- ===========================================================================
create policy "registrations_select_own"
  on public.event_registrations for select to authenticated
  using (profile_id = auth.uid());

create policy "registrations_insert_own"
  on public.event_registrations for insert to authenticated
  with check (profile_id = auth.uid());

create policy "registrations_update_own"
  on public.event_registrations for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "registrations_delete_own"
  on public.event_registrations for delete to authenticated
  using (profile_id = auth.uid());

create policy "registrations_admin_all"
  on public.event_registrations for all to authenticated
  using (public.get_my_role() in ('admin','board'))
  with check (public.get_my_role() in ('admin','board'));

-- ===========================================================================
-- content_sources
-- member/anon: none | admin/board: all. Holds Vault secret NAMES.
-- ===========================================================================
create policy "content_sources_admin_all"
  on public.content_sources for all to authenticated
  using (public.get_my_role() in ('admin','board'))
  with check (public.get_my_role() in ('admin','board'));

-- ===========================================================================
-- content_items
-- public + member: read approved/auto_approved | admin/board: manage all.
-- pending/rejected hidden from non-admin.
-- ===========================================================================
create policy "content_items_public_read_approved"
  on public.content_items for select to anon, authenticated
  using (approval_status in ('approved','auto_approved'));

create policy "content_items_admin_all"
  on public.content_items for all to authenticated
  using (public.get_my_role() in ('admin','board'))
  with check (public.get_my_role() in ('admin','board'));

-- ===========================================================================
-- audit_log
-- member/anon: none | admin: read only. Append-only; no client writes (writes
-- happen via service role / SECURITY DEFINER paths).
-- ===========================================================================
create policy "audit_log_admin_read"
  on public.audit_log for select to authenticated
  using (public.get_my_role() in ('admin','board'));

-- ===========================================================================
-- stripe_webhook_events
-- No policies. RLS is enabled (008) -> service role only. Intentionally empty.
-- ===========================================================================
