/**
 * _shared/supabase.ts — service-role Supabase client factory.
 *
 * The service-role key BYPASSES RLS. It is read from Deno.env ONLY and used
 * exclusively inside Edge Functions:
 *  - paypal-checkout: reads membership_plans / members / events /
 *    event_registrations to resolve amounts server-side (payments are
 *    service-role-only for online writes by policy).
 *  - paypal-webhook: performs ALL reconciliation writes.
 *
 * persistSession:false — Edge Functions are stateless; never write a session to
 * disk. autoRefreshToken:false — no token lifecycle in a one-shot handler.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error(
      "CONFIG_ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Build a request-scoped Supabase client that runs UNDER the caller's JWT
 * (Authorization: Bearer <jwt>). Used only to resolve the authenticated user
 * for dues/event-ticket flows via getUser() — a real server-side identity
 * check, not a trusted-claim read. Returns null if no bearer token present.
 */
export function getUserScopedClient(req: Request): SupabaseClient | null {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) {
    throw new Error("CONFIG_ERROR: SUPABASE_URL or SUPABASE_ANON_KEY is not set");
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });
}

export type { SupabaseClient };
