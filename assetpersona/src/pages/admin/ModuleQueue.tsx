/* ═══ ADMIN — Module Drafts Queue ═══
 * AI-drafted modules from the news pipeline. One-click approve→publish or reject.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ExternalLink, Sparkles, Newspaper } from 'lucide-react';
import { listDrafts, setDraftStatus, upsertModule, setStatus } from '../../data/learnStore';
import type { ModuleDraftQueueRow, LearnModule } from '../../types/learn';
import './ModuleQueue.css';

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ModuleQueueAdminPage() {
  const [rows, setRows] = useState<ModuleDraftQueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listDrafts().then((data) => {
      if (cancelled) return;
      setRows(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  async function approve(row: ModuleDraftQueueRow) {
    setBusyId(row.id);
    try {
      const slug = slugify(row.draft.title);
      const m: LearnModule = {
        id: crypto.randomUUID(),
        slug,
        type: row.suggested_type ?? 'news_drop',
        status: 'published',
        hook: row.draft.hook,
        title: row.draft.title,
        objective: row.draft.objective,
        context_md: row.draft.context_md,
        practice_md: row.draft.practice_md ?? null,
        practice_starter: row.draft.practice_starter ?? null,
        reflect_question: row.draft.reflect_question ?? null,
        required_role: row.suggested_role ?? 'curious',
        tags: row.suggested_tags ?? [],
        cover_image: null,
        estimated_minutes: 5,
        xp_reward: 15,
        pathway_id: null,
        pathway_order: null,
        source_url: row.source_url,
        source_published_at: row.source_published_at,
        generated_by_ai: true,
        author_id: null,
        pinned_as_today_drill_at: null,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resources: (row.draft.resources ?? []).map((r, i) => ({
          id: crypto.randomUUID(),
          module_id: '',
          kind: r.kind,
          label: r.label,
          url: r.url,
          description: r.description ?? null,
          position: i,
        })),
      };

      const saved = await upsertModule(m, m.resources);
      await setStatus(saved.id, 'published');
      await setDraftStatus(row.id, 'approved', undefined, saved.id);
      setRows((prev) =>
        prev.map((x) =>
          x.id === row.id
            ? { ...x, status: 'approved', published_module_id: saved.id, reviewed_at: new Date().toISOString() }
            : x
        )
      );
    } finally {
      setBusyId(null);
    }
  }

  async function reject(row: ModuleDraftQueueRow) {
    const reason = prompt('Reject reason (used to tune the prompt later):') ?? '';
    setBusyId(row.id);
    try {
      await setDraftStatus(row.id, 'rejected', reason);
      setRows((prev) =>
        prev.map((x) =>
          x.id === row.id ? { ...x, status: 'rejected', reject_reason: reason, reviewed_at: new Date().toISOString() } : x
        )
      );
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    for (const r of rows) c[r.status]++;
    return c;
  }, [rows]);

  return (
    <div className="queue-admin">
      <header className="queue-admin__head">
        <div>
          <h1>Module Queue</h1>
          <p className="queue-admin__sub">
            {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
          </p>
        </div>
        <div className="queue-admin__actions">
          <Link to="/admin/modules" className="btn btn--ghost btn--sm">
            All Modules
          </Link>
          <Link to="/admin/modules/new?from=ai" className="btn btn--primary btn--sm">
            <Sparkles size={14} /> Generate manually
          </Link>
        </div>
      </header>

      <div className="queue-admin__filter-row">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            className={filter === s ? 'is-active' : ''}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="queue-admin__loading">Loading queue...</p>
      ) : filtered.length === 0 ? (
        <div className="queue-admin__empty">
          <Newspaper size={28} />
          <p>No drafts in this state.</p>
          <p className="queue-admin__empty-sub">
            The Wave 5 n8n workflow drops fresh AI drafts here whenever it sees AI-related news.
            Until that's deployed, use "Generate manually" to seed a draft.
          </p>
        </div>
      ) : (
        <ul className="queue-admin__list">
          {filtered.map((row) => (
            <li key={row.id} className={`queue-card queue-card--${row.status}`}>
              <header className="queue-card__head">
                <span className="queue-card__source">
                  {row.source_label ?? 'Manual'}
                  {row.source_url && (
                    <a href={row.source_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={11} />
                    </a>
                  )}
                </span>
                <span className={`queue-card__status queue-card__status--${row.status}`}>
                  {row.status}
                </span>
              </header>
              <h3>{row.draft.title}</h3>
              <p className="queue-card__hook">{row.draft.hook}</p>
              <p className="queue-card__objective">{row.draft.objective}</p>
              <div className="queue-card__meta">
                <span>{row.suggested_type}</span>
                <span>· {row.suggested_role}</span>
                {row.suggested_tags?.slice(0, 3).map((t) => (
                  <span key={t} className="queue-card__tag">{t}</span>
                ))}
              </div>
              {row.status === 'pending' ? (
                <div className="queue-card__actions">
                  <button
                    className="btn btn--ghost btn--sm queue-card__reject"
                    onClick={() => reject(row)}
                    disabled={busyId === row.id}
                  >
                    <X size={14} /> Reject
                  </button>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => approve(row)}
                    disabled={busyId === row.id}
                  >
                    <Check size={14} /> {busyId === row.id ? 'Publishing...' : 'Approve & publish'}
                  </button>
                </div>
              ) : row.status === 'approved' && row.published_module_id ? (
                <p className="queue-card__published">
                  Published →{' '}
                  <Link to={`/admin/modules`}>see in modules</Link>
                </p>
              ) : row.status === 'rejected' && row.reject_reason ? (
                <p className="queue-card__rejected">Rejected: {row.reject_reason}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
