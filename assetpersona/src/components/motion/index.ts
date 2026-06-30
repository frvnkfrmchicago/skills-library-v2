/* motion/index.ts — the one import point for the ambient motion layer.
 *
 * AP-STUDYHALL-REBUILD-2026-06 · Lane 1 (Ambient Motion System)
 *
 * Other parts of the study hall (the toolbar, the Library, the Momentum strip)
 * import from this single file so they never need to know the inner file names:
 *
 *   import { AmbientIcon, AmbientField } from '../motion';
 *
 * AmbientIcon  — wraps any icon in a calm looping idle animation.
 * AmbientField — paints the slow-moving atmosphere behind content.
 *
 * The matching CSS is pulled in automatically by each component, so importing
 * the component is all a caller needs to do.
 */

export { AmbientIcon, default as AmbientIconDefault } from './AmbientIcon';
export type { AmbientIconProps, AmbientMotion } from './AmbientIcon';

export { AmbientField, default as AmbientFieldDefault } from './AmbientField';
export type {
  AmbientFieldProps,
  AmbientFieldDensity,
  AmbientFieldTone,
} from './AmbientField';
