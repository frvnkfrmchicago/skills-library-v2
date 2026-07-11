-- ═══════════════════════════════════════════════
-- AP-COMMUNITY-2026-05 · FAQ + Q&A Agent 4
-- faqs table + categories + FTS index + 'qa' form_type extension
-- ═══════════════════════════════════════════════

-- Extend the existing inquiry_form_type enum from AP-LAUNCH so /faq's "Ask
-- Frank" form can route through inquiry-webhook with a clean form_type.
-- (Enum name is `inquiry_form_type` per 20260505100300_create_inquiries.sql.)
ALTER TYPE public.inquiry_form_type ADD VALUE IF NOT EXISTS 'qa';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'faq_category') THEN
    CREATE TYPE public.faq_category AS ENUM (
      'getting_started',
      'modules',
      'community',
      'tiers_and_pricing',
      'work_with_frank',
      'account',
      'other'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  category public.faq_category NOT NULL DEFAULT 'other',
  question text NOT NULL,
  answer_md text NOT NULL,
  position int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  -- Optional link to a related module so we can deep-link out of the FAQ
  related_module_slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Full-text search on question + answer
CREATE INDEX IF NOT EXISTS idx_faqs_fts
  ON public.faqs
  USING GIN (to_tsvector('english', question || ' ' || answer_md));

CREATE INDEX IF NOT EXISTS idx_faqs_category_position
  ON public.faqs (category, position);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read visible faqs" ON public.faqs;
CREATE POLICY "Public read visible faqs"
  ON public.faqs FOR SELECT
  USING (visible = true OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Admin manage faqs" ON public.faqs;
CREATE POLICY "Admin manage faqs"
  ON public.faqs FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE TRIGGER faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed a few starter FAQs so /faq isn't empty on first load
INSERT INTO public.faqs (slug, category, question, answer_md, position) VALUES
  ('what-is-asset-persona', 'getting_started', 'What is Asset Persona?', 'Asset Persona is Frank Lawrence Jr.''s daily AI literacy practice — short concept drops, hands-on drills, and a community that ships.', 1),
  ('how-do-modules-work', 'modules', 'How do daily modules work?', 'A module is a 3–10 minute concept with a hook, an objective, a short context, one practice task, and a reflect question. Finish one a day to keep your streak.', 2),
  ('can-i-message-frank', 'work_with_frank', 'Can I send Frank a direct message?', 'No DMs on purpose. Use the **Ask Frank** form below — it routes straight to his inbox and the admin queue. Or pick a Work With Frank pathway if you''re looking to hire.', 3),
  ('what-tiers-exist', 'tiers_and_pricing', 'What are the membership tiers?', 'Asset Class is free. Cohort, Insiders, and Private Lessons are paid tiers — each unlocks more depth + more time with Frank. See the AI Study Hall page.', 4)
ON CONFLICT (slug) DO NOTHING;
