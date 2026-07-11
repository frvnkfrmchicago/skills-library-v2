# In-app LLM provider matrix — BUDGET CLASS

Frank's rule: in-app inference must be cheap. Claude is for dev work, not for features end-users hit at volume.

The Edge Functions in this project route through `_shared/llm.ts`, a multi-provider adapter. Provider and model are selected per feature via env vars — no code changes needed to swap.

## Defaults (May 2026)

| Feature | Provider | Model | Price (per million tokens) |
|---|---|---|---|
| **Tutor** (per-question, scoped) | OpenRouter | `google/gemma-4-26b-a4b-it` | **$0.06 in · $0.33 out** |
| **Generator** (one-shot, strict JSON) | OpenRouter | `google/gemma-4-31b-it` | **$0.13 in · $0.38 out** |

Both run Google's Gemma 4 family (open-weight, Apache 2.0, released April 2 2026, 256K context, native multimodality, reasoning-tuned). Routed through OpenRouter so the same key works for any model in the catalog.

## How much will this actually cost (real math, not abstractions)

### Tutor — at 10,000 learner questions per month

Average shape per turn:
- System prompt (module body): ~1,500 tokens
- User question: ~100 tokens
- Reply: ~250 tokens

| Setup | Per-turn cost | Monthly @ 10K turns |
|---|---|---|
| **Gemma 4 26B (default)** | $0.000178 | **$1.78** |
| Gemma 4 26B (free tier, rate-limited) | $0.00 | **$0.00** |
| DeepSeek V4 Flash (cache hit on system) | $0.000091 | **$0.91** |
| DeepSeek V4 Flash (no cache) | $0.000280 | $2.80 |
| Anthropic Sonnet 4.6 | ~$0.009 | **~$93** ← reference, not recommended |

So at 10K monthly tutor turns, Gemma 4 costs **$1.78** vs Sonnet 4.6's **~$93**. At 100K turns: $17.80 vs $930. The math gets more painful at scale, not less.

### Generator — at 150 drafts per month (5/day)

Average shape per draft:
- System prompt: ~5,000 tokens
- Article context: ~8,000 tokens
- JSON output: ~1,500 tokens

| Setup | Per-draft cost | Monthly @ 150 drafts |
|---|---|---|
| **Gemma 4 31B (default)** | $0.0023 | **$0.34** |
| DeepSeek V4 Flash | $0.0022 | $0.34 |
| DeepSeek V4 Pro (50% off) | $0.0070 | $1.05 |
| Anthropic Sonnet 4.6 | ~$0.062 | ~$9.30 |

Module generation is bursty + low-volume, so even premium-tier numbers are small. The bigger issue is **JSON reliability** — see "Reliability tradeoff" below.

## All budget-class options ranked

### Tutor — patient explanation, scoped to module

| Pick | Cost (in/out per M) | Latency | Why |
|---|---|---|---|
| **Gemma 4 26B A4B** (default) | $0.06 / $0.33 | Together 1.4s TTFT · DeepInfra 1.6s | Cheapest viable, reasoning-tuned, Apache 2.0 |
| **Gemma 4 31B** | $0.13 / $0.38 | similar | More headroom on harder questions |
| **DeepSeek V4 Flash** | $0.14 / $0.28 (cache → $0.014 in) | Together 0.99s TTFT, 83.6 tok/s | Best cache economics — system reused on every follow-up |
| **DeepSeek V4 Pro** (promo) | $0.435 / $0.87 | similar | When the answer must be perfect; ~6× cheaper than Sonnet |
| Mistral / Qwen / Kimi (via OpenRouter) | varies (sub-$1/M out) | varies | Worth testing if quality drops |

### Generator — strict JSON anatomy

JSON reliability matters here because the function rejects unparseable output. Open-weight models historically have looser JSON adherence than frontier closed models.

| Pick | Cost | JSON reliability | Notes |
|---|---|---|---|
| **Gemma 4 31B** (default) | $0.13 / $0.38 | Good (use `jsonMode: true`) | Best balance of cost + structure |
| Gemma 4 26B A4B | $0.06 / $0.33 | Acceptable | Can downgrade if 31B is too slow |
| DeepSeek V4 Pro | $0.435 / $0.87 | Strong | If parse-failure rate climbs, promote here |
| DeepSeek V4 Flash | $0.14 / $0.28 | Tier 3 (89-92%) | Cheapest; expect occasional malformed outputs (function already retries via `tryParseJson`) |

