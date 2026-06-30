import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import {
  GraduationCap,
  BookOpen,
  ChatsCircle,
  Wrench,
  Trophy,
  RocketLaunch,
} from '@phosphor-icons/react';
import SEOHead from '../components/seo/SEOHead';
import { useStaggerReveal } from '../hooks/useGSAP';
import { STUDYHALL_TIER_IDS, tierForInterval, type StudyhallTier } from '../data/studyhallTiers';
import AuthModal from '../components/onboarding/AuthModal';
import { useAuth } from '../context/useAuth';
import { AuroraField, BentoGrid, BentoTile, GlowCard } from '../components/ui';
import type { GlowAccent } from '../components/ui';
import './AgenticStudyHall.css';

/* The one loop a beginner grasps at a glance: what you do here, in order.
   Each step is plain-language so a first-time visitor knows the whole path.
   `accent` and `span` make the bento asymmetric so the page has a focal point
   instead of a flat equal row. */
const LOOP_STEPS: ReadonlyArray<{
  Icon: typeof BookOpen;
  label: string;
  detail: string;
  accent: GlowAccent;
  wide?: boolean;
}> = [
  { Icon: BookOpen, label: 'Learn', detail: 'Short modules in The Library.', accent: 'ocean', wide: true },
  { Icon: ChatsCircle, label: 'Discuss', detail: 'Ask in the Forum and Chat.', accent: 'coral' },
  { Icon: Wrench, label: 'Build', detail: 'Turn what you learn into a project.', accent: 'violet' },
  { Icon: Trophy, label: 'Show', detail: 'Post it to the Showcase.', accent: 'gold' },
  { Icon: RocketLaunch, label: 'Ship', detail: 'Deploy it so people can use it.', accent: 'ocean', wide: true },
];

/* Each pricing tier glows in its own accent so the four cards read as a set,
   not a flat grey row. Keyed by the canonical tier id. */
const TIER_ACCENT: Record<string, GlowAccent> = {
  assetClass: 'ocean',
  cohort: 'coral',
  insiders: 'violet',
  privateLessons: 'gold',
};

