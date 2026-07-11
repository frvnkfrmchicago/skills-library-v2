import { useState } from 'react';
import { Plus, Trash2, Check, Clock, Circle, Sparkles, MessageSquare, Send, X } from 'lucide-react';
import type { Note, NoteTheme } from '@/lib/command-center/types';
import { colors, typeScale, fontWeight, borderRadius, spacing, motion } from '@/lib/design-tokens';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';

const THEME_COLORS: Record<NoteTheme, string> = {
  bug: '#FF4444', feature: '#00C2FF', design: '#C084FC', architecture: '#F59E0B',
  security: '#EF4444', legal: '#6B7280', performance: '#10B981', content: '#EC4899',
  agent: '#33D6FF', general: '#5A8EA8',
};
const THEME_OPTIONS: NoteTheme[] = ['bug', 'feature', 'design', 'architecture', 'security', 'legal', 'performance', 'content', 'agent', 'general'];

type NoteStatus = 'open' | 'tracking' | 'resolved';

const STATUS_CONFIG: Record<NoteStatus, { label: string; color: string; bg: string; icon: typeof Circle }> = {
  open: { label: 'Open', color: '#00C2FF', bg: '#00C2FF15', icon: Circle },
  tracking: { label: 'Tracking', color: '#F59E0B', bg: '#F59E0B15', icon: Clock },
  resolved: { label: 'Resolved', color: '#4ADE80', bg: '#4ADE8015', icon: Check },
};

interface NoteUpdate {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface NoteWithUpdates extends Note {
  status: NoteStatus;
  updates: NoteUpdate[];
}

function parseLegacyBody(body: string): { cleanBody: string; status?: NoteStatus; updates?: NoteUpdate[] } {
  const trimmed = body.trim();
  const lastNewline = trimmed.lastIndexOf('\n');
  if (lastNewline <= 0) return { cleanBody: body };
  const maybeJson = trimmed.slice(lastNewline + 1).trim();
  if (!maybeJson.startsWith('{') || !maybeJson.endsWith('}')) return { cleanBody: body };
  try {
    const parsed = JSON.parse(maybeJson) as { _status?: NoteStatus; _updates?: NoteUpdate[] };
    if (!parsed._status && !parsed._updates) return { cleanBody: body };
    return { cleanBody: trimmed.slice(0, lastNewline).trim(), status: parsed._status, updates: parsed._updates };
  } catch {
    return { cleanBody: body };
  }
}

function parseNoteExtended(note: Note): NoteWithUpdates {
  const legacy = note.status || note.updates ? null : parseLegacyBody(note.body || '');
  const status: NoteStatus = (note.status ?? legacy?.status ?? 'open') as NoteStatus;
  const updates: NoteUpdate[] = (note.updates ?? legacy?.updates ?? []) as NoteUpdate[];
  const cleanBody = legacy ? legacy.cleanBody : note.body;
  return { ...note, body: cleanBody, status, updates };
}

interface Props {
  notes: Note[];
  onAdd: (note: Note) => void;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onExtractThemes: (text: string) => void;
  accent: string; accentSoft: string; txtMuted: string; txtHeadline: string; hairline: string;
}

export function NotesPanel({ notes, onAdd, onUpdate, onDelete, onToggleComplete, onExtractThemes, accent, accentSoft, txtMuted, txtHeadline, hairline }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<NoteTheme | 'all'>('all');

  const parsed = notes.map(parseNoteExtended);
  const filtered = filter === 'all' ? parsed : parsed.filter((n) => n.themes.includes(filter));

  const openCount = parsed.filter((n) => n.status === 'open').length;
  const trackingCount = parsed.filter((n) => n.status === 'tracking').length;
  const resolvedCount = parsed.filter((n) => n.status === 'resolved').length;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const ext: NoteWithUpdates = {
      id: `note-${Date.now().toString(36)}`, title: newTitle.trim(), body: newBody.trim(), themes: ['general'],
      sources: [{ type: 'manual', label: 'User' }], completed: false, linkedTaskIds: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      status: 'open', updates: [],
    };
    onAdd(ext);
    setNewTitle('');
    setNewBody('');
    setIsAdding(false);
  };

  const setStatus = (note: NoteWithUpdates, status: NoteStatus) => {
    const updated = { ...note, status };
    onUpdate(updated);
  };

  const addUpdate = (note: NoteWithUpdates) => {
    const text = commentInputs[note.id]?.trim();
    if (!text) return;
    const update: NoteUpdate = { id: Date.now().toString(), text, author: 'User', createdAt: new Date().toISOString() };
    const updated = { ...note, updates: [...note.updates, update] };
    onUpdate(updated);
    setCommentInputs((prev) => ({ ...prev, [note.id]: '' }));
  };

