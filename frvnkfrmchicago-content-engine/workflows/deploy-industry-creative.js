#!/usr/bin/env node
/**
 * deploy-industry-creative.js -- Industry + Creative to 5 Platforms pipeline.
 *
 * Schedule: Tue/Thu 10AM CT
 * Sources:  Product Hunt API, Forbes Tech RSS, Creative Bloq RSS, Google News AI RSS
 * Process:  Gemini categorize -> pick best per category -> build 5 platform-specific
 *           prompts -> Gemini generate captions -> write to Supabase posts table as drafts
 * Categories: ai_ml, dev_tools, career, culture, creative, industry
 *
 * Pattern: build workflow JSON -> POST to n8n API -> activate
 */
'use strict';

const { api, env } = require('./load-env');

const CATEGORIES = ['ai_ml', 'dev_tools', 'career', 'culture', 'creative', 'industry'];

const PLATFORM_RULES = {
  linkedin: {
    tone: 'Professional thought leadership. Name companies, people, and specific tools.',
    length: '1300-2000 chars',
    hashtags: '3-5 industry hashtags',
    restrictions: 'Full tech terminology OK.',
  },
  threads: {
    tone: 'Punchy hot take. Direct opinion. Conversational.',
    length: 'Max 500 chars',
    hashtags: '2-3 hashtags',
    restrictions: 'Short and sharp.',
  },
  instagram: {
    tone: 'Visual-first, aspirational, insider knowledge.',
    length: '800-1500 chars',
    hashtags: '15-20 relevant hashtags',
    restrictions: 'Use industry-neutral language. Focus on value and insight.',
  },
  facebook: {
    tone: 'Community, conversational, accessible.',
    length: '300-600 chars',
    hashtags: '2-3 hashtags',
    restrictions: 'End with a question. Keep it approachable.',
  },
  tiktok: {
    tone: 'Gen Z aware, trend-conscious, concise.',
    length: 'Max 300 chars',
    hashtags: '5-8 hashtags',
    restrictions: 'Hook in first line. Meme-aware.',
  },
};

