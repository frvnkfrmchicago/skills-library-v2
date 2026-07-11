/**
 * paypal-checkout — Supabase Edge Function (Deno/TypeScript)
 *
 * Creates a PayPal Orders v2 order for one of three purposes and returns the
 * order id (which the browser's PayPal JS SDK buttons resolve in `createOrder`)
 * plus the hosted approval link (redirect fallback). It NEVER trusts a
 * client-sent amount: dues price comes from membership_plans, event-ticket price
 * comes from the events row, donations are clamped to a server-enforced min/max.
 *
 * Purposes (Zod discriminated union on `purpose`):
 *   dues          → one-time annual order, value from membership_plans by
 *                   plan_id. Comped/lifetime/manual members are rejected
 *                   (MEMBER_NOT_BILLABLE). Requires a Supabase JWT.
 *   donation      → variable amount clamped to [DONATION_MIN_CENTS,
 *                   DONATION_MAX_CENTS], designation gated. May be anonymous.
 *   event_ticket  → capacity re-checked server-side, value read from the events
 *                   row (events.price_cents — client never sets price).
 *                   Requires a Supabase JWT.
 *
 * The order's `custom_id` carries our reconciliation key
 * (`<purpose>:<domain-id>`) so paypal-webhook can map a capture back to the
 * right member / registration / designation without trusting the client.
 *
 * Security invariants honored (data-contract.md §9):
 *   #4 input validated (Zod) before any DB access.
 *   #6 dues / ticket amounts come from the DB, never the client body.
 *   Secrets read from Deno.env only (#1 / §10): PAYPAL_CLIENT_SECRET,
 *   SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY.
 *
 * Idempotency: every PayPal create passes a `PayPal-Request-Id` so a retried
 * invocation cannot open a duplicate order.
 *
 * Skills: api-integrating, backend-hardening, security-auditing
 * Librarians: api-integration-librarian, backend-librarian, security-librarian
 *
 * Credential boundary: this file is NOT deployed here. The board deploys it and
 * sets secrets. See docs/payment-contract-paypal.md "Remaining gaps".
 */

import { z } from "zod";
import {
  centsToValue,
  createOrder,
  type PayPalOrder,
  type PayPalPurchaseUnit,
} from "../_shared/paypal.ts";
import {
  getServiceClient,
  getUserScopedClient,
  type SupabaseClient,
} from "../_shared/supabase.ts";
import { errorResponse, handleOptions, jsonResponse } from "../_shared/http.ts";
import {
  CHECKOUT_CURRENCY,
  DONATION_DESIGNATIONS,
  DONATION_MAX_CENTS,
  DONATION_MIN_CENTS,
  type EventRegistrationRow,
  type EventRow,
  type MembershipPlanRow,
  type MemberRow,
  NON_BILLABLE_STATUSES,
} from "../_shared/types.ts";

// ---------------------------------------------------------------------------
// 1. Input validation — Zod discriminated union (validated FIRST, §9 #4).
// ---------------------------------------------------------------------------

const DuesInput = z.object({
  purpose: z.literal("dues"),
  plan_id: z.string().uuid(),
});

const DonationInput = z.object({
  purpose: z.literal("donation"),
  amount_cents: z.number().int().positive(),
  designation: z.enum(DONATION_DESIGNATIONS),
  // Anonymous donors may attach an email so we can surface a receipt note.
  donor_email: z.string().email().optional(),
});

const EventTicketInput = z.object({
  purpose: z.literal("event_ticket"),
  event_id: z.string().uuid(),
  event_registration_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  guest_count: z.number().int().min(0).max(20).default(0),
});

const CheckoutInput = z.discriminatedUnion("purpose", [
  DuesInput,
  DonationInput,
  EventTicketInput,
]);

type CheckoutInput = z.infer<typeof CheckoutInput>;

// ---------------------------------------------------------------------------
// 2. Auth resolution — getUser() is a real server-side identity check.
// ---------------------------------------------------------------------------

