/* ═══ ADMIN — Content Hub list ═══
 *
 * Mirrors the Grazzhopper Regulatory Updates Admin pattern (single feed of
 * curated short posts with state-dot rows). Severity tier and status pill
 * are surfaced on every row so the editor can scan the queue at a glance.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Trash, Rocket, MagnifyingGlass,
} from '@phosphor-icons/react';
import {
  listBulletins,
  deleteBulletin,
  publishBulletin,
  type BulletinSeverity,
  type ContentHubBulletin,
} from '../../data/contentHub';
import './ContentHub.css';

const SEVERITY_FILTERS: Array<{ value: BulletinSeverity | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'info', label: 'Info' },
  { value: 'advisory', label: 'Advisory' },
  { value: 'important', label: 'Important' },
  { value: 'breaking', label: 'Breaking' },
];

const STATUS_LABEL: Record<ContentHubBulletin['status'], string> = {
  draft: 'draft',
  published: 'published',
  archived: 'archived',
};

function formatStamp(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ContentHubPage() {
  const [bulletins, setBulletins] = useState<ContentHubBulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<BulletinSeverity | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await listBulletins();
        setBulletins(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return bulletins.filter((b) => {
      const matchSeverity = severityFilter === 'all' || b.severity === severityFilter;
      const matchSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.summary && b.summary.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSeverity && matchSearch;
    });
  }, [bulletins, severityFilter, searchTerm]);

  async function handleDelete(b: ContentHubBulletin) {
    if (!window.confirm(`Delete "${b.title}"?`)) return;
    try {
      await deleteBulletin(b.id);
      setBulletins((prev) => prev.filter((x) => x.id !== b.id));
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePublish(b: ContentHubBulletin) {
    try {
      const res = await publishBulletin(b.id);
      if (res) {
        setBulletins((prev) => prev.map((x) => (x.id === b.id ? res : x)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="content-hub-admin">
      <div className="content-hub-admin__header">
        <div>
          <h1 className="content-hub-admin__title-main">Content Hub</h1>
          <p className="content-hub-admin__subtitle">Manage short bulletins and announcements</p>
        </div>
        <Link to="/admin/content-hub/new" className="content-hub-admin__btn">
          <Plus size={16} /> New Bulletin
        </Link>
      </div>

      <div className="content-hub-admin__filters">
        <div className="content-hub-admin__search">
          <MagnifyingGlass size={16} />
          <input
            type="text"
            placeholder="Search bulletins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="content-hub-admin__chips">
          {SEVERITY_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`content-hub-admin__chip ${severityFilter === f.value ? 'is-active' : ''}`}
              onClick={() => setSeverityFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="content-hub-admin__loading">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="content-hub-admin__empty">No bulletins found.</div>
      ) : (
        <ul className="content-hub-admin__list">
          {filtered.map((b) => (
            <li key={b.id} className="content-hub-admin__row">
              <div className="content-hub-admin__row-main">
                <div className="content-hub-admin__meta">
                  <span
                    className={`content-hub-dot content-hub-dot--${b.severity}`}
                  />
                  <span className="content-hub-admin__severity">{b.severity}</span>
                  <span
                    className={`content-hub-admin__status content-hub-admin__status--${b.status}`}
                  >
                    {STATUS_LABEL[b.status]}
                  </span>
                  <span className="content-hub-admin__stamp">
                    Updated {formatStamp(b.updated_at)}
                  </span>
                </div>
                <Link
                  to={`/admin/content-hub/edit/${b.id}`}
                  className="content-hub-admin__title"
                >
                  {b.title}
                </Link>
                <p className="content-hub-admin__summary">{b.summary}</p>
              </div>
              <div className="content-hub-admin__row-actions">
                {b.status !== 'published' && (
                  <button
                    type="button"
                    className="content-hub-admin__act"
                    onClick={() => handlePublish(b)}
                    title="Publish"
                    aria-label="Publish bulletin"
                  >
                    <Rocket size={14} />
                  </button>
                )}
                <button
                  type="button"
                  className="content-hub-admin__act content-hub-admin__act--danger"
                  onClick={() => handleDelete(b)}
                  title="Delete"
                  aria-label="Delete bulletin"
                >
                  <Trash size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
