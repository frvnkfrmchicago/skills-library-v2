import type { HTMLAttributes } from 'react';
import { colors, borderRadius, typeScale, fontWeight, spacing } from '@/lib/design-tokens';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'custom';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: string;
  label: string;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.surface.hover, text: colors.text.secondary },
  success: { bg: `${colors.semantic.success}22`, text: colors.semantic.success },
  warning: { bg: `${colors.semantic.warning}22`, text: colors.semantic.warning },
  error: { bg: `${colors.semantic.error}22`, text: colors.semantic.error },
  info: { bg: `${colors.semantic.info}22`, text: colors.semantic.info },
  custom: { bg: `${colors.accentOrange}22`, text: colors.accentOrange },
};

export function Badge({ variant = 'default', color, label, style, ...rest }: BadgeProps) {
  const v = variantColors[variant];
  const bg = color ? `${color}22` : v.bg;
  const fg = color || v.text;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.xs,
        padding: `${spacing.xs} ${spacing.sm}`,
        borderRadius: borderRadius.full,
        backgroundColor: bg,
        color: fg,
        fontSize: typeScale.xs,
        fontWeight: fontWeight.bold,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        lineHeight: 1,
        ...style,
      }}
      {...rest}
    >
      {label}
    </span>
  );
}
