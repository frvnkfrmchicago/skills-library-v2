/* GlowCard.tsx — the elevated 2026 card surface.
 *
 * AP-STUDYHALL-REBUILD-2026 · Lane 1 (Design Foundation)
 *
 * Why this exists, in plain words:
 *   The old cards were flat dark fills and read as dead. This card has real
 *   depth: a glass surface (slightly see-through with a blur behind it), a
 *   border painted as a gradient (the mask trick), a layered shadow so it
 *   sits above the page, and on hover it lifts a few pixels while its border
 *   brightens and a soft coloured glow appears in its accent colour.
 *
 * How to use it:
 *
 *     <GlowCard accent="ocean">
 *       <h3>Streak</h3>
 *       <p>7 days</p>
 *     </GlowCard>
 *
 *   Pick the accent to match the content (coral, ocean, violet, gold). The
 *   accent drives the gradient border and the hover glow colour. Use `as` to
 *   change the element (for example as="a" for a link card, or as={Link}).
 *
 * Motion:
 *   Hover lift, border brighten, and glow are driven by framer-motion so the
 *   lift uses a spring (it settles naturally rather than snapping). The whole
 *   motion is transform/opacity/filter only, so it stays on the GPU.
 *
 * Accessibility:
 *   Under prefers-reduced-motion: reduce the lift is removed (the hover state
 *   still brightens the border and glow, just without the movement), matching
 *   the rest of the 2026 layer. The card carries no implicit role; if you make
 *   it interactive with `as`, give it the right semantics (href, button, etc.).
 *
 * Theming:
 *   All colour comes from --cm-* tokens in tokens.css, so one token edit
 *   re-themes every card. The CSS carries palette fallbacks so a GlowCard
 *   still renders correctly outside the .community / .studyhall-scope block.
 */

import { forwardRef, useMemo } from 'react';
import type { ElementType, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import './GlowCard.css';

export type GlowAccent = 'coral' | 'ocean' | 'violet' | 'gold';

export interface GlowCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  /** Accent for the gradient border and hover glow. Defaults to 'ocean'. */
  accent?: GlowAccent;
  /** Element or component to render as. Defaults to a div. */
  as?: ElementType;
  /** Extra class names merged onto the card. */
  className?: string;
  /** Card content. */
  children?: ReactNode;
}

/**
 * GlowCard is the elevated card primitive: glass surface, gradient border,
 * layered shadow, and a spring hover lift with a coloured glow.
 */
export const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(function GlowCard(
  { accent = 'ocean', as, className = '', children, ...rest },
  ref,
) {
  const reduceMotion = useReducedMotion();

  // framer-motion can render any element through motion.create, so a caller
  // can pass `as="a"` or `as={Link}` and still get the spring hover. We
  // memoise the created component per `as` value so it stays the same identity
  // across renders (a fresh component each render would remount the card).
  const MotionTag = useMemo(
    () => (as ? (motion.create(as) as typeof motion.div) : motion.div),
    [as],
  );

  const classes = ['glow-card', `glow-card--${accent}`, className]
    .filter(Boolean)
    .join(' ');

  // The lift is the only thing reduced-motion strips. The border/glow still
  // respond on hover via the data-hover-driven CSS, so the card stays clearly
  // interactive without any movement.
  const hover = reduceMotion ? undefined : { y: -4 };
  const transition = { type: 'spring' as const, stiffness: 420, damping: 30, mass: 0.7 };

  return (
    <MotionTag
      ref={ref}
      className={classes}
      whileHover={hover}
      transition={transition}
      {...rest}
    >
      {/* The gradient border ring. It is painted behind the content and masked
          to a thin frame in CSS, then brightens on hover. */}
      <span className="glow-card__border" aria-hidden="true" />
      <div className="glow-card__body">{children}</div>
    </MotionTag>
  );
});

export default GlowCard;
