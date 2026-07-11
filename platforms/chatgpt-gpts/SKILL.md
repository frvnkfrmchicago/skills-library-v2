---
name: chatgpt-gpts
description: Build custom ChatGPT GPTs. Instructions, knowledge files, actions, publishing.
last_updated: 2026-03
owner: Frank
---

# ChatGPT GPTs

Build custom AI assistants with personality, knowledge, and actions.

> **See also:** `platforms/gemini-gems/SKILL.md` for Google alternative

---

## Context Questions

Before building a GPT, ask:

1.  **What's the use case?** — Specific task, domain expert, assistant
2.  **What knowledge needed?** — Docs, code, data files
3.  **Need external actions?** — API integrations required?
4.  **Who's the audience?** — Personal, team, public GPT Store
5.  **What capabilities?** — Code interpreter, ChatGPT Images 2.0, web browsing

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Simple instructions ←→ Knowledge + Actions |
| **Knowledge** | None ←→ 20 files / 512MB each |
| **Actions** | None ←→ Multiple API integrations |
| **Audience** | Private ←→ GPT Store public |
| **Capabilities** | Text only ←→ Code + ChatGPT Images 2.0 + Web |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Personal assistant | Simple instructions, code interpreter |
| Domain expert | Upload knowledge files (docs, code) |
| External data needed | Build Actions with OpenAPI spec |
| Team tool | Link sharing |
| Revenue goal | GPT Store publication |
| Need images | Enable ChatGPT Images 2.0 |

---

## TL;DR

| What | Details |
|------|---------|
| **What Are GPTs** | Custom ChatGPT with instructions + knowledge + actions |
| **Access** | ChatGPT Plus/Pro ($20+/mo) |
| **Key Features** | Knowledge files, API actions, publishing |
| **GPT Store** | Publish for others, potential revenue |

---

## 1. What Makes GPTs Powerful

| Feature | What It Does |
|---------|--------------|
| **Instructions** | Persistent behavior rules |
| **Knowledge** | Upload files the GPT can reference |
| **Actions** | Connect to external APIs |
| **Code Interpreter** | Run Python, analyze data |
| **ChatGPT Images 2.0** | Generate images |
| **Web Browsing** | Search the web |

---

## 2. Creating a GPT

