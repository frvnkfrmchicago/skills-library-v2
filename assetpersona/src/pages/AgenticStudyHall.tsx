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
import './AgenticStudyHall.css';

/* The one loop a beginner grasps at a glance: what you do here, in order.
   Each step is plain-language so a first-time visitor knows the whole path. */
const LOOP_STEPS = [
  { Icon: BookOpen, label: 'Learn', detail: 'Short modules in the Classroom.' },
  { Icon: ChatsCircle, label: 'Discuss', detail: 'Ask in the Forum and Chat.' },
  { Icon: Wrench, label: 'Build', detail: 'Turn what you learn into a project.' },
  { Icon: Trophy, label: 'Show', detail: 'Post it to the Showcase.' },
  { Icon: RocketLaunch, label: 'Ship', detail: 'Deploy it so people can use it.' },
] as const;

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

      <section className="school">
        <div className="school__ambient" aria-hidden="true">
          <span className="school__ambient-band school__ambient-band--rose" />
          <span className="school__ambient-band school__ambient-band--blue" />
        </div>
        <div className="container">
          {/* Hero */}
          <div className="school__hero">
            <p className="text-uppercase text-accent-salmon">
              <GraduationCap size={20} weight="duotone" style={{ verticalAlign: 'middle', marginRight: 'var(--space-xs)' }} />
              Agentic Study Hall
            </p>
            <h1 className="school__title">
              Learn AI.<br />
              <span className="text-accent-gold">Build With It.</span>
            </h1>
            <p className="school__subtitle">
              One simple path: Learn, Discuss, Build, Show, Ship. You learn a skill,
              talk it through with people, build something real, share it, and put it
              live. Start free. Go deeper when you are ready.
            </p>
            <ol className="school__loop" aria-label="How the Agentic Study Hall works, step by step">
              {LOOP_STEPS.map(({ Icon, label, detail }, i) => (
                <li key={label} className="school__loop-step">
                  <span className="school__loop-num" aria-hidden="true">{i + 1}</span>
                  <Icon size={22} weight="duotone" className="school__loop-icon" aria-hidden="true" />
                  <span className="school__loop-label">{label}</span>
                  <span className="school__loop-detail">{detail}</span>
                </li>
              ))}
            </ol>
            <div className="school__hero-ctas">
              {user ? (
                <Link to="/community/classroom" className="btn btn--primary">
                  Open Classroom <ArrowRight size={16} />
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
                <div
                  key={tier.id}
                  className={`school__tier-card liquid-glass ${tier.highlighted ? 'school__tier-card--highlighted' : ''}`}
                >
                  {tier.highlighted && <div className="school__tier-badge">Most Popular</div>}
                  {tier.savings && billingInterval === 'yearly' && (
                    <div className="school__tier-savings">{tier.savings}</div>
                  )}
                  <h2 className="school__tier-name">{tier.name}</h2>
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
                </div>
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
