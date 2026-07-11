import { useState } from 'react';
import { Copy, FolderOutput, Send, ExternalLink, Trash2 } from 'lucide-react';
import type { DesignDraft, DesignLayer, QueueStatus } from '@/lib/design-queue/types';
import { getAsset } from '@/lib/design-queue/assets';
import { listFlowPaths } from '@/flow-paths';
import { copyAgentPrompt, downloadJson, downloadText, saveDraftToRepo } from '@/lib/design-queue/export';
import { buildAgentBrief, draftToSpec } from '@/lib/design-queue/agent-brief';
import { FontPicker } from './FontPicker';
import { LayerList } from './LayerList';
import { glass } from '@/screens-theme';

interface Props {
  draft: DesignDraft;
  screenPaths: string[];
  selectedLayer: DesignLayer | null;
  onPatch: (patch: Partial<DesignDraft>) => void;
  onPatchLayer: (id: string, patch: Partial<DesignLayer>) => void;
  onDeleteLayer: (id: string) => void;
  activeArtboardId: string;
  onArtboardChange: (id: string) => void;
  onAddArtboard: () => void;
  onOpenScreen: (path: string) => void;
  onSelectLayer: (id: string) => void;
  accent: string;
  accentSoft: string;
  txtMuted: string;
  txtHeadline: string;
  hairline: string;
}

