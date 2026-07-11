/**
 * Threads (Meta) adapter — WRAPS the existing `_shared/threads.ts`
 * helper. Does NOT replace it.
 *
 * The existing helper (ported from Frank's frvnkfrmchicago Threads
 * pipeline) already encodes:
 *   • the 500-char cap
 *   • the brand-voice prompt (banned words + no hashtags + no emojis)
 *   • the two-step container → publish flow body builders
 *
 * Re-implementing any of that here would risk drift. This adapter's
 * job is to translate the platform-neutral PublishPayload into the
 * existing helper's calls and report the result in the unified
 * SocialAdapter shape.
 *
 * 2026 reality (developers.facebook.com/docs/threads/reference/publishing):
 *   • Endpoint 1: POST https://graph.threads.net/v1.0/{user_id}/threads
 *                 → returns { id }  (the creation container)
 *   • Wait:       ~30 seconds for the container to settle
 *   • Endpoint 2: POST https://graph.threads.net/v1.0/{user_id}/threads_publish
 *                 → returns { id }  (the live post)
 *   • Auth:       Meta long-lived access token (refreshes every 60d)
 */

import {
  buildThreadsContainerBody,
  buildThreadsPublishBody,
  cleanThreadsText,
  THREADS_MAX_CHARS,
} from '../threads.ts';
import {
  type PublishPayload,
  type PublishResult,
  type SocialAccount,
  type SocialAdapter,
  httpErrorToResult,
} from './index.ts';

/**
 * Wait between container creation and publish. Meta's docs say
 * "approximately 30 seconds." We honor that; the existing n8n
 * workflow uses the same value.
 */
const THREADS_PUBLISH_WAIT_MS = 30_000;

interface ThreadsMetadata {
  /** Meta-issued user id (numeric string). Required for both API calls. */
  userId?: string;
}

export const threadsAdapter: SocialAdapter = {
  async publish(payload: PublishPayload, account: SocialAccount): Promise<PublishResult> {
    const token = account.oauthAccessToken;
    const meta = account.metadata as ThreadsMetadata;
    const userId = meta?.userId;

    if (!token || !userId) {
      return {
        status: 'failed',
        error: 'threads_missing_token_or_user_id',
      };
    }

    // Reuse the existing helper's cleaner (strips quotes, caps at 500).
    // Note: the brand-voice prompt + Gemini draft happen upstream in
    // the threads-broadcast Edge Function — this adapter only delivers
    // the already-drafted text. The caller in the dispatcher sets
    // payload.text to what Gemini produced (or what Frank wrote).
    const text = cleanThreadsText(payload.text);
    if (!text || text.length === 0) {
      return { status: 'failed', error: 'threads_empty_text' };
    }
    if (text.length > THREADS_MAX_CHARS) {
      // The helper's cap already enforces this — defense in depth.
      return {
        status: 'failed',
        error: `threads_text_too_long: ${text.length}`,
      };
    }

    // ── Step 1: create container ──
    let creationId: string;
    try {
      const { url, params } = buildThreadsContainerBody({
        text,
        accessToken: token,
        userId,
      });
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!resp.ok) {
        return await httpErrorToResult(resp, 'threads_container');
      }
      const json = (await resp.json().catch(() => null)) as { id?: string } | null;
      if (!json?.id) {
        return {
          status: 'failed',
          error: 'threads_container_missing_id',
          responsePayload: json,
        };
      }
      creationId = json.id;
    } catch (err) {
      return {
        status: 'failed',
        error: `threads_container_error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    // ── Step 2: wait for the container to settle ──
    await new Promise((r) => setTimeout(r, THREADS_PUBLISH_WAIT_MS));

    // ── Step 3: publish ──
    try {
      const { url, params } = buildThreadsPublishBody({
        creationId,
        accessToken: token,
        userId,
      });
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!resp.ok) {
        return await httpErrorToResult(resp, 'threads_publish');
      }
      const json = (await resp.json().catch(() => null)) as { id?: string } | null;
      const platformPostId = json?.id;
      const handle = account.handle?.replace(/^@/, '') ?? 'frvnkfrmchicago';
      const permalink = platformPostId
        ? `https://www.threads.net/@${handle}/post/${platformPostId}`
        : undefined;
      return {
        status: 'sent',
        platformPostId,
        permalink,
      };
    } catch (err) {
      return {
        status: 'failed',
        error: `threads_publish_error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },
};
