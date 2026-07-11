import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CaretLeft, Terminal, PaperPlaneRight, ShieldCheck } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/useAuth';
import { 
  JAILBREAK_LEVELS, 
  evaluateJailbreak, 
  saveArcadeScore, 
  getArcadeScores 
} from '../../data/arcadeStore';
import type { JailbreakLevel } from '../../data/arcadeStore';
import './Arcade.css';

interface TerminalMessage {
  sender: 'user' | 'ai' | 'system';
  text: string;
}

export default function JailbreakChallenge() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [level, setLevel] = useState<JailbreakLevel | null>(null);
  const [history, setHistory] = useState<TerminalMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = JAILBREAK_LEVELS.find(l => l.id === levelId);
    if (!found) {
      navigate('/community/arcade');
      return;
    }
    setLevel(found);
    setIsCompleted(false);

    // Initial greeting from the AI security unit
    setHistory([
      {
        sender: 'system',
        text: `INITIALIZING SECURE LINK TO PROTOCOL: ${found.title.toUpperCase()}`
      },
      {
        sender: 'ai',
        text: `Secure terminal established. Protection matrix online. What is your query?`
      }
    ]);

    // Fetch user progress
    if (profile) {
      getArcadeScores(profile.id).then((scores) => {
        const completedIds = scores
          .filter(s => s.gameId === 'jailbreak' && s.score >= 100)
          .map(s => s.levelId);
        setCompletedLevels(completedIds);
        if (completedIds.includes(found.id)) {
          setIsCompleted(true);
        }
      });
    }
  }, [levelId, profile, navigate]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  if (!level) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isSending || isCompleted) return;

    const userMsg = userInput;
    setUserInput('');
    setIsSending(true);

    // Append user message
    setHistory(prev => [...prev, { sender: 'user', text: userMsg }]);

    // Simulated evaluation
    setTimeout(async () => {
      const result = evaluateJailbreak(level, userMsg);
      setHistory(prev => [...prev, { sender: 'ai', text: result.aiResponse }]);
      setIsSending(false);

      if (result.success) {
        setIsCompleted(true);
        setHistory(prev => [
          ...prev,
          { sender: 'system', text: 'DECRYPTION CRITICAL SUCCESS: SECRET CODE CAPTURED!' }
        ]);

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#10b981', '#6366f1', '#f59e0b']
        });

        if (profile) {
          await saveArcadeScore(
            profile.id,
            'jailbreak',
            level.id,
            100,
            userMsg,
            result.aiResponse
          );
          setCompletedLevels(prev => [...prev, level.id]);
        }
      }
    }, 1000);
  };

  const handleNextLevel = () => {
    const nextIdx = JAILBREAK_LEVELS.findIndex(l => l.id === level.id) + 1;
    if (nextIdx < JAILBREAK_LEVELS.length) {
      navigate(`/community/arcade/jailbreak/${JAILBREAK_LEVELS[nextIdx].id}`);
    } else {
      navigate('/community/arcade');
    }
  };

  return (
    <div className="jailbreak-layout">
      {/* Main Terminal */}
      <div className="jailbreak-mainframe">
        <Link to="/community/arcade" className="back-link">
          <CaretLeft size={16} /> Exit to Lobby
        </Link>

        <div className="security-clearance-header">
          <div className="security-title">
            <h1>{level.title}</h1>
          </div>
          <span className="clearance-badge">
            SECURITY LEVEL: {level.difficulty.toUpperCase()}
          </span>
        </div>

        <div className="firewall-description">
          <h3>Target Firewall Rules</h3>
          <p>{level.description}</p>
        </div>

        {/* Console logs */}
        <div className="terminal-history-scroll" ref={scrollRef}>
          {history.map((msg, idx) => (
            <div key={idx} className={`terminal-line ${msg.sender}-line`}>
              {msg.sender === 'user' && <span>&gt; </span>}
              {msg.sender === 'system' && <span>[SYS] </span>}
              {msg.sender === 'ai' && <span>[AI] </span>}
              {msg.text}
            </div>
          ))}
          {isSending && (
            <div className="terminal-line ai-line">
              <span>[AI] processing query...</span>
            </div>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="terminal-input-prompt">
          <span className="terminal-chevron">&gt;</span>
          <input
            type="text"
            className="terminal-input-field"
            placeholder={isCompleted ? "Access granted. System secured." : "Construct your adversarial prompt to bypass firewall restrictions..."}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isSending || isCompleted}
          />
          <button type="submit" className="terminal-send-btn" disabled={isSending || isCompleted || !userInput.trim()}>
            <PaperPlaneRight size={18} weight="fill" />
          </button>
        </form>
      </div>

      {/* Sidebar Details */}
      <div className="battle-leaderboard-panel">
        <h3>
          <Terminal size={20} weight="duotone" /> Level Directory
        </h3>

        <div className="sidebar-scenarios-list" style={{ marginTop: '1rem' }}>
          {JAILBREAK_LEVELS.map(lvl => {
            const completed = completedLevels.includes(lvl.id);
            return (
              <button
                key={lvl.id}
                onClick={() => navigate(`/community/arcade/jailbreak/${lvl.id}`)}
                className={`sidebar-scenario-item ${lvl.id === levelId ? 'active' : ''}`}
              >
                <div className="item-title-row">
                  <span>{lvl.title}</span>
                  {completed && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>Passed</span>}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Reward: +{lvl.pxReward} Skill Points
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Modal */}
      {isCompleted && (
        <div className="success-overlay">
          <div className="success-glow-modal">
            <div className="success-icon-shield">
              <ShieldCheck size={72} weight="fill" />
            </div>
            <h2>FIREWALL BYPASSED!</h2>
            <p>You extracted the secret code: <strong style={{ color: '#f59e0b', fontFamily: 'monospace' }}>{level.secretCode}</strong></p>
            
            <div className="success-actions">
              <button onClick={handleNextLevel} className="btn btn--primary">
                {JAILBREAK_LEVELS.findIndex(l => l.id === level.id) + 1 < JAILBREAK_LEVELS.length 
                  ? 'Proceed to Next Level' 
                  : 'Return to Lobby'}
              </button>
              <button onClick={() => setIsCompleted(false)} className="btn btn--text">
                Review Console Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
