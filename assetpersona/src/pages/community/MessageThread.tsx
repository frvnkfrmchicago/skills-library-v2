import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import MessageComposer from '../../components/community/MessageComposer';
import {
  getThread,
  sendMessage,
  markRead,
  subscribeToThread,
  type DmMessage,
  type DmThread,
} from '../../data/messages';
import { useAuth } from '../../context/useAuth';
import type { Profile } from '../../types/supabase';
import './MessageThread.css';

/* ═══════════════════════════════════════════════
   AP-MODERNIZE-2026-05 · Lane 2 · MessageThread (Thread page)
   ═══════════════════════════════════════════════
   Route: /community/messages/:threadId (Lane 6 mounts it in App.tsx).
   Behavior:
     - Loads thread metadata + chronological messages on mount.
     - Opens a Supabase Realtime channel filtered to this thread_id (the
       `subscribeToThread` helper handles the Feed.tsx-style cleanup).
     - Calls markRead on mount and whenever a new message arrives.
     - Optimistic send: the message renders immediately, and the Realtime
       INSERT (or the await-resolve, in case the channel is slow) is
       deduplicated by id.
     - Auto-scrolls the message list to the bottom on initial load and
       whenever a new message lands.
   ═══════════════════════════════════════════════ */

function timeStamp(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function initials(name: string | undefined | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function avatarTone(id: string | undefined | null): string {
  if (!id) return 'avatar--1';
  const n = (id.charCodeAt(id.length - 1) % 5) + 1;
  return `avatar--${n}`;
}

export default function MessageThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [thread, setThread] = useState<DmThread | null>(null);
  const [other, setOther] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  /** Dedup helper — never let a message appear twice (optimistic + Realtime echo). */
  const appendMessage = useCallback((row: DmMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === row.id)) return prev;
      const next = [...prev, row];
      next.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return next;
    });
  }, []);

  // ── Initial load ──
  useEffect(() => {
    if (!threadId) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setMissing(false);
      const { thread: t, messages: m, other: o } = await getThread(threadId);
      if (cancelled) return;
      if (!t) {
        setMissing(true);
        setLoading(false);
        return;
      }
      setThread(t);
      setOther(o);
      setMessages(m);
      setLoading(false);
      void markRead(threadId);
    })();
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  // ── Realtime ──
  useEffect(() => {
    if (!threadId) return;
    const unsubscribe = subscribeToThread(threadId, (row) => {
      appendMessage(row);
      void markRead(threadId);
    });
    return unsubscribe;
  }, [threadId, appendMessage]);

  // ── Auto-scroll to bottom on new message ──
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = useCallback(
    async (body: string) => {
      if (!threadId) return;
      const optimistic = await sendMessage(threadId, body);
      if (optimistic) appendMessage(optimistic);
    },
    [threadId, appendMessage],
  );

  if (missing) {
    return (
      <div className="dm-thread">
        <div className="community-card dm-thread__missing">
          <h2>Conversation unavailable</h2>
          <p>This thread no longer exists, or you don't have access to it.</p>
          <button className="btn btn--primary btn--sm" onClick={() => navigate('/community/messages')}>
            Back to inbox
          </button>
        </div>
      </div>
    );
  }

  const viewerId = profile?.id;
  const otherName = other?.display_name ?? 'Community Member';

  return (
    <div className="dm-thread">
      <header className="dm-thread__header">
        <Link to="/community/messages" className="dm-thread__back" aria-label="Back to inbox">
          <ArrowLeft size={20} weight="bold" />
        </Link>
        {other?.avatar_url ? (
          <img className="avatar avatar--md" src={other.avatar_url} alt={otherName} />
        ) : (
          <div className={`avatar avatar--md ${avatarTone(other?.id)}`} aria-hidden="true">
            {initials(otherName)}
          </div>
        )}
        <div className="dm-thread__header-meta">
          <span className="dm-thread__header-name">{otherName}</span>
          {other?.id && (
            <Link to={`/community/profile/${other.id}`} className="dm-thread__header-link">
              View profile
            </Link>
          )}
        </div>
      </header>

      <div ref={listRef} className="dm-thread__list" role="log" aria-live="polite">
        {loading ? (
          <p className="dm-thread__loading">Loading messages…</p>
        ) : messages.length === 0 ? (
          <div className="dm-thread__empty">
            <h3>Say hello</h3>
            <p>Send the first message to start this conversation.</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = m.sender_id === viewerId;
            const prev = messages[i - 1];
            const groupedWithPrev =
              prev &&
              prev.sender_id === m.sender_id &&
              new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60 * 1000;
            return (
              <div
                key={m.id}
                className={`dm-msg ${isMine ? 'dm-msg--mine' : 'dm-msg--theirs'} ${groupedWithPrev ? 'dm-msg--grouped' : ''}`}
              >
                <div className="dm-msg__bubble">
                  <p className="dm-msg__body">{m.body}</p>
                  <span className="dm-msg__time">{timeStamp(m.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="dm-thread__composer">
        <MessageComposer onSend={handleSend} disabled={!thread || !viewerId} autoFocus />
      </div>
    </div>
  );
}
