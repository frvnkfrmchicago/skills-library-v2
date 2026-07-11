/* ═══ NOTIFICATIONS — bypass + Supabase router ═══
 *
 * Backs the NotificationBell badge in the navbar, the dropdown panel of
 * recent notifications, and the full /community/notifications page.
 *
 * Mirrors the bypass / remote pattern in `contentHub.ts`: when Supabase is
 * configured AND dev-bypass is OFF, talk to the live `notifications` table;
 * otherwise read/write a localStorage shadow so Frank can develop the UI
 * without a migration deploy.
 *
 * Exports:
 *   - `listNotifications({ limit, before, kinds })` — paginated inbox query
 *   - `countUnread()` — badge number
 *   - `markRead(id)` — single row
 *   - `markAllRead()` — bulk
 *   - `createNotification(payload)` — bypass-only helper (the trigger
 *     `parse_mentions_and_notify()` handles this server-side in real mode)
 *   - `subscribeToNotifications(recipientId, onChange)` — Realtime channel
 *     wrapper. Returns a cleanup function.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive, BYPASS_IDS } from '../lib/devBypass';

export type NotificationKind =
  | 'mention'
  | 'comment_reply'
  | 'post_reaction'
  | 'dm_received'
  | 'tier_change'
  | 'system';

export interface NotificationPayload {
  post_id?: string;
  comment_id?: string;
  parent_comment_id?: string;
  thread_id?: string;
  tier?: string;
  url?: string;
  message?: string;
}

export interface NotificationRow {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  kind: NotificationKind;
  payload: NotificationPayload;
  read_at: string | null;
  created_at: string;
  /** Joined display fields (best-effort — null in bypass) */
  actor_display_name?: string | null;
  actor_avatar_url?: string | null;
}

export interface ListNotificationsArgs {
  limit?: number;
  /** ISO timestamp — fetch rows older than this for cursor pagination */
  before?: string | null;
  /** Filter by one or more kinds (omit for all) */
  kinds?: NotificationKind[];
}

const LS_KEY = 'ap_notifications_inbox';

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

function nowIso(): string {
  return new Date().toISOString();
}

/* ── Local-store helpers ── */

function readLocal(): NotificationRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seedSynthetic();
    const parsed = JSON.parse(raw) as NotificationRow[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedSynthetic();
  } catch {
    return seedSynthetic();
  }
}

function writeLocal(rows: NotificationRow[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rows.slice(0, 200)));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * One-time synthetic seed so the bell + page have something to render in
 * dev-bypass mode without the trigger running. Re-runs only when the local
 * store is empty — once Frank writes a real local notification (or the
 * remote side takes over), the seed is gone.
 */
function seedSynthetic(): NotificationRow[] {
  const recipient = BYPASS_IDS.member;
  const adminActor = BYPASS_IDS.admin;
  const now = Date.now();
  const minutes = (n: number) => new Date(now - n * 60_000).toISOString();
  const synthetic: NotificationRow[] = [
    {
      id: 'seed-mention-1',
      recipient_id: recipient,
      actor_id: adminActor,
      kind: 'mention',
      payload: { post_id: 'demo-post-1' },
      read_at: null,
      created_at: minutes(4),
      actor_display_name: 'Dev Admin',
      actor_avatar_url: null,
    },
    {
      id: 'seed-reply-1',
      recipient_id: recipient,
      actor_id: adminActor,
      kind: 'comment_reply',
      payload: { post_id: 'demo-post-1', comment_id: 'demo-comment-1' },
      read_at: null,
      created_at: minutes(38),
      actor_display_name: 'Dev Admin',
      actor_avatar_url: null,
    },
    {
      id: 'seed-system-1',
      recipient_id: recipient,
      actor_id: null,
      kind: 'system',
      payload: { message: 'Welcome to the community.' },
      read_at: minutes(220),
      created_at: minutes(360),
      actor_display_name: null,
      actor_avatar_url: null,
    },
  ];
  return synthetic;
}

/* ── List (paginated) ── */

export async function listNotifications(
  args: ListNotificationsArgs = {}
): Promise<NotificationRow[]> {
  const limit = Math.min(args.limit ?? 20, 100);

  if (!shouldUseRemote()) {
    let rows = readLocal();
    if (args.kinds && args.kinds.length > 0) {
      const set = new Set(args.kinds);
      rows = rows.filter((r) => set.has(r.kind));
    }
    if (args.before) {
      rows = rows.filter((r) => r.created_at < args.before!);
    }
    return [...rows]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }

  // Live mode — pull from the notifications table, join the actor profile so
  // the bell + page can render the actor's display_name without a second
  // round-trip.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('notifications')
    .select(
      'id, recipient_id, actor_id, kind, payload, read_at, created_at, actor:profiles!notifications_actor_id_fkey ( display_name, avatar_url )'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (args.before) query = query.lt('created_at', args.before);
  if (args.kinds && args.kinds.length > 0) query = query.in('kind', args.kinds);

  const { data, error } = await query;
  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any[]) ?? []).map((row) => ({
    id: row.id,
    recipient_id: row.recipient_id,
    actor_id: row.actor_id,
    kind: row.kind,
    payload: row.payload ?? {},
    read_at: row.read_at,
    created_at: row.created_at,
    actor_display_name: row.actor?.display_name ?? null,
    actor_avatar_url: row.actor?.avatar_url ?? null,
  }));
}

