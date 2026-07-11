import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Bookmark, BookmarkSimple, CheckCircle, Sparkle } from '@phosphor-icons/react';
import { getTutorials, toggleBookmark, getBookmarks } from '../../data/tutorialsStore';
import type { Tutorial } from '../../data/tutorialsStore';
import SubTabs from '../../components/community/SubTabs';
import './TutorialsList.css';

const CLASSROOM_TABS = [
  { to: '/community/learn', label: 'Modules' },
  { to: '/community/classroom', label: 'Simulations' },
  { to: '/community/briefs', label: 'Briefs' },
  { to: '/community/tutorials', label: 'Tutorials' },
  { to: '/community/assessments', label: 'Assessments' },
  { to: '/community/teams', label: 'Study Teams' },
];

export default function TutorialsList() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getTutorials();
      setTutorials(data);
      setBookmarkedIds(getBookmarks());
      setLoading(false);
    }
    loadData();
  }, []);

  const handleBookmarkToggle = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = await toggleBookmark(id);
    setBookmarkedIds(updated);
  };

  const categories = ['All', 'Prompting', 'JSON', 'Agents', 'LLMOps'];

  const filteredTutorials = selectedCategory === 'All'
    ? tutorials
    : tutorials.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());

  if (loading) {
    return (
      <div className="tutorials-page">
        <p className="loading-text">Loading interactive tutorials…</p>
      </div>
    );
  }

  return (
    <div className="tutorials-page">
      <div className="tutorials-hero">
        <div className="tutorials-hero__header">
          <Sparkle className="hero-sparkle" size={24} />
          <h1>Editorial Tutorials & Sandboxes</h1>
        </div>
        <p className="tutorials-hero__desc">
          Accelerate your engineering workflow with structured guides and live sandboxed Javascript environments.
        </p>
      </div>

      <SubTabs tabs={CLASSROOM_TABS} />

      {/* Category Selection Filter */}
      <div className="category-filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`filter-badge ${selectedCategory === cat ? 'filter-badge--active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tutorials Grid */}
      <div className="tutorials-grid">
        {filteredTutorials.map((tutorial) => {
          const isBookmarked = bookmarkedIds.includes(tutorial.id);
          const isCompleted = localStorage.getItem(`ap_tutorial_completed_${tutorial.id}`) === 'true';

          return (
            <Link
              key={tutorial.id}
              to={`/community/tutorials/${tutorial.id}`}
              className="tutorial-card"
            >
              <div className="tutorial-card__header">
                <span className={`cat-label cat-label--${tutorial.category.toLowerCase()}`}>
                  {tutorial.category}
                </span>
                <button
                  onClick={(e) => handleBookmarkToggle(e, tutorial.id)}
                  className={`bookmark-btn ${isBookmarked ? 'bookmark-btn--active' : ''}`}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                >
                  {isBookmarked ? <Bookmark size={18} weight="fill" /> : <BookmarkSimple size={18} />}
                </button>
              </div>

              <h3 className="tutorial-card__title">{tutorial.title}</h3>
              <p className="tutorial-card__desc">{tutorial.description}</p>

              <div className="tutorial-card__footer">
                <div className="footer-meta">
                  <span className={`diff-badge diff-badge--${tutorial.difficulty.toLowerCase()}`}>
                    {tutorial.difficulty}
                  </span>
                  <span className="read-time">
                    <BookOpen size={14} /> {tutorial.readTime}
                  </span>
                </div>
                {isCompleted && (
                  <span className="completed-badge" title="Completed verification">
                    <CheckCircle size={16} weight="fill" /> Verified
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredTutorials.length === 0 && (
        <div className="empty-state">
          <p>No tutorials found in this category yet.</p>
        </div>
      )}
    </div>
  );
}
