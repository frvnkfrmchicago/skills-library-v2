/**
 * Lane 7 QA — Directory member-link scheme guard (real source under test).
 * Target: js/directory.js (Lane 5) — _safeHttpUrl and _initials.
 *
 * Security context (data-contract.md §9 #7): a member's linkedin_url is
 * member-controlled. It is rendered as an <a href>; only http(s) absolute URLs
 * may pass, so a `javascript:` / `data:` value cannot become a clickable XSS.
 * The privacy gate itself (no PII query when signed out) is a live-backend item
 * verified in the Playwright/manual spec (tests/e2e), not here.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { loadBrowserModule } from "../helpers/loadBrowserModule.mjs";

let Directory;
beforeAll(() => {
  Directory = loadBrowserModule("js/directory.js", "Directory");
});

describe("Directory._safeHttpUrl (link scheme allowlist — SECURITY)", () => {
  it("accepts absolute http and https URLs", () => {
    expect(Directory._safeHttpUrl("https://linkedin.com/in/someone")).toBe(
      "https://linkedin.com/in/someone",
    );
    expect(Directory._safeHttpUrl("http://example.org/")).toBe(
      "http://example.org/",
    );
  });
  it("rejects javascript: scheme", () => {
    expect(Directory._safeHttpUrl("javascript:alert(document.cookie)")).toBeNull();
    expect(Directory._safeHttpUrl("JavaScript:alert(1)")).toBeNull();
  });
  it("rejects data: and other dangerous schemes", () => {
    expect(Directory._safeHttpUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(Directory._safeHttpUrl("vbscript:msgbox(1)")).toBeNull();
    expect(Directory._safeHttpUrl("file:///etc/passwd")).toBeNull();
  });
  it("rejects relative / non-URL / empty / non-string values", () => {
    expect(Directory._safeHttpUrl("/in/someone")).toBeNull();
    expect(Directory._safeHttpUrl("not a url")).toBeNull();
    expect(Directory._safeHttpUrl("")).toBeNull();
    expect(Directory._safeHttpUrl(null)).toBeNull();
    expect(Directory._safeHttpUrl(undefined)).toBeNull();
    expect(Directory._safeHttpUrl(12345)).toBeNull();
  });
  it("trims surrounding whitespace before validating", () => {
    expect(Directory._safeHttpUrl("  https://example.com/x  ")).toBe(
      "https://example.com/x",
    );
  });
});

describe("Directory._initials", () => {
  it("derives up to three uppercase initials", () => {
    expect(Directory._initials("Marcus Williams")).toBe("MW");
    expect(Directory._initials("James Carter III")).toBe("JCI");
    expect(Directory._initials("David Osei-Mensah Junior Senior")).toBe("DOJ");
  });
  it("returns an em dash for empty names", () => {
    expect(Directory._initials("")).toBe("—");
    expect(Directory._initials(null)).toBe("—");
  });
});
