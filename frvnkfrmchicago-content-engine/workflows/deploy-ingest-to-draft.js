#!/usr/bin/env node
/**
 * deploy-ingest-to-draft.js -- ingest_items -> GLM proxy -> posts (draft)
 *
 * Trigger: Every 2 hours
 * Flow:
 *   1. Fetch up to 10 unprocessed ingest_items (draft_post_id IS NULL)
 *   2. For each item, call GLM proxy edge function to generate a draft post
 *   3. Map category_hint to valid category
 *   4. Insert generated post into posts table (status='draft')
 *   5. Update ingest_item.draft_post_id
 *   6. Log errors to errors table
 *
 * Requirements:
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */
'use strict';

const crypto = require('crypto');
const { api, env } = require('./load-env');

function sha256(s) {
  return crypto.createHash('sha256').update(String(s || '')).digest('hex');
}

const VALID_CATEGORIES = [
  'ai_ml', 'dev_tools', 'career', 'culture', 'creative',
  'industry', 'ai_education', 'ai_finance', 'ai_health',
  'ai_public_health', 'ai_dentistry',
];

const CATEGORY_ALIASES = {
  ai: 'ai_ml',
  ml: 'ai_ml',
  'artificial-intelligence': 'ai_ml',
  'machine-learning': 'ai_ml',
  dev: 'dev_tools',
  developer: 'dev_tools',
  'dev-tools': 'dev_tools',
  careers: 'career',
  jobs: 'career',
  tech: 'industry',
  technology: 'industry',
  education: 'ai_education',
  'ai-edu': 'ai_education',
  finance: 'ai_finance',
  fintech: 'ai_finance',
  health: 'ai_health',
  healthcare: 'ai_health',
  'public-health': 'ai_public_health',
  dental: 'ai_dentistry',
  dentistry: 'ai_dentistry',
};

function mapCategory(hint) {
  if (!hint) return 'ai_ml';
  const normalized = hint.toLowerCase().trim();
  if (VALID_CATEGORIES.includes(normalized)) return normalized;
  if (CATEGORY_ALIASES[normalized]) return CATEGORY_ALIASES[normalized];
  return 'ai_ml';
}

function buildWorkflow() {
  const prefix = 'ap-draft';
  const supabaseUrl = '{{ $env.SUPABASE_URL }}';
  const supabaseKey = '{{ $env.SUPABASE_SERVICE_ROLE_KEY }}';

  return {
    name: 'Asset Persona - Ingest to Draft',
    nodes: [
      // ---- Trigger: every 2 hours ----
      {
        parameters: {
          rule: { interval: [{ field: 'cronExpression', expression: '0 */2 * * *' }] },
        },
        id: `${prefix}-trigger`,
        name: 'Every 2 Hours',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [0, 400],
      },

      // ---- Fetch unprocessed ingest_items ----
      {
        parameters: {
          method: 'GET',
          url: `={{ ${supabaseUrl} + "/rest/v1/ingest_items?draft_post_id=is.null&order=created_at.asc&limit=10" }}`,
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'apikey', value: `=${supabaseKey}` },
            { name: 'Authorization', value: `=Bearer ${supabaseKey}` },
          ]},
          options: { timeout: 15000 },
        },
        id: `${prefix}-fetch`,
        name: 'Fetch Unprocessed Items',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 400],
      },

      // ---- Split into individual items ----
      {
        parameters: {
          mode: 'all',
        },
        id: `${prefix}-split`,
        name: 'Split Items',
        type: 'n8n-nodes-base.splitOut',
        typeVersion: 1,
        position: [500, 400],
      },

      // ---- Generate draft post via GLM proxy ----
      {
        parameters: {
          method: 'POST',
          url: `={{ ${supabaseUrl} + "/functions/v1/glm-proxy" }}`,
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Authorization', value: `=Bearer ${supabaseKey}` },
          ]},
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={{
            JSON.stringify({
              model: 'glm-5.1',
              system: 'You are a content strategist for Asset Persona, a personal brand focused on AI, technology, career development, and industry trends. Generate a social media post based on this news item. Output strict JSON: {headline, hl_words: string[], caption, tags: string[]}. Headline should be punchy (under 80 chars). Caption should be 150-300 words, conversational, insightful. Tags should be 5 hashtags.',
              prompt: 'Title: ' + ($json.title || '') + '\\nSummary: ' + ($json.summary || '') + '\\nCategory: ' + ($json.category_hint || '')
            })
          }}`,
          options: { timeout: 30000 },
        },
        id: `${prefix}-glm`,
        name: 'Generate Draft (GLM)',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [750, 400],
        onError: 'continueErrorOutput',
      },

      // ---- Parse GLM response and prepare post row ----
      {
        parameters: {
          jsCode: `
