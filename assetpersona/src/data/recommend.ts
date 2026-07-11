/* ═══ Smart "next module" recommender ═══
 *
 * Pure scoring — no I/O. Takes the candidate pool + the learner's signals,
 * returns a ranked list. Bypass-friendly because it doesn't touch any store.
 *
 * Score formula (0–100):
 *   +30  matches services_interest / target role
 *   +20  tag overlap with last 5 completions
 *   +15  type continuity (just finished a daily_drill → another daily_drill ranks higher)
 *   +10  not-yet-completed bonus
 *   +10  freshness (published in last 7 days)
 *    +5  shorter than 6 minutes (low effort)
 *   −20  same-as-just-completed (no immediate repeats)
 */

import type { LearnModule, ModuleCompletion, LearnerRole } from '../types/learn';

interface RecommendInput {
  candidates: LearnModule[];
  completions: ModuleCompletion[];
  /** Learner's role (Curious / Operator / Crafter / etc.) */
  role?: LearnerRole;
  /** What chip they picked in the welcome modal */
  servicesInterest?: string | null;
  /** The module they just completed, if any */
  justCompleted?: LearnModule | null;
}

interface ScoredModule {
  module: LearnModule;
  score: number;
  reasons: string[];
}

const ROLE_TO_TAG_HINT: Record<LearnerRole, string[]> = {
  curious: ['Foundations', 'Beginner', 'Concept'],
  operator: ['Daily', 'Practice', 'Tools'],
  crafter: ['Prompting', 'Architecture', 'Context Engineering'],
  architect: ['Architecture', 'Systems', 'Production'],
  producer: ['Shipping', 'Production', 'Outcomes'],
};

const SERVICES_TO_TAG_HINT: Record<string, string[]> = {
  hire: ['Strategy', 'Audit', 'Consulting'],
  speaking: ['Storytelling', 'Talks'],
  training: ['Teaching', 'Workshop', 'Curriculum'],
  learn: ['Foundations', 'Daily'],
  marketing: ['Marketing', 'Content', 'Voice'],
};

function lowerTags(m: LearnModule): string[] {
  return (m.tags ?? []).map((t) => t.toLowerCase());
}

export function recommend(input: RecommendInput): ScoredModule[] {
  const { candidates, completions, role, servicesInterest, justCompleted } = input;

  const completedIds = new Set(completions.map((c) => c.module_id));
  const recentTags = new Set<string>();
  for (const c of completions.slice(0, 5)) {
    const m = candidates.find((x) => x.id === c.module_id);
    if (m) for (const t of lowerTags(m)) recentTags.add(t);
  }

  const roleTags = role ? ROLE_TO_TAG_HINT[role].map((t) => t.toLowerCase()) : [];
  const servicesTags = servicesInterest
    ? (SERVICES_TO_TAG_HINT[servicesInterest] ?? []).map((t) => t.toLowerCase())
    : [];

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 3600 * 1000;

  const scored: ScoredModule[] = candidates
    .filter((m) => m.status === 'published')
    .map((m) => {
      let score = 0;
      const reasons: string[] = [];
      const tags = lowerTags(m);

      // role / services interest match
      const roleHit = roleTags.some((t) => tags.includes(t)) || m.required_role === role;
      if (roleHit) {
        score += 30;
        reasons.push(`fits your ${role ?? 'level'}`);
      }
      const servicesHit = servicesTags.some((t) => tags.includes(t));
      if (servicesHit) {
        score += 15;
        reasons.push(`matches your "${servicesInterest}" path`);
      }

      // tag overlap with recent completions
      const overlap = tags.filter((t) => recentTags.has(t)).length;
      if (overlap >= 1) {
        score += Math.min(20, overlap * 8);
        reasons.push(`continues a thread you started`);
      }

      // type continuity
      if (justCompleted && m.type === justCompleted.type && m.id !== justCompleted.id) {
        score += 15;
        reasons.push(`another ${m.type.replace('_', ' ')}`);
      }

      // not-yet-completed bonus
      if (!completedIds.has(m.id)) {
        score += 10;
      } else {
        score -= 20;
        reasons.push('already done — only re-suggesting if nothing else fits');
      }

      // freshness
      if (m.published_at && now - new Date(m.published_at).getTime() < sevenDaysMs) {
        score += 10;
        reasons.push('fresh this week');
      }

      // low effort
      if (m.estimated_minutes <= 6) score += 5;

      // never recommend the literal just-completed module
      if (justCompleted && m.id === justCompleted.id) {
        score -= 50;
      }

      return { module: m, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5);
}

export function topRecommendation(input: RecommendInput): ScoredModule | null {
  const list = recommend(input);
  return list.length > 0 ? list[0] : null;
}
