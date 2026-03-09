---
name: n8n
description: N8N workflow automation. Triggers, webhooks, AI integrations, self-hosted.
owner: Frank
last_updated: 2026-03
---

# N8N

Build automated workflows without code (or with code when needed).

> **See also:** `agents/backend-patterns/SKILL.md`, `ai-builder/agentic-workflows/SKILL.md`

---

## Context Questions

Before building N8N workflows:

1. **What's the trigger?** — Webhook, schedule, app event, manual
2. **What's the complexity?** — Simple linear vs branching logic
3. **What's the hosting?** — Self-hosted vs N8N Cloud
4. **What integrations?** — APIs, databases, SaaS tools, AI
5. **What's the error handling need?** — Silent fail vs alerts + retries

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Hosting** | Self-hosted (free) ←→ N8N Cloud (managed) |
| **Complexity** | Linear flows ←→ Sub-workflows + branching |
| **Code** | No-code nodes ←→ Custom JavaScript/Python |
| **Scale** | Single workflow ←→ Enterprise automation |
| **AI** | No AI ←→ Full LLM/agent integration |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Simple automation | No-code nodes + schedule trigger |
| API integrations | HTTP Request nodes + error handling |
| AI workflows | OpenAI/LangChain nodes + vector stores |
| Marketing automation | Social posting + email sequences |
| Data pipeline | Database nodes + transformations |
| Enterprise | Self-hosted + PostgreSQL + Redis queue |

---

## TL;DR

| Concept | Purpose |
|---------|---------|
| **Triggers** | Start workflows (webhook, schedule, app event) |
| **Nodes** | Actions (HTTP, database, AI) |
| **Workflows** | Connected nodes that automate tasks |
| **Credentials** | Secure API key storage |

---


## Part 1: Core Concepts

### Workflow Structure

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Trigger │ -> │  Node   │ -> │  Node   │ -> │ Output  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
   Webhook       HTTP          Transform      Send Email
```

### Triggers

| Trigger | Use Case |
|---------|----------|
| **Webhook** | Receive data from external services |
| **Schedule** | Run on cron (every hour, daily) |
| **App Trigger** | When event in Slack, GitHub, etc. |
| **Manual** | Test/run on demand |

### Node Types

| Category | Examples |
|----------|----------|
| **Core** | IF, Switch, Merge, Loop |
| **HTTP** | HTTP Request, Webhook Response |
| **Data** | Postgres, MongoDB, Redis |
| **Apps** | Slack, Discord, Notion, Airtable |
| **AI** | OpenAI, Anthropic, LangChain |
| **Code** | JavaScript, Python |

---

## Part 2: Webhook Workflows

### Receive Webhook

```json
// 1. Add Webhook node (trigger)
// 2. Copy webhook URL: https://your-n8n.com/webhook/abc123
// 3. Configure what data you expect
{
  "event": "order.created",
  "data": {
    "orderId": "123",
    "amount": 99.99
  }
}
```

### Webhook + Response

```javascript
// Webhook Response node - send data back
{
  "success": true,
  "message": "Order received",
  "processedAt": "{{ $now }}"
}
```

### Webhook Authentication

1. **Header Auth** - Check for API key in headers
2. **Basic Auth** - Username/password
3. **IP Whitelist** - Only allow specific IPs

```javascript
// IF node to validate API key
{{ $json.headers['x-api-key'] === 'your-secret-key' }}
```

---

## Part 3: API Integrations

### HTTP Request Node

```javascript
// GET request
{
  "method": "GET",
  "url": "https://api.example.com/users/{{ $json.userId }}",
  "headers": {
    "Authorization": "Bearer {{ $credentials.apiToken }}"
  }
}

// POST request with body
{
  "method": "POST",
  "url": "https://api.example.com/orders",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "product": "{{ $json.productId }}",
    "quantity": "{{ $json.qty }}"
  }
}
```

### Pagination Handling

```javascript
// Loop Over Items node + HTTP Request
// Option 1: Use "Pagination" in HTTP node settings
{
  "pagination": {
    "type": "offset",
    "limitParameter": "limit",
    "offsetParameter": "offset"
  }
}

// Option 2: Loop with Code node
let allResults = [];
let page = 1;
let hasMore = true;

while (hasMore) {
  const response = await fetch(`/api/items?page=${page}`);
  const data = await response.json();
  allResults.push(...data.items);
  hasMore = data.hasMore;
  page++;
}

