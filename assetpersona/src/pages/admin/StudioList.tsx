/* ══════════════════════════════════════════
   STUDIO LIST
   Admin page listing all saved studio pages.
   ══════════════════════════════════════════ */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit3, Trash2, Eye, Clock } from 'lucide-react';
import { listPages, deletePage } from '../../studio/data/studioStorage';
import type { StudioPageMeta } from '../../studio/data/types';
import './StudioList.css';

export default function StudioList() {
  const [pages, setPages] = useState<StudioPageMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const result = await listPages();
        setPages(result);
      } catch (err) {
        console.error('[StudioList] Error loading pages:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deletePage(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('[StudioList] Error deleting page:', err);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className="studio-list">
      <header className="studio-list__header">
        <div>
          <h1 className="studio-list__title">Persona Studio</h1>
          <p className="studio-list__subtitle">Build and edit pages visually</p>
        </div>
        <button
          className="studio-list__create-btn"
          onClick={() => navigate('/admin/studio/new')}
        >
          <Plus size={18} />
          New Page
        </button>
      </header>

      {loading ? (
        <div className="studio-list__loading">
          <div className="studio-list__spinner" />
          <p>Loading pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="studio-list__empty">
          <div className="studio-list__empty-icon">📄</div>
          <h2>No pages yet</h2>
          <p>Create your first page to get started with the visual editor.</p>
          <button
            className="studio-list__create-btn"
            onClick={() => navigate('/admin/studio/new')}
          >
            <Plus size={18} />
            Create First Page
          </button>
        </div>
      ) : (
        <div className="studio-list__grid">
          {pages.map((page) => (
            <div key={page.id} className="studio-list__card">
              <div className="studio-list__card-preview">
                <span className={`studio-list__status studio-list__status--${page.status}`}>
                  {page.status}
                </span>
              </div>
              <div className="studio-list__card-body">
                <h3 className="studio-list__card-title">{page.title}</h3>
                <p className="studio-list__card-meta">
                  <Clock size={12} />
                  {formatDate(page.updated_at)}
                </p>
              </div>
              <div className="studio-list__card-actions">
                <Link
                  to={`/admin/studio/${page.id}`}
                  className="studio-list__action-btn"
                  title="Edit"
                >
                  <Edit3 size={16} />
                </Link>
                {page.status === 'published' && (
                  <Link
                    to={`/p/${page.slug}`}
                    className="studio-list__action-btn"
                    title="View live"
                    target="_blank"
                  >
                    <Eye size={16} />
                  </Link>
                )}
                <button
                  className="studio-list__action-btn studio-list__action-btn--danger"
                  onClick={() => handleDelete(page.id, page.title)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
