/**
 * Lane J e2e — PayPal webhook verify-signature-FIRST (data-contract.md §9 #5;
 * 99-EVIDENCE-CONTRACT.md G3). Ported from the removed Stripe webhook-signature
 * spec to the PayPal money layer (dossier Dimension 4).
 *
 * The hard invariant under test: `paypal-webhook` calls PayPal's server-side
 * verify-webhook-signature as the FIRST trust operation and writes NOTHING before
 * a SUCCESS verification. A delivery that is missing the five PayPal transmission
 * headers, or carries a forged signature, must be rejected (HTTP 400) and must
 * leave zero rows in paypal_webhook_events.
 *
 * BLOCKED on the credential boundary: this spec is runnable only once the board
 * deploys the function and registers the webhook. It self-skips until
 * E2E_WEBHOOK_URL is set, so the suite stays green in CI without a live backend.
 *
 *   export E2E_WEBHOOK_URL=https://<project-ref>.functions.supabase.co/paypal-webhook
 *   npm run e2e
 *
 * Verify-no-write follow-up (manual / board, against the live DB):
 *   select count(*) from public.paypal_webhook_events where id = 'WH-FORGED-TEST';
 *   -- must be 0: a forged delivery is never recorded.
 *
 * Source under test: supabase/functions/paypal-webhook/index.ts (lines 558-585 —
 * raw body -> headers -> parse -> verifyWebhookSignature -> 400 before any write).
 */
import { test, expect } from "@playwright/test";

const WEBHOOK_URL = process.env.E2E_WEBHOOK_URL;

/** A minimal, well-formed PayPal capture-completed event body (forged). */
const FORGED_EVENT = JSON.stringify({
  id: "WH-FORGED-TEST",
  event_type: "PAYMENT.CAPTURE.COMPLETED",
  resource: { id: "CAP-FORGED", custom_id: "dues:00000000-0000-0000-0000-000000000000:plan" },
});

test("missing PayPal transmission headers -> 400 (no write)", async ({ request }) => {
  test.skip(!WEBHOOK_URL, "E2E_WEBHOOK_URL not set (function not deployed)");
  // No paypal-transmission-id / -time / -sig / -cert-url / auth-algo headers.
  const res = await request.post(WEBHOOK_URL, {
    headers: { "Content-Type": "application/json" },
    data: FORGED_EVENT,
  });
  // verify returns false when any of the five headers is absent -> 400.
  expect(res.status()).toBe(400);
});

test("forged PayPal signature -> 400 (no write)", async ({ request }) => {
  test.skip(!WEBHOOK_URL, "E2E_WEBHOOK_URL not set (function not deployed)");
  // All five headers present but signature is bogus -> PayPal returns FAILURE.
  const res = await request.post(WEBHOOK_URL, {
    headers: {
      "Content-Type": "application/json",
      "paypal-transmission-id": "00000000-0000-0000-0000-000000000000",
      "paypal-transmission-time": "2026-01-01T00:00:00Z",
      "paypal-cert-url": "https://api.sandbox.paypal.com/forged-cert",
      "paypal-auth-algo": "SHA256withRSA",
      "paypal-transmission-sig": "Zm9yZ2VkLXNpZ25hdHVyZS1ub3QtdmFsaWQ=",
    },
    data: FORGED_EVENT,
  });
  // PayPal verify-webhook-signature returns verification_status != SUCCESS -> 400.
  expect(res.status()).toBe(400);
  // Manual follow-up (board): SELECT count(*) FROM paypal_webhook_events
  // WHERE id='WH-FORGED-TEST' must be 0 — the forged event must not be recorded.
});

test("GET on the webhook endpoint is not allowed", async ({ request }) => {
  test.skip(!WEBHOOK_URL, "E2E_WEBHOOK_URL not set (function not deployed)");
  const res = await request.get(WEBHOOK_URL);
  // The handler returns 405 for non-POST; a gateway may surface 400/401 first.
  expect([405, 400, 401]).toContain(res.status());
});

test("malformed JSON body -> 400 before any write", async ({ request }) => {
  test.skip(!WEBHOOK_URL, "E2E_WEBHOOK_URL not set (function not deployed)");
  const res = await request.post(WEBHOOK_URL, {
    headers: { "Content-Type": "application/json" },
    data: "{ not valid json",
  });
  // Parse failure short-circuits to 400 (still no DB write).
  expect([400, 405]).toContain(res.status());
});
