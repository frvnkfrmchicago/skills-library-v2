import type { SelectHTMLAttributes } from 'react';
import { colors, borderRadius, spacing, typeScale, motion } from '@/lib/design-tokens';

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export function SelectInput({ label, options, style, ...rest }: SelectInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
      {label && (
        <label style={{ fontSize: typeScale.sm, fontWeight: 600, color: colors.text.secondary, letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <select
        style={{
          background: 'rgba(0, 13, 26, 0.5)',
          border: `1px solid ${colors.glass.heavy}`,
          borderRadius: borderRadius.lg,
          padding: `${spacing.sm} ${spacing.md}`,
          fontSize: typeScale.base,
          color: colors.text.headline,
          outline: 'none',
          minHeight: '44px',
          transition: `border-color ${motion.durFast} ${motion.easeOut}`,
          fontFamily: 'inherit',
          appearance: 'none',
          cursor: 'pointer',
          ...style,
        }}
        {...rest}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
