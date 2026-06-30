/* ═══ UPGRADE.SELF — Content Transformation Engine ═══
 * Feed in raw material (URL, paste, notes) → produces 12 interactive
 * learning formats from study tools to mini-games to practice sessions.
 *
 * Architecture: SourceInput → ContentEngine → OutputGallery → ViewerModal
 * Data: localStorage via notebookStore
 */

import { useState, useCallback, useRef } from 'react';
import {
  TreeStructure,
  Lightning,
  Plus,
  X,
  ArrowLeft,
  Stack as NotebookIcon,
  Trash,
  Link as LinkIcon,
  ClipboardText,
  PencilSimple,
  BookOpenText,
  CheckCircle,
  CaretRight,
  Circle,
  Trophy,
  TerminalWindow,
  ArrowUp,
  ArrowDown,
  ArrowsClockwise,
  NotePencil,
  ArrowRight,
  XCircle,
  Play,
  Square,
  Dot,
} from '@phosphor-icons/react';
import { generateStudyContent, fetchUrlContent } from '../../lib/upgrade-self/aiClient';
import {
  buildCourse,
  type GeneratedCourse,
  type CourseModule,
  type CourseLesson,
} from '../../lib/upgrade-self/courseBuilder';
import {
  createNotebook,
  listNotebooks,
  updateNotebook,
  deleteNotebook,
} from '../../data/notebookStore';
import { upsertModule, publishGeneratedCourse } from '../../data/learnStore';
import type {
  Notebook,
  NotebookSource,
  GeneratedOutput,
  SourceType,
  MicroLessonData,
  BriefingData,
  FlashcardItem,
  DiscussionPrompt,
  ScrambleWord,
  FillBlankSentence,
  SortChallenge,
  CrosswordGrid,
} from '../../types/notebook';
import { OUTPUT_META } from '../../types/notebook';
import type { QuizQuestion, MatchPair } from '../../types/learn';
import './UpgradeSelf.css';

// Generation is LOCAL-FIRST so the tool works with zero backend and any agent's
// source text (Claude Code, Antigravity, anything) churns into a course. Set
// VITE_UPGRADE_SELF_AI=true to ALSO route through the pluggable
// upgrade-self-generate edge function for higher-fidelity output.
const AI_ENABLED = import.meta.env.VITE_UPGRADE_SELF_AI === 'true';

// The Curator's observable steps while it builds a course (HANDOFF agent-presence).
// Terse, present-tense, reads like a log line — the build is observable, not magical.
const CURATOR_STEPS = [
  'Reading your source',
  'Outlining modules',
  'Writing lessons',
  'Building quizzes',
  'Drafting capstone',
  'Course drafted',
];

// ═══ Mini Viewer Components (inline for now) ═══

