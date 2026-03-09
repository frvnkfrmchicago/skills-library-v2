# RAG Knowledge Assistant — Project Spec

## Overview

A chat interface that answers questions about the Skills Library itself. Feed all 153+ skills as context to an LLM, deploy as a web app.

**Why this project**: Meta-level flex—your portfolio can explain itself to interviewers.

---

## User Stories

- As a visitor, I want to ask questions about Frank's skills so I can understand his capabilities
- As a visitor, I want to see relevant skill documents when I ask questions
- As an interviewer, I want to test the system's understanding of the skill library

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16.1.1  React 19, Tailwind CSS |
| Backend | Next.js API routes, Vercel AI SDK |
| Vector Store | Supabase pgvector or Pinecone |
| LLM | OpenAI GPT-4o or Anthropic Claude |
| Deployment | Vercel |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Chat UI → Message Input → Response Display      │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│                   API Route                      │
│  /api/chat → RAG Pipeline → LLM Response         │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│               Vector Database                    │
│  Skills embedded → Similarity search             │
└─────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Data Ingestion (Day 1)
- [ ] Script to read all SKILL.md files
- [ ] Chunk skills into manageable pieces
- [ ] Generate embeddings (OpenAI ada-002)
- [ ] Store in Supabase pgvector

### Phase 2: RAG Pipeline (Day 2)
- [ ] API route for chat
- [ ] Retrieve relevant chunks on query
- [ ] Construct prompt with context
- [ ] Stream response back

### Phase 3: Chat UI (Day 3)
- [ ] Message list component
- [ ] Input component with send
- [ ] Streaming response display
- [ ] Mobile responsive

### Phase 4: Polish (Day 4-5)
- [ ] Loading states
- [ ] Error handling
- [ ] Source citations (which skills referenced)
- [ ] Deploy to Vercel

---

## Skills to Reference During Build

| Phase | Skills |
|-------|--------|
| Vector DB setup | `database`, `backend-patterns` |
| RAG pipeline | `prompting`, `ai-sdk` |
| Chat UI | `design-system`, `gsap` |
| Deployment | `deployment` |

---

## Success Criteria

- [ ] Can answer "What skills does Frank have?"
- [ ] Can answer "How would Frank approach building X?"
- [ ] Responses cite specific skills
- [ ] < 3s response time
- [ ] Deployed at [domain].vercel.app

---

## Next Steps

1. Create Next.js project
2. Set up Supabase with pgvector
3. Write ingestion script
4. Build API route
5. Build chat UI
6. Deploy
