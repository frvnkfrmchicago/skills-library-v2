/* ============================================================================
 * screens-theme.ts — Liquid-Glass token + class-name exports for the /screens tool
 * ----------------------------------------------------------------------------
 * Swiggy orange brand. Token values mirror screens-glass.css :root block.
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
  orange1Rgb: '26, 10, 0',
  orange2Rgb: '42, 18, 0',
  orange3Rgb: '20, 6, 0',
  accentRgb: '252, 128, 25',
  mintRgb: '252, 128, 25',

  glassFill: 'rgba(26, 10, 0, 0.12)',
  glassFillStrong: 'rgba(26, 10, 0, 0.18)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassBorderSoft: 'rgba(255, 255, 255, 0.06)',

  blur: '40px',
  blurStrong: '56px',
  saturate: '180%',
  backdrop: 'blur(40px) saturate(180%)',
  backdropStrong: 'blur(56px) saturate(180%)',

  specular: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  specularStrong: 'inset 0 1px 0 rgba(255, 255, 255, 0.16)',
  insetPress: 'inset 0 1px 3px rgba(0, 0, 0, 0.4)',

  elev1: '0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)',
  elev2: '0 2px 6px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.4)',
  elev3: '0 4px 12px rgba(0, 0, 0, 0.5), 0 16px 48px rgba(0, 0, 0, 0.5)',
  elev4: '0 8px 24px rgba(0, 0, 0, 0.6), 0 32px 80px rgba(0, 0, 0, 0.6)',

  glowMint: '0 0 24px rgba(252, 128, 25, 0.32)',
  glowMagenta: '0 0 28px rgba(252, 128, 25, 0.22)',

  nodeFill: 'linear-gradient(157deg, rgba(60, 30, 5, 0.985), rgba(40, 18, 2, 0.99))',
  nodeFillActive: 'linear-gradient(157deg, rgba(80, 40, 8, 0.99), rgba(55, 26, 4, 0.99))',
  nodeBorder: 'rgba(252, 180, 100, 0.44)',

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
  cyan: '#5ad1ff',
  azure: '#7c9cff',
  indigo: '#b08bff',
  violet: '#d68bff',
  magenta: '#f072d0',
  rose: '#ff8fa6',
  coral: '#ff9b6b',
  gold: '#f5c451',
  lime: '#bfe05a',
  leaf: '#7fdc8f',
  teal: '#4fd6c0',
  slate: '#aeb6cc',
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
