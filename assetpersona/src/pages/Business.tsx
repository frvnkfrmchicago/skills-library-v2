/* ═══ BUSINESS LANDING PAGE — AI Strategy & Integration ═══ */
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Zap, Shield, BarChart3, Bot, Workflow, Users, Phone } from 'lucide-react';
import { Rocket, Buildings, ChartLineUp, Gear } from '@phosphor-icons/react';
import SEOHead from '../components/seo/SEOHead';
import { useScrollReveal, useStaggerReveal } from '../hooks/useGSAP';
import './Business.css';

const CONSULTING_TIERS = [
  {
    id: 'discovery',
    name: '30-Minute Discovery Call',
    price: 'Free',
    description: 'A no-commitment conversation to understand your pain points, assess where AI fits, and determine which tier is right for you.',
    features: ['Pain point assessment', 'AI readiness evaluation', 'Custom recommendations', 'No obligation'],
    cta: 'Book a Call',
    ctaUrl: '/contact',
    icon: Phone,
  },
  {
    id: 'advisory',
    name: 'Strategic Advisory Retainer',
    price: '$2,500/mo',
    description: 'Ongoing fractional AI leadership. Monthly operational strategy, team Training Hub access, and high-level architectural guidance.',
    features: ['Monthly strategy sessions', 'Team Training Hub access', 'AI deployment guidance', 'Ongoing advisory support'],
    cta: 'Start Advisory',
    ctaUrl: '/contact',
    icon: ChartLineUp,
    highlighted: true,
  },
  {
    id: 'workshops',
    name: 'Corporate Enablement Workshops',
    price: '$5,000/workshop',
    description: 'Dedicated live training for your departments on prompt engineering, internal tool usage, and AI efficiency.',
    features: ['Department-specific training', 'Prompt engineering standards', 'Internal tool optimization', 'Hands-on exercises'],
    cta: 'Schedule Workshop',
    ctaUrl: '/contact',
    icon: Users,
  },
  {
    id: 'integration',
    name: 'Full System Integration',
    price: 'Custom ($10k+)',
    description: 'Done-for-you technical build. Complete setup of n8n webhooks, GoHighLevel snapshots, LLM pipelines, and process automations.',
    features: ['n8n workflow architecture', 'GoHighLevel integration', 'Secure LLM pipelines', 'Complete documentation'],
    cta: 'Get a Quote',
    ctaUrl: '/contact',
    icon: Gear,
  },
];

const AUTOMATION_BUILDS = [
  {
    name: 'Automation Quickstart',
    price: '$2,500 to $5,000',
    description: '1-2 core workflows built and deployed. Process mapping, testing, and basic documentation.',
  },
  {
    name: 'Full Ops Build',
    price: '$8,000 to $15,000',
    description: 'Complete automation infrastructure for a department. 3-6 integrated workflows, dashboard/reporting, QA testing, and team training.',
  },
  {
    name: 'Enterprise Pipeline',
    price: '$15,000 to $50,000+',
    description: 'Full-scale technical build with LLM agents, multi-system integrations, compliance/audit logging, and human-in-the-loop approval flows.',
  },
];

const AUTOMATION_RETAINERS = [
  { name: 'Maintenance', price: '$500 to $1,500/mo', description: 'Monitoring, bug fixes, API break repairs, minor tweaks.' },
  { name: 'Growth', price: '$1,500 to $3,000/mo', description: 'Maintenance plus building 1-2 new workflows per month, optimization of existing systems.' },
  { name: 'Fractional AI Ops Lead', price: '$3,000 to $5,000+/mo', description: 'Full strategic ownership of your entire automation stack. Monthly planning, new builds, reporting, and direct access.' },
];

