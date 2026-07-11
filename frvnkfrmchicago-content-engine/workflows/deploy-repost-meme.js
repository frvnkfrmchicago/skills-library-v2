#!/usr/bin/env node
/**
 * deploy-repost-meme.js -- Repost + Meme Engine.
 *
 * Trigger:  Manual (webhook)
 * Sources:  Reddit r/artificial + r/programming (top posts past week),
 *           Threads trending search
 * Process:  Merge -> Gemini score (humor/relatability/viral_potential/brand_fit) ->
 *           Pick top 3 -> Build caption prompts per platform -> Gemini generate ->
 *           Gemini generate meme card image -> Upload to storage -> Write to Supabase
 *
 * Pattern: build workflow JSON -> POST to n8n API -> activate
 */
'use strict';

const { api, env } = require('./load-env');

function buildWorkflow() {
  const prefix = 'frank-meme';
  const geminiApiKey = '{{ $env.GEMINI_API_KEY }}';

  return {
    name: 'Frank -- Repost + Meme Engine (Webhook)',
    nodes: [
      // 1. Webhook trigger
      {
        parameters: {
          httpMethod: 'POST',
          path: 'frank-meme-engine',
          responseMode: 'lastNode',
          options: { rawBody: false },
        },
        id: `${prefix}-webhook`,
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 2,
        position: [0, 400],
      },

      // 2a. Reddit r/artificial -- top posts past week
      {
        parameters: {
          method: 'GET',
          url: 'https://www.reddit.com/r/artificial/top.json?t=week&limit=25',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'User-Agent', value: 'assetpersona-meme-engine/1.0' },
          ]},
          options: { timeout: 15000 },
        },
        id: `${prefix}-reddit-ai`,
        name: 'Reddit r/artificial',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 200],
        onError: 'continueRegularOutput',
      },

      // 2b. Reddit r/programming -- top posts past week
      {
        parameters: {
          method: 'GET',
          url: 'https://www.reddit.com/r/programming/top.json?t=week&limit=25',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'User-Agent', value: 'assetpersona-meme-engine/1.0' },
          ]},
          options: { timeout: 15000 },
        },
        id: `${prefix}-reddit-prog`,
        name: 'Reddit r/programming',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 400],
        onError: 'continueRegularOutput',
      },

      // 2c. Threads trending search
      {
        parameters: {
          method: 'GET',
          url: '=https://graph.threads.net/v1.0/keyword_search',
          sendQuery: true,
          queryParameters: { parameters: [
            { name: 'q', value: 'artificial intelligence programming' },
            { name: 'search_type', value: 'TOP' },
            { name: 'fields', value: 'id,text,permalink,timestamp,like_count,reply_count' },
            { name: 'access_token', value: '={{ $env.THREADS_ACCESS_TOKEN }}' },
          ]},
          options: { timeout: 15000 },
        },
        id: `${prefix}-threads-search`,
        name: 'Threads Trending',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 600],
        onError: 'continueRegularOutput',
      },

      // 3. Merge + normalize all sources
      {
        parameters: {
          jsCode: `
const all = [];

// Parse Reddit response
function parseReddit(nodeName, subreddit) {
  try {
    const data = $(nodeName).first().json;
    const posts = data?.data?.children || [];
    for (const p of posts.slice(0, 15)) {
      const d = p.data || {};
      all.push({
        source: 'reddit',
        subreddit: subreddit,
        title: d.title || '',
        url: d.url || ('https://reddit.com' + d.permalink),
        score: d.score || 0,
        comments: d.num_comments || 0,
        thumbnail: (d.thumbnail && d.thumbnail.startsWith('http')) ? d.thumbnail : '',
        text: (d.selftext || '').slice(0, 200),
      });
    }
  } catch (_) {}
}

parseReddit('Reddit r/artificial', 'r/artificial');
parseReddit('Reddit r/programming', 'r/programming');

// Parse Threads
try {
  const thrData = $('Threads Trending').first().json;
  const posts = thrData?.data || [];
  for (const p of posts.slice(0, 10)) {
    all.push({
      source: 'threads',
      subreddit: '',
      title: (p.text || '').slice(0, 200),
      url: p.permalink || '',
      score: (p.like_count || 0) + (p.reply_count || 0) * 3,
      comments: p.reply_count || 0,
      thumbnail: '',
      text: (p.text || '').slice(0, 200),
    });
  }
} catch (_) {}

// Sort by engagement
all.sort((a, b) => b.score - a.score);

const topPosts = all.slice(0, 15).map((p, i) =>
  (i + 1) + '. [' + p.source + (p.subreddit ? '/' + p.subreddit : '') + '] (score: ' + p.score + ') "' + p.title.slice(0, 120) + '"'
).join('\\n');

return [{ json: {
  posts: topPosts,
  rawPosts: all.slice(0, 15),
  totalFound: all.length,
} }];
`.trim(),
        },
        id: `${prefix}-merge`,
        name: 'Merge + Normalize',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [550, 400],
      },

      // 4. Gemini score + pick top 3
      {
        parameters: {
          method: 'POST',
          url: `=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={{ JSON.stringify({
            contents: [{ parts: [{ text: 'TRENDING POSTS:\\n' + $json.posts + '\\n\\nScore each post on 4 dimensions (0-10):\\n- humor: how funny or witty\\n- relatability: how relatable to tech workers\\n- viral_potential: shareability factor\\n- brand_fit: fits a tech professional brand (NOT cannabis, NOT offensive)\\n\\nPick the TOP 3 posts by total score. Return JSON array:\\n[{title, source, total_score, humor, relatability, viral_potential, brand_fit, reaction_angle}]\\n\\nReaction angle: suggest how Frank should react (hot take, agree, disagree, add context, make funnier).\\nReturn ONLY valid JSON, no markdown.' }] }],
            systemInstruction: { parts: [{ text: 'You score trending content for a tech professional brand. Focus on AI, programming, dev culture, and tech industry content. Reject anything offensive, political, or off-brand. Return only valid JSON array.' }] },
            generationConfig: { temperature: 0.4, maxOutputTokens: 2000 }
          }) }}`,
          options: { timeout: 60000 },
        },
        id: `${prefix}-score`,
        name: 'Gemini Score + Pick',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [800, 400],
        onError: 'continueErrorOutput',
      },

      // 5. Parse scored results + build caption prompts
      {
        parameters: {
          jsCode: `
const response = $input.first().json;
let text = '';
if (response.candidates && response.candidates[0]) {
  text = response.candidates[0].content?.parts?.[0]?.text || '';
}
text = text.replace(/\`\`\`json\\n?/g, '').replace(/\`\`\`\\n?/g, '').trim();

let scored = [];
try { scored = JSON.parse(text); } catch (_) {
  scored = [{ title: 'Tech keeps being weird in 2026', source: 'fallback', total_score: 5, reaction_angle: 'hot take' }];
}

const top3 = scored.slice(0, 3);
const platforms = ['linkedin', 'threads', 'instagram', 'facebook'];

const outputs = [];
for (const post of top3) {
  for (const platform of platforms) {
    outputs.push({
      original_title: post.title,
      source: post.source,
      score: post.total_score,
      reaction_angle: post.reaction_angle || 'hot take',
      platform,
    });
  }
}

return outputs.map(o => ({ json: o }));
`.trim(),
        },
        id: `${prefix}-build-caps`,
        name: 'Build Caption Prompts',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1050, 400],
      },

      // 6. Gemini generate captions
      {
        parameters: {
          method: 'POST',
          url: `=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={{ JSON.stringify({
            contents: [{ parts: [{ text: 'ORIGINAL POST: "' + $json.original_title + '"\\nSOURCE: ' + $json.source + '\\nREACTION ANGLE: ' + $json.reaction_angle + '\\nPLATFORM: ' + $json.platform + '\\n\\nWrite Frank\\'s repost/reaction caption. Platform rules:\\n- linkedin: 800-1300 chars, professional but human, end with question, 3-5 hashtags\\n- threads: max 500 chars, punchy hot take, 2-3 hashtags\\n- instagram: 800-1500 chars, visual-first aspirational, 15-20 hashtags\\n- facebook: 300-500 chars, community tone, end with question, 2-3 hashtags\\n\\nNo markdown. Max 2 emojis. Sound human. BANNED: leverage, unlock, elevate, game-changing, revolutionary, seamless, robust, cutting-edge, delve, landscape.' }] }],
            systemInstruction: { parts: [{ text: 'You write social media reactions for Frank Lawrence Jr. (@assetpersona). He reposts trending tech content with his own take. Direct, opinionated, funny when appropriate. Never preachy. Return ONLY the caption text.' }] },
            generationConfig: { temperature: 0.88, maxOutputTokens: 1500 }
          }) }}`,
          options: { timeout: 45000 },
        },
        id: `${prefix}-gen-caption`,
        name: 'Gemini Generate Caption',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1300, 400],
        onError: 'continueRegularOutput',
      },

      // 7. Gemini generate meme card image
      {
        parameters: {
          method: 'POST',
          url: `=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={{ JSON.stringify({
            contents: [{ parts: [{ text: 'Generate a clean branded social media meme card image for this topic: "' + $json.original_title + '". Style: Very dark (#0D0D0D) background. Bright electric blue (#3B82F6) accent line at top. Bold sans-serif headline zone. Minimal, premium, 2026 tech brand design. No text rendered in the image. 1080x1080 square. Subtle geometric grid lines in dark gray.' }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
          }) }}`,
          options: { timeout: 60000 },
        },
        id: `${prefix}-gen-image`,
        name: 'Gemini Meme Card',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1300, 600],
        onError: 'continueRegularOutput',
      },

      // 8. Clean + write to Supabase
      {
        parameters: {
          jsCode: `
const response = $input.first().json;
const meta = $('Build Caption Prompts').first().json;

let caption = '';
if (response.candidates && response.candidates[0]) {
  caption = response.candidates[0].content?.parts?.[0]?.text || '';
}
caption = caption.replace(/<think>[\\s\\S]*?<\\/think>/g, '').trim();
caption = caption.replace(/\`\`\`/g, '').replace(/\\*\\*/g, '').trim();
caption = caption.replace(/^["']/,'').replace(/["']$/,'').trim();

if (!caption) caption = meta.original_title || 'This one got me thinking.';

return [{ json: {
  category: 'repost_meme',
  platform: meta.platform,
  headline: meta.original_title,
  caption: caption,
  source: meta.source,
  reaction_angle: meta.reaction_angle,
  score: meta.score,
  status: 'draft',
  created_by: 'n8n-repost-meme',
  created_at: new Date().toISOString(),
} }];
`.trim(),
        },
        id: `${prefix}-clean`,
        name: 'Clean + Prepare',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1550, 400],
      },

      // 9. Write to Supabase
      {
        parameters: {
          method: 'POST',
          url: '={{ $env.SUPABASE_URL }}/rest/v1/posts',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'apikey', value: '={{ $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY }}' },
            { name: 'Authorization', value: '=Bearer {{ $env.SUPABASE_SERVICE_ROLE_KEY || $env.SUPABASE_ANON_KEY }}' },
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Prefer', value: 'return=representation' },
          ]},
          sendBody: true,
          specifyBody: 'json',
          jsonBody: '={{ JSON.stringify($json) }}',
          options: { timeout: 15000 },
        },
        id: `${prefix}-supabase`,
        name: 'Write to Supabase',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1800, 400],
        onError: 'continueRegularOutput',
      },

      // 10. Error handler
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
      body: JSON.stringify({ workflow: 'repost-meme', error: errMsg, created_at: new Date().toISOString() }),
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
        position: [1050, 700],
      },
    ],

    connections: {
      'Webhook Trigger': { main: [[
        { node: 'Reddit r/artificial', type: 'main', index: 0 },
        { node: 'Reddit r/programming', type: 'main', index: 0 },
        { node: 'Threads Trending', type: 'main', index: 0 },
      ]]},
      'Reddit r/artificial':  { main: [[ { node: 'Merge + Normalize', type: 'main', index: 0 } ]] },
      'Reddit r/programming': { main: [[ { node: 'Merge + Normalize', type: 'main', index: 0 } ]] },
      'Threads Trending':     { main: [[ { node: 'Merge + Normalize', type: 'main', index: 0 } ]] },
      'Merge + Normalize':    { main: [[ { node: 'Gemini Score + Pick', type: 'main', index: 0 } ]] },
      'Gemini Score + Pick': {
        main:  [[ { node: 'Build Caption Prompts', type: 'main', index: 0 } ]],
        error: [[ { node: 'Log Error to Supabase', type: 'main', index: 0 } ]],
      },
      'Build Caption Prompts':  { main: [[
        { node: 'Gemini Generate Caption', type: 'main', index: 0 },
        { node: 'Gemini Meme Card', type: 'main', index: 0 },
      ]]},
      'Gemini Generate Caption': { main: [[ { node: 'Clean + Prepare', type: 'main', index: 0 } ]] },
      'Clean + Prepare':         { main: [[ { node: 'Write to Supabase', type: 'main', index: 0 } ]] },
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
  console.log('Trigger: Webhook (POST /webhook/frank-meme-engine)');
  console.log('Sources: Reddit r/artificial, r/programming, Threads search');

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
      console.log('\nWebhook URL: ' + (KEYS.N8N_BASE_URL || 'http://localhost:5678') + '/webhook/frank-meme-engine');
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
