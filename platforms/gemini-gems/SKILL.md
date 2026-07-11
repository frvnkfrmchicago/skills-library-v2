---
name: gemini-gems
description: Gemini Gems - custom AI assistants. Create, configure, and share personalized Gemini experts.
last_updated: 2026-03
owner: Frank
---

# Gemini Gems

Build custom AI assistants that remember your context.

> **See also:** `platforms/chatgpt-gpts/SKILL.md` for OpenAI alternative

---

## Context Questions

Before creating a Gem, ask:

1.  **What's the use case?** — Research, coding, writing, learning
2.  **What expertise needed?** — Domain, stack, style
3.  **What context persists?** — Your preferences, workflows
4.  **Who uses it?** — Just you, team sharing, public link
5.  **Is Google ecosystem?** — Docs, Drive, Workspace integration

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Complexity** | Simple persona ←→ Detailed expert |
| **Sharing** | Private ←→ Link sharing |
| **Integration** | Standalone ←→ Google Workspace |
| **Instructions** | Brief ←→ Comprehensive |
| **Persistence** | Per-chat ←→ Always active |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Code review needed | Define stack + review criteria |
| Research assistant | Set source preferences + format |
| Writing coach | Define your voice + style guide |
| Quick setup needed | Use simple instructions |
| Team sharing | Configure link sharing |
| Google ecosystem | Leverage Workspace integration |

---

## TL;DR

| What | Details |
|------|---------|
| **What Are Gems** | Custom Gemini assistants with persistent instructions |
| **Access** | Gemini Advanced (paid) |
| **Use Cases** | Research assistant, code expert, writing coach |
| **Vs GPTs** | Similar concept, Google ecosystem |

---

## 1. What Are Gems?

Gems are custom versions of Gemini with:
- **Persistent instructions** — Always active, no re-prompting
- **Personality/expertise** — Define how it responds
- **Context retention** — Remembers your preferences
- **Quick access** — One-click from Gemini sidebar

Think: Your own expert AI that already knows your style.

---

## 2. Creating a Gem

### Access
1. Go to [gemini.google.com](https://gemini.google.com)
2. Click "Gem Manager" in sidebar
3. Click "Create Gem" or "New Gem"

### Setup Fields

| Field | Purpose | Example |
|-------|---------|---------|
| **Name** | How it appears in sidebar | "Code Reviewer" |
| **Icon** | Visual identifier | 🧑‍💻 or custom |
| **Instructions** | How it should behave | See below |

---

## 3. Writing Gem Instructions

### Structure

```markdown
## Role
You are [specific expert type] who [key behavior].

## Context
[Background about what you'll be asking]

## Guidelines
- [Behavior rule 1]
- [Behavior rule 2]
- [Behavior rule 3]

## Format
[How to structure responses]

## Avoid
- [What not to do]
```

### Example: Code Review Expert

```markdown
## Role
You are an expert code reviewer specializing in TypeScript, React, and Next.js.

## Context
I build web apps using Next.js 16+, TypeScript, Tailwind, and Supabase. 
I prefer modern patterns and clean code.

## Guidelines
- Focus on: bugs, performance, security, readability
- Be direct and specific
- Suggest fixes, not just problems
- Use TypeScript best practices (strict mode)
- Consider DX (developer experience)

## Format
For each issue:
1. Location (file/line if visible)
2. Problem (what's wrong)
3. Fix (how to solve it)
4. Priority (high/medium/low)

## Avoid
- Generic advice
- Nitpicking style (I use Prettier)
- Over-engineering suggestions
```

### Example: Research Assistant

```markdown
## Role
You are a research assistant who finds information and synthesizes it clearly.

## Context
I need research for content creation (blogs, social posts, newsletters).
I prefer data from 2024-2025.

## Guidelines
- Prioritize recent sources (2024-2025)
- Cite sources when possible
- Flag uncertain information
- Provide TL;DR summaries
- Use tables for comparisons

## Format
1. TL;DR (2-3 sentences)
2. Key findings (bullet points)
3. Data/stats (with dates)
4. Sources (if available)

## Avoid
- Outdated information
- Opinions without data
- Long paragraphs
```

### Example: Writing Coach

```markdown
## Role
You are a writing coach who improves my drafts without changing my voice.

## Context
I write newsletter content, LinkedIn posts, and blog articles.
My tone is conversational and direct.

## Guidelines
- Preserve my voice and style
- Improve clarity, not just grammar
- Cut unnecessary words
- Suggest stronger verbs
- Flag clichés

## Format
1. Edited version (tracked changes style)
2. What I changed and why
3. Alternative options (if relevant)

## Avoid
- Making it sound corporate
- Over-editing (changing meaning)
- Adding fluff
```

---

## 4. What Gems Remember

### ✅ Persistent (Always Active)
- Instructions you wrote
- Your defined preferences
- Response format guidelines

### ❌ Not Persistent
- Previous conversations (fresh each chat)
- Files you uploaded previously
- Web searches from past sessions

### Workaround for Context

Include key context in instructions:
```markdown
## My Stack
- Next.js 16
- TypeScript (strict)
- Tailwind CSS
- Supabase
- Vercel deployment
```

---

## 5. Gems vs Other Custom AI

| Feature | Gemini Gems | ChatGPT GPTs | Claude Projects |
|---------|-------------|--------------|-----------------|
| **Custom Instructions** | ✅ | ✅ | ✅ |
| **Knowledge Files** | ❌ | ✅ | ✅ |
| **Actions/APIs** | ❌ | ✅ | ❌ |
| **Sharing** | ✅ | ✅ | ❌ |
| **Public Store** | ❌ | ✅ | ❌ |
| **Google Integration** | ✅ | ❌ | ❌ |
| **Model** | Gemini 2 | GPT-4o | Claude 3.5 |

**Choose Gems when:**
- You're in Google ecosystem
- Don't need knowledge files
- Want quick setup

---

## 6. Sharing Gems

### Options
- **Private** — Only you can use
- **Link sharing** — Anyone with link
- **Workspace** — Google Workspace members

### To Share
1. Open Gem Manager
2. Select your Gem
3. Click "Share"
4. Choose sharing option
5. Copy link

---

## 7. Use Cases

| Gem | Purpose |
|-----|---------|
| **Code Reviewer** | Review PRs, suggest improvements |
| **Research Assistant** | Find data, synthesize sources |
| **Writing Coach** | Edit drafts, improve clarity |
| **Meeting Prep** | Summarize context, suggest questions |
| **Content Ideas** | Brainstorm topics, angles |
| **Learning Tutor** | Explain concepts at your level |
| **Email Drafter** | Write emails in your voice |
| **Data Analyst** | Interpret data, create charts |

---

## 8. Tips

### Do
- Be specific in instructions
- Include your context/stack
- Define output format
- Test and iterate

### Don't
- Write vague instructions
- Expect memory between sessions
- Overload with too many rules
- Forget to test

---

## Checklist

- [ ] Identified use case
- [ ] Wrote clear role definition
- [ ] Added context about your work
- [ ] Defined guidelines
- [ ] Specified output format
- [ ] Listed what to avoid
- [ ] Tested with real prompts
- [ ] Iterated based on results

---

## Related Skills

- [Google AI Studio](/agents/google-ai-studio/SKILL.md) — API access
- [ChatGPT GPTs](/platforms/chatgpt-gpts/SKILL.md) — OpenAI equivalent
- [Prompting](/agents/prompting/SKILL.md) — Prompt engineering
- [Workflow Guide](/platforms/WORKFLOW-GUIDE.md) — Multi-tool strategy
