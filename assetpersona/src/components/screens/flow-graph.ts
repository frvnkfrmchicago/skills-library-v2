/**
 * flow-graph — pure data + auto-layout engine for the Screen Gallery flow chart.
 *
 * Turns the ENRICHED screen manifest (groups → screens with object `linksTo` +
 * a unique `displayLabel`) into React Flow nodes + edges, laid out so the map
 * reads as ORGANIZED, DEPTH-LAYERED SECTIONS rather than a hairball. Two builders:
 *   - buildWholeAppGraph: every screen, every navigation edge, laid out as a
 *     grid of per-section clusters (each section = its own dagre sub-layout),
 *     with the section rows ORDERED BY NAVIGATION DEPTH so the map flows from
 *     entry points down to leaf screens (app-scanner "Screen Flow View laid out
 *     in layers by navigation depth").
 *   - buildSectionGraph + listSections: the section SLIDESHOW (Focused tab) —
 *     one section's clean intra-section DAG at a time, with cross-section links
 *     summarized as enter-from / exit-to seams instead of drawn (no hairball).
 *
 * Also exports reachability helpers (the connected PATH from a node) used by the
 * presentation layer for click-to-light-path.
 *
 * CONTRACT 1 (WAVE-SCREENS-CANVAS-2026-05-25): `linksTo` is now an array of
 * `{ target, label, via }` and is accurate (onClick/router/dynamic included,
 * dynamic routes already collapsed → no duplicate nodes). `displayLabel` is the
 * parent-context-disambiguated label and is unique across the manifest. This
 * module reads BOTH the enriched object shape AND the legacy `string[]` shape
 * defensively, so it is safe whichever shape the page passes in.
 *
 * Pure: takes `groups` as an argument, no app-data imports, no React.
 */

import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import { token } from '../../screens-theme';

export type GalleryNodeData = {
  /** Display text on the node — the unique `displayLabel` (falls back to `label`). */
  label: string;
  route: string; // the screen path (also the node id)
  /** What this page communicates — one sentence (WAVE-SCREENS-PRO Contract:
   *  ScreenNode.purpose?: string). Carried onto the node so the detail panel
   *  and any node tooltip can surface it without re-reading the manifest. */
  purpose?: string;
  /** Auto-scanned animation inventory (WAVE-SCREENS-UX-2026-05-25). Carried onto
   *  the node so a tooltip / the detail panel can surface motion without
   *  re-reading the manifest. */
  animations?: FlowAnimation[];
  groupId: string;
  groupLabel: string;
  groupColor: string;
  /** Navigation depth from the nearest entry point (0 = entry). For layering. */
  depth?: number;
  hasLoading?: boolean;
  hasError?: boolean;
  isFocus?: boolean;
  /** focused mode role: where this node sits relative to the focus screen. */
  focusRole?: 'focus' | 'inbound' | 'outbound';
  /** true for the synthetic section-header node (whole-app sectioning). */
  isSectionHeader?: boolean;
  /** true for the synthetic lane-backing node (whole-app swimlanes). Carries the
   *  bbox so the presentation layer can draw a bounded, labelled lane behind a
   *  section's cluster. */
  isLane?: boolean;
  /** Lane bbox (whole-app swimlane backing rect): full cluster width/height. */
  laneWidth?: number;
  laneHeight?: number;
  [key: string]: unknown;
};

/** A single navigation edge as carried on an edge's `data` (for legibility). */
export type GalleryEdgeData = {
  /** The button/link label that drives this navigation, when known. */
  linkLabel?: string;
  /** How the edge was detected: link | button | router | dynamic | redirect. */
  via?: string;
  [key: string]: unknown;
};

/** Enriched link shape (Contract 1). The legacy `string` shape is also accepted. */
export interface FlowLink {
  target: string;
  label?: string;
  via?: string;
}

/** Auto-scanned animation entry (WAVE-SCREENS-UX-2026-05-25 locked contract —
 *  produced by `scripts/scan-screens/animation-extract.ts`, rendered by Lane D).
 *  Carried through the graph additively so a node can surface its motion. */
