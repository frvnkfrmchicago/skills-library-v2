import { Archive, Save, Trash2 } from 'lucide-react';
import type { DesignDraft } from '@/lib/design-queue/types';
import { glass } from '@/screens-theme';

interface Props {
  draft: DesignDraft;
  onSave: () => void;
  onSaveDraft: () => void;
  onArchive: () => void;
  onDelete: () => void;
  saveLabel?: string;
  accent: string;
  accentSoft: string;
  txtMuted: string;
  txtHeadline: string;
  hairline: string;
}

export function DesignStudioChrome({
  draft,
  onSave,
  onSaveDraft,
  onArchive,
  onDelete,
  saveLabel,
  accent,
  accentSoft,
  txtMuted,
  txtHeadline,
  hairline,
}: Props) {
  const savedAt = draft.lastSavedAt
    ? new Date(draft.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div
      className={`${glass.inset} flex shrink-0 flex-wrap items-center gap-2 px-3 py-2`}
      style={{ borderBottom: `1px solid ${hairline}` }}
    >
      <button
        type="button"
        onClick={onSave}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold"
        style={{ backgroundColor: accentSoft, color: accent }}
      >
        <Save className="h-3.5 w-3.5" />
        Save
      </button>
      <button
        type="button"
        onClick={onSaveDraft}
        className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold"
        style={{ color: txtHeadline, border: `1px solid ${hairline}` }}
      >
        Save draft
      </button>
      <button
        type="button"
        onClick={onArchive}
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px]"
        style={{ color: txtMuted }}
      >
        <Archive className="h-3.5 w-3.5" />
        Archive
      </button>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(`Delete "${draft.title}"? This cannot be undone.`)) onDelete();
        }}
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px]"
        style={{ color: '#f87171' }}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
      <span className="ml-auto text-[10px]" style={{ color: txtMuted }}>
        {saveLabel ?? (savedAt ? `Saved ${savedAt}` : 'Unsaved')}
        {' · '}
        <span className="capitalize">{draft.status.replace('_', ' ')}</span>
      </span>
    </div>
  );
}
