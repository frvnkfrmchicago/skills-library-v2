'use client';

/* ============================================================================
 * notes-store.ts — tiny localStorage-backed note store for the /screens tool
 * ----------------------------------------------------------------------------
 * Lane D of WAVE-SCREENS-PRO-2026-05-25 (contract producer). The /screens dev
 * console had no way to jot a note against a screen or one of its detail
 * sections. This is the zero-infra store behind <ScreenNotes>: a single JSON
 * map persisted at `localStorage["gh_screen_notes"]`, keyed by a caller-supplied
 * string (Lane F passes `screen.path`, and `screen.path + '::' + sectionId`
 * for per-section notes).
 *
 * Design notes:
 *   • SSR-safe — every entry point guards `typeof window`, so importing this in
 *     a Server Component (or pre-hydration) is inert, never throws.
 *   • Same store *family* as `lib/flow-storage.ts` (single STORAGE_KEY, JSON
 *     blob, try/catch around every localStorage touch for private-mode /
 *     quota / WKWebView failures), but deliberately its own key + module so the
 *     dev-only notes never collide with the onboarding flow state.
 *   • A lightweight subscription bus lets multiple mounted consumers (e.g. the
 *     textarea AND a sidebar dirty-dot) stay in sync within the tab, plus the
 *     native `storage` event keeps two tabs in sync.
 *
 * Upgrade path (documented, not built): swap the read/write/remove helpers for
 * a Supabase `screen_notes` table (path PK, body text, updated_at) behind the
 * same getNote/setNote signatures — callers and the hook stay untouched.
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from 'react';

/** localStorage slot holding the whole `{ [key]: body }` map as JSON. */
const STORAGE_KEY = 'swiggy_screen_notes';

/** Autosave debounce — long enough to coalesce typing, short enough to feel instant. */
const AUTOSAVE_MS = 400;

/** How long the transient "Saved" affordance stays lit after a flush. */
const SAVED_FLASH_MS = 1600;

type NotesMap = Record<string, string>;

/* ─────────────────────────────────────────────────────────────────
 * In-tab subscription bus
 *
 * localStorage has no same-tab change event (the native `storage` event only
 * fires in *other* tabs). So consumers in the same tab subscribe here and we
 * notify them on every write. Cross-tab sync is layered on via `storage`.
 * ───────────────────────────────────────────────────────────────── */

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange(): void {
  for (const fn of listeners) {
    try {
      fn();
    } catch {
      /* a misbehaving listener must never break a write */
    }
  }
}

function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/* ─────────────────────────────────────────────────────────────────
 * Raw persistence (SSR-safe, failure-tolerant)
 * ───────────────────────────────────────────────────────────────── */

function readMap(): NotesMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    // Coerce defensively: keep only string values so a corrupt blob can't
    // hand a non-string body back to a <textarea> (React would warn / crash).
    const out: NotesMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'string') out[k] = v;
    }
    return out;
  } catch {
    // Corrupt JSON / blocked storage (private mode, restricted settings).
    return {};
  }
}

function writeMap(map: NotesMap): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Quota / private-mode / WKWebView write failure — notes are a dev-only
    // nicety, so we swallow rather than surface an error to the console UI.
  }
}

/* ─────────────────────────────────────────────────────────────────
 * Public imperative API (the contract Lane F can call directly)
 * ───────────────────────────────────────────────────────────────── */

/** Read the note body for `key`. Returns `''` when unset, SSR, or storage blocked. */
export function getNote(key: string): string {
  if (!key) return '';
  return readMap()[key] ?? '';
}

/**
 * Persist `body` under `key`. An empty/whitespace-only body deletes the entry
 * so the map (and any dirty-dot derived from it) stays truthful. Notifies all
 * in-tab subscribers so a sidebar flag updates without a reload.
 */
