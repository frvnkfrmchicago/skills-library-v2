import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, Terminal, Database, Sparkle, CheckCircle, 
  BookOpen, FileText, SealCheck, UsersThree, 
  ShieldCheck, Trophy, GameController, HardDrive, Pulse
} from '@phosphor-icons/react';
import './Orchestration.css';

interface SwarmLane {
  id: string;
  lane: string;
  agent: string;
  icon: any;
  status: 'completed' | 'running' | 'idle';
  summary: string;
  database: string;
  files: string[];
  citations: string[];
  details: string;
}

const SWARM_LANES: SwarmLane[] = [
  {
    id: '01',
    lane: 'Lane 1 — Gamification System & Streak Engine',
    agent: 'Agent 1 (Gamification)',
    icon: Trophy,
    status: 'completed',
    summary: 'Weekly leagues, streak tracking, daily goal thresholds, and local bypass stores.',
    database: 'user_leagues, streak_logs',
    files: [
      'supabase/migrations/20260521000000_uxcel_gamification.sql',
      'src/data/leaguesStore.ts',
      'src/components/learn/StreakCard.tsx',
      'src/pages/community/Leaderboard.tsx'
    ],
    citations: ['experience-designing', 'consistency-checking'],
    details: 'Tracks unique calendar days of user learning events. Automatically recalculates bracket rankings on weekly Skill Points updates. Displays a 7-day activity strip and tier ranking.'
  },
  {
    id: '02',
    lane: 'Lane 2 — Quiz & Micro-Learning Engine',
    agent: 'Agent 2 (Quiz Engine)',
    icon: SealCheck,
    status: 'completed',
    summary: 'Fullscreen interactive quiz modals, multiple choice validation, and progress feedback.',
    database: 'modulesStore.ts',
    files: [
      'src/pages/community/Module.tsx',
      'src/pages/community/Module.css',
      'src/components/learn/QuizModal.tsx'
    ],
    citations: ['component-building', 'animation-designing'],
    details: 'Injects dynamic multiple-choice challenge questions into the lesson flow. Provides instant validation bars, success checkmarks, and logs Skill Points for perfect answers.'
  },
  {
    id: '03',
    lane: 'Lane 3 — AI Briefs & Design Challenges',
    agent: 'Agent 3 (Briefs Coordinator)',
    icon: FileText,
    status: 'completed',
    summary: 'Interactive prompting challenges, validation checklist, and mock sandbox submission flows.',
    database: 'briefsStore.ts',
    files: [
      'src/pages/community/BriefsList.tsx',
      'src/pages/community/BriefDetail.tsx',
      'src/pages/community/BriefDetail.css'
    ],
    citations: ['flow-designing', 'api-integrating'],
    details: 'Implements practical design and coding challenges. Users read real-world briefs, tick off requirements, and submit sandbox links to earn large Skill Points payouts.'
  },
  {
    id: '04',
    lane: 'Lane 4 — Timed Assessments & Exams',
    agent: 'Agent 4 (Assessor)',
    icon: SealCheck,
    status: 'completed',
    summary: 'Multi-question timed diagnostic assessments, countdown timer, and bypass button.',
    database: 'assessmentsStore.ts',
    files: [
      'src/pages/community/AssessmentIntro.tsx',
      'src/pages/community/AssessmentExam.tsx',
      'src/pages/community/AssessmentExam.css'
    ],
    citations: ['flow-designing', 'anti-glitch-debugging'],
    details: 'Renders a locked fullscreen exam mode with an active countdown bar. Users can answer or skip with "I don\'t know" to map their designer skill matrix dynamically.'
  },
  {
    id: '05',
    lane: 'Lane 5 — Dynamic Skill Graphs & Analytics',
    agent: 'Agent 5 (Analytics Grapher)',
    icon: Pulse,
    status: 'completed',
    summary: 'Recharts-driven radar chart on the profile displaying six key designer dimensions.',
    database: 'profileStore.ts',
    files: [
      'src/pages/community/Profile.tsx',
      'src/pages/community/Profile.css',
      'src/components/profile/SkillRadar.tsx'
    ],
    citations: ['three-d-developing', 'consistency-checking'],
    details: 'Dynamically aggregates user assessment scores and translates them into an elegant glowing radar chart showing Visual Design, Writing, Strategy, and Coding scores.'
  },
  {
    id: '06',
    lane: 'Lane 6 — Interactive Tutorial Sandboxes',
    agent: 'Agent 6 (Sandbox Compiler)',
    icon: BookOpen,
    status: 'completed',
    summary: 'Live editorial tutorial pages with interactive code execution runner.',
    database: 'tutorialsStore.ts',
    files: [
      'src/pages/community/TutorialsList.tsx',
      'src/pages/community/TutorialDetail.tsx',
      'src/pages/community/TutorialDetail.css'
    ],
    citations: ['modern-web-guidance', 'component-building'],
    details: 'Exposes interactive tutorial pathways with a built-in sandbox editor where learners write and execute standard HTML/JS snippets safely to verify goals.'
  },
  {
    id: '07',
    lane: 'Lane 7 — Cooperative Team Learning & Milestones',
    agent: 'Agent 7 (Co-op Coordinator)',
    icon: UsersThree,
    status: 'completed',
    summary: 'Shared study groups lobby, chat boards, and weekly cooperative milestones.',
    database: 'teamsStore.ts',
    files: [
      'src/pages/community/TeamLearning.tsx',
      'src/pages/community/TeamLearning.css',
      'src/components/teams/TeamMilestone.tsx'
    ],
    citations: ['flow-designing', 'api-integrating'],
    details: 'Enables users to join study cohorts, chat in real-time, view live shared progress maps, and pool Skill Points to reach weekly team chest thresholds.'
  },
  {
    id: '08',
    lane: 'Lane 8 — Verification & Public Credentials',
    agent: 'Agent 8 (Registrar)',
    icon: ShieldCheck,
    status: 'completed',
    summary: 'Verifiable digital certificates, public share URLs, and printable PDF cards.',
    database: 'credentialsStore.ts',
    files: [
      'src/pages/community/CredentialDetail.tsx',
      'src/pages/community/CredentialDetail.css',
      'src/pages/CredentialShare.tsx'
    ],
    citations: ['deploying', 'backend-hardening'],
    details: 'Generates secure, hash-verified dynamic certificates for course completions. Includes social media optimization tags and direct PDF layout sheets.'
  },
  {
    id: '09',
    lane: 'Lane 9 — Community Project Showcase',
    agent: 'Agent 9 (Showcase Gallery)',
    icon: Trophy,
    status: 'completed',
    summary: 'Community gallery, interactive Figma/CodePen embeds, and multi-threaded comment feeds.',
    database: 'showcaseStore.ts',
    files: [
      'src/pages/community/ShowcaseGallery.tsx',
      'src/pages/community/ShowcaseDetail.tsx',
      'src/pages/community/ShowcaseDetail.css'
    ],
    citations: ['modern-web-guidance', 'anti-mock-enforcing'],
    details: 'Provides a showcase panel for user projects. Supports embedded live demos, detailed description panels, tag lists, and direct user discussion boards.'
  },
  {
    id: '10',
    lane: 'Lane 10 — AI Arcade Games',
    agent: 'Agent 10 (Arcade Master)',
    icon: GameController,
    status: 'completed',
    summary: 'Prompt Battles and Jailbreak challenges lobby, evaluating AI inputs under firewall constraints.',
    database: 'arcadeStore.ts',
    files: [
      'src/pages/community/ArcadeLobby.tsx',
      'src/pages/community/PromptBattle.tsx',
      'src/pages/community/JailbreakChallenge.tsx',
      'src/pages/community/Arcade.css'
    ],
    citations: ['web-game-foundations', 'playmaster-librarian'],
    details: 'Runs two advanced prompt hacking sandboxes. Matches sentiment criteria or bypasses LLM system guardrails to test defensive prompt engineering.'
  },
  {
    id: '11',
    lane: 'Lane 11 — Router & Global Orchestration',
    agent: 'Agent 11 (Swarm Sentinel)',
    icon: Cpu,
    status: 'completed',
    summary: 'Coordinates global auth-guard bypass states, unified router paths, and glassmorphic layout updates.',
    database: 'App.tsx, CommunityLayout.tsx',
    files: [
      'src/App.tsx',
      'src/components/community/CommunityLayout.tsx',
      'src/components/layout/Navbar.tsx',
      'src/components/layout/Navbar.css'
    ],
    citations: ['modern-web-guidance', 'consistency-checking'],
    details: 'Coalesces all 11 development paths, manages global states, hooks navigation links to Framer Motion active pips, and establishes cohesive branding.'
  }
];

