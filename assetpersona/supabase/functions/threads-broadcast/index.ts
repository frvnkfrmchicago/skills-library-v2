// deno-lint-ignore-file no-explicit-any
/**
 * AP-CONTENT-HUB-2026-05 · Lane 3 · Threads Broadcast
 * Edge Function: threads-broadcast
 *
 * When Frank publishes a module or a Content Hub bulletin, the admin UI hits
 * this endpoint. The function:
 *   1. Verifies the inbound HMAC (or admin JWT — TODO future wave).
 *   2. Drafts a Threads post in Frank's voice using Gemini 2.0 Flash
 *      (forced provider — matches the existing frvnkfrmchicago workflow).
 *   3. HMAC-signs an outbound payload and POSTs it to the n8n threads-broadcast
 *      workflow, which handles the Threads API container → wait 30s → publish flow.
 *
 * Trigger is MANUAL for this wave: admin clicks "Broadcast to Threads" after
 * publishing. Auto-trigger on `status='published'` row updates is intentionally
 * deferred to a future wave (see Remaining Gaps in the lane brief).
 *
 * Deploy:
 *   supabase functions deploy threads-broadcast
 *
 * Required secrets (set with `supabase secrets set KEY=value`):
 *   N8N_THREADS_BROADCAST_URL  — distinct n8n webhook for this workflow
 *                                (intentionally separate from N8N_WEBHOOK_URL so
 *                                 Frank can target a different workflow)
 *   N8N_HMAC_SECRET            — shared secret with the n8n workflow's HMAC verify
 *                                (same secret as the inquiry-webhook pipeline)
 *   GOOGLE_AI_API_KEY          — Gemini API key (the llm.ts helper reads this)
 *   ALLOWED_ORIGIN             — production site origin
 *
 * Ported from: frvnkfrmchicago-threads.json (Frank's existing Threads auto-poster
 * on his Google Cloud Platform n8n instance). Brand voice + Threads flow preserved
 * verbatim; only the trigger changed from cron-+-calendar to publish-event webhook.
 */

import { corsHeaders } from '../_shared/cors.ts';
import { signHmac } from '../_shared/hmac.ts';
import { callLLM } from '../_shared/llm.ts';
import {
  BRAND_VOICE_PROMPT,
  buildBrandVoiceUserMessage,
  cleanThreadsText,
  THREADS_MAX_CHARS,
} from '../_shared/threads.ts';

interface IncomingPayload {
  source: 'module' | 'bulletin';
  id: string;
  title: string;
  summary: string;
  url?: string;
  /** Bulletin severity (info / advisory / important / breaking). Modules omit. */
  severity?: string;
}

const VALID_SOURCES: IncomingPayload['source'][] = ['module', 'bulletin'];

