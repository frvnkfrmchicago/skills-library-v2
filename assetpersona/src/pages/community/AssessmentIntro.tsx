import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, AlertTriangle, Play, CheckCircle } from 'lucide-react';
import { getAssessments, checkCooldown, getAssessmentResults, type Assessment, type AssessmentResult } from '../../data/assessmentsStore';
import { useAuth } from '../../context/useAuth';
import SubTabs from '../../components/community/SubTabs';
import './AssessmentExam.css';

const CLASSROOM_TABS = [
  { to: '/community/learn', label: 'Modules' },
  { to: '/community/classroom', label: 'Simulations' },
  { to: '/community/briefs', label: 'Briefs' },
  { to: '/community/tutorials', label: 'Tutorials' },
  { to: '/community/assessments', label: 'Assessments' },
  { to: '/community/teams', label: 'Study Teams' },
];

export default function AssessmentIntro() {
  const navigate = useNavigate();
  const { user, isBypass, bypassRole } = useAuth();
  const userId = user?.id ?? (isBypass ? `bypass-${bypassRole ?? 'guest'}` : 'anonymous');

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [cooldowns, setCooldowns] = useState<Record<string, { onCooldown: boolean; remainingDays: number }>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const list = await getAssessments();
        const res = await getAssessmentResults(userId);

        const cdMap: Record<string, { onCooldown: boolean; remainingDays: number }> = {};
        for (const item of list) {
          cdMap[item.id] = await checkCooldown(userId, item.id);
        }

        if (active) {
          setAssessments(list);
          setResults(res);
          setCooldowns(cdMap);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load assessments:', err);
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [userId]);

  const handleStartExam = (assessment: Assessment) => {
    const cd = cooldowns[assessment.id];
    if (cd?.onCooldown) {
      alert(`This assessment is currently on cooldown. You can retake it in ${cd.remainingDays} days.`);
      return;
    }
    setSelectedAssessment(assessment);
  };

  const confirmStart = () => {
    if (!selectedAssessment) return;
    navigate(`/community/assessments/take/${selectedAssessment.slug}`);
  };

  if (loading) {
    return <div className="assessments-lobby assessments-lobby--loading">Loading assessments...</div>;
  }

  return (
    <div className="assessments-lobby">
      <SubTabs tabs={CLASSROOM_TABS} />
      <div className="assessments-lobby__hero">
        <span className="badge-promo">Skill Validation</span>
        <h1>AI Skill Assessments</h1>
        <p>
          Formally test your expertise in key AI engineering domains. These timed exams evaluate your engineering capability under pressure. Achieve 80%+ to unlock professional rank achievements and claim high Skill Points rewards.
        </p>
        <div className="assessments-lobby__rules">
          <div className="rule-item">
            <Clock size={16} />
            <span><strong>20s per question:</strong> The timer runs fast. Unanswered questions auto-advance.</span>
          </div>
          <div className="rule-item">
            <AlertTriangle size={16} />
            <span><strong>14-day cooldown:</strong> Retakes are locked for 2 weeks to ensure score credibility.</span>
          </div>
          <div className="rule-item">
            <Trophy size={16} />
            <span><strong>Skill Points & Badges:</strong> Earn massive Skill Points and unlock badges displayed on your public profile.</span>
          </div>
        </div>
      </div>

      <div className="assessments-grid">
        {assessments.map((assessment) => {
          const cd = cooldowns[assessment.id];
          const bestResult = results
            .filter((r) => r.assessmentId === assessment.id)
            .sort((a, b) => b.score - a.score)[0];

          return (
            <div key={assessment.id} className={`assessment-card assessment-card--${assessment.difficulty}`}>
              <div className="assessment-card__header">
                <span className={`difficulty-chip difficulty-chip--${assessment.difficulty}`}>
                  {assessment.difficulty}
                </span>
                <span className="xp-reward">
                  <Trophy size={14} /> {assessment.xpReward} Skill Points
                </span>
              </div>

              <h2 className="assessment-card__title">{assessment.title}</h2>
              <p className="assessment-card__desc">{assessment.description}</p>

              <div className="assessment-card__details">
                <span className="detail-item">
                  <strong>{assessment.questionsCount}</strong> questions
                </span>
                <span className="detail-item">
                  <strong>{assessment.timePerQuestionSeconds}s</strong> timer
                </span>
              </div>

              {bestResult && (
                <div className="assessment-card__score">
                  <CheckCircle size={14} className="score-icon" />
                  <span>Best Score: <strong>{bestResult.score}%</strong></span>
                </div>
              )}

              {cd?.onCooldown ? (
                <div className="assessment-card__cooldown">
                  <AlertTriangle size={14} />
                  <span>Cooldown active: retry in {cd.remainingDays}d</span>
                </div>
              ) : (
                <button
                  onClick={() => handleStartExam(assessment)}
                  className="btn btn--primary assessment-card__btn"
                >
                  Take Test <Play size={14} fill="currentColor" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Rules Confirmation Modal overlay */}
      {selectedAssessment && (
        <div className="modal-overlay">
          <div className="rules-modal">
            <h2>Ready to start?</h2>
            <h3>{selectedAssessment.title}</h3>
            
            <div className="rules-warning">
              <p>Please read these guidelines carefully before proceeding:</p>
              <ul>
                <li>You will have <strong>{selectedAssessment.timePerQuestionSeconds} seconds</strong> per question.</li>
                <li>There is no way to pause the test once it begins.</li>
                <li>Navigating away or closing the page will submit your test in its current state.</li>
                <li>You cannot search for answers. Honor system is enforced.</li>
                <li>If you submit, you cannot retry for <strong>14 days</strong>.</li>
              </ul>
            </div>

            <div className="rules-modal__actions">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="btn btn--ghost"
              >
                Cancel
              </button>
              <button
                onClick={confirmStart}
                className="btn btn--primary confirm-start-btn"
              >
                I Understand, Start Test <Play size={14} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
