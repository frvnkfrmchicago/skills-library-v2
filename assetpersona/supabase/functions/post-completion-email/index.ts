// deno-lint-ignore-file no-explicit-any
/**
 * AP-PLATFORM-2026-05 · Email & Drip Agent 3
 * Edge Function: post-completion-email
 *
 * Called by the client immediately after a module completion (or by a DB
 * trigger via pg_net in the future). Looks up the user's email + the just-
 * completed module's metadata, signs the payload with HMAC, and forwards
 * to n8n's post-completion-email workflow which renders + sends a templated
 * "you finished X — here's what's next" email.
 *
 * Required secrets:
 *   N8N_POST_COMPLETION_URL
 *   N8N_HMAC_SECRET
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';
import { signHmac } from '../_shared/hmac.ts';

interface PostCompletionRequest {
  module_id: string;
  /** XP earned in the completion that just happened */
  xp_earned: number;
  /** Suggested next module slug (Engagement Layer Agent 5 plugs the recommender here) */
  next_slug?: string;
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  let body: PostCompletionRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }
  if (!body.module_id) {
    return new Response(JSON.stringify({ error: 'missing_module_id' }), {
      status: 400,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  // Resolve the user from their JWT
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: auth } } }
  );
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }
  const user = userData.user;

  // Service-role for cross-table reads
  const sb = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  const [{ data: profile }, { data: moduleRow }] = await Promise.all([
    sb.from('profiles').select('display_name, email_opt_in, faceless').eq('id', user.id).single(),
    sb.from('modules').select('title, hook, slug, estimated_minutes, xp_reward, type').eq('id', body.module_id).single(),
  ]);

  if (!profile || !moduleRow) {
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  // Respect opt-in: if user hasn't opted in, return ok but don't email.
  if ((profile as any).email_opt_in !== true) {
    return new Response(JSON.stringify({ ok: true, skipped: 'no_opt_in' }), {
      status: 200,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  const n8nUrl = Deno.env.get('N8N_POST_COMPLETION_URL');
  const hmacSecret = Deno.env.get('N8N_HMAC_SECRET');
  if (!n8nUrl || !hmacSecret) {
    // No n8n configured yet — degrade silently.
    return new Response(JSON.stringify({ ok: true, skipped: 'n8n_unconfigured' }), {
      status: 200,
      headers: { ...cors, 'content-type': 'application/json' },
    });
  }

  // AP-ENGAGEMENT-LOOP-2026-05 · Lane 2 · Public Share-Card Loop
  // Append the "Share what you learned" CTA so the email completes the loop:
  // member finishes module → email lands → tap the CTA → /community/learn/
  // :slug?share=1 opens with the SharePrompt autofocused. The site URL is
  // resolved from env so staging + prod each render their own link.
  const siteUrl = (Deno.env.get('SITE_URL') ?? 'https://www.assetpersona.com').replace(/\/$/, '');
  const moduleSlug = (moduleRow as any).slug as string | undefined;
  const shareCta = moduleSlug
    ? {
        label: 'Share what you learned',
        href: `${siteUrl}/community/learn/${moduleSlug}?share=1`,
        deep_link: `/community/learn/${moduleSlug}?share=1`,
        copy:
          "One sentence on what just clicked. Lands on your feed and as a public card anyone can open.",
      }
    : null;

  const payload = JSON.stringify({
    user: { id: user.id, email: user.email, display_name: (profile as any).display_name },
    module: moduleRow,
    xp_earned: body.xp_earned,
    next_slug: body.next_slug ?? null,
    share_cta: shareCta,
    ts: new Date().toISOString(),
  });
  const sig = await signHmac(hmacSecret, payload);

  try {
    await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-asset-persona-signature': sig,
      },
      body: payload,
    });
  } catch (err) {
    console.error('post-completion forward failed:', err);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...cors, 'content-type': 'application/json' },
  });
});
