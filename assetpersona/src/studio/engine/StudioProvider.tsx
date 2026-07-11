/* ══════════════════════════════════════════
   STUDIO PROVIDER
   Context provider for editor state:
   save status, dirty flag, undo/redo, preview mode.
   ══════════════════════════════════════════ */

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { StudioPage, PuckData } from '../data/types';
import { createPage, updatePage } from '../data/studioStorage';

interface StudioState {
  /** The currently loaded page (null if creating new) */
  currentPage: StudioPage | null;
  /** Whether unsaved changes exist */
  isDirty: boolean;
  /** Whether the editor is in preview mode */
  isPreview: boolean;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Last save error, if any */
  saveError: string | null;
  /** Set the current page */
  setCurrentPage: (page: StudioPage | null) => void;
  /** Mark the editor as dirty (unsaved changes) */
  markDirty: () => void;
  /** Toggle preview mode */
  togglePreview: () => void;
  /** Save the current page data */
  savePage: (data: PuckData) => Promise<void>;
  /** Push current state to undo stack */
  pushUndo: (data: PuckData) => void;
  /** Undo last change, returns the previous state */
  undo: () => PuckData | null;
  /** Redo last undo, returns the next state */
  redo: () => PuckData | null;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
}

const StudioContext = createContext<StudioState | null>(null);

const MAX_UNDO = 50;

interface StudioProviderProps {
  children: ReactNode;
}

export function StudioProvider({ children }: StudioProviderProps) {
  const [currentPage, setCurrentPage] = useState<StudioPage | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Undo/redo stacks
  const undoStack = useRef<PuckData[]>([]);
  const redoStack = useRef<PuckData[]>([]);

  const markDirty = useCallback(() => setIsDirty(true), []);
  const togglePreview = useCallback(() => setIsPreview((p) => !p), []);

  const pushUndo = useCallback((data: PuckData) => {
    undoStack.current = [...undoStack.current.slice(-MAX_UNDO + 1), data];
    redoStack.current = []; // clear redo on new action
  }, []);

  const undo = useCallback((): PuckData | null => {
    if (undoStack.current.length === 0) return null;
    const previous = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    if (currentPage) {
      redoStack.current = [...redoStack.current, currentPage.puck_data];
    }
    return previous;
  }, [currentPage]);

  const redo = useCallback((): PuckData | null => {
    if (redoStack.current.length === 0) return null;
    const next = redoStack.current[redoStack.current.length - 1];
    redoStack.current = redoStack.current.slice(0, -1);
    if (currentPage) {
      undoStack.current = [...undoStack.current, currentPage.puck_data];
    }
    return next;
  }, [currentPage]);

  const savePage = useCallback(async (data: PuckData) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (currentPage) {
        // Update existing page
        const updated = await updatePage(currentPage.id, { puck_data: data });
        setCurrentPage(updated);
      } else {
        // Create new page
        const slug = `page-${Date.now()}`;
        const created = await createPage({
          title: 'Untitled Page',
          slug,
          puck_data: data,
        });
        setCurrentPage(created);
      }
      setIsDirty(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setSaveError(message);
      console.error('[Studio] Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [currentPage]);

  const value: StudioState = {
    currentPage,
    isDirty,
    isPreview,
    isSaving,
    saveError,
    setCurrentPage,
    markDirty,
    togglePreview,
    savePage,
    pushUndo,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
}

/** Hook to access studio state. Throws if used outside StudioProvider. */
export function useStudio(): StudioState {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within <StudioProvider>');
  return ctx;
}
