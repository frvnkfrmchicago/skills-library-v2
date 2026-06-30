/* Momentum.tsx — the learner's progress screen.
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 6 (Momentum Dashboard)
 * 2026 redesign · Lane 4 (Momentum 2026) — active bento + aurora depth
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
 * What makes it feel alive (the 2026 layer):
 *   - An <AuroraField> drifts slowly behind everything so the dark base has real
 *     depth instead of reading as a flat box.
 *   - The dashboard is an asymmetric bento of <GlowCard> tiles: glass surfaces
 *     with a gradient border that lift and glow on hover (spring).
 *   - The streak ring fills in, the flame flickers, and the headline numbers
 *     count up on mount (framer-motion). The level bar fills from empty.
 *   - The section headline is a kinetic gradient with a slow shine sweep.
 *   - A freshly earned achievement carries a soft unlock shimmer.
 *   All of it respects prefers-reduced-motion: when the person asks for less
 *   motion the ring lands full, the numbers show their final value, the bars
 *   land filled, and the shimmer/shine settle to still.
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
import { AmbientIcon } from '../../components/motion';
import { AuroraField, BentoGrid, BentoTile, GlowCard } from '../../components/ui';
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
const RING_SIZE = 184;
const RING_STROKE = 13;
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
        {/* A coral-to-violet gradient paints the streak arc itself so the gauge
            reads as part of the warm momentum language, not a flat stroke. */}
        <defs>
          <linearGradient id="momRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--cm-salmon)" />
            <stop offset="60%" stopColor="var(--cm-gold)" />
            <stop offset="100%" stopColor="var(--cm-violet)" />
          </linearGradient>
        </defs>
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
        <AmbientIcon
          motion="flicker"
          amplitude="lively"
          className={`mom-ring__flame ${streakDays > 0 ? 'is-lit' : ''}`}
        >
          <Flame
            size={30}
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
 * One bento cell on a GlowCard: an idle-animated icon, a big count-up value, and
 * a plain label. The accent drives the tile's gradient border and hover glow. */