return allResults;
```

### Rate Limiting

```javascript
// Settings on HTTP Request node
{
  "options": {
    "batching": {
      "batch": {
        "batchSize": 10,
        "batchInterval": 1000 // 1 second between batches
      }
    }
  }
}
```

---

## Part 4: AI Integrations

### OpenAI Node

```javascript
// Chat completion
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user", 
      "content": "{{ $json.userMessage }}"
    }
  ]
}
```

### LangChain Node

```javascript
// Agent with tools
{
  "agent": "openai-functions",
  "model": "gpt-4",
  "tools": [
    {
      "name": "search",
      "description": "Search the web"
    },
    {
      "name": "calculator",
      "description": "Do math"
    }
  ],
  "prompt": "{{ $json.query }}"
}
```

### Vector Store Integration

```javascript
// Pinecone Query
{
  "operation": "query",
  "index": "my-index",
  "vector": "{{ $json.embedding }}",
  "topK": 5
}

// Supabase Vector
{
  "table": "documents",
  "queryEmbedding": "{{ $json.embedding }}",
  "matchCount": 10
}
```

---

## Part 5: Error Handling

### Error Trigger

```
Workflow A (main)
├── HTTP Request -> might fail
├── On Error -> Error Workflow (separate)

Workflow B (error handler)
├── Error Trigger
├── Extract error details
├── Send Slack notification
├── Log to database
```

### Try/Catch Pattern

```javascript
// Code node with error handling
try {
  const result = await processData($json);
  return { success: true, data: result };
} catch (error) {
  return { success: false, error: error.message };
}
```

### Retry Logic

```javascript
// HTTP Request node settings
{
  "options": {
    "retry": {
      "maxRetries": 3,
      "retryInterval": 1000, // 1 second
      "retryOnTimeout": true
    }
  }
}
```

### Fallback Workflows

```
┌─────────┐    ┌─────────┐
│ Primary │ -> │ IF Node │ -> Success path
│ Action  │    │ (check) │
└─────────┘    └─────────┘
                    │
                    v
                Fallback path
```

---

## Part 6: Scheduling

### Cron Node

```javascript
// Every hour
{ "cronExpression": "0 * * * *" }

// Daily at 9am
{ "cronExpression": "0 9 * * *" }

// Every Monday at 10am
{ "cronExpression": "0 10 * * 1" }

// Every 15 minutes
{ "cronExpression": "*/15 * * * *" }
```

### Timezone Handling

```javascript
// Set in Schedule Trigger node
{
  "timezone": "America/Chicago"
}
```

---

## Part 7: Database Operations

### Postgres Node

```sql
-- Query
SELECT * FROM users WHERE created_at > {{ $json.since }}

-- Insert
INSERT INTO orders (user_id, total) 
VALUES ({{ $json.userId }}, {{ $json.total }})
RETURNING *

-- Upsert
INSERT INTO users (email, name)
VALUES ({{ $json.email }}, {{ $json.name }})
ON CONFLICT (email) 
DO UPDATE SET name = EXCLUDED.name
```

### MongoDB Node

```javascript
// Find
{
  "operation": "find",
  "collection": "users",
  "query": { "status": "active" }
}

// Insert
{
  "operation": "insert",
  "collection": "logs",
  "document": {
    "event": "{{ $json.event }}",
    "timestamp": "{{ $now }}"
  }
}
```

---

## Part 8: Self-Hosted vs Cloud

### Comparison

| Feature | Self-Hosted | N8N Cloud |
|---------|-------------|-----------|
| **Cost** | Server cost | $20-600/mo |
| **Setup** | You manage | Instant |
| **Updates** | Manual | Automatic |
| **Data** | Your servers | N8N servers |
| **Exec limit** | None | Plan-based |

### Docker Setup (Self-Hosted)

```yaml
# docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=secure-password
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.yourdomain.com/
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

### Production Tips

- Use PostgreSQL instead of SQLite for data
- Set up Redis for queue mode
- Put behind Cloudflare for DDoS protection
- Regular backups of workflows

---

## Part 9: N8N vs Alternatives

| Feature | N8N | Zapier | Make |
|---------|-----|--------|------|
| **Pricing** | Free self-host | $19.99/mo+ | $9/mo+ |
| **Code nodes** | Yes | Limited | Yes |
| **Self-host** | Yes | No | No |
| **AI nodes** | Excellent | Good | Good |
| **Learning** | Medium | Easy | Easy |
| **Executions** | Unlimited* | Limited | Limited |

### When to Use N8N

- Need code flexibility
- Want self-hosting
- Heavy AI workflows
- Cost-conscious at scale

### When NOT to Use

- Need quick no-code setup
- Team non-technical
- Want managed everything

---

## Part 10: Complex Patterns

### Sub-workflows

```javascript
// Call another workflow
{
  "workflowId": "abc123",
  "inputData": {
    "userId": "{{ $json.userId }}"
  }
}
```

### Merge Node

```
Path A ──┐
         ├──> Merge -> Combined output
Path B ──┘
```

Merge modes:
- **Append** - Combine all items
- **Merge by index** - Pair items 1:1
- **Merge by key** - Match on field

