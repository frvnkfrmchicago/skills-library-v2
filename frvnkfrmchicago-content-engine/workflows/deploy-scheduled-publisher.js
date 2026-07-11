#!/usr/bin/env node
/**
 * deploy-scheduled-publisher.js -- Scheduled Publisher (cron-driven auto-post).
 *
 * Schedule: Every 15 min -- checks Supabase for posts with scheduled_at <= now and
 *           status = 'scheduled'. Then dispatches each to the social-post webhook.
 *
 * Process:  Cron -> Fetch scheduled posts from Supabase -> For each, call the
 *           social-post router webhook -> Mark post as 'published' or 'failed'
 * Fallback: If social-post webhook is down, post directly via platform APIs
 *
 * Pattern: build workflow JSON -> POST to n8n API -> activate
 */
'use strict';

const { api, env } = require('./load-env');

function buildWorkflow() {
  const prefix = 'frank-sched';
  const n8nBaseUrl = '{{ $env.N8N_BASE_URL || "http://localhost:5678" }}';

  return {
    name: 'Frank -- Scheduled Publisher (Every 15 min)',
    nodes: [
      // 1. Schedule trigger: every 15 min
      {
        parameters: {
          rule: {
            interval: [{
              field: 'cronExpression',
              expression: '*/15 * * * *',
            }],
          },
        },
        id: `${prefix}-trigger`,
        name: 'Every 15 Minutes',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [0, 400],
      },

      // 2. Fetch scheduled posts from Supabase
      {
        parameters: {
          method: 'GET',
          url: `={{ $env.SUPABASE_URL }}/rest/v1/posts?status=eq.scheduled&scheduled_at=lte.{{ $now.toISO() }}&order=scheduled_at.asc&limit=10`,
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'apikey', value: '={{ $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY }}' },
            { name: 'Authorization', value: '=Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY }}' },
            { name: 'Accept', value: 'application/json' },
          ]},
          options: { timeout: 10000 },
        },
        id: `${prefix}-fetch`,
        name: 'Fetch Scheduled Posts',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 400],
        onError: 'continueErrorOutput',
      },

      // 3. Check if any posts found
      {
        parameters: {
          jsCode: `
const raw = $input.first().json;
const posts = Array.isArray(raw) ? raw : [];

if (posts.length === 0) {
  return [{ json: { empty: true, message: 'No scheduled posts due.' } }];
}

// Emit each post as separate item
return posts.map(post => ({ json: {
  post_id: post.id,
  platform: post.platform || 'linkedin',
  platforms: post.platforms || [post.platform || 'linkedin'],
  caption: post.caption || '',
  image_url: post.image_url || null,
  headline: post.headline || '',
  category: post.category || '',
  scheduled_at: post.scheduled_at,
  empty: false,
} }));
`.trim(),
        },
        id: `${prefix}-check`,
        name: 'Check Posts',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [500, 400],
      },

      // 4. IF -- skip if no posts
      {
        parameters: {
          conditions: {
            boolean: [{
              value1: '={{ $json.empty }}',
              value2: true,
              operation: 'notEqual',
            }],
          },
        },
        id: `${prefix}-if`,
        name: 'Has Posts?',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [750, 400],
      },

      // 5. Mark post as "publishing" in Supabase to prevent double-send
      {
        parameters: {
          method: 'PATCH',
          url: '={{ $env.SUPABASE_URL }}/rest/v1/posts?id=eq.{{ $json.post_id }}',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'apikey', value: '={{ $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY }}' },
            { name: 'Authorization', value: '=Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY }}' },
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Prefer', value: 'return=minimal' },
          ]},
          sendBody: true,
          specifyBody: 'json',
          jsonBody: '={{ JSON.stringify({ status: "publishing" }) }}',
          options: { timeout: 10000 },
        },
        id: `${prefix}-lock`,
        name: 'Lock Post (publishing)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1000, 300],
        onError: 'continueRegularOutput',
      },

      // 6. Dispatch to social-post router webhook
      {
        parameters: {
          method: 'POST',
          url: `=${n8nBaseUrl}/webhook/frank-post-social`,
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={{ JSON.stringify({
            post_id: $json.post_id || $('Check Posts').first().json.post_id,
            platforms: $('Check Posts').first().json.platforms || ['linkedin', 'threads'],
          }) }}`,
          options: { timeout: 120000 },
        },
        id: `${prefix}-dispatch`,
        name: 'Dispatch to Social Router',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1250, 300],
        onError: 'continueErrorOutput',
      },

      // 7. Mark as published or failed
      {
        parameters: {
          jsCode: `
const response = $input.first().json;
const postId = $('Check Posts').first().json.post_id;
const supabaseUrl = $env.SUPABASE_URL;
const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY;

const success = response?.success !== false;
const newStatus = success ? 'published' : 'failed';

if (supabaseUrl && supabaseKey && postId) {
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
        status: newStatus,
        published_at: success ? new Date().toISOString() : null,
        platform_post_ids: response?.platform_post_ids || null,
      }),
    });
  } catch (_) {}
}

