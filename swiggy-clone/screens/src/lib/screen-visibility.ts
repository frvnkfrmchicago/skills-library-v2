/** Per-screen sidebar thumbnail show/hide (rows always stay in the list). */

const STORAGE_KEY = 'swiggy_thumbnail_visibility';

export type VisibilityMap = Record<string, boolean>;

export function loadVisibilityMap(): VisibilityMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as VisibilityMap;
  } catch {
    return {};
  }
}

export function saveVisibilityMap(map: VisibilityMap): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Thumbnail visible unless user explicitly hid it. */
export function isThumbnailVisible(path: string, map: VisibilityMap): boolean {
  if (path in map) return map[path] !== false;
  return true;
}

export function toggleThumbnailVisibility(path: string, map: VisibilityMap): VisibilityMap {
  const current = isThumbnailVisible(path, map);
  const next = { ...map, [path]: !current };
  saveVisibilityMap(next);
  return next;
}
