/* ═══ AFFILIATE PROGRAM — Platform-as-Franchise Model ═══
 *
 * Revenue model: Flat-dollar recurring affiliate commissions.
 * Single-layer only — referrers earn from their direct referrals, never from sub-referrals.
 *
 * Business rules:
 * - Commissions are recurring for as long as the referred member stays subscribed
 * - Free tier (Asset Class) referrals earn no commission
 * - 2-month hold: accumulation starts month 1, first payout at month 2
 * - Minimum payout threshold: TBD
 *
 * Future: "Start Your Own Agentic Study Hall" — group creation for Cohort+ members
 * with rev share from the platform subscription pool (Phase 2 feature).
 */

export interface AffiliateCommission {
  tierId: string;
  tierName: string;
  tierPrice: number;
  affiliateCut: number;    // flat dollar amount per referred subscriber per month
  platformKeeps: number;   // tierPrice - affiliateCut
  marginPercent: number;   // what the platform retains as a percentage
}

export interface AffiliateConfig {
  holdPeriodMonths: number;
  minPayoutAmount: number | null;  // null = no minimum, TBD
  isRecurring: boolean;
  recurringCapMonths: number | null;  // null = lifetime, or set a cap (e.g. 12, 24)
  groupCreationMinTier: string;  // minimum tier to start an Agentic Study Hall group (Phase 2)
  groupPayoutMinMembers: number; // 25 paying members before group rev share kicks in
}

export const AFFILIATE_COMMISSIONS: AffiliateCommission[] = [
  {
    tierId: 'assetClass',
    tierName: 'The Asset Class',
    tierPrice: 0,
    affiliateCut: 0,
    platformKeeps: 0,
    marginPercent: 100,
  },
  {
    tierId: 'cohort',
    tierName: 'Agentic Study Hall Cohort',
    tierPrice: 29,
    affiliateCut: 4,
    platformKeeps: 25,
    marginPercent: 86.2,
  },
  {
    tierId: 'insiders',
    tierName: 'Agentic Study Hall Insiders',
    tierPrice: 59,
    affiliateCut: 9,
    platformKeeps: 50,
    marginPercent: 84.7,
  },
  {
    tierId: 'privateLessons',
    tierName: 'Private Lessons',
    tierPrice: 199,
    affiliateCut: 25,
    platformKeeps: 174,
    marginPercent: 87.4,
  },
];

export const AFFILIATE_CONFIG: AffiliateConfig = {
  holdPeriodMonths: 2,
  minPayoutAmount: null,       // TBD — decide if you want a $25 min or similar
  isRecurring: true,
  recurringCapMonths: null,    // null = lifetime recurring. Set to 12 or 24 to cap.
  groupCreationMinTier: 'cohort',  // Phase 2: Cohort+ can start groups
  groupPayoutMinMembers: 25,
};

/* ── Helpers ── */

/** Get the affiliate commission for a given tier */
export function getCommission(tierId: string): AffiliateCommission | undefined {
  return AFFILIATE_COMMISSIONS.find((c) => c.tierId === tierId);
}

/** Calculate projected monthly earnings for a referrer */
export function projectEarnings(referrals: { tierId: string; count: number }[]): {
  monthly: number;
  breakdown: { tierName: string; count: number; perUnit: number; total: number }[];
} {
  const breakdown = referrals.map(({ tierId, count }) => {
    const commission = getCommission(tierId);
    if (!commission) return { tierName: 'Unknown', count, perUnit: 0, total: 0 };
    return {
      tierName: commission.tierName,
      count,
      perUnit: commission.affiliateCut,
      total: commission.affiliateCut * count,
    };
  });

  return {
    monthly: breakdown.reduce((sum, b) => sum + b.total, 0),
    breakdown,
  };
}
