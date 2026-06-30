/* ═══ Showcase — owner-edit page at /community/portfolio ═══
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 5
 *
 * The "Show" step of the study-hall loop: a clean showcase of what a member
 * actually built. Two sections:
 *   1. Pinned — the proof-of-work that's live on the public profile (max 8).
 *   2. Drafts — projects the member is still finishing, kept private.
 *
 * Each entry is a gallery card: cover image, title, a short "what it is"
 * line, a "How I built it" process line, and tags. We surface the build
 * story over polish (2026 portfolio research) and flag AI use explicitly
 * when the member tags it.
 *
 * Interactions:
 *   - "Add project" CTA → opens PortfolioItemEditor in create mode.
 *   - Edit on each card → opens the editor in edit mode.
 *   - Up / Down buttons reorder within the pinned section (keyboard-friendly,
 *     no drag UA quirks, no dnd-kit dependency).
 *   - Pin / Unpin moves a card between the two sections.
 *
 * Lane 7 mounts the sidebar link and the route. This file owns the page.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  PushPin,
  PushPinSlash,
  Plus,
  ArrowUp,
  ArrowDown,
  PencilSimple,
  Image as ImageIcon,
  Wrench,
  Sparkle,
  X,
  Stack,
  CursorClick,
} from '@phosphor-icons/react';
import {
  listMyProjects,
  upsertProject,
  reorderProjects,
  PINNED_LIMIT,
  type MemberProject,
} from '../../data/memberProjects';
import PortfolioItemEditor from '../../components/community/PortfolioItemEditor';
import CertUpload from '../../components/profile/CertUpload';
import SubTabs from '../../components/community/SubTabs';
import ArchetypeQuiz from '../../components/community/ArchetypeQuiz';
import { getMyArchetype, ARCHETYPES, type SavedArchetype } from '../../data/archetypeStore';
import { useAuth } from '../../context/useAuth';
import './Portfolio.css';

const PORTFOLIO_TABS = [
  { to: '/community/portfolio', label: 'Projects' },
  { to: '/community/credentials', label: 'Credentials' },
  { to: '/community/showcase', label: 'Showcase' },
  { to: '/community/saved', label: 'Saved' },
];

/* Tags a member can apply to say "AI helped me build this". We only flag
 * what the member already tagged — we never guess on their behalf. */
const AI_TAG_PATTERN = /\b(ai|ai-assisted|ai-built|built-with-ai|llm|gpt|claude|gemini|copilot)\b/i;

function usedAI(project: MemberProject): boolean {
  return project.tags.some((tag) => AI_TAG_PATTERN.test(tag));
}

/* The tags shown as plain chips — drop the AI marker since it gets its own
 * explicit badge, so we don't show the same fact twice. */
function plainTags(project: MemberProject): string[] {
  return project.tags.filter((tag) => !AI_TAG_PATTERN.test(tag));
}

