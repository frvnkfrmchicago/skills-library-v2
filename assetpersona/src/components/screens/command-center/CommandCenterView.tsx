import { useState, useCallback } from 'react';
import { Command as CommandIcon } from 'lucide-react';
import type { FeatureStatus, ReportEntry } from '@/lib/command-center/types';
import {
  listNotes, saveNote, deleteNote,
  listTasks, saveTask, deleteTask, setTaskStatus,
  listFeatures, saveFeature, deleteFeature,
  listCompliance, updateComplianceItem, complianceReadiness,
  listLegal, saveLegal,
  listWaves,
  listReports, saveReport,
  listPrompts, savePrompt, deletePrompt,
} from '@/lib/command-center/store';
import { NotesPanel } from './NotesPanel';
import { TasksPanel } from './TasksPanel';
import { FeatureTracker } from './FeatureTracker';
import { SecurityPanel } from './SecurityPanel';
import { OrchestrationPanel } from './OrchestrationPanel';
import { ReportsPanel } from './ReportsPanel';
import { PromptLibrary } from './PromptLibrary';
import { DesignSystemPanel } from './DesignSystemPanel';
import { AppsPlatformsPanel } from './AppsPlatformsPanel';
import { AssetsPanel } from './AssetsPanel';
import { glass } from '@/screens-theme';
import { colors, withOpacity, typeScale, fontWeight, spacing, borderRadius, motion } from '@/lib/design-tokens';

const ACCENT = colors.accentOrange;
const ACCENT_SOFT = withOpacity(ACCENT, 0.14);
const TXT_HEADLINE = colors.text.headline;
const TXT_MUTED = colors.text.muted;
const HAIRLINE = 'rgba(252, 128, 25, 0.08)';

type Section = 'notes' | 'tasks' | 'features' | 'security' | 'orchestration' | 'reports' | 'prompts' | 'design' | 'apps' | 'assets';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'notes', label: 'Notes' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'features', label: 'Features' },
  { id: 'security', label: 'Security' },
  { id: 'orchestration', label: 'Waves' },
  { id: 'reports', label: 'Reports' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'design', label: 'Design' },
  { id: 'apps', label: 'Apps' },
  { id: 'assets', label: 'Assets' },
];

/**
 * CommandCenterView — the main Command Center panel.
 *
 * CLONE-SPECIFIC NOTE:
 * Clone tracking has been consolidated into the Apps/Platforms panel.
 * If you need a fully generic App Scanner (no clone concept), remove:
 *   1. Any remaining clone references in the store
 *   2. CloneEntry from types.ts
 * After removal, this becomes the base for the App Scanner Librarian skill.
 */

