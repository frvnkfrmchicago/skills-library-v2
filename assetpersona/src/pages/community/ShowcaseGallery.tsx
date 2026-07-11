import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChatCircle, Plus, MagnifyingGlass, X, Code, Eye } from '@phosphor-icons/react';
import { getProjects, addProject, toggleLikeProject } from '../../data/showcaseStore';
import type { Project } from '../../data/showcaseStore';
import { useAuth } from '../../context/useAuth';
import SubTabs from '../../components/community/SubTabs';
import './ShowcaseGallery.css';

const PORTFOLIO_TABS = [
  { to: '/community/portfolio', label: 'Projects' },
  { to: '/community/credentials', label: 'Credentials' },
  { to: '/community/showcase', label: 'Showcase' },
  { to: '/community/saved', label: 'Saved' },
];

const SAMPLE_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
];

export default function ShowcaseGallery() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'comfort' | 'compact'>('comfort');

  // Lightbox State
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newEmbedUrl, setNewEmbedUrl] = useState('');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const list = await getProjects();
    setProjects(list);
  };

  const handleLike = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile) return;
    const updated = await toggleLikeProject(projectId, profile.id);
    if (updated) {
      loadProjects();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const parsedTags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await addProject({
      title: newTitle,
      description: newDescription,
      imageUrl: SAMPLE_PRESET_IMAGES[selectedImageIdx],
      creatorName: profile.display_name,
      creatorId: profile.id,
      tags: parsedTags.length > 0 ? parsedTags : ['AI Showcase'],
      embedUrl: newEmbedUrl || undefined
    });

    // Reset Form & Close Modal
    setNewTitle('');
    setNewDescription('');
    setNewTags('');
    setNewEmbedUrl('');
    setIsModalOpen(false);
    loadProjects();
  };

  // Get unique list of tags across all projects for filters
  const allTags = ['All', ...Array.from(new Set(projects.flatMap((p) => p.tags)))];

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.creatorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'All' || p.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="showcase-gallery">
      <SubTabs tabs={PORTFOLIO_TABS} />
      {/* Header and Call to Action */}
      <div className="showcase-header">
        <div className="header-text-group">
          <h1>AI Project Showcase</h1>
          <p>Explore and review state-of-the-art prompt designs, RAG setups, and agent sandboxes built by the community.</p>
        </div>
        {profile && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn--primary upload-trigger-btn">
            <Plus size={18} weight="bold" /> Share Project
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="showcase-filters-bar">
        <div className="filters-controls-row">
          <div className="search-box-wrapper">
            <MagnifyingGlass size={18} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, tags, or creators..."
              className="showcase-search-input"
            />
          </div>
          <div className="grid-density-selector">
            <button
              onClick={() => setViewMode('comfort')}
              className={`density-btn ${viewMode === 'comfort' ? 'active' : ''}`}
              title="Comfortable Immersive View"
            >
              Comfort
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`density-btn ${viewMode === 'compact' ? 'active' : ''}`}
              title="Compact Dense View"
            >
              Compact
            </button>
          </div>
        </div>
        <div className="tags-filters-scroll">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`filter-tag-btn ${selectedTag === tag ? 'active' : ''}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Showcase Grid */}
      {filteredProjects.length === 0 ? (
        <div className="empty-showcase">
          <Code size={48} className="empty-icon" />
          <h3>No projects found</h3>
          <p>Be the first to share your prompt engineering or RAG routing pipelines with the studio.</p>
        </div>
      ) : (
        <div className={`showcase-grid ${viewMode === 'comfort' ? 'grid-comfort' : 'grid-compact'}`}>
          {filteredProjects.map((project) => (
            <Link to={`/community/showcase/${project.id}`} key={project.id} className="project-card-link">
              <div className="project-card">
                <div
                  className="project-image-banner"
                  style={{ backgroundImage: `url(${project.imageUrl})` }}
                >
                  <div className="creator-badge" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/community/members/${project.creatorId}`} className="creator-profile-link">
                      by {project.creatorName}
                    </Link>
                  </div>
                  <button
                    className="banner-zoom-trigger"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLightboxUrl(project.imageUrl);
                      setLightboxTitle(project.title);
                      setZoomScale(1);
                    }}
                    title="Zoom Image"
                    id={`zoom-project-${project.id}`}
                  >
                    <Eye size={20} weight="bold" />
                  </button>
                </div>
                <div className="project-card-content">
                  <h3 className="project-card-title">{project.title}</h3>
                  <p className="project-card-description">{project.description}</p>
                  
                  <div className="project-card-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="project-card-tag">{tag}</span>
                    ))}
                  </div>

                  <div className="project-card-footer">
                    <button
                      onClick={(e) => handleLike(e, project.id)}
                      className={`project-stat-btn like-btn ${profile && project.likedBy.includes(profile.id) ? 'liked' : ''}`}
                    >
                      <Heart size={16} weight={profile && project.likedBy.includes(profile.id) ? 'fill' : 'regular'} />
                      <span>{project.likesCount}</span>
                    </button>
                    <div className="project-stat-btn comment-count-btn">
                      <ChatCircle size={16} />
                      <span>{project.comments.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Upload Composer Modal */}
      {isModalOpen && (
        <div className="composer-modal-overlay">
          <div className="composer-modal-card">
            <div className="modal-header">
              <h3>Share Your AI Architecture</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-modal-btn">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="composer-form">
              <div className="form-group">
                <label htmlFor="title">Project Title</label>
                <input
                  type="text"
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Prompt Router with Self-Correction"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Short Pitch / Description</label>
                <textarea
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explain the problem this solves, how you structured context/prompts, and the evaluation results..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. RAG, CrewAI, Python, Prompts"
                />
              </div>

              <div className="form-group">
                <label htmlFor="embed">Sandbox / Code URL (optional)</label>
                <input
                  type="url"
                  id="embed"
                  value={newEmbedUrl}
                  onChange={(e) => setNewEmbedUrl(e.target.value)}
                  placeholder="e.g. https://github.com/your-username/repo"
                />
              </div>

              <div className="form-group">
                <label>Select Cover Theme</label>
                <div className="image-preset-picker">
                  {SAMPLE_PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`preset-img-btn ${selectedImageIdx === idx ? 'selected' : ''}`}
                      style={{ backgroundImage: `url(${img})` }}
                    />
                  ))}
                </div>
              </div>

              <div className="composer-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn--ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
