import { colors, typeScale, fontWeight, borderRadius, spacing, fontFamily, typeScale as ts } from '@/lib/design-tokens';
import { CopyButton } from '@/lib/ui/CopyButton';
import { Card } from '@/lib/ui/Card';

const COLOR_ROWS = [
  { label: 'Accent Orange', hex: colors.accentOrange },
  { label: 'Electric Cyan', hex: colors.electricCyan },
  { label: 'Deep Navy', hex: colors.deepNavy },
  { label: 'Surface Canvas', hex: colors.surface.canvas },
  { label: 'Surface Panel', hex: colors.surface.panel },
  { label: 'Surface Elevated', hex: colors.surface.elevated },
  { label: 'Text Headline', hex: colors.text.headline },
  { label: 'Text Primary', hex: colors.text.primary },
  { label: 'Text Secondary', hex: colors.text.secondary },
  { label: 'Text Muted', hex: colors.text.muted },
  { label: 'Success', hex: colors.semantic.success },
  { label: 'Warning', hex: colors.semantic.warning },
  { label: 'Error', hex: colors.semantic.error },
  { label: 'Info', hex: colors.semantic.info },
];

const FONT_ROWS = [
  { label: 'Heading', family: fontFamily.heading, weights: [600, 700, 800] },
  { label: 'Body', family: fontFamily.body, weights: [400, 500, 600] },
  { label: 'Mono', family: fontFamily.mono, weights: [400, 600] },
];

const SIZE_ROWS = [
  { token: 'xs', css: ts.xs, px: '12px', usage: 'Tiny labels' },
  { token: 'sm', css: ts.sm, px: '14px', usage: 'Secondary text' },
  { token: 'base', css: ts.base, px: '16px', usage: 'Body (minimum)' },
  { token: 'lg', css: ts.lg, px: '18px', usage: 'Card titles' },
  { token: 'xl', css: ts.xl, px: '20px', usage: 'Section headers' },
  { token: '2xl', css: ts['2xl'], px: '24px', usage: 'Page subtitles' },
  { token: '3xl', css: ts['3xl'], px: '30px', usage: 'Page titles' },
];

export function DesignSystemPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl, padding: spacing.lg, height: '100%', overflowY: 'auto' }}>
      <div>
        <h3 style={{ fontSize: typeScale.xl, fontWeight: fontWeight.bold, color: colors.text.headline, marginBottom: spacing.sm }}>Design System</h3>
        <p style={{ fontSize: typeScale.base, color: colors.text.muted, margin: 0 }}>All tokens backing this tool. Click any value to copy.</p>
      </div>

      {/* Color Palette */}
      <Card padding="lg">
        <h4 style={{ fontSize: typeScale.lg, fontWeight: fontWeight.bold, color: colors.text.headline, marginBottom: spacing.md }}>Color Palette</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: spacing.md }}>
          {COLOR_ROWS.map((c) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: borderRadius.lg, background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ width: 36, height: 36, borderRadius: borderRadius.md, backgroundColor: c.hex, border: `1px solid rgba(255,255,255,0.1)`, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: typeScale.sm, fontWeight: fontWeight.semibold, color: colors.text.headline, margin: 0 }}>{c.label}</p>
                <CopyButton text={c.hex} label={c.hex} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Typography Scale */}
      <Card padding="lg">
        <h4 style={{ fontSize: typeScale.lg, fontWeight: fontWeight.bold, color: colors.text.headline, marginBottom: spacing.md }}>Typography Scale</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: typeScale.sm }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.glass.heavy}` }}>
              <th style={{ padding: spacing.sm, textAlign: 'left', color: colors.text.muted, fontWeight: fontWeight.semibold }}>Token</th>
              <th style={{ padding: spacing.sm, textAlign: 'left', color: colors.text.muted, fontWeight: fontWeight.semibold }}>Size</th>
              <th style={{ padding: spacing.sm, textAlign: 'left', color: colors.text.muted, fontWeight: fontWeight.semibold }}>Preview</th>
              <th style={{ padding: spacing.sm, textAlign: 'left', color: colors.text.muted, fontWeight: fontWeight.semibold }}>Usage</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_ROWS.map((s) => (
              <tr key={s.token} style={{ borderBottom: `1px solid ${colors.glass.heavy}` }}>
                <td style={{ padding: spacing.sm, color: colors.accentOrange, fontWeight: fontWeight.semibold }}>{s.token}</td>
                <td style={{ padding: spacing.sm, color: colors.text.muted }}>{s.px}</td>
                <td style={{ padding: spacing.sm, fontSize: s.css, color: colors.text.headline, fontWeight: fontWeight.semibold }}>Aa</td>
                <td style={{ padding: spacing.sm, color: colors.text.muted }}>{s.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Font Families */}
      <Card padding="lg">
        <h4 style={{ fontSize: typeScale.lg, fontWeight: fontWeight.bold, color: colors.text.headline, marginBottom: spacing.md }}>Font Families</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {FONT_ROWS.map((f) => (
            <div key={f.label} style={{ padding: spacing.md, borderRadius: borderRadius.lg, background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
                <span style={{ fontSize: typeScale.base, fontWeight: fontWeight.bold, color: colors.text.headline }}>{f.label}</span>
                <CopyButton text={f.family} label="Copy" size="sm" />
              </div>
              <p style={{ fontFamily: f.family, fontSize: typeScale.xl, color: colors.text.primary, margin: `${spacing.xs} 0 0 0` }}>
                The quick brown fox jumps over the lazy dog
              </p>
              <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.xs }}>
                {f.weights.map((w) => (
                  <span key={w} style={{ fontFamily: f.family, fontWeight: w, fontSize: typeScale.sm, color: colors.text.muted }}>
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
