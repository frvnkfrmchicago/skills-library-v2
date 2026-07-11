/* ═══ /community/learn/:slug — Lesson Player (Module Reader) ═══
 * 2026 microlearning unit: one concept, 3–7 min, then a check.
 * Single scrolling reader — Objective → Lesson → Reflect/Check → Quiz →
 * Key-term Match → Project → Complete. Top progress bar tracks sections done.
 * Completion reuses the existing XP path (completeModule + recordStep +
 * awardAchievement + track). The fullscreen Quiz/Match overlays reuse the
 * app's own MCQ interaction (QuizCard) and tactile match (MatchGame).
 *
 * Skills: frontend-architecting, gamification-design, interactive-animating.
 * Librarians: frontend-librarian, gamification-librarian.
 * 2026: disco.co AI microlearning · muz.li dark-mode tokens & hierarchy.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, Clock, Sparkles, Check, ExternalLink, MessageCircle, Trophy, X,
  BookOpen, MessageSquare, ListChecks, Shapes, Hammer, ChevronRight,
} from 'lucide-react';
import {
  getModuleBySlug,
  recordStep,
  completeModule,
  isModuleCompleted,
  awardAchievement,
} from '../../data/learnStore';
import {
  recordQuizAttempt,
  commitQuizScore,
  MASTERY_THRESHOLD,
} from '../../data/masteryStore';
import { askTutor } from '../../data/tutor';
import { useAuth } from '../../context/useAuth';
import type { LearnModule, AchievementBadge } from '../../types/learn';
import SharePrompt from '../../components/learn/SharePrompt';
import WhatsNextPanel from '../../components/learn/WhatsNextPanel';
import { track } from '../../lib/analytics';
import confetti from 'canvas-confetti';
import QuizCard from '../../components/learn/QuizCard';
import MatchGame from '../../components/learn/MatchGame';
import './Module.css';

type Step = 'context' | 'practice' | 'reflect' | 'done';

/** Which reader sections this module actually carries — drives the progress
 *  indicator. We only count what the learner can act on. */
type SectionKey = 'lesson' | 'reflect' | 'quiz' | 'match' | 'project';

function bypassUserId(role: string | null | undefined): string {
  return `bypass-${role ?? 'guest'}`;
}

