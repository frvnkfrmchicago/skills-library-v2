import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FeatureEntry, FeatureStatus } from '@/lib/command-center/types';
import { colors, typeScale, fontWeight, borderRadius, spacing, motion } from '@/lib/design-tokens';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';

const STATUS_COLORS: Record<FeatureStatus, string> = { planned: '#5A8EA8', in_build: '#00C2FF', built: '#33D6FF', tested: '#A78BFA', shipped: '#4ADE80' };

interface Props {
  features: FeatureEntry[];
  clones: Array<{ id: string; name: string }>;
  onAdd: (f: FeatureEntry) => void;
  onUpdate: (f: FeatureEntry) => void;
  onDelete: (id: string) => void;
  onSetStatus: (id: string, status: FeatureStatus) => void;
  accent: string; accentSoft: string; txtMuted: string; txtHeadline: string; hairline: string;
}

export function FeatureTracker({ features, clones, onAdd, onUpdate, onDelete, onSetStatus, accent, accentSoft, txtMuted, txtHeadline, hairline }: Props) {
  const [quickTitle, setQuickTitle] = useState('');
  const [cloneFilter, setCloneFilter] = useState<string>('all');

  const filtered = cloneFilter === 'all' ? features : features.filter((f) => f.cloneId === cloneFilter);

  const addQuick = () => {
    if (!quickTitle.trim()) return;
    const cloneId = cloneFilter !== 'all' ? cloneFilter : (clones[0]?.id ?? '');
    onAdd({ id: `feat-${Date.now().toString(36)}`, title: quickTitle.trim(), description: '', status: 'planned', cloneId, screenPaths: [], acceptance: [], priority: 'medium', noteIds: [], taskIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    setQuickTitle('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.lg, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: typeScale.lg, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>Features / Screens</h3>
        <span style={{ fontSize: typeScale.sm, color: txtMuted }}>{features.length} tracked</span>
      </div>

      <div style={{ display: 'flex', gap: spacing.sm }}>
        <select value={cloneFilter} onChange={(e) => setCloneFilter(e.target.value)}
          style={{ background: 'rgba(0,13,26,0.5)', border: `1px solid ${hairline}`, borderRadius: borderRadius.lg, padding: `${spacing.sm} ${spacing.md}`, fontSize: typeScale.sm, color: txtHeadline, outline: 'none', minHeight: 44 }}>
          <option value="all">All clones</option>
          {clones.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addQuick()}
          placeholder="Feature name..." style={{ flex: 1, background: 'rgba(0,13,26,0.5)', border: `1px solid ${hairline}`, borderRadius: borderRadius.lg, padding: `${spacing.sm} ${spacing.md}`, fontSize: typeScale.base, color: txtHeadline, outline: 'none', minHeight: 44 }}
        />
        <Button onClick={addQuick} size="md"><Plus size={18} /></Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${hairline}` }}>
              <th style={{ padding: spacing.sm, textAlign: 'left', fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', color: txtMuted, letterSpacing: '0.06em' }}>Feature</th>
              <th style={{ padding: spacing.sm, textAlign: 'left', fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', color: txtMuted, letterSpacing: '0.06em' }}>Status</th>
              <th style={{ padding: spacing.sm, textAlign: 'left', fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', color: txtMuted, letterSpacing: '0.06em' }}>Screens</th>
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => {
              const clone = clones.find((c) => c.id === f.cloneId);
              return (
                <tr key={f.id} style={{ borderBottom: `1px solid ${hairline}` }}>
                  <td style={{ padding: spacing.sm, fontSize: typeScale.base, fontWeight: fontWeight.semibold, color: txtHeadline }}>
                    {f.title}{clone ? <span style={{ fontSize: typeScale.xs, color: txtMuted, marginLeft: spacing.xs }}>({clone.name})</span> : ''}
                  </td>
                  <td style={{ padding: spacing.sm }}>
                    <select value={f.status} onChange={(e) => onSetStatus(f.id, e.target.value as FeatureStatus)}
                      style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, color: STATUS_COLORS[f.status], background: `${STATUS_COLORS[f.status]}15`, border: 'none', borderRadius: borderRadius.md, padding: `${spacing.xs} ${spacing.sm}`, cursor: 'pointer' }}>
                      {(['planned', 'in_build', 'built', 'tested', 'shipped'] as const).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: spacing.sm, fontSize: typeScale.sm, color: txtMuted }}>{f.screenPaths.length || '-'}</td>
                  <td style={{ padding: spacing.sm }}><button onClick={() => onDelete(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Trash2 size={14} style={{ color: txtMuted }} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ padding: spacing.xl, textAlign: 'center', color: txtMuted, fontSize: typeScale.base }}>No features tracked yet.</p>}
      </div>
    </div>
  );
}
