/* ═══ TodaysDrillCarousel — swipe between Today + 2 fallbacks ═══
 *
 * Per pattern-referencing IAAA against TikTok + Substack daily-drop:
 *   - Native swipe with arrow-key + dot fallback (visible backup)
 *   - Snap to card boundaries
 *   - Reduced-motion friendly
 *
 * Slides:
 *   1. Today's pinned drill (admin-pinned)
 *   2. Smart "next for you" (Engagement Layer Agent 5 wires the algorithm in)
 *   3. Recent News Drop (most recent news_drop type)
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Zap, Sparkles, ArrowRight } from 'lucide-react';
import type { LearnModule } from '../../types/learn';
import './TodaysDrillCarousel.css';

interface SlideDef {
  id: string;
  module: LearnModule;
  badge: 'today' | 'next' | 'news';
  caption: string;
}

interface TodaysDrillCarouselProps {
  slides: SlideDef[];
}

const BADGE_LABEL: Record<SlideDef['badge'], string> = {
  today: 'TODAY · PINNED BY FRANK',
  next: 'RECOMMENDED FOR YOU',
  news: 'FRESH NEWS DROP',
};

const BADGE_ICON: Record<SlideDef['badge'], typeof Zap> = {
  today: Zap,
  next: Sparkles,
  news: Clock,
};

export default function TodaysDrillCarousel({ slides }: TodaysDrillCarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const scrollTo = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[idx] as HTMLElement | undefined;
    if (!child) return;
    track.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
  }, []);

  // Sync active index from scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const slot = track.scrollLeft / (track.clientWidth || 1);
      setActive(Math.round(slot));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  // Keyboard nav (arrow keys when carousel has focus)
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight' && active < slides.length - 1) {
      scrollTo(active + 1);
    } else if (e.key === 'ArrowLeft' && active > 0) {
      scrollTo(active - 1);
    }
  }

  if (slides.length === 0) return null;

  return (
    <section className="drill-carousel" aria-roledescription="carousel" aria-label="Today's drill">
      <div
        ref={trackRef}
        className="drill-carousel__track"
        tabIndex={0}
        role="region"
        aria-label="Drill candidates"
        onKeyDown={onKeyDown}
      >
        {slides.map((s) => {
          const Icon = BADGE_ICON[s.badge];
          return (
            <article key={s.id} className={`drill-carousel__slide drill-carousel__slide--${s.badge}`}>
              <header className="drill-carousel__head">
                <span className="drill-carousel__badge">
                  <Icon size={11} /> {BADGE_LABEL[s.badge]}
                </span>
                <span className="drill-carousel__caption">{s.caption}</span>
              </header>
              <h2>{s.module.title}</h2>
              <p className="drill-carousel__hook">{s.module.hook}</p>
              <footer>
                <span className="drill-carousel__min"><Clock size={12} /> {s.module.estimated_minutes} min</span>
                <span className="drill-carousel__xp">+{s.module.xp_reward} Skill Points</span>
                <Link to={`/community/learn/${s.module.slug}`} className="btn btn--primary btn--sm">
                  Start <ArrowRight size={14} />
                </Link>
              </footer>
            </article>
          );
        })}
      </div>

      {slides.length > 1 && (
        <div className="drill-carousel__dots" role="tablist" aria-label="Carousel pagination">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show slide ${i + 1}`}
              className={`drill-carousel__dot ${i === active ? 'is-active' : ''}`}
              onClick={() => scrollTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