export default function LearnModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isBypass, bypassRole } = useAuth();

  const [module, setModule] = useState<LearnModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('context');
  const [practiceInput, setPracticeInput] = useState('');
  const [reflectText, setReflectText] = useState('');
  const [done, setDone] = useState(false);
  const [shareSkipped, setShareSkipped] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorMessage, setTutorMessage] = useState('');
  const [tutorThread, setTutorThread] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [tutorBusy, setTutorBusy] = useState(false);
  const [tutorErr, setTutorErr] = useState('');

  // Quiz specific states
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [matchGameActive, setMatchGameActive] = useState(false);

  // Reader progress — sections the learner has marked / acted on.
  const [visited, setVisited] = useState<Set<SectionKey>>(new Set());
  const [quizDone, setQuizDone] = useState(false);
  const [matchDone, setMatchDone] = useState(false);

  const userId = user?.id ?? (isBypass ? bypassUserId(bypassRole) : null);
  // Lane 2 deep-link path: ?share=1 (from the post-completion email) jumps
  // straight to the completion screen with the SharePrompt autofocused.
  const autoShare = searchParams.get('share') === '1';

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    Promise.all([
      getModuleBySlug(slug),
      userId ? isModuleCompleted(userId, '__placeholder__') : Promise.resolve(false),
    ])
      .then(async ([m]) => {
        if (cancelled || !m) {
          setModule(null);
          setLoading(false);
          return;
        }
        setModule(m);
        let alreadyDone = false;
        if (userId) {
          alreadyDone = await isModuleCompleted(userId, m.id);
          setDone(alreadyDone);
          if (alreadyDone) setStep('done');
        }
        // Record entering the module
        if (userId) await recordStep(userId, m.id, 'context');
        setLoading(false);
        // Honor the post-completion email deep link: if ?share=1 and the
        // module was already done, jump straight to the celebration so the
        // SharePrompt is focused without making the member retrace steps.
        if (autoShare && alreadyDone) {
          setStep('done');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, userId, autoShare]);

  function markVisited(key: SectionKey) {
    setVisited((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

  async function handleComplete() {
    if (!module || !userId) {
      // No auth context (e.g. preview) — still advance the reader UI.
      setDone(true);
      setStep('done');
      return;
    }
    await recordStep(userId, module.id, 'reflect', { reflect_text: reflectText });
    await recordStep(userId, module.id, 'complete');
    await completeModule(userId, module.id, module.xp_reward, reflectText);

    // Achievement triggers
    const triggers: AchievementBadge[] = ['first_drill'];
    if (module.type === 'news_drop') triggers.push('first_news_drop');
    if (module.practice_md) triggers.push('first_practice');
    if (reflectText.trim().length > 20) triggers.push('first_reflection');
    for (const badge of triggers) await awardAchievement(userId, badge);

    // Lane 1 + Lane 2 analytics contract: every completion fires
    // module_completed with the slug + xp so the WhatsNextPanel recommender,
    // the post-completion-email Edge Function, and the engagement KPIs all
    // see the same event shape.
    track('module_completed', {
      module_id: module.id,
      module_slug: module.slug,
      module_type: module.type,
      xp_earned: module.xp_reward,
      had_practice: !!module.practice_md,
      had_reflection: reflectText.trim().length > 0,
    });

    setDone(true);
    setStep('done');
  }

  async function sendTutor() {
    if (!module || !tutorMessage.trim()) return;
    const userMsg = { role: 'user' as const, content: tutorMessage.trim() };
    setTutorThread((prev) => [...prev, userMsg]);
    setTutorMessage('');
    setTutorBusy(true);
    setTutorErr('');
    try {
      const { reply } = await askTutor({
        moduleSlug: module.slug,
        message: userMsg.content,
        history: tutorThread.slice(-6),
      });
      setTutorThread((prev) => [...prev, { role: 'assistant', content: reply }]);
      if (userId) await awardAchievement(userId, 'first_tutor_question');
    } catch (err) {
      setTutorErr(err instanceof Error ? err.message : 'Tutor failed.');
    } finally {
      setTutorBusy(false);
    }
  }

  // The ordered list of sections this module actually carries. Lesson is
  // always present; the rest are conditional on the published payload.
  const sectionMeta = useMemo(() => {
    if (!module) return [] as { key: SectionKey; label: string }[];
    const hasQuiz = !!(module.quiz_questions && module.quiz_questions.length > 0);
    const hasMatch = !!(module.match_pairs && module.match_pairs.length > 0);
    return [
      { key: 'lesson' as const, label: 'Lesson' },
      ...(module.reflect_question ? [{ key: 'reflect' as const, label: 'Check' }] : []),
      ...(hasQuiz ? [{ key: 'quiz' as const, label: 'Quiz' }] : []),
      ...(hasMatch ? [{ key: 'match' as const, label: 'Match' }] : []),
      ...(module.practice_md ? [{ key: 'project' as const, label: 'Project' }] : []),
    ];
  }, [module]);

  const doneCount = useMemo(() => {
    let n = 0;
    for (const s of sectionMeta) {
      if (s.key === 'quiz') { if (quizDone) n++; continue; }
      if (s.key === 'match') { if (matchDone) n++; continue; }
      if (visited.has(s.key)) n++;
    }
    return n;
  }, [sectionMeta, visited, quizDone, matchDone]);

  const totalSections = sectionMeta.length || 1;
  const pct = done ? 100 : Math.round((doneCount / totalSections) * 100);

  // Lesson comprehension gate. The lesson is NO LONGER auto-marked on mount —
  // that let learners reach the quiz with zero reading ("quizzes come too
  // fast"). Instead the learner confirms they've read it, and the
  // assessment sections (Quiz / Match / Project) stay locked until then.
  // 2026 mastery practice: gate assessment behind demonstrated comprehension.
  const lessonRead = visited.has('lesson');
  const lessonEndRef = useRef<HTMLDivElement | null>(null);

  // Soft auto-unlock: once the learner scrolls the end-of-lesson marker into
  // view, we count the lesson as read. This rewards actually reaching the
  // bottom without forcing an extra click for engaged readers.
  useEffect(() => {
    const el = lessonEndRef.current;
    if (!el || lessonRead) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          markVisited('lesson');
          obs.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [lessonRead, module]);

  if (loading) {
    return <div className="learn-module learn-module--loading">Loading module…</div>;
  }

  if (!module) {
    return (
      <div className="learn-module learn-module--missing">
        <h1>Module not found</h1>
        <p>The module you're looking for doesn't exist or hasn't been published yet.</p>
        <Link to="/community/learn" className="btn btn--primary">
          <ArrowLeft size={14} /> Back to Learn
        </Link>
      </div>
    );
  }

  if (quizActive && module.quiz_questions && module.quiz_questions.length > 0) {
    const questions = module.quiz_questions;
    const currentQuestion = questions[currentQuestionIdx];

    const handleSelectOption = (idx: number) => {
      setSelectedOption(idx);
    };

    const handleCheck = () => {
      if (selectedOption === null) return;
      setIsValidated(true);
      const correct = selectedOption === currentQuestion.correct_option_index;
      setIsCorrect(correct);
      // Persist this answer immediately so per-question analytics survive even
      // if the learner abandons the quiz mid-way. This is the fix for the old
      // behaviour where the score lived only in React state and was lost.
      if (userId) {
        void recordQuizAttempt(userId, module.id, currentQuestion.id, selectedOption, correct);
      }
      if (correct) {
        setQuizScore((s) => s + 1);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
    };

    const handleContinue = () => {
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx((idx) => idx + 1);
        setSelectedOption(null);
        setIsValidated(false);
        setIsCorrect(null);
      } else {
        // Quiz finished: persist the rolled-up score + schedule the spaced
        // -repetition review, then count it toward progress and return to the
        // reader. The final question's result is already in quizScore because
        // handleCheck ran before this Continue.
        if (userId) {
          void commitQuizScore(userId, module.id, quizScore, questions.length);
        }
        setQuizActive(false);
        setQuizDone(true);
        markVisited('quiz');
      }
    };

    const handleClose = () => {
      setQuizActive(false);
      setCurrentQuestionIdx(0);
      setSelectedOption(null);
      setIsValidated(false);
      setIsCorrect(null);
    };

    return (
      <div className="learn-module learn-module--quiz-fullscreen">
        <header className="quiz-header">
          <div className="quiz-header__left">
            <span className="quiz-header__title">{module.title}</span>
            <span className="quiz-header__counter">Question {currentQuestionIdx + 1} of {questions.length}</span>
          </div>
          <button className="quiz-header__close" onClick={handleClose} aria-label="Exit Quiz">
            <X size={20} />
          </button>
        </header>

        <div className="quiz-progress-bar">
          <div
            className="quiz-progress-bar__fill"
            style={{ width: `${((currentQuestionIdx + (isValidated ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <main className="quiz-main">
          <QuizCard
            question={currentQuestion}
            selectedOptionIndex={selectedOption}
            onSelectOption={handleSelectOption}
            isLocked={isValidated}
          />
        </main>

        <div className={`quiz-footer ${isValidated ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}`}>
          <div className="quiz-footer__content">
            {!isValidated ? (
              <div className="quiz-footer__check-mode">
                <p className="quiz-footer__status">Select the correct answer to check your knowledge.</p>
                <button
                  className="btn btn--primary"
                  disabled={selectedOption === null}
                  onClick={handleCheck}
                >
                  Check Answer
                </button>
              </div>
            ) : (
              <div className="quiz-footer__result-mode">
                <div className="quiz-footer__result-message">
                  {isCorrect ? (
                    <span className="quiz-footer__result-tag correct">Correct. Nicely done.</span>
                  ) : (
                    <span className="quiz-footer__result-tag incorrect">Not quite.</span>
                  )}
                  <p className="quiz-footer__explanation">{currentQuestion.explanation}</p>
                </div>
                <button className="btn btn--primary" onClick={handleContinue}>
                  {currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'Back to lesson'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (matchGameActive && module.match_pairs && module.match_pairs.length > 0) {
    const handleMatchGameComplete = () => {
      setMatchGameActive(false);
      setMatchDone(true);
      markVisited('match');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 }
      });
    };

    return (
      <div className="learn-module learn-module--quiz-fullscreen">
        <header className="quiz-header">
          <div className="quiz-header__left">
            <span className="quiz-header__title">{module.title}</span>
            <span className="quiz-header__counter">Key-term match</span>
          </div>
          <button className="quiz-header__close" onClick={() => setMatchGameActive(false)} aria-label="Exit Game">
            <X size={20} />
          </button>
        </header>

        <main className="quiz-main" style={{ padding: 'var(--space-xl) var(--space-md)' }}>
          <MatchGame
            pairs={module.match_pairs}
            onComplete={handleMatchGameComplete}
          />
        </main>
      </div>
    );
  }

  const hasQuiz = !!(module.quiz_questions && module.quiz_questions.length > 0);
  const hasMatch = !!(module.match_pairs && module.match_pairs.length > 0);
  const quizCount = module.quiz_questions?.length ?? 0;
  const matchCount = module.match_pairs?.length ?? 0;

  // ── Completion screen ──────────────────────────────────────────────────
  if (step === 'done' || done) {
    return (
      <div className="learn-module">
        <header className="learn-module__head">
          <button className="learn-module__back" onClick={() => navigate('/community/learn')}>
            <ArrowLeft size={16} /> Learn
          </button>
          <div className="learn-module__meta">
            <span className="learn-module__role">{module.required_role}</span>
            <span className="learn-module__min"><Clock size={12} /> {module.estimated_minutes} min</span>
            <span className="learn-module__xp">+{module.xp_reward} XP</span>
          </div>
        </header>

        <section className="learn-module__section learn-module__done">
          <div className="learn-module__done-icon">
            <Trophy size={36} strokeWidth={1.5} />
          </div>
          <h2>Module complete</h2>
          {hasQuiz && quizDone ? (
            <p>
              Quiz score <strong className="learn-module__mono">{quizScore}/{quizCount}</strong>{' '}
              ({Math.round((quizScore / (quizCount || 1)) * 100)}%) · +{module.xp_reward} XP earned · streak bumped.
            </p>
          ) : (
            <p>+{module.xp_reward} XP earned · streak bumped.</p>
          )}

          {!shareSkipped && (
            <SharePrompt
              moduleId={module.id}
              moduleSlug={module.slug}
              moduleTitle={module.title}
              autoFocus={autoShare}
              onSkip={() => setShareSkipped(true)}
            />
          )}

          <WhatsNextPanel
            currentModuleId={module.id}
            currentModuleTags={module.tags}
          />

          <div className="learn-module__done-actions">
            <Link to="/community/learn" className="btn btn--ghost">Back to Learn</Link>
          </div>
        </section>
      </div>
    );
  }

  // ── The reader ─────────────────────────────────────────────────────────
  let secNo = 0;
  const stepNo = () => String(++secNo).padStart(2, '0');

  return (
    <div className="learn-module">
      <header className="learn-module__head">
        <button className="learn-module__back" onClick={() => navigate('/community/learn')}>
          <ArrowLeft size={16} /> Learn
        </button>
        <div className="learn-module__meta">
          <span className="learn-module__role">{module.required_role}</span>
          <span className="learn-module__min"><Clock size={12} /> {module.estimated_minutes} min</span>
          <span className="learn-module__xp">+{module.xp_reward} XP</span>
        </div>
      </header>

      <p className="learn-module__hook">{module.hook}</p>
      <h1 className="learn-module__title">{module.title}</h1>

      {/* Objective — the single concept this unit teaches */}
      <p className="learn-module__objective">
        <Sparkles size={15} /> {module.objective}
      </p>

      {/* Top progress indicator — sections done / total */}
      <div className="learn-module__progress" aria-label="Lesson progress">
        <div className="learn-module__progress-row">
          <span className="learn-module__progress-label">Progress</span>
          <span className="learn-module__progress-count">
            <span className="learn-module__mono">{doneCount}/{totalSections}</span> sections
          </span>
        </div>
        <div className="learn-module__progress-track">
          <div className="learn-module__progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="learn-module__progress-pips">
          {sectionMeta.map((s) => {
            const isDone =
              s.key === 'quiz' ? quizDone :
              s.key === 'match' ? matchDone :
              visited.has(s.key);
            return (
              <span
                key={s.key}
                className={`learn-module__pip ${isDone ? 'is-done' : ''}`}
              >
                {isDone && <Check size={11} strokeWidth={3} />}
                {s.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* 1 · Lesson body (context_md) */}
      <section className="learn-module__section">
        <div className="learn-module__section-head">
          <span className="learn-module__section-no">{stepNo()}</span>
          <BookOpen size={16} className="learn-module__section-ico" />
          <h2 className="learn-module__section-title">Lesson</h2>
        </div>
        <div className="learn-module__prose">
          <Markdown remarkPlugins={[remarkGfm]}>{module.context_md}</Markdown>
        </div>
        {module.resources && module.resources.length > 0 && (
          <div className="learn-module__resources">
            <h3>Resources</h3>
            <ul>
              {module.resources.map((r) => (
                <li key={r.id}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    <span className="learn-module__resource-kind">{r.kind}</span>
                    <span className="learn-module__resource-label">{r.label}</span>
                    <ExternalLink size={12} />
                  </a>
                  {r.description && <p className="learn-module__resource-desc">{r.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* End-of-lesson marker + explicit confirm. Scrolling this into view
            (or clicking it) unlocks the assessment sections below. */}
        <div className="learn-module__lesson-end" ref={lessonEndRef}>
          <button
            type="button"
            className={`learn-module__softbtn ${lessonRead ? 'is-done' : ''}`}
            onClick={() => markVisited('lesson')}
          >
            {lessonRead ? <><Check size={13} strokeWidth={3} /> Lesson read</> : "I've read this"}
          </button>
        </div>
      </section>

      {/* 2 · Reflect / check prompt */}
      {module.reflect_question && (
        <section className="learn-module__section learn-module__card">
          <div className="learn-module__section-head">
            <span className="learn-module__section-no">{stepNo()}</span>
            <MessageSquare size={16} className="learn-module__section-ico" />
            <h2 className="learn-module__section-title">Check yourself</h2>
          </div>
          <p className="learn-module__reflect-q">{module.reflect_question}</p>
          <textarea
            rows={3}
            value={reflectText}
            onChange={(e) => setReflectText(e.target.value)}
            onBlur={() => reflectText.trim() && markVisited('reflect')}
            placeholder="A sentence is enough — this anchors the concept."
            className="learn-module__reflect-input"
          />
          <div className="learn-module__section-foot">
            <button
              type="button"
              className="learn-module__softbtn"
              onClick={() => markVisited('reflect')}
            >
              {visited.has('reflect') ? <><Check size={13} strokeWidth={3} /> Noted</> : 'Mark reflected'}
            </button>
          </div>
        </section>
      )}

      {/* 3 · Interactive quiz — reuses the app's MCQ overlay (QuizCard) */}
      {hasQuiz && (
        <section className="learn-module__section learn-module__card">
          <div className="learn-module__section-head">
            <span className="learn-module__section-no">{stepNo()}</span>
            <ListChecks size={16} className="learn-module__section-ico" />
            <h2 className="learn-module__section-title">Quiz</h2>
            {quizDone && (
              <span className="learn-module__chip learn-module__chip--done">
                <Check size={11} strokeWidth={3} />
                <span className="learn-module__mono">{quizScore}/{quizCount}</span>
              </span>
            )}
          </div>
          <p className="learn-module__section-blurb">
            {!lessonRead
              ? 'Read the lesson first — the quiz unlocks once you reach the end.'
              : quizDone
              ? `You cleared the quiz (${MASTERY_THRESHOLD}%+ marks the concept mastered). Replay any time to lock it in.`
              : `${quizCount} quick question${quizCount === 1 ? '' : 's'}. Answer, then see why.`}
          </p>
          <button
            className="btn btn--primary learn-module__advance"
            disabled={!lessonRead}
            onClick={() => {
              setCurrentQuestionIdx(0);
              setSelectedOption(null);
              setIsValidated(false);
              setIsCorrect(null);
              if (!quizDone) setQuizScore(0);
              setQuizActive(true);
            }}
          >
            {!lessonRead ? 'Locked' : quizDone ? 'Replay quiz' : 'Start quiz'} <ChevronRight size={15} />
          </button>
        </section>
      )}

      {/* 4 · Key-term match — reuses MatchGame */}
      {hasMatch && (
        <section className="learn-module__section learn-module__card">
          <div className="learn-module__section-head">
            <span className="learn-module__section-no">{stepNo()}</span>
            <Shapes size={16} className="learn-module__section-ico" />
            <h2 className="learn-module__section-title">Key-term match</h2>
            {matchDone && (
              <span className="learn-module__chip learn-module__chip--done">
                <Check size={11} strokeWidth={3} /> Cleared
              </span>
            )}
          </div>
          <p className="learn-module__section-blurb">
            {!lessonRead
              ? 'Read the lesson first — the match unlocks once you reach the end.'
              : `Pair ${matchCount} term${matchCount === 1 ? '' : 's'} with the right definition.`}
          </p>
          <button
            className="btn btn--primary learn-module__advance"
            disabled={!lessonRead}
            onClick={() => setMatchGameActive(true)}
          >
            {!lessonRead ? 'Locked' : matchDone ? 'Replay match' : 'Start match'} <ChevronRight size={15} />
          </button>
        </section>
      )}

      {/* 5 · The project (practice_md) */}
      {module.practice_md && (
        <section className="learn-module__section learn-module__card">
          <div className="learn-module__section-head">
            <span className="learn-module__section-no">{stepNo()}</span>
            <Hammer size={16} className="learn-module__section-ico" />
            <h2 className="learn-module__section-title">Project</h2>
          </div>
          <div className="learn-module__prose">
            <Markdown remarkPlugins={[remarkGfm]}>{module.practice_md}</Markdown>
          </div>
          {module.practice_starter && (
            <div className="learn-module__starter">
              <span className="learn-module__starter-label">Starter</span>
              <pre>{module.practice_starter}</pre>
            </div>
          )}
          <label className="learn-module__field">
            <span>Capture what you tried + what changed (optional)</span>
            <textarea
              rows={5}
              value={practiceInput}
              onChange={(e) => setPracticeInput(e.target.value)}
              onBlur={() => practiceInput.trim() && markVisited('project')}
              placeholder="Paste your prompt + the result, or note what surprised you."
            />
          </label>
          <div className="learn-module__section-foot">
            <button
              type="button"
              className="learn-module__softbtn"
              onClick={() => markVisited('project')}
            >
              {visited.has('project') ? <><Check size={13} strokeWidth={3} /> Logged</> : 'Mark project done'}
            </button>
          </div>
        </section>
      )}

      {/* Complete — fires the existing completion/XP path */}
      <div className="learn-module__complete-bar">
        <div className="learn-module__complete-meta">
          <span className="learn-module__complete-title">
            {doneCount >= totalSections ? 'All sections done' : 'Finish the unit'}
          </span>
          <span className="learn-module__complete-sub">
            <span className="learn-module__mono">{doneCount}/{totalSections}</span> · earns +{module.xp_reward} XP
          </span>
        </div>
        <button className="btn btn--primary learn-module__complete-btn" onClick={handleComplete}>
          <Check size={16} strokeWidth={2.5} /> Mark complete
        </button>
      </div>

      {/* Floating tutor */}
      <button
        type="button"
        className="learn-module__tutor-btn"
        onClick={() => setTutorOpen(!tutorOpen)}
        aria-label="Ask the AI tutor"
      >
        <MessageCircle size={18} />
      </button>
      {tutorOpen && (
        <div className="learn-module__tutor-panel">
          <header>
            <strong>AI Tutor</strong>
            <button onClick={() => setTutorOpen(false)} aria-label="Close">×</button>
          </header>
          <p className="learn-module__tutor-hint">
            Scoped to <strong>{module.title}</strong>. Plain replies. 120 words max.
          </p>
          {tutorThread.length > 0 && (
            <div className="learn-module__tutor-thread">
              {tutorThread.map((m, i) => (
                <div key={i} className={`learn-module__tutor-msg learn-module__tutor-msg--${m.role}`}>
                  {m.content}
                </div>
              ))}
              {tutorBusy && (
                <div className="learn-module__tutor-msg learn-module__tutor-msg--assistant learn-module__tutor-msg--typing">
                  thinking…
                </div>
              )}
            </div>
          )}
          {tutorErr && <p className="learn-module__tutor-err">{tutorErr}</p>}
          <textarea
            rows={3}
            value={tutorMessage}
            onChange={(e) => setTutorMessage(e.target.value)}
            placeholder="Why does this work? Show me an example..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendTutor();
            }}
          />
          <button
            className="btn btn--primary btn--sm"
            onClick={sendTutor}
            disabled={tutorBusy || !tutorMessage.trim()}
          >
            {tutorBusy ? 'Asking…' : 'Ask (⌘+Enter)'}
          </button>
        </div>
      )}
    </div>
  );
}