/**
 * Resolve the authenticated user id (auth.users.id) by validating the bearer
 * JWT against Supabase Auth. Returns null when no/invalid token.
 */
async function resolveUserId(req: Request): Promise<string | null> {
  const userClient = getUserScopedClient(req);
  if (!userClient) return null;
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) return null;
  return data.user.id;
}

// ---------------------------------------------------------------------------
// 3. Order response shaping — return the id + the approval link.
// ---------------------------------------------------------------------------

/**
 * Shape the success body. The JS SDK button flow uses `order_id`; the redirect
 * flow uses `approve_url` (the `rel:"approve"|"payer-action"` HATEOAS link).
 */
function orderResponse(req: Request, order: PayPalOrder): Response {
  const approve = order.links?.find(
    (l) => l.rel === "approve" || l.rel === "payer-action",
  );
  return jsonResponse(req, {
    order_id: order.id,
    status: order.status,
    approve_url: approve?.href ?? null,
  });
}

// ---------------------------------------------------------------------------
// 4. Branch handlers.
// ---------------------------------------------------------------------------

async function handleDues(
  req: Request,
  input: z.infer<typeof DuesInput>,
  service: SupabaseClient,
  userId: string,
): Promise<Response> {
  // 4a. Resolve the member from the authenticated profile.
  const { data: memberRaw, error: memberErr } = await service
    .from("members")
    .select(
      "id, profile_id, membership_status, paypal_payer_id, paypal_subscription_id, expires_at",
    )
    .eq("profile_id", userId)
    .maybeSingle();

  if (memberErr) {
    return errorResponse(req, "DB_ERROR", 500, "Could not load member record");
  }
  if (!memberRaw) {
    return errorResponse(req, "MEMBER_NOT_FOUND", 404, "No member record for this account");
  }
  const member = memberRaw as MemberRow;

  // 4b. Comped / lifetime / manual members NEVER enter PayPal (§7).
  if (NON_BILLABLE_STATUSES.has(member.membership_status)) {
    return errorResponse(
      req,
      "MEMBER_NOT_BILLABLE",
      400,
      "This membership is complimentary or managed and is not billed online",
    );
  }

  // 4c. Resolve the plan price SERVER-SIDE (§9 #6) — client only sent plan_id.
  const { data: planRaw, error: planErr } = await service
    .from("membership_plans")
    .select("id, name, amount_cents, interval, paypal_plan_id, active")
    .eq("id", input.plan_id)
    .maybeSingle();

  if (planErr) {
    return errorResponse(req, "DB_ERROR", 500, "Could not load membership plan");
  }
  if (!planRaw) {
    return errorResponse(req, "PLAN_NOT_FOUND", 404, "Membership plan not found");
  }
  const plan = planRaw as MembershipPlanRow;

  if (!plan.active) {
    return errorResponse(req, "PLAN_INACTIVE", 400, "This plan is no longer available");
  }
  // A $0 / lifetime plan is the comped marker — not a billable order.
  if (plan.amount_cents <= 0 || plan.interval === "lifetime") {
    return errorResponse(req, "MEMBER_NOT_BILLABLE", 400, "This plan is not billed online");
  }

  // 4d. Create the order — amount from the DB, reconciliation key in custom_id.
  const unit: PayPalPurchaseUnit = {
    custom_id: `dues:${member.id}:${plan.id}`,
    description: `Annual dues — ${plan.name}`.slice(0, 127),
    amount: { currency_code: CHECKOUT_CURRENCY, value: centsToValue(plan.amount_cents) },
  };

  const order = await createOrder({
    purchaseUnits: [unit],
    // Idempotent per member+plan so a double-click cannot open two orders.
    requestId: `dues:${member.id}:${plan.id}`,
  });

  return orderResponse(req, order);
}

