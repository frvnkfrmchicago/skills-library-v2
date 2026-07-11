import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Lightning, Brain, Rocket } from '@phosphor-icons/react';
import { useStaggerReveal } from '../../hooks/useGSAP';
import './StudyHallPreview.css';

const TRACKS = [
  {
    icon: <Brain size={28} weight="duotone" />,
    title: 'AI Literacy',
    desc: 'Understand what AI is, how it works, and why it matters. No code required.',
    gradient: 'linear-gradient(135deg, rgba(163, 211, 230, 0.15), rgba(163, 211, 230, 0.03))',
  },
  {
    icon: <Lightning size={28} weight="duotone" />,
    title: 'Prompt Engineering',
    desc: 'Write prompts that get real results. Frameworks that work across any AI tool.',
    gradient: 'linear-gradient(135deg, rgba(224, 140, 140, 0.15), rgba(224, 140, 140, 0.03))',
  },
  {
    icon: <Rocket size={28} weight="duotone" />,
    title: 'Vibe Coding',
    desc: 'Build real apps with AI as your co-pilot. Ship to production. No CS degree required.',
    gradient: 'linear-gradient(135deg, rgba(163, 211, 230, 0.12), rgba(224, 140, 140, 0.08))',
  },
];

export default function StudyHallPreview() {
  const containerRef = useStaggerReveal('.school-preview__track', {
    stagger: 0.12,
    y: 40,
    duration: 0.7,
  });

  return (
    <section className="school-preview section" ref={containerRef}>
      <div className="container">
        <div className="school-preview__header">
          <h2 className="school-preview__title">
            Learn AI. <span className="text-accent-gold">Your Way.</span>
          </h2>
          <p className="school-preview__subtitle">
            Weekly modules, hands-on exercises, and real projects.
            Start free. Go deep when you're ready.
          </p>
        </div>

        <div className="school-preview__tracks">
          {TRACKS.map((track) => (
            <div
              key={track.title}
              className="school-preview__track"
              style={{ background: track.gradient }}
            >
              <div className="school-preview__track-icon">{track.icon}</div>
              <h3 className="school-preview__track-title">{track.title}</h3>
              <p className="school-preview__track-desc">{track.desc}</p>
            </div>
          ))}
        </div>

        <div className="school-preview__footer">
          <Link to="/login?mode=signup" className="btn btn--primary">
            Join Free <ArrowRight size={16} />
          </Link>
          <Link to="/agenticstudyhall" className="btn btn--ghost">
            Explore Curriculum <ArrowRight size={16} />
          </Link>
          <p className="school-preview__note">
            Free tier available · No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
