import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage } from 'node:http';
import type { Plugin } from 'vite';

interface SavePayload {
  id: string;
  spec: unknown;
  brief: string;
  meta: unknown;
  assets?: Array<{ name: string; dataUrl: string; path?: string }>;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function writeDataUrl(filePath: string, dataUrl: string): void {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) return;
  fs.writeFileSync(filePath, Buffer.from(m[2], 'base64'));
}

export function designQueuePlugin(): Plugin {
  const queueRoot = path.resolve(__dirname, '../design-queue');

  return {
    name: 'design-queue-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/api/design-queue')) return next();

        try {
          if (req.method === 'GET' && url === '/api/design-queue/list') {
            if (!fs.existsSync(queueRoot)) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ids: [] }));
              return;
            }
            const ids = fs
              .readdirSync(queueRoot, { withFileTypes: true })
              .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
              .map((d) => d.name);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ids }));
            return;
          }

          if (req.method === 'POST' && url === '/api/design-queue/save') {
            const body = await readBody(req);
            const payload = JSON.parse(body) as SavePayload;
            const dir = path.join(queueRoot, payload.id);
            fs.mkdirSync(dir, { recursive: true });
            fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
            fs.writeFileSync(path.join(dir, 'spec.json'), JSON.stringify(payload.spec, null, 2));
            fs.writeFileSync(path.join(dir, 'AGENT-BRIEF.md'), payload.brief);
            fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(payload.meta, null, 2));
            for (const asset of payload.assets ?? []) {
              const filename = asset.name;
              writeDataUrl(path.join(dir, 'assets', filename), asset.dataUrl);
            }
            const indexPath = path.join(queueRoot, 'index.json');
            let index: { version: number; items: unknown[] } = { version: 2, items: [] };
            if (fs.existsSync(indexPath)) {
              index = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as typeof index;
            }
            const meta = payload.meta as {
              id: string;
              title: string;
              status: string;
              targetPath: string;
              updatedAt: string;
            };
            const rest = index.items.filter((i) => (i as { id: string }).id !== meta.id);
            index.items = [{ ...meta }, ...rest];
            index.version = 2;
            fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, path: dir }));
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: String(e) }));
          return;
        }

        next();
      });
    },
  };
}
