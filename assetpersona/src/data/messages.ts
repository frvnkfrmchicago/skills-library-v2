/* ═══════════════════════════════════════════════
   AP-MODERNIZE-2026-05 · Lane 2 · Direct Messages
   src/data/messages.ts — Supabase-first DM data layer with bypass fallback
   ═══════════════════════════════════════════════
   Surface (every export is the public API):
     listThreads()             — inbox view, ordered by last_message_at DESC
     getThread(threadId)       — full chronological message list
     sendMessage(threadId, body) — optimistic insert
     startThreadWith(memberId) — find-or-create a thread between current user + memberId
     markRead(threadId)        — upsert the current user's last_read_at
     subscribeToThread(...)    — convenience wrapper for the Realtime channel
     getOtherParticipant(...)  — UI helper given a thread + viewer
     unreadCount(thread, viewer) — derives unread state from cached reads

   Modes:
     - Remote (Supabase configured AND no dev bypass): every read/write hits
       the live tables. `subscribeToThread` opens a per-thread Realtime
       channel for INSERT on dm_messages.
     - Local (Supabase unconfigured OR dev bypass active): every read/write
       routes through localStorage so demo-mode + bypass walk-throughs keep
       working. The same export shape is preserved.

   The two participant uuids in dm_threads MUST be canonicalized as
   participant_a < participant_b (database CHECK enforces this). This
   module centralizes that sort so callers don't have to think about it.
   ═══════════════════════════════════════════════ */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive, BYPASS_IDS } from '../lib/devBypass';
import type { Profile } from '../types/supabase';
import { getMemberById, getMembers } from './communityData';

/* ── Types ─────────────────────────────────────── */

export interface DmThread {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
}

export interface DmMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface DmThreadRead {
  thread_id: string;
  participant_id: string;
  last_read_at: string;
}

/** Inbox row — the shape Messages.tsx renders. */
export interface InboxRow {
  thread: DmThread;
  other: Profile | null;
  unread: boolean;
}

/* ── Mode + storage helpers ───────────────────── */

function isRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

const LS_THREADS = 'ap_dm_threads';
const LS_MESSAGES = 'ap_dm_messages';
const LS_READS = 'ap_dm_reads';

function lsLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function lsSave<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* quota / disabled — silent */
  }
}

/** Canonical participant order — participant_a < participant_b. */
function canonicalPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/* ── Current user id (works in both modes) ────── */