// ── Micro-Lesson Viewer ──
function MicroLessonViewer({ data }: { data: MicroLessonData }) {
  const [step, setStep] = useState(0);
  const steps = ['Hook', 'Context', 'Practice', 'Reflect'];
  const contents = [data.hook, data.context, data.practice, data.reflect];

  return (
    <div className="us-micro-lesson">
      <div className="us-micro-lesson__progress">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`us-micro-lesson__step ${i < step ? 'is-done' : ''} ${i === step ? 'is-current' : ''}`}
          />
        ))}
      </div>
      <div className="us-micro-lesson__label">{steps[step]}</div>
      <div className="us-micro-lesson__content">{contents[step]}</div>
      {step === 2 && (
        <textarea
          className="us-micro-lesson__textarea"
          placeholder="Write your practice response here..."
        />
      )}
      {step === 3 && (
        <textarea
          className="us-micro-lesson__textarea"
          placeholder="Your reflection..."
        />
      )}
      <div className="us-micro-lesson__nav">
        {step < steps.length - 1 ? (
          <button className="us-micro-lesson__nav-btn" onClick={() => setStep(step + 1)}>
            Continue <ArrowRight size={14} weight="bold" />
          </button>
        ) : (
          <div className="us-complete">
            <div className="us-complete__icon"><CheckCircle size={36} weight="duotone" /></div>
            <div className="us-complete__title">Lesson Complete!</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Flashcard Viewer ──
function FlashcardViewer({ data }: { data: FlashcardItem[] }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<('right' | 'wrong')[]>([]);

  if (idx >= data.length) {
    const correct = results.filter((r) => r === 'right').length;
    return (
      <div className="us-complete">
        <div className="us-complete__icon"><Trophy size={36} weight="duotone" /></div>
        <div className="us-complete__title">Deck Complete!</div>
        <div className="us-complete__score">{correct} / {data.length} mastered</div>
      </div>
    );
  }

  const card = data[idx];
  const advance = (result: 'right' | 'wrong') => {
    setResults((prev) => [...prev, result]);
    setFlipped(false);
    setIdx((i) => i + 1);
  };

  return (
    <div className="us-flashcards">
      <div className="us-flashcard__progress">{idx + 1} of {data.length}</div>
      <div className={`us-flashcard ${flipped ? 'is-flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
        <div className="us-flashcard__inner">
          <div className="us-flashcard__face">
            <div className="us-flashcard__face-label">Term</div>
            <div className="us-flashcard__face-text">{card.front}</div>
          </div>
          <div className="us-flashcard__face us-flashcard__face--back">
            <div className="us-flashcard__face-label">Definition</div>
            <div className="us-flashcard__face-text">{card.back}</div>
          </div>
        </div>
      </div>
      {flipped && (
        <div className="us-flashcard__controls">
          <button className="us-flashcard__btn us-flashcard__btn--wrong" onClick={() => advance('wrong')}>
            <XCircle size={16} weight="bold" /> Study Again
          </button>
          <button className="us-flashcard__btn us-flashcard__btn--right" onClick={() => advance('right')}>
            <CheckCircle size={16} weight="bold" /> Got It
          </button>
        </div>
      )}
    </div>
  );
}

// ── Quiz Viewer ──
function QuizViewer({ data }: { data: QuizQuestion[] }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);

  if (idx >= data.length) {
    return (
      <div className="us-complete">
        <div className="us-complete__icon"><Trophy size={36} weight="duotone" /></div>
        <div className="us-complete__title">Quiz Complete!</div>
        <div className="us-complete__score">{score} / {data.length} correct</div>
      </div>
    );
  }

  const q = data[idx];
  const handleSelect = (optIdx: number) => {
    if (locked) return;
    setSelected(optIdx);
    setLocked(true);
    if (optIdx === q.correct_option_index) setScore((s) => s + 1);
    setTimeout(() => {
      setSelected(null);
      setLocked(false);
      setIdx((i) => i + 1);
    }, 1800);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="us-flashcard__progress">Question {idx + 1} of {data.length}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>
        {q.question}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {q.options.map((opt, i) => {
          let cls = 'us-fill-blank__option';
          if (locked && i === q.correct_option_index) cls += ' is-correct';
          else if (locked && i === selected && i !== q.correct_option_index) cls += ' is-wrong';
          return (
            <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={locked}>
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          );
        })}
      </div>
      {locked && (
        <div style={{ marginTop: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          {q.explanation}
        </div>
      )}
    </div>
  );
}

// ── Briefing Viewer ──
function BriefingViewer({ data }: { data: BriefingData }) {
  return (
    <div className="us-briefing">
      <div className="us-briefing__section-title">TLDR</div>
      <div className="us-briefing__tldr">{data.tldr}</div>
      <div className="us-briefing__section-title">Key Points</div>
      <ul className="us-briefing__list">
        {data.key_points.map((p, i) => (
          <li key={i}><Dot size={18} weight="bold" /> {p}</li>
        ))}
      </ul>
      <div className="us-briefing__section-title">Action Items</div>
      <ul className="us-briefing__list">
        {data.action_items.map((a, i) => (
          <li key={i}><Square size={14} weight="bold" /> {a}</li>
        ))}
      </ul>
    </div>
  );
}

// ── Takeaways Viewer ──
function TakeawayViewer({ data }: { data: string[] }) {
  return (
    <div className="us-takeaways">
      {data.map((t, i) => (
        <div key={i} className="us-takeaway">
          <span className="us-takeaway__number">{i + 1}</span>
          <span className="us-takeaway__text">{t}</span>
        </div>
      ))}
    </div>
  );
}

// ── Term Match Viewer (wraps concept from existing MatchGame) ──
function TermMatchViewer({ data }: { data: MatchPair[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const shuffledDefs = useRef(
    [...data].sort(() => Math.random() - 0.5).map((p) => p.definition)
  ).current;

  const handleTermClick = (term: string) => {
    if (matched.has(term)) return;
    setSelected(term);
  };

  const handleDefClick = (def: string) => {
    if (!selected) return;
    const pair = data.find((p) => p.term === selected && p.definition === def);
    if (pair) {
      setMatched((prev) => new Set([...prev, selected]));
    }
    setSelected(null);
  };

  if (matched.size === data.length) {
    return (
      <div className="us-complete">
        <div className="us-complete__icon"><CheckCircle size={36} weight="duotone" /></div>
        <div className="us-complete__title">All Matched!</div>
        <div className="us-complete__score">{data.length} pairs completed</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="us-briefing__section-title">Terms</div>
        {data.map((p) => (
          <button
            key={p.term}
            className={`us-fill-blank__option ${selected === p.term ? 'is-correct' : ''} ${matched.has(p.term) ? 'is-correct' : ''}`}
            onClick={() => handleTermClick(p.term)}
            disabled={matched.has(p.term)}
            style={matched.has(p.term) ? { opacity: 0.4 } : {}}
          >
            {p.term}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="us-briefing__section-title">Definitions</div>
        {shuffledDefs.map((def, i) => {
          const ownerTerm = data.find((p) => p.definition === def)?.term;
          const isMatched = ownerTerm ? matched.has(ownerTerm) : false;
          return (
            <button
              key={i}
              className={`us-fill-blank__option ${isMatched ? 'is-correct' : ''}`}
              onClick={() => handleDefClick(def)}
              disabled={isMatched}
              style={isMatched ? { opacity: 0.4 } : {}}
            >
              {def.slice(0, 80)}{def.length > 80 ? '...' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Word Scramble Viewer ──
function WordScrambleViewer({ data }: { data: ScrambleWord[] }) {
  const [idx, setIdx] = useState(0);
  const [slots, setSlots] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [score, setScore] = useState(0);

  if (idx >= data.length) {
    return (
      <div className="us-complete">
        <div className="us-complete__icon"><CheckCircle size={36} weight="duotone" /></div>
        <div className="us-complete__title">All Words Unscrambled!</div>
        <div className="us-complete__score">{score} / {data.length} correct</div>
      </div>
    );
  }

  const word = data[idx];
  const letters = word.scrambled.split('');

  const handleTileTap = (letter: string, tileIdx: number) => {
    if (usedIndices.has(tileIdx) || status !== 'playing') return;
    const newSlots = [...slots, letter];
    const newUsed = new Set([...usedIndices, tileIdx]);
    setSlots(newSlots);
    setUsedIndices(newUsed);

    if (newSlots.length === word.original.length) {
      const guess = newSlots.join('');
      if (guess === word.original) {
        setStatus('correct');
        setScore((s) => s + 1);
        setTimeout(() => {
          setIdx((i) => i + 1);
          setSlots([]);
          setUsedIndices(new Set());
          setStatus('playing');
        }, 1200);
      } else {
        setStatus('wrong');
        setTimeout(() => {
          setSlots([]);
          setUsedIndices(new Set());
          setStatus('playing');
        }, 800);
      }
    }
  };

  const handleSlotTap = (slotIdx: number) => {
    if (status !== 'playing') return;
    const newSlots = slots.filter((_, i) => i !== slotIdx);
    // Find which tile index to free
    const usedArr = [...usedIndices];
    if (usedArr.length > slotIdx) {
      const newUsed = new Set(usedArr.filter((_, i) => i !== slotIdx));
      setUsedIndices(newUsed);
    }
    setSlots(newSlots);
  };

  return (
    <div className="us-scramble">
      <div className="us-flashcard__progress">{idx + 1} of {data.length}</div>
      <div className="us-scramble__hint">{word.hint}</div>
      <div className="us-scramble__slots">
        {Array.from({ length: word.original.length }).map((_, i) => (
          <button
            key={i}
            className={`us-scramble__slot ${slots[i] ? 'is-filled' : ''}`}
            onClick={() => handleSlotTap(i)}
          >
            {slots[i] || ''}
          </button>
        ))}
      </div>
      {status === 'correct' && (
        <div className="us-scramble__correct"><CheckCircle size={15} weight="bold" /> Correct!</div>
      )}
      {status === 'wrong' && (
        <div className="us-scramble__wrong"><XCircle size={15} weight="bold" /> Try again</div>
      )}
      <div className="us-scramble__tiles">
        {letters.map((letter, i) => (
          <button
            key={i}
            className={`us-scramble__tile ${usedIndices.has(i) ? 'is-used' : ''}`}
            onClick={() => handleTileTap(letter, i)}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Fill Blanks Viewer ──
function FillBlanksViewer({ data }: { data: FillBlankSentence[] }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(data.map(() => null));
  const [score, setScore] = useState(0);

  if (current >= data.length) {
    return (
      <div className="us-complete">
        <div className="us-complete__icon"><CheckCircle size={36} weight="duotone" /></div>
        <div className="us-complete__title">All Blanks Filled!</div>
        <div className="us-complete__score">{score} / {data.length} correct</div>
      </div>
    );
  }

  const item = data[current];
  const answered = answers[current] !== null;

  const handlePick = (option: string) => {
    if (answered) return;
    const newAnswers = [...answers];
    newAnswers[current] = option;
    setAnswers(newAnswers);
    if (option === item.blank) setScore((s) => s + 1);
    setTimeout(() => setCurrent((c) => c + 1), 1200);
  };

  return (
    <div className="us-fill-blanks">
      <div className="us-flashcard__progress">Blank {current + 1} of {data.length}</div>
      <div className="us-fill-blank__sentence">{item.text}</div>
      <div className="us-fill-blank__options">
        {(item.options || [item.blank]).map((opt, i) => {
          let cls = 'us-fill-blank__option';
          if (answered && opt === item.blank) cls += ' is-correct';
          else if (answered && opt === answers[current] && opt !== item.blank) cls += ' is-wrong';
          return (
            <button key={i} className={cls} onClick={() => handlePick(opt)} disabled={answered}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Speed Sort Viewer ──
function SpeedSortViewer({ data }: { data: SortChallenge }) {
  const [pool, setPool] = useState(data.items);
  const [buckets, setBuckets] = useState<Record<string, string[]>>(
    Object.fromEntries(data.categories.map((c) => [c, []]))
  );
  const [timer, setTimer] = useState(data.time_limit_seconds);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start timer on mount
  if (!intervalRef.current && !done && pool.length > 0) {
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  if (done || pool.length === 0) {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return (
      <div className="us-complete">
        <div className="us-complete__icon"><Trophy size={36} weight="duotone" /></div>
        <div className="us-complete__title">{pool.length === 0 ? 'All Sorted!' : 'Time\'s Up!'}</div>
        <div className="us-complete__score">{score} / {data.items.length} correctly sorted</div>
      </div>
    );
  }

  const handleSort = (item: typeof data.items[0], category: string) => {
    if (item.category === category) {
      setScore((s) => s + 1);
    }
    setBuckets((prev) => ({ ...prev, [category]: [...prev[category], item.text] }));
    setPool((prev) => prev.filter((p) => p.text !== item.text));
  };

  return (
    <div className="us-speed-sort">
      <div className={`us-speed-sort__timer ${timer < 10 ? 'is-low' : ''}`}>{timer}s</div>
      <div className="us-speed-sort__categories">
        {data.categories.map((cat) => (
          <div key={cat} className="us-speed-sort__category">
            <div className="us-speed-sort__category-label">{cat}</div>
            {buckets[cat].map((item, i) => (
              <div key={i} className="us-speed-sort__item" style={{ cursor: 'default', opacity: 0.6, marginTop: 4 }}>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="us-speed-sort__pool">
        {pool.map((item) => (
          <div key={item.text} className="us-speed-sort__item">
            {item.text}
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {data.categories.map((cat) => (
                <button
                  key={cat}
                  className="us-fill-blank__option"
                  style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                  onClick={() => handleSort(item, cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Crossword Viewer ──
function CrosswordViewer({ data }: { data: CrosswordGrid }) {
  const [userGrid, setUserGrid] = useState<Record<string, string>>({});

  if (data.clues.length === 0) {
    return <div className="us-empty"><p>Not enough terms to build a crossword.</p></div>;
  }

  // Build cell map
  const cells = new Map<string, { letter: string; number?: number }>();
  for (const clue of data.clues) {
    const dr = clue.direction === 'down' ? 1 : 0;
    const dc = clue.direction === 'across' ? 1 : 0;
    for (let i = 0; i < clue.answer.length; i++) {
      const key = `${clue.row + dr * i},${clue.col + dc * i}`;
      const existing = cells.get(key);
      if (!existing) {
        cells.set(key, { letter: clue.answer[i], number: i === 0 ? clue.number : undefined });
      } else if (i === 0 && !existing.number) {
        existing.number = clue.number;
      }
    }
  }

  const handleInput = (key: string, value: string) => {
    setUserGrid((prev) => ({ ...prev, [key]: value.toUpperCase().slice(-1) }));
  };

  const across = data.clues.filter((c) => c.direction === 'across');
  const down = data.clues.filter((c) => c.direction === 'down');

  return (
    <div className="us-crossword">
      <div>
        <div className="us-crossword__grid" style={{ gridTemplateColumns: `repeat(${data.width}, 36px)` }}>
          {Array.from({ length: data.height }).map((_, r) =>
            Array.from({ length: data.width }).map((_, c) => {
              const key = `${r},${c}`;
              const cell = cells.get(key);
              if (!cell) {
                return <div key={key} className="us-crossword__cell us-crossword__cell--empty" />;
              }
              return (
                <div key={key} className="us-crossword__cell us-crossword__cell--active">
                  {cell.number && <span className="us-crossword__cell-number">{cell.number}</span>}
                  <input
                    className="us-crossword__cell-input"
                    maxLength={1}
                    value={userGrid[key] || ''}
                    onChange={(e) => handleInput(key, e.target.value)}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="us-crossword__clues">
        {across.length > 0 && (
          <>
            <div className="us-crossword__clue-group-title">Across</div>
            {across.map((c) => (
              <div key={`a-${c.number}`} className="us-crossword__clue">
                <strong>{c.number}.</strong> {c.clue}
              </div>
            ))}
          </>
        )}
        {down.length > 0 && (
          <>
            <div className="us-crossword__clue-group-title" style={{ marginTop: 'var(--space-md)' }}>Down</div>
            {down.map((c) => (
              <div key={`d-${c.number}`} className="us-crossword__clue">
                <strong>{c.number}.</strong> {c.clue}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Discussion Viewer ──
function DiscussionViewer({ data }: { data: DiscussionPrompt[] }) {
  return (
    <div className="us-discussion">
      {data.map((d) => (
        <div key={d.id} className="us-discussion__card">
          <div className="us-discussion__question">{d.question}</div>
          {d.context && <div className="us-discussion__context">"{d.context}"</div>}
          <textarea className="us-discussion__response" placeholder="Your thoughts..." />
        </div>
      ))}
    </div>
  );
}

// ── Code Sandbox Viewer (wraps concept from existing InteractiveRunner) ──
function CodeSandboxViewer({ data }: { data: { code: string; expectedOutput?: string } }) {
  const [code, setCode] = useState(data.code);
  const [output, setOutput] = useState<string[]>([]);

  const handleRun = () => {
    const logs: string[] = [];
    const customConsole = {
      log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
      error: (...args: unknown[]) => logs.push(`[ERROR] ${args.join(' ')}`),
    };
    try {
      const fn = new Function('console', code);
      fn(customConsole);
      setOutput(logs.length ? logs : ['Code executed, no console output.']);
    } catch (err: unknown) {
      setOutput([`[Error] ${err instanceof Error ? err.message : String(err)}`]);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="us-source__field"
        style={{ fontFamily: 'monospace', fontSize: '0.85rem', minHeight: 200 }}
        spellCheck={false}
      />
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
        <button className="us-process-btn" onClick={handleRun}>
          <Play size={15} weight="fill" /> Run
        </button>
      </div>
      {output.length > 0 && (
        <div
          style={{
            marginTop: 'var(--space-md)',
            padding: 'var(--space-md)',
            background: 'var(--color-bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-success)',
          }}
        >
          {output.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </div>
  );
}

// ═══ Output Viewer Router ═══
function OutputViewer({ output }: { output: GeneratedOutput }) {
  switch (output.format) {
    case 'micro_lesson': return <MicroLessonViewer data={output.data as MicroLessonData} />;
    case 'flashcards': return <FlashcardViewer data={output.data as FlashcardItem[]} />;
    case 'quiz': return <QuizViewer data={output.data as QuizQuestion[]} />;
    case 'briefing': return <BriefingViewer data={output.data as BriefingData} />;
    case 'takeaways': return <TakeawayViewer data={output.data as string[]} />;
    case 'term_match': return <TermMatchViewer data={output.data as MatchPair[]} />;
    case 'crossword': return <CrosswordViewer data={output.data as CrosswordGrid} />;
    case 'word_scramble': return <WordScrambleViewer data={output.data as ScrambleWord[]} />;
    case 'fill_blanks': return <FillBlanksViewer data={output.data as FillBlankSentence[]} />;
    case 'speed_sort': return <SpeedSortViewer data={output.data as SortChallenge} />;
    case 'code_sandbox': return <CodeSandboxViewer data={output.data as { code: string; expectedOutput?: string }} />;
    case 'discussion': return <DiscussionViewer data={output.data as DiscussionPrompt[]} />;
    default: return <div>Unknown format</div>;
  }
}

// ═══ MAIN PAGE COMPONENT ═══
export default function UpgradeSelf() {
  // ── State ──
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => listNotebooks());
  const [activeId, setActiveId] = useState<string | null>(notebooks[0]?.id || null);
  const [sourceTab, setSourceTab] = useState<SourceType>('paste');
  const [sourceInput, setSourceInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewingOutput, setViewingOutput] = useState<GeneratedOutput | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [curatorStep, setCuratorStep] = useState(0);
  const [course, setCourse] = useState<GeneratedCourse | null>(null);
  const [openModule, setOpenModule] = useState<string | null>(null);
  // Per-module "Regenerate" in flight (module id) so we can disable that one row.
  const [regenModuleId, setRegenModuleId] = useState<string | null>(null);
  // "Add my notes" per module, keyed by module id. Kept beside the course (not on
  // the GeneratedCourse type) and folded into the module summary at publish time.
  const [moduleNotes, setModuleNotes] = useState<Record<string, string>>({});

  const activeNotebook = activeId ? notebooks.find((n) => n.id === activeId) : null;

  const handlePublish = useCallback(async () => {
    if (!activeNotebook) return;
    setError(null);
    setSuccessMessage(null);

    const microLessonOut = activeNotebook.outputs.find((o) => o.format === 'micro_lesson');
    const quizOut = activeNotebook.outputs.find((o) => o.format === 'quiz');
    const termMatchOut = activeNotebook.outputs.find((o) => o.format === 'term_match');

    const microData = microLessonOut?.data as MicroLessonData | undefined;
    const quizQuestions = quizOut?.data as QuizQuestion[] | undefined;
    const matchPairs = termMatchOut?.data as MatchPair[] | undefined;

    const title = activeNotebook.title || 'Self-Upgrade Lesson';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `lesson-${Date.now()}`;

    const newModule = {
      id: activeNotebook.id,
      slug,
      type: 'concept' as const,
      status: 'published' as const,
      title,
      hook: microData?.hook || 'Expand your mind with this custom study guide.',
      objective: 'Learn the core concepts of this custom study module.',
      context_md: microData?.context || 'Explore the details below.',
      practice_md: microData?.practice || null,
      practice_starter: null,
      reflect_question: microData?.reflect || null,
      quiz_questions: quizQuestions || [],
      match_pairs: matchPairs || [],
      required_role: 'curious' as const,
      tags: ['custom', 'self-upgrade'],
      cover_image: null,
      estimated_minutes: 5,
      xp_reward: 50,
      pathway_id: null,
      pathway_order: null,
      source_url: activeNotebook.sources.find((s) => s.type === 'url')?.url || null,
      source_published_at: null,
      generated_by_ai: true,
      author_id: 'upgrade-self-author',
      pinned_as_today_drill_at: null,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // ONE canonical write: upsertModule lands this in the same store the Learn
      // hub and Classroom both read through listLearnableModules(), so the course
      // shows up in the unified Classroom. No parallel 'ap_sandbox_modules' copy.
      await upsertModule(newModule);
      setSuccessMessage('Course published to the Agentic Study Hall. Open the Classroom to play it.');
    } catch (err) {
      console.error('Failed to publish module:', err);
      setError('Failed to publish the course. See console for details.');
    }
  }, [activeNotebook]);

  // ── Notebook CRUD ──
  const handleNewNotebook = useCallback(() => {
    const nb = createNotebook('Untitled Project');
    setNotebooks(listNotebooks());
    setActiveId(nb.id);
    setViewingOutput(null);
  }, []);

  const handleDeleteNotebook = useCallback((id: string) => {
    deleteNotebook(id);
    const updated = listNotebooks();
    setNotebooks(updated);
    if (activeId === id) {
      setActiveId(updated[0]?.id || null);
      setViewingOutput(null);
    }
  }, [activeId]);

  const handleSwitchNotebook = useCallback((id: string) => {
    setActiveId(id);
    setViewingOutput(null);
    setSidebarOpen(false);
  }, []);

  // ── Source management ──
  const handleAddSource = useCallback(async () => {
    if (!sourceInput.trim() || !activeNotebook) return;
    setError(null);

    let content = sourceInput;
    let title = sourceInput.replace(/[#*>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40) + (sourceInput.length > 40 ? '…' : '');

    // If URL, actually fetch the article content
    if (sourceTab === 'url') {
      setFetchingUrl(true);
      try {
        const fetched = await fetchUrlContent(sourceInput);
        content = fetched.text;
        title = fetched.title;
      } catch (err) {
        console.error('URL fetch failed:', err);
        setError(`Could not fetch article. Adding URL as-is.`);
        title = sourceInput.slice(0, 60);
      } finally {
        setFetchingUrl(false);
      }
    }

    const source: NotebookSource = {
      id: crypto.randomUUID(),
      type: sourceTab,
      title,
      content,
      url: sourceTab === 'url' ? sourceInput : undefined,
      added_at: new Date().toISOString(),
    };

    const updated = { ...activeNotebook, sources: [...activeNotebook.sources, source] };
    updateNotebook(updated);
    setNotebooks(listNotebooks());
    setSourceInput('');
  }, [sourceInput, sourceTab, activeNotebook]);

  const handleRemoveSource = useCallback((sourceId: string) => {
    if (!activeNotebook) return;
    const updated = { ...activeNotebook, sources: activeNotebook.sources.filter((s) => s.id !== sourceId) };
    updateNotebook(updated);
    setNotebooks(listNotebooks());
  }, [activeNotebook]);

  // ── Process ──
  const handleProcess = useCallback(async () => {
    if (!activeNotebook || activeNotebook.sources.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      // Local-first: a deterministic engine churns the sources into all 12
      // formats with zero backend, so the tool always outputs (no MiniMax).
      const { processSourcesIntoOutputs } = await import('../../lib/upgrade-self/contentEngine');
      let outputs = processSourcesIntoOutputs(activeNotebook.sources);

      // Optional upgrade: if an AI provider is explicitly enabled, route through
      // the pluggable edge function for higher-fidelity output. Any failure keeps
      // the local result — the churn never dies.
      if (AI_ENABLED) {
        try {
          const aiOutputs = await generateStudyContent(activeNotebook.sources);
          if (aiOutputs.length > 0) outputs = aiOutputs;
        } catch (aiErr) {
          console.warn('[Upgrade.Self] AI upgrade unavailable, using local output:', aiErr);
        }
      }

      if (outputs.length === 0) {
        setError('Not enough source text to build from. Add more content and try again.');
      } else {
        const updated = { ...activeNotebook, outputs };
        updateNotebook(updated);
        setNotebooks(listNotebooks());
      }
    } catch (err) {
      console.error('[Upgrade.Self] generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed. Check console for details.');
    } finally {
      setProcessing(false);
    }
  }, [activeNotebook]);

  // ── Curator: source → structured course (lesson plan) ──
  const handleGenerateCourse = useCallback(async () => {
    if (!activeNotebook || activeNotebook.sources.length === 0) return;
    setGenerating(true);
    setCourse(null);
    setError(null);
    setSuccessMessage(null);
    // Stream the Curator's steps so the build is observable, not magical.
    for (let i = 0; i < CURATOR_STEPS.length - 1; i++) {
      setCuratorStep(i);
      await new Promise((r) => setTimeout(r, 430));
    }
    const built = buildCourse(activeNotebook.sources);
    if (!built) {
      setError('Not enough source text to build a course yet. Add more content and try again.');
      setGenerating(false);
      return;
    }
    setCuratorStep(CURATOR_STEPS.length - 1);
    await new Promise((r) => setTimeout(r, 320));
    setCourse(built);
    setOpenModule(built.modules[0]?.id ?? null);
    setGenerating(false);
    // Edit-before-publish: never ship the draft unread. Tell the user it's a
    // starting point and that they own it before it goes live (HANDOFF 5.7).
    setSuccessMessage(
      `${built.modules.length} ${built.modules.length === 1 ? 'module' : 'modules'} drafted. Edit anything: titles, lessons, your own notes. Then publish.`,
    );
  }, [activeNotebook]);

  // ── Inline editing: write back into a local editable copy of the course ──
  // The draft is the Curator's first pass; the human owns the final. Every edit
  // is an immutable update so React re-renders and Publish always uses the
  // EDITED course (LearnWorlds rule: never publish unedited AI).
  const updateCourseField = useCallback(
    <K extends keyof GeneratedCourse>(key: K, value: GeneratedCourse[K]) => {
      setCourse((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    [],
  );

  const updateModuleField = useCallback(
    <K extends keyof CourseModule>(moduleId: string, key: K, value: CourseModule[K]) => {
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, [key]: value } : m)),
            }
          : prev,
      );
    },
    [],
  );

  const updateLessonField = useCallback(
    <K extends keyof CourseLesson>(
      moduleId: string,
      lessonId: string,
      key: K,
      value: CourseLesson[K],
    ) => {
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) =>
                m.id === moduleId
                  ? {
                      ...m,
                      lessons: m.lessons.map((l) =>
                        l.id === lessonId ? { ...l, [key]: value } : l,
                      ),
                    }
                  : m,
              ),
            }
          : prev,
      );
    },
    [],
  );

  // ── Per-module: reorder (move up / down) ──
  const moveModule = useCallback((moduleId: string, dir: -1 | 1) => {
    setCourse((prev) => {
      if (!prev) return prev;
      const idx = prev.modules.findIndex((m) => m.id === moduleId);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= prev.modules.length) return prev;
      const modules = [...prev.modules];
      [modules[idx], modules[swap]] = [modules[swap], modules[idx]];
      return { ...prev, modules };
    });
  }, []);

  // ── Per-module: "Add my notes" (kept beside the course, folded into the
  // summary at publish time so the human's voice ships with the lesson plan) ──
  const handleModuleNotes = useCallback((moduleId: string, notes: string) => {
    setModuleNotes((prev) => ({ ...prev, [moduleId]: notes }));
  }, []);

  // ── Per-module: Regenerate just this module from the source, swap in place ──
  // Re-runs the Curator over the source and lifts the matching module (by index)
  // out of the fresh build, so a single weak module can be refreshed without
  // losing the human edits made to every other module (or its notes).
  const regenerateModule = useCallback(
    async (moduleId: string) => {
      if (!activeNotebook || regenModuleId) return;
      setError(null);
      setRegenModuleId(moduleId);
      // Brief beat so the spinner is observable, not a flash.
      await new Promise((r) => setTimeout(r, 360));
      const fresh = buildCourse(activeNotebook.sources);
      setCourse((prev) => {
        if (!prev) return prev;
        const idx = prev.modules.findIndex((m) => m.id === moduleId);
        const replacement = fresh?.modules[idx];
        if (idx < 0 || !replacement) return prev;
        // Keep the module's stable id so its notes (keyed by id) stay attached.
        const merged: CourseModule = { ...replacement, id: prev.modules[idx].id };
        const modules = [...prev.modules];
        modules[idx] = merged;
        return { ...prev, modules };
      });
      if (!fresh) {
        setError('Not enough source text to regenerate that module. Add more content and try again.');
      }
      setRegenModuleId(null);
    },
    [activeNotebook, regenModuleId],
  );

  // ── Publish the generated course as a lesson plan into the Study Hall ──
  // ONE canonical write: publishGeneratedCourse() maps the course to a
  // LearnModule and upserts it through the same store every module uses, so the
  // course lands in the unified Classroom (Supabase live, or the local store in
  // bypass) exactly like an admin-authored module. We do NOT also write to the
  // legacy 'ap_sandbox_modules' bucket; the store surfaces that key read-only.
  const handlePublishCourse = useCallback(async () => {
    if (!course) return;
    setError(null);
    setSuccessMessage(null);
    // Fold the human's first-module notes and the source URL into the published
    // module. The mapper handles the rest (quiz flattening, key-term pairs,
    // slug, timestamps), so the edited course is what ships.
    const firstModuleNotes = course.modules[0]
      ? (moduleNotes[course.modules[0].id] || '').trim()
      : '';
    const sourceUrl = activeNotebook?.sources.find((s) => s.type === 'url')?.url || null;
    try {
      await publishGeneratedCourse(course, {
        id: activeNotebook?.id,
        firstModuleNotes,
        sourceUrl,
      });
      setSuccessMessage('Lesson plan published to the Agentic Study Hall. Open the Classroom to teach it.');
    } catch (err) {
      console.error('Failed to publish lesson plan:', err);
      setError('Could not publish the lesson plan. See console for details.');
    }
  }, [course, activeNotebook, moduleNotes]);

  // ── Ensure at least one notebook ──
  if (notebooks.length === 0) {
    const nb = createNotebook('My First Project');
    setNotebooks([nb]);
    setActiveId(nb.id);
  }

  const sources = activeNotebook?.sources || [];
  const outputs = activeNotebook?.outputs || [];

  return (
    <div className="us-workspace">
      {/* ── Sidebar Toggle ── */}
      <button className="us-sidebar-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open projects">
        <NotebookIcon size={18} />
      </button>

      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <>
          <div className="us-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
          <aside className={`us-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
            <div className="us-sidebar__header">
              <span className="us-sidebar__title">Projects</span>
              <button className="us-sidebar__close" onClick={() => setSidebarOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <ul className="us-sidebar__list">
              {notebooks.map((nb) => (
                <li
                  key={nb.id}
                  className={`us-sidebar__item ${nb.id === activeId ? 'is-active' : ''}`}
                  onClick={() => handleSwitchNotebook(nb.id)}
                >
                  <span>{nb.title}</span>
                  <button
                    className="us-sidebar__item-delete"
                    onClick={(e) => { e.stopPropagation(); handleDeleteNotebook(nb.id); }}
                    aria-label="Delete notebook"
                  >
                    <Trash size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <button className="us-sidebar__new" onClick={handleNewNotebook}>
              <Plus size={14} /> New Project
            </button>
          </aside>
        </>
      )}

      {/* ── Header ── */}
      <header className="us-header">
        <span className="us-badge">
          <TreeStructure size={14} weight="duotone" />
          <span>Curator · Course Builder</span>
        </span>
        <h1 className="us-title">Upgrade.Self</h1>
        <p className="us-subtitle">
          Drop in any source. Upgrade.Self turns it into a full course you can teach: modules,
          lessons, quizzes, and a project. People learn AI from what you put in.
        </p>
      </header>

      {/* ── Source Input ── */}
      <section className="us-source">
        <div className="us-source__tabs">
          {(['url', 'paste', 'notes'] as SourceType[]).map((tab) => (
            <button
              key={tab}
              className={`us-source__tab ${sourceTab === tab ? 'is-active' : ''}`}
              onClick={() => setSourceTab(tab)}
            >
              {tab === 'url' ? <><LinkIcon size={14} weight="bold" /> URL</> : tab === 'paste' ? <><ClipboardText size={14} weight="bold" /> Paste Text</> : <><PencilSimple size={14} weight="bold" /> Notes</>}
            </button>
          ))}
        </div>

        {sourceTab === 'url' ? (
          <input
            type="url"
            className="us-source__field"
            value={sourceInput}
            onChange={(e) => setSourceInput(e.target.value)}
            placeholder="https://example.com/article..."
          />
        ) : (
          <textarea
            className="us-source__field"
            rows={4}
            value={sourceInput}
            onChange={(e) => setSourceInput(e.target.value)}
            placeholder={sourceTab === 'paste' ? 'Paste article text, transcript, or content here...' : 'Write your notes, key points, or outlines...'}
          />
        )}

        <div className="us-source__actions">
          <div className="us-source__chips">
            {sources.map((s) => (
              <span key={s.id} className="us-source__chip">
                {s.type === 'url' ? <LinkIcon size={12} /> : s.type === 'paste' ? <ClipboardText size={12} /> : <PencilSimple size={12} />} {s.title}
                <button className="us-source__chip-x" onClick={() => handleRemoveSource(s.id)}><X size={10} /></button>
              </span>
            ))}
          </div>
          <button
            className="us-fill-blank__option"
            onClick={handleAddSource}
            disabled={!sourceInput.trim() || fetchingUrl}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Plus size={12} />
            {fetchingUrl ? 'Fetching...' : 'Add Source'}
          </button>
          <button
            className="us-fill-blank__option"
            onClick={handleProcess}
            disabled={processing || sources.length === 0}
            style={{ whiteSpace: 'nowrap' }}
            title="Generate standalone practice games (flashcards, quiz, crossword…)"
          >
            {processing ? 'Churning…' : '+ Practice games'}
          </button>
          <button
            className="us-process-btn"
            onClick={handleGenerateCourse}
            disabled={generating || sources.length === 0}
          >
            <Lightning size={16} weight="fill" />
            {generating ? 'Curating…' : 'Generate Course'}
          </button>
        </div>
        {error && (
          <div className="us-error">
            <span>{error}</span>
            <button className="us-error__dismiss" onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}
        {successMessage && (
          <div className="us-error" style={{ background: 'color-mix(in srgb, var(--color-success) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--color-success) 20%, transparent)', color: 'var(--color-success)' }}>
            <span>{successMessage}</span>
            <button className="us-error__dismiss" onClick={() => setSuccessMessage(null)}><X size={14} /></button>
          </div>
        )}
      </section>

      {/* ── Curator: building the course (observable agent, terse log line) ── */}
      {generating && (
        <section className="us-curator" role="status" aria-live="polite">
          <div className="us-curator__head">
            <span className="us-curator__dot" />
            <TerminalWindow size={15} weight="duotone" />
            <span>curator</span>
            <span className="us-curator__sub">
              {curatorStep + 1}/{CURATOR_STEPS.length} · {CURATOR_STEPS[curatorStep]}…
            </span>
          </div>
          <ul className="us-curator__steps">
            {CURATOR_STEPS.map((s, i) => (
              <li
                key={s}
                className={`us-curator__step ${i < curatorStep ? 'is-done' : ''} ${i === curatorStep ? 'is-active' : ''}`}
              >
                <span className="us-curator__mark">
                  {i < curatorStep ? (
                    <CheckCircle size={14} weight="fill" />
                  ) : i === curatorStep ? (
                    <CaretRight size={14} weight="bold" />
                  ) : (
                    <Circle size={14} weight="bold" />
                  )}
                </span>
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Generated course → EDIT-BEFORE-PUBLISH editor (Flow B / LearnWorlds:
            the Curator drafts, the human owns the final, nothing ships unedited) ── */}
      {course && !generating && (
        <section className="us-course">
          {/* Affordance: this is a draft you edit, not a finished artifact. */}
          <div className="us-course__editnote">
            <NotePencil size={15} weight="duotone" />
            <span>
              <strong>Draft. Edit before you publish.</strong> Everything here is yours to
              rewrite: titles, lessons, module order, your own notes. Tap any text to change it.
            </span>
          </div>

          <div className="us-course__head">
            <div className="us-course__head-main">
              <label className="us-edit-label" htmlFor="us-course-title">Course title</label>
              <input
                id="us-course-title"
                className="us-edit us-edit--title"
                value={course.title}
                onChange={(e) => updateCourseField('title', e.target.value)}
                placeholder="Name your course…"
              />
              <label className="us-edit-label" htmlFor="us-course-desc">Description</label>
              <textarea
                id="us-course-desc"
                className="us-edit us-edit--desc"
                value={course.description}
                onChange={(e) => updateCourseField('description', e.target.value)}
                rows={2}
                placeholder="One or two lines on what this course covers…"
              />
            </div>
            <div className="us-course__actions">
              <button className="us-process-btn" onClick={handlePublishCourse}>
                Publish lesson plan
              </button>
              <button
                className="us-fill-blank__option"
                onClick={handleGenerateCourse}
                style={{ whiteSpace: 'nowrap' }}
                title="Re-draft the whole course from your source (replaces all edits)"
              >
                <ArrowsClockwise size={13} weight="bold" /> Re-draft all
              </button>
            </div>
          </div>

          <div className="us-course__meta">
            <span className={`us-course__badge us-course__badge--${course.difficulty.toLowerCase()}`}>
              {course.difficulty}
            </span>
            <span>{course.modules.length} modules</span>
            <span>{course.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons</span>
            <span>{course.durationMin} min</span>
          </div>

          {course.objectives.length > 0 && (
            <div className="us-course__objectives">
              <span className="us-course__objectives-label">What you will learn</span>
              <ul>
                {course.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="us-course__modules">
            {course.modules.map((m, idx) => (
              <div key={m.id} className={`us-module ${openModule === m.id ? 'is-open' : ''}`}>
                <div className="us-module__head">
                  <span className="us-module__num">{idx + 1}</span>
                  <input
                    className="us-edit us-edit--module"
                    value={m.title}
                    onChange={(e) => updateModuleField(m.id, 'title', e.target.value)}
                    placeholder="Module title…"
                    aria-label={`Module ${idx + 1} title`}
                  />
                  {/* Reorder + collapse controls — observable, keyboard-reachable. */}
                  <div className="us-module__ctrls">
                    <button
                      className="us-icon-btn"
                      onClick={() => moveModule(m.id, -1)}
                      disabled={idx === 0}
                      title="Move module up"
                      aria-label={`Move module ${idx + 1} up`}
                    >
                      <ArrowUp size={14} weight="bold" />
                    </button>
                    <button
                      className="us-icon-btn"
                      onClick={() => moveModule(m.id, 1)}
                      disabled={idx === course.modules.length - 1}
                      title="Move module down"
                      aria-label={`Move module ${idx + 1} down`}
                    >
                      <ArrowDown size={14} weight="bold" />
                    </button>
                    <button
                      className="us-icon-btn"
                      onClick={() => regenerateModule(m.id)}
                      disabled={regenModuleId !== null}
                      title="Regenerate this module from your source"
                      aria-label={`Regenerate module ${idx + 1}`}
                    >
                      <ArrowsClockwise
                        size={14}
                        weight="bold"
                        className={regenModuleId === m.id ? 'us-spin' : ''}
                      />
                    </button>
                    <button
                      className="us-icon-btn"
                      onClick={() => setOpenModule(openModule === m.id ? null : m.id)}
                      title={openModule === m.id ? 'Collapse module' : 'Expand module'}
                      aria-expanded={openModule === m.id}
                      aria-label={`${openModule === m.id ? 'Collapse' : 'Expand'} module ${idx + 1}`}
                    >
                      <ArrowDown
                        size={14}
                        weight="bold"
                        style={{ transform: openModule === m.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                      />
                    </button>
                  </div>
                  <span className="us-module__count">
                    {m.lessons.length} lessons · {m.quiz.length} quiz
                  </span>
                </div>
                {openModule === m.id && (
                  <div className="us-module__body">
                    {regenModuleId === m.id && (
                      <div className="us-module__regen">Re-reading your source for this module…</div>
                    )}
                    <p className="us-module__summary">{m.summary}</p>
                    {m.lessons.map((l) => (
                      <div key={l.id} className="us-lesson">
                        <div className="us-lesson__titlerow">
                          <input
                            className="us-edit us-edit--lesson"
                            value={l.title}
                            onChange={(e) => updateLessonField(m.id, l.id, 'title', e.target.value)}
                            placeholder="Lesson title…"
                            aria-label="Lesson title"
                          />
                          <span className="us-lesson__min">{l.minutes} min</span>
                        </div>
                        <div className="us-lesson__objective">{l.objective}</div>
                        <textarea
                          className="us-edit us-edit--content"
                          value={l.content}
                          onChange={(e) => updateLessonField(m.id, l.id, 'content', e.target.value)}
                          rows={4}
                          placeholder="Lesson content. Rewrite in your own voice…"
                          aria-label="Lesson content"
                        />
                        {l.checks.length > 0 && (
                          <ul className="us-lesson__checks">
                            {l.checks.map((c, ci) => (
                              <li key={ci}>{c.question}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    {/* Add my notes — appended to the module on publish. */}
                    <div className="us-module__notes">
                      <label className="us-edit-label" htmlFor={`notes-${m.id}`}>
                        <NotePencil size={12} weight="bold" /> Add my notes
                      </label>
                      <textarea
                        id={`notes-${m.id}`}
                        className="us-edit us-edit--notes"
                        value={moduleNotes[m.id] || ''}
                        onChange={(e) => handleModuleNotes(m.id, e.target.value)}
                        rows={2}
                        placeholder="Your own context, examples, or caveats for this module…"
                      />
                    </div>
                    {m.keyTerms.length > 0 && (
                      <div className="us-module__terms">
                        {m.keyTerms.map((t) => (
                          <span key={t.term} className="us-term" title={t.definition}>
                            {t.term}
                          </span>
                        ))}
                      </div>
                    )}
                    {m.quiz.length > 0 && (
                      <div className="us-module__quiz">
                        <div className="us-module__quiz-label">Module quiz</div>
                        <QuizViewer data={m.quiz} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="us-course__project">
            <div className="us-course__project-label">Capstone project</div>
            <div className="us-course__project-title">{course.project.title}</div>
            <p className="us-course__project-brief">{course.project.brief}</p>
          </div>

          {/* Bottom publish bar — the edited course is what ships. */}
          <div className="us-course__publishbar">
            <span className="us-course__publishbar-note">
              Happy with it? You can keep editing after publishing.
            </span>
            <button className="us-process-btn" onClick={handlePublishCourse}>
              Publish lesson plan
            </button>
          </div>
        </section>
      )}

      {/* ── Viewer (expanded output) ── */}
      {viewingOutput && (
        <section className="us-viewer">
          <div className="us-viewer__header">
            <button className="us-viewer__back" onClick={() => setViewingOutput(null)}>
              <ArrowLeft size={14} /> Back to Gallery
            </button>
            <div className="us-viewer__title">
              {(() => { const IconComp = OUTPUT_META[viewingOutput.format].Icon; return <IconComp size={20} weight="duotone" />; })()}
              <span>{OUTPUT_META[viewingOutput.format].label}</span>
            </div>
            <div className="us-viewer__actions">
              <button className="us-viewer__action-btn us-viewer__action-btn--primary" onClick={handlePublish}>
                Publish to Study Hall
              </button>
              <button className="us-viewer__action-btn">Edit</button>
            </div>
          </div>
          <OutputViewer output={viewingOutput} />
        </section>
      )}

      {/* ── Output Gallery ── */}
      {!viewingOutput && (
        <div className="us-gallery">
          {processing && (
            <div className="us-processing">
              <div className="us-processing__spinner" />
              <div className="us-processing__text">Reading your source. Building practice games…</div>
            </div>
          )}

          {!processing && !course && outputs.length === 0 && (
            <div className="us-empty">
              <div className="us-empty__icon"><BookOpenText size={32} weight="duotone" /></div>
              <p>
                Drop in a source above, then hit <strong>Generate Course</strong>. The Curator
                drafts the modules. You edit everything before it publishes.
              </p>
            </div>
          )}

          {!processing && outputs.map((output) => {
            const meta = OUTPUT_META[output.format];
            const hasData = output.data && (
              Array.isArray(output.data) ? output.data.length > 0 : typeof output.data === 'object'
            );

            return (
              <button
                key={output.format}
                className="us-card"
                onClick={() => setViewingOutput(output)}
                disabled={!hasData}
                style={!hasData ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
              >
                <span className="us-card__category">{meta.category}</span>
                <span className="us-card__icon">{(() => { const IconComp = meta.Icon; return <IconComp size={24} weight="duotone" />; })()}</span>
                <span className="us-card__label">{meta.label}</span>
                <span className="us-card__preview">
                  {getPreviewText(output)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Preview text helper ──
function getPreviewText(output: GeneratedOutput): string {
  const d = output.data;
  switch (output.format) {
    case 'micro_lesson': return (d as MicroLessonData).hook?.slice(0, 60) || 'Lesson ready';
    case 'flashcards': return `${(d as FlashcardItem[]).length} cards`;
    case 'quiz': return `${(d as QuizQuestion[]).length} questions`;
    case 'briefing': return (d as BriefingData).tldr?.slice(0, 60) || 'Briefing ready';
    case 'takeaways': return `${(d as string[]).length} insights`;
    case 'term_match': return `${(d as MatchPair[]).length} pairs`;
    case 'crossword': return `${(d as CrosswordGrid).clues?.length || 0} clues`;
    case 'word_scramble': return `${(d as ScrambleWord[]).length} words`;
    case 'fill_blanks': return `${(d as FillBlankSentence[]).length} blanks`;
    case 'speed_sort': return `${(d as SortChallenge).items?.length || 0} items`;
    case 'code_sandbox': return 'Interactive sandbox';
    case 'discussion': return `${(d as DiscussionPrompt[]).length} prompts`;
    default: return 'Ready';
  }
}
