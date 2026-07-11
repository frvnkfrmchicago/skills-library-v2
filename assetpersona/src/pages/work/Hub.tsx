import { Link } from 'react-router-dom';
import {
  Briefcase,
  Mic2,
  GraduationCap,
  Megaphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import SEOHead from '../../components/seo/SEOHead';
import './work.css';

interface PathwayCard {
  to: string;
  icon: typeof Briefcase;
  title: string;
  valueStat: string;
  body: string;
  cta: string;
}

const PATHWAYS: PathwayCard[] = [
  {
    to: '/work/consulting',
    icon: Briefcase,
    title: 'AI Consulting',
    valueStat: 'For founders + teams adopting AI in real workflows',
    body:
      'Strategy, audit, and hands-on implementation. I work with founders, marketers, and operators who want AI integrated into the work, not bolted on.',
    cta: 'Start a consulting inquiry',
  },
  {
    to: '/work/speaking',
    icon: Mic2,
    title: 'Speaking & Keynotes',
    valueStat: 'Talks that translate AI hype into action',
    body:
      'Conference keynotes, panels, and corporate offsites on AI literacy, the AI economy, and what to actually do this quarter. Plain language, real demos.',
    cta: 'Inquire about a talk',
  },
  {
    to: '/work/training',
    icon: GraduationCap,
    title: 'Training & Workshops',
    valueStat: 'Custom AI training for teams of 5 – 500',
    body:
      'Half-day workshops, multi-week cohorts, and async curricula. Built around your team\'s real tools and real outputs, not generic prompt lists.',
    cta: 'Request a training proposal',
  },
  {
    to: '/work/marketing',
    icon: Megaphone,
    title: 'Marketing Services',
    valueStat: 'Content, brand voice, and AI-assisted growth',
    body:
      'Hands-on marketing support: content systems, brand voice, AI-assisted production. For founders who need a senior brain on the work.',
    cta: 'Tell me about your marketing',
  },
];

export default function WorkHub() {
  return (
    <>
      <SEOHead
        title="Work With Frank · AI Consulting, Speaking, Training, Marketing"
        description="Pick the pathway that fits your work. Frank Lawrence Jr. helps founders and teams adopt AI through consulting, keynotes, training, and marketing."
        path="/work"
      />
      <main className="work-hub">
        <header className="work-hub__hero container">
          <p className="work-hub__eyebrow">
            <Sparkles size={14} /> Work With Frank
          </p>
          <h1 className="work-hub__title">
            Four ways to work together. <br />
            One thing in common: real outcomes.
          </h1>
          <p className="work-hub__subtitle">
            I keep my services tight on purpose. Pick the pathway that matches what
            you need this quarter. Each has its own intake.
          </p>
        </header>

        <section className="work-hub__grid container">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            return (
              <Link key={p.to} to={p.to} className="work-card">
                <div className="work-card__top">
                  <div className="work-card__icon">
                    <Icon size={28} strokeWidth={1.6} />
                  </div>
                  <p className="work-card__stat">{p.valueStat}</p>
                </div>
                <h2 className="work-card__title">{p.title}</h2>
                <p className="work-card__body">{p.body}</p>
                <span className="work-card__cta">
                  {p.cta} <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}

          {/* Study Hall: separate funnel, not a form */}
          <Link to="/agenticstudyhall" className="work-card work-card--alt">
            <div className="work-card__top">
              <div className="work-card__icon work-card__icon--alt">
                <GraduationCap size={28} strokeWidth={1.6} />
              </div>
              <p className="work-card__stat">For self-directed learners</p>
            </div>
            <h2 className="work-card__title">Agentic Study Hall</h2>
            <p className="work-card__body">
              Cohort + insider tiers for ongoing AI literacy. This is the membership
              path. Separate from one-on-one work.
            </p>
            <span className="work-card__cta">
              Visit Study Hall <ArrowRight size={16} />
            </span>
          </Link>
        </section>

        <section className="work-hub__cta-band container">
          <h3>Not sure which pathway fits?</h3>
          <p>
            Send a general note and I will route you to the right pathway myself.
          </p>
          <Link to="/contact" className="btn btn--secondary">
            Send a general note
          </Link>
        </section>
      </main>
    </>
  );
}
