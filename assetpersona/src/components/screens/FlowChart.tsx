/**
 * FlowChart — the interactive screen-flow chart for the Screen Gallery.
 *
 * Built on @xyflow/react (React Flow v12) + a sibling dagre layout engine, with
 * a FOCUS+CONTEXT interaction model so density never turns into noise. Nodes are
 * skinned as Liquid-Glass cards using the shared material TOKENS from
 * `screens-theme.ts` (Contract 2) — React Flow styles nodes via the inline
 * `style` prop, so we spread the token recipe rather than a CSS class.
 *
 * Research-backed design choices:
 *   • LIQUID GLASS — every node is one raised glass surface (blur 56 + saturate
 *     180 + hairline border + inner specular), on ONE elevation ramp
 *     (token.elev1..4). No per-node bespoke shadow soup (visual-auditing: "one
 *     elevation system"; Apple HIG Materials; Material 3 elevation).
 *   • DEPTH-LAYERED SECTIONS — flow-graph orders section clusters by navigation
 *     depth (entry → leaf); the map reads as labelled columns flowing downward
 *     (app-scanner "Screen Flow View laid out in layers by navigation depth").
 *   • FOCUS + CONTEXT — the active node's whole connected PATH (click) or
 *     immediate neighbours (hover) light up mint; everything else fades. You see
 *     "what connects to this screen" without tracing lines (flow-librarian:
 *     an explicit, drawable state machine of where each screen goes).
 *   • REACTIVE HIGHLIGHT — lighting responds to pointer in real time, the lit
 *     path animates a marching-ants stroke (interactive-animation-librarian:
 *     "animation should react, not just play").
 *   • CLEAN NODES — `displayLabel` + route only; no L/E state badges (state lives
 *     in the detail panel's States switcher). Colour is never the sole signal —
 *     focus/active also carry a brighter border + lift (visual-auditing).
 *
 * PERFORMANCE — the critical gate: hovering/clicking does NOT rebuild the
 * node/edge arrays. Those arrays are memoised on the *dataset* only. Highlight
 * state lives in a React context that the custom node consumes, and edge
 * highlighting is applied via a generated CSS rule on the existing edge DOM — so
 * no full-graph re-render (and no flicker) happens on hover.
 */

import type * as React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  MarkerType,
  useReactFlow,
  useStore,
  type Node,
  type Edge,
  type NodeProps,
  type NodeMouseHandler,
  type NodeTypes,
  type DefaultEdgeOptions,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { token } from '../../screens-theme';
import { FlowNodeThumbnail } from './FlowNodeThumbnail';
import { colors } from '@/lib/design-tokens';
import {
  buildWholeAppGraph,
  buildFlowPathGraph,
  buildSectionGraph,
  listSections,
  buildAdjacency,
  connectedPath,
  neighbourSet,
  type GalleryNodeData,
  type FlowGroupInput,
  type SectionSummary,
} from './flow-graph';
import { getFlowPath } from './flow-paths';

/* The brand mint, composed from the shared token rgb triplet — NO raw hex here
 * (feedback_one_source_of_record_per_token). Used as the highlight accent and
 * the React Flow chrome accent. */
const MINT = `rgb(${token.mintRgb})`;
const mint = (a: number) => `rgba(${token.mintRgb}, ${a})`;
const lavender = (a: number) => `rgba(155, 209, 237, ${a})`; // blue text (was purple)
const DEFAULT_ACCENT = MINT;

/* Near-white node/heading text — the canonical headline token (single source of
 * record in lib/design-tokens.ts), not a one-off hex. */
const HEADLINE = colors.text.headline;

/* ── Map zoom envelope (map-only constants; screens-theme tokens stay read-only).
 *   The Whole map used to open with `fitView` collapsing all 177 nodes to specks
 *   (no maxZoom + minZoom 0.1). We cap the opening fit at FIT_MAX_ZOOM so the map
 *   lands at a readable scale, and raise the floor to MAP_MIN_ZOOM so a user can
 *   never pan/zoom back down into speck-scale. Every fit (declarative + both
 *   imperative) shares these so the framing is consistent.
 *   REVEAL_ZOOM is the live-zoom threshold past which a node card surfaces its
 *   route text + holographic sheen — below it, clusters stay clean at open scale
 *   (semantic / contextual zoom; "animation should react, not just play"). */
const FIT_PADDING = 0.2;
const FIT_MAX_ZOOM = 0.85;
const MAP_MIN_ZOOM = 0.25;
/* Floor the OPENING fit so 183 nodes don't open as unclickable specks. fitView
   clamps the computed fit to this, so the map opens BIG and clickable (nodes
   ~115px wide) and you pan/follow to explore — the user can still manually zoom
   out to MAP_MIN_ZOOM, and the Overview tab shows the full set at once. */
const OPEN_MIN_ZOOM = 0.55;
const MAP_MAX_ZOOM = 1.6;
const REVEAL_ZOOM = 0.7;

/** Escape a string for safe use inside a CSS attribute-selector "double-quoted" value. */
function cssEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/* ═══════════════════════════════════════════════════
   PUBLIC CONTRACT — do not change (the page depends on it)
   ═══════════════════════════════════════════════════ */

export interface FlowChartProps {
  groups: FlowGroupInput[];
  mode: 'map' | 'focused';
  /** The currently selected screen path. */
  focusPath: string | null;
  onSelectScreen: (path: string) => void;
  /** Mobbin-style journey id — when set in map mode, layout filters to that path order. */
  journeyPathId?: string | null;
  /** Mint accent; defaults to the GrazzHopper mint token. */
  accent?: string;
}

/* ═══════════════════════════════════════════════════
   HIGHLIGHT CONTEXT
   The single source of "what is lit right now". Hover/click write to it; the
   custom node reads it. Because the node/edge ARRAYS never depend on this, the
   React Flow graph is not rebuilt — only the cheap node components re-render.
   ═══════════════════════════════════════════════════ */

interface HighlightState {
  /** the node driving focus+context (hovered, else selected) */
  activeId: string | null;
  /** node ids on the lit path/neighbourhood (empty ⇒ nothing dimmed) */
  litNodes: Set<string>;
  /** is any highlight active (⇒ dim the rest) */
  hasActive: boolean;
  accent: string;
}

const HighlightContext = createContext<HighlightState>({
  activeId: null,
  litNodes: new Set(),
  hasActive: false,
  accent: DEFAULT_ACCENT,
});

/* ═══════════════════════════════════════════════════
   CUSTOM NODE — "screen"
   A Liquid-Glass card: bright label + mono muted route + section-tinted rail.
   Clean by design — no state badges (loading/error lives in the detail panel).
   It reads HighlightContext to decide its own active/dimmed styling, so hover
   never touches the parent's node array.
   ═══════════════════════════════════════════════════ */

type ScreenNode = Node<GalleryNodeData, 'screen'>;
type SectionNode = Node<GalleryNodeData, 'sectionHeader'>;
type LaneNode = Node<GalleryNodeData, 'laneBox'>;
/** Container-level node type: the graph holds screen, section-header, and the
 *  non-interactive lane-backing nodes (whole-app swimlanes). */
type FlowNode = ScreenNode | SectionNode | LaneNode;

