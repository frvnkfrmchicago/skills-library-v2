import { MODULES } from '../../data/modules';
import { Notebook, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import './ModuleEmbed.css';

interface ModuleEmbedProps {
  id: string;
}

/**
 * Embeddable module preview for use inside blog posts.
 * Usage in blog content: render <ModuleEmbed id="ai-foundations" /> inline.
 */
export default function ModuleEmbed({ id }: ModuleEmbedProps) {
  const mod = MODULES.find((m) => m.id === id);

  if (!mod) {
    return null; // silently skip unknown module IDs
  }

  const isReleased = new Date(mod.releaseDate) <= new Date();

  return (
    <div className="module-embed liquid-glass">
      <div className="module-embed__header">
        <div className="module-embed__icon">
          <Notebook size={24} weight="duotone" />
        </div>
        <div>
          <span className="module-embed__label">
            {mod.tier === 'free' ? 'Free Module' : 'Pro Module'}
          </span>
          <h4 className="module-embed__title">{mod.title}</h4>
        </div>
      </div>
      <p className="module-embed__desc">{mod.description}</p>
      <div className="module-embed__meta">
        <span>{mod.lessons.length} lessons</span>
        <span className="module-embed__dot">·</span>
        <span>{mod.track}</span>
      </div>
      {isReleased && (
        <Link
          to={`/agenticstudyhall#${mod.id}`}
          className="module-embed__cta"
        >
          View module <ArrowRight size={14} weight="bold" />
        </Link>
      )}
    </div>
  );
}
