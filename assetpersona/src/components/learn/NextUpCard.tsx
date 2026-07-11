/* ═══ NextUpCard — "what to do next" surface ═══
 *
 * Renders the top-ranked recommendation with a one-line reason.
 * Per pattern-referencing IAAA against Duolingo's "next lesson" pattern:
 * one option, big CTA, never decision paralysis.
 */
import { Link } from 'react-router-dom';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import type { LearnModule } from '../../types/learn';
import './NextUpCard.css';

interface NextUpCardProps {
  module: LearnModule;
  reason?: string;
  /** Optional override for the heading. */
  heading?: string;
}

export default function NextUpCard({ module, reason, heading = 'Next up for you' }: NextUpCardProps) {
  return (
    <article className="nextup-card" aria-labelledby={`nextup-${module.id}`}>
      <header>
        <span className="nextup-card__eyebrow">
          <Sparkles size={11} /> {heading}
        </span>
        {reason && <span className="nextup-card__reason">{reason}</span>}
      </header>
      <h3 id={`nextup-${module.id}`}>{module.title}</h3>
      <p className="nextup-card__hook">{module.hook}</p>
      <footer>
        <span className="nextup-card__min">
          <Clock size={12} /> {module.estimated_minutes} min · +{module.xp_reward} Skill Points
        </span>
        <Link to={`/community/learn/${module.slug}`} className="btn btn--primary btn--sm">
          Start <ArrowRight size={14} />
        </Link>
      </footer>
    </article>
  );
}
