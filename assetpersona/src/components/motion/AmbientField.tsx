/* AmbientField.tsx — a calm animated atmosphere behind study-hall content.
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 1 (Ambient Motion System)
 *
 * Why this exists, in plain words:
 *   The study hall should feel like a quiet library at night, not a flat box.
 *   This component paints a soft backdrop: a faint glow that breathes and a
 *   handful of slow-drifting motes (small specks of light, like dust in a
 *   sunbeam). It sits behind the real content and never gets in the way.
 *
 * How to use it:
 *   Drop <AmbientField /> as the first child of a positioned container (one
 *   with position: relative). It fills the container, stays behind content,
 *   and ignores clicks. Choose how many motes with density and the color with
 *   tone. All three tones map to community tokens, so they match the theme.
 *
 * Accessibility and performance:
 *   - The whole layer is aria-hidden, so screen readers skip it. It is pure
 *     decoration.
 *   - pointer-events are off (set in AmbientField.css), so it never blocks a
 *     button or link underneath.
 *   - Only transform and opacity animate, so the layer stays on the GPU and
 *     never re-flows the page.
 *   - AmbientField.css stops all motion under prefers-reduced-motion: reduce.
 *
 * Note on positions:
 *   Mote placement is a fixed, hand-picked layout, not random data. A steady
 *   layout means the backdrop looks the same every render and the motes spread
 *   evenly instead of clumping.
 */

import type { CSSProperties } from 'react';
import './AmbientField.css';

export type AmbientFieldDensity = 'low' | 'med';
export type AmbientFieldTone = 'teal' | 'coral' | 'violet';

export interface AmbientFieldProps {
  /** How many motes to show. 'low' is quietest. Defaults to 'low'. */
  density?: AmbientFieldDensity;
  /** Mote and glow color, mapped to community tokens. Defaults to 'teal'. */
  tone?: AmbientFieldTone;
  /** Extra class names to merge onto the layer. */
  className?: string;
}

/* One mote's fixed placement and timing. left/top are percentages of the
 * container, size is in pixels, duration and delay are in seconds. The values
 * are spread out and the durations differ so the motes never move in lockstep. */
interface Mote {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

/* A steady set of mote placements. 'low' uses the first five; 'med' uses all
 * nine. Durations sit in the calm 7 to 11 second range. */
const MOTES: Mote[] = [
  { left: 12, top: 28, size: 6, duration: 9, delay: 0 },
  { left: 78, top: 18, size: 4, duration: 11, delay: 1.4 },
  { left: 44, top: 62, size: 7, duration: 8, delay: 0.7 },
  { left: 88, top: 70, size: 5, duration: 10, delay: 2.1 },
  { left: 24, top: 82, size: 4, duration: 9.5, delay: 1 },
  { left: 60, top: 34, size: 5, duration: 8.5, delay: 2.6 },
  { left: 34, top: 14, size: 4, duration: 10.5, delay: 0.3 },
  { left: 70, top: 52, size: 6, duration: 9, delay: 1.8 },
  { left: 6, top: 56, size: 5, duration: 11, delay: 3 },
];

/* Each tone maps to a community token. We keep the token reference here so the
 * backdrop re-themes with the rest of the study hall and never hardcodes hex. */
const TONE_TOKEN: Record<AmbientFieldTone, string> = {
  teal: 'var(--cm-accent)',
  coral: 'var(--cm-salmon)',
  violet: 'var(--cm-violet)',
};

/**
 * AmbientField renders the calm, slow-moving backdrop for a study-hall surface.
 * Place it inside a position: relative container as the first child.
 */
export function AmbientField({
  density = 'low',
  tone = 'teal',
  className = '',
}: AmbientFieldProps) {
  const motes = density === 'med' ? MOTES : MOTES.slice(0, 5);
  const toneStyle = { ['--field-tone' as string]: TONE_TOKEN[tone] } as CSSProperties;

  return (
    <div
      className={`ambient-field ${className}`.trim()}
      style={toneStyle}
      aria-hidden="true"
    >
      <span className="ambient-field__glow" />
      {motes.map((mote, i) => (
        <span
          key={i}
          className="ambient-field__mote"
          style={{
            left: `${mote.left}%`,
            top: `${mote.top}%`,
            width: mote.size,
            height: mote.size,
            animationDuration: `${mote.duration}s`,
            animationDelay: `${mote.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default AmbientField;
