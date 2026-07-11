/* ═══ LLM — multi-provider adapter ═══
 *
 * One interface, every major provider. Swap models per feature with env vars,
 * no code changes. All providers normalized to a single { systemPrompt,
 * messages } request shape.
 *
 * Per Frank's "research-driven, not auto-Anthropic" rule:
 *   - Default provider/model is set per feature based on May 2026 benchmark data.
 *   - Override with LLM_TUTOR_PROVIDER / LLM_TUTOR_MODEL (and same for GENERATOR).
 *   - Or set LLM_PROVIDER / LLM_MODEL globally.
 *
 * Provider env keys (only set the one(s) you use):
 *   ANTHROPIC_API_KEY
 *   GOOGLE_AI_API_KEY
 *   OPENAI_API_KEY
 *   DEEPSEEK_API_KEY
 *   OPENROUTER_API_KEY
 */

export type LLMProvider =
  | 'anthropic'
  | 'google'
  | 'openai'
  | 'deepseek'
  | 'openrouter';

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  /** System prompt — cached on providers that support it (Anthropic, OpenAI cache, Gemini). */
  systemPrompt: string;
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  /** Ask for strict JSON output where supported. */
  jsonMode?: boolean;
}

export interface LLMResponse {
  text: string;
  modelUsed: string;
  providerUsed: LLMProvider;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cachedInputTokens?: number;
  };
}

/* ── Defaults — BUDGET CLASS (May 2026) ──
 * Frank's rule: in-app inference must be cheap. Claude is for dev-tool work,
 * NOT for features end-users hit at volume. Defaults are Gemma 4 (Google
 * open-weight, Apache 2.0, April 2026) routed through OpenRouter so model
 * swaps stay one env-var away.
 *
 * Tutor:     OpenRouter · google/gemma-4-26b-a4b-it ($0.06/$0.33 per M)
 *            Cheapest viable. Reasoning + agentic-tuned. 256K context.
 * Generator: OpenRouter · google/gemma-4-31b-it ($0.13/$0.38 per M)
 *            Bigger sibling for stricter JSON adherence on the one-shot anatomy gen.
 *
 * Free dev tier (rate-limited, OpenRouter):
 *   google/gemma-4-26b-a4b-it:free
 *   google/gemma-4-31b-it:free
 *
 * Other budget-class swaps (set the env vars):
 *   provider=deepseek model=deepseek-v4-flash   ($0.14/$0.28; cache hit $0.014/M in)
 *   provider=deepseek model=deepseek-v4-pro     ($0.435/$0.87; 75% off through May 31)
 *   provider=openrouter model=mistralai/...     (varies)
 *   provider=openrouter model=qwen/...          (varies)
 *
 * Premium tier (only if quality complaints from real users):
 *   provider=anthropic model=claude-sonnet-4-6  — DO NOT use as default per Frank's rule
 */
const DEFAULTS: Record<'tutor' | 'generator', { provider: LLMProvider; model: string }> = {
  tutor:     { provider: 'openrouter', model: 'google/gemma-4-26b-a4b-it' },
  generator: { provider: 'openrouter', model: 'google/gemma-4-31b-it' },
};

export type Feature = 'tutor' | 'generator';

function envProvider(feature: Feature): LLMProvider {
  const featureEnv = Deno.env.get(`LLM_${feature.toUpperCase()}_PROVIDER`);
  const globalEnv = Deno.env.get('LLM_PROVIDER');
  return ((featureEnv || globalEnv) as LLMProvider) || DEFAULTS[feature].provider;
}

function envModel(feature: Feature): string {
  const featureEnv = Deno.env.get(`LLM_${feature.toUpperCase()}_MODEL`);
  const globalEnv = Deno.env.get('LLM_MODEL');
  return featureEnv || globalEnv || DEFAULTS[feature].model;
}

export async function callLLM(req: LLMRequest, feature: Feature): Promise<LLMResponse> {
  const provider = envProvider(feature);
  const model = envModel(feature);

  switch (provider) {
    case 'anthropic':  return callAnthropic(req, model);
    case 'google':     return callGoogle(req, model);
    case 'openai':     return callOpenAI(req, model, false);
    case 'deepseek':   return callOpenAICompatible(req, model, 'deepseek');
    case 'openrouter': return callOpenAICompatible(req, model, 'openrouter');
    default: throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

/* ── Anthropic (with prompt caching) ── */

async function callAnthropic(req: LLMRequest, model: string): Promise<LLMResponse> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: req.maxTokens ?? 800,
      temperature: req.temperature,
      system: [
        { type: 'text', text: req.systemPrompt, cache_control: { type: 'ephemeral' } },
      ],
      messages: req.messages,
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return {
    text: (data.content?.[0]?.type === 'text' ? data.content[0].text : '').trim(),
    modelUsed: model,
    providerUsed: 'anthropic',
    usage: {
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
      cachedInputTokens: data.usage?.cache_read_input_tokens ?? 0,
    },
  };
}

/* ── Google Gemini ── */

async function callGoogle(req: LLMRequest, model: string): Promise<LLMResponse> {
  const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
  if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not set');

  // Gemini wants system in a separate field; messages as parts
  const contents = req.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: req.systemPrompt }] },
    contents,
    generationConfig: {
      maxOutputTokens: req.maxTokens ?? 800,
      temperature: req.temperature,
      ...(req.jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`google ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return {
    text: text.trim(),
    modelUsed: model,
    providerUsed: 'google',
    usage: {
      inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
    },
  };
}

/* ── OpenAI (and OpenAI-compatible: DeepSeek, OpenRouter) ── */

async function callOpenAI(req: LLMRequest, model: string, _compat: boolean): Promise<LLMResponse> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  return callOpenAILike({
    base: 'https://api.openai.com/v1',
    apiKey,
    headers: {},
    providerLabel: 'openai',
    req, model,
  });
}

async function callOpenAICompatible(
  req: LLMRequest,
  model: string,
  which: 'deepseek' | 'openrouter'
): Promise<LLMResponse> {
  if (which === 'deepseek') {
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not set');
    return callOpenAILike({
      base: 'https://api.deepseek.com/v1',
      apiKey,
      headers: {},
      providerLabel: 'deepseek',
      req, model,
    });
  }
  // openrouter
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set');
  return callOpenAILike({
    base: 'https://openrouter.ai/api/v1',
    apiKey,
    headers: {
      'HTTP-Referer': Deno.env.get('OPENROUTER_REFERER') ?? 'https://www.assetpersona.com',
      'X-Title': 'Asset Persona',
    },
    providerLabel: 'openrouter',
    req, model,
  });
}

async function callOpenAILike({
  base, apiKey, headers, providerLabel, req, model,
}: {
  base: string;
  apiKey: string;
  headers: Record<string, string>;
  providerLabel: LLMProvider;
  req: LLMRequest;
  model: string;
}): Promise<LLMResponse> {
  const messages = [
    { role: 'system', content: req.systemPrompt },
    ...req.messages,
  ];
  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: req.maxTokens ?? 800,
    temperature: req.temperature,
    ...(req.jsonMode ? { response_format: { type: 'json_object' } } : {}),
  };
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${apiKey}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${providerLabel} ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  return {
    text: text.trim(),
    modelUsed: model,
    providerUsed: providerLabel,
    usage: {
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
      cachedInputTokens: data.usage?.prompt_tokens_details?.cached_tokens ?? 0,
    },
  };
}

/** What the function reports back to itself for status / logging. */
export function summarizeProviderConfig(feature: Feature): { provider: LLMProvider; model: string } {
  return { provider: envProvider(feature), model: envModel(feature) };
}
