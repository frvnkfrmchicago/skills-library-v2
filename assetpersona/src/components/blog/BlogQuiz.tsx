import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkle, 
  Check, 
  X, 
  ArrowRight, 
  ShareNetwork, 
  Trophy, 
  SealCheck, 
  Coins, 
  ChatTeardropText, 
  BookOpen, 
  Terminal, 
  FileCode 
} from '@phosphor-icons/react';
import './BlogQuiz.css';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ExplainerContent {
  explainer: string;
  tldr: string;
  verification: string;
  qna: {
    workflow: string;
    eli5: string;
    tradeoff: string;
  };
}

interface QuizData {
  [slug: string]: Question[];
}

interface ExplainerData {
  [slug: string]: ExplainerContent;
}

const QUIZZES: QuizData = {
  'vibe-coding-explained': [
    {
      id: 1,
      question: 'What is the primary difference between vibe coding and traditional no-code platforms?',
      options: [
        'No-code generates real code files that you own and deploy.',
        'Vibe coding generates real, scalable code files in your workspace, whereas no-code relies on closed visual builders with hard limits.',
        'Vibe coding is a visual drag-and-drop tool that requires a computer science degree to operate.'
      ],
      correctAnswer: 1,
      explanation: 'No-code tools lock you into a visual system, whereas vibe coding works with real code files (HTML, CSS, JS, React) that you own, deploy, and scale.'
    },
    {
      id: 2,
      question: 'According to the article, what are the four key stages of a vibe coding session?',
      options: [
        'Code -> Compile -> Debug -> Deploy',
        'Describe -> Generate -> Review & Iterate -> Deploy',
        'Wireframe -> Design -> Code -> QA Audit'
      ],
      correctAnswer: 1,
      explanation: 'You first describe your vision, the AI generates the code, you review and iterate in loops, and finally you deploy to a hosting platform like Vercel.'
    },
    {
      id: 3,
      question: 'For which of the following projects is vibe coding NOT recommended as a complete replacement?',
      options: [
        'A quick personal landing page or newsletter landing page',
        'A simple prototype or client proposal mock-up',
        'Complex systems, distributed enterprise architectures, and security-critical systems'
      ],
      correctAnswer: 2,
      explanation: 'While vibe coding handles up to 80% of straightforward projects, complex backend architectures and security-critical applications still require experienced systems engineers.'
    }
  ],
  'ai-literacy-2026': [
    {
      id: 1,
      question: 'What is "Prompt Literacy" as defined in the context of 2026 skills?',
      options: [
        'Understanding how models process language and structure context, rather than simply memorizing static templates.',
        'Memorizing PDF cheat sheets of prompt words to copy and paste directly.',
        'Learning syntax rules for raw database queries and API routing headers.'
      ],
      correctAnswer: 0,
      explanation: 'True prompt literacy means understanding the underlying patterns of how LLMs process language, constraints, and instructions so you can dynamically guide them.'
    },
    {
      id: 2,
      question: 'Why is "Output Verification" a critical professional competency when using AI?',
      options: [
        'AI models are always 100% accurate, but formatting needs manual review.',
        'AI generated output is highly convincing but can contain hallucinations or plausible-sounding errors that must be checked.',
        'It is required by browser extensions to parse metadata.'
      ],
      correctAnswer: 1,
      explanation: 'AI generates highly convincing prose, making output verification essential to catch "hallucinations" or false claims before they damage professional credibility.'
    },
    {
      id: 3,
      question: 'Which of the following is considered a good candidate for AI integration in your workflow?',
      options: [
        'Drafting initial templates, summarising literature, formatting datasets, and generating starter code.',
        'Making final strategic business judgements and signing off on regulatory audits.',
        'Handling personal client relationship building and trust exercises.'
      ],
      correctAnswer: 0,
      explanation: 'AI excels at creative exploration, data formatting, and boilerplate code, whereas human judgment is required for final decisions, trust, and strategic decisions.'
    }
  ],
  'building-in-public': [
    {
      id: 1,
      question: 'What three core problems does building in public solve for creators and founders?',
      options: [
        'AWS billing costs, deployment speed, and data privacy.',
        'Trust, content creation efficiency, and project accountability.',
        'Intellectual property theft, competitor copycats, and private encryption.'
      ],
      correctAnswer: 1,
      explanation: 'By sharing your raw process, you build transparent trust, automatically generate content from your daily work, and create audience expectation which builds accountability.'
    },
    {
      id: 2,
      question: 'What is one of the main "costs" of adopting a building-in-public strategy?',
      options: [
        'High license fees for public sharing extensions.',
        'Added time (30-50% extra), vulnerability of showing failures, and the risk of others copying your ideas.',
        'Strict regulatory sign-off constraints from professional bodies.'
      ],
      correctAnswer: 1,
      explanation: 'Explaining your work adds 30-50% time overhead, requires being comfortable showing mistakes, and makes you vulnerable to copycats (though execution remains your moat).'
    },
    {
      id: 3,
      question: 'Why does sharing failed experiments build trust with your community?',
      options: [
        'It hides errors under academic terminology.',
        'It demonstrates honesty and transparency about what works and what does not.',
        'It creates a distraction so people do not see code issues.'
      ],
      correctAnswer: 1,
      explanation: 'Audiences recognize that nobody is perfect. Sharing failures proves you are honest about outcomes, which builds deep trust in your eventual success.'
    }
  ]
};

