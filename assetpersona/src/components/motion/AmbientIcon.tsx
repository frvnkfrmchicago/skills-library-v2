/* AmbientIcon.tsx — wraps any icon in calm, looping idle motion.
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 1 (Ambient Motion System)
 *
 * Why this exists, in plain words:
 *   Frank wants the study hall icons to feel alive, not frozen. This wrapper
 *   takes any icon you already use (a Phosphor icon, a lucide icon, or any
 *   element) and gives it a gentle, never-ending idle animation.
 *
 * How it picks a technique:
 *   - When active is true (the normal "always on" ambient case) the wrapper
 *     uses a CSS animation class from AmbientIcon.css. CSS handles the loop on
 *     the GPU with zero per-frame JavaScript, which is the cheapest way to run
 *     many idle icons at once.
 *   - When active is false the wrapper renders the icon in its plain still
 *     pose with no animation. A caller can flip active to start or stop the
 *     motion (for example, animate only the icon the person is hovering).
 *
 * Motion vocabulary (matches AmbientIcon.css):
 *   sway     — gentle pendulum tilt, good for a main/subject icon
 *   flicker  — soft brightness jitter, good for a small accent icon
 *   drift    — slow float that returns home, good for a particle icon
 *   breathe  — slow grow-and-fade pulse, good for a background icon
 *
 * Amplitude (how much it moves):
 *   The 2026 review asked for motion that actually reads, not micro-jitter.
 *   The amplitude prop controls how far each motion travels:
 *     'calm'    — the original quiet idle (still the default, so every
 *                 existing caller is unchanged).
 *     'lively'  — a larger, more visible version of the same motion, for an
 *                 icon that should clearly move (a hovered tile, a focal
 *                 stat, a streak flame). Same loops, bigger swing.
 *   The motion stays seamless and reduced-motion safe at either amplitude.
 *
 * Accessibility:
 *   AmbientIcon.css stops every animation under
 *   prefers-reduced-motion: reduce, so a person who asks for less motion sees
 *   the icon at rest. We never animate layout properties, only transform and
 *   opacity, so motion stays smooth and does not shift surrounding text.
 */

import type { ReactNode, CSSProperties } from 'react';
import './AmbientIcon.css';

export type AmbientMotion = 'sway' | 'flicker' | 'drift' | 'breathe';
export type AmbientAmplitude = 'calm' | 'lively';

export interface AmbientIconProps {
  /** The icon (or any element) to animate. */
  children: ReactNode;
  /** Which idle motion to play. Defaults to 'sway'. */
  motion?: AmbientMotion;
  /**
   * How far the motion travels. 'calm' is the original quiet idle and stays
   * the default so existing callers are unchanged. 'lively' plays the same
   * motion with a larger, clearly visible swing. Defaults to 'calm'.
   */
  amplitude?: AmbientAmplitude;
  /** When false, the icon rests still with no animation. Defaults to true. */
  active?: boolean;
  /**
   * Seconds of start delay. Give nearby icons different delays so they are not
   * all in lockstep (for example 0, 0.4, 0.8 across a row).
   */
  delay?: number;
  /** Optional pixel box size. Sets width and height on the wrapper. */
  size?: number;
  /** Extra class names to merge onto the wrapper. */
  className?: string;
  /** Extra inline styles to merge onto the wrapper. */
  style?: CSSProperties;
}

/**
 * AmbientIcon gives its child a looping idle animation that joins without a jump.
 * Default motion is 'sway' and it is active by default.
 */
export function AmbientIcon({
  children,
  motion = 'sway',
  amplitude = 'calm',
  active = true,
  delay = 0,
  size,
  className = '',
  style,
}: AmbientIconProps) {
  // When inactive the icon rests still. When active it plays its motion class,
  // and the amplitude class boosts the swing so 'lively' icons clearly move.
  const motionClass = active ? `ambient-icon--${motion}` : 'ambient-icon--still';
  const amplitudeClass = active && amplitude === 'lively' ? 'ambient-icon--lively' : '';

  // --ambient-delay drives the animation-delay inside AmbientIcon.css so the
  // same component can stagger many icons without bespoke CSS per icon.
  const mergedStyle: CSSProperties = {
    ...(delay ? { ['--ambient-delay' as string]: `${delay}s` } : null),
    ...(size != null ? { width: size, height: size } : null),
    ...style,
  };

  return (
    <span
      className={`ambient-icon ${motionClass} ${amplitudeClass} ${className}`.replace(/\s+/g, ' ').trim()}
      style={mergedStyle}
    >
      {children}
    </span>
  );
}

export default AmbientIcon;
