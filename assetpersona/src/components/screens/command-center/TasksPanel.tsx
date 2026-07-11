import { useState } from 'react';
import { Plus, Check, Clock, Circle, AlertTriangle } from 'lucide-react';
import type { Task, TaskPriority, TaskStatus } from '@/lib/command-center/types';
import { typeScale, fontWeight, borderRadius, spacing, motion } from '@/lib/design-tokens';
import { Button } from '@/lib/ui/Button';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: typeof Circle }> = {
  todo: { label: 'To Do', color: '#5A8EA8', bg: '#5A8EA815', icon: Circle },
  in_progress: { label: 'In Progress', color: '#00C2FF', bg: '#00C2FF15', icon: Clock },
  done: { label: 'Done', color: '#4ADE80', bg: '#4ADE8015', icon: Check },
  blocked: { label: 'Blocked', color: '#FF4444', bg: '#FF444415', icon: AlertTriangle },
};

const PRI_COLORS: Record<TaskPriority, string> = { critical: '#FF4444', high: '#F59E0B', medium: '#00C2FF', low: '#6B7280' };

type FilterView = 'all' | TaskStatus;

interface Props {
  tasks: Task[];
  onAdd: (task: Task) => void;
  onDelete: (id: string) => void;
  onSetStatus: (id: string, status: TaskStatus) => void;
  accent: string; accentSoft: string; txtMuted: string; txtHeadline: string; hairline: string;
}

