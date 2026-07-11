import { useEffect, useMemo, useState } from 'react';
import type { LandingSectionId } from './landingIds';
import { LANDING_IDS } from './landingIds';
import { useLandingActiveSection } from './useLandingActiveSection';
import './FloatingDock.css';

type DockItem = {
  id: LandingSectionId;
  label: string;
};

const ITEMS: DockItem[] = [
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

export default function FloatingDock() {
  const ids = useMemo(() => ITEMS.map((i) => i.id) as LandingSectionId[], []);
  const active = useLandingActiveSection(ids, { minScrollY: 220 });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 360);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`floating-dock ${visible ? 'floating-dock--visible' : ''}`} aria-label="Section navigation">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`floating-dock__item ${active === item.id ? 'floating-dock__item--active' : ''}`}
          onClick={() => scrollToId(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

