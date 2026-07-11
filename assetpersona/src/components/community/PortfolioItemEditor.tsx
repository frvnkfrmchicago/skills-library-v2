/* ═══ PortfolioItemEditor — modal-style add / edit form ═══
 *
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 4
 *
 * Reused by Portfolio.tsx for both "Add project" and "Edit project".
 * Pass `project` to edit an existing row; omit it to create a new one.
 *
 * The modal is uncontrolled w/r/t open state — the parent decides when
 * to mount it and removes it on close. This keeps the editor unbiased
 * about how the parent surfaces the trigger (FAB, inline button, etc).
 *
 * Validation:
 *   - Title required, 1-80 chars.
 *   - Description ≤ 400 chars (live counter).
 *   - Project / demo URLs must look like URLs when present.
 */

import { useCallback, useEffect, useState } from 'react';
import { X, PushPin, FloppyDisk, Trash } from '@phosphor-icons/react';
import {
  upsertProject,
  deleteProject,
  type MemberProject,
  type MemberProjectInput,
} from '../../data/memberProjects';
import './PortfolioItemEditor.css';

export interface PortfolioItemEditorProps {
  /** Pass an existing row to edit it in place; omit to create a new one. */
  project?: MemberProject | null;
  onClose: () => void;
  onSaved: (saved: MemberProject) => void;
  /** Only surfaced when editing an existing row. */
  onDeleted?: (id: string) => void;
}

const DESCRIPTION_MAX = 400;
const TITLE_MAX = 80;

function looksLikeUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return true; // empty = OK
  try {
    const u = new URL(v.startsWith('http') ? v : `https://${v}`);
    return !!u.hostname && u.hostname.includes('.');
  } catch {
    return false;
  }
}

export default function PortfolioItemEditor({
  project,
  onClose,
  onSaved,
  onDeleted,
}: PortfolioItemEditorProps) {
  const isEditing = !!project;
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [imageUrl, setImageUrl] = useState(project?.image_url ?? '');
  const [projectUrl, setProjectUrl] = useState(project?.project_url ?? '');
  const [demoUrl, setDemoUrl] = useState(project?.demo_url ?? '');
  const [tagsInput, setTagsInput] = useState((project?.tags ?? []).join(', '));
  const [isPinned, setIsPinned] = useState(project?.is_pinned ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Escape closes the modal so it behaves like the rest of the app.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const handleSave = useCallback(async () => {
    setError('');
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }
    if (trimmedTitle.length > TITLE_MAX) {
      setError(`Title is too long (max ${TITLE_MAX}).`);
      return;
    }
    if (description.length > DESCRIPTION_MAX) {
      setError(`Description is too long (max ${DESCRIPTION_MAX}).`);
      return;
    }
    if (!looksLikeUrl(projectUrl)) {
      setError('Project URL looks malformed.');
      return;
    }
    if (!looksLikeUrl(demoUrl)) {
      setError('Demo URL looks malformed.');
      return;
    }
    if (!looksLikeUrl(imageUrl)) {
      setError('Image URL looks malformed.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);

    const payload: MemberProjectInput = {
      id: project?.id,
      title: trimmedTitle,
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      project_url: projectUrl.trim() || null,
      demo_url: demoUrl.trim() || null,
      tags,
      is_pinned: isPinned,
      position: project?.position ?? 0,
    };

    setBusy(true);
    try {
      const saved = await upsertProject(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save project.');
    } finally {
      setBusy(false);
    }
  }, [
    title,
    description,
    imageUrl,
    projectUrl,
    demoUrl,
    tagsInput,
    isPinned,
    project?.id,
    project?.position,
    onSaved,
    onClose,
  ]);

  const handleDelete = useCallback(async () => {
    if (!project) return;
    const ok = window.confirm(
      `Delete "${project.title}"? This can't be undone.`,
    );
    if (!ok) return;
    setBusy(true);
    setError('');
    try {
      await deleteProject(project.id);
      onDeleted?.(project.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.');
      setBusy(false);
    }
  }, [project, onDeleted, onClose]);

  const remaining = DESCRIPTION_MAX - description.length;

  return (
    <div
      className="pie"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pie-title"
    >
      <div
        className="pie__backdrop"
        onClick={() => !busy && onClose()}
        aria-hidden="true"
      />
      <div className="pie__card">
        <header className="pie__header">
          <h2 id="pie-title" className="pie__title">
            {isEditing ? 'Edit project' : 'Add project'}
          </h2>
          <button
            type="button"
            className="pie__close"
            onClick={() => !busy && onClose()}
            disabled={busy}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="pie__body">
          <label className="pie__field">
            <span className="pie__label">Title</span>
            <input
              type="text"
              className="pie__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
              placeholder="What did you build?"
              disabled={busy}
              required
            />
          </label>

          <label className="pie__field">
            <span className="pie__label">
              Description
              <span
                className={`pie__counter ${
                  remaining < 0 ? 'pie__counter--over' : ''
                }`}
              >
                {remaining}
              </span>
            </span>
            <textarea
              className="pie__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does it do? Who's it for?"
              disabled={busy}
            />
          </label>

          <label className="pie__field">
            <span className="pie__label">Cover image URL</span>
            <input
              type="url"
              className="pie__input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              disabled={busy}
            />
          </label>

          <div className="pie__grid">
            <label className="pie__field">
              <span className="pie__label">Project URL</span>
              <input
                type="url"
                className="pie__input"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://github.com/…"
                disabled={busy}
              />
            </label>
            <label className="pie__field">
              <span className="pie__label">Live demo URL</span>
              <input
                type="url"
                className="pie__input"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://…"
                disabled={busy}
              />
            </label>
          </div>

          <label className="pie__field">
            <span className="pie__label">
              Tags <span className="pie__hint">(comma-separated, max 8)</span>
            </span>
            <input
              type="text"
              className="pie__input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="react, design-system, supabase"
              disabled={busy}
            />
          </label>

          <label className="pie__toggle">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              disabled={busy}
            />
            <span className="pie__toggle-icon">
              <PushPin
                size={16}
                weight={isPinned ? 'fill' : 'regular'}
                aria-hidden="true"
              />
            </span>
            <span className="pie__toggle-text">
              <span className="pie__toggle-label">
                Pin to public profile
              </span>
              <span className="pie__toggle-hint">
                Unpinned projects stay as private drafts.
              </span>
            </span>
          </label>

          {error && (
            <p className="pie__error" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="pie__footer">
          {isEditing && onDeleted && (
            <button
              type="button"
              className="pie__btn pie__btn--danger"
              onClick={handleDelete}
              disabled={busy}
            >
              <Trash size={16} /> Delete
            </button>
          )}
          <div className="pie__footer-right">
            <button
              type="button"
              className="pie__btn pie__btn--ghost"
              onClick={() => !busy && onClose()}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="button"
              className="pie__btn pie__btn--primary"
              onClick={handleSave}
              disabled={busy}
            >
              <FloppyDisk size={16} weight="duotone" />
              {busy ? 'Saving…' : isEditing ? 'Save changes' : 'Add project'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