If you start hitting parse failures often, escalate to DeepSeek V4 Pro for the generator only — the tutor stays on Gemma. Total monthly bill stays under $5.

## Required secrets (set only the ones you use)

```bash
supabase secrets set OPENROUTER_API_KEY=sk-or-...    # default — routes Gemma 4 + everything else
supabase secrets set DEEPSEEK_API_KEY=...            # if calling DeepSeek directly (not via OpenRouter)
supabase secrets set GOOGLE_AI_API_KEY=...           # if calling Gemma 4 via Google AI Studio directly
supabase secrets set ANTHROPIC_API_KEY=...           # only if explicitly overriding to Claude
supabase secrets set OPENAI_API_KEY=...              # only if explicitly overriding to GPT
supabase secrets set OPENROUTER_REFERER=https://www.assetpersona.com   # optional
```

## Switching examples

```bash
# Tutor on DeepSeek (cache-friendly), generator stays on Gemma
supabase secrets set LLM_TUTOR_PROVIDER=deepseek
supabase secrets set LLM_TUTOR_MODEL=deepseek-v4-flash

# Generator on bigger DeepSeek for stricter JSON
supabase secrets set LLM_GENERATOR_PROVIDER=deepseek
supabase secrets set LLM_GENERATOR_MODEL=deepseek-v4-pro

# Free tier for testing (heavy rate limits)
supabase secrets set LLM_TUTOR_MODEL=google/gemma-4-26b-a4b-it:free

# Override globally to a single cheap model
supabase secrets set LLM_PROVIDER=openrouter
supabase secrets set LLM_MODEL=mistralai/mistral-small-3.2

# (Not recommended — only if quality complaints come in from real users)
supabase secrets set LLM_TUTOR_PROVIDER=anthropic
supabase secrets set LLM_TUTOR_MODEL=claude-sonnet-4-6
```

## How "switching" actually works

Every Edge Function calls `callLLM(req, 'tutor')` (or `'generator'`). Inside the adapter:

1. Read `LLM_TUTOR_PROVIDER` (or `LLM_PROVIDER` global, then default)
2. Read `LLM_TUTOR_MODEL` (or `LLM_MODEL` global, then default)
3. Dispatch to the matching provider adapter (anthropic / google / openai / deepseek / openrouter)
4. Return `{ text, providerUsed, modelUsed, usage }` so the caller logs which model ran

Zero code change to swap. The function's response body includes `provider` and `model` so you can verify in your devtools which one served any given request.

## Why thin adapter, not a full gateway

Full gateways (Vercel AI Gateway, Portkey, LiteLLM) earn their keep at "many apps × many models" scale. Two features doesn't justify them. The adapter already supports OpenRouter as a provider, so when you grow past ~5 features you flip one env var and inherit gateway features (load balancing, fallback, budget caps) without rewriting.

Sources:
- [Vercel AI Gateway vs OpenRouter (2026)](https://www.respan.ai/market-map/compare/openrouter-vs-vercel-ai-gateway)
- [Best LLM Router and AI Gateway 2026 — Inworld](https://inworld.ai/resources/best-llm-router-ai-gateway)

## Sources for the May 2026 pricing + ranking

- [Gemma 4 — Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Gemma 4 26B A4B on OpenRouter](https://openrouter.ai/google/gemma-4-26b-a4b-it)
- [Gemma 4 31B on OpenRouter](https://openrouter.ai/google/gemma-4-31b-it)
- [Google Gemma 4 Pricing 2026 — AI Cost Check](https://aicostcheck.com/blog/google-gemma-4-cost-analysis-open-model-2026)
- [Gemma 4 vs Grok 4.3: Open Weights vs Cheap Closed — Contra Collective](https://contracollective.com/blog/gemma-4-vs-grok-4-3-may-2026)
- [DeepSeek V4 Flash — OpenRouter](https://openrouter.ai/deepseek/deepseek-v4-flash)
- [DeepSeek V4 Pro — OpenRouter](https://openrouter.ai/deepseek/deepseek-v4-pro)
- [DeepSeek V4 Complete Guide 2026 — Codersera](https://codersera.com/blog/deepseek-v4-complete-guide-2026/)
- [DeepSeek V4 Flash Review — buildfastwithai](https://www.buildfastwithai.com/blogs/deepseek-v4-flash-review-2026)