function StatTile({
  icon: IconCmp,
  motionKind,
  accent,
  delay,
  value,
  suffix,
  label,
  reduced,
}: {
  icon: Icon;
  motionKind: 'sway' | 'flicker' | 'drift' | 'breathe';
  accent: 'coral' | 'ocean' | 'violet' | 'gold';
  delay: number;
  value: number;
  suffix?: string;
  label: string;
  reduced: boolean;
}) {
  return (
    <BentoTile accent={accent} className="mom-stat-tile">
      <div className="mom-stat">
        <span className={`mom-stat__icon mom-stat__icon--${accent}`}>
          <AmbientIcon motion={motionKind} amplitude="lively" delay={delay}>
            <IconCmp size={24} weight="bold" />
          </AmbientIcon>
        </span>
        <span className="mom-stat__value">
          <CountUp value={value} reduced={reduced} />
          {suffix ? <span className="mom-stat__suffix">{suffix}</span> : null}
        </span>
        <span className="mom-stat__label">{label}</span>
      </div>
    </BentoTile>
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
        <AuroraField tone="ocean" intensity="soft" />
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
      <AuroraField tone="aurora" intensity="rich" />

      <header className="mom-header">
        <p className="mom-kicker">Your momentum</p>
        <h1 className="mom-title">
          <span className="mom-title__shine">Keep the streak going.</span>
        </h1>
        <p className="mom-sub">
          This is where your effort adds up. Finish a lesson, keep your streak, and
          watch the numbers climb. Everything here comes from what you have actually
          done.
        </p>
      </header>

      {isNew && (
        <GlowCard accent="coral" className="mom-firstrun">
          <p className="mom-firstrun__title">You are just getting started.</p>
          <p className="mom-firstrun__sub">
            Finish your first lesson today and your streak begins. Your points,
            level, and first achievement all start from that one step.
          </p>
          <Link to="/community/classroom" className="mom-cta mom-cta--primary">
            Start a lesson <ArrowRight size={16} weight="bold" />
          </Link>
        </GlowCard>
      )}

      {/* The dashboard as an active bento: a tall streak tile, a wide level tile,
          three stat tiles, the modules bar, and the review call-to-action. Each
          tile is a GlowCard, so it lifts and glows on hover. */}
      <BentoGrid columns={4} className="mom-bento">
        {/* Streak: the focal tile. Tall, so the ring has room to breathe. */}
        <BentoTile accent="coral" span={{ col: 2, row: 2 }} className="mom-tile mom-tile--streak">
          <div className="mom-streak">
            <span className="mom-tile__eyebrow">Current streak</span>
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
        </BentoTile>

        {/* Level + points: a wide tile with a gradient progress bar. */}
        <BentoTile accent="gold" span={{ col: 2 }} className="mom-tile mom-tile--level">
          <div className="mom-level">
            <div className="mom-level-head">
              <span className="mom-level-icon">
                <AmbientIcon motion="sway" amplitude="lively" delay={0.2}>
                  <Trophy size={26} weight="fill" />
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
        </BentoTile>

        {/* Stat tiles: modules, mastery, achievements earned. */}
        <StatTile
          icon={Stack}
          motionKind="sway"
          accent="ocean"
          delay={0}
          value={data.modulesCompleted}
          suffix={data.totalModules > 0 ? ` / ${data.totalModules}` : undefined}
          label={data.totalModules > 0 ? 'lessons finished' : 'lessons finished so far'}
          reduced={reduced}
        />
        <StatTile
          icon={Target}
          motionKind="breathe"
          accent="violet"
          delay={0.3}
          value={data.masteryAvg}
          suffix="%"
          label="average mastery score"
          reduced={reduced}
        />
      </BentoGrid>

      {/* Mastery + modules row: a stat tile next to the modules-completed bar.
          Kept outside the top bento so the bar tile can run full width on its
          own line and stay readable. */}
      <BentoGrid columns={4} className="mom-bento">
        <StatTile
          icon={Trophy}
          motionKind="flicker"
          accent="gold"
          delay={0.6}
          value={earned.length}
          suffix={` / ${data.achievements.length}`}
          label="achievements earned"
          reduced={reduced}
        />

        {/* Modules-completed progress bar, only meaningful once a catalog exists.
            When there is no catalog yet the tile drops out and the achievements
            stat tile sits on its own. */}
        {data.totalModules > 0 && (
          <BentoTile accent="ocean" span={{ col: 2 }} className="mom-tile mom-tile--modules">
            <div className="mom-modules">
              <div className="mom-modules-head">
                <span className="mom-modules-icon">
                  <AmbientIcon motion="drift" amplitude="lively" delay={0.1}>
                    <BookOpen size={22} weight="bold" />
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
            </div>
          </BentoTile>
        )}
      </BentoGrid>

      {/* Due reviews call-to-action. Spaced repetition: a quick re-run of a
          finished lesson locks it in. Links to the Classroom, which is the live
          surface that lists what is due (the standalone learn route redirects
          there). Only shown when something is actually due. */}
      {data.dueReviews > 0 ? (
        <GlowCard accent="ocean" className="mom-review">
          <span className="mom-review__icon">
            <AmbientIcon motion="sway" amplitude="lively">
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
        </GlowCard>
      ) : (
        !isNew && (
          <GlowCard accent="gold" className="mom-review mom-review--clear">
            <span className="mom-review__icon">
              <AmbientIcon motion="flicker" amplitude="lively">
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
          </GlowCard>
        )
      )}

      {/* Achievements wall: earned first, then the ones still to come. Earned and
          locked are both read from the real catalog, so the grid is honest. An
          earned badge carries a soft unlock shimmer; locked badges sit quiet. */}
      <section className="mom-ach" aria-label="Achievements">
        <header className="mom-ach__head">
          <h2 className="mom-ach__title">
            <span className="mom-title__shine">Achievements</span>
          </h2>
          <span className="mom-ach__count">
            {earned.length} of {data.achievements.length} earned
          </span>
        </header>

        <div className="mom-ach__grid">
          {earned.map((a, i) => {
            const Glyph = achievementIcon(a.icon);
            return (
              <GlowCard
                key={a.id}
                accent="coral"
                className="mom-badge mom-badge--earned"
              >
                <span className="mom-badge__shimmer" aria-hidden="true" />
                <span className="mom-badge__icon">
                  <AmbientIcon motion="breathe" amplitude="lively" delay={(i % 4) * 0.35}>
                    <Glyph size={28} weight="fill" />
                  </AmbientIcon>
                </span>
                <span className="mom-badge__label">{a.label}</span>
                <span className="mom-badge__desc">{a.description}</span>
                <span className="mom-badge__tag mom-badge__tag--earned">
                  <CheckCircle size={12} weight="fill" /> Earned
                </span>
              </GlowCard>
            );
          })}

          {locked.map((a) => {
            const Glyph = achievementIcon(a.icon);
            return (
              <GlowCard
                key={a.id}
                accent="ocean"
                className="mom-badge mom-badge--locked"
              >
                <span className="mom-badge__icon">
                  <Glyph size={28} weight="regular" />
                </span>
                <span className="mom-badge__label">{a.label}</span>
                <span className="mom-badge__desc">{a.description}</span>
                <span className="mom-badge__tag mom-badge__tag--locked">
                  <Lock size={12} weight="bold" /> Not yet
                </span>
              </GlowCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