function buildWorkflow() {
  const prefix = 'frank-industry';
  const geminiApiKey = '{{ $env.GEMINI_API_KEY }}';

  return {
    name: 'Frank -- Industry + Creative (Tue/Thu 10AM)',
    nodes: [
      // 1. Schedule trigger: Tue/Thu 10AM CT
      {
        parameters: {
          rule: {
            interval: [{
              field: 'cronExpression',
              expression: '0 10 * * 2,4',
            }],
          },
        },
        id: `${prefix}-trigger`,
        name: 'Tue/Thu 10AM CT',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.2,
        position: [0, 400],
      },

      // 2a. Product Hunt API (today's posts)
      {
        parameters: {
          method: 'GET',
          url: 'https://www.producthunt.com/feed',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'User-Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
          ]},
          options: { timeout: 15000 },
        },
        id: `${prefix}-ph`,
        name: 'Product Hunt Feed',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 200],
        onError: 'continueRegularOutput',
      },

      // 2b. Forbes Tech RSS
      {
        parameters: {
          method: 'GET',
          url: 'https://www.forbes.com/technology/feed/',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'User-Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
          ]},
          options: { timeout: 15000 },
        },
        id: `${prefix}-rss-forbes`,
        name: 'Forbes Tech RSS',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 400],
        onError: 'continueRegularOutput',
      },

      // 2c. Creative Bloq RSS
      {
        parameters: {
          method: 'GET',
          url: 'https://www.creativebloq.com/feeds/all',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'User-Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
          ]},
          options: { timeout: 15000 },
        },
        id: `${prefix}-rss-cb`,
        name: 'Creative Bloq RSS',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 600],
        onError: 'continueRegularOutput',
      },

      // 2d. Google News AI RSS
      {
        parameters: {
          method: 'GET',
          url: 'https://news.google.com/rss/search?q=artificial+intelligence+OR+machine+learning+tools+2026&hl=en-US&gl=US&ceid=US:en',
          sendHeaders: true,
          headerParameters: { parameters: [
            { name: 'User-Agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
          ]},
          options: { timeout: 15000 },
        },
        id: `${prefix}-rss-gn`,
        name: 'Google News AI RSS',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [250, 800],
        onError: 'continueRegularOutput',
      },

      // 3. Merge + parse all feeds
      {
        parameters: {
          jsCode: `
function parseRss(xml, sourceName) {
  const items = [];
  const str = typeof xml === 'string' ? xml : JSON.stringify(xml);
  const matches = str.match(/<item>[\\s\\S]*?<\\/item>/g) || [];
  for (const item of matches.slice(0, 8)) {
    const title = (item.match(/<title>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/title>/) || [])[1]?.trim();
    const link = (item.match(/<link>([\\s\\S]*?)<\\/link>/) || [])[1]?.trim();
    const desc = (item.match(/<description>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/description>/) || [])[1]?.trim();
    if (title) items.push({ source: sourceName, title, url: link || '', description: (desc || '').slice(0, 200) });
  }
  return items;
}

const all = [];
const sources = [
  ['Product Hunt Feed', 'Product Hunt'],
  ['Forbes Tech RSS', 'Forbes'],
  ['Creative Bloq RSS', 'Creative Bloq'],
  ['Google News AI RSS', 'Google News'],
];

for (const [nodeName, label] of sources) {
  try {
    const data = $(nodeName).first().json;
    const xml = data?.data || JSON.stringify(data);
    all.push(...parseRss(xml, label));
  } catch (_) {}
}

const headlineList = all.slice(0, 25).map((h, i) =>
  (i + 1) + '. [' + h.source + '] ' + h.title + (h.description ? ' -- ' + h.description.slice(0, 80) : '')
).join('\\n');

return [{ json: {
  headlines: headlineList || 'No headlines collected.',
  rawItems: all.slice(0, 25),
  count: all.length,
} }];
`.trim(),
        },
        id: `${prefix}-merge`,
        name: 'Merge All Sources',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [550, 400],
      },

      // 4. Gemini categorize
      {
        parameters: {
          method: 'POST',
          url: `=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={{ JSON.stringify({
            contents: [{ parts: [{ text: 'HEADLINES:\\n' + $json.headlines + '\\n\\nCategorize each headline into exactly ONE of these categories: ${CATEGORIES.join(', ')}\\nThen pick the SINGLE BEST headline per category.\\nReturn JSON array: [{headline, source, category, summary}]\\nOnly return valid JSON, no markdown.' }] }],
            systemInstruction: { parts: [{ text: 'You are a content categorizer for a tech professional. Categories: ai_ml (AI/ML news), dev_tools (developer tools, frameworks, SDKs), career (jobs, hiring, skills, salaries), culture (tech culture, remote work, community), creative (design, UX, creative tools), industry (business, funding, acquisitions, market). Return only valid JSON array.' }] },
            generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
          }) }}`,
          options: { timeout: 60000 },
        },
        id: `${prefix}-categorize`,
        name: 'Gemini Categorize',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [800, 400],
        onError: 'continueErrorOutput',
      },

      // 5. Parse categories + build platform prompts
      {
        parameters: {
          jsCode: `
const response = $input.first().json;
let text = '';
if (response.candidates && response.candidates[0]) {
  text = response.candidates[0].content?.parts?.[0]?.text || '';
}

// Strip markdown code fences if present
text = text.replace(/\`\`\`json\\n?/g, '').replace(/\`\`\`\\n?/g, '').trim();

let categorized = [];
try {
  categorized = JSON.parse(text);
} catch (_) {
  // Fallback: treat as uncategorized
  categorized = [{ headline: 'Tech industry moves fast in 2026', source: 'Fallback', category: 'industry', summary: 'General tech update.' }];
}

// Build 5 platform prompts per categorized item
const platforms = ${JSON.stringify(PLATFORM_RULES)};
const outputs = [];

for (const item of categorized.slice(0, 6)) {
  for (const [platform, rules] of Object.entries(platforms)) {
    outputs.push({
      category: item.category || 'industry',
      headline: item.headline || '',
      source: item.source || '',
      summary: item.summary || '',
      platform,
      tone: rules.tone,
      length: rules.length,
      hashtagRule: rules.hashtags,
      restrictions: rules.restrictions,
    });
  }
}

return outputs.map(o => ({ json: o }));
`.trim(),
        },
        id: `${prefix}-build-prompts`,
        name: 'Build Platform Prompts',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1050, 400],
      },

      // 6. Gemini generate caption per platform
      {
        parameters: {
          method: 'POST',
          url: `=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          sendBody: true,
          specifyBody: 'json',
          jsonBody: `={{ JSON.stringify({
            contents: [{ parts: [{ text: 'HEADLINE: ' + $json.headline + '\\nSUMMARY: ' + $json.summary + '\\nPLATFORM: ' + $json.platform + '\\nTONE: ' + $json.tone + '\\nLENGTH: ' + $json.length + '\\nHASHTAGS: ' + $json.hashtagRule + '\\nRESTRICTIONS: ' + $json.restrictions + '\\n\\nWrite the post. No markdown. Max 2 emojis. Sound human, not AI. BANNED words: leverage, unlock, landscape, paradigm, revolutionize, empower, disrupt, groundbreaking, robust, navigate, journey, deep dive, delve, elevate, game-changing, seamless, cutting-edge.' }] }],
            systemInstruction: { parts: [{ text: 'You write social media posts for Frank Lawrence Jr. (@assetpersona), a tech professional in Chicago. Write in his voice: direct, opinionated, knowledgeable. Return ONLY the post text, nothing else.' }] },
            generationConfig: { temperature: 0.82, maxOutputTokens: 1500 }
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

      // 7. Clean + prepare Supabase row
      {
        parameters: {
          jsCode: `
const response = $input.first().json;
const meta = $('Build Platform Prompts').first().json;

let caption = '';
if (response.candidates && response.candidates[0]) {
  caption = response.candidates[0].content?.parts?.[0]?.text || '';
}
caption = caption.replace(/<think>[\\s\\S]*?<\\/think>/g, '').trim();
caption = caption.replace(/\`\`\`/g, '').replace(/\\*\\*/g, '').trim();
// Strip leading/trailing quotes
caption = caption.replace(/^["']/,'').replace(/["']$/,'').trim();

if (!caption) caption = meta.headline || 'Check out what is happening in tech this week.';

return [{ json: {
  category: meta.category,
  platform: meta.platform,
  headline: meta.headline,
  caption: caption,
  source: meta.source,
  status: 'draft',
  created_by: 'n8n-industry-creative',
  created_at: new Date().toISOString(),
} }];
`.trim(),
        },
        id: `${prefix}-clean`,
        name: 'Clean Caption',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [1550, 400],
      },

      // 8. Write to Supabase posts table as drafts
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
        name: 'Write Draft to Supabase',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.2,
        position: [1800, 400],
        onError: 'continueRegularOutput',
      },

      // 9. Error handler
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
        workflow: 'industry-creative',
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
        position: [1050, 700],
      },
    ],

    connections: {
      'Tue/Thu 10AM CT': { main: [[
        { node: 'Product Hunt Feed', type: 'main', index: 0 },
        { node: 'Forbes Tech RSS', type: 'main', index: 0 },
        { node: 'Creative Bloq RSS', type: 'main', index: 0 },
        { node: 'Google News AI RSS', type: 'main', index: 0 },
      ]]},
      'Product Hunt Feed':    { main: [[ { node: 'Merge All Sources', type: 'main', index: 0 } ]] },
      'Forbes Tech RSS':      { main: [[ { node: 'Merge All Sources', type: 'main', index: 0 } ]] },
      'Creative Bloq RSS':    { main: [[ { node: 'Merge All Sources', type: 'main', index: 0 } ]] },
      'Google News AI RSS':   { main: [[ { node: 'Merge All Sources', type: 'main', index: 0 } ]] },
      'Merge All Sources':    { main: [[ { node: 'Gemini Categorize', type: 'main', index: 0 } ]] },
      'Gemini Categorize': {
        main:  [[ { node: 'Build Platform Prompts', type: 'main', index: 0 } ]],
        error: [[ { node: 'Log Error to Supabase', type: 'main', index: 0 } ]],
      },
      'Build Platform Prompts': { main: [[ { node: 'Gemini Generate Caption', type: 'main', index: 0 } ]] },
      'Gemini Generate Caption': { main: [[ { node: 'Clean Caption', type: 'main', index: 0 } ]] },
      'Clean Caption':          { main: [[ { node: 'Write Draft to Supabase', type: 'main', index: 0 } ]] },
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
  console.log('Schedule: Tue/Thu 10AM CT');
  console.log('Categories: ' + CATEGORIES.join(', '));
  console.log('Targets: 5 platforms via Supabase drafts');

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
