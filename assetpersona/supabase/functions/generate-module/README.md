# generate-module — Edge Function

Turns a URL / paste / concept brief into a full module-anatomy draft via Anthropic with prompt caching.

## Deploy

```bash
cd assetpersona
supabase functions deploy generate-module
```

## Required secrets

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set N8N_HMAC_SECRET=$(openssl rand -hex 32)   # only if calling from n8n
supabase secrets set ALLOWED_ORIGIN=https://www.assetpersona.com,https://assetpersona.com
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are platform-injected.

## Auth

Two paths:

1. **Admin session (browser)** — call from the admin composer with `Authorization: Bearer <anon-key>` so Supabase JWT is forwarded; the function checks `profiles.role = 'admin'`.
2. **HMAC (n8n)** — calls without admin session must include `X-Asset-Persona-Signature` HMAC over the raw body.

## Smoke test (admin)

```bash
curl -X POST https://rfnopimkroinezjxzclc.supabase.co/functions/v1/generate-module \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "prompt",
    "source": "Teach what context engineering is and how it differs from prompting.",
    "target_role": "operator",
    "type": "concept"
  }'
```

Expect 200 with `{ "draft": { hook, title, objective, ... } }`.

## Bypass mode

Frontend (`src/data/learnStore.ts`) short-circuits to a deterministic local stub when `isBypassActive()` is true, so the composer is testable without this function being deployed.
