import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssessmentResults } from '../../data/assessmentsStore';
import './SkillRadarGraph.css';

interface SkillData {
  subject: string;
  key: string;
  value: number; // 0 to 100
  percentile: number; // e.g. 88th
  status: 'Uncertified' | 'Certified';
}

interface SkillRadarGraphProps {
  memberId: string;
}

const RECOMMENDATIONS: Record<string, Array<{
  slug: string;
  title: string;
  type: string;
  duration: number;
  points: number;
  description: string;
}>> = {
  prompting: [
    {
      slug: 'what-is-context-engineering',
      title: 'Context Engineering Foundations',
      type: 'Concept',
      duration: 10,
      points: 40,
      description: 'Master variables, system limits, and memory alignment in structured prompts.'
    },
    {
      slug: 'role-prompts-vs-system-prompts',
      title: 'System Prompts vs. Role Prompts',
      type: 'Concept',
      duration: 15,
      points: 50,
      description: 'Differentiate persistent system contracts from ephemeral context roles.'
    }
  ],
  rag: [
    {
      slug: 'prompt-engineering-rag-quiz',
      title: 'RAG Systems & Architectures',
      type: 'Quiz',
      duration: 12,
      points: 60,
      description: 'Test your understanding of semantic chunking, lost-in-the-middle context, and JSON outputs.'
    },
    {
      slug: 'advanced-rag-routing',
      title: 'Advanced Query Routing & Multi-Retrievers',
      type: 'Concept',
      duration: 18,
      points: 70,
      description: 'Optimize retrieval accuracy using semantic routers and self-query metadata engines.'
    }
  ],
  agents: [
    {
      slug: 'reliable-agent-architectures',
      title: 'Reliable Agentic Frameworks',
      type: 'Concept',
      duration: 20,
      points: 80,
      description: 'Build fail-safe reflection loops and robust error correction heuristics in LLM agents.'
    },
    {
      slug: 'multi-agent-swarms-2026',
      title: 'Multi-Agent Swarm Orchestration',
      type: 'Concept',
      duration: 25,
      points: 90,
      description: 'Coordinate parallel task workers, resolve lane conflicts, and execute master-led swarms.'
    }
  ],
  finetuning: [
    {
      slug: 'lora-qlora-foundations',
      title: 'LoRA & QLoRA Adaptations',
      type: 'Concept',
      duration: 22,
      points: 85,
      description: 'Explore parameter-efficient fine-tuning via low-rank adapter weights and 4-bit quantization.'
    }
  ],
  llmops: [
    {
      slug: 'production-evaluations-monitoring',
      title: 'Production Evaluations & Metrics',
      type: 'Concept',
      duration: 25,
      points: 95,
      description: 'Run automated golden evaluations, monitor token metrics, and profile system latency.'
    },
    {
      slug: 'default-to-the-best-model',
      title: 'Cost-Quality Frontier Model Selection',
      type: 'Daily Drill',
      duration: 8,
      points: 30,
      description: 'Prioritize frontier models dynamically to balance maximum output quality and token economics.'
    }
  ]
};

