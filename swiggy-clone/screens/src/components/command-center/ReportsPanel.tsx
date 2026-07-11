import { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import type { ReportEntry } from '@/lib/command-center/types';
import { colors, typeScale, fontWeight, borderRadius, spacing, motion } from '@/lib/design-tokens';
import { Button } from '@/lib/ui/Button';
import { Card } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';

interface Props {
  reports: ReportEntry[];
  onGenerate: (type: 'progress' | 'theme') => void;
  accent: string; accentSoft: string; txtMuted: string; txtHeadline: string; hairline: string;
}

export function ReportsPanel({ reports, onGenerate, accent, accentSoft, txtMuted, txtHeadline, hairline }: Props) {
  const [generating, setGenerating] = useState(false);

  const generate = (type: 'progress' | 'theme') => { setGenerating(true); onGenerate(type); setTimeout(() => setGenerating(false), 3000); };

  const downloadReport = (report: ReportEntry) => {
    const blob = new Blob([report.body], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${report.type}-${report.id}.md`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.lg, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: typeScale.lg, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>Reports</h3>
        <span style={{ fontSize: typeScale.sm, color: txtMuted }}>{reports.length} reports</span>
      </div>

      <div style={{ display: 'flex', gap: spacing.sm }}>
        <Button variant="secondary" onClick={() => generate('progress')} disabled={generating} size="md"><Sparkles size={16} />Progress Report</Button>
        <Button variant="secondary" onClick={() => generate('theme')} disabled={generating} size="md"><Sparkles size={16} />Theme Analysis</Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        {reports.length === 0 && <p style={{ padding: spacing.xl, textAlign: 'center', color: txtMuted, fontSize: typeScale.base }}>Generate your first report above.</p>}
        {reports.map((report) => (
          <Card key={report.id} padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: typeScale.base, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>{report.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                  <Badge label={report.type.replace('_', ' ')} color={accent} />
                  <span style={{ fontSize: typeScale.xs, color: txtMuted }}>{new Date(report.generatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => downloadReport(report)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Download size={18} style={{ color: txtMuted }} /></button>
            </div>
            <div style={{ marginTop: spacing.sm, maxHeight: 140, overflowY: 'auto', fontSize: typeScale.sm, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: txtMuted }}>
              {report.body.slice(0, 600)}{report.body.length > 600 ? '...' : ''}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
