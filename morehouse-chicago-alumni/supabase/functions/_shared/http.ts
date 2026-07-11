/**
 * _shared/http.ts — response envelope + CORS helpers shared by both payment
 * Edge Functions.
 *
 * Response shape follows backend-hardening §1 (single envelope across all
 * endpoints):
 *   success: { order_id, status, approve_url }         (paypal-checkout)
 *   error:   { error: "<CODE>", message?: "<human>" }  (every failure)
 *
 * paypal-checkout returns fields at the TOP LEVEL (not nested under `data`):
 * `order_id` for the PayPal JS SDK button flow (`createOrder` resolves to it),
 * `approve_url` for the redirect fallback. Errors are returned as
 * `{ error: "<CODE>" }`. The exact shape is the seam documented in
 * docs/payment-contract-paypal.md that the page lanes build against.
 */

/**
 * CORS for browser-invoked functions. The Supabase JS client
 * (`functions.invoke`) sends `authorization`, `apikey`, and
 * `content-type` headers and performs a preflight OPTIONS request.
 *
 * Origin is intentionally `*` here ONLY because:
 *  - these endpoints carry no cookies/session (no credentials mode),
 *  - donation is deliberately anonymous,
 *  - all privileged writes happen webhook-side under the service role, gated by
 *    PayPal's verify-webhook-signature — never by Origin.
 * If the board wants to lock the browser surface to the canonical site origin,
 * set ALLOWED_ORIGIN in the function env and this helper will honor it.
 */
export function corsHeaders(req: Request): Record<string, string> {
  const configured = Deno.env.get("ALLOWED_ORIGIN");
  const requestOrigin = req.headers.get("origin");
  const allowOrigin = configured && configured.length > 0
    ? configured
    : (requestOrigin ?? "*");

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

/** JSON success/passthrough response with CORS + JSON content type. */
export function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json",
    },
  });
}

/**
 * Error envelope. `code` is a stable machine string (e.g. MEMBER_NOT_BILLABLE);
 * `message` is an optional human string. Never leak raw PayPal/DB errors.
 */
export function errorResponse(
  req: Request,
  code: string,
  status: number,
  message?: string,
): Response {
  const body: { error: string; message?: string } = { error: code };
  if (message) body.message = message;
  return jsonResponse(req, body, status);
}

/** Preflight handler — returns a 204 with CORS headers for OPTIONS. */
export function handleOptions(req: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}
