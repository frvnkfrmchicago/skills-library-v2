// deno-lint-ignore-file no-explicit-any
/**
 * AP-LAUNCH-2026-05 · Wave 2 · Capture
 * Edge Function: inquiry-webhook
 *
 * Single ingress for all consultant intake forms (consult / speaking /
 * training / marketing / general). Validates, scores, persists to the
 * `inquiries` table using service-role, then signs and POSTs the payload
 * to an n8n workflow that routes the email to Frank's Gmail by form_type.
 *
 * Deploy:
 *   supabase functions deploy inquiry-webhook
 *
 * Required secrets (set with `supabase secrets set KEY=value`):
 *   N8N_WEBHOOK_URL    — public URL of the inquiry-router n8n workflow
 *   N8N_HMAC_SECRET    — shared secret used to HMAC-sign each forwarded payload
 *   ALLOWED_ORIGIN     — production site origin (e.g. https://www.assetpersona.com)
 *
 * No client should ever call this with the service-role key. The function
 * uses SUPABASE_SERVICE_ROLE_KEY internally, which is provided automatically
 * by the Supabase platform inside Edge Functions.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';
import { signHmac } from '../_shared/hmac.ts';

type FormType = 'consult' | 'speaking' | 'training' | 'marketing' | 'general';

interface IncomingPayload {
  form_type: FormType;
  name: string;
  email: string;
  fields?: Record<string, string>;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  _hp?: string; // honeypot
}

const VALID_FORM_TYPES: FormType[] = [
  'consult',
  'speaking',
  'training',
  'marketing',
  'general',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Score 0-100. Higher = warmer lead. Tuned per form_type. */
function leadScore(p: IncomingPayload): number {
  const f = p.fields ?? {};
  let score = 30;

  // Has any contextual answer
  if (f.context || f.goal || f.outcomes || f.message || f.topic) score += 15;

  switch (p.form_type) {
    case 'consult': {
      const budget = f.budget;
      if (budget === '50k+') score += 35;
      else if (budget === '15-50k') score += 25;
      else if (budget === '5-15k') score += 15;
      else if (budget === 'open') score += 10;

      const teamSize = f.team_size;
      if (teamSize === '200+' || teamSize === '51-200') score += 10;
      else if (teamSize === '11-50') score += 5;
      break;
    }
    case 'speaking': {
      const aud = f.audience_size;
      if (aud === '1000+') score += 30;
      else if (aud === '200-1000') score += 20;
      else if (aud === '50-200') score += 10;

      const budget = f.budget;
      if (budget === '30k+') score += 20;
      else if (budget === '15-30k') score += 12;
      else if (budget === '5-15k') score += 6;
      break;
    }
    case 'training': {
      const learners = f.learner_count;
      if (learners === '200+') score += 30;
      else if (learners === '50-200') score += 20;
      else if (learners === '10-50') score += 10;
      break;
    }
    case 'marketing': {
      const budget = f.budget;
      if (budget === '50k+') score += 30;
      else if (budget === '15-50k') score += 20;
      else if (budget === '5-15k') score += 10;
      break;
    }
    case 'general':
      score += 5;
      break;
  }

  return Math.min(100, Math.max(0, score));
}

function extractMessage(p: IncomingPayload): string | null {
  const f = p.fields ?? {};
  return (
    f.goal ||
    f.context ||
    f.outcomes ||
    f.message ||
    f.topic ||
    null
  );
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  let body: IncomingPayload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // Honeypot — silently 200 if filled
  if (body._hp && body._hp.trim() !== '') {
    return new Response(JSON.stringify({ id: 'silent' }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // Validation
  const errors: string[] = [];
  if (!VALID_FORM_TYPES.includes(body.form_type)) errors.push('form_type');
  if (!body.name || body.name.trim().length < 2) errors.push('name');
  if (!body.email || !EMAIL_RE.test(body.email)) errors.push('email');
  if (errors.length) {
    return new Response(
      JSON.stringify({ error: 'validation', fields: errors }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  // Service-role client — bypasses RLS for the controlled INSERT.
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  const score = leadScore(body);
  const message = extractMessage(body);
  const ipHeader =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('cf-connecting-ip') ??
    null;
  const ip = ipHeader ? ipHeader.split(',')[0].trim() : null;
  const userAgent = req.headers.get('user-agent');

  const insertRow = {
    form_type: body.form_type,
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    company: body.fields?.company ?? body.fields?.org_name ?? null,
    phone: body.fields?.phone ?? null,
    message,
    fields: body.fields ?? {},
    lead_score: score,
    source: body.source ?? null,
    utm_source: body.utm_source ?? null,
    utm_medium: body.utm_medium ?? null,
    utm_campaign: body.utm_campaign ?? null,
    utm_term: body.utm_term ?? null,
    utm_content: body.utm_content ?? null,
    ip,
    user_agent: userAgent,
  };

  const { data, error } = await supabase
    .from('inquiries')
    .insert(insertRow)
    .select('id')
    .single();

  if (error || !data) {
    // Log to inquiries_failed so nothing is lost
    await supabase.from('inquiries_failed').insert({
      payload: body as any,
      error_message: error?.message ?? 'no_id_returned',
      source_ip: ip,
    });
    return new Response(
      JSON.stringify({ error: 'persist_failed' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  // Forward to n8n with HMAC signature (best-effort; do not fail the user
  // submission if n8n is down — the row is already saved).
  const n8nUrl = Deno.env.get('N8N_WEBHOOK_URL');
  const hmacSecret = Deno.env.get('N8N_HMAC_SECRET');
  if (n8nUrl && hmacSecret) {
    const forwardPayload = JSON.stringify({
      inquiry_id: data.id,
      ...insertRow,
      created_at: new Date().toISOString(),
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
        await supabase.from('inquiries_failed').insert({
          payload: { stage: 'n8n_forward', inquiry_id: data.id, status: fwd.status },
          error_message: `n8n returned ${fwd.status}`,
          source_ip: ip,
        });
      }
    } catch (err) {
      await supabase.from('inquiries_failed').insert({
        payload: { stage: 'n8n_forward', inquiry_id: data.id },
        error_message: err instanceof Error ? err.message : String(err),
        source_ip: ip,
      });
    }
  }

  return new Response(JSON.stringify({ id: data.id, lead_score: score }), {
    status: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