export interface FlowAnimation {
  type: 'framer' | 'css' | 'tailwind';
  name: string;
  trigger: 'hover' | 'tap' | 'scroll' | 'enter-exit' | 'layout' | 'load' | 'drag';
  target: string;
  duration?: string;
}

export interface FlowScreenInput {
  path: string;
  /** Base label. */
  label: string;
  /** Unique, parent-context label (Contract 1). Preferred for node text. */
  displayLabel?: string;
  /** One-sentence "what this page communicates" (Contract: ScreenNode.purpose?:
   *  string). Produced by the scanner; carried through onto the node. */
  purpose?: string;
  /** Accurate navigation links — object shape (Contract 1) or legacy string[]. */
  linksTo?: Array<FlowLink | string>;
  /** Auto-scanned animations (WAVE-SCREENS-UX-2026-05-25). Passed through onto
   *  the node so the detail panel / Lane D can render `animations ?? []`. */
  animations?: FlowAnimation[];
  hasLoading?: boolean;
  hasError?: boolean;
}

export interface FlowGroupInput {
  id: string;
  label: string;
  flowOrder: number;
  /** Section tint — falls back to mint when absent. */
  color?: string;
  screens: FlowScreenInput[];
}

export type GalleryNode = Node<GalleryNodeData>;

const NODE_W = 130;
const NODE_H = 175;
const HEADER_H = 34;

/** Fallback section tint when a group carries no colour — the brand mint,
 *  derived from the shared `token.mintRgb` triplet (single source of record)
 *  rather than a duplicated hex literal. */
const DEFAULT_TINT = `#${token.mintRgb
  .split(',')
  .map((c: string) => Number(c.trim()).toString(16).padStart(2, '0'))
  .join('')}`;

interface NormalizedLink {
  target: string;
  label?: string;
  via?: string;
}

interface ScreenEntry {
  path: string;
  label: string; // resolved display text (displayLabel ?? label)
  purpose?: string; // what this page communicates (Contract: ScreenNode.purpose)
  links: NormalizedLink[];
  animations: FlowAnimation[]; // auto-scanned motion inventory (passthrough)
  hasLoading: boolean;
  hasError: boolean;
  groupId: string;
  groupLabel: string;
  groupColor: string;
  flowOrder: number;
}

/** Coerce either the enriched object `linksTo` or the legacy `string[]` to a
 *  normalized `{ target, label?, via? }[]`. Defensive against either shape so
 *  the graph is correct whether or not the caller has fully migrated. */
function normalizeLinks(linksTo: FlowScreenInput['linksTo']): NormalizedLink[] {
  if (!linksTo) return [];
  const out: NormalizedLink[] = [];
  for (const l of linksTo) {
    if (typeof l === 'string') {
      if (l) out.push({ target: l });
    } else if (l && typeof l.target === 'string' && l.target) {
      out.push({ target: l.target, label: l.label, via: l.via });
    }
  }
  return out;
}

/** path → screen entry (first writer wins). */
function indexScreens(groups: FlowGroupInput[]): Map<string, ScreenEntry> {
  const idx = new Map<string, ScreenEntry>();
  for (const g of groups) {
    for (const s of g.screens) {
      if (idx.has(s.path)) continue;
      idx.set(s.path, {
        path: s.path,
        // Prefer the unique displayLabel (Contract 1); fall back to label.
        label: s.displayLabel || s.label,
        purpose: s.purpose,
        links: normalizeLinks(s.linksTo),
        animations: Array.isArray(s.animations) ? s.animations : [],
        hasLoading: !!s.hasLoading,
        hasError: !!s.hasError,
        groupId: g.id,
        groupLabel: g.label,
        groupColor: g.color ?? DEFAULT_TINT,
        flowOrder: g.flowOrder,
      });
    }
  }
  return idx;
}

