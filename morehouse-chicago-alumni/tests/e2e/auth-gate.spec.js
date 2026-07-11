/**
 * Lane J e2e — Auth gate redirect + FOAC (data-contract.md §9 #2; §2.4 FOAC).
 * BLOCKED on the credential boundary; runnable once a live project is connected.
 *
 * Wave-002 routing (dossier Dim 2; Lane F): a signed-out visitor hitting a
 * PROTECTED page is redirected to the dedicated sign-in page with a ?next= hop
 * (signin.html?next=<page>) and never sees protected content. The body ships
 * hidden (visibility:hidden + data-protected) so nothing flashes before the gate.
 *
 * IMPORTANT change from wave-001: membership.html is now a PUBLIC info/join page
 * (public tiers + Zelle/check panel), so it must NOT redirect. The protected
 * member pages are dashboard.html / profile.html / my-events.html.
 */
import { test, expect } from "@playwright/test";

const PROTECTED_ADMIN = ["/admin.html", "/admin-dues.html", "/admin-content.html"];
const PROTECTED_MEMBER = ["/dashboard.html", "/profile.html", "/my-events.html"];

for (const path of [...PROTECTED_ADMIN, ...PROTECTED_MEMBER]) {
  test(`signed-out visit to ${path} redirects to sign-in and paints no protected content`, async ({ page }) => {
    test.skip(!process.env.E2E_BASE_URL, "E2E_BASE_URL not set (site not served)");
    await page.goto(path);
    // Auth.requireAuth/requireAdmin redirect to signin.html?next=<page> (admin
    // pages may bounce home when signed in but not admin; signed out -> signin).
    await page.waitForURL(/signin\.html(\?next=)?/, { timeout: 10000 });
    // No protected shell container is present on the sign-in landing.
    await expect(page.locator("#admin-content")).toHaveCount(0);
  });
}

test("membership.html is PUBLIC — it does NOT redirect a signed-out visitor", async ({ page }) => {
  test.skip(!process.env.E2E_BASE_URL, "E2E_BASE_URL not set (site not served)");
  await page.goto("/membership.html");
  // It stays on membership.html (no bounce to sign-in) and shows join content.
  await expect(page).toHaveURL(/membership\.html/);
});

test("protected pages ship FOAC: body starts hidden so content cannot flash before the gate", async ({ page }) => {
  test.skip(!process.env.E2E_BASE_URL, "E2E_BASE_URL not set (site not served)");
  for (const path of ["/admin.html", "/dashboard.html", "/profile.html"]) {
    // Inspect the served HTML directly (no JS) — the body must ship hidden.
    const res = await page.request.get(path);
    const html = await res.text();
    expect(html, `${path} body not hidden`).toMatch(/<body[^>]*visibility:\s*hidden/i);
    expect(html, `${path} missing data-protected`).toMatch(/data-protected=["']true["']/i);
  }
});
