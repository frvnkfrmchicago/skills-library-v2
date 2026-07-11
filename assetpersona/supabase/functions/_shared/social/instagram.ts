/**
 * Instagram adapter — Graph API v21 container model.
 *
 * 2026 reality:
 *   • Endpoint 1: POST https://graph.facebook.com/v21.0/{ig_user_id}/media
 *                 → returns { id }  (the media container)
 *   • Endpoint 2: POST https://graph.facebook.com/v21.0/{ig_user_id}/media_publish
 *                 → returns { id }  (the published post)
 *   • Auth:       Meta long-lived access token, scope ig_content_publish
 *   • Requires:   Instagram Business or Creator account linked to a
 *                 Facebook Page. Image post = `image_url` is required
 *                 (no inline upload — Meta downloads from the URL).
 *   • Gotcha:     Meta App Review is required before posting to a
 *                 non-test account. The adapter ships and works as
 *                 soon as review clears.
 *
 * Text-only posts are NOT supported by the publishing API; Instagram
 * publishing always requires at least one image or video. The
 * adapter returns `failed` when no `mediaUrls[0]` is provided.
 */

import {
  type PublishPayload,
  type PublishResult,
  type SocialAccount,
  type SocialAdapter,
  truncateOnWord,
  httpErrorToResult,
} from './index.ts';

const INSTAGRAM_MAX_CAPTION = 2200;
const INSTAGRAM_API_VERSION = 'v21.0';
const INSTAGRAM_BASE = `https://graph.facebook.com/${INSTAGRAM_API_VERSION}`;
const INSTAGRAM_CONTAINER_WAIT_MS = 5_000;

interface InstagramMetadata {
  /** Instagram Business Account id (NOT the user-facing handle). */
  igUserId?: string;
}

export const instagramAdapter: SocialAdapter = {
  async publish(payload: PublishPayload, account: SocialAccount): Promise<PublishResult> {
    const token = account.oauthAccessToken;
    const meta = account.metadata as InstagramMetadata;
    const igUserId = meta?.igUserId;

    if (!token || !igUserId) {
      return {
        status: 'failed',
        error: 'instagram_missing_token_or_user_id',
      };
    }

    const imageUrl = payload.mediaUrls?.[0];
    if (!imageUrl) {
      return {
        status: 'failed',
        error: 'instagram_requires_image_url',
      };
    }

    const caption = truncateOnWord(payload.text, INSTAGRAM_MAX_CAPTION);

    // ── Step 1: create container ──
    let creationId: string;
    try {
      const params = new URLSearchParams({
        image_url: imageUrl,
        caption,
        access_token: token,
      });
      const resp = await fetch(`${INSTAGRAM_BASE}/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!resp.ok) {
        return await httpErrorToResult(resp, 'instagram_container');
      }
      const json = (await resp.json().catch(() => null)) as { id?: string } | null;
      if (!json?.id) {
        return {
          status: 'failed',
          error: 'instagram_container_missing_id',
          responsePayload: json,
        };
      }
      creationId = json.id;
    } catch (err) {
      return {
        status: 'failed',
        error: `instagram_container_error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    // ── Step 2: short wait for Meta to fetch the media URL ──
    await new Promise((r) => setTimeout(r, INSTAGRAM_CONTAINER_WAIT_MS));

    // ── Step 3: publish ──
    try {
      const params = new URLSearchParams({
        creation_id: creationId,
        access_token: token,
      });
      const resp = await fetch(`${INSTAGRAM_BASE}/${igUserId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!resp.ok) {
        return await httpErrorToResult(resp, 'instagram_publish');
      }
      const json = (await resp.json().catch(() => null)) as { id?: string } | null;
      const platformPostId = json?.id;
      const handle = account.handle?.replace(/^@/, '') ?? '';
      const permalink = handle
        ? `https://www.instagram.com/${handle}/`
        : undefined;
      return {
        status: 'sent',
        platformPostId,
        permalink,
      };
    } catch (err) {
      return {
        status: 'failed',
        error: `instagram_publish_error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
};
