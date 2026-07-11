/**
 * _shared/paypal.ts — PayPal REST client for Deno Edge Functions.
 *
 * PayPal has no Deno-native SDK we depend on; we call the REST API directly with
 * `fetch` (the Edge runtime's native client). This keeps the bundle tiny (cold
 * start budget, supabase-building §5) and avoids an unmaintained npm shim.
 *
 * Three responsibilities:
 *   1. OAuth2 client-credentials access token (cached in-process until ~60s
 *      before expiry) — https://developer.paypal.com/api/rest/authentication/
 *   2. Orders v2 create + capture + get —
 *      https://developer.paypal.com/docs/api/orders/v2/
 *   3. Webhook signature verification via PayPal's server-side
 *      verify-webhook-signature endpoint (there is NO local HMAC; PayPal
 *      verifies the transmission for us and returns SUCCESS/FAILURE) —
 *      https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
 *
 * SECRET DISCIPLINE (api-integrating §4, data-contract.md §9 #1/#10):
 *   - PAYPAL_CLIENT_ID is browser-safe (it ships in the PayPal JS SDK <script>
 *     src on the client) but is ALSO read here for the server OAuth2 call.
 *   - PAYPAL_CLIENT_SECRET and PAYPAL_WEBHOOK_ID are SERVER-ONLY. Read from
 *     Deno.env exclusively; never returned in any response body.
 *
 * ENVIRONMENT: PAYPAL_ENV selects the API host. "live" → api-m.paypal.com;
 * anything else (default) → api-m.sandbox.paypal.com. The board sets "live" only
 * for production. There is no hardcoded production host in any code path that
 * could fire against a sandbox secret.
 */

// ---------------------------------------------------------------------------
// Host selection.
// ---------------------------------------------------------------------------

/** Resolve the PayPal REST API base URL from PAYPAL_ENV (default: sandbox). */
export function paypalApiBase(): string {
  const env = (Deno.env.get("PAYPAL_ENV") ?? "sandbox").toLowerCase();
  return env === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

// ---------------------------------------------------------------------------
// Credentials.
// ---------------------------------------------------------------------------

interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
}

/** Read OAuth2 credentials from env. Throws (→ caller returns 500) if missing. */
function getCredentials(): PayPalCredentials {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error(
      "CONFIG_ERROR: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is not set",
    );
  }
  return { clientId, clientSecret };
}

// ---------------------------------------------------------------------------
// OAuth2 client-credentials token (cached in-process).
// ---------------------------------------------------------------------------

interface CachedToken {
  accessToken: string;
  /** epoch ms when this token should be considered stale. */
  expiresAtMs: number;
}

let tokenCache: CachedToken | null = null;

/**
 * Return a valid OAuth2 access token, fetching a new one if the cache is empty
 * or within 60s of expiry. The cache lives for the lifetime of the warm isolate
 * — across cold starts it simply re-fetches (one extra round-trip, no harm).
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && now < tokenCache.expiresAtMs) {
    return tokenCache.accessToken;
  }

  const { clientId, clientSecret } = getCredentials();
  const basic = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    // Never echo the secret. Surface only the status for server logs.
    throw new Error(`PAYPAL_AUTH_FAILED: token endpoint returned ${res.status}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  // expires_in is seconds; refresh 60s early so we never present a stale token.
  tokenCache = {
    accessToken: data.access_token,
    expiresAtMs: now + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

// ---------------------------------------------------------------------------
// Orders v2.
// ---------------------------------------------------------------------------

/** A single purchase unit's money amount (PayPal expects string values). */
export interface PayPalAmount {
  currency_code: string;
  value: string; // decimal string, e.g. "75.00"
}

export interface PayPalPurchaseUnit {
  /** Maps to our reconciliation key; appears on the order + capture. */
  custom_id?: string;
  /** Soft label shown to the payer / on statements (≤127 chars). */
  description?: string;
  amount: PayPalAmount;
}

export interface CreateOrderInput {
  purchaseUnits: PayPalPurchaseUnit[];
  /**
   * Idempotency key — PayPal honors `PayPal-Request-Id` so a retried create
   * cannot open a second order (api-integrating: retry-safe writes).
   */
  requestId: string;
}

export interface PayPalLink {
  href: string;
  rel: string;
  method?: string;
}

export interface PayPalOrder {
  id: string;
  status: string; // CREATED | APPROVED | COMPLETED | ...
  links: PayPalLink[];
  purchase_units?: Array<{
    custom_id?: string;
    amount?: PayPalAmount;
    payments?: {
      captures?: Array<{ id: string; status: string; amount?: PayPalAmount }>;
    };
  }>;
}

/** Cents → PayPal decimal string ("7500" → "75.00"). */
export function centsToValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Create an Orders v2 order with intent CAPTURE. The browser then renders the
 * PayPal buttons against this order id and the payer approves; capture happens
 * on approval (client SDK) and is confirmed server-side by the webhook.
 *
 * We do NOT pass a redirect/return URL here because the integration uses the
 * JS SDK button flow (createOrder → onApprove), not the redirect flow.
 */
