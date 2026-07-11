import type { DesignDraft } from '../design-queue/types';
import { stripPreviewFromAssets } from '../design-queue/assets';

export function buildDraftContextBlock(draft: DesignDraft, screenPaths: string[]): string {
  const neighbors = draft.targetPath
    ? screenPaths.filter((p) => p !== draft.targetPath).slice(0, 12)
    : screenPaths.slice(0, 12);

  const layerLines = draft.layers.map((l) => {
    if (l.type === 'text') return `text: "${l.content}" @(${l.frame.x},${l.frame.y}) font=${l.fontTokenId ?? 'default'}`;
    if (l.type === 'image') return `image: asset=${l.assetId} path ref in assets @(${l.frame.x},${l.frame.y})`;
    if (l.type === 'video') return `video: asset=${l.assetId}`;
    if (l.type === 'audio') return `audio: asset=${l.assetId}`;
    return `${l.kind}: "${l.text}"`;
  });

  return `## Draft
- id: ${draft.id}
- title: ${draft.title}
- status: ${draft.status}
- targetPath: ${draft.targetPath || '(unset)'}
- targetExists: ${draft.targetExists}
- flowPathId: ${draft.flowPathId ?? 'none'}

## Assets (repo paths)
${stripPreviewFromAssets(draft.assets)
  .map((a) => `- ${a.kind}: ${a.path} (${a.originalName})`)
  .join('\n') || '_none_'}

## Layers
${layerLines.join('\n') || '_none_'}

## Designer notes
${draft.designerNotes.trim() || '_none_'}

## Acceptance
${draft.acceptance.map((a) => `- ${a}`).join('\n')}

## Other manifest paths (sample)
${neighbors.join(', ')}`;
}
