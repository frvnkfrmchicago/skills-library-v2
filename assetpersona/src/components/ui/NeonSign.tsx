/* NeonSign.tsx — the core neon sign renderer.
 *
 * GRASSHOPPER-SIGNS-2026-07 · Lane 1
 *
 * Renders customizable neon text with CSS text-shadow glow, animated
 * flicker/breathe/warm-up effects, and selectable backdrop surfaces.
 *
 * Usage:
 *   <NeonSign
 *     text="Be Cool"
 *     color="pink"
 *     font="Neonderthaw"
 *     backdrop="brick"
 *     animation="breathe"
 *     size="lg"
 *   />
 *
 * The component sets --neon-active-rgb as an inline CSS variable
 * so all glow composites in NeonSign.css pick up the chosen color
 * automatically. No JS shadow computation required.
 */

import { forwardRef, useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './NeonSign.css';

/* ── Color presets ── */
export type NeonColor = 'pink' | 'blue' | 'green' | 'white' | 'violet' | 'custom';
export type NeonBackdrop = 'dark' | 'brick' | 'wood' | 'concrete' | 'gradient';
export type NeonAnimation = 'static' | 'flicker' | 'breathe' | 'warm-up';
export type NeonSize = 'sm' | 'md' | 'lg' | 'xl';

const COLOR_MAP: Record<Exclude<NeonColor, 'custom'>, string> = {
  pink: '255, 0, 222',
  blue: '0, 240, 255',
  green: '57, 255, 20',
  white: '255, 228, 196',
  violet: '191, 0, 255',
};

/* Hex values for UI display (color picker defaults) */
export const COLOR_HEX: Record<Exclude<NeonColor, 'custom'>, string> = {
  pink: '#ff00de',
  blue: '#00f0ff',
  green: '#39ff14',
  white: '#ffe4c4',
  violet: '#bf00ff',
};

/* Available fonts */
export const NEON_FONTS = [
  { id: 'neonderthaw', name: 'Neon Script', family: "'Neonderthaw', cursive" },
  { id: 'pacifico', name: 'Casual', family: "'Pacifico', cursive" },
  { id: 'lobster', name: 'Bold Script', family: "'Lobster', cursive" },
  { id: 'tilt-neon', name: 'Tilt Neon', family: "'Tilt Neon', sans-serif" },
  { id: 'permanent-marker', name: 'Marker', family: "'Permanent Marker', cursive" },
  { id: 'orbitron', name: 'Sci-Fi', family: "'Orbitron', sans-serif" },
] as const;

export type NeonFontId = typeof NEON_FONTS[number]['id'];

export interface NeonSignProps {
  /** The text to display as a neon sign. */
  text: string;
  /** Preset neon color. Use 'custom' with customRgb for arbitrary colors. */
  color?: NeonColor;
  /** RGB triplet string for custom colors (e.g. "255, 100, 50"). Only used when color='custom'. */
  customRgb?: string;
  /** Font family ID from the NEON_FONTS list. */
  font?: NeonFontId;
  /** Background surface behind the sign. */
  backdrop?: NeonBackdrop;
  /** Animation mode for the glow effect. */
  animation?: NeonAnimation;
  /** Size of the text. */
  size?: NeonSize;
  /** Render in compact card mode (for feed/library thumbnails). */
  compact?: boolean;
  /** Make the sign interactive (clickable with hover lift). */
  interactive?: boolean;
  /** Extra class names. */
  className?: string;
  /** Click handler for interactive mode. */
  onClick?: () => void;
  /** Children rendered below the sign text (e.g. attribution). */
  children?: ReactNode;
}

/** Convert a hex color to an RGB triplet string. */
export function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * NeonSign renders glowing neon text with animated effects over a dark surface.
 * All glow colors are driven by CSS variables for zero-JS shadow computation.
 */
export const NeonSign = forwardRef<HTMLDivElement, NeonSignProps>(function NeonSign(
  {
    text,
    color = 'pink',
    customRgb,
    font = 'neonderthaw',
    backdrop = 'brick',
    animation = 'breathe',
    size = 'md',
    compact = false,
    interactive = false,
    className = '',
    onClick,
    children,
  },
  ref,
) {
  const reduceMotion = useReducedMotion();
  const effectiveAnimation = reduceMotion ? 'static' : animation;

  /* Resolve the active RGB triplet */
  const activeRgb = useMemo(() => {
    if (color === 'custom' && customRgb) return customRgb;
    return COLOR_MAP[color === 'custom' ? 'pink' : color];
  }, [color, customRgb]);

  /* Resolve font family */
  const fontFamily = useMemo(() => {
    const match = NEON_FONTS.find(f => f.id === font);
    return match?.family ?? NEON_FONTS[0].family;
  }, [font]);

  const containerClasses = [
    'neon-sign',
    compact && 'neon-sign--compact',
    interactive && 'neon-sign--interactive',
    className,
  ].filter(Boolean).join(' ');

  const textClasses = [
    'neon-sign__text',
    `neon-sign__text--${size}`,
    `neon-sign__text--${effectiveAnimation}`,
  ].join(' ');

  const style: CSSProperties = {
    '--neon-active-rgb': activeRgb,
  } as CSSProperties;

  const textStyle: CSSProperties = {
    fontFamily,
  };

  const Tag = interactive ? motion.div : 'div';
  const motionProps = interactive ? {
    whileHover: reduceMotion ? undefined : { y: -3 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 28 },
  } : {};

  return (
    <Tag
      ref={ref}
      className={containerClasses}
      style={style}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...motionProps}
    >
      <div className={`neon-sign__backdrop neon-sign__backdrop--${backdrop}`} aria-hidden="true" />
      <div className="neon-sign__halo" aria-hidden="true" />
      <span className={textClasses} style={textStyle}>
        {text}
      </span>
      {children}
    </Tag>
  );
});

export default NeonSign;
