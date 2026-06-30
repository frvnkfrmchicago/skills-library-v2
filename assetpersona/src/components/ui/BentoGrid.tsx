/* BentoGrid.tsx — an active asymmetric bento layout.
 *
 * AP-STUDYHALL-REBUILD-2026 · Lane 1 (Design Foundation)
 *
 * Why this exists, in plain words:
 *   Uniform card rows look flat and dull. A bento grid lays tiles out in
 *   varied sizes — some wide, some tall — so the page has rhythm and a clear
 *   focal point. This is the layout half of the 2026 look; the tiles inside
 *   use the GlowCard surface so they lift and glow on hover.
 *
 * How to use it:
 *
 *     <BentoGrid columns={4}>
 *       <BentoTile span={{ col: 2, row: 2 }} accent="ocean">...</BentoTile>
 *       <BentoTile accent="coral">...</BentoTile>
 *       <BentoTile span={{ col: 2 }} accent="violet">...</BentoTile>
 *     </BentoGrid>
 *
 *   BentoGrid is a CSS grid. `columns` sets the desktop column count (default
 *   4). It collapses to two columns on tablet and one on mobile, and every
 *   tile's span is clamped so a wide tile never overflows the narrower grid.
 *
 *   BentoTile takes a `span` ({ col?: 1|2, row?: 1|2 }) and the same `accent`
 *   as GlowCard. A tile IS a GlowCard, so it has the glass surface, gradient
 *   border, layered shadow, and spring hover lift for free.
 *
 * Accessibility and performance:
 *   The grid itself adds no motion. Tiles inherit the GlowCard hover, which is
 *   transform/opacity/filter only and reduced-motion safe. The grid uses
 *   logical column/row spans, so reordering or removing a tile just reflows.
 */

import type { CSSProperties, ReactNode } from 'react';
import { GlowCard } from './GlowCard';
import type { GlowAccent, GlowCardProps } from './GlowCard';
import './BentoGrid.css';

export interface BentoGridProps {
  /** Desktop column count. Collapses to 2 (tablet) and 1 (mobile). Defaults to 4. */
  columns?: number;
  /** Extra class names merged onto the grid. */
  className?: string;
  /** Grid tiles (normally BentoTile, but any element works). */
  children?: ReactNode;
}

export interface BentoSpan {
  /** Columns the tile spans (1 or 2). Defaults to 1. Clamped to the grid width. */
  col?: 1 | 2;
  /** Rows the tile spans (1 or 2). Defaults to 1. */
  row?: 1 | 2;
}

export interface BentoTileProps extends Omit<GlowCardProps, 'children'> {
  /** How many columns/rows the tile spans. Defaults to a single cell. */
  span?: BentoSpan;
  /** Accent for the tile's gradient border and hover glow. Defaults to 'ocean'. */
  accent?: GlowAccent;
  /** Tile content. */
  children?: ReactNode;
}

/**
 * BentoGrid is the responsive bento layout. Set columns for the desktop count;
 * it collapses on smaller screens on its own.
 */
export function BentoGrid({ columns = 4, className = '', children }: BentoGridProps) {
  // --bento-columns drives the desktop grid-template-columns in BentoGrid.css,
  // so one prop sets the column count without bespoke CSS per usage.
  const style = { ['--bento-columns' as string]: String(columns) } as CSSProperties;

  return (
    <div className={`bento-grid ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

/**
 * BentoTile is one cell of the grid. It renders a GlowCard, so it carries the
 * full elevated look, and spans the columns/rows given in `span`.
 */
export function BentoTile({
  span,
  accent = 'ocean',
  className = '',
  children,
  ...rest
}: BentoTileProps) {
  const col = span?.col ?? 1;
  const row = span?.row ?? 1;

  const classes = [
    'bento-tile',
    col === 2 ? 'bento-tile--col-2' : '',
    row === 2 ? 'bento-tile--row-2' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <GlowCard accent={accent} className={classes} {...rest}>
      {children}
    </GlowCard>
  );
}

export default BentoGrid;
