import { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Play, 
  Pause, 
  DownloadSimple, 
  FileText, 
  Sparkle 
} from '@phosphor-icons/react';
import './ResourceHub.css';

interface GuideItem {
  id: string;
  title: string;
  category: 'literacy' | 'prompting' | 'integration';
  readTime: string;
  checklist: { id: string; text: string }[];
  audioUrl?: string;
  description: string;
}

export default function ResourceHub() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<string | null>(null);
  
  // Checklist completions tracked in state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const guides: GuideItem[] = [
    {
      id: 'guide-ai-foundations',
      title: 'Grounding AI Models Offline',
      category: 'literacy',
      readTime: '8 min',
      description: 'Step-by-step checklist to isolate context, verify embeddings, and build clean grounding matrices for LLMs.',
      checklist: [
        { id: 'gf-1', text: 'Verify document chunk size (limit to 500 tokens)' },
        { id: 'gf-2', text: 'Apply vector distance scoring thresholds' },
        { id: 'gf-3', text: 'Ground context within system prompt delimiters' },
        { id: 'gf-4', text: 'Inspect output validation for token leak traces' }
      ],
      audioUrl: 'https://example.com/audio/grounding.mp3'
    },
    {
      id: 'guide-jailbreak-vectors',
      title: 'Prompt Injection Defense Protocols',
      category: 'prompting',
      readTime: '12 min',
      description: 'How to lock system prompts, delimiters, and sanitize inputs to defend against jailbreak exploits.',
      checklist: [
        { id: 'jv-1', text: 'Lock system instructions ahead of user queries' },
        { id: 'jv-2', text: 'Validate output formats against strict Zod schema' },
        { id: 'jv-3', text: 'Sanitize user string queries against DAN prompts' }
      ],
      audioUrl: 'https://example.com/audio/defense.mp3'
    },
    {
      id: 'guide-multi-agent-orchestrator',
      title: 'Multi-Agent Execution Frameworks',
      category: 'integration',
      readTime: '15 min',
      description: 'Orchestrating decoupled agents securely. Setting up webhook signatures, rate limits, and database RLS.',
      checklist: [
        { id: 'ma-1', text: 'Configure HMAC signature verification on webhooks' },
        { id: 'ma-2', text: 'Enforce Row Level Security (RLS) on user profiles' },
        { id: 'ma-3', text: 'Rate limit external endpoint calls with exponential backoff' }
      ],
      audioUrl: 'https://example.com/audio/orchestrator.mp3'
    }
  ];

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handlePlayAudio = (guideId: string) => {
    if (currentAudioTrack === guideId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudioTrack(guideId);
      setIsPlaying(true);
    }
  };

  return (
    <div className="resource-hub-container">
      {/* ── Strict SEO Heading Hierarchy: Single H1 ── */}
      <header className="guides-hub-header">
        <h1>Resource Guides Hub</h1>
        <p className="subtitle">
          Comprehensive step-by-step checklists and audio guides to build, secure, and orchestrate agentic systems.
        </p>
      </header>

      {/* ── Audio Overview Player Widget ── */}
      {currentAudioTrack && (
        <div className="audio-player-widget">
          <div className="player-info">
            <Sparkle size={18} className="glow-icon-amber animate-pulse" />
            <div>
              <span className="player-label">NOW LISTENING</span>
              <span className="player-title">
                {guides.find(g => g.id === currentAudioTrack)?.title} (AI Overview)
              </span>
            </div>
          </div>
          <div className="player-controls">
            <button 
              className="btn-play-toggle" 
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
            </button>
            <a 
              href={guides.find(g => g.id === currentAudioTrack)?.audioUrl} 
              download 
              className="btn-download"
              title="Download Audio"
            >
              <DownloadSimple size={16} />
            </a>
          </div>
        </div>
      )}

      {/* ── Guides Grid ── */}
      <div className="guides-grid">
        {guides.map((guide) => (
          <article key={guide.id} className="guide-card">
            <header className="guide-card-header">
              <span className="category-tag">{guide.category}</span>
              <span className="read-tag">{guide.readTime} read</span>
            </header>

            <div className="guide-card-body">
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>

              {/* Checklist sub-module */}
              <div className="guide-checklist-container">
                <h4>Checklist Tasks</h4>
                <ul className="checklist-list">
                  {guide.checklist.map((item) => {
                    const isChecked = !!checkedItems[item.id];
                    return (
                      <li 
                        key={item.id} 
                        className={`checklist-item ${isChecked ? 'item-checked' : ''}`}
                        onClick={() => toggleCheck(item.id)}
                      >
                        {isChecked ? (
                          <CheckSquare size={16} className="check-box checked" />
                        ) : (
                          <Square size={16} className="check-box" />
                        )}
                        <span>{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <footer className="guide-card-footer">
              <button 
                type="button" 
                className="btn-guide-action btn-play"
                onClick={() => handlePlayAudio(guide.id)}
              >
                {currentAudioTrack === guide.id && isPlaying ? (
                  <>
                    <Pause size={14} weight="fill" /> Pause Audio
                  </>
                ) : (
                  <>
                    <Play size={14} weight="fill" /> Play Overview
                  </>
                )}
              </button>
              <button type="button" className="btn-guide-action btn-read">
                <FileText size={14} /> Read Guide
              </button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