### Loop Over Items

```javascript
// Process each item separately
// Loop returns all results when complete
```

### Parallel Execution

```
        ┌──> Path A ──┐
Input ──┼──> Path B ──┼──> Merge
        └──> Path C ──┘
```

---

## Checklist

```markdown
- [ ] N8N installed (cloud or self-hosted)
- [ ] First webhook workflow created
- [ ] Credentials stored securely
- [ ] Error handling configured
- [ ] AI nodes tested
- [ ] Schedule triggers set
```

---

## Part 9: Marketing & Content Automation

### Content Posting Workflows

**Buffer-Style Multi-Platform Posting:**

```
Trigger: Schedule (daily at 9am)
    ↓
Airtable/Notion: Get today's scheduled posts
    ↓
Loop Over Items
    ↓
Switch: By platform
    ├── Twitter/X → HTTP Request (Twitter API)
    ├── LinkedIn → HTTP Request (LinkedIn API)
    ├── Instagram → Buffer/Later API
    └── Threads → (via Instagram)
    ↓
Update DB: Mark as posted
    ↓
Slack: Notify "Posted 3 items"
```

### AI Content Generation → Post

```
Trigger: Webhook (new content request)
    ↓
OpenAI: Generate post variations
    ↓
Slack: Send for human approval
    ↓
Wait: For approval webhook
    ↓
If approved:
    ├── Schedule posts
    └── Update content calendar
```

### Social Media Scheduling

```javascript
// Example: Queue posts for the week
// Trigger: Monday at 8am

// 1. Get content from CMS/Airtable
const posts = $input.all();

// 2. Assign posting times
const schedule = posts.map((post, i) => ({
  ...post,
  postAt: addDays(nextWeekday(), i),
  platform: post.json.platform
}));

return schedule;
```

### Email Campaign Triggers

```
Trigger: Webhook (user action)
    ↓
Switch: Action type
    ├── Signup → Welcome sequence
    ├── Purchase → Thank you + upsell
    ├── Abandoned cart → Recovery email
    └── Inactive 30d → Re-engagement
    ↓
Resend/SendGrid: Send email
    ↓
Update CRM: Log touchpoint
```

### Lead Scoring Automation

```
Trigger: Webhook (page visit, email open, etc.)
    ↓
Get: Current lead score from DB
    ↓
Calculate: New score
    ├── Email open: +5
    ├── Link click: +10
    ├── Pricing page: +25
    ├── Demo request: +50
    ↓
Update: Lead score in CRM
    ↓
If score > 100:
    └── Slack: Notify sales team
```

### Content Repurposing

```
Trigger: New blog post published
    ↓
OpenAI: Generate social variations
    ├── Twitter thread (5 tweets)
    ├── LinkedIn post (professional)
    ├── Instagram caption
    └── Newsletter snippet
    ↓
Add to: Content calendar (Airtable/Notion)
    ↓
Schedule: Across platforms
```

### Analytics Aggregation

```
Trigger: Weekly (Monday 7am)
    ↓
Parallel:
    ├── Google Analytics API
    ├── Twitter Analytics
    ├── LinkedIn Analytics
    └── Newsletter metrics
    ↓
Merge: Combine data
    ↓
OpenAI: Generate summary
    ↓
Slack: Weekly report
```

### CRM Sync Patterns

**Airtable ↔ Other Tools:**
```
Trigger: New Airtable record
    ↓
If: Lead source = "Website"
    ↓
Create: HubSpot contact
    ↓
Add to: Email sequence
```

**Two-Way Sync:**
```
Trigger: Webhook from either system
    ↓
Check: Which system updated
    ↓
Sync to: Other system
    ↓
Avoid: Infinite loop (check timestamp)
```

### Marketing Workflow Templates

| Workflow | Trigger | Actions |
|----------|---------|---------|
| Welcome sequence | New signup | Send 5 emails over 7 days |
| Social posting | Schedule | Post to 3 platforms |
| Content repurpose | New blog | Generate 4 social posts |
| Lead scoring | User action | Update score, notify if hot |
| Weekly digest | Cron | Aggregate metrics, send report |
| Abandoned cart | Cart + 1hr no purchase | Send recovery email |

---

## Resources

- N8N Docs: <https://docs.n8n.io/>
- Workflow Templates: <https://n8n.io/workflows/>
- Community: <https://community.n8n.io/>
- Self-hosting Guide: <https://docs.n8n.io/hosting/>

---

## Related Skills

- `ai-builder/agentic-workflows/SKILL.md` — AI agent patterns
- `agents/backend-patterns/SKILL.md` — API design
- `ai-builder/langchain/SKILL.md` — LangChain integration
- `content/social/SKILL.md` — Social content strategy
- `agents/email/SKILL.md` — Email infrastructure
