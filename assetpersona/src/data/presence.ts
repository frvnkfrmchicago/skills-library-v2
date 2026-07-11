/* ═══ PRESENCE — real "who's online" via Supabase Realtime ═══
 *
 * AP-MODERNIZE-2026-05 · Lane 4
 *
 * Replaces the fake `Math.max(1, Math.floor(members.length * 0.4))` math in
 * CommunityLayout.tsx with a Supabase Realtime presence channel that counts
 * actual currently-connected members.
 *
 * Use:
 *   const { onlineCount, onlineIds, onlineMap } = usePresence();
 *
 * Bypass-mode + unconfigured Supabase short-circuit to a single-user payload
 * so the dev demo keeps showing a non-zero "Online" count.
 *
 * Cleanup: the hook untracks on unmount and removes the channel. Without
 * cleanup, hot reloads pile up phantom presences and the count drifts.
 */

import { useEffect, useState, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isBypassActive } from '../lib/devBypass';
import { useAuth } from '../context/useAuth';

export interface PresencePayload {
  user_id: string;
  joined_at: string;
}

export interface PresenceState {
  onlineCount: number;
  onlineIds: string[];
  onlineMap: Record<string, PresencePayload>;
}

const EMPTY: PresenceState = {
  onlineCount: 0,
  onlineIds: [],
  onlineMap: {},
};

function shouldUseRemote(): boolean {
  return isSupabaseConfigured && !isBypassActive();
}

/**
 * Subscribe to a Supabase Realtime presence channel for `channelName` and
 * return the live `{ onlineCount, onlineIds, onlineMap }`.
 *
 * @param channelName — channel slug (default 'community'). Two callers using
 *   the same name share a presence pool. Pass a per-room name (e.g.
 *   `module:${id}`) to scope to that room only.
 */
export function usePresence(channelName: string = 'community'): PresenceState {
  const { user } = useAuth();
  const [state, setState] = useState<PresenceState>(EMPTY);
  // Hold the channel in a ref so the cleanup callback always sees the latest
  // instance (avoids React-strict-mode double-mount cleanup pointing at a
  // stale channel and leaving a real one alive).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Bypass / unconfigured: render one fake "you" so the sidebar doesn't
    // read "0 Online" in demo mode.
    if (!shouldUseRemote()) {
      const id = user?.id || 'dev';
      setState({
        onlineCount: 1,
        onlineIds: [id],
        onlineMap: {},
      });
      return;
    }

    // No authed user → empty presence. Don't track an anonymous identity.
    if (!user?.id) {
      setState(EMPTY);
      return;
    }

    const userId = user.id;
    const joinedAt = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase as any).channel(channelName, {
      config: {
        presence: { key: userId },
      },
    });
    channelRef.current = channel;

    function readState() {
      // presenceState() returns Record<key, Array<presencePayload>> — one
      // member can have multiple browser tabs open. We collapse to a single
      // entry per user_id for the counter.
      const raw = channel.presenceState?.() as
        | Record<string, PresencePayload[]>
        | undefined;
      if (!raw) return;
      const map: Record<string, PresencePayload> = {};
      for (const [key, entries] of Object.entries(raw)) {
        if (Array.isArray(entries) && entries.length > 0) {
          map[key] = entries[0];
        }
      }
      const ids = Object.keys(map);
      setState({
        onlineCount: ids.length,
        onlineIds: ids,
        onlineMap: map,
      });
    }

    channel
      .on('presence', { event: 'sync' }, readState)
      .on('presence', { event: 'join' }, readState)
      .on('presence', { event: 'leave' }, readState)
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, joined_at: joinedAt });
        }
      });

    return () => {
      // Untrack before remove so the leave fires for the rest of the pool.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = channelRef.current as any;
      if (c) {
        try {
          // best-effort — Supabase may be torn down already
          c.untrack?.();
        } catch {
          /* ignore */
        }
        try {
          (supabase as { removeChannel: (c: unknown) => void }).removeChannel(c);
        } catch {
          /* ignore */
        }
      }
      channelRef.current = null;
    };
  }, [channelName, user?.id]);

  return state;
}
