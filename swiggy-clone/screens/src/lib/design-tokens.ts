/** Design tokens — Swiggy orange brand. Token-first architecture.
 *  Reference: experience-designing skill, typography-enforcing skill.
 */
export const colors = {
  brandGreen: '#FC8019',
  electricCyan: '#FFB366',
  platformPurple: '#3D1F00',
  orange1: '#1A0A00',
  orange2: '#2A1200',
  orange3: '#140600',
  accentOrange: '#FC8019',
  navOrange: '#FFB366',
  deepNavy: '#0A0A0C',

  text: {
    headline: '#e7f3ff',
    primary: '#9bd1ed',
    secondary: '#D4A574',
    muted: '#9B7B5A',
    inverse: '#0A0A0C',
  },

  chart: {
    green: '#FC8019',
    orange: '#FFB366',
    deep: '#E57010',
    gold: '#FFD700',
    red: '#FF4444',
  },

  surface: {
    canvas: '#0C0C0E',
    panel: '#1A1008',
    panelSoft: '#241810',
    void: '#0A0A0C',
    midnight: '#08080A',
    dark: '#0E0C0A',
    base: '#12100E',
    elevated: '#1A1208',
    hover: '#2A1A0C',
  },

  brand: {
    green: '#FC8019',
    orange: '#FC8019',
  },

  orange: {
    1: '#1A0A00',
    2: '#2A1200',
    3: '#140600',
    accent: '#FC8019',
    light: '#FFB366',
    nav: '#FFB366',
  },

  semantic: {
    success: '#4ADE80',
    warning: '#FFBE0B',
    error: '#FF4444',
    info: '#FFB366',
  },

  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },

  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    heavy: 'rgba(255, 255, 255, 0.15)',
  },

  status: {
    successSoft: '#4ADE80',
    errorSoft: '#FF6B6B',
  },

  interactive: {
    hoverBg: '#2A1A0C',
    activeBg: '#241810',
    focusRing: '#FFB366',
    disabledText: '#6B5B4A',
  },

  common: {
    white: '#FFFFFF',
    black: '#000000',
  },

  section: {
    auth: '#FC8019',
    browse: '#FFB366',
    order: '#E57010',
  },
} as const;

export const SECTION_COLOR_BY_GROUP: Record<string, string> = {
  auth: '#FC8019',
  browse: '#FFB366',
  order: '#E57010',
};

export const feedColors = colors;

export function withOpacity(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

export const typeScale = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
} as const;

export const leading = {
  tight: '1.1',
  snug: '1.3',
  normal: '1.5',
  relaxed: '1.7',
} as const;

export const tracking = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const fontFamily = {
  heading: '"Inter", system-ui, -apple-system, sans-serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export const motion = {
  durFast: '160ms',
  durNormal: '240ms',
  durSlow: '400ms',
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;
