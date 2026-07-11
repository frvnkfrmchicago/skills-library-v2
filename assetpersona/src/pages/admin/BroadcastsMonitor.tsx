/* ═══ ADMIN — Broadcasts Monitor ═══
 *
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 5
 *
 * Two views on a single page:
 *   1. CALENDAR — week-of-the-fan-out grid, grouped by day, with
 *      platform pills per scheduled post.
 *   2. ACTIVITY — recent post_results table: platform | status |
 *      permalink | error.
 *
 * Route `/admin/content-hub/broadcasts` is wired by Lane 7. This
 * page just renders; it doesn't own the routing.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarBlank,
  CheckCircle,
  Clock,
  ExclamationMark,
  HandPalm,
  LinkSimple,
  ArrowsClockwise,
  Trash,
  X as XIcon,
  ArrowLeft,
  ArrowRight,
} from '@phosphor-icons/react';
import {
  listPostResults,
  getCalendarRange,
  cancelScheduledPost,
  indexResultsByPlatform,
  type CalendarRange,
  type PostResult,
  type PostResultStatus,
  type ScheduledPost,
  type SocialPlatform,
} from '../../data/broadcasts';
import './BroadcastsMonitor.css';

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  threads: 'Threads',
  linkedin: 'LinkedIn',
  x: 'X',
  bluesky: 'Bluesky',
  instagram: 'Instagram',
  mastodon: 'Mastodon',
  youtube: 'YouTube',
};

const STATUS_LABEL: Record<PostResultStatus, string> = {
  queued: 'Queued',
  sent: 'Sent',
  failed: 'Failed',
  manual_required: 'Manual',
  rate_limited: 'Rate-limited',
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatStamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function shiftWeek(date: string, delta: number): Date {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + delta * 7);
  return d;
}

export default function BroadcastsMonitor() {
  const [range, setRange] = useState<CalendarRange | null>(null);
  const [results, setResults] = useState<PostResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekStart, setWeekStart] = useState<Date | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [r, p] = await Promise.all([
        getCalendarRange(weekStart),
        listPostResults(),
      ]);
      setRange(r);
      setResults(p);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load broadcasts.'
      );
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  const resultsByPost = useMemo(() => {
    const out = new Map<string, PostResult[]>();
    for (const r of results) {
      const list = out.get(r.scheduled_post_id) ?? [];
      list.push(r);
      out.set(r.scheduled_post_id, list);
    }
    return out;
  }, [results]);

  async function onCancel(id: string) {
    if (!confirm('Cancel this scheduled post?')) return;
    try {
      await cancelScheduledPost(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel.');
    }
  }

  return (
    <div className="broadcasts">
      <header className="broadcasts__head">
        <div>
          <h1>Broadcasts</h1>
          <p className="broadcasts__sub">
            What's queued, what posted, what needs a hand.
          </p>
        </div>
        <div className="broadcasts__head-actions">
          <Link to="/admin/content-hub" className="broadcasts__back">
            <ArrowLeft size={16} weight="bold" />
            <span>Content Hub</span>
          </Link>
          <button
            type="button"
            className="broadcasts__refresh"
            onClick={load}
            aria-label="Refresh"
          >
            <ArrowsClockwise size={16} weight="bold" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {error ? (
        <p role="alert" className="broadcasts__error">
          {error}
        </p>
      ) : null}

      {/* ── CALENDAR ── */}
      <section className="broadcasts__section">
        <header className="broadcasts__section-head">
          <h2>
            <CalendarBlank size={18} weight="duotone" />
            <span>Calendar</span>
          </h2>
          <div className="broadcasts__week-nav">
            <button
              type="button"
              onClick={() => setWeekStart(shiftWeek(range?.weekStart ?? new Date().toISOString().slice(0, 10), -1))}
              aria-label="Previous week"
            >
              <ArrowLeft size={16} weight="bold" />
            </button>
            <span className="broadcasts__week-label">
              {range ? `Week of ${range.weekStart}` : '—'}
            </span>
            <button
              type="button"
              onClick={() => setWeekStart(shiftWeek(range?.weekStart ?? new Date().toISOString().slice(0, 10), 1))}
              aria-label="Next week"
            >
              <ArrowRight size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(undefined)}
              className="broadcasts__week-today"
            >
              Today
            </button>
          </div>
        </header>

        {loading && !range ? (
          <p className="broadcasts__loading">Loading…</p>
        ) : (
          <div className="broadcasts__calendar">
            {range?.days.map((day, idx) => (
              <CalendarColumn
                key={day.date}
                label={DAY_LABELS[idx]}
                date={day.date}
                posts={day.posts}
                resultsByPost={resultsByPost}
                onCancel={onCancel}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── ACTIVITY ── */}
      <section className="broadcasts__section">
        <header className="broadcasts__section-head">
          <h2>
            <Clock size={18} weight="duotone" />
            <span>Recent activity</span>
          </h2>
          <span className="broadcasts__count">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </span>
        </header>

        {loading && results.length === 0 ? (
          <p className="broadcasts__loading">Loading…</p>
        ) : results.length === 0 ? (
          <p className="broadcasts__empty">
            No fan-outs yet. Schedule a bulletin to see results land here.
          </p>
        ) : (
          <ul className="broadcasts__activity">
            {results.slice(0, 50).map((r) => (
              <ActivityRow key={r.id} result={r} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ───────── Calendar column ───────── */

function CalendarColumn(props: {
  label: string;
  date: string;
  posts: ScheduledPost[];
  resultsByPost: Map<string, PostResult[]>;
  onCancel: (id: string) => void;
}) {
  const { label, date, posts, resultsByPost, onCancel } = props;
  const dayNum = new Date(`${date}T00:00:00`).getDate();
  const isToday = date === new Date().toISOString().slice(0, 10);

  return (
    <div
      className={`broadcasts__day${isToday ? ' is-today' : ''}`}
    >
      <header className="broadcasts__day-head">
        <span className="broadcasts__day-label">{label}</span>
        <span className="broadcasts__day-num">{dayNum}</span>
      </header>
      {posts.length === 0 ? (
        <p className="broadcasts__day-empty">—</p>
      ) : (
        <ul className="broadcasts__day-list">
          {posts.map((p) => {
            const platformResults = resultsByPost.get(p.id) ?? [];
            const byPlatform = indexResultsByPlatform(platformResults);
            return (
              <li key={p.id} className="broadcasts__post">
                <div className="broadcasts__post-time">
                  {formatStamp(p.scheduled_for)}
                </div>
                <p className="broadcasts__post-text">
                  {p.payload.text.slice(0, 120)}
                  {p.payload.text.length > 120 ? '…' : ''}
                </p>
                <div className="broadcasts__pills">
                  {p.target_platforms.map((plat) => {
                    const result = byPlatform[plat];
                    return (
                      <PlatformPill
                        key={plat}
                        platform={plat}
                        status={result?.status}
                        permalink={result?.permalink ?? null}
                      />
                    );
                  })}
                </div>
                {p.dispatched_at === null ? (
                  <button
                    type="button"
                    className="broadcasts__post-cancel"
                    onClick={() => onCancel(p.id)}
                    aria-label="Cancel this scheduled post"
                  >
                    <Trash size={14} />
                    <span>Cancel</span>
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ───────── Platform pill ───────── */

function PlatformPill(props: {
  platform: SocialPlatform;
  status?: PostResultStatus;
  permalink?: string | null;
}) {
  const { platform, status, permalink } = props;
  const cls = `broadcasts__pill broadcasts__pill--${platform}${
    status ? ` is-${status}` : ''
  }`;
  const content = (
    <>
      <span>{PLATFORM_LABEL[platform]}</span>
      {status ? <StatusGlyph status={status} /> : null}
    </>
  );
  if (status === 'sent' && permalink) {
    return (
      <a
        href={permalink}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {content}
      </a>
    );
  }
  return <span className={cls}>{content}</span>;
}

function StatusGlyph({ status }: { status: PostResultStatus }) {
  if (status === 'sent') return <CheckCircle size={12} weight="fill" />;
  if (status === 'failed') return <ExclamationMark size={12} weight="fill" />;
  if (status === 'manual_required') return <HandPalm size={12} weight="fill" />;
  if (status === 'rate_limited') return <Clock size={12} weight="fill" />;
  return <Clock size={12} />;
}

/* ───────── Activity row ───────── */

function ActivityRow({ result }: { result: PostResult }) {
  return (
    <li className={`broadcasts__activity-row is-${result.status}`}>
      <div className="broadcasts__activity-meta">
        <span className="broadcasts__activity-platform">
          {PLATFORM_LABEL[result.platform]}
        </span>
        <span className="broadcasts__activity-stamp">
          {formatStamp(result.attempted_at)}
        </span>
      </div>
      <div className="broadcasts__activity-status">
        <StatusGlyph status={result.status} />
        <span>{STATUS_LABEL[result.status]}</span>
      </div>
      <div className="broadcasts__activity-detail">
        {result.permalink ? (
          <a
            href={result.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="broadcasts__activity-link"
          >
            <LinkSimple size={14} />
            <span>Open post</span>
          </a>
        ) : result.error_message ? (
          <span className="broadcasts__activity-error">
            <XIcon size={14} />
            <span>{result.error_message}</span>
          </span>
        ) : (
          <span className="broadcasts__activity-empty">—</span>
        )}
      </div>
    </li>
  );
}
