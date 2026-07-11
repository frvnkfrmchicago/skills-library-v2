/* ═══ ARCHETYPE STORE — professional identity typing ═══
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 1
 *
 * AssetPersona is about professional identity, so members should be able to
 * find out what KIND of professional they are. This store holds:
 *   - ARCHETYPES: the catalog (in code so it versions without a migration).
 *   - A scoring model that maps quiz answers → per-axis scores → a result.
 *   - Persistence of the per-user result (user_archetypes table / local).
 *
 * The result-to-personalization loop (2026 best practice: a quiz that
 * unlocks a personalized surface) is consumed by the Portfolio identity
 * banner in Lane 6.
 *
 * Schema: supabase/migrations/20260613100100_professional_archetype.sql
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

/** The five professional axes a member scores on. */
export type ArchetypeAxis = 'build' | 'strategy' | 'story' | 'research' | 'operate';
export type ArchetypeKey = 'builder' | 'strategist' | 'storyteller' | 'researcher' | 'operator';

export interface Archetype {
  key: ArchetypeKey;
  axis: ArchetypeAxis;
  label: string;
  tagline: string;
  description: string;
  /** Strengths surfaced on the result reveal. */
  strengths: string[];
  /** What this archetype should lean into next — drives portfolio nudges. */
  growthEdge: string;
  /** Accent tokens used by the result reveal + portfolio banner. */
  accentVar: string;
}

export const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  builder: {
    key: 'builder',
    axis: 'build',
    label: 'The Builder',
    tagline: 'You ship. Ideas become things in your hands.',
    description:
      'You learn by making. Where others plan, you prototype — and the working thing teaches you the rest. AI is your force multiplier for turning a half-formed idea into something people can click.',
    strengths: ['Bias to a working prototype', 'Comfortable in the unknown', 'Fast iteration loops'],
    growthEdge: 'Pair your output with a clear story so the work gets the audience it earns.',
    accentVar: 'var(--ap-sky-400)',
  },
  strategist: {
    key: 'strategist',
    axis: 'strategy',
    label: 'The Strategist',
    tagline: 'You see the board. You play three moves ahead.',
    description:
      'You connect dots others miss and frame the problem before touching the solution. AI is your thinking partner for pressure-testing a plan from every angle.',
    strengths: ['Systems thinking', 'Sharp prioritization', 'Reads second-order effects'],
    growthEdge: 'Ship a rough version sooner — strategy compounds when it meets the real world.',
    accentVar: 'var(--ap-ocean-700)',
  },
  storyteller: {
    key: 'storyteller',
    axis: 'story',
    label: 'The Storyteller',
    tagline: 'You make people care. You turn work into a narrative.',
    description:
      'You translate complexity into something that lands. AI helps you draft, reframe, and find the line that makes an idea stick.',
    strengths: ['Audience empathy', 'Clear, vivid framing', 'Turns features into meaning'],
    growthEdge: 'Get closer to the build so your stories are grounded in what was actually made.',
    accentVar: 'var(--ap-rose-100)',
  },
  researcher: {
    key: 'researcher',
    axis: 'research',
    label: 'The Researcher',
    tagline: 'You go deep. You bring back what is actually true.',
    description:
      'You are the one who reads the source, runs the test, and refuses the easy answer. AI accelerates your search and synthesis without replacing your skepticism.',
    strengths: ['Rigor and depth', 'Source discipline', 'Comfortable with ambiguity'],
    growthEdge: 'Set a "good enough to act" line so depth turns into decisions.',
    accentVar: 'var(--ap-berry-500)',
  },
  operator: {
    key: 'operator',
    axis: 'operate',
    label: 'The Operator',
    tagline: 'You make it run. Reliably, repeatably, at scale.',
    description:
      'You turn chaos into a process that works on Tuesday too. AI is your automation layer for the work that should not need a human every time.',
    strengths: ['Process and reliability', 'Automation instinct', 'Calm under load'],
    growthEdge: 'Spend time on the zero-to-one — not everything worth doing is repeatable yet.',
    accentVar: 'var(--color-gold)',
  },
};

export const ARCHETYPE_LIST: Archetype[] = Object.values(ARCHETYPES);

/** A quiz question. Each option contributes weight to one or more axes. */
export interface ArchetypeQuestion {
  id: string;
  prompt: string;
  options: { label: string; weights: Partial<Record<ArchetypeAxis, number>> }[];
}

/** The questions. Plain-language situations, not jargon — 2026 quiz UX:
 *  short, concrete, "which is most you". */
