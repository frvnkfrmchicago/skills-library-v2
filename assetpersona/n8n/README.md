# n8n Workflows — Asset Persona

Importable workflow JSONs for the AP-LAUNCH-2026-05 packet.

## Workflows

| File | Wave | Purpose |
|---|---|---|
| `workflows/inquiry-router.json` | Wave 2 | Receives HMAC-signed payload from `inquiry-webhook` Edge Function. Branches by `form_type`, sends Frank a templated Gmail per pathway, sends auto-reply to submitter, mirrors row to Google Sheet, alerts Slack on hot leads (score ≥ 70). |
| `workflows/engagement-nudges.json` | Wave 3 | Daily cron. Finds users stuck on a specific onboarding step, sends a step-specific Gmail nudge, logs `nudge_sent` to `user_events` so it doesn't repeat. |

## Import

1. n8n → **Workflows** → **Import from File** → pick the JSON.
2. Open the imported workflow.
3. Connect credentials:
   - **Gmail OAuth2** for every Gmail node.
   - **Slack** for the hot-lead alert (in `inquiry-router`).
   - **Google Sheets OAuth2** for the CRM mirror.
4. Replace placeholders:
   - In `inquiry-router.json` → `Google Sheet — CRM Mirror` node → set `documentId` to your real Google Sheet ID.
5. Set workflow env vars in n8n (Settings → Variables) or instance env:
   - `N8N_HMAC_SECRET` (must match `supabase secrets set N8N_HMAC_SECRET=...`)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (for `engagement-nudges` Postgres RPC + user_events insert)
6. Activate the workflows.
7. Copy the public webhook URL of `inquiry-router` and run:
   ```bash
   supabase secrets set N8N_WEBHOOK_URL=<the-webhook-url>
   ```

## Postgres RPC required for engagement-nudges

Add this function to your Supabase project (paste in dashboard SQL editor):

```sql
CREATE OR REPLACE FUNCTION public.find_stale_onboarders(
  min_age_days int DEFAULT 3,
  max_step int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  display_name text,
  email text,
  onboarding_step int,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.display_name,
    u.email,
    p.onboarding_step,
    u.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.onboarding_step < max_step
    AND u.created_at < (now() - make_interval(days => min_age_days))
    AND p.email_opt_in = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_events e
      WHERE e.user_id = p.id
        AND e.event_type = 'nudge_sent'
        AND e.created_at > (now() - interval '7 days')
    )
  LIMIT 100;
$$;
```

## Test

After importing `inquiry-router`:

1. Click **Execute Workflow** in n8n.
2. From a separate terminal:
   ```bash
   curl -X POST https://rfnopimkroinezjxzclc.supabase.co/functions/v1/inquiry-webhook \
     -H 'Content-Type: application/json' \
     -d '{"form_type":"consult","name":"Test","email":"you@yourdomain.com","fields":{"industry":"saas","team_size":"11-50","budget":"15-50k","goal":"test"}}'
   ```
3. Check: Gmail (Frank), Gmail (auto-reply), Google Sheet new row, Slack message if score ≥ 70.

## Branch handling

- HMAC mismatch → workflow throws in `Verify HMAC` node, returns 500. Edge Function logs to `inquiries_failed`.
- Gmail / Sheet / Slack node failure → use n8n's per-node "Continue On Fail" + connect to an Error Trigger workflow if you want centralized failure logging.
