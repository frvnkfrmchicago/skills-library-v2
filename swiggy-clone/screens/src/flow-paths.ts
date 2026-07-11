/**
 * flow-paths — Mobbin-style named journeys over the screen manifest.
 * Builds a filtered edge list and ordered screen list for a selected path.
 */

import type { FlowGroupInput } from './flow-graph';
import type { FlowPathDef } from '@/lib/manifest-types';
import manifestData from './screen-manifest.json';

const manifest = manifestData as { flowPaths?: FlowPathDef[]; groups: FlowGroupInput[] };

export function listFlowPaths(): FlowPathDef[] {
  return manifest.flowPaths ?? [];
}

export function getFlowPath(id: string | null): FlowPathDef | null {
  if (!id) return null;
  return listFlowPaths().find((p) => p.id === id) ?? null;
}

/** Consecutive pairs in the path order → edges for layout emphasis. */
export function pathSequenceEdges(
  path: FlowPathDef,
): { source: string; target: string; label?: string }[] {
  const edges: { source: string; target: string; label?: string }[] = [];
  for (let i = 0; i < path.order.length - 1; i++) {
    edges.push({
      source: path.order[i],
      target: path.order[i + 1],
      label: 'next',
    });
  }
  return edges;
}

export function pathScreenSet(path: FlowPathDef): Set<string> {
  return new Set(path.order);
}

export { manifest };
