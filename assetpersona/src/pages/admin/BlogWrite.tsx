/* ═══ BLOG WRITE — Create/Edit blog posts ═══ */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FloppyDisk, Eye, Rocket, Trash } from '@phosphor-icons/react';
import MarkdownEditor from '../../components/editor/MarkdownEditor';
import CoverImageUpload from '../../components/editor/CoverImageUpload';
import VideoUploader, { type VideoAsset } from '../../components/learn/VideoUploader';
import { computeSEOScore } from '../../content/blog';
import type { FAQItem } from '../../content/blog';
import {
  saveDraft,
  getDraftBySlug,
  publishDraft,
  deleteDraft,
  type BlogDraft,
} from '../../data/blogDrafts';
import './BlogWrite.css';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function BlogWrite() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const isEditMode = !!slug;

  // Core fields
  const [draftId, setDraftId] = useState(() => crypto.randomUUID());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);

  // UI state
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showSEO, setShowSEO] = useState(false);

  // Load existing draft in edit mode
  useEffect(() => {
    if (!slug) return;
    const existing = getDraftBySlug(slug);
    if (!existing) return;

    // Batch these updates — React will batch them in the same tick
    queueMicrotask(() => {
      setDraftId(existing.id as ReturnType<typeof crypto.randomUUID>);
      setTitle(existing.title);
      setContent(existing.content);
      setExcerpt(existing.excerpt);
      setTags(existing.tags.join(', '));
      setStatus(existing.status);
      setCoverImage(existing.coverImage);
      setSeoTitle(existing.seoTitle || '');
      setSeoDescription(existing.seoDescription || '');
      setKeywords(existing.keywords?.join(', ') || '');
      setFaqItems(existing.faqSchema || []);
    });
  }, [slug]);

  // Slug used for storage paths — derived from title
  const currentSlug = useMemo(() => slug || slugify(title || 'untitled'), [slug, title]);

  // Build current draft object
  const buildDraft = useCallback(
    (): Partial<BlogDraft> & { id: string } => ({
      id: draftId,
      title,
      content,
      excerpt,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      status,
      coverImage,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean) || undefined,
      faqSchema: faqItems.length > 0 ? faqItems : undefined,
    }),
    [draftId, title, content, excerpt, tags, status, coverImage, seoTitle, seoDescription, keywords, faqItems]
  );

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!title && !content) return;
    const interval = setInterval(() => {
      saveDraft(buildDraft());
      setLastSaved(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(interval);
  }, [buildDraft, title, content]);

  // Manual save
  function handleSave() {
    saveDraft(buildDraft());
    setLastSaved(new Date().toLocaleTimeString());
  }

  // Publish
  function handlePublish() {
    const draft = saveDraft({ ...buildDraft(), status: 'published' });
    publishDraft(draft.id);
    navigate('/admin/blog');
  }

  // Delete
  function handleDelete() {
    if (!confirm('Delete this draft? This cannot be undone.')) return;
    deleteDraft(draftId);
    navigate('/admin/blog');
  }

  // Add FAQ item
  function handleAddFaq() {
    if (!faqQ.trim() || !faqA.trim()) return;
    setFaqItems([...faqItems, { question: faqQ.trim(), answer: faqA.trim() }]);
    setFaqQ('');
    setFaqA('');
  }

  // Live SEO score
  const seoScore = computeSEOScore({
    slug: '',
    title: seoTitle || title,
    excerpt: seoDescription || excerpt,
    content,
    author: 'Frank Lawrence Jr.',
    date: new Date().toISOString(),
    readTime: '1 min',
    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    seoTitle: seoTitle || undefined,
    seoDescription: seoDescription || undefined,
    keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
    faqSchema: faqItems.length > 0 ? faqItems : undefined,
  });

  const seoColor = seoScore >= 90 ? 'var(--color-success)'
    : seoScore >= 70 ? 'var(--color-brand-primary)'
    : 'var(--color-warning)';

  return (
    <div className="blog-write">
      <div className="container">
        {/* ── Header ── */}
        <div className="blog-write__header">
          <button className="blog-write__back" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft size={16} /> Back to Content Studio
          </button>
          <div className="blog-write__actions">
            {lastSaved && (
              <span className="blog-write__saved">Saved {lastSaved}</span>
            )}
            <button className="btn btn--ghost btn--sm" onClick={handleSave}>
              <FloppyDisk size={16} /> Save Draft
            </button>
            {isEditMode && (
              <button className="btn btn--ghost btn--sm blog-write__delete" onClick={handleDelete}>
                <Trash size={16} /> Delete
              </button>
            )}
            <button className="btn btn--primary btn--sm" onClick={handlePublish}>
              <Rocket size={16} /> Publish
            </button>
          </div>
        </div>

        {/* ── Title ── */}
        <input
          className="blog-write__title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
        />

        {/* ── Excerpt ── */}
        <textarea
          className="blog-write__excerpt-input"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Write a short excerpt (shown on blog cards and in search results)..."
          rows={2}
        />

        {/* ── Tags ── */}
        <input
          className="blog-write__tags-input"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated): AI, Prompting, Vibe Coding"
        />

        {/* ── Cover Image ── */}
        <CoverImageUpload
          value={coverImage}
          slug={currentSlug}
          onChange={setCoverImage}
        />

        {/* ── Editor ── */}
        <MarkdownEditor value={content} onChange={setContent} />

        {/* ── Video upload (drops a markdown <video> embed into the body) ── */}
        <div className="blog-write__video-section">
          <h4>Attach a video</h4>
          <p>Uploads land in your private `videos` bucket. A signed playback link is inserted into the post body when the upload finishes.</p>
          <VideoUploader
            onUploaded={(asset: VideoAsset) => {
              const url = asset.playback_url ?? '';
              const block = `\n\n<video controls preload="metadata" src="${url}"></video>\n\n`;
              setContent((prev) => `${prev}${block}`);
            }}
            label="Drop a clip for this post"
          />
        </div>

        {/* ── SEO Panel ── */}
        <button
          className="blog-write__seo-toggle"
          onClick={() => setShowSEO(!showSEO)}
        >
          <Eye size={16} />
          SEO & AEO Settings
          <span className="blog-write__seo-score" style={{ color: seoColor }}>
            {seoScore}/100
          </span>
        </button>

        {showSEO && (
          <div className="blog-write__seo-panel">
            <label className="blog-write__field">
              <span>SEO Title <small>({(seoTitle || title).length}/50-60 chars)</small></span>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || 'Custom SEO title...'}
              />
            </label>

            <label className="blog-write__field">
              <span>Meta Description <small>({(seoDescription || excerpt).length}/150-160 chars)</small></span>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={excerpt || 'Custom meta description...'}
                rows={3}
              />
            </label>

            <label className="blog-write__field">
              <span>Keywords <small>(comma separated, 3+ recommended)</small></span>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="AI literacy, vibe coding, prompt engineering"
              />
            </label>

            {/* FAQ Schema for AEO */}
            <div className="blog-write__faq-section">
              <h4>FAQ Schema (AEO Rich Results)</h4>
              {faqItems.map((faq, i) => (
                <div key={i} className="blog-write__faq-item">
                  <p><strong>Q:</strong> {faq.question}</p>
                  <p><strong>A:</strong> {faq.answer}</p>
                  <button
                    className="blog-write__faq-remove"
                    onClick={() => setFaqItems(faqItems.filter((_, idx) => idx !== i))}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="blog-write__faq-form">
                <input
                  type="text"
                  value={faqQ}
                  onChange={(e) => setFaqQ(e.target.value)}
                  placeholder="Question"
                />
                <textarea
                  value={faqA}
                  onChange={(e) => setFaqA(e.target.value)}
                  placeholder="Answer"
                  rows={2}
                />
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={handleAddFaq}
                  disabled={!faqQ.trim() || !faqA.trim()}
                >
                  Add FAQ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