async function getCurrentUserId(): Promise<string | null> {
  if (!isRemote()) {
    // In bypass mode, the active role's id is the "user" for read/write.
    // We can't ask devBypass for the active role from here without import
    // tangling, so we read whichever id is already in localStorage.
    try {
      const stored = localStorage.getItem('ap_dev_bypass');
      if (stored === 'admin') return BYPASS_IDS.admin;
      if (stored === 'member') return BYPASS_IDS.member;
      if (stored === 'guest') return BYPASS_IDS.guest;
    } catch {
      /* ignore */
    }
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

/* ── Helpers ──────────────────────────────────── */

export function getOtherParticipant(thread: DmThread, viewerId: string): string {
  return thread.participant_a === viewerId ? thread.participant_b : thread.participant_a;
}

function buildInboxRows(threads: DmThread[], viewerId: string, reads: DmThreadRead[]): InboxRow[] {
  const readByThread = new Map<string, string>();
  for (const r of reads) {
    if (r.participant_id === viewerId) readByThread.set(r.thread_id, r.last_read_at);
  }
  return threads.map((thread) => {
    const otherId = getOtherParticipant(thread, viewerId);
    const other = getMemberById(otherId) ?? null;
    const lastRead = readByThread.get(thread.id);
    const unread = Boolean(
      thread.last_message_at &&
        (!lastRead || new Date(thread.last_message_at).getTime() > new Date(lastRead).getTime()),
    );
    return { thread, other, unread };
  });
}

/* ═══════════════════════════════════════════════
   PUBLIC API — listThreads
   ═══════════════════════════════════════════════ */

export async function listThreads(): Promise<InboxRow[]> {
  const viewerId = await getCurrentUserId();
  if (!viewerId) return [];

  if (!isRemote()) {
    const threads = lsLoad<DmThread[]>(LS_THREADS, []).filter(
      (t) => t.participant_a === viewerId || t.participant_b === viewerId,
    );
    threads.sort((a, b) => {
      const at = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bt = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bt - at;
    });
    const reads = lsLoad<DmThreadRead[]>(LS_READS, []);
    return buildInboxRows(threads, viewerId, reads);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: threadRows, error } = await (supabase as any)
    .from('dm_threads')
    .select('id, participant_a, participant_b, last_message_at, last_message_preview, created_at')
    .or(`participant_a.eq.${viewerId},participant_b.eq.${viewerId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error || !Array.isArray(threadRows)) return [];
  const threads = threadRows as DmThread[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: readRows } = await (supabase as any)
    .from('dm_thread_reads')
    .select('thread_id, participant_id, last_read_at')
    .eq('participant_id', viewerId);

  const reads = Array.isArray(readRows) ? (readRows as DmThreadRead[]) : [];
  return buildInboxRows(threads, viewerId, reads);
}

/* ═══════════════════════════════════════════════
   PUBLIC API — getThread (header + messages)
   ═══════════════════════════════════════════════ */

export async function getThread(threadId: string): Promise<{
  thread: DmThread | null;
  messages: DmMessage[];
  other: Profile | null;
}> {
  const viewerId = await getCurrentUserId();
  if (!viewerId) return { thread: null, messages: [], other: null };

  if (!isRemote()) {
    const thread = lsLoad<DmThread[]>(LS_THREADS, []).find((t) => t.id === threadId) ?? null;
    if (!thread) return { thread: null, messages: [], other: null };
    const messages = lsLoad<DmMessage[]>(LS_MESSAGES, [])
      .filter((m) => m.thread_id === threadId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const otherId = getOtherParticipant(thread, viewerId);
    return { thread, messages, other: getMemberById(otherId) ?? null };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: threadRow } = await (supabase as any)
    .from('dm_threads')
    .select('id, participant_a, participant_b, last_message_at, last_message_preview, created_at')
    .eq('id', threadId)
    .maybeSingle();

  if (!threadRow) return { thread: null, messages: [], other: null };
  const thread = threadRow as DmThread;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: messageRows } = await (supabase as any)
    .from('dm_messages')
    .select('id, thread_id, sender_id, body, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  const messages = Array.isArray(messageRows) ? (messageRows as DmMessage[]) : [];
  const otherId = getOtherParticipant(thread, viewerId);
  // Try the local member cache first; fall back to a profile fetch.
  let other = getMemberById(otherId) ?? null;
  if (!other) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profileRow } = await (supabase as any)
      .from('profiles')
      .select('id, display_name, avatar_url, level, points, role, status, joined_at, updated_at')
      .eq('id', otherId)
      .maybeSingle();
    if (profileRow) other = profileRow as Profile;
  }

  return { thread, messages, other };
}

/* ═══════════════════════════════════════════════
   PUBLIC API — sendMessage (optimistic)
   ═══════════════════════════════════════════════ */

export async function sendMessage(threadId: string, body: string): Promise<DmMessage | null> {
  const viewerId = await getCurrentUserId();
  if (!viewerId) return null;
  const trimmed = body.trim();
  if (!trimmed) return null;
  const capped = trimmed.slice(0, 2000);

  const optimistic: DmMessage = {
    id: crypto.randomUUID(),
    thread_id: threadId,
    sender_id: viewerId,
    body: capped,
    created_at: new Date().toISOString(),
  };

  if (!isRemote()) {
    const messages = lsLoad<DmMessage[]>(LS_MESSAGES, []);
    messages.push(optimistic);
    lsSave(LS_MESSAGES, messages);
    // Mirror the trigger: bump thread metadata.
    const threads = lsLoad<DmThread[]>(LS_THREADS, []);
    const idx = threads.findIndex((t) => t.id === threadId);
    if (idx >= 0) {
      threads[idx] = {
        ...threads[idx],
        last_message_at: optimistic.created_at,
        last_message_preview: capped.slice(0, 140),
      };
      lsSave(LS_THREADS, threads);
    }
    return optimistic;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('dm_messages')
    .insert({
      thread_id: threadId,
      sender_id: viewerId,
      body: capped,
    })
    .select('id, thread_id, sender_id, body, created_at')
    .single();

  if (error || !data) return null;
  return data as DmMessage;
}

/* ═══════════════════════════════════════════════
   PUBLIC API — startThreadWith (find-or-create)
   ═══════════════════════════════════════════════ */

export async function startThreadWith(otherMemberId: string): Promise<string | null> {
  const viewerId = await getCurrentUserId();
  if (!viewerId || viewerId === otherMemberId) return null;
  const [a, b] = canonicalPair(viewerId, otherMemberId);

  if (!isRemote()) {
    const threads = lsLoad<DmThread[]>(LS_THREADS, []);
    const existing = threads.find((t) => t.participant_a === a && t.participant_b === b);
    if (existing) return existing.id;
    const created: DmThread = {
      id: crypto.randomUUID(),
      participant_a: a,
      participant_b: b,
      last_message_at: null,
      last_message_preview: null,
      created_at: new Date().toISOString(),
    };
    threads.push(created);
    lsSave(LS_THREADS, threads);
    return created.id;
  }

  // Try to read first — RLS allows reading rows where you're a participant.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingRow } = await (supabase as any)
    .from('dm_threads')
    .select('id')
    .eq('participant_a', a)
    .eq('participant_b', b)
    .maybeSingle();

  if (existingRow?.id) return existingRow.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: insertedRow, error: insertError } = await (supabase as any)
    .from('dm_threads')
    .insert({ participant_a: a, participant_b: b })
    .select('id')
    .single();

  if (insertError) {
    // Most likely a concurrent insert won the race — retry the read.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: retryRow } = await (supabase as any)
      .from('dm_threads')
      .select('id')
      .eq('participant_a', a)
      .eq('participant_b', b)
      .maybeSingle();
    return retryRow?.id ?? null;
  }

  return insertedRow?.id ?? null;
}

/* ═══════════════════════════════════════════════
   PUBLIC API — markRead (upsert last_read_at)
   ═══════════════════════════════════════════════ */

export async function markRead(threadId: string): Promise<void> {
  const viewerId = await getCurrentUserId();
  if (!viewerId) return;
  const now = new Date().toISOString();

  if (!isRemote()) {
    const reads = lsLoad<DmThreadRead[]>(LS_READS, []);
    const idx = reads.findIndex((r) => r.thread_id === threadId && r.participant_id === viewerId);
    if (idx >= 0) {
      reads[idx] = { ...reads[idx], last_read_at: now };
    } else {
      reads.push({ thread_id: threadId, participant_id: viewerId, last_read_at: now });
    }
    lsSave(LS_READS, reads);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('dm_thread_reads')
    .upsert(
      { thread_id: threadId, participant_id: viewerId, last_read_at: now },
      { onConflict: 'thread_id,participant_id' },
    );
}

/* ═══════════════════════════════════════════════
   PUBLIC API — subscribeToThread (Realtime helper)
   ═══════════════════════════════════════════════
   Mirrors the Feed.tsx pattern: open a channel, filter postgres_changes by
   thread_id, return a cleanup function. Skipped (returns a no-op) when
   Supabase is unconfigured or bypass is active. */

type RealtimeMessageHandler = (row: DmMessage) => void;

export function subscribeToThread(
  threadId: string,
  onInsert: RealtimeMessageHandler,
): () => void {
  if (!isRemote()) return () => {};

  const channel = supabase
    .channel(`dm-thread-${threadId}`)
    .on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      {
        event: 'INSERT',
        schema: 'public',
        table: 'dm_messages',
        filter: `thread_id=eq.${threadId}`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => {
        const row = payload?.new as DmMessage | undefined;
        if (row) onInsert(row);
      },
    )
    .subscribe();

  return () => {
    try {
      void supabase.removeChannel(channel);
    } catch {
      /* ignore */
    }
  };
}

/* ── Convenience helpers for components ────────── */

/** Bypass/demo seed helper — register a few stub members so the inbox has
 *  someone to talk to when the local member cache is empty. Components
 *  may call this once on mount in bypass mode. */
export function ensureBypassPeers(currentId: string): Profile[] {
  if (isRemote()) return getMembers();
  // We don't fabricate anyone — we only return whoever is already
  // registered as a community member. The "Message" button on a profile
  // page (future lane) is what creates real threads.
  return getMembers().filter((m) => m.id !== currentId);
}

/* ── DM tier gate ──────────────────────────────────
   Mirrors the can_open_dm(a, b) Postgres function defined in
   supabase/migrations/20260519101400_dm_tier_gate.sql. Same rules:
     1. Both participants must be Cohort+ (paid).
     2. If one participant is an admin, the other must be Private Lessons.
   This client-side helper exists so the UI can disable the "Message"
   button + show an accurate upsell without round-tripping to the DB.
   The server-side policy is still the source of truth — UI-only gates
   can be bypassed by malicious clients. */

type TierGateProfile = {
  id: string;
  role?: string | null;
  tier?: string | null;
};

const PAID_TIERS = new Set([
  'cohort',
  'cohortYearly',
  'insiders',
  'insidersYearly',
  'privateLessons',
]);

export type DmGateReason =
  | 'self'
  | 'missing-profile'
  | 'viewer-not-paid'
  | 'target-not-paid'
  | 'admin-target-needs-private'   // viewer is non-private trying to DM admin
  | 'admin-viewer-needs-target-private'; // viewer IS admin trying to DM non-private

export interface DmGateResult {
  allowed: boolean;
  reason?: DmGateReason;
  /** What tier the viewer needs to unlock this DM. Used for upsell copy. */
  upsellTier?: 'cohort' | 'privateLessons';
}

export function canDmMember(
  viewer: TierGateProfile | null | undefined,
  target: TierGateProfile | null | undefined,
): DmGateResult {
  if (!viewer || !target) return { allowed: false, reason: 'missing-profile' };
  if (viewer.id === target.id) return { allowed: false, reason: 'self' };

  const viewerTier = (viewer.tier ?? 'assetClass') as string;
  const targetTier = (target.tier ?? 'assetClass') as string;
  const viewerAdmin = viewer.role === 'admin';
  const targetAdmin = target.role === 'admin';

  if (!PAID_TIERS.has(viewerTier)) {
    return { allowed: false, reason: 'viewer-not-paid', upsellTier: 'cohort' };
  }
  if (!PAID_TIERS.has(targetTier)) {
    return { allowed: false, reason: 'target-not-paid' };
  }
  if (targetAdmin && viewerTier !== 'privateLessons') {
    return { allowed: false, reason: 'admin-target-needs-private', upsellTier: 'privateLessons' };
  }
  if (viewerAdmin && targetTier !== 'privateLessons') {
    return { allowed: false, reason: 'admin-viewer-needs-target-private' };
  }
  return { allowed: true };
}
