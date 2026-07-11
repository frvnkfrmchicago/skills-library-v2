/**
 * Mastodon adapter — per-instance OAuth.
 *
 * 2026 reality:
 *   • Endpoint: POST {instance_base}/api/v1/statuses
 *   • Auth:     OAuth 2.0 Bearer token, scope `write:statuses`
 *   • Cap:      500 characters by default; some instances raise it.
 *               We treat 500 as the safe ceiling regardless of
 *               instance config.
 *   • Federation: Each Mastodon server is independent. The instance
 *               URL (e.g. https://mastodon.social) lives in
 *               account.metadata.instanceBase. Frank picks which
 *               instance to post from and registers an OAuth app
 *               there.
 *
 * No partner verification or app review. Live as soon as Frank
 * picks an instance and pastes a token.
 */

import {
  type PublishPayload,
  type PublishResult,
  type SocialAccount,
  type SocialAdapter,
  truncateOnWord,
  httpErrorToResult,
} from './index.ts';

const MASTODON_DEFAULT_MAX_CHARS = 500;

interface MastodonMetadata {
  /** Instance base URL — e.g. https://mastodon.social (no trailing slash). */
  instanceBase?: string;
  /** Optional override if the instance allows posts longer than 500. */
  maxChars?: number;
}

export const mastodonAdapter: SocialAdapter = {
  async publish(payload: PublishPayload, account: SocialAccount): Promise<PublishResult> {
    const token = account.oauthAccessToken;
    const meta = account.metadata as MastodonMetadata;
    const instanceBase = meta?.instanceBase?.replace(/\/$/, '');

    if (!token || !instanceBase) {
      return {
        status: 'failed',
        error: 'mastodon_missing_token_or_instance',
      };
    }

    const cap = meta?.maxChars ?? MASTODON_DEFAULT_MAX_CHARS;
    const tail = payload.sourceUrl ? `\n\n${payload.sourceUrl}` : '';
    const status = truncateOnWord(payload.text + tail, cap);
    if (!status || status.trim().length === 0) {
      return { status: 'failed', error: 'mastodon_empty_status' };
    }

    let resp: Response;
    try {
      resp = await fetch(`${instanceBase}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          // Idempotency-Key prevents the same scheduled_post from
          // double-publishing if the dispatcher retries mid-flight.
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          status,
          visibility: 'public',
        }),
      });
    } catch (err) {
      return {
        status: 'failed',
        error: `mastodon_fetch_error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    if (!resp.ok) {
      return await httpErrorToResult(resp, 'mastodon');
    }

    const json = (await resp.json().catch(() => null)) as {
      id?: string;
      url?: string;
    } | null;

    const platformPostId = json?.id;
    const permalink = json?.url;

    if (!platformPostId) {
      return {
        status: 'failed',
        error: 'mastodon_missing_id_in_response',
        responsePayload: json,
      };
    }

    return {
      status: 'sent',
      platformPostId,
      permalink,
    };
  },
};
