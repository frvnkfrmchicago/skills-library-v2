/* ═══ MOMENTUM STORE — one honest read of engagement + tracking ═══
 *
 * AP-STUDYHALL · Momentum Engine (Lane 2)
 *
 * The pieces that show a learner their progress already exist, but they are
 * scattered across four stores and hidden behind different shapes. This file
 * is the SINGLE place that reads all four and rolls them into one typed model
 * the UI can render in one pass.
 *
 * Every number here is read from a real store. Nothing is invented. When a
 * source has nothing yet (a brand new learner, an empty review queue) the
 * field comes back as 0 or an empty list, never a fake-alive placeholder.
 *
 * Sources, all additive — this file does not modify any of them:
 *   - learnStore.ts      → completions, learnable module count, streak row
 *   - masteryStore.ts    → per-module mastery scores, due spaced-repetition
 *   - communityData.ts   → the LEVELS ladder + level-for-points math
 *
 * Routing is inherited: each store already picks Supabase (live) or
 * localStorage (bypass / unconfigured) on its own, so this file just calls the
 * public async functions and stays env-agnostic. It is SSR-safe: it never
 * touches window directly, and it tolerates a null userId by returning the
 * empty momentum state.
 */

import {
  listMyCompletions,
  listLearnableModules,
  getStreak,
} from './learnStore';
import { listMyMastery, listDueReviews, MASTERY_THRESHOLD } from './masteryStore';
import { LEVELS, getLevelForPoints, getLevelName, getMemberById } from './communityData';
import type { ModuleCompletion } from '../types/learn';

/* ── Public shape ── */

export interface Achievement {
  /** Stable id, safe for a React key. */
  id: string;
  /** Short human label shown on the badge. */
  label: string;
  /** One plain sentence explaining how it is earned. */
  description: string;
  /** True only when the real data clears the threshold. */
  earned: boolean;
  /** Optional lucide / phosphor icon name the UI can map to a component. */
  icon?: string;
}

export interface Momentum {
  /** Consecutive days with at least one completion. 0 for a new learner. */
  streakDays: number;
  /** Points the learner has earned. Drives level + rank. */
  xp: number;
  /** Level number on the community LEVELS ladder (1..7). */
  level: number;
  /** Human name for that level, e.g. "Contributor". */
  levelName: string;
  /** Points required to reach the next level, or the current xp at max level. */
  nextLevelXp: number;
  /** How many learnable modules this learner has finished. */
  modulesCompleted: number;
  /** How many learnable modules exist to finish. */
  totalModules: number;
  /** Average mastery percent across assessed modules, 0..100. 0 if none. */
  masteryAvg: number;
  /** Modules whose spaced-repetition review is due today or overdue. */
  dueReviews: number;
  /** Deterministic catalog with earned booleans from the real data. */
  achievements: Achievement[];
}

/** The honest empty model returned when there is no user to read for. */
function emptyMomentum(): Momentum {
  const level = LEVELS[0]?.level ?? 1;
  return {
    streakDays: 0,
    xp: 0,
    level,
    levelName: getLevelName(level),
    nextLevelXp: LEVELS[1]?.points_required ?? 0,
    modulesCompleted: 0,
    totalModules: 0,
    masteryAvg: 0,
    dueReviews: 0,
    achievements: buildAchievements({
      xp: 0,
      streakDays: 0,
      modulesCompleted: 0,
      masteryAvg: 0,
      projectsCompleted: 0,
    }),
  };
}

/* ── XP / level ──
 *
 * Points live on the auth profile in live mode and on the local members list in
 * bypass mode. The caller passes the userId; we read the local member as the
 * env-agnostic source and let the caller's profile.points override when richer.
 * getMomentum reads points from the member row so it works without a profile in
 * hand; the level math then comes straight from communityData's LEVELS. */

function readPoints(userId: string): number {
  const member = getMemberById(userId);
  const pts = member?.points;
  return typeof pts === 'number' && pts >= 0 ? pts : 0;
}

/** Points needed to reach the next level. At the top level we report the
 *  current threshold so the bar reads "full" rather than an invented number. */
function nextLevelPoints(currentLevel: number): number {
  const next = LEVELS.find((l) => l.level === currentLevel + 1);
  if (next) return next.points_required;
  const current = LEVELS.find((l) => l.level === currentLevel);
  return current?.points_required ?? 0;
}

/* ── Streak ──
 *
 * Preferred source is the streak row the learn loop maintains. If that row is
 * empty (count 0) we recompute the streak from completion timestamps so a
 * learner who has finished modules on back-to-back days still sees a real
 * streak. Both paths count CONSECUTIVE calendar days ending today or yesterday;
 * a gap of two or more days breaks the streak. */

function dayKey(iso: string): string {
  // Normalize any ISO timestamp to a UTC calendar day. Matches masteryStore's
  // YYYY-MM-DD convention so the two never disagree on what "a day" is.
  return new Date(iso).toISOString().slice(0, 10);
}

