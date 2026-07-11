/* ═══ NotificationBell — navbar badge + dropdown panel ═══
 *
 * Renders a single Bell button. When the recipient has unread notifications
 * the badge shows the count (or `9+` past nine). Click toggles a dropdown
 * panel that lists the 10 most recent rows. Each row click marks-as-read and
 * routes to the source. Footer has "Mark all read" + "See all" → `/community/notifications`.
 *
 * Realtime: subscribes to `subscribeToNotifications(recipientId, …)` so a new
 * row pushed from `parse_mentions_and_notify()` lights the badge without a
 * refresh. The bell pulses once via Framer Motion when the count climbs (and
 * skips the pulse for users with `prefers-reduced-motion`).
 *
 * Lane-6 contract: this component is fully self-contained — it accepts an
 * optional `align="left"|"right"` prop and otherwise positions itself with
 * its own internal CSS. Lane 6 just imports it into Navbar and drops it next
 * to the avatar.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle } from '@phosphor-icons/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import {
  listNotifications,
  countUnread,
  markRead,
  markAllRead,
  subscribeToNotifications,
  routeForNotification,
  describeNotification,
  type NotificationRow,
} from '../../data/notifications';
import './NotificationBell.css';

interface NotificationBellProps {
  /** Where the dropdown anchors. Default 'right'. */
  align?: 'left' | 'right';
  /** Override the recipient id (defaults to auth profile id). */
  recipientId?: string;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationBell({
  align = 'right',
  recipientId,
}: NotificationBellProps) {
  const { profile } = useAuth();
  const me = recipientId ?? profile?.id ?? null;
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevUnreadRef = useRef(0);
  const [pulseKey, setPulseKey] = useState(0);

  /* ── Initial load + every-time-bell-opens refresh ── */
  const refresh = useCallback(async () => {
    if (!me) return;
    setLoading(true);
    try {
      const [rowsNext, unreadNext] = await Promise.all([
        listNotifications({ limit: 10 }),
        countUnread(),
      ]);
      setRows(rowsNext);
      setUnread(unreadNext);
    } catch {
      // Soft-fail — silence is better than a toast in the navbar.
    } finally {
      setLoading(false);
    }
  }, [me]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /* ── Realtime — INSERT bumps the count; UPDATE keeps the list in sync. ── */
  useEffect(() => {
    if (!me) return;
    const unsubscribe = subscribeToNotifications(me, (row, event) => {
      if (event === 'INSERT') {
        setRows((prev) => [row, ...prev].slice(0, 10));
        if (row.read_at === null) setUnread((c) => c + 1);
      } else if (event === 'UPDATE') {
        setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        // The count may have changed if a row flipped read_at — re-sync.
        void countUnread().then(setUnread).catch(() => {});
      }
    });
    return unsubscribe;
  }, [me]);

  /* ── Pulse the bell when unread climbs ── */
  useEffect(() => {
    if (unread > prevUnreadRef.current && prevUnreadRef.current >= 0) {
      setPulseKey((k) => k + 1);
    }
    prevUnreadRef.current = unread;
  }, [unread]);

  /* ── Click-outside to close ── */
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen((v) => {
      const next = !v;
      if (next) void refresh();
      return next;
    });
  }, [refresh]);

  const handleRowClick = useCallback(
    async (n: NotificationRow) => {
      const target = routeForNotification(n);
      if (n.read_at === null) {
        // Optimistic — flip locally, persist, recount.
        setRows((prev) => prev.map((r) => (r.id === n.id ? { ...r, read_at: new Date().toISOString() } : r)));
        setUnread((c) => Math.max(0, c - 1));
        try {
          await markRead(n.id);
        } catch {
          // Roll back local flip if the write failed.
          setRows((prev) => prev.map((r) => (r.id === n.id ? n : r)));
          setUnread((c) => c + 1);
        }
      }
      setOpen(false);
      navigate(target);
    },
    [navigate]
  );

  const handleMarkAll = useCallback(async () => {
    if (unread === 0) return;
    const ts = new Date().toISOString();
    const before = rows;
    setRows((prev) => prev.map((r) => (r.read_at ? r : { ...r, read_at: ts })));
    setUnread(0);
    try {
      await markAllRead();
    } catch {
      // Rollback on failure.
      setRows(before);
      void countUnread().then(setUnread).catch(() => {});
    }
  }, [unread, rows]);

  const handleSeeAll = useCallback(() => {
    setOpen(false);
    navigate('/community/notifications');
  }, [navigate]);

  const badgeLabel = useMemo(() => {
    if (unread === 0) return '';
    return unread > 9 ? '9+' : String(unread);
  }, [unread]);

  return (
    <div ref={containerRef} className={`notification-bell notification-bell--${align}`}>
      <motion.button
        type="button"
        className="notification-bell__button"
        onClick={handleToggle}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.12, 1], rotate: [0, -8, 8, 0] }
        }
        transition={{ duration: 0.42, ease: 'easeOut' }}
        key={pulseKey}
      >
        <Bell size={20} weight={unread > 0 ? 'fill' : 'regular'} />
        {unread > 0 && (
          <span className="notification-bell__badge" aria-hidden="true">
            {badgeLabel}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="notification-bell__panel"
            role="dialog"
            aria-label="Notifications"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <header className="notification-bell__panel-header">
              <span className="notification-bell__panel-title">Notifications</span>
              <button
                type="button"
                className="notification-bell__mark-all"
                onClick={handleMarkAll}
                disabled={unread === 0}
              >
                <CheckCircle size={14} weight="bold" /> Mark all read
              </button>
            </header>

            <ul className="notification-bell__list">
              {loading && rows.length === 0 && (
                <li className="notification-bell__empty">Loading…</li>
              )}
              {!loading && rows.length === 0 && (
                <li className="notification-bell__empty">You're all caught up.</li>
              )}
              {rows.map((n) => (
                <li
                  key={n.id}
                  className={`notification-bell__item${
                    n.read_at === null ? ' notification-bell__item--unread' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="notification-bell__item-button"
                    onClick={() => void handleRowClick(n)}
                  >
                    {n.read_at === null && (
                      <span
                        className="notification-bell__unread-dot"
                        aria-label="Unread"
                      />
                    )}
                    <span className="notification-bell__item-text">
                      <span className="notification-bell__item-desc">
                        {describeNotification(n)}
                      </span>
                      <span className="notification-bell__item-time">
                        {formatRelative(n.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <footer className="notification-bell__panel-footer">
              <button
                type="button"
                className="notification-bell__see-all"
                onClick={handleSeeAll}
              >
                See all notifications
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
