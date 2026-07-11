import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkSimple, ThumbsUp, ThumbsDown, CheckCircle, Sparkle } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getTutorials, toggleBookmark, getBookmarks, registerHelpfulness, getHelpfulness } from '../../data/tutorialsStore';
import type { Tutorial } from '../../data/tutorialsStore';
import InteractiveRunner from '../../components/learn/InteractiveRunner';
import './TutorialDetail.css';

export default function TutorialDetail() {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [helpfulness, setHelpfulness] = useState<Record<string, 'up' | 'down'>>({});
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!tutorialId) return;
      const tutorials = await getTutorials();
      const found = tutorials.find((t) => t.id === tutorialId);
      setTutorial(found ?? null);
      setBookmarkedIds(getBookmarks());
      setHelpfulness(getHelpfulness());
      setIsCompleted(localStorage.getItem(`ap_tutorial_completed_${tutorialId}`) === 'true');
      setLoading(false);
    }
    loadData();
  }, [tutorialId]);

  const handleBookmarkToggle = async () => {
    if (!tutorial) return;
    const updated = await toggleBookmark(tutorial.id);
    setBookmarkedIds(updated);
  };

  const handleHelpfulReact = async (helpful: boolean) => {
    if (!tutorial) return;
    const updated = await registerHelpfulness(tutorial.id, helpful);
    setHelpfulness(updated);
  };

  const handleSandboxSuccess = () => {
    if (!tutorial) return;
    localStorage.setItem(`ap_tutorial_completed_${tutorial.id}`, 'true');
    setIsCompleted(true);
  };

  if (loading) {
    return (
      <div className="tutorial-detail-page">
        <p className="loading-text">Loading tutorial details…</p>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="tutorial-detail-page">
        <Link to="/community/tutorials" className="back-link"><ArrowLeft size={16} /> Back to Tutorials</Link>
        <p className="empty-text">Tutorial not found.</p>
      </div>
    );
  }

  const isBookmarked = bookmarkedIds.includes(tutorial.id);
  const reaction = helpfulness[tutorial.id];

  return (
    <div className="tutorial-detail-page">
      <Link to="/community/tutorials" className="back-link">
        <ArrowLeft size={16} /> Back to Tutorials
      </Link>

      <article className="tutorial-article">
        {/* Header Block */}
        <header className="article-header">
          <div className="header-meta-row">
            <span className={`cat-badge cat-badge--${tutorial.category.toLowerCase()}`}>
              {tutorial.category}
            </span>
            <span className={`diff-badge diff-badge--${tutorial.difficulty.toLowerCase()}`}>
              {tutorial.difficulty}
            </span>
            <span className="read-time">{tutorial.readTime}</span>
          </div>

          <div className="title-row">
            <h1 className="article-title">{tutorial.title}</h1>
            <button
              onClick={handleBookmarkToggle}
              className={`bookmark-btn ${isBookmarked ? 'bookmark-btn--active' : ''}`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark tutorial'}
            >
              {isBookmarked ? <Bookmark size={22} weight="fill" /> : <BookmarkSimple size={22} />}
            </button>
          </div>
          <p className="article-desc">{tutorial.description}</p>
        </header>

        {/* Content Body */}
        <div className="article-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{tutorial.content}</ReactMarkdown>
        </div>

        {/* Interactive Runner Area */}
        <section className="sandbox-section">
          <div className="sandbox-header">
            <div className="title-block">
              <Sparkle className="sparkle-icon" size={20} />
              <h2>Interactive Sandbox Challenge</h2>
            </div>
            {isCompleted && (
              <span className="completed-tag">
                <CheckCircle size={16} weight="fill" /> Challenge Solved (+50 pts)
              </span>
            )}
          </div>
          <p className="sandbox-instruction">
            Modify the starter script below to solve the exercise instructions. Run the script to verify your logic.
          </p>

          <InteractiveRunner
            initialCode={tutorial.initialCode}
            expectedOutputContains={tutorial.expectedOutputContains}
            onSuccess={handleSandboxSuccess}
          />
        </section>

        {/* Article Reactions footer */}
        <footer className="article-footer">
          <div className="helpful-question">Was this tutorial helpful?</div>
          <div className="reaction-buttons">
            <button
              onClick={() => handleHelpfulReact(true)}
              className={`react-btn react-btn--up ${reaction === 'up' ? 'react-btn--active' : ''}`}
            >
              <ThumbsUp size={16} weight={reaction === 'up' ? 'fill' : 'regular'} /> Yes
            </button>
            <button
              onClick={() => handleHelpfulReact(false)}
              className={`react-btn react-btn--down ${reaction === 'down' ? 'react-btn--active' : ''}`}
            >
              <ThumbsDown size={16} weight={reaction === 'down' ? 'fill' : 'regular'} /> No
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}