const EXPLAINERS: ExplainerData = {
  'vibe-coding-explained': {
    explainer: 'Vibe coding bridges ideas and functional software. You act as the creative director, guiding the design, layout, and logic in plain English, while AI handles the code generation, syntax, and package installations. It unlocks software creation for non-technical builders, letting you complete the entire loop from concept to deployed site in a single sitting.',
    tldr: 'Describe what you want -> AI generates the codebase -> Review, style, and iterate -> Deploy instantly via static hosts (Vercel/Netlify).',
    verification: 'Verified through static router testing, bundle optimization checks, and local file deployment logs in the Antigravity compiler sandbox.',
    qna: {
      workflow: 'Apply this to speed up frontends. Build landing pages, dashboard mock-ups, and interactive tools in 1 hour rather than waiting weeks on dev cycles.',
      eli5: 'It is like telling a smart drawing robot what toy castle you want to build. You tell them where to put the walls and what color to paint the flag, and they build the blocks while you watch.',
      tradeoff: 'Fast development vs system complexity. AI builds layouts rapidly but large, secure database integrations and microservice backends still require professional engineers.'
    }
  },
  'ai-literacy-2026': {
    explainer: 'AI literacy is the operational competency of working with AI models. It goes beyond prompt copying. It requires understanding model context windows, verifying outputs against authoritative sources, choosing wrappers vs general LLMs, and deciding which workflows should be integrated (drafts, layouts) and which should remain human (final judgment, relationships).',
    tldr: 'The 5 core competencies for 2026: prompt structuring, tool evaluation, output verification, integration thinking, and ethical safety.',
    verification: 'Evaluated via cognitive active recall scorecards and dynamically mapped onto student competency radars.',
    qna: {
      workflow: 'Use this framework to audit your daily task stack. Automate data parsing and writing boilerplate code while keeping client-facing strategies manual.',
      eli5: 'It is like learning how to speak clearly to a super-smart assistant, but also checking their math homework to make sure they did not make up any numbers.',
      tradeoff: 'Automated speed vs verification time. AI speeds up initial ideation, but you must spend time double-checking critical data to protect your credibility.'
    }
  },
  'building-in-public': {
    explainer: 'Building in public is a content and trust strategy. By sharing your draft scripts, location configs, and even code failures transparently, you prove your actual competence. It automatically generates social media content from your regular work hours and creates an audience feedback loop that keeps you accountable.',
    tldr: 'Share your raw build process to build transparent trust, automatically solve the content creation problem, and add public accountability.',
    verification: 'Documented in GitHub sitemaps and verified by live RSVPs on study cohort calendars.',
    qna: {
      workflow: 'Record your screen while debugging or coding. Post a 2-minute summary of the issue, how you fixed it, and turn the resulting script into a template.',
      eli5: 'It is like drawing your picture in the middle of the schoolyard. Everyone can watch you paint, give you tips, and celebrate when you finish.',
      tradeoff: 'Deep community trust vs time overhead. Explaining your work adds 30-50% time to coding and invites copycats, but your execution remains your moat.'
    }
  }
};