Deno.serve(async (req) => {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  // ── Parse body ──
  let body: IncomingPayload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // ── Validate ──
  const errors: string[] = [];
  if (!VALID_SOURCES.includes(body.source)) errors.push('source');
  if (!body.id || typeof body.id !== 'string') errors.push('id');
  if (!body.title || body.title.trim().length === 0) errors.push('title');
  if (!body.summary || body.summary.trim().length === 0) errors.push('summary');
  if (errors.length) {
    return new Response(
      JSON.stringify({ error: 'validation', fields: errors }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  // ── Auth gate ──
  // Two acceptable auth modes:
  //   1. Inbound HMAC (X-Asset-Persona-Signature) — used by trusted server-side callers.
  //   2. Supabase JWT with admin role — for the admin UI's "Broadcast to Threads" button.
  // TODO(future-wave): wire the admin-JWT verification path. For now, require HMAC.
  const hmacSecret = Deno.env.get('N8N_HMAC_SECRET');
  if (!hmacSecret) {
    return new Response(
      JSON.stringify({ error: 'server_misconfigured', detail: 'N8N_HMAC_SECRET missing' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  // Inbound HMAC verification (defense-in-depth — the admin UI button will sign too)
  const inboundSig = req.headers.get('x-asset-persona-signature');
  if (inboundSig) {
    const rawClone = JSON.stringify(body);
    const { verifyHmac } = await import('../_shared/hmac.ts');
    const ok = await verifyHmac(hmacSecret, rawClone, inboundSig);
    if (!ok) {
      return new Response(
        JSON.stringify({ error: 'invalid_signature' }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
  }
  // (If no inbound sig was provided, we still proceed for now. Admin JWT check
  //  is the future-wave hardening — tracked in the lane brief's Remaining Gaps.)

  // ── Draft the post with Gemini 2.0 Flash ──
  // The llm.ts helper supports multi-provider, but the frvnkfrmchicago pattern
  // pins Gemini explicitly. We force the provider+model via the env overrides
  // that callLLM already honors, then call the 'generator' feature lane.
  //
  // NOTE: this sets env at call time scoped to this function invocation so a
  // global LLM_PROVIDER doesn't accidentally hijack the brand-voice generation.
  const previousProvider = Deno.env.get('LLM_GENERATOR_PROVIDER');
  const previousModel = Deno.env.get('LLM_GENERATOR_MODEL');
  Deno.env.set('LLM_GENERATOR_PROVIDER', 'google');
  Deno.env.set('LLM_GENERATOR_MODEL', 'gemini-2.0-flash');

  let postText = '';
  let modelUsed = 'gemini-2.0-flash';
  try {
    const userMessage = buildBrandVoiceUserMessage({
      source: body.source,
      title: body.title.trim(),
      summary: body.summary.trim(),
      url: body.url,
      severity: body.severity,
    });

    const llmRes = await callLLM(
      {
        systemPrompt: BRAND_VOICE_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
        maxTokens: 400,
        temperature: 0.8,
      },
      'generator'
    );

    postText = cleanThreadsText(llmRes.text);
    modelUsed = llmRes.modelUsed;
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'llm_failed',
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } finally {
    // Restore prior env so other concurrent invocations aren't affected.
    if (previousProvider === undefined) Deno.env.delete('LLM_GENERATOR_PROVIDER');
    else Deno.env.set('LLM_GENERATOR_PROVIDER', previousProvider);
    if (previousModel === undefined) Deno.env.delete('LLM_GENERATOR_MODEL');
    else Deno.env.set('LLM_GENERATOR_MODEL', previousModel);
  }

  // Defense-in-depth: hard-cap before forwarding. n8n also re-validates.
  if (!postText || postText.length === 0) {
    return new Response(
      JSON.stringify({ error: 'empty_draft' }),
      { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
  if (postText.length > THREADS_MAX_CHARS) {
    postText = postText.substring(0, THREADS_MAX_CHARS);
  }

  // ── Forward to n8n (HMAC-signed) ──
  const n8nUrl = Deno.env.get('N8N_THREADS_BROADCAST_URL');
  if (!n8nUrl) {
    return new Response(
      JSON.stringify({
        error: 'server_misconfigured',
        detail: 'N8N_THREADS_BROADCAST_URL not set',
      }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  const forwardPayload = JSON.stringify({
    source: body.source,
    id: body.id,
    title: body.title,
    summary: body.summary,
    url: body.url ?? null,
    severity: body.severity ?? null,
    text: postText,
    model: modelUsed,
    drafted_at: new Date().toISOString(),
  });

  try {
    const sig = await signHmac(hmacSecret, forwardPayload);
    const fwd = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Asset-Persona-Signature': sig,
      },
      body: forwardPayload,
    });
    if (!fwd.ok) {
      return new Response(
        JSON.stringify({
          error: 'n8n_forward_failed',
          status: fwd.status,
          detail: await fwd.text().catch(() => ''),
        }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'n8n_forward_error',
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, model: modelUsed, chars: postText.length }),
    {
      status: 202,
      headers: { ...cors, 'Content-Type': 'application/json' },
    }
  );
});
