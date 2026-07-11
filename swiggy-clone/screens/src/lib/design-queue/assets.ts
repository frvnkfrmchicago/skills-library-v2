import type { AssetKind, AssetRef, DesignDraft } from './types';

const EXT: Record<AssetKind, string> = {
  image: 'png',
  video: 'mp4',
  audio: 'm4a',
};

export function assetRepoPath(draftId: string, filename: string): string {
  return `design-queue/${draftId}/assets/${filename}`;
}

export function nextAssetFilename(draft: DesignDraft, kind: AssetKind): string {
  const n = draft.assets.filter((a) => a.kind === kind).length + 1;
  const ext = EXT[kind];
  return `${kind}-${n}.${ext}`;
}

export function createAssetFromFile(
  draftId: string,
  file: File,
  kind: AssetKind,
  previewSrc: string,
  filename: string,
): AssetRef {
  return {
    id: `asset-${Date.now().toString(36)}`,
    path: assetRepoPath(draftId, filename),
    mime: file.type || (kind === 'image' ? 'image/png' : kind === 'video' ? 'video/mp4' : 'audio/mp4'),
    kind,
    originalName: file.name,
    previewSrc,
  };
}

export function getAsset(draft: DesignDraft, assetId: string): AssetRef | undefined {
  return draft.assets.find((a) => a.id === assetId);
}

export function layerPreviewSrc(draft: DesignDraft, assetId: string, fallbackSrc: string): string {
  const asset = getAsset(draft, assetId);
  return asset?.previewSrc ?? fallbackSrc;
}

export function stripPreviewFromAssets(assets: AssetRef[]): Array<Omit<AssetRef, 'previewSrc'>> {
  return assets.map(({ previewSrc: _p, ...rest }) => rest);
}
