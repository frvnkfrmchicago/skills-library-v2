import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CloneEntry, CloneStatus } from '@/lib/command-center/types';
import { typeScale, fontWeight, borderRadius, spacing } from '@/lib/design-tokens';
import { Button } from '@/lib/ui/Button';
import { Card } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';

const STATUS_COLORS: Record<CloneStatus, string> = { active: '#00C2FF', paused: '#F59E0B', shipped: '#4ADE80', archived: '#6B7280' };

interface Props {
  clones: CloneEntry[];
  onAdd: (clone: CloneEntry) => void;
  onUpdate: (clone: CloneEntry) => void;
  onDelete: (id: string) => void;
  accent: string; txtMuted: string; txtHeadline: string; hairline: string;
}

export function CloneRegistry({ clones, onAdd, onUpdate, onDelete, accent, txtMuted, txtHeadline, hairline }: Props) {
  const [quickName, setQuickName] = useState('');
  const [editing, setEditing] = useState<CloneEntry | null>(null);

  const addQuick = () => {
    if (!quickName.trim()) return;
    onAdd({ id: `clone-${Date.now().toString(36)}`, name: quickName.trim(), description: '', status: 'active', screenCount: 0, featureCount: 0, version: '0.1', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    setQuickName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.lg, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: typeScale.lg, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>Clone Registry</h3>
        <span style={{ fontSize: typeScale.sm, color: txtMuted }}>{clones.length} clones</span>
      </div>

      <div style={{ display: 'flex', gap: spacing.sm }}>
        <input value={quickName} onChange={(e) => setQuickName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addQuick()}
          placeholder="App name..." style={{ flex: 1, background: 'rgba(0,13,26,0.5)', border: `1px solid ${hairline}`, borderRadius: borderRadius.lg, padding: `${spacing.sm} ${spacing.md}`, fontSize: typeScale.base, color: txtHeadline, outline: 'none', minHeight: 44 }}
        />
        <Button onClick={addQuick} size="md"><Plus size={18} /></Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: spacing.md, alignContent: 'flex-start' }}>
        {clones.length === 0 && <p style={{ padding: spacing.xl, textAlign: 'center', color: txtMuted, fontSize: typeScale.base, width: '100%' }}>No clones registered.</p>}
        {clones.map((clone) => (
          <Card key={clone.id} padding="md" style={{ width: 'calc(50% - 8px)', minWidth: 220 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontSize: typeScale.base, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>{clone.name}</p>
              <Badge label={clone.status} color={STATUS_COLORS[clone.status]} />
            </div>
            {clone.description && <p style={{ fontSize: typeScale.sm, color: txtMuted, margin: `${spacing.xs} 0 0 0`, lineHeight: 1.5 }}>{clone.description}</p>}
            <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.sm, fontSize: typeScale.xs, color: txtMuted }}>
              <span>v{clone.version}</span><span>{clone.screenCount} screens</span><span>{clone.featureCount} features</span>
            </div>
            <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.sm }}>
              <button onClick={() => setEditing({ ...clone })} style={{ fontSize: typeScale.sm, fontWeight: fontWeight.semibold, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => onDelete(clone.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Trash2 size={14} style={{ color: txtMuted }} /></button>
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <div style={{ background: 'rgba(0,0,0,0.7)', border: `2px solid ${accent}`, borderRadius: borderRadius.xl, padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} style={{ background: 'rgba(0,13,26,0.8)', border: `1px solid ${hairline}`, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typeScale.base, color: txtHeadline, outline: 'none', width: '100%' }} />
          <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} placeholder="Description..." style={{ background: 'rgba(0,13,26,0.8)', border: `1px solid ${hairline}`, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typeScale.base, color: txtHeadline, outline: 'none', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: spacing.sm }}>
            {(['active', 'paused', 'shipped', 'archived'] as const).map((s) => (
              <button key={s} onClick={() => setEditing({ ...editing, status: s })} style={{ padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.md, fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: editing.status === s ? `${STATUS_COLORS[s]}22` : 'transparent', color: editing.status === s ? STATUS_COLORS[s] : txtMuted }}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button onClick={() => { onUpdate(editing); setEditing(null); }} size="sm">Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)} size="sm">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
