import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CaretLeft, Cpu, Info, ShieldCheck, Trophy, Warning, Pulse } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/useAuth';
import { saveArcadeScore } from '../../data/arcadeStore';
import SEOHead from '../../components/seo/SEOHead';
import './RagOptimizer.css';

interface Scenario {
  id: string;
  title: string;
  goal: string;
  description: string;
  hint: string;
  targets: {
    minRecall: number;
    maxHallucination: number;
    maxCost: number;
    minCoherence: number;
  };
  validate: (params: {
    chunkSize: number;
    chunkOverlap: number;
    temperature: number;
    topK: number;
    mode: 'vector' | 'keyword' | 'hybrid';
  }) => { recall: number; cost: number; coherence: number; hallucination: number; logs: string[] };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'rag-scenario-1',
    title: 'The Fine-Print Return Policy',
    goal: 'Configure the RAG parameters to accurately retrieve nested legal returns conditions without hallucinating.',
    description: 'The dataset has dense semantic descriptions of returns after 30 days. High precision is required.',
    hint: 'Use Vector or Hybrid mode, low temperature (< 0.3) for factual locking, medium chunk size (~600) and Top-K >= 3 to catch all criteria.',
    targets: { minRecall: 90, maxHallucination: 10, maxCost: 500, minCoherence: 70 },
    validate: (p) => {
      const logs = ['Initializing search vector query...'];
      let recall = 30;
      let coherence = Math.round((p.chunkSize / 15) + (p.chunkOverlap > 0 ? 30 : 0));
      coherence = Math.min(100, coherence);

      // Retrieval mode impact
      if (p.mode === 'vector' || p.mode === 'hybrid') {
        recall += 30;
        logs.push('Vector indexing matching semantic anchors...');
      } else {
        logs.push('Keyword search missed synonyms in returns clauses.');
      }

      // Chunk size impact
      if (p.chunkSize >= 400 && p.chunkSize <= 900) {
        recall += 20;
        logs.push('Ideal chunk boundaries captured context cleanly.');
      } else if (p.chunkSize < 400) {
        recall -= 10;
        logs.push('Fragments too small to encompass whole returns clauses.');
      } else {
        logs.push('Diluted vector weights due to large chunk size.');
      }

      // Top-K impact
      if (p.topK >= 3) {
        recall += 15;
      } else {
        logs.push('Low Top-K excluded crucial detail chunks.');
      }

      // Temperature impact
      let hallucination = Math.round(p.temperature * 75 + (1000 - p.chunkSize) * 0.015);
      hallucination = Math.max(0, Math.min(100, hallucination));
      if (p.temperature > 0.4) {
        recall -= 15;
        logs.push('High temperature caused model to fabricate policy clauses.');
      }

      const cost = Math.round(p.topK * p.chunkSize * 0.15);
      recall = Math.max(0, Math.min(100, recall));

      return { recall, cost, coherence, hallucination, logs };
    }
  },
  {
    id: 'rag-scenario-2',
    title: 'Adversarial Prompt Shield',
    goal: 'Protect the vector retrieval from falling into adversarial text traps hidden inside uploaded codebase files.',
    description: 'An attacker inserted prompt injections in comments. The retriever must ignore semantics and match code chunks strictly.',
    hint: 'Adversarial hacks bypass vectors. Use Keyword mode to filter literal patterns, set Temperature to 0.0, and use large chunks (> 1000) to keep guardrails intact.',
    targets: { minRecall: 85, maxHallucination: 0, maxCost: 900, minCoherence: 80 },
    validate: (p) => {
      const logs = ['Running security firewall queries...'];
      let recall = 20;
      let coherence = Math.round((p.chunkSize / 15) + (p.chunkOverlap > 0 ? 30 : 0));
      coherence = Math.min(100, coherence);

      if (p.mode === 'keyword') {
        recall += 50;
        logs.push('Keyword mode bypassed semantic injection hooks.');
      } else if (p.mode === 'hybrid') {
        recall += 30;
        logs.push('Hybrid filters reduced the impact of adversarial semantic maps.');
      } else {
        logs.push('WARNING: Vector search fell for prompt injection token similarities!');
      }

      if (p.chunkSize >= 1000) {
        recall += 20;
      } else {
        logs.push('Small chunks allowed isolated injection triggers to bypass system bounds.');
      }

      let hallucination = p.temperature > 0.1 ? 60 : 0;
      if (p.temperature > 0.0) {
        logs.push('Temperature above zero allowed adversarial instructions to execute.');
      }

      const cost = Math.round(p.topK * p.chunkSize * 0.15);
      recall = Math.max(0, Math.min(100, recall));

      return { recall, cost, coherence, hallucination, logs };
    }
  },
  {
    id: 'rag-scenario-3',
    title: 'The Unseen Acronym Dictionary',
    goal: 'Locate obscure company abbreviations and acronyms that do not exist in general LLM pre-training.',
    description: 'Queries seek terms like "AP-LUM-26". Vector embeddings fail on out-of-vocabulary acronyms.',
    hint: 'Use Hybrid mode (combining BM25 literal search and vector maps), high chunk overlap (> 150) to catch keyword bounds, and high Top-K.',
    targets: { minRecall: 95, maxHallucination: 15, maxCost: 750, minCoherence: 80 },
    validate: (p) => {
      const logs = ['Scanning index tables for acronym hashes...'];
      let recall = 30;
      let coherence = Math.round((p.chunkSize / 15) + (p.chunkOverlap > 0 ? 30 : 0));
      coherence = Math.min(100, coherence);

      if (p.mode === 'hybrid') {
        recall += 45;
        logs.push('Hybrid mode successfully combined lexical search and semantic context.');
      } else if (p.mode === 'keyword') {
        recall += 30;
        logs.push('Lexical matches mapped the literal acronym but lacked context embedding.');
      } else {
        logs.push('Vector match failed due to out-of-vocabulary acronym similarities.');
      }

      if (p.chunkOverlap >= 150) {
        recall += 15;
        logs.push('High overlap caught acronym strings located on chunk boundaries.');
      } else {
        logs.push('Low overlap truncated terms on boundary splits.');
      }

      if (p.topK >= 5) {
        recall += 10;
      }

      let hallucination = Math.round(p.temperature * 50);
      const cost = Math.round(p.topK * p.chunkSize * 0.15);
      recall = Math.max(0, Math.min(100, recall));

      return { recall, cost, coherence, hallucination, logs };
    }
  }
];

