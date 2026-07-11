/**
 * SegmentedControl — anti-pill replacement for ≤5 mutually-exclusive options.
 *
 * Frank's anti-pill mandate (2026-04-27): rounded-full uppercase chips have
 * lost their meaning — they no longer signal "interactive," they just add
 * visual noise. The 2026 Linear / Apple HIG / Radix pattern is a single
 * track holding inline labels with a sliding accent slab that translates
 * to the active option. No individual borders, no uppercase, no tracking.
 *
 * Use this for: filter rows with a small option set (habitat filters,
 * sort modes, view toggles).
 *
 * For navigation tabs (Posts / Activity / About) use `<UnderlineTabs>`
 * instead — segmented controls are filters, underline tabs are nav.
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { feedColors as colors } from '@/lib/design-tokens';

export interface SegmentedOption<T extends string> {
  /** Stable key — used as React key + selection compare. */
  value: T;
  /** Visible text. Keep ≤2 words; segmented controls are scannable, not verbose. */
  label: string;
  /** Optional icon to lead the label (16px sweet spot). */
  icon?: ReactNode;
  /** Optional tooltip / aria-label override. Defaults to `label`. */
  ariaLabel?: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  /** Single accent color used by the sliding slab. Defaults to brand mint. */
  accent?: string;
  /** When true, fills its parent width; default is intrinsic content width. */
  fullWidth?: boolean;
  /** Optional aria-label for the wrapping group. */
  ariaLabel?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accent = colors.brandGreen,
  fullWidth = false,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const reducedMotion = useReducedMotion();
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={[
        'relative inline-flex p-0.5 rounded-lg border',
        fullWidth ? 'w-full' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={opt.ariaLabel ?? opt.label}
            onClick={() => onChange(opt.value)}
            className={[
              'relative inline-flex items-center justify-center gap-1.5',
              'px-3 py-1.5 text-[13px] font-medium cursor-pointer',
              'rounded-md transition-colors',
              fullWidth ? 'flex-1' : '',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
              // 44px touch via min-h on the inner button (≥ Apple HIG / WCAG AA).
              'min-h-[44px] sm:min-h-[36px]',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              color: isActive ? colors.text.primary : colors.text.secondary,
              ['--tw-ring-color' as string]: accent,
            }}
          >
            {/* Sliding accent slab — only one is rendered at a time, identified
                by `layoutId` so framer animates it across positions. */}
            {isActive ? (
              <motion.span
                layoutId="segmented-active"
                className="absolute inset-0 rounded-md"
                style={{
                  background: `${accent}1f`,
                  border: `1px solid ${accent}55`,
                  boxShadow: `0 0 0 1px ${accent}10 inset`,
                }}
                transition={
                  reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 32 }
                }
                aria-hidden
              />
            ) : null}
            {opt.icon ? (
              <span className="relative z-[1] inline-flex" aria-hidden>
                {opt.icon}
              </span>
            ) : null}
            <span className="relative z-[1]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
