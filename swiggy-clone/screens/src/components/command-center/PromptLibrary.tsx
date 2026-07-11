import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { PromptEntry, PromptCategory } from '@/lib/command-center/types';
import { colors, typeScale, fontWeight, borderRadius, spacing, motion } from '@/lib/design-tokens';
import { CopyButton } from '@/lib/ui/CopyButton';
import { Card } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';

const CAT_COLORS: Record<PromptCategory, string> = {
  system: '#FF4444', user: '#00C2FF', chain: '#F59E0B', agent: '#33D6FF', creative: '#EC4899', general: '#5A8EA8',
};

interface Props {
  prompts: PromptEntry[];
  onAdd: (p: PromptEntry) => void;
  onUpdate: (p: PromptEntry) => void;
  onDelete: (id: string) => void;
}

export function PromptLibrary({ prompts, onAdd, onUpdate, onDelete }: Props) {
  const [quickTitle, setQuickTitle] = useState('');
  const [editing, setEditing] = useState<PromptEntry | null>(null);
  const [catFilter, setCatFilter] = useState<PromptCategory | 'all'>('all');

  const filtered = catFilter === 'all' ? prompts : prompts.filter((p) => p.category === catFilter);

  const addQuick = () => {
    if (!quickTitle.trim()) return;
    onAdd({
      id: `prompt-${Date.now().toString(36)}`, title: quickTitle.trim(), body: '', category: 'general', tags: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    setQuickTitle('');
  };

  const saveEdit = () => {
    if (editing) { onUpdate(editing); setEditing(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, padding: spacing.lg, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: typeScale.lg, fontWeight: fontWeight.bold, color: colors.text.headline, margin: 0 }}>Prompt Library</h3>
        <span style={{ fontSize: typeScale.sm, color: colors.text.muted }}>{prompts.length} saved</span>
      </div>

      <div style={{ display: 'flex', gap: spacing.sm }}>
        <input
          value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addQuick()}
          placeholder="New prompt title..."
          style={{
            flex: 1, background: 'rgba(0,13,26,0.5)', border: `1px solid ${colors.glass.heavy}`, borderRadius: borderRadius.lg,
            padding: `${spacing.sm} ${spacing.md}`, fontSize: typeScale.base, color: colors.text.headline, outline: 'none', minHeight: '44px',
          }}
        />
        <Button onClick={addQuick} size="md"><Plus size={16} /></Button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
        {(['all', 'system', 'user', 'chain', 'agent', 'creative', 'general'] as const).map((c) => (
          <button key={c} onClick={() => setCatFilter(c)}
            style={{
              padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.full, fontSize: typeScale.xs, fontWeight: fontWeight.bold,
              textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', cursor: 'pointer',
              background: catFilter === c ? `${colors.accentBlue}22` : 'transparent',
              color: catFilter === c ? colors.accentBlue : colors.text.muted,
            }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        {filtered.length === 0 && <p style={{ padding: spacing.xl, textAlign: 'center', color: colors.text.muted, fontSize: typeScale.base }}>No prompts yet. Save one above.</p>}
        {filtered.map((prompt) => (
          <Card key={prompt.id} padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                  <span style={{ fontSize: typeScale.base, fontWeight: fontWeight.bold, color: colors.text.headline }}>{prompt.title}</span>
                  <Badge label={prompt.category} color={CAT_COLORS[prompt.category]} />
                </div>
                {prompt.body && (
                  <pre style={{
                    fontSize: typeScale.sm, color: colors.text.secondary, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    margin: 0, maxHeight: 120, overflow: 'auto', lineHeight: 1.5,
                    background: 'rgba(0,0,0,0.3)', padding: spacing.md, borderRadius: borderRadius.md,
                  }}>
                    {prompt.body.slice(0, 500)}{prompt.body.length > 500 ? '...' : ''}
                  </pre>
                )}
              </div>
              <div style={{ display: 'flex', gap: spacing.xs, marginLeft: spacing.sm, flexShrink: 0 }}>
                <CopyButton text={prompt.body} label="Copy" size="sm" />
                <button onClick={() => setEditing({ ...prompt })} style={{ fontSize: typeScale.sm, fontWeight: fontWeight.semibold, color: colors.accentBlue, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => onDelete(prompt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} style={{ color: colors.text.muted }} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <div style={{
          position: 'absolute', bottom: spacing.lg, left: spacing.lg, right: spacing.lg, zIndex: 50,
          background: 'rgba(0,0,0,0.85)', border: `2px solid ${colors.accentBlue}`, borderRadius: borderRadius.xl,
          padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md,
        }}>
          <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            style={{ background: 'rgba(0,13,26,0.8)', border: `1px solid ${colors.glass.heavy}`, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typeScale.base, color: colors.text.headline, outline: 'none' }}
          />
          <textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={8} placeholder="Prompt text..."
            style={{ background: 'rgba(0,13,26,0.8)', border: `1px solid ${colors.glass.heavy}`, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typeScale.sm, color: colors.text.headline, outline: 'none', resize: 'vertical', fontFamily: 'monospace' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
            {(['system', 'user', 'chain', 'agent', 'creative', 'general'] as const).map((c) => (
              <button key={c} onClick={() => setEditing({ ...editing, category: c })}
                style={{
                  padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.full, fontSize: typeScale.xs, fontWeight: fontWeight.bold,
                  textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                  background: editing.category === c ? `${CAT_COLORS[c]}33` : 'transparent',
                  color: editing.category === c ? CAT_COLORS[c] : colors.text.muted,
                }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button onClick={saveEdit}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
