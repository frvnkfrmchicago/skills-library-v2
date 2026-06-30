import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, CaretRight, Sparkle } from '@phosphor-icons/react';
import { useAuth } from '../../context/useAuth';
import {
  STUDY_HALL_TAGLINE,
  STUDY_HALL_LOOP,
  ACTIVATION_MILESTONES,
  WELCOME_QUESTION,
} from '../../data/startHere';
import './StartHere.css';

/**
 * Start Here — the first place a new member lands.
 *
 * Three plain sections, top to bottom:
 *   1. A warm hero that says what this place is and what to do first.
 *   2. The five-step loop (Learn, Discuss, Build, Show, Ship) as a simple row
 *      so a beginner sees the whole shape of the platform at a glance.
 *   3. The activation checklist: a few real first actions, each linking to its
 *      real route, with a progress meter that already shows any step the member
 *      has finished (we read the real feature data, not a separate flag).
 *
 * This complements the smaller OnboardingChecklist that lives inside the Feed.
 * That one is a three-step nudge in context; this is the fuller welcome hub.
 * Both read the truth from real data rather than a "click to mark done" flag.
 */
export default function StartHere() {
  const { profile } = useAuth();

  const firstName = useMemo(() => {
    const name = (profile as unknown as { display_name?: string })?.display_name;
    if (!name) return null;
    return name.trim().split(/\s+/)[0] || null;
  }, [profile]);

  // Probe the real feature data once per render. Guarded so the page renders
  // even where localStorage is unavailable (private mode, SSR, etc.).
  const milestones = useMemo(() => {
    const store: Storage | null =
      typeof window !== 'undefined' ? window.localStorage : null;
    return ACTIVATION_MILESTONES.map((m) => ({
      ...m,
      isDone: store ? m.done(store) : false,
    }));
  }, []);

  const total = milestones.length;
  const completed = milestones.filter((m) => m.isDone).length;
  // Endowed-progress: show a small head start so the bar is never fully empty
  // for a brand-new member. The text count stays honest (X of N).
  const rawPct = (completed / total) * 100;
  const displayPct = completed === 0 ? 8 : rawPct;
  const allDone = completed === total;

  return (
    <div className="start-here">
      {/* ── Hero ── */}
      <header className="start-here__hero">
        <span className="start-here__eyebrow">
          <Sparkle size={14} weight="fill" />
          Start here
        </span>
        <h1 className="start-here__title">
          {firstName ? `Welcome, ${firstName}.` : 'Welcome.'} Here is how this
          works.
        </h1>
        <p className="start-here__lede">{STUDY_HALL_TAGLINE}</p>
        <a href="#start-here-checklist" className="start-here__cta">
          See your first steps
          <ArrowRight size={16} weight="bold" />
        </a>
      </header>

      {/* ── The five-step loop ── */}
      <section className="start-here__loop" aria-label="How the Study Hall works">
        <h2 className="start-here__section-title">The loop, start to finish</h2>
        <ol className="start-here__steps">
          {STUDY_HALL_LOOP.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <li key={step.id} className="start-here__step">
                <span className="start-here__step-icon" aria-hidden="true">
                  <StepIcon size={22} weight="duotone" />
                </span>
                <span className="start-here__step-name">
                  <span className="start-here__step-num">{i + 1}</span>
                  {step.name}
                </span>
                <span className="start-here__step-blurb">{step.blurb}</span>
                {i < STUDY_HALL_LOOP.length - 1 && (
                  <CaretRight
                    size={16}
                    weight="bold"
                    className="start-here__step-arrow"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* ── Activation checklist ── */}
      <section
        id="start-here-checklist"
        className="start-here__checklist"
        aria-label="Your first steps"
      >
        <div className="start-here__checklist-head">
          <div>
            <h2 className="start-here__section-title">Your first steps</h2>
            <p className="start-here__checklist-sub">
              Five small things. Most members finish them in about ten minutes.
            </p>
          </div>
          <span className="start-here__count" aria-live="polite">
            {completed} of {total} done
          </span>
        </div>

        <div
          className="start-here__meter"
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${completed} of ${total} first steps done`}
        >
          <span
            className="start-here__meter-fill"
            style={{ width: `${displayPct}%` }}
          />
        </div>

        {allDone && (
          <p className="start-here__done-note">
            <Check size={16} weight="bold" />
            That is all of them. You are set up. The rest is up to you.
          </p>
        )}

        <ul className="start-here__items">
          {milestones.map((m) => {
            const ItemIcon = m.icon;
            return (
              <li
                key={m.id}
                className={`start-here__item${m.isDone ? ' is-done' : ''}`}
              >
                <span className="start-here__item-mark" aria-hidden="true">
                  {m.isDone ? (
                    <Check size={16} weight="bold" />
                  ) : (
                    <ItemIcon size={18} weight="duotone" />
                  )}
                </span>
                <div className="start-here__item-body">
                  <span className="start-here__item-label">{m.label}</span>
                  <span className="start-here__item-desc">{m.description}</span>
                </div>
                <Link
                  to={m.to}
                  className={`start-here__item-cta${
                    m.isDone ? ' is-secondary' : ''
                  }`}
                >
                  {m.isDone ? 'Open again' : m.ctaLabel}
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── One question to get them talking ── */}
      <section className="start-here__question" aria-label="A question for you">
        <span className="start-here__question-eyebrow">One question</span>
        <p className="start-here__question-text">{WELCOME_QUESTION}</p>
        <Link to="/community" className="start-here__question-cta">
          Answer it in the Forum
          <ArrowRight size={15} weight="bold" />
        </Link>
      </section>
    </div>
  );
}
