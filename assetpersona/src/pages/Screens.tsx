import './Screens.css';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Boxes,
  Code2,
  Eye,
  FileText,
  Gauge,
  Image as ImageIcon,
  Layers,
  Link2,
  Lock,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Route,
  Search,
  Sparkles,
} from 'lucide-react';

type Guard = 'public' | 'auth' | 'admin' | 'moderator';
type Shell = 'MarketingShell' | 'CommunityLayout' | 'AdminLayout' | 'Standalone';
type ScannerView = 'screens' | 'systems' | 'assets' | 'flows' | 'labs';
type InspectorTab = 'overview' | 'states' | 'links' | 'actions' | 'source';

interface ScannerState {
  id: string;
  label: string;
  summary: string;
}

interface ScannerLink {
  target: string;
  label: string;
  via: string;
}

interface ScannerAction {
  label: string;
  action: string;
  target: string | null;
  functional: boolean;
}

interface ScannerRoute {
  id: string;
  path: string;
  label: string;
  groupId: string;
  groupLabel: string;
  guard: Guard;
  shell: Shell;
  dynamic: boolean;
  redirect: boolean;
  componentName: string | null;
  sourceRelPath: string | null;
  sourceLine: number | null;
  purpose: string;
  states: ScannerState[];
  linksTo: ScannerLink[];
  actions: ScannerAction[];
}

interface ScannerGroup {
  id: string;
  label: string;
  routes: ScannerRoute[];
}

interface ScannerFlow {
  id: string;
  label: string;
  summary: string;
  paths: string[];
  status: 'ready' | 'partial' | 'gap';
}

interface RouteScan {
  routes: ScannerRoute[];
  groups: ScannerGroup[];
  flows: ScannerFlow[];
  counts: {
    routes: number;
    public: number;
    auth: number;
    admin: number;
    dynamic: number;
    redirects: number;
  };
}

interface AssetFile {
  relPath: string;
  name: string;
  ext: string;
  kind: 'image' | 'video' | 'audio' | 'content';
}

interface AssetCategory {
  id: string;
  label: string;
  baseRelDir: string;
  files: AssetFile[];
}

interface DiscoveredSystem {
  id: string;
  label: string;
  color: string;
  status: 'live' | 'scaffold' | 'detected';
  pages: string[];
  components: string[];
  dataStores: string[];
  migrations: string[];
  scripts: string[];
  routes: string[];
  notes: string[];
}

interface SystemsScan {
  systems: DiscoveredSystem[];
  totals: {
    systems: number;
    routes: number;
    pages: number;
    components: number;
    dataStores: number;
    migrations: number;
    scripts: number;
  };
  scannedAt: string;
}

const EMPTY_SYSTEMS: SystemsScan = {
  systems: [],
  totals: { systems: 0, routes: 0, pages: 0, components: 0, dataStores: 0, migrations: 0, scripts: 0 },
  scannedAt: new Date().toISOString(),
};

const FALLBACK_SCAN: RouteScan = {
  routes: [
    makeRoute('/agenticstudyhall', 'Agentic Study Hall', 'marketing', 'Marketing', 'public', 'MarketingShell'),
    makeRoute('/login', 'Login', 'activation', 'Activation', 'public', 'Standalone'),
    makeRoute('/community/start-here', 'Start Here', 'learning', 'Study Hall Learning', 'auth', 'CommunityLayout'),
    makeRoute('/community/classroom', 'Classroom', 'learning', 'Study Hall Learning', 'auth', 'CommunityLayout'),
    makeRoute('/community/arcade', 'Arcade', 'interactive', 'Interactive Learning', 'auth', 'CommunityLayout'),
    makeRoute('/community/showcase', 'Showcase', 'portfolio', 'Portfolio & Proof', 'auth', 'CommunityLayout'),
    makeRoute('/admin/content-hub', 'Content Hub', 'admin', 'Admin', 'admin', 'AdminLayout'),
    makeRoute('/screens', 'App Scanner', 'scanner', 'App Scanner', 'public', 'Standalone'),
  ],
  groups: [],
  flows: [],
  counts: { routes: 8, public: 3, auth: 4, admin: 1, dynamic: 0, redirects: 0 },
};

