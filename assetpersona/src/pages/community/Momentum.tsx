/* Momentum.tsx — the learner's progress screen.
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 6 (Momentum Dashboard)
 *
 * What this page is, in plain words:
 *   One screen where a learner sees how they are doing and feels a reason to
 *   come back. It shows the streak (days in a row), points and level, how many
 *   lessons are finished, an average mastery score (how well the quizzes went),
 *   any reviews that are due, and a wall of achievements (small goals you earn).
 *
 * Where the numbers come from:
 *   Every value is read once, on mount, from getMomentum in src/data/momentum.
 *   That store rolls up four real stores (learn, mastery, community points) and
 *   returns 0 or empty for a brand-new learner. Nothing here is invented. When
 *   the learner is new the page shows honest zero states with a gentle nudge to
 *   start, not fake-alive placeholder numbers.
 *
 * What makes it feel alive:
 *   - The streak ring fills in and the headline numbers count up on mount
 *     (framer-motion). Both respect prefers-reduced-motion: when the person
 *     asks for less motion the ring lands full and the numbers show their final
 *     value with no animation.
 *   - Stat icons sit inside <AmbientIcon> for a calm, never-ending idle motion.
 *   - <AmbientField> paints the quiet library-at-night atmosphere behind it all.
 *
 * Auth:
 *   Reads the same userId pattern the Learn hub and Classroom use: the signed-in
 *   user id, or a stable per-role bypass id in dev bypass. A null id makes
 *   getMomentum return the honest empty model, so the page still renders.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Trophy,
  Stack,
  Target,
  Repeat,
  ArrowRight,
  Lock,
  CheckCircle,
  BookOpen,
  Books,
  Wrench,
  CalendarCheck,
  Medal,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { getMomentum, type Momentum, type Achievement } from '../../data/momentum';
import { AmbientField, AmbientIcon } from '../../components/motion';
import './Momentum.css';

// Mirror the Learn hub and Classroom: a signed-out demo user still gets a
// stable, per-role identity so their streak and points read consistently.
function bypassUserId(role: string | null | undefined): string {
  return `bypass-${role ?? 'guest'}`;
}

// Map the achievement catalog's icon names to real Phosphor components. Every
// name here is one the momentum store emits; unknown names fall back to Medal so
// a new badge never renders an empty box.
const ACHIEVEMENT_ICONS: Record<string, Icon> = {
  BookOpen,
  Flame,
  Stack,
  Books,
  Target,
  Wrench,
  CalendarCheck,
  Medal,
};

function achievementIcon(name?: string): Icon {
  return (name && ACHIEVEMENT_ICONS[name]) || Medal;
}

/* ── Count-up number ──
 *
 * Animates from 0 to the target on mount, then holds. When the person prefers
 * reduced motion we skip the animation and render the final value at once. The
 * value never animates layout: it is plain text inside a fixed-size cell. */
