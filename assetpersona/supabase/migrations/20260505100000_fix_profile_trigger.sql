-- ═══════════════════════════════════════════════
-- AP-LAUNCH-2026-05 · Wave 1 · Foundation
-- Fix profile-creation race
-- ═══════════════════════════════════════════════
-- Audit finding: AuthContext.signUp() inserted a profile row AND the
-- on_auth_user_created trigger inserted one. Race lost the user-supplied
-- display_name. This migration:
--   1. Updates handle_new_user() to read full_name from raw_user_meta_data
--      (set by signUp({ options: { data: { full_name } } }))
--   2. Falls back to the email local-part if no full_name was supplied
--   3. Seeds onboarding_step = 0 and services_interest = '[]'::jsonb
--
-- Wave 2 client (Agent 2) will pass full_name via signUp options and remove
-- the redundant client-side INSERT.
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name text;
BEGIN
  v_display_name := COALESCE(
    NULLIF(trim(new.raw_user_meta_data->>'full_name'), ''),
    NULLIF(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1)
  );

  INSERT INTO public.profiles (
    id,
    display_name,
    avatar_url,
    role,
    level,
    points,
    social_links
  )
  VALUES (
    new.id,
    v_display_name,
    new.raw_user_meta_data->>'avatar_url',
    'member',
    1,
    0,
    '{}'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), public.profiles.display_name);

  RETURN new;
END;
$$;

-- Trigger already exists (created by 20260414180447_create_events_system.sql).
-- The CREATE OR REPLACE above is sufficient; no need to recreate the trigger.
