import { useSyncExternalStore } from 'react';

function getProgress(): number {
  const top = window.scrollY;
  const doc = document.documentElement.scrollHeight - window.innerHeight;
  if (doc <= 0) return 0;
  return Math.min(1, Math.max(0, top / doc));
}

function subscribe(cb: () => void) {
  window.addEventListener('scroll', cb, { passive: true });
  window.addEventListener('resize', cb);
  return () => {
    window.removeEventListener('scroll', cb);
    window.removeEventListener('resize', cb);
  };
}

export function useWindowScrollProgress(): number {
  return useSyncExternalStore(subscribe, getProgress, () => 0);
}
