import type { ButtonHTMLAttributes } from 'react';
import { colors, motion, borderRadius, fontWeight, typeScale, spacing } from '@/lib/design-tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const sizeMap: Record<Size, React.CSSProperties> = {
  sm: { padding: `${spacing.sm} ${spacing.md}`, fontSize: typeScale.sm, borderRadius: borderRadius.md, minWidth: '36px', minHeight: '36px' },
  md: { padding: `${spacing.sm} ${spacing.lg}`, fontSize: typeScale.base, borderRadius: borderRadius.lg, minWidth: '44px', minHeight: '44px' },
  lg: { padding: `${spacing.md} ${spacing.xl}`, fontSize: typeScale.lg, borderRadius: borderRadius.lg, minWidth: '48px', minHeight: '48px' },
};

const variantMap: Record<Variant, React.CSSProperties> = {
  primary: { backgroundColor: colors.accentOrange, color: colors.common.black, fontWeight: fontWeight.bold },
  secondary: { backgroundColor: colors.surface.hover, color: colors.text.headline, fontWeight: fontWeight.semibold },
  ghost: { backgroundColor: 'transparent', color: colors.text.secondary, fontWeight: fontWeight.medium },
  danger: { backgroundColor: colors.semantic.error, color: colors.common.white, fontWeight: fontWeight.bold },
};

export function Button({ variant = 'primary', size = 'md', style, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        ...sizeMap[size],
        ...variantMap[variant],
        border: variant === 'secondary' ? `1px solid ${colors.glass.heavy}` : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: `all ${motion.durFast} ${motion.easeOut}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        fontFamily: 'inherit',
        lineHeight: 1,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