/** Collect every real navigation edge (known target, no self-loop, deduped). */
function collectEdges(idx: Map<string, ScreenEntry>): {
  list: { source: string; target: string; label?: string; via?: string }[];
  seen: Set<string>;
} {
  const seen = new Set<string>();
  const list: { source: string; target: string; label?: string; via?: string }[] = [];
  for (const entry of idx.values()) {
    for (const link of entry.links) {
      const target = link.target;
      if (!idx.has(target) || target === entry.path) continue;
      const id = `${entry.path}->${target}`;
      if (seen.has(id)) continue;
      seen.add(id);
      list.push({ source: entry.path, target, label: link.label, via: link.via });
    }
  }
  return { list, seen };
}

/**
 * Navigation depth per node: 0 for entry points (no inbound edge, plus the
 * landing route "/"), then BFS outward. Disconnected nodes default to 0. Used to
 * order sections from entry → leaf so the whole map reads in layers by depth
 * (app-scanner "Screen Flow View laid out in layers by navigation depth").
 */
function computeDepths(
  idx: Map<string, ScreenEntry>,
  edges: { source: string; target: string }[],
): Map<string, number> {
  const out = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  for (const p of idx.keys()) {
    out.set(p, []);
    indeg.set(p, 0);
  }
  for (const e of edges) {
    out.get(e.source)!.push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }
  const depth = new Map<string, number>();
  const queue: string[] = [];
  for (const p of idx.keys()) {
    if ((indeg.get(p) ?? 0) === 0 || p === '/') {
      depth.set(p, 0);
      queue.push(p);
    }
  }
  // Cycle-safe relaxation (each node settles to its shortest distance from a root).
  const visited = new Set<string>(queue);
  while (queue.length) {
    const cur = queue.shift()!;
    const d = depth.get(cur) ?? 0;
    for (const nxt of out.get(cur) ?? []) {
      const nd = d + 1;
      if (!depth.has(nxt) || nd < (depth.get(nxt) as number)) {
        depth.set(nxt, nd);
        if (!visited.has(nxt)) {
          visited.add(nxt);
          queue.push(nxt);
        } else {
          queue.push(nxt); // re-relax once; BFS keeps this bounded for this graph size
        }
      }
    }
  }
  for (const p of idx.keys()) if (!depth.has(p)) depth.set(p, 0);
  return depth;
}

/** Run dagre over the given node ids + edges; return positions (top-left) + bbox. */
function layout(
  nodeIds: string[],
  edges: { source: string; target: string }[],
  rankdir: 'TB' | 'LR',
  ranksep: number,
  nodesep: number,
): { pos: Map<string, { x: number; y: number }>; width: number; height: number } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir, ranksep, nodesep, marginx: 18, marginy: 18 });
  g.setDefaultEdgeLabel(() => ({}));
  for (const id of nodeIds) g.setNode(id, { width: NODE_W, height: NODE_H });
  for (const e of edges) {
    if (g.hasNode(e.source) && g.hasNode(e.target)) g.setEdge(e.source, e.target);
  }
  dagre.layout(g);
  const pos = new Map<string, { x: number; y: number }>();
  let maxX = 0;
  let maxY = 0;
  for (const id of nodeIds) {
    const n = g.node(id) as { x: number; y: number } | undefined;
    const p = n ? { x: n.x - NODE_W / 2, y: n.y - NODE_H / 2 } : { x: 0, y: 0 };
    pos.set(id, p);
    maxX = Math.max(maxX, p.x + NODE_W);
    maxY = Math.max(maxY, p.y + NODE_H);
  }
  return { pos, width: Math.max(NODE_W, maxX), height: Math.max(NODE_H, maxY) };
}

function toNode(
  entry: ScreenEntry,
  pos: { x: number; y: number },
  extra: Partial<GalleryNodeData> = {},
): GalleryNode {
  return {
    id: entry.path,
    type: 'screen',
    position: pos,
    data: {
      label: entry.label,
      route: entry.path,
      purpose: entry.purpose,
      animations: entry.animations,
      groupId: entry.groupId,
      groupLabel: entry.groupLabel,
      groupColor: entry.groupColor,
      hasLoading: entry.hasLoading,
      hasError: entry.hasError,
      ...extra,
    },
  };
}

