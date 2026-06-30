/* AuroraField.tsx — a slow kinetic aurora behind a surface.
 *
 * AP-STUDYHALL-REBUILD-2026 · Lane 1 (Design Foundation)
 *
 * Why this exists, in plain words:
 *   A flat charcoal background reads as dead. This paints a slow coral wash
 *   behind content: a few blurred radial blooms, all the same coral, that
 *   drift in place very slowly, so the charcoal base feels deep and alive
 *   instead of a flat box. One hue only — never a rainbow. It is the depth
 *   antidote for the whole 2026 layer.
 *
 * How to use it:
 *   Drop <AuroraField /> as the first child of a container that has
 *   position: relative. It fills the container, sits behind everything
 *   (z-index 0), and ignores clicks. Real content should sit at z-index 1
 *   or higher so it stays above the aurora.
 *
 *     <div style={{ position: 'relative' }}>
 *       <AuroraField intensity="rich" />
 *       <main style={{ position: 'relative', zIndex: 1 }}>...</main>
 *     </div>
 *
 * Props:
 *   tone       — kept for call sites. The field is a single coral now, so every
 *                tone resolves to the same coral wash ('coral' | 'ocean' |
 *                'violet' | 'gold' | 'aurora'); biasing a tone only fades a few
 *                blooms a touch to keep the field calm.
 *   intensity  — 'soft' (default, quiet) or 'rich' (a little more visible).
 *   className  — extra classes merged onto the layer.
 *
 * Works inside AND outside .community:
 *   The CSS carries a coral fallback, so on the marketing landing — outside the
 *   .community / .studyhall-scope token block — it still paints coral. Inside
 *   .community it picks up the --cm-* tokens and re-themes with them.
 *
 * Accessibility and performance:
 *   - aria-hidden, so screen readers skip it. Pure decoration.
 *   - pointer-events off (in CSS), so it never blocks a button or link.
 *   - Only transform and opacity animate, so it stays on the GPU and never
 *     re-flows the page.
 *   - Under prefers-reduced-motion: reduce the blooms settle to a still
 *     field (the colour stays, the drift stops).
 */

import type { CSSProperties } from 'react';
import './AuroraField.css';

export type AuroraTone = 'aurora' | 'coral' | 'ocean' | 'violet' | 'gold';
export type AuroraIntensity = 'soft' | 'rich';

export interface AuroraFieldProps {
  /** Bias the field toward one accent, or 'aurora' for the full set. Defaults to 'aurora'. */
  tone?: AuroraTone;
  /** How visible the blooms are. 'soft' is quietest. Defaults to 'soft'. */
  intensity?: AuroraIntensity;
  /** Extra class names merged onto the layer. */
  className?: string;
}

/**
 * AuroraField renders the slow drifting aurora that gives a dark surface depth.
 * Place it inside a position: relative container as the first child.
 */
export function AuroraField({
  tone = 'aurora',
  intensity = 'soft',
  className = '',
}: AuroraFieldProps) {
  const classes = [
    'aurora-field',
    `aurora-field--${tone}`,
    `aurora-field--${intensity}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Each bloom carries a fixed drift phase so the four blooms never move in
  // lockstep. The phase shifts the start of the same loop, which keeps the
  // field calm rather than pulsing all at once.
  return (
    <div className={classes} aria-hidden="true">
      <span className="aurora-field__bloom aurora-field__bloom--1" style={phase(0)} />
      <span className="aurora-field__bloom aurora-field__bloom--2" style={phase(-4)} />
      <span className="aurora-field__bloom aurora-field__bloom--3" style={phase(-8)} />
      <span className="aurora-field__bloom aurora-field__bloom--4" style={phase(-12)} />
    </div>
  );
}

/* Sets the per-bloom animation delay so each bloom enters its drift loop at a
 * different point. Negative delay means the loop is already mid-way at mount,
 * so nothing fades in from a cold start. */
function phase(seconds: number): CSSProperties {
  return { ['--aurora-delay' as string]: `${seconds}s` };
}

export default AuroraField;