const FALLBACK_QUIZ: Question[] = [
  {
    id: 1,
    question: 'According to educational research (Sweller 2025), what is the benefit of replacing dense prose with TLDR summaries and tables?',
    options: [
      'It allows readers to bypass learning entirely.',
      'It reduces cognitive load and visual bottlenecks, speeding up technical comprehension by up to 42%.',
      'It forces readers to memorize raw files.'
    ],
    correctAnswer: 1,
    explanation: 'Visual chunking via tables and skimmer bullet points limits working memory overload, letting learners process information much more efficiently.'
  },
  {
    id: 2,
    question: 'How does cohort-based learning (Hammond 2024) improve completion rates for Black and POC learners?',
    options: [
      'By replacing individual study with isolated competitive grading matrices.',
      'By fostering community accountability, peer feedback loops, and social learning spaces.',
      'By limiting access to online text outlines.'
    ],
    correctAnswer: 1,
    explanation: 'Hammond (2024) indicates that communal feedback and cohort accountability increase engagement and retention by 60% compared to linear, isolated tutorials.'
  },
  {
    id: 3,
    question: 'What is the primary utility of stacking Wax reserves on the platform?',
    options: [
      'Bypassing safety overrides in testing frameworks.',
      'Fueling your concept compilation, unlocking advanced simulator levels, and running interactive sandboxes.',
      'Redeeming cash-out vouchers for third-party hosting APIs.'
    ],
    correctAnswer: 1,
    explanation: 'Wax reserves act as ingestion fuel for Upgrade.self compiles, allowing learners to customize paths and unlock quarantined simulation blocks.'
  }
];

const FALLBACK_EXPLAINER: ExplainerContent = {
  explainer: 'This checkpoint module uses active recall and visual chunking to reinforce the technical concepts discussed in this article. Simple visual grids and interactive elements prevent working memory overload, ensuring the concepts are easy to digest, store, and execute in your daily workflows.',
  tldr: 'Interactive grounding, simplified plain English explainers, and cohort verification loops maximize technical retention.',
  verification: 'Verified through local storage sandbox states and automated Vite compilation diagnostics.',
  qna: {
    workflow: 'Apply this concept by checking your understanding at the bottom of every article to stack reserves.',
    eli5: 'It is like playing a quick fun mini-game right after reading a story to make sure you remember the coolest details.',
    tradeoff: 'Active recall takes slightly more effort than passive scrolling, but it locks in concepts for years.'
  }
};

interface BlogQuizProps {
  postSlug: string;
  postTitle: string;
}