function mkEdge(source: string, target: string, label?: string, via?: string): Edge {
  const data: GalleryEdgeData = {};
  if (label) data.linkLabel = label;
  if (via) data.via = via;
  return { id: `${source}->${target}`, source, target, data };
}

/* ═══════════════════════════════════════════════════
   WHOLE-APP GRAPH — depth-layered, sectioned grid of clusters
   ═══════════════════════════════════════════════════ */

/**
 * Every screen as a node, clustered BY SECTION. Each section is laid out on its
 * own with dagre (top-down) into a compact block, then the blocks are packed
 * left-to-right into rows ORDERED BY NAVIGATION DEPTH so the map reads as
 * labelled columns of sections flowing from entry points to leaf screens. A
 * synthetic header node sits atop each section. Cross-section edges are
 * preserved so the global flow is still traceable.
 */
export function buildWholeAppGraph(groups: FlowGroupInput[]): {
  nodes: GalleryNode[];
  edges: Edge[];
} {
  const idx = indexScreens(groups);

  // All real navigation edges (known targets only, no self-loops, deduped).
  const { list: rawEdges } = collectEdges(idx);

  // Navigation depth per node — drives the section ordering (entry → leaf).
  const depthOf = computeDepths(idx, rawEdges);

  // Bucket screens by section.
  const sectionOf = new Map<string, string>();
  for (const e of idx.values()) sectionOf.set(e.path, e.groupId);

  // Per-section intra edges drive each cluster's internal dagre layout.
  const edgesBySection = new Map<string, { source: string; target: string }[]>();
  for (const e of rawEdges) {
    const sa = sectionOf.get(e.source);
    const sb = sectionOf.get(e.target);
    if (sa && sb && sa === sb) {
      const arr = edgesBySection.get(sa) ?? [];
      arr.push(e);
      edgesBySection.set(sa, arr);
    }
  }

  const SECTION_GAP_X = 60; // horizontal gap between section blocks
  const SECTION_GAP_Y = 80; // vertical gap between section rows
  const COLS = 4; // section blocks per row

  // Lay out each section cluster locally, capture its bbox + min member depth.
  type Block = {
    groupId: string;
    label: string;
    color: string;
    flowOrder: number;
    minDepth: number;
    memberCount: number;
    local: Map<string, { x: number; y: number }>;
    width: number;
    height: number;
  };
  const blocks: Block[] = [];

  for (const g of groups) {
    const memberIds: string[] = [];
    for (const s of g.screens) {
      // first-writer-wins guard mirrors indexScreens
      if (sectionOf.get(s.path) === g.id && idx.get(s.path)?.groupId === g.id) {
        if (!memberIds.includes(s.path)) memberIds.push(s.path);
      }
    }
    if (memberIds.length === 0) continue;

    const localEdges = (edgesBySection.get(g.id) ?? []).filter(
      (e) => memberIds.includes(e.source) && memberIds.includes(e.target),
    );
    const { pos, width, height } = layout(memberIds, localEdges, 'TB', 80, 40);
    // Section's place in the depth ordering = the shallowest screen it contains.
    let minDepth = Infinity;
    for (const id of memberIds) minDepth = Math.min(minDepth, depthOf.get(id) ?? 0);
    if (!Number.isFinite(minDepth)) minDepth = 0;

    blocks.push({
      groupId: g.id,
      label: g.label,
      color: g.color ?? DEFAULT_TINT,
      flowOrder: g.flowOrder,
      minDepth,
      memberCount: memberIds.length,
      local: pos,
      width,
      height: height + HEADER_H, // reserve room for the header strip
    });
  }

  // Order sections entry → leaf by navigation depth, then by authored flowOrder
  // as a stable tiebreak (so siblings at the same depth keep a sensible order).
  blocks.sort((a, b) => a.minDepth - b.minDepth || a.flowOrder - b.flowOrder);

  // Pack blocks into a grid: COLS per row, each row as tall as its tallest block.
  const nodes: GalleryNode[] = [];
  let rowY = 0;
  for (let i = 0; i < blocks.length; i += COLS) {
    const row = blocks.slice(i, i + COLS);
    const rowH = Math.max(...row.map((b) => b.height));
    let colX = 0;
    for (const b of row) {
      // SWIMLANE backing rect (synthetic — not in idx). Pushed FIRST so it
      // renders BEHIND the header + member cards: a bounded, section-tinted lane
      // that makes each dagre sub-cluster read as an organized region instead of
      // a free-floating clump. Non-interactive (no drag/select/pointer) so it
      // never intercepts clicks meant for the screens that sit on top of it; the
      // header strip + member cards keep all interaction. Cross-lane edges draw
      // ABOVE this rect, so global connections visibly cross lane boundaries.
      nodes.push({
        id: `__lane__${b.groupId}`,
        type: 'laneBox',
        position: { x: colX, y: rowY },
        draggable: false,
        selectable: false,
        focusable: false,
        // Sink the lane wrapper BELOW the edges + member cards (React Flow honours
        // a top-level `zIndex` on the node and applies it to the node wrapper).
        // Edges then visibly cross lane boundaries instead of being occluded.
        zIndex: -1,
        data: {
          label: b.label,
          route: '',
          groupId: b.groupId,
          groupLabel: b.label,
          groupColor: b.color,
          isLane: true,
          laneWidth: b.width,
          laneHeight: b.height,
          memberCount: b.memberCount,
        },
        style: { width: b.width, height: b.height, pointerEvents: 'none' },
      } as GalleryNode);

      // Section header node (synthetic — not in idx).
      nodes.push({
        id: `__section__${b.groupId}`,
        type: 'sectionHeader',
        position: { x: colX, y: rowY },
        draggable: false,
        selectable: false,
        data: {
          label: b.label,
          route: '',
          groupId: b.groupId,
          groupLabel: b.label,
          groupColor: b.color,
          isSectionHeader: true,
          memberCount: b.memberCount,
        },
        style: { width: b.width },
      } as GalleryNode);

      // Member screens, offset by the block origin + header strip.
      for (const [id, p] of b.local) {
        const entry = idx.get(id);
        if (!entry) continue;
        nodes.push(
          toNode(
            entry,
            { x: colX + p.x, y: rowY + HEADER_H + p.y },
            { depth: depthOf.get(id) ?? 0 },
          ),
        );
      }
      colX += b.width + SECTION_GAP_X;
    }
    rowY += rowH + SECTION_GAP_Y;
  }

  const edges: Edge[] = rawEdges.map((e) => mkEdge(e.source, e.target, e.label, e.via));
  return { nodes, edges };
}

