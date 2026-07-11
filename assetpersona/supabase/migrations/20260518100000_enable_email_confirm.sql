-- ═══════════════════════════════════════════════
-- AP-LAUNCH-READY-2026-05 · Lane 6 · Backend Hardening
-- Email confirmation enabled (companion to config.toml flip)
-- ═══════════════════════════════════════════════
-- The actual enforcement flag for email confirmation lives in
-- supabase/config.toml at `[auth.email] enable_confirmations = true`
-- (flipped in the same lane). This migration is the SQL companion:
--   1. Tighten the public.handle_new_user trigger so a profile row is
--      only created when auth.users.email_confirmed_at is non-null OR
--      when we are running under service_role bypass. This prevents the
--      "unconfirmed signup leaves a half-populated profile" footgun.
--   2. Add an index on auth.users(email_confirmed_at) so admin queries
--      filtering "confirmed-only" stay snappy as the table grows.
--
-- Frank credential action (NOT done in this migration):
--   - After `supabase db push`, restart the auth service so the new
--     enable_confirmations flag takes effect: `supabase stop && supabase start`
--     locally, or hit "Restart Auth" in the linked-project dashboard.
-- ═══════════════════════════════════════════════

-- ── 1. Re-create handle_new_user with confirmation-aware insert ──
-- Keep the same trigger signature so existing trigger binding still works.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the project requires email confirmation, only seed the profile once
  -- the user has actually confirmed. Supabase fires this trigger on INSERT
  -- to auth.users (which happens at signup time, BEFORE confirmation), so
  -- we short-circuit when email_confirmed_at is NULL and the email is set.
  -- Service-role-driven inserts (admin invites, seeds) bypass this check
  -- because they typically pre-confirm or set the flag explicitly.
  IF new.email IS NOT NULL
     AND new.email_confirmed_at IS NULL
     AND COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
  THEN
    -- Defer: a second handler (below) seeds the profile when email_confirmed_at flips.
    RETURN new;
  END IF;

  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- ── 2. New trigger: seed profile on email confirmation ──
-- When enable_confirmations = true, the user row is created at signup but
-- email_confirmed_at stays NULL until they click the link. We watch for
-- that flip and create the profile then.
CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND (OLD.email_confirmed_at IS NULL)
  THEN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmed();

-- ── 3. Index for admin "confirmed users" filtering ──
CREATE INDEX IF NOT EXISTS idx_auth_users_email_confirmed_at
  ON auth.users (email_confirmed_at)
  WHERE email_confirmed_at IS NOT NULL;

-- ── 4. Revoke / grant on the new SECURITY DEFINER functions ──
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_email_confirmed() FROM PUBLIC;
-- These are trigger-bound; only the trigger executor (postgres) calls them.
-- We do NOT grant to anon or authenticated.