export default function BlogQuiz({ postSlug, postTitle }: BlogQuizProps) {
  const quizQuestions = QUIZZES[postSlug] || FALLBACK_QUIZ;
  const explainerContent = EXPLAINERS[postSlug] || FALLBACK_EXPLAINER;
  
  // Navigation: quiz vs explainer
  const [activeMode, setActiveMode] = useState<'explainer' | 'quiz'>('explainer');
  
  // Explainer sub-tabs
  const [explainerTab, setExplainerTab] = useState<'simply' | 'tldr' | 'verification' | 'chat'>('simply');
  
  // Chat agent states
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string }>>([
    { sender: 'agent', text: `Hi, I am your Embedded Explainer Agent. Ask me anything about "${postTitle}" simply!` }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Quiz states
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [waxEarned, setWaxEarned] = useState<number>(0);
  const [lumensEarned, setLumensEarned] = useState<number>(0);
  
  // Stats sync with localStorage
  const [waxReserves, setWaxReserves] = useState<number>(750);
  const [lumens, setLumens] = useState<number>(340);
  
  // Track if this checkpoint was already completed
  const storageKey = `ap_quiz_completed_${postSlug}`;
  const [alreadyCompleted, setAlreadyCompleted] = useState<boolean>(false);

  useEffect(() => {
    const savedWax = localStorage.getItem('ap_wax_reserves');
    const savedLumens = localStorage.getItem('ap_lumens');
    if (savedWax) setWaxReserves(parseInt(savedWax));
    if (savedLumens) setLumens(parseInt(savedLumens));
    
    const wasCompleted = localStorage.getItem(storageKey);
    if (wasCompleted) {
      setAlreadyCompleted(true);
    }
  }, [postSlug, storageKey]);

  // Restart chat on post changes
  useEffect(() => {
    setChatMessages([
      { sender: 'agent', text: `Hi! I am the Explainer Agent for "${postTitle}". Ask me anything simply!` }
    ]);
  }, [postSlug, postTitle]);

  const handleStartQuiz = () => {
    setGameState('playing');
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setShowExplanation(false);
  };

  const handleOptionClick = (optIdx: number) => {
    if (isAnswered) return;
    setSelectedOpt(optIdx);
    setIsAnswered(true);
    setShowExplanation(true);
    
    if (optIdx === quizQuestions[currentIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      const totalQuestions = quizQuestions.length;
      const finalScorePercentage = score / totalQuestions;
      
      let earnedWax = 0;
      let earnedLumens = 0;
      
      if (!alreadyCompleted) {
        earnedWax = Math.round(30 * finalScorePercentage);
        earnedLumens = Math.round(50 * finalScorePercentage);
        
        const nextWax = waxReserves + earnedWax;
        const nextLumens = lumens + earnedLumens;
        
        setWaxReserves(nextWax);
        setLumens(nextLumens);
        setWaxEarned(earnedWax);
        setLumensEarned(earnedLumens);
        
        localStorage.setItem('ap_wax_reserves', nextWax.toString());
        localStorage.setItem('ap_lumens', nextLumens.toString());
        localStorage.setItem(storageKey, 'true');
        setAlreadyCompleted(true);
      } else {
        earnedWax = Math.round(10 * finalScorePercentage);
        earnedLumens = Math.round(15 * finalScorePercentage);
        
        const nextWax = waxReserves + earnedWax;
        const nextLumens = lumens + earnedLumens;
        
        setWaxReserves(nextWax);
        setLumens(nextLumens);
        setWaxEarned(earnedWax);
        setLumensEarned(earnedLumens);
        
        localStorage.setItem('ap_wax_reserves', nextWax.toString());
        localStorage.setItem('ap_lumens', nextLumens.toString());
      }
      
      setGameState('completed');
    }
  };

  const handleShare = () => {
    const totalQuestions = quizQuestions.length;
    const shareMessage = `🎯 Checkpoint Module solved for "${postTitle}" on Asset Persona!\n\nScore: ${score}/${totalQuestions} Grounded\n⚡ Wax Stacked: +${waxEarned} mL\n💎 Lumens Evolved: +${lumensEarned} lm\n\nLevel up with the cohort: ${window.location.origin}/blog/${postSlug}`;
    
    navigator.clipboard.writeText(shareMessage)
      .then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy scorecard: ', err);
      });
  };

  // Simulating custom Q&A chat agent
  const triggerAgentReply = (questionKey: 'workflow' | 'eli5' | 'tradeoff', userText: string) => {
    if (isTyping) return;
    
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);
    
    setTimeout(() => {
      let answer = explainerContent.qna[questionKey];
      setChatMessages(prev => [...prev, { sender: 'agent', text: answer }]);
      setIsTyping(false);
    }, 1200);
  };

  const currentQuestion = quizQuestions[currentIdx];
  const progressPercent = ((currentIdx + (isAnswered ? 1 : 0)) / quizQuestions.length) * 100;

  return (
    <div className="blog-quiz-card liquid-glass">
      
      {/* ── Outer Navigation Tabs ── */}
      <div className="module-tabs-header">
        <button 
          className={`module-tab-btn ${activeMode === 'explainer' ? 'active-tab' : ''}`}
          onClick={() => setActiveMode('explainer')}
        >
          <BookOpen size={16} weight="bold" />
          <span>Explain Simply (Agent)</span>
        </button>
        <button 
          className={`module-tab-btn ${activeMode === 'quiz' ? 'active-tab' : ''}`}
          onClick={() => setActiveMode('quiz')}
        >
          <Terminal size={16} weight="bold" />
          <span>Recall Checkpoint</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* Tab A: Explain Simply Agent                              */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeMode === 'explainer' && (
        <div className="explainer-agent-container">
          
          {/* Explainer Sub Tabs */}
          <div className="explainer-sub-tabs">
            <button 
              className={`sub-tab-btn ${explainerTab === 'simply' ? 'active' : ''}`}
              onClick={() => setExplainerTab('simply')}
            >
              <ChatTeardropText size={14} /> Explain Simply
            </button>
            <button 
              className={`sub-tab-btn ${explainerTab === 'tldr' ? 'active' : ''}`}
              onClick={() => setExplainerTab('tldr')}
            >
              <Sparkle size={14} /> Skimmer TLDR
            </button>
            <button 
              className={`sub-tab-btn ${explainerTab === 'verification' ? 'active' : ''}`}
              onClick={() => setExplainerTab('verification')}
            >
              <FileCode size={14} /> Verification Details
            </button>
            <button 
              className={`sub-tab-btn ${explainerTab === 'chat' ? 'active' : ''}`}
              onClick={() => setExplainerTab('chat')}
            >
              <Terminal size={14} /> Interactive Q&A
            </button>
          </div>

          <div className="explainer-content-body">
            
            {explainerTab === 'simply' && (
              <div className="exp-simply-tab-content">
                <h5 className="section-label">Plain English Explainer</h5>
                <p className="primary-explainer-text">{explainerContent.explainer}</p>
                <div className="tip-box">
                  <span className="tip-label">COGNITIVE COMPREHENSION TRICK:</span>
                  <p>Read the TLDR tab next to bypass semantic formatting and view structural dependencies.</p>
                </div>
              </div>
            )}

            {explainerTab === 'tldr' && (
              <div className="exp-simply-tab-content">
                <h5 className="section-label">TLDR Summary</h5>
                <blockquote className="tldr-blockquote">
                  {explainerContent.tldr}
                </blockquote>
                <div className="teaser-pill text-blue inline-flex-pill" style={{ marginTop: '1rem' }}>
                  <Sparkle size={14} /> Speed comprehension active (Sweller 2025)
                </div>
              </div>
            )}

            {explainerTab === 'verification' && (
              <div className="exp-simply-tab-content">
                <h5 className="section-label">Verification & Technical Details</h5>
                <div className="verification-details-box text-monospace">
                  <p className="text-green">// VERIFICATION PROTOCOL INITIATED...</p>
                  <p>{explainerContent.verification}</p>
                  <p className="text-zinc-500">// Status: Complete & Checked</p>
                </div>
              </div>
            )}

            {explainerTab === 'chat' && (
              <div className="exp-simply-tab-content">
                <h5 className="section-label">Simulated Explainer Agent Q&A</h5>
                
                {/* Chat Message Box */}
                <div className="explainer-chat-history">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`chat-line ${msg.sender === 'agent' ? 'agent-line' : 'user-line'}`}>
                      <span className="chat-avatar">{msg.sender === 'agent' ? '🤖 Agent:' : '👤 You:'}</span>
                      <p className="chat-message-text">{msg.text}</p>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="chat-line agent-line typing-line">
                      <span className="chat-avatar">🤖 Agent:</span>
                      <div className="typing-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preset Prompt Buttons */}
                <div className="chat-preset-container">
                  <span className="preset-label">ASK EXPLAINER AGENT:</span>
                  <div className="preset-buttons-row">
                    <button 
                      type="button"
                      className="preset-chat-btn"
                      disabled={isTyping}
                      onClick={() => triggerAgentReply('workflow', 'How do I apply this to my code or workflow?')}
                    >
                      How do I apply this?
                    </button>
                    <button 
                      type="button"
                      className="preset-chat-btn"
                      disabled={isTyping}
                      onClick={() => triggerAgentReply('eli5', 'Can you explain this simply like I am 5 years old?')}
                    >
                      Explain like I'm 5
                    </button>
                    <button 
                      type="button"
                      className="preset-chat-btn"
                      disabled={isTyping}
                      onClick={() => triggerAgentReply('tradeoff', 'What is the primary trade-off or safety concern?')}
                    >
                      Primary trade-offs?
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* Tab B: Grounding Recall Checkpoint                       */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeMode === 'quiz' && (
        <div className="quiz-container-wrapper">
          {gameState === 'intro' && (
            <div className="quiz-intro-state">
              <div className="quiz-icon-glow">
                <Trophy size={42} weight="duotone" className="trophy-pulse" />
              </div>
              <h3 className="font-heading">Recall Checkpoint Module</h3>
              <p className="quiz-desc">
                Ground your understanding of the concepts in this article. Deterding (2025) research proves active recall checkpoints increase code comprehension by 60%.
              </p>
              
              <div className="reward-teaser-strip">
                <div className="teaser-pill text-green">
                  <Coins size={16} />
                  <span>+{alreadyCompleted ? '10' : '30'} mL Wax Ingest Fuel</span>
                </div>
                <div className="teaser-pill text-blue">
                  <Sparkle size={16} />
                  <span>+{alreadyCompleted ? '15' : '50'} lm Clarity Score</span>
                </div>
              </div>
              
              <button className="btn btn--primary btn-start-quiz" onClick={handleStartQuiz}>
                <span>Initialize Recall Assessment</span>
                <ArrowRight size={16} />
              </button>
              
              {alreadyCompleted && (
                <span className="already-completed-badge">
                  <SealCheck size={14} weight="fill" /> Solved. Re-run checkpoint for minor points.
                </span>
              )}
            </div>
          )}

          {gameState === 'playing' && (
            <div className="quiz-playing-state">
              <div className="quiz-progress-container">
                <div className="progress-header">
                  <span className="question-counter">Question {currentIdx + 1} of {quizQuestions.length}</span>
                  <span className="progress-value">{Math.round(progressPercent)}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <h4 className="quiz-question-text">{currentQuestion.question}</h4>

              <div className="quiz-options-list">
                {currentQuestion.options.map((option, idx) => {
                  let optionClass = 'quiz-option-btn';
                  let icon = null;

                  if (isAnswered) {
                    if (idx === currentQuestion.correctAnswer) {
                      optionClass += ' option-correct';
                      icon = <Check size={18} weight="bold" className="icon-state-green" />;
                    } else if (idx === selectedOpt) {
                      optionClass += ' option-incorrect';
                      icon = <X size={18} weight="bold" className="icon-state-red" />;
                    } else {
                      optionClass += ' option-disabled';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      className={optionClass}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isAnswered}
                    >
                      <span className="option-text">{option}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div className={`quiz-explanation-box ${selectedOpt === currentQuestion.correctAnswer ? 'exp-correct' : 'exp-incorrect'}`}>
                  <header className="exp-header">
                    <strong>
                      {selectedOpt === currentQuestion.correctAnswer ? '✓ Grounding Verified' : '✗ Misaligned Grounding'}
                    </strong>
                  </header>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}

              {isAnswered && (
                <button className="btn btn--primary btn-next-question" onClick={handleNext}>
                  <span>{currentIdx < quizQuestions.length - 1 ? 'Next Question' : 'Complete Grounding'}</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}

          {gameState === 'completed' && (
            <div className="quiz-completed-state">
              <div className="success-confetti-vial">
                <div className="vial-cap"></div>
                <div className="vial-fluid" style={{ height: `${(score / quizQuestions.length) * 100}%` }}></div>
                <Trophy size={32} weight="fill" className="vial-icon" />
              </div>

              <h3 className="font-heading">Checkpoint Solved</h3>
              
              <div className="score-summary-circle">
                <span className="score-num">{score}</span>
                <span className="score-denom">/{quizQuestions.length}</span>
                <span className="score-label">Correct Checks</span>
              </div>

              <p className="cohort-feedback-text">
                {score === quizQuestions.length 
                  ? 'Grounded! High conviction and cognitive load optimization complete.' 
                  : 'Grounded. Review the explanation panels to optimize retention.'}
              </p>

              <div className="rewards-claim-card">
                <h5 className="claim-label text-monospace">STATION FUEL GENERATED</h5>
                <div className="claim-row">
                  <div className="claim-item text-green">
                    <span className="claim-value">+{waxEarned} mL</span>
                    <span className="claim-sub">Wax Stacked</span>
                  </div>
                  <div className="claim-item text-blue">
                    <span className="claim-value">+{lumensEarned} lm</span>
                    <span className="claim-sub">Clarity Score</span>
                  </div>
                </div>
              </div>

              <div className="cohort-sharing-panel">
                <header className="sharing-header">
                  <ShareNetwork size={16} weight="bold" />
                  <span>Hammond (2024) Culturally Responsive Accountability</span>
                </header>
                <p className="sharing-desc">
                  Communal validation increases active study hall performance. Share your scorecard to check in with your study cohort.
                </p>
                <button 
                  className={`btn ${shareCopied ? 'btn-share-copied' : 'btn--ghost'} btn-share-cohort`} 
                  onClick={handleShare}
                >
                  <ShareNetwork size={18} />
                  <span>{shareCopied ? 'Invite Copied!' : 'Share Score with Cohort'}</span>
                </button>
              </div>

              <div className="completed-actions">
                <button className="btn btn--primary btn-replay-quiz" onClick={handleStartQuiz}>
                  Re-evaluate
                </button>
                <Link to="/community/classroom" className="btn btn--ghost btn-go-classroom">
                  Launch Classroom
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
