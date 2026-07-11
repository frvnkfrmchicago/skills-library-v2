import React from 'react';
import { Sparkles } from 'lucide-react';
import './InteractiveHeader.css';

interface InteractiveHeaderProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeIcon?: React.ReactNode;
  stats?: { label: string; value: string | number; icon?: React.ReactNode }[];
}

/**
 * Page header for the study hall. Solid, high-contrast surface (no glassmorphism,
 * no grey mush) per the Hermes design system. Title + subtitle + role badge + stats.
 */
export default function InteractiveHeader({
  title,
  subtitle,
  badgeText,
  badgeIcon,
  stats,
}: InteractiveHeaderProps) {
  return (
    <header className="ihead">
      <div className="ihead__main">
        {badgeText && (
          <span className="ihead__badge">
            {badgeIcon || <Sparkles size={12} />}
            {badgeText}
          </span>
        )}
        <h1 className="ihead__title">{title}</h1>
        <p className="ihead__subtitle">{subtitle}</p>

        {stats && stats.length > 0 && (
          <div className="ihead__stats">
            {stats.map((s, i) => (
              <div key={i} className="ihead__stat">
                <span className="ihead__stat-label">
                  {s.icon}
                  {s.label}
                </span>
                <span className="ihead__stat-value">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="ihead__media" aria-hidden="true">
        <img src="/images/about/wave-face.webp" alt="" className="ihead__face" />
      </div>
    </header>
  );
}
