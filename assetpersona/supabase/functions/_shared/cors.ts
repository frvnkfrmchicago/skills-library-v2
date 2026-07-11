/**
 * Shared CORS headers for Asset Persona Edge Functions.
 *
 * Form submissions come from the public site (browser fetch). The site origin
 * is allowed at runtime via env var ALLOWED_ORIGIN (set per environment with
 * `supabase secrets set ALLOWED_ORIGIN=https://www.assetpersona.com`).
 */
export function corsHeaders(req: Request): Record<string, string> {
  const allowed = Deno.env.get('ALLOWED_ORIGIN') || '*';
  const origin = req.headers.get('origin') ?? '';

  const allowOrigin =
    allowed === '*' || allowed.split(',').some((a) => a.trim() === origin)
      ? origin || allowed
      : allowed.split(',')[0].trim();

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}
