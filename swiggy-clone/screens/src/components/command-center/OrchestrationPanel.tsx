import type { WaveEntry } from '@/lib/command-center/types';
import { colors, typeScale, fontWeight, borderRadius, spacing, motion } from '@/lib/design-tokens';
import { Card } from '@/lib/ui/Card';

const LANE_COLORS: Record<string, string> = { pending: '#5A8EA8', in_progress: '#00C2FF', done: '#4ADE80', blocked: '#FF4444', rejected: '#6B7280' };

interface Props {
  waves: WaveEntry[];
  accent: string; accentSoft: string; txtMuted: string; txtHeadline: string; hairline: string;
}

export function OrchestrationPanel({ waves, accent, accentSoft, txtMuted, txtHeadline, hairline }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.lg, height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: typeScale.lg, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>Orchestration</h3>
        <span style={{ fontSize: typeScale.sm, color: txtMuted }}>{waves.length} waves</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {waves.length === 0 && <p style={{ padding: spacing.xl, textAlign: 'center', color: txtMuted, fontSize: typeScale.base }}>No waves tracked.</p>}
        {waves.map((wave) => (
          <Card key={wave.id} padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <p style={{ fontSize: typeScale.base, fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>{wave.name}</p>
              <span style={{ padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.full, fontSize: typeScale.xs, fontWeight: fontWeight.bold, color: accent, background: accentSoft, textTransform: 'uppercase' }}>{wave.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {wave.lanes.map((lane) => (
                <div key={lane.id} style={{ flex: 1, borderRadius: borderRadius.sm, padding: `${spacing.xs} 0`, background: `${LANE_COLORS[lane.status] ?? '#5A8EA8'}22` }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: LANE_COLORS[lane.status] ?? '#5A8EA8', margin: '0 auto' }} />
                  <p style={{ fontSize: typeScale.xs, fontWeight: fontWeight.semibold, color: LANE_COLORS[lane.status] ?? txtMuted, textAlign: 'center', margin: `${2}px 0 0 0` }}>{lane.label.slice(0, 12)}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs, marginTop: spacing.sm }}>
              {wave.lanes.map((lane) => (
                <div key={lane.id} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, fontSize: typeScale.xs }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: LANE_COLORS[lane.status] ?? '#5A8EA8', flexShrink: 0 }} />
                  <span style={{ fontWeight: fontWeight.semibold, color: txtHeadline }}>{lane.label}</span>
                  <span style={{ textTransform: 'capitalize', color: LANE_COLORS[lane.status] ?? txtMuted }}>{lane.status.replace('_', ' ')}</span>
                  {lane.summary && <span style={{ color: txtMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>— {lane.summary}</span>}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
