import { useEffect, useState } from 'react';
import { Flame, Snowflake, Trophy } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { getStreakDetails } from '../../data/leaguesStore';
import type { StreakDetails } from '../../data/leaguesStore';
import './StreakCard.css';

export default function StreakCard() {
  const { user, isBypass, bypassRole } = useAuth();
  const [streak, setStreak] = useState<StreakDetails | null>(null);

  useEffect(() => {
    const uid = user?.id ?? (isBypass ? `bypass-${bypassRole}` : null);
    if (!uid) return;
    getStreakDetails(uid).then(setStreak);
  }, [user?.id, isBypass, bypassRole]);

  if (!streak) {
    return (
      <div className="streak-card streak-card--empty">
        <Flame size={20} />
        <div>
          <p className="streak-card__count">Sign in to start a streak</p>
          <p className="streak-card__sub">Complete one module to begin.</p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const completedToday = streak.last_completed_on === today;

  // Generate last 7 days for calendar view
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reverse();

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="streak-card streak-card--vertical">
      <div className="streak-card__header">
        <div className={`streak-card__flame ${completedToday ? 'streak-card__flame--lit' : ''}`}>
          <Flame size={22} strokeWidth={1.6} />
        </div>
        <div className="streak-card__body">
          <div className="streak-card__row">
            <span className="streak-card__count">{streak.current_count}-day streak</span>
            <span className="streak-card__longest">
              <Trophy size={11} /> longest {streak.longest_count}
            </span>
          </div>
          <div className="streak-card__row streak-card__row--meta">
            <span className={completedToday ? 'streak-card__today is-done' : 'streak-card__today'}>
              {completedToday ? 'Today: complete' : 'Today: not yet'}
            </span>
            <span className="streak-card__freezes">
              <Snowflake size={11} /> {streak.freeze_days_available} freeze
              {streak.freeze_days_available === 1 ? '' : 's'} available
            </span>
          </div>
        </div>
      </div>
      <div className="streak-card__calendar">
        {last7Days.map((dateStr) => {
          const date = new Date(dateStr + 'T00:00:00');
          const isCompleted = (streak.calendar_days ?? []).includes(dateStr);
          const isToday = dateStr === today;
          return (
            <div key={dateStr} className={`streak-card__day-cell ${isCompleted ? 'is-completed' : ''} ${isToday ? 'is-today' : ''}`}>
              <span className="streak-card__day-name">{dayNames[date.getDay()]}</span>
              <div className="streak-card__day-dot" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

