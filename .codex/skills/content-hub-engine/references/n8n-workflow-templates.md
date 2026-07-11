# N8N Workflow Templates

Reference architectures for the n8n automation workflows that power the
content hub's generation and publishing pipelines. These are instruction
templates, not importable JSON. Use the `n8n-automating` skill to build
the actual workflows.

## Workflow Index

| Workflow | Trigger | Purpose |
|---|---|---|
| Content Segment Publisher | Cron (per-segment schedule) | Auto-publish approved posts or generate on the fly |
| Manual Publish | Webhook (from UI) | Publish a specific post on demand |
| AI Chat | Webhook (from UI) | Route chat messages to LLM, return responses |
| Team Notify | Webhook (from UI) | Send notifications on status changes, comments, assignments |
| Batch Generator | Webhook (from UI) | Generate N posts from a topic, save to Supabase |
| TikTok Publisher | Cron (separate schedule) | Publish TikTok-specific coded content |

## Workflow 1: Content Segment Publisher

One instance per content segment (news, engage, facts, regulation, etc.).

### Node Chain

```
[Cron Trigger]
    |
    v
[Supabase: Fetch Next Approved Post]
    |
    +-- Post found? YES --> [Platform Adapter: Threads]
    |                       [Platform Adapter: Instagram]
    |                       [Platform Adapter: Facebook]
    |                       [Platform Adapter: LinkedIn]
    |                           |
    |                           v
    |                       [Supabase: Update Status to Published]
    |                       [Supabase: Store publish_result]
    |
    +-- Post found? NO --> [AI Generate: Create Post for Segment]
                               |
                               v
                           [Supabase: Insert as Pending]
                           (Hold for editor review — do NOT auto-publish)
```

### Cron Configuration

```json
{
  "news":       { "expression": "0 10 * * 2,4", "timezone": "America/New_York" },
  "regulation": { "expression": "0 10 * * 1,5", "timezone": "America/New_York" },
  "facts":      { "expression": "0 10 * * 3",   "timezone": "America/New_York" },
  "engage":     { "expression": "0 12 * * 6",   "timezone": "America/New_York" }
}
```

### Supabase Fetch Node

Query pattern for fetching the next publishable post:

```sql
SELECT *
FROM posts
WHERE system = '{segment_id}'
  AND status = 'approved'
  AND (scheduled_for IS NULL OR scheduled_for <= NOW())
ORDER BY COALESCE(scheduled_for, created_at) ASC
LIMIT 1
```

### Platform Adapter Nodes

Each adapter transforms the post content for its target platform.

**Threads Adapter:**
```javascript
// Input: post object with headline, cap, tags, img
// Output: Threads API payload

const caption = truncate(post.cap, 450); // leave room for tags
const hashtags = post.tags.slice(0, 6).join(' ');
const body = caption + '\n\n' + hashtags;

return {
  text: body,
  media_url: post.img, // must be a public HTTPS URL
  media_type: 'IMAGE'
};
```

**Instagram Adapter:**
```javascript
const caption = post.cap;
const hashtags = '\n\n' + post.tags.slice(0, 11).join(' ');
const altText = 'Post about ' + post.headline.toLowerCase();

return {
  caption: caption + hashtags,
  image_url: post.img,
  alt_text: altText
};
```

**Facebook Adapter:**
```javascript
const hashtags = post.tags.slice(0, 5).join(' ');

return {
  message: post.cap + '\n\n' + hashtags,
  url: post.img // attached as photo
};
```

**LinkedIn Adapter:**
```javascript
const professionalTags = post.tags
  .filter(t => !isCasualTag(t))
  .slice(0, 5)
  .join(' ');

return {
  text: post.cap + '\n\n' + professionalTags,
  media: { url: post.img, title: post.headline }
};
```

### Status Update Node

After publishing to all platforms, update the post:

```javascript
await supabase.from('posts').update({
  status: 'published',
  published_at: new Date().toISOString(),
  publish_result: {
    threads:   { success: true, id: threadsResponse.id },
    instagram: { success: true, id: igResponse.id },
    facebook:  { success: true, id: fbResponse.id },
    linkedin:  { success: true, id: liResponse.id }
  }
}).eq('id', post.id);
```

If any platform fails, still update with partial results:

```javascript
publish_result: {
  threads:   { success: true, id: '...' },
  instagram: { success: false, error: 'Rate limited' },
  facebook:  { success: true, id: '...' },
  linkedin:  { success: true, id: '...' }
}
```

## Workflow 2: Manual Publish

Triggered by the Content Hub UI when an editor clicks "Publish" on a post.

### Node Chain

```
[Webhook Trigger: POST /gh-post-social]
    |
    v
[Validate: Post ID exists, status is approved]
    |
    v
[Supabase: Fetch Full Post by ID]
    |
    v
[Platform Adapter: Threads]  (parallel)
[Platform Adapter: Instagram] (parallel)
[Platform Adapter: Facebook]  (parallel)
[Platform Adapter: LinkedIn]  (parallel)
    |
    v
[Merge Results]
    |
    v
[Supabase: Update Status + publish_result]
    |
    v
[Respond to Webhook: { success, results }]
```

