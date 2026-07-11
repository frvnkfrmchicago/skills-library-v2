/* ═══ ArchetypeQuiz — professional identity quiz + result reveal ═══
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 6
 *
 * The "identify the type of professional you are" experience. A short,
 * plain-language quiz (intro → questions → reveal) that scores the member
 * into one of five professional archetypes and persists the result. The
 * reveal pipes straight into the portfolio identity banner — the 2026
 * "quiz unlocks a personalized surface" loop.
 *
 * Skills: onboarding-designing, ux-designing, interactive-animating.
 * Librarians: onboarding-librarian, gamification-librarian.
 * 2026: outgrow personality-quiz patterns · 16Personalities reveal model.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkle, ArrowsClockwise } from '@phosphor-icons/react';
import {
  ARCHETYPE_QUESTIONS,
  ARCHETYPES,
  scoreArchetype,
  saveArchetypeResult,
  type ArchetypeResult,
} from '../../data/archetypeStore';
import './ArchetypeQuiz.css';

type Phase = 'intro' | 'quiz' | 'reveal';

export default function ArchetypeQuiz({
  userId,
  onComplete,
}: {
  userId: string | null;
  onComplete?: (result: ArchetypeResult) => void;
}) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ArchetypeResult | null>(null);

  const q = ARCHETYPE_QUESTIONS[idx];
  const total = ARCHETYPE_QUESTIONS.length;
  const answered = answers[q?.id] !== undefined;

  function choose(optionIdx: number) {
    setAnswers((prev) => ({ ...prev, [q.id]: optionIdx }));
  }

  async function next() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      return;
    }
    const res = scoreArchetype(answers);
    setResult(res);
    setPhase('reveal');
    if (userId) await saveArchetypeResult(userId, res);
    onComplete?.(res);
  }

  function restart() {
    setAnswers({});
    setIdx(0);
    setResult(null);
    setPhase('quiz');
  }

  /* ── Intro ── */
  if (phase === 'intro') {
    return (
      <div className="archetype-quiz archetype-quiz--intro">
        <Sparkle size={32} weight="duotone" className="archetype-quiz__intro-icon" />
        <h2>What kind of professional are you?</h2>
        <p>
          Six quick questions. No wrong answers — just the version that sounds most like you.
          You'll get your professional archetype and how to lean into it.
        </p>
        <button className="btn btn--primary" onClick={() => setPhase('quiz')}>
          Start <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  /* ── Reveal ── */
  if (phase === 'reveal' && result) {
    const a = ARCHETYPES[result.primary];
    const secondary = result.secondary ? ARCHETYPES[result.secondary] : null;
    const axes = Object.entries(result.scores).sort((x, y) => y[1] - x[1]);
    return (
      <motion.div
        className="archetype-quiz archetype-quiz--reveal"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ ['--reveal-accent' as string]: a.accentVar }}
      >
        <span className="archetype-quiz__reveal-eyebrow">Your archetype</span>
        <h2 className="archetype-quiz__reveal-name">{a.label}</h2>
        <p className="archetype-quiz__reveal-tagline">{a.tagline}</p>
        <p className="archetype-quiz__reveal-desc">{a.description}</p>

        <div className="archetype-quiz__bars">
          {axes.map(([axis, score]) => (
            <div className="archetype-quiz__bar-row" key={axis}>
              <span className="archetype-quiz__bar-label">{ARCHETYPES[axisToKey(axis)].label.replace('The ', '')}</span>
              <div className="archetype-quiz__bar-track">
                <motion.div
                  className="archetype-quiz__bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>
              <span className="archetype-quiz__bar-val">{score}</span>
            </div>
          ))}
        </div>

        <div className="archetype-quiz__strengths">
          <h3>You shine at</h3>
          <ul>{a.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>

        <div className="archetype-quiz__edge">
          <strong>Growth edge:</strong> {a.growthEdge}
        </div>

        {secondary && (
          <p className="archetype-quiz__secondary">
            With a <strong>{secondary.label.replace('The ', '')}</strong> streak.
          </p>
        )}

        <button className="btn btn--ghost btn--sm" onClick={restart}>
          <ArrowsClockwise size={14} /> Retake
        </button>
      </motion.div>
    );
  }

  /* ── Quiz ── */
  return (
    <div className="archetype-quiz">
      <div className="archetype-quiz__progress">
        <div className="archetype-quiz__progress-fill" style={{ width: `${((idx + (answered ? 1 : 0)) / total) * 100}%` }} />
      </div>
      <span className="archetype-quiz__counter">Question {idx + 1} of {total}</span>

      <motion.div
        key={q.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h2 className="archetype-quiz__prompt">{q.prompt}</h2>
        <div className="archetype-quiz__options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`archetype-quiz__option ${answers[q.id] === i ? 'is-selected' : ''}`}
              onClick={() => choose(i)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="archetype-quiz__nav">
        {idx > 0 && (
          <button className="btn btn--ghost btn--sm" onClick={() => setIdx((i) => i - 1)}>
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <button className="btn btn--primary btn--sm" disabled={!answered} onClick={next}>
          {idx < total - 1 ? 'Next' : 'See my archetype'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* Map an axis key back to its archetype key for label lookup. */
function axisToKey(axis: string): keyof typeof ARCHETYPES {
  const map: Record<string, keyof typeof ARCHETYPES> = {
    build: 'builder',
    strategy: 'strategist',
    story: 'storyteller',
    research: 'researcher',
    operate: 'operator',
  };
  return map[axis] ?? 'builder';
}
