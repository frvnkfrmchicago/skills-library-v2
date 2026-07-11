/** Command Center — unified operational types for the App Scanner skill. */

// ── Notes ──────────────────────────────────────────────

export type NoteTheme =
  | 'bug'
  | 'feature'
  | 'design'
  | 'architecture'
  | 'security'
  | 'legal'
  | 'performance'
  | 'content'
  | 'agent'
  | 'general';

export interface NoteSource {
  type: 'manual' | 'agent' | 'ai-theme';
  label: string;
  url?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  themes: NoteTheme[];
  sources: NoteSource[];
  completed: boolean;
  linkedTaskIds: string[];
  linkedCloneId?: string;
  linkedScreenPath?: string;
  /** Work-item style status (preferred over completed) */
  status?: 'open' | 'tracking' | 'resolved';
  /** Activity feed entries for this note */
  updates?: Array<{
    id: string;
    text: string;
    author: string;
    createdAt: string;
    kind?: 'comment' | 'status' | 'source';
  }>;
  createdAt: string;
  updatedAt: string;
}

// ── Tasks ──────────────────────────────────────────────

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate?: string;
  noteIds: string[];
  cloneId?: string;
  screenPath?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Clone Registry ─────────────────────────────────────

export type CloneStatus = 'active' | 'paused' | 'shipped' | 'archived';

export interface CloneEntry {
  id: string;
  name: string;
  description: string;
  status: CloneStatus;
  sourceUrl?: string;
  screenCount: number;
  featureCount: number;
  lastBuiltAt?: string;
  version: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Feature / Screen Tracker ───────────────────────────

export type FeatureStatus = 'planned' | 'in_build' | 'built' | 'tested' | 'shipped';

export interface FeatureEntry {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  cloneId: string;
  screenPaths: string[];
  acceptance: string[];
  priority: TaskPriority;
  noteIds: string[];
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Security & Compliance ──────────────────────────────

export type ComplianceCategory = 'security' | 'legal' | 'privacy' | 'terms' | 'accessibility';
export type ComplianceStatus = 'pass' | 'warning' | 'fail' | 'not_checked';

export interface ComplianceItem {
  id: string;
  category: ComplianceCategory;
  title: string;
  description: string;
  status: ComplianceStatus;
  evidence: string;
  lastCheckedAt?: string;
  dueDate?: string;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  type: 'terms' | 'privacy' | 'eula' | 'dpolicy' | 'other';
  content: string;
  version: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

// ── Orchestration ──────────────────────────────────────

export type WaveStatus = 'active' | 'completed' | 'archived';
export type LaneStatus = 'pending' | 'in_progress' | 'done' | 'blocked' | 'rejected';

export interface LaneEntry {
  id: string;
  waveId: string;
  label: string;
  status: LaneStatus;
  owner: string;
  summary: string;
  briefPath: string;
  completedAt?: string;
}

export interface WaveEntry {
  id: string;
  name: string;
  status: WaveStatus;
  lanes: LaneEntry[];
  createdAt: string;
  updatedAt: string;
}

// ── Reports ────────────────────────────────────────────

export interface ReportEntry {
  id: string;
  title: string;
  body: string;
  type: 'progress' | 'theme' | 'changelog' | 'compliance' | 'ai_summary';
  generatedAt: string;
}

// ── Prompt Library ────────────────────────────────────

export type PromptCategory = 'system' | 'user' | 'chain' | 'agent' | 'creative' | 'general';

export interface PromptEntry {
  id: string;
  title: string;
  body: string;
  category: PromptCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Command Center root ────────────────────────────────

export interface CommandCenterState {
  notes: Note[];
  tasks: Task[];
  clones: CloneEntry[];
  features: FeatureEntry[];
  compliance: ComplianceItem[];
  legal: LegalDocument[];
  waves: WaveEntry[];
  reports: ReportEntry[];
  prompts: PromptEntry[];
}
