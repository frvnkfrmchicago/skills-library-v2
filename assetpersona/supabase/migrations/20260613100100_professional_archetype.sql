-- ═══════════════════════════════════════════════
-- AP-STUDYHALL-REBUILD-2026-06 · Lane 1 · Professional archetype
-- ═══════════════════════════════════════════════
-- AssetPersona is, by name, about professional identity — yet nothing in
-- the product captured what KIND of professional a member is. This table
-- persists the result of the archetype quiz (Builder / Strategist /
-- Storyteller / Researcher / Operator), the per-axis scores that produced
-- it, and a timestamp so a member can retake and we keep the latest.
--
-- The archetype CATALOG (labels, descriptions, traits) lives in code
-- (src/data/archetypeStore.ts) so it can ship and version without a
-- migration. Only the per-user RESULT is row data.
--
-- One row per user (UNIQUE user_id) — retaking overwrites via upsert.
-- RLS: a member reads + writes only their own row; results are
-- public-readable so a profile/portfolio badge can render for visitors.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_archetypes (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  archetype_key text NOT NULL,
  -- Per-axis 0-100 scores that produced the result, e.g.
  -- { "build": 80, "strategy": 40, "story": 20, "research": 55, "operate": 30 }.
  scores jsonb NOT NULL DEFAULT '{}',
  -- Secondary archetype (the runner-up) so the profile can read
  -- "Builder with a Strategist streak".
  secondary_key text,
  taken_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_archetypes ENABLE ROW LEVEL SECURITY;

-- Public read so archetype badges render on public profiles/portfolios.
CREATE POLICY "Public read archetypes" ON public.user_archetypes
  FOR SELECT USING (true);

CREATE POLICY "Member upserts own archetype" ON public.user_archetypes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Member updates own archetype" ON public.user_archetypes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
