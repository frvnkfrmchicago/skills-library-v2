/* ═══ /admin/moderation — comment moderation queue + reports ═══
 *
 * Two stacks: pending comments (default mode = pending) and open reports.
 * One-click approve / reject; bulk approve. Reads real rows only — when
 * Supabase is not configured the queue renders empty.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, Flag, Trash, ShieldCheck, ChatCircle,
} from '@phosphor-icons/react';
import { isBypassActive } from '../../lib/devBypass';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import './Moderation.css';

interface PendingComment {
  id: string;
  body: string;
  author_id: string;
  post_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  created_at: string;
  author?: { display_name: string; avatar_url: string | null };
  post?: { id: string; body: string };
}

interface ReportRow {
  id: string;
  reason: 'spam' | 'harassment' | 'off_topic' | 'other';
  detail: string | null;
  comment_id: string;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: string;
  comment?: { body: string; status: string };
}

export default function ModerationPage() {
  const [tab, setTab] = useState<'queue' | 'reports'>('queue');
  const [pending, setPending] = useState<PendingComment[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isSupabaseConfigured) {
        setPending([]);
        setReports([]);
        setLoading(false);
        return;
      }
      const [{ data: p }, { data: r }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('comments')
          .select('id, body, author_id, post_id, status, created_at, author:profiles(display_name, avatar_url), post:posts(id, body)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(50),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('comment_reports')
          .select('id, reason, detail, comment_id, status, created_at, comment:comments(body, status)')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);
      if (cancelled) return;
      setPending((p as PendingComment[]) ?? []);
      setReports((r as ReportRow[]) ?? []);
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function moderate(id: string, status: 'approved' | 'rejected', reason?: string) {
    if (isBypassActive() || !isSupabaseConfigured) {
      setPending((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc('moderate_comment', {
      comment_id: id,
      new_status: status,
      reason: reason ?? null,
    });
    setPending((prev) => prev.filter((c) => c.id !== id));
  }

  async function approveAll() {
    if (!confirm(`Approve all ${pending.length} pending comments?`)) return;
    if (isBypassActive() || !isSupabaseConfigured) {
      setPending([]);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('comments')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('status', 'pending');
    setPending([]);
  }

  async function resolveReport(id: string, action: 'resolved' | 'dismissed') {
    if (isBypassActive() || !isSupabaseConfigured) {
      setReports((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('comment_reports')
      .update({ status: action, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  const counts = useMemo(
    () => ({ pending: pending.length, reports: reports.length }),
    [pending, reports]
  );

  return (
    <div className="modq">
      <header className="modq__head">
        <div>
          <h1><ShieldCheck size={20} weight="duotone" /> Moderation</h1>
          <p className="modq__sub">
            {counts.pending} pending · {counts.reports} reports
            {isBypassActive() && ' · DEV BYPASS — local stub'}
          </p>
        </div>
        {tab === 'queue' && pending.length > 1 && (
          <button className="btn btn--primary btn--sm" onClick={approveAll}>
            <Check size={14} /> Approve all
          </button>
        )}
      </header>

      <div className="modq__tabs">
        <button
          className={tab === 'queue' ? 'is-active' : ''}
          onClick={() => setTab('queue')}
        >
          <ChatCircle size={14} /> Queue ({counts.pending})
        </button>
        <button
          className={tab === 'reports' ? 'is-active' : ''}
          onClick={() => setTab('reports')}
        >
          <Flag size={14} /> Reports ({counts.reports})
        </button>
      </div>

      {loading ? (
        <p className="modq__loading">Loading…</p>
      ) : tab === 'queue' ? (
        pending.length === 0 ? (
          <div className="modq__empty">
            <ShieldCheck size={28} weight="duotone" />
            <p>Inbox zero. No pending comments.</p>
          </div>
        ) : (
          <ul className="modq__list">
            {pending.map((c) => (
              <li key={c.id} className="modq__row">
                <header>
                  <span className="modq__author">{c.author?.display_name ?? 'Member'}</span>
                  <time>{new Date(c.created_at).toLocaleString()}</time>
                </header>
                <p className="modq__body">{c.body}</p>
                {c.post && (
                  <p className="modq__post-ctx">
                    on{' '}
                    <Link to={`/community#post-${c.post.id}`}>
                      "{c.post.body.slice(0, 60)}…"
                    </Link>
                  </p>
                )}
                <footer>
                  <button className="btn btn--ghost btn--sm" onClick={() => {
                    const reason = prompt('Reject reason (optional, used to tune filters):') ?? '';
                    void moderate(c.id, 'rejected', reason);
                  }}>
                    <X size={14} /> Reject
                  </button>
                  <button className="btn btn--primary btn--sm" onClick={() => moderate(c.id, 'approved')}>
                    <Check size={14} /> Approve
                  </button>
                </footer>
              </li>
            ))}
          </ul>
        )
      ) : reports.length === 0 ? (
        <div className="modq__empty">
          <Flag size={28} weight="duotone" />
          <p>No open reports.</p>
        </div>
      ) : (
        <ul className="modq__list">
          {reports.map((r) => (
            <li key={r.id} className="modq__row modq__row--report">
              <header>
                <span className="modq__reason">{r.reason.replace('_', ' ')}</span>
                <time>{new Date(r.created_at).toLocaleString()}</time>
              </header>
              {r.detail && <p className="modq__body">{r.detail}</p>}
              {r.comment && (
                <blockquote className="modq__quote">
                  <em>flagged comment:</em> {r.comment.body}
                </blockquote>
              )}
              <footer>
                <button className="btn btn--ghost btn--sm" onClick={() => resolveReport(r.id, 'dismissed')}>
                  Dismiss
                </button>
                <button
                  className="btn btn--primary btn--sm"
                  onClick={async () => {
                    await moderate(r.comment_id, 'rejected', `report ${r.id}: ${r.reason}`);
                    await resolveReport(r.id, 'resolved');
                  }}
                >
                  <Trash size={14} /> Remove + resolve
                </button>
              </footer>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
