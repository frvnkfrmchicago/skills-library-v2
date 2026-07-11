import { colors, borderRadius, spacing, typeScale, motion } from '@/lib/design-tokens';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
}

export function ProgressBar({ value, max = 100, label, showPercent = true, color }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || colors.accentOrange;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
      {(label || showPercent) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && <span style={{ fontSize: typeScale.sm, color: colors.text.secondary, fontWeight: 600 }}>{label}</span>}
          {showPercent && <span style={{ fontSize: typeScale.sm, color: colors.text.muted, fontWeight: 700 }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{
        height: 8,
        borderRadius: borderRadius.full,
        background: 'rgba(0, 13, 26, 0.5)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: borderRadius.full,
          background: `linear-gradient(90deg, ${barColor}, ${colors.navOrange})`,
          transition: `width ${motion.durNormal} ${motion.easeOut}`,
        }} />
      </div>
    </div>
  );
}