const SIMULATED_TRANS_VERBS = [
  'Recalculated Leaderboards',
  'Tallying weekly Skill Points',
  'Streaks database synchronized',
  'Prompt Battle sentiment evaluated',
  'Team milestone unlocked',
  'Credential verification signature validated',
  'Radar analytics graph refreshed',
  'Jailbreak Firewall test bypassed',
  'Interactive JS sandbox code compiled'
];

interface LogLine {
  timestamp: string;
  agent: string;
  event: string;
  color: 'blue' | 'crimson' | 'green';
}

export default function Orchestration() {
  const [activeLane, setActiveLane] = useState<SwarmLane>(SWARM_LANES[0]);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [swarmState, setSwarmState] = useState<'idle' | 'executing' | 'synchronized'>('synchronized');
  const [statTime, setStatTime] = useState('');

  // Initial logs populate
  useEffect(() => {
    const initialLogs: LogLine[] = [
      { timestamp: '18:06:01', agent: 'Orchestrator', event: 'Initializing WAVE-UXCEL-ADAPTATION swarm packet', color: 'blue' },
      { timestamp: '18:06:02', agent: 'Agent 11', event: 'Route check synchronized successfully', color: 'green' },
      { timestamp: '18:06:04', agent: 'Agent 1', event: 'Recalculating user streak logs: current user streak is 7 days', color: 'green' },
      { timestamp: '18:06:10', agent: 'Agent 3', event: 'Brief details linked with active checklist hooks', color: 'blue' },
      { timestamp: '18:06:15', agent: 'Agent 8', event: 'Securing credentials database keys', color: 'green' },
      { timestamp: '18:06:22', agent: 'Agent 10', event: 'AI Arcade Jailbreak levels validated and live', color: 'crimson' },
      { timestamp: '18:06:30', agent: 'Agent 5', event: 'Profile skill radar dataset parsed successfully', color: 'blue' },
      { timestamp: '18:06:45', agent: 'Agent 2', event: 'Fullscreen quiz layouts set up, +100 Skill Points event loaded', color: 'green' }
    ];
    setLogs(initialLogs);

    // Update time block
    const updateTime = () => {
      const d = new Date();
      setStatTime(d.toLocaleTimeString());
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Tick logs dynamically to simulate live swarm actions
  useEffect(() => {
    const logInterval = setInterval(() => {
      const randomLane = SWARM_LANES[Math.floor(Math.random() * SWARM_LANES.length)];
      const randomVerb = SIMULATED_TRANS_VERBS[Math.floor(Math.random() * SIMULATED_TRANS_VERBS.length)];
      
      const newLog: LogLine = {
        timestamp: new Date().toLocaleTimeString(),
        agent: randomLane.agent,
        event: `${randomVerb} · status verified`,
        color: Math.random() > 0.4 ? 'blue' : (Math.random() > 0.5 ? 'crimson' : 'green')
      };

      setLogs((prev) => [...prev.slice(-29), newLog]);
    }, 4500);

    return () => clearInterval(logInterval);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const toggleSwarmState = () => {
    if (swarmState === 'synchronized') {
      setSwarmState('executing');
      const startLog: LogLine = {
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Orchestrator',
        event: 'Executing fresh wave parallel audit... Scanning 11 lanes',
        color: 'crimson'
      };
      setLogs((prev) => [...prev, startLog]);
      
      setTimeout(() => {
        setSwarmState('synchronized');
        const endLog: LogLine = {
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Orchestrator',
          event: 'All 11 lanes verified active and synchronized inside assetpersona compile.',
          color: 'green'
        };
        setLogs((prev) => [...prev, endLog]);
      }, 3000);
    }
  };

  return (
    <div className="orch">
      {/* GLOW BACKGROUND EFFECT */}
      <div className="orch__radial-glow blue-glow" />
      <div className="orch__radial-glow red-glow" />

      {/* DASHBOARD HEADER */}
      <header className="orch__header">
        <div className="orch__header-left">
          <div className="orch__badge">
            <span className="orch__badge-dot pulse-blue" />
            Active Swarm Monitor
          </div>
          <h1 className="orch__title">Multi-Agent Swarm Visualizer</h1>
          <p className="orch__subtitle">
            Visualizing 11 parallel agent lanes working in tandem inside the <strong>WAVE-UXCEL-ADAPTATION</strong> build environment.
          </p>
        </div>

        <div className="orch__header-stats">
          <div className="orch__stat-box">
            <span className="orch__stat-num">11</span>
            <span className="orch__stat-lbl">Active Lanes</span>
          </div>
          <div className="orch__stat-box">
            <span className="orch__stat-num orch__stat-num--green">100%</span>
            <span className="orch__stat-lbl">Sync Rate</span>
          </div>
          <div className="orch__stat-box">
            <span className="orch__stat-num orch__stat-num--blue">{statTime}</span>
            <span className="orch__stat-lbl">Swarm Local Time</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="orch__layout">
        
        {/* LEFT COLUMN: SWARM CONTROLS AND LANES LIST */}
        <div className="orch__left">
          <div className="orch__panel">
            <div className="orch__panel-header">
              <div className="orch__panel-title">
                <Cpu size={18} weight="duotone" className="text-blue" />
                <span>Agent Swarm Configuration</span>
              </div>
              <button 
                className={`orch__btn ${swarmState === 'executing' ? 'orch__btn--executing' : ''}`}
                onClick={toggleSwarmState}
                disabled={swarmState === 'executing'}
              >
                <Cpu size={16} className={swarmState === 'executing' ? 'spin' : ''} />
                <span>{swarmState === 'synchronized' ? 'Trigger Swarm Sync' : 'Syncing Swarm...'}</span>
              </button>
            </div>

            <div className="orch__lanes">
              {SWARM_LANES.map((lane) => {
                const LaneIcon = lane.icon;
                const isSelected = activeLane.id === lane.id;
                return (
                  <button
                    key={lane.id}
                    className={`orch__lane-row ${isSelected ? 'orch__lane-row--active' : ''}`}
                    onClick={() => setActiveLane(lane)}
                  >
                    <div className="orch__lane-row-left">
                      <span className={`orch__lane-num ${isSelected ? 'text-blue' : ''}`}>{lane.id}</span>
                      <div className="orch__lane-avatar">
                        <LaneIcon size={18} weight="duotone" />
                      </div>
                      <div className="orch__lane-text">
                        <div className="orch__lane-name">{lane.agent}</div>
                        <div className="orch__lane-desc">{lane.lane.split(' — ')[1]}</div>
                      </div>
                    </div>
                    
                    <div className="orch__lane-row-right">
                      <span className="orch__status-pill">
                        <span className="orch__status-dot" />
                        Synced
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS AND TERMINAL CONSOLE */}
        <div className="orch__right">
          
          {/* LANE DETAILS BOARD */}
          <div className="orch__panel orch__detail-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLane.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="orch__details"
              >
                <div className="orch__details-header">
                  <div className="orch__details-main">
                    <span className="orch__details-id">LANE {activeLane.id}</span>
                    <h2 className="orch__details-title">{activeLane.lane}</h2>
                  </div>
                  <div className="orch__details-badge">
                    <CheckCircle size={16} weight="fill" className="text-green" />
                    <span>Orchestrated</span>
                  </div>
                </div>

                <p className="orch__details-summary">{activeLane.summary}</p>
                <p className="orch__details-long">{activeLane.details}</p>

                <div className="orch__details-meta">
                  <div className="orch__meta-group">
                    <h4 className="orch__meta-label">
                      <Database size={14} weight="duotone" className="text-blue" />
                      <span>Data Layer / Store</span>
                    </h4>
                    <span className="orch__meta-value code-font">{activeLane.database}</span>
                  </div>
                  <div className="orch__meta-group">
                    <h4 className="orch__meta-label">
                      <Sparkle size={14} weight="duotone" className="text-red" />
                      <span>Skills Citations</span>
                    </h4>
                    <div className="orch__citation-badges">
                      {activeLane.citations.map((cite) => (
                        <span key={cite} className="orch__citation-badge">{cite}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="orch__files-section">
                  <h4 className="orch__files-title">
                    <HardDrive size={15} weight="duotone" />
                    <span>Created & Modified Assets</span>
                  </h4>
                  <div className="orch__files-list">
                    {activeLane.files.map((file) => (
                      <div key={file} className="orch__file-item">
                        <span className="orch__file-dot" />
                        <span className="orch__file-name">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* SIMULATED TERM LOGS */}
          <div className="orch__panel orch__terminal-panel">
            <div className="orch__panel-header">
              <div className="orch__panel-title">
                <Terminal size={18} className="text-red" />
                <span>Simulated Swarm Orchestration Log</span>
              </div>
              <div className="orch__term-status">
                <span className="term-pulse" />
                <span>LIVE FEED</span>
              </div>
            </div>

            <div className="orch__terminal">
              <div className="orch__terminal-inner">
                {logs.map((log, idx) => (
                  <div key={idx} className="orch__term-line">
                    <span className="orch__term-time">[{log.timestamp}]</span>
                    <span className="orch__term-tag font-semibold">[{log.agent}]</span>
                    <span className={`orch__term-msg orch__term-msg--${log.color}`}>
                      {log.event}
                    </span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