/* ═══════════════════════════════════════════════════
   MOBBIN-STYLE NAMED JOURNEY — single ordered path (TB chain)
   ═══════════════════════════════════════════════════ */

/**
 * Lays out only the screens in `pathOrder` as a vertical chain (Mobbin flow
 * step order). Includes manifest navigation edges between path screens.
 */
export function buildFlowPathGraph(
  groups: FlowGroupInput[],
  pathOrder: string[],
): {
  nodes: GalleryNode[];
  edges: Edge[];
} {
  const idx = indexScreens(groups);
  const { list: rawEdges } = collectEdges(idx);
  const pathSet = new Set(pathOrder);
  const GAP_Y = 28;
  const nodes: GalleryNode[] = [];
  let y = 0;

  for (let i = 0; i < pathOrder.length; i++) {
    const id = pathOrder[i];
    const entry = idx.get(id);
    if (!entry) continue;
    nodes.push(
      toNode(entry, { x: 0, y }, { depth: i, focusRole: i === 0 ? 'inbound' : undefined }),
    );
    y += NODE_H + GAP_Y;
  }

  const edges: Edge[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < pathOrder.length - 1; i++) {
    const source = pathOrder[i];
    const target = pathOrder[i + 1];
    const entry = idx.get(source);
    const link = entry?.links.find((l) => l.target === target);
    const id = `${source}->${target}`;
    seen.add(id);
    edges.push(mkEdge(source, target, link?.label ?? 'Next step', link?.via ?? 'flow'));
  }

  for (const e of rawEdges) {
    if (!pathSet.has(e.source) || !pathSet.has(e.target)) continue;
    const id = `${e.source}->${e.target}`;
    if (seen.has(id)) continue;
    seen.add(id);
    edges.push(mkEdge(e.source, e.target, e.label, e.via));
  }

  return { nodes, edges };
}

