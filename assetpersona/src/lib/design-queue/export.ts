import { stripPreviewFromAssets } from './assets';
import { buildAgentBrief, buildAgentPrompt, draftToSpec } from './agent-brief';
import type { DesignDraft } from './types';

export interface RepoExportPayload {
  id: string;
  spec: ReturnType<typeof draftToSpec>;
  brief: string;
  meta: {
    id: string;
    title: string;
    status: string;
    targetPath: string;
    updatedAt: string;
  };
  assets: Array<{ name: string; dataUrl: string; path: string }>;
}

export function buildExportPayload(draft: DesignDraft): RepoExportPayload {
  const assets: RepoExportPayload['assets'] = [];
  for (const asset of draft.assets) {
    if (!asset.previewSrc?.startsWith('data:')) continue;
    const filename = asset.path.split('/').pop() ?? `${asset.kind}.bin`;
    assets.push({ name: filename, dataUrl: asset.previewSrc, path: asset.path });
  }
  return {
    id: draft.id,
    spec: draftToSpec(draft),
    brief: buildAgentBrief(draft),
    meta: {
      id: draft.id,
      title: draft.title,
      status: draft.status,
      targetPath: draft.targetPath,
      updatedAt: draft.updatedAt,
    },
    assets,
  };
}

export async function saveDraftToRepo(
  draft: DesignDraft,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  const payload = buildExportPayload(draft);
  try {
    const res = await fetch('/api/design-queue/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || res.statusText };
    }
    const data = (await res.json()) as { ok?: boolean; path?: string };
    return { ok: data.ok === true, path: data.path };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyAgentPrompt(draft: DesignDraft): Promise<void> {
  await navigator.clipboard.writeText(buildAgentPrompt(draft));
}

export function specAssetsSummary(draft: DesignDraft): string {
  return stripPreviewFromAssets(draft.assets)
    .map((a) => a.path)
    .join('\n');
}
