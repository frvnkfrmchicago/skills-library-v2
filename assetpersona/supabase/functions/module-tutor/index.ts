// deno-lint-ignore-file no-explicit-any
/**
 * AP-LEARN-2026-05 · Wave 4 · Engage
 * Edge Function: module-tutor
 *
 * Stateful Q&A tutor scoped to a single module. Module body + objective are
 * sent as the system prompt (cached on providers that support it). The user's
 * question is the only fresh tokens per call.
 *
 * Per Frank's rule: provider/model is research-driven, multi-provider, swappable
 * via env vars. See `_shared/llm.ts` for the adapter and defaults.
 *
 * Default (May 2026 research):
 *   provider=anthropic model=claude-sonnet-4-6
 *   Reasoning: Tier 1 structured output reliability, top student-pref scores
 *   for patient pedagogical explanation, prompt caching supported, ~1/5 the
 *   cost of Opus 4.7 with 98% of the quality.
 *
 * Override globally:    LLM_PROVIDER=google LLM_MODEL=gemini-2.5-pro
 * Override per-feature: LLM_TUTOR_PROVIDER=deepseek LLM_TUTOR_MODEL=deepseek-chat
 *
 * Required secrets (one of, depending on provider):
 *   ANTHROPIC_API_KEY · GOOGLE_AI_API_KEY · OPENAI_API_KEY · DEEPSEEK_API_KEY · OPENROUTER_API_KEY
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';
import { callLLM, summarizeProviderConfig } from '../_shared/llm.ts';

interface TutorRequest {
  module_slug: string;
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

function buildSystemPrompt(moduleData: {
  title: string;
  hook: string;
  objective: string;
  context_md: string;
  practice_md: string | null;
}): string {
  return `You are the AI tutor for an Asset Persona learning module. Your job is to answer the learner's questions about THIS specific module — clearly, briefly, and with a real example when helpful.

## The module
**Title:** ${moduleData.title}
**Hook:** ${moduleData.hook}
**Objective:** ${moduleData.objective}

## Context
${moduleData.context_md}

${moduleData.practice_md ? `## Practice\n${moduleData.practice_md}\n` : ''}

## Voice
- Plain language, no jargon. No em-dashes. No "let's dive in".
- Second person ("you"), direct.
- Lead with the answer, then the example.
- Cap responses at 120 words unless the learner asks for more.

## What to do when stuck
- If the question is outside the module's scope, say so in one sentence and offer to flag it for Frank to cover in a future module.
- After three back-and-forths without progress, suggest the learner ping Frank directly via the Inquiries form.

## Format
Plain prose. Short paragraphs. Use a bullet list ONLY when there are 3+ items.`;
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  let body: TutorRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  if (!body.module_slug || !body.message?.trim()) {
    return new Response(JSON.stringify({ error: 'missing_fields' }), {
      status: 400,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  const { data: moduleData, error: modErr } = await supabase
    .from('modules')
    .select('title, hook, objective, context_md, practice_md, status')
    .eq('slug', body.module_slug)
    .single();

  if (modErr || !moduleData) {
    return new Response(JSON.stringify({ error: 'module_not_found' }), {
      status: 404,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }
  if (moduleData.status !== 'published') {
    return new Response(JSON.stringify({ error: 'module_not_published' }), {
      status: 403,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  const systemPrompt = buildSystemPrompt(moduleData);
  const history = (body.history ?? []).slice(-6);
  const messages = [...history, { role: 'user' as const, content: body.message }];

  try {
    const result = await callLLM(
      { systemPrompt, messages, maxTokens: 800 },
      'tutor'
    );
    return new Response(
      JSON.stringify({
        reply: result.text,
        provider: result.providerUsed,
        model: result.modelUsed,
        usage: result.usage,
      }),
      { status: 200, headers: { ...cors, 'content-type': 'application/json' } }
    );
  } catch (err) {
    console.error('tutor LLM call failed:', err);
    const cfg = summarizeProviderConfig('tutor');
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
});
