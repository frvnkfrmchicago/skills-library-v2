// ── Upgrade.Self — server-side study-content generation ──
// The LLM provider key lives ONLY here (Supabase secret), never in the browser.
// Previously src/lib/upgrade-self/aiClient.ts called the provider directly with
// VITE_LLM_API_KEY, which shipped the key to every visitor. This function takes
// the chat `messages` from the (authenticated) client and returns raw content.
//
// Required secrets:
//   supabase secrets set LLM_API_KEY=<provider key>      # was VITE_LLM_API_KEY
//   supabase secrets set LLM_BASE_URL=https://api.minimax.io/v1   # optional
//   supabase secrets set LLM_MODEL=MiniMax-M3                     # optional
// Deploy:
//   supabase functions deploy upgrade-self-generate

import { corsHeaders } from '../_shared/cors.ts';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  try {
    const { messages } = (await req.json()) as { messages?: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages[] is required' }), {
        status: 400,
        headers: { ...cors, 'content-type': 'application/json' },
      });
    }

    const BASE_URL = Deno.env.get('LLM_BASE_URL') ?? 'https://api.minimax.io/v1';
    const API_KEY = Deno.env.get('LLM_API_KEY') ?? '';
    const MODEL = Deno.env.get('LLM_MODEL') ?? 'MiniMax-M3';
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'Server LLM key not configured' }), {
        status: 500,
        headers: { ...cors, 'content-type': 'application/json' },
      });
    }

    const llmRes = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!llmRes.ok) {
      const errText = await llmRes.text();
      return new Response(
        JSON.stringify({ error: `LLM error ${llmRes.status}: ${errText.slice(0, 200)}` }),
        { status: 502, headers: { ...cors, 'content-type': 'application/json' } },
      );
    }

    const data = await llmRes.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    return new Response(JSON.stringify({ content }), {
      headers: { ...cors, 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }
});
