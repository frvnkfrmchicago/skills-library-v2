/**
 * Shared Stripe helpers for Asset Persona Edge Functions.
 *
 * Two things live here:
 *   1. verifyStripeSignature — hand-rolled HMAC-SHA256 verifier for the
 *      `Stripe-Signature` header. The project's existing `hmac.ts` is for
 *      outbound n8n signing and uses a hex-encoded raw signature. Stripe's
 *      scheme is its own: a header that looks like
 *        t=1697500000,v1=<hex_sig>,v0=<hex_sig>
 *      and the signing payload is `${timestamp}.${rawBody}`.
 *      We compute HMAC-SHA256 of the signing payload with the webhook
 *      secret and compare in constant time to any `v1=` entry.
 *
 *   2. mapPriceIdToTier — converts a Stripe `price` id from a checkout
 *      session line item into one of the four tier ids the app uses.
 *      The four tiers (`cohort`, `cohortYearly`, `insiders`,
 *      `insidersYearly`, `privateLessons`) map by env var.
 *
 * Plain meaning:
 *   - Stripe sends a signature header so we know the POST really came from
 *     Stripe. The verifier proves it. If the proof fails, we return 400.
 *   - The price-to-tier map tells us which plan the buyer just bought so
 *     we can flip `profile.tier` to the correct value.
 *
 * Reference:
 *   https://stripe.com/docs/webhooks/signatures
 */

const encoder = new TextEncoder();

/* -----------------------------------------------------------------------------
 * Signature verification
 * -------------------------------------------------------------------------- */

interface ParsedHeader {
  timestamp: number;
  signatures: string[];
}

function parseStripeSignatureHeader(header: string): ParsedHeader | null {
  // Example: t=1697500000,v1=abc...,v0=def...
  const parts = header.split(',').map((p) => p.trim());
  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split('=', 2);
    if (!key || !value) continue;
    if (key === 't') {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) timestamp = parsed;
    } else if (key === 'v1') {
      signatures.push(value);
    }
  }

  if (timestamp === null || signatures.length === 0) return null;
  return { timestamp, signatures };
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verify a Stripe-Signature header against a raw request body.
 *
 * @param rawBody  The exact bytes of the request body. MUST be the unparsed
 *                 string. JSON.parse() and re-stringify changes byte content
 *                 and signature verification will fail.
 * @param header   The full value of the `Stripe-Signature` request header.
 * @param secret   The webhook signing secret (`whsec_...`).
 * @param tolerance  Maximum age of the signature in seconds. Defaults to 300
 *                   (5 minutes), Stripe's published guidance.
 */
export async function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  tolerance = 300,
): Promise<boolean> {
  if (!header || !secret) return false;

  const parsed = parseStripeSignatureHeader(header);
  if (!parsed) return false;

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - parsed.timestamp) > tolerance) return false;

  const signedPayload = `${parsed.timestamp}.${rawBody}`;
  const expected = await hmacSha256Hex(secret, signedPayload);

  for (const candidate of parsed.signatures) {
    if (constantTimeEqual(candidate, expected)) return true;
  }
  return false;
}

/* -----------------------------------------------------------------------------
 * Price ID -> tier mapping
 * -------------------------------------------------------------------------- */

export type StudyhallTier =
  | 'assetClass'
  | 'cohort'
  | 'cohortYearly'
  | 'insiders'
  | 'insidersYearly'
  | 'privateLessons';

/**
 * Map a Stripe price ID (or full Payment Link URL stem) to a tier id.
 *
 * The mapping is sourced from env vars so the same code works against test
 * and live Stripe. Each env var can hold either:
 *   - a Stripe Price ID (e.g. `price_123`), which is what subscription
 *     webhooks expose, or
 *   - the full Payment Link URL (e.g. `https://buy.stripe.com/abc`), which is
 *     what the browser uses to checkout. We accept either and pattern-match.
 *
 * If no env var matches, returns null and the caller logs an audit row
 * without flipping the tier.
 */
export function mapPriceIdToTier(priceId: string | null | undefined): StudyhallTier | null {
  if (!priceId) return null;

  const candidates: Array<[StudyhallTier, string | undefined]> = [
    ['cohortYearly', Deno.env.get('STRIPE_PRICE_COHORT_YEARLY')],
    ['cohort', Deno.env.get('STRIPE_PRICE_COHORT')],
    ['insidersYearly', Deno.env.get('STRIPE_PRICE_INSIDERS_YEARLY')],
    ['insiders', Deno.env.get('STRIPE_PRICE_INSIDERS')],
    ['privateLessons', Deno.env.get('STRIPE_PRICE_PRIVATE')],
  ];

  for (const [tier, configured] of candidates) {
    if (configured && configured.length > 0 && configured === priceId) {
      return tier;
    }
  }
  return null;
}
