/**
 * paypal-webhook — Supabase Edge Function (Deno/TypeScript)
 *
 * Receives PayPal webhook events and reconciles them into the membership/payment
 * tables. ORDER OF OPERATIONS IS A HARD GATE (data-contract.md §9 #5):
 *
 *   1. Read the RAW request body as text (the signed payload must be captured
 *      before parsing).
 *   2. Read the five PayPal transmission headers; if any are missing → 400.
 *   3. verifyWebhookSignature(headers, parsedEvent) — PayPal's server-side
 *      verify-webhook-signature — as the FIRST trust operation. On a non-SUCCESS
 *      result: return 400, NO write has occurred.
 *   4. Idempotency: check paypal_webhook_events for event.id; if seen, 200 and
 *      stop. Otherwise insert the id, then process. (Unique PK on the table is
 *      the race-condition backstop.)
 *   5. Reconcile inside a switch over the PayPal event types we handle.
 *
 * PayPal verifies the signature on its side (no local HMAC) and returns
 * SUCCESS/FAILURE; we parse the JSON body only AFTER capturing the raw text, and
 * the verify call needs the parsed `webhook_event`. We still never write before
 * a SUCCESS verification.
 *
 * All writes use the service-role client (RLS-bypassing) — payments and
 * paypal_webhook_events are service-role-only by RLS policy.
 *
 * Reconciliation key: every order we create stamps `custom_id` as
 * `<purpose>:<domain-id>[:<aux>]`. Captures and refunds carry that custom_id, so
 * we branch on it without trusting any client input.
 *
 * Skills: api-integrating, backend-hardening, security-auditing
 * Librarians: api-integration-librarian, backend-librarian, security-librarian
 *
 * Credential boundary: NOT deployed here. The board deploys it, sets
 * PAYPAL_WEBHOOK_ID from the Dashboard webhook's id, and registers the endpoint
 * URL. See docs/payment-contract-paypal.md "Remaining gaps".
 */

import {
  getOrder,
  readWebhookHeaders,
  verifyWebhookSignature,
} from "../_shared/paypal.ts";
import { getServiceClient, type SupabaseClient } from "../_shared/supabase.ts";
import type { DuesStatus, PaymentStatus } from "../_shared/types.ts";

// ---------------------------------------------------------------------------
// Small helpers.
// ---------------------------------------------------------------------------

const nowISO = () => new Date().toISOString();

