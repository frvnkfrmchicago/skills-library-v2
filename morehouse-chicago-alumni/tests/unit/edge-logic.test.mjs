/**
 * Lane 7 QA — Edge Function pure logic (mirrored, with source-drift guards).
 *
 * The Stripe/content Edge Functions are Deno/TypeScript with npm:/jsr: imports
 * that Node-Vitest cannot import directly. So this file MIRRORS three pieces of
 * pure logic and then GUARDS the mirror against the real source: each guard test
 * greps the actual *.ts file and fails if the contract value/keyword changed.
 * That keeps the mirror honest without a Deno toolchain.
 *
 *   1. scoreRelevance       — supabase/functions/content-sync/index.ts (Lane 4)
 *   2. donation clamp bounds — supabase/functions/_shared/types.ts (Lane 2)
 *   3. NON_BILLABLE_STATUSES — supabase/functions/_shared/types.ts (Lane 2)
 *
 * Contract refs: data-contract.md §7 (donation min/max, non-billable) and §8
 * (Chicago relevance keyword heuristic, NO LLM call).
 */
import { describe, it, expect } from "vitest";
import { readSource } from "../helpers/loadBrowserModule.mjs";

// ---- Mirror of content-sync scoreRelevance (index.ts ~L108-152) -------------
const DIRECT_KEYWORDS = ["chicago", "illinois", "midwest", "chapter", "camaa", "chicagoland"];
const ADJACENT_KEYWORDS = [
  "alumni", "career", "scholarship", "giving", "networking", "mentoring",
  "homecoming", "fellowship", "grant", "award", "foundation", "donation",
];
function scoreRelevance(text) {
  const lower = String(text).toLowerCase();
  const tags = [];
  const direct = DIRECT_KEYWORDS.find((k) => lower.includes(k));
  if (direct) { tags.push(direct); return { relevance: "direct", tags }; }
  const adj = ADJACENT_KEYWORDS.filter((k) => lower.includes(k));
  if (adj.length) { tags.push(...adj.slice(0, 5)); return { relevance: "adjacent", tags }; }
  return { relevance: "general", tags };
}

// ---- Mirror of donation/non-billable (types.ts) -----------------------------
const DONATION_MIN_CENTS = 500;
const DONATION_MAX_CENTS = 5_000_000;
const NON_BILLABLE = new Set(["comped", "lifetime", "manual"]);
function donationAccepted(cents) {
  return Number.isInteger(cents) && cents >= DONATION_MIN_CENTS && cents <= DONATION_MAX_CENTS;
}

describe("scoreRelevance — Chicago relevance heuristic (§8, no LLM)", () => {
  it("tags Chicago/Illinois/Midwest/chapter as DIRECT", () => {
    expect(scoreRelevance("Morehouse alumni gather in Chicago").relevance).toBe("direct");
    expect(scoreRelevance("State of Illinois grant").relevance).toBe("direct");
    expect(scoreRelevance("CAMAA chapter news").relevance).toBe("direct");
    expect(scoreRelevance("a Midwest tour").relevance).toBe("direct");
  });
  it("direct match wins even if adjacent words also appear", () => {
    const r = scoreRelevance("Chicago alumni scholarship homecoming");
    expect(r.relevance).toBe("direct");
    expect(r.tags).toContain("chicago");
  });
  it("tags alumni/career/scholarship/giving/etc. as ADJACENT", () => {
    expect(scoreRelevance("national scholarship fund").relevance).toBe("adjacent");
    expect(scoreRelevance("career networking night").relevance).toBe("adjacent");
    expect(scoreRelevance("homecoming weekend").relevance).toBe("adjacent");
  });
  it("caps adjacent tags at five", () => {
    const r = scoreRelevance("alumni career scholarship giving networking mentoring homecoming");
    expect(r.relevance).toBe("adjacent");
    expect(r.tags.length).toBeLessThanOrEqual(5);
  });
  it("falls back to GENERAL when no keyword matches", () => {
    expect(scoreRelevance("a story about nothing relevant").relevance).toBe("general");
    expect(scoreRelevance("").relevance).toBe("general");
  });
  it("is case-insensitive", () => {
    expect(scoreRelevance("CHICAGO").relevance).toBe("direct");
  });
});

describe("donation clamp bounds (§7)", () => {
  it("rejects below the $5 minimum", () => {
    expect(donationAccepted(499)).toBe(false);
    expect(donationAccepted(0)).toBe(false);
    expect(donationAccepted(-100)).toBe(false);
  });
  it("accepts the boundary values", () => {
    expect(donationAccepted(500)).toBe(true);
    expect(donationAccepted(5_000_000)).toBe(true);
  });
  it("rejects above the $50,000 ceiling", () => {
    expect(donationAccepted(5_000_001)).toBe(false);
  });
  it("rejects non-integer cents", () => {
    expect(donationAccepted(500.5)).toBe(false);
  });
});

describe("NON_BILLABLE_STATUSES (§7 comped guard)", () => {
  it("comped / lifetime / manual never enter Stripe", () => {
    expect(NON_BILLABLE.has("comped")).toBe(true);
    expect(NON_BILLABLE.has("lifetime")).toBe(true);
    expect(NON_BILLABLE.has("manual")).toBe(true);
  });
  it("billable statuses are not in the set", () => {
    for (const s of ["pending", "active", "lapsed", "past_due", "suspended", "paused", "expired"]) {
      expect(NON_BILLABLE.has(s)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// SOURCE-DRIFT GUARDS — fail if the real Edge source diverges from the mirror.
// ---------------------------------------------------------------------------
describe("source-drift guards (mirror must match real source)", () => {
  const types = readSource("supabase/functions/_shared/types.ts");
  const sync = readSource("supabase/functions/content-sync/index.ts");

  it("donation bounds in types.ts still equal the mirror", () => {
    expect(types).toMatch(/DONATION_MIN_CENTS\s*=\s*500\b/);
    expect(types).toMatch(/DONATION_MAX_CENTS\s*=\s*5_000_000\b/);
  });
  it("non-billable set in types.ts still equals the mirror", () => {
    expect(types).toMatch(/NON_BILLABLE_STATUSES[\s\S]*"comped"[\s\S]*"lifetime"[\s\S]*"manual"/);
  });
  it("direct keywords in content-sync still include the contract terms", () => {
    for (const k of DIRECT_KEYWORDS) {
      expect(sync.includes(`"${k}"`)).toBe(true);
    }
  });
  it("content-sync makes NO LLM/model call (§8)", () => {
    expect(/openai|anthropic|gpt-|claude|gemini|\.generateContent|completions/i.test(sync)).toBe(false);
  });
});
