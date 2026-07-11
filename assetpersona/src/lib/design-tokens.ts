/** Design tokens — Asset Persona dark neon brand. Token-first architecture.
 *  Reference: experience-designing skill, typography-enforcing skill.
 */
export const colors = {
  brandGreen: '#33fecc',
  electricCyan: '#33fecc',
  platformPurple: '#1f003d',
  orange1: '#02020a',
  orange2: '#0a0514',
  orange3: '#02020a',
  accentOrange: '#33fecc',
  navOrange: '#33fecc',
  deepNavy: '#02020a',

  text: {
    headline: '#f6f0ff',
    primary: '#d1c5e7',
    secondary: '#a38fbe',
    muted: '#6a5e80',
    inverse: '#02020a',
  },

  chart: {
    green: '#33fecc',
    orange: '#33fecc',
    deep: '#33fecc',
    gold: '#33fecc',
    red: '#FF4444',
  },

  surface: {
    canvas: '#02020a',
    panel: '#090514',
    panelSoft: '#120b24',
    void: '#02020a',
    midnight: '#02020a',
    dark: '#05020c',
    base: '#080512',
    elevated: '#0f0a20',
    hover: '#191133',
  },

  brand: {
    green: '#33fecc',
    orange: '#33fecc',
  },

  orange: {
    1: '#02020a',
    2: '#0a0514',
    3: '#02020a',
    accent: '#33fecc',
    light: '#33fecc',
    nav: '#33fecc',
  },

  semantic: {
    success: '#4ADE80',
    warning: '#FFBE0B',
    error: '#FF4444',
    info: '#33fecc',
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
    hoverBg: '#191133',
    activeBg: '#120b24',
    focusRing: '#33fecc',
    disabledText: '#4f4460',
  },

  common: {
    white: '#FFFFFF',
    black: '#000000',
  },

  section: {
    auth: '#33fecc',
    browse: '#33fecc',
    order: '#33fecc',
  },
} as const;

export const SECTION_COLOR_BY_GROUP: Record<string, string> = {
  auth: '#33fecc',
  browse: '#33fecc',
  order: '#33fecc',
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
