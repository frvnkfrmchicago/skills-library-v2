import { useEffect, useState, useRef, useCallback } from 'react';
import type { LandingSectionId } from './landingIds';

export function useLandingActiveSection(
  ids: LandingSectionId[],
  opts: { minScrollY?: number; rootMargin?: string; threshold?: number } = {},
): LandingSectionId | null {
  const { minScrollY = 0, rootMargin = '-20% 0px -60% 0px', threshold = 0.05 } = opts;
  const [active, setActive] = useState<LandingSectionId | null>(null);
  const visible = useRef(new Set<LandingSectionId>());

  const handler = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        const id = entry.target.id as LandingSectionId;
        if (entry.isIntersecting) visible.current.add(id);
        else visible.current.delete(id);
      }
      if (window.scrollY < minScrollY) {
        setActive(null);
        return;
      }
      const ordered = ids.find((id) => visible.current.has(id)) ?? null;
      setActive(ordered);
    },
    [ids, minScrollY],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handler, { rootMargin, threshold });
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids, handler, rootMargin, threshold]);

  return active;
}