/* ═══════════════════════════════════════════════════
   SECTION SLIDESHOW — one section's clean DAG + summarized seams
   The Focused tab steps through sections one at a time (overview→detail
   drill-down — app-scanner-librarian "three views"). Per section we draw ONLY
   the intra-section flow (top-down, layered by navigation depth) and SUMMARIZE
   cross-section links as enter-from / exit-to chips (app-scanner "exit port
   labels for links to other groups") — never the cross-section web. No hairball.
   ═══════════════════════════════════════════════════ */

/** A neighbouring section that links into / out of the current one. */
export interface SectionSummary {
  id: string;
  label: string;
  color: string;
  count: number; // number of links across the seam
}

/** A section entry for the slideshow rail / stepper. */
export interface SectionMeta {
  id: string;
  label: string;
  color: string;
  count: number; // screens owned by the section
}

export interface SectionView {
  nodes: GalleryNode[];
  edges: Edge[];
  enterFrom: SectionSummary[];
  exitTo: SectionSummary[];
  section: { id: string; label: string; color: string };
}

/** Ordered sections for the slideshow — authored `flowOrder` (the narrative
 *  order Landing → Auth → Onboarding → …). Only sections that own ≥1 screen. */
export function listSections(groups: FlowGroupInput[]): SectionMeta[] {
  const idx = indexScreens(groups);
  const seen = new Set<string>();
  const metas: (SectionMeta & { flowOrder: number })[] = [];
  for (const g of groups) {
    if (seen.has(g.id)) continue;
    let count = 0;
    for (const s of g.screens) if (idx.get(s.path)?.groupId === g.id) count++;
    if (count === 0) continue;
    seen.add(g.id);
    metas.push({
      id: g.id,
      label: g.label,
      color: g.color ?? DEFAULT_TINT,
      count,
      flowOrder: g.flowOrder,
    });
  }
  metas.sort((a, b) => a.flowOrder - b.flowOrder);
  return metas.map(({ flowOrder: _drop, ...m }) => m);
}

/**
 * One section as a clean top-down DAG (dagre TB, which ranks parents above
 * children → layered by navigation depth), with cross-section links collapsed
 * into enter-from / exit-to summaries. Only intra-section edges are drawn, so
 * the canvas stays readable no matter how connected the section is.
 */
