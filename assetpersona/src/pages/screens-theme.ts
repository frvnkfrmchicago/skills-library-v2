/* ============================================================================
 * screens-theme.ts — Liquid-Glass token + class-name exports for the /screens tool
 * Adapted for Asset Persona dark neon theme.
 * ========================================================================== */

export const glass = {
  mesh: 'gh-mesh-bg',
  base: 'gh-glass',
  raised: 'gh-glass-raised',
  inset: 'gh-glass-inset',
  rise: 'gh-rise',
  hoverable: 'gh-hoverable',
  noise: 'gh-noise',
  glow: 'gh-glow-ambient',
  shelf: 'gh-shelf',
  indexDot: 'gh-index-dot',
  bentoCell: 'gh-bento-cell',
} as const;

export type GlassClass = (typeof glass)[keyof typeof glass];

export const token = {
  orange1Rgb: '2, 2, 10',
  orange2Rgb: '10, 5, 20',
  orange3Rgb: '2, 2, 10',
  accentRgb: '51, 254, 204',
  mintRgb: '51, 254, 204',

  glassFill: 'rgba(2, 2, 10, 0.35)',
  glassFillStrong: 'rgba(2, 2, 10, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassBorderSoft: 'rgba(255, 255, 255, 0.04)',

  blur: '40px',
  blurStrong: '56px',
  saturate: '180%',
  backdrop: 'blur(40px) saturate(180%)',
  backdropStrong: 'blur(56px) saturate(180%)',

  specular: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  specularStrong: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
  insetPress: 'inset 0 1px 3px rgba(0, 0, 0, 0.6)',

  elev1: '0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.4)',
  elev2: '0 2px 6px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.5)',
  elev3: '0 4px 12px rgba(0, 0, 0, 0.6), 0 16px 48px rgba(0, 0, 0, 0.6)',
  elev4: '0 8px 24px rgba(0, 0, 0, 0.7), 0 32px 80px rgba(0, 0, 0, 0.7)',

  glowMint: '0 0 24px rgba(51, 254, 204, 0.25)',
  glowMagenta: '0 0 28px rgba(51, 254, 204, 0.15)',

  nodeFill: 'linear-gradient(157deg, rgba(2, 2, 10, 0.985), rgba(10, 5, 20, 0.99))',
  nodeFillActive: 'linear-gradient(157deg, rgba(15, 8, 30, 0.99), rgba(5, 2, 12, 0.99))',
  nodeBorder: 'rgba(51, 254, 204, 0.44)',

  radiusMd: '0.5rem',
  radiusLg: '1rem',
  radiusXl: '1.5rem',

  durFast: '160ms',
  durNormal: '240ms',
  durSlow: '400ms',
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
} as const;

export const sectionPalette = {
  cyan: '#33fecc',
  azure: '#33fecc',
  indigo: '#33fecc',
  violet: '#33fecc',
  magenta: '#33fecc',
  rose: '#33fecc',
  coral: '#33fecc',
  gold: '#33fecc',
  lime: '#33fecc',
  leaf: '#33fecc',
  teal: '#33fecc',
  slate: '#33fecc',
} as const;

export type GlassToken = (typeof token)[keyof typeof token];

export const raisedGlassStyle = {
  background: token.glassFillStrong,
  backdropFilter: token.backdropStrong,
  WebkitBackdropFilter: token.backdropStrong,
  border: `1px solid ${token.glassBorder}`,
  borderRadius: token.radiusXl,
  boxShadow: `${token.elev3}, ${token.specularStrong}`,
} as const;

export const cssVar = {
  riseDelay: '--gh-rise-delay',
  noiseOpacity: '--gh-noise-opacity',
  section: '--gh-section',
  sectionWash: '--gh-section-wash',
  sectionEdge: '--gh-section-edge',
} as const;