### Quick Start
1. Go to [chat.openai.com](https://chat.openai.com)
2. Click "Explore GPTs" → "Create"
3. Choose "Configure" tab (not "Create" which uses chat)
4. Fill in the fields

### Configuration Fields

| Field | Purpose | Tips |
|-------|---------|------|
| **Name** | What users see | Clear, descriptive |
| **Description** | What it does | 1-2 sentences |
| **Instructions** | How it behaves | Be specific |
| **Conversation starters** | Suggested prompts | Show use cases |
| **Knowledge** | Files to reference | PDFs, docs, code |
| **Capabilities** | Enable/disable features | Toggle as needed |
| **Actions** | API connections | Advanced |

---

## 3. Writing GPT Instructions

### Structure

```markdown
## Role
[What this GPT is and does]

## Behavior
[How it should respond]

## Constraints
[What it should NOT do]

## Format
[How to structure responses]

## Examples
[Optional: Show ideal responses]
```

### Example: Code Assistant

```markdown
## Role
You are a senior TypeScript developer who helps write clean, 
production-ready code for Next.js applications.

## Behavior
- Write TypeScript with strict types
- Use modern React patterns (hooks, server components)
- Include error handling
- Add brief comments for complex logic
- Suggest improvements when you see issues

## Constraints
- Don't use deprecated patterns (class components, etc.)
- Don't add unnecessary dependencies
- Don't over-engineer simple solutions
- Never use `any` type without explanation

## Format
1. Brief explanation of approach
2. Code with inline comments
3. Usage example
4. Any caveats or alternatives
```

### Example: Content Writer

```markdown
## Role
You are a content writer who creates engaging blog posts 
in a conversational but professional tone.

## Behavior
- Write in active voice
- Keep paragraphs short (2-4 sentences)
- Use headers and bullets for scannability
- Include actionable takeaways
- Aim for 1500-2000 words unless specified

## Constraints
- Don't use clichés or buzzwords
- Don't be overly formal or stiff
- Don't repeat information
- Avoid passive voice

## Format
1. Hook (compelling opening)
2. Value promise (what reader learns)
3. Main content (with headers)
4. Key takeaways (bullet points)
5. Call to action
```

---

## 4. Knowledge Files

### Supported Formats
- PDF, DOCX, TXT
- CSV, JSON
- Code files (.py, .js, .ts, etc.)
- Images (for reference)

### Size Limits
- Up to 20 files
- 512MB per file
- ~2M tokens total

### Best Practices

```
✅ DO:
- Use well-structured documents
- Include table of contents in long docs
- Name files descriptively
- Update files when content changes

❌ AVOID:
- Huge unformatted text dumps
- Scanned PDFs (poor extraction)
- Duplicate content across files
- Sensitive/private information
```

### When to Use Knowledge

| Use Case | Knowledge Files |
|----------|-----------------|
| Documentation bot | Product docs, API references |
| Brand voice writer | Style guides, example content |
| Research assistant | Papers, reports, data |
| Code helper | Codebase samples, patterns |

---

## 5. Actions (API Integration)

### What Actions Do
Connect your GPT to external APIs to:
- Fetch real-time data
- Create/update records
- Trigger workflows
- Access external services

### Setup

1. Create OpenAPI spec (JSON or YAML)
2. Add to GPT Actions tab
3. Configure authentication (if needed)
4. Test the actions

### Simple OpenAPI Example

```yaml
openapi: 3.1.0
info:
  title: Weather API
  version: 1.0.0
servers:
  - url: https://api.weather.com
paths:
  /current:
    get:
      operationId: getCurrentWeather
      summary: Get current weather
      parameters:
        - name: city
          in: query
          required: true
          schema:
            type: string
      responses:
        200:
          description: Weather data
```

### Authentication Options
- None (public APIs)
- API Key (header or query)
- OAuth (complex, user login)

---

## 6. Publishing

### Visibility Options

| Option | Who Can Access |
|--------|----------------|
| **Only me** | Just you |
| **Anyone with link** | Share link privately |
| **Public** | Listed in GPT Store |

### GPT Store

To list in Store:
1. Verify domain (for custom actions)
2. Create builder profile
3. Submit for review
4. Meets OpenAI policies

**Revenue:** OpenAI pays creators based on usage (details vary).

---

## 7. Comparison

| Feature | ChatGPT GPTs | Gemini Gems | Claude Projects |
|---------|--------------|-------------|-----------------|
| **Instructions** | ✅ | ✅ | ✅ |
| **Knowledge Files** | ✅ 20 files | ❌ | ✅ Unlimited |
| **Actions/APIs** | ✅ | ❌ | ❌ |
| **Code Interpreter** | ✅ | ❌ | ❌ |
| **Image Generation** | ✅ ChatGPT Images 2.0 | ✅ Imagen | ❌ |
| **Web Browsing** | ✅ | ✅ | ❌ |
| **Public Store** | ✅ | ❌ | ❌ |
| **Sharing** | ✅ | ✅ | ❌ |

**Choose GPTs when:**
- Need knowledge files
- Need API actions
- Want Store distribution
- Need code interpreter

---

## 8. Tips

### Do
- Test thoroughly before sharing
- Version your instructions
- Monitor user feedback
- Update knowledge files regularly
- Start simple, add complexity

### Don't
- Include sensitive data
- Expect perfect API handling
- Neglect the description
- Skip conversation starters
- Make claims the GPT can't deliver

---

## Checklist

- [ ] Defined clear use case
- [ ] Wrote specific instructions
- [ ] Added relevant knowledge files
- [ ] Set up actions (if needed)
- [ ] Added conversation starters
- [ ] Tested with edge cases
- [ ] Set appropriate visibility
- [ ] Created builder profile (if public)

---

## Related Skills

- [Gemini Gems](/platforms/gemini-gems/SKILL.md) — Google alternative
- [Prompting](/agents/prompting/SKILL.md) — Prompt engineering
- [AI SDK](/agents/ai-sdk/SKILL.md) — Build with OpenAI API
- [Workflow Guide](/platforms/WORKFLOW-GUIDE.md) — Multi-tool strategy
