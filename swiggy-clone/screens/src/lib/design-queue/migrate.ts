import type { AssetRef, DesignDraft, DesignLayer, LayerFrame } from './types';

/** Legacy v1 draft shape (no assets / aiThread). */
interface LegacyDraft {
  id: string;
  title: string;
  status: DesignDraft['status'];
  targetPath: string;
  targetExists: boolean;
  flowPathId?: string;
  artboards: DesignDraft['artboards'];
  layers: Array<Record<string, unknown>>;
  designerNotes: string;
  acceptance: string[];
  createdAt: string;
  updatedAt: string;
}

function migrateLayer(layer: Record<string, unknown>, draftId: string, assets: AssetRef[]): DesignLayer | null {
  const t = layer.type as string;
  if (t === 'text') {
    return layer as unknown as DesignLayer;
  }
  if (t === 'annotation') {
    return layer as unknown as DesignLayer;
  }
  if (t === 'image' && typeof layer.src === 'string') {
    const src = layer.src;
    const id = `asset-mig-${String(layer.id)}`;
    const path = `design-queue/${draftId}/assets/${id}.png`;
    if (src.startsWith('data:')) {
      assets.push({
        id,
        path,
        mime: 'image/png',
        kind: 'image',
        originalName: String(layer.label ?? 'migrated.png'),
        previewSrc: src,
      });
    }
    return {
      type: 'image',
      id: String(layer.id),
      artboardId: String(layer.artboardId),
      frame: layer.frame as LayerFrame,
      assetId: id,
      src: src.startsWith('data:') ? src : path,
      label: layer.label as string | undefined,
    };
  }
  return null;
}

export function migrateDraft(raw: LegacyDraft): DesignDraft {
  const assets: AssetRef[] = [];
  const layers: DesignLayer[] = [];
  for (const l of raw.layers) {
    const m = migrateLayer(l, raw.id, assets);
    if (m) layers.push(m);
  }
  return {
    ...raw,
    layers,
    assets,
    aiThread: [],
    lastSavedAt: raw.updatedAt,
  };
}

export function isLegacyDraft(d: unknown): d is LegacyDraft {
  if (!d || typeof d !== 'object') return false;
  const o = d as Record<string, unknown>;
  return !('assets' in o) || !Array.isArray(o.assets);
}
