-- ═══════════════════════════════════════════════
-- AP-LAUNCH-2026-05 · Wave 1 · Foundation
-- Create inquiries table — single ingress for all consultant forms
-- ═══════════════════════════════════════════════
-- Form types covered: consult, speaking, training, marketing, general.
-- Wave 2 Edge Function (Agent 4) writes rows here using service_role,
-- then triggers an n8n workflow that branches by form_type to send
-- templated Gmail to flawrence.d@gmail.com plus an auto-reply to the
-- submitter and a Google Sheet mirror.
--
-- RLS posture:
--   - INSERT: NOT exposed to anon/auth users at the DB level. The Edge
--     Function uses the service-role key, which bypasses RLS. This keeps
--     the form ingress server-side, protected by the Edge Function's
--     validation, rate limiting, honeypot, and HMAC.
--   - SELECT: admin-only.
--   - UPDATE: admin-only (Kanban status changes).
-- ═══════════════════════════════════════════════

-- Form type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_form_type') THEN
    CREATE TYPE public.inquiry_form_type AS ENUM (
      'consult',
      'speaking',
      'training',
      'marketing',
      'general'
    );
  END IF;
END $$;

-- Status enum (Kanban columns)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inquiry_status') THEN
    CREATE TYPE public.inquiry_status AS ENUM (
      'new',
      'contacted',
      'qualified',
      'won',
      'lost'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type public.inquiry_form_type NOT NULL,
  status public.inquiry_status NOT NULL DEFAULT 'new',

  -- Submitter
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,

  -- Substance
  message text,
  service_interest text[] DEFAULT '{}',
  fields jsonb DEFAULT '{}'::jsonb,  -- form-type-specific fields (event date, audience size, etc.)

  -- Scoring + assignment
  lead_score integer DEFAULT 0,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,

  -- Provenance
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  ip inet,
  user_agent text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,  -- if logged in

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT inquiries_email_check CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT inquiries_lead_score_range CHECK (lead_score >= 0 AND lead_score <= 100)
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_inquiries_form_type ON public.inquiries (form_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries (email);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to ON public.inquiries (assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiries_lead_score ON public.inquiries (lead_score DESC);

-- ── RLS ──
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Admin SELECT all
CREATE POLICY "Admin read all inquiries"
  ON public.inquiries
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Admin UPDATE (status changes, notes, assignment)
CREATE POLICY "Admin update inquiries"
  ON public.inquiries
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- Admin DELETE
CREATE POLICY "Admin delete inquiries"
  ON public.inquiries
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- INSERT: NOT exposed via RLS. Service-role only (Edge Function bypasses RLS).
-- This is intentional — see header.

-- ── updated_at trigger ──
CREATE TRIGGER inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── Companion: failed inquiries log (fed by Edge Function error branch) ──
CREATE TABLE IF NOT EXISTS public.inquiries_failed (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  payload jsonb NOT NULL,
  error_message text,
  source_ip inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inquiries_failed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read failed inquiries"
  ON public.inquiries_failed
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_inquiries_failed_created_at
  ON public.inquiries_failed (created_at DESC);
