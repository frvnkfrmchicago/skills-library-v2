import type { InputHTMLAttributes } from 'react';
import { colors, borderRadius, spacing, typeScale, motion } from '@/lib/design-tokens';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function TextInput({ label, style, ...rest }: TextInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
      {label && (
        <label style={{ fontSize: typeScale.sm, fontWeight: 600, color: colors.text.secondary, letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <input
        style={{
          background: 'rgba(0, 13, 26, 0.5)',
          border: `1px solid ${colors.glass.heavy}`,
          borderRadius: borderRadius.lg,
          padding: `${spacing.sm} ${spacing.md}`,
          fontSize: typeScale.base,
          color: colors.text.headline,
          outline: 'none',
          minWidth: '44px',
          minHeight: '44px',
          transition: `border-color ${motion.durFast} ${motion.easeOut}`,
          fontFamily: 'inherit',
          ...style,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = colors.interactive.focusRing; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = colors.glass.heavy; }}
        {...rest}
      />
    </div>
  );
}
