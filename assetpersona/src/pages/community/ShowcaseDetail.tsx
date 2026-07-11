import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, PaperPlaneRight, Calendar, User, Code, LinkSimple, Eye, X } from '@phosphor-icons/react';
import { getProjectById, toggleLikeProject, addCommentToProject } from '../../data/showcaseStore';
import type { Project } from '../../data/showcaseStore';
import { useAuth } from '../../context/useAuth';
import './ShowcaseDetail.css';

export default function ShowcaseDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  // Lightbox State
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    if (!id) return;
    const found = await getProjectById(id);
    setProject(found);
    setLoading(false);
  };

  const handleLike = async () => {
    if (!project || !profile) return;
    const updated = await toggleLikeProject(project.id, profile.id);
    if (updated) {
      setProject(updated);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !profile || !newComment.trim()) return;

    const updated = await addCommentToProject(project.id, {
      authorName: profile.display_name,
      authorId: profile.id,
      body: newComment.trim()
    });

    if (updated) {
      setNewComment('');
      setProject(updated);
    }
  };

  if (loading) {
    return (
      <div className="showcase-detail-loading">
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="showcase-detail-not-found">
        <Link to="/community/showcase" className="back-link">
          <ArrowLeft size={16} /> Back to Gallery
        </Link>
        <h2>Project not found</h2>
        <p>The project you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const hasLiked = profile ? project.likedBy.includes(profile.id) : false;

  return (
    <div className="showcase-detail-container">
      {/* Back Link */}
      <Link to="/community/showcase" className="back-link">
        <ArrowLeft size={16} /> Back to Gallery
      </Link>

      <div className="showcase-detail-layout">
        {/* Main Content Area */}
        <div className="showcase-detail-main">
          {/* Cover Banner */}
          <div
            className="detail-hero-cover-wrapper"
            onClick={() => {
              setLightboxUrl(project.imageUrl);
              setLightboxTitle(project.title);
              setZoomScale(1);
            }}
            title="Click to enlarge preview"
            id="detail-hero-zoom-trigger"
          >
            <div
              className="detail-hero-cover"
              style={{ backgroundImage: `url(${project.imageUrl})` }}
            />
            <div className="hero-zoom-overlay">
              <Eye size={28} weight="bold" />
              <span>Enlarge Architecture Preview</span>
            </div>
          </div>

          <div className="detail-header-info">
            <div className="detail-title-row">
              <h1>{project.title}</h1>
              <button
                onClick={handleLike}
                disabled={!profile}
                className={`detail-like-badge ${hasLiked ? 'liked' : ''}`}
              >
                <Heart size={20} weight={hasLiked ? 'fill' : 'regular'} />
                <span>{project.likesCount} Likes</span>
              </button>
            </div>

            <div className="detail-meta-row">
              <div className="meta-item">
                <User size={16} />
                <span>By <strong>{project.creatorName}</strong></span>
              </div>
              <div className="meta-item">
                <Calendar size={16} />
                <span>Published on {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="detail-tags">
              {project.tags.map((tag) => (
                <span key={tag} className="detail-tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="detail-body-content">
            <h3>Project Pitch & Technical Walkthrough</h3>
            <p className="project-description-text">{project.description}</p>

            {project.embedUrl && (
              <div className="project-sandbox-preview">
                <div className="sandbox-header">
                  <Code size={20} />
                  <span>External Repository & Evaluation Link</span>
                </div>
                <div className="sandbox-content">
                  <p>This project includes external source code, configuration files, and evaluation datasets hosted on GitHub.</p>
                  <a
                    href={project.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary sandbox-link-btn"
                  >
                    <LinkSimple size={16} /> Open Code Repository
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="detail-comments-section">
            <h3>Community Feedback ({project.comments.length})</h3>
            
            <div className="comments-list">
              {project.comments.length === 0 ? (
                <p className="no-comments">No feedback yet. Start the conversation below!</p>
              ) : (
                project.comments.map((comment) => (
                  <div key={comment.id} className="comment-bubble">
                    <div className="comment-header">
                      <span className="comment-author">{comment.authorName}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-body">{comment.body}</p>
                  </div>
                ))
              )}
            </div>

            {profile ? (
              <form onSubmit={handleCommentSubmit} className="comment-submit-form">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Provide technical feedback, suggest enhancements, or ask questions..."
                  rows={3}
                  required
                />
                <button type="submit" className="btn btn--primary comment-send-btn">
                  <PaperPlaneRight size={16} /> Post Comment
                </button>
              </form>
            ) : (
              <div className="login-to-comment">
                <p>Please log in to participate in the project review discussion.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Overlay */}
      {lightboxUrl && (
        <div className="lightbox-overlay" onClick={() => { setLightboxUrl(null); setZoomScale(1); }}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <span className="lightbox-title">{lightboxTitle}</span>
              <div className="lightbox-actions">
                <button
                  type="button"
                  onClick={() => setZoomScale(s => Math.min(2.5, s + 0.25))}
                  className="lightbox-action-btn"
                  title="Zoom In"
                  id="lightbox-zoom-in"
                >
                  Zoom In ({Math.round(zoomScale * 100)}%)
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(s => Math.max(1, s - 0.25))}
                  className="lightbox-action-btn"
                  title="Zoom Out"
                  id="lightbox-zoom-out"
                >
                  Zoom Out
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(1)}
                  className="lightbox-action-btn"
                  title="Reset Zoom"
                  id="lightbox-zoom-reset"
                >
                  Reset
                </button>
                <a
                  href={lightboxUrl}
                  download={lightboxTitle || 'image'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lightbox-action-btn download-btn"
                  title="Download Image"
                  id="lightbox-download"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => { setLightboxUrl(null); setZoomScale(1); }}
                  className="lightbox-close-btn"
                  title="Close Lightbox"
                  id="lightbox-close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="lightbox-content">
              <img
                src={lightboxUrl}
                alt={lightboxTitle || 'Lightbox View'}
                style={{ transform: `scale(${zoomScale})` }}
                className="lightbox-image"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