function streakFromCompletions(completions: ModuleCompletion[]): number {
  if (completions.length === 0) return 0;

  // Unique completion days, newest first.
  const days = Array.from(
    new Set(
      completions
        .map((c) => c.completed_at)
        .filter((t): t is string => typeof t === 'string' && t.length > 0)
        .map(dayKey),
    ),
  ).sort((a, b) => b.localeCompare(a));

  if (days.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = (() => {
    const d = new Date(today + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  // The streak is only live if the most recent completion is today or
  // yesterday. Otherwise it has lapsed and counts as 0.
  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + 'T00:00:00Z');
    prev.setUTCDate(prev.getUTCDate() - 1);
    const expected = prev.toISOString().slice(0, 10);
    if (days[i] === expected) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

/* ── Mastery ── */

function masteryAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, n) => acc + (Number.isFinite(n) ? n : 0), 0);
  return Math.round(sum / scores.length);
}

/* ── Achievements ──
 *
 * A fixed catalog. Each entry's `earned` is computed from a real threshold on
 * the numbers above, so the same learner state always produces the same badges.
 * No randomness, no "earned" flag stored anywhere — it is derived every read. */

interface AchievementInputs {
  xp: number;
  streakDays: number;
  modulesCompleted: number;
  masteryAvg: number;
  projectsCompleted: number;
}

function buildAchievements(input: AchievementInputs): Achievement[] {
  return [
    {
      id: 'first-lesson',
      label: 'First lesson',
      description: 'Finish your first lesson.',
      earned: input.modulesCompleted >= 1,
      icon: 'BookOpen',
    },
    {
      id: 'three-day-streak',
      label: '3-day streak',
      description: 'Learn something three days in a row.',
      earned: input.streakDays >= 3,
      icon: 'Flame',
    },
    {
      id: 'five-modules',
      label: '5 modules',
      description: 'Finish five lessons in total.',
      earned: input.modulesCompleted >= 5,
      icon: 'Stack',
    },
    {
      id: 'ten-modules',
      label: '10 modules',
      description: 'Finish ten lessons in total.',
      earned: input.modulesCompleted >= 10,
      icon: 'Books',
    },
    {
      id: 'mastery-80',
      label: 'Mastery 80%',
      description: `Reach an average mastery score of ${MASTERY_THRESHOLD}% or higher.`,
      earned: input.masteryAvg >= MASTERY_THRESHOLD,
      icon: 'Target',
    },
    {
      id: 'first-project',
      label: 'First project',
      description: 'Finish your first project module.',
      earned: input.projectsCompleted >= 1,
      icon: 'Wrench',
    },
    {
      id: 'week-streak',
      label: 'Week streak',
      description: 'Keep a seven-day learning streak.',
      earned: input.streakDays >= 7,
      icon: 'CalendarCheck',
    },
    {
      id: 'pro-level',
      label: 'Pro level',
      description: 'Earn enough points to reach the Pro level.',
      earned: input.xp >= (LEVELS.find((l) => l.name === 'Pro')?.points_required ?? Infinity),
      icon: 'Medal',
    },
  ];
}

/* ── The one read ── */

/**
 * Read every engagement + tracking source for one learner and roll them into a
 * single Momentum model. Pass the same userId pattern the Learn hub uses
 * (user?.id, or the bypass id when in dev bypass). A null/empty userId returns
 * the honest empty model rather than throwing.
 */
export async function getMomentum(userId: string | null | undefined): Promise<Momentum> {
  if (!userId) return emptyMomentum();

  const [completions, modules, mastery, due, streakRow] = await Promise.all([
    listMyCompletions(userId),
    listLearnableModules(),
    listMyMastery(userId),
    listDueReviews(userId),
    getStreak(userId),
  ]);

  // XP + level from the community points ladder.
  const xp = readPoints(userId);
  const level = getLevelForPoints(xp);
  const levelName = getLevelName(level);
  const nextLevelXp = nextLevelPoints(level);

  // Modules finished vs. available.
  const modulesCompleted = completions.length;
  const totalModules = modules.length;

  // Streak: trust the maintained row, fall back to recomputing from timestamps.
  const rowStreak = streakRow?.current_count ?? 0;
  const streakDays = rowStreak > 0 ? rowStreak : streakFromCompletions(completions);

  // Mastery average across every assessed module.
  const masteryAvg = masteryAverage(mastery.map((m) => m.score));

  // How many finished modules were projects — drives the "First project" badge.
  // We match completed module ids against the project-type modules in the list.
  const completedIds = new Set(completions.map((c) => c.module_id));
  const projectsCompleted = modules.filter(
    (m) => m.type === 'project' && completedIds.has(m.id),
  ).length;

  const achievements = buildAchievements({
    xp,
    streakDays,
    modulesCompleted,
    masteryAvg,
    projectsCompleted,
  });

  return {
    streakDays,
    xp,
    level,
    levelName,
    nextLevelXp,
    modulesCompleted,
    totalModules,
    masteryAvg,
    dueReviews: due.length,
    achievements,
  };
}
