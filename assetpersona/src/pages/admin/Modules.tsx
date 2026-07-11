/* ═══ ADMIN — Modules list ═══ */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Sparkles, Pin, Trash2, BookOpen, Newspaper, GraduationCap, Rocket, Lightbulb,
} from 'lucide-react';
import {
  listAllModulesForAdmin,
  pinTodayDrillById,
  deleteModule,
  setStatus,
} from '../../data/learnStore';
import type { LearnModule, ModuleType } from '../../types/learn';
import './Modules.css';

const TYPE_ICON: Record<ModuleType, typeof BookOpen> = {
  daily_drill: Lightbulb,
  news_drop: Newspaper,
  concept: BookOpen,
  role_pathway: GraduationCap,
  project: Rocket,
  quiz: Lightbulb,
  match_game: GraduationCap,
};

const TYPE_LABEL: Record<ModuleType, string> = {
  daily_drill: 'Daily Drill',
  news_drop: 'News Drop',
  concept: 'Concept',
  role_pathway: 'Role Pathway',
  project: 'Project',
  quiz: 'Practice Quiz',
  match_game: 'Terminology Match Game',
};

export default function ModulesAdminPage() {
  const [items, setItems] = useState<LearnModule[]>([]);
  const [filter, setFilter] = useState<'all' | ModuleType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listAllModulesForAdmin().then((rows) => {
      if (cancelled) return;
      setItems(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((m) => m.type === filter);
  }, [items, filter]);

  const today = new Date().toISOString().slice(0, 10);

  async function togglePin(m: LearnModule) {
    const isPinned = m.pinned_as_today_drill_at === today;
    await pinTodayDrillById(isPinned ? null : m.id);
    setItems((prev) =>
      prev.map((x) =>
        x.id === m.id
          ? { ...x, pinned_as_today_drill_at: isPinned ? null : today }
          : { ...x, pinned_as_today_drill_at: x.pinned_as_today_drill_at === today ? null : x.pinned_as_today_drill_at }
      )
    );
  }

  async function publish(m: LearnModule) {
    await setStatus(m.id, 'published');
    setItems((prev) =>
      prev.map((x) =>
        x.id === m.id ? { ...x, status: 'published', published_at: new Date().toISOString() } : x
      )
    );
  }

  async function remove(m: LearnModule) {
    if (!confirm(`Delete "${m.title}"? This cannot be undone.`)) return;
    await deleteModule(m.id);
    setItems((prev) => prev.filter((x) => x.id !== m.id));
  }

  return (
    <div className="modules-admin">
      <header className="modules-admin__head">
        <div>
          <h1>Modules</h1>
          <p className="modules-admin__sub">{items.length} total</p>
        </div>
        <div className="modules-admin__actions">
          <Link to="/admin/modules/new" className="btn btn--ghost btn--sm">
            <Plus size={14} /> Blank Module
          </Link>
          <Link to="/admin/modules/new?from=ai" className="btn btn--primary btn--sm">
            <Sparkles size={14} /> Generate with AI
          </Link>
          <Link to="/admin/modules/queue" className="btn btn--ghost btn--sm">
            Queue
          </Link>
        </div>
      </header>

      <div className="modules-admin__filter-row">
        <button
          className={filter === 'all' ? 'is-active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {(Object.keys(TYPE_LABEL) as ModuleType[]).map((t) => (
          <button
            key={t}
            className={filter === t ? 'is-active' : ''}
            onClick={() => setFilter(t)}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="modules-admin__loading">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="modules-admin__empty">
          <p>No modules yet.</p>
          <Link to="/admin/modules/new" className="btn btn--primary btn--sm">
            <Plus size={14} /> Make the first one
          </Link>
        </div>
      ) : (
        <ul className="modules-admin__list">
          {filtered.map((m) => {
            const Icon = TYPE_ICON[m.type];
            const isPinned = m.pinned_as_today_drill_at === today;
            return (
              <li key={m.id} className="modules-admin__row">
                <div className="modules-admin__row-icon">
                  <Icon size={18} />
                </div>
                <div className="modules-admin__row-body">
                  <div className="modules-admin__row-meta">
                    <span className="modules-admin__type">{TYPE_LABEL[m.type]}</span>
                    <span className={`modules-admin__status modules-admin__status--${m.status}`}>
                      {m.status}
                    </span>
                    <span className="modules-admin__role">{m.required_role}</span>
                    <span className="modules-admin__min">{m.estimated_minutes} min</span>
                    {isPinned && <span className="modules-admin__pin"><Pin size={11} /> Today</span>}
                    {m.generated_by_ai && <span className="modules-admin__ai"><Sparkles size={11} /> AI</span>}
                  </div>
                  <Link to={`/admin/modules/edit/${m.slug}`} className="modules-admin__title">
                    {m.title}
                  </Link>
                  <p className="modules-admin__hook">{m.hook}</p>
                </div>
                <div className="modules-admin__row-actions">
                  <button
                    type="button"
                    className="modules-admin__act"
                    onClick={() => togglePin(m)}
                    title={isPinned ? 'Unpin from today' : 'Pin as Today\'s Drill'}
                  >
                    <Pin size={14} />
                  </button>
                  {m.status !== 'published' && (
                    <button
                      type="button"
                      className="modules-admin__act"
                      onClick={() => publish(m)}
                      title="Publish"
                    >
                      <Rocket size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="modules-admin__act modules-admin__act--danger"
                    onClick={() => remove(m)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