async function handleDonation(
  req: Request,
  input: z.infer<typeof DonationInput>,
  service: SupabaseClient,
  userId: string | null,
): Promise<Response> {
  // Server-enforced min/max (§7) — never trust the client amount blindly.
  if (
    input.amount_cents < DONATION_MIN_CENTS ||
    input.amount_cents > DONATION_MAX_CENTS
  ) {
    return errorResponse(
      req,
      "AMOUNT_OUT_OF_RANGE",
      400,
      `Donation must be between $${(DONATION_MIN_CENTS / 100).toFixed(0)} and $${(DONATION_MAX_CENTS / 100).toFixed(0)}`,
    );
  }

  // Resolve member_id when the donor happens to be signed in (nullable — the
  // payments.member_id FK is ON DELETE SET NULL and donations may be anonymous).
  let memberId: string | null = null;
  if (userId) {
    const { data: m } = await service
      .from("members")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();
    memberId = (m as { id?: string } | null)?.id ?? null;
  }

  const designationLabel = input.designation === "scholarship"
    ? "Scholarship Fund"
    : "Chapter Operations";

  const unit: PayPalPurchaseUnit = {
    // member id is optional on a donation; the designation is always present.
    custom_id: `donation:${input.designation}:${memberId ?? ""}`,
    description: `Donation — ${designationLabel}`.slice(0, 127),
    amount: { currency_code: CHECKOUT_CURRENCY, value: centsToValue(input.amount_cents) },
  };

  const order = await createOrder({
    purchaseUnits: [unit],
    // Anonymous donations have no stable domain id → per-invocation random id.
    requestId: `donation:${crypto.randomUUID()}`,
  });

  return orderResponse(req, order);
}

async function handleEventTicket(
  req: Request,
  input: z.infer<typeof EventTicketInput>,
  service: SupabaseClient,
  userId: string,
): Promise<Response> {
  // 1. Load the event — price is read from HERE, never from the client (§9 #6).
  const { data: eventRaw, error: eventErr } = await service
    .from("events")
    .select(
      "id, title, event_date, capacity, waitlist_capacity, visibility, status, price_cents",
    )
    .eq("id", input.event_id)
    .maybeSingle();

  if (eventErr) {
    return errorResponse(req, "DB_ERROR", 500, "Could not load event");
  }
  if (!eventRaw) {
    return errorResponse(req, "EVENT_NOT_FOUND", 404, "Event not found");
  }
  const event = eventRaw as EventRow;

  if (event.status === "cancelled" || event.status === "draft") {
    return errorResponse(req, "EVENT_NOT_AVAILABLE", 400, "Event is not open for registration");
  }
  if (event.price_cents <= 0) {
    return errorResponse(req, "EVENT_NOT_PAID", 400, "This event is free — no checkout required");
  }

  // 2. Load the pending registration row and verify ownership.
  const { data: regRaw, error: regErr } = await service
    .from("event_registrations")
    .select("id, event_id, profile_id, guest_count, status, payment_status, payment_id")
    .eq("id", input.event_registration_id)
    .maybeSingle();

  if (regErr) {
    return errorResponse(req, "DB_ERROR", 500, "Could not load registration");
  }
  if (!regRaw) {
    return errorResponse(req, "REGISTRATION_NOT_FOUND", 404, "Registration not found");
  }
  const reg = regRaw as EventRegistrationRow;

  // The authenticated user must own this registration, and it must belong to
  // the event named in the request — block cross-event / cross-user tampering.
  if (reg.profile_id !== userId || reg.event_id !== event.id) {
    return errorResponse(req, "REGISTRATION_MISMATCH", 403, "Registration does not match this request");
  }
  if (reg.payment_status === "paid") {
    return errorResponse(req, "ALREADY_PAID", 409, "This registration is already paid");
  }

  // 3. Re-verify capacity SERVER-SIDE (event-flow.md requirement). Count rows
  // that consume a slot: approved + checked_in. Pending/waitlisted do not.
  if (event.capacity && event.capacity > 0) {
    const { count, error: countErr } = await service
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .in("status", ["approved", "checked_in"]);

    if (countErr) {
      return errorResponse(req, "DB_ERROR", 500, "Could not verify capacity");
    }
    // This pending registration will consume one slot on payment success.
    if ((count ?? 0) + 1 > event.capacity) {
      return errorResponse(req, "EVENT_AT_CAPACITY", 409, "This event has reached capacity");
    }
  }

  // 4. Create the order — value from events.price_cents, key in custom_id.
  const unit: PayPalPurchaseUnit = {
    custom_id: `event_ticket:${reg.id}:${event.id}`,
    description: `Event ticket — ${event.title}`.slice(0, 127),
    amount: { currency_code: CHECKOUT_CURRENCY, value: centsToValue(event.price_cents) },
  };

  const order = await createOrder({
    purchaseUnits: [unit],
    // Idempotent per registration — re-invoking reuses the order.
    requestId: `event:${reg.id}`,
  });

  return orderResponse(req, order);
}

