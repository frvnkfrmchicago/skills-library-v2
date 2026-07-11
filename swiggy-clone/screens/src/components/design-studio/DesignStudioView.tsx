import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import type { DesignDraft, DesignLayer, DesignTool } from '@/lib/design-queue/types';
import {
  archiveDraft,
  createEmptyDraft,
  deleteDraft,
  getDraft,
  listDrafts,
  saveDraft,
} from '@/lib/design-queue/store';
import { DesignToolbar } from './DesignToolbar';
import { DesignCanvas } from './DesignCanvas';
import { DesignQueuePanel } from './DesignQueuePanel';
import { DesignInspector } from './DesignInspector';
import { DesignStudioChrome } from './DesignStudioChrome';
import { DesignCopilot } from './DesignCopilot';
import { glass } from '@/screens-theme';
import { colors, withOpacity } from '@/lib/design-tokens';

const ACCENT = colors.brandGreen;
const ACCENT_SOFT = withOpacity(ACCENT, 0.14);
const ACCENT_LINE = withOpacity(ACCENT, 0.28);
const TXT_HEADLINE = colors.text.headline;
const TXT_MUTED = colors.text.muted;
const HAIRLINE = 'rgba(255,255,255,0.08)';

interface Props {
  screenPaths: string[];
  onOpenScreen: (path: string) => void;
}

