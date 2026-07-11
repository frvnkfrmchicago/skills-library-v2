# Lane 3 — Module Generator API
Status: assigned · Wave: 2 (Author) · % on completion: 55%

## Explainer
Edge Function that takes a URL/prompt/paste and returns a full module-anatomy draft via Claude API with prompt caching. Used by L2 composer's "Generate from URL" button and by L6's RSS pipeline.

## Owned scope
`supabase/functions/generate-module/index.ts`, `supabase/functions/_shared/module-prompts.ts`, `supabase/functions/_shared/llm.ts` (multi-provider adapter — Anthropic / Google Gemini / OpenAI / DeepSeek / OpenRouter — replaces the single-vendor anthropic.ts originally planned), `supabase/functions/_shared/PROVIDERS.md` (research-backed model matrix)

## Done criteria
- Accepts `{ source_type, source, target_role, type }` payload
- Returns complete anatomy: hook, objective, context, resources[], practice, reflect
- Prompt-cached system context (per claude-api skill)
- HMAC-signed POST forwarded to admin queue (when called from L6)
- Bypass mode short-circuits with a deterministic stub draft
