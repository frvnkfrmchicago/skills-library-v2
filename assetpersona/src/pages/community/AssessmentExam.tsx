import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Trophy, CheckCircle, XCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { getAssessmentBySlug, saveAssessmentResult, type Assessment, type AssessmentResult } from '../../data/assessmentsStore';
import { useAuth } from '../../context/useAuth';
import confetti from 'canvas-confetti';
import './AssessmentExam.css';

export default function AssessmentExam() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isBypass, bypassRole } = useAuth();
  const userId = user?.id ?? (isBypass ? `bypass-${bypassRole ?? 'guest'}` : 'anonymous');

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Exam tracking arrays
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  // Time tracking
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef<any>(null);

  // Finished states
  const [isFinished, setIsFinished] = useState(false);
  const [savedResult, setSavedResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    async function loadAssessment() {
      if (!slug) return;
      const data = await getAssessmentBySlug(slug);
      if (data) {
        setAssessment(data);
        setTimeLeft(data.timePerQuestionSeconds);
        setAnswers(new Array(data.questions.length).fill(null));
      }
      setLoading(false);
    }
    loadAssessment();
  }, [slug]);

  // Handle timer tick
  useEffect(() => {
    if (loading || !assessment || isFinished) return;

    // Reset timer when question changes
    setTimeLeft(assessment.timePerQuestionSeconds);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Timer expired - auto-skip
          handleAdvance(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIdx, loading, assessment, isFinished]);

  const handleOptionSelect = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleAdvance = (chosenOption: number | null) => {
    if (!assessment) return;

    // Save answer and skip state
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = chosenOption;
      return next;
    });

    setSelectedOption(null);

    if (currentIdx < assessment.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Finished all questions
      finishAssessment(chosenOption);
    }
  };

  const handleSkip = () => {
    handleAdvance(null);
  };

  const finishAssessment = async (lastOption: number | null) => {
    if (!assessment) return;
    setIsFinished(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Prepare final answer array to compute scores immediately
    const finalAnswers = [...answers];
    finalAnswers[currentIdx] = lastOption;

    let correctCount = 0;
    let skippedCount = 0;

    assessment.questions.forEach((q, idx) => {
      const ans = finalAnswers[idx];
      if (ans === q.correctIndex) {
        correctCount++;
      } else if (ans === null) {
        skippedCount++;
      }
    });

    try {
      const result = await saveAssessmentResult(
        userId,
        assessment.id,
        correctCount,
        skippedCount,
        assessment.questions.length
      );
      setSavedResult(result);

      if (result.score >= 80) {
        confetti({
          particleCount: 180,
          spread: 100,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to save assessment score:', err);
    }
  };

  if (loading) {
    return <div className="exam-viewport exam-viewport--loading">Initializing exam...</div>;
  }

  if (!assessment) {
    return (
      <div className="exam-viewport exam-viewport--error">
        <h2>Assessment not found</h2>
        <Link to="/community/assessments" className="btn btn--primary">
          <ArrowLeft size={14} /> Back to Assessments
        </Link>
      </div>
    );
  }

  if (isFinished) {
    const finalScore = savedResult?.score ?? 0;
    const correctCount = savedResult?.correctAnswers ?? 0;
    const skippedCount = savedResult?.skippedAnswers ?? 0;
    const incorrectCount = assessment.questions.length - correctCount - skippedCount;
    const passed = finalScore >= 80;

    return (
      <div className="exam-results-container">
        <div className="results-card">
          <span className={`results-status ${passed ? 'passed' : 'failed'}`}>
            {passed ? 'Assessment Certified' : 'Practice Completed'}
          </span>

          <h1 className="results-score">{finalScore}%</h1>
          <p className="results-subtitle">
            {passed
              ? `Outstanding performance! You completed the assessment with certified AI developer skills.`
              : `You scored below the 80% certification threshold. Retake the assessment after the cooldown period to certify.`}
          </p>

          <div className="results-stats-row">
            <div className="stat-box">
              <span className="val">{correctCount}</span>
              <span className="lbl">Correct</span>
            </div>
            <div className="stat-box">
              <span className="val">{incorrectCount}</span>
              <span className="lbl">Incorrect</span>
            </div>
            <div className="stat-box">
              <span className="val">{skippedCount}</span>
              <span className="lbl">Skipped</span>
            </div>
          </div>

          <div className="results-xp-award">
            <Trophy size={20} className="xp-icon" />
            <span>
              Awarded: <strong>{passed ? Math.round((finalScore / 100) * assessment.xpReward) : 25} Skill Points</strong>
            </span>
          </div>

          <div className="results-explanations">
            <h3>Review Answers & Explanations</h3>
            <div className="explanation-list">
              {assessment.questions.map((q, idx) => {
                const userAns = answers[idx];
                const isCorrect = userAns === q.correctIndex;
                const wasSkipped = userAns === null;

                return (
                  <div key={q.id} className={`explanation-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="explanation-item__header">
                      <span className="question-number">Question {idx + 1}</span>
                      <span className="answer-status">
                        {isCorrect ? (
                          <span className="status-badge status-badge--correct"><CheckCircle size={12} /> Correct</span>
                        ) : wasSkipped ? (
                          <span className="status-badge status-badge--skipped"><HelpCircle size={12} /> Skipped</span>
                        ) : (
                          <span className="status-badge status-badge--incorrect"><XCircle size={12} /> Incorrect</span>
                        )}
                      </span>
                    </div>
                    <p className="explanation-question-text">{q.text}</p>
                    <div className="explanation-choices">
                      <p><strong>Your Answer:</strong> {wasSkipped ? <em>None</em> : q.options[userAns!]}</p>
                      {!isCorrect && <p><strong>Correct Answer:</strong> {q.options[q.correctIndex]}</p>}
                    </div>
                    <p className="explanation-text">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="results-actions">
            <Link to="/community/assessments" className="btn btn--primary">
              Finish Review & Exit
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentIdx];
  const progressPercent = (timeLeft / assessment.timePerQuestionSeconds) * 100;
  const isTimeWarning = timeLeft <= 5;

  return (
    <div className="exam-viewport">
      <div className="exam-header">
        <div className="exam-header__info">
          <h2>{assessment.title}</h2>
          <span className="question-tracker">
            Question <strong>{currentIdx + 1}</strong> of {assessment.questions.length}
          </span>
        </div>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to quit? Your assessment will be lost.')) {
              navigate('/community/assessments');
            }
          }}
          className="exam-exit-btn"
        >
          Quit Test
        </button>
      </div>

      {/* Countdown Progress Slider */}
      <div className="exam-timer-bar">
        <div
          className={`exam-timer-fill ${isTimeWarning ? 'warning' : ''}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="exam-body">
        <div className="exam-timer-display">
          <Clock size={16} />
          <span className={isTimeWarning ? 'warning-text' : ''}>
            {timeLeft}s remaining
          </span>
        </div>

        <h1 className="exam-question-text">{currentQuestion.text}</h1>

        <div className="exam-options">
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              className={`exam-option-card ${selectedOption === idx ? 'is-selected' : ''}`}
              onClick={() => handleOptionSelect(idx)}
            >
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text">{opt}</span>
            </button>
          ))}
        </div>

        <div className="exam-actions">
          <button
            onClick={handleSkip}
            className="btn btn--ghost skip-btn"
          >
            I don't know / Skip
          </button>
          <button
            disabled={selectedOption === null}
            onClick={() => handleAdvance(selectedOption)}
            className="btn btn--primary next-btn"
          >
            Confirm Answer <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
