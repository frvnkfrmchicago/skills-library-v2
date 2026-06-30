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
import { AmbientIcon } from '../../components/motion';
import { AuroraField, BentoGrid, BentoTile } from '../../components/ui';
import type { GlowAccent } from '../../components/ui';
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

// The shelves cycle through the four accents so the grid reads as the warm-coral
// and cool-teal AssetPersona palette, never one flat colour. The next-up volume
// is pinned to ocean (the community accent) so the eye lands on it first.
const SHELF_ACCENTS: GlowAccent[] = ['ocean', 'coral', 'violet', 'gold'];

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

  // The next volume to open: the first one you have not finished yet. It earns
  // the larger, brighter tile on the shelves so the page has one clear next
  // step. When everything is finished there is no next-up tile and the shelves
  // read as an even grid of done volumes.
  const nextUpId = useMemo(
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

  function renderTile(track: LearnModule, index: number, opts?: { featured?: boolean }) {
    const done = completedIds.has(track.id);
    const difficulty = DIFFICULTY_BY_ROLE[track.required_role] ?? 'Beginner';
    const featured = Boolean(opts?.featured);
    // The next-up tile keeps the ocean accent and spans two columns so it reads
    // as the focal point. Every other tile rotates through the palette.
    const accent: GlowAccent = featured ? 'ocean' : SHELF_ACCENTS[index % SHELF_ACCENTS.length];

    return (
      <BentoTile
        key={track.id}
        accent={accent}
        span={featured ? { col: 2 } : undefined}
        className={`ch-tile ${done ? 'ch-tile--done' : ''} ${featured ? 'ch-tile--featured' : ''}`}
      >
        <div className="ch-tile__inner">
          <div className="ch-tile__top">
            <span className="ch-tile__num">{String(index + 1).padStart(2, '0')}</span>
            <span className="ch-tile__track">{track.tags?.[0] ?? 'AI Skill'}</span>
            {featured && !done && <span className="ch-tile__flag">Next up</span>}
            {done && <CheckCircle size={18} weight="fill" className="ch-tile__doneIcon" />}
          </div>

          <h3 className="ch-tile__title">{track.title}</h3>
          <p className="ch-tile__desc">{track.hook}</p>

          <div className="ch-tile__meta">
            <span className={`ch-badge ch-badge--${difficulty.toLowerCase()}`}>{difficulty}</span>
            <span className="ch-tile__metaItem">
              <Clock size={12} weight="bold" /> {track.estimated_minutes} min
            </span>
          </div>

          <div className="ch-tile__footer">
            {done ? (
              <span className="ch-tile__status ch-tile__status--done">
                <CheckCircle size={14} weight="fill" /> Finished
              </span>
            ) : (
              <Link
                to={`/community/learn/${track.slug}`}
                className="ch-btn ch-btn--primary ch-btn--sm"
              >
                Open volume <ArrowRight size={14} weight="bold" />
              </Link>
            )}
          </div>
        </div>
      </BentoTile>
    );
  }

  return (
    <div className="classroom-grid-container">
      {/* Header. The aurora drifts behind the words like the quiet hum of a
          library at night, while the copy stays plain and readable above it. */}
      <header className="ch-header">
        <AuroraField intensity="rich" className="ch-header__field" />
        <div className="ch-header__body">
          <p className="ch-kicker">Agentic Study Hall</p>
          <h1 className="ch-title">
            <span className="ch-title__fill">The Library</span>
            {/* The shine layer sweeps across the same word; it is decorative and
                hidden from screen readers and under reduced motion. */}
            {!reduceMotion && <span className="ch-title__shine" aria-hidden="true" />}
          </h1>
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
                </span>
              </Link>
            </motion.div>
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
          <BentoGrid columns={4}>
            {dueModules.map((track, i) => renderTile(track, i))}
          </BentoGrid>
        </section>
      )}

      {/* The shelves: every volume in the library, laid out as an active bento
          grid where the next-up volume earns the larger tile. */}
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
          <BentoGrid columns={4}>
            {modules.map((track, i) =>
              renderTile(track, i, { featured: track.id === nextUpId })
            )}
          </BentoGrid>
        )}
      </section>
    </div>
  );
}