/* ── Unread count ── */

export async function countUnread(): Promise<number> {
  if (!shouldUseRemote()) {
    return readLocal().filter((r) => r.read_at === null).length;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count, error } = await (supabase as any)
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null);
  if (error) throw error;
  return count ?? 0;
}

/* ── Mark single read ── */

export async function markRead(id: string): Promise<void> {
  if (!shouldUseRemote()) {
    const rows = readLocal();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx >= 0 && rows[idx].read_at === null) {
      rows[idx] = { ...rows[idx], read_at: nowIso() };
      writeLocal(rows);
    }
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('notifications')
    .update({ read_at: nowIso() })
    .eq('id', id)
    .is('read_at', null);
  if (error) throw error;
}

/* ── Mark all read ── */

export async function markAllRead(): Promise<number> {
  if (!shouldUseRemote()) {
    const rows = readLocal();
    let changed = 0;
    const ts = nowIso();
    const next = rows.map((r) => {
      if (r.read_at === null) {
        changed += 1;
        return { ...r, read_at: ts };
      }
      return r;
    });
    writeLocal(next);
    return changed;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error, count } = await (supabase as any)
    .from('notifications')
    .update({ read_at: nowIso() }, { count: 'exact' })
    .is('read_at', null);
  if (error) throw error;
  return count ?? 0;
}

/* ── Create (bypass helper — real mode uses the DB trigger) ── */

export async function createNotification(
  row: Omit<NotificationRow, 'id' | 'created_at' | 'read_at' | 'actor_display_name' | 'actor_avatar_url'>
): Promise<NotificationRow> {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const built: NotificationRow = {
    id,
    recipient_id: row.recipient_id,
    actor_id: row.actor_id,
    kind: row.kind,
    payload: row.payload ?? {},
    read_at: null,
    created_at: nowIso(),
    actor_display_name: null,
    actor_avatar_url: null,
  };

  if (!shouldUseRemote()) {
    const rows = readLocal();
    rows.unshift(built);
    writeLocal(rows);
    return built;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('notifications')
    .insert({
      recipient_id: row.recipient_id,
      actor_id: row.actor_id,
      kind: row.kind,
      payload: row.payload ?? {},
    })
    .select()
    .single();
  if (error) throw error;
  return {
    ...built,
    ...(data as NotificationRow),
  };
}

/* ── Realtime subscription ── */

type UnsubFn = () => void;

/**
 * Subscribe to INSERT + UPDATE events on the notifications table scoped to
 * `recipient_id`. Returns a cleanup function — call it on unmount.
 *
 * In bypass / unconfigured mode this is a no-op that returns a no-op cleanup
 * so callers don't have to special-case the dev environment.
 */
export function subscribeToNotifications(
  recipientId: string | null | undefined,
  onChange: (row: NotificationRow, event: 'INSERT' | 'UPDATE') => void
): UnsubFn {
  if (!recipientId || !shouldUseRemote()) {
    return () => {
      /* noop */
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channel = (supabase as any)
    .channel(`notifications-${recipientId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${recipientId}`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => {
        onChange(payload.new as NotificationRow, 'INSERT');
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${recipientId}`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => {
        onChange(payload.new as NotificationRow, 'UPDATE');
      }
    )
    .subscribe();

  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (supabase as any).removeChannel(channel);
  };
}

/* ── Convenience: routing target ── */

/**
 * Where should clicking this notification take the user? Centralized so the
 * bell dropdown and the full Notifications page agree.
 */
export function routeForNotification(n: NotificationRow): string {
  switch (n.kind) {
    case 'mention':
    case 'comment_reply':
    case 'post_reaction':
      if (n.payload.post_id) return `/community/feed?post=${n.payload.post_id}`;
      return '/community/feed';
    case 'dm_received':
      if (n.payload.thread_id) return `/community/messages/${n.payload.thread_id}`;
      return '/community/messages';
    case 'tier_change':
      return '/community/settings';
    case 'system':
    default:
      return n.payload.url ?? '/community/notifications';
  }
}

/**
 * Plain-language summary of a single notification. Kept short — the bell
 * dropdown has very little horizontal real estate.
 */
export function describeNotification(n: NotificationRow): string {
  const who = n.actor_display_name ?? 'Someone';
  switch (n.kind) {
    case 'mention':
      return `${who} mentioned you in a post`;
    case 'comment_reply':
      return `${who} replied to your comment`;
    case 'post_reaction':
      return `${who} reacted to your post`;
    case 'dm_received':
      return `${who} sent you a message`;
    case 'tier_change':
      return `Your tier was updated`;
    case 'system':
    default:
      return n.payload.message ?? 'System update';
  }
}
