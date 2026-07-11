/* ═══ WhatsNextPanel — completion-screen recommender ═══
 *
 * Renders 2-3 related modules under "Keep the streak going."
 * Ranks the published catalog by tag overlap with the current module,
 * then falls back to recency. Excludes the current module.
 *
 * Lane 2 mounts this inside `src/pages/community/Module.tsx` once a
 * learner finishes a module — the completion screen replaces dead-ends
 * with a streak-preserving next step.
 *
 * Pattern: Duolingo's "keep your streak going" post-lesson nudge,
 * Mobbin pattern — the "what next?" surface that turns a single-module
 * read into a session.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock } from 'lucide-react';
import { listPublishedModules } from '../../data/learnStore';
import type { LearnModule } from '../../types/learn';
import './WhatsNextPanel.css';

interface WhatsNextPanelProps {
  currentModuleId: string;
  currentModuleTags?: string[];
}

interface Ranked {
  module: LearnModule;
  score: number;
}

function rank(
  modules: LearnModule[],
  currentModuleId: string,
  currentTags: string[]
): LearnModule[] {
  const tagSet = new Set(currentTags.map((t) => t.toLowerCase()));
  const ranked: Ranked[] = modules
    .filter((m) => m.id !== currentModuleId)
    .map((m) => {
      const overlap = (m.tags ?? []).reduce(
        (n, t) => n + (tagSet.has(t.toLowerCase()) ? 1 : 0),
        0
      );
      const recencyMs = m.published_at ? new Date(m.published_at).getTime() : 0;
      // Tag overlap dominates; recency breaks ties.
      return { module: m, score: overlap * 1e13 + recencyMs };
    })
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, 3).map((r) => r.module);
}

export default function WhatsNextPanel({
  currentModuleId,
  currentModuleTags,
}: WhatsNextPanelProps) {
  const [picks, setPicks] = useState<LearnModule[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listPublishedModules().then((all) => {
      if (cancelled) return;
      setPicks(rank(all, currentModuleId, currentModuleTags ?? []));
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [currentModuleId, currentModuleTags]);

  if (!loaded || picks.length === 0) return null;

  return (
    <section className="whats-next" aria-labelledby="whats-next-title">
      <header className="whats-next__head">
        <Flame size={16} className="whats-next__icon" />
        <h2 id="whats-next-title" className="whats-next__title">
          Keep the streak going.
        </h2>
      </header>
      <div className="whats-next__grid">
        {picks.map((m) => (
          <Link
            key={m.id}
            to={`/community/learn/${m.slug}`}
            className="whats-next__card"
          >
            <span className="whats-next__role">{m.required_role}</span>
            <h3 className="whats-next__card-title">{m.title}</h3>
            <p className="whats-next__hook">{m.hook}</p>
            <footer className="whats-next__foot">
              <span className="whats-next__min">
                <Clock size={11} /> {m.estimated_minutes} min
              </span>
              <span className="whats-next__xp">+{m.xp_reward} Skill Points</span>
            </footer>
          </Link>
        ))}
      </div>
    </section>
  );
}