export const ARCHETYPE_QUESTIONS: ArchetypeQuestion[] = [
  {
    id: 'q1',
    prompt: 'A new idea lands on your desk. What is your first move?',
    options: [
      { label: 'Open a blank file and start building a rough version', weights: { build: 2 } },
      { label: 'Map how it fits the bigger picture and what could go wrong', weights: { strategy: 2 } },
      { label: 'Figure out how to explain it so people get excited', weights: { story: 2 } },
      { label: 'Dig into whether it has actually worked elsewhere', weights: { research: 2 } },
    ],
  },
  {
    id: 'q2',
    prompt: 'Your favorite part of finishing a project is...',
    options: [
      { label: 'The thing works and someone is using it', weights: { build: 2 } },
      { label: 'It runs without me babysitting it', weights: { operate: 2 } },
      { label: 'People understood and felt something', weights: { story: 2 } },
      { label: 'I learned something true I did not know before', weights: { research: 2 } },
    ],
  },
  {
    id: 'q3',
    prompt: 'A teammate is stuck. You are most useful when you...',
    options: [
      { label: 'Sketch the plan and sequence the moves', weights: { strategy: 2 } },
      { label: 'Jump in and prototype a way through', weights: { build: 2 } },
      { label: 'Set up the system so it stops happening', weights: { operate: 2 } },
      { label: 'Find the reference that answers it', weights: { research: 1, strategy: 1 } },
    ],
  },
  {
    id: 'q4',
    prompt: 'How do you most want AI to work for you?',
    options: [
      { label: 'As a builder that turns my words into working things', weights: { build: 2 } },
      { label: 'As a thinking partner that stress-tests my plan', weights: { strategy: 2 } },
      { label: 'As a writer that helps me say it better', weights: { story: 2 } },
      { label: 'As an engine that automates the repetitive parts', weights: { operate: 2 } },
    ],
  },
  {
    id: 'q5',
    prompt: 'People come to you because you are good at...',
    options: [
      { label: 'Making something real, fast', weights: { build: 2 } },
      { label: 'Seeing around corners', weights: { strategy: 2 } },
      { label: 'Making the complex feel simple', weights: { story: 2 } },
      { label: 'Getting to the bottom of things', weights: { research: 2 } },
    ],
  },
  {
    id: 'q6',
    prompt: 'The work you are proudest of is the kind that...',
    options: [
      { label: 'Shipped and changed how something is done', weights: { build: 1, operate: 1 } },
      { label: 'Reframed the whole problem for everyone', weights: { strategy: 2 } },
      { label: 'Moved people to act', weights: { story: 2 } },
      { label: 'Proved something the team was unsure about', weights: { research: 2 } },
    ],
  },
];

export type AxisScores = Record<ArchetypeAxis, number>;

export interface ArchetypeResult {
  primary: ArchetypeKey;
  secondary: ArchetypeKey | null;
  scores: AxisScores; // normalized 0-100 per axis
}

const AXIS_TO_KEY: Record<ArchetypeAxis, ArchetypeKey> = {
  build: 'builder',
  strategy: 'strategist',
  story: 'storyteller',
  research: 'researcher',
  operate: 'operator',
};

/**
 * Score a set of answers (questionId → selected option index) into a result.
 * Raw weights are normalized to 0-100 per axis so the reveal can render a
 * clean bar chart and a clear primary/secondary.
 */
export function scoreArchetype(answers: Record<string, number>): ArchetypeResult {
  const raw: AxisScores = { build: 0, strategy: 0, story: 0, research: 0, operate: 0 };
  for (const q of ARCHETYPE_QUESTIONS) {
    const choice = answers[q.id];
    const opt = q.options[choice];
    if (!opt) continue;
    for (const [axis, w] of Object.entries(opt.weights)) {
      raw[axis as ArchetypeAxis] += w ?? 0;
    }
  }
  const max = Math.max(1, ...Object.values(raw));
  const scores = Object.fromEntries(
    Object.entries(raw).map(([axis, v]) => [axis, Math.round((v / max) * 100)]),
  ) as AxisScores;

  const ranked = (Object.keys(raw) as ArchetypeAxis[]).sort((a, b) => raw[b] - raw[a]);
  const primary = AXIS_TO_KEY[ranked[0]];
  const secondary = raw[ranked[1]] > 0 ? AXIS_TO_KEY[ranked[1]] : null;
  return { primary, secondary, scores };
}

/* ════════════════════ Persistence ════════════════════ */

const LS_KEY = 'ap_user_archetype';

export interface SavedArchetype {
  user_id: string;
  archetype_key: ArchetypeKey;
  secondary_key: ArchetypeKey | null;
  scores: AxisScores;
  taken_at: string;
}

export async function saveArchetypeResult(
  userId: string,
  result: ArchetypeResult,
): Promise<SavedArchetype> {
  const row: SavedArchetype = {
    user_id: userId,
    archetype_key: result.primary,
    secondary_key: result.secondary,
    scores: result.scores,
    taken_at: new Date().toISOString(),
  };
  if (!shouldUseRemote()) {
    try {
      const all = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as SavedArchetype[];
      const next = [row, ...all.filter((r) => r.user_id !== userId)];
      localStorage.setItem(LS_KEY, JSON.stringify(next.slice(0, 50)));
    } catch {
      /* quota — ignore */
    }
    return row;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('user_archetypes').upsert(
    {
      user_id: userId,
      archetype_key: result.primary,
      secondary_key: result.secondary,
      scores: result.scores,
      taken_at: row.taken_at,
    },
    { onConflict: 'user_id' },
  );
  return row;
}

export async function getMyArchetype(userId: string): Promise<SavedArchetype | null> {
  if (!shouldUseRemote()) {
    try {
      const all = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as SavedArchetype[];
      return all.find((r) => r.user_id === userId) ?? null;
    } catch {
      return null;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('user_archetypes')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as SavedArchetype) ?? null;
}
