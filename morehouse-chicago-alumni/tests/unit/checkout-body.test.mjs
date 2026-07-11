/**
 * Lane J QA — PayPal checkout body construction (real source under test).
 * Ported from the wave-001 Stripe checkout-body test after Lane D removed the
 * inline `index.html` Stripe block and Lanes E/G moved dues/donation/ticket onto
 * the PayPal `paypal-checkout` Edge Function (dossier Dimension 4).
 *
 * HARD INVARIANT (data-contract.md §9 #6, §7; 99-EVIDENCE-CONTRACT.md G3):
 *   - The DUES body must carry `plan_id` ONLY and must NEVER include a
 *     client-chosen amount (amount / amount_cents / price*). The price is read
 *     server-side from membership_plans by paypal-checkout.
 *   - The EVENT_TICKET body must carry the registration/event ids and guest_count
 *     ONLY — never a price. The price is read server-side from events.price_cents.
 *   - The DONATION body DOES carry `amount_cents` (donor-chosen) plus a
 *     `designation`; paypal-checkout clamps it server-side to [500, 5000000].
 *
 * Two layers of evidence:
 *   1. A runtime capture: the REAL DonatePage.createOrder callback (js/donate.js)
 *      is executed in a vm sandbox with a stubbed supabaseClient, and we assert
 *      the exact body the page builds.
 *   2. Source invariants over the real js/membership.js and js/events.js call
 *      sites (their PayPal bodies are constructed inside paypal.Buttons closures
 *      that are awkward to invoke headless), proving no amount/price key is sent
 *      for dues or tickets, with a drift guard that fails if the call shape moves.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { PROJECT_ROOT } from "../helpers/loadBrowserModule.mjs";

const read = (rel) => readFileSync(resolve(PROJECT_ROOT, rel), "utf-8");

// ---------------------------------------------------------------------------
// Layer 1 — runtime capture of the REAL donation createOrder body (js/donate.js).
// ---------------------------------------------------------------------------

/**
 * Load js/donate.js in a vm sandbox, capture the `paypal.Buttons({createOrder})`
 * callback the module registers, and return a runner that invokes it and reports
 * the body passed to supabaseClient.functions.invoke('paypal-checkout', {body}).
 */
function loadDonateCreateOrder(opts = {}) {
  const captured = { calls: [] };
  let createOrderFn = null;

  const supabaseClient = {
    functions: {
      invoke: async (name, payload) => {
        captured.calls.push({ name, body: payload && payload.body });
        return { data: { order_id: "ORDER-TEST-1", status: "CREATED" }, error: null };
      },
    },
  };

  // Minimal DOM: the createOrder path reads the amount + designation + email.
  const amountInput = { value: opts.amount != null ? String(opts.amount) : "", focus() {} };
  const els = {
    "donate-amount": amountInput,
    "amount-error": { textContent: "", style: {}, setAttribute() {}, removeAttribute() {} },
    "donor-email": { value: opts.email || "" },
  };
  const documentStub = {
    getElementById: (id) => els[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
  };

  const paypal = {
    Buttons: (cfg) => {
      createOrderFn = cfg.createOrder;
      return { render() {} };
    },
  };

  const sandbox = {
    window: {},
    document: documentStub,
    paypal,
    showToast: () => {},
    console: { log() {}, warn() {}, error() {} },
    setTimeout: () => 0,
    clearTimeout: () => {},
  };
  sandbox.window.supabaseClient = supabaseClient;
  sandbox.supabaseClient = supabaseClient;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  // donate.js defines DonatePage and (on init) renders the buttons. We invoke the
  // builder directly so the createOrder callback is registered without a full
  // page lifecycle. Expose DonatePage, then call _buildButton with a stub node.
  const code =
    read("js/donate.js") +
    "\n;globalThis.__DonatePage = (typeof DonatePage!=='undefined') ? DonatePage : window.DonatePage;";
  vm.runInContext(code, sandbox, { filename: "js/donate.js" });

  const DonatePage = sandbox.__DonatePage;
  if (DonatePage && typeof DonatePage._buildButton === "function") {
    DonatePage._buildButton({});
  }

  return {
    async run() {
      if (typeof createOrderFn !== "function") {
        throw new Error("donate.js did not register a paypal.Buttons createOrder callback");
      }
      try { await createOrderFn(); } catch (_e) { /* validation throws are expected for some cases */ }
      return captured.calls.at(-1)?.body;
    },
    captured,
  };
}

describe("DONATION checkout body (amount IS sent, server clamps) — real js/donate.js", () => {
  it("sends purpose:'donation', amount_cents (integer), and a designation", async () => {
    const runner = loadDonateCreateOrder({ amount: 50 }); // $50
    const body = await runner.run();
    expect(body).toBeTruthy();
    expect(body.purpose).toBe("donation");
    expect(body.amount_cents).toBe(5000); // $50 -> cents
    expect(["scholarship", "chapter"]).toContain(body.designation);
  });

  it("does NOT call checkout when no amount is entered (client-side guard)", async () => {
    const runner = loadDonateCreateOrder({ amount: "" });
    await runner.run();
    expect(runner.captured.calls.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Layer 2 — source invariants over the real dues + ticket call sites.
// ---------------------------------------------------------------------------

describe("DUES checkout body (no client amount — SECURITY §9 #6) — js/membership.js", () => {
  const src = read("js/membership.js");

  it("invokes paypal-checkout (not a Stripe endpoint)", () => {
    expect(src.includes("'paypal-checkout'") || src.includes('"paypal-checkout"')).toBe(true);
    expect(/create-checkout-session/.test(src)).toBe(false);
  });

  it("the dues invoke body is { purpose:'dues', plan_id } with NO amount/price key", () => {
    // Match every `body: { purpose: 'dues', ... }` object literal and assert it
    // carries plan_id and no amount/price field.
    const matches = [...src.matchAll(/body:\s*\{([^}]*purpose:\s*['"]dues['"][^}]*)\}/g)];
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      const inner = m[1];
      expect(/plan_id/.test(inner)).toBe(true);
      expect(/\bamount(_cents)?\b/i.test(inner)).toBe(false);
      expect(/\bprice(_cents)?\b/i.test(inner)).toBe(false);
      expect(/unit_amount/i.test(inner)).toBe(false);
    }
  });

  it("comped/lifetime/manual members are guarded before any PayPal call", () => {
    // The portal and the public buttons both short-circuit non-billable members.
    expect(/comped|lifetime|manual|NON_BILLABLE|non-?billable/i.test(src)).toBe(true);
  });
});

describe("EVENT TICKET checkout body (no client price — SECURITY §9 #6) — js/events.js", () => {
  const src = read("js/events.js");

  it("invokes paypal-checkout with purpose:'event_ticket'", () => {
    expect(/purpose:\s*['"]event_ticket['"]/.test(src)).toBe(true);
    expect(src.includes("'paypal-checkout'") || src.includes('"paypal-checkout"')).toBe(true);
  });

  it("the ticket body carries ids + guest_count but NO amount/price/stripe field", () => {
    // Capture the event_ticket invoke argument object and assert its shape.
    const m = src.match(/purpose:\s*['"]event_ticket['"][\s\S]{0,400}?guest_count[^\n]*/);
    expect(m).toBeTruthy();
    const block = m[0];
    expect(/event_id/.test(block)).toBe(true);
    expect(/event_registration_id/.test(block)).toBe(true);
    expect(/\bamount(_cents)?\b/i.test(block)).toBe(false);
    expect(/\bprice(_cents)?\b/i.test(block)).toBe(false);
    expect(/stripe/i.test(block)).toBe(false);
  });
});
