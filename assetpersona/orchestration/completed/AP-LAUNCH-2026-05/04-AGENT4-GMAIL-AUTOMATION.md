# Agent 4 — Gmail Routing & Automations
Status: assigned
Wave: 2 (Capture)
% on completion: 65%
Owner: Codex (cloud, parallel)
Single source of truth: this file only.

## Explainer
Today nothing routes form submissions to Frank's inbox. This lane wires the Supabase Edge Function that receives inquiries from Agent 3's forms, validates them, writes the `inquiries` row, and posts an HMAC-signed payload to an n8n workflow that branches by `form_type`, sends a templated Gmail to flawrence.d@gmail.com, sends a templated auto-reply to the submitter, mirrors the row into a Google Sheet, and notifies Slack/SMS when `lead_score >= 70`.

## TL;DR
- Edge Function `inquiry-webhook` is the single ingress for all form submissions.
- HMAC signing prevents replay/forgery between the Edge Function and n8n.
- Form-type branching gives Frank a clean inbox: subject lines and body templates differ per service.
- Auto-reply confirms receipt and sets expectations.
- Google Sheet mirror gives an out-of-app CRM view.
- A second n8n workflow runs nudge sends from `user_events` for behavior-triggered everboarding (no time-based blasts).

| Field | Value |
|---|---|
| Mission | Forms in → Frank's Gmail out — reliably and with structure |
| Owned scope | `supabase/functions/inquiry-webhook/index.ts` (new), `supabase/functions/inquiry-webhook/types.ts`, `n8n/workflows/inquiry-router.json` (new), `n8n/workflows/engagement-nudges.json` (new), `supabase/functions/_shared/hmac.ts` (new) |
| Do not touch | Frontend forms (Agent 3 owns), DB schema (Agent 1 owns) |
| Inputs | Agent 1 completed evidence (final inquiries shape, RLS rules), Agent 3 completed evidence (form payload shape) |
| Skills required | `.claude/skills/n8n-automating/SKILL.md`, `.claude/skills/api-integrating/SKILL.md`, `.claude/skills/supabase-building/SKILL.md` |
| Validation commands | `supabase functions deploy inquiry-webhook`, curl test with valid + invalid HMAC, n8n test execution per branch |
| Done criteria | Submitting any of the 4 form types end-to-end lands a row in `inquiries`, fires Gmail to Frank with form-type subject, sends auto-reply, mirrors to Google Sheet — verified with real submission |
| Output contract | Rewrite this file with completion evidence per `99-EVIDENCE-CONTRACT.md` |

## Build Tasks

### Edge Function: `inquiry-webhook`
- [ ] POST handler accepts JSON `{ formType, name, email, ...fields, utm }`.
- [ ] Validate per form_type schema (Zod or hand-rolled).
- [ ] Compute lead_score (simple rule table per form_type).
- [ ] INSERT into `inquiries` using service-role (server-side only).
- [ ] Sign payload with HMAC-SHA256 + shared secret from `supabase secrets`.
- [ ] POST signed payload to `N8N_WEBHOOK_URL` env var.
- [ ] Return 200 with inquiry id; 400 on validation; 5xx routes to error log.
- [ ] Rate limit per IP (10/min).
- [ ] Honeypot field rejected silently.

### n8n Workflow: `inquiry-router.json`
```
[Webhook] (verify HMAC)
   → [Function: enrich + score]
       → [IF formType] ─┬─ consult   → Gmail template A → flawrence.d@gmail.com
                        ├─ speaking  → Gmail template B
                        ├─ training  → Gmail template C
                        ├─ marketing → Gmail template D
                        └─ general   → Gmail template E
       → [Gmail auto-reply] (form-type template, BCC frank)
       → [Google Sheet append] — single sheet, columns match inquiries table
       → [IF lead_score >= 70] → [Slack/SMS notify]
   → [Error branch] → log to inquiries_failed sheet
```

### n8n Workflow: `engagement-nudges.json`
- [ ] Cron daily.
- [ ] Query Supabase: users where `onboarding_step < 3` AND signup > 3 days old (use `created_at` math, not language).
- [ ] Query: users with 0 `user_events` of type `feed_post` in last 7 days.
- [ ] Send Gmail nudge templated by gap.
- [ ] Insert `user_events` row `{ event_type: 'nudge_sent', payload: {...} }` to prevent re-sending.

## Validation Plan

| Check | Command | Pass condition |
|---|---|---|
| HMAC valid path | curl signed POST | 200 with id |
| HMAC invalid | curl wrong sig | 401 |
| Branching by form_type | submit each of 5 form_types | each lands in correct Gmail template |
| Auto-reply sent | check submitter inbox | templated reply received |
| Google Sheet mirrored | open sheet | new row matches |
| Lead-score path | submit high-score test | Slack/SMS fired |
| Error branch | force a failure | logged to failed sheet, no crash |

## Secrets Required (Supabase)

- `N8N_WEBHOOK_URL`
- `N8N_HMAC_SECRET`
- `INQUIRIES_INTERNAL_API_KEY` (optional dual-auth)

## Completion Rule

Rewrite this file with completion evidence. No time language.
