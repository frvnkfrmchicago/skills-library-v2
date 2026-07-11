import { Link } from 'react-router-dom';
import { ArrowRight, Play, Clock } from 'lucide-react';
import { MonitorPlay } from '@phosphor-icons/react';
import { useStaggerReveal } from '../../hooks/useGSAP';
import { RECORDINGS } from '../../data/recordings';
import './RecordingsPreview.css';

const latestEpisodes = RECORDINGS.slice(0, 3);

export default function RecordingsPreview() {
  const containerRef = useStaggerReveal('.recordings-preview__card', {
    stagger: 0.12,
    y: 40,
    duration: 0.7,
  });

  return (
    <section className="recordings-preview section" ref={containerRef}>
      <div className="container">
        <div className="recordings-preview__header">
          <p className="text-uppercase text-accent-blue">
            <MonitorPlay size={18} weight="duotone" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Talk Through Tech
          </p>
          <h2 className="recordings-preview__title">
            Watch. Learn. <span className="text-accent-salmon">Build.</span>
          </h2>
          <p className="recordings-preview__subtitle">
            Real talk about AI, vibe coding, and the digital economy. New episodes weekly.
          </p>
        </div>

        <div className="recordings-preview__grid">
          {latestEpisodes.map((ep, i) => (
            <div
              key={ep.id}
              className={`recordings-preview__card liquid-glass border-glow ${i === 0 ? 'recordings-preview__card--featured' : ''}`}
            >
              <div className="recordings-preview__thumbnail">
                <div className="recordings-preview__play-icon">
                  <Play size={24} fill="currentColor" />
                </div>
                {ep.featured && <span className="recordings-preview__latest-badge">Latest</span>}
              </div>
              <div className="recordings-preview__body">
                <div className="recordings-preview__meta">
                  <span className="recordings-preview__date">
                    {new Date(ep.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="recordings-preview__duration">
                    <Clock size={12} /> {ep.duration}
                  </span>
                </div>
                <h3 className="recordings-preview__ep-title">{ep.title}</h3>
                <p className="recordings-preview__ep-desc">{ep.description}</p>
                <div className="recordings-preview__tags">
                  {ep.tags.map((tag) => (
                    <span key={tag} className="recordings-preview__tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="recordings-preview__footer">
          <Link to="/recordings" className="recordings-preview__link">
            View All Episodes <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
