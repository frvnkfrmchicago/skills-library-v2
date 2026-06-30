import {
  useState, useEffect, useRef, useCallback, useMemo, type KeyboardEvent,
} from 'react';
import { PaperPlaneRight, Trash, Users, Hash } from '@phosphor-icons/react';
import {
  listChannels, getChatChannel,
  getMessages, fetchMessagesRemote, sendMessage, deleteMessage,
  applyRemoteInsert, applyRemoteDelete,
} from '../../data/chatStore';
import type { ChatMessage } from '../../data/chatStore';
import { getMemberById, getLevelName, registerMember } from '../../data/communityData';
import { usePresence } from '../../data/presence';
import { useAuth } from '../../context/useAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isBypassActive } from '../../lib/devBypass';
import './Chat.css';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function Avatar({ member }: { member: { id: string; display_name: string; avatar_url?: string | null } }) {
  const initial = member.display_name?.charAt(0) ?? '?';
  if (member.avatar_url) {
    return <img src={member.avatar_url} alt={member.display_name} className="avatar avatar--sm" />;
  }
  const variant = (member.id.charCodeAt(member.id.length - 1) % 5) + 1;
  return <div className={`avatar avatar--sm avatar--${variant}`}>{initial}</div>;
}

export default function Chat() {
  const { profile } = useAuth();
  const channels = listChannels();
  const [activeId, setActiveId] = useState<string>(channels[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>(() => getMessages(channels[0].id));
  const [draft, setDraft] = useState('');
  const { onlineCount } = usePresence('community-chat');

  const listRef = useRef<HTMLDivElement>(null);
  const activeChannel = useMemo(() => getChatChannel(activeId), [activeId]);

  // Register the current user as a member so the avatar + name lookups resolve.
  useEffect(() => {
    if (profile) registerMember(profile);
  }, [profile]);

  // Show the cached slice immediately when the channel changes, then hydrate.
  useEffect(() => {
    setMessages(getMessages(activeId));
    let cancelled = false;
    void (async () => {
      const hydrated = await fetchMessagesRemote(activeId);
      if (!cancelled) setMessages(hydrated);
    })();
    return () => { cancelled = true; };
  }, [activeId]);

  // Realtime: new + deleted messages for the active channel, for everyone.
  // Skipped in bypass / unconfigured environments — there's no remote channel.
  useEffect(() => {
    if (!isSupabaseConfigured || isBypassActive()) return;

    const channel = supabase
      .channel(`chat:${activeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${activeId}`,
        },
        (payload) => {
          const row = payload.new as Parameters<typeof applyRemoteInsert>[0];
          applyRemoteInsert(row);
          setMessages(getMessages(activeId));
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${activeId}`,
        },
        (payload) => {
          const id = (payload.old as { id?: string })?.id;
          if (id) {
            applyRemoteDelete(id);
            setMessages(getMessages(activeId));
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeId]);

  // Autoscroll to the newest message whenever the list grows.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!draft.trim() || !profile) return;
    const sent = sendMessage(activeId, profile.id, draft);
    if (sent) {
      setMessages(getMessages(activeId));
      setDraft('');
    }
  }, [draft, activeId, profile]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleDelete(id: string) {
    deleteMessage(id);
    setMessages(getMessages(activeId));
  }

  return (
    <div className="chat">
      {/* ── Channel rail: the rooms everyone shares ── */}
      <aside className="chat__rail" aria-label="Chat channels">
        <h2 className="chat__rail-title">Channels</h2>
        <nav className="chat__channels">
          {channels.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chat__channel ${c.id === activeId ? 'chat__channel--active' : ''}`}
              onClick={() => setActiveId(c.id)}
              title={c.description}
            >
              <Hash size={16} weight="bold" />
              <span>{c.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Active channel ── */}
      <section className="chat__room">
        <header className="chat__room-header">
          <div className="chat__room-heading">
            <Hash size={18} weight="bold" />
            <h1 className="chat__room-name">{activeChannel?.label ?? 'Channel'}</h1>
          </div>
          <span className="chat__online" title="People connected right now">
            <Users size={15} weight="bold" />
            {onlineCount} online
          </span>
        </header>
        {activeChannel && <p className="chat__room-desc">{activeChannel.description}</p>}

        <div className="chat__messages" ref={listRef}>
          {messages.length === 0 ? (
            <div className="chat__empty">
              <h3 className="chat__empty-title">No messages yet</h3>
              <p className="chat__empty-text">
                Start the conversation in {activeChannel?.label ?? 'this channel'}. Everyone here will see it.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const author = getMemberById(m.author_id);
              const isOwn = m.author_id === profile?.id;
              return (
                <article key={m.id} className="chat__msg">
                  {author ? (
                    <Avatar member={author} />
                  ) : (
                    <div className="avatar avatar--sm avatar--1">?</div>
                  )}
                  <div className="chat__msg-body">
                    <div className="chat__msg-meta">
                      <span className="chat__msg-author">{author?.display_name ?? 'Member'}</span>
                      {author && (
                        <span className="chat__msg-level">Lvl {author.level} · {getLevelName(author.level)}</span>
                      )}
                      <span className="chat__msg-time">{timeAgo(m.created_at)}</span>
                      {isOwn && (
                        <button
                          type="button"
                          className="chat__msg-delete"
                          onClick={() => handleDelete(m.id)}
                          title="Delete message"
                          aria-label="Delete message"
                        >
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                    <p className="chat__msg-text">{m.body}</p>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* ── Composer ── */}
        <div className="chat__composer">
          <textarea
            className="chat__composer-input"
            placeholder={`Message ${activeChannel?.label ?? ''} (Enter to send, Shift+Enter for a new line)`}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!profile}
          />
          <button
            type="button"
            className="btn btn--primary chat__send"
            onClick={handleSend}
            disabled={!draft.trim() || !profile}
            aria-label="Send message"
          >
            <PaperPlaneRight size={18} weight="bold" />
          </button>
        </div>
      </section>
    </div>
  );
}
