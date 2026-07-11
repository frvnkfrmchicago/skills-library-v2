import { Smartphone, Monitor, Tablet } from 'lucide-react';
import { colors, borderRadius, spacing, typeScale, fontWeight, motion } from '@/lib/design-tokens';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

const DEVICES: { id: DeviceType; label: string; width: number; height: number; Icon: typeof Smartphone }[] = [
  { id: 'mobile', label: 'Mobile', width: 375, height: 812, Icon: Smartphone },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024, Icon: Tablet },
  { id: 'desktop', label: 'Desktop', width: 1280, height: 900, Icon: Monitor },
];

interface Props {
  value: DeviceType;
  onChange: (device: DeviceType) => void;
}

export function DeviceFrameToggle({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'center' }}>
      {DEVICES.map((d) => {
        const active = value === d.id;
        const Icon = d.Icon;
        return (
          <button
            key={d.id}
            onClick={() => onChange(d.id)}
            title={`${d.label} (${d.width}x${d.height})`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.md,
              fontSize: typeScale.xs,
              fontWeight: active ? fontWeight.bold : fontWeight.medium,
              color: active ? colors.accentOrange : colors.text.muted,
              background: active ? `${colors.accentOrange}22` : 'transparent',
              border: `1px solid ${active ? colors.accentOrange : 'transparent'}`,
              cursor: 'pointer',
              transition: `all ${motion.durFast} ${motion.easeOut}`,
              minWidth: 44,
              minHeight: 36,
            }}
          >
            <Icon size={14} />
            <span>{d.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Get device dimensions by type. */
export function getDeviceDimensions(device: DeviceType): { width: number; height: number } {
  const d = DEVICES.find((d) => d.id === device);
  return d ? { width: d.width, height: d.height } : { width: 375, height: 812 };
}

/** CSS for a device preview frame. */
export function deviceFrameStyle(device: DeviceType): React.CSSProperties {
  const { width, height } = getDeviceDimensions(device);
  if (device === 'desktop') return { width: '100%', height: '100%' };
  return {
    width,
    maxWidth: '100%',
    height: device === 'mobile' ? Math.min(height, 700) : Math.min(height, 800),
    maxHeight: '100%',
    borderRadius: device === 'mobile' ? 40 : 20,
    border: `3px solid ${colors.neutral[800]}`,
    overflow: 'hidden',
    boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)`,
    position: 'relative' as const,
    margin: '0 auto',
  };
}
