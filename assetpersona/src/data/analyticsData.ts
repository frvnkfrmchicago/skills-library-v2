/* ═══ ANALYTICS — Dual-layer event aggregations ═══
 *
 * Two layers, exported side by side:
 *
 *   1. SYNC (localStorage)
 *      - `trackEvent`, `getEventCount`, `getTopContent`, `getEventTimeline`,
 *        `getEventCountsByMeta`, `EVENTS`.
 *      - Backed by `localStorage` only. Kept stable for legacy consumers
 *        (e.g. `src/pages/admin/Dashboard.tsx` still imports these).
 *      - Real RECORDING of events to Supabase is handled by `src/lib/analytics.ts`
 *        via `track()` — that file mirrors to the `learner_events` table.
 *
 *   2. ASYNC (Supabase — `learner_events` + `user_events`)
 *      - `getSignupCount7dAsync`, `getModuleCompletions7dAsync`,
 *        `getDailyActiveUsersAsync`, `getTopContentAsync`,
 *        `getEventCountAsync`, `getEventTimelineAsync`.
 *      - Read from the real server-side event tables created by the
 *        AP-PLATFORM and AP-LAUNCH waves. Used by `Analytics.tsx`.
 *      - Each async fn falls back to synthetic-but-labeled data when
 *        Supabase is not configured OR dev-bypass is active. The
 *        `__synthetic` flag lets the UI surface a "demo data" hint.
 *
 * Why the split: changing every legacy sync call to async would ripple far
 * beyond the analytics page. Lane 4 only owns `analyticsData.ts`,
 * `Analytics.tsx`, and `lib/analytics.ts` — so the async fns sit alongside
 * the sync ones and the admin dashboard keeps working as-is.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

// ───────────────────────────────────────────────────────────────
// 1. SYNC layer — localStorage-backed (unchanged signatures)
// ───────────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  event: string;
  page?: string;
  metadata?: Record<string, string>;
  timestamp: string;
}

const STORAGE_KEY = 'ap_analytics_events';
const MAX_EVENTS = 5000; // Cap to prevent localStorage bloat

function loadEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return [];
  }
}

function saveEvents(events: AnalyticsEvent[]): void {
  // Keep only the most recent MAX_EVENTS
  const trimmed = events.slice(-MAX_EVENTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/** Track an event (sync, localStorage only). For server-side mirroring, use `track()` from `lib/analytics.ts`. */
export function trackEvent(
  event: string,
  metadata?: Record<string, string>
): void {
  const events = loadEvents();
  events.push({
    event,
    page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    metadata,
    timestamp: new Date().toISOString(),
  });
  saveEvents(events);
}

/** Get count of a specific event in the last N days (localStorage only). */
export function getEventCount(event: string, days?: number): number {
  let events = loadEvents().filter((e) => e.event === event);
  if (days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    events = events.filter((e) => new Date(e.timestamp) >= cutoff);
  }
  return events.length;
}

