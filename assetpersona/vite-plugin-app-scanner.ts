/* ============================================================================
 * vite-plugin-app-scanner — App Scanner dev/preview middleware (FS adapter)
 * ----------------------------------------------------------------------------
 * AssetPersona's Vite equivalent of GrazzHopper's /screens/api/scan Route
 * Handler. GrazzHopper is Next.js, so its scanner is a Route Handler;
 * AssetPersona is a Vite SPA with no server, so the same scanner ships as a
 * Vite middleware. Both index the project's REAL files on disk so the Command
 * Center's Apps and Assets panels show what actually exists, never a hardcoded
 * list. GrazzHopper's own header notes it is a port of "the App Scanner Vite
 * middleware" — this is that middleware.
 *
 * CONTRACT (mirrors the GrazzHopper adapter):
 *   - Every response is the discriminated envelope:
 *       success: { success:true,  data:T, meta:{ timestamp } }
 *       failure: { success:false, error:{ code, message } }
 *   - SAFE-PATH ALLOWLIST: scans are confined to an allowlisted set of asset
 *     roots under the app (public/, src/assets/). resolve() + a containment
 *     check rejects any `..` traversal (OWASP A01 — path traversal). No file is
 *     ever read, listed, or streamed outside an allowlisted root.
 *
 * Dev-only by nature: a Vite middleware exists only while the dev/preview
 * server runs. The deployed static build has no server, so /api/app-scanner/*
 * simply does not exist in production and the panels degrade gracefully.
 *
 * GET /api/app-scanner/routes?appId=<id>
 *     -> { routes, groups, counts, flows }    real React Router inventory from src/App.tsx
 * GET /api/app-scanner/systems?appId=<id>
 *     -> { systems, totals }           real file/system inventory from the codebase
 * GET /api/app-scanner/assets?appId=<id>
 *     → { assets: AssetCategory[] }   real asset categories grouped by folder
 * GET /api/app-scanner/file?appId=<id>&relPath=<rel>
 *     → raw file bytes               streams a single allowlisted asset
 * ========================================================================== */

import { promises as fs, createReadStream } from 'node:fs';
import path from 'node:path';
import type { Plugin, Connect } from 'vite';
import type { ServerResponse } from 'node:http';

type Meta = { timestamp: string };
type Ok<T> = { success: true; data: T; meta: Meta };
type Err = { success: false; error: { code: string; message: string } };

function ok<T>(data: T): Ok<T> {
  return { success: true, data, meta: { timestamp: new Date().toISOString() } };
}
function fail(code: string, message: string): Err {
  return { success: false, error: { code, message } };
}

type AssetKind = 'image' | 'video' | 'audio' | 'content';

interface AssetFile {
  /** Path relative to the app root, forward-slashed (e.g. public/images/hero/x.png). */
  relPath: string;
  name: string;
  ext: string;
  kind: AssetKind;
}

interface AssetCategory {
  id: string;
  label: string;
  /** The category's base directory, relative to the app root. */
  baseRelDir: string;
  files: AssetFile[];
}

interface RouteEntry {
  id: string;
  path: string;
  label: string;
  groupId: string;
  groupLabel: string;
  guard: 'public' | 'auth' | 'admin' | 'moderator';
  shell: 'MarketingShell' | 'CommunityLayout' | 'AdminLayout' | 'Standalone';
  dynamic: boolean;
  redirect: boolean;
  componentName: string | null;
  sourceRelPath: string | null;
  sourceLine: number | null;
  purpose: string;
  states: { id: string; label: string; summary: string }[];
  linksTo: { target: string; label: string; via: string }[];
  actions: { label: string; action: string; target: string | null; functional: boolean }[];
}

interface RouteGroup {
  id: string;
  label: string;
  routes: RouteEntry[];
}