export async function createOrder(input: CreateOrderInput): Promise<PayPalOrder> {
  const token = await getAccessToken();
  const res = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": input.requestId,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: input.purchaseUnits,
    }),
  });

  if (!res.ok) {
    const detail = await safeErrorName(res);
    throw new Error(`PAYPAL_ORDER_CREATE_FAILED: ${res.status} ${detail}`);
  }
  return await res.json() as PayPalOrder;
}

/**
 * Capture an approved order (server-side capture path). Used when the client
 * asks the server to finalize rather than capturing in the browser. Idempotent
 * via PayPal-Request-Id.
 */
export async function captureOrder(
  orderId: string,
  requestId: string,
): Promise<PayPalOrder> {
  const token = await getAccessToken();
  const res = await fetch(
    `${paypalApiBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": requestId,
      },
    },
  );

  if (!res.ok) {
    const detail = await safeErrorName(res);
    throw new Error(`PAYPAL_ORDER_CAPTURE_FAILED: ${res.status} ${detail}`);
  }
  return await res.json() as PayPalOrder;
}

/** Read an order back (used by reconciliation to resolve custom_id/amount). */
export async function getOrder(orderId: string): Promise<PayPalOrder> {
  const token = await getAccessToken();
  const res = await fetch(
    `${paypalApiBase()}/v2/checkout/orders/${orderId}`,
    { headers: { "Authorization": `Bearer ${token}` } },
  );
  if (!res.ok) {
    const detail = await safeErrorName(res);
    throw new Error(`PAYPAL_ORDER_GET_FAILED: ${res.status} ${detail}`);
  }
  return await res.json() as PayPalOrder;
}

// ---------------------------------------------------------------------------
// Webhook signature verification (PayPal-side, the FIRST op in the webhook).
// ---------------------------------------------------------------------------

/**
 * The five transmission headers PayPal sends on every webhook delivery. The
 * verify endpoint needs all five plus our PAYPAL_WEBHOOK_ID and the parsed
 * event body. Header names are case-insensitive on the wire; we read the
 * canonical lowercase forms.
 */
export interface PayPalWebhookHeaders {
  transmissionId: string | null;
  transmissionTime: string | null;
  certUrl: string | null;
  authAlgo: string | null;
  transmissionSig: string | null;
}

/** Pull the five PayPal transmission headers off the inbound request. */
export function readWebhookHeaders(req: Request): PayPalWebhookHeaders {
  const h = req.headers;
  return {
    transmissionId: h.get("paypal-transmission-id"),
    transmissionTime: h.get("paypal-transmission-time"),
    certUrl: h.get("paypal-cert-url"),
    authAlgo: h.get("paypal-auth-algo"),
    transmissionSig: h.get("paypal-transmission-sig"),
  };
}

/** True only when all five transmission headers are present. */
export function hasAllWebhookHeaders(h: PayPalWebhookHeaders): boolean {
  return Boolean(
    h.transmissionId &&
      h.transmissionTime &&
      h.certUrl &&
      h.authAlgo &&
      h.transmissionSig,
  );
}

/**
 * Verify a webhook delivery against PayPal. PayPal performs the verification on
 * its side and returns SUCCESS/FAILURE. We pass the PARSED event object (PayPal's API
 * requires `webhook_event` as JSON, not the raw string) — but we only parse
 * AFTER capturing the raw body and AFTER confirming all headers exist, and we
 * treat any non-SUCCESS (including a non-200 from the verify call) as a hard
 * reject so no unverified delivery can reach a DB write.
 *
 * Returns true ONLY on an explicit { verification_status: "SUCCESS" }.
 */
export async function verifyWebhookSignature(
  headers: PayPalWebhookHeaders,
  parsedEvent: unknown,
): Promise<boolean> {
  const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
  if (!webhookId) {
    throw new Error("CONFIG_ERROR: PAYPAL_WEBHOOK_ID is not set");
  }
  if (!hasAllWebhookHeaders(headers)) return false;

  const token = await getAccessToken();
  const res = await fetch(
    `${paypalApiBase()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transmission_id: headers.transmissionId,
        transmission_time: headers.transmissionTime,
        cert_url: headers.certUrl,
        auth_algo: headers.authAlgo,
        transmission_sig: headers.transmissionSig,
        webhook_id: webhookId,
        webhook_event: parsedEvent,
      }),
    },
  );

  // Any non-200 from the verify call → treat as unverified (fail closed).
  if (!res.ok) {
    console.error(`verify-webhook-signature returned ${res.status}`);
    return false;
  }
  const data = await res.json() as { verification_status?: string };
  return data.verification_status === "SUCCESS";
}

// ---------------------------------------------------------------------------
// Internal: extract a safe error name from a failed PayPal response.
// ---------------------------------------------------------------------------

/**
 * Pull PayPal's machine `name`/`details[].issue` from an error body for server
 * logs WITHOUT surfacing any payer PII. Returns a short token, never the raw
 * body. Falls back to "unknown".
 */
async function safeErrorName(res: Response): Promise<string> {
  try {
    const body = await res.json() as {
      name?: string;
      details?: Array<{ issue?: string }>;
    };
    const issue = body.details?.[0]?.issue;
    return [body.name, issue].filter(Boolean).join(":") || "unknown";
  } catch {
    return "unknown";
  }
}
