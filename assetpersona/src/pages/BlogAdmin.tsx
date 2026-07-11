import { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  TrendUp,
  Article,
  PencilSimple,
  CalendarBlank,
  MagnifyingGlass,
  Globe,
  Clock,
  ChartBar,
  MagicWand,
  Tag,
  ListChecks,
  ChatCircleText,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { useScrollReveal, useStaggerReveal } from '../hooks/useGSAP';
import { getAllPublishedPosts, BLOG_POSTS, computeSEOScore } from '../content/blog';
import type { BlogPost } from '../content/blog';
import { getDrafts } from '../data/blogDrafts';
import './BlogAdmin.css';

/* ── SEO Score Ring ── */
function SEOScore({ score }: { score: number }) {
  const color =
    score >= 90
      ? 'var(--color-success)'
      : score >= 70
        ? 'var(--color-accent-blue)'
        : 'var(--color-warning)';
  const pct = `${score}%`;
  return (
    <div className="admin__seo-ring">
      <svg viewBox="0 0 36 36" className="admin__seo-svg">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="2.5"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <span className="admin__seo-value" style={{ color }}>
        {pct}
      </span>
    </div>
  );
}

/* ── Character counter with color feedback ── */
function CharCount({ current, min, max }: { current: number; min: number; max: number }) {
  const isGood = current >= min && current <= max;
  const isClose = current >= min - 10 && current <= max + 10;
  const color = isGood ? 'var(--color-success)' : isClose ? 'var(--color-accent-blue)' : 'var(--color-warning)';
  return (
    <span className="admin__char-count" style={{ color }}>
      {current}/{min}-{max}
    </span>
  );
}

/* ── SEO/AEO Detail Panel ── */
function SEOPanel({ post }: { post: BlogPost }) {
  const seoTitle = post.seoTitle || post.title;
  const seoDesc = post.seoDescription || post.excerpt;
  const score = computeSEOScore(post);

  return (
    <div className="admin__seo-panel">
      {/* Google Preview */}
      <div className="admin__seo-section">
        <p className="admin__seo-heading">
          <Globe size={14} weight="bold" /> Google Preview
        </p>
        <div className="admin__seo-mock">
          <p className="admin__seo-mock-title">{seoTitle}</p>
          <p className="admin__seo-mock-url">
            assetpersona.com/blog/{post.slug}
          </p>
          <p className="admin__seo-mock-desc">{seoDesc}</p>
        </div>
        <div className="admin__seo-meters">
          <div className="admin__seo-meter">
            <span>Title</span>
            <CharCount current={seoTitle.length} min={50} max={60} />
          </div>
          <div className="admin__seo-meter">
            <span>Description</span>
            <CharCount current={seoDesc.length} min={150} max={160} />
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="admin__seo-section">
        <p className="admin__seo-heading">
          <Tag size={14} weight="bold" /> Keywords
          {post.keywords && post.keywords.length >= 3 ? (
            <span className="admin__seo-badge admin__seo-badge--good">Good</span>
          ) : (
            <span className="admin__seo-badge admin__seo-badge--warn">Add more</span>
          )}
        </p>
        <div className="admin__keyword-list">
          {post.keywords?.map((kw) => (
            <span key={kw} className="admin__keyword-chip">{kw}</span>
          )) || <span className="admin__seo-empty">No keywords defined</span>}
        </div>
      </div>

      {/* AEO: FAQ Schema */}
      <div className="admin__seo-section">
        <p className="admin__seo-heading">
          <ChatCircleText size={14} weight="bold" /> FAQ Rich Results (AEO)
          {post.faqSchema && post.faqSchema.length >= 2 ? (
            <span className="admin__seo-badge admin__seo-badge--good">Active</span>
          ) : (
            <span className="admin__seo-badge admin__seo-badge--warn">Needs FAQs</span>
          )}
        </p>
        {post.faqSchema && post.faqSchema.length > 0 ? (
          <div className="admin__faq-list">
            {post.faqSchema.map((faq, i) => (
              <div key={i} className="admin__faq-item">
                <p className="admin__faq-q">Q: {faq.question}</p>
                <p className="admin__faq-a">A: {faq.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin__seo-empty">No FAQ schema. Add question/answer pairs to appear in Google's rich results.</p>
        )}
      </div>

      {/* Score Breakdown */}
      <div className="admin__seo-section admin__seo-section--score">
        <p className="admin__seo-heading">
          <ListChecks size={14} weight="bold" /> SEO Checklist
        </p>
        <div className="admin__checklist">
          <CheckItem done={seoTitle.length >= 50 && seoTitle.length <= 60} label="Title 50-60 characters" />
          <CheckItem done={seoDesc.length >= 150 && seoDesc.length <= 160} label="Description 150-160 characters" />
          <CheckItem done={!!post.keywords && post.keywords.length >= 3} label="3+ keywords defined" />
          <CheckItem done={!!post.faqSchema && post.faqSchema.length >= 2} label="2+ FAQ items for AEO" />
          <CheckItem done={post.tags.length >= 2} label="2+ tags for categorization" />
        </div>
        <div className="admin__score-total">
          Score: <strong>{score}/100</strong>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`admin__check-item ${done ? 'admin__check-item--done' : ''}`}>
      <span className="admin__check-icon">{done ? '✓' : '○'}</span>
      <span>{label}</span>
    </div>
  );
}

/* ── Main Component ── */
export default function BlogAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const headerRef = useScrollReveal({ y: 30, duration: 0.6 });
  const statsRef = useStaggerReveal('.admin__stat-card', {
    stagger: 0.08,
    y: 25,
    duration: 0.5,
  });

  const filtered = BLOG_POSTS.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const allPublished = getAllPublishedPosts();
  const drafts = getDrafts();
  const publishedCount = allPublished.length;
  const avgScore = Math.round(
    allPublished.reduce((sum, p) => sum + computeSEOScore(p), 0) / (allPublished.length || 1),
  );

  return (
    <div className="admin">
      <div className="container">
        {/* ── HEADER ── */}
        <div className="admin__header" ref={headerRef}>
          <Link to="/" className="admin__back">
            <ArrowLeft size={16} weight="bold" /> Back to site
          </Link>
          <div className="admin__title-row">
            <h1 className="admin__title">
              Content <span className="text-accent-blue">Studio</span>
            </h1>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <Link to="/admin/blog/new" className="btn btn--primary admin__preview-btn">
                <PencilSimple size={16} weight="duotone" /> New Post
              </Link>
              <Link to="/blog" className="btn btn--ghost admin__preview-btn">
                <Globe size={16} weight="duotone" /> View live blog
              </Link>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="admin__stats" ref={statsRef}>
          <div className="admin__stat-card admin__stat-card--total">
            <div className="admin__stat-icon-wrap admin__stat-icon-wrap--blue">
              <Article size={22} weight="duotone" />
            </div>
            <div>
              <p className="admin__stat-number">{BLOG_POSTS.length}</p>
              <p className="admin__stat-label">Total Posts</p>
            </div>
          </div>

          <div className="admin__stat-card admin__stat-card--pub">
            <div className="admin__stat-icon-wrap admin__stat-icon-wrap--green">
              <TrendUp size={22} weight="duotone" />
            </div>
            <div>
              <p className="admin__stat-number">{publishedCount}</p>
              <p className="admin__stat-label">Published</p>
            </div>
          </div>

          <div className="admin__stat-card admin__stat-card--draft">
            <div className="admin__stat-icon-wrap admin__stat-icon-wrap--amber">
              <MagicWand size={22} weight="duotone" />
            </div>
            <div>
              <p className="admin__stat-number">{avgScore}%</p>
              <p className="admin__stat-label">Avg SEO Score</p>
            </div>
          </div>

          <div className="admin__stat-card admin__stat-card--views">
            <div className="admin__stat-icon-wrap admin__stat-icon-wrap--salmon">
              <ChartBar size={22} weight="duotone" />
            </div>
            <div>
              <p className="admin__stat-number">
                {BLOG_POSTS.reduce((s, p) => s + (p.faqSchema?.length || 0), 0)}
              </p>
              <p className="admin__stat-label">FAQ Items</p>
            </div>
          </div>
        </div>

        {/* ── QUICK START ── */}
        <Link to="/admin/blog/new" className="admin__howto liquid-glass" style={{ textDecoration: 'none', color: 'inherit' }}>
          <PencilSimple size={18} weight="duotone" />
          <div>
            <p className="admin__howto-title">Write a new blog post</p>
            <p className="admin__howto-desc">
              Open the editor to write, preview, add SEO fields, and publish directly from the admin.
            </p>
          </div>
        </Link>

        {/* ── DRAFTS SECTION ── */}
        {drafts.length > 0 && (
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
              Drafts ({drafts.length})
            </h2>
            <div className="admin__list">
              {drafts.map((d) => (
                <div key={d.id} className="admin__post liquid-glass">
                  <div className="admin__post-header">
                    <div className="admin__post-info">
                      <h3 className="admin__post-title">{d.title || 'Untitled'}</h3>
                      <div className="admin__post-meta">
                        <span className="admin__post-chip">
                          <CalendarBlank size={13} weight="bold" /> {new Date(d.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="admin__post-status" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--color-warning)' }}>
                          draft
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <Link
                        to={`/admin/blog/edit/${d.slug}`}
                        className="btn btn--secondary btn--sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PencilSimple size={14} weight="bold" /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEARCH ── */}
        <div className="admin__toolbar">
          <div className="admin__search">
            <MagnifyingGlass size={18} weight="bold" className="admin__search-icon" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin__search-input"
            />
          </div>
        </div>

        {/* ── POST LIST ── */}
        <div className="admin__list">
          {filtered.map((post) => {
            const score = computeSEOScore(post);
            return (
              <div
                key={post.slug}
                className={`admin__post liquid-glass ${expandedSlug === post.slug ? 'admin__post--open' : ''}`}
              >
                <div
                  className="admin__post-header"
                  onClick={() =>
                    setExpandedSlug(expandedSlug === post.slug ? null : post.slug)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      setExpandedSlug(expandedSlug === post.slug ? null : post.slug);
                  }}
                >
                  {/* colour accent strip */}
                  <div
                    className="admin__post-accent"
                    style={{ background: post.coverGradient || 'var(--gradient-muted)' }}
                  />

                  <div className="admin__post-info">
                    <h3 className="admin__post-title">{post.title}</h3>
                    <div className="admin__post-meta">
                      <span className="admin__post-chip">
                        <CalendarBlank size={13} weight="bold" /> {post.date}
                      </span>
                      <span className="admin__post-chip">
                        <Clock size={13} weight="bold" /> {post.readTime}
                      </span>
                      <span className="admin__post-chip">
                        <Tag size={13} weight="bold" /> {post.tags.length} tags
                      </span>
                      <span className="admin__post-status admin__post-status--published">
                        published
                      </span>
                    </div>
                  </div>

                  <div className="admin__post-actions">
                    <SEOScore score={score} />
                  </div>
                </div>

                {expandedSlug === post.slug && (
                  <div className="admin__post-expanded">
                    <p className="admin__post-excerpt">{post.excerpt}</p>

                    <SEOPanel post={post} />

                    <div className="admin__post-footer">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="btn btn--secondary admin__post-view"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye size={14} weight="bold" /> Preview
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="admin__empty liquid-glass">
              <p>No posts match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
