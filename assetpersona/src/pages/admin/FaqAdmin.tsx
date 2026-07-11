/* ═══ /admin/faq — Frank-only FAQ authoring ═══
 * List + inline edit. Same data shape as the public Faq page reads.
 */
import { useEffect, useState } from 'react';
import { Plus, Trash, FloppyDisk, Eye, EyeSlash } from '@phosphor-icons/react';
import {
  listFaqs, upsertFaq, deleteFaq, FAQ_CATEGORIES,
  type Faq, type FaqCategory,
} from '../../data/faqStore';
import './FaqAdmin.css';

interface DraftRow extends Partial<Faq> {
  question: string;
  answer_md: string;
  category: FaqCategory;
}

const EMPTY_DRAFT: DraftRow = {
  question: '',
  answer_md: '',
  category: 'getting_started',
  position: 0,
  visible: true,
  related_module_slug: null,
};

export default function FaqAdminPage() {
  const [rows, setRows] = useState<Faq[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftRow>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listFaqs(true).then((data) => {
      if (cancelled) return;
      setRows(data);
    });
    return () => { cancelled = true; };
  }, []);

  function startEdit(f: Faq) {
    setEditId(f.id);
    setDraft({
      ...f,
    });
  }

  function startNew() {
    setEditId('new');
    setDraft(EMPTY_DRAFT);
  }

  function cancel() {
    setEditId(null);
    setDraft(EMPTY_DRAFT);
  }

  async function save() {
    if (!draft.question.trim() || !draft.answer_md.trim()) return;
    setBusy(true);
    try {
      const saved = await upsertFaq(draft);
      if (saved) {
        setRows((prev) => {
          const next = prev.filter((r) => r.id !== saved.id);
          return [...next, saved].sort((a, b) =>
            a.category === b.category ? a.position - b.position : a.category.localeCompare(b.category)
          );
        });
      }
      cancel();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    setBusy(true);
    try {
      await deleteFaq(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisible(f: Faq) {
    const next = await upsertFaq({ ...f, visible: !f.visible });
    if (next) setRows((prev) => prev.map((r) => (r.id === next.id ? next : r)));
  }

  return (
    <div className="faq-admin">
      <header className="faq-admin__head">
        <div>
          <h1>FAQs</h1>
          <p className="faq-admin__sub">{rows.length} total</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={startNew}>
          <Plus size={14} /> New FAQ
        </button>
      </header>

      {editId && (
        <section className="faq-admin__edit">
          <h3>{editId === 'new' ? 'New FAQ' : 'Edit FAQ'}</h3>
          <div className="faq-admin__row">
            <label>
              <span>Question</span>
              <input
                type="text"
                value={draft.question}
                onChange={(e) => setDraft({ ...draft, question: e.target.value })}
                placeholder="A clear, single-question phrasing"
              />
            </label>
            <label>
              <span>Category</span>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as FaqCategory })}
              >
                {FAQ_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>Answer (markdown)</span>
            <textarea
              rows={6}
              value={draft.answer_md}
              onChange={(e) => setDraft({ ...draft, answer_md: e.target.value })}
              placeholder="Plain-language answer. 2–4 sentences usually."
            />
          </label>
          <div className="faq-admin__row">
            <label>
              <span>Position</span>
              <input
                type="number"
                value={draft.position ?? 0}
                onChange={(e) => setDraft({ ...draft, position: parseInt(e.target.value, 10) || 0 })}
              />
            </label>
            <label>
              <span>Related module slug (optional)</span>
              <input
                type="text"
                value={draft.related_module_slug ?? ''}
                onChange={(e) => setDraft({ ...draft, related_module_slug: e.target.value || null })}
                placeholder="e.g. what-is-context-engineering"
              />
            </label>
          </div>
          <footer>
            <button className="btn btn--ghost btn--sm" onClick={cancel} disabled={busy}>Cancel</button>
            <button className="btn btn--primary btn--sm" onClick={save} disabled={busy}>
              <FloppyDisk size={14} /> {busy ? 'Saving…' : 'Save'}
            </button>
          </footer>
        </section>
      )}

      {FAQ_CATEGORIES.map((cat) => {
        const items = rows.filter((r) => r.category === cat.value);
        if (items.length === 0) return null;
        return (
          <section key={cat.value} className="faq-admin__section">
            <h2>{cat.label}</h2>
            <ul>
              {items.map((f) => (
                <li key={f.id} className={!f.visible ? 'is-hidden' : ''}>
                  <div>
                    <strong>{f.question}</strong>
                    <p>{f.answer_md.slice(0, 140)}{f.answer_md.length > 140 ? '…' : ''}</p>
                  </div>
                  <div className="faq-admin__actions">
                    <button onClick={() => toggleVisible(f)} aria-label={f.visible ? 'Hide' : 'Show'}>
                      {f.visible ? <Eye size={14} /> : <EyeSlash size={14} />}
                    </button>
                    <button onClick={() => startEdit(f)}>Edit</button>
                    <button onClick={() => remove(f.id)} className="faq-admin__del">
                      <Trash size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
