#!/usr/bin/env node
/**
 * deploy-ai-tech-news.js -- AI/Tech News to LinkedIn + Threads pipeline.
 *
 * Schedule: Daily 9AM CT
 * Sources:  HackerNews API, TechCrunch AI RSS, VentureBeat AI RSS,
 *           MIT Tech Review RSS, Ars Technica RSS
 * Process:  Merge -> Build news summary with daily post type rotation ->
 *           Gemini 2.0 Flash generate -> Strip markdown -> Post to LinkedIn + Threads
 * Errors:   Catch node -> log to Supabase errors table
 *
 * Pattern:  build workflow JSON -> POST to n8n API -> activate
 */
'use strict';

const { api, env } = require('./load-env');

// -- Daily post type rotation (7-day cycle) --------------------------------
const POST_TYPES = [
  'HOT TAKE',       // Sunday
  'STORY',          // Monday
  'QUESTION',       // Tuesday
  'LISTICLE',       // Wednesday
  'CONTRARIAN',     // Thursday
  'PRACTICAL TIP',  // Friday
  'BREAKDOWN',      // Saturday
];

// -- HackerNews AI keyword filter ------------------------------------------
const HN_FILTER_KEYWORDS = [
  'ai', 'gpt', 'llm', 'machine learning', 'openai', 'anthropic', 'gemini',
  'claude', 'deep learning', 'neural', 'transformer', 'diffusion', 'agentic',
  'rag', 'retrieval', 'fine-tune', 'fine-tuning', 'multimodal', 'reasoning',
  'foundation model', 'copilot', 'chatbot', 'generative', 'nvidia', 'cuda',
  'meta ai', 'mistral', 'open source ai', 'automation', 'robot',
];

