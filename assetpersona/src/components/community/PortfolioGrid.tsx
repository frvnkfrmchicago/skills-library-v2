/* ═══ PortfolioGrid — pinned projects & liked gallery projects ═══
 *
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 4
 *
 * Mounts on a Profile (public `/u/:handle` AND the private community
 * Profile) to render the up-to-8 pinned projects a member has chosen
 * to showcase. Also queries and filters projects they've liked in the Showcase Gallery.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowSquareOut,
  Globe,
  PushPin,
  Image as ImageIcon,
} from '@phosphor-icons/react';
import { listPinnedFor, incrementProjectClicks, type MemberProject } from '../../data/memberProjects';
import { getProjects } from '../../data/showcaseStore';
import './PortfolioGrid.css';

export interface PortfolioGridProps {
  /** Profile whose pinned projects we should render. */
  profileId: string;
  /** When true, show an "Edit portfolio" call-to-action (owner view). */
  editable?: boolean;
  /** Optional className for layout overrides at the mount site. */
  className?: string;
}

export default function PortfolioGrid({
  profileId,
  editable = false,
  className,
}: PortfolioGridProps) {
  const [projects, setProjects] = useState<MemberProject[]>([]);
  const [likedProjects, setLikedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedMode, setFeedMode] = useState<'pinned' | 'liked'>('pinned');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadData = async () => {
      try {
        const pinned = await listPinnedFor(profileId);
        if (!cancelled) setProjects(pinned);

        const allShowcase = await getProjects();
        const liked = allShowcase.filter((p) => p.likedBy.includes(profileId));
        if (!cancelled) setLikedProjects(liked);
      } catch (err) {
        console.error('Error loading portfolio grids:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  if (loading) {
    return (
      <section
        className={['portfolio-grid', className ?? ''].filter(Boolean).join(' ')}
        aria-busy="true"
      >
        <div className="portfolio-grid__loading">Loading projects…</div>
      </section>
    );
  }

  return (
    <section
      className={['portfolio-grid', className ?? ''].filter(Boolean).join(' ')}
      aria-label="Portfolio and liked feed"
    >
      {/* Feed Toggle Header */}
      {(projects.length > 0 || likedProjects.length > 0) && (
        <div className="portfolio-grid__tabs">
          <button
            type="button"
            className={`portfolio-grid__tab-btn ${feedMode === 'pinned' ? 'is-active' : ''}`}
            onClick={() => setFeedMode('pinned')}
          >
            Pinned Projects ({projects.length})
          </button>
          {likedProjects.length > 0 && (
            <button
              type="button"
              className={`portfolio-grid__tab-btn ${feedMode === 'liked' ? 'is-active' : ''}`}
              onClick={() => setFeedMode('liked')}
            >
              Liked in Gallery ({likedProjects.length})
            </button>
          )}
        </div>
      )}

      {feedMode === 'pinned' ? (
        <>
          {projects.length === 0 ? (
            editable ? (
              <div className="portfolio-grid__empty-card community-card">
                <PushPin size={32} weight="duotone" />
                <h3>Pin your first project</h3>
                <p>
                  Showcase 3-8 things you're proud of. Public profiles render
                  them in a clean grid for employers and collaborators.
                </p>
                <Link to="/community/portfolio" className="portfolio-grid__cta">
                  Add projects
                </Link>
              </div>
            ) : (
              <p className="portfolio-grid__empty-line">
                No pinned projects yet.
              </p>
            )
          ) : (
            <div className="portfolio-grid__cards">
              {projects.map((p) => (
                <PortfolioCard key={p.id} project={p} />
              ))}
            </div>
          )}
          
          {editable && (
            <div className="portfolio-grid__footer">
              <Link to="/community/portfolio" className="portfolio-grid__cta">
                Edit portfolio
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="portfolio-grid__cards">
          {likedProjects.map((p) => (
            <LikedProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function PortfolioCard({ project }: { project: MemberProject }) {
  const hasImage = !!project.image_url;
  const hasProjectLink = !!project.project_url;
  const hasDemoLink = !!project.demo_url;
  const [clicks, setClicks] = useState(project.clicks_count ?? 0);

  const handleClick = async () => {
    setClicks((c) => c + 1);
    try {
      await incrementProjectClicks(project.id);
    } catch {
      setClicks((c) => Math.max(0, c - 1));
    }
  };

  return (
    <article className="portfolio-card community-card border-glow">
      <div className="portfolio-card__media" aria-hidden="true">
        {hasImage ? (
          <img
            src={project.image_url ?? ''}
            alt=""
            loading="lazy"
            className="portfolio-card__image"
          />
        ) : (
          <div className="portfolio-card__placeholder">
            <ImageIcon size={32} weight="duotone" />
          </div>
        )}
      </div>
      <div className="portfolio-card__body">
        <h3 className="portfolio-card__title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span>{project.title}</span>
          {clicks > 0 && (
            <span style={{ fontSize: '10px', background: 'rgba(255, 111, 97, 0.1)', color: 'var(--color-accent-salmon)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
              {clicks} click{clicks === 1 ? '' : 's'}
            </span>
          )}
        </h3>
        {project.description && (
          <p className="portfolio-card__description">{project.description}</p>
        )}
        {project.tags.length > 0 && (
          <ul className="portfolio-card__tags" aria-label="Tags">
            {project.tags.slice(0, 4).map((tag) => (
              <li key={tag} className="portfolio-card__tag">
                {tag}
              </li>
            ))}
          </ul>
        )}
        {(hasProjectLink || hasDemoLink) && (
          <div className="portfolio-card__links">
            {hasProjectLink && (
              <a
                href={project.project_url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-card__link"
                aria-label={`Open project ${project.title}`}
                onClick={handleClick}
              >
                <Globe size={16} weight="duotone" />
                Project
                <ArrowSquareOut size={12} weight="bold" />
              </a>
            )}
            {hasDemoLink && (
              <a
                href={project.demo_url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-card__link"
                aria-label={`Open demo for ${project.title}`}
                onClick={handleClick}
              >
                <Globe size={16} weight="duotone" />
                Demo
                <ArrowSquareOut size={12} weight="bold" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function LikedProjectCard({ project }: { project: any }) {
  return (
    <article className="portfolio-card community-card border-glow liked-portfolio-card">
      <Link to={`/community/showcase/${project.id}`} className="portfolio-card__media-link">
        <div className="portfolio-card__media" aria-hidden="true">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt=""
              loading="lazy"
              className="portfolio-card__image"
            />
          ) : (
            <div className="portfolio-card__placeholder">
              <ImageIcon size={32} weight="duotone" />
            </div>
          )}
        </div>
      </Link>
      <div className="portfolio-card__body">
        <h3 className="portfolio-card__title">
          <Link to={`/community/showcase/${project.id}`} style={{ textDecoration: 'none', color: '#fff' }}>
            {project.title}
          </Link>
        </h3>
        <span className="portfolio-card__author" style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginTop: '-4px', marginBottom: '4px' }}>
          by {project.creatorName}
        </span>
        {project.description && (
          <p className="portfolio-card__description">{project.description}</p>
        )}
        {project.tags && project.tags.length > 0 && (
          <ul className="portfolio-card__tags" aria-label="Tags">
            {project.tags.slice(0, 4).map((tag: string) => (
              <li key={tag} className="portfolio-card__tag">
                {tag}
              </li>
            ))}
          </ul>
        )}
        <div className="portfolio-card__links">
          <Link to={`/community/showcase/${project.id}`} className="portfolio-card__link">
            <Globe size={16} weight="duotone" />
            View Showcase
            <ArrowSquareOut size={12} weight="bold" />
          </Link>
        </div>
      </div>
    </article>
  );
}
