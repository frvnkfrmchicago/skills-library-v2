/**
 * UnderlineTabs — anti-pill replacement for navigation tabs.
 *
 * Where `<SegmentedControl>` is for FILTERS (mutually-exclusive options
 * inside one view), UnderlineTabs are for NAVIGATION (switching between
 * panels of content). Both replace the rounded-full uppercase chip pattern.
 *
 * Visual: plain text at body size (NOT uppercase, no tracking-widest), with
 * a 2-px accent underline that slides to the active tab. Habitat / role
 * accent color is preserved through the underline + active-text color so
 * brand identity isn't lost — we just stop wrapping every label in a chip.
 *
 * Apple HIG, Radix, Linear, Vercel all converged on this pattern by 2026.
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { feedColors as colors } from '@/lib/design-tokens';

export interface UnderlineTab<T extends string> {
  value: T;
  label: string;
  /** Optional leading icon (14-16 px sweet spot). */
  icon?: ReactNode;
  /** Numeric badge rendered to the right of the label (e.g. unread count). */
  count?: number;
  /** Optional aria-label override; defaults to `label`. */
  ariaLabel?: string;
}

interface UnderlineTabsProps<T extends string> {
  tabs: UnderlineTab<T>[];
  value: T;
  onChange: (next: T) => void;
  /** Accent color for the active label + sliding underline. */
  accent?: string;
  /** Optional aria-label for the wrapping tablist. */
  ariaLabel?: string;
  /** When true, distributes tabs across the full container width. */
  fullWidth?: boolean;
  className?: string;
}

export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  accent = colors.brandGreen,
  ariaLabel,
  fullWidth = false,
  className,
}: UnderlineTabsProps<T>) {
  const reducedMotion = useReducedMotion();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={['relative inline-flex border-b', fullWidth ? 'w-full' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={tab.ariaLabel ?? tab.label}
            onClick={() => onChange(tab.value)}
            className={[
              'relative inline-flex items-center justify-center gap-1.5',
              'px-4 py-3 text-sm font-semibold cursor-pointer',
              'transition-colors',
              fullWidth ? 'flex-1' : '',
              // 44px touch (Apple HIG / WCAG AA).
              'min-h-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent rounded-sm',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              color: isActive ? accent : colors.text.secondary,
              ['--tw-ring-color' as string]: accent,
            }}
          >
            {tab.icon ? (
              <span className="inline-flex" aria-hidden>
                {tab.icon}
              </span>
            ) : null}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && tab.count > 0 ? (
              <span
                className="ml-1 rounded-full px-1.5 text-[11px] font-semibold tabular-nums"
                style={{
                  background: `${accent}22`,
                  color: accent,
                  minWidth: 18,
                  textAlign: 'center',
                }}
              >
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            ) : null}
            {/* Sliding accent underline. layoutId animates it between tabs. */}
            {isActive ? (
              <motion.span
                layoutId="underline-tabs-indicator"
                className="absolute inset-x-0 -bottom-px h-[2px]"
                style={{ background: accent }}
                transition={
                  reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 32 }
                }
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
