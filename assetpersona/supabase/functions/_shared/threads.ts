/**
 * Threads (Meta) — shared helpers for the assetpersona threads-broadcast pipeline.
 *
 * Ported from Frank's frvnkfrmchicago-threads.json workflow. Brand voice prompt is
 * lifted verbatim — the banned-words list, the 500-char cap, the no-hashtags / no-emojis
 * rule, the "text a friend who codes" voice. The trigger is what changed: instead of
 * a 30-min cron over a hardcoded weekly calendar, this fires on publish events from
 * the `modules` and `content_hub_bulletins` tables.
 *
 * Threads API flow stays identical:
 *   1. POST /v1.0/{user_id}/threads          → returns { id } (the creation container)
 *   2. Wait ~30 seconds (Meta needs the container to settle)
 *   3. POST /v1.0/{user_id}/threads_publish  → publishes the container
 *
 * Reference: https://developers.facebook.com/docs/threads/posts
 */

/** Hard ceiling per Threads — match the existing frvnkfrmchicago cap. */
export const THREADS_MAX_CHARS = 500;

/**
 * Brand-voice system prompt — verbatim from frvnkfrmchicago-threads.json.
 *
 * Topic-slot variables (`{{ tool }}` / `{{ type }}` / `{{ fmt }}` / `{{ desc }}` /
 * `{{ keywords }}`) are replaced with publish-event context: bulletin title becomes
 * the topic, summary becomes the description, severity drives format length.
 *
 * The banned-words list is non-negotiable — those are the AI-marketing phrases Frank
 * refuses to ever sound like. Keep this list in sync with `copywriting-enforcing`
 * skill's ban list.
 */
export const BRAND_VOICE_PROMPT = `You are Frank D. Lawrence Jr. (@frvnkfrmchicago), an AI coding tools expert and vibe coder.

=== THREADS RULES ===
- 500 max characters.
- Write like you text a friend who codes.
- Specific over general. Active voice.
- Sound like a developer who ships, not a marketer who sells.
- NO hashtags. NO emojis.

=== FORMAT GUIDE ===
- Short = 1-2 sentences, max 280 chars
- Medium = 2-4 sentences, 280-500 chars
- Long thread = 500 chars, educational depth

=== BANNED WORDS/PHRASES ===
leverage, unlock, elevate, game-changing, revolutionary, seamless, robust, cutting-edge, next-generation, state-of-the-art, best-in-class, world-class, industry-leading, supercharge, turbocharge, skyrocket, harness, empower, transform, reimagine, disrupt, excited, thrilled, passionate, journey.
Let's dive in, Here's the thing, In today's world, Don't miss out, the future of, I'm excited to, It's not just about, At the end of the day.

Return ONLY the post text. No quotes. No labels. No preamble.`;

/**
 * Severity → format selector. Bulletins from the Content Hub carry a severity enum
 * (`info` / `advisory` / `important` / `breaking`); modules don't, so the caller
 * passes `undefined` for modules and we default to "Medium".
 */
export function severityToFormat(severity?: string): 'Short' | 'Medium' | 'Long thread' {
  switch (severity) {
    case 'breaking':
      return 'Long thread';
    case 'important':
      return 'Medium';
    case 'advisory':
      return 'Medium';
    case 'info':
      return 'Short';
    default:
      return 'Medium';
  }
}

export interface BrandVoiceContext {
  /** 'module' or 'bulletin' — what kind of publish event triggered this. */
  source: 'module' | 'bulletin';
  /** Title of the published item — becomes the Threads topic. */
  title: string;
  /** Summary / short description of the item. */
  summary: string;
  /** Optional canonical URL — not appended to the post (no links per voice rules) but available for future use. */
  url?: string;
  /** Bulletin severity, if applicable — drives Short / Medium / Long thread. */
  severity?: string;
}

/**
 * Build the user-message contents that get appended to BRAND_VOICE_PROMPT.
 * Mirrors the `Topic / Type / Format / Description / Keywords` slot shape from
 * the calendar-driven workflow so the model's response style stays consistent.
 */
export function buildBrandVoiceUserMessage(ctx: BrandVoiceContext): string {
  const fmt = severityToFormat(ctx.severity);
  const type = ctx.source === 'bulletin' ? 'AI news' : 'AI education';
  return [
    'Post details:',
    `- Topic/Tool: ${ctx.title}`,
    `- Post type: ${type}`,
    `- Format: ${fmt}`,
    `- Description: ${ctx.summary}`,
    `- Keywords to weave in: AI tools 2026, ${ctx.source === 'bulletin' ? 'AI news, breaking' : 'AI education, tutorial'}`,
  ].join('\n');
}

/* ───────── Threads API body builders ───────── */

export interface ThreadsContainerArgs {
  text: string;
  accessToken: string;
  userId: string;
}

/**
 * Build the POST body + URL for Threads "create container" step.
 *
 * Container is Threads' draft state: you POST the text and get back an `id`.
 * Publish is a second call that takes that id. See:
 *   https://developers.facebook.com/docs/threads/posts
 */
export function buildThreadsContainerBody({ text, accessToken, userId }: ThreadsContainerArgs): {
  url: string;
  params: URLSearchParams;
} {
  if (!text || text.trim().length === 0) {
    throw new Error('threads.container: empty text');
  }
  if (text.length > THREADS_MAX_CHARS) {
    throw new Error(`threads.container: text exceeds ${THREADS_MAX_CHARS} chars`);
  }
  const url = `https://graph.threads.net/v1.0/${userId}/threads`;
  const params = new URLSearchParams({
    media_type: 'TEXT',
    text,
    access_token: accessToken,
  });
  return { url, params };
}

export interface ThreadsPublishArgs {
  creationId: string;
  accessToken: string;
  userId: string;
}

/**
 * Build the POST body + URL for Threads "publish" step.
 * Takes the `id` returned by `buildThreadsContainerBody`'s call.
 */
export function buildThreadsPublishBody({ creationId, accessToken, userId }: ThreadsPublishArgs): {
  url: string;
  params: URLSearchParams;
} {
  if (!creationId) {
    throw new Error('threads.publish: missing creationId');
  }
  const url = `https://graph.threads.net/v1.0/${userId}/threads_publish`;
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });
  return { url, params };
}

/**
 * Clean Gemini output: strip leading/trailing quotes, trim, cap to 500 chars.
 * Matches the `Clean Output` Function node from frvnkfrmchicago-threads.json.
 */
export function cleanThreadsText(raw: string): string {
  return raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .substring(0, THREADS_MAX_CHARS);
}