export default function Portfolio() {
  const { user, isBypass } = useAuth();
  const [projects, setProjects] = useState<MemberProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [editing, setEditing] = useState<MemberProject | null>(null);

  // AP-STUDYHALL-REBUILD-2026-06 · Lane 6 — professional archetype identity.
  const archetypeUserId = user?.id ?? (isBypass ? 'bypass-member' : null);
  const [archetype, setArchetype] = useState<SavedArchetype | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  // Load the member's saved professional archetype.
  useEffect(() => {
    let cancelled = false;
    if (!archetypeUserId) return;
    getMyArchetype(archetypeUserId).then((a) => {
      if (!cancelled) setArchetype(a);
    });
    return () => {
      cancelled = true;
    };
  }, [archetypeUserId]);

  // Initial load.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listMyProjects()
      .then((rows) => {
        if (!cancelled) setProjects(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load projects.',
          );
          setProjects([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pinned = useMemo(
    () =>
      projects
        .filter((p) => p.is_pinned)
        .sort((a, b) => a.position - b.position),
    [projects],
  );
  const drafts = useMemo(
    () =>
      projects
        .filter((p) => !p.is_pinned)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [projects],
  );
  const overPinLimit = pinned.length > PINNED_LIMIT;

  const totalClicks = useMemo(
    () => projects.reduce((sum, p) => sum + (p.clicks_count ?? 0), 0),
    [projects],
  );

  /* ── Add / edit ── */
  function openCreate() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(project: MemberProject) {
    setEditing(project);
    setEditorOpen(true);
  }

  function handleSaved(saved: MemberProject) {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx === -1) return [...prev, saved];
      const next = [...prev];
      next[idx] = saved;
      return next;
    });
  }

  function handleDeleted(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  /* ── Pin toggle ── */
  async function togglePinned(project: MemberProject) {
    const next = !project.is_pinned;
    // Optimistic flip
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, is_pinned: next } : p)),
    );
    try {
      await upsertProject({
        id: project.id,
        title: project.title,
        description: project.description ?? undefined,
        image_url: project.image_url ?? undefined,
        project_url: project.project_url ?? undefined,
        demo_url: project.demo_url ?? undefined,
        tags: project.tags,
        is_pinned: next,
        position: project.position,
      });
    } catch (err) {
      // Roll back
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, is_pinned: !next } : p,
        ),
      );
      setError(err instanceof Error ? err.message : 'Could not update pin.');
    }
  }

  /* ── Reorder via up / down ── */
  async function move(project: MemberProject, direction: -1 | 1) {
    const currentOrder = pinned.map((p) => p.id);
    const idx = currentOrder.indexOf(project.id);
    if (idx === -1) return;
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= currentOrder.length) return;

    const nextOrder = [...currentOrder];
    [nextOrder[idx], nextOrder[nextIdx]] = [nextOrder[nextIdx], nextOrder[idx]];

    // Optimistic reorder
    setProjects((prev) =>
      prev.map((p) => {
        if (!p.is_pinned) return p;
        const newPos = nextOrder.indexOf(p.id);
        return newPos === -1 ? p : { ...p, position: newPos };
      }),
    );

    try {
      await reorderProjects(nextOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reorder.');
      // Best-effort recovery: refetch
      try {
        const fresh = await listMyProjects();
        setProjects(fresh);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="portfolio-page">
      <SubTabs tabs={PORTFOLIO_TABS} />
      <div className="community-page-header">
        <h1>
          <Stack size={28} weight="duotone" /> Showcase
        </h1>
        <p>
          Show what you built. Pin 3 to 8 projects to your public profile so
          people can see your proof of work. Drafts stay private until you
          pin them.
        </p>
      </div>

      {/* ── Professional archetype identity banner ── */}
      {archetype ? (
        <div
          className="portfolio-page__identity"
          style={{
            ['--id-accent' as string]:
              ARCHETYPES[archetype.archetype_key as keyof typeof ARCHETYPES]
                ?.accentVar ?? 'var(--cm-accent)',
          }}
        >
          <div className="portfolio-page__identity-main">
            <span className="portfolio-page__identity-eyebrow">
              Professional archetype
            </span>
            <strong className="portfolio-page__identity-name">
              {ARCHETYPES[archetype.archetype_key as keyof typeof ARCHETYPES]
                ?.label ?? archetype.archetype_key}
            </strong>
            <span className="portfolio-page__identity-tagline">
              {ARCHETYPES[archetype.archetype_key as keyof typeof ARCHETYPES]
                ?.tagline}
            </span>
          </div>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setQuizOpen(true)}
          >
            Retake
          </button>
        </div>
      ) : (
        <button
          className="portfolio-page__identity portfolio-page__identity--prompt"
          onClick={() => setQuizOpen(true)}
        >
          <Sparkle size={20} weight="duotone" />
          <div className="portfolio-page__identity-main">
            <strong className="portfolio-page__identity-name">
              Discover your professional archetype
            </strong>
            <span className="portfolio-page__identity-tagline">
              Six quick questions. Find out what kind of professional you are.
            </span>
          </div>
          <span className="portfolio-page__identity-cta">Take the quiz</span>
        </button>
      )}

      {/* ── Real portfolio stats ── */}
      <div className="portfolio-page__stats">
        <div className="portfolio-page__stat">
          <span className="portfolio-page__stat-label">Total projects</span>
          <span className="portfolio-page__stat-value">{projects.length}</span>
        </div>
        <div className="portfolio-page__stat">
          <span className="portfolio-page__stat-label">Pinned</span>
          <span className="portfolio-page__stat-value">{pinned.length}</span>
        </div>
        <div className="portfolio-page__stat">
          <span className="portfolio-page__stat-label">
            Total showcase clicks
          </span>
          <span className="portfolio-page__stat-value portfolio-page__stat-value--accent">
            {totalClicks}
          </span>
        </div>
      </div>

      <div className="portfolio-page__actions">
        <button
          type="button"
          className="portfolio-page__add"
          onClick={openCreate}
        >
          <Plus size={18} weight="bold" /> Add project
        </button>
        <button
          type="button"
          className="portfolio-page__add portfolio-page__add--secondary"
          onClick={() => setCertOpen(true)}
        >
          <Sparkle size={18} weight="bold" /> Verify credential
        </button>
      </div>

      {error && (
        <div className="portfolio-page__error" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="community-card portfolio-page__loading">
          Loading your projects…
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="community-card portfolio-page__empty">
          <Stack size={40} weight="duotone" />
          <h3>Nothing to show yet</h3>
          <p>
            Tap "Add project" to start your showcase. Each pinned project
            shows up on your public profile, so people can see what you built
            and how.
          </p>
        </div>
      )}

      {!loading && pinned.length > 0 && (
        <section className="portfolio-page__section">
          <header className="portfolio-page__section-head">
            <h2>
              <PushPin size={18} weight="fill" /> Pinned
              <span className="portfolio-page__count">
                {pinned.length}/{PINNED_LIMIT}
              </span>
            </h2>
            {overPinLimit && (
              <p className="portfolio-page__warn">
                Your public profile shows the first {PINNED_LIMIT}. Unpin some
                to choose which.
              </p>
            )}
          </header>
          <ul className="portfolio-page__gallery">
            {pinned.map((p, index) => (
              <li key={p.id}>
                <ProjectCard
                  project={p}
                  onEdit={() => openEdit(p)}
                  onTogglePin={() => togglePinned(p)}
                  onMoveUp={index > 0 ? () => move(p, -1) : undefined}
                  onMoveDown={
                    index < pinned.length - 1 ? () => move(p, 1) : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && drafts.length > 0 && (
        <section className="portfolio-page__section">
          <header className="portfolio-page__section-head">
            <h2>
              <PushPinSlash size={18} weight="duotone" /> Drafts
              <span className="portfolio-page__count">{drafts.length}</span>
            </h2>
            <p className="portfolio-page__section-hint">
              Not visible on your public profile. Pin one to publish it.
            </p>
          </header>
          <ul className="portfolio-page__gallery">
            {drafts.map((p) => (
              <li key={p.id}>
                <ProjectCard
                  project={p}
                  onEdit={() => openEdit(p)}
                  onTogglePin={() => togglePinned(p)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {editorOpen && (
        <PortfolioItemEditor
          project={editing}
          onClose={() => setEditorOpen(false)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}

      {certOpen && (
        // CertUpload is owned elsewhere. We keep the credential-verify flow
        // but no longer couple it to any brand-specific reward — closing is
        // the only thing this page does on success.
        <CertUpload
          onClose={() => setCertOpen(false)}
          onSuccess={() => setCertOpen(false)}
        />
      )}

      {quizOpen && (
        <div
          className="portfolio-quiz-overlay"
          onClick={() => setQuizOpen(false)}
        >
          <div
            className="portfolio-quiz-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="portfolio-quiz-close"
              onClick={() => setQuizOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <ArchetypeQuiz
              userId={archetypeUserId}
              onComplete={() => {
                if (archetypeUserId)
                  getMyArchetype(archetypeUserId).then(setArchetype);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Gallery card ───────────────────────── */

interface ProjectCardProps {
  project: MemberProject;
  onEdit: () => void;
  onTogglePin: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function ProjectCard({
  project,
  onEdit,
  onTogglePin,
  onMoveUp,
  onMoveDown,
}: ProjectCardProps) {
  const tags = plainTags(project);
  const builtWithAI = usedAI(project);

  return (
    <article className="portfolio-card community-card">
      <div className="portfolio-card__cover" aria-hidden="true">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt=""
            loading="lazy"
            className="portfolio-card__image"
          />
        ) : (
          <ImageIcon size={28} weight="duotone" />
        )}
      </div>

      <div className="portfolio-card__body">
        <div className="portfolio-card__heading">
          <h3 className="portfolio-card__title">{project.title}</h3>
          {builtWithAI && (
            <span className="portfolio-card__ai" title="The member used AI to build this">
              <Sparkle size={12} weight="fill" /> Built with AI
            </span>
          )}
        </div>

        {project.description && (
          <p className="portfolio-card__process">
            <Wrench
              size={14}
              weight="duotone"
              className="portfolio-card__process-icon"
            />
            <span>
              <span className="portfolio-card__process-label">
                How I built it:
              </span>{' '}
              {project.description}
            </span>
          </p>
        )}

        {tags.length > 0 && (
          <ul className="portfolio-card__tags" aria-label="Tags">
            {tags.slice(0, 4).map((tag) => (
              <li key={tag} className="portfolio-card__tag">
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="portfolio-card__footer">
          {(project.clicks_count ?? 0) > 0 && (
            <span className="portfolio-card__clicks">
              <CursorClick size={14} weight="duotone" />
              {project.clicks_count} {project.clicks_count === 1 ? 'click' : 'clicks'}
            </span>
          )}

          <div className="portfolio-card__actions">
            {(onMoveUp || onMoveDown) && (
              <div className="portfolio-card__reorder">
                <button
                  type="button"
                  className="portfolio-card__icon-btn"
                  onClick={onMoveUp}
                  disabled={!onMoveUp}
                  aria-label="Move up"
                  title="Move up"
                >
                  <ArrowUp size={16} weight="bold" />
                </button>
                <button
                  type="button"
                  className="portfolio-card__icon-btn"
                  onClick={onMoveDown}
                  disabled={!onMoveDown}
                  aria-label="Move down"
                  title="Move down"
                >
                  <ArrowDown size={16} weight="bold" />
                </button>
              </div>
            )}
            <button
              type="button"
              className={`portfolio-card__icon-btn ${
                project.is_pinned ? 'portfolio-card__icon-btn--active' : ''
              }`}
              onClick={onTogglePin}
              aria-pressed={project.is_pinned}
              aria-label={project.is_pinned ? 'Unpin' : 'Pin to profile'}
              title={project.is_pinned ? 'Unpin' : 'Pin to profile'}
            >
              <PushPin
                size={16}
                weight={project.is_pinned ? 'fill' : 'regular'}
              />
            </button>
            <button
              type="button"
              className="portfolio-card__icon-btn"
              onClick={onEdit}
              aria-label="Edit project"
              title="Edit"
            >
              <PencilSimple size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
