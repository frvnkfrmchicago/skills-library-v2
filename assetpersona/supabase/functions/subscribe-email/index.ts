// deno-lint-ignore-file no-explicit-any
/**
 * AP-PLATFORM-2026-05 · Email & Drip Agent 3
 * Edge Function: subscribe-email
 *
 * Inserts a row into email_subscribers (service-role bypasses the admin-only
 * RLS) and forwards to n8n's welcome-drip workflow which fires the day-0
 * confirm + day-3 nudge + weekly digest enrollment.
 *
 * Honeypot, simple email regex, dedupe by unique constraint on email.
 *
 * Required secrets:
 *   N8N_WELCOME_DRIP_URL  (n8n webhook URL of the welcome-drip workflow)
 *   N8N_HMAC_SECRET       (shared with n8n)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';
import { signHmac } from '../_shared/hmac.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeBody {
  email: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  _hp?: string;
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  let body: SubscribeBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  if (body._hp && body._hp.trim() !== '') {
    return new Response(JSON.stringify({ ok: true, silent: true }), {
      status: 200,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  if (!body.email || !EMAIL_RE.test(body.email)) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), {
      status: 400,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  const ip =
    (req.headers.get('x-forwarded-for') ?? req.headers.get('cf-connecting-ip') ?? '').split(',')[0].trim() ||
    null;
  const ua = req.headers.get('user-agent') ?? null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  const row = {
    email: body.email.trim().toLowerCase(),
    source: body.source ?? null,
    utm_source: body.utm_source ?? null,
    utm_medium: body.utm_medium ?? null,
    utm_campaign: body.utm_campaign ?? null,
    ip,
    user_agent: ua,
    status: 'active',
  };

  const { error: insertErr } = await supabase
    .from('email_subscribers')
    .upsert(row, { onConflict: 'email' });

  if (insertErr) {
    console.error('email_subscribers upsert error:', insertErr);
    return new Response(JSON.stringify({ error: 'persist_failed' }), {
      status: 500,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  // Forward to n8n welcome-drip (best-effort; subscriber is saved either way)
  const n8nUrl = Deno.env.get('N8N_WELCOME_DRIP_URL');
  const hmacSecret = Deno.env.get('N8N_HMAC_SECRET');
  if (n8nUrl && hmacSecret) {
    const payload = JSON.stringify({ ...row, ts: new Date().toISOString() });
    try {
      const sig = await signHmac(hmacSecret, payload);
      await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-asset-persona-signature': sig,
        },
        body: payload,
      });
    } catch (err) {
      console.error('welcome-drip forward failed:', err);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...cors, 'content-type': 'application/json' },
  });
});