export default function SkillRadarGraph({ memberId }: SkillRadarGraphProps) {
  const [skills, setSkills] = useState<SkillData[]>([
    { subject: 'Prompting', key: 'prompting', value: 65, percentile: 72, status: 'Uncertified' },
    { subject: 'RAG', key: 'rag', value: 60, percentile: 68, status: 'Uncertified' },
    { subject: 'Agents', key: 'agents', value: 55, percentile: 60, status: 'Uncertified' },
    { subject: 'Fine-Tuning', key: 'finetuning', value: 50, percentile: 55, status: 'Uncertified' },
    { subject: 'LLMOps', key: 'llmops', value: 45, percentile: 50, status: 'Uncertified' },
  ]);

  const [hoveredPoint, setHoveredPoint] = useState<SkillData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);

  useEffect(() => {
    async function loadAssessmentData() {
      const results = await getAssessmentResults(memberId);
      
      // Map results to skills
      const promptResult = results.find((r) => r.assessmentId === 'prompt-arch');
      const ragResult = results.find((r) => r.assessmentId === 'rag-spec');
      const coreResult = results.find((r) => r.assessmentId === 'ai-eng-core');

      setSkills((prev) =>
        prev.map((skill) => {
          let value = skill.value;
          let status = skill.status;
          let percentile = skill.percentile;

          if (skill.key === 'prompting') {
            if (promptResult) {
              value = promptResult.score;
              status = promptResult.score >= 80 ? 'Certified' : 'Uncertified';
              percentile = Math.min(99, Math.round(50 + (promptResult.score - 50) * 0.98));
            }
          } else if (skill.key === 'rag') {
            if (ragResult) {
              value = ragResult.score;
              status = ragResult.score >= 80 ? 'Certified' : 'Uncertified';
              percentile = Math.min(99, Math.round(50 + (ragResult.score - 50) * 0.98));
            }
          } else if (skill.key === 'agents') {
            if (promptResult) {
              // Agents is influenced by prompt architect result
              value = Math.max(55, Math.round(promptResult.score * 0.9));
              status = promptResult.score >= 80 ? 'Certified' : 'Uncertified';
              percentile = Math.min(99, Math.round(50 + (promptResult.score - 50) * 0.88));
            }
          } else if (skill.key === 'finetuning') {
            if (coreResult) {
              value = Math.max(50, Math.round(coreResult.score * 0.85));
              status = coreResult.score >= 80 ? 'Certified' : 'Uncertified';
              percentile = Math.min(99, Math.round(50 + (coreResult.score - 50) * 0.8));
            }
          } else if (skill.key === 'llmops') {
            if (coreResult) {
              value = Math.max(45, Math.round(coreResult.score * 0.8));
              status = coreResult.score >= 80 ? 'Certified' : 'Uncertified';
              percentile = Math.min(99, Math.round(50 + (coreResult.score - 50) * 0.75));
            }
          }

          return { ...skill, value, status, percentile };
        })
      );
    }

    loadAssessmentData();
  }, [memberId]);

  // SVG Geometry Config
  const size = 320;
  const center = size / 2;
  const rMax = size * 0.38; // Max radius of the radar
  const totalSides = skills.length;

  // Calculate coordinates for vertices
  const getCoordinates = (index: number, scaleValue: number) => {
    const angle = (Math.PI * 2 / totalSides) * index - Math.PI / 2; // Subtract PI/2 to start from top
    const r = (scaleValue / 100) * rMax;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate background grid pentagons (at 20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100];
  const gridPolygons = gridLevels.map((level) => {
    const points = Array.from({ length: totalSides })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(' ');
    return points;
  });

  // Calculate points of the actual skills radar shape
  const skillsPoints = skills
    .map((skill, i) => {
      const { x, y } = getCoordinates(i, skill.value);
      return `${x},${y}`;
    })
    .join(' ');

  // Calculate outer label coordinates (slightly further out than 100%)
  const getLabelCoordinates = (index: number) => {
    const angle = (Math.PI * 2 / totalSides) * index - Math.PI / 2;
    const r = rMax + 24; // Extra distance for labels
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const handleMouseEnter = (event: React.MouseEvent<SVGCircleElement>, skill: SkillData) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const parentRect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (parentRect) {
      setTooltipPos({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 12
      });
    }
    setHoveredPoint(skill);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="skill-radar-container">
      <div className="skill-radar-card">
        <h3 className="skill-radar-title">AI Capability Profile</h3>
        <p className="skill-radar-subtitle">Interactive map of validated engineering focuses</p>

        <div className="skill-radar-chart-wrapper">
          <svg className="skill-radar-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              {/* Glow filter for neon edges */}
              <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Peach-Tech color scheme gradient */}
              <radialGradient id="radar-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(244, 63, 94, 0.45)" />
                <stop offset="80%" stopColor="rgba(99, 102, 241, 0.15)" />
                <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
              </radialGradient>
            </defs>

            {/* Background Grid Polygons */}
            {gridPolygons.map((points, idx) => (
              <polygon
                key={idx}
                points={points}
                className="radar-grid-line"
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="1"
              />
            ))}

            {/* Background Grid Concentric Labels */}
            {gridLevels.map((level, idx) => {
              const { x, y } = getCoordinates(0, level); // Align at top axis
              return (
                <text
                  key={idx}
                  x={x + 6}
                  y={y + 3}
                  className="radar-grid-text"
                  fill="rgba(255, 255, 255, 0.25)"
                  fontSize="8"
                >
                  {level}%
                </text>
              );
            })}

            {/* Spokes (divided lines from center to outer vertices) */}
            {Array.from({ length: totalSides }).map((_, i) => {
              const { x, y } = getCoordinates(i, 100);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Filled Core Polygon */}
            <polygon
              points={skillsPoints}
              fill="url(#radar-gradient)"
              stroke="#f43f5e"
              strokeWidth="2.5"
              filter="url(#radar-glow)"
              className="radar-core-polygon"
            />

            {/* Vertices Interactive Circles */}
            {skills.map((skill, i) => {
              const { x, y } = getCoordinates(i, skill.value);
              const isActive = selectedSkill?.key === skill.key;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="6"
                  className={`radar-vertex-circle ${isActive ? 'active-vertex' : ''}`}
                  onMouseEnter={(e) => handleMouseEnter(e, skill)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => setSelectedSkill(selectedSkill?.key === skill.key ? null : skill)}
                />
              );
            })}

            {/* Outer Labels */}
            {skills.map((skill, i) => {
              const { x, y } = getLabelCoordinates(i);
              const isActive = selectedSkill?.key === skill.key;
              // Simple text anchoring math based on position
              let textAnchor: 'inherit' | 'end' | 'start' | 'middle' = 'middle';
              let dy = '0.35em';
              if (x < center - 10) {
                textAnchor = 'end';
              } else if (x > center + 10) {
                textAnchor = 'start';
              }
              if (y < center - 100) {
                dy = '-0.2em';
              } else if (y > center + 100) {
                dy = '0.9em';
              }

              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  dy={dy}
                  textAnchor={textAnchor}
                  className={`radar-label-text ${isActive ? 'active-label' : ''}`}
                  onClick={() => setSelectedSkill(selectedSkill?.key === skill.key ? null : skill)}
                >
                  {skill.subject}
                </text>
              );
            })}
          </svg>

          {/* Dynamic Rich Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="radar-tooltip"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
              }}
            >
              <div className="radar-tooltip__header">
                <strong>{hoveredPoint.subject}</strong>
                <span className={`status-badge status-badge--${hoveredPoint.status.toLowerCase()}`}>
                  {hoveredPoint.status}
                </span>
              </div>
              <div className="radar-tooltip__body">
                <div className="tooltip-stat">
                  Score: <strong className="val">{hoveredPoint.value}%</strong>
                </div>
                <div className="tooltip-stat">
                  Percentile: <strong className="val">{hoveredPoint.percentile}th</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Skill Popover Card */}
        {selectedSkill && (
          <div className="radar-recommendations-popover">
            <div className="radar-rec-header">
              <div className="radar-rec-title-wrap">
                <span className="radar-rec-label">Recommended for:</span>
                <h4 className="radar-rec-subject">{selectedSkill.subject} Focus</h4>
              </div>
              <button className="radar-rec-close" onClick={() => setSelectedSkill(null)}>&times;</button>
            </div>
            <div className="radar-rec-list">
              {(RECOMMENDATIONS[selectedSkill.key] ?? []).map((rec) => (
                <Link key={rec.slug} to={`/community/learn/${rec.slug}`} className="radar-rec-card">
                  <div className="radar-rec-card-body">
                    <span className="radar-rec-card-type">{rec.type}</span>
                    <h5 className="radar-rec-card-title">{rec.title}</h5>
                    <p className="radar-rec-card-desc">{rec.description}</p>
                    <div className="radar-rec-card-meta">
                      <span className="radar-rec-card-duration">{rec.duration} mins</span>
                      <span className="radar-rec-card-points">{rec.points} pts</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

