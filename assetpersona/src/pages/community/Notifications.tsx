import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AtSign, MessageSquare, Heart, CreditCard, Megaphone, CheckCheck } from 'lucide-react';
import {
  listNotifications,
  markRead,
  markAllRead,
  subscribeToNotifications,
  type NotificationRow as Notification,
  type NotificationKind,
} from '../../data/notifications';
import { useAuth } from '../../context/useAuth';
import SubTabs from '../../components/community/SubTabs';
import './Notifications.css';

const INBOX_TABS = [
  { to: '/community/messages', label: 'Messages' },
  { to: '/community/notifications', label: 'Notifications' },
];


const FILTERS: { id: NotificationKind | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mention', label: 'Mentions' },
  { id: 'comment_reply', label: 'Replies' },
  { id: 'post_reaction', label: 'Reactions' },
  { id: 'dm_received', label: 'Messages' },
  { id: 'tier_change', label: 'Billing' },
];

const ICONS: Record<NotificationKind, React.ComponentType<{ size?: number }>> = {
  mention: AtSign,
  comment_reply: MessageSquare,
  post_reaction: Heart,
  dm_received: MessageSquare,
  tier_change: CreditCard,
  system: Megaphone,
};

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationKind | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === 'all' ? notifications : notifications.filter((n) => n.kind === filter)),
    [notifications, filter],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listNotifications({ limit: PAGE_SIZE })
      .then((rows) => {
        if (cancelled) return;
        setNotifications(rows);
        setHasMore(rows.length >= PAGE_SIZE);
        setCursor(rows.length ? rows[rows.length - 1].created_at : null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const unsubscribe = subscribeToNotifications(user?.id, (incoming: Notification) => {
      setNotifications((prev) => [incoming, ...prev]);
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user?.id]);

  const loadMore = async () => {
    if (!cursor) return;
    setLoading(true);
    const next = await listNotifications({ limit: PAGE_SIZE, before: cursor });
    setNotifications((prev) => [...prev, ...next]);
    setHasMore(next.length >= PAGE_SIZE);
    if (next.length) setCursor(next[next.length - 1].created_at);
    setLoading(false);
  };

  const handleClick = async (n: Notification) => {
    if (!n.read_at) {
      void markRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
    }
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="notifications-page">
      <SubTabs tabs={INBOX_TABS} />
      <header className="notifications-page__header">
        <div>
          <h1>
            <Bell size={22} aria-hidden="true" /> Notifications
          </h1>
          <p className="notifications-page__subtitle">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={handleMarkAll}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </header>

      <nav className="notifications-page__filters" aria-label="Notification filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`notifications-page__chip ${filter === f.id ? 'is-active' : ''}`}
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
          >
            {f.label}
          </button>
        ))}
      </nav>

      {loading && notifications.length === 0 && (
        <div className="notifications-page__empty">
          <p>Loading…</p>
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div className="notifications-page__empty">
          <Bell size={32} aria-hidden="true" />
          <p>Nothing here yet.</p>
          <p className="notifications-page__hint">
            {filter === 'all'
              ? 'Mentions, replies, reactions, and messages will land here.'
              : 'Try a different filter.'}
          </p>
        </div>
      )}

      <ul className="notifications-page__list">
        {visible.map((n) => {
          const Icon = ICONS[n.kind] ?? Megaphone;
          const href = resolveHref(n);
          const isUnread = !n.read_at;
          return (
            <li key={n.id} className={`notifications-page__item ${isUnread ? 'is-unread' : ''}`}>
              {href ? (
                <Link to={href} onClick={() => handleClick(n)} className="notifications-page__row">
                  <span className="notifications-page__icon">
                    <Icon size={16} />
                  </span>
                  <span className="notifications-page__body">
                    <span className="notifications-page__text">{describe(n)}</span>
                    <span className="notifications-page__time">{timeAgo(n.created_at)}</span>
                  </span>
                  {isUnread && <span className="notifications-page__dot" aria-label="unread" />}
                </Link>
              ) : (
                <button
                  type="button"
                  className="notifications-page__row notifications-page__row--button"
                  onClick={() => handleClick(n)}
                >
                  <span className="notifications-page__icon">
                    <Icon size={16} />
                  </span>
                  <span className="notifications-page__body">
                    <span className="notifications-page__text">{describe(n)}</span>
                    <span className="notifications-page__time">{timeAgo(n.created_at)}</span>
                  </span>
                  {isUnread && <span className="notifications-page__dot" aria-label="unread" />}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="notifications-page__more">
          <button type="button" className="btn btn--ghost" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

function describe(n: Notification): string {
  const actor = (n.payload as { actor_name?: string })?.actor_name ?? 'Someone';
  switch (n.kind) {
    case 'mention':
      return `${actor} mentioned you`;
    case 'comment_reply':
      return `${actor} replied to your comment`;
    case 'post_reaction':
      return `${actor} reacted to your post`;
    case 'dm_received':
      return `${actor} sent you a message`;
    case 'tier_change':
      return (n.payload as { message?: string })?.message ?? 'Your plan changed';
    case 'system':
      return (n.payload as { message?: string })?.message ?? 'System update';
    default:
      return 'New activity';
  }
}

function resolveHref(n: Notification): string | null {
  const p = n.payload as { post_id?: string; comment_id?: string; thread_id?: string };
  if (n.kind === 'dm_received' && p.thread_id) return `/community/messages/${p.thread_id}`;
  if (p.post_id) return `/community#post-${p.post_id}`;
  if (n.kind === 'tier_change') return '/community/user-settings?tab=subscription';
  return null;
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}