FALLBACK_SCAN.groups = groupRoutes(FALLBACK_SCAN.routes);

const VIEW_TABS: { id: ScannerView; label: string; Icon: typeof Monitor }[] = [
  { id: 'screens', label: 'Screens', Icon: Monitor },
  { id: 'systems', label: 'Systems', Icon: Boxes },
  { id: 'assets', label: 'Assets', Icon: ImageIcon },
  { id: 'flows', label: 'Flows', Icon: Route },
  { id: 'labs', label: 'Labs', Icon: Sparkles },
];

const INSPECTOR_TABS: { id: InspectorTab; label: string; Icon: typeof Monitor }[] = [
  { id: 'overview', label: 'Purpose', Icon: Eye },
  { id: 'states', label: 'States', Icon: Layers },
  { id: 'links', label: 'Links', Icon: Link2 },
  { id: 'actions', label: 'Actions', Icon: MousePointerClick },
  { id: 'source', label: 'Source', Icon: Code2 },
];

function makeRoute(path: string, label: string, groupId: string, groupLabel: string, guard: Guard, shell: Shell): ScannerRoute {
  return {
    id: path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home',
    path,
    label,
    groupId,
    groupLabel,
    guard,
    shell,
    dynamic: path.includes(':'),
    redirect: false,
    componentName: null,
    sourceRelPath: null,
    sourceLine: null,
    purpose: `${label} screen in the ${groupLabel.toLowerCase()} section.`,
    states: [{ id: 'populated', label: 'Ready', summary: 'Primary content is loaded and usable.' }],
    linksTo: [],
    actions: [],
  };
}

function groupRoutes(routes: ScannerRoute[]): ScannerGroup[] {
  const map = new Map<string, ScannerGroup>();
  for (const item of routes) {
    const group = map.get(item.groupId) ?? { id: item.groupId, label: item.groupLabel, routes: [] };
    group.routes.push(item);
    map.set(item.groupId, group);
  }
  return [...map.values()].sort((a, b) => b.routes.length - a.routes.length);
}

function previewPath(path: string): string {
  if (path === '/screens') return '/agenticstudyhall';
  if (path === '*') return '/not-found';
  return path
    .replace(':courseId', 'ai-foundations')
    .replace(':slug', 'sample')
    .replace(':id', 'sample')
    .replace(':memberId', 'founder')
    .replace(':shareId', 'sample')
    .replace(':handle', 'frank')
    .replace(':code', 'sample')
    .replace(':threadId', 'sample')
    .replace(':tutorialId', 'sample')
    .replace(':scenarioId', 'sample')
    .replace(':levelId', 'sample')
    .replace('*', 'not-found');
}

function getPreviewUrl(path: string): string {
  const base = typeof window === 'undefined' ? 'http://localhost:4173' : window.location.origin;
  return `${base}${previewPath(path)}`;
}

function guardLabel(guard: Guard): string {
  if (guard === 'auth') return 'Member';
  if (guard === 'admin') return 'Admin';
  if (guard === 'moderator') return 'Moderator';
  return 'Public';
}

function statusCopy(status: ScannerFlow['status'] | DiscoveredSystem['status']): string {
  if (status === 'ready' || status === 'live') return 'Live';
  if (status === 'partial') return 'Partial';
  if (status === 'gap') return 'Gap';
  if (status === 'scaffold') return 'Scaffold';
  return 'Detected';
}

