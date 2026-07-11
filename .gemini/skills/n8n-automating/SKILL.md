---
name: n8n-automating
description: >
  Designs and builds n8n workflow automations including trigger selection, node
  chaining, error handling, data transformation, and external service integration.
  Includes common workflow templates for lead capture, content sync, and AI
  processing pipelines. Use when designing n8n workflows, selecting nodes,
  handling errors in automations, or building webhook-triggered pipelines.
---

# n8n Automating

Design and build production-quality n8n workflow automations. Every workflow
needs a clear trigger, proper error handling, and tested data transformations.

---

## Workflow Design Process

1. **Map the workflow** — What triggers it? What is the end state?
2. **Choose nodes** — Select the right n8n node for each step
3. **Handle errors** — Every workflow needs error branches
4. **Transform data** — JSON mapping, filtering, aggregation between nodes
5. **Test and monitor** — Verify with sample data, set up failure alerts

---

## Common Workflow Templates

### Lead Capture → CRM

```
[Webhook] → [Parse Data] → [Add to CRM] → [Send Welcome Email] → [Notify Slack]
                                   ↓
                             [Error Handler] → [Log to Sheet]
```

**Trigger:** Webhook from form submission
**Nodes:** HTTP Request → Function (parse) → CRM node → Email → Slack
**Error branch:** Log failures to Google Sheets for manual review

### Content Sync (Scheduled)

```
[Schedule: Daily] → [Fetch from CMS] → [Transform] → [Update Database] → [Bust Cache]
```

**Trigger:** Cron schedule (daily at 2am)
**Nodes:** Schedule → HTTP Request → Function (transform) → Database → HTTP (cache purge)

### AI Processing Pipeline

```
[New Upload] → [Extract Text] → [Send to AI] → [Store Result] → [Notify User]
```

**Trigger:** Webhook or file watcher
**Nodes:** Webhook → Function (extract) → HTTP (AI API) → Database → Email/Slack

### Webhook → Database → Notification

```
[Webhook] → [Validate] → [Upsert DB] → [IF changed] → [Notify] → [Log]
```

---

## Node Selection Guide

| Task | Recommended Node |
|------|-----------------|
| Receive external event | Webhook |
| Call an API | HTTP Request |
| Transform JSON | Function / Set |
| Conditional logic | IF |
| Loop over items | Split In Batches |
| Wait between calls | Wait |
| Send email | Email / SendGrid / Mailgun |
| Message Slack | Slack |
| Read/write database | Postgres / MySQL / MongoDB |
| Read/write spreadsheet | Google Sheets |
| Store files | S3 / Google Drive |

---

## Error Handling Patterns

| Pattern | Implementation |
|---------|---------------|
| Retry on fail | Set retry count and wait time on the node settings |
| Conditional branching | IF node with error output connected |
| Fallback path | Error branch that logs + alerts instead of crashing |
| Dead letter queue | Failed items logged to separate sheet/table for review |

Every workflow MUST have at least one error branch. Do not let failures silently
disappear.

---

## Data Transformation Tips

```javascript
// In a Function node — map fields between systems
const items = $input.all()
return items.map(item => ({
  json: {
    name: item.json.full_name,
    email: item.json.email_address,
    source: 'webhook',
    created_at: new Date().toISOString()
  }
}))
```

---

## n8n Best Practices

| Practice | Why |
|----------|-----|
| Use credentials, never hardcode secrets | Security — secrets in nodes are encrypted |
| Rate limit API calls with Wait nodes | Avoid getting blocked by external APIs |
| Use Split In Batches for bulk operations | Prevents timeout on large datasets |
| Test with sample data first | Catch transform errors before production |
| Set up execution logging | Monitor for silent failures |
| Pin test data during development | Consistent results while building |

---

## ⛔ STOP GATE

DO NOT deploy an n8n workflow without:
1. Testing with real sample data (not just "test execution")
2. Verifying error branches catch and log failures
3. Confirming rate limiting is in place for external API calls
4. Checking that no secrets are hardcoded (all in credentials)
5. Setting up monitoring alerts for workflow failures
