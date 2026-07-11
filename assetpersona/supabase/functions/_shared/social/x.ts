/**
 * X (Twitter) adapter — API v2.
 *
 * 2026 reality (zernio.com/blog/twitter-api-pricing):
 *   • Endpoint: POST https://api.x.com/2/tweets
 *   • Auth:     OAuth 2.0 user-context Bearer (PKCE app)
 *   • Scopes:   tweet.write, tweet.read, users.read, offline.access
 *   • Pricing:  $0.01 / post pay-per-use OR $200/mo Basic plan with
 *               3,000 posts/month cap. Free tier ended in 2025.
 *   • Quota:    Exceeding the plan returns 403 with body containing
 *               "Usage cap exceeded". The adapter maps that → status
 *               `rate_limited` so the dispatcher leaves the
 *               scheduled_post un-dispatched and tries on the next
 *               cron tick (or surfaces the error in the monitor).
 *
 * Frank decides per-month whether to enable posting. The adapter
 * ships ready — flipping it on means setting the access token in
 * `social_accounts` and accepting the platform pricing.
 */

import {
  type PublishPayload,
  type PublishResult,
  type SocialAccount,
  type SocialAdapter,
  truncateOnWord,
  httpErrorToResult,
} from './index.ts';

const X_MAX_CHARS = 280;
const X_TWEETS_ENDPOINT = 'https://api.x.com/2/tweets';

interface XMetadata {
  /** Numeric user id. Used to build the permalink. */
  userId?: string;
}

export const xAdapter: SocialAdapter = {
  async publish(payload: PublishPayload, account: SocialAccount): Promise<PublishResult> {
    const token = account.oauthAccessToken;
    if (!token) {
      return { status: 'failed', error: 'x_missing_access_token' };
    }

    // X's hard cap is 280 for the free post tier. Premium accounts
    // can post longer but we treat 280 as the universal ceiling.
    const text = truncateOnWord(payload.text, X_MAX_CHARS);
    if (!text || text.trim().length === 0) {
      return { status: 'failed', error: 'x_empty_text' };
    }

    let resp: Response;
    try {
      resp = await fetch(X_TWEETS_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
    } catch (err) {
      return {
        status: 'failed',
        error: `x_fetch_error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    if (!resp.ok) {
      // Defense-in-depth: re-check 403 quota wording explicitly. The
      // shared helper handles 429 + 403-quota generically; this catches
      // X's specific "Usage cap exceeded" phrasing too.
      const detail = await resp.clone().text().catch(() => '');
      if (resp.status === 403 && /usage\s+cap|quota|monthly/i.test(detail)) {
        return {
          status: 'rate_limited',
          error: 'x_quota_exceeded',
          responsePayload: { status: 403, body: detail.slice(0, 512) },
        };
      }
      return await httpErrorToResult(resp, 'x');
    }

    const json = (await resp.json().catch(() => null)) as {
      data?: { id?: string; text?: string };
    } | null;

    const tweetId = json?.data?.id;
    if (!tweetId) {
      return {
        status: 'failed',
        error: 'x_missing_tweet_id_in_response',
        responsePayload: json,
      };
    }

    const handle = account.handle?.replace(/^@/, '') ?? 'i';
    return {
      status: 'sent',
      platformPostId: tweetId,
      permalink: `https://x.com/${handle}/status/${tweetId}`,
    };
  },
};
