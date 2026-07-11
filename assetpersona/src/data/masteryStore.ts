/* ═══ MASTERY STORE — quiz tracking + mastery + spaced repetition ═══
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 1
 *
 * The learn experience used to throw quiz performance away — the score
 * lived in React state and vanished on unmount. This store persists every
 * answered question (quiz_attempts), rolls it up into a per-module mastery
 * score (user_mastery), and schedules spaced-repetition reviews
 * (review_schedule) on the 2026 retention curve.
 *
 * Routing matches learnStore.ts: localStorage in bypass / unconfigured
 * mode, Supabase otherwise. Same interface either way so callers don't
 * branch on env.
 *
 * Schema: supabase/migrations/20260613100000_learning_mastery.sql
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

/* ── Spaced-repetition ladder ──────────────────────────────────────────
 * Leitner boxes → days until next review. Tracks the 2026 retention curve
 * (review ~1 day after learning, then ~1 week, then ~1 month, then spaced
 * further). A pass advances a box; a miss resets to box 0. */
const BOX_INTERVAL_DAYS = [1, 3, 7, 16, 30, 60];
/** Mastery is "demonstrated" at or above this percent on the latest quiz. */
export const MASTERY_THRESHOLD = 80;

export interface QuizAttempt {
  id: string;
  user_id: string;
  module_id: string;
  question_id: string;
  selected_index: number;
  is_correct: boolean;
  attempt_no: number;
  answered_at: string;
}

export interface UserMastery {
  user_id: string;
  module_id: string;
  score: number;
  best_score: number;
  attempts: number;
  state: 'learning' | 'mastered';
  last_assessed_at: string;
  updated_at: string;
}

export interface ReviewRow {
  user_id: string;
  module_id: string;
  box: number;
  due_on: string; // YYYY-MM-DD
  last_reviewed_at: string;
}

/* ── localStorage helpers (bypass mode) ── */
const KEYS = {
  attempts: 'ap_quiz_attempts',
  mastery: 'ap_user_mastery',
  review: 'ap_review_schedule',
} as const;

function readArr<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeArr<T>(key: string, arr: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(arr.slice(0, 2000)));
  } catch {
    /* quota — drop silently */
  }
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ════════════════════ Quiz attempts ════════════════════ */

/**
 * Record a single answered question. Called once per question as the
 * learner checks their answer in the quiz overlay, so per-question
 * analytics survive even if the learner abandons the quiz mid-way.
 */
