import { useState } from 'react';
import { Play, Clock, Search } from 'lucide-react';
import { MonitorPlay, ArrowRight, Calendar, BookmarkSimple } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import { useStaggerReveal } from '../hooks/useGSAP';
import { RECORDINGS, type Recording } from '../data/recordings';
import { getAllPublishedPosts } from '../content/blog';
import './Recordings.css';

export default function Recordings() {
  const [search, setSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState<Recording | null>(null);

  const containerRef = useStaggerReveal('.recordings__card', {
    stagger: 0.1,
    y: 30,
    duration: 0.6,
  });

  const filtered = RECORDINGS.filter((ep) => {
    if (search === '') return true;
    const q = search.toLowerCase();
    return (
      ep.title.toLowerCase().includes(q) ||
      ep.description.toLowerCase().includes(q) ||
      ep.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const recentPosts = getAllPublishedPosts().slice(0, 3);

  return (
    <>
      <SEOHead
        title="Talk Through Tech: Recordings | Asset Persona"
        description="Watch Talk Through Tech episodes. AI education, vibe coding breakdowns, and real talk about the digital economy."
      />

      <section className="recordings">
        <div className="container">
          <div className="recordings__hero">
            <p className="text-uppercase text-accent-blue">
              <MonitorPlay size={20} weight="duotone" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Talk Through Tech
            </p>
            <h1 className="recordings__title">
              Watch. Learn. <span className="text-accent-salmon">Build.</span>
            </h1>
            <p className="recordings__subtitle">
              Real talk about AI, vibe coding, marketing, and building in the digital economy.
              New episodes weekly.
            </p>
          </div>

          <div className="recordings__layout-grid">
            {/* Main Column: Episodes List */}
            <div className="recordings__main-content">
              <div className="recordings__controls">
                <div className="recordings__search">
                  <Search size={16} className="recordings__search-icon" />
                  <input
                    type="text"
                    placeholder="Search episodes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="recordings__search-input"
                  />
                </div>
                <span className="recordings__count">{filtered.length} episodes</span>
              </div>

              <div className="recordings__list" ref={containerRef}>
                {filtered.map((ep, i) => (
                  <div
                    key={ep.id}
                    className={`recordings__card liquid-glass border-glow ${i === 0 ? 'recordings__card--featured' : ''}`}
                    onClick={() => ep.videoUrl && setActiveVideo(ep)}
                    style={{ cursor: ep.videoUrl ? 'pointer' : 'default' }}
                  >
                    <div className="recordings__card-thumbnail">
                      <div className="recordings__card-play">
                        <Play size={28} fill="currentColor" />
                      </div>
                      {i === 0 && <span className="recordings__card-badge">Latest</span>}
                    </div>

                    <div className="recordings__card-body">
                      <div className="recordings__card-meta">
                        <span className="recordings__card-date">
                          {new Date(ep.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="recordings__card-duration">
                          <Clock size={14} /> {ep.duration}
                        </span>
                      </div>

                      <h2 className="recordings__card-title">{ep.title}</h2>
                      <p className="recordings__card-desc">{ep.description}</p>

                      <div className="recordings__card-tags">
                        {ep.tags.map((tag) => (
                          <span key={tag} className="recordings__card-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="recordings__empty">
                  <p>No episodes match your search.</p>
                </div>
              )}
            </div>

            {/* Sidebar Column: Daily Blog Cards */}
            <aside className="recordings__sidebar">
              <div className="recordings__sidebar-header">
                <BookmarkSimple size={20} className="text-accent-salmon" />
                <h3 className="recordings__sidebar-title">Daily Blog Insights</h3>
              </div>
              
              <div className="recordings__blog-list">
                {recentPosts.map((post) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`} className="recordings__blog-card border-glow liquid-glass">
                    <div className="recordings__blog-card-body">
                      <div className="recordings__blog-card-meta">
                        <span className="recordings__blog-card-date">
                          <Calendar size={12} style={{ marginRight: '4px', display: 'inline' }} />
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="recordings__blog-card-read">{post.readTime}</span>
                      </div>
                      <h4 className="recordings__blog-card-title">{post.title}</h4>
                      <p className="recordings__blog-card-excerpt">{post.excerpt}</p>
                      <span className="recordings__blog-card-link">
                        Read Article <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Video Overlay Player Modal */}
      {activeVideo && (
        <div className="recordings__modal-backdrop" onClick={() => setActiveVideo(null)}>
          <div className="recordings__modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="recordings__modal-close" onClick={() => setActiveVideo(null)} aria-label="Close video player">
              &times;
            </button>
            <div className="recordings__video-wrapper">
              <iframe
                src={activeVideo.videoUrl}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="recordings__modal-info">
              <span className="recordings__modal-meta">{activeVideo.duration} · {activeVideo.date}</span>
              <h2>{activeVideo.title}</h2>
              <p>{activeVideo.description}</p>
              <div className="recordings__modal-tags">
                {activeVideo.tags.map((t) => (
                  <span key={t} className="recordings__modal-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
