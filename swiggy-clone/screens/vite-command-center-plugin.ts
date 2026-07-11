import type { IncomingMessage } from 'node:http';
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

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

const THEME_SYSTEM_PROMPT = `You analyze notes and extract themes, tags, and action items.
Return JSON only with keys: themes (string[] from: bug, feature, design, architecture, security, legal, performance, content, agent, general), tags (string[]), actionItems (string[]).`;

export function commandCenterPlugin(): Plugin {
  return {
    name: 'command-center-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '');
      const apiKey = env.ZAI_API_KEY ?? env.GLM_API_KEY;
      const chatUrl = env.GLM_API_URL ?? 'https://api.z.ai/api/coding/paas/v4/chat/completions';

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/api/command-center')) return next();

        try {
          if (req.method === 'POST' && url === '/api/command-center/themes') {
            if (!apiKey) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('CONFIG_MISSING', 'Set GLM_API_KEY in .env.local')));
              return;
            }

            const body = await readBody(req);
            const parsed = JSON.parse(body) as { text?: unknown };
            const text = typeof parsed.text === 'string' ? parsed.text : '';
            if (!text.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('VALIDATION_ERROR', 'Missing required field: text')));
              return;
            }

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30_000);

            const glmRes = await fetch(chatUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
              body: JSON.stringify({
                model: env.DESIGN_AI_MODEL ?? 'glm-5.1',
                thinking: { type: 'disabled' },
                response_format: { type: 'json_object' },
                messages: [
                  { role: 'system', content: THEME_SYSTEM_PROMPT },
                  { role: 'user', content: text.slice(0, 2000) },
                ],
                temperature: 0.5,
                max_tokens: 512,
              }),
            });

            clearTimeout(timeout);

            if (!glmRes.ok) {
              res.statusCode = glmRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('UPSTREAM_ERROR', `GLM ${glmRes.status}`)));
              return;
            }

            const glmJson = (await glmRes.json()) as {
              choices?: Array<{ message?: { content?: string } }>;
            };
            const content = glmJson.choices?.[0]?.message?.content ?? '{}';
            const structured = parseJsonBlock(content);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(ok({ themes: structured?.themes ?? [], tags: structured?.tags ?? [], actionItems: structured?.actionItems ?? [] })));
            return;
          }

          if (req.method === 'POST' && url === '/api/command-center/report') {
            if (!apiKey) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('CONFIG_MISSING', 'No API key')));
              return;
            }

            const body = await readBody(req);
            const parsed = JSON.parse(body) as { state?: unknown; type?: unknown };
            const state = typeof parsed.state === 'string' ? parsed.state : '';
            const type = typeof parsed.type === 'string' ? parsed.type : '';
            if (!state.trim() || (type !== 'progress' && type !== 'theme')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('VALIDATION_ERROR', 'Invalid request body', { required: { state: 'string', type: 'progress|theme' } })));
              return;
            }

            const prompt = type === 'progress'
              ? `Generate a concise progress report for this app project state. Include: completed items, in-progress, blockers, next steps. Format as markdown.`
              : `Analyze these project notes and find recurring themes, patterns, and priorities. Return as markdown.`;

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30_000);

            const glmRes = await fetch(chatUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
              body: JSON.stringify({
                model: env.DESIGN_AI_MODEL ?? 'glm-5.1',
                thinking: { type: 'disabled' },
                messages: [
                  { role: 'system', content: prompt },
                  { role: 'user', content: state.slice(0, 4000) },
                ],
                temperature: 0.6,
                max_tokens: 1024,
              }),
            });

            clearTimeout(timeout);

            if (!glmRes.ok) {
              res.statusCode = glmRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(err('UPSTREAM_ERROR', `GLM ${glmRes.status}`)));
              return;
            }

            const glmJson = (await glmRes.json()) as {
              choices?: Array<{ message?: { content?: string } }>;
            };
            const content = glmJson.choices?.[0]?.message?.content ?? '';

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(ok({ content })));
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