export function DesignStudioView({ screenPaths, onOpenScreen }: Props) {
  const [showArchived, setShowArchived] = useState(false);
  const [drafts, setDrafts] = useState<DesignDraft[]>(() => listDrafts(showArchived));
  const [activeId, setActiveId] = useState<string | null>(() => listDrafts(false)[0]?.id ?? null);
  const [tool, setTool] = useState<DesignTool>('select');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeArtboardId, setActiveArtboardId] = useState<string>('a1');
  const [saveFlash, setSaveFlash] = useState<string | null>(null);

  const refresh = useCallback(
    () => setDrafts(listDrafts(showArchived)),
    [showArchived],
  );

  const draft = useMemo(
    () => (activeId ? getDraft(activeId) : null) ?? drafts.find((d) => d.id === activeId) ?? null,
    [activeId, drafts],
  );

  const updateDraft = useCallback(
    (next: DesignDraft, explicit = false) => {
      const saved = saveDraft(next, explicit);
      setDrafts(listDrafts(showArchived));
      setActiveId(saved.id);
    },
    [showArchived],
  );

  const patch = useCallback(
    (patch: Partial<DesignDraft>, explicit = false) => {
      if (!draft) return;
      updateDraft({ ...draft, ...patch }, explicit);
    },
    [draft, updateDraft],
  );

  const patchLayer = useCallback(
    (id: string, layerPatch: Partial<DesignLayer>) => {
      if (!draft) return;
      updateDraft({
        ...draft,
        layers: draft.layers.map((l) => (l.id === id ? ({ ...l, ...layerPatch } as DesignLayer) : l)),
      });
    },
    [draft, updateDraft],
  );

  const onNew = () => {
    const d = createEmptyDraft('New screen design');
    updateDraft(d, true);
    setTool('select');
    setSelectedLayerId(null);
    setActiveArtboardId(d.artboards[0]?.id ?? 'a1');
  };

  useEffect(() => {
    refresh();
  }, [showArchived, refresh]);

  useEffect(() => {
    if (draft?.artboards.some((a) => a.id === activeArtboardId)) return;
    setActiveArtboardId(draft?.artboards[0]?.id ?? 'a1');
  }, [draft, activeArtboardId]);

  const onDelete = (id: string) => {
    deleteDraft(id);
    refresh();
    if (activeId === id) {
      const rest = listDrafts(showArchived);
      setActiveId(rest[0]?.id ?? null);
    }
  };

  const handleSave = () => {
    if (!draft) return;
    const saved = saveDraft(draft, true);
    setSaveFlash('Saved');
    setDrafts(listDrafts(showArchived));
    window.setTimeout(() => setSaveFlash(null), 2000);
    return saved;
  };

  const selectedLayer = draft?.layers.find((l) => l.id === selectedLayerId) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden gap-3 p-3">
      <div className={`${glass.base} ${glass.rise} flex shrink-0 items-center gap-3 px-4 py-2.5`}>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
        >
          <Pencil className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-[17px] font-bold tracking-tight" style={{ color: TXT_HEADLINE }}>
            Design Studio
          </h2>
          <p className="text-[12px]" style={{ color: TXT_MUTED }}>
            Draft screens, annotate, GLM copilot, export to agent queue.
          </p>
        </div>
      </div>

      <div className={`${glass.raised} flex min-h-0 flex-1 overflow-hidden`}>
        <DesignQueuePanel
          drafts={drafts}
          activeId={activeId}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived((v) => !v)}
          onSelect={setActiveId}
          onNew={onNew}
          onDelete={onDelete}
          accent={ACCENT}
          txtMuted={TXT_MUTED}
          txtHeadline={TXT_HEADLINE}
          hairline={HAIRLINE}
        />

        {draft ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <DesignStudioChrome
                draft={draft}
                onSave={handleSave}
                onSaveDraft={() => patch({ status: 'draft' }, true)}
                onArchive={() => {
                  const a = archiveDraft(draft.id);
                  if (a) {
                    refresh();
                    if (!showArchived) setActiveId(listDrafts(false)[0]?.id ?? null);
                  }
                }}
                onDelete={() => onDelete(draft.id)}
                saveLabel={saveFlash ?? undefined}
                accent={ACCENT}
                accentSoft={ACCENT_SOFT}
                txtMuted={TXT_MUTED}
                txtHeadline={TXT_HEADLINE}
                hairline={HAIRLINE}
              />
              <div className="flex min-h-0 flex-1 overflow-hidden">
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex min-h-0 flex-1">
                    <div className="shrink-0 p-2">
                      <DesignToolbar
                        tool={tool}
                        onTool={setTool}
                        accent={ACCENT}
                        accentSoft={ACCENT_SOFT}
                        accentLine={ACCENT_LINE}
                      />
                    </div>
                    <DesignCanvas
                      draft={draft}
                      artboardId={activeArtboardId}
                      tool={tool}
                      selectedId={selectedLayerId}
                      onSelect={setSelectedLayerId}
                      onChangeLayers={(layers) => {
                        const other = draft.layers.filter((l) => l.artboardId !== activeArtboardId);
                        patch({ layers: [...other, ...layers] });
                      }}
                      onChangeDraft={(p) => patch(p)}
                    />
                  </div>
                </div>
                <DesignCopilot
              draft={draft}
              screenPaths={screenPaths}
              onThreadUpdate={(aiThread) => patch({ aiThread }, true)}
              onApplyNotes={(text) =>
                patch({
                  designerNotes: draft.designerNotes
                    ? `${draft.designerNotes}\n\n${text}`
                    : text,
                })
              }
              accent={ACCENT}
              accentSoft={ACCENT_SOFT}
              txtMuted={TXT_MUTED}
              txtHeadline={TXT_HEADLINE}
              hairline={HAIRLINE}
                />
                <DesignInspector
              draft={draft}
              screenPaths={screenPaths}
              selectedLayer={selectedLayer}
              onPatch={patch}
              onPatchLayer={patchLayer}
              onDeleteLayer={(id) => {
                patch({ layers: draft.layers.filter((l) => l.id !== id) });
                setSelectedLayerId(null);
              }}
              activeArtboardId={activeArtboardId}
              onArtboardChange={setActiveArtboardId}
              onAddArtboard={() => {
                const n = draft.artboards.length + 1;
                const id = `a${n}`;
                patch({
                  artboards: [...draft.artboards, { id, label: `Screen ${n}` }],
                });
                setActiveArtboardId(id);
              }}
              onOpenScreen={onOpenScreen}
              onSelectLayer={setSelectedLayerId}
              accent={ACCENT}
              accentSoft={ACCENT_SOFT}
              txtMuted={TXT_MUTED}
              txtHeadline={TXT_HEADLINE}
              hairline={HAIRLINE}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <button
              type="button"
              onClick={onNew}
              className="rounded-xl px-6 py-3 text-[14px] font-semibold"
              style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
            >
              Create your first draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
