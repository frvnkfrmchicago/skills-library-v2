-- ═══════════════════════════════════════════════
-- AP-PLATFORM-2026-05 · Profile Schema Agent 1
-- email_subscribers — public newsletter signup (separate from auth.users)
-- ═══════════════════════════════════════════════
-- Captures emails from non-authenticated visitors who land on the Learn hub
-- (or any other surface) and want the digest. Authenticated users use
-- profiles.email_opt_in instead — this table is for the public funnel.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  source text,                          -- 'learn-hub' | 'work-page' | 'blog' | etc.
  utm_source text,
  utm_medium text,
  utm_campaign text,
  ip inet,
  user_agent text,
  status text NOT NULL DEFAULT 'active',  -- 'active' | 'unsubscribed' | 'bounced'
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_status
  ON public.email_subscribers (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_source
  ON public.email_subscribers (source);

-- ── RLS ──
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Admin reads + manages
CREATE POLICY "Admin manage email subscribers"
  ON public.email_subscribers FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- INSERT goes through Edge Function (subscribe-email) using service-role.
-- No public INSERT policy by design — prevents enumeration / spam.

CREATE TRIGGER email_subscribers_updated_at
  BEFORE UPDATE ON public.email_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
