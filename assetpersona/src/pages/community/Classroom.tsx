import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  TerminalWindow,
  CheckCircle,
  Repeat,
  Clock,
  Flame,
  Trophy,
  BookOpen,
  ArrowUpRight,
} from '@phosphor-icons/react';
import { listLearnableModules, listMyCompletions } from '../../data/learnStore';
import { listDueReviews } from '../../data/masteryStore';
import { getMomentum, type Momentum } from '../../data/momentum';
import { AmbientIcon } from '../../components/motion';
import { AuroraField } from '../../components/ui';
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

// The plain outcome line for a step: the module's own objective, falling back to
// its hook. Never invented here, always sourced from the real module record.
function outcomeLine(track: LearnModule): string {
  return (track.objective || track.hook || '').trim();
}

export default function Classroom() {
  const { user, isBypass, bypassRole } = useAuth();
  const userId = user?.id ?? (isBypass ? bypassUserId(bypassRole) : null);
  const reduceMotion = useReducedMotion();

  const [modules, setModules] = useState<LearnModule[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [dueReviewIds, setDueReviewIds] = useState<Set<string>>(new Set());
  const [momentum, setMomentum] = useState<Momentum | null>(null);
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
      // One honest read of streak, XP/level, modules done and due reviews. The
      // momentum store routes to Supabase or localStorage on its own and returns
      // the empty model for a signed-out visitor, so we never show fake numbers.
      getMomentum(userId),
    ]).then(([all, myComp, due, mo]) => {
      if (cancelled) return;
      setModules(all);
      setCompletedIds(new Set(myComp.map((c) => c.module_id)));
      setDueReviewIds(new Set(due.map((r) => r.module_id)));
      setMomentum(mo);
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

  // The current step: the first module you have not finished yet. It is where
  // the learner is on the path, so it earns the coral "Continue" emphasis. When
  // everything is finished there is no current step and every row reads as done.
  const currentId = useMemo(
    () => modules.find((m) => !completedIds.has(m.id))?.id ?? null,
    [modules, completedIds]
  );

  // Only show the momentum strip once there is a real signal worth seeing. A
  // brand new visitor with all zeros gets a clean header instead of empty stats.
  const showMomentum =
    momentum != null &&
    (momentum.streakDays > 0 ||
      momentum.xp > 0 ||
      momentum.modulesCompleted > 0 ||
      momentum.dueReviews > 0);

  // Render one step on the path. State drives the whole row: done rows are quiet
  // and checked, the current row is the coral focal point with a Continue CTA,
  // and the rest are upcoming rows that stay calm until you reach them.
  function renderStep(track: LearnModule, index: number, state: 'done' | 'current' | 'upcoming') {
    const difficulty = DIFFICULTY_BY_ROLE[track.required_role] ?? 'Beginner';
    const outcome = outcomeLine(track);
    const num = String(index + 1).padStart(2, '0');

    return (
      <li key={track.id} className={`ch-step ch-step--${state}`}>
        <span className="ch-step__rail" aria-hidden="true">
          <span className="ch-step__node">
            {state === 'done' ? (
              <CheckCircle size={18} weight="fill" />
            ) : (
              <span className="ch-step__num">{num}</span>
            )}
          </span>
        </span>

        <div className="ch-step__body">
          <div className="ch-step__head">
            <span className="ch-step__track">{track.tags?.[0] ?? 'AI skill'}</span>
            {state === 'current' && <span className="ch-step__flag">You are here</span>}
          </div>

          <h3 className="ch-step__title">{track.title}</h3>
          {outcome && (
            <p className="ch-step__outcome">
              <span className="ch-step__outcomeLabel">Outcome</span>
              {outcome}
            </p>
          )}

          <div className="ch-step__meta">
            <span className={`ch-badge ch-badge--${difficulty.toLowerCase()}`}>{difficulty}</span>
            <span className="ch-step__metaItem">
              <Clock size={12} weight="bold" /> {track.estimated_minutes} min
            </span>
          </div>
        </div>

        <div className="ch-step__action">
          {state === 'done' ? (
            <span className="ch-step__status">
              <CheckCircle size={14} weight="fill" /> Finished
            </span>
          ) : (
            <Link
              to={`/community/learn/${track.slug}`}
              className={`ch-btn ch-btn--sm ${state === 'current' ? 'ch-btn--primary' : 'ch-btn--ghost'}`}
            >
              {state === 'current' ? 'Continue' : 'Open'} <ArrowRight size={14} weight="bold" />
            </Link>
          )}
        </div>
      </li>
    );
  }

  function stepState(track: LearnModule): 'done' | 'current' | 'upcoming' {
    if (completedIds.has(track.id)) return 'done';
    if (track.id === currentId) return 'current';
    return 'upcoming';
  }

  return (
    <div className="classroom-grid-container">
      {/* Header. A single quiet coral wash sits behind the words; the copy is one
          plain line so the path below is the first real thing you read. */}
      <header className="ch-header">
        <AuroraField tone="coral" intensity="soft" className="ch-header__field" />
        <div className="ch-header__body">
          <p className="ch-kicker">Agentic Study Hall</p>
          <h1 className="ch-title">The Library</h1>
          <p className="ch-sub">
            Learn AI by doing. Work down the path one step at a time, at your own pace.
          </p>
          <div className="ch-actions">
            <Link to="/community/upgrade-self" className="ch-btn ch-btn--primary">
              <TerminalWindow size={16} weight="bold" /> Create a course
            </Link>
          </div>

          {showMomentum && momentum && (
            <motion.div
              className="ch-momentum"
              whileHover={reduceMotion ? undefined : { y: -3 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.7 }}
            >
              <Link
                to="/community/momentum"
                className="ch-momentum__link"
                aria-label="See your full progress in the Momentum dashboard"
              >
                <span className="ch-momentum__border" aria-hidden="true" />
                <span className="ch-momentum__row">
                  <span className="ch-momentum__stat">
                    <span className="ch-momentum__icon">
                      <AmbientIcon motion="flicker" delay={0}>
                        <Flame size={18} weight="fill" />
                      </AmbientIcon>
                    </span>
                    <span className="ch-momentum__num">{momentum.streakDays}</span>
                    <span className="ch-momentum__lbl">day streak</span>
                  </span>

                  <span className="ch-momentum__stat">
                    <span className="ch-momentum__icon">
                      <AmbientIcon motion="sway" delay={0.3}>
                        <Trophy size={18} weight="fill" />
                      </AmbientIcon>
                    </span>
                    <span className="ch-momentum__num">{momentum.levelName}</span>
                    <span className="ch-momentum__lbl">{momentum.xp} points</span>
                  </span>

                  <span className="ch-momentum__stat">
                    <span className="ch-momentum__icon">
                      <AmbientIcon motion="breathe" delay={0.6}>
                        <BookOpen size={18} weight="fill" />
                      </AmbientIcon>
                    </span>
                    <span className="ch-momentum__num">{momentum.modulesCompleted}</span>
                    <span className="ch-momentum__lbl">steps finished</span>
                  </span>

                  <span className="ch-momentum__stat">
                    <span className="ch-momentum__icon">
                      <AmbientIcon motion="flicker" delay={0.9}>
                        <Repeat size={18} weight="bold" />
                      </AmbientIcon>
                    </span>
                    <span className="ch-momentum__num">{momentum.dueReviews}</span>
                    <span className="ch-momentum__lbl">reviews due</span>
                  </span>

                  <span className="ch-momentum__more">
                    Full progress <ArrowUpRight size={14} weight="bold" />
                  </span>
                </span>
              </Link>
            </motion.div>
          )}

          {modules.length > 0 && (
            <div className="ch-progress">
              <div className="ch-progress__row">
                <span className="ch-progress__label">
                  <span className="ch-progress__count">{completedCount}</span> of {modules.length}{' '}
                  steps finished
                </span>
                <span className="ch-progress__pct">{progressPct}%</span>
              </div>
              <div
                className="ch-progress__bar"
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span className="ch-progress__fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Review due, spaced repetition. Re-reading what you know comes before
          moving further down the path, so it sits above the main path. */}
      {dueModules.length > 0 && (
        <section className="ch-section">
          <div className="ch-section-head">
            <h2 className="ch-section-title">
              <AmbientIcon motion="flicker">
                <Repeat size={18} weight="bold" />
              </AmbientIcon>{' '}
              Review first
            </h2>
            <span className="ch-section-note">A quick re-read locks these in for the long term.</span>
          </div>
          <ol className="ch-path">
            {dueModules.map((track, i) => renderStep(track, i, 'upcoming'))}
          </ol>
        </section>
      )}

      {/* The path: every step in the library in order, with done / current /
          upcoming made obvious so you always know where you are and what is next. */}
      <section className="ch-section">
        <div className="ch-section-head">
          <h2 className="ch-section-title">Your path</h2>
          {modules.length > 0 && (
            <span className="ch-section-note">{completedCount} done, {modules.length - completedCount} to go</span>
          )}
        </div>
        {loading ? (
          <p className="ch-state">Loading the path...</p>
        ) : modules.length === 0 ? (
          <div className="ch-empty">
            <p className="ch-empty__title">No steps yet.</p>
            <p className="ch-empty__sub">
              Paste any article or video into Upgrade.Self and it becomes the first step on your path.
            </p>
            <Link to="/community/upgrade-self" className="ch-btn ch-btn--primary">
              <TerminalWindow size={16} weight="bold" /> Create a course
            </Link>
          </div>
        ) : (
          <ol className="ch-path">
            {modules.map((track, i) => renderStep(track, i, stepState(track)))}
          </ol>
        )}
      </section>
    </div>
  );
}
