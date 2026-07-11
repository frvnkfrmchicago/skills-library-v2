/* The Liquid-Glass material layer (Contract 2, Lane B). Imported ONCE here so
 * `.gh-glass` / `.gh-mesh-bg` / `.gh-rise` / `.gh-hoverable` resolve for the
 * whole /screens tool — the layer does not load otherwise. */
import './screens-glass.css';

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  Suspense,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import {
  Layers,
  ArrowRight,
  Search,
  X,
  MousePointerClick,
  GitBranch,
  Menu,
  Globe,
  Lock,
  Rocket,
  Home,
  User,
  Briefcase,
  MapPin,
  FileKey,
  Settings,
  Mic,
  Shield,
  Layout,
  ShoppingCart,
  GraduationCap,
  Trophy,
  HelpCircle,
  Leaf,
  Palette,
  Play,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  Pencil,
  Command as CommandIcon,
  CornerDownLeft,
} from 'lucide-react';
import { ScreenDetail } from './ScreenDetail';
import { FlowChart } from './FlowChart';
import { ScreenThumbnail } from './ScreenThumbnail';
import { LiveReloadProvider, useLiveReload } from './LiveReload';
import { DesignStudioView } from '@/components/design-studio/DesignStudioView';
import { CommandCenterView } from '@/components/command-center/CommandCenterView';
import { listFlowPaths } from './flow-paths';
import {
  loadVisibilityMap,
  isThumbnailVisible,
  toggleThumbnailVisibility,
  type VisibilityMap,
} from '@/lib/screen-visibility';
import { colors, withOpacity } from '@/lib/design-tokens';
import { glass } from './screens-theme';
import { UnderlineTabs, type UnderlineTab } from '@/lib/ui/UnderlineTabs';
const GALLERY_FONT_CLASS = 'gh-gallery-font';

/* ─── Single mint accent (NO per-section color anywhere) ───
 * The grouping is a MONOCHROME typographic ledger: sticky all-caps muted
 * section headers + a single hairline divider carry the structure (NN/G Common
 * Region via proximity + the shared region, NOT hue). Orange (#FC8019) is the ONE
 * color in the rail and is reserved EXCLUSIVELY for the selected row. There are
 * no section hues, header dots, icon tints, count dots, or shelf washes — every
 * one of those was removed (the owner's repeated "no accent bars" directive).
 * sectionColor()/sectionTints() are no longer called here (FlowChart still owns
 * its own categorical hues — that export is untouched). */
const ACCENT = colors.brandGreen; // #FC8019 — selected-row signal ONLY

const ACCENT_SOFT = withOpacity(ACCENT, 0.14); // soft mint fill (active/selected)
const ACCENT_FAINT = withOpacity(ACCENT, 0.07); // faint mint fill
const ACCENT_LINE = withOpacity(ACCENT, 0.28); // mint border (active)
const HAIRLINE = withOpacity(colors.text.primary, 0.08); // subtle white divider

/* Monochrome ledger tokens — section header glyph + numeric prefix read in the
 * canonical text roles, never a hue (feedback_one_source_of_record_per_token). */
const LEDGER_ICON = colors.text.secondary; // section glyph (shape differentiates)
const LEDGER_NUM = colors.text.muted; // numeric prefix + count

/* ─── Domain super-tabs (horizontal tab strip) ───
 * The 27 sections cluster into 5 domains. Derived from the family comments in
 * SECTION_COLOR_BY_GROUP (design-tokens): consumer cool-arc, warm commerce +
 * creative, the business cluster, the catch-all/platform band, and the
 * system/safety/dev band. The tabs themselves carry NO color (UnderlineTabs'
 * mint active-underline is the only signal). Selecting a domain filters the
 * sidebar to that domain's sections; "All" shows everything. */
type DomainId = 'all' | 'consumer' | 'commerce' | 'business' | 'system';

const DOMAIN_BY_GROUP: Record<string, Exclude<DomainId, 'all'>> = {
  auth: 'consumer',
  browse: 'consumer',
  order: 'commerce',
};

/** Resolve a group's domain (defensive fallback → system). */
function domainOf(groupId: string): Exclude<DomainId, 'all'> {
  return DOMAIN_BY_GROUP[groupId] ?? 'system';
}

const DOMAIN_TABS: UnderlineTab<DomainId>[] = [
  { value: 'all', label: 'All' },
  { value: 'consumer', label: 'Auth & Discover' },
  { value: 'commerce', label: 'Order' },
];

/* ─── Lightweight fuzzy matcher for the command palette ───
 * Subsequence match (chars of the query appear in order anywhere in the
 * target) with a score that rewards contiguous runs + word-boundary / prefix
 * starts — the cmdk feel without a dependency. Returns null on no match. */
function fuzzyScore(query: string, target: string): number | null {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 0;
  let score = 0;
  let ti = 0;
  let streak = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    const found = t.indexOf(ch, ti);
    if (found === -1) return null; // a query char is missing → no match
    // Reward: start-of-string, after a separator (word boundary), contiguity.
    if (found === 0) score += 12;
    else if (/[\s/\-_.]/.test(t[found - 1])) score += 8;
    if (found === ti) ((streak += 1), (score += 4 + streak));
    else streak = 0;
    score -= Math.min(found - ti, 6) * 0.5; // small penalty for gaps
    ti = found + 1;
  }
  // Prefer shorter targets (a tighter match) + exact substring boost.
  if (t.includes(q)) score += 16;
  score -= t.length * 0.05;
  return score;
}

/* Typography hierarchy — warm cream family for Swiggy orange brand.
 * Orange accent reserved for active/selected + small dots. */
const TXT_HEADLINE = colors.text.headline; // #FFF5EB — page title, brightest
const TXT_PRIMARY = colors.text.primary; // #FDECD8 — group headers, screen labels
const TXT_SECONDARY = colors.text.secondary; // #D4A574 — body / supporting
const TXT_MUTED = colors.text.muted; // #9B7B5A — routes, paths, captions (dim)

/* ─── lucide icon map keyed to manifest icon strings ─── */
const Icons = {
  globe: Globe,
  lock: Lock,
  rocket: Rocket,
  home: Home,
  user: User,
  briefcase: Briefcase,
  mapPin: MapPin,
  fileKey: FileKey,
  settings: Settings,
  mic: Mic,
  shield: Shield,
  layout: Layout,
  cart: ShoppingCart,
  grad: GraduationCap,
  trophy: Trophy,
  help: HelpCircle,
  leaf: Leaf,
  palette: Palette,
  play: Play,
  eye: Eye,
} as const;

type IconKey = keyof typeof Icons;

function GroupIcon({
  icon,
  className,
  style,
}: {
  icon: IconKey;
  className?: string;
  style?: CSSProperties;
}) {
  const Comp = Icons[icon] ?? HelpCircle;
  return <Comp className={className} style={style} />;
}

/* ─── Enriched screen types (Contract 1) ───
 * `linksTo`, `buttons`, and `states` are OBJECTS, not bare strings — the
 * manifest carries what each link/button does and a labelled state catalog.
 * These shapes are passed straight down to <ScreenDetail> and <FlowChart>. */
export interface LinkRef {
  target: string;
  label: string;
  via: string;
}

export interface ButtonDef {
  label: string;
  action: string;
  target: string | null;
  functional: boolean;
}

