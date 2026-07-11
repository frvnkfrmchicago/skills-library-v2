import { ArrowUpRight } from 'lucide-react';
import { useStaggerReveal } from '../../hooks/useGSAP';
import './ProjectsGrid.css';

import shipFreeImg from '../../assets/projects/shipfreeapis.webp';
import toolchainImg from '../../assets/projects/toolchain.webp';
import tradingIntelImg from '../../assets/projects/trading-intel.webp';

const PROJECTS = [
  {
    title: 'Ship Free APIs',
    desc: 'Open-source API toolkit for developers who want to ship fast without vendor lock-in.',
    tags: ['Vibe Coding', 'Open Source'],
    href: 'https://shipfreeapis.vercel.app/',
    image: shipFreeImg,
  },
  {
    title: 'Toolchain',
    desc: 'AI-powered developer toolkit with RAG search and intelligent documentation.',
    tags: ['AI Integration', 'Developer Tools'],
    href: 'https://toolchain.vercel.app/',
    image: toolchainImg,
  },
  {
    title: 'Trading Intel Dashboard',
    desc: 'Real-time market intelligence dashboard built with AI-driven analysis and clean data viz.',
    tags: ['Vibe Coding', 'Data Viz'],
    href: 'https://trading-intel-dashboard.vercel.app/',
    image: tradingIntelImg,
  },
];

export default function ProjectsGrid() {
  const containerRef = useStaggerReveal('.project-card', {
    stagger: 0.12,
    y: 50,
    duration: 0.7,
  });

  return (
    <section className="projects section" ref={containerRef}>
      <div className="container">
        <div className="projects__header">
          <p className="text-uppercase text-accent-blue">Latest</p>
          <h2 className="projects__title">
            <span className="text-accent-blue">Vibe Coding</span> &amp; Vibe Marketing Projects
          </h2>
        </div>

        <div className="projects__grid">
          {PROJECTS.map((project, i) => (
            <a
              key={project.title}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`project-card card-tilt border-glow ${i === 0 ? 'project-card--featured' : ''}`}
            >
              <div className="project-card__image">
                <img
                  src={project.image}
                  alt={`${project.title} screenshot`}
                  className="project-card__img"
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={800}
                />
              </div>
              <div className="project-card__body">
                <div className="project-card__tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="project-card__tag">{tag}</span>
                  ))}
                </div>
                <h3 className="project-card__title">
                  {project.title}
                  <ArrowUpRight size={18} className="project-card__arrow" />
                </h3>
                <p className="project-card__desc">{project.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
