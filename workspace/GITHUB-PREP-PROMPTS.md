# GitHub Portfolio Prep Prompts

Use these prompts with any AI agent to prepare your projects for public GitHub.

---

## 🔧 ToolChain (toolchain.vercel.app)

```
# GitHub Portfolio Prep: ToolChain

## Context
I have a Skills Library at `/path/to/skills-library-v2 2/`. Use the following skills:
- `agents/github-portfolio/SKILL.md` — Main guide for prepping repos
- `agents/github/SKILL.md` — Git workflows and CI/CD
- `agents/documentation/SKILL.md` — README structure
- `librarians/pre-deployment-librarian.md` — Security checklist

## Project Details
- **Name:** ToolChain
- **Live URL:** https://toolchain.vercel.app
- **Repo Name:** `toolchain-shell`
- **Type:** AI-powered developer assistant with multi-agent orchestration and RAG

## What Makes This Impressive
This project demonstrates:
- **Multi-agent orchestration** (LangGraph/LangChain)
- **RAG pipeline** with vector embeddings
- **Streaming AI responses** (Vercel AI SDK)
- **Context engineering** patterns

## 2026 Keywords to Include
- Multi-agent orchestration
- RAG (Retrieval-Augmented Generation)
- Vector embeddings
- LangGraph / LangChain
- Vercel AI SDK
- Streaming responses
- Context engineering
- Supervisor agent pattern
- Next.js 16 / React 19
- TypeScript strict mode
- Bun

## README Sections Required
1. Hero with live demo link
2. Architecture diagram (Mermaid) showing: User → Frontend → API → Supervisor → Agents → Vector DB
3. Tech stack table with versions
4. Key files breakdown (supervisor.py, RAG pipeline, streaming endpoint)
5. Code snippets showing orchestration pattern
6. Getting started with Bun
7. Contact: Built by Frank Lawrence

## Security Checklist
- Remove all .env.local files
- Replace real API keys in .env.example
- Check for hardcoded OpenAI/Gemini keys
- Ensure prompts are generic (no client-specific content)

## Output
Push to: `gh repo create toolchain-shell --public --source=. --push`
```

---

## 📊 Trading Intel Dashboard (trading-intel-dashboard.vercel.app)

```
# GitHub Portfolio Prep: Trading Intel Dashboard

## Context
I have a Skills Library. Use these skills:
- `agents/github-portfolio/SKILL.md` — Main guide
- `agents/documentation/SKILL.md` — README structure
- `librarians/pre-deployment-librarian.md` — Security checklist

## Project Details
- **Name:** Trading Intel Dashboard
- **Live URL:** https://trading-intel-dashboard.vercel.app
- **Repo Name:** `trading-intel-shell`
- **Type:** Real-time trading analytics dashboard

## What Makes This Impressive
This project demonstrates:
- **Real-time data visualization**
- **WebSocket/polling patterns**
- **Complex dashboard state management**
- **Financial data handling**

## 2026 Keywords to Include
- Real-time data
- WebSocket / Server-Sent Events
- Data visualization (Recharts/D3)
- Dashboard architecture
- Financial APIs
- React Query / TanStack
- Zustand state management
- Next.js 16 / React 19
- TypeScript
- Bun

## README Sections Required
1. Hero with live demo link and dashboard screenshot
2. Features: Real-time updates, charts, filtering
3. Tech stack table
4. Architecture diagram showing data flow
5. Key components (charts, filters, data hooks)
6. Getting started with Bun
7. Contact: Built by Frank Lawrence

## Security Checklist
- Remove any real trading API keys
- No real financial data in repo
- Generic example data only
- Remove any personal trading logic

## Output
Push to: `gh repo create trading-intel-shell --public --source=. --push`
```

---

## 📱 SMS Marketing Platform (sms-marketing-platform-nu.vercel.app)

```
# GitHub Portfolio Prep: SMS Marketing Platform

## Context
I have a Skills Library. Use these skills:
- `agents/github-portfolio/SKILL.md` — Main guide
- `agents/sms/SKILL.md` — SMS patterns (if exists)
- `librarians/pre-deployment-librarian.md` — Security checklist

## Project Details
- **Name:** SMS Marketing Platform
- **Live URL:** https://sms-marketing-platform-nu.vercel.app
- **Repo Name:** `sms-marketing-shell`
- **Type:** Campaign builder for SMS marketing

## What Makes This Impressive
This project demonstrates:
- **Message queue architecture**
- **Campaign builder UI**
- **Template system with variables**
- **Contact management**

## 2026 Keywords to Include
- Queue architecture (Redis/BullMQ)
- Twilio / SMS API integration
- Campaign automation
- Template engine
- Contact segmentation
- Webhook handling
- Background jobs
- Next.js 16 / React 19
- Prisma ORM
- TypeScript
- Bun

## README Sections Required
1. Hero with live demo link
2. Features: Campaign builder, templates, scheduling
3. Tech stack table
4. Architecture diagram: UI → API → Queue → SMS Provider
5. Key components (campaign builder, template editor)
6. Getting started with Bun
7. Contact: Built by Frank Lawrence

## Security Checklist
- Remove Twilio credentials
- No real phone numbers in repo
- Generic template examples only
- Remove any compliance-specific logic

## Output
Push to: `gh repo create sms-marketing-shell --public --source=. --push`
```

---

## 📚 Agentic Library (agentic-library.vercel.app)

```
# GitHub Portfolio Prep: Agentic Skills Library

## Context
This IS the Skills Library itself! Use:
- `agents/github-portfolio/SKILL.md` — For structure reference
- `agents/documentation/SKILL.md` — README patterns

## Project Details
- **Name:** Agentic Skills Library
- **Live URL:** https://agentic-library.vercel.app
- **Repo Name:** `agentic-skills-library`
- **Type:** AI development methodology and knowledge base

## What Makes This Impressive
This project demonstrates:
- **Prompt engineering methodology**
- **AI development patterns**
- **Librarian personas for different domains**
- **Structured knowledge architecture**

## 2026 Keywords to Include
- Prompt engineering
- Agentic AI methodology
- AI personas (Librarians)
- Context engineering
- Skills-based AI development
- Multi-agent patterns
- RAG architecture
- LangChain / LangGraph
- MCP (Model Context Protocol)
- Vector databases
- Next.js 16 / React 19

## README Sections Required
1. Hero explaining what the library is
2. How to use: "Activate [librarian name]"
3. Librarian categories (Design, Code, AI, Deploy)
4. Skill categories (agents, ai-builder, workflows)
5. Stats: 33 librarians, 198+ skills
6. Philosophy: Skills → Context → Reasoning → Output
7. Getting started
8. Contact: Built by Frank Lawrence

## Security Checklist
- Remove any client-specific adaptations
- Keep all skills and librarians (that's the product!)
- Remove personal notes if any

## Output
Push to: `gh repo create agentic-skills-library --public --source=. --push`
```

---

## 📋 General Instructions for All Projects

1. **Always reference the Skills Library** — Use `agents/github-portfolio/SKILL.md`
2. **Activate Pre-Deployment Librarian** before pushing
3. **Use Bun** in all getting started sections
4. **Include 2026 keywords** relevant to the project
5. **Add Frank Lawrence contact info** at the bottom
6. **Push as [project]-shell** to indicate portfolio version