export default function Business() {
  const heroRef = useScrollReveal({ y: 40, duration: 0.7 });
  const tierRef = useStaggerReveal('.biz__tier-card', { stagger: 0.12, y: 40, duration: 0.6 });
  const autoRef = useStaggerReveal('.biz__auto-card', { stagger: 0.1, y: 30, duration: 0.5 });

  return (
    <>
      <SEOHead
        title="AI Consulting for Business | Asset Persona"
        description="Strategic AI consulting, corporate enablement workshops, and done-for-you automation builds. Transform operations and reclaim hours."
        path="/business"
      />

      <section className="biz">
        <div className="container">
          {/* HERO */}
          <div className="biz__hero" ref={heroRef}>
            <div className="biz__hero-badge">
              <Buildings size={14} weight="fill" /> For Business
            </div>
            <h1 className="biz__title">
              AI That Actually
              <br />
              <span className="text-accent-gold">Transforms Operations</span>
            </h1>
            <p className="biz__subtitle">
              Your team spends hours on tasks AI can handle in minutes.
              We build the systems, train your people, and own the strategy so you can focus on growth.
            </p>
            <div className="biz__hero-cta">
              <Link to="/contact" className="btn btn--primary">
                Book a Discovery Call <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* PAIN POINTS */}
          <div className="biz__pain-grid">
            {[
              { icon: Clock, stat: '10+ hrs/week', label: 'Wasted on manual data entry', color: 'salmon' },
              { icon: BarChart3, stat: '$20,000/yr', label: 'Lost per employee on repetitive tasks', color: 'gold' },
              { icon: Zap, stat: '3x faster', label: 'Operations with AI automation', color: 'salmon' },
              { icon: Shield, stat: '99.9%', label: 'Fewer errors with automated workflows', color: 'gold' },
            ].map((item) => (
              <div key={item.label} className="biz__pain-card liquid-glass">
                <item.icon size={24} className={`biz__pain-icon biz__pain-icon--${item.color}`} />
                <span className={`biz__pain-stat biz__pain-stat--${item.color}`}>{item.stat}</span>
                <p className="biz__pain-label">{item.label}</p>
              </div>
            ))}
          </div>

          {/* CONSULTING TIERS */}
          <div className="biz__tiers" ref={tierRef}>
            <div className="biz__section-header">
              <p className="text-uppercase text-accent-salmon">
                <Rocket size={16} weight="fill" /> Consulting Tiers
              </p>
              <h2>Strategic AI Consulting</h2>
              <p className="text-secondary">You are buying operational transformation and reclaimed hours, not a software subscription.</p>
            </div>

            <div className="biz__tiers-grid">
              {CONSULTING_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`biz__tier-card liquid-glass border-glow ${tier.highlighted ? 'biz__tier-card--highlighted' : ''}`}
                >
                  {tier.highlighted && <div className="biz__tier-badge">Most Popular</div>}
                  <tier.icon size={28} weight="duotone" className="biz__tier-icon" />
                  <h3 className="biz__tier-name">{tier.name}</h3>
                  <div className="biz__tier-price">{tier.price}</div>
                  <p className="biz__tier-desc">{tier.description}</p>
                  <ul className="biz__tier-features">
                    {tier.features.map((feat) => (
                      <li key={feat}><Zap size={12} /> {feat}</li>
                    ))}
                  </ul>
                  <Link to={tier.ctaUrl} className={`btn ${tier.highlighted ? 'btn--primary' : 'btn--secondary'} biz__tier-cta`}>
                    {tier.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* AUTOMATION SERVICES */}
          <div className="biz__automation" ref={autoRef}>
            <div className="biz__section-header">
              <p className="text-uppercase text-accent-gold">
                <Bot size={16} /> Automation Services
              </p>
              <h2>n8n Builds and Management</h2>
              <p className="text-secondary">
                We build systems that save your team 10+ hours per week. If an employee costs $40/hr and we save 10 hrs/week, that is roughly $20,000/year saved.
              </p>
            </div>

            <h3 className="biz__auto-subtitle">
              <Workflow size={18} /> One-Time Builds
            </h3>
            <div className="biz__auto-grid">
              {AUTOMATION_BUILDS.map((item) => (
                <div key={item.name} className="biz__auto-card liquid-glass border-glow">
                  <h4 className="biz__auto-name">{item.name}</h4>
                  <span className="biz__auto-price">{item.price}</span>
                  <p className="biz__auto-desc">{item.description}</p>
                </div>
              ))}
            </div>

            <h3 className="biz__auto-subtitle" style={{ marginTop: 'var(--space-2xl)' }}>
              <Gear size={18} weight="duotone" /> Managed Retainers
            </h3>
            <div className="biz__auto-grid">
              {AUTOMATION_RETAINERS.map((item) => (
                <div key={item.name} className="biz__auto-card liquid-glass border-glow">
                  <h4 className="biz__auto-name">{item.name}</h4>
                  <span className="biz__auto-price">{item.price}</span>
                  <p className="biz__auto-desc">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM CTA */}
          <div className="biz__bottom-cta liquid-glass">
            <h2>Ready to transform your operations?</h2>
            <p className="text-secondary">Start with a free 30-minute discovery call. No commitment.</p>
            <Link to="/contact" className="btn btn--primary">
              Book a Discovery Call <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
