---
name: ai-prototype-to-build
description: Bridge from AI Studio prototyping to full app implementation. How to take your Gemini experiments and integrate them into a production codebase.
last_updated: 2026-03
---

# AI Prototype → Build Workflow

From Google AI Studio experiments to production code.

## TL;DR

| Phase | Where | What You Do |
|-------|-------|-------------|
| **Explore** | Google AI Studio | Test Gemini capabilities, prompts, multimodal |
| **Extract** | Google AI Studio | Get API code, save prompts |
| **Scaffold** | PRD + Skills | Define structure, pick skills |
| **Implement** | IDE (Anti-Gravity/Cursor) | Build with AI SDK |
| **Integrate** | Codebase | Wire up features end-to-end |

---

## Context Questions

Before moving from prototype to production, ask:

1. **What AI capabilities were validated?** — Text gen, vision, audio, function calling, multimodal
2. **What's the integration pattern?** — Streaming chat, single generation, tool use, batch processing
3. **What's the target environment?** — Next.js API, serverless function, edge, standalone
4. **What's the expected load?** — Low volume, medium (rate limiting), high (caching needed)
5. **What prompts/settings worked?** — Captured prompts, model settings, edge cases

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| Complexity | Single prompt ←→ Multi-step agent |
| Integration | Direct API ←→ Full AI SDK patterns |
| Streaming | Request-response ←→ Real-time streaming |
| Modality | Text-only ←→ Full multimodal |
| Scale | Prototype ←→ Production-grade |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Simple text generation | generateText() with AI SDK, minimal setup |
| Chat interface needed | streamText() + useChat hook, streaming response |
| Image/audio inputs | Multimodal messages, check SDK support |
| Function calling used | AI SDK tools with Zod schemas |
| High traffic expected | Rate limiting, response caching, error handling |
| Production deployment | Add auth, logging, cost tracking, graceful degradation |

---

## Phase 1: Explore in Google AI Studio

### What You Can Prototype

| Feature | How to Test |
|---------|-------------|
| Text generation | Chat, complete prompts |
| Image understanding | Upload images, ask questions |
| Audio processing | Upload audio, transcribe, analyze |
| Video analysis | Upload video, describe, extract |
| Code generation | Ask for code, iterate |
| Function calling | Define tools, test responses |
| System instructions | Set persona, constraints |

### Capture What Works

```
For each experiment, note:
1. ✅ What worked (copy exact prompt)
2. ❌ What failed (avoid these patterns)
3. ⚙️ Model settings (temperature, tokens)
4. 📝 System instruction (if used)
5. 🔧 Tools/functions (if used)
```

### Export Options

| From AI Studio | Get |
|----------------|-----|
| "Get code" button | Python, JavaScript, cURL |
| Copy prompt | Raw prompt text |
| Copy response | Expected output format |

---

## Phase 2: Extract Your Findings

### Create a Prompt Library

```markdown
# AI Feature: [Name]

## Purpose
[What this feature does]

## Model Settings
- Model: gemini-1.5-pro / gemini-2.0-flash
- Temperature: 0.7
- Max tokens: 2048

## System Instruction
```
[Your system instruction]
```

## User Prompt Template
```
[Your prompt with {{variables}}]
```

## Expected Output
```
[Example response format]
```

## Edge Cases
- [What happens with X input]
- [What fails with Y input]
```

### API Code Snippet

From AI Studio "Get code" → JavaScript:

```typescript
// Save this - you'll adapt it
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
});
```

---

## Phase 3: Define Your Build

### From Prototype to PRD

Your AI experiments inform your PRD. Structure it like:

```markdown
# Product Requirements Document

## Features from AI Prototyping

### Feature 1: [Name]
- **AI Capability:** [What Gemini does]
- **User Flow:** [How user interacts]
- **Input:** [What user provides]
- **Output:** [What they get back]
- **Tested In:** Google AI Studio ✓

### Feature 2: [Name]
...

## Non-AI Features
- Authentication
- Database
- UI components
- etc.
```

### Pick Your Skills

Based on your PRD, identify which skills you need:

```markdown
## Skills Needed

### Core (always)
- [ ] database/SKILL.md
- [ ] deployment/SKILL.md

### AI-specific
- [ ] ai-sdk/SKILL.md ← Main implementation
- [ ] google-ai-studio/SKILL.md ← Reference

### Based on features
- [ ] realtime/SKILL.md (if streaming)
- [ ] state-management/SKILL.md (if complex state)
- [ ] stripe/SKILL.md (if monetizing AI features)

### Based on scale
- [ ] enterprise/SKILL.md (if compliance needed)
- [ ] observability/SKILL.md (if production monitoring)
```

---

## Phase 4: Implement with AI SDK

### Setup

```bash
pnpm add ai @ai-sdk/google
```

### Translate AI Studio → AI SDK

**From AI Studio code:**
```javascript
// AI Studio export (Google AI client)
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const result = await model.generateContent(prompt);
```

