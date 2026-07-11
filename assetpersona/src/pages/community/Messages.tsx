import { useEffect, useState } from 'react';
import { ChatCircleDots } from '@phosphor-icons/react';
import MessageInbox from '../../components/community/MessageInbox';
import { listThreads, type InboxRow } from '../../data/messages';
import { useAuth } from '../../context/useAuth';
import SubTabs from '../../components/community/SubTabs';
import './Messages.css';

const INBOX_TABS = [
  { to: '/community/messages', label: 'Messages' },
  { to: '/community/notifications', label: 'Notifications' },
];

/* ═══════════════════════════════════════════════
   AP-MODERNIZE-2026-05 · Lane 2 · Messages (Inbox page)
   ═══════════════════════════════════════════════
   Route: /community/messages (Lane 6 will mount it in App.tsx + sidebar).
   Renders the viewer's threads via MessageInbox. Empty state nudges the
   user to a member's profile, where a future lane adds the "Message" CTA.
   ═══════════════════════════════════════════════ */

export default function Messages() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<InboxRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const data = await listThreads();
      if (!cancelled) {
        setRows(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  return (
    <div className="dm-page">
      <SubTabs tabs={INBOX_TABS} />
      <header className="community-page-header">
        <h1>Messages</h1>
        <p>Private conversations between you and other members.</p>
      </header>

      <section className="community-card dm-page__panel">
        {loading ? (
          <div className="dm-page__loading">
            <ChatCircleDots size={28} weight="duotone" />
            <p>Loading conversations…</p>
          </div>
        ) : (
          <MessageInbox rows={rows} />
        )}
      </section>
    </div>
  );
}
