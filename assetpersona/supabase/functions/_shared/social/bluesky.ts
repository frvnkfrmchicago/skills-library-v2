/**
 * Bluesky adapter — AT Protocol `com.atproto.repo.createRecord`.
 *
 * 2026 reality (docs.bsky.app/docs/advanced-guides/rate-limits):
 *   • Auth model: app passwords (NOT OAuth). Frank generates one at
 *                 bsky.app/settings/app-passwords and stores it in
 *                 social_accounts.oauth_access_token. The adapter
 *                 exchanges (handle, app password) for a session JWT
 *                 at runtime via `com.atproto.server.createSession`.
 *   • Endpoint:   POST https://bsky.social/xrpc/com.atproto.repo.createRecord
 *   • Limits:     5,000 points/hour and 35,000 points/day. createRecord
 *                 costs 3 points. Conservatively this lane uses 1 per
 *                 publish cycle.
 *   • Cap:        300 graphemes per post. We use char count as a
 *                 close-enough proxy because grapheme segmentation
 *                 in Deno would require an extra dep.
 *
 * No partner verification needed. Live as soon as Frank pastes an
 * app password into the social_accounts row.
 */

import {
  type PublishPayload,
  type PublishResult,
  type SocialAccount,
  type SocialAdapter,
  truncateOnWord,
  httpErrorToResult,
} from './index.ts';

const BLUESKY_MAX_CHARS = 300;
const BLUESKY_BASE = 'https://bsky.social/xrpc';

export const blueskyAdapter: SocialAdapter = {
  async publish(payload: PublishPayload, account: SocialAccount): Promise<PublishResult> {
    const handle = account.handle;
    const appPassword = account.oauthAccessToken;
    if (!handle || !appPassword) {
      return {
        status: 'failed',
        error: 'bluesky_missing_handle_or_app_password',
      };
    }

    // ── 1. Create session ──
    let sessionResp: Response;
    try {
      sessionResp = await fetch(`${BLUESKY_BASE}/com.atproto.server.createSession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: handle, password: appPassword }),
      });
    } catch (err) {
      return {
        status: 'failed',
        error: `bluesky_session_fetch_error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    if (!sessionResp.ok) {
      return await httpErrorToResult(sessionResp, 'bluesky_session');
    }

    const session = (await sessionResp.json().catch(() => null)) as {
      accessJwt?: string;
      did?: string;
      handle?: string;
    } | null;

    if (!session?.accessJwt || !session?.did) {
      return {
        status: 'failed',
        error: 'bluesky_session_missing_fields',
        responsePayload: session,
      };
    }

    // ── 2. Create record ──
    const text = truncateOnWord(payload.text, BLUESKY_MAX_CHARS);
    const record = {
      $type: 'app.bsky.feed.post',
      text,
      createdAt: new Date().toISOString(),
      langs: ['en'],
    };

    const body = {
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record,
    };

    let createResp: Response;
    try {
      createResp = await fetch(`${BLUESKY_BASE}/com.atproto.repo.createRecord`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessJwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      return {
        status: 'failed',
        error: `bluesky_create_fetch_error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    if (!createResp.ok) {
      return await httpErrorToResult(createResp, 'bluesky_create');
    }

    const created = (await createResp.json().catch(() => null)) as {
      uri?: string;
      cid?: string;
    } | null;

    const uri = created?.uri;
    if (!uri) {
      return {
        status: 'failed',
        error: 'bluesky_missing_uri_in_response',
        responsePayload: created,
      };
    }

    // Bluesky URI format: at://did:plc:.../app.bsky.feed.post/{rkey}
    // Permalink format:   https://bsky.app/profile/{handle}/post/{rkey}
    const rkey = uri.split('/').pop();
    const permalink = rkey
      ? `https://bsky.app/profile/${session.handle ?? handle}/post/${rkey}`
      : undefined;

    return {
      status: 'sent',
      platformPostId: uri,
      permalink,
    };
  },
};