export function buildSectionGraph(groups: FlowGroupInput[], sectionId: string): SectionView {
  const idx = indexScreens(groups);
  const { list: allEdges } = collectEdges(idx);
  const sectionOf = (p: string) => idx.get(p)?.groupId;

  const memberIds = [...idx.values()].filter((e) => e.groupId === sectionId).map((e) => e.path);
  const memberSet = new Set(memberIds);

  const intra = allEdges.filter((e) => memberSet.has(e.source) && memberSet.has(e.target));
  const { pos } = layout(memberIds, intra, 'TB', 90, 50);

  const nodes: GalleryNode[] = [];
  for (const id of memberIds) {
    const entry = idx.get(id);
    if (entry) nodes.push(toNode(entry, pos.get(id) ?? { x: 0, y: 0 }));
  }
  const edges = intra.map((e) => mkEdge(e.source, e.target, e.label, e.via));

  // Collapse every cross-section link into a per-neighbour-section tally.
  const tally = (otherIds: string[]): SectionSummary[] => {
    const m = new Map<string, number>();
    for (const o of otherIds) m.set(o, (m.get(o) ?? 0) + 1);
    const out: SectionSummary[] = [];
    for (const [sid, count] of m) {
      const g = groups.find((gg) => gg.id === sid);
      if (g) out.push({ id: sid, label: g.label, color: g.color ?? DEFAULT_TINT, count });
    }
    return out.sort((a, b) => b.count - a.count);
  };

  const enterOthers: string[] = [];
  const exitOthers: string[] = [];
  for (const e of allEdges) {
    const sa = sectionOf(e.source);
    const sb = sectionOf(e.target);
    if (sb === sectionId && sa && sa !== sectionId) enterOthers.push(sa);
    if (sa === sectionId && sb && sb !== sectionId) exitOthers.push(sb);
  }

  const g = groups.find((gg) => gg.id === sectionId);
  return {
    nodes,
    edges,
    enterFrom: tally(enterOthers),
    exitTo: tally(exitOthers),
    section: { id: sectionId, label: g?.label ?? sectionId, color: g?.color ?? DEFAULT_TINT },
  };
}

/* ═══════════════════════════════════════════════════
   REACHABILITY — the connected PATH from a node
   ═══════════════════════════════════════════════════ */

export interface Adjacency {
  out: Map<string, string[]>;
  in: Map<string, string[]>;
}

/** Build forward/backward adjacency lists from an edge list (memoize per dataset). */
export function buildAdjacency(edges: Edge[]): Adjacency {
  const out = new Map<string, string[]>();
  const inn = new Map<string, string[]>();
  for (const e of edges) {
    (out.get(e.source) ?? out.set(e.source, []).get(e.source)!).push(e.target);
    (inn.get(e.target) ?? inn.set(e.target, []).get(e.target)!).push(e.source);
  }
  return { out, in: inn };
}

/**
 * The full connected PATH for `start`: every node reachable downstream
 * (following edges) PLUS every node that can reach `start` upstream. Returns the
 * node id set and the edge id set that lie on those paths — used to light the
 * whole chain, not just immediate neighbours. Cycle-safe via visited sets.
 */
export function connectedPath(
  start: string,
  adj: Adjacency,
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const nodeIds = new Set<string>([start]);
  const edgeIds = new Set<string>();

  // Downstream (start → … reachable)
  const fwd: string[] = [start];
  const fwdSeen = new Set<string>([start]);
  while (fwd.length) {
    const cur = fwd.pop()!;
    for (const nxt of adj.out.get(cur) ?? []) {
      edgeIds.add(`${cur}->${nxt}`);
      nodeIds.add(nxt);
      if (!fwdSeen.has(nxt)) {
        fwdSeen.add(nxt);
        fwd.push(nxt);
      }
    }
  }
  // Upstream (… → start can reach)
  const back: string[] = [start];
  const backSeen = new Set<string>([start]);
  while (back.length) {
    const cur = back.pop()!;
    for (const prv of adj.in.get(cur) ?? []) {
      edgeIds.add(`${prv}->${cur}`);
      nodeIds.add(prv);
      if (!backSeen.has(prv)) {
        backSeen.add(prv);
        back.push(prv);
      }
    }
  }
  return { nodeIds, edgeIds };
}

/** Immediate-neighbour set (1 hop both directions) — used for hover preview. */
export function neighbourSet(
  start: string,
  adj: Adjacency,
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const nodeIds = new Set<string>([start]);
  const edgeIds = new Set<string>();
  for (const nxt of adj.out.get(start) ?? []) {
    nodeIds.add(nxt);
    edgeIds.add(`${start}->${nxt}`);
  }
  for (const prv of adj.in.get(start) ?? []) {
    nodeIds.add(prv);
    edgeIds.add(`${prv}->${start}`);
  }
  return { nodeIds, edgeIds };
}
