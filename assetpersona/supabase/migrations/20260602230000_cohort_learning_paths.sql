-- ═══════════════════════════════════════════════
-- AP-COHORT-PATHS-2026-06 · Wave 10 · Foundation
-- Competencies + Monetization + Cohorts
-- ═══════════════════════════════════════════════

-- 1. Tracks learner competencies across VARK vectors for visual charts
CREATE TABLE IF NOT EXISTS public.learner_competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  visual_score integer NOT NULL DEFAULT 50 CHECK (visual_score >= 0 AND visual_score <= 100),
  auditory_score integer NOT NULL DEFAULT 50 CHECK (auditory_score >= 0 AND auditory_score <= 100),
  reading_score integer NOT NULL DEFAULT 50 CHECK (reading_score >= 0 AND reading_score <= 100),
  kinesthetic_score integer NOT NULL DEFAULT 50 CHECK (kinesthetic_score >= 0 AND kinesthetic_score <= 100),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learner_competencies ENABLE ROW LEVEL SECURITY;

-- 2. Monetization settings for custom/draft modules
CREATE TABLE IF NOT EXISTS public.module_monetization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.modules(id) ON DELETE CASCADE UNIQUE,
  is_premium boolean NOT NULL DEFAULT false,
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.module_monetization ENABLE ROW LEVEL SECURITY;

-- 3. Cohorts session scheduler (Luma sessions style)
CREATE TABLE IF NOT EXISTS public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  calendar_events jsonb NOT NULL DEFAULT '[]'::jsonb, -- Cohort schedule / Luma sessions
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

-- 4. Cohort memberships (RSVPs)
CREATE TABLE IF NOT EXISTS public.cohort_members (
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (cohort_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.cohort_members ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════

-- Learner Competencies
CREATE POLICY "Users can read own competencies"
  ON public.learner_competencies FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own competencies"
  ON public.learner_competencies FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Admin manage competencies"
  ON public.learner_competencies FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Module Monetization
CREATE POLICY "Public read module monetization"
  ON public.module_monetization FOR SELECT
  USING (true);

CREATE POLICY "Admin manage module monetization"
  ON public.module_monetization FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Cohorts
CREATE POLICY "Public read cohorts"
  ON public.cohorts FOR SELECT
  USING (true);

CREATE POLICY "Admin manage cohorts"
  ON public.cohorts FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Cohort Members
CREATE POLICY "Public read cohort members"
  ON public.cohort_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join cohorts"
  ON public.cohort_members FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can leave cohorts"
  ON public.cohort_members FOR DELETE
  USING (auth.uid() = profile_id);

CREATE POLICY "Admin manage cohort members"
  ON public.cohort_members FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