export default function RagOptimizer() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [temperature, setTemperature] = useState(0.2);
  const [topK, setTopK] = useState(3);
  const [mode, setMode] = useState<'vector' | 'keyword' | 'hybrid'>('vector');

  // Diagnostic states
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [testRun, setTestRun] = useState(false);

  // Result metrics
  const [metrics, setMetrics] = useState({ recall: 40, cost: 220, coherence: 60, hallucination: 15 });
  const [passed, setPassed] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);

  const activeScenario = SCENARIOS[activeScenarioIdx];

  // Calculate parameters live
  useEffect(() => {
    const res = activeScenario.validate({ chunkSize, chunkOverlap, temperature, topK, mode });
    setMetrics({
      recall: res.recall,
      cost: res.cost,
      coherence: res.coherence,
      hallucination: res.hallucination
    });
    setTestRun(false);
    setPassed(false);
  }, [chunkSize, chunkOverlap, temperature, topK, mode, activeScenario]);

  // Load user progress
  useEffect(() => {
    const saved = localStorage.getItem('ap_completed_rag_scenarios');
    if (saved) {
      try {
        setCompletedScenarios(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleRunDiagnostic = () => {
    setIsDiagnosing(true);
    setRunLogs(['INITIALIZING DIAGNOSTIC SEQUENCE...', `Scenario Target: ${activeScenario.title}`]);

    const finalVal = activeScenario.validate({ chunkSize, chunkOverlap, temperature, topK, mode });

    setTimeout(() => {
      setRunLogs(prev => [...prev, ...finalVal.logs]);
    }, 600);

    setTimeout(() => {
      setIsDiagnosing(false);
      setTestRun(true);

      const pass = 
        finalVal.recall >= activeScenario.targets.minRecall &&
        finalVal.hallucination <= activeScenario.targets.maxHallucination &&
        finalVal.cost <= activeScenario.targets.maxCost &&
        finalVal.coherence >= activeScenario.targets.minCoherence;

      setPassed(pass);

      if (pass) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#fbbf24']
        });

        // Save progress
        const nextCompleted = Array.from(new Set([...completedScenarios, activeScenario.id]));
        setCompletedScenarios(nextCompleted);
        localStorage.setItem('ap_completed_rag_scenarios', JSON.stringify(nextCompleted));

        // Award points
        saveArcadeScore(profile?.id || 'guest', 'prompt-battle', activeScenario.id, 100);
      }
    }, 1500);
  };

  const handleNext = () => {
    if (activeScenarioIdx < SCENARIOS.length - 1) {
      setActiveScenarioIdx(prev => prev + 1);
    } else {
      navigate('/community/arcade');
    }
  };

  return (
    <>
      <SEOHead
        title="RAG Parameter Optimizer Sandbox"
        description="Optimize chunk size, temperature, overlap, and search type to balance cost, recall, coherence, and hallucination risk in this interactive prompt-arcade game."
        path="/community/arcade/rag-optimizer"
      />
      <div className="rag-layout">
      
      {/* Lobby Header */}
      <div className="rag-mainframe">
        <Link to="/community/arcade" className="back-link">
          <CaretLeft size={16} /> Exit to Lobby
        </Link>

        <div className="security-clearance-header">
          <div className="security-title">
            <Cpu size={32} weight="duotone" className="text-accent-blue" />
            <h1>RAG Parameter Optimizer</h1>
          </div>
          <span className="clearance-badge">
            SIMULATOR ACTIVE
          </span>
        </div>

        {/* Scenario description card */}
        <div className="scenario-brief-box">
          <div className="scenario-nav-row">
            {SCENARIOS.map((sc, i) => {
              const isCompleted = completedScenarios.includes(sc.id);
              return (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenarioIdx(i)}
                  className={`scenario-nav-tab ${activeScenarioIdx === i ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  Scenario {i + 1} {isCompleted && '✓'}
                </button>
              );
            })}
          </div>

          <h3 className="scenario-title">{activeScenario.title}</h3>
          <p className="scenario-goal"><strong>Goal:</strong> {activeScenario.goal}</p>
          <p className="scenario-desc">{activeScenario.description}</p>
          
          <div className="scenario-hint-box">
            <Info size={16} weight="duotone" />
            <p><strong>Hint:</strong> {activeScenario.hint}</p>
          </div>
        </div>

        {/* Layout with Sliders */}
        <div className="rag-editor-grid">
          <div className="rag-controls-card liquid-glass">
            <h3>Retriever Sliders</h3>

            <div className="slider-group">
              <div className="slider-label-row">
                <span>Chunk Size</span>
                <span className="slider-value">{chunkSize} tokens</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="1500" 
                step="50"
                value={chunkSize}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setChunkSize(val);
                  if (chunkOverlap >= val) setChunkOverlap(val - 50);
                }}
                className="rag-range"
              />
            </div>

            <div className="slider-group">
              <div className="slider-label-row">
                <span>Chunk Overlap</span>
                <span className="slider-value">{chunkOverlap} tokens</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={Math.max(0, chunkSize - 50)} 
                step="25"
                value={chunkOverlap} 
                onChange={(e) => setChunkOverlap(Number(e.target.value))}
                className="rag-range"
              />
            </div>

            <div className="slider-group">
              <div className="slider-label-row">
                <span>Temperature</span>
                <span className="slider-value">{temperature}</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="1.2" 
                step="0.1"
                value={temperature} 
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="rag-range"
              />
            </div>

            <div className="slider-group">
              <div className="slider-label-row">
                <span>Top-K Documents</span>
                <span className="slider-value">{topK}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="8" 
                step="1"
                value={topK} 
                onChange={(e) => setTopK(Number(e.target.value))}
                className="rag-range"
              />
            </div>

            <div className="slider-group">
              <span className="group-title-label">Search Match Type</span>
              <div className="rag-mode-buttons">
                {(['vector', 'keyword', 'hybrid'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`mode-select-btn ${mode === m ? 'active' : ''}`}
                    onClick={() => setMode(m)}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleRunDiagnostic} 
              disabled={isDiagnosing}
              className="btn btn--primary evaluate-btn"
            >
              <Pulse size={18} />
              <span>{isDiagnosing ? 'Running Simulation...' : 'Test Pipeline Configuration'}</span>
            </button>
          </div>

          {/* Dials / Gauges card */}
          <div className="rag-gauges-card liquid-glass">
            <h3>System Metrics</h3>
            
            <div className="gauges-grid">
              
              {/* Gauge 1: Recall */}
              <div className="gauge-item">
                <svg className="gauge-svg" viewBox="0 0 100 100">
                  <circle className="gauge-bg-circle" cx="50" cy="50" r="40" />
                  <circle 
                    className="gauge-fill-circle recall-fill" 
                    cx="50" cy="50" r="40" 
                    style={{ strokeDashoffset: 251.2 - (251.2 * metrics.recall) / 100 }}
                  />
                </svg>
                <div className="gauge-label-box">
                  <span className="gauge-value">{metrics.recall}%</span>
                  <span className="gauge-name">Recall Accuracy</span>
                  <span className="gauge-target">Target: &gt;={activeScenario.targets.minRecall}%</span>
                </div>
              </div>

              {/* Gauge 2: Hallucinations */}
              <div className="gauge-item">
                <svg className="gauge-svg" viewBox="0 0 100 100">
                  <circle className="gauge-bg-circle" cx="50" cy="50" r="40" />
                  <circle 
                    className="gauge-fill-circle hallucination-fill" 
                    cx="50" cy="50" r="40" 
                    style={{ strokeDashoffset: 251.2 - (251.2 * metrics.hallucination) / 100 }}
                  />
                </svg>
                <div className="gauge-label-box">
                  <span className="gauge-value">{metrics.hallucination}%</span>
                  <span className="gauge-name">Hallucination Risk</span>
                  <span className="gauge-target">Target: &lt;={activeScenario.targets.maxHallucination}%</span>
                </div>
              </div>

              {/* Gauge 3: Coherence */}
              <div className="gauge-item">
                <svg className="gauge-svg" viewBox="0 0 100 100">
                  <circle className="gauge-bg-circle" cx="50" cy="50" r="40" />
                  <circle 
                    className="gauge-fill-circle coherence-fill" 
                    cx="50" cy="50" r="40" 
                    style={{ strokeDashoffset: 251.2 - (251.2 * metrics.coherence) / 100 }}
                  />
                </svg>
                <div className="gauge-label-box">
                  <span className="gauge-value">{metrics.coherence}%</span>
                  <span className="gauge-name">Context Coherence</span>
                  <span className="gauge-target">Target: &gt;={activeScenario.targets.minCoherence}%</span>
                </div>
              </div>

              {/* Gauge 4: Token Cost */}
              <div className="gauge-item">
                <svg className="gauge-svg" viewBox="0 0 100 100">
                  <circle className="gauge-bg-circle" cx="50" cy="50" r="40" />
                  <circle 
                    className="gauge-fill-circle cost-fill" 
                    cx="50" cy="50" r="40" 
                    style={{ strokeDashoffset: 251.2 - (251.2 * Math.min(100, (metrics.cost / 10))) / 100 }}
                  />
                </svg>
                <div className="gauge-label-box">
                  <span className="gauge-value">{metrics.cost} tkn</span>
                  <span className="gauge-name">Token cost / query</span>
                  <span className="gauge-target">Target: &lt;={activeScenario.targets.maxCost}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Logs Terminal */}
        {(testRun || isDiagnosing) && (
          <div className="evaluation-feedback-terminal">
            <div className="terminal-titlebar">
              <div className="terminal-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <span className="terminal-title">simulation_vector_logs</span>
            </div>
            
            <div className="terminal-body">
              {runLogs.map((log, idx) => (
                <div key={idx} className="terminal-line">
                  &gt; {log}
                </div>
              ))}

              {testRun && !isDiagnosing && (
                <div className="terminal-result-row">
                  {passed ? (
                    <div className="result-pass">
                      <ShieldCheck size={20} weight="fill" />
                      <span>RAG PIPELINE ACCURACY VERIFIED. PIPELINE LOCKED.</span>
                    </div>
                  ) : (
                    <div className="result-fail">
                      <Warning size={20} weight="fill" />
                      <span>OPTIMIZATION MISALIGNED. System parameters failed target thresholds. Check logs and slide parameters.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar scenario lists */}
      <div className="battle-leaderboard-panel">
        <h3>
          <Trophy size={20} weight="duotone" /> Sandbox Scenarios
        </h3>
        
        <div className="sidebar-scenarios-list" style={{ marginTop: '1rem' }}>
          {SCENARIOS.map((sc, i) => {
            const completed = completedScenarios.includes(sc.id);
            return (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioIdx(i)}
                className={`sidebar-scenario-item ${activeScenarioIdx === i ? 'active' : ''}`}
              >
                <div className="item-title-row">
                  <span>{sc.title}</span>
                  {completed && <span style={{ color: '#10b981', fontSize: '0.75rem' }}>Secured</span>}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Target Recall: &gt;={sc.targets.minRecall}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Modal */}
      {passed && testRun && !isDiagnosing && (
        <div className="success-overlay">
          <div className="success-glow-modal">
            <div className="success-icon-shield">
              <ShieldCheck size={72} weight="fill" />
            </div>
            <h2>RAG OPTIMIZED SUCCESSFULLY!</h2>
            <p>You solved the scenario with a retrieval recall score of <strong style={{ color: '#10b981' }}>{metrics.recall}%</strong> under token budget constraints.</p>
            
            <div className="success-actions">
              <button onClick={handleNext} className="btn btn--primary">
                {activeScenarioIdx < SCENARIOS.length - 1 ? 'Proceed to Next Scenario' : 'Return to Arcade Lobby'}
              </button>
              <button onClick={() => setTestRun(false)} className="btn btn--text">
                Review Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