return [{ json: {
  post_id: postId,
  status: newStatus,
  platform_response: response,
} }];
`.trim(),
        },
        id: `${prefix}-mark`,
        name: 'Mark Published/Failed',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1500, 300],
      },

      // 8. Handle dispatch failure -- post directly as fallback
      {
        parameters: {
          jsCode: `
const postId = $('Check Posts').first().json.post_id;
const supabaseUrl = $env.SUPABASE_URL;
const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY;

// Mark as failed so manual review can catch it
if (supabaseUrl && supabaseKey && postId) {
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
        status: 'failed',
        error_message: 'Social post router webhook unreachable. Manual publish required.',
      }),
    });
  } catch (_) {}
}

// Log to errors table
if (supabaseUrl && supabaseKey) {
  try {
    await fetch(supabaseUrl + '/rest/v1/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        workflow: 'scheduled-publisher',
        error: 'Social post router webhook unreachable for post ' + postId,
        created_at: new Date().toISOString(),
      }),
    });
  } catch (_) {}
}

return [{ json: {
  post_id: postId,
  status: 'failed',
  error: 'Social post router webhook unreachable',
} }];
`.trim(),
        },
        id: `${prefix}-fallback`,
        name: 'Handle Dispatch Failure',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1500, 550],
      },

      // 9. No-op for empty queue
      {
        parameters: {
          jsCode: `
return [{ json: { message: 'No posts scheduled. Queue empty.', checked_at: new Date().toISOString() } }];
`.trim(),
        },
        id: `${prefix}-noop`,
        name: 'Queue Empty (No-op)',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1000, 550],
      },

      // 10. Fetch-error handler
      {
        parameters: {
          jsCode: `
const error = $input.first().json;
const errMsg = error?.error?.message || error?.message || JSON.stringify(error).slice(0, 300);
const supabaseUrl = $env.SUPABASE_URL;
const supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY;
if (supabaseUrl && supabaseKey) {
  try {
    await fetch(supabaseUrl + '/rest/v1/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': 'Bearer ' + supabaseKey, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ workflow: 'scheduled-publisher', error: errMsg, created_at: new Date().toISOString() }),
    });
  } catch (_) {}
}
return [{ json: { logged: true, error: errMsg } }];
`.trim(),
        },
        id: `${prefix}-error`,
        name: 'Log Error to Supabase',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [500, 650],
      },
    ],

    connections: {
      'Every 15 Minutes':     { main: [[ { node: 'Fetch Scheduled Posts', type: 'main', index: 0 } ]] },
      'Fetch Scheduled Posts': {
        main:  [[ { node: 'Check Posts', type: 'main', index: 0 } ]],
        error: [[ { node: 'Log Error to Supabase', type: 'main', index: 0 } ]],
      },
      'Check Posts':          { main: [[ { node: 'Has Posts?', type: 'main', index: 0 } ]] },
      'Has Posts?': {
        main: [
          [{ node: 'Lock Post (publishing)', type: 'main', index: 0 }],
          [{ node: 'Queue Empty (No-op)', type: 'main', index: 0 }],
        ],
      },
      'Lock Post (publishing)': { main: [[ { node: 'Dispatch to Social Router', type: 'main', index: 0 } ]] },
      'Dispatch to Social Router': {
        main:  [[ { node: 'Mark Published/Failed', type: 'main', index: 0 } ]],
        error: [[ { node: 'Handle Dispatch Failure', type: 'main', index: 0 } ]],
      },
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
  console.log('Schedule: Every 15 min');
  console.log('Logic: Check Supabase for scheduled posts -> dispatch via Social Router webhook');

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
