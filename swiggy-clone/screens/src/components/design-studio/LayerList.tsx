import type { DesignDraft, DesignLayer } from '@/lib/design-queue/types';
import { getAsset } from '@/lib/design-queue/assets';

interface Props {
  draft: DesignDraft;
  artboardId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  txtMuted: string;
  txtHeadline: string;
  accent: string;
  hairline: string;
}

function layerLabel(draft: DesignDraft, layer: DesignLayer): string {
  if (layer.type === 'text') return layer.content.slice(0, 24) || 'Text';
  if (layer.type === 'image') {
    const a = getAsset(draft, layer.assetId);
    return a?.path.split('/').pop() ?? layer.label ?? 'Image';
  }
  if (layer.type === 'video') return getAsset(draft, layer.assetId)?.path.split('/').pop() ?? 'Video';
  if (layer.type === 'audio') return getAsset(draft, layer.assetId)?.path.split('/').pop() ?? 'Audio';
  return `${layer.kind} ${layer.text}`.slice(0, 28);
}

export function LayerList({
  draft,
  artboardId,
  selectedId,
  onSelect,
  txtMuted,
  txtHeadline,
  accent,
  hairline,
}: Props) {
  const layers = draft.layers.filter((l) => l.artboardId === artboardId);

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: txtMuted }}>
        Layers ({layers.length})
      </p>
      <div
        className="max-h-[120px] overflow-y-auto rounded-lg"
        style={{ border: `1px solid ${hairline}` }}
      >
        {layers.length === 0 && (
          <p className="px-2 py-2 text-[11px]" style={{ color: txtMuted }}>
            No layers on this artboard.
          </p>
        )}
        {layers.map((layer) => {
          const on = layer.id === selectedId;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onSelect(layer.id)}
              className="flex w-full items-center gap-2 border-b px-2 py-1.5 text-left text-[11px] last:border-0"
              style={{
                borderColor: hairline,
                backgroundColor: on ? 'rgba(120,255,200,0.1)' : 'transparent',
                color: on ? accent : txtHeadline,
              }}
            >
              <span className="capitalize opacity-70">{layer.type}</span>
              <span className="truncate">{layerLabel(draft, layer)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
