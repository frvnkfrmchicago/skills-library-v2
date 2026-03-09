# Agent 5 Handoff — N8N Automation

## Context

Skills Library for AI-assisted development. N8N is critical for workflow automation.

**Location:** `/Users/franklawrencejr./Downloads/skills-library-v2 2/`

---

## What to Build

### `agents/n8n/SKILL.md`

**Must cover:**

1. **Workflow Fundamentals**
   - Triggers (webhook, schedule, app triggers)
   - Nodes and connections
   - Data flow and transformations
   - Expressions and variables

2. **API Integrations**
   - HTTP Request node
   - Authentication (OAuth, API keys)
   - Pagination handling
   - Rate limiting

3. **Webhook Handling**
   - Incoming webhooks
   - Webhook responses
   - Webhook authentication
   - Testing webhooks locally

4. **Error Handling**
   - Error trigger node
   - Retry logic
   - Fallback workflows
   - Error notifications

5. **Scheduling**
   - Cron expressions
   - Interval triggers
   - Timezone handling

6. **Self-Hosted vs Cloud**
   - Docker deployment
   - Database configuration
   - Scaling considerations
   - Cost comparison

7. **AI Integrations**
   - OpenAI node
   - LangChain node
   - Custom AI workflows
   - Vector store integrations

8. **Database Operations**
   - Postgres node
   - MongoDB node
   - Data transformations
   - Batch operations

9. **Complex Patterns**
   - Sub-workflows
   - Merge and split nodes
   - Loop and conditional logic
   - Parallel execution

10. **vs Other Tools**
    - N8N vs Zapier
    - N8N vs Make (Integromat)
    - N8N vs Windmill
    - When to use each

---

## Format

YAML frontmatter:

```yaml
---
name: n8n
description: N8N workflow automation. Triggers, webhooks, AI integrations, self-hosted.
last_updated: 2026-03
---
```

---

## After Building (REQUIRED)

1. Add to `SKILL-NAVIGATION.md` under automation/integrations
2. Add to `tech-stack/SKILL-INDEX.md`
3. Add to `_meta/CHANGELOG.md`

---

## Completion Report

1. Path to created file
2. Confirmation navigation updated
3. Any issues
