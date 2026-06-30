/* ═══ CHAT STORE — real-time group chat in shared channels ═══
 *
 * AP-STUDYHALL-CHAT-2026-06 · Lane 1
 *
 * This is GROUP chat: everyone in a channel sees the same messages, the way a
 * Discord channel or a Slack channel works. It is NOT direct messaging —
 * member-to-member 1:1 messaging was deliberately removed (see
 * communityData.ts, "DIRECT MESSAGES" section). There are no private threads
 * here; every message lands in one of a small, fixed set of public channels.
 *
 * It mirrors the hybrid pattern in communityData.ts exactly:
 *   - Supabase `chat_messages` table when remote (configured AND not in dev
 *     bypass). Realtime postgres_changes delivers new messages to everyone.
 *   - localStorage 'ap_chat_messages' fallback otherwise, so the demo works
 *     with no backend.
 *   - A synchronous in-memory cache so Chat.tsx can initialize its state in
 *     one render, then hydrate + subscribe in an effect.
 *   - Optimistic insert with rollback on a Supabase error.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';

/* ═══ CHANNELS — a small, fixed taxonomy (the rooms everyone shares) ═══ */
export interface ChatChannel {
  id: string;
  label: string;
  /** One plain line a beginner reads to know what belongs here. */
  description: string;
}

export const CHAT_CHANNELS = [
  { id: 'lobby', label: 'Lobby', description: 'The main room. Say hi, ask anything, hang out.' },
  { id: 'wins', label: 'Wins', description: 'Shipped something or had a breakthrough? Post it here.' },
  { id: 'help', label: 'Help', description: 'Stuck? Ask a question and someone will jump in.' },
  { id: 'showcase', label: 'Showcase', description: 'Share a build you want people to look at.' },
] as const;

export type ChatChannelId = typeof CHAT_CHANNELS[number]['id'];

/** Every message belongs to exactly one channel. */
export interface ChatMessage {
  id: string;
  channel_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

/* ═══ STORAGE + REMOTE GATE ═══ */
const STORAGE_KEY = 'ap_chat_messages';
const TABLE = 'chat_messages';

function isRemote(): boolean {
  // Same gate communityData.ts uses: live only when Supabase is configured
  // AND we are not in the dev bypass demo.
  return isSupabaseConfigured && !isBypassActive();
}

function loadLocal(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function saveLocal(data: ChatMessage[]): void {
  try {
    // Keep the local log bounded so it can't grow without limit.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.slice(-1000)));
  } catch {
    /* quota / disabled storage — ignore */
  }
}

/* ═══ CACHE — synchronous reads pull from here ═══
 *
 * One flat list of every message across channels. getMessages(channelId)
 * filters + sorts. The cache is hydrated by fetchMessagesRemote and updated by
 * the realtime helpers below.
 */
let cache: ChatMessage[] | null = null;

function ensureCache(): ChatMessage[] {
  if (cache) return cache;
  cache = loadLocal();
  return cache;
}

interface RemoteChatRow {
  id: string;
  channel_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

function mapRow(row: RemoteChatRow): ChatMessage {
  return {
    id: row.id,
    channel_id: row.channel_id,
    author_id: row.author_id,
    body: row.body,
    created_at: row.created_at,
  };
}

function sortByTime(list: ChatMessage[]): ChatMessage[] {
  // Oldest first — a chat reads top-to-bottom, newest at the bottom.
  return [...list].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

/* ═══ CHANNELS API ═══ */
export function listChannels(): readonly ChatChannel[] {
  return CHAT_CHANNELS;
}

export function getChatChannel(id: string): ChatChannel | undefined {
  return CHAT_CHANNELS.find((c) => c.id === id);
}

/* ═══ MESSAGES — sync read + async loader ═══ */

/** Synchronous read from the cache, scoped to one channel, oldest first. */
export function getMessages(channelId: string): ChatMessage[] {
  return sortByTime(ensureCache().filter((m) => m.channel_id === channelId));
}

/**
 * Hydrate the cache for one channel from Supabase. Safe to call repeatedly.
 * Returns that channel's messages (oldest first) for the caller to render.
 */
export async function fetchMessagesRemote(channelId: string): Promise<ChatMessage[]> {
  if (!isRemote()) {
    cache = loadLocal();
    return getMessages(channelId);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .select('id, channel_id, author_id, body, created_at')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error || !data) {
    cache = cache ?? [];
    return getMessages(channelId);
  }
  const rows = (data as RemoteChatRow[]).map(mapRow);
  // Replace this channel's slice in the cache, keep other channels intact.
  const others = ensureCache().filter((m) => m.channel_id !== channelId);
  cache = [...others, ...rows];
  return getMessages(channelId);
}

/**
 * Send a message to a channel. Optimistic: the message lands in the cache (and
 * localStorage when offline) right away. In remote mode, a failed insert rolls
 * the optimistic copy back so the sender sees it did not go through.
 */
export function sendMessage(
  channelId: string,
  authorId: string,
  body: string,
): ChatMessage | null {
  const trimmed = body.trim();
  if (!trimmed || !authorId) return null;

  const message: ChatMessage = {
    id: crypto.randomUUID(),
    channel_id: channelId,
    author_id: authorId,
    body: trimmed,
    created_at: new Date().toISOString(),
  };

  // Optimistic insert first.
  const current = ensureCache();
  if (!current.some((m) => m.id === message.id)) {
    cache = [...current, message];
  }

  if (isRemote()) {
    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from(TABLE).insert({
        id: message.id,
        channel_id: message.channel_id,
        author_id: message.author_id,
        body: message.body,
      });
      if (error) {
        // Roll back the optimistic copy so the sender knows it failed.
        cache = (cache ?? []).filter((m) => m.id !== message.id);
      }
    })();
  } else {
    saveLocal(cache ?? []);
  }
  return message;
}

/** Delete a message you authored. */
export function deleteMessage(messageId: string): void {
  cache = ensureCache().filter((m) => m.id !== messageId);
  if (isRemote()) {
    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from(TABLE).delete().eq('id', messageId);
    })();
  } else {
    saveLocal(cache);
  }
}

/* ═══ REALTIME INTEGRATION HELPERS ═══
 *
 * Chat.tsx is the only caller. Each helper mutates the cache so the next
 * synchronous getMessages() reflects the realtime delta. They are idempotent:
 * the sender already has its own optimistic copy, so the echoed INSERT is a
 * no-op for that client and a real insert for everyone else.
 */
export function applyRemoteInsert(row: RemoteChatRow): ChatMessage {
  const message = mapRow(row);
  const current = ensureCache();
  if (!current.some((m) => m.id === message.id)) {
    cache = [...current, message];
  }
  return message;
}

export function applyRemoteDelete(messageId: string): void {
  cache = ensureCache().filter((m) => m.id !== messageId);
}