const glmResponse = $input.first().json;
const ingestItem = $('Split Items').first().json;

const ingestId = ingestItem.id;
const title = ingestItem.title || '';
const summary = ingestItem.summary || '';
const categoryHint = ingestItem.category_hint || '';
const sourceUrl = ingestItem.item_url || '';
const sourceName = ingestItem.source_name || '';

const VALID_CATEGORIES = ['ai_ml','dev_tools','career','culture','creative','industry','ai_education','ai_finance','ai_health','ai_public_health','ai_dentistry'];
const CATEGORY_ALIASES = {ai:'ai_ml',ml:'ai_ml','artificial-intelligence':'ai_ml','machine-learning':'ai_ml',dev:'dev_tools',developer:'dev_tools','dev-tools':'dev_tools',careers:'career',jobs:'career',tech:'industry',technology:'industry',education:'ai_education','ai-edu':'ai_education',finance:'ai_finance',fintech:'ai_finance',health:'ai_health',healthcare:'ai_health','public-health':'ai_public_health',dental:'ai_dentistry',dentistry:'ai_dentistry'};

function mapCategory(hint) {
  if (!hint) return 'ai_ml';
  const n = hint.toLowerCase().trim();
  if (VALID_CATEGORIES.includes(n)) return n;
  if (CATEGORY_ALIASES[n]) return CATEGORY_ALIASES[n];
  return 'ai_ml';
}

let parsed;
try {
  const raw = glmResponse;
  let text = raw.text || raw.content || raw.result || (typeof raw === 'string' ? raw : JSON.stringify(raw));
  // Strip markdown fences if present
  text = text.replace(/^\\s*```(?:json)?\\s*/i, '').replace(/\\s*```\\s*$/, '').trim();
  parsed = JSON.parse(text);
} catch (e) {
  throw new Error('Failed to parse GLM output: ' + e.message + ' | raw: ' + JSON.stringify(glmResponse).slice(0, 200));
}

if (!parsed.headline || !parsed.caption) {
  throw new Error('GLM output missing required fields: headline, caption. Got: ' + JSON.stringify(parsed).slice(0, 200));
}

const category = mapCategory(categoryHint);
const headline = String(parsed.headline).slice(0, 80);
const caption = String(parsed.caption);
const hlWords = Array.isArray(parsed.hl_words) ? parsed.hl_words : [];
const tags = Array.isArray(parsed.tags) ? parsed.tags : [];

// Content hash for dedup
const hashInput = headline + '|' + caption;
const crypto = require('crypto');
const contentHash = crypto.createHash('sha256').update(hashInput).digest('hex');

const postRow = {
  headline,
  hl_words: hlWords,
  caption,
  tags,
  category,
  status: 'draft',
  source_url: sourceUrl,
  source_name: sourceName,
  content_hash: contentHash,
  ingest_item_id: ingestId,
};