function CountUp({ value, reduced }: { value: number; reduced: boolean }) {
  const mv = useMotionValue(reduced ? value : 0);
  const rounded = useTransform(mv, (n) => Math.round(n));

  useEffect(() => {
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration: 1.1,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [value, reduced, mv]);

  return <motion.span>{rounded}</motion.span>;
}

/* ── Streak ring ──
 *
 * A circular gauge. The fill shows progress toward a seven-day week so a short
 * streak still reads as visible motion, and any streak of a full week or more
 * shows a complete ring. The arc animates in on mount with strokeDashoffset
 * (transform-friendly, never re-flows). Reduced motion lands it full at once. */
const RING_SIZE = 168;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;
const STREAK_WEEK = 7;

function StreakRing({
  streakDays,
  reduced,
}: {
  streakDays: number;
  reduced: boolean;
}) {
  // Fraction of a week the streak fills, capped at one full ring.
  const fraction = Math.min(streakDays / STREAK_WEEK, 1);
  const targetOffset = RING_CIRC * (1 - fraction);

  const offset: MotionValue<number> = useMotionValue(
    reduced ? targetOffset : RING_CIRC
  );

  useEffect(() => {
    if (reduced) {
      offset.set(targetOffset);
      return;
    }
    const controls = animate(offset, targetOffset, {
      duration: 1.2,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [targetOffset, reduced, offset]);

  return (
    <div
      className="mom-ring"
      style={{ width: RING_SIZE, height: RING_SIZE }}
      role="img"
      aria-label={
        streakDays > 0
          ? `Current streak: ${streakDays} ${streakDays === 1 ? 'day' : 'days'} in a row.`
          : 'No streak yet. Finish a lesson today to start one.'
      }
    >
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="mom-ring__svg"
        aria-hidden="true"
      >
        <circle
          className="mom-ring__track"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <motion.circle
          className="mom-ring__fill"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          strokeWidth={RING_STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={RING_CIRC}
          style={{ strokeDashoffset: offset }}
          // Start the arc at twelve o'clock and run clockwise.
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </svg>

      <div className="mom-ring__center">
        <AmbientIcon motion="flicker" className="mom-ring__flame">
          <Flame
            size={26}
            weight={streakDays > 0 ? 'fill' : 'regular'}
            className={streakDays > 0 ? 'mom-ring__flame-on' : 'mom-ring__flame-off'}
          />
        </AmbientIcon>
        <span className="mom-ring__count">
          <CountUp value={streakDays} reduced={reduced} />
        </span>
        <span className="mom-ring__label">
          {streakDays === 1 ? 'day in a row' : 'days in a row'}
        </span>
      </div>
    </div>
  );
}

/* ── Stat tile ──
 *
 * One small card: an idle-animated icon, a big value, and a plain label. The
 * value counts up when given a number; a string value (like "Level 3") renders
 * as-is. */
function StatTile({
  icon: IconCmp,
  motionKind,
  delay,
  value,
  suffix,
  label,
  reduced,
}: {
  icon: Icon;
  motionKind: 'sway' | 'flicker' | 'drift' | 'breathe';
  delay: number;
  value: number;
  suffix?: string;
  label: string;
  reduced: boolean;
}) {
  return (
    <div className="mom-stat">
      <span className="mom-stat__icon">
        <AmbientIcon motion={motionKind} delay={delay}>
          <IconCmp size={22} weight="bold" />
        </AmbientIcon>
      </span>
      <span className="mom-stat__value">
        <CountUp value={value} reduced={reduced} />
        {suffix ? <span className="mom-stat__suffix">{suffix}</span> : null}
      </span>
      <span className="mom-stat__label">{label}</span>
    </div>
  );
}

export default function Momentum() {
  const { user, isBypass, bypassRole } = useAuth();
  const reduced = useReducedMotion() ?? false;
  const userId = user?.id ?? (isBypass ? bypassUserId(bypassRole) : null);

  const [data, setData] = useState<Momentum | null>(null);
  const [loading, setLoading] = useState(true);
  const liveRef = useRef(true);

  useEffect(() => {
    liveRef.current = true;
    setLoading(true);
    getMomentum(userId).then((m) => {
      if (!liveRef.current) return;
      setData(m);
      setLoading(false);
    });
    return () => {
      liveRef.current = false;
    };
  }, [userId]);

  // Level progress. We show how far the learner is between the points that
  // started this level and the points the next level needs. At the top level
  // the bar reads full. All derived from the real xp + nextLevelXp.
  const levelProgress = useMemo(() => {
    if (!data) return { pct: 0, toNext: 0, atMax: false };
    const atMax = data.xp >= data.nextLevelXp;
    if (atMax) return { pct: 100, toNext: 0, atMax: true };
    const span = data.nextLevelXp; // points_required of the next level
    const pct = span > 0 ? Math.min(Math.round((data.xp / span) * 100), 100) : 0;
    return { pct, toNext: Math.max(data.nextLevelXp - data.xp, 0), atMax: false };
  }, [data]);

  const earned = useMemo<Achievement[]>(
    () => (data ? data.achievements.filter((a) => a.earned) : []),
    [data]
  );
  const locked = useMemo<Achievement[]>(
    () => (data ? data.achievements.filter((a) => !a.earned) : []),
    [data]
  );

  if (loading || !data) {
    return (
      <div className="momentum">
        <AmbientField density="low" tone="teal" />
        <div className="mom-loading" role="status" aria-live="polite">
          <span className="mom-loading__dot" />
          <p>Reading your progress.</p>
        </div>
      </div>
    );
  }

  const isNew =
    data.streakDays === 0 &&
    data.xp === 0 &&
    data.modulesCompleted === 0 &&
    data.masteryAvg === 0 &&
    earned.length === 0;

  const modulesPct =
    data.totalModules > 0
      ? Math.min(Math.round((data.modulesCompleted / data.totalModules) * 100), 100)
      : 0;

  return (
    <div className="momentum">
      <AmbientField density="med" tone="coral" />

      <header className="mom-header">
        <p className="mom-kicker">Your momentum</p>
        <h1 className="mom-title">Keep the streak going.</h1>
        <p className="mom-sub">
          This is where your effort adds up. Finish a lesson, keep your streak, and
          watch the numbers climb. Everything here comes from what you have actually
          done.
        </p>
      </header>

      {isNew && (
        <div className="mom-firstrun">
          <p className="mom-firstrun__title">You are just getting started.</p>
          <p className="mom-firstrun__sub">
            Finish your first lesson today and your streak begins. Your points,
            level, and first achievement all start from that one step.
          </p>
          <Link to="/community/classroom" className="mom-cta mom-cta--primary">
            Start a lesson <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      )}

      {/* Top row: the streak ring next to the level + points block. */}
      <section className="mom-top">
        <div className="mom-panel mom-panel--streak">
          <StreakRing streakDays={data.streakDays} reduced={reduced} />
          <p className="mom-streak-note">
            {data.streakDays === 0
              ? 'Finish a lesson today to light the first day.'
              : data.streakDays < STREAK_WEEK
                ? `${STREAK_WEEK - data.streakDays} more ${
                    STREAK_WEEK - data.streakDays === 1 ? 'day' : 'days'
                  } to a full week.`
                : 'A full week and counting. Strong work.'}
          </p>
        </div>

        <div className="mom-panel mom-panel--level">
          <div className="mom-level-head">
            <span className="mom-level-icon">
              <AmbientIcon motion="sway" delay={0.2}>
                <Trophy size={24} weight="fill" />
              </AmbientIcon>
            </span>
            <div className="mom-level-text">
              <span className="mom-level-name">{data.levelName}</span>
              <span className="mom-level-rank">Level {data.level}</span>
            </div>
            <span className="mom-level-xp">
              <CountUp value={data.xp} reduced={reduced} />
              <span className="mom-level-xp-unit"> points</span>
            </span>
          </div>

          <div
            className="mom-bar"
            role="progressbar"
            aria-valuenow={levelProgress.pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={
              levelProgress.atMax
                ? 'Top level reached.'
                : `${levelProgress.toNext} points to the next level.`
            }
          >
            <motion.span
              className="mom-bar__fill"
              initial={{ scaleX: reduced ? levelProgress.pct / 100 : 0 }}
              animate={{ scaleX: levelProgress.pct / 100 }}
              transition={reduced ? { duration: 0 } : { duration: 1, ease: 'easeOut' }}
            />
          </div>

          <p className="mom-level-foot">
            {levelProgress.atMax
              ? 'You have reached the top level. Nicely done.'
              : `${levelProgress.toNext} ${
                  levelProgress.toNext === 1 ? 'point' : 'points'
                } to the next level.`}
          </p>
        </div>
      </section>

      {/* Stat tiles: modules, mastery, and a count of what is due. */}
      <section className="mom-stats" aria-label="Your learning stats">
        <StatTile
          icon={Stack}
          motionKind="sway"
          delay={0}
          value={data.modulesCompleted}
          suffix={data.totalModules > 0 ? ` / ${data.totalModules}` : undefined}
          label={data.totalModules > 0 ? 'lessons finished' : 'lessons finished so far'}
          reduced={reduced}
        />
        <StatTile
          icon={Target}
          motionKind="breathe"
          delay={0.3}
          value={data.masteryAvg}
          suffix="%"
          label="average mastery score"
          reduced={reduced}
        />
        <StatTile
          icon={Trophy}
          motionKind="flicker"
          delay={0.6}
          value={earned.length}
          suffix={` / ${data.achievements.length}`}
          label="achievements earned"
          reduced={reduced}
        />
      </section>

      {/* Modules-completed progress bar, only meaningful once a catalog exists. */}
      {data.totalModules > 0 && (
        <section className="mom-panel mom-modules">
          <div className="mom-modules-head">
            <span className="mom-modules-icon">
              <AmbientIcon motion="drift" delay={0.1}>
                <BookOpen size={20} weight="bold" />
              </AmbientIcon>
            </span>
            <span className="mom-modules-text">
              <span className="mom-modules-count">{data.modulesCompleted}</span> of{' '}
              {data.totalModules} lessons finished
            </span>
            <span className="mom-modules-pct">{modulesPct}%</span>
          </div>
          <div
            className="mom-bar"
            role="progressbar"
            aria-valuenow={modulesPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.span
              className="mom-bar__fill mom-bar__fill--ocean"
              initial={{ scaleX: reduced ? modulesPct / 100 : 0 }}
              animate={{ scaleX: modulesPct / 100 }}
              transition={reduced ? { duration: 0 } : { duration: 1, ease: 'easeOut' }}
            />
          </div>
        </section>
      )}

      {/* Due reviews call-to-action. Spaced repetition: a quick re-run of a
          finished lesson locks it in. Links to the Classroom, which is the live
          surface that lists what is due (the standalone learn route redirects
          there). Only shown when something is actually due. */}
      {data.dueReviews > 0 ? (
        <section className="mom-review">
          <span className="mom-review__icon">
            <AmbientIcon motion="sway">
              <Repeat size={22} weight="bold" />
            </AmbientIcon>
          </span>
          <div className="mom-review__text">
            <p className="mom-review__title">
              {data.dueReviews} {data.dueReviews === 1 ? 'review' : 'reviews'} due
            </p>
            <p className="mom-review__sub">
              A quick re-run of what you already finished keeps it in long-term
              memory. Best done today.
            </p>
          </div>
          <Link to="/community/classroom" className="mom-cta mom-cta--primary mom-review__cta">
            Review now <ArrowRight size={16} weight="bold" />
          </Link>
        </section>
      ) : (
        !isNew && (
          <section className="mom-review mom-review--clear">
            <span className="mom-review__icon">
              <AmbientIcon motion="flicker">
                <CheckCircle size={22} weight="fill" />
              </AmbientIcon>
            </span>
            <div className="mom-review__text">
              <p className="mom-review__title">No reviews due right now.</p>
              <p className="mom-review__sub">
                You are caught up. Start a new lesson to keep building.
              </p>
            </div>
            <Link to="/community/classroom" className="mom-cta mom-cta--ghost mom-review__cta">
              Browse lessons <ArrowRight size={16} weight="bold" />
            </Link>
          </section>
        )
      )}

      {/* Achievements wall: earned first, then the ones still to come. Earned and
          locked are both read from the real catalog, so the grid is honest. */}
      <section className="mom-ach" aria-label="Achievements">
        <header className="mom-ach__head">
          <h2 className="mom-ach__title">Achievements</h2>
          <span className="mom-ach__count">
            {earned.length} of {data.achievements.length} earned
          </span>
        </header>

        <div className="mom-ach__grid">
          {earned.map((a, i) => {
            const Glyph = achievementIcon(a.icon);
            return (
              <div key={a.id} className="mom-badge mom-badge--earned">
                <span className="mom-badge__icon">
                  <AmbientIcon motion="breathe" delay={(i % 4) * 0.35}>
                    <Glyph size={26} weight="fill" />
                  </AmbientIcon>
                </span>
                <span className="mom-badge__label">{a.label}</span>
                <span className="mom-badge__desc">{a.description}</span>
                <span className="mom-badge__tag mom-badge__tag--earned">
                  <CheckCircle size={12} weight="fill" /> Earned
                </span>
              </div>
            );
          })}

          {locked.map((a) => {
            const Glyph = achievementIcon(a.icon);
            return (
              <div key={a.id} className="mom-badge mom-badge--locked">
                <span className="mom-badge__icon">
                  <Glyph size={26} weight="regular" />
                </span>
                <span className="mom-badge__label">{a.label}</span>
                <span className="mom-badge__desc">{a.description}</span>
                <span className="mom-badge__tag mom-badge__tag--locked">
                  <Lock size={12} weight="bold" /> Not yet
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