export function setNote(key: string, body: string): void {
  if (typeof window === 'undefined' || !key) return;
  const map = readMap();
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    if (!(key in map)) return; // nothing to clear — skip a needless write + emit
    delete map[key];
  } else {
    if (map[key] === body) return; // no-op write — skip
    map[key] = body;
  }
  writeMap(map);
  emitChange();
}

/** True when `key` has a non-empty saved note (drives the dirty-dot affordance). */
export function hasNote(key: string): boolean {
  if (!key) return false;
  const v = readMap()[key];
  return typeof v === 'string' && v.trim().length > 0;
}

/* ─────────────────────────────────────────────────────────────────
 * React hooks
 * ───────────────────────────────────────────────────────────────── */

export interface UseScreenNotes {
  /** Current note body (controlled value for a <textarea>). */
  note: string;
  /** Update the note; autosave is debounced internally. */
  setNote: (body: string) => void;
  /** Transient flag — true briefly right after a debounced save flushes. */
  saved: boolean;
}

/**
 * Stateful note editor for a single `key`, with DEBOUNCED autosave (~400ms) and
 * a transient `saved` flag that lights for ~1.6s after each flush.
 *
 * The hook holds the live draft in React state for instant typing feedback,
 * then commits to the store after the debounce window. It also reconciles when
 * the underlying key changes (switching screens/sections) and when another
 * mounted consumer or tab edits the same key.
 */
export function useScreenNotes(key: string): UseScreenNotes {
  // Lazy init from storage so the first paint shows the persisted note (the
  // initializer is SSR-safe via getNote's window guard → '' on the server).
  const [note, setNoteState] = useState<string>(() => getNote(key));
  const [saved, setSaved] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks the body we last *committed* so external-sync effects can tell a
  // foreign edit apart from an echo of our own pending write.
  const lastCommittedRef = useRef<string>(note);

  const clearDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  // Re-hydrate when the key changes (e.g. user selects a different screen or
  // section). Flush any pending write for the OLD key first so a fast switch
  // never drops an unsaved keystroke.
  useEffect(() => {
    clearDebounce();
    const fresh = getNote(key);
    lastCommittedRef.current = fresh;
    setNoteState(fresh);
    setSaved(false);
    // Intentionally keyed on `key` only — we want a reset exactly when the
    // target note changes, not on every draft keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Keep this editor in sync with writes from elsewhere: another <ScreenNotes>
  // for the same key, the imperative setNote(), or a second browser tab.
  useEffect(() => {
    const reconcile = () => {
      const external = getNote(key);
      if (external !== lastCommittedRef.current) {
        lastCommittedRef.current = external;
        setNoteState(external);
      }
    };
    const unsub = subscribe(reconcile);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) reconcile();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }
    return () => {
      unsub();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  }, [key]);

  // Tidy timers on unmount.
  useEffect(() => {
    return () => {
      clearDebounce();
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, [clearDebounce]);

  const update = useCallback(
    (body: string) => {
      setNoteState(body);
      setSaved(false);
      clearDebounce();
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        // Skip the persist + flash if nothing actually changed since last commit.
        if (body === lastCommittedRef.current) return;
        lastCommittedRef.current = body.trim().length === 0 ? '' : body;
        setNote(key, body);
        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), SAVED_FLASH_MS);
      }, AUTOSAVE_MS);
    },
    [key, clearDebounce],
  );

  return { note, setNote: update, saved };
}

/**
 * Reactive boolean: does `key` currently hold a non-empty note? Re-renders when
 * any note changes (in-tab via the bus, cross-tab via `storage`). Lane F uses
 * this to show a dirty-dot on the "Notes" filter tab.
 */
export function useScreenNoteFlag(key: string): boolean {
  const [flag, setFlag] = useState<boolean>(() => hasNote(key));

  useEffect(() => {
    const reconcile = () => setFlag(hasNote(key));
    reconcile(); // sync immediately on key change
    const unsub = subscribe(reconcile);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) reconcile();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }
    return () => {
      unsub();
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  }, [key]);

  return flag;
}
