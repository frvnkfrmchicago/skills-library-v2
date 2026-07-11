/* ═══ AchievementsGrid — badge wall ═══
 * Empty-state friendly. Shows earned badges + locked previews.
 */
import { Lock, Trophy } from 'lucide-react';
import type { Achievement, AchievementBadge } from '../../types/learn';
import './AchievementsGrid.css';

interface AchievementsGridProps {
  earned: Achievement[];
  /** Optional: render a fixed catalog of all available badges with locked state. */
  catalog?: AchievementBadge[];
}

const BADGE_LABEL: Record<AchievementBadge, { label: string; hint: string }> = {
  first_drill: { label: 'First Drill', hint: 'Finish your first daily drill' },
  first_news_drop: { label: 'News Hunter', hint: 'Complete a news-drop module' },
  first_practice: { label: 'Hands On', hint: 'Submit a practice attempt' },
  first_reflection: { label: 'Reflective', hint: 'Write a reflection over 20 words' },
  first_tutor_question: { label: 'Curious One', hint: 'Ask the AI tutor a question' },
  three_in_a_row: { label: 'Three in a Row', hint: 'Finish 3 modules in 3 days' },
  week_streak: { label: '7-Day Streak', hint: 'Show up 7 days in a row' },
  month_streak: { label: '30-Day Streak', hint: 'Show up 30 days in a row' },
  first_pathway: { label: 'Pathway', hint: 'Complete your first pathway' },
  crafter_unlocked: { label: 'AI Crafter', hint: 'Reach the Crafter role' },
  architect_unlocked: { label: 'Context Architect', hint: 'Reach the Architect role' },
  producer_unlocked: { label: 'AI Producer', hint: 'Reach the Producer role' },
  ten_modules: { label: 'Ten Down', hint: 'Complete 10 modules' },
  fifty_modules: { label: 'Fifty Down', hint: 'Complete 50 modules' },
};

const DEFAULT_CATALOG: AchievementBadge[] = [
  'first_drill',
  'first_practice',
  'first_reflection',
  'first_tutor_question',
  'first_news_drop',
  'three_in_a_row',
  'week_streak',
  'month_streak',
  'crafter_unlocked',
  'architect_unlocked',
  'producer_unlocked',
  'ten_modules',
];

export default function AchievementsGrid({ earned, catalog = DEFAULT_CATALOG }: AchievementsGridProps) {
  const earnedMap = new Map(earned.map((a) => [a.badge, a]));

  if (earned.length === 0) {
    return (
      <section className="ach-grid ach-grid--empty">
        <Trophy size={28} />
        <h3>No badges yet</h3>
        <p>Complete a module to earn your first one.</p>
      </section>
    );
  }

  return (
    <section className="ach-grid" aria-label="Achievements">
      <ul>
        {catalog.map((b) => {
          const meta = BADGE_LABEL[b];
          const got = earnedMap.get(b);
          return (
            <li key={b} className={got ? 'is-earned' : 'is-locked'}>
              {got ? <Trophy size={20} /> : <Lock size={16} />}
              <strong>{meta.label}</strong>
              <span>{meta.hint}</span>
              {got && (
                <time dateTime={got.earned_at}>
                  {new Date(got.earned_at).toLocaleDateString()}
                </time>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
