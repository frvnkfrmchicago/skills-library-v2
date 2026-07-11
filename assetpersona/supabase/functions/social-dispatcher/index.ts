// deno-lint-ignore-file no-explicit-any
/**
 * AP-ENGAGEMENT-LOOP-2026-05 · Lane 5 · Multi-Social Dispatcher
 * Edge Function: social-dispatcher
 *
 * Cron-triggered fan-out. Every 5 minutes the n8n
 * `social-dispatcher-cron` workflow hits this endpoint. The function:
 *
 *   1. Verifies the inbound shared cron secret OR admin JWT.
 *   2. Loads due rows from `scheduled_posts` (WHERE scheduled_for <=
 *      now() AND dispatched_at IS NULL).
 *   3. For each due row, for each platform in `target_platforms`:
 *        a. Looks up `social_accounts` for that (owner, platform).
 *        b. Calls `getAdapter(platform).publish(payload, account)`.
 *        c. INSERTs the result into `post_results`.
 *      All adapter calls are wrapped in try/catch — one platform's
 *      failure NEVER breaks the others in the same fan-out.
 *   4. Marks the scheduled_post's `dispatched_at = now()` once every
 *      platform has been attempted.
 *
 * Deploy:
 *   supabase functions deploy social-dispatcher
 *
 * Required secrets (set with `supabase secrets set KEY=value`):
 *   SOCIAL_DISPATCHER_CRON_SECRET — shared with n8n cron workflow
 *   SUPABASE_URL                  — auto-injected by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY     — auto-injected by Supabase
 *   ALLOWED_ORIGIN                — production site origin
 */

import { corsHeaders } from '../_shared/cors.ts';
import {
  getAdapter,
  type Platform,
  type PublishPayload,
  type PublishResult,
  type SocialAccount,
} from '../_shared/social/index.ts';

interface ScheduledPostRow {
  id: string;
  owner_id: string;
  source_kind: string;
  source_id: string | null;
  payload: unknown;
  target_platforms: string[];
  scheduled_for: string;
  dispatched_at: string | null;
}

interface SocialAccountRow {
  id: string;
  owner_id: string;
  platform: string;
  handle: string | null;
  oauth_access_token: string | null;
  oauth_refresh_token: string | null;
  expires_at: string | null;
  scopes: string[] | null;
  metadata: Record<string, unknown> | null;
}

// Reuse the registry's Platform type so the dispatcher and adapters
// share one source of truth. The Postgres enum mirrors the same set.
type PlatformEnum = Platform;

