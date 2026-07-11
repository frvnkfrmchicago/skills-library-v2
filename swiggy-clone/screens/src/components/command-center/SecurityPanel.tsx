import { useState } from 'react';
import { Shield, FileText, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import type { ComplianceItem, ComplianceStatus, ComplianceCategory, LegalDocument } from '@/lib/command-center/types';
import { colors, typeScale, fontWeight, borderRadius, spacing, motion } from '@/lib/design-tokens';
import { Card } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { ProgressBar } from '@/lib/ui/ProgressBar';

const STATUS_ICONS: Record<ComplianceStatus, typeof CheckCircle2> = { pass: CheckCircle2, warning: AlertTriangle, fail: XCircle, not_checked: HelpCircle };
const STATUS_COLORS: Record<ComplianceStatus, string> = { pass: '#4ADE80', warning: '#FFBE0B', fail: '#FF4444', not_checked: '#5A8EA8' };
const CAT_ICONS: Record<ComplianceCategory, typeof Shield> = { security: Shield, legal: FileText, privacy: Shield, terms: FileText, accessibility: Shield };

interface Props {
  items: ComplianceItem[];
  readiness: { pass: number; total: number; pct: number };
  legal: LegalDocument[];
  onUpdateItem: (item: ComplianceItem) => void;
  onSaveLegal: (doc: LegalDocument) => void;
  accent: string; accentSoft: string; txtMuted: string; txtHeadline: string; hairline: string;
}

export function SecurityPanel({ items, readiness, legal, onUpdateItem, onSaveLegal, accent, accentSoft, txtMuted, txtHeadline, hairline }: Props) {
  const [tab, setTab] = useState<'compliance' | 'legal'>('compliance');
  const [editingLegal, setEditingLegal] = useState<LegalDocument | null>(null);

  const cycleStatus = (item: ComplianceItem) => {
    const order: ComplianceStatus[] = ['not_checked', 'pass', 'warning', 'fail'];
    const next = order[(order.indexOf(item.status) + 1) % order.length];
    onUpdateItem({ ...item, status: next, lastCheckedAt: new Date().toISOString() });
  };

  const categories: ComplianceCategory[] = ['security', 'legal', 'privacy', 'terms', 'accessibility'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.lg, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: typeScale.lg, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>Security & Compliance</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <span style={{ fontSize: typeScale.xl, fontWeight: fontWeight.bold, color: readiness.pct >= 80 ? '#4ADE80' : readiness.pct >= 50 ? '#FFBE0B' : '#FF4444' }}>{readiness.pct}%</span>
          <span style={{ fontSize: typeScale.sm, color: txtMuted }}>{readiness.pass}/{readiness.total}</span>
        </div>
      </div>

      <ProgressBar value={readiness.pass} max={readiness.total} />

      <div style={{ display: 'flex', gap: spacing.xs }}>
        {(['compliance', 'legal'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: `${spacing.sm} ${spacing.md}`, borderRadius: borderRadius.md, fontSize: typeScale.sm, fontWeight: fontWeight.semibold, textTransform: 'capitalize', border: 'none', cursor: 'pointer', background: tab === t ? accentSoft : 'transparent', color: tab === t ? accent : txtMuted }}>{t}</button>
        ))}
      </div>

      {tab === 'compliance' ? (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {categories.map((cat) => {
            const catItems = items.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;
            const Icon = CAT_ICONS[cat];
            return (
              <div key={cat}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                  <Icon size={16} style={{ color: accent }} />
                  <p style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.06em', color: txtMuted, margin: 0 }}>{cat}</p>
                </div>
                {catItems.map((item) => {
                  const SIcon = STATUS_ICONS[item.status];
                  return (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: borderRadius.lg, border: `1px solid ${hairline}`, marginBottom: spacing.xs }}>
                      <button onClick={() => cycleStatus(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}><SIcon size={20} style={{ color: STATUS_COLORS[item.status] }} /></button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: typeScale.sm, fontWeight: fontWeight.semibold, color: txtHeadline, margin: 0 }}>{item.title}</p>
                        <p style={{ fontSize: typeScale.xs, color: txtMuted, margin: `${2}px 0 0 0` }}>{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          {legal.map((doc) => (
            <Card key={doc.id} padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: typeScale.base, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>{doc.title}</p>
                <span style={{ fontSize: typeScale.xs, color: txtMuted }}>v{doc.version}</span>
              </div>
              <button onClick={() => setEditingLegal({ ...doc })} style={{ fontSize: typeScale.sm, fontWeight: fontWeight.semibold, color: accent, background: 'none', border: 'none', cursor: 'pointer', marginTop: spacing.xs }}>Edit content</button>
            </Card>
          ))}
          {editingLegal && (
            <div style={{ background: 'rgba(0,0,0,0.7)', border: `2px solid ${accent}`, borderRadius: borderRadius.xl, padding: spacing.lg, display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <p style={{ fontSize: typeScale.base, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>{editingLegal.title}</p>
              <textarea value={editingLegal.content} onChange={(e) => setEditingLegal({ ...editingLegal, content: e.target.value })} rows={6} placeholder="Document content..."
                style={{ background: 'rgba(0,13,26,0.8)', border: `1px solid ${hairline}`, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typeScale.sm, color: txtHeadline, outline: 'none', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: spacing.sm }}>
                <Button onClick={() => { onSaveLegal(editingLegal); setEditingLegal(null); }} size="sm">Save</Button>
                <Button variant="ghost" onClick={() => setEditingLegal(null)} size="sm">Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