export default function AgenticStudyHall() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const tierRef = useStaggerReveal('.school__tier-card', {
    stagger: 0.12,
    y: 40,
    duration: 0.6,
  });

  /* Only render the 4 canonical tiers — swap price based on toggle */
  const displayTiers: StudyhallTier[] = STUDYHALL_TIER_IDS
    .map((id) => tierForInterval(id, billingInterval))
    .filter((t): t is StudyhallTier => !!t);

  return (
    <>
      <SEOHead
        title="Agentic Study Hall | Asset Persona"
        description="Learn AI literacy, prompt engineering, vibe coding, and AI strategy. Free and paid tiers. Built by Frank Lawrence, Jr."
      />

      {/* studyhall-scope makes the --cm-* tokens resolve on this marketing page,
          which renders outside the .community scope. The 2026 primitives
          (AuroraField, GlowCard, BentoGrid) and this page's own CSS both read
          those tokens, so the whole surface themes from one place. */}
      <section className="school studyhall-scope">
        {/* Slow kinetic aurora behind everything — the depth antidote for the
            dark base. Rich so it is felt on the first-impression landing. */}
        <AuroraField intensity="rich" />

        <div className="container school__inner">
          {/* Hero */}
          <div className="school__hero">
            <p className="school__eyebrow">
              <GraduationCap size={20} weight="duotone" className="school__eyebrow-icon" aria-hidden="true" />
              Agentic Study Hall
            </p>
            <h1 className="school__title">
              <span className="school__title-kinetic">Learn AI.</span>
              <br />
              <span className="school__title-kinetic school__title-kinetic--delay">Build With It.</span>
            </h1>
            <p className="school__value-line">
              Learn. Discuss. Build. Show. Ship.
            </p>
            <p className="school__subtitle">
              You learn a skill, talk it through with people, build something real,
              share it, and put it live. Start free. Go deeper when you are ready.
            </p>

            <div className="school__hero-ctas">
              {user ? (
                <Link to="/community/classroom" className="btn btn--primary">
                  Open The Library <ArrowRight size={16} />
                </Link>
              ) : (
                <button type="button" className="btn btn--primary" onClick={() => setAuthOpen(true)}>
                  Join Free <ArrowRight size={16} />
                </button>
              )}
              <a href="#pricing" className="btn btn--secondary">
                See Plans
              </a>
            </div>
            {/* New here? Send first-timers to the Start Here guide. It lives behind
                the community login, so a guest gets the sign-up first, then lands
                there; a logged-in member goes straight in. */}
            <p className="school__start-here">
              New here?{' '}
              {user ? (
                <Link to="/community/start">Start Here</Link>
              ) : (
                <button type="button" className="school__start-here-link" onClick={() => setAuthOpen(true)}>
                  Start Here
                </button>
              )}
            </p>
          </div>

          {/* The loop, as an active bento: Learn, Discuss, Build, Show, Ship.
              Each step is a GlowCard tile that lifts and glows on hover, so the
              whole path reads at a glance and invites a look. Each tile carries
              an aria-label with its step number and detail, so assistive tech
              still hears the order even though the visual layer is a bento. */}
          <div className="school__loop-section">
            <h2 className="school__section-title">How it works</h2>
            <p className="school__section-sub">
              One simple path, in order. This is the whole product on one screen.
            </p>
            <BentoGrid columns={4} className="school__loop-grid">
              {LOOP_STEPS.map(({ Icon, label, detail, accent, wide }, i) => (
                <BentoTile
                  key={label}
                  accent={accent}
                  span={wide ? { col: 2 } : undefined}
                  className="school__loop-tile"
                  aria-label={`Step ${i + 1}: ${label}. ${detail}`}
                >
                  <span className="school__loop-num" aria-hidden="true">{i + 1}</span>
                  <Icon size={26} weight="duotone" className="school__loop-icon" aria-hidden="true" />
                  <span className="school__loop-label">{label}</span>
                  <span className="school__loop-detail">{detail}</span>
                </BentoTile>
              ))}
            </BentoGrid>
          </div>

          {/* Pricing: 4 Canonical Tiers + Monthly/Annual Toggle */}
          <div className="school__pricing" id="pricing">
            <h2 className="school__section-title">Pick Your Tier</h2>
            <p className="school__section-sub">
              The Asset Class is free forever. Upgrade when you are ready to go deeper.
            </p>

            {/* Billing interval toggle */}
            <div className="school__billing-toggle" role="radiogroup" aria-label="Billing interval">
              <button
                type="button"
                className={`school__billing-pill ${billingInterval === 'monthly' ? 'school__billing-pill--active' : ''}`}
                onClick={() => setBillingInterval('monthly')}
                role="radio"
                aria-checked={billingInterval === 'monthly'}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`school__billing-pill ${billingInterval === 'yearly' ? 'school__billing-pill--active' : ''}`}
                onClick={() => setBillingInterval('yearly')}
                role="radio"
                aria-checked={billingInterval === 'yearly'}
              >
                Annual
                <span className="school__billing-save-badge">Save 20%</span>
              </button>
            </div>

            <div className="school__tiers" ref={tierRef}>
              {displayTiers.map((tier) => (
                <GlowCard
                  key={tier.id}
                  accent={TIER_ACCENT[tier.id] ?? 'ocean'}
                  className={`school__tier-card ${tier.highlighted ? 'school__tier-card--highlighted' : ''}`}
                >
                  {tier.highlighted && <div className="school__tier-badge">Most Popular</div>}
                  {tier.savings && billingInterval === 'yearly' && (
                    <div className="school__tier-savings">{tier.savings}</div>
                  )}
                  <h3 className="school__tier-name">{tier.name}</h3>
                  <div className="school__tier-price">
                    {tier.price === null ? (
                      <span className="school__tier-price-amount">Free</span>
                    ) : (
                      <>
                        <span className="school__tier-price-currency">$</span>
                        <span className="school__tier-price-amount">{tier.price}</span>
                        <span className="school__tier-price-interval">{tier.intervalLabel}</span>
                      </>
                    )}
                  </div>
                  <p className="school__tier-desc">{tier.description}</p>

                  <ul className="school__tier-highlights">
                    {tier.highlights.map((item) => (
                      <li key={item} className="school__tier-highlight">
                        <Check size={14} className="school__tier-highlight-icon" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={tier.ctaUrl}
                    onClick={(event) => {
                      if (!user && tier.ctaUrl.startsWith('/login')) {
                        event.preventDefault();
                        setAuthOpen(true);
                      }
                    }}
                    className={`btn ${tier.highlighted ? 'btn--primary' : 'btn--secondary'} school__tier-cta`}
                  >
                    {tier.cta} <ArrowRight size={16} />
                  </Link>
                </GlowCard>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="school__bottom-cta">
            <h2>Ready to start?</h2>
            <p>Join Agentic Study Hall and start learning this week.</p>
            {user ? (
              <Link to="/community/classroom" className="btn btn--primary">
                Open Classroom <ArrowRight size={16} />
              </Link>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => setAuthOpen(true)}>
                Join Free <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          redirectTo="/community/classroom"
          initialMode="signup"
        />
      </section>
    </>
  );
}
