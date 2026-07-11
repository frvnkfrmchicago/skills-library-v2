/* ═══ Analytics — typed, bypass-aware, server-side mirroring ═══
 *
 * Three layers:
 *   1. localStorage ring (always, for dev/bypass inspection)
 *   2. Plausible (if VITE_PLAUSIBLE_DOMAIN set + not bypass)
 *   3. learner_events table (if Supabase configured + user is authed)
 *
 * Server-side write is non-blocking. The UI never waits for the insert.
 * AP-PLATFORM Analytics Spine Agent 4 added the table; this file consumes it.
 */

import { isBypassActive } from './devBypass';
import { supabase, isSupabaseConfigured } from './supabase';

export type AnalyticsEvent =
  | 'signup'
  | 'profile_started'
  | 'profile_completed'
  | 'inquiry_submitted'
  | 'event_registered'
  | 'post_view'
  | 'feed_post'
  | 'tier_upgrade'
  | 'page_view'
  | 'welcome_completed'
  | 'onboarding_step_completed'
  | 'module_view'
  | 'module_step_completed'
  | 'module_completed'
  | 'tutor_question'
  | 'newsletter_subscribed'
  | 'streak_milestone'
  | 'achievement_earned';

const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
const LS_EVENTS = 'ap_dev_events';
const SESSION_KEY = 'ap_session_id';

interface StoredEvent {
  event: AnalyticsEvent;
  props: Record<string, unknown>;
  ts: string;
}

/* ── Anonymous session id ── */
function ensureSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/* ── Local ring buffer ── */
function pushLocal(event: AnalyticsEvent, props: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LS_EVENTS);
    const arr: StoredEvent[] = raw ? JSON.parse(raw) : [];
    arr.unshift({ event, props, ts: new Date().toISOString() });
    localStorage.setItem(LS_EVENTS, JSON.stringify(arr.slice(0, 500)));
  } catch {
    /* quota — drop silently */
  }
}

export function readLocalEvents(): StoredEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_EVENTS);
    return raw ? (JSON.parse(raw) as StoredEvent[]) : [];
  } catch {
    return [];
  }
}

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
  }
}

/* ── Server-side mirror (non-blocking) ── */
async function pushServer(event: AnalyticsEvent, props: Record<string, unknown>): Promise<void> {
  if (!isSupabaseConfigured || isBypassActive()) return;
  if (typeof window === 'undefined') return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id ?? null;
    const sessionId = ensureSessionId();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('learner_events').insert({
      user_id: userId,
      session_id: sessionId,
      event_type: event,
      payload: props,
      path: window.location.pathname,
    });
  } catch {
    /* never block UI for analytics */
  }
}

/* ── Public API ── */
export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}): void {
  // 1. Local ring — always in dev/bypass.
  if (import.meta.env.DEV || isBypassActive()) {
    pushLocal(event, props);
  }

  // 2. Plausible — when configured + not bypass.
  if (PLAUSIBLE_DOMAIN && !isBypassActive() && typeof window !== 'undefined') {
    if (typeof window.plausible === 'function') {
      window.plausible(event, { props });
    }
  }

  // 3. Server-side learner_events — non-blocking; we never await this write.
  void pushServer(event, props);
}

export function pageView(path?: string): void {
  track('page_view', {
    path: path ?? (typeof window !== 'undefined' ? window.location.pathname : '/'),
  });
}
