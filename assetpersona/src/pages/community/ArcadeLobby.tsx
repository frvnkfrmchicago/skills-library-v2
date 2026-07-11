import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GameController, Trophy, Warning, Target, Users, CalendarPlus, X, SealCheck, Cpu } from '@phosphor-icons/react';
import { useAuth } from '../../context/useAuth';
import { getArcadeScores, PROMPT_SCENARIOS, JAILBREAK_LEVELS } from '../../data/arcadeStore';
import type { ArcadeGameScore } from '../../data/arcadeStore';
import './Arcade.css';

export default function ArcadeLobby() {
  const { profile } = useAuth();
  const [scores, setScores] = useState<ArcadeGameScore[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  // Cohort Challenge states
  const [showModal, setShowModal] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState<{ title: string; gameId: string; levelId: string } | null>(null);
  const [challengeDate, setChallengeDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [challengeTime, setChallengeTime] = useState('18:00 UTC');
  const [challengeGoal, setChallengeGoal] = useState('Aim to secure 90%+ matching validation score.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);

  const handleChallengeClick = (title: string, gameId: string, levelId: string) => {
    setChallengeTarget({ title, gameId, levelId });
    setShowModal(true);
    setErrorMsg(null);
    setSuccessToast(false);
  };

  const handleChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeTarget) return;
    
    // Enforce points requirement
    if (totalPoints < 50) {
      setErrorMsg('Insufficient points. You need at least 50 Skill Points to challenge your cohort.');
      return;
    }
    
    // Deduct points
    const nextPoints = totalPoints - 50;
    setTotalPoints(nextPoints);
    localStorage.setItem('ap_user_points', nextPoints.toString());
    
    // Schedule event in cohort calendar
    const savedSessions = localStorage.getItem('ap_cohort_sessions') || '[]';
    let sessions = [];
    try {
      sessions = JSON.parse(savedSessions);
    } catch (err) {
      sessions = [];
    }
    
    // Format date nicely (e.g. "June 05, 2026")
    const dateObj = new Date(challengeDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    const newSession = {
      id: `arcade-challenge-${Date.now()}`,
      title: `Cohort Duel: ${challengeTarget.title}`,
      date: formattedDate,
      time: challengeTime,
      host: (profile as any)?.username || 'You (Host)',
      rsvpsCount: 1,
      zoomLink: `https://zoom.us/j/studyhall-${challengeTarget.levelId}`,
      description: challengeGoal || `Communal study circle checking vulnerability states for ${challengeTarget.title}.`
    };
    
    sessions.push(newSession);
    localStorage.setItem('ap_cohort_sessions', JSON.stringify(sessions));
    
    setSuccessToast(true);
    setErrorMsg(null);
    
    setTimeout(() => {
      setShowModal(false);
      setSuccessToast(false);
    }, 2000);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleX = (yc - y) / 12;
    const angleY = (x - xc) / 12;
    card.style.setProperty('--rx', `${angleX}deg`);
    card.style.setProperty('--ry', `${angleY}deg`);
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  }, []);


  useEffect(() => {
    // Read local/live points
    const storedPts = localStorage.getItem('ap_user_points') || '350';
    setTotalPoints(parseInt(storedPts, 10));

    if (profile) {
      getArcadeScores(profile.id).then((data) => {
        setScores(data);
      });
    }
  }, [profile]);

  const isScenarioCompleted = (id: string) => {
    const list = scores.filter((s) => s.gameId === 'prompt-battle' && s.levelId === id);
    return list.some((s) => s.score >= 80);
  };

  const isJailbreakCompleted = (id: string) => {
    const list = scores.filter((s) => s.gameId === 'jailbreak' && s.levelId === id);
    return list.some((s) => s.score >= 100);
  };

  const getHighScore = (gameId: 'prompt-battle' | 'jailbreak', levelId: string) => {
    const list = scores.filter((s) => s.gameId === gameId && s.levelId === levelId);
    if (list.length === 0) return 0;
    return Math.max(...list.map((s) => s.score));
  };

  return (
    <div className="arcade-lobby">
      {/* Header and Call to Action */}
      <div className="arcade-header">
        <div className="header-glow-text">
          <h1>AI Prompt Arcade</h1>
          <p>Hone your prompting skills, test RAG defenses, and bypass AI firewalls in interactive simulation sandboxes.</p>
        </div>
        <div className="arcade-user-stats">
          <div className="stat-glow-card pts">
            <span className="stat-label">Your Skill Points Balance</span>
            <span className="stat-value pts-val">{totalPoints} Skill Points</span>
          </div>
          <div className="stat-glow-card">
            <span className="stat-label">Games Solved</span>
            <span className="stat-value">
              {scores.filter((s) => s.score >= 80).length} / {PROMPT_SCENARIOS.length + JAILBREAK_LEVELS.length + 3}
            </span>
          </div>
        </div>
      </div>

      {/* Prompt Battle Arena Section */}
      <div className="arcade-section">
        <h2>
          <Target size={24} weight="duotone" /> Prompt Battle Arena
        </h2>
        <div className="arcade-grid">
          {PROMPT_SCENARIOS.map((scenario) => {
            const completed = isScenarioCompleted(scenario.id);
            const highScore = getHighScore('prompt-battle', scenario.id);
            return (
              <div
                key={scenario.id}
                className="cyber-card"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <span className={`card-difficulty-badge ${scenario.difficulty.toLowerCase()}`}>
                  {scenario.difficulty}
                </span>
                <div className="cyber-card-content">
                  <h3>{scenario.title}</h3>
                  <p>{scenario.description}</p>
                  
                  <div className="cyber-card-meta">
                    <span className="meta-px">+{scenario.pxReward} Skill Points</span>
                    {highScore > 0 ? (
                      <span className={`meta-status ${completed ? 'completed' : 'pending'}`}>
                        High Score: {highScore}%
                      </span>
                    ) : (
                      <span className="meta-status pending">Unresolved</span>
                    )}
                  </div>
                </div>
                <div className="cyber-card-actions">
                  <Link to={`/community/arcade/battle/${scenario.id}`} className="cyber-card-link">
                    <button className="cyber-play-btn">
                      <GameController size={18} weight="bold" />
                      {highScore > 0 ? 'Try Again' : 'Enter Arena'}
                    </button>
                  </Link>
                  <button 
                    type="button" 
                    className="cyber-challenge-btn"
                    onClick={() => handleChallengeClick(scenario.title, 'prompt-battle', scenario.id)}
                  >
                    <Users size={16} /> Challenge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jailbreak Puzzle Section */}
      <div className="arcade-section">
        <h2>
          <Warning size={24} weight="duotone" /> Jailbreak Firewalls
        </h2>
        <div className="arcade-grid">
          {JAILBREAK_LEVELS.map((level) => {
            const completed = isJailbreakCompleted(level.id);
            return (
              <div
                key={level.id}
                className="cyber-card"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <span className={`card-difficulty-badge ${level.difficulty.toLowerCase()}`}>
                  {level.difficulty}
                </span>
                <div className="cyber-card-content">
                  <h3>{level.title}</h3>
                  <p>{level.description}</p>

                  <div className="cyber-card-meta">
                    <span className="meta-px">+{level.pxReward} Skill Points</span>
                    {completed ? (
                      <span className="meta-status completed">Secured (Passed)</span>
                    ) : (
                      <span className="meta-status pending">Locked</span>
                    )}
                  </div>
                </div>
                <div className="cyber-card-actions">
                  <Link to={`/community/arcade/jailbreak/${level.id}`} className="cyber-card-link">
                    <button className="cyber-play-btn">
                      <Trophy size={18} weight="bold" />
                      {completed ? 'Replay Level' : 'Initialize Bypass'}
                    </button>
                  </Link>
                  <button 
                    type="button" 
                    className="cyber-challenge-btn"
                    onClick={() => handleChallengeClick(level.title, 'jailbreak', level.id)}
                  >
                    <Users size={16} /> Challenge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RAG Parameter Engineering Section */}
      <div className="arcade-section">
        <h2>
          <Cpu size={24} weight="duotone" /> RAG Parameter Engineering
        </h2>
        <div className="arcade-grid">
          <div
            className="cyber-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <span className="card-difficulty-badge hard">
              Variable
            </span>
            <div className="cyber-card-content">
              <h3>RAG Parameter Optimizer</h3>
              <p>Tune chunk size, overlap, temperature, Top-K, and search type to build highly factual, cost-optimized vector pipelines.</p>
              
              <div className="cyber-card-meta">
                <span className="meta-px">+50 Skill Points</span>
                <span className="meta-status pending">Interactive Sandbox</span>
              </div>
            </div>
            <div className="cyber-card-actions">
              <Link to="/community/arcade/rag-optimizer" className="cyber-card-link">
                <button className="cyber-play-btn">
                  <GameController size={18} weight="bold" />
                  Enter Sandbox
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Challenge Scheduler Modal */}
      {showModal && challengeTarget && (
        <div className="challenge-modal-overlay">
          <div className="challenge-modal-card">
            <button className="challenge-modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <div className="challenge-modal-header">
              <CalendarPlus size={24} weight="duotone" className="text-accent-salmon" />
              <h3>Cohort Challenge</h3>
            </div>
            
            <p className="challenge-modal-desc">
              Schedule a group study hall calendar entry for <strong>{challengeTarget.title}</strong>. 
              Staking 50 Skill Points commits your cohort to group verification (Hammond 2024).
            </p>

            <form onSubmit={handleChallengeSubmit} className="challenge-modal-form">
              <div className="challenge-form-group">
                <label>Target Game / Level</label>
                <input type="text" readOnly value={challengeTarget.title} style={{ opacity: 0.7 }} />
              </div>

              <div className="challenge-form-group">
                <label>Study Hall Date</label>
                <input 
                  type="date" 
                  value={challengeDate} 
                  onChange={(e) => setChallengeDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="challenge-form-group">
                <label>Study Hall Time</label>
                <select 
                  value={challengeTime} 
                  onChange={(e) => setChallengeTime(e.target.value)}
                >
                  <option value="12:00 UTC">12:00 UTC (Early Afternoon)</option>
                  <option value="15:00 UTC">15:00 UTC (Midday Sync)</option>
                  <option value="18:00 UTC">18:00 UTC (Evening Review)</option>
                  <option value="21:00 UTC">21:00 UTC (Late Night Run)</option>
                </select>
              </div>

              <div className="challenge-form-group">
                <label>Cohort Learning Goal</label>
                <textarea 
                  rows={2} 
                  value={challengeGoal} 
                  onChange={(e) => setChallengeGoal(e.target.value)}
                  placeholder="e.g. Compare system prompt limits or debug bypass filters."
                />
              </div>

              {errorMsg && (
                <div className="challenge-error-message">
                  <Warning size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successToast && (
                <div className="challenge-success-toast">
                  <SealCheck size={16} weight="fill" />
                  <span>Study session scheduled on cohort calendar!</span>
                </div>
              )}

              <div className="challenge-modal-actions">
                <button 
                  type="button" 
                  className="btn challenge-btn-cancel" 
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn challenge-btn-submit"
                  disabled={successToast}
                >
                  Commit Challenge (-50 pts)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
