import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage } from 'node:http';
import { loadEnv, type Plugin } from 'vite';
import { buildDraftContextBlock } from './src/lib/design-ai/context';
import { buildSystemPrompt, cardUserPrompt } from './src/lib/design-ai/prompts';
import type { CopilotCardId, DesignDraft } from './src/lib/design-queue/types';

interface ChatPayload {
  mode: string;
  draft: DesignDraft;
  userMessage: string;
  screenPaths: string[];
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function parseJsonBlock(text: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const m = /\{[\s\S]*\}/.exec(text);
    if (!m) return undefined;
    try {
      return JSON.parse(m[0]) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  }
}

const CARD_IDS = new Set<string>([
  'scope',
  'considerations',
  'next-screen',
  'agent-handoff',
  'challenge',
]);

function glmChatUrl(env: Record<string, string>): string {
  if (env.GLM_API_URL?.trim()) return env.GLM_API_URL.trim();
  const base = (env.ZAI_BASE_URL ?? 'https://api.z.ai/api/coding/paas/v4').replace(/\/$/, '');
  return `${base}/chat/completions`;
}

export function designAiPlugin(): Plugin {
  const manifestPath = path.resolve(__dirname, 'src/screen-manifest.json');

  return {
    name: 'design-ai-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '');
      const chatUrl = glmChatUrl(env);
      const apiKey = env.ZAI_API_KEY ?? env.GLM_API_KEY;
      const model = env.DESIGN_AI_MODEL ?? 'glm-5.1';

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/api/design-ai')) return next();

        if (req.method !== 'POST' || url !== '/api/design-ai/chat') {
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: 'Not found' }));
          return;
        }

        try {
          if (!apiKey) {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: false,
                error:
                  'Set GLM_API_KEY in screens/.env.local (copy from grazzhopper-content-hub/.env.local).',
              }),
            );
            return;
          }

          const body = await readBody(req);
          const payload = JSON.parse(body) as ChatPayload;
          const mode = payload.mode === 'chat' ? 'chat' : payload.mode;
          const isCard = CARD_IDS.has(mode);

          let manifestSnippet = '';
          if (fs.existsSync(manifestPath)) {
            const raw = fs.readFileSync(manifestPath, 'utf8');
            manifestSnippet = raw.length > 6000 ? `${raw.slice(0, 6000)}\n…` : raw;
          }

          const context = buildDraftContextBlock(payload.draft, payload.screenPaths);
          const system = buildSystemPrompt(isCard ? (mode as CopilotCardId) : 'chat');
          const userContent = isCard
            ? `${cardUserPrompt(mode as CopilotCardId, payload.draft.title)}\n\n${context}`
            : `${payload.userMessage}\n\n${context}\n\n## Manifest excerpt\n${manifestSnippet}`;

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 60_000);

          const glmRes = await fetch(chatUrl, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
              model,
              thinking: { type: 'disabled' },
              ...(isCard ? { response_format: { type: 'json_object' } } : {}),
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: userContent },
              ],
              temperature: 0.7,
              max_tokens: 2048,
            }),
          });

          clearTimeout(timeout);

          if (!glmRes.ok) {
            const errText = await glmRes.text();
            res.statusCode = glmRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: errText.slice(0, 500) }));
            return;
          }

          const glmJson = (await glmRes.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          const content = glmJson.choices?.[0]?.message?.content ?? '';
          const structured = isCard ? parseJsonBlock(content) : undefined;

          const queueDir = path.resolve(__dirname, '../design-queue', payload.draft.id);
          if (structured && fs.existsSync(path.dirname(queueDir))) {
            fs.mkdirSync(queueDir, { recursive: true });
            fs.writeFileSync(
              path.join(queueDir, 'ai-thread.json'),
              JSON.stringify(
                {
                  updatedAt: new Date().toISOString(),
                  lastMode: mode,
                  lastStructured: structured,
                },
                null,
                2,
              ),
            );
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, content, structured }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              ok: false,
              error: e instanceof Error ? e.message : String(e),
            }),
          );
        }
      });
    },
  };
}
