-- ═══════════════════════════════════════════════
-- AP-ENGAGEMENT-LOOP-2026-05 · Wave 1 · Lane 3
-- Public profile — handle, 3-state visibility, shareable credentials
-- ═══════════════════════════════════════════════
-- Adds Uxcel/Read.cv-style public profile primitives:
--   - `handle`  : unique, URL-safe slug for /u/<handle>
--   - `visibility` : ENUM('private','unlisted','public') — Read.cv documented model
--                    'private'  = nobody but the owner can read the row
--                    'unlisted' = only people with the direct link can read it
--                    'public'   = anyone can read; can be indexed and listed
--   - `profile_credentials` : one row per earned badge or certificate, each with
--                             a `share_id` slug that powers /c/<share_id>
--
-- RLS:
--   - profiles    : public read when visibility != 'private', or self
--   - credentials : public read when the OWNING profile is non-private; owner writes
--
-- Re-runnable. Default visibility is 'private' so nothing leaks on rollout.
-- ═══════════════════════════════════════════════

-- ── 3-state visibility ENUM ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_visibility') THEN
    CREATE TYPE public.profile_visibility AS ENUM ('private', 'unlisted', 'public');
  END IF;
END $$;

-- ── Extend profiles with handle + visibility ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS handle text UNIQUE,
  ADD COLUMN IF NOT EXISTS visibility public.profile_visibility NOT NULL DEFAULT 'private';

-- Constrain handle shape: 3-30 chars, lowercase alphanumerics + underscore + hyphen,
-- must start with a letter or number. Mirrors Read.cv handle rules.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_handle_format'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_handle_format
      CHECK (handle IS NULL OR handle ~ '^[a-z0-9][a-z0-9_-]{2,29}$');
  END IF;
END $$;

-- Lowercase functional index for case-insensitive lookup on /u/<handle>
CREATE INDEX IF NOT EXISTS idx_profiles_handle
  ON public.profiles (lower(handle))
  WHERE handle IS NOT NULL;

-- Index for the "list public members" admin / search query
CREATE INDEX IF NOT EXISTS idx_profiles_visibility
  ON public.profiles (visibility)
  WHERE visibility <> 'private';

-- ── Public-read RLS on profiles ──
-- Non-private rows are readable by anyone (signed-in or anon). Owner can always
-- read their own row regardless of visibility. Existing owner write policies
-- elsewhere in the schema are preserved — this migration only relaxes SELECT.
DROP POLICY IF EXISTS "Public profiles readable" ON public.profiles;
CREATE POLICY "Public profiles readable" ON public.profiles
  FOR SELECT
  USING (visibility <> 'private' OR auth.uid() = id);

-- ── Credentials share table ──
-- One row per earned credential (badge or certificate). `share_id` is a short
-- URL-safe slug powering /c/<share_id>. `metadata` carries free-form payload
-- (issued-by, score, etc.) for the OG renderer.
CREATE TABLE IF NOT EXISTS public.profile_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('badge', 'certificate')),
  label text NOT NULL,
  share_id text NOT NULL UNIQUE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.profile_credentials ENABLE ROW LEVEL SECURITY;

-- Public read when the owning profile is non-private OR the viewer is the owner.
-- This means credentials inherit profile visibility: flip your profile back to
-- 'private' and the /c/<share_id> page 404s for everyone else.
DROP POLICY IF EXISTS "Credentials public read" ON public.profile_credentials;
CREATE POLICY "Credentials public read" ON public.profile_credentials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_id
        AND p.visibility <> 'private'
    )
    OR auth.uid() = profile_id
  );

-- Owner writes
DROP POLICY IF EXISTS "Credentials own write" ON public.profile_credentials;
CREATE POLICY "Credentials own write" ON public.profile_credentials
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Credentials own update" ON public.profile_credentials;
CREATE POLICY "Credentials own update" ON public.profile_credentials
  FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Credentials own delete" ON public.profile_credentials;
CREATE POLICY "Credentials own delete" ON public.profile_credentials
  FOR DELETE
  USING (auth.uid() = profile_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credentials_profile
  ON public.profile_credentials (profile_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_credentials_share_id
  ON public.profile_credentials (share_id);
