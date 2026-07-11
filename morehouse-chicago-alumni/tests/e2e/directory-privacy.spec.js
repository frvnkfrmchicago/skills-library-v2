/**
 * Lane 7 e2e — Directory zero-PII when signed out (data-contract.md §9 #3).
 * BLOCKED on the credential boundary; runnable once a live project is connected.
 *
 * Asserts: signed-out directory.html shows ONLY the "Members only" gate, issues
 * NO request to the profiles table, and leaks no member name/email/class year.
 */
import { test, expect } from "@playwright/test";

test("signed-out directory shows the gate and never queries profiles", async ({ page }) => {
  const profileRequests = [];
  page.on("request", (req) => {
    if (/\/rest\/v1\/profiles/i.test(req.url())) profileRequests.push(req.url());
  });

  await page.goto("/directory.html");
  // The gate copy is static developer markup with zero PII.
  await expect(page.getByText(/members only/i)).toBeVisible();
  // No PostgREST profiles read should have fired while signed out.
  expect(profileRequests, "profiles must not be queried when signed out").toEqual([]);

  // Defense check: the rendered DOM contains none of the member-card classes.
  await expect(page.locator(".member-card__name")).toHaveCount(0);
});

test("served directory.html HTML embeds no seed member PII", async ({ page }) => {
  const res = await page.request.get("/directory.html");
  const html = await res.text();
  // The signed-out document must not inline any member identity.
  expect(html).not.toMatch(/member-card__name/);
});
