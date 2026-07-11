import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Trophy, ExternalLink, Copy, Check, Send, FileText, CheckSquare, Square } from 'lucide-react';
import { getBriefBySlug, submitBrief, listSubmissions, type Brief, type BriefSubmission } from '../../data/briefsStore';
import { useAuth } from '../../context/useAuth';
import confetti from 'canvas-confetti';
import './BriefDetail.css';

export default function BriefDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isBypass, bypassRole } = useAuth();
  const userId = user?.id ?? (isBypass ? `bypass-${bypassRole ?? 'guest'}` : 'anonymous');

  const [brief, setBrief] = useState<Brief | null>(null);
  const [submission, setSubmission] = useState<BriefSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  // Checklist states (saved locally by brief ID)
  const [checkedTasks, setCheckedTasks] = useState<boolean[]>([]);

  // Form states
  const [urlInput, setUrlInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function loadBrief() {
      if (!slug) return;
      try {
        const b = await getBriefBySlug(slug);
        if (!b) {
          if (active) {
            setLoading(false);
          }
          return;
        }

        const subs = await listSubmissions(userId);
        const sub = subs.find((s) => s.brief_id === b.id) || null;

        // Load tasks checked status from localStorage
        const storedTasks = localStorage.getItem(`ap_brief_tasks_${b.id}`);
        let initialChecked = new Array(b.tasks.length).fill(false);
        if (storedTasks) {
          try {
            initialChecked = JSON.parse(storedTasks);
            // Re-align size if tasks size changed
            if (initialChecked.length !== b.tasks.length) {
              initialChecked = new Array(b.tasks.length).fill(false);
            }
          } catch (_) {}
        }

        if (active) {
          setBrief(b);
          setSubmission(sub);
          setCheckedTasks(initialChecked);
          if (sub) {
            setUrlInput(sub.submission_link);
            setNotesInput(sub.notes || '');
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load brief detail:', err);
        if (active) setLoading(false);
      }
    }
    loadBrief();
    return () => {
      active = false;
    };
  }, [slug, userId]);

  const handleToggleTask = (idx: number) => {
    if (!brief) return;
    const next = [...checkedTasks];
    next[idx] = !next[idx];
    setCheckedTasks(next);
    localStorage.setItem(`ap_brief_tasks_${brief.id}`, JSON.stringify(next));
  };

  const handleCopyAssetLink = (url: string, index: number) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief || !userId) return;

    if (!urlInput.trim()) {
      setErrorMessage('Please provide a valid solution URL (e.g. GitHub repo or design playground link).');
      return;
    }

    try {
      // Basic URL verification
      new URL(urlInput);
    } catch (_) {
      setErrorMessage('Please enter a valid absolute URL starting with http:// or https://');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await submitBrief(brief.id, userId, urlInput, notesInput);
      setSubmission(res);
      setSuccessMessage('Congratulations! Your solution has been submitted successfully.');
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit solution. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="brief-detail-page brief-detail-page--loading">Loading brief...</div>;
  }

  if (!brief) {
    return (
      <div className="brief-detail-page brief-detail-page--missing">
        <h1>Brief not found</h1>
        <p>We couldn't find the AI brief you are looking for.</p>
        <Link to="/community/briefs" className="btn btn--primary">
          <ArrowLeft size={14} /> Back to Briefs
        </Link>
      </div>
    );
  }

  return (
    <div className="brief-detail-page">
      <div className="brief-detail-page__back">
        <Link to="/community/briefs" className="back-link">
          <ArrowLeft size={16} /> Back to Challenges
        </Link>
      </div>

      <div className="brief-detail-layout">
        <main className="brief-detail-layout__content">
          <span className={`brief-category-tag brief-category-tag--${brief.difficulty}`}>
            {brief.category}
          </span>

          <h1 className="brief-detail-title">{brief.title}</h1>

          <div className="brief-detail-meta">
            <div className="brief-detail-meta-item">
              <span className="lbl">Difficulty</span>
              <span className={`val diff-val diff-val--${brief.difficulty}`}>{brief.difficulty}</span>
            </div>
            <div className="brief-detail-meta-item">
              <span className="lbl">Estimated time</span>
              <span className="val"><Clock size={14} /> {brief.estimated_hours} hours</span>
            </div>
            <div className="brief-detail-meta-item">
              <span className="lbl">Reward</span>
              <span className="val xp-val"><Trophy size={14} /> {brief.xp_reward} Skill Points</span>
            </div>
          </div>

          <section className="brief-section">
            <h2>Scenario & Context</h2>
            <div className="brief-scenario-card">
              <p>{brief.scenario}</p>
            </div>
          </section>

          <section className="brief-section">
            <h2>Objective</h2>
            <p className="brief-objective-text">{brief.objective}</p>
          </section>

          <section className="brief-section">
            <h2>Project Deliverable Checklist</h2>
            <p className="brief-help-text">Check off tasks as you complete them to track your progress locally.</p>
            <div className="brief-checklist">
              {brief.tasks.map((task, idx) => (
                <button
                  key={idx}
                  className={`brief-checklist-item ${checkedTasks[idx] ? 'is-checked' : ''}`}
                  onClick={() => handleToggleTask(idx)}
                >
                  <span className="checkbox-icon">
                    {checkedTasks[idx] ? <CheckSquare size={18} /> : <Square size={18} />}
                  </span>
                  <span className="task-text">{task}</span>
                </button>
              ))}
            </div>
          </section>
        </main>

        <aside className="brief-detail-layout__sidebar">
          <div className="sidebar-card sidebar-card--assets">
            <h3>Template Assets</h3>
            <p>Download files or copy notebooks to start building your solution.</p>
            <ul className="asset-list">
              {brief.assets.map((asset, idx) => (
                <li key={idx} className="asset-item">
                  <span className="asset-item__info">
                    <FileText size={16} />
                    <span className="asset-label">{asset.label}</span>
                  </span>
                  <div className="asset-item__actions">
                    <button
                      className="asset-action-btn"
                      onClick={() => handleCopyAssetLink(asset.url, idx)}
                      title="Copy Link"
                    >
                      {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="asset-action-btn"
                      title="Open Link"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-card sidebar-card--submit">
            {submission ? (
              <div className="submission-completed">
                <div className="success-icon-wrap">
                  <CheckCircleIcon size={32} />
                </div>
                <h3>Challenge Completed</h3>
                <p className="submitted-date">Submitted on {new Date(submission.submitted_at).toLocaleDateString()}</p>
                
                <div className="submitted-details">
                  <span className="submitted-lbl">Your Solution:</span>
                  <a href={submission.submission_link} target="_blank" rel="noopener noreferrer" className="submitted-link">
                    {submission.submission_link} <ExternalLink size={12} />
                  </a>
                  {submission.notes && (
                    <>
                      <span className="submitted-lbl">Notes:</span>
                      <p className="submitted-notes">{submission.notes}</p>
                    </>
                  )}
                </div>

                <div className="completed-divider"></div>

                <p className="resubmit-text">Would you like to update your submission?</p>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm resubmit-btn"
                  onClick={() => setSubmission(null)}
                >
                  Resubmit Solution
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="submission-form">
                <h3>Submit Solution</h3>
                <p>Provide a link to your final deliverable (GitHub repository, Google Colab Notebook, Figma page, etc.).</p>

                {errorMessage && <div className="form-alert form-alert--error">{errorMessage}</div>}
                {successMessage && <div className="form-alert form-alert--success">{successMessage}</div>}

                <div className="form-group">
                  <label htmlFor="submissionUrl">Deliverable Link *</label>
                  <input
                    type="url"
                    id="submissionUrl"
                    placeholder="https://github.com/..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="submissionNotes">Implementation Notes (optional)</label>
                  <textarea
                    id="submissionNotes"
                    rows={4}
                    placeholder="Provide context, design choices, or issues faced..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn--primary submit-form-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : (
                    <>
                      Submit Solution <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// Inline replacement for CheckCircle to avoid naming clashes
function CheckCircleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: '#10b981' }}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
