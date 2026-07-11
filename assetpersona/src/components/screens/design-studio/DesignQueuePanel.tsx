import { Plus, Trash2 } from 'lucide-react';
import type { DesignDraft, QueueStatus } from '@/lib/design-queue/types';
import { glass } from '@/screens-theme';

const STATUS_COLOR: Record<QueueStatus, string> = {
  draft: '#D4A574',
  ready: '#78ffc8',
  in_build: '#f5c451',
  shipped: '#6ee7b7',
  archived: '#6b7280',
};

interface Props {
  drafts: DesignDraft[];
  activeId: string | null;
  showArchived: boolean;
  onToggleArchived: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  accent: string;
  txtMuted: string;
  txtHeadline: string;
  hairline: string;
}

export function DesignQueuePanel({
  drafts,
  activeId,
  showArchived,
  onToggleArchived,
  onSelect,
  onNew,
  onDelete,
  accent,
  txtMuted,
  txtHeadline,
  hairline,
}: Props) {
  return (
    <aside
      className={`${glass.raised} flex h-full w-[240px] shrink-0 flex-col overflow-hidden`}
      aria-label="Design queue"
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5" style={{ borderColor: hairline }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: txtMuted }}>
          Queue
        </p>
        <button
          type="button"
          onClick={onNew}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          style={{ color: accent }}
          aria-label="New draft"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="border-b px-3 py-2" style={{ borderColor: hairline }}>
        <label className="flex items-center gap-2 text-[11px]" style={{ color: txtMuted }}>
          <input type="checkbox" checked={showArchived} onChange={onToggleArchived} />
          Show archived
        </label>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {drafts.length === 0 && (
          <p className="px-2 py-4 text-center text-[12px]" style={{ color: txtMuted }}>
            No drafts yet. Create one to start designing.
          </p>
        )}
        {drafts.map((d) => {
          const on = d.id === activeId;
          return (
            <div key={d.id} className="mb-1 flex gap-1">
              <button
                type="button"
                onClick={() => onSelect(d.id)}
                className="min-w-0 flex-1 rounded-lg px-2.5 py-2 text-left transition-colors"
                style={{
                  backgroundColor: on ? 'rgba(120,255,200,0.12)' : 'transparent',
                  border: `1px solid ${on ? 'rgba(120,255,200,0.35)' : 'transparent'}`,
                  opacity: d.status === 'archived' ? 0.65 : 1,
                }}
              >
                <span className="block truncate text-[13px] font-semibold" style={{ color: txtHeadline }}>
                  {d.title}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[10px]" style={{ color: txtMuted }}>
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[d.status] }}
                  />
                  {d.status}
                  {d.targetPath ? ` · ${d.targetPath}` : ''}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(d.id)}
                className="shrink-0 rounded p-1.5 hover:bg-white/10"
                aria-label={`Delete ${d.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" style={{ color: txtMuted }} />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