function buildWorkflow() {
  const prefix = 'frank-news';
  const geminiApiKey = '{{ $env.GEMINI_API_KEY }}';

  return {
    name: 'Frank -- AI/Tech News Daily (LinkedIn + Threads)',
    nodes: [
      // 1. Schedule trigger: daily 9AM CT
      {
        parameters: {
          rule: {
            interval: [{
              field: 'cronExpression',
              expression: '0 9 * * *',
            }],
          },
        },
        id: `${prefix}-trigger`,
        name: 'Daily 9AM CT',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [0, 400],
      },

      // 2a. HackerNews API -- top stories
      {
        parameters: {
          method: 'GET',
          url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
          options: { timeout: 15000 },
        },
        id: `${prefix}-hn-ids`,
        name: 'HN Top Story IDs',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 100],
        onError: 'continueRegularOutput',
      },

      // 2b. Fetch first 15 HN story details and filter for AI
      {
        parameters: {
          jsCode: `
const ids = $input.first().json;
const storyIds = Array.isArray(ids) ? ids.slice(0, 15) : [];
const stories = [];
for (const id of storyIds) {
  try {
    const resp = await fetch('https://hacker-news.firebaseio.com/v0/item/' + id + '.json');
    const s = await resp.json();
    if (s && s.title) stories.push({ source: 'HackerNews', title: s.title, url: s.url || ('https://news.ycombinator.com/item?id=' + s.id) });
  } catch (_) {}
}
const keywords = ${JSON.stringify(HN_FILTER_KEYWORDS)};
const filtered = stories.filter(s => {
  const lower = s.title.toLowerCase();
  return keywords.some(k => lower.includes(k));
});
return filtered.length > 0
  ? filtered.map(s => ({ json: s }))
  : [{ json: { source: 'HackerNews', title: 'No AI stories found', url: '' } }];
`.trim(),
        },
        id: `${prefix}-hn-filter`,
        name: 'HN Filter AI',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [500, 100],
      },

      // 3a. TechCrunch AI RSS
      {
        parameters: {
          method: 'GET',
          url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
          sendHeaders: true,
          headerParameters: { parameters: [{ name: 'User-Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }] },
          options: { timeout: 15000 },
        },
        id: `${prefix}-rss-tc`,
        name: 'TechCrunch AI RSS',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 300],
        onError: 'continueRegularOutput',
      },

      // 3b. VentureBeat AI RSS
      {
        parameters: {
          method: 'GET',
          url: 'https://venturebeat.com/category/ai/feed/',
          sendHeaders: true,
          headerParameters: { parameters: [{ name: 'User-Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }] },
          options: { timeout: 15000 },
        },
        id: `${prefix}-rss-vb`,
        name: 'VentureBeat AI RSS',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 500],
        onError: 'continueRegularOutput',
      },

      // 3c. MIT Tech Review RSS
      {
        parameters: {
          method: 'GET',
          url: 'https://www.technologyreview.com/feed/',
          sendHeaders: true,
          headerParameters: { parameters: [{ name: 'User-Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }] },
          options: { timeout: 15000 },
        },
        id: `${prefix}-rss-mit`,
        name: 'MIT Tech Review RSS',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 700],
        onError: 'continueRegularOutput',
      },

      // 3d. Ars Technica RSS
      {
        parameters: {
          method: 'GET',
          url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
          sendHeaders: true,
          headerParameters: { parameters: [{ name: 'User-Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }] },
          options: { timeout: 15000 },
        },
        id: `${prefix}-rss-ars`,
        name: 'Ars Technica RSS',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 900],
        onError: 'continueRegularOutput',
      },

      // 4. Merge all sources + build summary
      {
        parameters: {
          jsCode: `
// Parse RSS XML into {source, title, url} arrays
function parseRss(xml, sourceName) {
  const items = [];
  const str = typeof xml === 'string' ? xml : JSON.stringify(xml);
  const matches = str.match(/<item>[\\s\\S]*?<\\/item>/g) || [];
  for (const item of matches.slice(0, 8)) {
    const title = (item.match(/<title>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/title>/) || [])[1]?.trim();
    const link = (item.match(/<link>([\\s\\S]*?)<\\/link>/) || [])[1]?.trim();
    if (title && link) items.push({ source: sourceName, title, url: link });
  }
  return items;
}

const all = [];

// HN filtered stories
try {
  const hnItems = $('HN Filter AI').all();
  for (const item of hnItems) {
    if (item.json.title && item.json.title !== 'No AI stories found') {
      all.push(item.json);
    }
  }
} catch (_) {}

// RSS feeds
const rssSources = [
  ['TechCrunch AI RSS', 'TechCrunch'],
  ['VentureBeat AI RSS', 'VentureBeat'],
  ['MIT Tech Review RSS', 'MIT Tech Review'],
  ['Ars Technica RSS', 'Ars Technica'],
];

for (const [nodeName, label] of rssSources) {
  try {
    const data = $(nodeName).first().json;
    const xml = data?.data || JSON.stringify(data);
    all.push(...parseRss(xml, label));
  } catch (_) {}
}

const summary = all.slice(0, 20).map((h, i) => (i + 1) + '. [' + h.source + '] ' + h.title).join('\\n');
const dayIdx = new Date().getDay();
const postTypes = ${JSON.stringify(POST_TYPES)};
const postType = postTypes[dayIdx];

return [{ json: {
  headlines: summary || 'No headlines collected today.',
  headlineCount: all.length,
  postType: postType,
  topTitle: all[0]?.title || 'AI technology continues to evolve rapidly in 2026',
  topSource: all[0]?.source || 'Industry',
  topUrl: all[0]?.url || '',
} }];
`.trim(),
        },
        id: `${prefix}-merge`,
        name: 'Merge + Build Summary',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [750, 400],
      },

      // 5. Build Gemini prompt
      {
        parameters: {
          jsCode: `
const d = $input.first().json;
const systemPrompt = [
  'You write LinkedIn and Threads posts for Frank Lawrence Jr. (@assetpersona).',
  'Frank is a tech professional in Chicago who posts daily about AI, machine learning, dev tools, and the future of software.',
  '',
  'Today\\'s post type: ' + d.postType,
  '',
  'Output EXACTLY 2 posts separated by |||BREAK|||:',
  '1. LINKEDIN (1300-2000 chars) -- ' + d.postType + ' format. Hook in the first 2 lines.',
  '   Name publications, companies, people (Google, OpenAI, Meta, NVIDIA, Anthropic, etc).',
  '   Mention 2026 at least once. End with a question. 3-5 hashtags.',
  '   SEO keywords: AI, machine learning, LLM, GPT, open source, agentic AI, RAG, automation.',
  '',
  '2. THREADS (max 500 chars) -- punchy hot take. Direct opinion. 2-3 hashtags.',
  '',
  'RULES:',
  '- No markdown formatting, no bold, no bullet point symbols.',
  '- Max 2 emojis per post.',
  '- Write like someone thinking out loud about news they read.',
  '- NEVER use these patterns: "Not X, it\\'s Y", "Let that sink in", "Read that again",',
  '  "Full stop", "Here\\'s why", "Here\\'s the thing", "The bigger question nobody\\'s asking".',
  '- BANNED words: leverage, unlock, landscape, paradigm, revolutionize, empower, disrupt,',
  '  groundbreaking, robust, navigate, journey, deep dive, delve, elevate, game-changing,',
  '  seamless, cutting-edge.',
  '- Sound human. Sound like Frank, not an AI.',
].join('\\n');

const userPrompt = 'TODAY\\'S AI/TECH HEADLINES:\\n' + d.headlines +
  '\\n\\nLead story: "' + d.topTitle + '" (via ' + d.topSource + ')' +
  '\\nPost type today: ' + d.postType +
  '\\nWrite 2 posts separated by |||BREAK|||.';

return [{ json: {
  systemPrompt,
  userPrompt,
  headlines: d.headlines,
  postType: d.postType,
  fallback: 'AI is moving faster than most teams can keep up with. What did you ship this week? #AI #MachineLearning',
} }];
`.trim(),
        },
        id: `${prefix}-prompt`,
        name: 'Build Prompt',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1000, 400],
      },

      // 6. Gemini 2.0 Flash generate
      {
        parameters: {
          method: 'POST',
          url: `=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={{ JSON.stringify({
            contents: [{ parts: [{ text: $json.userPrompt }] }],
            systemInstruction: { parts: [{ text: $json.systemPrompt }] },
            generationConfig: { temperature: 0.85, maxOutputTokens: 3000 }
          }) }}`,
          options: { timeout: 60000 },
        },
        id: `${prefix}-gemini`,
        name: 'Gemini Generate',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1250, 400],
        onError: 'continueErrorOutput',
      },

      // 7. Clean + split output
      {
        parameters: {
          jsCode: `
try {
  function trimToSentence(str, maxLen) {
    if (!str) return '';
    if (str.length <= maxLen) return str;
    const cut = str.substring(0, maxLen);
    const last = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('?'), cut.lastIndexOf('!'));
    if (last > maxLen * 0.5) return str.substring(0, last + 1).trim();
    const sp = cut.lastIndexOf(' ');
    return sp > 0 ? cut.substring(0, sp).trim() : cut.trim();
  }

  const response = $input.first().json;
  const prev = $('Build Prompt').first().json;

  let text = '';
  if (response.candidates && response.candidates[0]) {
    text = response.candidates[0].content?.parts?.[0]?.text || '';
  } else if (response.choices && response.choices[0]) {
    text = response.choices[0].message?.content || '';
  }
  if (!text) text = JSON.stringify(response).slice(0, 500);

  // Strip thinking tags and markdown formatting
  text = text.replace(/<think>[\\s\\S]*?<\\/think>/g, '').trim();
  text = text.replace(/\`\`\`/g, '').replace(/\\*\\*/g, '').trim();

  const parts = text.split('|||BREAK|||').map(p => p.trim());
  const clean = (s) => (s || '').replace(/^[\"']/,'').replace(/[\"']$/,'').trim();

  return [{ json: {
    linkedinText: clean(parts[0] || prev.fallback),
    threadsText: clean(trimToSentence(parts[1] || prev.fallback, 500)),
    postType: prev.postType,
  } }];
} catch (e) {
  const fb = $('Build Prompt').first().json.fallback || 'AI keeps moving. What are you building? #AI #Tech';
  return [{ json: { linkedinText: fb, threadsText: fb, postType: 'FALLBACK' } }];
}
`.trim(),
        },
        id: `${prefix}-clean`,
        name: 'Clean Output',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1500, 400],
      },

      // 8a. Post to LinkedIn
      {
        parameters: {
          method: 'POST',
          url: 'https://api.linkedin.com/rest/posts',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'Authorization', value: '=Bearer {{ $env.LINKEDIN_ACCESS_TOKEN }}' },
            { name: 'LinkedIn-Version', value: '202604' },
            { name: 'X-Restli-Protocol-Version', value: '2.0.0' },
            { name: 'Content-Type', value: 'application/json' },
          ]},
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={{ JSON.stringify({
            author: $env.LINKEDIN_PERSON_URN || 'urn:li:person:unknown',
            commentary: $json.linkedinText,
            visibility: 'PUBLIC',
            distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
            lifecycleState: 'PUBLISHED',
            isReshareDisabledByAuthor: false
          }) }}`,
          options: {
            timeout: 30000,
            retry: { maxTries: 3, waitBetweenTries: 5000 },
            response: { response: { fullResponse: true } },
          },
        },
        id: `${prefix}-li-post`,
        name: 'LinkedIn Post',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1750, 300],
        onError: 'continueRegularOutput',
      },

      // 8b. Post to Threads -- create container
      {
        parameters: {
          method: 'POST',
          url: '=https://graph.threads.net/v1.0/{{ $env.THREADS_USER_ID }}/threads',
          sendQuery: true,
          queryParameters: { parameters: [
            { name: 'media_type', value: 'TEXT' },
            { name: 'text', value: '={{ $json.threadsText }}' },
            { name: 'access_token', value: '={{ $env.THREADS_ACCESS_TOKEN }}' },
          ]},
          options: {
            timeout: 30000,
            retry: { maxTries: 3, waitBetweenTries: 5000 },
          },
        },
        id: `${prefix}-thr-create`,
        name: 'Threads Create',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1750, 500],
        onError: 'continueRegularOutput',
      },

      // 8c. Threads wait 30s
      {
        parameters: { time: 30, unit: 'seconds' },
        id: `${prefix}-thr-wait`,
        name: 'Threads Wait 30s',
        type: 'n8n-nodes-base.wait',
        typeVersion: 1.1,
        position: [2000, 500],
      },

      // 8d. Threads publish
      {
        parameters: {
          method: 'POST',
          url: '=https://graph.threads.net/v1.0/{{ $env.THREADS_USER_ID }}/threads_publish',
          sendQuery: true,
          queryParameters: { parameters: [
            { name: 'creation_id', value: '={{ $json.id }}' },
            { name: 'access_token', value: '={{ $env.THREADS_ACCESS_TOKEN }}' },
          ]},
          options: {
            timeout: 30000,
            retry: { maxTries: 3, waitBetweenTries: 5000 },
          },
        },
        id: `${prefix}-thr-pub`,
        name: 'Threads Publish',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [2250, 500],
        onError: 'continueRegularOutput',
      },

      // 9. Error handler -- log to Supabase
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
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': 'Bearer ' + supabaseKey,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        workflow: 'ai-tech-news',
        error: errMsg,
        created_at: new Date().toISOString(),
      }),
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
        position: [1500, 700],
      },
    ],

    connections: {
      'Daily 9AM CT': { main: [[
        { node: 'HN Top Story IDs', type: 'main', index: 0 },
        { node: 'TechCrunch AI RSS', type: 'main', index: 0 },
        { node: 'VentureBeat AI RSS', type: 'main', index: 0 },
        { node: 'MIT Tech Review RSS', type: 'main', index: 0 },
        { node: 'Ars Technica RSS', type: 'main', index: 0 },
      ]]},
      'HN Top Story IDs': { main: [[ { node: 'HN Filter AI', type: 'main', index: 0 } ]] },
      'HN Filter AI': { main: [[ { node: 'Merge + Build Summary', type: 'main', index: 0 } ]] },
      'TechCrunch AI RSS': { main: [[ { node: 'Merge + Build Summary', type: 'main', index: 0 } ]] },
      'VentureBeat AI RSS': { main: [[ { node: 'Merge + Build Summary', type: 'main', index: 0 } ]] },
      'MIT Tech Review RSS': { main: [[ { node: 'Merge + Build Summary', type: 'main', index: 0 } ]] },
      'Ars Technica RSS': { main: [[ { node: 'Merge + Build Summary', type: 'main', index: 0 } ]] },
      'Merge + Build Summary': { main: [[ { node: 'Build Prompt', type: 'main', index: 0 } ]] },
      'Build Prompt': { main: [[ { node: 'Gemini Generate', type: 'main', index: 0 } ]] },
      'Gemini Generate': {
        main: [[ { node: 'Clean Output', type: 'main', index: 0 } ]],
        error: [[ { node: 'Log Error to Supabase', type: 'main', index: 0 } ]],
      },
      'Clean Output': { main: [[
        { node: 'LinkedIn Post', type: 'main', index: 0 },
        { node: 'Threads Create', type: 'main', index: 0 },
      ]]},
      'Threads Create': { main: [[ { node: 'Threads Wait 30s', type: 'main', index: 0 } ]] },
      'Threads Wait 30s': { main: [[ { node: 'Threads Publish', type: 'main', index: 0 } ]] },
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
  console.log('Schedule: Daily 9AM CT');
  console.log('Targets: LinkedIn (personal) + Threads');

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
