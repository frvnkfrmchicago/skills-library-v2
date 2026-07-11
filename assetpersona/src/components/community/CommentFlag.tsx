/* ═══ CommentFlag — small "report" link for any comment ═══
 *
 * Drop next to any rendered comment. Opens a modal with reason chips +
 * optional detail field. Posts to comment_reports. In bypass mode, just
 * pretends success.
 */
import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { isBypassActive } from '../../lib/devBypass';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import './CommentFlag.css';

const REASONS = [
  { key: 'spam',       label: 'Spam' },
  { key: 'harassment', label: 'Harassment' },
  { key: 'off_topic',  label: 'Off-topic' },
  { key: 'other',      label: 'Other' },
] as const;

type ReasonKey = (typeof REASONS)[number]['key'];

interface Props {
  commentId: string;
}

export default function CommentFlag({ commentId }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReasonKey>('spam');
  const [detail, setDetail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    setBusy(true);
    try {
      if (isBypassActive() || !isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 250));
        setSubmitted(true);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: e } = await (supabase as any).from('comment_reports').insert({
        comment_id: commentId,
        reporter_id: user?.id ?? null,
        reason,
        detail: detail.trim() || null,
      });
      if (e) throw e;
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send report.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="cflag__trigger"
        onClick={() => setOpen(true)}
        aria-label="Report comment"
      >
        <Flag size={12} /> Report
      </button>
    );
  }

  return (
    <div className="cflag" role="dialog" aria-modal="true" aria-labelledby="cflag-title">
      <div className="cflag__backdrop" onClick={() => !busy && setOpen(false)} />
      <div className="cflag__card">
        <button
          type="button"
          className="cflag__close"
          onClick={() => !busy && setOpen(false)}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {submitted ? (
          <>
            <h3 id="cflag-title">Report sent.</h3>
            <p>Thanks. Frank or a moderator reviews flags within a day.</p>
            <button className="btn btn--primary btn--sm" onClick={() => setOpen(false)}>Done</button>
          </>
        ) : (
          <>
            <h3 id="cflag-title">Report this comment</h3>
            <fieldset className="cflag__chips">
              <legend className="cflag__legend">Why?</legend>
              {REASONS.map((r) => (
                <label key={r.key} className={`cflag__chip ${reason === r.key ? 'is-active' : ''}`}>
                  <input
                    type="radio"
                    name="cflag-reason"
                    value={r.key}
                    checked={reason === r.key}
                    onChange={() => setReason(r.key)}
                  />
                  {r.label}
                </label>
              ))}
            </fieldset>
            <label className="cflag__detail">
              <span>Detail (optional)</span>
              <textarea
                rows={3}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="What's wrong with it?"
                maxLength={400}
              />
            </label>
            {error && <p className="cflag__err">{error}</p>}
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={submit}
              disabled={busy}
            >
              {busy ? 'Sending…' : 'Send report'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