return [{ json: { postRow, ingestId } }];
`.trim(),
        },
        id: `${prefix}-parse`,
        name: 'Parse & Prepare Post',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1000, 400],
      },

      // ---- Insert into posts table ----
      {
        parameters: {
          method: 'POST',
          url: `={{ ${supabaseUrl} + "/rest/v1/posts" }}`,
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'apikey', value: `=${supabaseKey}` },
            { name: 'Authorization', value: `=Bearer ${supabaseKey}` },
            { name: 'Prefer', value: 'return=representation' },
          ]},
          sendBody: true,
          specifyBody: 'json',
          jsonBody: '={{ JSON.stringify($json.postRow) }}',
          options: { timeout: 15000 },
        },
        id: `${prefix}-insert-post`,
        name: 'Insert Post',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1250, 400],
        onError: 'continueErrorOutput',
      },

      // ---- Update ingest_item with draft_post_id ----
      {
        parameters: {
          method: 'PATCH',
          url: `={{ ${supabaseUrl} + "/rest/v1/ingest_items?id=eq." + $json.ingestId }}`,
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'apikey', value: `=${supabaseKey}` },
            { name: 'Authorization', value: `=Bearer ${supabaseKey}` },
            { name: 'Prefer', value: 'return=minimal' },
          ]},
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={{
            JSON.stringify({ draft_post_id: $('Insert Post').first().json.id })
          }}`,
          options: { timeout: 15000 },
        },
        id: `${prefix}-update-ingest`,
        name: 'Mark Ingest Processed',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1500, 400],
      },

      // ---- Error handler: log to errors table ----
      {
        parameters: {
          jsCode: `
const errorItem = $input.first().json;
const ingestId = $('Split Items').first().json?.id || null;
const errorMsg = errorItem.message || errorItem.error || JSON.stringify(errorItem).slice(0, 500);

return [{ json: {
  source: 'ingest-to-draft',
  error_message: errorMsg,
  context: { ingest_item_id: ingestId },
  severity: 'error',
  resolved: false,
} }];
`.trim(),
        },
        id: `${prefix}-err-format`,
        name: 'Format Error',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1250, 650],
      },

      // ---- Insert error into errors table ----
      {
        parameters: {
          method: 'POST',
          url: `={{ ${supabaseUrl} + "/rest/v1/errors" }}`,
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'apikey', value: `=${supabaseKey}` },
            { name: 'Authorization', value: `=Bearer ${supabaseKey}` },
            { name: 'Prefer', value: 'return=minimal' },
          ]},
          sendBody: true,
          specifyBody: 'json',
          jsonBody: '={{ JSON.stringify($json) }}',
          options: { timeout: 10000 },
        },
        id: `${prefix}-err-insert`,
        name: 'Log Error',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1500, 650],
      },

      // ---- Check for empty results ----
      {
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
            conditions: [{
              operator: 'isNotEmpty',
              leftValue: '={{ $json.id }}',
              rightValue: '',
            }],
            combinator: 'and',
          },
        },
        id: `${prefix}-has-items`,
        name: 'Has Items?',
        type: 'n8n-nodes-base.if',
        typeVersion: 2,
        position: [500, 250],
      },
    ],

    connections: {
      'Every 2 Hours': { main: [[
        { node: 'Fetch Unprocessed Items', type: 'main', index: 0 },
      ]]},
      'Fetch Unprocessed Items': { main: [[
        { node: 'Has Items?', type: 'main', index: 0 },
      ]]},
      'Has Items?': { main: [
        [{ node: 'Split Items', type: 'main', index: 0 }],
      ]},
      'Split Items': { main: [[
        { node: 'Generate Draft (GLM)', type: 'main', index: 0 },
      ]]},
      'Generate Draft (GLM)': { main: [
        [{ node: 'Parse & Prepare Post', type: 'main', index: 0 }],
        [{ node: 'Format Error', type: 'main', index: 0 }],
      ]},
      'Parse & Prepare Post': { main: [[
        { node: 'Insert Post', type: 'main', index: 0 },
      ]]},
      'Insert Post': { main: [
        [{ node: 'Mark Ingest Processed', type: 'main', index: 0 }],
        [{ node: 'Format Error', type: 'main', index: 0 }],
      ]},
      'Mark Ingest Processed': { main: [[]] },
      'Format Error': { main: [[
        { node: 'Log Error', type: 'main', index: 0 },
      ]]},
      'Log Error': { main: [[]] },
    },

    settings: { executionOrder: 'v1', timezone: 'America/Chicago' },
  };
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const workflow = buildWorkflow();

  console.log('Deploying: ' + workflow.name);
  console.log('Nodes: ' + workflow.nodes.length);
  console.log('Trigger: every 2 hours');
  console.log('Input: Supabase ingest_items (unprocessed)');
  console.log('Output: Supabase posts (draft)');
  console.log('Model: glm-5.1 via GLM proxy');
  console.log('Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY');

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