export function TasksPanel({ tasks, onAdd, onDelete, onSetStatus, accent, accentSoft, txtMuted, txtHeadline, hairline }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [viewFilter, setViewFilter] = useState<FilterView>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = viewFilter === 'all' ? tasks : tasks.filter((t) => t.status === viewFilter);

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    blocked: tasks.filter((t) => t.status === 'blocked').length,
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd({
      id: `task-${Date.now().toString(36)}`, title: newTitle.trim(), description: '',
      status: 'todo', priority: newPriority, assignee: '', noteIds: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    setNewTitle('');
    setNewPriority('medium');
    setIsAdding(false);
  };

  const taskCard = (task: Task) => {
    const sc = STATUS_CONFIG[task.status];
    const Icon = sc.icon;
    const expanded = expandedId === task.id;

    return (
      <div key={task.id} style={{
        background: 'rgba(0,0,0,0.3)', borderRadius: borderRadius.xl, padding: spacing.lg,
        border: `1px solid ${hairline}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.sm, flex: 1, minWidth: 0 }}>
            {/* Priority Dot */}
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: PRI_COLORS[task.priority], flexShrink: 0, marginTop: 5 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: typeScale.base, fontWeight: fontWeight.semibold, color: txtHeadline, margin: 0, lineHeight: 1.4, textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</p>
              {task.description && (
                <p style={{ fontSize: typeScale.sm, color: txtMuted, margin: `${spacing.xs} 0 0 0`, lineHeight: 1.5 }}>{task.description}</p>
              )}
            </div>
          </div>

          {/* Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.full, background: sc.bg, border: `1px solid ${sc.color}33`, flexShrink: 0 }}>
            <Icon size={12} style={{ color: sc.color }} />
            <span style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{sc.label}</span>
          </div>
        </div>

        {/* Meta Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginTop: spacing.md }}>
          <span style={{ fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.04em', color: PRI_COLORS[task.priority] }}>{task.priority}</span>
          <span style={{ fontSize: typeScale.xs, color: txtMuted }}>
            {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpandedId(expanded ? null : task.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: typeScale.xs, fontWeight: fontWeight.semibold, color: accent, marginTop: spacing.sm, padding: 0 }}>
          {expanded ? 'Hide' : 'Change status'}
        </button>

        {expanded && (
          <div style={{ marginTop: spacing.md, borderTop: `1px solid ${hairline}`, paddingTop: spacing.md }}>
            <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = task.status === s;
                return (
                  <button key={s} onClick={() => { onSetStatus(task.id, s); setExpandedId(null); }}
                    style={{ padding: `${spacing.sm} ${spacing.md}`, borderRadius: borderRadius.lg, fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: '0.04em', border: active ? `1px solid ${cfg.color}` : `1px solid ${hairline}`, background: active ? cfg.bg : 'transparent', color: active ? cfg.color : txtMuted, cursor: 'pointer' }}>
                    {cfg.label}
                  </button>
                );
              })}
              <button onClick={() => { onDelete(task.id); setExpandedId(null); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: `${spacing.xs} ${spacing.sm}`, color: '#FF4444', fontSize: typeScale.xs, fontWeight: fontWeight.bold }}>Delete</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, padding: spacing.lg, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: typeScale['2xl'], fontWeight: fontWeight.bold, color: txtHeadline, margin: 0 }}>Tasks</h3>
        <p style={{ fontSize: typeScale.base, color: txtMuted, margin: `${spacing.xs} 0 0 0` }}>Track what needs to happen. Change status as you progress.</p>
      </div>

      {/* Status Summary */}
      <div style={{ display: 'flex', gap: spacing.lg }}>
        {([
          { key: 'todo' as const, cfg: STATUS_CONFIG.todo, count: counts.todo },
          { key: 'in_progress' as const, cfg: STATUS_CONFIG.in_progress, count: counts.in_progress },
          { key: 'done' as const, cfg: STATUS_CONFIG.done, count: counts.done },
          { key: 'blocked' as const, cfg: STATUS_CONFIG.blocked, count: counts.blocked },
        ]).map((s) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.cfg.color }} />
            <span style={{ fontSize: typeScale.sm, fontWeight: fontWeight.bold, color: txtHeadline }}>{s.count}</span>
            <span style={{ fontSize: typeScale.sm, color: txtMuted }}>{s.cfg.label}</span>
          </div>
        ))}
      </div>

      {/* New Task Form */}
      {isAdding ? (
        <div style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${accent}44`, borderRadius: borderRadius.xl, padding: spacing.lg }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="What needs to be done?"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${hairline}`, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: typeScale.base, color: txtHeadline, outline: 'none', width: '100%' }}
            />
            <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
              <span style={{ fontSize: typeScale.sm, fontWeight: fontWeight.bold, color: txtMuted }}>Priority:</span>
              {(['critical', 'high', 'medium', 'low'] as const).map((p) => (
                <button key={p} onClick={() => setNewPriority(p)}
                  style={{ padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.md, fontSize: typeScale.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', border: newPriority === p ? `1px solid ${PRI_COLORS[p]}` : `1px solid ${hairline}`, background: newPriority === p ? `${PRI_COLORS[p]}15` : 'transparent', color: newPriority === p ? PRI_COLORS[p] : txtMuted, cursor: 'pointer' }}>
                  {p}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => { setIsAdding(false); setNewTitle(''); }} size="sm">Cancel</Button>
              <Button onClick={handleAdd} size="sm">Add Task</Button>
            </div>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsAdding(true)} size="md" style={{ alignSelf: 'flex-start' }}><Plus size={16} />New Task</Button>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: spacing.xs, overflowX: 'auto' }}>
        {([
          { key: 'all' as const, label: 'All' },
          ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k as TaskStatus, label: v.label })),
        ]).map((f) => (
          <button key={f.key} onClick={() => setViewFilter(f.key)}
            style={{
              padding: `${spacing.sm} ${spacing.md}`, borderRadius: borderRadius.xl, fontSize: typeScale.sm, fontWeight: fontWeight.medium,
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: viewFilter === f.key ? accentSoft : 'transparent',
              color: viewFilter === f.key ? accent : txtMuted,
              transition: `all ${motion.durFast} ${motion.easeOut}`,
            }}>
            {f.label} ({counts[f.key]})
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {filtered.length === 0 && (
          <div style={{ padding: spacing['2xl'], textAlign: 'center', borderRadius: borderRadius.xl, border: `1px dashed ${hairline}` }}>
            <p style={{ fontSize: typeScale.base, color: txtMuted, margin: 0 }}>No tasks here. Click "New Task" to create one.</p>
          </div>
        )}
        {filtered.map((task) => taskCard(task))}
      </div>
    </div>
  );
}
