import type { HTMLAttributes, ReactNode } from 'react';
import { colors, borderRadius, spacing, typeScale, motion } from '@/lib/design-tokens';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const padMap = { sm: spacing.md, md: spacing.lg, lg: spacing.xl };

export function Card({ children, hoverable = false, padding = 'md', style, ...rest }: CardProps) {
  return (
    <div
      style={{
        background: 'rgba(0, 13, 26, 0.4)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: `1px solid ${colors.glass.heavy}`,
        borderRadius: borderRadius.xl,
        padding: padMap[padding],
        transition: `all ${motion.durNormal} ${motion.easeOut}`,
        ...(hoverable ? { cursor: 'pointer' } : {}),
        fontSize: typeScale.base,
        color: colors.text.headline,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
