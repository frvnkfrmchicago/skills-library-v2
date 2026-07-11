-- ═══════════════════════════════════════════════
-- AP-LEARN-2026-05 · Wave 1 · Foundation
-- Modules + resources + tasks
-- ═══════════════════════════════════════════════
-- Daily learning modules for AI literacy. One anatomy, five types
-- (Daily Drill / News Drop / Concept / Role Pathway / Project).
-- Admin authors with AI assist (hybrid moderation per 2026 best practice).
-- ═══════════════════════════════════════════════

-- Module type enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'module_type') THEN
    CREATE TYPE public.module_type AS ENUM (
      'daily_drill', 'news_drop', 'concept', 'role_pathway', 'project'
    );
  END IF;
END $$;

-- Module status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'module_status') THEN
    CREATE TYPE public.module_status AS ENUM (
      'draft', 'queued', 'published', 'archived'
    );
  END IF;
END $$;

-- Learner role enum (the ladder)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learner_role') THEN
    CREATE TYPE public.learner_role AS ENUM (
      'curious', 'operator', 'crafter', 'architect', 'producer'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.modules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  type public.module_type NOT NULL DEFAULT 'concept',
  status public.module_status NOT NULL DEFAULT 'draft',

  -- Anatomy
  hook text NOT NULL,                -- 1-line "here's why you care"
  title text NOT NULL,
  objective text NOT NULL,           -- "after this you'll be able to..."
  context_md text NOT NULL DEFAULT '',  -- 60-90s explainer in markdown
  practice_md text,                  -- hands-on task instructions
  practice_starter text,             -- e.g. starter prompt to paste
  reflect_question text,             -- single reflection prompt

  -- Targeting
  required_role public.learner_role DEFAULT 'curious',
  tags text[] DEFAULT '{}',
  cover_image text,
  estimated_minutes integer DEFAULT 5,
  xp_reward integer DEFAULT 10,

  -- Pathway sequencing (when type='role_pathway' or grouped concept)
  pathway_id uuid,                   -- groups modules into a sequence
  pathway_order integer,

  -- Provenance
  source_url text,                   -- if generated from news / article
  source_published_at timestamptz,   -- when the source news dropped
  generated_by_ai boolean DEFAULT false,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Admin pinning
  pinned_as_today_drill_at date,     -- if non-null, this is a Today's Drill on that date

  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT modules_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- ── Resources (curated links + tools per module) ──
CREATE TABLE IF NOT EXISTS public.module_resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'link' CHECK (kind IN ('link', 'tool', 'video', 'paper', 'thread')),
  label text NOT NULL,
  url text NOT NULL,
  description text,
  position integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_modules_status_pub ON public.modules (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_modules_slug ON public.modules (slug);
CREATE INDEX IF NOT EXISTS idx_modules_type ON public.modules (type);
CREATE INDEX IF NOT EXISTS idx_modules_required_role ON public.modules (required_role);
CREATE INDEX IF NOT EXISTS idx_modules_today_drill ON public.modules (pinned_as_today_drill_at) WHERE pinned_as_today_drill_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_modules_pathway ON public.modules (pathway_id, pathway_order) WHERE pathway_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_modules_tags ON public.modules USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_module_resources_module ON public.module_resources (module_id);

-- Full-text search across hook + title + context
CREATE INDEX IF NOT EXISTS idx_modules_fts
  ON public.modules
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(hook, '') || ' ' || coalesce(context_md, '')));

-- ── RLS ──
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_resources ENABLE ROW LEVEL SECURITY;

-- Public read published
CREATE POLICY "Public read published modules"
  ON public.modules FOR SELECT
  USING (status = 'published');

-- Admin read all
CREATE POLICY "Admin read all modules"
  ON public.modules FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Admin INSERT/UPDATE/DELETE
CREATE POLICY "Admin manage modules"
  ON public.modules FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Resources mirror module access
CREATE POLICY "Public read resources of published modules"
  ON public.module_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      WHERE m.id = module_resources.module_id AND m.status = 'published'
    )
  );

CREATE POLICY "Admin read all resources"
  ON public.module_resources FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Admin manage resources"
  ON public.module_resources FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- updated_at trigger (function defined in launch packet's create_events_system migration)
CREATE TRIGGER modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