/** Get counts grouped by a metadata key (localStorage only). */
export function getEventCountsByMeta(
  event: string,
  metaKey: string,
  days?: number
): { key: string; count: number }[] {
  let events = loadEvents().filter((e) => e.event === event);
  if (days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    events = events.filter((e) => new Date(e.timestamp) >= cutoff);
  }

  const counts: Record<string, number> = {};
  for (const e of events) {
    const val = e.metadata?.[metaKey] || 'unknown';
    counts[val] = (counts[val] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

/** Get top content by view count (localStorage only). */
export function getTopContent(
  type: 'blog_view' | 'course_start' | 'product_view',
  limit = 10
): { id: string; views: number }[] {
  const key = type === 'blog_view' ? 'slug'
    : type === 'course_start' ? 'courseId'
    : 'productId';

  return getEventCountsByMeta(type, key)
    .slice(0, limit)
    .map(({ key: id, count }) => ({ id, views: count }));
}

/** Get event counts by day (localStorage only). */
export function getEventTimeline(event: string, days = 30): { date: string; count: number }[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const events = loadEvents().filter(
    (e) => e.event === event && new Date(e.timestamp) >= cutoff
  );

  const byDay: Record<string, number> = {};
  for (const e of events) {
    const day = e.timestamp.split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;
  }

  // Fill in gaps
  const result: { date: string; count: number }[] = [];
  const d = new Date(cutoff);
  const today = new Date();
  while (d <= today) {
    const key = d.toISOString().split('T')[0];
    result.push({ date: key, count: byDay[key] || 0 });
    d.setDate(d.getDate() + 1);
  }

  return result;
}

/** Named event constants for type-safe tracking (sync layer). */
export const EVENTS = {
  BLOG_VIEW: 'blog_view',
  COURSE_START: 'course_start',
  LESSON_COMPLETE: 'lesson_complete',
  PRODUCT_VIEW: 'product_view',
  PRODUCT_CLICK: 'product_click',
  PAGE_VIEW: 'page_view',
} as const;

// ───────────────────────────────────────────────────────────────
// 2. ASYNC layer — Supabase reads with bypass-mode fallback
// ───────────────────────────────────────────────────────────────

/**
 * When Supabase is unreachable (bypass mode OR creds missing), every async
 * helper returns the shape it would have returned from the server but with
 * `__synthetic: true` and clearly-non-zero placeholder numbers so the
 * admin can see the page is rendering correctly. The Analytics page reads
 * the flag and shows a "demo data — connect Supabase for real numbers"
 * notice.
 */
function useSynthetic(): boolean {
  return !isSupabaseConfigured || isBypassActive();
}

/** Common return shape for every async helper — keeps the synthetic flag at the wrapper level. */
export interface AsyncMetric<T> {
  value: T;
  __synthetic: boolean;
}

/** Number of `signup` events in the last `days` window. */
export async function getSignupCount7dAsync(days = 7): Promise<AsyncMetric<number>> {
  if (useSynthetic()) {
    return { value: 12, __synthetic: true };
  }
  try {
    const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    // Try user_events first (the canonical signup log per AP-LAUNCH Wave 1).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: ue, error: ueErr } = await (supabase as any)
      .from('user_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'signup')
      .gte('created_at', sinceIso);
    if (!ueErr && typeof ue === 'number' && ue > 0) {
      return { value: ue, __synthetic: false };
    }
    // Fallback: learner_events also mirrors signups via track('signup', …).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: le } = await (supabase as any)
      .from('learner_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'signup')
      .gte('created_at', sinceIso);
    return { value: typeof le === 'number' ? le : 0, __synthetic: false };
  } catch {
    return { value: 0, __synthetic: false };
  }
}

/** Number of `module_completed` events in the last `days` window. */
export async function getModuleCompletions7dAsync(days = 7): Promise<AsyncMetric<number>> {
  if (useSynthetic()) {
    return { value: 27, __synthetic: true };
  }
  try {
    const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    // `learner_events` carries `module_completed` (see src/lib/analytics.ts AnalyticsEvent union).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('learner_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'module_completed')
      .gte('created_at', sinceIso);
    if (error) return { value: 0, __synthetic: false };
    return { value: typeof count === 'number' ? count : 0, __synthetic: false };
  } catch {
    return { value: 0, __synthetic: false };
  }
}

/** Distinct user count per day for the last `days` window. */
export async function getDailyActiveUsersAsync(
  days = 7,
): Promise<AsyncMetric<{ date: string; users: number }[]>> {
  const fillEmptyDays = (counts: Record<string, number>): { date: string; users: number }[] => {
    const out: { date: string; users: number }[] = [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const d = new Date(cutoff);
    const today = new Date();
    while (d <= today) {
      const key = d.toISOString().split('T')[0];
      out.push({ date: key, users: counts[key] || 0 });
      d.setDate(d.getDate() + 1);
    }
    return out;
  };

  if (useSynthetic()) {
    // Synthetic curve so the chart isn't empty in bypass.
    const synth: Record<string, number> = {};
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      synth[d.toISOString().split('T')[0]] = 3 + Math.floor(Math.random() * 6);
    }
    return { value: fillEmptyDays(synth), __synthetic: true };
  }

  try {
    const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    // We aggregate client-side because Supabase JS .select() can't do
    // DISTINCT-per-day server-side without an RPC. Cheap for a 7-day window.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('learner_events')
      .select('user_id, created_at')
      .gte('created_at', sinceIso)
      .not('user_id', 'is', null);
    if (error || !data) return { value: fillEmptyDays({}), __synthetic: false };

    const byDay: Record<string, Set<string>> = {};
    for (const row of data as { user_id: string | null; created_at: string }[]) {
      if (!row.user_id) continue;
      const day = row.created_at.split('T')[0];
      if (!byDay[day]) byDay[day] = new Set();
      byDay[day].add(row.user_id);
    }
    const counts: Record<string, number> = {};
    for (const [day, set] of Object.entries(byDay)) counts[day] = set.size;
    return { value: fillEmptyDays(counts), __synthetic: false };
  } catch {
    return { value: fillEmptyDays({}), __synthetic: false };
  }
}

/**
 * Top viewed content. Looks at `learner_events.event_type IN ('post_view','module_view')`
 * and pulls a stable id from `payload` (`slug`, `post_id`, or `module_id`).
 */
export async function getTopContentAsync(
  type: 'post_view' | 'module_view',
  limit = 5,
  days = 30,
): Promise<AsyncMetric<{ id: string; views: number }[]>> {
  if (useSynthetic()) {
    const synth =
      type === 'post_view'
        ? [
            { id: 'sample-post-1', views: 42 },
            { id: 'sample-post-2', views: 31 },
            { id: 'sample-post-3', views: 18 },
          ]
        : [
            { id: 'sample-module-1', views: 26 },
            { id: 'sample-module-2', views: 14 },
          ];
    return { value: synth.slice(0, limit), __synthetic: true };
  }
  try {
    const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('learner_events')
      .select('payload, path')
      .eq('event_type', type)
      .gte('created_at', sinceIso);
    if (error || !data) return { value: [], __synthetic: false };

    const counts: Record<string, number> = {};
    for (const row of data as { payload: Record<string, unknown> | null; path: string | null }[]) {
      let id = '';
      const p = row.payload ?? {};
      if (type === 'post_view') {
        id = (p.slug as string) || (p.post_id as string) || (p.id as string) || '';
      } else {
        id = (p.module_id as string) || (p.moduleId as string) || (p.id as string) || '';
      }
      // Fall back to path (e.g. /blog/some-slug) if payload didn't carry an id.
      if (!id && row.path) {
        const segs = row.path.split('/').filter(Boolean);
        id = segs[segs.length - 1] || '';
      }
      if (!id) continue;
      counts[id] = (counts[id] || 0) + 1;
    }
    const ranked = Object.entries(counts)
      .map(([id, views]) => ({ id, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
    return { value: ranked, __synthetic: false };
  } catch {
    return { value: [], __synthetic: false };
  }
}

/** Count of any event in `learner_events` for the last `days` window. */
export async function getEventCountAsync(
  eventType: string,
  days = 30,
): Promise<AsyncMetric<number>> {
  if (useSynthetic()) {
    // Synthetic counts vary by event so the demo UI isn't all the same number.
    const synthMap: Record<string, number> = {
      post_view: 86,
      module_view: 41,
      module_completed: 27,
      inquiry_submitted: 6,
      page_view: 312,
      signup: 12,
    };
    return { value: synthMap[eventType] ?? 8, __synthetic: true };
  }
  try {
    const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('learner_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', eventType)
      .gte('created_at', sinceIso);
    if (error) return { value: 0, __synthetic: false };
    return { value: typeof count === 'number' ? count : 0, __synthetic: false };
  } catch {
    return { value: 0, __synthetic: false };
  }
}

/** Daily counts for one event type. Mirrors the sync getEventTimeline shape. */
export async function getEventTimelineAsync(
  eventType: string,
  days = 14,
): Promise<AsyncMetric<{ date: string; count: number }[]>> {
  const fillEmptyDays = (counts: Record<string, number>): { date: string; count: number }[] => {
    const out: { date: string; count: number }[] = [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const d = new Date(cutoff);
    const today = new Date();
    while (d <= today) {
      const key = d.toISOString().split('T')[0];
      out.push({ date: key, count: counts[key] || 0 });
      d.setDate(d.getDate() + 1);
    }
    return out;
  };

  if (useSynthetic()) {
    const synth: Record<string, number> = {};
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      synth[d.toISOString().split('T')[0]] = Math.floor(Math.random() * 18);
    }
    return { value: fillEmptyDays(synth), __synthetic: true };
  }

  try {
    const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('learner_events')
      .select('created_at')
      .eq('event_type', eventType)
      .gte('created_at', sinceIso);
    if (error || !data) return { value: fillEmptyDays({}), __synthetic: false };

    const counts: Record<string, number> = {};
    for (const row of data as { created_at: string }[]) {
      const day = row.created_at.split('T')[0];
      counts[day] = (counts[day] || 0) + 1;
    }
    return { value: fillEmptyDays(counts), __synthetic: false };
  } catch {
    return { value: fillEmptyDays({}), __synthetic: false };
  }
}

/**
 * Real-event identifiers (server-side, from `learner_events.event_type`).
 * Distinct from `EVENTS` above, which is the legacy localStorage-event vocabulary.
 */
export const SERVER_EVENTS = {
  SIGNUP: 'signup',
  POST_VIEW: 'post_view',
  MODULE_VIEW: 'module_view',
  MODULE_COMPLETED: 'module_completed',
  INQUIRY_SUBMITTED: 'inquiry_submitted',
  PAGE_VIEW: 'page_view',
  WELCOME_COMPLETED: 'welcome_completed',
} as const;