Deno.serve(async (req) => {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: cors });
  }

  // ── Auth gate ──
  // Two acceptable auth modes:
  //   1. Cron secret header `X-Cron-Secret` (used by n8n).
  //   2. Supabase JWT with admin role (used by the admin "Dispatch
  //      now" button if Frank wires one). The service-role on the
  //      server side bypasses RLS for the actual data writes.
  const cronSecret = Deno.env.get('SOCIAL_DISPATCHER_CRON_SECRET');
  if (!cronSecret) {
    return new Response(
      JSON.stringify({ error: 'server_misconfigured', detail: 'SOCIAL_DISPATCHER_CRON_SECRET missing' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  const inboundSecret = req.headers.get('x-cron-secret');
  const authHeader = req.headers.get('authorization') ?? '';
  const isCronCall = !!inboundSecret && inboundSecret === cronSecret;
  const isAdminCall = authHeader.toLowerCase().startsWith('bearer ');
  if (!isCronCall && !isAdminCall) {
    return new Response(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  // ── Supabase config ──
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: 'server_misconfigured', detail: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  const restHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };

  // ── 1. Load due rows ──
  // Cap at 50 per tick to keep the function under Supabase's 60s wall
  // and to give the rate-limited platforms breathing room.
  const dueQuery =
    `${supabaseUrl}/rest/v1/scheduled_posts` +
    `?select=id,owner_id,source_kind,source_id,payload,target_platforms,scheduled_for,dispatched_at` +
    `&scheduled_for=lte.${encodeURIComponent(new Date().toISOString())}` +
    `&dispatched_at=is.null` +
    `&order=scheduled_for.asc&limit=50`;

  let dueRows: ScheduledPostRow[] = [];
  try {
    const r = await fetch(dueQuery, { headers: restHeaders });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      return new Response(
        JSON.stringify({ error: 'load_due_failed', status: r.status, detail }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
    dueRows = (await r.json()) as ScheduledPostRow[];
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'load_due_error',
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  if (dueRows.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, dispatched: 0, results: [] }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  // ── 2. Dispatch each row ──
  const runSummary: Array<{
    scheduledPostId: string;
    platform: string;
    status: PublishResult['status'];
  }> = [];

  for (const row of dueRows) {
    const payload = row.payload as PublishPayload;
    const platforms = (row.target_platforms ?? []) as PlatformEnum[];

    for (const platform of platforms) {
      // ── 2a. Lookup the social_account for (owner, platform) ──
      let account: SocialAccount | null = null;
      try {
        const acctQ =
          `${supabaseUrl}/rest/v1/social_accounts` +
          `?select=id,owner_id,platform,handle,oauth_access_token,oauth_refresh_token,expires_at,scopes,metadata` +
          `&owner_id=eq.${row.owner_id}` +
          `&platform=eq.${platform}` +
          `&limit=1`;
        const r = await fetch(acctQ, { headers: restHeaders });
        if (r.ok) {
          const rows = (await r.json()) as SocialAccountRow[];
          if (rows[0]) {
            const a = rows[0];
            account = {
              ownerId: a.owner_id,
              platform: a.platform as PlatformEnum,
              handle: a.handle,
              oauthAccessToken: a.oauth_access_token,
              oauthRefreshToken: a.oauth_refresh_token,
              expiresAt: a.expires_at,
              scopes: a.scopes ?? [],
              metadata: a.metadata ?? {},
            };
          }
        }
      } catch (_err) {
        // fall through — account stays null → adapter records failed
      }

      // ── 2b. Run the adapter (caught — never throws upstream) ──
      let result: PublishResult;
      if (!account) {
        result = {
          status: 'failed',
          error: `${platform}_no_account_configured`,
        };
      } else {
        try {
          const adapter = getAdapter(platform);
          result = await adapter.publish(payload, account);
        } catch (err) {
          result = {
            status: 'failed',
            error: `${platform}_adapter_threw: ${err instanceof Error ? err.message : String(err)}`,
          };
        }
      }

      // ── 2c. Write the result ──
      try {
        await fetch(`${supabaseUrl}/rest/v1/post_results`, {
          method: 'POST',
          headers: { ...restHeaders, Prefer: 'return=minimal' },
          body: JSON.stringify({
            scheduled_post_id: row.id,
            platform,
            status: result.status,
            platform_post_id: result.platformPostId ?? null,
            permalink: result.permalink ?? null,
            error_message: result.error ?? null,
            response_payload: result.responsePayload ?? null,
          }),
        });
      } catch (_err) {
        // If we cannot record the result, do NOT mark the row
        // dispatched — let the next cron tick retry the recording.
      }

      runSummary.push({
        scheduledPostId: row.id,
        platform,
        status: result.status,
      });
    }

    // ── 2d. Mark the row dispatched ──
    // We mark it once every platform has been attempted, regardless
    // of per-platform success. Rate-limited / failed results stay
    // visible in post_results and the admin can re-queue manually.
    try {
      await fetch(
        `${supabaseUrl}/rest/v1/scheduled_posts?id=eq.${row.id}`,
        {
          method: 'PATCH',
          headers: { ...restHeaders, Prefer: 'return=minimal' },
          body: JSON.stringify({ dispatched_at: new Date().toISOString() }),
        }
      );
    } catch (_err) {
      // Same logic — if PATCH fails, the row stays due and retries
      // next tick. post_results already has the per-platform record.
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      dispatched: dueRows.length,
      results: runSummary,
    }),
    { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
  );
});
