/* ═══ LEARN — shared types for AP-LEARN-2026-05 ═══
 * Mirrors the Wave 1 schema. Used by admin composer, learn hub, module reader,
 * generator Edge Function, and tutor Edge Function.
 */

export type ModuleType = 'daily_drill' | 'news_drop' | 'concept' | 'role_pathway' | 'project' | 'quiz' | 'match_game';
export type ModuleStatus = 'draft' | 'queued' | 'published' | 'archived';
export type LearnerRole = 'curious' | 'operator' | 'crafter' | 'architect' | 'producer';
export type ModuleDraftStatus = 'pending' | 'approved' | 'rejected';
export type ResourceKind = 'link' | 'tool' | 'video' | 'paper' | 'thread';

export interface MatchPair {
  term: string;
  definition: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

export interface ModuleResource {
  id: string;
  module_id: string;
  kind: ResourceKind;
  label: string;
  url: string;
  description?: string | null;
  position?: number | null;
}

export interface LearnModule {
  id: string;
  slug: string;
  type: ModuleType;
  status: ModuleStatus;

  // Anatomy
  hook: string;
  title: string;
  objective: string;
  context_md: string;
  practice_md: string | null;
  practice_starter: string | null;
  reflect_question: string | null;
  quiz_questions?: QuizQuestion[];
  match_pairs?: MatchPair[];

  // Targeting
  required_role: LearnerRole;
  tags: string[];
  cover_image: string | null;
  estimated_minutes: number;
  xp_reward: number;

  // Pathway
  pathway_id: string | null;
  pathway_order: number | null;

  // Provenance
  source_url: string | null;
  source_published_at: string | null;
  generated_by_ai: boolean;
  author_id: string | null;

  // Pinning
  pinned_as_today_drill_at: string | null; // YYYY-MM-DD

  published_at: string | null;
  created_at: string;
  updated_at: string;

  // Joined (optional)
  resources?: ModuleResource[];
}

export interface UserModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  step: 'hook' | 'context' | 'practice' | 'reflect' | 'complete';
  payload?: Record<string, unknown>;
  completed_at: string;
}

export interface ModuleCompletion {
  id: string;
  user_id: string;
  module_id: string;
  xp_earned: number;
  reflect_text?: string | null;
  completed_at: string;
}

export interface UserStreak {
  user_id: string;
  current_count: number;
  longest_count: number;
  last_completed_on: string | null; // YYYY-MM-DD
  freeze_days_used: number;
  freeze_days_available: number;
  updated_at: string;
}

export type AchievementBadge =
  | 'first_drill'
  | 'first_news_drop'
  | 'first_practice'
  | 'first_reflection'
  | 'three_in_a_row'
  | 'week_streak'
  | 'month_streak'
  | 'first_pathway'
  | 'crafter_unlocked'
  | 'architect_unlocked'
  | 'producer_unlocked'
  | 'first_tutor_question'
  | 'ten_modules'
  | 'fifty_modules';

export interface Achievement {
  id: string;
  user_id: string;
  badge: AchievementBadge;
  payload?: Record<string, unknown>;
  earned_at: string;
}

export interface NewsSource {
  id: string;
  label: string;
  rss_url: string;
  active: boolean;
  last_fetched_at: string | null;
  created_at: string;
}

export interface ModuleDraftQueueRow {
  id: string;
  source_url: string;
  source_title: string | null;
  source_published_at: string | null;
  source_label: string | null;
  source_hash: string | null;
  draft: ModuleAnatomyDraft;
  suggested_role: LearnerRole;
  suggested_tags: string[];
  suggested_type: ModuleType;
  status: ModuleDraftStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reject_reason: string | null;
  published_module_id: string | null;
  created_at: string;
  updated_at: string;
}

/** What the module-gen Edge Function returns (shape of `draft` jsonb) */
export interface ModuleAnatomyDraft {
  hook: string;
  title: string;
  objective: string;
  context_md: string;
  practice_md?: string;
  practice_starter?: string;
  reflect_question?: string;
  resources: { kind: ResourceKind; label: string; url: string; description?: string }[];
  suggested_tags?: string[];
  suggested_role?: LearnerRole;
}

export const LEARNER_ROLE_LADDER: { role: LearnerRole; label: string; xp_min: number; tag: string }[] = [
  { role: 'curious',   label: 'Curious',          xp_min: 0,    tag: 'just exploring' },
  { role: 'operator',  label: 'Operator',         xp_min: 50,   tag: 'daily AI user' },
  { role: 'crafter',   label: 'AI Crafter',       xp_min: 250,  tag: 'writes prompts confidently' },
  { role: 'architect', label: 'Context Architect',xp_min: 700,  tag: 'designs context systems' },
  { role: 'producer',  label: 'AI Producer',      xp_min: 1500, tag: 'ships AI work into the world' },
];

export function roleAtOrAbove(a: LearnerRole, b: LearnerRole): boolean {
  const order: LearnerRole[] = ['curious', 'operator', 'crafter', 'architect', 'producer'];
  return order.indexOf(a) >= order.indexOf(b);
}
