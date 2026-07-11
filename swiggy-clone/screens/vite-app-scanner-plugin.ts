import type { IncomingMessage } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';

type Ok<T> = { success: true; data: T; meta: { timestamp: string } };
type Err = { success: false; error: { code: string; message: string; details?: unknown } };

function nowMeta(): { timestamp: string } {
  return { timestamp: new Date().toISOString() };
}

function ok<T>(data: T): Ok<T> {
  return { success: true, data, meta: nowMeta() };
}

function err(code: string, message: string, details?: unknown): Err {
  return { success: false, error: { code, message, details } };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

type AppFramework = 'vite-react' | 'expo-router' | 'nextjs' | 'unknown';

export interface AppRegistryEntry {
  id: string;
  name: string;
  description: string;
  appUrl: string;
  appPath: string;
  framework: AppFramework;
}

export interface AssetFile {
  relPath: string;
  name: string;
  ext: string;
  kind: 'image' | 'video' | 'audio' | 'content';
}

export interface AssetCategory {
  id: string;
  label: string;
  baseRelDir: string;
  files: AssetFile[];
}

export interface AppScanResult extends AppRegistryEntry {
  assets: AssetCategory[];
}

const REGISTRY_FILENAME = '.app-scanner-registry.json';

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function isWithin(root: string, candidate: string): boolean {
  const rel = path.relative(root, candidate);
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function classifyExt(ext: string): AssetFile['kind'] {
  const e = ext.toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(e)) return 'image';
  if (['.mp4', '.webm', '.mov'].includes(e)) return 'video';
  if (['.mp3', '.wav', '.ogg', '.m4a'].includes(e)) return 'audio';
  return 'content';
}

async function walkDir(rootAbs: string, dirAbs: string, maxFiles: number): Promise<AssetFile[]> {
  const out: AssetFile[] = [];
  const queue: string[] = [dirAbs];

  while (queue.length > 0 && out.length < maxFiles) {
    const cur = queue.shift();
    if (!cur) break;

    let entries: Array<{ name: string; isFile: () => boolean; isDirectory: () => boolean }>;
    try {
      entries = (await fs.readdir(cur, { withFileTypes: true })) as any;
    } catch {
      continue;
    }

    for (const ent of entries) {
      if (out.length >= maxFiles) break;
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) {
        queue.push(full);
        continue;
      }
      if (!ent.isFile()) continue;
      const ext = path.extname(ent.name);
      const relPath = path.relative(rootAbs, full);
      out.push({ relPath, name: ent.name, ext, kind: classifyExt(ext) });
    }
  }

  return out;
}

async function buildAssetsIndex(app: AppRegistryEntry): Promise<AssetCategory[]> {
  const root = app.appPath;
  const candidates = [
    { id: 'assets', label: 'Assets', baseRelDir: 'assets' },
    { id: 'public', label: 'Public', baseRelDir: 'public' },
    { id: 'images', label: 'Images', baseRelDir: path.join('assets', 'images') },
  ];

  const cats: AssetCategory[] = [];
  for (const c of candidates) {
    const abs = path.join(root, c.baseRelDir);
    try {
      const st = await fs.stat(abs);
      if (!st.isDirectory()) continue;
    } catch {
      continue;
    }
    const files = await walkDir(root, abs, 250);
    if (files.length === 0) continue;
    cats.push({ ...c, files });
  }
  return cats;
}

async function loadRegistry(registryPath: string): Promise<AppRegistryEntry[]> {
  const existing = await readJsonFile<AppRegistryEntry[]>(registryPath);
  if (existing) return existing;
  return [];
}

async function saveRegistry(registryPath: string, apps: AppRegistryEntry[]): Promise<void> {
  await writeJsonFile(registryPath, apps);
}

export function appScannerPlugin(): Plugin {
  return {
    name: 'app-scanner-api',
    configureServer(server) {
      const rootDir = server.config.root ?? process.cwd();
      const registryPath = path.join(rootDir, REGISTRY_FILENAME);

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/api/app-scanner')) return next();

        try {
          if (req.method === 'GET' && url === '/api/app-scanner/apps') {
            const apps = await loadRegistry(registryPath);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(ok({ apps })));
            return;
          }

          if (req.method === 'POST' && url === '/api/app-scanner/register') {
            const body = await readBody(req);
            const parsed = JSON.parse(body) as Partial<AppRegistryEntry>;

            if (!parsed.id || !parsed.name || !parsed.appUrl || !parsed.appPath) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('VALIDATION_ERROR', 'Missing required fields: id, name, appUrl, appPath')));
              return;
            }

            const apps = await loadRegistry(registryPath);
            const entry: AppRegistryEntry = {
              id: parsed.id,
              name: parsed.name,
              description: parsed.description ?? '',
              appUrl: parsed.appUrl,
              appPath: parsed.appPath,
              framework: parsed.framework ?? 'unknown',
            };

            const idx = apps.findIndex((a) => a.id === entry.id);
            if (idx >= 0) apps[idx] = entry;
            else apps.push(entry);

            await saveRegistry(registryPath, apps);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(ok({ app: entry })));
            return;
          }

          if (req.method === 'GET' && url === '/api/app-scanner/assets') {
            const params = new URL(req.url ?? '', 'http://localhost').searchParams;
            const appId = params.get('appId') ?? '';
            if (!appId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('VALIDATION_ERROR', 'Missing required query param: appId')));
              return;
            }
            const apps = await loadRegistry(registryPath);
            const app = apps.find((a) => a.id === appId);
            if (!app) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('NOT_FOUND', `Unknown appId: ${appId}`)));
              return;
            }
            const assets = await buildAssetsIndex(app);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(ok({ assets })));
            return;
          }

          if (req.method === 'GET' && url === '/api/app-scanner/file') {
            const params = new URL(req.url ?? '', 'http://localhost').searchParams;
            const appId = params.get('appId') ?? '';
            const relPath = params.get('relPath') ?? '';
            if (!appId || !relPath) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('VALIDATION_ERROR', 'Missing required query params: appId, relPath')));
              return;
            }
            const apps = await loadRegistry(registryPath);
            const app = apps.find((a) => a.id === appId);
            if (!app) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('NOT_FOUND', `Unknown appId: ${appId}`)));
              return;
            }
            const abs = path.join(app.appPath, relPath);
            const normalizedRoot = path.resolve(app.appPath);
            const normalizedAbs = path.resolve(abs);
            if (!isWithin(normalizedRoot, normalizedAbs)) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('FORBIDDEN', 'Path is outside registered app root')));
              return;
            }
            const buf = await fs.readFile(normalizedAbs);
            const ext = path.extname(normalizedAbs).toLowerCase();
            const mime =
              ext === '.png' ? 'image/png'
                : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
                  : ext === '.gif' ? 'image/gif'
                    : ext === '.webp' ? 'image/webp'
                      : ext === '.svg' ? 'image/svg+xml'
                        : ext === '.mp4' ? 'video/mp4'
                          : ext === '.webm' ? 'video/webm'
                            : 'application/octet-stream';
            res.statusCode = 200;
            res.setHeader('Content-Type', mime);
            res.end(buf);
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(err('INTERNAL_ERROR', e instanceof Error ? e.message : String(e))));
          return;
        }

        next();
      });
    },
  };
}

