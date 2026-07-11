/* ═══ ModuleTeaser — public preview card with sign-up gate ═══
 *
 * Lane 2 of AP-ENGAGEMENT-LOOP-2026-05. Rendered on the public /learn/:slug
 * route. Non-members see hook + outcome only; the full body stays behind the
 * member gate at /community/learn/:slug. CTA routes through /login with
 * mode=signup + redirect so post-signup returns the visitor to the full
 * module — closing the loop.
 *
 * Mobile: sticky CTA at the bottom of the viewport so the conversion target
 * is always one tap away regardless of scroll position.
 */

import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Sparkles,
  Tag,
  Trophy,
  BookOpen,
  Newspaper,
  GraduationCap,
  Lightbulb,
  Rocket,
} from 'lucide-react';
import type { ModuleTeaserRow } from '../../data/learningPosts';
import './ModuleTeaser.css';

const TYPE_ICON = {
  daily_drill: Lightbulb,
  news_drop: Newspaper,
  concept: BookOpen,
  role_pathway: GraduationCap,
  project: Rocket,
  quiz: Lightbulb,
  match_game: GraduationCap,
} as const;

const TYPE_LABEL = {
  daily_drill: 'Daily Drill',
  news_drop: 'News Drop',
  concept: 'Concept',
  role_pathway: 'Pathway',
  project: 'Project',
  quiz: 'Practice Quiz',
  match_game: 'Terminology Match Game',
} as const;

interface ModuleTeaserProps {
  module: ModuleTeaserRow;
  /** When the visitor arrived via a /learned/:shareId card, surface who they
   *  came from so the social proof carries through. */
  referrerName?: string | null;
}

export default function ModuleTeaser({ module, referrerName }: ModuleTeaserProps) {
  const Icon = TYPE_ICON[module.type] ?? BookOpen;
  const typeLabel = TYPE_LABEL[module.type] ?? 'Module';
  const signupHref = `/login?mode=signup&redirect=${encodeURIComponent(`/community/learn/${module.slug}`)}`;

  return (
    <article className="module-teaser" itemScope itemType="https://schema.org/LearningResource">
      {referrerName && (
        <p className="module-teaser__referrer">
          <Sparkles size={12} aria-hidden="true" />
          {referrerName} shared this with you
        </p>
      )}

      <header className="module-teaser__head">
        <span className="module-teaser__type">
          <Icon size={14} aria-hidden="true" /> {typeLabel}
        </span>
        <span className="module-teaser__role">For {module.required_role}</span>
      </header>

      <h1 className="module-teaser__title" itemProp="name">
        {module.title}
      </h1>

      <p className="module-teaser__hook" itemProp="description">
        {module.hook}
      </p>

      <div className="module-teaser__outcome">
        <Sparkles size={14} aria-hidden="true" />
        <span>
          <strong>What you'll walk away with: </strong>
          {module.objective}
        </span>
      </div>

      <ul className="module-teaser__meta" aria-label="Module details">
        <li className="module-teaser__meta-item">
          <Clock size={14} aria-hidden="true" /> {module.estimated_minutes} min
        </li>
        <li className="module-teaser__meta-item">
          <Trophy size={14} aria-hidden="true" /> +{module.xp_reward} Skill Points
        </li>
        {module.tags?.length > 0 && (
          <li className="module-teaser__meta-item">
            <Tag size={14} aria-hidden="true" />
            {module.tags.slice(0, 3).join(' · ')}
          </li>
        )}
      </ul>

      {module.cover_image && (
        <div className="module-teaser__cover">
          <img
            src={module.cover_image}
            alt={module.title}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <div className="module-teaser__gate">
        <h2 className="module-teaser__gate-title">Sign up to learn this module</h2>
        <p className="module-teaser__gate-copy">
          Asset Persona membership is free. You get the full module, the
          practice prompt, the AI tutor, and credit toward your role ladder.
        </p>
        <Link to={signupHref} className="btn btn--primary module-teaser__cta">
          Start this module
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <p className="module-teaser__signin">
          Already a member?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(`/community/learn/${module.slug}`)}`}>
            Sign in to continue
          </Link>
        </p>
      </div>

      <div
        className="module-teaser__sticky"
        role="region"
        aria-label="Sign up to learn this module"
      >
        <span className="module-teaser__sticky-label">
          <strong>{module.title}</strong>
          <span>{module.estimated_minutes} min · +{module.xp_reward} Skill Points</span>
        </span>
        <Link
          to={signupHref}
          className="btn btn--primary module-teaser__sticky-cta"
        >
          Start
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
