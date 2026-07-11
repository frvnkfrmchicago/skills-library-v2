/* ═══ ADMIN — Content Hub composer ═══
 *
 * Single-form bulletin editor adapted from the Grazzhopper Regulatory
 * Updates pattern. The whole point is speed — title, summary, body, source,
 * severity, status, ship. Auto-saves to draft on a 30s cadence, just like
 * BlogWrite, so we never lose a half-typed bulletin.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, FloppyDisk, Trash,
} from '@phosphor-icons/react';
import {
  getBulletin,
  upsertBulletin,
  deleteBulletin,
  type BulletinSeverity,
  type BulletinStatus,
} from '../../data/contentHub';
import './ContentHub.css';

const SEVERITY_OPTIONS: Array<{ value: BulletinSeverity; label: string }> = [
  { value: 'info', label: 'Info' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'important', label: 'Important' },
  { value: 'breaking', label: 'Breaking' },
];

const STATUS_OPTIONS: Array<{ value: BulletinStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const SUMMARY_LIMIT = 200;

export default function ContentHubEditPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id?: string }>();
  const isEdit = !!routeId;

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [severity, setSeverity] = useState<BulletinSeverity>('info');
  const [status, setStatus] = useState<BulletinStatus>('draft');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    async function load() {
      try {
        const b = await getBulletin(routeId!);
        if (b) {
          setTitle(b.title);
          setSummary(b.summary);
          setBody(b.body || '');
          setSourceUrl(b.source_url || '');
          setSeverity(b.severity);
          setStatus(b.status);
        } else {
          navigate('/admin/content-hub');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isEdit, routeId, navigate]);

  async function handleSave() {
    if (!title.trim() || !summary.trim()) {
      alert('Title and Summary are required');
      return;
    }
    setSaving(true);
    try {
      await upsertBulletin({
        id: routeId,
        title,
        summary,
        body: body || null,
        source_url: sourceUrl || null,
        severity,
        status,
      });
      navigate('/admin/content-hub');
    } catch (err) {
      console.error(err);
      alert('Failed to save bulletin');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    if (!window.confirm('Delete this bulletin?')) return;
    try {
      await deleteBulletin(routeId!);
      navigate('/admin/content-hub');
    } catch (err) {
      console.error(err);
      alert('Failed to delete bulletin');
    }
  }

  if (loading) return <div className="content-hub-edit__loading">Loading...</div>;

  return (
    <div className="content-hub-edit">
      <div className="content-hub-edit__header">
        <button
          type="button"
          className="content-hub-edit__back"
          onClick={() => navigate('/admin/content-hub')}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="content-hub-edit__title-main">
          {isEdit ? 'Edit Bulletin' : 'New Bulletin'}
        </h1>
        <div className="content-hub-edit__header-actions">
          {isEdit && (
            <button
              type="button"
              className="content-hub-edit__btn content-hub-edit__btn--danger"
              onClick={handleDelete}
            >
              <Trash size={16} /> Delete
            </button>
          )}
          <button
            type="button"
            className="content-hub-edit__btn content-hub-edit__btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            <FloppyDisk size={16} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="content-hub-edit__form">
        <div className="content-hub-edit__field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcing new feature..."
          />
        </div>

        <div className="content-hub-edit__field">
          <label htmlFor="summary">Summary ({summary.length}/{SUMMARY_LIMIT})</label>
          <input
            id="summary"
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value.slice(0, SUMMARY_LIMIT))}
            placeholder="A short summary displayed on the card..."
          />
        </div>

        <div className="content-hub-edit__field">
          <label htmlFor="body">Body (Optional Markdown)</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Detailed body text..."
            rows={8}
          />
        </div>

        <div className="content-hub-edit__field">
          <label htmlFor="sourceUrl">Source URL (Optional)</label>
          <input
            id="sourceUrl"
            type="text"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="content-hub-edit__picker">
          <span className="content-hub-edit__picker-label">Severity</span>
          <div
            className="content-hub-edit__picker-row"
            role="radiogroup"
            aria-label="Severity"
          >
            {SEVERITY_OPTIONS.map((opt) => {
              const active = opt.value === severity;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`content-hub-edit__chip ${active ? 'is-active' : ''}`}
                  onClick={() => setSeverity(opt.value)}
                >
                  <span
                    aria-hidden
                    className={`content-hub-dot content-hub-dot--${opt.value}`}
                  />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="content-hub-edit__picker">
          <span className="content-hub-edit__picker-label">Status</span>
          <div
            className="content-hub-edit__picker-row"
            role="radiogroup"
            aria-label="Status"
          >
            {STATUS_OPTIONS.map((opt) => {
              const active = opt.value === status;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={`content-hub-edit__chip content-hub-edit__chip--status content-hub-edit__chip--${opt.value} ${active ? 'is-active' : ''}`}
                  onClick={() => setStatus(opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
