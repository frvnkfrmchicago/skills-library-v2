import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Filter, Trophy, Activity, Repeat } from 'lucide-react';
import {
  listPublishedModules,
  getTodaysModule,
  listMyCompletions,
  getCompletionCount,
} from '../../data/learnStore';
import { listDueReviews } from '../../data/masteryStore';
import { useAuth } from '../../context/useAuth';
import StreakCard from '../../components/learn/StreakCard';
import ModuleCard from '../../components/learn/ModuleCard';
import InteractiveHeader from '../../components/layout/InteractiveHeader';
import { LEARNER_ROLE_LADDER, type LearnerRole, type LearnModule, type ModuleType } from '../../types/learn';
import './Learn.css';

function bypassUserId(role: string | null | undefined): string {
  return `bypass-${role ?? 'guest'}`;
}

export default function LearnHub() {
  const { user, profile, isBypass, bypassRole } = useAuth();
  const [modules, setModules] = useState<LearnModule[]>([]);
  const [today, setToday] = useState<LearnModule | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ModuleType>('all');
  // Lane 1 — moduleId → completion count for the social-proof line on cards.
  const [completionCounts, setCompletionCounts] = useState<Record<string, number>>({});
  // AP-STUDYHALL-REBUILD-2026-06 · Lane 3 — module ids whose spaced-repetition
  // review is due today or overdue.
  const [dueReviewIds, setDueReviewIds] = useState<Set<string>>(new Set());

  const userId = user?.id ?? (isBypass ? bypassUserId(bypassRole) : null);
  const myRole: LearnerRole =
    (profile as unknown as { learner_role?: LearnerRole })?.learner_role ?? 'curious';
  const myXp: number = (profile as unknown as { xp?: number })?.xp ?? 0;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listPublishedModules(),
      getTodaysModule(),
      userId ? listMyCompletions(userId) : Promise.resolve([]),
      userId ? listDueReviews(userId) : Promise.resolve([]),
    ]).then(([all, td, myComp, due]) => {
      if (cancelled) return;
      setModules(all);
      setToday(td);
      setCompletedIds(new Set(myComp.map((c) => c.module_id)));
      setDueReviewIds(new Set(due.map((r) => r.module_id)));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Lane 1 — fetch completion counts after modules land. Bypass mode returns
  // deterministic synthetic counts; live mode hits Supabase per id (cheap
  // count-only HEAD requests).
  useEffect(() => {
    if (modules.length === 0) return;
    let cancelled = false;
    Promise.all(
      modules.map((m) =>
        getCompletionCount(m.id).then((n) => [m.id, n] as const)
      )
    ).then((pairs) => {
      if (cancelled) return;
      setCompletionCounts(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [modules]);

  const continueable = useMemo(
    () => modules.filter((m) => !completedIds.has(m.id) && m.id !== today?.id).slice(0, 6),
    [modules, completedIds, today?.id]
  );

  // Spaced-repetition queue: modules the learner finished whose review is now
  // due. Surfacing these is the retention half of the learning loop.
  const dueModules = useMemo(
    () => modules.filter((m) => dueReviewIds.has(m.id)).slice(0, 6),
    [modules, dueReviewIds]
  );

  const newsDrops = useMemo(
    () => modules.filter((m) => m.type === 'news_drop').slice(0, 6),
    [modules]
  );

  const browseFiltered = useMemo(
    () => (filter === 'all' ? modules : modules.filter((m) => m.type === filter)),
    [modules, filter]
  );

  const currentRoleMeta =
    LEARNER_ROLE_LADDER.find((r) => r.role === myRole) ?? LEARNER_ROLE_LADDER[0];
  const nextRoleMeta = LEARNER_ROLE_LADDER.find((r) => r.xp_min > myXp);
  const xpToNext = nextRoleMeta ? nextRoleMeta.xp_min - myXp : 0;

  return (
    <div className="learn-hub">
      <InteractiveHeader
        title="Skill Pathways"
        subtitle="Short, plain-language AI lessons. Real examples, no jargon. Start with the basics and go at your own pace."
        badgeText={currentRoleMeta.label}
        badgeIcon={<Sparkles size={12} />}
        stats={[
          {
            label: 'Total Skill Points',
            value: `${myXp}`,
            icon: <Trophy size={14} className="text-accent-blue" />,
          },
          {
            label: 'Rank Title',
            value: currentRoleMeta.label,
            icon: <Sparkles size={14} className="text-accent-red" />,
          },
          {
            label: 'Next Milestone',
            value: nextRoleMeta ? `${xpToNext} Skill Points to ${nextRoleMeta.label}` : 'Max Rank Reached',
            icon: <Activity size={14} className="text-accent-blue" />,
          },
        ]}
      />

      {/* Main Row: Today's Drill and Activity */}
      <div className="learn-hub__main-row">
        {today ? (
          <div className="learn-hub__today-col">
            <section className="learn-hub__section">
              <header className="learn-hub__section-head">
                <h2>Today's Drill</h2>
                <span className="learn-hub__pill">pinned by Frank</span>
              </header>
              <div className="learn-hub__today">
                <ModuleCard
                  module={today}
                  variant="large"
                  completed={completedIds.has(today.id)}
                  completionCount={completionCounts[today.id]}
                />
              </div>
            </section>
          </div>
        ) : (
          <div className="learn-hub__today-col learn-hub__today-col--empty">
            <section className="learn-hub__section">
              <header className="learn-hub__section-head">
                <h2>Today's Drill</h2>
              </header>
              <div className="learn-hub__empty">
                <p>Check back tomorrow for your next custom drill!</p>
              </div>
            </section>
          </div>
        )}

        <div className="learn-hub__streak-col">
          <section className="learn-hub__section">
            <header className="learn-hub__section-head">
              <h2>Your Activity</h2>
            </header>
            <StreakCard />
          </section>
        </div>
      </div>

      {/* Review due — spaced repetition. Sits above Continue because
          reinforcing what you know is the priority before learning new. */}
      {dueModules.length > 0 && (
        <section className="learn-hub__section learn-hub__section--review">
          <header className="learn-hub__section-head">
            <h2><Repeat size={16} style={{ verticalAlign: '-2px', marginRight: 6 }} />Review due</h2>
            <span className="learn-hub__pill">spaced repetition</span>
          </header>
          <p className="learn-hub__section-blurb">
            A quick re-run locks these in for the long term. Best done today.
          </p>
          <div className="learn-hub__grid">
            {dueModules.map((m) => (
              <ModuleCard
                key={m.id}
                module={m}
                completed={completedIds.has(m.id)}
                completionCount={completionCounts[m.id]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Continue */}
      {continueable.length > 0 && (
        <section className="learn-hub__section">
          <header className="learn-hub__section-head">
            <h2>Continue</h2>
            <span className="learn-hub__count">{continueable.length}</span>
          </header>
          <div className="learn-hub__grid">
            {continueable.map((m) => (
              <ModuleCard
                key={m.id}
                module={m}
                completed={completedIds.has(m.id)}
                completionCount={completionCounts[m.id]}
              />
            ))}
          </div>
        </section>
      )}

      {/* News Drops */}
      {newsDrops.length > 0 && (
        <section className="learn-hub__section">
          <header className="learn-hub__section-head">
            <h2>News Drops</h2>
            <span className="learn-hub__pill">turn news into skill</span>
          </header>
          <div className="learn-hub__grid">
            {newsDrops.map((m) => (
              <ModuleCard
                key={m.id}
                module={m}
                completed={completedIds.has(m.id)}
                completionCount={completionCounts[m.id]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Browse */}
      <section className="learn-hub__section">
        <header className="learn-hub__section-head">
          <h2>Browse all</h2>
          <div className="learn-hub__filter">
            <Filter size={13} />
            <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | ModuleType)}>
              <option value="all">All types</option>
              <option value="daily_drill">Daily Drill</option>
              <option value="news_drop">News Drop</option>
              <option value="concept">Concept</option>
              <option value="role_pathway">Pathway</option>
              <option value="project">Project</option>
            </select>
          </div>
        </header>
        {loading ? (
          <p className="learn-hub__loading">Loading modules…</p>
        ) : browseFiltered.length === 0 ? (
          <div className="learn-hub__empty">
            <p>No modules yet for this filter.</p>
          </div>
        ) : (
          <div className="learn-hub__grid">
            {browseFiltered.map((m) => (
              <ModuleCard
                key={m.id}
                module={m}
                completed={completedIds.has(m.id)}
                completionCount={completionCounts[m.id]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