export interface StateDef {
  id: string;
  label: string;
  summary: string;
}

export interface ScreenDef {
  path: string;
  label: string;
  /** Parent-context dedupe label; unique across the manifest. Rendered in the sidebar. */
  displayLabel: string;
  linksTo: LinkRef[];
  buttons: ButtonDef[];
  states: StateDef[];
  hasLoading?: boolean;
  hasError?: boolean;
}

export interface GroupDef {
  id: string;
  label: string;
  color: string;
  icon: IconKey;
  flowOrder: number;
  screens: ScreenDef[];
}

/* ─── Import manifest (auto-generated by: bun run scripts/scan-screens.ts) ─── */
import manifestData from './screen-manifest.json';

/** Normalize a manifest screen into the enriched `ScreenDef` shape, tolerating
 *  the legacy `states: string[]` form used by the manual groups below (each
 *  string becomes a single `populated` state so <ScreenDetail> sees one shape). */
function normalizeScreen(raw: Record<string, unknown>): ScreenDef {
  const path = String(raw.path ?? '');
  const label = String(raw.label ?? path);
  const rawStates = Array.isArray(raw.states) ? raw.states : [];
  const states: StateDef[] = rawStates.map((s, i) =>
    typeof s === 'string'
      ? {
          id: i === 0 ? 'populated' : `state-${i}`,
          label: i === 0 ? 'Default' : `State ${i + 1}`,
          summary: s,
        }
      : (s as StateDef),
  );
  const linksToRaw = Array.isArray(raw.linksTo) ? raw.linksTo : [];
  const linksTo: LinkRef[] = linksToRaw.map((l) =>
    typeof l === 'string' ? { target: l, label: l, via: 'link' } : (l as LinkRef),
  );
  const buttons: ButtonDef[] = Array.isArray(raw.buttons) ? (raw.buttons as ButtonDef[]) : [];
  return {
    path,
    label,
    displayLabel: String(raw.displayLabel ?? label),
    linksTo,
    buttons,
    states,
    ...(raw.hasLoading ? { hasLoading: true } : {}),
    ...(raw.hasError ? { hasError: true } : {}),
  };
}

/**
 * Sub-section labels for groups that span multiple user roles or flow stages.
 * Key is group id, value maps a screen path to the sub-heading that should
 * appear ABOVE that screen in the sidebar.
 */
const SUB_SECTIONS: Record<string, Record<string, string>> = {};

const SCREEN_GROUPS: GroupDef[] = manifestData.groups.map((g) => ({
  id: g.id,
  label: g.label,
  color: g.color,
  icon: (g.icon in Icons ? g.icon : 'help') as IconKey,
  flowOrder: g.flowOrder,
  screens: g.screens.map((s) => normalizeScreen(s as Record<string, unknown>)),
}));

/** Normalize a hand-authored group (legacy `states: string[]`, no
 *  linksTo/buttons/displayLabel) into the enriched `GroupDef`. */
function normalizeGroup(g: {
  id: string;
  label: string;
  color: string;
  icon: IconKey;
  flowOrder: number;
  screens: Array<Record<string, unknown>>;
}): GroupDef {
  return {
    id: g.id,
    label: g.label,
    color: g.color,
    icon: g.icon,
    flowOrder: g.flowOrder,
    screens: g.screens.map((s) => normalizeScreen(s)),
  };
}

/* Flat list of every screen, tagged with its group id (mirrors the manifest). */
export type FlatScreen = ScreenDef & { groupId: string };
const ALL_SCREENS: FlatScreen[] = SCREEN_GROUPS.flatMap((g) =>
  g.screens.map((s) => ({ ...s, groupId: g.id })),
);

const SCREEN_PATHS = ALL_SCREENS.map((s) => s.path);

const TOTAL_SCREENS = ALL_SCREENS.length;
const TOTAL_LINKS = ALL_SCREENS.reduce((acc, s) => acc + s.linksTo.length, 0);
const TOTAL_STATES = ALL_SCREENS.reduce((acc, s) => acc + s.states.length, 0);

/* Every section id — used to seed the collapsed set so sections START COLLAPSED
 * (only a clicked section drops open). */
const ALL_GROUP_IDS = SCREEN_GROUPS.map((g) => g.id);

const FLOW_PATHS = listFlowPaths();

/** Full Swiggy prototype (not the gallery) — must match preview iframe host. */
const SWIGGY_APP_URL = 'http://localhost:8080/index.html';

