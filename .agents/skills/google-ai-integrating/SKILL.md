---
name: google-ai-integrating
description: >
  Guides efficient use of Google AI tools including Google AI Studio, Gemini API,
  Vertex AI, Antigravity IDE, Gemini CLI, and NotebookLM. Covers model selection,
  rate limit strategy, credit management, multi-account rotation, and MCP
  integrations. Use when selecting a Google AI model, managing rate limits,
  budgeting AI credits, configuring MCP servers, or orchestrating agents in
  Antigravity.
---

# Google AI Integrating

Ensure efficient use of Google's AI ecosystem. Select the right model for each
task, manage rate limits and credits, and configure agent orchestration in
Antigravity IDE.

---

## Tool Selection

| Tool | Purpose | Best For |
|------|---------|----------|
| Antigravity IDE | Agent-first code editor | Multi-file coding, debugging, testing |
| Gemini CLI | Terminal agent | Scripting, automation, MCP integrations |
| Google AI Studio | Model playground + vibe coding | Prototyping, testing prompts, quick apps |
| NotebookLM | Source-grounded research | Deep analysis from uploaded documents |
| Gemini Gems | Custom Gemini assistants | Repeatable specialized tasks |

---

## Model Selection Decision Tree

Select the lightest model that handles the task. Opus and Thinking prompts have
daily caps — do not burn them on simple tasks.

```
Complex architecture / deep reasoning?
  → Opus 4.6 (burns Thinking prompts — use wisely)

Standard coding (features, debugging)?
  → Sonnet 4.6 (near-Opus quality, lower cost)

Fast iteration / bulk edits?
  → Gemini 3.1 Pro (fastest, 1M context window)

Quick questions / simple tasks?
  → Gemini 3 Flash (instant, minimal rate limit impact)

Hit your rate limit?
  → Switch to a secondary Pro account (limits refresh every 5 hours)
```

---

## Subscription Tiers

| Feature | Free | Pro ($20/mo) | Ultra ($250/mo) |
|---------|------|-------------|-----------------|
| Thinking prompts/day | Limited | 300 | 1,500 |
| Pro prompts/day | Limited | 100 | 500 |
| Deep Research/day | 5 | 20 | 200 |
| AI Credits/month | 0 | 1,000 | 12,500 |
| Videos (Veo 3.1)/day | 0 | 3 | 5 |
| Images (Imagen)/day | Limited | 100 | 1,000 |
| Deep Think 3.1 | No | No | 10/day (192K context) |

Rate limits refresh every **5 hours**, not daily.

---

## Credit Budget Strategy

Ultra gets 12,500 credits/month. Budget allocation:

| Category | Credits | Approximate Yield |
|----------|---------|-------------------|
| Videos (product demos, social) | 5,000 | ~10 videos |
| Images (thumbnails, assets) | 2,500 | ~500 images |
| Flow/Whisk (content) | 2,500 | ~1,250 generations |
| Reserve (buffer) | 2,500 | High-usage days |

---

## Antigravity Agent Orchestration

### Scope Each Agent to Specific Files

Agents that touch overlapping files create merge conflicts. Give each agent a
clear file boundary.

```
Agent 1 (Opus 4.6): "Architect the database schema and auth flow"
  Workspace: src/lib/, supabase/

Agent 2 (Sonnet 4.6): "Build the dashboard UI components"
  Workspace: src/components/dashboard/

Agent 3 (Gemini 3.1 Pro): "Write tests for all components"
  Workspace: tests/
```

### MCP Integrations

Antigravity supports Model Context Protocol servers:

| MCP Server | Capabilities |
|------------|-------------|
| Firebase MCP | Create projects, manage Firestore, deploy |
| Prisma MCP | Database migrations, schema management |
| GitHub MCP | Create issues, PRs, manage repos |
| Supabase MCP | Database operations, auth management |
| Browser tools | Navigate, click, screenshot web pages |

Configure in `.gemini/settings.json` or workspace settings. Agents automatically
get access to connected MCP tools.

---

## Multi-Account Rotation

When your primary account hits rate limits, rotate to a secondary account.
Quotas refresh every 5 hours.

```
1. Hit rate limit on Account A
2. Switch to Account B in Antigravity settings
3. Continue working — fresh limits
4. Account A refreshes in ~5 hours
5. Rotate back when Account B limits hit

Account layout:
  Account A: Primary (Ultra) — architecture, heavy reasoning
  Account B: Pro — overflow, bulk tasks
  Account C: Pro — backup, parallel experiments
```

---

## ⛔ STOP GATE

DO NOT use Google AI tools without verifying:

1. Model selection matches task complexity (do not waste Opus on simple tasks)
2. Each Antigravity agent has a unique file scope (no overlap)
3. Rate limit status checked before starting heavy work
4. MCP servers connected for tasks that need external tools
5. Credit budget tracked if using image/video generation
6. Account rotation plan exists for heavy building days

---

## NEVER

- **NEVER** use Opus 4.6 for tasks a lighter model handles
- **NEVER** forget that rate limits refresh every 5 hours, not daily
- **NEVER** assign overlapping file scopes to multiple Antigravity agents
- **NEVER** ignore the Agent Manager — separate tabs are less efficient
- **NEVER** burn all credits in week 1 — budget across the month
- **NEVER** use Google AI Studio for production workloads — it is for prototyping