### Webhook Payload (from UI)

```json
{
  "postId": "uuid",
  "platforms": ["threads", "instagram", "facebook", "linkedin"],
  "userId": "uuid"
}
```

## Workflow 3: AI Chat

Routes AI chat messages from the Content Hub UI to the LLM proxy and back.

### Node Chain

```
[Webhook Trigger: POST /gh-ai-chat]
    |
    v
[Build Messages Array: system prompt + chat history + user message]
    |
    v
[HTTP Request: POST to LLM proxy]
    |
    v
[Parse Response: extract assistant message]
    |
    v
[Respond to Webhook: { reply }]
```

### Webhook Payload (from UI)

```json
{
  "message": "user's chat message",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "context": {
    "currentHeadline": "...",
    "currentCaption": "...",
    "currentTags": ["..."],
    "segment": "news"
  }
}
```

## Workflow 4: Team Notify

Sends notifications to team members when posts change status, get comments,
or are assigned.

### Node Chain

```
[Webhook Trigger: POST /gh-notify-team]
    |
    v
[Switch: notification type]
    |
    +-- status_change --> [Format: "{post.headline} moved to {new_status}"]
    +-- comment       --> [Format: "{author} commented on {post.headline}"]
    +-- assignment    --> [Format: "You were assigned {post.headline}"]
    |
    v
[Lookup: recipient's notification preferences]
    |
    +-- email   --> [Send Email node]
    +-- slack   --> [Slack Message node]
    +-- webhook --> [HTTP Request to custom endpoint]
```

### Webhook Payload (from UI)

```json
{
  "type": "status_change | comment | assignment",
  "postId": "uuid",
  "recipientId": "uuid",
  "data": {
    "newStatus": "approved",
    "comment": "Looks good, publish tomorrow",
    "author": "Team Member Name"
  }
}
```

## Workflow 5: Batch Generator

Generates N posts from a topic, saving each to Supabase as pending.

### Node Chain

```
[Webhook Trigger: POST /gh-batch-generate]
    |
    v
[Set: count, topic, segment, assignee, previousHeadlines = []]
    |
    v
[Loop: i = 0 to count-1]
    |
    +-- [Build Prompt: topic + segment + "avoid these headlines: {prev}"]
    |       |
    |       v
    |   [HTTP Request: POST to LLM proxy (JSON-strict mode)]
    |       |
    |       v
    |   [Parse JSON: multi-pass repair pipeline]
    |       |
    |       v
    |   [Supabase: Insert post with status='pending', source='ai-batch']
    |       |
    |       v
    |   [Append headline to previousHeadlines for anti-duplicate]
    |       |
    |       v
    |   [Respond partial: { index: i, success: true, post }]
    |
    +-- On error: [Log error, continue to next iteration]
    |
    v
[Respond final: { total, succeeded, failed }]
```

## Workflow 6: TikTok Publisher

Separate workflow with coded language. Uses a different system prompt.

### Key Differences from Main Publisher

1. Uses the TikTok system prompt (coded language: flower, green, the leaf).
2. Never publishes to Threads, Instagram, Facebook, or LinkedIn.
3. Requires VIDEO media (not static images).
4. Uses coded hashtags only (#Flower, #TopShelf, #GreenLife).
5. Runs on its own cron schedule, independent of the main segments.

### Node Chain

```
[Cron Trigger: TikTok schedule]
    |
    v
[Supabase: Fetch next approved TikTok post (source = 'tiktok-gen')]
    |
    +-- Found --> [TikTok API: Upload video + caption]
    |                 |
    |                 v
    |             [Supabase: Update status to published]
    |
    +-- Not found --> [AI Generate with TikTok system prompt]
                          |
                          v
                      [Supabase: Insert as pending, source='tiktok-gen']
```

## Error Handling Patterns

Apply these patterns across all workflows. See `n8n-automating` for
detailed error handling guidance.

### Retry with Exponential Backoff

```javascript
// For API calls that may be rate-limited
const maxRetries = 3;
const baseDelay = 1000; // 1 second

for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    const result = await apiCall();
    return result;
  } catch (err) {
    if (attempt === maxRetries - 1) throw err;
    const delay = baseDelay * Math.pow(2, attempt);
    await sleep(delay);
  }
}
```

### Dead Letter Queue

Posts that fail publishing after all retries are moved to a "failed" status
with the error stored in `publish_result`. The Content Hub UI shows failed
posts in a separate "Failed" tab for manual review and retry.

### Webhook Response Timeout

All webhook-triggered workflows respond within 30 seconds. If the operation
takes longer (e.g., batch generation), the webhook responds immediately with
a job ID, and the UI polls for status or uses Supabase realtime to get
updates.
