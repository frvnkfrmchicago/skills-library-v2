import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CaretLeft, Trophy, Warning, ShieldCheck } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/useAuth';
import { 
  PROMPT_SCENARIOS, 
  evaluatePromptBattle, 
  saveArcadeScore, 
  getArcadeScores 
} from '../../data/arcadeStore';
import type { PromptScenario } from '../../data/arcadeStore';
import './Arcade.css';

export default function PromptBattle() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [scenario, setScenario] = useState<PromptScenario | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Result state
  const [score, setScore] = useState<number | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [matches, setMatches] = useState<string[]>([]);
  const [violation, setViolation] = useState<string | undefined>(undefined);

  useEffect(() => {
    const found = PROMPT_SCENARIOS.find(s => s.id === scenarioId);
    if (!found) {
      navigate('/community/arcade');
      return;
    }
    setScenario(found);

    // Fetch high score
    if (profile) {
      getArcadeScores(profile.id).then((scores) => {
        const matching = scores.filter(s => s.gameId === 'prompt-battle' && s.levelId === found.id);
        if (matching.length > 0) {
          setHighScore(Math.max(...matching.map(s => s.score)));
        }
      });
    }
  }, [scenarioId, profile, navigate]);

  if (!scenario) return null;

  const charCount = userPrompt.length;
  const isOverLimit = charCount > scenario.maxChars;

  const hasForbiddenWords = () => {
    const lowerPrompt = userPrompt.toLowerCase();
    return scenario.forbiddenWords.some(word => lowerPrompt.includes(word.toLowerCase()));
  };

  const handleEvaluate = async () => {
    if (!userPrompt.trim() || isEvaluating) return;
    
    setIsEvaluating(true);
    setScore(null);
    setViolation(undefined);

    // Add a small delay to simulate LLM processing
    setTimeout(async () => {
      const evaluation = evaluatePromptBattle(scenario, userPrompt);
      
      setScore(evaluation.score);
      setAiResponse(evaluation.aiResponse);
      setMatches(evaluation.matches);
      setViolation(evaluation.violation);
      setIsEvaluating(false);

      if (evaluation.score >= 80) {
        // Trigger success confetti!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f43f5e', '#818cf8', '#10b981']
        });
      }

      // Save to store
      if (profile) {
        await saveArcadeScore(
          profile.id,
          'prompt-battle',
          scenario.id,
          evaluation.score,
          userPrompt,
          evaluation.aiResponse
        );
        // Refresh high score
        if (evaluation.score > highScore) {
          setHighScore(evaluation.score);
        }
      }
    }, 1200);
  };

  return (
    <div className="prompt-battle-layout">
      {/* Main Arena */}
      <div className="battle-arena-panel">
        <Link to="/community/arcade" className="back-link">
          <CaretLeft size={16} /> Back to Arcade Lobby
        </Link>

        <div className="arena-title-row">
          <h1>{scenario.title}</h1>
          <span className={`card-difficulty-badge ${scenario.difficulty.toLowerCase()}`}>
            {scenario.difficulty}
          </span>
        </div>

        <div className="scenario-brief-box">
          <h3>The Challenge</h3>
          <p>{scenario.description}</p>
        </div>

        {/* Constraints Display */}
        <div className="constraints-grid">
          <div className={`constraint-card ${isOverLimit ? 'violated' : ''}`}>
            <h4>Max Characters</h4>
            <span className={`char-limit-count ${isOverLimit ? 'danger' : ''}`}>
              {charCount} / {scenario.maxChars}
            </span>
          </div>

          <div className={`constraint-card ${hasForbiddenWords() ? 'violated' : ''}`}>
            <h4>Forbidden Words</h4>
            <div className="forbidden-tokens-list">
              {scenario.forbiddenWords.map((word) => (
                <span key={word} className="forbidden-token-badge">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Input Console */}
        <div className="prompt-composer-console">
          <div className="console-label-row">
            <span>Write your LLM prompt instructions:</span>
            <span className={isOverLimit ? 'terminal-error' : ''}>
              {scenario.maxChars - charCount} remaining
            </span>
          </div>
          <textarea
            className="console-textarea"
            rows={5}
            placeholder="Type your system prompts or prefix instructions here..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          />

          <div className="arena-submit-row">
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !userPrompt.trim()}
              className="btn btn--eval"
            >
              {isEvaluating ? 'Running Sentiment Analysis...' : 'Evaluate Prompt'}
            </button>
          </div>
        </div>

        {/* Output Terminal */}
        {(score !== null || isEvaluating || violation) && (
          <div className="evaluation-feedback-terminal">
            <div className="terminal-titlebar">
              <div className="terminal-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <span className="terminal-title">evaluation_output_log</span>
            </div>

            <div className="terminal-body">
              {isEvaluating ? (
                <div>
                  <span className="terminal-line">&gt; Initiating evaluation sequence...</span>
                  <br />
                  <span className="terminal-line">&gt; Analyzing semantic sentiment vectors...</span>
                </div>
              ) : violation ? (
                <div className="terminal-error">
                  <span>&gt; CONSTRAINT VIOLATION DETECTED:</span>
                  <br />
                  <span>&gt; {violation}</span>
                  <br />
                  <span>&gt; SCORE: 0%</span>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>&gt; TARGET SENTIMENT MATCH RATE:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: (score ?? 0) >= 80 ? '#10b981' : '#f59e0b' }}>
                      {score ?? 0}%
                    </span>
                  </div>

                  <div className="sentiment-meter-bar">
                    <div className="sentiment-fill" style={{ width: `${score ?? 0}%` }} />
                  </div>

                  {matches.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ color: '#818cf8' }}>Matches found:</span>
                      <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                        {matches.map(m => (
                          <li key={m} style={{ listStyleType: 'square' }}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <span>&gt; SIMULATED AI RESPONSE:</span>
                  <p style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    marginTop: '0.5rem',
                    fontFamily: 'sans-serif'
                  }}>
                    {aiResponse}
                  </p>

                  {(score ?? 0) >= 80 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginTop: '1.5rem' }}>
                      <ShieldCheck size={20} weight="fill" />
                      <span>Challenge Completed! Point reward granted.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginTop: '1.5rem' }}>
                      <Warning size={20} weight="fill" />
                      <span>Aim for at least 80% sentiment match to claim your Skill Points rewards.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Scenarios & High Score */}
      <div className="battle-leaderboard-panel">
        <h3>
          <Trophy size={20} weight="duotone" /> Arena Details
        </h3>
        
        <div style={{ marginBottom: '2rem' }}>
          <div className="stat-label">Your Personal Best</div>
          <div className="stat-value" style={{ color: highScore >= 80 ? '#10b981' : '#fff' }}>
            {highScore}%
          </div>
        </div>

        <h3>Other Scenarios</h3>
        <div className="sidebar-scenarios-list">
          {PROMPT_SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setUserPrompt('');
                setScore(null);
                setViolation(undefined);
                navigate(`/community/arcade/battle/${s.id}`);
              }}
              className={`sidebar-scenario-item ${s.id === scenarioId ? 'active' : ''}`}
            >
              <div className="item-title-row">
                <span>{s.title}</span>
                <span className="item-diff">{s.difficulty}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Reward: +{s.pxReward} Skill Points
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
