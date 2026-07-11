/* ═══ AGENTIC STUDY HALL — TIER & CURRICULUM DATA ═══
 *
 * Wave 5 (AP-MODERNIZE-2026-05) adds annual variants for Cohort and Insiders.
 * Yearly plans are 20% off the equivalent twelve-month monthly run rate.
 *
 *   Cohort        $29/mo  → $279/yr  (saves $69)
 *   Insiders      $59/mo  → $567/yr  (saves $141)
 *   Private Lessons stays monthly — coaching cadence is monthly by design.
 */

export type StudyhallInterval = 'free' | 'monthly' | 'yearly';

export interface StudyhallTier {
  id: string;
  name: string;
  price: number | null; // null = free
  interval?: StudyhallInterval;
  /** Display string for the cadence next to the price ("/mo", "/yr", or undefined for free). */
  intervalLabel?: string;
  tagline: string;
  description: string;
  highlights: string[]; // compact: top 4 benefits only
  cta: string;
  ctaUrl: string;
  highlighted?: boolean;
  /** When the monthly tier links to its yearly twin, this points at it. */
  annualEquivalentId?: string;
  /** When the yearly tier links back to its monthly twin. */
  monthlyEquivalentId?: string;
  /** "Save 20%" / "Save $141" copy for yearly plans. */
  savings?: string;
}

export interface SchoolFeature {
  label: string;
  assetClass: boolean;
  cohort: boolean;
  insiders: boolean;
  privateLessons: boolean;
}

export const STUDYHALL_TIERS: StudyhallTier[] = [
  {
    id: 'assetClass',
    name: 'The Asset Class',
    price: null,
    interval: 'free',
    tagline: 'Start here. Free forever.',
    description: 'Community access, AI news, and intro modules to get you oriented.',
    highlights: [
      'Community feed access',
      'AI news and industry updates',
      'Intro AI literacy modules',
      'Talk Thru Tech event access',
    ],
    cta: 'Join Free',
    ctaUrl: '/login?mode=signup',
  },
  {
    id: 'cohort',
    name: 'Cohort',
    price: 29,
    interval: 'monthly',
    intervalLabel: '/mo',
    tagline: 'Go deeper with the group.',
    description: 'Full module library, templates, recordings, and monthly group calls.',
    highlights: [
      'All weekly modules',
      'Template and resource library',
      'Talk Thru Tech recordings',
      'Monthly group Q&A',
    ],
    cta: 'Join the Cohort',
    ctaUrl: '/login?mode=signup',
    highlighted: true,
    annualEquivalentId: 'cohortYearly',
  },
  {
    id: 'cohortYearly',
    name: 'Cohort',
    price: 279,
    interval: 'yearly',
    intervalLabel: '/yr',
    tagline: 'Go deeper with the group. Pay once a year.',
    description: 'Same Cohort access, billed yearly. Saves $69 compared to monthly.',
    highlights: [
      'All weekly modules',
      'Template and resource library',
      'Talk Thru Tech recordings',
      'Monthly group Q&A',
    ],
    cta: 'Join the Cohort',
    ctaUrl: '/login?mode=signup',
    highlighted: true,
    monthlyEquivalentId: 'cohort',
    savings: 'Save 20%',
  },
  {
    id: 'insiders',
    name: 'Insiders',
    price: 59,
    interval: 'monthly',
    intervalLabel: '/mo',
    tagline: 'Get behind the curtain.',
    description: 'Everything in Cohort plus office hours and source code breakdowns.',
    highlights: [
      'Weekly office hours',
      'Source code breakdowns',
      'Priority Q&A access',
      'Insider-only content',
    ],
    cta: 'Go Insider',
    ctaUrl: '/login?mode=signup',
    annualEquivalentId: 'insidersYearly',
  },
  {
    id: 'insidersYearly',
    name: 'Insiders',
    price: 567,
    interval: 'yearly',
    intervalLabel: '/yr',
    tagline: 'Get behind the curtain. Pay once a year.',
    description: 'Same Insiders access, billed yearly. Saves $141 compared to monthly.',
    highlights: [
      'Weekly office hours',
      'Source code breakdowns',
      'Priority Q&A access',
      'Insider-only content',
    ],
    cta: 'Go Insider',
    ctaUrl: '/login?mode=signup',
    monthlyEquivalentId: 'insiders',
    savings: 'Save 20%',
  },
  {
    id: 'privateLessons',
    name: 'Private Lessons',
    price: 199,
    interval: 'monthly',
    intervalLabel: '/mo',
    tagline: 'Direct access to Frank.',
    description: 'Monthly 1-on-1 sessions and private instruction on your projects.',
    highlights: [
      'Monthly 1:1 with Frank',
      'Private lesson sessions',
      'Custom project feedback',
      'Direct message access',
    ],
    cta: 'Book Private',
    ctaUrl: '/login?mode=signup',
  },
];

