/* ═══ EVENT TOGGLE — Upcoming / Past ═══ */
import './EventToggle.css';

interface EventToggleProps {
  active: 'upcoming' | 'past';
  onChange: (tab: 'upcoming' | 'past') => void;
}

export default function EventToggle({ active, onChange }: EventToggleProps) {
  return (
    <div className="event-toggle" role="tablist" aria-label="Event filter">
      <button
        role="tab"
        aria-selected={active === 'upcoming'}
        className={`event-toggle__btn ${active === 'upcoming' ? 'event-toggle__btn--active' : ''}`}
        onClick={() => onChange('upcoming')}
      >
        Upcoming
      </button>
      <button
        role="tab"
        aria-selected={active === 'past'}
        className={`event-toggle__btn ${active === 'past' ? 'event-toggle__btn--active' : ''}`}
        onClick={() => onChange('past')}
      >
        Past
      </button>
    </div>
  );
}
