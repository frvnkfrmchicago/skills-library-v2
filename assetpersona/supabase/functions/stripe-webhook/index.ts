// deno-lint-ignore-file no-explicit-any
/**
 * AP-MODERNIZE-2026-05 · Wave 5 · Modernize Upgrade Flow
 * Edge Function: stripe-webhook
 *
 * Why this exists:
 *   Asset Persona's checkout flow sends users to a Stripe Payment Link,
 *   the payment succeeds, the visitor returns to the site... and the app
 *   still thinks they are on the free tier because nothing has told the
 *   database otherwise. This function is the missing piece: Stripe POSTs
 *   here, we verify the signature, look up the right profile, and flip
 *   `profile.tier`.
 *
 * Plain meaning:
 *   "Stripe pings this URL whenever something happens to a subscription.
 *    We check it's really Stripe (signature), make sure we haven't already
 *    handled this exact event (idempotency), then update the user's plan
 *    in the database."
 *
 * Deploy:
 *   supabase functions deploy stripe-webhook
 *
 * Required secrets (Frank credential):
 *   STRIPE_WEBHOOK_SECRET           — whsec_... from Stripe Dashboard
 *   STRIPE_PRICE_COHORT             — price_... for monthly Cohort
 *   STRIPE_PRICE_COHORT_YEARLY      — price_... for yearly Cohort
 *   STRIPE_PRICE_INSIDERS           — price_... for monthly Insiders
 *   STRIPE_PRICE_INSIDERS_YEARLY    — price_... for yearly Insiders
 *   STRIPE_PRICE_PRIVATE            — price_... for Private Lessons
 *
 * The Supabase platform provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * automatically inside Edge Functions.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';
import { mapPriceIdToTier, verifyStripeSignature } from '../_shared/stripe.ts';

type StripeEvent = {
  id: string;
  type: string;
  data: { object: any };
};

function jsonResponse(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

/** Pull a `price` id off whatever shape Stripe sent us. */
function extractPriceId(eventObject: any): string | null {
  if (!eventObject || typeof eventObject !== 'object') return null;
  // Subscription event shape: items.data[0].price.id
  const items = eventObject?.items?.data;
  if (Array.isArray(items) && items.length > 0) {
    const p = items[0]?.price?.id;
    if (typeof p === 'string') return p;
  }
  // Checkout session shape: line_items expanded OR `plan.id` / `price` direct.
  const direct = eventObject?.plan?.id ?? eventObject?.price ?? null;
  if (typeof direct === 'string') return direct;
  return null;
}

/** Find the profile this event belongs to. Tries multiple lookups so we don't
 *  miss legitimate paid customers when only one of the identifiers is set. */
async function findUserId(
  supabase: any,
  eventObject: any,
): Promise<string | null> {
  // 1) checkout.session.completed exposes `client_reference_id` — we set that
  //    to profile.id when the browser opens the Payment Link.
  const clientRef = eventObject?.client_reference_id;
  if (typeof clientRef === 'string' && clientRef.length > 0) return clientRef;

  // 2) Try subscription_id → existing profile (handles update/delete events).
  const subId = eventObject?.subscription ?? eventObject?.id;
  if (typeof subId === 'string' && subId.startsWith('sub_')) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_subscription_id', subId)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  // 3) Try customer_id → existing profile.
  const customerId = eventObject?.customer;
  if (typeof customerId === 'string' && customerId.startsWith('cus_')) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  // 4) Last-resort: email match.
  const email = (
    eventObject?.customer_email ??
    eventObject?.customer_details?.email ??
    null
  );
  if (typeof email === 'string' && email.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email.trim())
      .maybeSingle();
    if (data?.id) return data.id;
  }

  return null;
}

function periodEndToTimestamp(value: any): string | null {
  if (typeof value !== 'number') return null;
  return new Date(value * 1000).toISOString();
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!secret) {
    console.error('stripe-webhook: STRIPE_WEBHOOK_SECRET is not set');
    return jsonResponse({ error: 'server_misconfigured' }, 500, cors);
  }

  // We MUST read the raw body, not parse JSON — the signature is over the
  // original bytes. Parsing and re-stringifying changes whitespace and
  // breaks the signature comparison.
  const rawBody = await req.text();
  const sigHeader = req.headers.get('stripe-signature');
  const ok = await verifyStripeSignature(rawBody, sigHeader, secret);
  if (!ok) {
    console.warn('stripe-webhook: signature verification failed');
    return jsonResponse({ error: 'invalid_signature' }, 400, cors);
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400, cors);
  }

  if (!event?.id || !event?.type) {
    return jsonResponse({ error: 'invalid_event' }, 400, cors);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  // Idempotency: have we already processed this exact event?
  const { data: existing } = await supabase
    .from('subscription_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle();

  if (existing?.id) {
    return jsonResponse({ received: true, duplicate: true }, 200, cors);
  }

  const eventObject = event.data?.object ?? {};
  const userId = await findUserId(supabase, eventObject);

  // Handle the specific events we care about. Anything else is logged for
  // audit only and acknowledged with 200 so Stripe doesn't keep retrying.
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        if (!userId) break;
        const priceId = extractPriceId(eventObject) ?? eventObject?.metadata?.price_id ?? null;
        const tier = mapPriceIdToTier(priceId);
        const update: Record<string, unknown> = {
          stripe_customer_id: eventObject?.customer ?? null,
          stripe_subscription_id: eventObject?.subscription ?? null,
          subscription_status: 'active',
        };
        if (tier) update.tier = tier;
        await supabase.from('profiles').update(update).eq('id', userId);
        break;
      }
      case 'customer.subscription.updated': {
        if (!userId) break;
        const priceId = extractPriceId(eventObject);
        const tier = mapPriceIdToTier(priceId);
        const update: Record<string, unknown> = {
          stripe_customer_id: eventObject?.customer ?? null,
          stripe_subscription_id: eventObject?.id ?? null,
          subscription_status: eventObject?.status ?? null,
          current_period_end: periodEndToTimestamp(eventObject?.current_period_end),
        };
        if (tier) update.tier = tier;
        await supabase.from('profiles').update(update).eq('id', userId);
        break;
      }
      case 'customer.subscription.deleted': {
        if (!userId) break;
        await supabase
          .from('profiles')
          .update({
            tier: 'assetClass',
            stripe_subscription_id: null,
            subscription_status: 'canceled',
          })
          .eq('id', userId);
        break;
      }
      case 'invoice.payment_failed': {
        if (!userId) break;
        await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', userId);
        break;
      }
      default:
        // Unknown event — audit it, return 200, do nothing else.
        break;
    }
  } catch (err) {
    console.error('stripe-webhook: handler failed', event.type, err);
    // Continue to audit insert so we still record the attempt.
  }

  // Always write the audit row (unique constraint on stripe_event_id provides
  // the second layer of idempotency).
  const { error: auditError } = await supabase
    .from('subscription_events')
    .insert({
      stripe_event_id: event.id,
      stripe_event_type: event.type,
      user_id: userId,
      payload: event as any,
    });

  if (auditError && !auditError.message.includes('duplicate key')) {
    console.error('stripe-webhook: audit insert failed', auditError);
  }

  return jsonResponse({ received: true }, 200, cors);
});
