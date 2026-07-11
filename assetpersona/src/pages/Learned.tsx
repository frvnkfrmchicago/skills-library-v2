/* ═══ /learned/:shareId — Public Share Card ═══
 *
 * Lane 2 of AP-ENGAGEMENT-LOOP-2026-05. The destination for every share
 * link. Renders the celebration card (member avatar + handle + takeaway +
 * module title) for the visitor, and feeds the og-image Edge Function via
 * SEOHead so the link cards correctly on Twitter / LinkedIn / iMessage /
 * Threads. Non-members hit a sign-up footer; members hit "Open the module"
 * which deep-links into /community/learn/:slug.
 *
 * Celebration micro-interaction respects prefers-reduced-motion.
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
  Trophy,
  Sparkles,
  Twitter,
  Linkedin,
} from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { getByShareId, type ShareCardRow } from '../data/learningPosts';
import { track } from '../lib/analytics';
import './Learned.css';

const MODULE_TYPE_LABEL: Record<string, string> = {
  daily_drill: 'Daily Drill',
  news_drop: 'News Drop',
  concept: 'Concept',
  role_pathway: 'Pathway',
  project: 'Project',
};

function ogImageUrl(shareId: string): string {
  // Edge Function URL: VITE_SUPABASE_URL + /functions/v1/og-image.
  // Falls back to a relative path during dev so the meta tag still resolves
  // on whatever host the page is served from.
  const base = import.meta.env.VITE_SUPABASE_URL || '';
  if (!base) return `/functions/v1/og-image?shareId=${shareId}`;
  return `${base}/functions/v1/og-image?shareId=${encodeURIComponent(shareId)}`;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || 'AP';
}

export default function LearnedPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [row, setRow] = useState<ShareCardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shareId) return;
    let cancelled = false;
    setLoading(true);
    getByShareId(shareId)
      .then((data) => {
        if (cancelled) return;
        setRow(data);
        setLoading(false);
        if (data) {
          track('post_view', {
            kind: 'share_card',
            share_id: data.share_id,
            module_id: data.module_id,
          });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setRow(null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !shareId) return '';
    return `${window.location.origin}/learned/${shareId}`;
  }, [shareId]);

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      track('post_view', { kind: 'share_card_copy_link', share_id: shareId });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  if (loading) {
    return (
      <div className="learned learned--loading">
        <div className="learned__skeleton" aria-hidden="true" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="learned learned--missing">
        <SEOHead
          title="Share not found"
          path={`/learned/${shareId ?? ''}`}
          description="That share link is out of date."
        />
        <h1>Share not found</h1>
        <p>This share link is no longer active.</p>
        <Link to="/agenticstudyhall" className="btn btn--primary">
          <ArrowLeft size={14} aria-hidden="true" /> Browse the Study Hall
        </Link>
      </div>
    );
  }

  const ogImg = ogImageUrl(row.share_id);
  const completedOn = fmtDate(row.shared_at);
  const seoDescription = `"${row.takeaway}" — ${row.display_name} on ${row.module_title}`;
  const moduleTypeLabel = MODULE_TYPE_LABEL[row.module_type] ?? 'Module';
  const moduleHref = `/learn/${row.module_slug}?from=${encodeURIComponent(row.display_name)}`;
  const signupHref = `/login?mode=signup&redirect=${encodeURIComponent(`/community/learn/${row.module_slug}`)}`;
  const xShareText = `"${row.takeaway}" — ${row.display_name} on Asset Persona`;
  const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(xShareText)}&url=${encodeURIComponent(shareUrl)}`;
  const liShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <>
      <SEOHead
        title={`${row.display_name} learned: ${row.module_title}`}
        description={seoDescription}
        path={`/learned/${row.share_id}`}
        image={ogImg}
        type="article"
        publishedAt={row.shared_at}
        author={row.display_name}
      />

      <div className="learned">
        <article
          className="learned__card"
          itemScope
          itemType="https://schema.org/CreativeWork"
        >
          <header className="learned__header">
            <span className="learned__brand">
              <span className="learned__brand-mark" aria-hidden="true">AP</span>
              Asset Persona
            </span>
            <span className="learned__category">{moduleTypeLabel}</span>
          </header>

          <p className="learned__eyebrow">
            <Sparkles size={14} aria-hidden="true" /> Today I learned
          </p>

          <p className="learned__takeaway" itemProp="text">
            “{row.takeaway}”
          </p>

          <footer className="learned__footer">
            <div className="learned__author">
              {row.avatar_url ? (
                <img
                  src={row.avatar_url}
                  alt={row.display_name}
                  className="learned__avatar"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="learned__avatar learned__avatar--initials" aria-hidden="true">
                  {initials(row.display_name)}
                </span>
              )}
              <div className="learned__author-meta">
                <strong>{row.display_name}</strong>
                <span>shared on Asset Persona</span>
              </div>
            </div>

            <div className="learned__module">
              <span className="learned__module-title">{row.module_title}</span>
              {completedOn && (
                <span className="learned__module-date">Completed {completedOn}</span>
              )}
            </div>
          </footer>
        </article>

        <div className="learned__actions">
          <Link to={moduleHref} className="btn btn--primary learned__cta">
            <BookOpen size={16} aria-hidden="true" />
            Learn this module
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <button
            type="button"
            className="btn btn--ghost learned__copy"
            onClick={handleCopy}
            aria-live="polite"
          >
            {copied ? (
              <>
                <Check size={14} aria-hidden="true" /> Link copied
              </>
            ) : (
              <>
                <Copy size={14} aria-hidden="true" /> Copy link
              </>
            )}
          </button>

          <a
            href={xShareUrl}
            className="btn btn--ghost learned__social"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
          >
            <Twitter size={14} aria-hidden="true" />
            <span>Post on X</span>
          </a>

          <a
            href={liShareUrl}
            className="btn btn--ghost learned__social"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
          >
            <Linkedin size={14} aria-hidden="true" />
            <span>Share on LinkedIn</span>
          </a>
        </div>

        <aside className="learned__signup">
          <Trophy size={20} aria-hidden="true" className="learned__signup-icon" />
          <div>
            <h2>Build your own streak</h2>
            <p>
              Asset Persona membership is free. Finish modules, mint your own
              share cards, climb the role ladder.
            </p>
          </div>
          <Link to={signupHref} className="btn btn--primary learned__signup-cta">
            Sign up free
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </>
  );
}