function ScreenNodeCard({ id, data }: NodeProps<ScreenNode>) {
  const { activeId, litNodes, hasActive, accent } = useContext(HighlightContext);

  const zoom = useStore((s) => s.transform[2]);
  const isFocus = !!data.isFocus;
  const active = id === activeId;
  const lit = hasActive && litNodes.has(id);
  const dimmed = hasActive && !litNodes.has(id);
  const showDetail = zoom >= REVEAL_ZOOM || active || isFocus;

  const role = data.focusRole;
  const accentState = isFocus || active;

  const border = accentState
    ? `1.5px solid ${accent}`
    : lit
      ? `1px solid ${mint(0.5)}`
      : `1px solid ${token.nodeBorder}`;

  const boxShadow = isFocus
    ? `0 0 0 1px ${mint(0.45)}, ${token.glowMint}, ${token.elev4}, ${token.specularStrong}`
    : active
      ? `0 0 0 1px ${mint(0.4)}, ${token.glowMint}, ${token.elev3}, ${token.specularStrong}`
      : lit
        ? `0 0 0 1px ${mint(0.28)}, ${token.elev3}, ${token.specularStrong}`
        : `${token.elev3}, ${token.specularStrong}`;

  const handleStyle: React.CSSProperties = {
    width: 6,
    height: 6,
    background: dimmed ? lavender(0.4) : accent,
    border: 'none',
    opacity: dimmed ? 0.4 : 0.95,
  };

  return (
    <div
      className="fc-node"
      title={`${data.label}\n${data.route}\n— ${data.groupLabel}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      style={{
        position: 'relative',
        width: 130,
        minHeight: 160,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: token.radiusLg,
        background: accentState ? token.nodeFillActive : token.nodeFill,
        border,
        boxShadow,
        opacity: dimmed ? 0.34 : 1,
        transition: `opacity ${token.durNormal} ${token.easeOut}, box-shadow ${token.durNormal} ${token.easeOut}, border-color ${token.durFast} ${token.easeOut}`,
        overflow: 'hidden',
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} isConnectable={false} />
      <Handle type="target" position={Position.Left} style={handleStyle} isConnectable={false} />

      {/* Live thumbnail preview */}
      <div style={{ padding: '6px 6px 0 6px' }}>
        <FlowNodeThumbnail path={data.route} />
      </div>

      {/* Label below the thumbnail */}
      <div
        style={{
          padding: '5px 8px 7px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {role === 'inbound' ? <DirArrow dir="in" accent={accent} /> : null}
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.2,
              color: HEADLINE,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
              minWidth: 0,
            }}
          >
            {data.label}
          </span>
          {role === 'outbound' ? <DirArrow dir="out" accent={accent} /> : null}
        </div>
        {showDetail ? (
          <span
            style={{
              fontSize: 9,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              color: lavender(0.7),
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {data.route}
          </span>
        ) : null}
      </div>

      <Handle type="source" position={Position.Bottom} style={handleStyle} isConnectable={false} />
      <Handle type="source" position={Position.Right} style={handleStyle} isConnectable={false} />

      {showDetail ? <span aria-hidden className="fc-node-sheen" /> : null}
    </div>
  );
}

function DirArrow({ dir, accent }: { dir: 'in' | 'out'; accent: string }) {
  return (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 800,
        lineHeight: 1,
        color: accent,
        opacity: 0.85,
      }}
    >
      {dir === 'in' ? '←' : '→'}
    </span>
  );
}

/* ── Section header node (whole-app sectioning) ── */

function SectionHeaderNode({ data }: NodeProps<SectionNode>) {
  const tint = data.groupColor || DEFAULT_ACCENT;
  const count = typeof data.memberCount === 'number' ? data.memberCount : null;
  return (
    <div
      className="fc-section-header nodrag nopan"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 12px 5px 11px',
        borderRadius: token.radiusMd,
        background: `linear-gradient(90deg, ${hexTint(tint, 0.16)}, rgba(${token.orange1Rgb}, 0))`,
        borderLeft: `3px solid ${tint}`,
        boxShadow: token.specular,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: tint,
          boxShadow: `0 0 8px ${tint}`,
        }}
      />
      <span
        style={{
          fontSize: 12.5,
          fontWeight: 800,
          letterSpacing: '0.02em',
          color: HEADLINE,
          textTransform: 'uppercase',
        }}
      >
        {data.label}
      </span>
      {count != null ? (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: lavender(0.8),
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count}
        </span>
      ) : null}
    </div>
  );
}

/* ── Section LANE backing (whole-app swimlanes) ──
   A non-interactive bounded rectangle drawn BEHIND a section's dagre sub-cluster
   so each section reads as an organized, labelled lane instead of a free-floating
   clump (flow-librarian: an explicit, drawable structure). Pure presentation: it
   sits at zIndex -1 (set on the node) with pointer-events:none so it never
   intercepts clicks meant for the screen cards on top, and cross-lane edges draw
   above it — connections visibly cross lane boundaries. Sized to the bbox carried
   on the node (laneWidth/laneHeight from flow-graph). */
function SectionLaneNode({ data }: NodeProps<LaneNode>) {
  const tint = data.groupColor || DEFAULT_ACCENT;
  const w = typeof data.laneWidth === 'number' ? data.laneWidth : undefined;
  const h = typeof data.laneHeight === 'number' ? data.laneHeight : undefined;
  return (
    <div
      aria-hidden
      className="fc-lane nodrag nopan"
      style={{
        width: w,
        height: h,
        boxSizing: 'border-box',
        borderRadius: token.radiusLg,
        // A faint section-tinted wash + hairline border bounds the lane without
        // competing with the cards. Tint at low alpha so the page mesh still
        // reads through (one elevation system — this is below everything).
        background: `linear-gradient(155deg, ${hexTint(tint, 0.07)}, rgba(${token.orange1Rgb}, 0.04))`,
        border: `1px solid ${hexTint(tint, 0.22)}`,
        boxShadow: `inset 0 0 40px rgba(${token.orange1Rgb}, 0.10)`,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Append an alpha to a hex section-tint (group colours are 6-digit hex data). */
function hexTint(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}${a}` : hex;
}

/** A cross-section seam as a FLAT labeled row (no pills): a heading + inline
 *  "tick · name · count · glyph" items. Clicking an item slides to that
 *  neighbouring section. Direction is carried by a glyph + colour tick (never
 *  colour alone), satisfying the no-colour-only rule. */
function SeamRow({
  dir,
  label,
  items,
  onJump,
  emptyText,
}: {
  dir: 'in' | 'out';
  label: string;
  items: SectionSummary[];
  onJump: (id: string) => void;
  emptyText: string;
}) {
  return (
    <div className={`fc-seam fc-seam-${dir}`}>
      <span className="fc-seam-label">{label}</span>
      {items.length ? (
        items.map((s) => (
          <button
            key={s.id}
            type="button"
            className="fc-seam-item"
            onClick={() => onJump(s.id)}
            title={`${s.count} link${s.count === 1 ? '' : 's'} ${dir === 'in' ? 'from' : 'to'} ${s.label}`}
          >
            <span className="fc-seam-tick" style={{ background: s.color }} />
            <span className="fc-seam-name">{s.label}</span>
            <span className="fc-seam-count">{s.count}</span>
            <span className="fc-seam-arrow">{dir === 'in' ? '↘' : '↗'}</span>
          </button>
        ))
      ) : (
        <span className="fc-seam-none">{emptyText}</span>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  screen: ScreenNodeCard,
  sectionHeader: SectionHeaderNode,
  laneBox: SectionLaneNode,
};

/* ═══════════════════════════════════════════════════
   INNER CHART — lives inside ReactFlowProvider so useReactFlow() can drive
   fitView, and so it can imperatively restyle edge DOM on highlight change.
   ═══════════════════════════════════════════════════ */

function FlowChartInner({
  groups,
  mode,
  focusPath,
  onSelectScreen,
  journeyPathId = null,
  accent = DEFAULT_ACCENT,
}: FlowChartProps) {
  const rf = useReactFlow<FlowNode, Edge>();
  const reduceMotion = useReducedMotion();

  /* ── SECTION SLIDESHOW state (focused mode) ──
     The Focused tab walks one section at a time. The starting section is seeded
     from the page's selected screen (focusPath); prev/next + the rail + keyboard
     ←/→ step through the rest. */
  const sections = useMemo(() => listSections(groups), [groups]);
  const clampIdx = useCallback(
    (i: number) => Math.max(0, Math.min(i, Math.max(0, sections.length - 1))),
    [sections.length],
  );
  const seededIdx = useMemo(() => {
    if (!focusPath) return 0;
    let sid: string | undefined;
    for (const g of groups) {
      if (g.screens.some((s) => s.path === focusPath)) {
        sid = g.id;
        break;
      }
    }
    const i = sections.findIndex((s) => s.id === sid);
    return i >= 0 ? i : 0;
  }, [groups, focusPath, sections]);

  const [secIdx, setSecIdx] = useState(seededIdx);
  const [dir, setDir] = useState(1); // 1 = forward (slide in from right), -1 = back
  const lastSeed = useRef(seededIdx);
  // Re-seed when the page selects a different screen (external focusPath change).
  useEffect(() => {
    if (seededIdx !== lastSeed.current) {
      lastSeed.current = seededIdx;
      setDir(seededIdx >= secIdx ? 1 : -1);
      setSecIdx(seededIdx);
    }
  }, [seededIdx, secIdx]);
  const curIdx = clampIdx(secIdx);

  const step = useCallback(
    (delta: number) => {
      setDir(delta >= 0 ? 1 : -1);
      setSecIdx((i) => clampIdx(i + delta));
    },
    [clampIdx],
  );
  const jumpTo = useCallback(
    (sid: string) => {
      const i = sections.findIndex((s) => s.id === sid);
      if (i < 0) return;
      setSecIdx((cur) => {
        setDir(i >= cur ? 1 : -1);
        return i;
      });
    },
    [sections],
  );

  // Keyboard ←/→ steps sections (focused mode only).
  useEffect(() => {
    if (mode !== 'focused') return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, step]);

  /* ── Base graph — recompute ONLY when the dataset (or section) changes. ──
     Focused = the current section's clean intra-section DAG; map = whole app. */
  const sectionView = useMemo(
    () =>
      mode === 'focused' && sections.length ? buildSectionGraph(groups, sections[curIdx].id) : null,
    [mode, groups, sections, curIdx],
  );
  const journeyPath = useMemo(() => getFlowPath(journeyPathId), [journeyPathId]);
  const base = useMemo(() => {
    if (sectionView) return sectionView;
    if (mode === 'map' && journeyPath) {
      return buildFlowPathGraph(groups, journeyPath.order);
    }
    return buildWholeAppGraph(groups);
  }, [sectionView, mode, journeyPath, groups]);

  const adjacency = useMemo(() => buildAdjacency(base.edges), [base.edges]);

  /* ── Node array — stable per dataset. NO hover dependency. ──
     Highlight is applied by the custom node via context, not by re-mapping. */
  const nodes = useMemo<FlowNode[]>(() => {
    return base.nodes.map((n) => ({ ...n, selectable: n.selectable !== false }) as FlowNode);
  }, [base.nodes]);

  /* ── Edge array — STABLE per dataset (no hover/selection dependency). Resting
     style comes from CSS; lit edges are re-styled by the generated per-id rule
     below. Keeping this array reference stable is what prevents React Flow from
     rebuilding/flickering the whole graph on hover. ── */
  const edges = useMemo<Edge[]>(() => {
    // CONNECTIVITY IS THE POINT: the map no longer HIDES edges at rest. Every
    // edge stays as a FAINT, thin resting line (styled by the data-mode="map"
    // CSS rule below) so the whole web of "what connects to what" is perceptible
    // at a glance — quiet context, not a 456-edge hairball ("Graphs Beyond the
    // Hairball": a readable graph shows structure without screaming every line).
    // Hover / click-to-follow then POPS the focused path bright mint via the
    // generated lit-path rule, while the data-has-active dim rule fades the rest
    // for focus+context. Resting styling lives entirely in CSS, so this array
    // stays referentially stable (no rebuild on hover — the perf gate).
    return base.edges.map((e) => {
      const linkLabel = (e.data as { linkLabel?: string } | undefined)?.linkLabel;
      return {
        ...e,
        type: e.type ?? 'default',
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        label: linkLabel,
        labelStyle: { fill: HEADLINE, fontSize: 10, fontWeight: 600 },
        labelBgStyle: { fill: 'rgba(12, 6, 22, 0.88)', fillOpacity: 0.92 },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
      };
    });
  }, [base.edges]);

  /* ── Highlight state — what hover/click lit up. Updating this re-renders the
     cheap node components (via context) but never the node/edge arrays. ──
       • hover  → a quick 1-hop NEIGHBOUR preview (read-only, transient)
       • select → the clicked/selected screen lights its WHOLE connected PATH
                  and stays lit at rest. */
  const [hoverId, setHoverId] = useState<string | null>(null);
  const selectedId = focusPath; // the screen the page considers selected

  /* ── MAP FOLLOW state — degree-of-interest focus on the Whole map. ──
     Single-clicking a node on the map sets it as the "followed" node: the view
     recenters on it and its neighbourhood lights in place, so you can walk the
     chain by clicking a lit neighbour — never scrolling to find connections
     (CMU degree-of-interest / focus+context). This is LOCAL to the chart and
     deliberately separate from focusPath (which the page uses to drill into the
     live preview) so a single map click follows-in-place rather than yanking the
     viewer out to the detail panel. Double-click still drills in.
     `walkHistory` is the breadcrumb trail of followed nodes so ← can retrace. */
  const [mapFocusId, setMapFocusId] = useState<string | null>(null);
  const walkHistory = useRef<string[]>([]);
  // Drop a stale map-follow when the dataset/mode changes underneath us.
  useEffect(() => {
    setMapFocusId(null);
    walkHistory.current = [];
  }, [mode, base.nodes.length]);

  // WHOLE MAP is reveal-on-demand: at rest NOTHING is lit (edges stay hidden so
  // the overview is clean). HOVER reveals a node's 1-hop links; CLICK-to-follow
  // (mapFocusId) lights the followed node's neighbourhood and keeps it lit at
  // rest so the chain stays walkable. The section slideshow keeps the resting
  // selection glow so the focused screen's in-section path stays lit.
  const effectiveActive = hoverId ?? (mode === 'map' ? mapFocusId : selectedId);

  const { litNodes, litEdges } = useMemo(() => {
    if (!effectiveActive) {
      return { litNodes: new Set<string>(), litEdges: new Set<string>() };
    }
    // hover OR map-follow → immediate (1-hop) neighbours, so the lit set stays
    // tight enough to recenter+frame and so each click steps exactly one hop
    // along the chain. The section slideshow (selection) keeps the full
    // connected-path glow it always had.
    const r =
      hoverId !== null || mode === 'map'
        ? neighbourSet(effectiveActive, adjacency)
        : connectedPath(effectiveActive, adjacency);
    return { litNodes: r.nodeIds, litEdges: r.edgeIds };
  }, [effectiveActive, hoverId, mode, adjacency]);

  const highlight = useMemo<HighlightState>(
    () => ({
      activeId: effectiveActive,
      litNodes,
      hasActive: !!effectiveActive,
      accent,
    }),
    [effectiveActive, litNodes, accent],
  );

  /* ── Light edges WITHOUT rebuilding the edges array. ──
     React Flow always renders `data-id="<edge id>"` on each edge group, so we
     generate a small scoped CSS rule that targets exactly the lit edges by id.
     This string is rebuilt on highlight change (cheap — it's just text) and,
     crucially, CSS attribute selectors survive React Flow's internal edge
     re-renders during pan/zoom, where toggling a DOM class would be wiped. */
  const litEdgeCss = useMemo(() => {
    if (litEdges.size === 0) return '';
    const sel = (suffix: string) =>
      [...litEdges]
        .map((id) => `.fc-flow .react-flow__edge[data-id="${cssEscape(id)}"]${suffix}`)
        .join(',\n');
    return `
      ${sel(' .react-flow__edge-path')} {
        stroke: var(--fc-accent) !important;
        stroke-width: 2.4 !important;
        opacity: 1 !important;
        stroke-dasharray: 6 4;
        animation: fc-dashdraw 0.55s linear infinite;
      }
      ${sel(' .react-flow__arrowhead')},
      ${sel(' marker path')} { fill: var(--fc-accent) !important; opacity: 1 !important; }
    `;
  }, [litEdges]);

  /* ── Recenter helper — animate the viewport to a node (focus+context). ──
     Centres on the node's middle at a comfortable reading zoom; reduced-motion
     collapses the 420ms glide to an instant jump. Screen nodes are a fixed
     208×64; we read the measured box when React Flow has it, else fall back. */
  const FOLLOW_ZOOM = 0.95;
  const centerOnNode = useCallback(
    (node: FlowNode) => {
      const w = node.measured?.width ?? (node.width as number | undefined) ?? 208;
      const h = node.measured?.height ?? (node.height as number | undefined) ?? 64;
      try {
        rf.setCenter(node.position.x + w / 2, node.position.y + h / 2, {
          zoom: Math.min(1.4, Math.max(rf.getZoom(), FOLLOW_ZOOM)),
          duration: reduceMotion ? 0 : 420,
        });
      } catch {
        /* instance not ready */
      }
    },
    [rf, reduceMotion],
  );

  /* Look a node up by id from the current node array (for keyboard walking). */
  const nodeById = useCallback(
    (id: string): FlowNode | undefined => nodes.find((n) => n.id === id),
    [nodes],
  );

  /* ── MAP WALK — the single source of truth for stepping the followed chain. ──
     Called by BOTH the keyboard (←/→) AND the clickable Prev/Next buttons in the
     follow-hint bar, so the arrows are real controls, not decoration:
       • dir = +1  advance DOWNSTREAM — step to the followed node's first outbound
                   neighbour (its first link); if none, fall back to any neighbour.
       • dir = -1  retrace — pop the breadcrumb trail back to where you came from;
                   with no trail, step UPSTREAM to a node that links into this one.
     Each step recenters via centerOnNode (the only view movement while browsing —
     never an auto-refit). Neighbour order is the graph's own edge order, so the
     traversal is predictable. No-ops cleanly when nothing is being followed. */
  const walkMap = useCallback(
    (dir: 1 | -1) => {
      if (!mapFocusId) return;
      const outs = adjacency.out.get(mapFocusId) ?? [];
      const ins = adjacency.in.get(mapFocusId) ?? [];

      const goTo = (id: string | undefined, pushTrail: boolean) => {
        if (!id) return;
        const node = nodeById(id);
        if (!node) return;
        if (pushTrail && walkHistory.current[walkHistory.current.length - 1] !== mapFocusId) {
          walkHistory.current.push(mapFocusId);
        }
        setHoverId(null);
        setMapFocusId(id);
        centerOnNode(node);
      };

      if (dir === 1) {
        // advance: first outbound link, else any neighbour
        goTo(outs[0] ?? ins[0], true);
      } else {
        // retrace the trail; else fall back to an upstream source
        const prev = walkHistory.current.pop();
        if (prev) {
          const node = nodeById(prev);
          if (node) {
            setHoverId(null);
            setMapFocusId(prev);
            centerOnNode(node);
          }
        } else {
          goTo(ins[0] ?? outs[0], false);
        }
      }
    },
    [mapFocusId, adjacency, nodeById, centerOnNode],
  );

  /* Enable/disable state for the clickable walk buttons. Next is walkable when
     the followed node links anywhere (outbound preferred, inbound fallback —
     matching walkMap). Prev is walkable when there's a breadcrumb trail OR an
     upstream/any source to step to. A node that's followable was reached via an
     edge, so it virtually always has a neighbour — but we still gate to avoid a
     dead button on a truly isolated node. */
  const { canWalkPrev, canWalkNext } = useMemo(() => {
    if (!mapFocusId) return { canWalkPrev: false, canWalkNext: false };
    const outs = adjacency.out.get(mapFocusId) ?? [];
    const ins = adjacency.in.get(mapFocusId) ?? [];
    const hasNeighbour = outs.length > 0 || ins.length > 0;
    // canWalkPrev = hasNeighbour: ← retraces walkHistory else falls back upstream,
    // so any neighbour means Prev can move. (Don't read walkHistory.current here —
    // refs must not be read during render.)
    return {
      canWalkPrev: hasNeighbour,
      canWalkNext: hasNeighbour,
    };
  }, [mapFocusId, adjacency]);

  /* ── Interaction handlers ── */
  /* On the MAP, a single click FOLLOWS in place: recenter on the node + light
     its neighbourhood, so you walk the chain by clicking a lit neighbour without
     scrolling (degree-of-interest). It deliberately does NOT call onSelectScreen
     here — that drills the page into the live preview and would yank you off the
     map. Double-click is the explicit "open it". In the Focused slideshow, a
     single click keeps its original behaviour (open the screen). */
  const onNodeClick = useCallback<NodeMouseHandler<FlowNode>>(
    (_evt, node) => {
      if (node.type !== 'screen') return; // ignore section-header + lane-backing
      setHoverId(null);
      if (mode === 'map') {
        // Wave L2: single click opens Screens detail (Mobbin-style drill-in).
        onSelectScreen(node.id);
        return;
      }
      onSelectScreen(node.id);
    },
    [mode, onSelectScreen],
  );
  /* Double-click = drill into the live preview (both modes). On the map this is
     the deliberate "open this screen" beyond follow-in-place. */
  const onNodeDoubleClick = useCallback<NodeMouseHandler<FlowNode>>(
    (_evt, node) => {
      if (node.type !== 'screen') return;
      setHoverId(null);
      onSelectScreen(node.id);
    },
    [onSelectScreen],
  );
  const onNodeMouseEnter = useCallback<NodeMouseHandler<FlowNode>>((_evt, node) => {
    if (node.type !== 'screen') return;
    setHoverId(node.id);
  }, []);
  const onNodeMouseLeave = useCallback(() => setHoverId(null), []);
  const onPaneClick = useCallback(() => {
    setHoverId(null);
    if (mode === 'map') setMapFocusId(null); // click empty canvas = stop following
  }, [mode]);

  /* ── MAP keyboard walking — →/← call the shared walkMap stepper (same code the
     Prev/Next buttons use), Enter drills into the followed node's live preview.
     Keyboard and buttons are two front-ends to ONE traversal. */
  useEffect(() => {
    if (mode !== 'map' || !mapFocusId) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        onSelectScreen(mapFocusId);
        return;
      }
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      walkMap(e.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, mapFocusId, walkMap, onSelectScreen]);

  /* ── Fit on init and on every dataset change (centre the graph). ──
     maxZoom caps the fit so a sparse/small graph (or the 177-node map) opens at
     a READABLE scale instead of collapsing to specks. Matches the declarative
     fitViewOptions and the re-fit effect below. */
  const onInit = useCallback((inst: ReactFlowInstance<FlowNode, Edge>) => {
    requestAnimationFrame(() =>
      inst.fitView({
        padding: FIT_PADDING,
        minZoom: OPEN_MIN_ZOOM,
        maxZoom: FIT_MAX_ZOOM,
        duration: 0,
      }),
    );
  }, []);

  /* The key that gates the auto re-fit below. It must change ONLY on a real
     mode/dataset change — never on selection.
       • MAP mode: keyed on dataset size alone. It deliberately OMITS focusPath,
         because on the map a selection/open/deep-link/Cmd-K only changes
         focusPath — and a re-fit there would yank the whole graph back to the
         overview, throwing the user off where they were ("it keeps kicking me
         to the back two screens"). On the map the ONLY view movement while
         browsing is centerOnNode (setCenter) via click-follow / ←→ walking.
       • FOCUSED mode: keyed on curIdx — stepping the section slideshow IS a real
         dataset swap, so re-fitting the new section's small DAG is correct. */
  const graphKey = useMemo(
    () => (mode === 'map' ? `map:${base.nodes.length}` : `focused:${curIdx}:${base.nodes.length}`),
    [mode, curIdx, base.nodes.length],
  );
  const firstFit = useRef(true);
  useEffect(() => {
    if (firstFit.current) {
      firstFit.current = false;
      return;
    }
    setHoverId(null); // clear stale hover when the dataset swaps
    const id = requestAnimationFrame(() => {
      try {
        rf.fitView({
          padding: FIT_PADDING,
          minZoom: OPEN_MIN_ZOOM,
          maxZoom: FIT_MAX_ZOOM,
          duration: 420,
        });
      } catch {
        /* instance not ready */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [graphKey, rf]);

  /* ── ONE-SHOT settle fit. ──
     The interactive empty-state mounts FlowChart inside a `glass.rise` reveal, so
     React Flow's first fit measures a zero/half-sized box and parks the whole
     graph OFF-SCREEN (unclickable specks). We fit exactly ONCE — the moment the
     container first reports real dimensions — then STOP observing. An ongoing
     refit-on-resize (the previous version) fought every layout change and snapped
     the view back to centre on each click ("reverts to the middle / glitching in
     and out"). Dataset/mode re-fits are handled by the graphKey effect above;
     while browsing, the view only ever moves via centerOnNode (click-follow / ←→
     walk) — nothing auto-recentres. */
  const flowWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = flowWrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let settled = false;
    const ro = new ResizeObserver(() => {
      if (settled) return;
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) return; // not laid out yet
      settled = true;
      ro.disconnect(); // ← one-shot: never refit on later resizes / interactions
      requestAnimationFrame(() => {
        try {
          rf.fitView({
            padding: FIT_PADDING,
            minZoom: OPEN_MIN_ZOOM,
            maxZoom: FIT_MAX_ZOOM,
            duration: 0,
          });
        } catch {
          /* instance not ready */
        }
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [rf]);

  const defaultEdgeOptions: DefaultEdgeOptions = useMemo(
    () => ({ type: 'default', markerEnd: { type: MarkerType.ArrowClosed } }),
    [],
  );

  /* ── Section-slideshow chrome (focused mode) ── */
  const showSlides = mode === 'focused' && sections.length > 0 && !!sectionView;
  const slideTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 380, damping: 32 };
  const slideOffset = reduceMotion ? 0 : 26;

  return (
    <div
      className="fc-flow"
      data-has-active={highlight.hasActive ? 'true' : 'false'}
      data-mode={mode}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: showSlides ? 'row' : 'column',
      }}
    >
      {/* Generated rules that light the active node's connected-path edges by id. */}
      {litEdgeCss ? <style>{litEdgeCss}</style> : null}

      {/* ── Vertical SECTION RAIL (de-pilled) — flat list + step counter + track ── */}
      {showSlides && sectionView ? (
        <nav className="fc-rail" aria-label="Sections">
          <div className="fc-rail-head">
            <span className="fc-rail-step">
              Section {curIdx + 1} <span className="fc-rail-of">/ {sections.length}</span>
            </span>
            <div className="fc-rail-track" aria-hidden>
              <div
                className="fc-rail-fill"
                style={{ width: `${((curIdx + 1) / sections.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="fc-rail-list" role="tablist" aria-label="Sections">
            {sections.map((s, i) => {
              const on = i === curIdx;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className="fc-rail-item"
                  data-on={on ? 'true' : 'false'}
                  onClick={() => jumpTo(s.id)}
                  title={`${s.label} · ${s.count} screen${s.count === 1 ? '' : 's'}`}
                >
                  {on ? (
                    <motion.span
                      layoutId="fc-rail-active"
                      className="fc-rail-active"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 440, damping: 36 }
                      }
                    />
                  ) : null}
                  <span className="fc-rail-tick" style={{ background: s.color }} />
                  <span className="fc-rail-name">{s.label}</span>
                  <span className="fc-rail-count">{s.count}</span>
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}

      <div
        className="fc-main"
        style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}
      >
        {/* stage head — section title + prev/next + "enter from" seam row */}
        {showSlides && sectionView ? (
          <div className="fc-stage-head">
            <div className="fc-stage-titlerow">
              <AnimatePresence mode="wait" initial={false} custom={dir}>
                <motion.h3
                  key={sectionView.section.id}
                  className="fc-stage-title"
                  custom={dir}
                  initial={{ x: dir * slideOffset, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: dir * -slideOffset, opacity: 0 }}
                  transition={slideTransition}
                >
                  <span
                    className="fc-stage-dot"
                    style={{
                      background: sectionView.section.color,
                      boxShadow: `0 0 12px ${sectionView.section.color}`,
                    }}
                  />
                  {sectionView.section.label}
                </motion.h3>
              </AnimatePresence>
              <div className="fc-stage-nav">
                <button
                  type="button"
                  className="fc-stage-btn"
                  onClick={() => step(-1)}
                  disabled={curIdx === 0}
                  aria-label="Previous section"
                >
                  ◀
                </button>
                <span className="fc-stage-hint">
                  {curIdx + 1 < sections.length
                    ? `next: ${sections[curIdx + 1].label}`
                    : 'last section'}
                </span>
                <button
                  type="button"
                  className="fc-stage-btn"
                  onClick={() => step(1)}
                  disabled={curIdx >= sections.length - 1}
                  aria-label="Next section"
                >
                  ▶
                </button>
              </div>
            </div>
            <SeamRow
              dir="in"
              label="Enter from"
              items={sectionView.enterFrom}
              onJump={jumpTo}
              emptyText="Entry point — nothing links in"
            />
          </div>
        ) : null}

        <div ref={flowWrapRef} style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <HighlightContext.Provider value={highlight}>
            <ReactFlow<FlowNode, Edge>
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onInit={onInit}
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
              onNodeMouseEnter={onNodeMouseEnter}
              onNodeMouseLeave={onNodeMouseLeave}
              onPaneClick={onPaneClick}
              defaultEdgeOptions={defaultEdgeOptions}
              colorMode="dark"
              fitView
              fitViewOptions={{
                padding: FIT_PADDING,
                minZoom: OPEN_MIN_ZOOM,
                maxZoom: FIT_MAX_ZOOM,
              }}
              minZoom={MAP_MIN_ZOOM}
              maxZoom={MAP_MAX_ZOOM}
              nodesDraggable
              nodesConnectable={false}
              elementsSelectable
              panOnScroll
              zoomOnDoubleClick={false}
              selectionOnDrag={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1}
                color={lavender(0.16)}
              />
              <Controls showInteractive={false} />
            </ReactFlow>
          </HighlightContext.Provider>

          {/* ── MAP follow affordance — makes click-to-follow discoverable. ──
             Idle: invites the first click. Following: names the focused screen +
             its keyboard walk hints + a clear button. A flat glass bar (no pill),
             out of the way bottom-centre so it never covers the Controls. */}
          {mode === 'map' ? (
            <div className="fc-follow-hint" data-active={mapFocusId ? 'true' : 'false'}>
              {mapFocusId ? (
                <>
                  {/* REAL clickable walk controls — Prev/Next step the followed
                      chain (mouse-equivalent of ←/→). ≥40px hit targets, mint
                      hover. Prev disabled only when there's no trail AND no
                      upstream source; Next disabled when the node links nowhere. */}
                  <button
                    type="button"
                    className="fc-follow-walk"
                    onClick={() => walkMap(-1)}
                    disabled={!canWalkPrev}
                    aria-label="Walk to previous screen"
                    title="Previous (←) — retrace your steps / step upstream"
                  >
                    <span aria-hidden>◀</span>
                    <span className="fc-follow-walk-label">Prev</span>
                  </button>
                  <div className="fc-follow-now">
                    <span className="fc-follow-dot" />
                    <div className="fc-follow-nowtext">
                      <span className="fc-follow-lead">Following</span>
                      <span className="fc-follow-name" title={nodeById(mapFocusId)?.data.route}>
                        {nodeById(mapFocusId)?.data.label ?? mapFocusId}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="fc-follow-walk"
                    onClick={() => walkMap(1)}
                    disabled={!canWalkNext}
                    aria-label="Walk to next screen"
                    title="Next (→) — follow this screen's first link"
                  >
                    <span className="fc-follow-walk-label">Next</span>
                    <span aria-hidden>▶</span>
                  </button>
                  <span className="fc-follow-sep" aria-hidden />
                  <button
                    type="button"
                    className="fc-follow-open"
                    onClick={() => onSelectScreen(mapFocusId)}
                    title="Open this screen's live preview (⏎)"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="fc-follow-clear"
                    onClick={() => {
                      setMapFocusId(null);
                      walkHistory.current = [];
                    }}
                    aria-label="Stop following"
                    title="Stop following"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <span className="fc-follow-pulse" aria-hidden />
                  <span className="fc-follow-tip">
                    Click a screen to follow its connections · double-click to open it
                  </span>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* exit-to seam — flat labeled row, never cross-section edges */}
        {showSlides && sectionView ? (
          <SeamRow
            dir="out"
            label="Exits to"
            items={sectionView.exitTo}
            onJump={jumpTo}
            emptyText="Terminal section — nothing links out"
          />
        ) : null}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PUBLIC COMPONENT — themes React Flow's chrome to the dark orange/mint look.
   The canvas itself is transparent: the page's `.gh-mesh-bg` shows through, and
   a faint in-canvas radial keeps nodes legible over it.
   ═══════════════════════════════════════════════════ */

export function FlowChart(props: FlowChartProps): React.JSX.Element {
  const accent = props.accent ?? DEFAULT_ACCENT;

  const themeVars = {
    '--fc-accent': accent,
    '--xy-background-color': 'transparent',
    '--xy-edge-stroke-default': lavender(0.6),
    '--xy-edge-stroke-selected-default': accent,
    '--xy-connectionline-stroke-default': accent,
    '--xy-selection-background-color': mint(0.08),
    '--xy-selection-border-default': `1px dashed ${mint(0.55)}`,
    '--xy-controls-button-background-color-default': `rgba(${token.orange1Rgb}, 0.62)`,
    '--xy-controls-button-background-color-hover-default': mint(0.18),
    '--xy-controls-button-color-default': lavender(0.95),
    '--xy-controls-button-color-hover-default': accent,
    '--xy-controls-button-border-color-default': token.glassBorderSoft,
  } as React.CSSProperties;

  return (
    <div className="fc-root" style={{ width: '100%', height: '100%', ...themeVars }}>
      <style>{`
        /* Canvas is transparent so the page mesh reads through; a soft orange+navOrange
           radial keeps nodes from floating over dead space (Apple HIG: glass needs
           a lit surface behind it). */
        .fc-root {
          position: relative;
          background:
            radial-gradient(60% 55% at 22% 14%, rgba(${token.accentRgb}, 0.12), transparent 70%),
            radial-gradient(60% 60% at 82% 92%, rgba(${token.mintRgb}, 0.07), transparent 72%);
        }
        .fc-root .react-flow__attribution { display: none; }
        .fc-root .react-flow__node.selected,
        .fc-root .react-flow__node:focus,
        .fc-root .react-flow__node:focus-visible { outline: none; box-shadow: none; }

        /* ── Bigger, glassy controls (Contract 2 tokens) — obvious on the mesh. ── */
        .fc-root .react-flow__controls {
          border-radius: ${token.radiusMd};
          overflow: hidden;
          border: 1px solid ${token.glassBorder};
          box-shadow: ${token.elev3}, ${token.specular};
          -webkit-backdrop-filter: ${token.backdrop};
          backdrop-filter: ${token.backdrop};
        }
        .fc-root .react-flow__controls-button {
          width: 34px;
          height: 34px;
          border-bottom: 1px solid ${token.glassBorderSoft};
          transition: background-color ${token.durFast} ${token.easeOut},
            color ${token.durFast} ${token.easeOut};
        }
        .fc-root .react-flow__controls-button svg { fill: currentColor; width: 15px; height: 15px; }
        .fc-root .react-flow__minimap { border-radius: ${token.radiusMd}; overflow: hidden; }
        .fc-root .react-flow__minimap-mask { stroke: none; }

        /* ── Edges: legible mauve at rest. Lit edges are re-styled to mint by a
              generated per-id rule (see litEdgeCss) that wins via !important. ── */
        .fc-root .react-flow__edge .react-flow__edge-path {
          stroke: ${lavender(0.6)};
          stroke-width: 1.6;
          transition: stroke ${token.durNormal} ${token.easeOut},
            stroke-width ${token.durNormal} ${token.easeOut},
            opacity ${token.durNormal} ${token.easeOut};
        }
        .fc-root .react-flow__edge .react-flow__arrowhead,
        .fc-root .react-flow__edge marker path { fill: ${lavender(0.72)}; }

        /* When something is highlighted, dim EVERY edge; the generated rule then
           re-brightens just the lit ones (it carries !important, so it wins). */
        .fc-flow[data-has-active="true"] .react-flow__edge .react-flow__edge-path { opacity: 0.08; }
        .fc-flow[data-has-active="true"] .react-flow__edge .react-flow__arrowhead,
        .fc-flow[data-has-active="true"] .react-flow__edge marker path { opacity: 0.08; }

        @keyframes fc-dashdraw { from { stroke-dashoffset: 10; } to { stroke-dashoffset: 0; } }

        /* ── MAP click-to-follow affordance — a flat glass status bar (no pill),
              bottom-centre, never over the Controls. Communicates the new
              degree-of-interest interaction: click to follow, arrows to walk. ── */
        .fc-follow-hint {
          position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%);
          z-index: 7; display: inline-flex; align-items: center; gap: 8px; max-width: calc(100% - 96px);
          padding: 6px 8px; border-radius: ${token.radiusMd};
          background: ${token.glassFillStrong};
          -webkit-backdrop-filter: ${token.backdropStrong}; backdrop-filter: ${token.backdropStrong};
          border: 1px solid ${token.glassBorderSoft}; box-shadow: ${token.elev2}, ${token.specular};
          font-size: 12px; color: ${lavender(0.78)}; pointer-events: auto;
          transition: border-color ${token.durFast} ${token.easeOut}, box-shadow ${token.durNormal} ${token.easeOut};
        }
        .fc-follow-hint[data-active="false"] { padding: 7px 12px; }
        .fc-follow-hint[data-active="true"] { border-color: ${mint(0.4)}; box-shadow: 0 0 0 1px ${mint(0.18)}, ${token.elev3}, ${token.specular}; }
        .fc-follow-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: ${MINT}; box-shadow: 0 0 8px ${mint(0.7)}; }
        .fc-follow-lead { font-size: 10px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: ${lavender(0.6)}; line-height: 1.1; }
        .fc-follow-name { font-weight: 700; color: ${HEADLINE}; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2; }
        .fc-follow-now { display: inline-flex; align-items: center; gap: 8px; padding: 0 6px; min-width: 0; }
        .fc-follow-nowtext { display: flex; flex-direction: column; min-width: 0; }
        /* BIG clickable walk buttons (≥40px hit target) — the bottom arrows are
           real controls now, not text. Mint hover + press, clear disabled state. */
        .fc-follow-walk {
          cursor: pointer; flex-shrink: 0; min-width: 40px; height: 40px; padding: 0 12px;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          border-radius: ${token.radiusMd}; font-size: 13px; font-weight: 700; font-family: inherit;
          color: ${HEADLINE}; background: rgba(${token.orange1Rgb}, 0.55);
          border: 1px solid ${token.glassBorderSoft};
          transition: background-color ${token.durFast} ${token.easeOut}, color ${token.durFast} ${token.easeOut},
            border-color ${token.durFast} ${token.easeOut}, opacity ${token.durFast} ${token.easeOut};
        }
        .fc-follow-walk span[aria-hidden] { font-size: 14px; line-height: 1; }
        .fc-follow-walk-label { line-height: 1; }
        .fc-follow-walk:hover:not(:disabled) { background: ${mint(0.2)}; color: var(--fc-accent); border-color: ${mint(0.45)}; }
        .fc-follow-walk:active:not(:disabled) { background: ${mint(0.3)}; }
        .fc-follow-walk:focus-visible { outline: 2px solid ${mint(0.6)}; outline-offset: 1px; }
        .fc-follow-walk:disabled { opacity: 0.28; cursor: default; }
        .fc-follow-open {
          cursor: pointer; flex-shrink: 0; height: 32px; padding: 0 12px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: ${token.radiusMd}; font-size: 12px; font-weight: 700; font-family: inherit;
          color: var(--fc-accent); background: ${mint(0.12)}; border: 1px solid ${mint(0.32)};
          transition: background-color ${token.durFast} ${token.easeOut}, border-color ${token.durFast} ${token.easeOut};
        }
        .fc-follow-open:hover { background: ${mint(0.22)}; border-color: ${mint(0.5)}; }
        .fc-follow-open:focus-visible { outline: 2px solid ${mint(0.6)}; outline-offset: 1px; }
        .fc-follow-sep { width: 1px; height: 22px; background: ${lavender(0.2)}; flex-shrink: 0; }
        .fc-follow-tip { color: ${lavender(0.7)}; white-space: nowrap; }
        .fc-follow-key {
          display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 4px;
          border-radius: 5px; font-size: 11px; font-weight: 700; font-family: inherit; line-height: 1;
          color: ${HEADLINE}; background: ${lavender(0.1)}; border: 1px solid ${lavender(0.22)};
          border-bottom-width: 2px;
        }
        .fc-follow-clear {
          cursor: pointer; margin-left: 2px; width: 20px; height: 20px; flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center; border-radius: 6px;
          color: ${lavender(0.7)}; background: transparent; border: 1px solid transparent; font-size: 11px;
          transition: color ${token.durFast} ${token.easeOut}, background-color ${token.durFast} ${token.easeOut};
        }
        .fc-follow-clear:hover { color: ${HEADLINE}; background: ${lavender(0.1)}; }
        .fc-follow-clear:focus-visible { outline: 2px solid ${mint(0.6)}; outline-offset: 1px; }
        .fc-follow-pulse { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; background: ${MINT}; box-shadow: 0 0 8px ${mint(0.6)}; animation: fc-follow-blink 1.8s ease-in-out infinite; }
        @keyframes fc-follow-blink { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }

        /* ── Vertical SECTION RAIL (de-pilled: flat list, NOT pills) ── */
        .fc-rail {
          flex-shrink: 0; width: 190px; display: flex; flex-direction: column; min-height: 0;
          background: ${token.glassFillStrong};
          -webkit-backdrop-filter: ${token.backdropStrong}; backdrop-filter: ${token.backdropStrong};
          border-right: 1px solid ${token.glassBorder}; box-shadow: ${token.elev2}; z-index: 6;
        }
        .fc-rail-head { padding: 11px 12px 9px; border-bottom: 1px solid ${token.glassBorderSoft}; }
        .fc-rail-step { font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: ${HEADLINE}; font-variant-numeric: tabular-nums; }
        .fc-rail-of { color: ${lavender(0.55)}; }
        .fc-rail-track { margin-top: 7px; height: 3px; border-radius: 2px; background: ${lavender(0.14)}; overflow: hidden; }
        .fc-rail-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--fc-accent), ${mint(0.5)}); box-shadow: 0 0 8px ${mint(0.5)}; transition: width ${token.durNormal} ${token.easeOut}; }
        .fc-rail-list { flex: 1; min-height: 0; overflow-y: auto; padding: 6px; display: flex; flex-direction: column; gap: 1px; scrollbar-width: thin; }
        .fc-rail-list::-webkit-scrollbar { width: 6px; }
        .fc-rail-list::-webkit-scrollbar-thumb { background: ${lavender(0.18)}; border-radius: 3px; }
        .fc-rail-item {
          position: relative; cursor: pointer; display: flex; align-items: center; gap: 8px;
          width: 100%; text-align: left; padding: 7px 9px; border-radius: ${token.radiusMd};
          color: ${lavender(0.72)}; font-size: 12px; font-weight: 600;
          transition: color ${token.durFast} ${token.easeOut}, background-color ${token.durFast} ${token.easeOut};
        }
        .fc-rail-item:hover { color: ${HEADLINE}; background: ${lavender(0.06)}; }
        .fc-rail-item[data-on="true"] { color: ${HEADLINE}; font-weight: 700; }
        .fc-rail-item:focus-visible { outline: 2px solid ${mint(0.6)}; outline-offset: -2px; }
        /* active = a left accent bar + faint mint fill (NOT a pill); morphs via layoutId */
        .fc-rail-active { position: absolute; inset: 0; border-radius: ${token.radiusMd}; z-index: 0; background: ${mint(0.1)}; border-left: 3px solid var(--fc-accent); box-shadow: inset 0 0 18px ${mint(0.12)}; }
        .fc-rail-tick { position: relative; z-index: 1; width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
        .fc-rail-name { position: relative; z-index: 1; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fc-rail-count { position: relative; z-index: 1; font-size: 10px; font-weight: 700; color: ${lavender(0.5)}; font-variant-numeric: tabular-nums; }

        /* ── STAGE head — section title + prev/next (no pills) ── */
        .fc-stage-head {
          flex-shrink: 0; display: flex; flex-direction: column; gap: 6px; padding: 11px 14px 8px;
          background: ${token.glassFill}; border-bottom: 1px solid ${token.glassBorderSoft}; z-index: 5;
        }
        .fc-stage-titlerow { display: flex; align-items: center; gap: 12px; }
        .fc-stage-title { display: inline-flex; align-items: center; gap: 10px; margin: 0; font-size: 18px; font-weight: 800; letter-spacing: -0.01em; color: ${HEADLINE}; }
        .fc-stage-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .fc-stage-nav { margin-left: auto; display: inline-flex; align-items: center; gap: 10px; }
        .fc-stage-hint { font-size: 11.5px; font-weight: 600; color: ${lavender(0.6)}; white-space: nowrap; }
        .fc-stage-btn {
          cursor: pointer; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center;
          border-radius: ${token.radiusMd}; font-size: 15px; color: ${lavender(0.95)};
          background: rgba(${token.orange1Rgb}, 0.55); border: 1px solid ${token.glassBorderSoft};
          transition: background-color ${token.durFast} ${token.easeOut}, color ${token.durFast} ${token.easeOut}, opacity ${token.durFast} ${token.easeOut};
        }
        .fc-stage-btn:hover:not(:disabled) { background: ${mint(0.18)}; color: var(--fc-accent); border-color: ${mint(0.4)}; }
        .fc-stage-btn:active:not(:disabled) { background: ${mint(0.26)}; }
        .fc-stage-btn:disabled { opacity: 0.3; cursor: default; }
        .fc-stage-btn:focus-visible { outline: 2px solid ${mint(0.6)}; outline-offset: 1px; }

        /* ── cross-section SEAMS — FLAT labeled rows (no chips/pills) ── */
        .fc-seam { flex-shrink: 0; display: flex; align-items: center; gap: 4px 14px; flex-wrap: wrap; padding: 7px 14px; font-size: 12px; z-index: 5; }
        .fc-seam-out { background: ${token.glassFill}; border-top: 1px solid ${token.glassBorderSoft}; }
        .fc-seam-label { font-size: 10px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: ${lavender(0.55)}; }
        .fc-seam-none { font-size: 11.5px; color: ${lavender(0.5)}; font-style: italic; }
        .fc-seam-item {
          cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 2px 0;
          color: ${lavender(0.92)}; font-size: 12px; font-weight: 600; white-space: nowrap;
          border-bottom: 1px solid transparent;
          transition: color ${token.durFast} ${token.easeOut}, border-color ${token.durFast} ${token.easeOut};
        }
        .fc-seam-item:hover { color: var(--fc-accent); border-bottom-color: ${mint(0.55)}; }
        .fc-seam-item:focus-visible { outline: 2px solid ${mint(0.6)}; outline-offset: 2px; }
        .fc-seam-tick { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
        .fc-seam-count { font-size: 10px; font-weight: 700; color: ${lavender(0.55)}; font-variant-numeric: tabular-nums; }
        .fc-seam-arrow { color: var(--fc-accent); font-weight: 800; font-size: 12px; }

        /* ── Holographic node sheen — pointer-following highlight over iridescent
              foil (mint↔magenta), screen-blended; rides on TOP of the solid node. ── */
        .fc-node-sheen {
          position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          opacity: 0; mix-blend-mode: screen; transition: opacity ${token.durNormal} ${token.easeOut};
          background:
            radial-gradient(circle 150px at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.22), transparent 56%),
            conic-gradient(from 210deg at 50% 50%, rgba(${token.mintRgb}, 0.12), rgba(${token.accentRgb}, 0.14), rgba(255, 255, 255, 0.06), rgba(${token.mintRgb}, 0.12));
        }
        .fc-node:hover .fc-node-sheen { opacity: 1; }

        /* Section slideshow: the edges ARE the flow — keep them clearly visible
           (bright + slightly thicker at rest). Hovering a node still lights its
           path to mint via the generated lit-edge rule. */
        .fc-flow[data-mode="focused"] .react-flow__edge .react-flow__edge-path {
          stroke: ${lavender(0.95)};
          stroke-width: 2.2;
          opacity: 1;
        }
        .fc-flow[data-mode="focused"] .react-flow__edge .react-flow__arrowhead,
        .fc-flow[data-mode="focused"] .react-flow__edge marker path { fill: ${lavender(0.95)}; }

        /* WHOLE MAP — FAINT PERSISTENT WEB: every edge rests as a quiet hairline
           so connectivity is visible at a glance ("the map is connected"), but
           soft enough that 456 edges read as texture, not noise. Hover / click-to-
           follow lights the focused path bright mint (generated lit rule, wins via
           !important); the data-has-active rule above fades the rest. Faint
           context at rest → bright focus on demand (focus + context).
           Scoped to :not([data-has-active]) so that the moment a follow/hover is
           active, the dim-others rule (opacity .08) governs the unlit edges
           instead of this resting value. */
        .fc-flow[data-mode="map"]:not([data-has-active="true"]) .react-flow__edge .react-flow__edge-path {
          opacity: 0.12;
          stroke-width: 1;
        }
        .fc-flow[data-mode="map"]:not([data-has-active="true"]) .react-flow__edge .react-flow__arrowhead,
        .fc-flow[data-mode="map"]:not([data-has-active="true"]) .react-flow__edge marker path { opacity: 0.12; }

        @media (prefers-reduced-motion: reduce) {
          .fc-root .react-flow__edge .react-flow__edge-path { animation: none !important; transition: none !important; }
          .fc-node { transition: none !important; }
          .fc-follow-pulse { animation: none !important; opacity: 0.85; }
        }
      `}</style>
      <ReactFlowProvider>
        <FlowChartInner {...props} accent={accent} />
      </ReactFlowProvider>
    </div>
  );
}

export default FlowChart;
