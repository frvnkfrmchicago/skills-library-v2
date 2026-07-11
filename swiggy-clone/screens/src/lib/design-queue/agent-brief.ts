import { stripPreviewFromAssets } from './assets';
import type { DesignDraft, DesignSpecExport } from './types';

export function draftToSpec(draft: DesignDraft): DesignSpecExport {
  return {
    id: draft.id,
    status: draft.status,
    title: draft.title,
    target: { path: draft.targetPath, exists: draft.targetExists },
    flowPathId: draft.flowPathId,
    artboards: draft.artboards,
    layers: draft.layers.map((l) => {
      if (l.type === 'image' || l.type === 'video' || l.type === 'audio') {
        const asset = draft.assets.find((a) => a.id === l.assetId);
        return { ...l, src: asset?.path ?? l.src };
      }
      return l;
    }),
    assets: stripPreviewFromAssets(draft.assets),
    designerNotes: draft.designerNotes,
    acceptance: draft.acceptance,
    aiSummary: draft.aiThread.filter((m) => m.role === 'assistant').slice(-1)[0]?.content?.slice(0, 500),
    meta: {
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      galleryVersion: '2',
    },
  };
}

export function buildAgentBrief(draft: DesignDraft, repoRoot = 'swiggy-clone'): string {
  const spec = draftToSpec(draft);
  const layerSummary = draft.layers
    .map((l) => {
      if (l.type === 'text') {
        return `- **text** "${l.content}" @ (${l.frame.x},${l.frame.y}) font=${l.fontTokenId ?? l.fontFamily ?? 'default'}`;
      }
      if (l.type === 'image') {
        const path = draft.assets.find((a) => a.id === l.assetId)?.path ?? l.src;
        return `- **image** \`${path}\` @ (${l.frame.x},${l.frame.y}) ${l.frame.width}×${l.frame.height}`;
      }
      if (l.type === 'video') {
        const path = draft.assets.find((a) => a.id === l.assetId)?.path ?? l.src;
        return `- **video** \`${path}\``;
      }
      if (l.type === 'audio') {
        const path = draft.assets.find((a) => a.id === l.assetId)?.path ?? l.src;
        return `- **audio** \`${path}\``;
      }
      return `- **${l.kind}** "${l.text}" @ (${l.frame.x},${l.frame.y})`;
    })
    .join('\n');

  const assetTable = stripPreviewFromAssets(draft.assets)
    .map((a) => `| ${a.kind} | \`${a.path}\` | ${a.originalName} |`)
    .join('\n');

  return `# Agent brief — ${draft.title}

## TL;DR
Build or update screen \`${draft.targetPath || '(assign path)'}\` from design queue item \`${draft.id}\`.

## Queue paths
| Artifact | Path |
|----------|------|
| Spec (machine) | \`${repoRoot}/design-queue/${draft.id}/spec.json\` |
| Assets | \`${repoRoot}/design-queue/${draft.id}/assets/\` |
| This brief | \`${repoRoot}/design-queue/${draft.id}/AGENT-BRIEF.md\` |
| AI thread | \`${repoRoot}/design-queue/${draft.id}/ai-thread.json\` |

## Target
- **Screen path:** \`${draft.targetPath || 'TBD'}\`
- **Exists in manifest:** ${draft.targetExists ? 'yes' : 'no — register in screen-manifest.json'}
- **Flow path:** ${draft.flowPathId ?? 'none'}
- **Status:** ${draft.status}

## Assets
| Kind | Path | File |
|------|------|------|
${assetTable || '| — | — | — |'}

## Designer notes
${draft.designerNotes.trim() || '_No notes._'}

## Layers
${layerSummary || '_No layers — add content in Design Studio._'}

## Acceptance
${draft.acceptance.map((a) => `- [ ] ${a}`).join('\n')}

## Build steps
1. Read \`spec.json\` and assets in this folder (use paths above, not embedded blobs).
2. Open prototype: \`index.html?screen=${draft.targetPath}\` (port 8080).
3. Implement in \`index.html\` / \`app.js\`; update \`screens/src/screen-manifest.json\`.
4. Verify in gallery Screens tab + live preview.
5. Set queue status to \`shipped\` in gallery or \`meta.json\`.

## Spec snapshot
\`\`\`json
${JSON.stringify(spec, null, 2).slice(0, 4000)}${JSON.stringify(spec).length > 4000 ? '\n…' : ''}
\`\`\`
`;
}

export function buildAgentPrompt(draft: DesignDraft): string {
  return `Process design queue item "${draft.id}" (${draft.title}).
Read swiggy-clone/design-queue/${draft.id}/AGENT-BRIEF.md and spec.json.
Use asset files under design-queue/${draft.id}/assets/ (paths in spec, not data URLs).
Implement target screen "${draft.targetPath}" in swiggy-clone/index.html and app.js.
Update screen-manifest.json. Verify localhost:8080 preview and gallery.
Mark status shipped when done.`;
}
