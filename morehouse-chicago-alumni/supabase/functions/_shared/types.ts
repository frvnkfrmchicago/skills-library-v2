/**
 * _shared/types.ts — row shapes mirrored from docs/data-contract.md §4 as
 * altered by migration 011 (PayPal money columns). NO deviations from the schema.
 * Only the columns the payment functions read or write are typed here.
 */

export type MembershipStatus =
  | "pending"
  | "active"
  | "lapsed"
  | "past_due"
  | "comped"
  | "lifetime"
  | "manual"
  | "suspended"
  | "paused"
  | "expired";

export type PaymentPurpose =
  | "dues"
  | "event_ticket"
  | "donation"
  | "sponsorship"
  | "other";

export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "disputed";

export type DuesStatus =
  | "pending"
  | "paid"
  | "overdue"
  | "payment_failed"
  | "action_required"
  | "waived"
  | "refunded"
  | "void";

export type RegistrationStatus =
  | "pending"
  | "approved"
  | "waitlisted"
  | "cancelled"
  | "checked_in";

export type RegistrationPaymentStatus =
  | "not_required"
  | "pending"
  | "paid"
  | "refunded";

/**
 * How a payment reached us. `paypal` is the online path; `check` / `zelle` /
 * `cash` are the offline paths an admin records via the mark-paid flow (a
 * first-class peer to online checkout for an older chapter — data-contract /
 * dossier Dimension 4). Stored on payments.payment_method and
 * dues_invoices.payment_method.
 */
export const PAYMENT_METHODS = ["paypal", "check", "zelle", "cash"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Offline methods an admin may record by hand (never charged online). */
export const OFFLINE_PAYMENT_METHODS: ReadonlySet<PaymentMethod> = new Set([
  "check",
  "zelle",
  "cash",
]);

/** Statuses that NEVER enter PayPal (data-contract.md §7). */
export const NON_BILLABLE_STATUSES: ReadonlySet<MembershipStatus> = new Set([
  "comped",
  "lifetime",
  "manual",
]);

export interface MembershipPlanRow {
  id: string;
  name: string;
  amount_cents: number;
  interval: string; // 'year' | 'month' | 'one_time' | 'lifetime'
  paypal_plan_id: string | null; // PayPal billing-plan id (auto-renew opt-in)
  active: boolean;
}

export interface MemberRow {
  id: string;
  profile_id: string;
  membership_status: MembershipStatus;
  paypal_payer_id: string | null;
  paypal_subscription_id: string | null;
  expires_at: string | null;
}

export interface EventRow {
  id: string;
  title: string;
  event_date: string;
  capacity: number | null;
  waitlist_capacity: number | null;
  visibility: string;
  status: string;
  price_cents: number;
}

export interface EventRegistrationRow {
  id: string;
  event_id: string;
  profile_id: string;
  guest_count: number;
  status: RegistrationStatus;
  payment_status: RegistrationPaymentStatus;
  payment_id: string | null;
}

/**
 * Donation server-enforced bounds (data-contract.md §7 — min/max enforced
 * server-side). Cents. $5 minimum guards card-testing/penny abuse; $50,000 cap
 * is a sanity ceiling on a single online gift (larger gifts go through the
 * board offline).
 */
export const DONATION_MIN_CENTS = 500;
export const DONATION_MAX_CENTS = 5_000_000;

/** Allowed donation designations (data-contract.md §7). */
export const DONATION_DESIGNATIONS = ["scholarship", "chapter"] as const;
export type DonationDesignation = (typeof DONATION_DESIGNATIONS)[number];

/**
 * Currency for all online checkout. Single-currency chapter; pinned so a client
 * can never request a foreign-denominated order.
 */
export const CHECKOUT_CURRENCY = "USD";