**To Vercel AI SDK:**
```typescript
// ai-sdk pattern (recommended for Next.js)
import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";

// Non-streaming
const { text } = await generateText({
  model: google("gemini-1.5-pro"),
  prompt: "Your prompt here",
});

// Streaming (for chat UIs)
const result = await streamText({
  model: google("gemini-1.5-pro"),
  messages: [
    { role: "system", content: "System instruction" },
    { role: "user", content: userMessage },
  ],
});
```

### Multimodal Translation

**Image understanding:**
```typescript
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const { text } = await generateText({
  model: google("gemini-1.5-pro"),
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "What's in this image?" },
        { type: "image", image: imageBuffer }, // or URL
      ],
    },
  ],
});
```

**Audio (coming in 2025):**
```typescript
// Check ai-sdk docs for latest audio support
// May need direct Google AI client for some features
```

### Function Calling Translation

**From AI Studio tools:**
```javascript
// AI Studio function definition
const tools = [{
  functionDeclarations: [{
    name: "get_weather",
    description: "Get weather for a location",
    parameters: { type: "object", properties: { location: { type: "string" } } }
  }]
}];
```

**To AI SDK tools:**
```typescript
import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";

const { text, toolCalls } = await generateText({
  model: google("gemini-1.5-pro"),
  tools: {
    getWeather: tool({
      description: "Get weather for a location",
      parameters: z.object({
        location: z.string().describe("City name"),
      }),
      execute: async ({ location }) => {
        // Your implementation
        return { temperature: 72, condition: "sunny" };
      },
    }),
  },
  prompt: "What's the weather in San Francisco?",
});
```

---

## Phase 5: Integrate End-to-End

### API Route Pattern

```typescript
// app/api/ai/[feature]/route.ts
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { prompt, context } = await req.json();

  const result = await streamText({
    model: google("gemini-1.5-pro"),
    system: `Your system instruction here`,
    messages: [{ role: "user", content: prompt }],
  });

  return result.toDataStreamResponse();
}
```

### Client Component

```tsx
"use client";

import { useChat } from "ai/react";

export function AIFeature() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai/chat",
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

---

## Workflow Summary

```
┌─────────────────────┐
│  Google AI Studio   │
│  - Test prompts     │
│  - Try multimodal   │
│  - Validate ideas   │
└─────────┬───────────┘
          │ Extract
          ▼
┌─────────────────────┐
│  Prompt Library     │
│  - Saved prompts    │
│  - Model settings   │
│  - Expected outputs │
└─────────┬───────────┘
          │ Define
          ▼
┌─────────────────────┐
│  PRD + Skills       │
│  - Features list    │
│  - Skills needed    │
│  - Architecture     │
└─────────┬───────────┘
          │ Implement
          ▼
┌─────────────────────┐
│  AI SDK Code        │
│  - API routes       │
│  - Client hooks     │
│  - Error handling   │
└─────────┬───────────┘
          │ Integrate
          ▼
┌─────────────────────┐
│  Production App     │
│  - End-to-end flow  │
│  - Monitoring       │
│  - Iteration        │
└─────────────────────┘
```

---

## Skills Reference Chain

When building AI features, reference these in order:

1. **This skill** - Workflow overview
2. `agents/google-ai-studio/SKILL.md` - AI Studio specifics
3. `agents/ai-sdk/SKILL.md` - Implementation with AI SDK
4. `agents/state-management/SKILL.md` - If complex AI state
5. `agents/realtime/SKILL.md` - If streaming/live updates
6. `agents/observability/SKILL.md` - Monitor AI in production

---

## Common Patterns

### Rate Limiting AI Calls

```typescript
// Use the rate limiting from enterprise skill
import { rateLimits } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { success } = await rateLimits.ai.limit(ip);
  
  if (!success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }
  
  // Proceed with AI call...
}
```

### Caching AI Responses

```typescript
// For deterministic prompts, cache the response
import { kv } from "@vercel/kv";

const cacheKey = `ai:${hashPrompt(prompt)}`;
const cached = await kv.get(cacheKey);

if (cached) return cached;

const result = await generateText({ ... });
await kv.set(cacheKey, result.text, { ex: 3600 }); // 1 hour

return result.text;
```

### Error Handling

```typescript
try {
  const result = await generateText({ ... });
  return result.text;
} catch (error) {
  if (error.message.includes("RATE_LIMIT")) {
    // Wait and retry, or return graceful error
  }
  if (error.message.includes("SAFETY")) {
    // Content was blocked, handle gracefully
  }
  throw error;
}
```

---

## Resources

- AI SDK docs: [sdk.vercel.ai](https://sdk.vercel.ai)
- Google AI Studio: [aistudio.google.com](https://aistudio.google.com)
- Skills: `agents/ai-sdk/SKILL.md`, `agents/google-ai-studio/SKILL.md`
