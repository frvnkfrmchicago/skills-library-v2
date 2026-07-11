import { Link } from 'react-router-dom';
import { Clock, Sparkles, BookOpen, Newspaper, GraduationCap, Rocket, Lightbulb, Check, Users } from 'lucide-react';
import type { LearnModule, ModuleType } from '../../types/learn';
import './ModuleCard.css';

const TYPE_ICON: Record<ModuleType, typeof BookOpen> = {
  daily_drill: Lightbulb,
  news_drop: Newspaper,
  concept: BookOpen,
  role_pathway: GraduationCap,
  project: Rocket,
  quiz: Lightbulb,
  match_game: GraduationCap,
};

const TYPE_LABEL: Record<ModuleType, string> = {
  daily_drill: 'Daily Drill',
  news_drop: 'News Drop',
  concept: 'Concept',
  role_pathway: 'Pathway',
  project: 'Project',
  quiz: 'Practice Quiz',
  match_game: 'Terminology Match Game',
};

interface ModuleCardProps {
  module: LearnModule;
  variant?: 'default' | 'large';
  completed?: boolean;
  /** Lane 1 — when supplied, renders "· N completed" under the title. */
  completionCount?: number;
}

export default function ModuleCard({ module, variant = 'default', completed, completionCount }: ModuleCardProps) {
  const Icon = TYPE_ICON[module.type];
  return (
    <Link
      to={`/community/learn/${module.slug}`}
      className={`module-card module-card--${variant} ${completed ? 'is-done' : ''}`}
    >
      <header className="module-card__head">
        <span className="module-card__type">
          <Icon size={14} /> {TYPE_LABEL[module.type]}
        </span>
        {completed && (
          <span className="module-card__done"><Check size={12} /> done</span>
        )}
        {!completed && module.generated_by_ai && (
          <span className="module-card__ai"><Sparkles size={12} /> AI</span>
        )}
      </header>
      <h3 className="module-card__title">{module.title}</h3>
      {typeof completionCount === 'number' && completionCount > 0 && (
        <p className="module-card__social">
          <Users size={11} /> · {completionCount.toLocaleString()} completed
        </p>
      )}
      <p className="module-card__hook">{module.hook}</p>
      <footer className="module-card__foot">
        <span className="module-card__role">{module.required_role}</span>
        <span className="module-card__min">
          <Clock size={11} /> {module.estimated_minutes} min
        </span>
        <span className="module-card__xp">+{module.xp_reward} Skill Points</span>
      </footer>
    </Link>
  );
}
