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
  Stack,
  BookOpen,
  ArrowUpRight,
} from '@phosphor-icons/react';
import { listLearnableModules, listMyCompletions } from '../../data/learnStore';
import { listDueReviews } from '../../data/masteryStore';
import { getMomentum, type Momentum } from '../../data/momentum';
import { AmbientIcon, AmbientField } from '../../components/motion';
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

  // Only show the momentum strip once there is a real signal worth seeing. A
  // brand new visitor with all zeros gets a clean header instead of empty stats.
  const showMomentum =
    momentum != null &&
    (momentum.streakDays > 0 ||
      momentum.xp > 0 ||
      momentum.modulesCompleted > 0 ||
      momentum.dueReviews > 0);

  // Gentle hover lift on a volume card. Settles to its still pose for anyone who
  // asks for reduced motion, so the page never moves under them.
  const cardHover = reduceMotion ? undefined : { y: -4 };

  function renderCard(track: LearnModule, index: number) {
    const done = completedIds.has(track.id);
    const difficulty = DIFFICULTY_BY_ROLE[track.required_role] ?? 'Beginner';
    return (
      <motion.div
        key={track.id}
        className={`ch-card ${done ? 'ch-card--done' : ''}`}
        whileHover={cardHover}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
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
              <CheckCircle size={14} weight="fill" /> Finished
            </span>
          ) : (
            <Link to={`/community/learn/${track.slug}`} className="ch-btn ch-btn--primary ch-btn--sm">
              Open volume <ArrowRight size={14} weight="bold" />
            </Link>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="classroom-grid-container">
      {/* Header. The ambient field sits behind the words like the quiet hum of a
          library at night, while the copy stays plain and readable above it. */}
      <header className="ch-header">
        <AmbientField density="low" tone="teal" className="ch-header__field" />
        <div className="ch-header__body">
          <p className="ch-kicker">Agentic Study Hall</p>
          <h1 className="ch-title">The Library</h1>
          <p className="ch-sub">
            A quiet place to learn AI by doing. Pick a shelf, open a volume, and work through it at
            your own pace. When you want one of your own, turn any article or video into a course
            with Upgrade.Self.
          </p>
          <div className="ch-actions">
            <Link to="/community/upgrade-self" className="ch-btn ch-btn--primary">
              <TerminalWindow size={16} weight="bold" /> Create a course
            </Link>
          </div>

          {showMomentum && momentum && (
            <Link to="/community/momentum" className="ch-momentum" aria-label="See your full progress in the Momentum dashboard">
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
                <span className="ch-momentum__lbl">volumes finished</span>
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
            </Link>
          )}

          {modules.length > 0 && (
            <div className="ch-progress">
              <div className="ch-progress__row">
                <span className="ch-progress__label">
                  <span className="ch-progress__count">{completedCount}</span> of {modules.length}{' '}
                  volumes finished
                </span>
                <span className="ch-progress__pct">{progressPct}%</span>
              </div>
              <div className="ch-progress__bar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
                <span className="ch-progress__fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Review due, spaced repetition. Re-reading what you know comes before
          opening something new, so it sits at the top of the shelves. */}
      {dueModules.length > 0 && (
        <section className="ch-section">
          <div className="ch-tracks-head">
            <h2 className="ch-tracks-title">
              <AmbientIcon motion="flicker">
                <Repeat size={18} weight="bold" />
              </AmbientIcon>{' '}
              On your desk
            </h2>
            <span className="ch-tracks-note">A quick re-read locks these in for the long term.</span>
          </div>
          <div className="ch-tracks">{dueModules.map(renderCard)}</div>
        </section>
      )}

      {/* The shelves: every volume in the library. */}
      <section className="ch-section">
        <div className="ch-tracks-head">
          <h2 className="ch-tracks-title">
            <AmbientIcon motion="sway">
              <Stack size={18} weight="bold" />
            </AmbientIcon>{' '}
            The shelves
          </h2>
        </div>
        {loading ? (
          <p className="ch-state">Pulling volumes off the shelf...</p>
        ) : modules.length === 0 ? (
          <div className="ch-empty">
            <p className="ch-empty__title">The shelves are empty for now.</p>
            <p className="ch-empty__sub">
              Add the first volume. Paste any article or video into Upgrade.Self and it becomes a
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
