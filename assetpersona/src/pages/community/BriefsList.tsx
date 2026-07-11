import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trophy, CheckCircle, ArrowRight, Sparkles, Code, Terminal, Cpu, Database } from 'lucide-react';
import { listBriefs, listSubmissions, type Brief } from '../../data/briefsStore';
import { useAuth } from '../../context/useAuth';
import InteractiveHeader from '../../components/layout/InteractiveHeader';
import SubTabs from '../../components/community/SubTabs';
import './BriefsList.css';

const CLASSROOM_TABS = [
  { to: '/community/learn', label: 'Modules' },
  { to: '/community/classroom', label: 'Simulations' },
  { to: '/community/briefs', label: 'Briefs' },
  { to: '/community/tutorials', label: 'Tutorials' },
  { to: '/community/assessments', label: 'Assessments' },
  { to: '/community/teams', label: 'Study Teams' },
];

export default function BriefsList() {
  const { user, isBypass, bypassRole } = useAuth();
  const userId = user?.id ?? (isBypass ? `bypass-${bypassRole ?? 'guest'}` : 'anonymous');

  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | string>('all');

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const list = await listBriefs();
        const subs = await listSubmissions(userId);
        if (active) {
          setBriefs(list);
          setCompletedIds(new Set(subs.map((s) => s.brief_id)));
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load briefs:', err);
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [userId]);

  const categories = ['all', 'Prompt Engineering', 'LLM Integration', 'RAG Systems', 'AI Agents'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredBriefs = briefs.filter((brief) => {
    const matchesCategory = categoryFilter === 'all' || brief.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || brief.difficulty === difficultyFilter;
    return matchesCategory && matchesDifficulty;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Prompt Engineering':
        return <Terminal size={14} />;
      case 'LLM Integration':
        return <Cpu size={14} />;
      case 'RAG Systems':
        return <Database size={14} />;
      case 'AI Agents':
        return <Code size={14} />;
      default:
        return <Sparkles size={14} />;
    }
  };

  const totalSkillPoints = briefs.reduce(
    (sum, b) => sum + (completedIds.has(b.id) ? b.xp_reward : 0),
    0
  );

  return (
    <div className="briefs-lobby">
      <InteractiveHeader
        title="Interactive AI Briefs"
        subtitle="Build real-world LLM systems, defensive prompt layers, advanced RAG databases, and AI agent architectures. Complete tasks, earn Skill Points, and establish your engineering authority."
        badgeText="AI Design Challenges"
        badgeIcon={<Sparkles size={12} />}
        stats={[
          {
            label: 'Challenges Completed',
            value: `${completedIds.size} / ${briefs.length}`,
            icon: <CheckCircle size={14} className="text-accent-blue" />,
          },
          {
            label: 'Points Earned',
            value: `${totalSkillPoints} Skill Points`,
            icon: <Trophy size={14} className="text-accent-red" />,
          },
        ]}
      />

      <SubTabs tabs={CLASSROOM_TABS} />

      <div className="briefs-lobby__filters">
        <div className="briefs-lobby__filter-group">
          <label>Category</label>
          <div className="filter-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${categoryFilter === cat ? 'is-active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === 'all' ? 'All categories' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="briefs-lobby__filter-group">
          <label>Difficulty</label>
          <div className="filter-chips">
            {difficulties.map((diff) => (
              <button
                key={diff}
                className={`filter-chip filter-chip--diff ${difficultyFilter === diff ? 'is-active' : ''}`}
                onClick={() => setDifficultyFilter(diff)}
              >
                {diff === 'all' ? 'All difficulties' : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="briefs-lobby__loading">Loading briefs...</div>
      ) : filteredBriefs.length === 0 ? (
        <div className="briefs-lobby__empty">
          <p>No briefs found matching your active filters.</p>
          <button
            className="btn btn--secondary"
            onClick={() => {
              setCategoryFilter('all');
              setDifficultyFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="briefs-lobby__grid">
          {filteredBriefs.map((brief) => {
            const isDone = completedIds.has(brief.id);
            return (
              <div key={brief.id} className={`brief-card brief-card--${brief.difficulty} ${isDone ? 'is-completed' : ''}`}>
                <div className="brief-card__badge-row">
                  <span className={`brief-card__difficulty-badge brief-card__difficulty-badge--${brief.difficulty}`}>
                    {brief.difficulty}
                  </span>
                  <span className="brief-card__category-badge">
                    {getCategoryIcon(brief.category)}
                    {brief.category}
                  </span>
                </div>

                <h3 className="brief-card__title">{brief.title}</h3>
                <p className="brief-card__summary">{brief.summary}</p>

                <div className="brief-card__meta">
                  <span className="brief-card__meta-item">
                    <Clock size={13} /> {brief.estimated_hours} hrs
                  </span>
                  <span className="brief-card__meta-item">
                    <Trophy size={13} /> {brief.xp_reward} Skill Points
                  </span>
                </div>

                <div className="brief-card__actions">
                  <Link to={`/community/briefs/${brief.slug}`} className="btn btn--primary brief-card__btn">
                    {isDone ? (
                      <>
                        <CheckCircle size={14} /> Completed
                      </>
                    ) : (
                      <>
                        Start Challenge <ArrowRight size={14} />
                      </>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
