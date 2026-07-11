// deno-lint-ignore-file no-explicit-any
/**
 * AP-LEARN-2026-05 · Wave 2 · Author
 * Edge Function: generate-module
 *
 * Turns a URL/paste/concept into a full module-anatomy draft. Uses the
 * provider-agnostic LLM adapter so the model is swappable per-feature via env
 * vars. Default (May 2026 research) is Sonnet 4.6 — Tier 1 JSON reliability
 * (100% pass) + prompt caching for the system template.
 *
 * Override:
 *   LLM_GENERATOR_PROVIDER=google LLM_GENERATOR_MODEL=gemini-2.5-pro
 *   LLM_GENERATOR_PROVIDER=openai LLM_GENERATOR_MODEL=gpt-5.2
 *   LLM_GENERATOR_PROVIDER=deepseek LLM_GENERATOR_MODEL=deepseek-chat   # cheap fallback (Tier 3 JSON — handle parse failures)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';
import { verifyHmac } from '../_shared/hmac.ts';
import { SYSTEM_PROMPT, buildUserPrompt } from '../_shared/module-prompts.ts';
import { callLLM, summarizeProviderConfig } from '../_shared/llm.ts';

interface GenerateRequest {
  source_type: 'url' | 'paste' | 'prompt';
  source: string;
  source_title?: string;
  source_published_at?: string;
  target_role?: 'curious' | 'operator' | 'crafter' | 'architect' | 'producer';
  type?: 'daily_drill' | 'news_drop' | 'concept' | 'role_pathway' | 'project';
  enqueue?: boolean;
  source_hash?: string;
  source_label?: string;
}

async function fetchUrlText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AssetPersonaModuleGen/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return '';
    const text = await res.text();
    return text
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000);
  } catch {
    return '';
  }
}

function tryParseJson(s: string): Record<string, unknown> | null {
  const cleaned = s
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function isAdminUser(req: Request): Promise<boolean> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: auth } } }
  );
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return false;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();
  return (profile as { role?: string } | null)?.role === 'admin';
}

async function isHmacAuthed(req: Request, body: string): Promise<boolean> {
  const sig = req.headers.get('x-asset-persona-signature');
  const secret = Deno.env.get('N8N_HMAC_SECRET');
  if (!sig || !secret) return false;
  return verifyHmac(secret, body, sig);
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  const rawBody = await req.text();

  const adminOk = await isAdminUser(req);
  const hmacOk = adminOk ? false : await isHmacAuthed(req, rawBody);
  if (!adminOk && !hmacOk) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  let body: GenerateRequest;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  const targetRole = body.target_role ?? 'operator';
  const type = body.type ?? (body.source_type === 'url' ? 'news_drop' : 'concept');

  let effectiveSource = body.source;
  if (body.source_type === 'url') {
    const fetched = await fetchUrlText(body.source);
    if (fetched) effectiveSource = `${body.source}\n\nFetched content:\n${fetched}`;
  }

  const userPrompt = buildUserPrompt({
    source_type: body.source_type,
    source: effectiveSource,
    source_title: body.source_title,
    source_published_at: body.source_published_at,
    target_role: targetRole,
    type,
  });

  let modelText: string;
  let modelUsed = '';
  let providerUsed = '';
  try {
    const result = await callLLM(
      {
        systemPrompt: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
        maxTokens: 2000,
        jsonMode: true,
      },
      'generator'
    );
    modelText = result.text;
    modelUsed = result.modelUsed;
    providerUsed = result.providerUsed;
  } catch (err) {
    console.error('generator LLM call failed:', err);
    const cfg = summarizeProviderConfig('generator');
    return new Response(
      JSON.stringify({
        error: 'model_failure',
        provider: cfg.provider,
        model: cfg.model,
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 502, headers: { ...cors, 'content-type': 'application/json' } }
    );
  }

  const draft = tryParseJson(modelText);
  if (!draft) {
    return new Response(
      JSON.stringify({ error: 'parse_failure', provider: providerUsed, model: modelUsed, raw: modelText.slice(0, 500) }),
      { status: 502, headers: { ...cors, 'content-type': 'application/json' } }
    );
  }

  if (body.enqueue) {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const insertRow = {
      source_url: body.source_type === 'url' ? body.source : '',
      source_title: body.source_title ?? null,
      source_published_at: body.source_published_at ?? null,
      source_label: body.source_label ?? null,
      source_hash: body.source_hash ?? null,
      draft,
      suggested_role: (draft as Record<string, unknown>).suggested_role ?? targetRole,
      suggested_tags: (draft as Record<string, unknown>).suggested_tags ?? [],
      suggested_type: type,
      status: 'pending',
    };

    const { data, error } = await supabase
      .from('module_drafts_queue')
      .upsert(insertRow, { onConflict: 'source_hash' })
      .select('id')
      .single();

    if (!error) {
      return new Response(
        JSON.stringify({ draft, queue_id: data?.id, provider: providerUsed, model: modelUsed }),
        { status: 200, headers: { ...cors, 'content-type': 'application/json' } }
      );
    }
    console.error('Queue insert failed:', error);
  }

  return new Response(
    JSON.stringify({ draft, provider: providerUsed, model: modelUsed }),
    { status: 200, headers: { ...cors, 'content-type': 'application/json' } }
  );
});
