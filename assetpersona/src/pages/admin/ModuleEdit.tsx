/* ═══ ADMIN — Module Composer ═══
 * Single-page anatomy editor with AI-assisted generation per field.
 * Bypass-aware: all reads/writes go through learnStore which routes between
 * localStorage and Supabase based on isBypassActive().
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, FloppyDisk, Rocket, Sparkle, Trash, Plus, X, PushPin, Clock,
} from '@phosphor-icons/react';
import {
  getModuleBySlug,
  upsertModule,
  setStatus,
  pinTodayDrillById,
  deleteModule,
} from '../../data/learnStore';
import { generateModule } from '../../data/moduleGen';
import type {
  LearnModule,
  ModuleResource,
  ModuleType,
  LearnerRole,
  ResourceKind,
} from '../../types/learn';
import './ModuleEdit.css';

const TYPE_OPTIONS: { value: ModuleType; label: string }[] = [
  { value: 'daily_drill', label: 'Daily Drill' },
  { value: 'news_drop', label: 'News Drop' },
  { value: 'concept', label: 'Concept' },
  { value: 'role_pathway', label: 'Role Pathway' },
  { value: 'project', label: 'Project' },
  { value: 'match_game', label: 'Terminology Match Game' },
];

const ROLE_OPTIONS: { value: LearnerRole; label: string }[] = [
  { value: 'curious', label: 'Curious' },
  { value: 'operator', label: 'Operator' },
  { value: 'crafter', label: 'AI Crafter' },
  { value: 'architect', label: 'Context Architect' },
  { value: 'producer', label: 'AI Producer' },
];

const RESOURCE_KINDS: ResourceKind[] = ['link', 'tool', 'video', 'paper', 'thread'];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ModuleEditPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!slug;
  const todayIso = new Date().toISOString().slice(0, 10);

  // Anatomy state
  const [id, setId] = useState<string>(() => crypto.randomUUID());
  const [moduleSlug, setModuleSlug] = useState('');
  const [type, setType] = useState<ModuleType>('concept');
  const [requiredRole, setRequiredRole] = useState<LearnerRole>('curious');
  const [estimatedMinutes, setEstimatedMinutes] = useState(5);
  const [xpReward, setXpReward] = useState(10);

  const [hook, setHook] = useState('');
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [contextMd, setContextMd] = useState('');
  const [practiceMd, setPracticeMd] = useState('');
  const [practiceStarter, setPracticeStarter] = useState('');
  const [reflectQuestion, setReflectQuestion] = useState('');
  const [tagsRaw, setTagsRaw] = useState('');
  const [resources, setResources] = useState<ModuleResource[]>([]);
  const [matchPairs, setMatchPairs] = useState<{ term: string; definition: string }[]>([]);
  const [pinAsToday, setPinAsToday] = useState(false);
  // Lane 1 — scheduled publish: when set, Save flips status to 'queued'
  // and the n8n auto-publish-scheduled-modules cron flips the row to
  // 'published' once now() >= scheduled_publish_at.
  const [scheduledPublishAt, setScheduledPublishAt] = useState<string>('');

  // UI state
  const [busy, setBusy] = useState<null | 'save' | 'publish' | 'gen'>(null);
  const [genSource, setGenSource] = useState('');
  const [genSourceType, setGenSourceType] = useState<'url' | 'paste' | 'prompt'>('prompt');
  const [genOpen, setGenOpen] = useState(false);
  const [error, setError] = useState('');
  const initRef = useRef(false);

  // Load existing module on edit
  useEffect(() => {
    if (!isEdit || initRef.current) return;
    initRef.current = true;
    getModuleBySlug(slug!).then((m) => {
      if (!m) return;
      setId(m.id);
      setModuleSlug(m.slug);
      setType(m.type);
      setRequiredRole(m.required_role);
      setEstimatedMinutes(m.estimated_minutes);
      setXpReward(m.xp_reward);
      setHook(m.hook);
      setTitle(m.title);
      setObjective(m.objective);
      setContextMd(m.context_md);
      setPracticeMd(m.practice_md ?? '');
      setPracticeStarter(m.practice_starter ?? '');
      setReflectQuestion(m.reflect_question ?? '');
      setTagsRaw((m.tags ?? []).join(', '));
      setResources(m.resources ?? []);
      setMatchPairs(m.match_pairs ?? []);
      setPinAsToday(m.pinned_as_today_drill_at === todayIso);
      // Lane 1 — pre-fill the datetime-local input from any existing schedule.
      const sched = (m as unknown as { scheduled_publish_at?: string | null }).scheduled_publish_at;
      if (sched) {
        // datetime-local wants 'YYYY-MM-DDTHH:mm' — trim seconds + Z.
        setScheduledPublishAt(sched.slice(0, 16));
      }
    });
  }, [isEdit, slug, todayIso]);

  // ?from=ai opens the gen panel
  useEffect(() => {
    if (searchParams.get('from') === 'ai') setGenOpen(true);
  }, [searchParams]);

  const tags = useMemo(
    () => tagsRaw.split(',').map((t) => t.trim()).filter(Boolean),
    [tagsRaw]
  );

  const finalSlug = moduleSlug || slugify(title || 'untitled');

  function buildModule(status: 'draft' | 'queued' | 'published'): LearnModule {
    // Lane 1 — when admin sets a future scheduled_publish_at, Save flips the
    // status from 'draft' to 'queued' so the n8n worker can pick it up.
    const scheduledIso = scheduledPublishAt ? new Date(scheduledPublishAt).toISOString() : null;
    return {
      id,
      slug: finalSlug,
      type,
      status,
      hook,
      title,
      objective,
      context_md: contextMd,
      practice_md: practiceMd || null,
      practice_starter: practiceStarter || null,
      reflect_question: reflectQuestion || null,
      match_pairs: matchPairs,
      required_role: requiredRole,
      tags,
      cover_image: null,
      estimated_minutes: estimatedMinutes,
      xp_reward: xpReward,
      pathway_id: null,
      pathway_order: null,
      source_url: null,
      source_published_at: null,
      generated_by_ai: false,
      author_id: null,
      pinned_as_today_drill_at: pinAsToday ? todayIso : null,
      scheduled_publish_at: scheduledIso,
      published_at: status === 'published' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resources,
    } as LearnModule;
  }

  async function handleSave() {
    setBusy('save');
    setError('');
    try {
      // Lane 1 — Save flips to 'queued' when a future scheduled_publish_at is set.
      const targetStatus: 'draft' | 'queued' =
        scheduledPublishAt && new Date(scheduledPublishAt).getTime() > Date.now()
          ? 'queued'
          : 'draft';
      const saved = await upsertModule(buildModule(targetStatus), resources);
      if (pinAsToday) await pinTodayDrillById(saved.id);
      navigate(`/admin/modules/edit/${saved.slug}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setBusy(null);
    }
  }

  async function handlePublish() {
    setBusy('publish');
    setError('');
    try {
      const saved = await upsertModule(buildModule('published'), resources);
      await setStatus(saved.id, 'published');
      if (pinAsToday) await pinTodayDrillById(saved.id);
      navigate('/admin/modules');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed.');
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this module? This cannot be undone.')) return;
    await deleteModule(id);
    navigate('/admin/modules');
  }

  async function handleGenerate() {
    if (!genSource.trim()) {
      setError('Add a URL, paste, or concept brief first.');
      return;
    }
    setBusy('gen');
    setError('');
    try {
      const draft = await generateModule({
        source_type: genSourceType,
        source: genSource,
        target_role: requiredRole,
        type,
      });
      setHook(draft.hook ?? hook);
      setTitle(draft.title ?? title);
      setObjective(draft.objective ?? objective);
      setContextMd(draft.context_md ?? contextMd);
      setPracticeMd(draft.practice_md ?? practiceMd);
      setPracticeStarter(draft.practice_starter ?? practiceStarter);
      setReflectQuestion(draft.reflect_question ?? reflectQuestion);
      if (draft.suggested_tags) setTagsRaw(draft.suggested_tags.join(', '));
      if (draft.suggested_role) setRequiredRole(draft.suggested_role);
      if (draft.resources?.length) {
        setResources(
          draft.resources.map((r, i) => ({
            id: crypto.randomUUID(),
            module_id: id,
            kind: r.kind,
            label: r.label,
            url: r.url,
            description: r.description ?? null,
            position: i,
          }))
        );
      }
      setGenOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setBusy(null);
    }
  }

  function addResource() {
    setResources((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        module_id: id,
        kind: 'link',
        label: '',
        url: '',
        description: null,
        position: prev.length,
      },
    ]);
  }

  function updateResource(idx: number, patch: Partial<ModuleResource>) {
    setResources((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function removeResource(idx: number) {
    setResources((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="module-edit">
      <header className="module-edit__head">
        <button className="module-edit__back" onClick={() => navigate('/admin/modules')}>
          <ArrowLeft size={16} /> Modules
        </button>
        <div className="module-edit__head-actions">
          <button className="btn btn--ghost btn--sm" onClick={() => setGenOpen(!genOpen)}>
            <Sparkle size={14} /> {genOpen ? 'Hide AI panel' : 'AI assist'}
          </button>
          <button className="btn btn--ghost btn--sm" onClick={handleSave} disabled={busy !== null}>
            <FloppyDisk size={14} /> {busy === 'save' ? 'Saving...' : 'Save Draft'}
          </button>
          {isEdit && (
            <button className="btn btn--ghost btn--sm module-edit__danger" onClick={handleDelete}>
              <Trash size={14} /> Delete
            </button>
          )}
          <button className="btn btn--primary btn--sm" onClick={handlePublish} disabled={busy !== null}>
            <Rocket size={14} /> {busy === 'publish' ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </header>

      {error && <p className="module-edit__error">{error}</p>}

      {genOpen && (
        <section className="module-edit__gen">
          <div className="module-edit__gen-row">
            <label className="module-edit__field module-edit__field--small">
              <span>Source</span>
              <select
                value={genSourceType}
                onChange={(e) => setGenSourceType(e.target.value as 'url' | 'paste' | 'prompt')}
              >
                <option value="url">URL</option>
                <option value="paste">Paste</option>
                <option value="prompt">Concept brief</option>
              </select>
            </label>
            <label className="module-edit__field" style={{ flex: 1 }}>
              <span>{genSourceType === 'url' ? 'Article URL' : genSourceType === 'paste' ? 'Pasted text' : 'Concept brief'}</span>
              {genSourceType === 'paste' ? (
                <textarea
                  rows={4}
                  value={genSource}
                  onChange={(e) => setGenSource(e.target.value)}
                  placeholder="Paste the article body or transcript here..."
                />
              ) : (
                <input
                  type={genSourceType === 'url' ? 'url' : 'text'}
                  value={genSource}
                  onChange={(e) => setGenSource(e.target.value)}
                  placeholder={genSourceType === 'url' ? 'https://...' : 'e.g. Teach what context engineering is and how it differs from prompting.'}
                />
              )}
            </label>
            <button
              className="btn btn--primary btn--sm"
              onClick={handleGenerate}
              disabled={busy === 'gen'}
            >
              {busy === 'gen' ? 'Generating...' : 'Generate draft'}
            </button>
          </div>
          <p className="module-edit__hint">
            AI fills every anatomy field. You stay the editor — review, tweak, ship.
          </p>
        </section>
      )}

      <section className="module-edit__meta">
        <label className="module-edit__field module-edit__field--small">
          <span>Type</span>
          <select value={type} onChange={(e) => setType(e.target.value as ModuleType)}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="module-edit__field module-edit__field--small">
          <span>Required role</span>
          <select value={requiredRole} onChange={(e) => setRequiredRole(e.target.value as LearnerRole)}>
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="module-edit__field module-edit__field--small">
          <span>Minutes</span>
          <input
            type="number"
            min={1}
            max={60}
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 5)}
          />
        </label>
        <label className="module-edit__field module-edit__field--small">
          <span>Skill Points</span>
          <input
            type="number"
            min={0}
            max={500}
            value={xpReward}
            onChange={(e) => setXpReward(parseInt(e.target.value, 10) || 10)}
          />
        </label>
        {/* Lane 1 — ScheduleField: pin checkbox + datetime picker.
            When the datetime is in the future, Save stores status='queued'
            and n8n auto-publishes the row at scheduled_publish_at. */}
        <div className="module-edit__schedule">
          <label className="module-edit__field module-edit__field--small module-edit__field--check">
            <input
              type="checkbox"
              checked={pinAsToday}
              onChange={(e) => setPinAsToday(e.target.checked)}
            />
            <span><PushPin size={11} /> Pin as Today's Drill</span>
          </label>
          <label className="module-edit__field module-edit__field--small module-edit__field--sched">
            <span><Clock size={11} /> Schedule publish</span>
            <input
              type="datetime-local"
              value={scheduledPublishAt}
              onChange={(e) => setScheduledPublishAt(e.target.value)}
              aria-label="Scheduled publish date and time"
            />
            {scheduledPublishAt && (
              <button
                type="button"
                className="module-edit__sched-clear"
                onClick={() => setScheduledPublishAt('')}
                aria-label="Clear scheduled publish time"
              >
                Clear
              </button>
            )}
          </label>
        </div>
      </section>

      <input
        className="module-edit__title-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title — under 60 chars, plain language"
      />

      <input
        className="module-edit__hook-input"
        type="text"
        value={hook}
        onChange={(e) => setHook(e.target.value)}
        placeholder="Hook — one line, why they should care"
        maxLength={120}
      />

      <textarea
        className="module-edit__objective-input"
        rows={2}
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
        placeholder='Objective — "After this you will be able to..."'
      />

      <label className="module-edit__field">
        <span>Context (markdown)</span>
        <textarea
          rows={8}
          value={contextMd}
          onChange={(e) => setContextMd(e.target.value)}
          placeholder="60–120 words. Plain language. Lists welcome."
        />
      </label>

      <label className="module-edit__field">
        <span>Practice — what they DO</span>
        <textarea
          rows={4}
          value={practiceMd}
          onChange={(e) => setPracticeMd(e.target.value)}
          placeholder="One concrete task, doable in under 5 minutes."
        />
      </label>

      <label className="module-edit__field">
        <span>Practice starter (optional)</span>
        <textarea
          rows={3}
          value={practiceStarter}
          onChange={(e) => setPracticeStarter(e.target.value)}
          placeholder="A starter prompt or template the learner pastes into their tool."
        />
      </label>

      <label className="module-edit__field">
        <span>Reflect question (optional)</span>
        <input
          type="text"
          value={reflectQuestion}
          onChange={(e) => setReflectQuestion(e.target.value)}
          placeholder="One question, under 20 words."
        />
      </label>

      <label className="module-edit__field">
        <span>Tags</span>
        <input
          type="text"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
          placeholder="comma, separated, tags"
        />
      </label>

      {type === 'match_game' && (
        <section className="module-edit__resources">
          <div className="module-edit__resources-head">
            <span>Matching Terminology Pairs</span>
            <button className="btn btn--ghost btn--sm" onClick={() => setMatchPairs(prev => [...prev, { term: '', definition: '' }])}>
              <Plus size={14} /> Add pair
            </button>
          </div>
          {matchPairs.length === 0 && (
            <p className="module-edit__hint">Add 3–6 matching terms and definitions.</p>
          )}
          <ul className="module-edit__resource-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {matchPairs.map((pair, i) => (
              <li key={i} className="module-edit__resource" style={{ gap: 'var(--space-sm)' }}>
                <input
                  type="text"
                  value={pair.term}
                  onChange={(e) => setMatchPairs(prev => prev.map((p, idx) => idx === i ? { ...p, term: e.target.value } : p))}
                  placeholder="Term (e.g. LLM)"
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  value={pair.definition}
                  onChange={(e) => setMatchPairs(prev => prev.map((p, idx) => idx === i ? { ...p, definition: e.target.value } : p))}
                  placeholder="Definition (e.g. Large Language Model)"
                  style={{ flex: 2 }}
                />
                <button
                  className="module-edit__resource-remove"
                  onClick={() => setMatchPairs(prev => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove pair"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Resources */}
      <section className="module-edit__resources">
        <div className="module-edit__resources-head">
          <span>Resources</span>
          <button className="btn btn--ghost btn--sm" onClick={addResource}>
            <Plus size={14} /> Add resource
          </button>
        </div>
        {resources.length === 0 && (
          <p className="module-edit__hint">Add 1–4 curated links, tools, papers, or threads.</p>
        )}
        <ul className="module-edit__resource-list">
          {resources.map((r, i) => (
            <li key={r.id} className="module-edit__resource">
              <select
                value={r.kind}
                onChange={(e) => updateResource(i, { kind: e.target.value as ResourceKind })}
              >
                {RESOURCE_KINDS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <input
                type="text"
                value={r.label}
                onChange={(e) => updateResource(i, { label: e.target.value })}
                placeholder="Label"
              />
              <input
                type="url"
                value={r.url}
                onChange={(e) => updateResource(i, { url: e.target.value })}
                placeholder="https://..."
              />
              <button
                className="module-edit__resource-remove"
                onClick={() => removeResource(i)}
                aria-label="Remove resource"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