export default function ScreensPage() {
  const [scan, setScan] = useState<RouteScan>(FALLBACK_SCAN);
  const [assets, setAssets] = useState<AssetCategory[]>([]);
  const [systems, setSystems] = useState<SystemsScan>(EMPTY_SYSTEMS);
  const [selectedPath, setSelectedPath] = useState('/agenticstudyhall');
  const [activeGroup, setActiveGroup] = useState('all');
  const [activeView, setActiveView] = useState<ScannerView>('screens');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('overview');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  async function loadScanner() {
    setLoading(true);
    setError(null);
    try {
      const [routesRes, assetsRes, systemsRes] = await Promise.all([
        fetch('/api/app-scanner/routes?appId=assetpersona', { cache: 'no-store' }),
        fetch('/api/app-scanner/assets?appId=assetpersona', { cache: 'no-store' }),
        fetch('/api/app-scanner/systems?appId=assetpersona', { cache: 'no-store' }),
      ]);
      const routeJson = await routesRes.json();
      if (!routeJson.success) throw new Error(routeJson.error?.message ?? 'Route scan failed');
      const nextScan = routeJson.data as RouteScan;
      setScan({ ...nextScan, groups: nextScan.groups.length ? nextScan.groups : groupRoutes(nextScan.routes), flows: nextScan.flows ?? [] });
      setSelectedPath((current) => (
        nextScan.routes.some((item) => item.path === current)
          ? current
          : nextScan.routes.find((item) => item.path === '/agenticstudyhall')?.path ?? nextScan.routes[0]?.path ?? '/'
      ));

      const assetJson = await assetsRes.json();
      if (assetJson.success) setAssets(assetJson.data.assets ?? []);

      const systemsJson = await systemsRes.json();
      if (systemsJson.success) setSystems(systemsJson.data as SystemsScan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scanner unavailable');
      setScan(FALLBACK_SCAN);
      setSystems(EMPTY_SYSTEMS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadScanner();
  }, []);

  const groups = scan.groups.length ? scan.groups : groupRoutes(scan.routes);
  const selected = scan.routes.find((item) => item.path === selectedPath) ?? scan.routes[0];
  const visibleRoutes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return scan.routes.filter((item) => {
      const groupOk = activeGroup === 'all' || item.groupId === activeGroup;
      const queryOk =
        !normalized ||
        item.path.toLowerCase().includes(normalized) ||
        item.label.toLowerCase().includes(normalized) ||
        item.groupLabel.toLowerCase().includes(normalized) ||
        (item.sourceRelPath ?? '').toLowerCase().includes(normalized);
      return groupOk && queryOk;
    });
  }, [activeGroup, query, scan.routes]);
  const labRoutes = useMemo(() => scan.routes.filter((route) => (
    route.groupId === 'interactive' ||
    /arcade|battle|challenge|optimizer|tutorial|assessment|deploy|orchestration/i.test(route.path)
  )), [scan.routes]);

  function selectPath(path: string) {
    const route = scan.routes.find((item) => item.path === path || previewPath(item.path) === path);
    setSelectedPath(route?.path ?? path);
    setActiveView('screens');
  }

  return (
    <main className="scanner">
      <header className="scanner__hero">
        <div className="scanner__hero-copy">
          <span className="scanner__eyebrow">Asset Persona /screens</span>
          <h1>Route command center, not a blank gallery.</h1>
          <p>
            Live routes, source files, system inventory, assets, flows, and interactive learning labs
            are pulled from the Vite app so the scanner adapts as the platform changes.
          </p>
        </div>
        <div className="scanner__stats" aria-label="Scanner summary">
          <Stat label="Routes" value={scan.counts.routes} />
          <Stat label="Systems" value={systems.totals.systems || 7} />
          <Stat label="Assets" value={assets.reduce((sum, category) => sum + category.files.length, 0)} />
          <Stat label="Flows" value={scan.flows.length || 5} />
        </div>
      </header>

      <section className="scanner__toolbar" aria-label="Scanner controls">
        <div className="scanner__tabs" role="tablist" aria-label="Scanner views">
          {VIEW_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`scanner__tab ${activeView === id ? 'scanner__tab--active' : ''}`}
              onClick={() => setActiveView(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <label className="scanner__search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search screens, source files, groups"
          />
        </label>
        <button className="scanner__refresh" type="button" onClick={() => void loadScanner()}>
          <RefreshCw size={16} className={loading ? 'scanner__spin' : ''} />
          Rescan
        </button>
      </section>

      {error && (
        <div className="scanner__notice" role="status">
          Live scan fell back to the built-in route set: {error}
        </div>
      )}

      {activeView === 'screens' && selected && (
        <section className="scanner__workspace" aria-label="Screen command center">
          <RouteRail groups={groups} routeCount={scan.routes.length} activeGroup={activeGroup} onGroupChange={setActiveGroup} />
          <ScreenGallery routes={visibleRoutes} selectedPath={selected.path} onSelect={setSelectedPath} />
          <ScreenInspector
            route={selected}
            tab={inspectorTab}
            onTabChange={setInspectorTab}
            onSelectPath={selectPath}
            previewKey={previewKey}
            onReload={() => setPreviewKey((key) => key + 1)}
          />
        </section>
      )}

      {activeView === 'systems' && <SystemsPanel systems={systems} />}
      {activeView === 'assets' && <AssetsPanel assets={assets} />}
      {activeView === 'flows' && <FlowsPanel flows={scan.flows} onSelectPath={selectPath} />}
      {activeView === 'labs' && <LabsPanel routes={labRoutes} onSelectPath={selectPath} />}
    </main>
  );
}

function RouteRail({
  groups,
  routeCount,
  activeGroup,
  onGroupChange,
}: {
  groups: ScannerGroup[];
  routeCount: number;
  activeGroup: string;
  onGroupChange: (groupId: string) => void;
}) {
  return (
    <aside className="scanner__rail">
      <button
        type="button"
        className={`scanner__group ${activeGroup === 'all' ? 'scanner__group--active' : ''}`}
        onClick={() => onGroupChange('all')}
      >
        <span>All routes</span>
        <strong>{routeCount}</strong>
      </button>
      {groups.map((group) => (
        <button
          key={group.id}
          type="button"
          className={`scanner__group ${activeGroup === group.id ? 'scanner__group--active' : ''}`}
          onClick={() => onGroupChange(group.id)}
        >
          <span>{group.label}</span>
          <strong>{group.routes.length}</strong>
        </button>
      ))}
    </aside>
  );
}

function ScreenGallery({
  routes,
  selectedPath,
  onSelect,
}: {
  routes: ScannerRoute[];
  selectedPath: string;
  onSelect: (path: string) => void;
}) {
  return (
    <section className="scanner__gallery" aria-label="Screen gallery">
      <div className="scanner__gallery-head">
        <div>
          <span>{routes.length} visible</span>
          <h2>Screen gallery</h2>
        </div>
        <span className="scanner__source">Source-aware route cards</span>
      </div>
      <div className="scanner__cards">
        {routes.map((item) => (
          <button
            key={item.path}
            type="button"
            className={`scanner__card ${selectedPath === item.path ? 'scanner__card--active' : ''}`}
            onClick={() => onSelect(item.path)}
          >
            <span className="scanner__card-top">
              <span>{item.groupLabel}</span>
              <span className={`scanner__guard scanner__guard--${item.guard}`}>{guardLabel(item.guard)}</span>
            </span>
            <strong>{item.label}</strong>
            <code>{item.path}</code>
            <span className="scanner__card-meta">
              {item.componentName ?? item.shell}
              {item.dynamic ? ' / dynamic' : ''}
              {item.redirect ? ' / redirect' : ''}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ScreenInspector({
  route,
  tab,
  onTabChange,
  onSelectPath,
  previewKey,
  onReload,
}: {
  route: ScannerRoute;
  tab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
  onSelectPath: (path: string) => void;
  previewKey: number;
  onReload: () => void;
}) {
  return (
    <aside className="scanner__inspector">
      <div className="scanner__preview-head">
        <div>
          <span>Live preview</span>
          <h2>{route.label}</h2>
          <code>{route.path}</code>
        </div>
        <button type="button" onClick={onReload} aria-label="Reload preview">
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="scanner__device">
        <iframe
          key={`${route.path}-${previewKey}`}
          title={`${route.label} preview`}
          src={getPreviewUrl(route.path)}
        />
      </div>
      <div className="scanner__preview-meta">
        <span><Lock size={14} /> {guardLabel(route.guard)}</span>
        <span><Monitor size={14} /> {route.shell}</span>
        <span><Eye size={14} /> {route.dynamic ? 'Sample params' : 'Direct route'}</span>
      </div>

      <div className="scanner__detail">
        <div className="scanner__detail-tabs" role="tablist" aria-label="Selected screen detail">
          {INSPECTOR_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'scanner__detail-tab scanner__detail-tab--active' : 'scanner__detail-tab'}
              onClick={() => onTabChange(id)}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
        <InspectorPanel route={route} tab={tab} onSelectPath={onSelectPath} />
      </div>
    </aside>
  );
}

function InspectorPanel({ route, tab, onSelectPath }: { route: ScannerRoute; tab: InspectorTab; onSelectPath: (path: string) => void }) {
  if (tab === 'states') {
    return (
      <div className="scanner__mini-list">
        {route.states.map((state) => (
          <article key={state.id} className="scanner__mini-card">
            <strong>{state.label}</strong>
            <p>{state.summary}</p>
          </article>
        ))}
      </div>
    );
  }

  if (tab === 'links') {
    return (
      <div className="scanner__mini-list">
        {route.linksTo.length ? route.linksTo.map((link) => (
          <button key={`${link.target}-${link.via}`} type="button" className="scanner__link-row" onClick={() => onSelectPath(link.target)}>
            <span>
              <strong>{link.label}</strong>
              <code>{link.target}</code>
            </span>
            <em>{link.via}</em>
          </button>
        )) : <p className="scanner__muted">No internal links detected in the source file.</p>}
      </div>
    );
  }

  if (tab === 'actions') {
    return (
      <div className="scanner__mini-list">
        {route.actions.length ? route.actions.map((action) => (
          <article key={`${action.label}-${action.action}`} className="scanner__mini-card">
            <strong>{action.label}</strong>
            <p>{action.action}{action.target ? ` -> ${action.target}` : ''}</p>
            <span className={action.functional ? 'scanner__status scanner__status--ready' : 'scanner__status scanner__status--partial'}>
              {action.functional ? 'Wired' : 'Needs check'}
            </span>
          </article>
        )) : <p className="scanner__muted">No button actions detected in the source file.</p>}
      </div>
    );
  }

  if (tab === 'source') {
    return (
      <div className="scanner__source-panel">
        <InfoRow label="Component" value={route.componentName ?? 'Unknown'} />
        <InfoRow label="Source" value={route.sourceRelPath ?? 'Not mapped'} />
        <InfoRow label="Route line" value={route.sourceLine ? String(route.sourceLine) : 'Not mapped'} />
        <InfoRow label="Route shell" value={route.shell} />
      </div>
    );
  }

  return (
    <div className="scanner__source-panel">
      <p className="scanner__purpose">{route.purpose}</p>
      <InfoRow label="Section" value={route.groupLabel} />
      <InfoRow label="Access" value={guardLabel(route.guard)} />
      <InfoRow label="Preview" value={previewPath(route.path)} />
    </div>
  );
}

function SystemsPanel({ systems }: { systems: SystemsScan }) {
  return (
    <section className="scanner__panel">
      <PanelTitle icon={Gauge} eyebrow="Live inventory" title="Systems mapped from project files" />
      <div className="scanner__panel-stats">
        <Stat label="Pages" value={systems.totals.pages} />
        <Stat label="Components" value={systems.totals.components} />
        <Stat label="Data stores" value={systems.totals.dataStores} />
        <Stat label="Migrations" value={systems.totals.migrations} />
      </div>
      <div className="scanner__system-grid">
        {systems.systems.map((system) => (
          <article className="scanner__system" key={system.id} style={{ '--system-color': system.color } as CSSProperties}>
            <div className="scanner__system-dot" />
            <div>
              <h3>{system.label}</h3>
              <p>{system.notes[0]}</p>
              <div className="scanner__system-tags">
                <span>{system.routes.length} routes</span>
                <span>{system.pages.length} pages</span>
                <span>{system.dataStores.length} data</span>
                <span>{system.migrations.length} migrations</span>
              </div>
            </div>
            <span className={`scanner__status scanner__status--${system.status}`}>{statusCopy(system.status)}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function AssetsPanel({ assets }: { assets: AssetCategory[] }) {
  return (
    <section className="scanner__panel">
      <PanelTitle icon={ImageIcon} eyebrow="Asset registry" title="Indexed public and source media" />
      <div className="scanner__asset-grid">
        {assets.length === 0 ? (
          <div className="scanner__empty">No assets returned by the scanner middleware yet.</div>
        ) : (
          assets.map((category) => (
            <article className="scanner__asset" key={category.id}>
              <div className="scanner__asset-head">
                <div>
                  <h3>{category.label}</h3>
                  <code>{category.baseRelDir}</code>
                </div>
                <span>{category.files.length}</span>
              </div>
              <div className="scanner__asset-strip">
                {category.files.slice(0, 12).map((file) => (
                  file.kind === 'image' ? (
                    <img
                      key={file.relPath}
                      src={`/api/app-scanner/file?appId=assetpersona&relPath=${encodeURIComponent(file.relPath)}`}
                      alt={file.name}
                    />
                  ) : (
                    <span key={file.relPath}><FileText size={16} />{file.ext || 'file'}</span>
                  )
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function FlowsPanel({ flows, onSelectPath }: { flows: ScannerFlow[]; onSelectPath: (path: string) => void }) {
  return (
    <section className="scanner__panel">
      <PanelTitle icon={Activity} eyebrow="Flow map" title="Core journeys that must stay intact" />
      <div className="scanner__flow-list">
        {flows.map((flow) => (
          <article className="scanner__flow" key={flow.id}>
            <div className="scanner__flow-head">
              <div>
                <h3>{flow.label}</h3>
                <p>{flow.summary}</p>
              </div>
              <span className={`scanner__status scanner__status--${flow.status}`}>{statusCopy(flow.status)}</span>
            </div>
            <div className="scanner__flow-path">
              {flow.paths.map((path, index) => (
                <span key={`${flow.id}-${path}`} className="scanner__flow-step">
                  <button type="button" onClick={() => onSelectPath(path)}>{path}</button>
                  {index < flow.paths.length - 1 && <ArrowRight size={14} />}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LabsPanel({ routes, onSelectPath }: { routes: ScannerRoute[]; onSelectPath: (path: string) => void }) {
  return (
    <section className="scanner__panel">
      <PanelTitle icon={Sparkles} eyebrow="Interactive learning" title="Labs and reusable practice surfaces" />
      <div className="scanner__lab-grid">
        {routes.map((route) => (
          <article className="scanner__lab" key={route.path}>
            <div>
              <h3>{route.label}</h3>
              <p>{route.purpose}</p>
            </div>
            <button type="button" onClick={() => onSelectPath(route.path)}>
              Inspect <ArrowRight size={14} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="scanner__info-row">
      <span>{label}</span>
      <code>{value}</code>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="scanner__stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function PanelTitle({ icon: Icon, eyebrow, title }: { icon: typeof Monitor; eyebrow: string; title: string }) {
  return (
    <div className="scanner__panel-title">
      <Icon size={22} />
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
    </div>
  );
}
