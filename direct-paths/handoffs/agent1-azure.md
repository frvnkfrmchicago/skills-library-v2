# Agent 1 Handoff — Azure Cloud

## Context

Skills Library for AI-assisted development. Review identified Azure as critical gap blocking 20-30% of enterprise roles.

**Location:** `/Users/franklawrencejr./Downloads/skills-library-v2 2/`

---

## What to Build

### `agents/cloud-azure/SKILL.md`

**Must cover:**

1. **Azure App Service**
   - Deployment from GitHub
   - Staging slots
   - Custom domains

2. **Azure Functions**
   - HTTP triggers
   - Queue triggers
   - Timer triggers
   - Durable Functions for workflows

3. **Azure Container Instances (ACI)**
   - Quick container deployment
   - vs Azure Kubernetes Service decision

4. **Azure OpenAI Service**
   - GPT-4, GPT-4o access
   - Embedding models
   - Different from AWS Bedrock patterns
   - Content filtering

5. **Azure DevOps CI/CD**
   - Pipeline YAML
   - Deployment stages
   - Variable groups

6. **Azure Key Vault**
   - Secret management
   - Access from App Service
   - Managed identity

---

## Format

YAML frontmatter:

```yaml
---
name: cloud-azure
description: Azure cloud deployment. App Service, Functions, Container Instances, Azure OpenAI.
last_updated: 2026-03
---
```

Must have:

- TL;DR table
- Numbered parts with code examples
- Checklist at end
- Resources section
- Related Skills section

---

## Style

- Production-ready examples
- 2025 tooling (Azure CLI, bicep)
- Copy-paste ready

---

## After Building (REQUIRED)

**You MUST update these files after creating skills:**

1. Add to `SKILL-NAVIGATION.md` under "7. DEPLOYMENT & CLOUD"
2. Add to `tech-stack/SKILL-INDEX.md` under "Need: Cloud Deployment"
3. Add to `_meta/CHANGELOG.md` with today's date

**Example entries:**

```markdown
# SKILL-NAVIGATION.md
| `agents/cloud-azure/SKILL.md` | Azure App Service, Functions, OpenAI |

# CHANGELOG.md
- `agents/cloud-azure/SKILL.md` — Azure cloud deployment patterns
```

---

## Completion Report

When done, provide:

1. Path to created file
2. Confirmation navigation updated
3. Any issues or suggestions