export function CommandCenterView({ onOpenApp }: { onOpenApp?: (appUrl: string, appId: string) => void }) {
  const [section, setSection] = useState<Section>('notes');
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const notes = listNotes();
  const tasks = listTasks();
  const features = listFeatures();
  const compliance = listCompliance();
  const readiness = complianceReadiness();
  const legal = listLegal();
  const waves = listWaves();
  const reports = listReports();
  const prompts = listPrompts();

  const extractThemes = async (text: string) => {
    try {
      const res = await fetch('/api/command-center/themes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      const data = await res.json();
      if (data.ok && Array.isArray(data.themes)) {
        const all = listNotes();
        if (all.length > 0) { saveNote({ ...all[0], themes: data.themes.slice(0, 5) }); refresh(); }
      }
    } catch { /* ignore */ }
  };

  const generateReport = async (type: 'progress' | 'theme') => {
    try {
      const state = JSON.stringify({ notes: notes.slice(0, 20), tasks: tasks.slice(0, 20), features: features.slice(0, 20) });
      const res = await fetch('/api/command-center/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state, type }) });
      const data = await res.json();
      if (data.ok) {
        const report: ReportEntry = { id: `rpt-${Date.now().toString(36)}`, title: type === 'progress' ? 'Progress Report' : 'Theme Analysis', body: data.content, type, generatedAt: new Date().toISOString() };
        saveReport(report); refresh();
      }
    } catch { /* ignore */ }
  };

  const setFeatureStatus = (id: string, status: FeatureStatus) => {
    const f = features.find((x) => x.id === id);
    if (f) { saveFeature({ ...f, status }); refresh(); }
  };

  const getCount = (s: Section): string | number => {
    switch (s) {
      case 'notes': return notes.length;
      case 'tasks': return tasks.length;
      case 'features': return features.length;
      case 'security': return readiness.pct + '%';
      case 'orchestration': return waves.length;
      case 'reports': return reports.length;
      case 'prompts': return prompts.length;
      case 'design': return '';
      case 'apps': return '';
      case 'assets': return '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.md, height: '100%', overflow: 'hidden', flex: 1 }}>
      <div className={`${glass.base} ${glass.rise}`} style={{ display: 'flex', alignItems: 'center', gap: spacing.md, padding: `${spacing.md} ${spacing.lg}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: borderRadius.lg, backgroundColor: ACCENT_SOFT, color: ACCENT }}>
          <CommandIcon size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: typeScale.xl, fontWeight: fontWeight.bold, color: TXT_HEADLINE, margin: 0, letterSpacing: '-0.02em' }}>Command Center</h2>
          <p style={{ fontSize: typeScale.sm, color: TXT_MUTED, margin: 0 }}>Track progress, manage your app, and stay on top of everything.</p>
        </div>
      </div>

      <div className={`${glass.raised}`} style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <nav style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2, padding: spacing.sm, borderRight: `1px solid ${HAIRLINE}` }}>
          {SECTIONS.map((s) => {
            const active = section === s.id;
            const count = getCount(s.id);
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${spacing.sm} ${spacing.md}`, borderRadius: borderRadius.lg, border: 'none',
                  background: active ? ACCENT_SOFT : 'transparent',
                  color: active ? ACCENT : TXT_MUTED,
                  fontSize: typeScale.base, fontWeight: active ? fontWeight.bold : fontWeight.medium,
                  cursor: 'pointer', textAlign: 'left', transition: `all ${motion.durFast} ${motion.easeOut}`,
                  minHeight: 44,
                }}>
                <span>{s.label}</span>
                {count !== '' && <span style={{ fontSize: typeScale.sm, fontWeight: fontWeight.bold }}>{count}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {section === 'notes' && (
            <NotesPanel notes={notes}
              onAdd={(n) => { saveNote(n); refresh(); }} onUpdate={(n) => { saveNote(n); refresh(); }} onDelete={(id) => { deleteNote(id); refresh(); }}
              onExtractThemes={extractThemes}
              accent={ACCENT} accentSoft={ACCENT_SOFT} txtMuted={TXT_MUTED} txtHeadline={TXT_HEADLINE} hairline={HAIRLINE} />
          )}
          {section === 'tasks' && (
            <TasksPanel tasks={tasks}
              onAdd={(t) => { saveTask(t); refresh(); }} onDelete={(id) => { deleteTask(id); refresh(); }}
              onSetStatus={(id, s) => { setTaskStatus(id, s); refresh(); }}
              accent={ACCENT} accentSoft={ACCENT_SOFT} txtMuted={TXT_MUTED} txtHeadline={TXT_HEADLINE} hairline={HAIRLINE} />
          )}
          {section === 'features' && (
            <FeatureTracker features={features} clones={[]}
              onAdd={(f) => { saveFeature(f); refresh(); }} onDelete={(id) => { deleteFeature(id); refresh(); }}
              onSetStatus={setFeatureStatus}
              txtMuted={TXT_MUTED} txtHeadline={TXT_HEADLINE} hairline={HAIRLINE} />
          )}
          {section === 'security' && (
            <SecurityPanel items={compliance} readiness={readiness} legal={legal}
              onUpdateItem={(item) => { updateComplianceItem(item); refresh(); }} onSaveLegal={(doc) => { saveLegal(doc); refresh(); }}
              accent={ACCENT} accentSoft={ACCENT_SOFT} txtMuted={TXT_MUTED} txtHeadline={TXT_HEADLINE} hairline={HAIRLINE} />
          )}
          {section === 'orchestration' && (
            <OrchestrationPanel waves={waves} accent={ACCENT} accentSoft={ACCENT_SOFT} txtMuted={TXT_MUTED} txtHeadline={TXT_HEADLINE} />
          )}
          {section === 'reports' && (
            <ReportsPanel reports={reports} onGenerate={generateReport} accent={ACCENT} txtMuted={TXT_MUTED} txtHeadline={TXT_HEADLINE} />
          )}
          {section === 'prompts' && (
            <PromptLibrary prompts={prompts}
              onAdd={(p) => { savePrompt(p); refresh(); }} onUpdate={(p) => { savePrompt(p); refresh(); }} onDelete={(id) => { deletePrompt(id); refresh(); }} />
          )}
          {section === 'design' && <DesignSystemPanel />}
          {section === 'apps' && (
            <AppsPlatformsPanel accent={ACCENT} txtMuted={TXT_MUTED} txtHeadline={TXT_HEADLINE} onOpenApp={onOpenApp} />
          )}
          {section === 'assets' && (
            <AssetsPanel accent={ACCENT} txtMuted={TXT_MUTED} txtHeadline={TXT_HEADLINE} hairline={HAIRLINE} />
          )}
        </div>
      </div>
    </div>
  );
}
