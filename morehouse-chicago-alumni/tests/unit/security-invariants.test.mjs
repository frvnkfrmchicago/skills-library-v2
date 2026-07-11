/**
 * Lane 7 QA — Security invariants as executable gates (data-contract.md §9).
 * These run over the real repo and codify the hard gates so a regression fails CI.
 *
 * One test (the home-page innerHTML XSS) is written as the CURRENT-STATE assertion
 * and is marked .fails — it documents a real defect (DEF-001) that Lane 1/Lane 5
 * must fix in index.html. When the home-page grids are converted to textContent /
 * sanitized DOM construction, flip `it.fails` to `it` and it will pass.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { PROJECT_ROOT } from "../helpers/loadBrowserModule.mjs";

function listFiles(dir, exts, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (["node_modules", ".git", "tests"].includes(name)) continue;
      listFiles(p, exts, acc);
    } else if (exts.some((e) => name.endsWith(e))) {
      acc.push(p);
    }
  }
  return acc;
}

const JS_DIR = resolve(PROJECT_ROOT, "js");
const htmlFiles = readdirSync(PROJECT_ROOT).filter((f) => f.endsWith(".html")).map((f) => resolve(PROJECT_ROOT, f));
const jsFiles = readdirSync(JS_DIR).filter((f) => f.endsWith(".js")).map((f) => resolve(JS_DIR, f));
const read = (p) => readFileSync(p, "utf-8");

describe("G1/G2 — no server secrets in client files (§9 #1; evidence-contract G2)", () => {
  // Stripe-era tokens PLUS the PayPal server-only secret names (wave-002). The
  // browser-safe PAYPAL_CLIENT_ID may appear in client code and is NOT matched.
  const SECRET_RE = /(service_role|sk_live|sk_test|whsec_|PAYPAL_CLIENT_SECRET|PAYPAL_WEBHOOK_ID)/;
  it("js/*.js contains no server-secret tokens", () => {
    for (const f of jsFiles) {
      expect(SECRET_RE.test(read(f)), `secret token in ${f}`).toBe(false);
    }
  });
  it("*.html contains no server-secret tokens", () => {
    for (const f of htmlFiles) {
      expect(SECRET_RE.test(read(f)), `secret token in ${f}`).toBe(false);
    }
  });
});

describe("G1 — no live Stripe remnants in client files (de-Stripe; evidence-contract G1)", () => {
  // After the PayPal migration no client file may carry a live Stripe call.
  // (The visual `--table-stripe` token / a local `stripe` accent var / "No Stripe"
  // comments are not live calls; we match only functional Stripe endpoints/keys.)
  const LIVE_STRIPE_RE = /(js\.stripe\.com|api\.stripe\.com|stripe\.com\/v1|create-checkout-session|stripe-webhook|pk_(live|test)_|sk_(live|test)_)/;
  it("js/*.js and *.html contain no live Stripe endpoint or key", () => {
    for (const f of [...jsFiles, ...htmlFiles]) {
      expect(LIVE_STRIPE_RE.test(read(f)), `live Stripe remnant in ${f}`).toBe(false);
    }
  });
});

describe("Edge Functions read secrets from env only (§9 #1 / §10)", () => {
  const fnFiles = listFiles(resolve(PROJECT_ROOT, "supabase/functions"), [".ts"]);
  it("no literal sk_live/sk_test/whsec_ secret values in function source", () => {
    for (const f of fnFiles) {
      expect(/sk_live_[A-Za-z0-9]|sk_test_[A-Za-z0-9]|whsec_[A-Za-z0-9]/.test(read(f)), f).toBe(false);
    }
  });
});

describe("Protected pages enforce an auth gate (§9 #2)", () => {
  // admin*, admin-dues, admin-content -> requireAdmin. The member portal logic in
  // js/membership.js still gates with requireAuth (Member.start), but per the
  // wave-002 IA (dossier Dim 2) membership.html itself is a PUBLIC info/join page,
  // so it does NOT ship a FOAC hidden body. The truly protected member pages
  // (dashboard / profile / my-events) carry FOAC; admin pages carry FOAC.
  const expectations = [
    ["js/admin.js", /requireAdmin\s*\(/],
    ["js/admin-dues.js", /requireAdmin\s*\(/],
    ["js/admin-content.js", /requireAdmin\s*\(/],
    ["js/membership.js", /requireAuth\s*\(/], // Member.start() portal gate
  ];
  for (const [rel, re] of expectations) {
    it(`${rel} calls the gate`, () => {
      expect(re.test(read(resolve(PROJECT_ROOT, rel)))).toBe(true);
    });
  }
  it("admin + protected member pages ship FOAC hidden bodies (data-protected)", () => {
    // Every page that renders signed-in-only content before auth resolves must
    // hide the body until the gate passes (Flash-Of-Authenticated-Content guard).
    const protectedPages = [
      "admin.html", "admin-dues.html", "admin-content.html",
      "dashboard.html", "profile.html", "my-events.html",
    ];
    for (const page of protectedPages) {
      const html = read(resolve(PROJECT_ROOT, page));
      expect(/visibility:\s*hidden/i.test(html), `${page} missing FOAC`).toBe(true);
      expect(/data-protected=["']true["']/i.test(html), `${page} missing data-protected`).toBe(true);
    }
  });
  it("membership.html is intentionally PUBLIC (no FOAC) — wave-002 IA", () => {
    const html = read(resolve(PROJECT_ROOT, "membership.html"));
    expect(/data-protected=["']true["']/i.test(html)).toBe(false);
  });
});

describe("Directory privacy posture (§9 #3)", () => {
  const dir = read(resolve(PROJECT_ROOT, "js/directory.js"));
  it("renders the sign-in gate and returns before loading peers when signed out", () => {
    // Inside init(): the !signed-in guard must render the gate and RETURN before
    // _load() (which issues the profiles query) is ever called. Bound the slice
    // by the _load DEFINITION so the init body (which calls _load) is captured.
    const initBody = dir.slice(dir.indexOf("async init()"), dir.indexOf("async _load()"));
    const guardIdx = initBody.indexOf("_renderSignInGate(container)");
    const returnIdx = initBody.indexOf("return", guardIdx);
    const loadIdx = initBody.indexOf("await this._load()");
    expect(guardIdx).toBeGreaterThan(-1);
    expect(returnIdx).toBeGreaterThan(-1);
    expect(loadIdx).toBeGreaterThan(-1);
    // gate -> return both precede the _load() call.
    expect(guardIdx).toBeLessThan(loadIdx);
    expect(returnIdx).toBeLessThan(loadIdx);
  });
  it("the profiles peer query lives only inside _load (gated path)", () => {
    expect(dir.includes(".from('profiles')")).toBe(true);
  });
});

describe("Anti-mock (§G3) — no unlabeled mock data in shipped client code", () => {
  const MOCK_RE = /john doe|jane doe|lorem ipsum|test@test|foo@bar/i;
  it("js/*.js and *.html carry no classic mock strings", () => {
    for (const f of [...jsFiles, ...htmlFiles]) {
      expect(MOCK_RE.test(read(f)), `mock string in ${f}`).toBe(false);
    }
  });
});

describe("No innerHTML for user-controlled strings (§9 #7)", () => {
  // Feature MODULES render member/event/content strings via textContent. Assert
  // none of them interpolate a known user field into an innerHTML template.
  const moduleFiles = ["js/admin.js", "js/admin-dues.js", "js/admin-content.js",
    "js/directory.js", "js/events.js", "js/calendar.js", "js/content.js", "js/membership.js"];
  const USER_FIELD = /\.innerHTML\s*=\s*`[^`]*\$\{[^}]*\b(title|full_name|name|summary|location|bio|email|description|chapter_role_title)\b/;
  for (const rel of moduleFiles) {
    it(`${rel} does not interpolate a user field into innerHTML`, () => {
      expect(USER_FIELD.test(read(resolve(PROJECT_ROOT, rel))), rel).toBe(false);
    });
  }

  // DEF-001 (RESOLVED in the Batch-4 lead closeout): the index.html home grids previously
  // interpolated user-controlled event/member fields (evt.title, evt.location, m.name, ...)
  // into innerHTML with no escaping — a stored-XSS sink fed by REAL admin-entered Supabase
  // rows via Store._hydratePublic(). The fix wraps every interpolation in esc()/safeUrl().
  // This test now asserts the grids are XSS-safe. See docs/security-review.md DEF-001.
  it("index.html home grids are XSS-safe (DEF-001 fixed: esc()/safeUrl() wrap interpolations)", () => {
    const html = read(resolve(PROJECT_ROOT, "index.html"));
    const interpolatesUserField =
      /\.innerHTML\s*=\s*[^;]*\$\{\s*(evt\.title|evt\.location|m\.name|m\.jobTitle|n\.title|n\.summary|s\.name)\b/.test(html);
    // Must be false: no raw user field flows into innerHTML; esc()/safeUrl() wrap them all.
    expect(interpolatesUserField).toBe(false);
  });
});
