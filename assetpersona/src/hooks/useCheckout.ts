import { useState } from 'react';
import { track } from '../lib/analytics';

/**
 * Stripe Payment Links — mapped to Agentic Study Hall tiers.
 *
 * Wave 5 (AP-MODERNIZE-2026-05) adds:
 *   - Annual variants for Cohort and Insiders ("Save 20%" toggle in UI)
 *   - openCustomerPortal() for self-serve cancel + card change
 *   - track() events so the funnel surfaces in analytics
 *
 * Free tier (assetClass) has no checkout. Private Lessons is monthly only.
 */

type BillingInterval = 'monthly' | 'yearly';

interface PaymentLinks {
  monthly: string;
  yearly?: string;
}

const STRIPE_LINKS: Record<string, PaymentLinks> = {
  cohort: {
    monthly: import.meta.env.VITE_STRIPE_COHORT || '',
    yearly: import.meta.env.VITE_STRIPE_COHORT_YEARLY || '',
  },
  insiders: {
    monthly: import.meta.env.VITE_STRIPE_INSIDERS || '',
    yearly: import.meta.env.VITE_STRIPE_INSIDERS_YEARLY || '',
  },
  privateLessons: {
    monthly: import.meta.env.VITE_STRIPE_PRIVATE || '',
  },
};

export type StudyhallTierId = keyof typeof STRIPE_LINKS;

export interface CheckoutHandle {
  handleCheckout: (tier: StudyhallTierId, interval?: BillingInterval) => Promise<void>;
  openCustomerPortal: () => void;
  hasPortal: boolean;
  isLoading: StudyhallTierId | 'portal' | null;
}

export function useCheckout(): CheckoutHandle {
  const [isLoading, setIsLoading] = useState<StudyhallTierId | 'portal' | null>(null);

  const handleCheckout = async (
    tier: StudyhallTierId,
    interval: BillingInterval = 'monthly',
  ) => {
    try {
      setIsLoading(tier);
      const links = STRIPE_LINKS[tier];
      const link = (interval === 'yearly' && links?.yearly) || links?.monthly || '';

      if (link) {
        track('tier_upgrade', { tier, interval, stage: 'checkout_started' });
        // Small UX pause so the button can render its loading state before the redirect.
        await new Promise((resolve) => setTimeout(resolve, 200));
        window.location.href = link;
      } else {
        const envName = interval === 'yearly'
          ? `VITE_STRIPE_${tier.toUpperCase()}_YEARLY`
          : `VITE_STRIPE_${tier.toUpperCase()}`;
        console.warn(`No Stripe link configured for tier "${tier}" (${interval}). Set ${envName} in .env`);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const portalUrl = import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL_URL || '';
  const hasPortal = Boolean(portalUrl);

  const openCustomerPortal = () => {
    if (!portalUrl) {
      console.warn('No Customer Portal URL configured. Set VITE_STRIPE_CUSTOMER_PORTAL_URL in .env.');
      return;
    }
    setIsLoading('portal');
    track('tier_upgrade', { stage: 'customer_portal_opened' });
    window.open(portalUrl, '_blank', 'noopener,noreferrer');
    // No redirect on this tab — clear the loading state on the next tick.
    setTimeout(() => setIsLoading(null), 400);
  };

  return { handleCheckout, openCustomerPortal, hasPortal, isLoading };
}
