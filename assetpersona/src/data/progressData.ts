/* ═══ LEARNING PROGRESS — localStorage persistence ═══
 * Tracks which lessons each user has completed.
 * When Supabase is wired, swap this layer.
 */

export interface ProgressEntry {
  userId: string;
  lessonId: string;
  courseId: string;
  completedAt: string;
}

const STORAGE_KEY = 'ap_lesson_progress';

function loadProgress(): ProgressEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProgressEntry[];
  } catch {
    return [];
  }
}

function saveProgress(entries: ProgressEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/** Mark a lesson as completed for a user */
export function markLessonComplete(userId: string, lessonId: string, courseId: string): void {
  const entries = loadProgress();
  const exists = entries.some((e) => e.userId === userId && e.lessonId === lessonId);
  if (exists) return;

  entries.push({
    userId,
    lessonId,
    courseId,
    completedAt: new Date().toISOString(),
  });

  saveProgress(entries);
}

/** Unmark a lesson (toggle off) */
export function unmarkLesson(userId: string, lessonId: string): void {
  const entries = loadProgress().filter(
    (e) => !(e.userId === userId && e.lessonId === lessonId)
  );
  saveProgress(entries);
}

/** Get all completed lesson IDs for a user in a specific course */
export function getCompletedLessons(userId: string, courseId: string): string[] {
  return loadProgress()
    .filter((e) => e.userId === userId && e.courseId === courseId)
    .map((e) => e.lessonId);
}

/** Get progress percentage for a user on a course */
export function getCourseProgress(
  userId: string,
  courseId: string,
  totalLessons: number
): { completed: number; total: number; pct: number } {
  const completed = getCompletedLessons(userId, courseId).length;
  return {
    completed,
    total: totalLessons,
    pct: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
  };
}

/** Get all progress entries (for admin overview) */
export function getAllProgress(): ProgressEntry[] {
  return loadProgress();
}

/** Get unique users who have started a specific course */
export function getCourseStarters(courseId: string): string[] {
  const entries = loadProgress().filter((e) => e.courseId === courseId);
  return [...new Set(entries.map((e) => e.userId))];
}

/** Get users who completed 100% of a course */
export function getCourseCompleters(courseId: string, totalLessons: number): string[] {
  const starters = getCourseStarters(courseId);
  return starters.filter((userId) => {
    const completed = getCompletedLessons(userId, courseId).length;
    return completed >= totalLessons;
  });
}
