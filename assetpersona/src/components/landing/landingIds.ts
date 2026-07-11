export const LANDING_IDS = {
  hero: 'hero',
  paths: 'paths',
  curriculum: 'curriculum',
  products: 'products',
  projects: 'projects',
  insights: 'insights',
  start: 'start',
} as const;

export type LandingSectionId = (typeof LANDING_IDS)[keyof typeof LANDING_IDS];
