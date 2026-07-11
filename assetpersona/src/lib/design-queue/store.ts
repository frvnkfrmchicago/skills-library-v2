import type { DesignDraft, DesignQueueIndex, QueueStatus } from './types';
import { PHONE_FRAME } from './types';
import { isLegacyDraft, migrateDraft } from './migrate';

const STORAGE_KEY = 'swiggy_design_queue_v2';
const AUTOSAVE_MS = 500;

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return base || 'draft';
}

export function newDraftId(title: string): string {
  const stamp = Date.now().toString(36);
  return `${slugify(title)}-${stamp}`;
}

export function createEmptyDraft(title = 'Untitled screen'): DesignDraft {
  const now = new Date().toISOString();
  const id = newDraftId(title);
  return {
    id,
    title,
    status: 'draft',
    targetPath: '',
    targetExists: false,
    artboards: [{ id: 'a1', label: 'Main' }],
    layers: [],
    assets: [],
    designerNotes: '',
    acceptance: [
      'Layout matches artboard',
      'Text and CTAs match draft',
      'Navigation wired in app.js',
    ],
    aiThread: [],
    createdAt: now,
    updatedAt: now,
    lastSavedAt: now,
  };
}

function readRaw(): DesignDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem('swiggy_design_queue_v1');
      if (!legacy) return [];
      const parsed = JSON.parse(legacy) as { drafts?: unknown[] };
      const drafts = (parsed.drafts ?? []).map((d) =>
        isLegacyDraft(d) ? migrateDraft(d) : (d as DesignDraft),
      );
      writeAll(drafts);
      return drafts;
    }
    const parsed = JSON.parse(raw) as { drafts?: unknown[] };
    return (parsed.drafts ?? []).map((d) =>
      isLegacyDraft(d) ? migrateDraft(d) : (d as DesignDraft),
    );
  } catch {
    return [];
  }
}

function writeAll(drafts: DesignDraft[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ drafts }));
}

export function listDrafts(includeArchived = false): DesignDraft[] {
  const all = readRaw().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (includeArchived) return all;
  return all.filter((d) => d.status !== 'archived');
}

export function getDraft(id: string): DesignDraft | null {
  return readRaw().find((d) => d.id === id) ?? null;
}

export function saveDraft(draft: DesignDraft, explicit = false): DesignDraft {
  const now = new Date().toISOString();
  const next: DesignDraft = {
    ...draft,
    updatedAt: now,
    lastSavedAt: explicit || draft.lastSavedAt ? now : draft.lastSavedAt ?? now,
  };
  const all = readRaw();
  const idx = all.findIndex((d) => d.id === next.id);
  if (idx >= 0) all[idx] = next;
  else all.unshift(next);
  writeAll(all);
  return next;
}

export function deleteDraft(id: string): void {
  writeAll(readRaw().filter((d) => d.id !== id));
}

export function archiveDraft(id: string): DesignDraft | null {
  const d = getDraft(id);
  if (!d) return null;
  return saveDraft({ ...d, status: 'archived' }, true);
}

export function setDraftStatus(id: string, status: QueueStatus): DesignDraft | null {
  const d = getDraft(id);
  if (!d) return null;
  return saveDraft({ ...d, status }, true);
}

export function buildQueueIndex(drafts: DesignDraft[]): DesignQueueIndex {
  return {
    version: 2,
    items: drafts
      .filter((d) => d.status !== 'archived')
      .map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        targetPath: d.targetPath,
        updatedAt: d.updatedAt,
      })),
  };
}

export function scheduleAutosave(
  draft: DesignDraft,
  onSaved: (d: DesignDraft) => void,
): () => void {
  const t = window.setTimeout(() => onSaved(saveDraft(draft)), AUTOSAVE_MS);
  return () => window.clearTimeout(t);
}

export function defaultTextLayer(artboardId: string, x: number, y: number): DesignDraft['layers'][0] {
  return {
    type: 'text',
    id: `text-${Date.now().toString(36)}`,
    artboardId,
    frame: { x, y, width: 200, height: 32 },
    content: 'Headline',
    fontSize: 18,
    fontWeight: 700,
    color: '#1a1a1a',
    fontTokenId: 'body',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };
}

export function defaultPinLayer(
  artboardId: string,
  x: number,
  y: number,
  n: number,
): DesignDraft['layers'][0] {
  return {
    type: 'annotation',
    id: `pin-${Date.now().toString(36)}`,
    artboardId,
    frame: { x: x - 12, y: y - 12, width: 24, height: 24 },
    kind: 'pin',
    text: String(n),
  };
}

export function artboardCenter(): { x: number; y: number } {
  return { x: PHONE_FRAME.w / 2 - 100, y: PHONE_FRAME.h / 2 - 20 };
}