/** Add one year to today's date (annual dues expiry on a one-time order). */
function addOneYearISODate(from: Date): string {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

/** PayPal money value ("75.00") → integer cents (7500). */
function valueToCents(value: string | undefined): number {
  if (!value) return 0;
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

/** Parse our `<purpose>:<id>[:<aux>]` custom_id. */
function parseCustomId(
  customId: string | null | undefined,
): { purpose: string; id: string; aux: string | null } | null {
  if (!customId) return null;
  const parts = customId.split(":");
  if (parts.length < 2) return null;
  return { purpose: parts[0], id: parts[1], aux: parts[2] ?? null };
}

// ---------------------------------------------------------------------------
// Idempotency: returns true if this event was ALREADY processed.
// ---------------------------------------------------------------------------

async function alreadyProcessed(
  service: SupabaseClient,
  eventId: string,
  eventType: string,
): Promise<boolean> {
  // Check first (cheap, common path).
  const { data: existing } = await service
    .from("paypal_webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();
  if (existing) return true;

  // Insert the marker. If a concurrent delivery inserted it between our check
  // and now, the PK unique violation (23505) means "already processed".
  const { error } = await service
    .from("paypal_webhook_events")
    .insert({ id: eventId, type: eventType, processed_at: nowISO() });

  if (error) {
    if (error.code === "23505") return true; // race — someone else owns it
    // A non-duplicate insert failure should NOT silently drop the event; throw
    // so PayPal retries rather than us losing a payment update.
    throw new Error(`idempotency insert failed: ${error.message}`);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Member reconciliation helpers.
// ---------------------------------------------------------------------------

async function setMemberStatus(
  service: SupabaseClient,
  memberId: string,
  status: string,
  fields: Record<string, unknown> = {},
): Promise<void> {
  await service
    .from("members")
    .update({ membership_status: status, updated_at: nowISO(), ...fields })
    .eq("id", memberId);
}

/**
 * Upsert a row into the payments ledger keyed by the PayPal capture id (UNIQUE
 * in the schema). Read-before-write so a retried event updates rather than
 * duplicating; the unique index is the backstop.
 */
async function upsertPaymentByCapture(
  service: SupabaseClient,
  captureId: string,
  fields: Record<string, unknown>,
): Promise<string | null> {
  const { data: existing } = await service
    .from("payments")
    .select("id")
    .eq("paypal_capture_id", captureId)
    .maybeSingle();

  if (existing) {
    const id = (existing as { id: string }).id;
    await service
      .from("payments")
      .update({ ...fields, updated_at: nowISO() })
      .eq("id", id);
    return id;
  }

  const { data: inserted, error } = await service
    .from("payments")
    .insert({
      paypal_capture_id: captureId,
      payment_method: "paypal",
      ...fields,
      updated_at: nowISO(),
    })
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      // Inserted concurrently — fetch and update.
      const { data: race } = await service
        .from("payments")
        .select("id")
        .eq("paypal_capture_id", captureId)
        .maybeSingle();
      if (race) {
        const id = (race as { id: string }).id;
        await service.from("payments").update({ ...fields, updated_at: nowISO() }).eq("id", id);
        return id;
      }
    }
    console.error("payment upsert error:", error.message);
    return null;
  }
  return (inserted as { id: string } | null)?.id ?? null;
}

// ---------------------------------------------------------------------------
// Resolve the custom_id for a capture. PAYMENT.CAPTURE.* carries custom_id on
// the resource itself; if absent (older orders), fall back to reading the order.
// ---------------------------------------------------------------------------

async function resolveCustomId(
  resource: {
    custom_id?: string;
    supplementary_data?: { related_ids?: { order_id?: string } };
  },
): Promise<string | null> {
  if (resource.custom_id) return resource.custom_id;
  const orderId = resource.supplementary_data?.related_ids?.order_id;
  if (!orderId) return null;
  try {
    const order = await getOrder(orderId);
    return order.purchase_units?.[0]?.custom_id ?? null;
  } catch (e) {
    console.error("order lookup for custom_id failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Capture COMPLETED — the success path for all three purposes. Branch on the
// custom_id `<purpose>:<id>[:<aux>]` we stamped at order creation.
// ---------------------------------------------------------------------------

interface CaptureResource {
  id: string; // capture id
  status: string;
  amount?: { value?: string; currency_code?: string };
  custom_id?: string;
  invoice_id?: string;
  supplementary_data?: { related_ids?: { order_id?: string } };
  seller_receivable_breakdown?: { paypal_fee?: { value?: string } };
  payer?: { payer_id?: string };
}

async function onCaptureCompleted(
  service: SupabaseClient,
  resource: CaptureResource,
): Promise<void> {
  const captureId = resource.id;
  const customIdRaw = await resolveCustomId(resource);
  const parsed = parseCustomId(customIdRaw);
  if (!parsed) {
    console.error("capture completed with unparseable custom_id:", customIdRaw);
    return;
  }
  const amountCents = valueToCents(resource.amount?.value);
  const currency = (resource.amount?.currency_code ?? "usd").slice(0, 3).toLowerCase();
  const orderId = resource.supplementary_data?.related_ids?.order_id ?? null;

  // ---- Dues (one-time annual) ---------------------------------------------
  if (parsed.purpose === "dues") {
    const memberId = parsed.id;
    const planId = parsed.aux;

    // Member goes active; annual expiry is one year out (one-time order).
    await setMemberStatus(service, memberId, "active", {
      expires_at: addOneYearISODate(new Date()),
      ...(resource.payer?.payer_id ? { paypal_payer_id: resource.payer.payer_id } : {}),
    });

    // Ledger row.
    await upsertPaymentByCapture(service, captureId, {
      member_id: memberId,
      paypal_order_id: orderId,
      amount_cents: amountCents,
      currency,
      purpose_type: "dues",
      status: "succeeded" as PaymentStatus,
      metadata: { plan_id: planId, paypal_order_id: orderId },
      paid_at: nowISO(),
    });

    // Mark the member's open dues invoice paid (if one exists).
    await service
      .from("dues_invoices")
      .update({
        status: "paid" as DuesStatus,
        paypal_order_id: orderId,
        payment_method: "paypal",
        updated_at: nowISO(),
      })
      .eq("member_id", memberId)
      .in("status", ["pending", "payment_failed", "action_required"]);
    return;
  }

  // ---- Event ticket --------------------------------------------------------
  if (parsed.purpose === "event_ticket") {
    const regId = parsed.id;

    // Resolve the member from the registration's profile (nullable).
    let memberId: string | null = null;
    const { data: regRow } = await service
      .from("event_registrations")
      .select("profile_id")
      .eq("id", regId)
      .maybeSingle();
    const profileId = (regRow as { profile_id?: string } | null)?.profile_id ?? null;
    if (profileId) {
      const { data: m } = await service
        .from("members")
        .select("id")
        .eq("profile_id", profileId)
        .maybeSingle();
      memberId = (m as { id?: string } | null)?.id ?? null;
    }

    // Write the ledger row first so we can link it on the registration.
    const paymentId = await upsertPaymentByCapture(service, captureId, {
      member_id: memberId,
      paypal_order_id: orderId,
      amount_cents: amountCents,
      currency,
      purpose_type: "event_ticket",
      status: "succeeded" as PaymentStatus,
      event_registration_id: regId,
      metadata: { event_id: parsed.aux, paypal_order_id: orderId },
      paid_at: nowISO(),
    });

    // Flip the registration to paid + approved (event-flow.md path 3 step 8).
    await service
      .from("event_registrations")
      .update({
        payment_status: "paid",
        status: "approved",
        ...(paymentId ? { payment_id: paymentId } : {}),
        updated_at: nowISO(),
      })
      .eq("id", regId);
    return;
  }

  // ---- Donation ------------------------------------------------------------
  if (parsed.purpose === "donation") {
    const designation = parsed.id; // donation:<designation>:<memberId?>
    const memberId = parsed.aux && parsed.aux.length > 0 ? parsed.aux : null;

    await upsertPaymentByCapture(service, captureId, {
      member_id: memberId,
      paypal_order_id: orderId,
      amount_cents: amountCents,
      currency,
      purpose_type: "donation",
      designation,
      status: "succeeded" as PaymentStatus,
      metadata: { paypal_order_id: orderId },
      paid_at: nowISO(),
    });
    return;
  }

  console.error("capture completed with unknown purpose:", parsed.purpose);
}

// ---------------------------------------------------------------------------
// Capture DENIED / DECLINED — the charge did not succeed.
// ---------------------------------------------------------------------------

async function onCaptureFailed(
  service: SupabaseClient,
  resource: CaptureResource,
): Promise<void> {
  const parsed = parseCustomId(await resolveCustomId(resource));
  if (!parsed) return;

  // Record a failed ledger row (keyed by capture id) so the attempt is visible.
  await upsertPaymentByCapture(service, resource.id, {
    paypal_order_id: resource.supplementary_data?.related_ids?.order_id ?? null,
    amount_cents: valueToCents(resource.amount?.value),
    currency: (resource.amount?.currency_code ?? "usd").slice(0, 3).toLowerCase(),
    purpose_type: parsed.purpose === "event_ticket"
      ? "event_ticket"
      : parsed.purpose === "dues"
      ? "dues"
      : parsed.purpose === "donation"
      ? "donation"
      : "other",
    status: "failed" as PaymentStatus,
    metadata: { reason: "capture_denied" },
  });

  // Dues failure → member past_due; ticket failure → leave the pending
  // registration as-is (the member can retry). No member flip for donations.
  if (parsed.purpose === "dues") {
    await setMemberStatus(service, parsed.id, "past_due");
    await service
      .from("dues_invoices")
      .update({ status: "payment_failed" as DuesStatus, updated_at: nowISO() })
      .eq("member_id", parsed.id)
      .in("status", ["pending", "action_required"]);
  }
}

// ---------------------------------------------------------------------------
// Capture REFUNDED / REVERSED — refund cascade.
// ---------------------------------------------------------------------------

interface RefundResource {
  id: string; // refund id
  status: string;
  amount?: { value?: string; currency_code?: string };
  custom_id?: string;
  supplementary_data?: { related_ids?: { order_id?: string; capture_id?: string } };
}

async function onCaptureRefunded(
  service: SupabaseClient,
  resource: RefundResource,
): Promise<void> {
  // The refund resource references the original capture id.
  const captureId = resource.supplementary_data?.related_ids?.capture_id ?? null;
  if (!captureId) {
    console.error("refund with no related capture_id");
    return;
  }

  // Load the original ledger row by capture id.
  const { data: payRow } = await service
    .from("payments")
    .select("id, purpose_type, member_id, event_registration_id")
    .eq("paypal_capture_id", captureId)
    .maybeSingle();

  if (!payRow) {
    console.error("refund for unknown capture:", captureId);
    return;
  }
  const row = payRow as {
    id: string;
    purpose_type: string;
    member_id: string | null;
    event_registration_id: string | null;
  };

  // Flip the ledger row to refunded.
  await service
    .from("payments")
    .update({ status: "refunded" as PaymentStatus, refunded_at: nowISO(), updated_at: nowISO() })
    .eq("id", row.id);

  // Cascade by purpose.
  if (row.purpose_type === "event_ticket" && row.event_registration_id) {
    await service
      .from("event_registrations")
      .update({ payment_status: "refunded", status: "cancelled", updated_at: nowISO() })
      .eq("id", row.event_registration_id);
  }

  if (row.purpose_type === "dues" && row.member_id) {
    // A refunded member must not be left active.
    await setMemberStatus(service, row.member_id, "lapsed", {
      paypal_subscription_id: null,
    });
    await service
      .from("dues_invoices")
      .update({ status: "refunded" as DuesStatus, updated_at: nowISO() })
      .eq("member_id", row.member_id)
      .eq("status", "paid");
  }
}

// ---------------------------------------------------------------------------
// Subscriptions (OPTIONAL auto-renew path — PayPal Subscriptions v1).
// Members who opt into auto-renew get a subscription id; these keep them aligned.
// ---------------------------------------------------------------------------

interface SubscriptionResource {
  id: string;
  status?: string;
  custom_id?: string;
  billing_info?: { next_billing_time?: string };
}

async function findMemberBySubscription(
  service: SupabaseClient,
  subscriptionId: string,
): Promise<{ id: string } | null> {
  const { data } = await service
    .from("members")
    .select("id")
    .eq("paypal_subscription_id", subscriptionId)
    .maybeSingle();
  return (data as { id: string } | null) ?? null;
}

async function onSubscriptionActivated(
  service: SupabaseClient,
  resource: SubscriptionResource,
): Promise<void> {
  // custom_id carries `dues:<member_id>:<plan_id>` when we create the sub.
  const parsed = parseCustomId(resource.custom_id);
  const memberId = parsed?.purpose === "dues" ? parsed.id : null;
  const target = memberId
    ? { id: memberId }
    : await findMemberBySubscription(service, resource.id);
  if (!target) return;

  const next = resource.billing_info?.next_billing_time;
  await setMemberStatus(service, target.id, "active", {
    paypal_subscription_id: resource.id,
    ...(next ? { expires_at: next.split("T")[0] } : {}),
  });
}

async function onSubscriptionCancelledOrExpired(
  service: SupabaseClient,
  resource: SubscriptionResource,
): Promise<void> {
  const member = await findMemberBySubscription(service, resource.id);
  if (!member) return;
  await setMemberStatus(service, member.id, "lapsed", { paypal_subscription_id: null });
}

/**
 * PAYMENT.SALE.COMPLETED fires for each subscription cycle charge. Push the
 * member's expiry forward and record the renewal in the ledger.
 */
interface SaleResource {
  id: string;
  billing_agreement_id?: string; // the subscription id
  amount?: { total?: string; currency?: string };
  custom?: string;
}

async function onSaleCompleted(
  service: SupabaseClient,
  resource: SaleResource,
): Promise<void> {
  const subId = resource.billing_agreement_id;
  if (!subId) return; // not a subscription sale
  const member = await findMemberBySubscription(service, subId);
  if (!member) return;

  await setMemberStatus(service, member.id, "active", {
    expires_at: addOneYearISODate(new Date()),
  });

  await upsertPaymentByCapture(service, resource.id, {
    member_id: member.id,
    amount_cents: valueToCents(resource.amount?.total),
    currency: (resource.amount?.currency ?? "usd").slice(0, 3).toLowerCase(),
    purpose_type: "dues",
    status: "succeeded" as PaymentStatus,
    metadata: { paypal_subscription_id: subId, renewal: true },
    paid_at: nowISO(),
  });
}

// ---------------------------------------------------------------------------
// Main handler — ORDER IS LOAD-BEARING.
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  // PayPal POSTs only. (No CORS — this endpoint is server-to-server.)
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Build the service client. A config failure is a 500 — NO write has occurred.
  let service: SupabaseClient;
  try {
    service = getServiceClient();
  } catch (_err) {
    return new Response("Server not configured", { status: 500 });
  }

  // PAYPAL_WEBHOOK_ID must be present or we cannot verify — refuse (500).
  if (!Deno.env.get("PAYPAL_WEBHOOK_ID")) {
    return new Response("Webhook id not configured", { status: 500 });
  }

  // (1) RAW body as text — captured before any parse.
  const rawBody = await req.text();

  // (2) Transmission headers — all five required or we cannot verify.
  const headers = readWebhookHeaders(req);

  // Parse the body (needed for the verify call + routing). Malformed → 400,
  // still no write.
  let event: { id?: string; event_type?: string; resource?: unknown };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // (3) Verify signature as the FIRST trust operation. No DB write has happened.
  let verified: boolean;
  try {
    verified = await verifyWebhookSignature(headers, event);
  } catch (err) {
    // CONFIG_ERROR (missing id) or network — fail closed.
    console.error("verify-webhook-signature error:", err instanceof Error ? err.message : err);
    return new Response("Verification unavailable", { status: 500 });
  }
  if (!verified) {
    // Invalid signature / missing headers / FAILURE → 400, nothing written.
    return new Response("Invalid signature", { status: 400 });
  }

  const eventId = event.id;
  const eventType = event.event_type;
  if (!eventId || !eventType) {
    return new Response("Malformed event", { status: 400 });
  }

  // (4) Idempotency — check then insert by event.id.
  try {
    if (await alreadyProcessed(service, eventId, eventType)) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("idempotency check failed:", err instanceof Error ? err.message : err);
    return new Response("Idempotency store error", { status: 500 });
  }

  // (5) Reconcile. Failures here return 500 so PayPal retries the delivery.
  try {
    const resource = event.resource as
      & CaptureResource
      & RefundResource
      & SubscriptionResource
      & SaleResource;

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await onCaptureCompleted(service, resource as CaptureResource);
        break;
      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.DECLINED":
        await onCaptureFailed(service, resource as CaptureResource);
        break;
      case "PAYMENT.CAPTURE.REFUNDED":
      case "PAYMENT.CAPTURE.REVERSED":
        await onCaptureRefunded(service, resource as RefundResource);
        break;
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await onSubscriptionActivated(service, resource as SubscriptionResource);
        break;
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await onSubscriptionCancelledOrExpired(service, resource as SubscriptionResource);
        break;
      case "PAYMENT.SALE.COMPLETED":
        await onSaleCompleted(service, resource as SaleResource);
        break;
      default:
        // Acknowledge unhandled types so PayPal stops retrying them.
        console.log("unhandled event type:", eventType);
    }
  } catch (err) {
    console.error(`handler error for ${eventType}:`, err instanceof Error ? err.message : err);
    // We already inserted the idempotency marker. A 500 makes PayPal retry, and
    // the retry would SHORT-CIRCUIT at the idempotency check. To allow a genuine
    // retry we delete the marker so the retried delivery re-runs the handler.
    await service.from("paypal_webhook_events").delete().eq("id", eventId);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
