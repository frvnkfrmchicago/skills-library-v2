/* ═══ NOTEBOOK STORE — localStorage-first persistence ═══
 * Mirrors the learnStore pattern: localStorage in dev/demo,
 * ready for Supabase upgrade when backend is wired.
 * Auto-save with 500ms debounce.
 */

import type { Notebook } from '../types/notebook';

const STORE_KEY = 'ap_notebooks';

// ── Helpers ──
function readAll(): Notebook[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(notebooks: Notebook[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(notebooks));
}

// ── CRUD ──

export function listNotebooks(): Notebook[] {
  return readAll().sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

export function getNotebookById(id: string): Notebook | undefined {
  return readAll().find((n) => n.id === id);
}

export function createNotebook(title: string): Notebook {
  const now = new Date().toISOString();
  const notebook: Notebook = {
    id: crypto.randomUUID(),
    title: title || 'Untitled Notebook',
    sources: [],
    outputs: [],
    status: 'draft',
    created_at: now,
    updated_at: now,
  };
  const all = readAll();
  all.push(notebook);
  writeAll(all);
  return notebook;
}

export function updateNotebook(updated: Notebook): Notebook {
  const patched = { ...updated, updated_at: new Date().toISOString() };
  const all = readAll().map((n) => (n.id === patched.id ? patched : n));
  writeAll(all);
  return patched;
}

export function deleteNotebook(id: string): void {
  writeAll(readAll().filter((n) => n.id !== id));
}

// ── Auto-save debouncer ──
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function autoSave(notebook: Notebook, delayMs = 500): void {
  const existing = timers.get(notebook.id);
  if (existing) clearTimeout(existing);

  timers.set(
    notebook.id,
    setTimeout(() => {
      updateNotebook(notebook);
      timers.delete(notebook.id);
    }, delayMs)
  );
}
