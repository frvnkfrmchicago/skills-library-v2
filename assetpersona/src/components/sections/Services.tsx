import { Brain, Plugs, Code, Palette, UserCircle } from '@phosphor-icons/react';
import { useStaggerReveal } from '../../hooks/useGSAP';
import servicesBg from '../../assets/services-bg.webp';
import './Services.css';

const SERVICES = [
  {
    icon: Brain,
    title: 'AI Literacy Training',
    desc: 'We break down complex AI concepts into clear, practical knowledge. Your team walks away with the skills to use AI tools every day, not just talk about them.',
    accent: 'salmon' as const,
  },
  {
    icon: Plugs,
    title: 'AI Integration',
    desc: 'We identify where AI fits into your existing operations, build a roadmap, and implement it. Your workflows get faster and your team stays in control.',
    accent: 'blue' as const,
  },
  {
    icon: Code,
    title: 'Vibe Coding Strategy',
    desc: 'We use AI to build functional prototypes and validate concepts before you commit resources. Your idea goes from conversation to working demo in days.',
    accent: 'salmon' as const,
  },
  {
    icon: Palette,
    title: 'Vibe Marketing Design',
    desc: 'We integrate AI into your marketing strategy. We research your market, design your content, and build campaigns that get attention without looking generic.',
    accent: 'blue' as const,
  },
  {
    icon: UserCircle,
    title: 'Custom AI Avatar Creation',
    desc: 'We design digital AI personas for your brand, from visual concept to voice cloning to animated characters. Your brand gets a face that people remember.',
    accent: 'salmon' as const,
  },
];

export default function Services() {
  const containerRef = useStaggerReveal('.service-card', {
    stagger: 0.1,
    y: 40,
    duration: 0.7,
  });

  return (
    <section className="services section section--alt" ref={containerRef}>
      <img
        src={servicesBg}
        alt=""
        aria-hidden="true"
        className="services__bg-image"
        loading="lazy"
        decoding="async"
        width={1920}
        height={1080}
      />
      <div className="container services__content">
        <p className="text-uppercase text-accent-blue">Tailored Solutions</p>
        <h2 className="services__title">What We Do</h2>

        <div className="services__grid">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className={`service-card border-glow service-card--${service.accent}`}
            >
              <div className={`service-card__icon-wrap service-card__icon-wrap--${service.accent}`}>
                <service.icon size={28} weight="duotone" />
              </div>
              <h3 className="service-card__title">{service.title}</h3>
              <p className="service-card__desc">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
