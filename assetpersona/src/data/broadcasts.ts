/* ═══ BROADCASTS — multi-social dispatch admin data layer ═══
 *
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 5
 *
 * Read/write surface for the BroadcastsMonitor admin page. Mirrors
 * the bypass/remote pattern in contentHub.ts so the admin can click
 * through the calendar and activity table in dev with no Supabase
 * deploy.
 *
 * - listScheduledPosts(range)   → due + already-dispatched rows in window
 * - listPostResults(id)         → per-platform attempts for one scheduled post
 * - getCalendarRange(weekStart) → week-grouped view shape the monitor wants
 * - cancelScheduledPost(id)     → soft-delete (DELETE on the row) for due rows
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

export type SocialPlatform =
  | 'threads'
  | 'linkedin'
  | 'x'
  | 'bluesky'
  | 'instagram'
  | 'mastodon'
  | 'youtube';

export type PostResultStatus =
  | 'queued'
  | 'sent'
  | 'failed'
  | 'manual_required'
  | 'rate_limited';

export interface ScheduledPost {
  id: string;
  owner_id: string;
  source_kind: 'bulletin' | 'module' | 'blog' | 'custom';
  source_id: string | null;
  payload: { text: string; mediaUrls?: string[]; sourceUrl?: string };
  target_platforms: SocialPlatform[];
  scheduled_for: string;
  dispatched_at: string | null;
  created_at: string;
}

export interface PostResult {
  id: string;
  scheduled_post_id: string;
  platform: SocialPlatform;
  status: PostResultStatus;
  platform_post_id: string | null;
  permalink: string | null;
  error_message: string | null;
  response_payload: unknown;
  attempted_at: string;
}

export interface CalendarDay {
  /** ISO date YYYY-MM-DD. */
  date: string;
  posts: ScheduledPost[];
}

export interface CalendarRange {
  weekStart: string;
  days: CalendarDay[];
}

/* ── Local bypass storage ── */

const LS_SCHEDULED = 'ap_dev_scheduled_posts';
const LS_RESULTS = 'ap_dev_post_results';

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

function readLocal<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, rows: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch {
    /* ignore quota errors */
  }
}

function startOfDayIso(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  // Use Monday as the first day of the week.
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

/* ── List scheduled posts ── */

export async function listScheduledPosts(opts: {
  from?: string;
  to?: string;
} = {}): Promise<ScheduledPost[]> {
  if (!shouldUseRemote()) {
    let rows = readLocal<ScheduledPost>(LS_SCHEDULED);
    if (opts.from) rows = rows.filter((r) => r.scheduled_for >= opts.from!);
    if (opts.to) rows = rows.filter((r) => r.scheduled_for <= opts.to!);
    return [...rows].sort((a, b) =>
      a.scheduled_for.localeCompare(b.scheduled_for)
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = (supabase as any)
    .from('scheduled_posts')
    .select('*')
    .order('scheduled_for', { ascending: true })
    .limit(500);
  if (opts.from) query = query.gte('scheduled_for', opts.from);
  if (opts.to) query = query.lte('scheduled_for', opts.to);
  const { data, error } = await query;
  if (error) throw error;
  return (data as ScheduledPost[]) ?? [];
}

/* ── List per-attempt results ── */

export async function listPostResults(
  scheduledPostId?: string
): Promise<PostResult[]> {
  if (!shouldUseRemote()) {
    let rows = readLocal<PostResult>(LS_RESULTS);
    if (scheduledPostId) {
      rows = rows.filter((r) => r.scheduled_post_id === scheduledPostId);
    }
    return [...rows].sort((a, b) =>
      b.attempted_at.localeCompare(a.attempted_at)
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = (supabase as any)
    .from('post_results')
    .select('*')
    .order('attempted_at', { ascending: false })
    .limit(500);
  if (scheduledPostId) {
    query = query.eq('scheduled_post_id', scheduledPostId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as PostResult[]) ?? [];
}

/* ── Calendar view shape ── */

export async function getCalendarRange(
  weekStart?: Date
): Promise<CalendarRange> {
  const start = startOfWeek(weekStart ?? new Date());
  const end = addDays(start, 7);

  const posts = await listScheduledPosts({
    from: startOfDayIso(start),
    to: end.toISOString(),
  });

  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(start, i);
    const dateKey = toDateKey(day.toISOString());
    days.push({
      date: dateKey,
      posts: posts.filter((p) => toDateKey(p.scheduled_for) === dateKey),
    });
  }

  return {
    weekStart: toDateKey(start.toISOString()),
    days,
  };
}

/* ── Cancel a due scheduled post ── */

export async function cancelScheduledPost(id: string): Promise<void> {
  if (!shouldUseRemote()) {
    const rows = readLocal<ScheduledPost>(LS_SCHEDULED);
    const next = rows.filter((r) => r.id !== id);
    writeLocal(LS_SCHEDULED, next);
    // Also drop any local results for this row to keep the view tidy.
    const results = readLocal<PostResult>(LS_RESULTS);
    writeLocal(
      LS_RESULTS,
      results.filter((r) => r.scheduled_post_id !== id)
    );
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('scheduled_posts')
    .delete()
    .eq('id', id)
    .is('dispatched_at', null); // never delete a row that already went out
  if (error) throw error;
}

/* ── Helper: latest result per platform for one scheduled post ── */

export function indexResultsByPlatform(
  results: PostResult[]
): Record<SocialPlatform, PostResult | undefined> {
  const out: Partial<Record<SocialPlatform, PostResult>> = {};
  for (const r of results) {
    const prev = out[r.platform];
    if (!prev || r.attempted_at > prev.attempted_at) {
      out[r.platform] = r;
    }
  }
  return out as Record<SocialPlatform, PostResult | undefined>;
}