interface ScannerFlow {
  id: string;
  label: string;
  summary: string;
  paths: string[];
  status: 'ready' | 'partial' | 'gap';
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

/* ─── App registry ───
 * Maps an appId (sent by the panels) to an app root on disk. AssetPersona is a
 * single-app workspace, so the default app root is the dev server's cwd. The
 * registry is the seam the App Scanner Librarian extends to point at any other
 * connected app's root. */
function appRootFor(appId: string | null): string {
  const cwd = process.cwd();
  const REGISTRY: Record<string, string> = {
    assetpersona: cwd,
  };
  return (appId && REGISTRY[appId]) || cwd;
}

/* ─── Allowlisted asset roots, relative to an app root ───
 * The ONLY directories the scanner may walk or stream from. Each label becomes
 * the prefix of its category ids so two roots can't collide. */
const ASSET_ROOTS: { label: string; rel: string }[] = [
  { label: 'public', rel: 'public' },
  { label: 'src-assets', rel: path.join('src', 'assets') },
];

/** True iff `candidate` resolves inside `root` (no `..` escape). */
function isWithin(root: string, candidate: string): boolean {
  const rel = path.relative(root, candidate);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function classifyExt(ext: string): AssetKind {
  const e = ext.toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif', '.ico'].includes(e)) return 'image';
  if (['.mp4', '.webm', '.mov', '.m4v'].includes(e)) return 'video';
  if (['.mp3', '.wav', '.ogg', '.m4a'].includes(e)) return 'audio';
  return 'content';
}

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

/** Breadth-first walk under an allowlisted root, capped so a huge tree can't
 *  stall the request. Every emitted path is re-checked for containment. */
async function walk(appRoot: string, rootAbs: string, maxFiles: number): Promise<AssetFile[]> {
  const out: AssetFile[] = [];
  const queue: string[] = [rootAbs];
  while (queue.length && out.length < maxFiles) {
    const cur = queue.shift();
    if (!cur || !isWithin(rootAbs, cur)) continue;
    let entries: { name: string; isDirectory(): boolean; isFile(): boolean }[];
    try {
      entries = (await fs.readdir(cur, { withFileTypes: true })) as never;
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (out.length >= maxFiles) break;
      if (ent.name.startsWith('.')) continue;
      const full = path.join(cur, ent.name);
      if (!isWithin(rootAbs, full)) continue;
      if (ent.isDirectory()) {
        queue.push(full);
        continue;
      }
      if (!ent.isFile()) continue;
      const ext = path.extname(ent.name);
      const relPath = path.relative(appRoot, full).split(path.sep).join('/');
      out.push({ relPath, name: ent.name, ext, kind: classifyExt(ext) });
    }
  }
  return out;
}

/** Index real assets under each allowlisted root, grouped by the first folder
 *  segment beneath the root (so public/images/hero/* becomes one category). */
async function indexAssets(appRoot: string): Promise<AssetCategory[]> {
  const cats: AssetCategory[] = [];
  for (const root of ASSET_ROOTS) {
    const rootAbs = path.resolve(appRoot, root.rel);
    if (!isWithin(appRoot, rootAbs)) continue;
    const files = await walk(appRoot, rootAbs, 600);
    if (!files.length) continue;

    const byGroup = new Map<string, AssetFile[]>();
    for (const f of files) {
      // Show media always; for non-media keep only useful content (json/xml/text/md).
      if (f.kind === 'content' && !['.json', '.xml', '.txt', '.md'].includes(f.ext.toLowerCase())) continue;
      const afterRoot = f.relPath.slice(root.rel.split(path.sep).join('/').length).replace(/^\/+/, '');
      const segs = afterRoot.split('/').filter(Boolean);
      const sub = segs.length > 1 ? segs[0] : '';
      const key = sub ? `${root.label}/${sub}` : root.label;
      const bucket = byGroup.get(key) ?? [];
      bucket.push(f);
      byGroup.set(key, bucket);
    }

    for (const [key, groupFiles] of byGroup) {
      const sub = key.includes('/') ? key.split('/').slice(1).join('/') : '';
      const baseRelDir = sub
        ? `${root.rel.split(path.sep).join('/')}/${sub}`
        : root.rel.split(path.sep).join('/');
      const label = sub
        ? `${root.label} / ${sub.charAt(0).toUpperCase()}${sub.slice(1)}`
        : root.label === 'public'
          ? 'Public root'
          : 'Source assets';
      cats.push({
        id: key,
        label,
        baseRelDir,
        files: groupFiles.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
  }
  return cats.sort((a, b) => b.files.length - a.files.length);
}

function titleFromPath(routePath: string): string {
  const known: Record<string, string> = {
    '/agenticstudyhall': 'Agentic Study Hall',
    '/talkthrutech': 'Talk Thru Tech',
    '/community/classroom': 'Classroom',
    '/community/user-settings': 'User Settings',
    '/community/upgrade-self': 'Upgrade Self',
    '/community/feed-intel': 'Feed Intel',
    '/admin/feed-intel': 'Feed Intel',
    '/admin/content-hub': 'Content Hub',
    '/admin/content-hub/new': 'New Content Hub Item',
    '/admin/content-hub/broadcasts': 'Broadcasts',
    '/admin/strategy': 'Strategy Voice Hub',
    '/admin/modules/new': 'New Module',
    '/admin/modules/queue': 'Module Queue',
  };
  if (known[routePath]) return known[routePath];
  if (routePath === '/') return 'Home';
  const clean = routePath
    .replace(/^\/+/, '')
    .replace(/[:*]/g, '')
    .replace(/-/g, ' ')
    .split('/')
    .filter(Boolean)
    .pop() ?? 'Route';
  return clean.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function routePurpose(routePath: string, groupLabel: string): string {
  if (routePath === '/agenticstudyhall') return 'Public doorway for the AI Study Hall offer, curriculum promise, and conversion path.';
  if (routePath === '/screens') return 'Operational map for auditing every screen, system, asset, and flow in Asset Persona.';
  if (routePath.startsWith('/admin/content-hub')) return 'Authoring surface for publishing learning content, broadcasts, and scheduled modules.';
  if (routePath.startsWith('/admin')) return `Admin control plane for ${titleFromPath(routePath).toLowerCase()} operations.`;
  if (routePath.startsWith('/community/classroom')) return 'Learner classroom path for modules, course progress, and practice loops.';
  if (routePath.startsWith('/community/arcade') || routePath.includes('battle') || routePath.includes('challenge') || routePath.includes('optimizer')) {
    return 'Interactive practice surface that turns learning into repeatable challenges and proof.';
  }
  if (routePath.startsWith('/community/showcase') || routePath.startsWith('/community/portfolio') || routePath.startsWith('/u/')) {
    return 'Portfolio and proof surface for showcasing work, projects, credentials, and learning momentum.';
  }
  if (routePath.startsWith('/community')) return `Member-side ${groupLabel.toLowerCase()} screen for daily participation inside the Study Hall.`;
  if (routePath.includes('login') || routePath.includes('password') || routePath === '/start') return 'Activation path that should reduce friction and move users into onboarding.';
  if (routePath.startsWith('/talkthrutech') || routePath.startsWith('/recordings')) return 'Events and recordings surface for talks, calendar moments, and replay learning.';
  return `Public ${groupLabel.toLowerCase()} screen for discovery, trust-building, and next-step navigation.`;
}

function stateHints(route: Pick<RouteEntry, 'guard' | 'dynamic' | 'redirect'>, source = ''): RouteEntry['states'] {
  const states: RouteEntry['states'] = [
    { id: 'populated', label: 'Ready', summary: 'Primary content is loaded and usable.' },
  ];
  if (route.guard !== 'public') states.push({ id: 'auth', label: 'Signed in', summary: 'Requires an authenticated member, admin, or moderator session.' });
  if (route.dynamic) states.push({ id: 'sample', label: 'Sample params', summary: 'Dynamic URL parameters need stable preview fixtures.' });
  if (route.redirect) states.push({ id: 'redirect', label: 'Redirect', summary: 'Route forwards users to the current canonical destination.' });
  if (/\bloading\b|isLoading|Suspense|skeleton/i.test(source)) states.push({ id: 'loading', label: 'Loading', summary: 'Source includes an explicit loading or suspense path.' });
  if (/\berror\b|ErrorBoundary|catch\s*\(/i.test(source)) states.push({ id: 'error', label: 'Error', summary: 'Source includes an error-handling path.' });
  if (/\bempty\b|no\s+\w+\s+yet|length\s*===\s*0/i.test(source)) states.push({ id: 'empty', label: 'Empty', summary: 'Source appears to handle empty data.' });
  return states;
}

function actionHints(source = ''): RouteEntry['actions'] {
  const actions: RouteEntry['actions'] = [];
  const buttonLabels = extractButtonBodies(source)
    .map((body) => body.replace(/<[^>]+>/g, ' ').replace(/\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 8);
  for (const label of buttonLabels) {
    actions.push({ label, action: /onClick|submit|type="submit"/i.test(source) ? 'Interactive control' : 'Visual control', target: null, functional: /onClick|submit|type="submit"/i.test(source) });
  }
  if (/AuthModal|sign\s*in|login/i.test(source)) actions.push({ label: 'Sign in / sign up', action: 'Opens activation flow', target: '/login', functional: true });
  return actions.slice(0, 10);
}

function extractButtonBodies(source: string): string[] {
  const bodies: string[] = [];
  let cursor = 0;
  while (bodies.length < 12) {
    const start = source.indexOf('<button', cursor);
    if (start === -1) break;
    const endOpen = findTagClose(source, start + '<button'.length);
    if (endOpen === -1) break;
    const end = source.indexOf('</button>', endOpen);
    if (end === -1) break;
    bodies.push(source.slice(endOpen + 1, end).slice(0, 180));
    cursor = end + '</button>'.length;
  }
  return bodies;
}

function findTagClose(source: string, start: number): number {
  let quote: string | null = null;
  let braceDepth = 0;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === quote && source[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '{') braceDepth += 1;
    if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
    if (ch === '>' && braceDepth === 0) return i;
  }
  return -1;
}

function linkHints(source = ''): RouteEntry['linksTo'] {
  const out = new Map<string, { target: string; label: string; via: string }>();
  const patterns = [
    { via: 'Link', re: /\bto=["']([^"']+)["']/g },
    { via: 'href', re: /\bhref=["']([^"']+)["']/g },
    { via: 'navigate', re: /navigate\(["']([^"']+)["']\)/g },
  ];
  for (const { via, re } of patterns) {
    for (const match of source.matchAll(re)) {
      const target = match[1];
      if (!target || !target.startsWith('/') || target.startsWith('//')) continue;
      out.set(target, { target, label: titleFromPath(target), via });
    }
  }
  return [...out.values()].slice(0, 16);
}

async function readIfExists(abs: string): Promise<string> {
  try {
    return await fs.readFile(abs, 'utf8');
  } catch {
    return '';
  }
}

function importMapFromApp(source: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const match of source.matchAll(/const\s+(\w+)\s*=\s*lazy\(\(\)\s*=>\s*import\(['"](.+?)['"]\)\)/g)) {
    const rel = match[2].replace(/^\.\//, 'src/');
    map.set(match[1], rel.endsWith('.tsx') || rel.endsWith('.ts') ? rel : `${rel}.tsx`);
  }
  for (const match of source.matchAll(/import\s+(\w+)\s+from\s+['"](.+?)['"]/g)) {
    const rel = match[2].replace(/^\.\//, 'src/');
    if (rel.startsWith('src/')) map.set(match[1], rel.endsWith('.tsx') || rel.endsWith('.ts') ? rel : `${rel}.tsx`);
  }
  return map;
}

function componentFromRouteLine(line: string): string | null {
  const element = line.match(/element=\{([\s\S]+?)\}/)?.[1] ?? line;
  const wrappers = new Set(['MarketingShell', 'AuthGuard', 'AdminGuard', 'ModeratorGuard', 'Navigate', 'Suspense']);
  const tags = [...element.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)].map((m) => m[1]).filter((tag) => !wrappers.has(tag));
  return tags.at(-1) ?? null;
}

function sourcePreviewPath(routePath: string): string {
  return routePath
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
    .replace(':levelId', 'sample');
}

function groupForRoute(routePath: string): { id: string; label: string } {
  if (routePath.startsWith('/admin')) return { id: 'admin', label: 'Admin' };
  if (routePath.startsWith('/community/classroom') || routePath.startsWith('/community/learn')) return { id: 'learning', label: 'Study Hall Learning' };
  if (
    routePath.startsWith('/community/arcade') ||
    routePath.startsWith('/community/briefs') ||
    routePath.startsWith('/community/assessments') ||
    routePath.startsWith('/community/tutorials') ||
    routePath.startsWith('/community/deploy') ||
    routePath.startsWith('/community/momentum') ||
    routePath.startsWith('/community/orchestration')
  ) return { id: 'interactive', label: 'Interactive Learning' };
  if (
    routePath.startsWith('/community/showcase') ||
    routePath.startsWith('/community/portfolio') ||
    routePath.startsWith('/community/profile') ||
    routePath.startsWith('/u/') ||
    routePath.startsWith('/c/')
  ) return { id: 'portfolio', label: 'Portfolio & Proof' };
  if (routePath.startsWith('/community')) return { id: 'community', label: 'Community' };
  if (routePath.startsWith('/blog') || routePath.startsWith('/learn') || routePath.startsWith('/learned') || routePath.startsWith('/resources') || routePath.startsWith('/guides') || routePath.startsWith('/recordings') || routePath.startsWith('/talkthrutech')) {
    return { id: 'content', label: 'Content & Events' };
  }
  if (routePath.startsWith('/shop') || routePath.startsWith('/business') || routePath.startsWith('/work')) return { id: 'commerce', label: 'Products & Work' };
  if (routePath.includes('login') || routePath.includes('password') || routePath === '/start') return { id: 'activation', label: 'Activation' };
  if (routePath.includes('privacy') || routePath.includes('terms') || routePath.includes('accessibility') || routePath.includes('faq')) return { id: 'legal', label: 'Help & Legal' };
  if (routePath === '/screens') return { id: 'scanner', label: 'App Scanner' };
  return { id: 'marketing', label: 'Marketing' };
}

function normalizeNestedPath(parent: string | null, routePath: string): string {
  if (routePath.startsWith('/')) return routePath;
  if (!parent) return `/${routePath}`;
  return `${parent.replace(/\/$/, '')}/${routePath}`;
}

async function scanRoutes(appRoot: string): Promise<{ routes: RouteEntry[]; groups: RouteGroup[]; counts: Record<string, number>; flows: ScannerFlow[] }> {
  const appFile = path.join(appRoot, 'src', 'App.tsx');
  const source = await fs.readFile(appFile, 'utf8');
  const imports = importMapFromApp(source);
  const lines = source.split(/\r?\n/);
  const routes: RouteEntry[] = [];
  let pendingRoute = false;
  let parent: string | null = null;

  for (const [index, line] of lines.entries()) {
    if (line.includes('<Route')) pendingRoute = true;
    if (!pendingRoute && !line.includes('path=')) continue;

    const match = line.match(/path="([^"]+)"/);
    if (!match) {
      if (line.includes('>') || line.includes('/>')) pendingRoute = false;
      continue;
    }

    const rawPath = match[1];
    const fullPath = normalizeNestedPath(parent, rawPath);
    const group = groupForRoute(fullPath);
    const guard: RouteEntry['guard'] = fullPath.startsWith('/admin/moderation')
      ? 'moderator'
      : fullPath.startsWith('/admin')
        ? 'admin'
        : fullPath.startsWith('/community')
          ? 'auth'
          : 'public';
    const shell: RouteEntry['shell'] = fullPath.startsWith('/admin')
      ? 'AdminLayout'
      : fullPath.startsWith('/community')
        ? 'CommunityLayout'
        : fullPath === '/login' || fullPath.includes('password')
          ? 'Standalone'
          : 'MarketingShell';
    const componentName = componentFromRouteLine(line);
    const sourceRelPath = componentName ? imports.get(componentName) ?? null : null;
    const sourceText = sourceRelPath ? await readIfExists(path.join(appRoot, sourceRelPath)) : '';
    const routeSeed = { guard, dynamic: fullPath.includes(':') || fullPath.includes('*'), redirect: line.includes('Navigate') || source.slice(source.indexOf(line), source.indexOf(line) + 260).includes('<Navigate') };

    routes.push({
      id: fullPath.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home',
      path: fullPath,
      label: titleFromPath(fullPath),
      groupId: group.id,
      groupLabel: group.label,
      guard,
      shell,
      dynamic: routeSeed.dynamic,
      redirect: routeSeed.redirect,
      componentName,
      sourceRelPath,
      sourceLine: index + 1,
      purpose: routePurpose(fullPath, group.label),
      states: stateHints(routeSeed, sourceText),
      linksTo: routeSeed.redirect ? linkHints(line) : linkHints(sourceText),
      actions: actionHints(sourceText),
    });

    if (rawPath === '/admin') parent = '/admin';
    else if (rawPath === '/community') parent = '/community';
    else if (rawPath.startsWith('/') && rawPath !== '/admin' && rawPath !== '/community') parent = null;

    pendingRoute = false;
  }

  const unique = new Map<string, RouteEntry>();
  for (const route of routes) unique.set(route.path, route);
  const finalRoutes = [...unique.values()].sort((a, b) => a.path.localeCompare(b.path));
  const groupMap = new Map<string, RouteGroup>();
  for (const route of finalRoutes) {
    const group = groupMap.get(route.groupId) ?? { id: route.groupId, label: route.groupLabel, routes: [] };
    group.routes.push(route);
    groupMap.set(route.groupId, group);
  }

  return {
    routes: finalRoutes,
    groups: [...groupMap.values()].sort((a, b) => b.routes.length - a.routes.length),
    counts: {
      routes: finalRoutes.length,
      public: finalRoutes.filter((r) => r.guard === 'public').length,
      auth: finalRoutes.filter((r) => r.guard === 'auth').length,
      admin: finalRoutes.filter((r) => r.guard === 'admin' || r.guard === 'moderator').length,
      dynamic: finalRoutes.filter((r) => r.dynamic).length,
      redirects: finalRoutes.filter((r) => r.redirect).length,
    },
    flows: deriveFlows(finalRoutes),
  };
}

async function listSourceFiles(appRoot: string, relRoot: string, maxFiles = 800): Promise<string[]> {
  const rootAbs = path.resolve(appRoot, relRoot);
  if (!isWithin(appRoot, rootAbs)) return [];
  const out: string[] = [];
  const queue = [rootAbs];
  while (queue.length && out.length < maxFiles) {
    const cur = queue.shift();
    if (!cur) continue;
    let entries: { name: string; isDirectory(): boolean; isFile(): boolean }[];
    try {
      entries = (await fs.readdir(cur, { withFileTypes: true })) as never;
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (ent.name.startsWith('.') || ent.name === 'node_modules' || ent.name === 'dist') continue;
      const full = path.join(cur, ent.name);
      if (!isWithin(rootAbs, full)) continue;
      if (ent.isDirectory()) queue.push(full);
      else if (ent.isFile()) out.push(path.relative(appRoot, full).split(path.sep).join('/'));
    }
  }
  return out;
}

async function scanSystems(appRoot: string, routeData?: Awaited<ReturnType<typeof scanRoutes>>): Promise<{ systems: DiscoveredSystem[]; totals: Record<string, number>; scannedAt: string }> {
  const [pages, components, dataStores, libs, scripts, workflows, migrations] = await Promise.all([
    listSourceFiles(appRoot, 'src/pages'),
    listSourceFiles(appRoot, 'src/components'),
    listSourceFiles(appRoot, 'src/data'),
    listSourceFiles(appRoot, 'src/lib'),
    listSourceFiles(appRoot, 'scripts'),
    listSourceFiles(appRoot, 'n8n'),
    listSourceFiles(appRoot, 'supabase/migrations'),
  ]);
  const routes = routeData?.routes ?? (await scanRoutes(appRoot)).routes;

  const pick = (items: string[], words: string[]) => items.filter((item) => words.some((word) => item.toLowerCase().includes(word.toLowerCase())));
  const routePick = (words: string[]) => routes.filter((route) => words.some((word) => route.path.toLowerCase().includes(word.toLowerCase()))).map((route) => route.path);
  const sys = (id: string, label: string, color: string, words: string[], notes: string[], status: DiscoveredSystem['status'] = 'live'): DiscoveredSystem => ({
    id,
    label,
    color,
    status,
    pages: pick(pages, words).slice(0, 24),
    components: pick(components, words).slice(0, 24),
    dataStores: [...pick(dataStores, words), ...pick(libs, words)].slice(0, 24),
    migrations: pick(migrations, words).slice(0, 24),
    scripts: [...pick(scripts, words), ...pick(workflows, words)].slice(0, 24),
    routes: routePick(words).slice(0, 24),
    notes,
  });

  const systems = [
    sys('activation', 'Auth, signup, and onboarding', '#9e3453', ['login', 'password', 'auth', 'onboarding', 'start', 'profile'], ['Reduce sign-in friction and make onboarding visible from public Study Hall.']),
    sys('studyhall', 'AI Study Hall learning engine', '#389bc1', ['studyhall', 'classroom', 'learn', 'module', 'course', 'tutorial', 'mastery'], ['Course/module structure, practice surfaces, progress stores, and tutorial runners.']),
    sys('interactive', 'Games and interactive drills', '#f08d85', ['arcade', 'battle', 'challenge', 'optimizer', 'assessment', 'brief', 'deploy', 'orchestration'], ['Reusable interactive outputs can branch from the same lesson content.']),
    sys('portfolio', 'Portfolio, profile, and proof', '#036484', ['portfolio', 'showcase', 'profile', 'credential', 'project', 'public'], ['User-visible proof layer for apps, websites, dashboards, projects, and learning status.']),
    sys('admin', 'Admin authoring and operations', '#53111f', ['admin', 'content', 'studio', 'analytics', 'broadcast', 'member', 'course', 'product', 'event'], ['Author, schedule, analyze, and operate the Study Hall from admin.']),
    sys('community', 'Community, messages, and events', '#00455a', ['community', 'feed', 'message', 'notification', 'event', 'calendar', 'team', 'channel'], ['Member collaboration, event calendars, updates, and social learning.']),
    sys('data', 'Supabase data, analytics, and automation', '#31081f', ['supabase', 'analytics', 'progress', 'learner', 'nudge', 'workflow', 'n8n', 'migration'], ['Database tables, learner events, automation workflows, and analytics surfaces.']),
  ];

  return {
    systems,
    totals: {
      systems: systems.length,
      routes: routes.length,
      pages: pages.length,
      components: components.length,
      dataStores: dataStores.length + libs.length,
      migrations: migrations.length,
      scripts: scripts.length + workflows.length,
    },
    scannedAt: new Date().toISOString(),
  };
}

function deriveFlows(routes: RouteEntry[]): ScannerFlow[] {
  const has = (target: string) => routes.some((route) => route.path === target);
  const flow = (id: string, label: string, summary: string, paths: string[]): ScannerFlow => {
    const present = paths.filter(has).length;
    return {
      id,
      label,
      summary,
      paths,
      status: present === paths.length ? 'ready' : present > 1 ? 'partial' : 'gap',
    };
  };
  return [
    flow('activation', 'Visitor to member onboarding', 'Public Study Hall, signup, and first learning surface.', ['/agenticstudyhall', '/start', '/login', '/community/start-here', '/community/classroom']),
    flow('learn-practice-proof', 'Learn, practice, publish proof', 'Course work turns into interactive practice and portfolio artifacts.', ['/community/classroom', '/community/classroom/:courseId', '/community/arcade', '/community/showcase', '/community/portfolio']),
    flow('author-publish-measure', 'Author, publish, measure', 'Admin content pipeline from courses and modules into analytics.', ['/admin/courses', '/admin/modules', '/admin/content-hub', '/admin/content-hub/broadcasts', '/admin/analytics']),
    flow('profile-proof', 'Profile and public proof', 'Member profile, credentials, projects, and public-share routes.', ['/community/profile/:memberId', '/community/credentials/:id', '/community/showcase/:id', '/u/:handle']),
    flow('events-news', 'Events, recordings, and daily intel', 'Talks, recordings, feed intel, and learning posts keep the school current.', ['/talkthrutech', '/recordings', '/community/feed-intel', '/admin/feed-intel']),
  ].map((item) => ({ ...item, paths: item.paths.map(sourcePreviewPath) }));
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(json);
}

/** Resolve + containment-check a relPath against the app's allowlisted roots.
 *  Returns the absolute path only if it lands inside an allowlisted root. */
function resolveAllowedFile(appRoot: string, relPath: string): string | null {
  const abs = path.resolve(appRoot, relPath);
  for (const root of ASSET_ROOTS) {
    const rootAbs = path.resolve(appRoot, root.rel);
    if (isWithin(rootAbs, abs)) return abs;
  }
  return null;
}

function handleMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url ?? '';
    if (!url.startsWith('/api/app-scanner/')) return next();

    const parsed = new URL(url, 'http://localhost');
    const appId = parsed.searchParams.get('appId');
    const appRoot = appRootFor(appId);
    const route = parsed.pathname.replace('/api/app-scanner/', '');

    if (route === 'routes') {
      scanRoutes(appRoot)
        .then((data) => sendJson(res, 200, ok(data)))
        .catch((e) => sendJson(res, 500, fail('INTERNAL_ERROR', e instanceof Error ? e.message : String(e))));
      return;
    }

    if (route === 'systems') {
      scanRoutes(appRoot)
        .then((routeData) => scanSystems(appRoot, routeData))
        .then((data) => sendJson(res, 200, ok(data)))
        .catch((e) => sendJson(res, 500, fail('INTERNAL_ERROR', e instanceof Error ? e.message : String(e))));
      return;
    }

    if (route === 'assets') {
      indexAssets(appRoot)
        .then((assets) => sendJson(res, 200, ok({ assets })))
        .catch((e) => sendJson(res, 500, fail('INTERNAL_ERROR', e instanceof Error ? e.message : String(e))));
      return;
    }

    if (route === 'file') {
      const relPath = parsed.searchParams.get('relPath');
      if (!relPath) {
        sendJson(res, 400, fail('VALIDATION_ERROR', 'relPath is required'));
        return;
      }
      const abs = resolveAllowedFile(appRoot, relPath);
      if (!abs) {
        sendJson(res, 403, fail('FORBIDDEN', 'Path is outside the allowlisted asset roots'));
        return;
      }
      fs.stat(abs)
        .then((st) => {
          if (!st.isFile()) {
            sendJson(res, 404, fail('NOT_FOUND', 'Not a file'));
            return;
          }
          const ext = path.extname(abs).toLowerCase();
          res.statusCode = 200;
          res.setHeader('Content-Type', CONTENT_TYPES[ext] ?? 'application/octet-stream');
          res.setHeader('Content-Length', String(st.size));
          res.setHeader('Cache-Control', 'no-store');
          const stream = createReadStream(abs);
          stream.on('error', () => {
            if (!res.headersSent) sendJson(res, 500, fail('INTERNAL_ERROR', 'Read failed'));
            else res.end();
          });
          stream.pipe(res);
        })
        .catch(() => sendJson(res, 404, fail('NOT_FOUND', 'File not found')));
      return;
    }

    sendJson(res, 404, fail('NOT_FOUND', `Unknown app-scanner route: ${route}`));
  };
}

/** Vite plugin: registers the App Scanner middleware on the dev AND preview
 *  servers. It never affects the production build output. */
export function appScannerPlugin(): Plugin {
  return {
    name: 'app-scanner',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(handleMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleMiddleware());
    },
  };
}

export default appScannerPlugin;