// ---------------------------------------------------------------------------
// 5. Main handler.
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return handleOptions(req);
  if (req.method !== "POST") {
    return errorResponse(req, "METHOD_NOT_ALLOWED", 405, "Use POST");
  }

  // Build the service client up front so a missing secret fails as 500 (config),
  // not 400. PayPal credentials are validated lazily inside _shared/paypal.ts on
  // the first token fetch (also surfaced as CONFIG_ERROR / CHECKOUT_FAILED).
  let service: SupabaseClient;
  try {
    service = getServiceClient();
  } catch (_err) {
    // Never echo the secret name/value back to the client.
    return errorResponse(req, "CONFIG_ERROR", 500, "Server is not fully configured");
  }

  // Parse JSON.
  let rawBody: unknown;
  try {
    const text = await req.text();
    rawBody = text.trim() ? JSON.parse(text) : {};
  } catch {
    return errorResponse(req, "INVALID_JSON", 400, "Request body is not valid JSON");
  }

  // Validate BEFORE any DB access (§9 #4).
  const parsed = CheckoutInput.safeParse(rawBody);
  if (!parsed.success) {
    return errorResponse(
      req,
      "VALIDATION_ERROR",
      400,
      parsed.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; "),
    );
  }
  const input: CheckoutInput = parsed.data;

  try {
    // Auth gates: dues + event_ticket require a verified user; donation may be anon.
    if (input.purpose === "dues") {
      const userId = await resolveUserId(req);
      if (!userId) return errorResponse(req, "UNAUTHENTICATED", 401, "Sign in required");
      return await handleDues(req, input, service, userId);
    }

    if (input.purpose === "event_ticket") {
      const userId = await resolveUserId(req);
      if (!userId) return errorResponse(req, "UNAUTHENTICATED", 401, "Sign in required");
      return await handleEventTicket(req, input, service, userId);
    }

    // donation (anonymous allowed) — resolve user if a token is present.
    const maybeUserId = await resolveUserId(req);
    return await handleDonation(req, input, service, maybeUserId);
  } catch (err) {
    // PayPal / network / unexpected. Log server-side, return a generic error.
    const msg = err instanceof Error ? err.message : String(err);
    console.error("paypal-checkout error:", msg);
    // A missing PayPal credential surfaces as CONFIG_ERROR from the helper.
    if (msg.startsWith("CONFIG_ERROR")) {
      return errorResponse(req, "CONFIG_ERROR", 500, "Server is not fully configured");
    }
    // Surface PayPal's machine token (e.g. PAYPAL_ORDER_CREATE_FAILED:...) as a
    // bounded code, never the raw payer-bearing body.
    const code = msg.split(":")[0] || "CHECKOUT_FAILED";
    return errorResponse(req, "CHECKOUT_FAILED", 502, `Payment provider error (${code})`);
  }
});
