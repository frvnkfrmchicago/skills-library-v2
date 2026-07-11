/**
 * LinkedIn adapter — Posts API v2.
 *
 * 2026 reality (zernio.com/blog/linkedin-posting-api):
 *   • Endpoint: POST https://api.linkedin.com/v2/posts
 *   • Header:   LinkedIn-Version: 202508 (sliding monthly snapshot)
 *   • Auth:     OAuth 2.0 PKCE — Bearer access_token in Authorization
 *   • Scopes:   w_member_social (required), w_organization_social (org)
 *   • Gotcha:   Posting from a Page (organization URN) requires
 *               Marketing Developer Platform partner verification.
 *               Personal-profile posting via `w_member_social` works
 *               with a normal app. The adapter handles both — the
 *               account.metadata.author field decides which URN is
 *               used as `author`.
 *
 * The adapter ships posting-capable code today. Live posting on the
 * org URN unblocks when Meta/Microsoft partner verification clears
 * (tracked in the lane brief's Remaining Gaps).
 */

import {
  type PublishPayload,
  type PublishResult,
  type SocialAccount,
  type SocialAdapter,
  truncateOnWord,
  httpErrorToResult,
} from './index.ts';

const LINKEDIN_MAX_CHARS = 3000;
const LINKEDIN_API_VERSION = '202508';
const LINKEDIN_POSTS_ENDPOINT = 'https://api.linkedin.com/v2/posts';

interface LinkedInMetadata {
  /** Either `urn:li:person:{id}` or `urn:li:organization:{id}`. */
  author?: string;
}

export const linkedinAdapter: SocialAdapter = {
  async publish(payload: PublishPayload, account: SocialAccount): Promise<PublishResult> {
    const token = account.oauthAccessToken;
    if (!token) {
      return { status: 'failed', error: 'linkedin_missing_access_token' };
    }

    const meta = account.metadata as LinkedInMetadata;
    const author = meta?.author;
    if (!author || !author.startsWith('urn:li:')) {
      return {
        status: 'failed',
        error: 'linkedin_missing_author_urn',
      };
    }

    // Trailing source link is a LinkedIn norm — Posts API renders it
    // as a card when commentary contains the URL. Append only if the
    // payload provides one and the combined length still fits.
    const tail = payload.sourceUrl ? `\n\n${payload.sourceUrl}` : '';
    const commentary = truncateOnWord(
      payload.text + tail,
      LINKEDIN_MAX_CHARS
    );

    const body = {
      author,
      commentary,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    };

    let resp: Response;
    try {
      resp = await fetch(LINKEDIN_POSTS_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': LINKEDIN_API_VERSION,
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      return {
        status: 'failed',
        error: `linkedin_fetch_error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    if (!resp.ok) {
      return await httpErrorToResult(resp, 'linkedin');
    }

    // Created post URN is in the `x-restli-id` response header.
    const postUrn = resp.headers.get('x-restli-id') || resp.headers.get('X-RestLi-Id') || '';
    const platformPostId = postUrn || undefined;
    const permalink = postUrn
      ? `https://www.linkedin.com/feed/update/${encodeURIComponent(postUrn)}/`
      : undefined;

    return {
      status: 'sent',
      platformPostId,
      permalink,
    };
  },
};
