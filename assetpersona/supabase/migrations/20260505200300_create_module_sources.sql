-- ═══════════════════════════════════════════════
-- AP-LEARN-2026-05 · Wave 1 · Foundation
-- News sources + module drafts queue (for Wave 5 RSS pipeline)
-- ═══════════════════════════════════════════════

-- Status enum for queued drafts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'module_draft_status') THEN
    CREATE TYPE public.module_draft_status AS ENUM (
      'pending', 'approved', 'rejected'
    );
  END IF;
END $$;

-- Watched RSS sources
CREATE TABLE IF NOT EXISTS public.news_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL,
  rss_url text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  last_fetched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Drafts awaiting admin review
CREATE TABLE IF NOT EXISTS public.module_drafts_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_url text NOT NULL,
  source_title text,
  source_published_at timestamptz,
  source_label text,                       -- which news_source it came from
  source_hash text UNIQUE,                 -- dedupe key (hash of normalized URL)

  -- AI-drafted module anatomy
  draft jsonb NOT NULL,                    -- { hook, title, objective, context_md, resources[], practice_md, reflect_question }
  suggested_role public.learner_role DEFAULT 'curious',
  suggested_tags text[] DEFAULT '{}',
  suggested_type public.module_type DEFAULT 'news_drop',

  -- Review state
  status public.module_draft_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  reject_reason text,
  published_module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_sources_active ON public.news_sources (active);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON public.module_drafts_queue (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_hash ON public.module_drafts_queue (source_hash);

-- ── RLS ──
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_drafts_queue ENABLE ROW LEVEL SECURITY;

-- Admin-only on both
CREATE POLICY "Admin manage news sources" ON public.news_sources FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin read draft queue" ON public.module_drafts_queue FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Admin update draft queue" ON public.module_drafts_queue FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Admin delete draft queue" ON public.module_drafts_queue FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- INSERT goes through Edge Function (service-role) only — no RLS INSERT policy.

CREATE TRIGGER drafts_updated_at
  BEFORE UPDATE ON public.module_drafts_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed default RSS sources (idempotent)
INSERT INTO public.news_sources (label, rss_url) VALUES
  ('OpenAI Blog', 'https://openai.com/blog/rss.xml'),
  ('Anthropic News', 'https://www.anthropic.com/news/rss.xml'),
  ('Google AI Blog', 'https://blog.google/technology/ai/rss/'),
  ('Hugging Face Daily Papers', 'https://huggingface.co/papers/rss')
ON CONFLICT (rss_url) DO NOTHING;
