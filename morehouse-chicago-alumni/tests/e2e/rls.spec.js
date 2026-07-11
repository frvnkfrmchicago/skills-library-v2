/**
 * Lane 7 e2e — RLS negative + positive probes (data-contract.md §6, §9 #9).
 * BLOCKED on the credential boundary; runnable once a live project is connected.
 *
 * Uses ONLY the public anon key (read from the deployed js/config.js at runtime)
 * and, where provided, a member JWT. Never embeds a service-role key (§9 #1).
 *
 * Anon SHOULD read: membership_plans (active), events (published+public),
 *   content_items (approved/auto_approved).
 * Anon SHOULD NOT read: profiles, members, dues_invoices, payments,
 *   event_registrations, content_sources, audit_log, paypal_webhook_events.
 * A member SHOULD NOT be able to self-elevate profiles.role to 'admin'.
 */
import { test, expect } from "@playwright/test";

// Pull the live anon config the deployed site already ships.
async function getAnonConfig(page) {
  await page.goto("/js/config.js");
  const body = await page.locator("body").innerText();
  const url = body.match(/SUPABASE_URL\s*=\s*'([^']+)'/)?.[1];
  const key = body.match(/SUPABASE_ANON_KEY\s*=\s*'([^']+)'/)?.[1];
  return { url, key };
}

function restGet(request, base, key, table, query = "select=*&limit=1") {
  return request.get(`${base}/rest/v1/${table}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
}

test.describe("anon read surface", () => {
  test("anon CAN read active plans / published public events / approved content", async ({ page, request }) => {
    const { url, key } = await getAnonConfig(page);
    test.skip(!url || url.includes("YOUR-PROJECT-REF"), "live config not set");

    const plans = await restGet(request, url, key, "membership_plans", "select=id,active&active=eq.true&limit=1");
    expect(plans.status(), "plans readable").toBe(200);

    const events = await restGet(request, url, key, "events", "select=id,status,visibility&status=eq.published&visibility=eq.public&limit=1");
    expect(events.status(), "public events readable").toBe(200);

    const content = await restGet(request, url, key, "content_items", "select=id,approval_status&approval_status=in.(approved,auto_approved)&limit=1");
    expect(content.status(), "approved content readable").toBe(200);
  });

  const PRIVATE_TABLES = [
    "profiles", "members", "dues_invoices", "payments",
    // paypal_webhook_events: renamed from stripe_webhook_events by migration 011
    // (RLS on, no policies -> service-role only). Anon must read ZERO rows.
    "event_registrations", "content_sources", "audit_log", "paypal_webhook_events",
  ];
  for (const table of PRIVATE_TABLES) {
    test(`anon read of ${table} returns ZERO rows (RLS default-deny)`, async ({ page, request }) => {
      const { url, key } = await getAnonConfig(page);
      test.skip(!url || url.includes("YOUR-PROJECT-REF"), "live config not set");
      const res = await restGet(request, url, key, table);
      // With RLS and no anon policy, PostgREST returns 200 + [] (or 401/403 on
      // some configs). The invariant is: no rows are disclosed.
      if (res.status() === 200) {
        const rows = await res.json();
        expect(Array.isArray(rows) ? rows.length : 0, `${table} disclosed rows to anon`).toBe(0);
      } else {
        expect([401, 403]).toContain(res.status());
      }
    });
  }
});

test("a member cannot self-elevate profiles.role to admin (§6 WITH CHECK)", async ({ page, request }) => {
  const { url, key } = await getAnonConfig(page);
  const email = process.env.E2E_MEMBER_EMAIL;
  const password = process.env.E2E_MEMBER_PASSWORD;
  test.skip(!url || !email || !password, "live config + member creds required");

  // Sign in via the GoTrue password grant to get a member JWT.
  const auth = await request.post(`${url}/auth/v1/token?grant_type=password`, {
    headers: { apikey: key, "Content-Type": "application/json" },
    data: { email, password },
  });
  expect(auth.status(), "member sign-in").toBe(200);
  const { access_token, user } = await auth.json();

  // Attempt the forbidden update: set my own role to 'admin'.
  const patch = await request.patch(`${url}/rest/v1/profiles?id=eq.${user.id}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    data: { role: "admin" },
  });
  // The WITH CHECK pins role to the stored value: the row must NOT become admin.
  // PostgREST returns 200 with [] (no row passed the check) or an error; either
  // way, a follow-up read must still show a non-admin role.
  const after = await request.get(`${url}/rest/v1/profiles?id=eq.${user.id}&select=role`, {
    headers: { apikey: key, Authorization: `Bearer ${access_token}` },
  });
  const rows = await after.json();
  expect(rows?.[0]?.role, "self-elevation must be blocked").not.toBe("admin");
  // (patch.status may be 200 with empty body; the authoritative check is the read above.)
  void patch;
});
