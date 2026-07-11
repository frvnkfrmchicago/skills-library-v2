import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useCheckout, type StudyhallTierId } from '../../hooks/useCheckout';
import {
  STUDYHALL_TIERS,
  STUDYHALL_TIER_IDS,
  SCHOOL_FEATURES,
  tierForInterval,
  type StudyhallTier,
} from '../../data/studyhallTiers';
import './UpgradeModal.css';

type BillingInterval = 'monthly' | 'yearly';

interface UpgradeModalProps {
  /** The tier the gated content requires. Highlighted in the comparison. */
  requiredTier?: StudyhallTierId;
  /** Where the modal was opened from. Goes to analytics. */
  triggerSource?: string;
  /** Called when the modal should close. */
  onClose: () => void;
  /** Whether the modal is open. */
  open: boolean;
}

export default function UpgradeModal({ requiredTier, triggerSource, onClose, open }: UpgradeModalProps) {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const { handleCheckout, isLoading } = useCheckout();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleEscape);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = prev;
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const visibleTierIds = STUDYHALL_TIER_IDS.filter((id) => id !== 'assetClass');

  return (
    <AnimatePresence>
      <motion.div
        className="upgrade-modal__backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        role="presentation"
      >
        <motion.div
          className="upgrade-modal__card"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-modal-title"
        >
          <button
            type="button"
            className="upgrade-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <header className="upgrade-modal__header">
            <h2 id="upgrade-modal-title">
              {requiredTier ? `Get access to ${tierLabel(requiredTier)}` : 'See plans'}
            </h2>
            <p className="upgrade-modal__subtitle">
              Pick a plan. Cancel anytime. Billing handled by Stripe.
            </p>

            <div className="upgrade-modal__toggle" role="radiogroup" aria-label="Billing interval">
              <button
                type="button"
                role="radio"
                aria-checked={interval === 'monthly'}
                className={`upgrade-modal__toggle-btn ${interval === 'monthly' ? 'is-active' : ''}`}
                onClick={() => setInterval('monthly')}
              >
                Monthly
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={interval === 'yearly'}
                className={`upgrade-modal__toggle-btn ${interval === 'yearly' ? 'is-active' : ''}`}
                onClick={() => setInterval('yearly')}
              >
                Yearly <span className="upgrade-modal__save">Save 20%</span>
              </button>
            </div>
          </header>

          <div className="upgrade-modal__tiers">
            {visibleTierIds.map((baseId) => {
              const tier = tierForInterval(baseId, interval) ?? tierForInterval(baseId, 'monthly');
              if (!tier) return null;
              const isHighlighted = tier.highlighted;
              const isRequired = requiredTier === baseId;
              const isLoadingTier = isLoading === (baseId as StudyhallTierId);
              return (
                <article
                  key={tier.id}
                  className={`upgrade-modal__tier ${isHighlighted ? 'is-popular' : ''} ${isRequired ? 'is-required' : ''}`}
                >
                  {isHighlighted && <div className="upgrade-modal__badge">Most popular</div>}
                  <h3>{tier.name}</h3>
                  <p className="upgrade-modal__tagline">{tier.tagline}</p>
                  <p className="upgrade-modal__price">
                    <span className="upgrade-modal__amount">${tier.price}</span>
                    <span className="upgrade-modal__period">{tier.intervalLabel}</span>
                  </p>
                  {tier.savings && (
                    <p className="upgrade-modal__savings">{tier.savings}</p>
                  )}
                  <ul className="upgrade-modal__highlights">
                    {tier.highlights.map((h) => (
                      <li key={h}>
                        <Check size={14} aria-hidden="true" /> {h}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="upgrade-modal__cta btn btn--primary"
                    disabled={isLoadingTier}
                    onClick={() => {
                      if (triggerSource) {
                        // tracked inside useCheckout, but a hook for future telemetry
                      }
                      void handleCheckout(baseId as StudyhallTierId, interval);
                    }}
                  >
                    {isLoadingTier ? 'Opening checkout…' : `Get ${tier.name}`}
                  </button>
                </article>
              );
            })}
          </div>

          <footer className="upgrade-modal__footer">
            <p className="upgrade-modal__trust">
              Powered by Stripe. Cancel anytime in your account settings.
            </p>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function tierLabel(id: StudyhallTierId): string {
  const t = STUDYHALL_TIERS.find((x: StudyhallTier) => x.id === id);
  return t?.name ?? 'this plan';
}

/* SCHOOL_FEATURES export is kept for the comparison table on /agenticstudyhall — not rendered inside the modal to keep the modal short. */
export { SCHOOL_FEATURES };
