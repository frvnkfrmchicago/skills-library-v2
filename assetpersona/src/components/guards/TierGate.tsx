import { useState, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import UpgradeModal from '../auth/UpgradeModal';
import type { StudyhallTierId } from '../../hooks/useCheckout';

type Tier = 'assetClass' | 'cohort' | 'insiders' | 'privateLessons';

const TIER_RANK: Record<Tier, number> = {
  assetClass: 0,
  cohort: 1,
  insiders: 2,
  privateLessons: 3,
};

interface TierGateProps {
  required: Tier;
  children: ReactNode;
  /** Override the default upsell. */
  fallback?: ReactNode;
  /** Where the gate fired — passed to analytics. */
  source?: string;
}

/**
 * Gates content by Study Hall tier. Reads `profile.tier`.
 * Bypass mode + admins pass through.
 *
 * When blocked, shows a soft-locked surface with a CTA that opens UpgradeModal inline —
 * no detour to /agenticstudyhall.
 */
export default function TierGate({ required, children, fallback, source }: TierGateProps) {
  const { profile, isBypass } = useAuth();
  const [open, setOpen] = useState(false);

  if (isBypass) return <>{children}</>;
  if (profile?.role === 'admin') return <>{children}</>;

  const userTier = ((profile as unknown as { tier?: Tier })?.tier ?? 'assetClass') as Tier;
  const allowed = TIER_RANK[userTier] >= TIER_RANK[required];

  if (allowed) return <>{children}</>;

  return (
    <>
      {fallback ?? (
        <div className="tier-gate" style={tierGateStyles}>
          <div style={iconStyles}>
            <Lock size={28} />
          </div>
          <h3 style={titleStyles}>This is a {required} tier feature</h3>
          <p style={bodyStyles}>
            Your current plan is <strong>{userTier}</strong>. Pick the plan that fits and you keep your spot in the community.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            style={ctaStyles}
            onClick={() => setOpen(true)}
          >
            See plans
          </button>
        </div>
      )}
      <UpgradeModal
        open={open}
        requiredTier={required as StudyhallTierId}
        triggerSource={source ?? `tier-gate:${required}`}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const tierGateStyles: React.CSSProperties = {
  display: 'grid',
  justifyItems: 'center',
  gap: '16px',
  padding: '48px 24px',
  textAlign: 'center',
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-bg-surface-elevated)',
  borderRadius: '20px',
  maxWidth: '520px',
  margin: '48px auto',
};
const iconStyles: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'var(--color-brand-primary-subtle)',
  color: 'var(--color-brand-primary)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const titleStyles: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
  color: 'var(--color-text-primary)',
  margin: 0,
};
const bodyStyles: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-secondary)',
  margin: 0,
  maxWidth: '380px',
  lineHeight: 1.55,
};
const ctaStyles: React.CSSProperties = {
  marginTop: '8px',
  minHeight: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 20px',
};
