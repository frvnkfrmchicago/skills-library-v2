import { useState } from 'react';
import { colors, borderRadius, spacing, motion } from '@/lib/design-tokens';

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, label, size = 'md' }: ToggleProps) {
  const h = size === 'sm' ? 20 : 28;
  const w = h * 1.8;
  const dot = h - 8;

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, cursor: 'pointer', fontSize: '14px', color: colors.text.primary }}>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: w,
          height: h,
          borderRadius: borderRadius.full,
          border: 'none',
          backgroundColor: checked ? colors.accentOrange : colors.neutral[700],
          position: 'relative',
          cursor: 'pointer',
          transition: `background-color ${motion.durFast} ${motion.easeOut}`,
          padding: 0,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: (h - dot) / 2,
            left: checked ? w - dot - (h - dot) / 2 : (h - dot) / 2,
            width: dot,
            height: dot,
            borderRadius: borderRadius.full,
            backgroundColor: colors.common.white,
            transition: `left ${motion.durFast} ${motion.easeOut}`,
          }}
        />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}