function ScreensPageInner() {
  const [selectedScreen, setSelectedScreen] = useState<FlatScreen | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  /* Which domain super-tab is active (horizontal tab strip). 'all' = no filter. */
  const [activeDomain, setActiveDomain] = useState<DomainId>('all');
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [searchQuery, setSearchQuery] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [viewMode, setViewMode] = useState<'command' | 'screens' | 'flow' | 'overview' | 'design'>('command');
  const [activeAppUrl, setActiveAppUrl] = useState('http://localhost:5174');
  const [activeAppId, setActiveAppId] = useState('swiggy-clone');
  const [flowMode, setFlowMode] = useState<'map' | 'focused'>('map');
  const [journeyPathId, setJourneyPathId] = useState<string | null>(
    FLOW_PATHS[0]?.id ?? null,
  );
  const [thumbnailMap, setThumbnailMap] = useState<VisibilityMap>(() => loadVisibilityMap());
  /* Which catalogued state the preview iframe is showing (state id). */
  const [previewState, setPreviewState] = useState<string>('populated');
  /* Mobile collapses the persistent sidebar into a toggleable drawer. */
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  /* Per-section collapse — all sections always expanded for small manifest. */
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
  /* Command palette (Cmd-K) — fuzzy jump to any of the 177 screens or a section. */
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [cmdkQuery, setCmdkQuery] = useState('');
  const [cmdkIndex, setCmdkIndex] = useState(0);
  const cmdkInputRef = useRef<HTMLInputElement | null>(null);
  /* Guards the deep-link restore so it runs once (mount) and the URL→state
   * sync doesn't fight the state→URL writer below. */
  const didRestore = useRef(false);
  /* Measure the sidebar's sticky search header so the sticky SECTION headers
   * can stick directly beneath it (its height varies with the clear-filter row).
   * ResizeObserver keeps the offset correct as the header grows/shrinks. */
  const searchHeaderRef = useRef<HTMLDivElement | null>(null);
  const [searchHeaderH, setSearchHeaderH] = useState(0);
  useEffect(() => {
    const el = searchHeaderRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setSearchHeaderH(el.offsetHeight));
    ro.observe(el);
    setSearchHeaderH(el.offsetHeight);
    return () => ro.disconnect();
  });

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const sorted = useMemo(() => [...SCREEN_GROUPS].sort((a, b) => a.flowOrder - b.flowOrder), []);

  /* ─── Deep-link: restore ?screen=&state= on first load (shareable view) ───
   * Reads the URL ONCE on mount. We read `window.location.search` directly
   * rather than the `useSearchParams()` snapshot — under a Suspense boundary
   * that snapshot can be empty on the first client render, which would silently
   * drop a cold deep-link. `?screen=<path>` selects that screen (and focuses
   * its group); `?state=<id>` restores the preview state. Unknown paths are
   * ignored gracefully. (searchParams is still read elsewhere for reactivity.) */
  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;
    const params = new URLSearchParams(window.location.search);
    const screenParam = params.get('screen');
    const stateParam = params.get('state');
    if (!screenParam) return;
    const target = ALL_SCREENS.find((s) => s.path === screenParam);
    if (!target) return;
    setSelectedScreen(target);
    setActiveGroupId(target.groupId);
    setActiveDomain(domainOf(target.groupId));
    setIframeKey((k) => k + 1);
    if (stateParam && target.states.some((st) => st.id === stateParam)) {
      setPreviewState(stateParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* State → URL: keep ?screen=&state= in sync so the address bar is always
   * shareable. Uses replaceState (no history spam) once the mount-restore has
   * run. Clears the params when nothing is selected. */
  useEffect(() => {
    if (!didRestore.current) return;
    const params = new URLSearchParams(window.location.search);
    if (selectedScreen) {
      params.set('screen', selectedScreen.path);
      if (previewState && previewState !== 'populated') params.set('state', previewState);
      else params.delete('state');
    } else {
      params.delete('screen');
      params.delete('state');
    }
    const qs = params.toString();
    const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', next);
  }, [selectedScreen, previewState]);

  /* ─── Command palette: global Cmd-K / Ctrl-K to open, Esc handled in-panel ─ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdkOpen((o) => !o);
        setCmdkQuery('');
        setCmdkIndex(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Focus the palette input the moment it opens. */
  useEffect(() => {
    if (cmdkOpen) {
      const id = window.setTimeout(() => cmdkInputRef.current?.focus(), 20);
      return () => window.clearTimeout(id);
    }
  }, [cmdkOpen]);

  const filteredScreens = useMemo(() => {
    let screens = [...ALL_SCREENS];
    /* Domain super-tab narrows to the selected domain's sections first. */
    if (activeDomain !== 'all')
      screens = screens.filter((s) => domainOf(s.groupId) === activeDomain);
    if (activeGroupId) screens = screens.filter((s) => s.groupId === activeGroupId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      screens = screens.filter(
        (s) =>
          s.displayLabel.toLowerCase().includes(q) ||
          s.label.toLowerCase().includes(q) ||
          s.path.toLowerCase().includes(q) ||
          s.states.some((st) => st.summary.toLowerCase().includes(q)),
      );
    }
    return screens;
  }, [activeDomain, activeGroupId, searchQuery]);

  const visibleGroups = useMemo(() => {
    if (activeGroupId) return sorted.filter((g) => g.id === activeGroupId);
    let groups = sorted;
    if (activeDomain !== 'all') groups = groups.filter((g) => domainOf(g.id) === activeDomain);
    return groups.filter((g) => filteredScreens.some((s) => s.groupId === g.id));
  }, [sorted, activeDomain, activeGroupId, filteredScreens]);

  const handleSelect = useCallback(
    (screen: FlatScreen) => {
      if (selectedScreen?.path === screen.path) {
        setSelectedScreen(null);
      } else {
        setSelectedScreen(screen);
        setPreviewState('populated');
        setIframeKey((k) => k + 1);
      }
      /* On mobile, picking a screen closes the drawer so the preview is full-width. */
      setSidebarOpen(false);
    },
    [selectedScreen],
  );

  const handleLinkPress = useCallback((link: string) => {
    const target = ALL_SCREENS.find((s) => s.path === link);
    if (target) {
      setActiveGroupId(null);
      setActiveDomain(domainOf(target.groupId));
      setSelectedScreen(target);
      setPreviewState('populated');
      setIframeKey((k) => k + 1);
    } else {
      window.open(link, '_blank');
    }
  }, []);

  const handleStateSelect = useCallback((value: string) => {
    setPreviewState(value);
    setIframeKey((k) => k + 1);
  }, []);

  const handleReload = useCallback(() => setIframeKey((k) => k + 1), []);
  const handleClose = useCallback(() => setSelectedScreen(null), []);
  const handleToggleThumbnail = useCallback((path: string, e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setThumbnailMap((prev) => toggleThumbnailVisibility(path, prev));
  }, []);

  /* ─── Overview: section-block refs + index-rail jump ───
   * One scroll anchor per section so the sticky index rail can jump to it.
   * Honors prefers-reduced-motion (instant jump, no smooth scroll). */
  const overviewScrollRef = useRef<HTMLDivElement | null>(null);
  const sectionBlockRefs = useRef<Record<string, HTMLElement | null>>({});
  const jumpToSection = useCallback((id: string) => {
    const el = sectionBlockRefs.current[id];
    if (!el) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, []);
  /* Open a screen from the Overview contact sheet → live preview. */
  const handleOverviewSelect = useCallback((screen: FlatScreen) => {
    setSelectedScreen(screen);
    setActiveGroupId(screen.groupId);
    setActiveDomain(domainOf(screen.groupId));
    setPreviewState('populated');
    setIframeKey((k) => k + 1);
    setViewMode('screens');
  }, []);

  const handleDesignOpenScreen = useCallback((path: string) => {
    const target = ALL_SCREENS.find((s) => s.path === path);
    if (!target) return;
    setSelectedScreen(target);
    setActiveGroupId(target.groupId);
    setActiveDomain(domainOf(target.groupId));
    setPreviewState('populated');
    setIframeKey((k) => k + 1);
    setViewMode('screens');
    setSidebarOpen(false);
  }, []);

  const sel = selectedScreen;
  const selGroup = sel ? (SCREEN_GROUPS.find((g) => g.id === sel.groupId) ?? null) : null;

  const toggleGroupCollapse = useCallback((id: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ─── Command palette model ───
   * One flat command list: a "section" jump per group, then every screen.
   * Each carries the label(s) we fuzzy-match against + the action to run. */
  type CmdItem =
    | { kind: 'section'; id: string; label: string; count: number }
    | { kind: 'screen'; screen: FlatScreen; groupLabel: string };

  const cmdItems = useMemo<CmdItem[]>(() => {
    const sections: CmdItem[] = sorted.map((g) => ({
      kind: 'section',
      id: g.id,
      label: g.label,
      count: g.screens.length,
    }));
    const screens: CmdItem[] = ALL_SCREENS.map((s) => ({
      kind: 'screen',
      screen: s,
      groupLabel: SCREEN_GROUPS.find((g) => g.id === s.groupId)?.label ?? s.groupId,
    }));
    return [...sections, ...screens];
  }, [sorted]);

  /* Fuzzy-rank the command list against the palette query. Empty query → a
   * sensible default (all sections first, then screens) so the panel is useful
   * before you type. Cap at 60 rows so the list never gets unwieldy. */
  const cmdkResults = useMemo(() => {
    const q = cmdkQuery.trim();
    if (!q) return cmdItems.slice(0, 60);
    const scored: Array<{ item: CmdItem; score: number }> = [];
    for (const item of cmdItems) {
      const haystack =
        item.kind === 'section'
          ? item.label
          : `${item.screen.displayLabel} ${item.screen.path} ${item.screen.label} ${item.groupLabel}`;
      const score = fuzzyScore(q, haystack);
      if (score !== null) scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 60).map((s) => s.item);
  }, [cmdkQuery, cmdItems]);

  /* Keep the highlighted index in range as results change. */
  useEffect(() => {
    setCmdkIndex((i) => Math.min(i, Math.max(0, cmdkResults.length - 1)));
  }, [cmdkResults.length]);

  const runCmdItem = useCallback(
    (item: CmdItem) => {
      if (item.kind === 'section') {
        /* Jump to a section: focus it, expand it, sync its domain tab, clear
           search, surface the list. */
        setActiveGroupId(item.id);
        setActiveDomain(domainOf(item.id));
        setCollapsedGroups((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
        setSearchQuery('');
        setViewMode('screens');
        if (isMobile) setSidebarOpen(true);
      } else {
        /* Jump to a screen: select it (opens the live preview), sync its domain,
           and drop its section open so the row is visible in the rail. */
        setSelectedScreen(item.screen);
        setActiveGroupId(item.screen.groupId);
        setActiveDomain(domainOf(item.screen.groupId));
        setCollapsedGroups((prev) => {
          const next = new Set(prev);
          next.delete(item.screen.groupId);
          return next;
        });
        setPreviewState('populated');
        setIframeKey((k) => k + 1);
        setViewMode('screens');
        setSidebarOpen(false);
      }
      setCmdkOpen(false);
      setCmdkQuery('');
    },
    [isMobile],
  );

  /* Arrow / Enter / Esc navigation inside the palette. */
  const onCmdkKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCmdkIndex((i) => Math.min(i + 1, cmdkResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCmdkIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = cmdkResults[cmdkIndex];
        if (item) runCmdItem(item);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setCmdkOpen(false);
      }
    },
    [cmdkResults, cmdkIndex, runCmdItem],
  );

  /* ─── Sidebar (persistent on desktop, drawer on mobile) ───
   * A raised glass rail floating over the mesh. Rows are `.gh-hoverable` so the
   * clickable affordance (lift + mint glow + visible focus) is unmistakable. */
  const sidebar = (
    <aside
      className={`${glass.raised} shrink-0 w-[300px] h-full overflow-y-auto rounded-none`}
      style={{ borderRadius: 0 }}
    >
      {/* Sidebar header + search. The header strip is a plain padded band (the
          rail itself is the glass); only the search field is an inset well so we
          never stack two glass layers (Apple HIG). */}
      <div
        ref={searchHeaderRef}
        className="sticky top-0 z-10 px-3 pt-3 pb-3"
        style={{
          /* Solid-ish brand tint so rows scrolling beneath the sticky search
             stay masked. Backdrop blur is inherited from the rail behind. */
          background: 'rgba(var(--gh-orange1-rgb), 0.82)',
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        <div className="mb-2 flex items-center gap-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: TXT_MUTED }}
          >
            All screens
          </p>
        </div>
        {/* Command-palette trigger — opens the Cmd-K fuzzy jump. Doubles as the
            search affordance; typing inline still filters the list below. */}
        <button
          onClick={() => {
            setCmdkOpen(true);
            setCmdkQuery('');
            setCmdkIndex(0);
          }}
          className={`${glass.inset} flex w-full items-center gap-2 px-2.5 py-2 transition-colors hover:border-[color:var(--gh-accent-line)]`}
          style={{ '--gh-accent-line': ACCENT_LINE } as CSSProperties}
          aria-label="Open command palette to jump to any screen"
        >
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: TXT_MUTED }} />
          <span className="flex-1 text-left text-[13px]" style={{ color: TXT_MUTED }}>
            Jump to a screen…
          </span>
          <span className="gh-kbd shrink-0" style={{ color: TXT_SECONDARY }}>
            ⌘K
          </span>
        </button>
        {/* Inline filter — narrows the list in place (kept alongside Cmd-K). */}
        <div
          className={`${glass.inset} mt-2 flex items-center gap-2 px-2.5 transition-colors focus-within:border-[color:var(--gh-accent-line)]`}
          style={{ '--gh-accent-line': ACCENT_LINE } as CSSProperties}
        >
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: TXT_MUTED }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter this list…"
            className="bg-transparent text-[13px] py-2 focus:outline-none w-full placeholder:opacity-70"
            style={{ color: TXT_PRIMARY }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear filter"
              className="cursor-pointer rounded p-0.5 transition-colors hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" style={{ color: TXT_MUTED }} />
            </button>
          )}
        </div>
        {activeGroupId && (
          <button
            onClick={() => setActiveGroupId(null)}
            className="mt-2.5 flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold transition-colors hover:bg-white/5"
            style={{ color: ACCENT }}
          >
            <X className="w-3 h-3" /> Clear group filter
          </button>
        )}
      </div>

      {/* ─── Monochrome typographic ledger (NO section color) ───
          Sections are separated by a sticky all-caps muted HEADER + a single
          hairline divider + generous whitespace — proximity + the shared sticky
          label carry the grouping (NN/G Common Region), never a hue. The section
          glyph is monochrome (its shape differentiates), the numeric prefix +
          count are muted tabular-nums. Mint is the ONLY color and rides solely
          on the selected row. */}
      <div className="pb-2">
        {visibleGroups.length === 0 && (
          <p className="px-3 py-6 text-center text-[10px]" style={{ color: TXT_MUTED }}>
            No screens match “{searchQuery}”.
          </p>
        )}
        {visibleGroups.map((group) => {
          const screensInGroup = filteredScreens.filter((s) => s.groupId === group.id);
          if (screensInGroup.length === 0) return null;
          const sectionBodyH = screensInGroup.reduce(
            (acc, s) =>
              acc + (isThumbnailVisible(s.path, thumbnailMap) ? 92 : 52),
            0,
          );
          const focused = activeGroupId === group.id;
          /* A searched/filtered list keeps every section expanded so matches are
             never hidden; otherwise sections honor the collapsed set (which is
             seeded with ALL ids → start collapsed). */
          const isCollapsed = !searchQuery.trim() && collapsedGroups.has(group.id);
          const bodyId = `gh-section-body-${group.id}`;
          return (
            <section
              key={group.id}
              role="region"
              aria-label={`${group.label} — ${screensInGroup.length} screens`}
            >
              {/* Sticky section header — a typographic ledger row (same all-caps,
                  letter-spaced, muted treatment as the "All screens" header).
                  A single monochrome hairline sits ABOVE it. The whole header is
                  ONE button: it toggles the section open/closed (and focuses it
                  for filtering). No icon chip, no hue dot, no colored count. */}
              <button
                onClick={() => {
                  if (searchQuery.trim()) return; // matches stay visible while filtering
                  setActiveGroupId(focused ? null : group.id);
                  toggleGroupCollapse(group.id);
                }}
                disabled={!!searchQuery.trim()}
                aria-expanded={!isCollapsed}
                aria-controls={bodyId}
                className="sticky z-[5] flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03] disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gh-accent-line)] focus-visible:ring-inset"
                style={{
                  top: searchHeaderH,
                  ['--gh-accent-line' as string]: ACCENT_LINE,
                  background: 'rgba(var(--gh-orange1-rgb), 0.82)',
                  borderTop: `1px solid ${HAIRLINE}`,
                }}
                title={isCollapsed ? `Expand ${group.label}` : `Collapse ${group.label}`}
              >
                <ChevronDown
                  className="h-3.5 w-3.5 shrink-0 transition-transform"
                  style={{
                    color: LEDGER_NUM,
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  }}
                  aria-hidden
                />
                <GroupIcon
                  icon={group.icon}
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: LEDGER_ICON }}
                />
                <span
                  className="flex-1 truncate text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: focused ? TXT_SECONDARY : TXT_MUTED }}
                >
                  {group.label}
                </span>
                {/* Count — muted tabular-nums, NO hue dot. */}
                <span
                  className="shrink-0 text-[11px] font-semibold tabular-nums"
                  style={{ color: LEDGER_NUM }}
                >
                  {screensInGroup.length}
                </span>
              </button>
              {/* Collapsible body — max-height/opacity transition (.gh-collapse).
                  Bigger rows: the per-row height factor is 76px (was 64). */}
              <div
                id={bodyId}
                className="gh-collapse px-2"
                style={{
                  maxHeight: isCollapsed ? 0 : `${sectionBodyH + 80}px`,
                  opacity: isCollapsed ? 0 : 1,
                }}
              >
                {screensInGroup.map((screen, idx) => {
                  const isActive = sel?.path === screen.path;
                  const subLabel = SUB_SECTIONS[group.id]?.[screen.path];
                  const thumbOn = isThumbnailVisible(screen.path, thumbnailMap);
                  return (
                    <div key={screen.path}>
                      {subLabel && (
                        <div className="mt-3 mb-1.5 flex items-center gap-2 px-2">
                          <span
                            className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{ color: TXT_MUTED }}
                          >
                            {subLabel}
                          </span>
                          <span className="h-px flex-1" style={{ backgroundColor: HAIRLINE }} />
                        </div>
                      )}
                      {/* Row = a clickable glass card. `.gh-hoverable` gives the
                          lift + mint glow + visible focus (WCAG 2.2) affordance.
                          Bigger now (py-3, label 15px). The SELECTED row fills
                          mint — the ONE interactive accent in the rail. */}
                      <div className="flex w-full items-center gap-1">
                        <button
                          onClick={() => handleSelect(screen)}
                          aria-pressed={isActive}
                          className={`${glass.hoverable} flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2 py-1.5 text-left`}
                          style={{
                            backgroundColor: isActive ? ACCENT_SOFT : 'transparent',
                            borderColor: isActive ? ACCENT_LINE : 'transparent',
                          }}
                        >
                          {thumbOn && (
                            <ScreenThumbnail
                              path={screen.path}
                              isActive={isActive}
                              accent={ACCENT}
                            />
                          )}
                          <span
                            className="min-w-0 flex-1 truncate font-medium"
                            style={{
                              color: isActive ? TXT_HEADLINE : TXT_SECONDARY,
                              fontSize: '13px',
                              lineHeight: 1.3,
                            }}
                            title={`${screen.displayLabel} · ${screen.path}`}
                          >
                            {screen.displayLabel}
                            <span
                              className="ml-1.5 font-normal"
                              style={{ color: TXT_MUTED, fontSize: '11px' }}
                            >
                              {screen.path}
                            </span>
                          </span>
                          {screen.linksTo.length > 0 && (
                            <ArrowRight
                              className="h-3 w-3 shrink-0"
                              style={{ color: isActive ? ACCENT : withOpacity(TXT_MUTED, 0.7) }}
                            />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleThumbnail(screen.path, e)}
                          className="shrink-0 rounded p-1 transition-colors hover:bg-white/10"
                          aria-label={thumbOn ? 'Hide thumbnail preview' : 'Show thumbnail preview'}
                          title={thumbOn ? 'Hide preview' : 'Show preview'}
                        >
                          {thumbOn ? (
                            <Eye className="h-3.5 w-3.5" style={{ color: TXT_MUTED }} />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" style={{ color: TXT_MUTED }} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Footer — Collapse / Expand all sections (moved out of the sticky
            top header). A plain text affordance beneath the list. */}
        {visibleGroups.length > 0 && (
          <div className="mt-2 px-3 pt-2" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
            <button
              onClick={() =>
                setCollapsedGroups((prev) =>
                  prev.size >= visibleGroups.length
                    ? new Set()
                    : new Set(visibleGroups.map((g) => g.id)),
                )
              }
              disabled={!!searchQuery.trim()}
              className="cursor-pointer rounded-md px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-white/5 disabled:cursor-default disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gh-accent-line)]"
              style={{ color: TXT_MUTED, ['--gh-accent-line' as string]: ACCENT_LINE }}
            >
              {collapsedGroups.size >= visibleGroups.length
                ? 'Expand all sections'
                : 'Collapse all sections'}
            </button>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div
      className={`${GALLERY_FONT_CLASS} ${glass.mesh} relative flex h-screen flex-col overflow-hidden`}
      style={{ color: TXT_PRIMARY }}
    >
      {/* ─── Top bar — a floating glass chrome strip over the mesh ─── */}
      <div
        className={`${glass.base} ${glass.rise} shrink-0 z-50`}
        style={{ borderRadius: 0, ['--gh-rise-delay' as string]: '0ms' }}
      >
        <div className="px-4 py-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* Mobile sidebar toggle */}
          {isMobile && viewMode === 'screens' && (
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
              aria-label="Toggle screen list"
            >
              {sidebarOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            </button>
          )}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: ACCENT_SOFT, border: `1px solid ${ACCENT_LINE}` }}
          >
            <Layers className="h-4 w-4" style={{ color: ACCENT }} />
          </div>
          <div className="min-w-0">
            <h1
              className="truncate text-[19px] font-bold leading-none tracking-tight"
              style={{ color: TXT_HEADLINE }}
            >
              Screen gallery
            </h1>
            <p className="mt-1.5 truncate text-[11.5px] leading-none" style={{ color: TXT_MUTED }}>
              {TOTAL_SCREENS} screens · {TOTAL_LINKS} flows · {TOTAL_STATES} states
            </p>
          </div>

          {/* Primary nav — Screens / Overview / Flow. Inset glass segmented
              control; on mobile it drops to its own full-width second row. */}
          <div
            className={`${glass.inset} order-last w-full flex gap-1 p-1 sm:order-none sm:ml-2 sm:w-auto`}
            role="tablist"
            aria-label="View mode"
          >
            {(['command', 'screens', 'design', 'overview', 'flow'] as const).map((mode) => {
              const active = viewMode === mode;
              const Icon =
                mode === 'flow'
                  ? GitBranch
                  : mode === 'overview'
                    ? LayoutGrid
                    : mode === 'design'
                      ? Pencil
                      : mode === 'command'
                        ? CommandIcon
                        : Layout;
              return (
                <button
                  key={mode}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setViewMode(mode);
                    setSelectedScreen(null);
                    /* Overview + Flow + Design open on the ALL-screens set, not a single group. */
                    if (mode === 'flow' || mode === 'overview' || mode === 'design') {
                      setActiveGroupId(null);
                    }
                  }}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[14px] font-semibold capitalize transition-colors sm:flex-none"
                  style={{
                    backgroundColor: active ? ACCENT_SOFT : 'transparent',
                    color: active ? ACCENT : TXT_SECONDARY,
                    border: `1px solid ${active ? ACCENT_LINE : 'transparent'}`,
                    boxShadow: active ? `0 1px 12px ${withOpacity(ACCENT, 0.18)}` : 'none',
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {mode}
                </button>
              );
            })}
          </div>
          <div className="flex-1" />

          <a
            href={SWIGGY_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open full Swiggy prototype at localhost:8080"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-white/5"
            style={{ color: TXT_SECONDARY }}
          >
            <ExternalLink className="h-4 w-4" style={{ color: ACCENT }} />
            <span className="hidden sm:inline">Open app</span>
          </a>

          {/* Inline stats (no pills) */}
          <div className="hidden lg:flex items-center gap-4">
            {[
              { v: TOTAL_SCREENS, l: 'Screens', ic: <Layers className="w-2.5 h-2.5" /> },
              { v: TOTAL_LINKS, l: 'Flows', ic: <ArrowRight className="w-2.5 h-2.5" /> },
              { v: TOTAL_STATES, l: 'States', ic: <MousePointerClick className="w-2.5 h-2.5" /> },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-1">
                <span style={{ color: ACCENT }}>{s.ic}</span>
                <span className="text-[11px] font-bold" style={{ color: TXT_PRIMARY }}>
                  {s.v}
                </span>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: TXT_MUTED }}>
                  {s.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Screens mode: horizontal super-tab strip + the split below ─── */}
      {viewMode === 'screens' && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* ═══ DOMAIN SUPER-TAB BAR ═══
              Sticky horizontal tab strip grouping the 27 sections into 5 domains
              (+ All). Anti-pill: UnderlineTabs carries a mint active underline as
              the ONLY color; selecting a domain filters the sidebar list to that
              domain's sections. role="tablist" + ←/→/Home/End live in the
              primitive. Picking a domain clears any single-section focus so the
              whole domain shows. */}
          <div
            className={`${glass.base} ${glass.rise} z-30 shrink-0 px-3`}
            style={{ borderRadius: 0, ['--gh-rise-delay' as string]: '40ms' }}
          >
            <UnderlineTabs
              tabs={DOMAIN_TABS}
              value={activeDomain}
              onChange={(next) => {
                setActiveDomain(next);
                setActiveGroupId(null);
              }}
              accent={ACCENT}
              ariaLabel="Filter screens by domain"
            />
          </div>

          <div className="relative flex flex-1 gap-3 overflow-hidden p-3">
            {/* ═══ LEFT — persistent sidebar (desktop) ═══ */}
            {!isMobile && (
              <div
                className={`${glass.rise} h-full overflow-hidden rounded-2xl`}
                style={{ ['--gh-rise-delay' as string]: '60ms' }}
              >
                {sidebar}
              </div>
            )}

            {/* ═══ Mobile drawer ═══ */}
            {isMobile && sidebarOpen && (
              <div className="absolute inset-0 z-40 flex p-3 gap-0">
                <div className="h-full overflow-hidden rounded-2xl">{sidebar}</div>
                <button
                  className="flex-1"
                  style={{ backgroundColor: 'rgba(var(--gh-orange3-rgb), 0.6)' }}
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close screen list"
                />
              </div>
            )}

            {/* ═══ RIGHT — Detail panel (Lane D) or empty state ═══ */}
            {sel && selGroup ? (
              <div
                className={`${glass.rise} flex-1 min-w-0 h-full`}
                style={{ ['--gh-rise-delay' as string]: '120ms' }}
              >
                <ScreenDetail
                  screen={sel}
                  group={selGroup}
                  device={deviceFrame}
                  onDeviceChange={(d) => {
                    setDeviceFrame(d);
                    setIframeKey((k) => k + 1);
                  }}
                  previewState={previewState}
                  onStateChange={handleStateSelect}
                  onSelectLink={handleLinkPress}
                  reloadKey={iframeKey}
                  onReload={handleReload}
                  onClose={handleClose}
                  accent={ACCENT}
                />
              </div>
            ) : (
              /* ═══ Interactive empty state — the LIVE flow map, not a dead card ═══
                Instead of "Select a screen to preview", the zero-state IS the
                whole-app flow: single-click follows a node, double-click drops
                straight into that screen's preview (handleLinkPress wraps the
                path→screen lookup + flips to live preview). A faint glass lip
                carries the hint so the affordance reads. Mint is hover/selected
                only; the map's own orange/glass carries the surface. */
              <div
                className={`${glass.raised} ${glass.rise} relative flex flex-1 min-w-0 flex-col overflow-hidden`}
                style={{ ['--gh-rise-delay' as string]: '120ms' }}
              >
                <div
                  className="flex shrink-0 items-center gap-2.5 px-4 py-2.5"
                  style={{ borderBottom: `1px solid ${HAIRLINE}` }}
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
                  >
                    <MousePointerClick className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="truncate text-[14px] font-semibold leading-tight"
                      style={{ color: TXT_HEADLINE }}
                    >
                      Pick a screen — or click it right here
                    </p>
                    <p
                      className="truncate text-[11.5px] leading-tight"
                      style={{ color: TXT_MUTED }}
                    >
                      {isMobile
                        ? 'Tap a node to follow it; double-tap to open its live preview.'
                        : 'Click a node to follow its links; double-click to open its live preview.'}
                    </p>
                  </div>
                </div>
                <div className="min-h-0 flex-1">
                  <FlowChart
                    groups={sorted}
                    mode="map"
                    focusPath={null}
                    onSelectScreen={handleLinkPress}
                    accent={ACCENT}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ OVERVIEW VIEW — sectioned bento contact-sheet (all screens at once) ═══
          The owner's "I need to see ALL screens, not endless scroll" view. Each
          of the 27 sections is ONE common-region block (matching the sidebar
          shelves); inside, screens are uniform cells — the section's first screen
          spans 2 cols (a hero cell), the rest span 1 (only those two widths). A
          cell is a lightweight thumbnail (label + path + link/state count + the
          section glyph at low opacity) — NOT a live iframe (178 iframes = a perf
          trap; screens-theme.ts:89-93). A sticky section-index rail jumps via
          scrollIntoView. Clicking a cell drops into the live preview. */}
      {viewMode === 'overview' && (
        <div className="flex-1 flex overflow-hidden gap-3 p-3">
          {/* Sticky section-index rail — monochrome (no hue dots): a numeric
              prefix + label, jump on click. Hidden on mobile (too narrow). */}
          <nav
            className={`${glass.raised} ${glass.rise} hidden h-full w-[210px] shrink-0 overflow-y-auto rounded-2xl p-2 sm:block`}
            style={{ ['--gh-rise-delay' as string]: '60ms' }}
            aria-label="Jump to section"
          >
            <p
              className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: TXT_MUTED }}
            >
              Sections · {sorted.length}
            </p>
            <ul className="space-y-0.5">
              {sorted.map((g) => {
                return (
                  <li key={g.id}>
                    <button
                      onClick={() => jumpToSection(g.id)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gh-accent-line)]"
                      style={{ ['--gh-accent-line' as string]: ACCENT_LINE }}
                      title={`Jump to ${g.label}`}
                    >
                      <span
                        className="w-6 shrink-0 text-[11px] font-semibold tabular-nums"
                        style={{ color: LEDGER_NUM }}
                        aria-hidden
                      >
                        {g.flowOrder}
                      </span>
                      <span
                        className="flex-1 truncate text-[12.5px] font-medium"
                        style={{ color: TXT_SECONDARY }}
                      >
                        {g.label}
                      </span>
                      <span
                        className="text-[11px] font-semibold tabular-nums"
                        style={{ color: TXT_MUTED }}
                      >
                        {g.screens.length}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* The contact sheet — scroll container holding the 27 section blocks. */}
          <div
            ref={overviewScrollRef}
            className={`${glass.rise} h-full min-w-0 flex-1 overflow-y-auto pr-1`}
            style={{ ['--gh-rise-delay' as string]: '120ms' }}
          >
            <div className="space-y-5">
              {sorted.map((group) => {
                return (
                  /* Monochrome section block (matches the sidebar ledger): a
                     hairline-topped header, monochrome glyph, muted count — no
                     hue wash, no colored chip/dot. */
                  <section
                    key={group.id}
                    ref={(el) => {
                      sectionBlockRefs.current[group.id] = el;
                    }}
                    role="region"
                    aria-label={`${group.label} — ${group.screens.length} screens`}
                    className="scroll-mt-3 px-1 pt-2"
                    style={{ borderTop: `1px solid ${HAIRLINE}` }}
                  >
                    {/* Block header — monochrome glyph + label + muted count. */}
                    <div className="mb-3 flex items-center gap-2.5">
                      <GroupIcon
                        icon={group.icon}
                        className="h-4 w-4 shrink-0"
                        style={{ color: LEDGER_ICON }}
                      />
                      <h3
                        className="flex-1 truncate text-[15px] font-bold tracking-tight"
                        style={{ color: TXT_HEADLINE }}
                      >
                        {group.label}
                      </h3>
                      <span
                        className="shrink-0 text-[12px] font-semibold tabular-nums"
                        style={{ color: LEDGER_NUM }}
                      >
                        {group.screens.length}
                      </span>
                    </div>
                    {/* 12-col bento — first cell spans 2, the rest span 1. */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 lg:grid-cols-12">
                      {group.screens.map((screen, idx) => {
                        const flat: FlatScreen = { ...screen, groupId: group.id };
                        const hero = idx === 0;
                        const links = screen.linksTo.length;
                        const states = screen.states.length;
                        return (
                          <button
                            key={screen.path}
                            onClick={() => handleOverviewSelect(flat)}
                            className={`${glass.bentoCell} group/cell flex min-h-[88px] flex-col p-2.5 text-left ${
                              hero
                                ? 'col-span-2 sm:col-span-4 lg:col-span-4'
                                : 'col-span-1 sm:col-span-2 lg:col-span-2'
                            }`}
                            title={`${screen.displayLabel} — ${screen.path}`}
                            aria-label={`Open ${screen.displayLabel} (${screen.path}) in live preview`}
                          >
                            {/* Hero cell gets a Figma-style thumbnail preview */}
                            {hero && (
                              <div className="relative mb-2 w-full overflow-hidden rounded-md"
                                style={{
                                  height: 100,
                                  background: '#000',
                                }}
                              >
                                <ScreenThumbnail
                                  path={screen.path}
                                  isActive={false}
                                  accent={ACCENT}
                                />
                              </div>
                            )}
                            {/* Low-opacity section glyph — monochrome thumbnail. */}
                            <GroupIcon
                              icon={group.icon}
                              className="pointer-events-none absolute right-1.5 top-1.5 h-8 w-8"
                              style={{ color: withOpacity(colors.text.secondary, 0.16) }}
                            />
                            <span
                              className="relative block pr-7 text-[12.5px] font-semibold leading-snug line-clamp-2"
                              style={{ color: TXT_HEADLINE }}
                            >
                              {screen.displayLabel}
                            </span>
                            <span
                              className="relative mt-1 block truncate text-[10.5px] leading-tight"
                              style={{ color: TXT_MUTED }}
                            >
                              {screen.path}
                            </span>
                            {/* Link / state counts — monochrome tabular-nums, no pills. */}
                            <div className="relative mt-auto flex items-center gap-3 pt-1.5">
                              {links > 0 && (
                                <span className="flex items-center gap-1">
                                  <ArrowRight className="h-3 w-3" style={{ color: LEDGER_ICON }} />
                                  <span
                                    className="text-[10.5px] font-semibold tabular-nums"
                                    style={{ color: TXT_SECONDARY }}
                                  >
                                    {links}
                                  </span>
                                </span>
                              )}
                              {states > 0 && (
                                <span className="flex items-center gap-1">
                                  <MousePointerClick
                                    className="h-3 w-3"
                                    style={{ color: LEDGER_ICON }}
                                  />
                                  <span
                                    className="text-[10.5px] font-semibold tabular-nums"
                                    style={{ color: TXT_SECONDARY }}
                                  >
                                    {states}
                                  </span>
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ DESIGN STUDIO ═══ */}
      {viewMode === 'design' && (
        <DesignStudioView screenPaths={SCREEN_PATHS} onOpenScreen={handleDesignOpenScreen} />
      )}

      {/* ═══ COMMAND CENTER ═══ */}
      {viewMode === 'command' && (
        <CommandCenterView onOpenApp={(appUrl, appId) => {
          setActiveAppUrl(appUrl);
          setActiveAppId(appId);
          setViewMode('screens');
        }} />
      )}

      {/* ═══ FLOW VIEW ═══ */}
      {viewMode === 'flow' && (
        <div className="flex-1 flex flex-col overflow-hidden gap-3 p-3">
          <div
            className={`${glass.base} ${glass.rise} shrink-0 px-4 py-3 flex flex-wrap items-center gap-3`}
            style={{ ['--gh-rise-delay' as string]: '60ms' }}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
            >
              <GitBranch className="h-4 w-4" />
            </div>
            <h2
              className="text-[17px] font-bold leading-tight tracking-tight"
              style={{ color: TXT_HEADLINE }}
            >
              Navigation flow
            </h2>
            {flowMode === 'map' && FLOW_PATHS.length > 0 && (
              <div
                className={`${glass.inset} flex flex-wrap gap-1 p-1`}
                role="tablist"
                aria-label="User journey"
              >
                <button
                  role="tab"
                  aria-selected={journeyPathId === null}
                  onClick={() => setJourneyPathId(null)}
                  className="cursor-pointer rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors"
                  style={{
                    backgroundColor: journeyPathId === null ? ACCENT_SOFT : 'transparent',
                    color: journeyPathId === null ? ACCENT : TXT_SECONDARY,
                    border: `1px solid ${journeyPathId === null ? ACCENT_LINE : 'transparent'}`,
                  }}
                >
                  All screens
                </button>
                {FLOW_PATHS.map((p) => {
                  const on = journeyPathId === p.id;
                  return (
                    <button
                      key={p.id}
                      role="tab"
                      aria-selected={on}
                      onClick={() => setJourneyPathId(p.id)}
                      className="cursor-pointer rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors"
                      style={{
                        backgroundColor: on ? ACCENT_SOFT : 'transparent',
                        color: on ? ACCENT : TXT_SECONDARY,
                        border: `1px solid ${on ? ACCENT_LINE : 'transparent'}`,
                      }}
                      title={p.description}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            )}
            {/* Whole map / Focused — inset glass segmented control (matches top nav) */}
            <div
              className={`${glass.inset} flex gap-1 p-1`}
              role="tablist"
              aria-label="Flow detail"
            >
              {(['map', 'focused'] as const).map((m) => {
                const on = flowMode === m;
                return (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setFlowMode(m)}
                    className="cursor-pointer rounded-lg px-4 py-2 text-[14px] font-semibold transition-colors"
                    style={{
                      backgroundColor: on ? ACCENT_SOFT : 'transparent',
                      color: on ? ACCENT : TXT_SECONDARY,
                      border: `1px solid ${on ? ACCENT_LINE : 'transparent'}`,
                      boxShadow: on ? `0 1px 12px ${withOpacity(ACCENT, 0.18)}` : 'none',
                    }}
                  >
                    {m === 'map' ? 'Whole map' : 'Focused'}
                  </button>
                );
              })}
            </div>
            <p className="text-[12px]" style={{ color: TXT_MUTED }}>
              {flowMode === 'focused'
                ? 'A guided walkthrough — step each section’s flow with ◀ ▶, the rail, or arrow keys. Click a screen to preview it.'
                : journeyPathId
                  ? 'Ordered journey — click any step to open it in Screens. Edge labels show navigation actions.'
                  : 'Every screen and where its buttons go. Click a node to open it in Screens.'}
            </p>
          </div>
          <div
            className={`${glass.raised} ${glass.rise} flex-1 min-h-0 overflow-hidden`}
            style={{ ['--gh-rise-delay' as string]: '120ms' }}
          >
            <FlowChart
              groups={sorted}
              mode={flowMode}
              journeyPathId={flowMode === 'map' ? journeyPathId : null}
              focusPath={sel?.path ?? ALL_SCREENS[0]?.path ?? null}
              onSelectScreen={(path) => {
                const target = ALL_SCREENS.find((s) => s.path === path);
                if (!target) return;
                setSelectedScreen(target);
                setIframeKey((k) => k + 1);
                // Click a node → drill into its live preview (both modes).
                setViewMode('screens');
              }}
              accent={ACCENT}
            />
          </div>
        </div>
      )}

      {/* ═══ COMMAND PALETTE (Cmd-K) — fuzzy jump over all screens + sections ═══
          cmdk / shadcn-Command pattern: scrim + raised-glass panel, type-ahead,
          ↑/↓ to move, ↵ to open, Esc to close. Monochrome rows (no hue dots);
          mint marks only the active row. */}
      {cmdkOpen && (
        <>
          <button
            className="gh-cmdk-scrim"
            aria-label="Close command palette"
            onClick={() => setCmdkOpen(false)}
          />
          <div
            className="fixed inset-x-0 top-[12vh] z-[9999] flex justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div
              className={`${glass.raised} gh-cmdk-panel w-full max-w-[600px] overflow-hidden`}
              onKeyDown={onCmdkKeyDown}
            >
              {/* Query input */}
              <div
                className="flex items-center gap-2.5 px-4 py-3.5"
                style={{ borderBottom: `1px solid ${HAIRLINE}` }}
              >
                <CommandIcon className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                <input
                  ref={cmdkInputRef}
                  value={cmdkQuery}
                  onChange={(e) => {
                    setCmdkQuery(e.target.value);
                    setCmdkIndex(0);
                  }}
                  placeholder="Jump to a screen or section…"
                  className="w-full bg-transparent text-[15px] focus:outline-none placeholder:opacity-60"
                  style={{ color: TXT_HEADLINE }}
                />
                <span className="gh-kbd shrink-0" style={{ color: TXT_MUTED }}>
                  Esc
                </span>
              </div>
              {/* Results */}
              <div className="max-h-[52vh] overflow-y-auto p-2">
                {cmdkResults.length === 0 ? (
                  <p className="px-3 py-8 text-center text-[13px]" style={{ color: TXT_MUTED }}>
                    No screens match “{cmdkQuery}”.
                  </p>
                ) : (
                  cmdkResults.map((item, i) => {
                    const highlighted = i === cmdkIndex;
                    const key =
                      item.kind === 'section' ? `sec:${item.id}` : `scr:${item.screen.path}`;
                    return (
                      <button
                        key={key}
                        onClick={() => runCmdItem(item)}
                        onMouseMove={() => setCmdkIndex(i)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                        style={{
                          backgroundColor: highlighted ? ACCENT_SOFT : 'transparent',
                        }}
                      >
                        {item.kind === 'section' ? (
                          <>
                            {/* Monochrome section glyph — no hue dot. */}
                            <Layers className="h-4 w-4 shrink-0" style={{ color: LEDGER_ICON }} />
                            <span
                              className="flex-1 truncate text-[14px] font-semibold"
                              style={{ color: highlighted ? TXT_HEADLINE : TXT_PRIMARY }}
                            >
                              {item.label}
                            </span>
                            <span
                              className="text-[11px] font-medium uppercase tracking-wide"
                              style={{ color: TXT_MUTED }}
                            >
                              Section · {item.count}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="min-w-0 flex-1">
                              <span
                                className="block truncate text-[14px] font-medium"
                                style={{ color: highlighted ? TXT_HEADLINE : TXT_PRIMARY }}
                              >
                                {item.screen.displayLabel}
                              </span>
                              <span
                                className="block truncate text-[11px] leading-tight"
                                style={{ color: TXT_MUTED }}
                              >
                                {item.screen.path}
                              </span>
                            </div>
                            <span
                              className="hidden shrink-0 text-[11px] sm:inline"
                              style={{ color: TXT_MUTED }}
                            >
                              {item.groupLabel}
                            </span>
                            {highlighted && (
                              <CornerDownLeft
                                className="h-3.5 w-3.5 shrink-0"
                                style={{ color: ACCENT }}
                              />
                            )}
                          </>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              {/* Footer hint */}
              <div
                className="flex items-center gap-4 px-4 py-2.5 text-[11px]"
                style={{ borderTop: `1px solid ${HAIRLINE}`, color: TXT_MUTED }}
              >
                <span className="flex items-center gap-1">
                  <span className="gh-kbd">↑</span>
                  <span className="gh-kbd">↓</span> navigate
                </span>
                <span className="flex items-center gap-1">
                  <span className="gh-kbd">↵</span> open
                </span>
                <span className="ml-auto tabular-nums">{cmdkResults.length} results</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* useSearchParams (deep-link restore) requires a Suspense boundary in the App
 * Router. We can't add app/screens/layout.tsx (Lane A owns it), so the boundary
 * lives here — mirroring the sibling app/screens/interaction-states/page.tsx
 * pattern. The fallback is a bare mesh panel so there's no flash. */
export default function ScreensPage() {
  return (
    <Suspense fallback={<div className={`${glass.mesh} h-screen w-full`} />}>
      <LiveReloadProvider>
        <ScreensPageInner />
        <HotReloadIndicator />
      </LiveReloadProvider>
    </Suspense>
  );
}

/** Floating indicator showing live-reload status. */
function HotReloadIndicator() {
  const { status, reloadAll } = useLiveReload();
  if (status === 'watching') return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 rounded-lg px-3 py-2"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${withOpacity(ACCENT, 0.3)}`,
        color: status === 'changed' ? '#f5c451' : ACCENT,
        fontSize: '12px',
        fontWeight: 600,
        boxShadow: `0 0 12px ${withOpacity(ACCENT, 0.2)}`,
      }}
    >
      {status === 'changed' ? (
        <>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#f5c451',
              animation: 'pulse 1s ease-in-out infinite',
            }}
          />
          App changed — reloading previews
        </>
      ) : (
        <>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: ACCENT,
            }}
          />
          Reloading...
        </>
      )}
    </div>
  );
}
