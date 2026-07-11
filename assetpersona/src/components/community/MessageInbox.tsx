import { Link } from 'react-router-dom';
import { ChatCircleDots } from '@phosphor-icons/react';
import type { InboxRow } from '../../data/messages';

/* ═══════════════════════════════════════════════
   AP-MODERNIZE-2026-05 · Lane 2 · MessageInbox
   ═══════════════════════════════════════════════
   Reusable list-of-threads view. Renders one row per InboxRow:
     - other participant's avatar + display name
     - last message preview (140 chars, set by the dm_threads trigger)
     - relative time of last message
     - unread dot when last_message_at > viewer's last_read_at

   Stays presentational — no data fetching, no Realtime. The hosting page
   (Messages.tsx for now, the Navbar dropdown later) decides what data to
   pass and what happens when an inbox row is clicked. By default each row
   is a <Link> to /community/messages/<threadId>.
   ═══════════════════════════════════════════════ */

interface Props {
  rows: InboxRow[];
  /** Render the rows as plain buttons + call onSelect instead of <Link>. */
  onSelect?: (threadId: string) => void;
  /** Currently focused thread (for dropdown / split-view variants). */
  activeThreadId?: string | null;
  /** Shown when rows is empty. Defaults to a friendly "no threads" block. */
  emptyState?: React.ReactNode;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
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

function RowBody({ row }: { row: InboxRow }) {
  const name = row.other?.display_name ?? 'Community Member';
  const preview = row.thread.last_message_preview ?? 'No messages yet';
  const stamp = timeAgo(row.thread.last_message_at);
  return (
    <>
      {row.other?.avatar_url ? (
        <img className="avatar avatar--md" src={row.other.avatar_url} alt={name} />
      ) : (
        <div className={`avatar avatar--md ${avatarTone(row.other?.id)}`} aria-hidden="true">
          {initials(name)}
        </div>
      )}
      <div className="dm-inbox__row-body">
        <div className="dm-inbox__row-top">
          <span className="dm-inbox__row-name">{name}</span>
          {stamp && <span className="dm-inbox__row-time">{stamp}</span>}
        </div>
        <p className={`dm-inbox__row-preview ${row.unread ? 'dm-inbox__row-preview--unread' : ''}`}>
          {preview}
        </p>
      </div>
      {row.unread && <span className="dm-inbox__row-dot" aria-label="Unread" />}
    </>
  );
}

export default function MessageInbox({ rows, onSelect, activeThreadId, emptyState }: Props) {
  if (!rows.length) {
    return (
      emptyState ?? (
        <div className="dm-inbox__empty">
          <ChatCircleDots size={32} weight="duotone" />
          <h3>No conversations yet</h3>
          <p>Start a thread from a member's profile to begin a private chat.</p>
        </div>
      )
    );
  }

  return (
    <ul className="dm-inbox" role="list">
      {rows.map((row) => {
        const isActive = activeThreadId === row.thread.id;
        const className = `dm-inbox__row ${isActive ? 'dm-inbox__row--active' : ''} ${row.unread ? 'dm-inbox__row--unread' : ''}`;
        return (
          <li key={row.thread.id} className="dm-inbox__item">
            {onSelect ? (
              <button
                type="button"
                className={className}
                onClick={() => onSelect(row.thread.id)}
              >
                <RowBody row={row} />
              </button>
            ) : (
              <Link className={className} to={`/community/messages/${row.thread.id}`}>
                <RowBody row={row} />
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
