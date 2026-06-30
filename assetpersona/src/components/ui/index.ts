/* ui/index.ts — the one import point for the 2026 design primitives.
 *
 * AP-STUDYHALL-REBUILD-2026 · Lane 1 (Design Foundation)
 *
 * Every surface that adopts the 2026 look imports from this single file, so it
 * never needs to know the inner file names:
 *
 *   import { AuroraField, BentoGrid, BentoTile, GlowCard } from '../ui';
 *
 * AuroraField — the slow drifting aurora that gives a dark surface depth.
 * BentoGrid   — the responsive asymmetric bento layout.
 * BentoTile   — one cell of the bento grid (a GlowCard under the hood).
 * GlowCard    — the elevated card: glass, gradient border, spring hover lift.
 *
 * Each component pulls in its own CSS, so importing the component is all a
 * caller needs to do.
 */

export { AuroraField, default as AuroraFieldDefault } from './AuroraField';
export type { AuroraFieldProps, AuroraTone, AuroraIntensity } from './AuroraField';

export { GlowCard, default as GlowCardDefault } from './GlowCard';
export type { GlowCardProps, GlowAccent } from './GlowCard';

export { BentoGrid, BentoTile, default as BentoGridDefault } from './BentoGrid';
export type { BentoGridProps, BentoTileProps, BentoSpan } from './BentoGrid';
