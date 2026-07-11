#!/usr/bin/env node
/**
 * deploy-social-post.js -- Social Post Router (webhook-triggered from UI).
 *
 * Trigger:  Webhook (receives post ID + platforms array from dashboard)
 * Process:  Fetch post from Supabase -> Route by platform:
 *   - LinkedIn:  REST /posts API
 *   - Threads:   2-step (create container -> wait 30s -> publish)
 *   - Instagram: 2-step (create media container -> publish)
 *   - Facebook:  Graph API POST to page
 * After:    Update Supabase post with platform_post_ids jsonb
 * Errors:   Log failure per platform, continue with remaining
 *
 * Pattern: build workflow JSON -> POST to n8n API -> activate
 */
'use strict';

const { api, env } = require('./load-env');

const FB_GRAPH_VERSION = 'v25.0';
const THREADS_VERSION = 'v1.0';
const LINKEDIN_VERSION = '202604';
const RETRY = { retry: { maxTries: 3, waitBetweenTries: 2000 } };

function buildWorkflow() {
  const prefix = 'frank-post';

  return {
    name: 'Frank -- Social Post Router (Webhook)',
    nodes: [
      // 1. Webhook
      {
        parameters: {
          httpMethod: 'POST',
          path: 'frank-post-social',
          responseMode: 'responseNode',
          options: { rawBody: false },
        },
        id: `${prefix}-wh`,
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [0, 400],
      },

      // 2. Fetch post from Supabase
      {
        parameters: {
          method: 'GET',
          url: '={{ $env.SUPABASE_URL }}/rest/v1/posts?id=eq.{{ ($json.body || $json).post_id }}&select=*',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'apikey', value: '={{ $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY }}' },
            { name: 'Authorization', value: '=Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY }}' },
          ]},
          options: { timeout: 10000 },
        },
        id: `${prefix}-fetch`,
        name: 'Fetch Post from Supabase',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 400],
      },

      // 3. Normalize + extract platforms
      {
        parameters: {
          jsCode: `
const raw = $input.first().json;
const webhook = $('Webhook').first().json;
const body = webhook.body || webhook;

// Supabase returns an array
const post = Array.isArray(raw) ? raw[0] : raw;
if (!post || !post.id) {
  return [{ json: { error: 'Post not found', post_id: body.post_id } }];
}

const platforms = body.platforms || ['linkedin', 'threads'];
const results = [];

for (const platform of platforms) {
  results.push({
    post_id: post.id,
    platform: platform.toLowerCase().trim(),
    caption: post.caption || post.headline || '',
    image: post.image_url || null,
    headline: post.headline || '',
    category: post.category || '',
  });
}

return results.map(r => ({ json: r }));
`.trim(),
        },
        id: `${prefix}-norm`,
        name: 'Normalize + Split Platforms',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [500, 400],
      },

      // 4. Switch by platform
      {
        parameters: {
          rules: { values: [
            { outputKey: 'linkedin', conditions: { combinator: 'and', conditions: [
              { leftValue: '={{ $json.platform }}', rightValue: 'linkedin',
                operator: { type: 'string', operation: 'equals' } },
            ]}},
            { outputKey: 'threads', conditions: { combinator: 'and', conditions: [
              { leftValue: '={{ $json.platform }}', rightValue: 'threads',
                operator: { type: 'string', operation: 'equals' } },
            ]}},
            { outputKey: 'instagram', conditions: { combinator: 'and', conditions: [
              { leftValue: '={{ $json.platform }}', rightValue: 'instagram',
                operator: { type: 'string', operation: 'equals' } },
            ]}},
            { outputKey: 'facebook', conditions: { combinator: 'and', conditions: [
              { leftValue: '={{ $json.platform }}', rightValue: 'facebook',
                operator: { type: 'string', operation: 'equals' } },
            ]}},
          ]},
          options: { fallbackOutput: 'extra' },
        },
        id: `${prefix}-switch`,
        name: 'Route by Platform',
        type: 'n8n-nodes-base.switch',
        typeVersion: 3.2,
        position: [750, 400],
      },

      // -- LINKEDIN BRANCH --
      {
        parameters: {
          jsCode: `
const j = $input.first().json;
const body = {
  author: $env.LINKEDIN_PERSON_URN || 'urn:li:person:unknown',
  commentary: j.caption || '',
  visibility: 'PUBLIC',
  distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
  lifecycleState: 'PUBLISHED',
  isReshareDisabledByAuthor: false,
};
return [{ json: { liBody: body, post_id: j.post_id, platform: 'linkedin' } }];
`.trim(),
        },
        id: `${prefix}-li-prep`,
        name: 'LinkedIn: Build Body',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1000, 100],
      },
      {
        parameters: {
          method: 'POST',
          url: 'https://api.linkedin.com/rest/posts',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'Authorization', value: '=Bearer {{ $env.LINKEDIN_ACCESS_TOKEN }}' },
            { name: 'LinkedIn-Version', value: LINKEDIN_VERSION },
            { name: 'X-Restli-Protocol-Version', value: '2.0.0' },
            { name: 'Content-Type', value: 'application/json' },
          ]},
          sendBody: true,
          specifyBody: 'json',
          jsonBody: '={{ JSON.stringify($json.liBody) }}',
          options: { ...RETRY, response: { response: { fullResponse: true } } },
        },
        id: `${prefix}-li-post`,
        name: 'LinkedIn: Post',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1250, 100],
        onError: 'continueErrorOutput',
      },

      // -- THREADS BRANCH --
      {
        parameters: {
          method: 'POST',
          url: `=https://graph.threads.net/${THREADS_VERSION}/{{ $env.THREADS_USER_ID }}/threads`,
          sendQuery: true,
          queryParameters: { parameters: [
            { name: 'media_type', value: '={{ $json.image ? "IMAGE" : "TEXT" }}' },
            { name: 'text', value: '={{ $json.caption }}' },
            { name: 'image_url', value: '={{ $json.image || "" }}' },
            { name: 'access_token', value: '={{ $env.THREADS_ACCESS_TOKEN }}' },
          ]},
          options: { ...RETRY },
        },
        id: `${prefix}-thr-create`,
        name: 'Threads: Create Container',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1000, 300],
        onError: 'continueErrorOutput',
      },
      {
        parameters: { amount: 30, unit: 'seconds' },
        id: `${prefix}-thr-wait`,
        name: 'Threads: Wait 30s',
        type: 'n8n-nodes-base.wait',
        typeVersion: 1.1,
        position: [1250, 300],
      },
      {
        parameters: {
          method: 'POST',
          url: `=https://graph.threads.net/${THREADS_VERSION}/{{ $env.THREADS_USER_ID }}/threads_publish`,
          sendQuery: true,
          queryParameters: { parameters: [
            { name: 'creation_id', value: '={{ $json.id }}' },
            { name: 'access_token', value: '={{ $env.THREADS_ACCESS_TOKEN }}' },
          ]},
          options: { ...RETRY },
        },
        id: `${prefix}-thr-pub`,
        name: 'Threads: Publish',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1500, 300],
        onError: 'continueErrorOutput',
      },

      // -- INSTAGRAM BRANCH --
      {
        parameters: {
          method: 'POST',
          url: `=https://graph.facebook.com/${FB_GRAPH_VERSION}/{{ $env.INSTAGRAM_BUSINESS_ID || $env.INSTAGRAM_USER_ID }}/media`,
          sendQuery: true,
          queryParameters: { parameters: [
            { name: 'image_url', value: '={{ $json.image }}' },
            { name: 'caption', value: '={{ $json.caption }}' },
            { name: 'access_token', value: '={{ $env.INSTAGRAM_ACCESS_TOKEN || $env.FACEBOOK_PAGE_TOKEN }}' },
          ]},
          options: { ...RETRY },
        },
        id: `${prefix}-ig-create`,
        name: 'IG: Create Container',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1000, 500],
        onError: 'continueErrorOutput',
      },
      {
        parameters: { amount: 30, unit: 'seconds' },
        id: `${prefix}-ig-wait`,
        name: 'IG: Wait 30s',
        type: 'n8n-nodes-base.wait',
        typeVersion: 1.1,
        position: [1250, 500],
      },
      {
        parameters: {
          method: 'POST',
          url: `=https://graph.facebook.com/${FB_GRAPH_VERSION}/{{ $env.INSTAGRAM_BUSINESS_ID || $env.INSTAGRAM_USER_ID }}/media_publish`,
          sendQuery: true,
          queryParameters: { parameters: [
            { name: 'creation_id', value: '={{ $json.id }}' },
            { name: 'access_token', value: '={{ $env.INSTAGRAM_ACCESS_TOKEN || $env.FACEBOOK_PAGE_TOKEN }}' },
          ]},
          options: { ...RETRY },
        },
        id: `${prefix}-ig-pub`,
        name: 'IG: Publish',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1500, 500],
        onError: 'continueErrorOutput',
      },

      // -- FACEBOOK BRANCH --
      {
        parameters: {
          method: 'POST',
          url: `={{ $json.image
              ? "https://graph.facebook.com/${FB_GRAPH_VERSION}/" + $env.FACEBOOK_PAGE_ID + "/photos"
              : "https://graph.facebook.com/${FB_GRAPH_VERSION}/" + $env.FACEBOOK_PAGE_ID + "/feed" }}`,
          sendQuery: true,
          queryParameters: { parameters: [
            { name: 'message', value: '={{ $json.caption }}' },
            { name: 'url', value: '={{ $json.image || "" }}' },
            { name: 'access_token', value: '={{ $env.FACEBOOK_PAGE_TOKEN }}' },
          ]},
          options: { ...RETRY },
        },
        id: `${prefix}-fb-post`,
        name: 'FB: Post',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1000, 700],
        onError: 'continueErrorOutput',
      },

      // -- RESPONSE NODES --
      {
        parameters: {
          respondWith: 'json',
          responseBody: `={{ JSON.stringify({ success: true, platform: 'linkedin', platform_post_id: ($json.headers && $json.headers['x-restli-id']) || ($json.body && $json.body.id) || null, published_at: $now.toISO() }) }}`,
        },
        id: `${prefix}-resp-li`,
        name: 'Respond LinkedIn',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1.1,
        position: [1500, 100],
      },
      {
        parameters: {
          respondWith: 'json',
          responseBody: `={{ JSON.stringify({ success: true, platform: 'threads', platform_post_id: $json.id || null, published_at: $now.toISO() }) }}`,
        },
        id: `${prefix}-resp-thr`,
        name: 'Respond Threads',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1.1,
        position: [1750, 300],
      },
      {
        parameters: {
          respondWith: 'json',
          responseBody: `={{ JSON.stringify({ success: true, platform: 'instagram', platform_post_id: $json.id || null, published_at: $now.toISO() }) }}`,
        },
        id: `${prefix}-resp-ig`,
        name: 'Respond IG',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1.1,
        position: [1750, 500],
      },
      {
        parameters: {
          respondWith: 'json',
          responseBody: `={{ JSON.stringify({ success: true, platform: 'facebook', platform_post_id: ($json.id || $json.post_id || null), published_at: $now.toISO() }) }}`,
        },
        id: `${prefix}-resp-fb`,
        name: 'Respond FB',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1.1,
        position: [1250, 700],
      },

      // -- UPDATE SUPABASE with platform_post_ids --
      {
        parameters: {
          jsCode: `
// Collect results from whichever platform branches ran
const results = {};
const platforms = ['LinkedIn: Post', 'Threads: Publish', 'IG: Publish', 'FB: Post'];
for (const nodeName of platforms) {
  try {
    const data = $(nodeName).first().json;
    if (data && data.id) {
      const platform = nodeName.split(':')[0].toLowerCase().trim();
      results[platform] = data.id;
    }
  } catch (_) {}
}

const postId = $('Normalize + Split Platforms').first().json.post_id;
if (postId && Object.keys(results).length > 0) {
  const supabaseUrl = $env.SUPABASE_URL;
  const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      await fetch(supabaseUrl + '/rest/v1/posts?id=eq.' + postId, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': 'Bearer ' + supabaseKey,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          platform_post_ids: results,
          status: 'published',
          published_at: new Date().toISOString(),
        }),
      });
    } catch (_) {}
  }
}

return [{ json: { updated: true, post_id: postId, platform_post_ids: results } }];
`.trim(),
        },
        id: `${prefix}-update-sb`,
        name: 'Update Supabase Post',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1750, 800],
      },

      // -- ERROR HANDLING --
      {
        parameters: {
          mode: 'manual',
          assignments: { assignments: [
            { id: '1', name: 'success', value: 'false', type: 'boolean' },
            { id: '2', name: 'platform', value: '={{ $json.platform || $node["Normalize + Split Platforms"].json.platform || "unknown" }}', type: 'string' },
            { id: '3', name: 'error', value: '={{ ($json.error && ($json.error.message || JSON.stringify($json.error))) || $json.message || "Upstream API failure" }}', type: 'string' },
          ]},
          options: {},
        },
        id: `${prefix}-err-set`,
        name: 'Set Error',
        type: 'n8n-nodes-base.set',
        typeVersion: 3.4,
        position: [1500, 950],
      },
      {
        parameters: {
          respondWith: 'json',
          responseBody: '={{ JSON.stringify({ success: false, platform: $json.platform, error: $json.error }) }}',
          options: { responseCode: 200 },
        },
        id: `${prefix}-resp-err`,
        name: 'Respond Error',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1.1,
        position: [1750, 950],
      },

      // -- UNKNOWN PLATFORM --
      {
        parameters: {
          respondWith: 'json',
          responseBody: '={{ JSON.stringify({ success: false, platform: $json.platform || "unknown", error: "Unsupported platform" }) }}',
          options: { responseCode: 200 },
        },
        id: `${prefix}-resp-unk`,
        name: 'Respond Unknown',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1.1,
        position: [1000, 950],
      },
    ],

    connections: {
      'Webhook':                     { main: [[ { node: 'Fetch Post from Supabase', type: 'main', index: 0 } ]] },
      'Fetch Post from Supabase':    { main: [[ { node: 'Normalize + Split Platforms', type: 'main', index: 0 } ]] },
      'Normalize + Split Platforms': { main: [[ { node: 'Route by Platform', type: 'main', index: 0 } ]] },

      'Route by Platform': { main: [
        [{ node: 'LinkedIn: Build Body',      type: 'main', index: 0 }],
        [{ node: 'Threads: Create Container', type: 'main', index: 0 }],
        [{ node: 'IG: Create Container',      type: 'main', index: 0 }],
        [{ node: 'FB: Post',                  type: 'main', index: 0 }],
        [{ node: 'Respond Unknown',           type: 'main', index: 0 }],
      ]},

      // LinkedIn
      'LinkedIn: Build Body': { main: [[ { node: 'LinkedIn: Post', type: 'main', index: 0 } ]] },
      'LinkedIn: Post': {
        main:  [[ { node: 'Respond LinkedIn', type: 'main', index: 0 } ]],
        error: [[ { node: 'Set Error', type: 'main', index: 0 } ]],
      },

      // Threads
      'Threads: Create Container': {
        main:  [[ { node: 'Threads: Wait 30s', type: 'main', index: 0 } ]],
        error: [[ { node: 'Set Error', type: 'main', index: 0 } ]],
      },
      'Threads: Wait 30s': { main: [[ { node: 'Threads: Publish', type: 'main', index: 0 } ]] },
      'Threads: Publish': {
        main:  [[ { node: 'Respond Threads', type: 'main', index: 0 } ]],
        error: [[ { node: 'Set Error', type: 'main', index: 0 } ]],
      },

      // Instagram
      'IG: Create Container': {
        main:  [[ { node: 'IG: Wait 30s', type: 'main', index: 0 } ]],
        error: [[ { node: 'Set Error', type: 'main', index: 0 } ]],
      },
      'IG: Wait 30s': { main: [[ { node: 'IG: Publish', type: 'main', index: 0 } ]] },
      'IG: Publish': {
        main:  [[ { node: 'Respond IG', type: 'main', index: 0 } ]],
        error: [[ { node: 'Set Error', type: 'main', index: 0 } ]],
      },

      // Facebook
      'FB: Post': {
        main:  [[ { node: 'Respond FB', type: 'main', index: 0 } ]],
        error: [[ { node: 'Set Error', type: 'main', index: 0 } ]],
      },

      // Error funnel
      'Set Error': { main: [[ { node: 'Respond Error', type: 'main', index: 0 } ]] },
    },

    settings: { executionOrder: 'v1', timezone: 'America/Chicago' },
  };
}

// -- Deploy ----------------------------------------------------------------

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const workflow = buildWorkflow();

  console.log('Deploying: ' + workflow.name);
  console.log('Nodes: ' + workflow.nodes.length);
  console.log('Trigger: Webhook POST /webhook/frank-post-social');
  console.log('Routes: linkedin | threads | instagram | facebook');

  if (isDryRun) {
    console.log('\n[DRY RUN] Workflow JSON:\n');
    console.log(JSON.stringify(workflow, null, 2));
    return workflow;
  }

  try {
    const result = await api('POST', '/api/v1/workflows', workflow);
    if (result && result.id) {
      console.log('Created: ' + result.name + ' (' + result.id + ')');
      const act = await api('PATCH', '/api/v1/workflows/' + result.id, { active: true });
      console.log('Activated:', act && act.active !== undefined ? act.active : '(check UI)');
      console.log('\nWebhook: POST { post_id: "...", platforms: ["linkedin", "threads"] }');
    } else {
      console.log('Error creating workflow:', JSON.stringify(result).slice(0, 400));
    }
  } catch (e) {
    console.error('Deploy failed:', e.message);
  }

  return workflow;
}

if (require.main === module) main();
module.exports = { main, buildWorkflow };
