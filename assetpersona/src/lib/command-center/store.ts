import type {
  Note,
  Task,
  TaskStatus,
  TaskPriority,
  CloneEntry,
  FeatureEntry,
  ComplianceItem,
  ComplianceCategory,
  ComplianceStatus,
  LegalDocument,
  WaveEntry,
  ReportEntry,
  PromptEntry,
  PromptCategory,
  CommandCenterState,
} from './types';

import { getAppSettings } from '../asset-resolver';

const STORAGE_KEY_BASE = 'assetpersona_command_center_v1';
const LEGACY_STORAGE_KEY = 'assetpersona_command_center_v1';

function stamp(): string {
  return new Date().toISOString();
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

// ── Read / Write ──────────────────────────────────────

function storageKeyForApp(appId: string): string {
  return `${STORAGE_KEY_BASE}:${appId}`;
}

function activeAppId(): string {
  try {
    return getAppSettings().activeAppId || 'assetpersona';
  } catch {
    return 'assetpersona';
  }
}

function migrateLegacyStateIfNeeded(appId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return;
    const scopedKey = storageKeyForApp(appId);
    const existing = localStorage.getItem(scopedKey);
    if (existing) return;
    localStorage.setItem(scopedKey, legacy);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function readState(): CommandCenterState {
  if (typeof window === 'undefined') return emptyState();
  const appId = activeAppId();
  migrateLegacyStateIfNeeded(appId);
  try {
    const raw = localStorage.getItem(storageKeyForApp(appId));
    if (!raw) return emptyState();
    return JSON.parse(raw) as CommandCenterState;
  } catch {
    return emptyState();
  }
}

function writeState(state: CommandCenterState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKeyForApp(activeAppId()), JSON.stringify(state));
}

function emptyState(): CommandCenterState {
  return {
    notes: [],
    tasks: [],
    clones: [],
    features: [],
    compliance: defaultComplianceItems(),
    legal: defaultLegalDocs(),
    waves: [],
    reports: [],
    prompts: [],
  };
}

function defaultComplianceItems(): ComplianceItem[] {
  const items: Array<{ category: ComplianceCategory; title: string; description: string }> = [
    { category: 'security', title: 'API key exposure', description: 'No secrets committed to repo or exposed in client bundle' },
    { category: 'security', title: 'Input validation', description: 'All user inputs validated and sanitized server-side' },
    { category: 'security', title: 'HTTPS enforcement', description: 'All API calls use HTTPS in production' },
    { category: 'privacy', title: 'Data collection disclosure', description: 'App discloses what data is collected and why' },
    { category: 'privacy', title: 'User consent', description: 'Explicit consent before collecting personal data' },
    { category: 'accessibility', title: 'Color contrast', description: 'All text meets WCAG AA contrast ratio (4.5:1)' },
    { category: 'accessibility', title: 'Keyboard navigation', description: 'All interactive elements reachable via keyboard' },
    { category: 'legal', title: 'Terms of service', description: 'Terms of service page exists and is linked' },
    { category: 'legal', title: 'Privacy policy', description: 'Privacy policy page exists and is linked' },
  ];
  return items.map((item, i) => ({
    id: `comp-${i}`,
    category: item.category,
    title: item.title,
    description: item.description,
    status: 'not_checked' as ComplianceStatus,
    evidence: '',
    assignee: '',
    createdAt: stamp(),
    updatedAt: stamp(),
  }));
}

function defaultLegalDocs(): LegalDocument[] {
  return [
    {
      id: 'legal-terms',
      title: 'Terms of Service',
      type: 'terms',
      content: '',
      version: '1.0',
      effectiveDate: stamp(),
      createdAt: stamp(),
      updatedAt: stamp(),
    },
    {
      id: 'legal-privacy',
      title: 'Privacy Policy',
      type: 'privacy',
      content: '',
      version: '1.0',
      effectiveDate: stamp(),
      createdAt: stamp(),
      updatedAt: stamp(),
    },
  ];
}

// ── Exported getters ───────────────────────────────────

export function getCommandState(): CommandCenterState {
  return readState();
}

// ── Notes ─────────────────────────────────────────────

export function listNotes(): Note[] {
  return readState().notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveNote(note: Note): Note {
  const state = readState();
  const updated = { ...note, updatedAt: stamp() };
  const idx = state.notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) state.notes[idx] = updated;
  else state.notes.unshift({ ...updated, id: updated.id || uid('note') });
  writeState(state);
  return updated;
}

export function deleteNote(id: string): void {
  const state = readState();
  state.notes = state.notes.filter((n) => n.id !== id);
  writeState(state);
}

export function toggleNoteComplete(id: string): Note | null {
  const state = readState();
  const note = state.notes.find((n) => n.id === id);
  if (!note) return null;
  note.completed = !note.completed;
  note.updatedAt = stamp();
  writeState(state);
  return note;
}

// ── Tasks ─────────────────────────────────────────────

export function listTasks(): Task[] {
  return readState().tasks.sort((a, b) => {
    const pri: Record<TaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (pri[a.priority] ?? 4) - (pri[b.priority] ?? 4);
  });
}

export function saveTask(task: Task): Task {
  const state = readState();
  const updated = { ...task, updatedAt: stamp() };
  const idx = state.tasks.findIndex((t) => t.id === task.id);
  if (idx >= 0) state.tasks[idx] = updated;
  else state.tasks.unshift({ ...updated, id: updated.id || uid('task') });
  writeState(state);
  return updated;
}

export function deleteTask(id: string): void {
  const state = readState();
  state.tasks = state.tasks.filter((t) => t.id !== id);
  writeState(state);
}

export function setTaskStatus(id: string, status: TaskStatus): Task | null {
  const state = readState();
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return null;
  task.status = status;
  task.updatedAt = stamp();
  writeState(state);
  return task;
}

// ── Clones ────────────────────────────────────────────

export function listClones(): CloneEntry[] {
  return readState().clones.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveClone(clone: CloneEntry): CloneEntry {
  const state = readState();
  const updated = { ...clone, updatedAt: stamp() };
  const idx = state.clones.findIndex((c) => c.id === clone.id);
  if (idx >= 0) state.clones[idx] = updated;
  else state.clones.unshift({ ...updated, id: updated.id || uid('clone') });
  writeState(state);
  return updated;
}

export function deleteClone(id: string): void {
  const state = readState();
  state.clones = state.clones.filter((c) => c.id !== id);
  writeState(state);
}

// ── Features ──────────────────────────────────────────

export function listFeatures(): FeatureEntry[] {
  return readState().features.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveFeature(feature: FeatureEntry): FeatureEntry {
  const state = readState();
  const updated = { ...feature, updatedAt: stamp() };
  const idx = state.features.findIndex((f) => f.id === feature.id);
  if (idx >= 0) state.features[idx] = updated;
  else state.features.unshift({ ...updated, id: updated.id || uid('feat') });
  writeState(state);
  return updated;
}

export function deleteFeature(id: string): void {
  const state = readState();
  state.features = state.features.filter((f) => f.id !== id);
  writeState(state);
}

// ── Compliance ────────────────────────────────────────

export function listCompliance(): ComplianceItem[] {
  return readState().compliance;
}

export function updateComplianceItem(item: ComplianceItem): ComplianceItem {
  const state = readState();
  const idx = state.compliance.findIndex((c) => c.id === item.id);
  const updated = { ...item, updatedAt: stamp() };
  if (idx >= 0) state.compliance[idx] = updated;
  writeState(state);
  return updated;
}

export function complianceReadiness(): { pass: number; total: number; pct: number } {
  const items = readState().compliance;
  const pass = items.filter((i) => i.status === 'pass').length;
  return { pass, total: items.length, pct: items.length ? Math.round((pass / items.length) * 100) : 0 };
}

// ── Legal ─────────────────────────────────────────────

export function listLegal(): LegalDocument[] {
  return readState().legal;
}

export function saveLegal(doc: LegalDocument): LegalDocument {
  const state = readState();
  const updated = { ...doc, updatedAt: stamp() };
  const idx = state.legal.findIndex((l) => l.id === doc.id);
  if (idx >= 0) state.legal[idx] = updated;
  writeState(state);
  return updated;
}

// ── Orchestration ─────────────────────────────────────

export function listWaves(): WaveEntry[] {
  return readState().waves.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveWave(wave: WaveEntry): WaveEntry {
  const state = readState();
  const updated = { ...wave, updatedAt: stamp() };
  const idx = state.waves.findIndex((w) => w.id === wave.id);
  if (idx >= 0) state.waves[idx] = updated;
  else state.waves.unshift(updated);
  writeState(state);
  return updated;
}

// ── Reports ───────────────────────────────────────────

export function listReports(): ReportEntry[] {
  return readState().reports.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

export function saveReport(report: ReportEntry): ReportEntry {
  const state = readState();
  state.reports.unshift(report);
  if (state.reports.length > 50) state.reports = state.reports.slice(0, 50);
  writeState(state);
  return report;
}

// ── Helpers ───────────────────────────────────────────

export function createNote(title: string, body = '', themes: Note['themes'] = []): Note {
  return {
    id: uid('note'),
    title,
    body,
    themes,
    sources: [{ type: 'manual', label: 'User' }],
    completed: false,
    linkedTaskIds: [],
    status: 'open',
    updates: [],
    createdAt: stamp(),
    updatedAt: stamp(),
  };
}

export function createTask(title: string, priority: TaskPriority = 'medium'): Task {
  return {
    id: uid('task'),
    title,
    description: '',
    status: 'todo',
    priority,
    assignee: '',
    noteIds: [],
    createdAt: stamp(),
    updatedAt: stamp(),
  };
}

export function createClone(name: string, description = ''): CloneEntry {
  return {
    id: uid('clone'),
    name,
    description,
    status: 'active',
    screenCount: 0,
    featureCount: 0,
    version: '0.1',
    tags: [],
    createdAt: stamp(),
    updatedAt: stamp(),
  };
}

export function createFeature(title: string, cloneId: string): FeatureEntry {
  return {
    id: uid('feat'),
    title,
    description: '',
    status: 'planned',
    cloneId,
    screenPaths: [],
    acceptance: [],
    priority: 'medium',
    noteIds: [],
    taskIds: [],
    createdAt: stamp(),
    updatedAt: stamp(),
  };
}

// ── Prompts ───────────────────────────────────────────

export function listPrompts(): PromptEntry[] {
  return readState().prompts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function savePrompt(prompt: PromptEntry): PromptEntry {
  const state = readState();
  const updated = { ...prompt, updatedAt: stamp() };
  const idx = state.prompts.findIndex((p) => p.id === prompt.id);
  if (idx >= 0) state.prompts[idx] = updated;
  else state.prompts.unshift({ ...updated, id: updated.id || uid('prompt') });
  writeState(state);
  return updated;
}

export function deletePrompt(id: string): void {
  const state = readState();
  state.prompts = state.prompts.filter((p) => p.id !== id);
  writeState(state);
}

export function createPrompt(title: string, body = '', category: PromptCategory = 'general'): PromptEntry {
  return {
    id: uid('prompt'),
    title,
    body,
    category,
    tags: [],
    createdAt: stamp(),
    updatedAt: stamp(),
  };
}
