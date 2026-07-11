# inquiry-webhook — Edge Function

Single ingress for every consultant intake form on `/work/*` plus the general
contact form. Validates → scores → persists to `inquiries` (service-role) →
HMAC-signs and POSTs the payload to the n8n workflow that routes Frank's
Gmail by form_type.

## Deploy

```bash
cd assetpersona
supabase functions deploy inquiry-webhook
```

## Required secrets

```bash
supabase secrets set N8N_WEBHOOK_URL=https://n8n.example.com/webhook/inquiry-router
supabase secrets set N8N_HMAC_SECRET=$(openssl rand -hex 32)
supabase secrets set ALLOWED_ORIGIN=https://www.assetpersona.com,https://assetpersona.com
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by
the Supabase platform — do not set them manually.

## Frontend env

Add to `.env`:

```
VITE_INQUIRY_WEBHOOK_URL=https://rfnopimkroinezjxzclc.supabase.co/functions/v1/inquiry-webhook
```

If unset, the form falls back to constructing the URL from
`VITE_SUPABASE_URL`, so this is optional.

## Verify

```bash
curl -X POST https://rfnopimkroinezjxzclc.supabase.co/functions/v1/inquiry-webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "form_type": "consult",
    "name": "Test User",
    "email": "test@example.com",
    "fields": { "industry": "saas", "team_size": "11-50", "budget": "15-50k", "goal": "scale AI ops" }
  }'
```

Expect `200` with `{ "id": "<uuid>", "lead_score": <0-100> }`.

## Lead scoring

Tuned per form_type. See `leadScore()` in `index.ts`. Score is stored on the
inquiry row and used by the n8n workflow's "if >= 70 then Slack/SMS" branch.