/* Aliases for backward compat */
export const SCHOOL_TIERS = STUDYHALL_TIERS;

/* Just the four canonical "picker" tiers (collapses yearly twins into their monthly source).
   The comparison table and TierGate use these. The yearly versions surface via toggle. */
export const STUDYHALL_TIER_IDS = ['assetClass', 'cohort', 'insiders', 'privateLessons'] as const;
export type StudyhallTierId = typeof STUDYHALL_TIER_IDS[number];

/** Pick the tier the upgrade UI should show for a given base id + interval. */
export function tierForInterval(
  baseId: StudyhallTierId,
  interval: 'monthly' | 'yearly',
): StudyhallTier | undefined {
  if (interval === 'monthly') {
    return STUDYHALL_TIERS.find((t) => t.id === baseId);
  }
  // For yearly: find the monthly tier first, then jump to its annual twin.
  const monthly = STUDYHALL_TIERS.find((t) => t.id === baseId);
  if (!monthly) return undefined;
  if (!monthly.annualEquivalentId) return monthly; // privateLessons, assetClass — no yearly
  return STUDYHALL_TIERS.find((t) => t.id === monthly.annualEquivalentId);
}

/* Full feature comparison (for expandable view) */
export const SCHOOL_FEATURES: SchoolFeature[] = [
  { label: 'Community feed access',            assetClass: true,  cohort: true,  insiders: true,  privateLessons: true },
  { label: 'AI news and industry updates',     assetClass: true,  cohort: true,  insiders: true,  privateLessons: true },
  { label: 'Intro AI literacy modules',        assetClass: true,  cohort: true,  insiders: true,  privateLessons: true },
  { label: 'Talk Thru Tech event access',      assetClass: true,  cohort: true,  insiders: true,  privateLessons: true },
  { label: 'All weekly modules',               assetClass: false, cohort: true,  insiders: true,  privateLessons: true },
  { label: 'Template and resource library',    assetClass: false, cohort: true,  insiders: true,  privateLessons: true },
  { label: 'Talk Thru Tech recordings',        assetClass: false, cohort: true,  insiders: true,  privateLessons: true },
  { label: 'Monthly group Q&A',                assetClass: false, cohort: true,  insiders: true,  privateLessons: true },
  { label: 'Weekly office hours',              assetClass: false, cohort: false, insiders: true,  privateLessons: true },
  { label: 'Source code and build breakdowns', assetClass: false, cohort: false, insiders: true,  privateLessons: true },
  { label: 'Monthly 1:1 with Frank',           assetClass: false, cohort: false, insiders: false, privateLessons: true },
  { label: 'Private lesson sessions',          assetClass: false, cohort: false, insiders: false, privateLessons: true },
];

export const SCHOOL_CURRICULUM = [
  {
    title: 'AI Literacy',
    iconName: 'brain',
    description: 'Understand the tools everyone is talking about. Walk into any room and hold your own.',
  },
  {
    title: 'Prompt Engineering',
    iconName: 'lightning',
    description: 'Write prompts that save you hours. Stop guessing, start getting results.',
  },
  {
    title: 'Vibe Coding',
    iconName: 'code',
    description: 'Build apps, websites, and tools with AI. Ship real projects to real users.',
  },
  {
    title: 'AI Marketing',
    iconName: 'megaphone',
    description: 'Automate your content pipeline. Create faster without losing your voice.',
  },
  {
    title: 'AI Strategy',
    iconName: 'strategy',
    description: 'Know which tools to buy, which to skip, and how to put them to work.',
  },
];