  const card = (note: NoteWithUpdates) => {
    const expanded = expandedId === note.id;
    const sc = STATUS_CONFIG[note.status];
    const Icon = sc.icon;

    return (
      <div key={note.id} style={{
        background: 'rgba(0,0,0,0.3)', borderRadius: borderRadius.xl, padding: spacing.lg,
        border: `1px solid ${hairline}`, transition: 'border-color 0.2s ease',
      }}>
        {/* Title + Status Row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: typeScale.base, fontWeight: fontWeight.semibold, color: txtHeadline, margin: 0, lineHeight: 1.4 }}>{note.title}</h4>
            {note.body && (
              <p style={{ fontSize: typeScale.sm, color: txtMuted, margin: `${spacing.xs} 0 0 0`, lineHeight: 1.5 }}>{note.body}</p>
            )}
          </div>

          {/* Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.full, background: sc.bg, border: `1px solid ${sc.color}33`, flexShrink: 0 }}>
            <Icon size={12} style={{ color: sc.color }} />
            <span style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{sc.label}</span>
          </div>
        </div>

        {/* Theme Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md }}>
          {note.themes.map((t) => (
            <span key={t} style={{ padding: `${2}px ${spacing.sm}`, borderRadius: borderRadius.full, fontSize: typeScale.xs, fontWeight: fontWeight.bold, background: `${THEME_COLORS[t]}15`, color: THEME_COLORS[t], border: `1px solid ${THEME_COLORS[t]}33`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t}</span>
          ))}
          <span style={{ fontSize: typeScale.xs, color: txtMuted, marginLeft: 'auto' }}>
            {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpandedId(expanded ? null : note.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: typeScale.xs, fontWeight: fontWeight.semibold, color: accent, marginTop: spacing.sm, padding: 0 }}>
          {expanded ? 'Hide details' : 'View details & updates'}
        </button>

        {expanded && (
          <div style={{ marginTop: spacing.md, borderTop: `1px solid ${hairline}`, paddingTop: spacing.md }}>
            {/* Updates / Comments */}
            <p style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.06em', color: txtMuted, marginBottom: spacing.sm }}>Updates</p>
            {note.updates.length === 0 && (
              <p style={{ fontSize: typeScale.sm, color: txtMuted, marginBottom: spacing.md }}>No updates yet.</p>
            )}
            {note.updates.map((u) => (
              <div key={u.id} style={{ background: 'rgba(0,0,0,0.2)', padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                  <span style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, color: accent }}>{u.author}</span>
                  <span style={{ fontSize: typeScale.xs, color: txtMuted }}>{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                </div>
                <p style={{ fontSize: typeScale.sm, color: txtHeadline, margin: 0, lineHeight: 1.5 }}>{u.text}</p>
              </div>
            ))}

            {/* Add Update */}
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <input
                value={commentInputs[note.id] || ''}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [note.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addUpdate(note)}
                placeholder="Add an update..."
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: `1px solid ${hairline}`, borderRadius: borderRadius.lg, padding: `${spacing.sm} ${spacing.md}`, fontSize: typeScale.sm, color: txtHeadline, outline: 'none', minHeight: 36 }}
              />
              <Button size="sm" onClick={() => addUpdate(note)} icon={Send}>Send</Button>
            </div>

            {/* Status Selector + Actions */}
            <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }}>
              {(Object.keys(STATUS_CONFIG) as NoteStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = note.status === s;
                return (
                  <button key={s} onClick={() => setStatus(note, s)}
                    style={{ padding: `${spacing.xs} ${spacing.md}`, borderRadius: borderRadius.lg, fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.04em', border: active ? `1px solid ${cfg.color}` : `1px solid ${hairline}`, background: active ? cfg.bg : 'transparent', color: active ? cfg.color : txtMuted, cursor: 'pointer' }}>
                    {cfg.label}
                  </button>
                );
              })}
              <Button variant="ghost" size="sm" onClick={() => onExtractThemes(`${note.title}\n${note.body}`)} icon={Sparkles}>Auto-theme</Button>
              <button onClick={() => onDelete(note.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: `${spacing.xs} ${spacing.sm}`, color: '#FF4444', fontSize: typeScale.xs, fontWeight: fontWeight.bold }}>Delete</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, padding: spacing.lg, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: typeScale['2xl'], fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>Notes & Tracking</h3>
        <p style={{ fontSize: typeScale.base, color: txtMuted, margin: `${spacing.xs} 0 0 0` }}>Track items, add updates, and resolve notes as you go.</p>
      </div>

      {/* Status Summary */}
      <div style={{ display: 'flex', gap: spacing.lg }}>
        {([
          { label: 'Open', count: openCount, color: STATUS_CONFIG.open.color },
          { label: 'Tracking', count: trackingCount, color: STATUS_CONFIG.tracking.color },
          { label: 'Resolved', count: resolvedCount, color: STATUS_CONFIG.resolved.color },
        ]).map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color }} />
            <span style={{ fontSize: typeScale.sm, fontWeight: fontWeight.bold, color: txtHeadline }}>{s.count}</span>
            <span style={{ fontSize: typeScale.sm, color: txtMuted }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* New Note Form */}
      {isAdding ? (
        <div style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${accent}44`, borderRadius: borderRadius.xl, padding: spacing.lg }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="What needs tracking?"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${hairline}`, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typeScale.base, color: txtHeadline, outline: 'none', width: '100%' }}
            />
            <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} rows={3} placeholder="Details..."
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${hairline}`, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typeScale.base, color: txtHeadline, outline: 'none', resize: 'vertical', width: '100%' }}
            />
            <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => { setIsAdding(false); setNewTitle(''); setNewBody(''); }} size="sm">Cancel</Button>
              <Button onClick={handleAdd} size="sm">Add Note</Button>
            </div>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsAdding(true)} size="md" icon={Plus} style={{ alignSelf: 'flex-start' }}>New Note</Button>
      )}

      {/* Theme Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
        {(['all', ...THEME_OPTIONS] as const).map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.full, fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.04em', border: 'none', cursor: 'pointer', background: filter === t ? accentSoft : 'transparent', color: filter === t ? accent : txtMuted }}>
            {t}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {filtered.length === 0 && (
          <div style={{ padding: spacing.xxl, textAlign: 'center', borderRadius: borderRadius.xl, border: `1px dashed ${hairline}` }}>
            <p style={{ fontSize: typeScale.base, color: txtMuted, margin: 0 }}>No notes yet. Click "New Note" to start tracking.</p>
          </div>
        )}
        {filtered.map((note) => card(note))}
      </div>
    </div>
  );
}
