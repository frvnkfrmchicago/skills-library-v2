/**
 * Lane 7 QA — Member CSV import validation (real function bodies under test).
 * Target: scripts/import-members.mjs (Lane 8).
 *
 * The script is a self-executing .mjs that imports @supabase/supabase-js and then
 * runs main() (which hits the network). We cannot import it directly here. Instead
 * we load the file's SOURCE, strip the supabase import and the main() invocation,
 * and evaluate the remainder in a vm sandbox to obtain the ACTUAL validateRow,
 * splitCsvLine, VALID_MEMBERSHIP_STATUSES, and REQUIRED_COLUMNS. These are the real
 * function bodies from Lane 8 — not a re-implementation.
 *
 * Refs: data-contract.md §G3 (anti-mock), §3 enums (membership_status),
 * class_year range 1867-2100; OWASP-style input validation discipline.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import { PROJECT_ROOT } from "../helpers/loadBrowserModule.mjs";

let api;
beforeAll(() => {
  const src = readFileSync(resolve(PROJECT_ROOT, "scripts/import-members.mjs"), "utf-8");
  // Drop the ESM imports (supabase-js + node builtins) and the self-exec tail so
  // only the pure helpers + constants remain; then export them onto globalThis.
  const stripped = src
    .replace(/^\s*import\s.*$/gm, "")            // remove all top-level imports
    .replace(/^main\(\)\.catch[\s\S]*$/m, "");    // remove ONLY the trailing main().catch(...) invocation
  const exposed =
    stripped +
    "\n;globalThis.__api = { validateRow, splitCsvLine, VALID_MEMBERSHIP_STATUSES, REQUIRED_COLUMNS, EMAIL_RE };";

  // The script runs an env-validation block + csvPath resolution at top level.
  // Supply valid-SHAPED env so those top-level guards pass and we reach the
  // function definitions. main() is never invoked, so no network occurs.
  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    process: {
      argv: ["node", "import-members.mjs", "roster.csv"],
      env: {
        SUPABASE_URL: "https://offline-test-ref.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "offline-test-not-a-real-key",
      },
      exit() { throw new Error("process.exit called during helper extraction"); },
    },
    // Shims for node builtins whose imports we stripped (only used at top level).
    resolve: (...p) => p.join("/"),
    readFileSync: () => "",
    createClient: () => ({}),
    globalThis: {},
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(exposed, sandbox, { filename: "import-members.mjs(helpers)" });
  api = sandbox.__api;
});

describe("import-members — constants match the contract", () => {
  it("requires the four roster columns", () => {
    expect(api.REQUIRED_COLUMNS).toEqual(["email", "full_name", "class_year", "chapter_role_title"]);
  });
  it("accepts exactly the §3 membership_status enum values", () => {
    const expected = ["pending", "active", "lapsed", "past_due", "comped", "lifetime", "manual", "suspended", "paused", "expired"];
    expect([...api.VALID_MEMBERSHIP_STATUSES].sort()).toEqual(expected.sort());
  });
});

describe("validateRow — anti-mock guards (§G3)", () => {
  const base = { email: "real.alum@gmail.com", full_name: "Terrence Jamison", class_year: "2001", chapter_role_title: "Member", membership_status: "active" };

  it("passes a clean, real-format row", () => {
    expect(api.validateRow({ ...base })).toEqual([]);
  });
  it("rejects a john-doe placeholder name", () => {
    const errs = api.validateRow({ ...base, full_name: "John Doe" });
    expect(errs.join(" ")).toMatch(/placeholder/i);
  });
  it("rejects an example.com placeholder email", () => {
    const errs = api.validateRow({ ...base, email: "someone@example.com" });
    expect(errs.join(" ")).toMatch(/placeholder email/i);
  });
  it("rejects a test@test placeholder email", () => {
    const errs = api.validateRow({ ...base, email: "test@test.org" });
    expect(errs.join(" ")).toMatch(/placeholder email/i);
  });
  it("rejects the literal 'placeholder' as a name", () => {
    const errs = api.validateRow({ ...base, full_name: "placeholder" });
    expect(errs.join(" ")).toMatch(/placeholder/i);
  });
});

describe("validateRow — format guards", () => {
  const base = { email: "real.alum@gmail.com", full_name: "Terrence Jamison", class_year: "2001", chapter_role_title: "Member", membership_status: "active" };

  it("rejects a malformed email", () => {
    expect(api.validateRow({ ...base, email: "not-an-email" }).join(" ")).toMatch(/invalid email/i);
  });
  it("rejects class_year below 1867", () => {
    expect(api.validateRow({ ...base, class_year: "1700" }).join(" ")).toMatch(/class_year/);
  });
  it("rejects class_year above 2100", () => {
    expect(api.validateRow({ ...base, class_year: "3000" }).join(" ")).toMatch(/class_year/);
  });
  it("accepts the class_year boundaries 1867 and 2100", () => {
    expect(api.validateRow({ ...base, class_year: "1867" })).toEqual([]);
    expect(api.validateRow({ ...base, class_year: "2100" })).toEqual([]);
  });
  it("rejects a too-short name", () => {
    expect(api.validateRow({ ...base, full_name: "A" }).join(" ")).toMatch(/full_name/);
  });
  it("rejects an empty chapter_role_title", () => {
    expect(api.validateRow({ ...base, chapter_role_title: "" }).join(" ")).toMatch(/chapter_role_title/);
  });
  it("rejects an invalid membership_status enum value", () => {
    expect(api.validateRow({ ...base, membership_status: "platinum" }).join(" ")).toMatch(/membership_status/);
  });
});

describe("splitCsvLine — quoted-field handling", () => {
  it("splits a simple line", () => {
    expect(api.splitCsvLine("a,b,c")).toEqual(["a", "b", "c"]);
  });
  it("keeps commas that are inside quotes", () => {
    expect(api.splitCsvLine('a,"b,c",d')).toEqual(["a", "b,c", "d"]);
  });
  it("handles a quoted role title with a comma", () => {
    expect(api.splitCsvLine('grad@gmail.com,"Carter, James",2003,"Secretary, Board"')).toEqual([
      "grad@gmail.com", "Carter, James", "2003", "Secretary, Board",
    ]);
  });
});
