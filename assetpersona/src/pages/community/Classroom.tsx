import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TerminalWindow, CheckCircle, Repeat, Clock } from '@phosphor-icons/react';
import { listLearnableModules, listMyCompletions } from '../../data/learnStore';
import { listDueReviews } from '../../data/masteryStore';
import { useAuth } from '../../context/useAuth';
import type { LearnModule } from '../../types/learn';
import './Classroom.css';

// Mirror the Learn hub's bypass id so a signed-out demo user still has a stable,
// per-role identity for completions and reviews.
function bypassUserId(role: string | null | undefined): string {
  return `bypass-${role ?? 'guest'}`;
}

const DIFFICULTY_BY_ROLE: Record<string, string> = {
  curious: 'Beginner',
  operator: 'Beginner',
  crafter: 'Intermediate',
  architect: 'Advanced',
  producer: 'Advanced',
};

export default function Classroom() {
  const { user, isBypass, bypassRole } = useAuth();
  const userId = user?.id ?? (isBypass ? bypassUserId(bypassRole) : null);

  const [modules, setModules] = useState<LearnModule[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [dueReviewIds, setDueReviewIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      // The ONE canonical getter, same list the Learn hub reads. It merges the
      // published store with any courses you generated in Upgrade.Self.
      listLearnableModules(),
      userId ? listMyCompletions(userId) : Promise.resolve([]),
      userId ? listDueReviews(userId) : Promise.resolve([]),
    ]).then(([all, myComp, due]) => {
      if (cancelled) return;
      setModules(all);
      setCompletedIds(new Set(myComp.map((c) => c.module_id)));
      setDueReviewIds(new Set(due.map((r) => r.module_id)));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const completedCount = useMemo(
    () => modules.filter((m) => completedIds.has(m.id)).length,
    [modules, completedIds]
  );
  const progressPct =
    modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  // Spaced repetition: tracks you finished whose review is due today. Real data
  // from the mastery store, only shown when there is something to review.
  const dueModules = useMemo(
    () => modules.filter((m) => dueReviewIds.has(m.id)),
    [modules, dueReviewIds]
  );

  function renderCard(track: LearnModule, index: number) {
    const done = completedIds.has(track.id);
    const difficulty = DIFFICULTY_BY_ROLE[track.required_role] ?? 'Beginner';
    return (
      <div key={track.id} className={`ch-card ${done ? 'ch-card--done' : ''}`}>
        <div className="ch-card__top">
          <span className="ch-card__num">{String(index + 1).padStart(2, '0')}</span>
          <span className="ch-card__track">{track.tags?.[0] ?? 'AI Skill'}</span>
          {done && <CheckCircle size={18} weight="fill" className="ch-card__doneIcon" />}
        </div>

        <h3 className="ch-card__title">{track.title}</h3>
        <p className="ch-card__desc">{track.hook}</p>

        <div className="ch-card__meta">
          <span className={`ch-badge ch-badge--${difficulty.toLowerCase()}`}>{difficulty}</span>
          <span className="ch-card__metaItem">
            <Clock size={12} weight="bold" /> {track.estimated_minutes} min
          </span>
        </div>

        <div className="ch-card__footer">
          {done ? (
            <span className="ch-card__status ch-card__status--done">
              <CheckCircle size={14} weight="fill" /> Completed
            </span>
          ) : (
            <Link to={`/community/learn/${track.slug}`} className="ch-btn ch-btn--primary ch-btn--sm">
              Start <ArrowRight size={14} weight="bold" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="classroom-grid-container">
      {/* Header */}
      <header className="ch-header">
        <p className="ch-kicker">Agentic Study Hall</p>
        <h1 className="ch-title">Learn AI by doing.</h1>
        <p className="ch-sub">
          Work through short, plain-language tracks, then turn any source into your own course with
          Upgrade.Self.
        </p>
        <div className="ch-actions">
          <Link to="/community/upgrade-self" className="ch-btn ch-btn--primary">
            <TerminalWindow size={16} weight="bold" /> Create a course
          </Link>
        </div>

        {modules.length > 0 && (
          <div className="ch-progress">
            <div className="ch-progress__row">
              <span className="ch-progress__label">
                <span className="ch-progress__count">{completedCount}</span> of {modules.length} tracks
                completed
              </span>
              <span className="ch-progress__pct">{progressPct}%</span>
            </div>
            <div className="ch-progress__bar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              <span className="ch-progress__fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </header>

      {/* Review due, spaced repetition. Reinforcing what you know comes before
          starting something new, so it sits above the full track list. */}
      {dueModules.length > 0 && (
        <section className="ch-section">
          <div className="ch-tracks-head">
            <h2 className="ch-tracks-title">
              <Repeat size={18} weight="bold" /> Review due
            </h2>
            <span className="ch-tracks-note">A quick re-run locks these in for the long term.</span>
          </div>
          <div className="ch-tracks">{dueModules.map(renderCard)}</div>
        </section>
      )}

      {/* All learning tracks */}
      <section className="ch-section">
        <div className="ch-tracks-head">
          <h2 className="ch-tracks-title">Learning tracks</h2>
        </div>
        {loading ? (
          <p className="ch-state">Loading tracks…</p>
        ) : modules.length === 0 ? (
          <div className="ch-empty">
            <p className="ch-empty__title">No tracks yet.</p>
            <p className="ch-empty__sub">
              Build your first one. Paste any article or video into Upgrade.Self and it becomes a
              learnable track right here.
            </p>
            <Link to="/community/upgrade-self" className="ch-btn ch-btn--primary">
              <TerminalWindow size={16} weight="bold" /> Create a course
            </Link>
          </div>
        ) : (
          <div className="ch-tracks">{modules.map(renderCard)}</div>
        )}
      </section>
    </div>
  );
}