export function DesignInspector({
  draft,
  screenPaths,
  selectedLayer,
  onPatch,
  onPatchLayer,
  onDeleteLayer,
  activeArtboardId,
  onArtboardChange,
  onAddArtboard,
  onOpenScreen,
  onSelectLayer,
  accent,
  accentSoft,
  txtMuted,
  txtHeadline,
  hairline,
}: Props) {
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const flowPaths = listFlowPaths();

  const setStatus = (status: QueueStatus) => onPatch({ status });

  const exportRepo = async () => {
    setExportMsg('Saving…');
    const result = await saveDraftToRepo(draft);
    if (result.ok) {
      setExportMsg(`Saved to ${result.path ?? 'design-queue/'}`);
    } else {
      setExportMsg(result.error ?? 'Save failed — use downloads');
      downloadJson('spec.json', draftToSpec(draft));
      downloadText('AGENT-BRIEF.md', buildAgentBrief(draft));
    }
    window.setTimeout(() => setExportMsg(null), 4000);
  };

  const assetPath =
    selectedLayer &&
    (selectedLayer.type === 'image' ||
      selectedLayer.type === 'video' ||
      selectedLayer.type === 'audio')
      ? getAsset(draft, selectedLayer.assetId)?.path
      : undefined;

  return (
    <aside
      className={`${glass.raised} flex h-full w-[280px] shrink-0 flex-col overflow-y-auto`}
      aria-label="Draft inspector"
    >
      <div className="space-y-3 p-3" style={{ borderBottom: `1px solid ${hairline}` }}>
        <label className="block text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
          Title
        </label>
        <input
          value={draft.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          className={`${glass.inset} w-full rounded-lg px-2.5 py-2 text-[13px]`}
          style={{ color: txtHeadline }}
        />
        <label className="block text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
          Target screen path
        </label>
        <input
          list="screen-paths"
          value={draft.targetPath}
          onChange={(e) => {
            const path = e.target.value;
            onPatch({ targetPath: path, targetExists: screenPaths.includes(path) });
          }}
          placeholder="screen-home"
          className={`${glass.inset} w-full rounded-lg px-2.5 py-2 text-[12px] font-mono`}
          style={{ color: txtHeadline }}
        />
        <datalist id="screen-paths">
          {screenPaths.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        {draft.targetPath && (
          <button
            type="button"
            onClick={() => onOpenScreen(draft.targetPath)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-semibold"
            style={{ backgroundColor: accentSoft, color: accent }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Screens
          </button>
        )}
        <LayerList
          draft={draft}
          artboardId={activeArtboardId}
          selectedId={selectedLayer?.id ?? null}
          onSelect={onSelectLayer}
          txtMuted={txtMuted}
          txtHeadline={txtHeadline}
          accent={accent}
          hairline={hairline}
        />
        <label className="block text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
          Artboards
        </label>
        <div className="flex flex-wrap gap-1">
          {draft.artboards.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onArtboardChange(a.id)}
              className="rounded-md px-2 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: activeArtboardId === a.id ? accentSoft : 'transparent',
                color: activeArtboardId === a.id ? accent : txtMuted,
              }}
            >
              {a.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onAddArtboard}
            className="rounded-md px-2 py-1 text-[11px] font-semibold"
            style={{ color: accent }}
          >
            + Add
          </button>
        </div>
        <label className="block text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
          Flow journey
        </label>
        <select
          value={draft.flowPathId ?? ''}
          onChange={(e) => onPatch({ flowPathId: e.target.value || undefined })}
          className={`${glass.inset} w-full rounded-lg px-2 py-2 text-[12px]`}
          style={{ color: txtHeadline }}
        >
          <option value="">None</option>
          {flowPaths.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {assetPath && (
        <div className="space-y-1 p-3" style={{ borderBottom: `1px solid ${hairline}` }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
            Asset path
          </p>
          <code className="block break-all rounded-lg bg-black/30 px-2 py-1.5 text-[10px] text-emerald-300/90">
            {assetPath}
          </code>
        </div>
      )}

      {selectedLayer?.type === 'text' && (
        <div className="space-y-2 p-3" style={{ borderBottom: `1px solid ${hairline}` }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
            Selected text
          </p>
          <textarea
            value={selectedLayer.content}
            onChange={(e) => onPatchLayer(selectedLayer.id, { content: e.target.value } as Partial<DesignLayer>)}
            rows={3}
            className={`${glass.inset} w-full rounded-lg px-2 py-1.5 text-[13px]`}
          />
          <FontPicker
            valueId={selectedLayer.fontTokenId}
            onSelect={(tokenId, family) =>
              onPatchLayer(selectedLayer.id, {
                fontTokenId: tokenId,
                fontFamily: family,
              } as Partial<DesignLayer>)
            }
            accent={accent}
            accentSoft={accentSoft}
            txtMuted={txtMuted}
            txtHeadline={txtHeadline}
          />
        </div>
      )}

      {selectedLayer?.type === 'annotation' && (
        <div className="space-y-2 p-3" style={{ borderBottom: `1px solid ${hairline}` }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
            Annotation
          </p>
          <textarea
            value={selectedLayer.text}
            onChange={(e) => onPatchLayer(selectedLayer.id, { text: e.target.value } as Partial<DesignLayer>)}
            rows={2}
            className={`${glass.inset} w-full rounded-lg px-2 py-1.5 text-[12px]`}
          />
        </div>
      )}

      {selectedLayer && (
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => onDeleteLayer(selectedLayer.id)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold"
            style={{ color: '#f87171', border: `1px solid ${hairline}` }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete layer
          </button>
        </div>
      )}

      <div className="space-y-2 p-3" style={{ borderBottom: `1px solid ${hairline}` }}>
        <label className="block text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
          Notes for agent
        </label>
        <textarea
          value={draft.designerNotes}
          onChange={(e) => onPatch({ designerNotes: e.target.value })}
          rows={4}
          placeholder="What should the builder implement?"
          className={`${glass.inset} w-full rounded-lg px-2 py-1.5 text-[12px]`}
          style={{ color: txtHeadline }}
        />
      </div>

      <div className="space-y-2 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
          Status
        </p>
        <div className="flex flex-wrap gap-1">
          {(['draft', 'ready', 'in_build', 'shipped'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className="rounded-md px-2 py-1 text-[11px] font-semibold capitalize"
              style={{
                backgroundColor: draft.status === s ? accentSoft : 'transparent',
                color: draft.status === s ? accent : txtMuted,
                border: `1px solid ${draft.status === s ? 'rgba(120,255,200,0.35)' : 'transparent'}`,
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            onPatch({ status: 'ready' });
            void exportRepo();
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-semibold"
          style={{ backgroundColor: accentSoft, color: accent }}
        >
          <Send className="h-3.5 w-3.5" />
          Send to queue (export)
        </button>
        <button
          type="button"
          onClick={() => void exportRepo()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border py-2 text-[12px] font-semibold"
          style={{ borderColor: hairline, color: txtHeadline }}
        >
          <FolderOutput className="h-3.5 w-3.5" />
          Export to repo folder
        </button>
        <button
          type="button"
          onClick={() => void copyAgentPrompt(draft)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[12px]"
          style={{ color: txtMuted }}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy agent prompt
        </button>
        {exportMsg && (
          <p className="text-[10px] leading-snug" style={{ color: accent }}>
            {exportMsg}
          </p>
        )}
      </div>
    </aside>
  );
}