export async function recordQuizAttempt(
  userId: string,
  moduleId: string,
  questionId: string,
  selectedIndex: number,
  isCorrect: boolean,
): Promise<void> {
  if (!shouldUseRemote()) {
    const all = readArr<QuizAttempt>(KEYS.attempts);
    const prior = all.filter(
      (a) => a.user_id === userId && a.module_id === moduleId && a.question_id === questionId,
    ).length;
    all.unshift({
      id: crypto.randomUUID(),
      user_id: userId,
      module_id: moduleId,
      question_id: questionId,
      selected_index: selectedIndex,
      is_correct: isCorrect,
      attempt_no: prior + 1,
      answered_at: new Date().toISOString(),
    });
    writeArr(KEYS.attempts, all);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('quiz_attempts').insert({
    user_id: userId,
    module_id: moduleId,
    question_id: questionId,
    selected_index: selectedIndex,
    is_correct: isCorrect,
  });
}

/* ════════════════════ Mastery roll-up ════════════════════ */

/**
 * Commit a finished quiz: persist the percent score, update best score and
 * mastery state, and (re)schedule the spaced-repetition review. Returns the
 * resulting mastery row so the UI can celebrate "mastered" transitions.
 */
export async function commitQuizScore(
  userId: string,
  moduleId: string,
  correct: number,
  total: number,
): Promise<UserMastery> {
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= MASTERY_THRESHOLD;
  const now = new Date().toISOString();

  if (!shouldUseRemote()) {
    const all = readArr<UserMastery>(KEYS.mastery);
    const idx = all.findIndex((m) => m.user_id === userId && m.module_id === moduleId);
    const prev = idx >= 0 ? all[idx] : null;
    const next: UserMastery = {
      user_id: userId,
      module_id: moduleId,
      score,
      best_score: Math.max(score, prev?.best_score ?? 0),
      attempts: (prev?.attempts ?? 0) + 1,
      state: passed || prev?.state === 'mastered' ? 'mastered' : 'learning',
      last_assessed_at: now,
      updated_at: now,
    };
    if (idx >= 0) all[idx] = next;
    else all.push(next);
    writeArr(KEYS.mastery, all);
    scheduleReviewLocal(userId, moduleId, passed);
    return next;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prev } = await (supabase as any)
    .from('user_mastery')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .maybeSingle();

  const row = {
    user_id: userId,
    module_id: moduleId,
    score,
    best_score: Math.max(score, prev?.best_score ?? 0),
    attempts: (prev?.attempts ?? 0) + 1,
    state: passed || prev?.state === 'mastered' ? 'mastered' : 'learning',
    last_assessed_at: now,
    updated_at: now,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('user_mastery')
    .upsert(row, { onConflict: 'user_id,module_id' })
    .select()
    .single();
  await scheduleReviewRemote(userId, moduleId, passed);
  return (data as UserMastery) ?? row;
}

export async function getMastery(userId: string, moduleId: string): Promise<UserMastery | null> {
  if (!shouldUseRemote()) {
    return (
      readArr<UserMastery>(KEYS.mastery).find(
        (m) => m.user_id === userId && m.module_id === moduleId,
      ) ?? null
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('user_mastery')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .maybeSingle();
  return (data as UserMastery) ?? null;
}

export async function listMyMastery(userId: string): Promise<UserMastery[]> {
  if (!shouldUseRemote()) {
    return readArr<UserMastery>(KEYS.mastery).filter((m) => m.user_id === userId);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('user_mastery')
    .select('*')
    .eq('user_id', userId);
  return (data as UserMastery[]) ?? [];
}

/* ════════════════════ Spaced repetition ════════════════════ */

function scheduleReviewLocal(userId: string, moduleId: string, passed: boolean): void {
  const all = readArr<ReviewRow>(KEYS.review);
  const idx = all.findIndex((r) => r.user_id === userId && r.module_id === moduleId);
  const prevBox = idx >= 0 ? all[idx].box : 0;
  const box = passed ? Math.min(prevBox + 1, BOX_INTERVAL_DAYS.length - 1) : 0;
  const next: ReviewRow = {
    user_id: userId,
    module_id: moduleId,
    box,
    due_on: addDays(todayUtc(), BOX_INTERVAL_DAYS[box]),
    last_reviewed_at: new Date().toISOString(),
  };
  if (idx >= 0) all[idx] = next;
  else all.push(next);
  writeArr(KEYS.review, all);
}

async function scheduleReviewRemote(userId: string, moduleId: string, passed: boolean): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prev } = await (supabase as any)
    .from('review_schedule')
    .select('box')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .maybeSingle();
  const prevBox = prev?.box ?? 0;
  const box = passed ? Math.min(prevBox + 1, BOX_INTERVAL_DAYS.length - 1) : 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('review_schedule').upsert(
    {
      user_id: userId,
      module_id: moduleId,
      box,
      due_on: addDays(todayUtc(), BOX_INTERVAL_DAYS[box]),
      last_reviewed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,module_id' },
  );
}

/** Module ids whose review is due today or overdue — drives the
 *  "Review due" lane on the Learn hub. */
export async function listDueReviews(userId: string): Promise<ReviewRow[]> {
  const today = todayUtc();
  if (!shouldUseRemote()) {
    return readArr<ReviewRow>(KEYS.review)
      .filter((r) => r.user_id === userId && r.due_on <= today)
      .sort((a, b) => a.due_on.localeCompare(b.due_on));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('review_schedule')
    .select('*')
    .eq('user_id', userId)
    .lte('due_on', today)
    .order('due_on', { ascending: true });
  return (data as ReviewRow[]) ?? [];
}
