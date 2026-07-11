import { useEffect, useMemo, useRef, useState } from 'react';
import type { LandingSectionId } from './landingIds';
import { LANDING_IDS } from './landingIds';
import { useLandingActiveSection } from './useLandingActiveSection';
import './ChapterNav.css';

type Chapter = {
  id: LandingSectionId;
  label: string;
};

const CHAPTERS: Chapter[] = [
  { id: LANDING_IDS.hero, label: 'Discover' },
  { id: LANDING_IDS.paths, label: 'Paths' },
  { id: LANDING_IDS.curriculum, label: 'Curriculum' },
  { id: LANDING_IDS.products, label: 'Products' },
  { id: LANDING_IDS.projects, label: 'Work' },
  { id: LANDING_IDS.insights, label: 'Insights' },
  { id: LANDING_IDS.start, label: 'Start' },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export default function ChapterNav() {
  const ids = useMemo(() => CHAPTERS.map((c) => c.id) as LandingSectionId[], []);
  const active = useLandingActiveSection(ids, { minScrollY: 120 });

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (raf.current) return;
      raf.current = window.requestAnimationFrame(() => {
        raf.current = null;
        setVisible(window.scrollY > 160);

        if (!active) {
          setProgress(0);
          return;
        }
        const el = document.getElementById(active);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const h = Math.max(1, r.height);
        const p = clamp01((window.innerHeight * 0.25 - r.top) / h);
        setProgress(p);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, [active]);

  return (
    <nav className={`chapterNav ${visible ? 'chapterNav--visible' : ''}`} aria-label="Section navigation">
      <div className="chapterNav__rail" aria-hidden="true">
        <div className="chapterNav__meter" style={{ ['--chapter-progress' as never]: String(progress) }} />
      </div>
      <div className="chapterNav__row">
        {CHAPTERS.map((c) => {
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={`chapterNav__item ${isActive ? 'chapterNav__item--active' : ''}`}
              onClick={() => scrollToId(c.id)}
            >
              <span className="chapterNav__dot" aria-hidden="true" />
              <span className="chapterNav__label">{c.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

